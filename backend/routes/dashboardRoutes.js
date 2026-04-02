// ============================================================
//  routes/dashboardRoutes.js — Dashboards par rôle + profil
// ============================================================

const express = require('express');
const db      = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { mapUser, mapMission } = require('../utils/mappers');

const router = express.Router();

// GET /dashboard/client
router.get('/client', authenticateToken, authorizeRole('client'), async (req, res) => {
  try {
    const { rows: missions } = await db.query('SELECT * FROM missions WHERE client_id = $1', [req.user.id]);
    const mapped = missions.map(mapMission);
    res.json({
      dashboard: 'Client',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      resume: {
        missions_total:      mapped.length,
        missions_en_attente: mapped.filter(m => m.statut === 'en_attente').length,
        missions_en_cours:   mapped.filter(m => m.statut === 'en_cours').length,
        missions_terminees:  mapped.filter(m => m.statut === 'terminee').length,
        budget_total:        mapped.reduce((s, m) => s + (m.budget || 0), 0),
      },
      mes_missions: mapped,
    });
  } catch (err) {
    console.error('Erreur /dashboard/client :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /dashboard/artisan
router.get('/artisan', authenticateToken, authorizeRole('artisan'), async (req, res) => {
  try {
    const { rows: missions } = await db.query('SELECT * FROM missions WHERE artisan_id = $1', [req.user.id]);
    const mapped = missions.map(mapMission);
    res.json({
      dashboard: 'Artisan',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      resume: {
        missions_assignees: mapped.length,
        missions_en_cours:  mapped.filter(m => m.statut === 'en_cours').length,
        missions_terminees: mapped.filter(m => m.statut === 'terminee').length,
        missions_urgentes:  mapped.filter(m => m.priorite === 'urgente').length,
        revenus_missions:   mapped.filter(m => m.statut === 'terminee').reduce((s, m) => s + (m.budget || 0), 0),
      },
      mes_missions: mapped,
    });
  } catch (err) {
    console.error('Erreur /dashboard/artisan :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /dashboard/patron
router.get('/patron', authenticateToken, authorizeRole('patron'), async (req, res) => {
  try {
    const { rows: artisans }    = await db.query("SELECT id, nom, email, role FROM users WHERE role='artisan'");
    const { rows: clients }     = await db.query("SELECT id, nom, email FROM users WHERE role='client'");
    const { rows: mStats }      = await db.query('SELECT statut, priorite, budget FROM missions');
    const { rows: facStats }    = await db.query(
      "SELECT COUNT(*) FILTER (WHERE statut='en_attente') AS en_attente, COALESCE(SUM(montant_ttc) FILTER (WHERE statut='en_attente'),0) AS montant_en_attente FROM factures"
    );
    const { rows: allMissions } = await db.query('SELECT * FROM missions');

    const artisanIdsActifs = new Set(
      allMissions.filter(m => ['assignee', 'en_cours'].includes(m.statut)).map(m => m.artisan_id).filter(Boolean)
    );
    const budgetTotal = mStats.reduce((s, m) => s + (m.budget ? parseFloat(m.budget) : 0), 0);
    const facRow = facStats[0] || {};

    res.json({
      dashboard: 'Patron',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      resume_missions: {
        total:        mStats.length,
        en_attente:   mStats.filter(m => m.statut === 'en_attente').length,
        assignees:    mStats.filter(m => m.statut === 'assignee').length,
        en_cours:     mStats.filter(m => m.statut === 'en_cours').length,
        terminees:    mStats.filter(m => m.statut === 'terminee').length,
        urgentes:     mStats.filter(m => m.priorite === 'urgente').length,
        budget_total: budgetTotal,
      },
      equipe: {
        artisans_total:  artisans.length,
        clients_total:   clients.length,
        artisans_actifs: artisanIdsActifs.size,
      },
      finances: {
        chiffre_affaire_annuel: null,
        benefice_net:           null,
        tresorerie:             null,
        factures_en_attente:    parseInt(facRow.en_attente) || 0,
      },
      artisans,
      toutes_missions: allMissions.map(mapMission),
    });
  } catch (err) {
    console.error('Erreur /dashboard/patron :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /dashboard/admin
router.get('/admin', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
  try {
    const { rows: allUsers }    = await db.query('SELECT id, nom, email, role, verified, statut_verification, statut_validation, motif_rejet, suspendu, cree_le FROM users');
    const { rows: allMissions } = await db.query('SELECT * FROM missions');
    const { rows: recentDocs }  = await db.query(
      "SELECT id, numero AS nom, 'devis' AS type, cree_le AS date, montant_ttc AS montant FROM devis UNION ALL SELECT id, numero AS nom, 'facture' AS type, cree_le AS date, montant_ttc AS montant FROM factures ORDER BY date DESC LIMIT 5"
    );

    const mappedUsers    = allUsers.map(mapUser);
    const mappedMissions = allMissions.map(mapMission);

    res.json({
      dashboard: 'Super Admin',
      utilisateur: { nom: req.user.nom, email: req.user.email },
      statistiques_globales: {
        utilisateurs_total: allUsers.length,
        par_role: {
          clients:      allUsers.filter(u => u.role === 'client').length,
          artisans:     allUsers.filter(u => u.role === 'artisan').length,
          patrons:      allUsers.filter(u => u.role === 'patron').length,
          super_admins: allUsers.filter(u => u.role === 'super_admin').length,
        },
        missions_total:   mappedMissions.length,
        missions_actives: mappedMissions.filter(m => ['assignee', 'en_cours'].includes(m.statut)).length,
      },
      erp: { documents_recents: recentDocs },
      tous_utilisateurs: mappedUsers,
      toutes_missions:   mappedMissions,
    });
  } catch (err) {
    console.error('Erreur /dashboard/admin :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
