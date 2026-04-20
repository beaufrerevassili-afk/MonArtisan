// ============================================================
//  routes/authRoutes.js — Authentification
//  login, logout, register, forgot-password, reset-password
// ============================================================

const express   = require('express');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const rateLimit = require('express-rate-limit');
const db        = require('../db');
const resetTokens = require('../utils/resetTokens');
const emailService = require('../services/emailService');

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: { erreur: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: { erreur: 'Trop de requêtes. Réessayez dans une heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /login
router.post('/login', process.env.NODE_ENV === 'production' ? loginLimiter : (req, res, next) => next(), async (req, res) => {
  try {
    const { email, motdepasse } = req.body;
    if (!email || !motdepasse) return res.status(400).json({ erreur: 'Email et mot de passe requis' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });

    const valide = await bcrypt.compare(motdepasse, user.motdepasse);
    if (!valide) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });

    // Si employé, récupérer le patron_id
    let patronId = null;
    if (user.role === 'employe') {
      const empResult = await db.query('SELECT patron_id FROM employes WHERE user_id = $1', [user.id]);
      patronId = empResult.rows[0]?.patron_id || null;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, nom: user.nom, secteur: user.secteur || null, patronId }, SECRET, { expiresIn: '8h' });
    res.json({ message: `Bienvenue ${user.nom} !`, token, role: user.role, secteur: user.secteur || null, userId: user.id, nom: user.nom, email: user.email, patronId });
  } catch (err) {
    console.error('Erreur /login :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnecté' });
});

// POST /register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { nom, email, motdepasse, role, telephone, metier, siret, adresse, ville, experience, description, documents } = req.body;
    if (!nom || !email || !motdepasse) return res.status(400).json({ erreur: 'nom, email, motdepasse requis' });
    if (motdepasse.length < 8) return res.status(400).json({ erreur: 'Le mot de passe doit contenir au moins 8 caractères' });

    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) return res.status(400).json({ erreur: 'Cet email est déjà utilisé' });

    if (role === 'artisan') {
      const docsObligatoires = ['piece_identite', 'kbis', 'rc_pro', 'attestation_urssaf', 'diplome', 'rib'];
      if (!siret) return res.status(400).json({ erreur: 'Le numéro SIRET est requis pour un artisan' });
      if (!metier) return res.status(400).json({ erreur: 'Le métier est requis' });
      const manquants = docsObligatoires.filter(d => !documents || !documents[d]);
      if (manquants.length > 0) return res.status(400).json({ erreur: `Documents manquants : ${manquants.join(', ')}` });
    }

    const rolesAutorisesInscription = ['client', 'patron', 'artisan'];
    const roleValide = rolesAutorisesInscription.includes(role) ? role : 'client';
    const isVerified   = roleValide !== 'patron' && roleValide !== 'artisan';
    const hash         = await bcrypt.hash(motdepasse, 12);

    const docsObj     = role === 'artisan' ? (documents || {}) : null;
    const docsSoumis  = role === 'artisan' ? Object.keys(documents || {}).length : 0;
    const statutVerif = role === 'artisan' ? 'en_attente' : null;

    const { rows: inserted } = await db.query(
      `INSERT INTO users
         (nom, email, motdepasse, role, verified, statut_verification,
          telephone, metier, siret, adresse, ville, experience, description,
          documents, documents_soumis, suspendu)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id, nom, email, role`,
      [
        nom, email, hash, roleValide, isVerified, statutVerif,
        telephone || null, metier || null, siret || null,
        adresse || null, ville || null, experience || null, description || null,
        docsObj ? JSON.stringify(docsObj) : '{}',
        docsSoumis, false,
      ]
    );

    const newUser = inserted[0];

    if (roleValide === 'artisan') {
      return res.status(201).json({
        message: `Dossier soumis pour ${nom}. Votre compte sera activé après vérification de vos documents (24-48h).`,
        statut: 'en_attente_verification',
        userId: newUser.id,
      });
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, nom: newUser.nom }, SECRET, { expiresIn: '8h' });
    // Email de bienvenue (non-bloquant)
    emailService.sendBienvenue(email, nom).catch(e => console.log('[Email bienvenue]', e.message));
    res.status(201).json({ message: `Compte créé pour ${nom}`, token, role: newUser.role, userId: newUser.id });
  } catch (err) {
    console.error('Erreur /register :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erreur: 'Email requis' });

    const { rows } = await db.query('SELECT id, email, nom FROM users WHERE email = $1', [email]);
    const user = rows[0];
    // Always return 200 to avoid email enumeration
    if (!user) return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    resetTokens.set(token, { userId: user.id, expiresAt });

    // Envoi du lien de réinitialisation
    emailService.sendResetPassword(user.email, user.nom, token).catch(e => console.log('[Email reset]', e.message));
    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error('Erreur /forgot-password :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, motdepasse } = req.body;
    if (!token || !motdepasse) return res.status(400).json({ erreur: 'Token et nouveau mot de passe requis' });
    if (motdepasse.length < 8) return res.status(400).json({ erreur: 'Le mot de passe doit contenir au moins 8 caractères' });

    const entry = resetTokens.get(token);
    if (!entry) return res.status(400).json({ erreur: 'Token invalide ou déjà utilisé' });
    if (Date.now() > entry.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ erreur: 'Token expiré. Veuillez refaire une demande.' });
    }

    const { rows } = await db.query('SELECT id FROM users WHERE id = $1', [entry.userId]);
    if (!rows[0]) return res.status(400).json({ erreur: 'Utilisateur introuvable' });

    const hash = await bcrypt.hash(motdepasse, 12);
    await db.query('UPDATE users SET motdepasse = $1 WHERE id = $2', [hash, entry.userId]);
    resetTokens.delete(token);

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    console.error('Erreur /reset-password :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
