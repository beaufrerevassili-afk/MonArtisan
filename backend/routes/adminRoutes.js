// ============================================================
//  routes/adminRoutes.js — Administration (validation, suspension, stats)
// ============================================================

const express = require('express');
const db      = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { mapUser } = require('../utils/mappers');

const router = express.Router();
const ADMIN_ROLES = ['super_admin', 'fondateur'];

// GET /admin/dashboard-stats — Stats globales pour le fondateur
router.get('/dashboard-stats', authenticateToken, authorizeRole(...ADMIN_ROLES), async (req, res) => {
  try {
    // Nombre d'utilisateurs par rôle
    const usersResult = await db.query(`
      SELECT role, COUNT(*) as count,
             COUNT(*) FILTER (WHERE suspendu = false OR suspendu IS NULL) as actifs,
             COUNT(*) FILTER (WHERE suspendu = true) as suspendus
      FROM users GROUP BY role ORDER BY count DESC
    `);

    // Total utilisateurs
    const totalResult = await db.query('SELECT COUNT(*) as total FROM users');

    // Inscriptions ce mois
    const moisResult = await db.query(`
      SELECT COUNT(*) as count FROM users
      WHERE cree_le >= date_trunc('month', CURRENT_DATE)
    `);

    // Inscriptions cette semaine
    const semaineResult = await db.query(`
      SELECT COUNT(*) as count FROM users
      WHERE cree_le >= date_trunc('week', CURRENT_DATE)
    `);

    // Inscriptions par jour (30 derniers jours)
    const inscriptionsParJour = await db.query(`
      SELECT DATE(cree_le) as jour, COUNT(*) as count
      FROM users
      WHERE cree_le >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(cree_le) ORDER BY jour
    `);

    // Derniers inscrits (20)
    const derniersInscrits = await db.query(`
      SELECT id, nom, email, role, telephone, ville, metier, suspendu, cree_le
      FROM users ORDER BY cree_le DESC LIMIT 20
    `);

    // Missions/projets
    const missionsResult = await db.query('SELECT COUNT(*) as total FROM missions');

    // Devis
    const devisResult = await db.query('SELECT COUNT(*) as total, SUM(montant_ttc) as ca FROM devis');

    // Chantiers
    const chantiersResult = await db.query(`
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE statut = 'en_cours') as en_cours,
             COUNT(*) FILTER (WHERE statut = 'terminee' OR statut = 'termine') as termines
      FROM chantiers
    `);

    // Messages
    const messagesResult = await db.query('SELECT COUNT(*) as total FROM messages');

    res.json({
      users: {
        total: parseInt(totalResult.rows[0].total),
        parRole: usersResult.rows.map(r => ({ role: r.role, total: parseInt(r.count), actifs: parseInt(r.actifs), suspendus: parseInt(r.suspendus) })),
        inscriptionsMois: parseInt(moisResult.rows[0].count),
        inscriptionsSemaine: parseInt(semaineResult.rows[0].count),
        inscriptionsParJour: inscriptionsParJour.rows.map(r => ({ jour: r.jour, count: parseInt(r.count) })),
        derniers: derniersInscrits.rows,
      },
      missions: { total: parseInt(missionsResult.rows[0].total) },
      devis: { total: parseInt(devisResult.rows[0].total), ca: parseFloat(devisResult.rows[0].ca || 0) },
      chantiers: chantiersResult.rows[0],
      messages: { total: parseInt(messagesResult.rows[0].total) },
    });
  } catch (err) {
    console.error('Erreur GET /admin/dashboard-stats :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /admin/users — Liste complète des utilisateurs
router.get('/users', authenticateToken, authorizeRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, nom, email, role, telephone, ville, metier, siret, verified, suspendu, cree_le
      FROM users ORDER BY cree_le DESC
    `);
    res.json({ total: rows.length, users: rows });
  } catch (err) {
    console.error('Erreur GET /admin/users :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /admin/toggle-suspend/:id — Suspendre/réactiver un compte
router.put('/toggle-suspend/:id', authenticateToken, authorizeRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT id, suspendu FROM users WHERE id = $1', [parseInt(req.params.id)]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const newSuspendu = !existing[0].suspendu;
    const { rows: updated } = await db.query(
      'UPDATE users SET suspendu = $1, suspendu_le = $2 WHERE id = $3 RETURNING id, nom, email, role, suspendu',
      [newSuspendu, newSuspendu ? new Date() : null, parseInt(req.params.id)]
    );

    res.json({ message: `Compte ${newSuspendu ? 'suspendu' : 'réactivé'}`, user: updated[0] });
  } catch (err) {
    console.error('Erreur PUT /admin/toggle-suspend/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// DELETE /admin/users/:id — Supprimer un compte
router.delete('/users/:id', authenticateToken, authorizeRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.id) return res.status(400).json({ erreur: 'Vous ne pouvez pas supprimer votre propre compte' });

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Compte supprimé' });
  } catch (err) {
    console.error('Erreur DELETE /admin/users/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /admin/artisans-en-attente
router.get('/artisans-en-attente', authenticateToken, authorizeRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, nom, email, role, verified, statut_verification, statut_validation, motif_rejet, telephone, metier, siret, documents, documents_soumis, cree_le FROM users WHERE (role = 'artisan' OR role = 'patron') AND verified = false"
    );
    res.json({ total: rows.length, artisans: rows.map(mapUser) });
  } catch (err) {
    console.error('Erreur GET /admin/artisans-en-attente :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /admin/valider-artisan/:id
router.put('/valider-artisan/:id', authenticateToken, authorizeRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT id FROM users WHERE id = $1', [parseInt(req.params.id)]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const { decision, motif } = req.body;
    if (!['valide', 'rejete'].includes(decision)) return res.status(400).json({ erreur: 'decision: valide ou rejete' });

    const { rows: updated } = await db.query(
      `UPDATE users SET verified = $1, statut_validation = $2, motif_rejet = $3, valide_le = NOW() WHERE id = $4
       RETURNING id, nom, email, role, verified, statut_validation, motif_rejet, valide_le`,
      [decision === 'valide', decision, motif || null, parseInt(req.params.id)]
    );

    res.json({ message: `Compte ${decision === 'valide' ? 'validé' : 'rejeté'}`, user: mapUser(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /admin/valider-artisan/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /admin/suspendre/:id (legacy)
router.put('/suspendre/:id', authenticateToken, authorizeRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT id, suspendu FROM users WHERE id = $1', [parseInt(req.params.id)]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const newSuspendu = !existing[0].suspendu;
    const { rows: updated } = await db.query(
      'UPDATE users SET suspendu = $1, suspendu_le = $2 WHERE id = $3 RETURNING id, nom, email, role, suspendu, suspendu_le',
      [newSuspendu, newSuspendu ? new Date() : null, parseInt(req.params.id)]
    );

    res.json({ message: `Compte ${newSuspendu ? 'suspendu' : 'réactivé'}`, user: mapUser(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /admin/suspendre/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
