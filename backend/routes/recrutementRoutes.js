// ============================================================
//  recrutementRoutes.js — Annonces de recrutement & candidatures
//  Routes publiques : GET/POST annonces, POST candidature
//  Routes patron (auth) : création, gestion, suivi pipeline
// ============================================================

const express      = require('express');
const rateLimit = require('express-rate-limit');
const writeLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, message: { erreur: 'Trop de requêtes.' }, keyGenerator: (req) => req.user?.id || req.ip });
const router       = express.Router();
const db           = require('../db');
const { authenticateToken } = require('../middleware/auth');
const nodemailer   = require('nodemailer');
const { notify } = require('../utils/notify');

// ─── Mailer (optionnel — ne crashe pas si SMTP non configuré) ─
function getMailer() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const STATUT_NOTIF = {
  examinée:  { emoji: '👀', sujet: 'Votre candidature est en cours d\'examen', msg: 'Bonne nouvelle ! Votre candidature a retenu l\'attention de l\'entreprise et est en cours d\'examen. Nous reviendrons vers vous rapidement.' },
  entretien: { emoji: '📞', sujet: 'Entretien proposé pour votre candidature', msg: 'L\'entreprise souhaite vous rencontrer ! Vous allez être contacté(e) prochainement pour fixer les modalités de l\'entretien.' },
  retenue:   { emoji: '🎉', sujet: 'Votre candidature a été retenue !', msg: 'Félicitations ! Votre candidature a été retenue. Vous allez recevoir prochainement les informations nécessaires pour préparer votre intégration.' },
  rejetée:   { emoji: '📋', sujet: 'Réponse concernant votre candidature', msg: 'Votre candidature a été examinée avec attention mais ne correspond pas aux besoins actuels. Nous vous souhaitons bonne continuation dans votre recherche.' },
};

const DOCUMENTS_REQUIS_EMBAUCHE = [
  { id: 'piece_identite',      label: 'Pièce d\'identité (CNI ou passeport)' },
  { id: 'carte_vitale',        label: 'Carte Vitale (attestation ou copie)' },
  { id: 'rib',                 label: 'RIB (pour le versement du salaire)' },
  { id: 'justificatif_domicile', label: 'Justificatif de domicile (< 3 mois)' },
  { id: 'diplomes',            label: 'Diplômes et certifications' },
  { id: 'permis_conduire',     label: 'Permis de conduire (si poste le requiert)' },
  { id: 'photo_identite',      label: 'Photo d\'identité' },
  { id: 'attestation_securite_sociale', label: 'Attestation de sécurité sociale' },
  { id: 'casier_judiciaire',   label: 'Extrait de casier judiciaire (si requis)' },
];

async function envoyerEmailCandidature(candidature, statut, annonce) {
  const notif = STATUT_NOTIF[statut];
  if (!notif) return;
  const mailer = getMailer();
  if (!mailer) return;
  const nomEntreprise = annonce?.nom_entreprise || annonce?.patron_nom || 'L\'entreprise';
  await mailer.sendMail({
    from: process.env.SMTP_FROM || `"MonArtisan Recrutement" <noreply@monartisan.fr>`,
    to: candidature.email,
    subject: `${notif.emoji} ${notif.sujet}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E5E5EA;">
        <div style="background:linear-gradient(135deg,#5B5BD6,#7C3AED);padding:32px 28px;text-align:center;">
          <div style="font-size:52px;margin-bottom:12px;">${notif.emoji}</div>
          <h1 style="color:#fff;font-size:20px;margin:0;font-weight:800;">${notif.sujet}</h1>
        </div>
        <div style="padding:28px;">
          <p>Bonjour <strong>${candidature.prenom} ${candidature.nom}</strong>,</p>
          <p style="line-height:1.7;color:#3A3A3C;">${notif.msg}</p>
          <div style="background:#F4F4F8;border-radius:12px;padding:16px 18px;margin:20px 0;">
            <p style="margin:0;font-weight:700;color:#1C1C1E;">Poste : ${annonce?.titre || '—'}</p>
            <p style="margin:6px 0 0;color:#6E6E73;font-size:14px;">Entreprise : ${nomEntreprise}</p>
          </div>
          <p style="color:#8E8E93;font-size:12px;margin-top:28px;border-top:1px solid #F2F2F7;padding-top:16px;">
            Ce message a été envoyé automatiquement par MonArtisan. Ne pas répondre à cet email.
          </p>
        </div>
      </div>
    `,
  }).catch(e => console.error('Email candidature:', e.message));
}

