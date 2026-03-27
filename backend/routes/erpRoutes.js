// routes/erpRoutes.js
const express = require('express');
const router = express.Router();
const { authorizeRole } = require('../middleware/authMiddleware');

// Dashboard pour Client
router.get('/dashboard/client', authorizeRole('Client'), (req, res) => {
  res.json({ message: "Bienvenue Client ! Voici vos missions et artisans disponibles." });
});

// Dashboard pour Patron
router.get('/dashboard/patron', authorizeRole('Patron'), (req, res) => {
  res.json({ message: "Bienvenue Patron ! Voici votre tableau de bord financier et missions." });
});

// Dashboard pour Artisan
router.get('/dashboard/artisan', authorizeRole('Artisan'), (req, res) => {
  res.json({ message: "Bienvenue Artisan ! Voici vos missions assignées et documents." });
});

// Dashboard pour Super Admin
router.get('/dashboard/admin', authorizeRole('Super Admin'), (req, res) => {
  res.json({ message: "Bienvenue Admin ! Voici la gestion complète de la plateforme." });
});

module.exports = router;