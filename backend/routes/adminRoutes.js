// ============================================================
//  routes/adminRoutes.js — Administration (validation, suspension)
// ============================================================

const express = require('express');
const db      = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { mapUser } = require('../utils/mappers');

const router = express.Router();

// GET /admin/artisans-en-attente
router.get('/artisans-en-attente', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
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
router.put('/valider-artisan/:id', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT id FROM users WHERE id = $1', [parseInt(req.params.id)]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const { decision, motif } = req.body;
    if (!['valide', 'rejete'].includes(decision)) return res.status(400).json({ erreur: 'decision: valide ou rejete' });

    const { rows: updated } = await db.query(
      `UPDATE users
       SET verified = $1, statut_validation = $2, motif_rejet = $3, valide_le = NOW()
       WHERE id = $4
       RETURNING id, nom, email, role, verified, statut_validation, motif_rejet, valide_le`,
      [decision === 'valide', decision, motif || null, parseInt(req.params.id)]
    );

    res.json({ message: `Compte ${decision === 'valide' ? 'validé' : 'rejeté'}`, user: mapUser(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /admin/valider-artisan/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /admin/suspendre/:id
router.put('/suspendre/:id', authenticateToken, authorizeRole('super_admin'), async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT id, suspendu FROM users WHERE id = $1', [parseInt(req.params.id)]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Utilisateur introuvable' });

    const newSuspendu = !existing[0].suspendu;

    const { rows: updated } = await db.query(
      `UPDATE users
       SET suspendu = $1, suspendu_le = $2
       WHERE id = $3
       RETURNING id, nom, email, role, suspendu, suspendu_le`,
      [newSuspendu, newSuspendu ? new Date() : null, parseInt(req.params.id)]
    );

    res.json({ message: `Compte ${newSuspendu ? 'suspendu' : 'réactivé'}`, user: mapUser(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /admin/suspendre/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
