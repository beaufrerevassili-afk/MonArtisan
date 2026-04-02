// ============================================================
//  routes/teamRoutes.js — Équipe : liste artisans & clients
// ============================================================

const express = require('express');
const db      = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { mapUser, mapMission } = require('../utils/mappers');

const router = express.Router();

// GET /artisans
router.get('/artisans', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        u.id, u.nom, u.email, u.role, u.verified, u.statut_verification, u.statut_validation,
        u.motif_rejet, u.valide_le, u.telephone, u.metier, u.siret, u.adresse, u.ville,
        u.experience, u.description, u.documents, u.documents_soumis, u.suspendu, u.suspendu_le, u.cree_le,
        COUNT(m.id)                                                         AS missions_total,
        COUNT(m.id) FILTER (WHERE m.statut = 'en_cours')                   AS missions_en_cours,
        BOOL_OR(m.statut IN ('assignee','en_cours'))                        AS non_disponible
      FROM users u
      LEFT JOIN missions m ON m.artisan_id = u.id
      WHERE u.role = 'artisan'
      GROUP BY u.id
    `);

    const artisans = rows.map(r => ({
      ...mapUser(r),
      missions_total:    parseInt(r.missions_total) || 0,
      missions_en_cours: parseInt(r.missions_en_cours) || 0,
      disponible:        !r.non_disponible,
    }));

    res.json({ total: artisans.length, artisans });
  } catch (err) {
    console.error('Erreur GET /artisans :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /artisans/:id/missions
router.get('/artisans/:id/missions', authenticateToken, async (req, res) => {
  try {
    const artisanId = parseInt(req.params.id);
    const { rows: ar } = await db.query("SELECT id, nom, email, role, metier FROM users WHERE id = $1 AND role = 'artisan'", [artisanId]);
    if (!ar[0]) return res.status(404).json({ erreur: 'Artisan introuvable' });
    if (req.user.role === 'artisan' && req.user.id !== artisanId) return res.status(403).json({ erreur: 'Accès refusé' });

    const { rows: missions } = await db.query('SELECT * FROM missions WHERE artisan_id = $1', [artisanId]);
    res.json({ artisan: ar[0], total: missions.length, missions: missions.map(mapMission) });
  } catch (err) {
    console.error('Erreur GET /artisans/:id/missions :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /clients
router.get('/clients', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        u.id, u.nom, u.email, u.role, u.telephone, u.adresse, u.ville, u.cree_le,
        COUNT(m.id)               AS missions_total,
        COALESCE(SUM(m.budget),0) AS budget_total
      FROM users u
      LEFT JOIN missions m ON m.client_id = u.id
      WHERE u.role = 'client'
      GROUP BY u.id
    `);

    const clients = rows.map(r => ({
      id:             r.id,
      nom:            r.nom,
      email:          r.email,
      role:           r.role,
      telephone:      r.telephone,
      adresse:        r.adresse,
      ville:          r.ville,
      creeLe:         r.cree_le,
      missions_total: parseInt(r.missions_total) || 0,
      budget_total:   parseFloat(r.budget_total) || 0,
    }));

    res.json({ total: clients.length, clients });
  } catch (err) {
    console.error('Erreur GET /clients :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
