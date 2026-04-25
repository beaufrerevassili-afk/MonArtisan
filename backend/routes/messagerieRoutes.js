const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { notify } = require('../utils/notify');
const router = express.Router();

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id VARCHAR(100) NOT NULL,
      sender_id INTEGER NOT NULL,
      sender_nom VARCHAR(255),
      receiver_id INTEGER NOT NULL,
      contenu TEXT NOT NULL,
      lu BOOLEAN DEFAULT FALSE,
      contexte VARCHAR(50),
      contexte_id INTEGER,
      contexte_titre VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query('CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at)').catch(()=>{});
  await db.query('CREATE INDEX IF NOT EXISTS idx_msg_receiver ON messages(receiver_id, lu)').catch(()=>{});
}
ensureTable().catch(e => console.error('messages table:', e.message));

function convId(a, b, ctx, ctxId) {
  const sorted = [a, b].sort((x, y) => x - y);
  return `${sorted[0]}_${sorted[1]}_${ctx || 'direct'}_${ctxId || 0}`;
}

// GET /messagerie/conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    // Ensure table exists on first call
    await ensureTable();
    const userId = req.user.id;
    const { rows } = await db.query(`
      SELECT DISTINCT ON (m.conversation_id)
        m.conversation_id, m.contenu as dernier_message, m.created_at as dernier_date,
        m.sender_id, m.sender_nom, m.receiver_id, m.contexte, m.contexte_id, m.contexte_titre,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = m.conversation_id AND m2.receiver_id = $1 AND m2.lu = FALSE) as non_lus
      FROM messages m
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY m.conversation_id, m.created_at DESC
    `, [userId]);

    const convs = await Promise.all(rows.map(async (r) => {
      const otherId = r.sender_id === userId ? r.receiver_id : r.sender_id;
      const { rows: u } = await db.query('SELECT nom FROM users WHERE id = $1', [otherId]);
      return {
        conversationId: r.conversation_id, autreId: otherId,
        autreNom: u[0]?.nom || 'Utilisateur', autrePhoto: null,
        dernierMessage: r.dernier_message, dernierDate: r.dernier_date,
        nonLus: parseInt(r.non_lus) || 0, contexte: r.contexte,
        contexteId: r.contexte_id, contexteTitre: r.contexte_titre,
      };
    }));
    convs.sort((a, b) => new Date(b.dernierDate) - new Date(a.dernierDate));
    res.json({ conversations: convs, totalNonLus: convs.reduce((s, c) => s + c.nonLus, 0) });
  } catch (err) {
    console.error('GET /messagerie/conversations:', err.message, err.stack);
    res.status(500).json({ erreur: 'Erreur serveur: ' + err.message });
  }
});

// GET /messagerie/conversation/:convId
router.get('/conversation/:convId', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 AND (sender_id = $2 OR receiver_id = $2) ORDER BY created_at ASC',
      [req.params.convId, req.user.id]
    );
    await db.query('UPDATE messages SET lu = TRUE WHERE conversation_id = $1 AND receiver_id = $2 AND lu = FALSE', [req.params.convId, req.user.id]);
    res.json({ messages: rows.map(m => ({ id: m.id, senderId: m.sender_id, senderNom: m.sender_nom, receiverId: m.receiver_id, contenu: m.contenu, lu: m.lu, createdAt: m.created_at })) });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// POST /messagerie/envoyer
router.post('/envoyer', authenticateToken, async (req, res) => {
  try {
    const { receiverId, contenu, contexte, contexteId, contexteTitre } = req.body;
    if (!receiverId || !contenu?.trim()) return res.status(400).json({ erreur: 'Destinataire et message requis' });
    const conversationId = convId(req.user.id, receiverId, contexte, contexteId);
    const { rows } = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, sender_nom, receiver_id, contenu, contexte, contexte_id, contexte_titre) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [conversationId, req.user.id, req.user.nom || 'Utilisateur', receiverId, contenu.trim(), contexte || 'direct', contexteId || null, contexteTitre || null]
    );
    await notify(receiverId, 'message', 'Nouveau message', `${req.user.nom || 'Quelqu\'un'} vous a envoyé un message`, '/messagerie').catch(() => {});
    res.status(201).json({ message: rows[0] });
  } catch (err) {
    console.error('POST /messagerie/envoyer:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
