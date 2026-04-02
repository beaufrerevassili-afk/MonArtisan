// ─── reservationsRoutes.js ─────────────────────────────────────────────────
// Réservations publiques (sans compte) pour les secteurs coiffure/restaurant/etc.
// POST /reservations  → créer une réservation
// GET  /reservations  → liste pour le patron (auth requise)

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Créer la table si elle n'existe pas (auto-migration légère)
db.query(`
  CREATE TABLE IF NOT EXISTS reservations (
    id           SERIAL PRIMARY KEY,
    pro_id       INTEGER,
    secteur      VARCHAR(50),
    service      VARCHAR(200),
    prix         NUMERIC(10,2),
    creneau      VARCHAR(100),
    nom          VARCHAR(100),
    prenom       VARCHAR(100),
    email        VARCHAR(200),
    telephone    VARCHAR(30),
    statut       VARCHAR(30) DEFAULT 'en_attente',
    note_interne TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(err => console.error('reservations table init error:', err.message));

// ── POST /reservations ── (public, sans compte) ──────────────────────────────
router.post('/', async (req, res) => {
  const { pro_id, secteur, service, prix, creneau, nom, prenom, email, telephone } = req.body;

  if (!service || !creneau || !nom || !prenom || !email || !telephone) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.' });
  }

  // Validation email basique
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Email invalide.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO reservations (pro_id, secteur, service, prix, creneau, nom, prenom, email, telephone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, created_at`,
      [pro_id || null, secteur || null, service, prix || null, creneau, nom, prenom, email, telephone]
    );

    res.status(201).json({
      success: true,
      message: 'Réservation enregistrée.',
      reservation: result.rows[0],
    });
  } catch (err) {
    console.error('POST /reservations error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ── GET /reservations ── (patron authentifié) ────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { statut, secteur, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let i = 1;

    if (statut)  { conditions.push(`statut = $${i++}`);  params.push(statut); }
    if (secteur) { conditions.push(`secteur = $${i++}`); params.push(secteur); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows, total] = await Promise.all([
      db.query(`SELECT * FROM reservations ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`, [...params, limit, offset]),
      db.query(`SELECT COUNT(*) FROM reservations ${where}`, params),
    ]);

    res.json({
      success: true,
      reservations: rows.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(total.rows[0].count / limit),
    });
  } catch (err) {
    console.error('GET /reservations error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ── PATCH /reservations/:id ── (patron — changer statut) ─────────────────────
router.patch('/:id', authenticateToken, async (req, res) => {
  const { statut, note_interne } = req.body;
  const fields = [];
  const params = [];
  let i = 1;

  if (statut)       { fields.push(`statut = $${i++}`);       params.push(statut); }
  if (note_interne !== undefined) { fields.push(`note_interne = $${i++}`); params.push(note_interne); }

  if (!fields.length) return res.status(400).json({ success: false, message: 'Rien à mettre à jour.' });

  params.push(req.params.id);
  try {
    const result = await db.query(
      `UPDATE reservations SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Réservation introuvable.' });
    res.json({ success: true, reservation: result.rows[0] });
  } catch (err) {
    console.error('PATCH /reservations/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
