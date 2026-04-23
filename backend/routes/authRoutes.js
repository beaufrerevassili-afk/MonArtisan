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
  max: 100,
  message: { erreur: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
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

    // Compte suspendu — on laisse se connecter mais on marque le token
    const isSuspendu = !!user.suspendu;

    // Si employé, récupérer le patron_id
    let patronId = null;
    if (user.role === 'employe') {
      const empResult = await db.query('SELECT patron_id FROM employes WHERE user_id = $1', [user.id]);
      patronId = empResult.rows[0]?.patron_id || null;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, nom: user.nom, secteur: user.secteur || null, patronId, suspendu: isSuspendu }, SECRET, { expiresIn: '8h' });
    res.json({ message: `Bienvenue ${user.nom} !`, token, role: user.role, secteur: user.secteur || null, userId: user.id, nom: user.nom, email: user.email, patronId, suspendu: isSuspendu, motifSuspension: isSuspendu ? (user.motif_suspension || null) : null });
  } catch (err) {
    console.error('Erreur /login :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnecté' });
});

// ── Email validation (MX + disposable check) ──────────────
const dns = require('dns').promises;

const DISPOSABLE_DOMAINS = new Set([
  'yopmail.com','guerrillamail.com','guerrillamail.net','tempmail.com','throwaway.email',
  'mailinator.com','10minutemail.com','trashmail.com','fakeinbox.com','sharklasers.com',
  'guerrillamailblock.com','grr.la','dispostable.com','mailnesia.com','maildrop.cc',
  'temp-mail.org','tempail.com','tempr.email','discard.email','discardmail.com',
  'mailcatch.com','meltmail.com','nada.email','spamgourmet.com','mytemp.email',
  'jetable.org','trash-mail.com','mohmal.com','getnada.com','emailondeck.com',
  'crazymailing.com','tempinbox.com','binkmail.com','spamdecoy.net','inboxalias.com',
]);

async function validateEmail(email) {
  if (!email || !email.includes('@')) return { valid: false, reason: 'Format email invalide' };

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return { valid: false, reason: 'Format email invalide' };

  // Block disposable emails
  if (DISPOSABLE_DOMAINS.has(domain)) return { valid: false, reason: 'Les adresses email temporaires ne sont pas acceptées' };

  // Check MX records (does the domain have a real mail server?)
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0) return { valid: false, reason: 'Ce domaine email n\'existe pas' };
  } catch {
    return { valid: false, reason: 'Ce domaine email n\'existe pas' };
  }

  return { valid: true };
}

// POST /verify-email — check MX + send verification code
const verificationCodes = new Map();

router.post('/verify-email', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    // Step 1: MX + disposable check
    const result = await validateEmail(email);
    if (!result.valid) return res.json(result);

    // Step 2: Rate limit per email (max 3 codes per 10min)
    const existing = verificationCodes.get(email);
    if (existing && existing.attempts >= 3 && Date.now() - existing.createdAt < 600000) {
      return res.json({ valid: true, codeSent: false, reason: 'Trop de tentatives. Réessayez dans quelques minutes.' });
    }

    // Step 3: Generate and send code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    verificationCodes.set(email, {
      code,
      createdAt: Date.now(),
      attempts: (existing?.attempts || 0) + 1
    });
    setTimeout(() => verificationCodes.delete(email), 600000);

    await emailService.sendVerificationCode(email, code);
    res.json({ valid: true, codeSent: true });
  } catch {
    res.status(500).json({ valid: false, reason: 'Erreur de vérification' });
  }
});

// POST /verify-code — check the 6-digit code
router.post('/verify-code', authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ valid: false });
    const stored = verificationCodes.get(email);
    if (!stored || stored.code !== code || Date.now() - stored.createdAt > 600000) {
      return res.json({ valid: false, reason: 'Code invalide ou expiré' });
    }
    res.json({ valid: true });
  } catch {
    res.status(500).json({ valid: false });
  }
});

