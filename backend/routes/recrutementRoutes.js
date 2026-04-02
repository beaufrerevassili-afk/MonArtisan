// ============================================================
//  recrutementRoutes.js — Annonces de recrutement & candidatures
//  Routes publiques : GET/POST annonces, POST candidature
//  Routes patron (auth) : création, gestion, suivi pipeline
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authenticateToken } = require('../middleware/auth');

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
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
ensureTables().catch(e => console.error('recrutement ensureTables:', e.message));

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

// GET /recrutement/annonces — liste des annonces actives
router.get('/annonces', async (req, res) => {
  try {
    const { poste, localisation, typeContrat } = req.query;
    let sql = `
      SELECT a.*,
        u.nom       AS nom_entreprise_user,
        COUNT(c.id) AS nb_candidatures
      FROM annonces_recrutement a
      LEFT JOIN users u ON u.id = a.patron_id
      LEFT JOIN candidatures_recrutement c ON c.annonce_id = a.id
      WHERE a.statut = 'active'
    `;
    const params = [];
    let idx = 1;
    if (poste)       { sql += ` AND a.poste ILIKE $${idx++}`;        params.push(`%${poste}%`); }
    if (localisation){ sql += ` AND a.localisation ILIKE $${idx++}`; params.push(`%${localisation}%`); }
    if (typeContrat) { sql += ` AND a.type_contrat = $${idx++}`;      params.push(typeContrat); }
    sql += ' GROUP BY a.id, u.nom ORDER BY a.created_at DESC';

    const { rows } = await db.query(sql, params);
    const annonces = rows.map(r => ({ ...mapAnnonce(r), nomEntreprise: r.nom_entreprise || r.nom_entreprise_user || 'Entreprise BTP' }));
    res.json({ annonces, total: annonces.length });
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
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
