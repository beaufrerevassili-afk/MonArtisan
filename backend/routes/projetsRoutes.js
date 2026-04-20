// ============================================================
//  projetsRoutes.js — Projets clients (comme travaux.com)
//  Le client publie un projet → les artisans acceptent → mise en relation
//  Commission : 2€ si < 500€, 5€ si >= 500€
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

// ─── Migration auto ─────────────────────────────
async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS projets_clients (
      id              SERIAL PRIMARY KEY,
      client_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
      titre           TEXT NOT NULL,
      description     TEXT NOT NULL,
      metier          TEXT NOT NULL,
      ville           TEXT,
      adresse         TEXT,
      budget_estime   NUMERIC(10,2),
      budget_ajuste   NUMERIC(10,2),
      commission      NUMERIC(10,2) DEFAULT 2,
      urgence         TEXT DEFAULT 'normal',
      pieces          TEXT,
      photos          JSONB DEFAULT '[]',
      statut          TEXT NOT NULL DEFAULT 'publie',
      date_souhaitee  DATE,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projet_offres (
      id              SERIAL PRIMARY KEY,
      projet_id       INTEGER REFERENCES projets_clients(id) ON DELETE CASCADE,
      artisan_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
      patron_id       INTEGER,
      prix_propose    NUMERIC(10,2),
      message         TEXT,
      date_proposee   DATE,
      delai_jours     INTEGER,
      statut          TEXT NOT NULL DEFAULT 'proposee',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
ensureTables().catch(e => console.error('projets ensureTables:', e.message));

// ── Calcul commission (1% du budget, minimum 1€) + frais Stripe (1.5% + 0.25€) ──
function calcCommission(montant) {
  return Math.max(1, Math.round(montant * 0.01 * 100) / 100);
}
// GoCardless SEPA : 0.2% + 0.20€, plafonné à 2€
function calcFraisPaiement(montant) {
  return Math.min(2, Math.round((montant * 0.002 + 0.20) * 100) / 100);
}

// ═══════════════════════════════════════════════════
//  ROUTES PUBLIQUES (liste des projets pour artisans)
// ═══════════════════════════════════════════════════

// GET /projets/publics — Projets ouverts (pour artisans non connectés aussi)
router.get('/publics', async (req, res) => {
  try {
    const { metier, ville, page = 1, limit = 20 } = req.query;
    let where = `WHERE p.statut = 'publie'`;
    const params = [];
    let idx = 1;
    if (metier) { where += ` AND p.metier ILIKE $${idx++}`; params.push(`%${metier}%`); }
    if (ville) { where += ` AND p.ville ILIKE $${idx++}`; params.push(`%${ville}%`); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows } = await db.query(`
      SELECT p.*, u.nom AS client_nom, COUNT(o.id) AS nb_offres
      FROM projets_clients p
      LEFT JOIN users u ON u.id = p.client_id
      LEFT JOIN projet_offres o ON o.projet_id = p.id
      ${where}
      GROUP BY p.id, u.nom
      ORDER BY p.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `, [...params, parseInt(limit), offset]);
    res.json({ projets: rows });
  } catch (err) {
    console.error('GET /projets/publics:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════
//  ROUTES CLIENT (authentifiées)
// ═══════════════════════════════════════════════════

// POST /projets — Client publie un projet
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { titre, description, metier, ville, adresse, budgetEstime, urgence, pieces, dateSouhaitee } = req.body;
    if (!titre || !description || !metier) return res.status(400).json({ erreur: 'Titre, description et métier requis' });
    const budget = parseFloat(budgetEstime) || 0;
    const commission = calcCommission(budget);
    const fraisPaiement = calcFraisPaiement(budget);
    const { rows } = await db.query(`
      INSERT INTO projets_clients (client_id, titre, description, metier, ville, adresse, budget_estime, budget_ajuste, commission, urgence, pieces, date_souhaitee)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$7,$8,$9,$10,$11) RETURNING *
    `, [req.user.id, titre, description, metier, ville || null, adresse || null, budget, commission + fraisPaiement, urgence || 'normal', pieces || null, dateSouhaitee || null]);
    res.status(201).json({ projet: rows[0], message: 'Projet publié' });
  } catch (err) {
    console.error('POST /projets:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /projets/mes-projets — Projets du client
router.get('/mes-projets', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*, COUNT(o.id) AS nb_offres,
        COUNT(o.id) FILTER (WHERE o.statut = 'acceptee') AS nb_acceptees
      FROM projets_clients p
      LEFT JOIN projet_offres o ON o.projet_id = p.id
      WHERE p.client_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json({ projets: rows });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /projets/:id — Client modifie budget/statut
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { budgetAjuste, statut } = req.body;
    const budget = budgetAjuste ? parseFloat(budgetAjuste) : null;
    const commission = budget ? calcCommission(budget) : null;
    const { rows } = await db.query(`
      UPDATE projets_clients SET
        budget_ajuste = COALESCE($1, budget_ajuste),
        commission = COALESCE($2, commission),
        statut = COALESCE($3, statut)
      WHERE id = $4 AND client_id = $5 RETURNING *
    `, [budget, commission, statut, req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Projet non trouvé' });
    res.json({ projet: rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /projets/:id/offres — Voir les offres reçues (client)
router.get('/:id/offres', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT o.*, u.nom AS artisan_nom, u.metier AS artisan_metier
      FROM projet_offres o
      LEFT JOIN users u ON u.id = o.artisan_id
      WHERE o.projet_id = $1
      ORDER BY o.created_at DESC
    `, [req.params.id]);
    res.json({ offres: rows });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /projets/offres/:id/accepter — Client accepte une offre
router.put('/offres/:id/accepter', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    // Marquer l'offre comme acceptée
    const { rows } = await client.query(`UPDATE projet_offres SET statut = 'acceptee' WHERE id = $1 RETURNING *`, [req.params.id]);
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ erreur: 'Offre non trouvée' }); }
    // Verify ownership
    const proj = await client.query('SELECT client_id FROM projets_clients WHERE id = $1', [rows[0].projet_id]);
    if (!proj.rows[0] || proj.rows[0].client_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ erreur: 'Non autorisé' });
    }
    // Mettre le projet en "en_cours"
    await client.query(`UPDATE projets_clients SET statut = 'en_cours' WHERE id = $1`, [rows[0].projet_id]);
    // Refuser les autres offres
    await client.query(`UPDATE projet_offres SET statut = 'refusee' WHERE projet_id = $1 AND id != $2 AND statut = 'proposee'`, [rows[0].projet_id, req.params.id]);
    // Notifier l'artisan par email + notification
    const artisan = await client.query('SELECT u.email, u.nom FROM users u WHERE u.id = $1', [rows[0].artisan_id]);
    const projet = await client.query('SELECT titre FROM projets_clients WHERE id = $1', [rows[0].projet_id]);
    if (artisan.rows[0] && projet.rows[0]) {
      emailService.sendOffreAcceptee(artisan.rows[0].email, artisan.rows[0].nom, projet.rows[0].titre).catch(() => {});
      await client.query(`INSERT INTO notifications (user_id, type, titre, contenu) VALUES ($1, 'mission_acceptee', 'Offre acceptée !', $2)`,
        [rows[0].artisan_id, `Votre offre pour « ${projet.rows[0].titre} » a été acceptée`]);
    }
    await client.query('COMMIT');
    res.json({ offre: rows[0], message: 'Offre acceptée — vous êtes mis en relation' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    res.status(500).json({ erreur: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// ═══════════════════════════════════════════════════
//  ROUTES ARTISAN / PATRON (authentifiées)
// ═══════════════════════════════════════════════════

// GET /projets/disponibles — Projets ouverts dans le métier de l'artisan
router.get('/disponibles', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*, u.nom AS client_nom, COUNT(o.id) AS nb_offres
      FROM projets_clients p
      LEFT JOIN users u ON u.id = p.client_id
      LEFT JOIN projet_offres o ON o.projet_id = p.id
      WHERE p.statut = 'publie'
      GROUP BY p.id, u.nom
      ORDER BY p.created_at DESC
    `);
    res.json({ projets: rows });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /projets/:id/offre — Artisan fait une offre
router.post('/:id/offre', authenticateToken, async (req, res) => {
  try {
    const { prixPropose, message, dateProposee, delaiJours } = req.body;
    if (!prixPropose) return res.status(400).json({ erreur: 'Prix requis' });
    // Vérifier pas de doublon
    const exist = await db.query('SELECT id FROM projet_offres WHERE projet_id = $1 AND artisan_id = $2', [req.params.id, req.user.id]);
    if (exist.rows[0]) return res.status(409).json({ erreur: 'Vous avez déjà fait une offre sur ce projet' });
    const { rows } = await db.query(`
      INSERT INTO projet_offres (projet_id, artisan_id, patron_id, prix_propose, message, date_proposee, delai_jours)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [req.params.id, req.user.id, req.user.patronId || null, prixPropose, message || null, dateProposee || null, delaiJours || null]);
    // Notifier le client par email + notification
    const projet = await db.query('SELECT p.titre, u.email, u.nom, u.id AS client_id FROM projets_clients p JOIN users u ON u.id = p.client_id WHERE p.id = $1', [req.params.id]);
    if (projet.rows[0]) {
      const { email, nom, client_id, titre } = projet.rows[0];
      const artisanNom = req.user.nom || 'Un artisan';
      emailService.sendNouvelleOffre(email, nom, titre, artisanNom).catch(() => {});
      db.query(`INSERT INTO notifications (user_id, type, titre, contenu) VALUES ($1, 'nouvelle_offre', 'Nouvelle offre reçue', $2)`,
        [client_id, `${artisanNom} a soumis une offre de ${prixPropose}€ pour « ${titre} »`]).catch(() => {});
    }
    res.status(201).json({ offre: rows[0], message: 'Offre envoyée' });
  } catch (err) {
    console.error('POST offre:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /projets/mes-offres — Offres faites par l'artisan
router.get('/mes-offres', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT o.*, p.titre, p.description, p.metier, p.ville, p.budget_ajuste, p.statut AS projet_statut, u.nom AS client_nom
      FROM projet_offres o
      JOIN projets_clients p ON p.id = o.projet_id
      LEFT JOIN users u ON u.id = p.client_id
      WHERE o.artisan_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json({ offres: rows });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
