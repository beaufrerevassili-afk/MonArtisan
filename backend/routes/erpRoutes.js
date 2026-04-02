// ============================================================
//  routes/erpRoutes.js — ERP rapport & statistiques
//  Monté sur /erp → /erp/rapport, /erp/stats
// ============================================================

const express = require('express');
const db      = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// GET /erp/rapport
router.get('/rapport', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows: missionRows } = await db.query('SELECT statut FROM missions');
    const { rows: facAgg } = await db.query(`
      SELECT
        COUNT(*)                                                          AS emises,
        COUNT(*) FILTER (WHERE statut = 'payée')                         AS payees,
        COUNT(*) FILTER (WHERE statut = 'en_attente')                    AS en_attente,
        COALESCE(SUM(montant_ttc) FILTER (WHERE statut = 'en_attente'),0) AS montant_en_attente,
        COALESCE(SUM(montant_ttc) FILTER (WHERE statut = 'payée'),0)     AS ca_total
      FROM factures
    `);
    const { rows: depAgg } = await db.query("SELECT COALESCE(SUM(montant),0) AS total FROM depenses WHERE statut = 'validée'");
    const { rows: docRows } = await db.query(`
      SELECT id, numero AS nom, 'devis' AS type, cree_le AS date, montant_ttc AS montant FROM devis
      UNION ALL
      SELECT id, numero AS nom, 'facture' AS type, cree_le AS date, montant_ttc AS montant FROM factures
      ORDER BY date DESC
      LIMIT 10
    `);

    const facRow  = facAgg[0] || {};
    const caTotal = parseFloat(facRow.ca_total) || 0;
    const charges = parseFloat(depAgg[0]?.total) || 0;

    res.json({
      rapport: 'ERP Complet',
      date_rapport: new Date().toISOString(),
      finances: {
        chiffreAffaireAnnuel: caTotal,
        chargesAnnuelles:     charges,
        beneficeNet:          caTotal - charges,
        factures: {
          emises:             parseInt(facRow.emises) || 0,
          payees:             parseInt(facRow.payees) || 0,
          en_attente:         parseInt(facRow.en_attente) || 0,
          montant_en_attente: parseFloat(facRow.montant_en_attente) || 0,
        },
      },
      missions: {
        total: missionRows.length,
        par_statut: {
          en_attente: missionRows.filter(m => m.statut === 'en_attente').length,
          assignees:  missionRows.filter(m => m.statut === 'assignee').length,
          en_cours:   missionRows.filter(m => m.statut === 'en_cours').length,
          terminees:  missionRows.filter(m => m.statut === 'terminee').length,
        },
      },
      documents: { total: docRows.length, liste: docRows },
    });
  } catch (err) {
    console.error('Erreur GET /erp/rapport :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /erp/stats
router.get('/stats', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows: mStats } = await db.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE statut IN ('assignee','en_cours')) AS actives FROM missions");
    const { rows: uStats } = await db.query("SELECT COUNT(*) FILTER (WHERE role='artisan') AS artisans, COUNT(*) FILTER (WHERE role='client') AS clients FROM users");
    const { rows: facAgg } = await db.query("SELECT COALESCE(SUM(montant_ttc) FILTER (WHERE statut='payée'),0) AS ca FROM factures");

    res.json({
      missions:   { total: parseInt(mStats[0].total) || 0, actives: parseInt(mStats[0].actives) || 0 },
      artisans:   { total: parseInt(uStats[0].artisans) || 0 },
      clients:    { total: parseInt(uStats[0].clients) || 0 },
      ca_annuel:  parseFloat(facAgg[0].ca) || 0,
      tresorerie: null,
    });
  } catch (err) {
    console.error('Erreur GET /erp/stats :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
