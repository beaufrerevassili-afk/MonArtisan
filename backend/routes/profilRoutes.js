// ============================================================
//  routes/profilRoutes.js — Profil utilisateur
// ============================================================

const express = require('express');
const db      = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { mapUser } = require('../utils/mappers');

const router = express.Router();

// PUT /users/profil
router.put('/profil', authenticateToken, async (req, res) => {
  try {
    const { nom, telephone, adresse, ville, metier, siret } = req.body;
    await db.query(
      `UPDATE users SET
        nom       = COALESCE($1, nom),
        telephone = COALESCE($2, telephone),
        adresse   = COALESCE($3, adresse),
        ville     = COALESCE($4, ville),
        metier    = COALESCE($5, metier),
        siret     = COALESCE($6, siret)
       WHERE id = $7`,
      [nom || null, telephone || null, adresse || null, ville || null, metier || null, siret || null, req.user.id]
    );
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Profil mis à jour', user: mapUser(rows[0]) });
  } catch (err) {
    console.error('Erreur PUT /users/profil :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
