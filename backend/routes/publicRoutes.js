// ============================================================
//  routes/publicRoutes.js — Routes publiques (sans authentification)
// ============================================================

const express = require('express');
const db      = require('../db');

const router = express.Router();

// GET /public/artisans — liste des artisans validés (landing page)
router.get('/public/artisans', async (req, res) => {
  try {
    const { q, metier, ville, noteMin } = req.query;

    let sql = `
      SELECT
        u.id,
        u.nom,
        u.metier,
        u.ville,
        u.description,
        u.verified,
        u.experience,
        ROUND(COALESCE(AVG(n.note), 0)::numeric, 1) AS note,
        COUNT(n.id)::int AS nb_avis
      FROM users u
      LEFT JOIN notations n ON n.artisan_id = u.id
      WHERE u.role = 'artisan'
        AND u.statut_validation = 'valide'
        AND (u.suspendu IS NULL OR u.suspendu = false)
    `;
    const params = [];
    let idx = 1;

    if (metier) { sql += ` AND u.metier = $${idx++}`;       params.push(metier); }
    if (ville)  { sql += ` AND u.ville ILIKE $${idx++}`;    params.push(`%${ville}%`); }

    sql += ' GROUP BY u.id ORDER BY u.verified DESC, AVG(n.note) DESC NULLS LAST';

    let { rows } = await db.query(sql, params);

    if (q) {
      const ql = q.toLowerCase();
      rows = rows.filter(a => [a.nom, a.metier, a.ville, a.description, a.experience].some(s => s && s.toLowerCase().includes(ql)));
    }
    if (noteMin) rows = rows.filter(a => a.note >= parseFloat(noteMin));

    const artisans = rows.map(a => ({
      id:          a.id,
      nom:         a.nom,
      metier:      a.metier,
      ville:       a.ville,
      description: a.description,
      verified:    a.verified,
      note:        parseFloat(a.note) || 0,
      nbAvis:      a.nb_avis || 0,
    }));

    res.json({ artisans, total: artisans.length });
  } catch (err) {
    console.error('Erreur GET /public/artisans :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET / — Documentation API
router.get('/', (req, res) => {
  res.json({
    api: 'Application Artisans — Backend Complet',
    version: '5.0.0',
    modules: {
      auth:          ['POST /login', 'POST /register', 'POST /forgot-password', 'POST /reset-password'],
      dashboards:    ['GET /dashboard/client', '/dashboard/artisan', '/dashboard/patron', '/dashboard/admin'],
      missions:      ['GET/POST /missions', 'PUT /missions/:id', '/missions/:id/assigner', '/missions/:id/statut', 'DELETE /missions/:id'],
      erp:           ['GET /erp/rapport', '/erp/stats', '/artisans', '/artisans/:id/missions', '/clients'],
      finance:       ['GET/POST /finance/devis', '/finance/factures', '/finance/salaires', '/finance/tableau-de-bord'],
      rh:            ['GET /rh/employes', '/rh/planning', '/rh/conges', '/rh/notes-frais', '/rh/tableau-de-bord'],
      qse:           ['GET /qse/habilitations', '/qse/documents', '/qse/epi', 'POST /qse/verifier-assignation'],
      urssaf:        ['POST /urssaf/simuler', 'GET /urssaf/historique', '/urssaf/alertes', '/urssaf/recapitulatif'],
      client:        ['GET /client/artisans', 'POST /client/notations', '/client/litiges', '/client/parrainage'],
      notifications: ['GET /notifications', 'PUT /notifications/:id/lire', 'POST /notifications/envoyer'],
      admin:         ['GET /admin/artisans-en-attente', 'PUT /admin/valider-artisan/:id', '/admin/suspendre/:id'],
    },
  });
});

module.exports = router;