// POST /register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { nom, email, motdepasse, role, telephone, metier, siret, adresse, ville, experience, description, documents } = req.body;
    if (!nom || !email || !motdepasse) return res.status(400).json({ erreur: 'nom, email, motdepasse requis' });
    if (motdepasse.length < 8) return res.status(400).json({ erreur: 'Le mot de passe doit contenir au moins 8 caractères' });

    // Verify email domain (MX + disposable check)
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ erreur: emailCheck.reason });
    }
    // Verify email code
    const { emailCode } = req.body;
    if (!emailCode) return res.status(400).json({ erreur: 'Code de vérification requis' });
    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode.code !== emailCode || Date.now() - storedCode.createdAt > 600000) {
      return res.status(400).json({ erreur: 'Code de vérification invalide ou expiré' });
    }
    verificationCodes.delete(email);
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

// ── Middleware d'authentification ──
const { authenticateToken } = require('../middleware/auth');

// PUT /change-password — Changer son mot de passe (authentifié)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { ancienMotdepasse, nouveauMotdepasse } = req.body;
    if (!ancienMotdepasse || !nouveauMotdepasse) return res.status(400).json({ erreur: 'Ancien et nouveau mot de passe requis' });
    if (nouveauMotdepasse.length < 8) return res.status(400).json({ erreur: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });

    const { rows } = await db.query('SELECT motdepasse FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const valide = await bcrypt.compare(ancienMotdepasse, rows[0].motdepasse);
    if (!valide) return res.status(400).json({ erreur: 'Ancien mot de passe incorrect' });

    const hash = await bcrypt.hash(nouveauMotdepasse, 12);
    await db.query('UPDATE users SET motdepasse = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /profile-photo — Upload profile photo (base64)
router.put('/profile-photo', authenticateToken, async (req, res) => {
  try {
    const { photo } = req.body;
    if (!photo) return res.status(400).json({ erreur: 'Photo requise' });
    // Limit size (base64 of 150x150 is ~30KB max)
    if (photo.length > 100000) return res.status(400).json({ erreur: 'Photo trop volumineuse' });
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_profil TEXT').catch(()=>{});
    await db.query('UPDATE users SET photo_profil = $1 WHERE id = $2', [photo, req.user.id]);
    res.json({ message: 'Photo mise à jour' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /profile-photo — Get my profile photo
router.get('/profile-photo', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT photo_profil FROM users WHERE id = $1', [req.user.id]);
    res.json({ photo: rows[0]?.photo_profil || null });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// DELETE /supprimer-compte — Suppression RGPD (anonymisation)
router.delete('/supprimer-compte', authenticateToken, async (req, res) => {
  try {
    const { motdepasse } = req.body;
    if (!motdepasse) return res.status(400).json({ erreur: 'Mot de passe requis pour confirmer' });

    const { rows } = await db.query('SELECT motdepasse, role FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });
    if (rows[0].role === 'fondateur') return res.status(403).json({ erreur: 'Le compte fondateur ne peut pas être supprimé' });

    const valide = await bcrypt.compare(motdepasse, rows[0].motdepasse);
    if (!valide) return res.status(400).json({ erreur: 'Mot de passe incorrect' });

    // Anonymize instead of delete (keep data integrity for linked records)
    const anonymEmail = `supprime_${req.user.id}@deleted.freample.fr`;
    await db.query(
      `UPDATE users SET nom = 'Compte supprimé', email = $1, motdepasse = '', telephone = NULL,
       adresse = NULL, ville = NULL, photo_profil = NULL, suspendu = TRUE, motif_suspension = 'Compte supprimé (RGPD)'
       WHERE id = $2`,
      [anonymEmail, req.user.id]
    );

    // Also clean employes if any
    await db.query('UPDATE employes SET statut = $1, patron_id = NULL WHERE user_id = $2', ['parti', req.user.id]);

    res.json({ message: 'Compte supprimé conformément au RGPD' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