// ─── Migration auto des tables ─────────────────────────────
async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS annonces_recrutement (
      id            SERIAL PRIMARY KEY,
      patron_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      titre         TEXT    NOT NULL,
      poste         TEXT    NOT NULL,
      type_contrat  TEXT    NOT NULL DEFAULT 'CDI',
      description   TEXT    NOT NULL,
      localisation  TEXT    NOT NULL,
      salaire_min   NUMERIC(10,2),
      salaire_max   NUMERIC(10,2),
      experience    TEXT,
      competences   TEXT,
      date_debut    DATE,
      statut        TEXT    NOT NULL DEFAULT 'active',
      nom_entreprise TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS candidatures_recrutement (
      id              SERIAL PRIMARY KEY,
      annonce_id      INTEGER REFERENCES annonces_recrutement(id) ON DELETE CASCADE,
      nom             TEXT NOT NULL,
      prenom          TEXT NOT NULL,
      email           TEXT NOT NULL,
      telephone       TEXT,
      lettre          TEXT,
      cv_texte        TEXT,
      statut          TEXT NOT NULL DEFAULT 'nouvelle',
      note_interne    TEXT,
      date_entretien  TIMESTAMPTZ,
      employe_id      INTEGER,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS documents_employe (
      id              SERIAL PRIMARY KEY,
      employe_id      INTEGER NOT NULL,
      patron_id       INTEGER,
      type_document   TEXT NOT NULL,
      nom_fichier     TEXT NOT NULL,
      contenu_base64  TEXT,
      taille          INTEGER,
      mime_type       TEXT,
      statut          TEXT NOT NULL DEFAULT 'en_attente',
      commentaire     TEXT,
      uploaded_at     TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  // Add columns if missing (idempotent)
  await db.query(`ALTER TABLE candidatures_recrutement ADD COLUMN IF NOT EXISTS date_entretien TIMESTAMPTZ`).catch(()=>{});
  await db.query(`ALTER TABLE candidatures_recrutement ADD COLUMN IF NOT EXISTS employe_id INTEGER`).catch(()=>{});
}
ensureTables().catch(e => console.error('recrutement ensureTables:', e.message));

// Auto-close stale announcements (30 days without candidatures)
async function checkStaleAnnonces() {
  try {
    const { rows } = await db.query(`
      SELECT a.id, a.patron_id, a.titre
      FROM annonces_recrutement a
      LEFT JOIN candidatures_recrutement c ON c.annonce_id = a.id
      WHERE a.statut = 'active'
        AND a.created_at < NOW() - INTERVAL '30 days'
      GROUP BY a.id
      HAVING COUNT(c.id) = 0
    `);
    for (const annonce of rows) {
      // Don't auto-close, just notify the patron
      await notify(annonce.patron_id, 'recrutement', 'Annonce sans candidature',
        `Votre annonce "${annonce.titre}" n'a reçu aucune candidature depuis 30 jours. Pensez à la modifier ou la fermer.`,
        '/patron/rh?onglet=recrutement'
      );
    }
  } catch (err) {
    console.error('checkStaleAnnonces:', err.message);
  }
}
// Run on start and every 24h
setTimeout(checkStaleAnnonces, 10000);
setInterval(checkStaleAnnonces, 24 * 60 * 60 * 1000);

// ─── Helpers ───────────────────────────────────────────────
function mapAnnonce(r) {
  return {
    id:           r.id,
    patronId:     r.patron_id,
    titre:        r.titre,
    poste:        r.poste,
    typeContrat:  r.type_contrat,
    description:  r.description,
    localisation: r.localisation,
    salaireMin:   r.salaire_min ? parseFloat(r.salaire_min) : null,
    salaireMax:   r.salaire_max ? parseFloat(r.salaire_max) : null,
    experience:   r.experience,
    competences:  r.competences,
    dateDebut:    r.date_debut,
    statut:       r.statut,
    nomEntreprise:r.nom_entreprise || 'Entreprise BTP',
    nbCandidatures: parseInt(r.nb_candidatures || 0),
    creeLe:       r.created_at,
  };
}

function mapCandidature(r) {
  return {
    id:         r.id,
    annonceId:  r.annonce_id,
    nom:        r.nom,
    prenom:     r.prenom,
    email:      r.email,
    telephone:  r.telephone,
    lettre:     r.lettre,
    cvTexte:    r.cv_texte,
    statut:     r.statut,
    noteInterne:r.note_interne,
    creeLe:     r.created_at,
  };
}

// ═══════════════════════════════════════════════════════════
//  ROUTES PUBLIQUES
// ═══════════════════════════════════════════════════════════

// GET /recrutement/annonces — liste des annonces actives (recherche + pagination)
router.get('/annonces', async (req, res) => {
  try {
    const { q, localisation, typeContrat, salaireMin, page = 1, limit = 20 } = req.query;
    const params = [];
    let idx = 1;
    let where = `WHERE a.statut = 'active'`;

    // Recherche full-text sur titre + poste + description + compétences
    if (q && q.trim()) {
      where += ` AND (a.titre ILIKE $${idx} OR a.poste ILIKE $${idx} OR a.description ILIKE $${idx} OR a.competences ILIKE $${idx})`;
      params.push(`%${q.trim()}%`); idx++;
    }
    if (localisation && localisation.trim()) {
      where += ` AND a.localisation ILIKE $${idx++}`;
      params.push(`%${localisation.trim()}%`);
    }
    if (typeContrat) {
      where += ` AND a.type_contrat = $${idx++}`;
      params.push(typeContrat);
    }
    if (salaireMin) {
      where += ` AND a.salaire_min >= $${idx++}`;
      params.push(parseFloat(salaireMin));
    }

    // Total pour pagination
    const countSql = `SELECT COUNT(*) FROM annonces_recrutement a ${where}`;
    const { rows: countRows } = await db.query(countSql, params);
    const total = parseInt(countRows[0].count);

    // Données paginées
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sql = `
      SELECT a.*, u.nom AS nom_entreprise_user, COUNT(c.id) AS nb_candidatures
      FROM annonces_recrutement a
      LEFT JOIN users u ON u.id = a.patron_id
      LEFT JOIN candidatures_recrutement c ON c.annonce_id = a.id
      ${where}
      GROUP BY a.id, u.nom
      ORDER BY a.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(parseInt(limit), offset);

    const { rows } = await db.query(sql, params);
    const annonces = rows.map(r => ({ ...mapAnnonce(r), nomEntreprise: r.nom_entreprise || r.nom_entreprise_user || 'Entreprise BTP' }));
    res.json({ annonces, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('GET /recrutement/annonces:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /recrutement/annonces/:id — détail d'une annonce
router.get('/annonces/:id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT a.*, u.nom AS nom_entreprise_user
      FROM annonces_recrutement a
      LEFT JOIN users u ON u.id = a.patron_id
      WHERE a.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Annonce introuvable' });
    const r = rows[0];
    res.json({ annonce: { ...mapAnnonce(r), nomEntreprise: r.nom_entreprise || r.nom_entreprise_user || 'Entreprise BTP' } });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /recrutement/annonces/:id/candidatures — postuler (public)
router.post('/annonces/:id/candidatures', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, lettre, cvTexte } = req.body;
    if (!nom || !prenom || !email) return res.status(400).json({ erreur: 'Nom, prénom et email requis' });

    // Vérifier que l'annonce existe et est active
    const { rows: annonceRows } = await db.query(
      `SELECT id FROM annonces_recrutement WHERE id = $1 AND statut = 'active'`,
      [req.params.id]
    );
    if (!annonceRows[0]) return res.status(404).json({ erreur: 'Annonce introuvable ou fermée' });

    // Anti-doublon email par annonce
    const { rows: existRows } = await db.query(
      `SELECT id FROM candidatures_recrutement WHERE annonce_id = $1 AND email = $2`,
      [req.params.id, email]
    );
    if (existRows[0]) return res.status(409).json({ erreur: 'Vous avez déjà postulé à cette offre' });

    const { rows } = await db.query(`
      INSERT INTO candidatures_recrutement (annonce_id, nom, prenom, email, telephone, lettre, cv_texte)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [req.params.id, nom, prenom, email, telephone || null, lettre || null, cvTexte || null]);

    // Notifier le patron propriétaire de l'annonce
    const { rows: annonceInfo } = await db.query('SELECT patron_id FROM annonces_recrutement WHERE id = $1', [req.params.id]);
    if (annonceInfo[0]?.patron_id) {
      notify(annonceInfo[0].patron_id, 'candidature', 'Nouvelle candidature', prenom + ' ' + nom + ' a postulé à votre annonce', '/patron/rh?onglet=recrutement').catch(() => {});
    }

    res.status(201).json({ candidature: mapCandidature(rows[0]), message: 'Candidature enregistrée' });
  } catch (err) {
    console.error('POST candidature:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
//  ROUTES PATRON (authentifiées)
// ═══════════════════════════════════════════════════════════

// GET /recrutement/patron/annonces — mes annonces
router.get('/patron/annonces', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT a.*, COUNT(c.id) AS nb_candidatures
      FROM annonces_recrutement a
      LEFT JOIN candidatures_recrutement c ON c.annonce_id = a.id
      WHERE a.patron_id = $1
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `, [req.user.id]);
    res.json({ annonces: rows.map(mapAnnonce) });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /recrutement/patron/annonces — créer une annonce
router.post('/patron/annonces', authenticateToken, async (req, res) => {
  try {
    const {
      titre, poste, typeContrat = 'CDI', description, localisation,
      salaireMin, salaireMax, experience, competences, dateDebut, nomEntreprise,
    } = req.body;
    if (!titre || !poste || !description || !localisation) {
      return res.status(400).json({ erreur: 'Titre, poste, description et localisation requis' });
    }
    const { rows } = await db.query(`
      INSERT INTO annonces_recrutement
        (patron_id, titre, poste, type_contrat, description, localisation, salaire_min, salaire_max, experience, competences, date_debut, statut, nom_entreprise)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active',$12)
      RETURNING *
    `, [req.user.id, titre, poste, typeContrat, description, localisation,
        salaireMin || null, salaireMax || null, experience || null,
        competences || null, dateDebut || null, nomEntreprise || null]);
    res.status(201).json({ annonce: mapAnnonce(rows[0]) });
  } catch (err) {
    console.error('POST annonce:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /recrutement/patron/annonces/:id — modifier/fermer une annonce
router.put('/patron/annonces/:id', authenticateToken, async (req, res) => {
  try {
    const {
      titre, poste, typeContrat, description, localisation,
      salaireMin, salaireMax, experience, competences, dateDebut, statut, nomEntreprise,
    } = req.body;
    const { rows } = await db.query(`
      UPDATE annonces_recrutement SET
        titre = COALESCE($1, titre),
        poste = COALESCE($2, poste),
        type_contrat = COALESCE($3, type_contrat),
        description = COALESCE($4, description),
        localisation = COALESCE($5, localisation),
        salaire_min = COALESCE($6, salaire_min),
        salaire_max = COALESCE($7, salaire_max),
        experience = COALESCE($8, experience),
        competences = COALESCE($9, competences),
        date_debut = COALESCE($10, date_debut),
        statut = COALESCE($11, statut),
        nom_entreprise = COALESCE($12, nom_entreprise),
        updated_at = NOW()
      WHERE id = $13 AND patron_id = $14
      RETURNING *
    `, [titre, poste, typeContrat, description, localisation,
        salaireMin, salaireMax, experience, competences, dateDebut,
        statut, nomEntreprise, req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Annonce introuvable' });
    res.json({ annonce: mapAnnonce(rows[0]) });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// DELETE /recrutement/patron/annonces/:id
router.delete('/patron/annonces/:id', authenticateToken, async (req, res) => {
  try {
    await db.query(`DELETE FROM annonces_recrutement WHERE id = $1 AND patron_id = $2`, [req.params.id, req.user.id]);
    res.json({ message: 'Annonce supprimée' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /recrutement/patron/annonces/:id/candidatures — voir les candidatures
router.get('/patron/annonces/:id/candidatures', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'annonce appartient au patron
    const { rows: checkRows } = await db.query(
      `SELECT id FROM annonces_recrutement WHERE id = $1 AND patron_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!checkRows[0]) return res.status(403).json({ erreur: 'Accès refusé' });

    const { rows } = await db.query(
      `SELECT * FROM candidatures_recrutement WHERE annonce_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({ candidatures: rows.map(mapCandidature) });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /recrutement/patron/candidatures/:id — mettre à jour statut + note
router.put('/patron/candidatures/:id', authenticateToken, async (req, res) => {
  try {
    const { statut, noteInterne } = req.body;
    const { rows } = await db.query(`
      UPDATE candidatures_recrutement c
      SET statut = COALESCE($1, c.statut),
          note_interne = COALESCE($2, c.note_interne)
      FROM annonces_recrutement a
      WHERE c.id = $3 AND c.annonce_id = a.id AND a.patron_id = $4
      RETURNING c.*
    `, [statut, noteInterne, req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Candidature introuvable' });
    res.json({ candidature: mapCandidature(rows[0]) });

    // Email de notification au candidat (async, n'impacte pas la réponse)
    if (statut && STATUT_NOTIF[statut]) {
      const { rows: annonceRows } = await db.query(
        `SELECT a.titre, a.nom_entreprise, u.nom AS patron_nom
         FROM annonces_recrutement a
         LEFT JOIN users u ON u.id = a.patron_id
         WHERE a.id = $1`,
        [rows[0].annonce_id]
      );
      envoyerEmailCandidature(rows[0], statut, annonceRows[0]).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ── Envoyer email d'embauche avec liste de documents ──
router.post('/patron/candidatures/:id/envoyer-documents', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*, a.titre, a.nom_entreprise, a.patron_id, u.nom AS patron_nom
       FROM candidatures_recrutement c
       JOIN annonces_recrutement a ON a.id = c.annonce_id
       LEFT JOIN users u ON u.id = a.patron_id
       WHERE c.id = $1 AND a.patron_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Candidature introuvable' });
    const c = rows[0];
    const nomEntreprise = c.nom_entreprise || c.patron_nom || 'L\'entreprise';

    const docsHtml = DOCUMENTS_REQUIS_EMBAUCHE.map(d =>
      `<li style="padding:6px 0;border-bottom:1px solid #F2F2F7;">${d.label}</li>`
    ).join('');

    const mailer = getMailer();
    if (mailer) {
      await mailer.sendMail({
        from: process.env.SMTP_FROM || `"Freample Recrutement" <noreply@freample.fr>`,
        to: c.email,
        subject: `📋 Documents à fournir — ${nomEntreprise}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E5E5EA;">
            <div style="background:linear-gradient(135deg,#16A34A,#059669);padding:32px 28px;text-align:center;">
              <div style="font-size:52px;margin-bottom:12px;">📋</div>
              <h1 style="color:#fff;font-size:20px;margin:0;font-weight:800;">Bienvenue chez ${nomEntreprise} !</h1>
            </div>
            <div style="padding:28px;">
              <p>Bonjour <strong>${c.prenom} ${c.nom}</strong>,</p>
              <p style="line-height:1.7;color:#3A3A3C;">Suite à votre candidature retenue pour le poste <strong>${c.titre}</strong>, merci de préparer et transmettre les documents suivants :</p>
              <ul style="list-style:none;padding:0;margin:16px 0;background:#F4F4F8;border-radius:12px;padding:12px 18px;">${docsHtml}</ul>
              <p style="line-height:1.7;color:#3A3A3C;">Vous recevrez prochainement vos identifiants de connexion à la plateforme Freample pour déposer vos documents en ligne.</p>
              <p style="color:#8E8E93;font-size:12px;margin-top:28px;border-top:1px solid #F2F2F7;padding-top:16px;">
                Ce message a été envoyé automatiquement par Freample. Ne pas répondre à cet email.
              </p>
            </div>
          </div>
        `,
      }).catch(e => console.error('Email documents:', e.message));
    }

    res.json({ message: 'Email envoyé avec la liste des documents', documentsRequis: DOCUMENTS_REQUIS_EMBAUCHE });
  } catch (err) {
    console.error('POST envoyer-documents:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ── Créer compte employé depuis candidature retenue ──
router.post('/patron/candidatures/:id/creer-employe', authenticateToken, async (req, res) => {
  try {
    const { poste, typeContrat, salaireBase, dateEntree } = req.body;

    // Vérifier que la candidature est retenue et appartient au patron
    const { rows } = await db.query(
      `SELECT c.*, a.titre, a.nom_entreprise, a.patron_id
       FROM candidatures_recrutement c
       JOIN annonces_recrutement a ON a.id = c.annonce_id
       WHERE c.id = $1 AND a.patron_id = $2 AND c.statut = 'retenue'`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Candidature introuvable ou non retenue' });
    const c = rows[0];

    // Vérifier si un compte existe déjà
    const existing = await db.query('SELECT id, role FROM users WHERE email = $1', [c.email]);
    let userId;
    let compteExistant = false;
    let tempPassword = null;

    if (existing.rows.length > 0) {
      // Cas 1 : compte existant → on le rattache
      userId = existing.rows[0].id;
      compteExistant = true;
      await db.query('UPDATE users SET role = $1 WHERE id = $2 AND role != $3', ['employe', userId, 'patron']);
    } else {
      // Cas 2 : pas de compte → créer avec mot de passe temporaire
      const bcrypt = require('bcrypt');
      tempPassword = require('crypto').randomBytes(6).toString('hex');
      const hash = await bcrypt.hash(tempPassword, 12);
      const userResult = await db.query(
        `INSERT INTO users (nom, email, motdepasse, role, verified, telephone)
         VALUES ($1, $2, $3, 'employe', true, $4) RETURNING id`,
        [`${c.prenom} ${c.nom}`, c.email, hash, c.telephone || null]
      );
      userId = userResult.rows[0].id;
    }

    // Créer la fiche employé
    const empResult = await db.query(
      `INSERT INTO employes
        (prenom, nom, poste, email, telephone, date_entree, type_contrat, salaire_base, statut, patron_id, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'actif',$9,$10) RETURNING *`,
      [c.prenom, c.nom, poste || c.titre, c.email, c.telephone || '',
       dateEntree || new Date().toISOString().split('T')[0],
       typeContrat || 'CDI', parseFloat(salaireBase) || 0,
       req.user.id, userId]
    );

    // Lier la candidature à l'employé
    await db.query('UPDATE candidatures_recrutement SET employe_id = $1 WHERE id = $2', [empResult.rows[0].id, c.id]);

    // Envoyer email via Resend
    if (compteExistant) {
      // Cas 1 : notifier le salarié qu'il a été intégré
      await emailService.sendWelcomeEmploye(c.email, c.prenom, req.user.nom || 'votre employeur');
    } else {
      // Cas 2 : envoyer les identifiants
      await emailService.sendIdentifiantsEmploye(c.email, c.prenom, c.nom, tempPassword);
    }

    res.status(201).json({
      message: compteExistant ? 'Salarié rattaché à votre entreprise' : 'Compte créé et identifiants envoyés',
      employe: empResult.rows[0],
      compteExistant,
      identifiants: compteExistant ? null : { email: c.email, motdepasse: tempPassword },
    });
  } catch (err) {
    console.error('POST creer-employe:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ── Liste des documents requis (public info) ──
router.get('/documents-requis', (req, res) => {
  res.json({ documents: DOCUMENTS_REQUIS_EMBAUCHE });
});

module.exports = router;
