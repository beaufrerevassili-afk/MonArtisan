// ============================================================
//  notificationsRoutes.js — Système de notifications
//  Push, Email (SendGrid), SMS (Twilio)
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

const TYPES_NOTIFS = {
  NOUVEAU_DEVIS:       'nouveau_devis',
  MISSION_ACCEPTEE:    'mission_acceptee',
  MISSION_REFUSEE:     'mission_refusee',
  ARTISAN_EN_ROUTE:    'artisan_en_route',
  PAIEMENT_RECU:       'paiement_recu',
  HABILITATION_EXPIRE: 'habilitation_expire',
  NOUVEAU_LITIGE:      'nouveau_litige',
  FACTURE_EN_RETARD:   'facture_en_retard',
  COMPTE_VALIDE:       'compte_valide',
  COMPTE_SUSPENDU:     'compte_suspendu',
};

function getTitreParType(type) {
  const titres = {
    [TYPES_NOTIFS.NOUVEAU_DEVIS]:       'Nouveau devis reçu',
    [TYPES_NOTIFS.MISSION_ACCEPTEE]:    'Mission acceptée',
    [TYPES_NOTIFS.MISSION_REFUSEE]:     'Mission refusée',
    [TYPES_NOTIFS.ARTISAN_EN_ROUTE]:    'Votre artisan est en route',
    [TYPES_NOTIFS.PAIEMENT_RECU]:       'Paiement reçu',
    [TYPES_NOTIFS.HABILITATION_EXPIRE]: 'Habilitation bientôt expirée',
    [TYPES_NOTIFS.NOUVEAU_LITIGE]:      'Nouveau litige ouvert',
    [TYPES_NOTIFS.FACTURE_EN_RETARD]:   'Facture en retard',
    [TYPES_NOTIFS.COMPTE_VALIDE]:       'Compte validé',
    [TYPES_NOTIFS.COMPTE_SUSPENDU]:     'Compte suspendu',
  };
  return titres[type] || 'Notification';
}

function mapNotif(n) {
  return {
    id:      n.id,
    userId:  n.user_id,
    type:    n.type,
    titre:   n.titre,
    contenu: n.contenu,
    canal:   n.canal,
    lu:      n.lu,
    luLe:    n.lu_le,
    creeLe:  n.cree_le,
  };
}

// GET /notifications — Notifications de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { lu } = req.query;

    let sql    = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];

    if (lu !== undefined) { params.push(lu === 'true'); sql += ` AND lu = $${params.length}`; }

    sql += ' ORDER BY cree_le DESC';

    const result = await db.query(sql, params);
    const notifications = result.rows.map(mapNotif);
    const nonLues = notifications.filter(n => !n.lu).length;

    res.json({
      total: notifications.length,
      nonLues,
      notifications,
    });
  } catch (err) {
    console.error('GET /notifications :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /notifications/tout-lire — Marquer toutes comme lues (avant /:id/lire pour éviter le conflit de route)
router.put('/tout-lire', async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `UPDATE notifications SET lu = true, lu_le = NOW() WHERE lu = false AND user_id = $1`;
    const params = [userId];

    const result = await db.query(sql, params);
    const count = result.rowCount || 0;

    res.json({ message: `${count} notification(s) marquée(s) comme lue(s)` });
  } catch (err) {
    console.error('PUT /notifications/tout-lire :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /notifications/:id/lire — Marquer comme lue
router.put('/:id/lire', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE notifications SET lu = true, lu_le = NOW() WHERE id = $1 RETURNING *`,
      [parseInt(req.params.id)]
    );
    if (!result.rows.length) return res.status(404).json({ erreur: 'Notification introuvable' });

    res.json({ message: 'Notification lue', notification: mapNotif(result.rows[0]) });
  } catch (err) {
    console.error('PUT /notifications/:id/lire :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /notifications/envoyer — Envoyer une notification (usage interne)
router.post('/envoyer', async (req, res) => {
  try {
    if (!['patron', 'super_admin', 'fondateur'].includes(req.user.role)) {
      return res.status(403).json({ erreur: 'Non autorisé' });
    }
    const { userId, type, titre, contenu, canal } = req.body;
    if (!userId || !type || !contenu) {
      return res.status(400).json({ erreur: 'userId, type, contenu requis' });
    }

    const canalValue = canal || ['push'];
    const titreValue = titre || getTitreParType(type);

    const result = await db.query(
      `INSERT INTO notifications (user_id, type, titre, contenu, canal, lu, lu_le)
       VALUES ($1, $2, $3, $4, $5, false, NULL)
       RETURNING *`,
      [parseInt(userId), type, titreValue, contenu, JSON.stringify(canalValue)]
    );

    const notif = mapNotif(result.rows[0]);

    // Simulation envoi
    const envois = {};
    if (Array.isArray(notif.canal) && notif.canal.includes('push'))  envois.push  = 'envoyé';
    if (Array.isArray(notif.canal) && notif.canal.includes('email')) envois.email = 'envoyé via SendGrid';
    if (Array.isArray(notif.canal) && notif.canal.includes('sms'))   envois.sms   = 'envoyé via Twilio';

    res.status(201).json({ message: 'Notification envoyée', notification: notif, envois });
  } catch (err) {
    console.error('POST /notifications/envoyer :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /notifications/push-masse — Notification à plusieurs utilisateurs
router.post('/push-masse', async (req, res) => {
  try {
    if (!['patron', 'super_admin', 'fondateur'].includes(req.user.role)) {
      return res.status(403).json({ erreur: 'Non autorisé' });
    }
    const { userIds, type, titre, contenu } = req.body;
    if (!userIds || !Array.isArray(userIds) || !contenu) {
      return res.status(400).json({ erreur: 'userIds (tableau) et contenu requis' });
    }

    const titreValue = titre || 'Notification';
    const typeValue  = type  || 'info';

    // Insertion en lot
    const insertions = await Promise.all(
      userIds.map(uid =>
        db.query(
          `INSERT INTO notifications (user_id, type, titre, contenu, canal, lu, lu_le)
           VALUES ($1, $2, $3, $4, '["push"]', false, NULL)
           RETURNING *`,
          [parseInt(uid), typeValue, titreValue, contenu]
        )
      )
    );

    const created = insertions.map(r => mapNotif(r.rows[0]));

    res.status(201).json({
      message: `${created.length} notification(s) envoyée(s)`,
      notifications: created,
    });
  } catch (err) {
    console.error('POST /notifications/push-masse :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
