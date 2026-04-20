// ============================================================
//  routes/supportRoutes.js — Tickets de support
// ============================================================

const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// POST /support/ticket — Créer un ticket (public, pas besoin d'auth)
router.post('/ticket', async (req, res) => {
  try {
    const { email, nom, sujet, message } = req.body;
    if (!email || !message) return res.status(400).json({ erreur: 'Email et message requis' });

    // Chercher si l'utilisateur existe
    const userResult = await db.query('SELECT id, motif_suspension FROM users WHERE email = $1', [email]);
    const userId = userResult.rows[0]?.id || null;
    const motifSuspension = userResult.rows[0]?.motif_suspension || null;

    const { rows } = await db.query(
      'INSERT INTO support_tickets (user_id, email, nom, sujet, message, motif_suspension) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, email, nom || '', sujet || 'Demande de support', message, motifSuspension]
    );

    res.json({ message: 'Ticket créé. Nous reviendrons vers vous rapidement.', ticket: rows[0] });
  } catch (err) {
    console.error('Erreur POST /support/ticket :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /support/tickets — Liste tous les tickets (fondateur uniquement)
router.get('/tickets', authenticateToken, authorizeRole('fondateur', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM support_tickets ORDER BY cree_le DESC');
    res.json({ tickets: rows });
  } catch (err) {
    console.error('Erreur GET /support/tickets :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /support/tickets/:id/reply — Répondre à un ticket (fondateur)
router.put('/tickets/:id/reply', authenticateToken, authorizeRole('fondateur', 'super_admin'), async (req, res) => {
  try {
    const { reponse } = req.body;
    if (!reponse) return res.status(400).json({ erreur: 'Réponse requise' });

    const { rows: existing } = await db.query('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Ticket introuvable' });

    const reponses = existing[0].reponses || [];
    reponses.push({ auteur: 'Freample', message: reponse, date: new Date().toISOString() });

    const { rows } = await db.query(
      'UPDATE support_tickets SET reponses = $1, modifie_le = NOW() WHERE id = $2 RETURNING *',
      [JSON.stringify(reponses), req.params.id]
    );

    res.json({ message: 'Réponse envoyée', ticket: rows[0] });
  } catch (err) {
    console.error('Erreur PUT /support/tickets/:id/reply :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /support/tickets/:id/close — Fermer un ticket
router.put('/tickets/:id/close', authenticateToken, authorizeRole('fondateur', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      "UPDATE support_tickets SET statut = 'ferme', modifie_le = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Ticket introuvable' });
    res.json({ message: 'Ticket fermé', ticket: rows[0] });
  } catch (err) {
    console.error('Erreur PUT /support/tickets/:id/close :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /support/mes-tickets?email=xxx — Voir mes tickets (public, par email)
router.get('/mes-tickets', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ erreur: 'Email requis' });
    const { rows } = await db.query('SELECT * FROM support_tickets WHERE email = $1 ORDER BY cree_le DESC', [email]);
    res.json({ tickets: rows });
  } catch (err) {
    console.error('Erreur GET /support/mes-tickets :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /support/tickets/:id/user-reply — L'utilisateur répond à son ticket
router.put('/tickets/:id/user-reply', async (req, res) => {
  try {
    const { email, reponse } = req.body;
    if (!email || !reponse) return res.status(400).json({ erreur: 'Email et réponse requis' });

    // Vérifier que le ticket appartient à cet email
    const { rows: existing } = await db.query('SELECT * FROM support_tickets WHERE id = $1 AND email = $2', [req.params.id, email]);
    if (!existing[0]) return res.status(404).json({ erreur: 'Ticket introuvable' });

    const reponses = existing[0].reponses || [];
    reponses.push({ auteur: existing[0].nom || email, message: reponse, date: new Date().toISOString() });

    const { rows } = await db.query(
      "UPDATE support_tickets SET reponses = $1, modifie_le = NOW(), statut = 'ouvert' WHERE id = $2 RETURNING *",
      [JSON.stringify(reponses), req.params.id]
    );

    res.json({ message: 'Réponse envoyée', ticket: rows[0] });
  } catch (err) {
    console.error('Erreur PUT /support/tickets/:id/user-reply :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
