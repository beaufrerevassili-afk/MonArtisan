// ============================================================
//  artisanRoutes.js — Module Artisan
//  Conversations, Messagerie
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ============================================================
//  CONVERSATIONS
// ============================================================

// GET /artisan/conversations
router.get('/conversations', async (req, res) => {
  try {
    const artisanId = req.user.id;
    const result = await db.query(
      `SELECT
         m.id          AS "missionId",
         m.titre,
         m.categorie   AS specialite,
         u.nom         AS client,
         (SELECT texte FROM messages WHERE mission_id = m.id ORDER BY date DESC LIMIT 1) AS dernier_message,
         (SELECT date  FROM messages WHERE mission_id = m.id ORDER BY date DESC LIMIT 1) AS dernier_message_date
       FROM missions m
       JOIN users u ON u.id = m.client_id
       WHERE m.artisan_id = $1
         AND m.artisan_id IS NOT NULL
       ORDER BY dernier_message_date DESC NULLS LAST, m.cree_le DESC`,
      [artisanId]
    );

    const conversations = result.rows.map(r => ({
      missionId:          r.missionId,
      titre:              r.titre,
      specialite:         r.specialite,
      client:             r.client,
      dernierMessage:     r.dernier_message || '',
      dernierMessageDate: r.dernier_message_date || null,
    }));

    res.json({ conversations });
  } catch (err) {
    console.error('GET /artisan/conversations :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  MESSAGERIE
// ============================================================

// GET /artisan/messages/:missionId
router.get('/messages/:missionId', async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId);

    // Verify ownership
    const missionCheck = await db.query(
      'SELECT artisan_id FROM missions WHERE id = $1',
      [missionId]
    );
    if (!missionCheck.rows[0] || missionCheck.rows[0].artisan_id !== req.user.id) {
      return res.status(403).json({ erreur: 'Accès refusé' });
    }

    const result = await db.query(
      'SELECT * FROM messages WHERE mission_id = $1 ORDER BY date ASC',
      [missionId]
    );

    const messages = result.rows.map(m => ({
      id:        m.id,
      auteur:    m.auteur,
      nomAuteur: m.nom_auteur,
      texte:     m.texte,
      date:      m.date,
    }));

    res.json({ missionId, messages });
  } catch (err) {
    console.error('GET /artisan/messages/:missionId :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /artisan/messages/:missionId
router.post('/messages/:missionId', async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId);

    // Verify ownership
    const missionCheck = await db.query(
      'SELECT artisan_id FROM missions WHERE id = $1',
      [missionId]
    );
    if (!missionCheck.rows[0] || missionCheck.rows[0].artisan_id !== req.user.id) {
      return res.status(403).json({ erreur: 'Accès refusé' });
    }

    const { texte, nomAuteur } = req.body;
    if (!texte) return res.status(400).json({ erreur: 'texte requis' });

    const result = await db.query(
      `INSERT INTO messages (mission_id, auteur, nom_auteur, texte, date)
       VALUES ($1, 'artisan', $2, $3, NOW())
       RETURNING *`,
      [missionId, nomAuteur || 'Artisan', texte]
    );

    const m = result.rows[0];
    const msg = {
      id:        m.id,
      auteur:    m.auteur,
      nomAuteur: m.nom_auteur,
      texte:     m.texte,
      date:      m.date,
    };

    res.status(201).json({ message: 'Message envoyé', msg });
  } catch (err) {
    console.error('POST /artisan/messages/:missionId :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
