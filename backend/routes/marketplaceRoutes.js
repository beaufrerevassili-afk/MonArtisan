// ============================================================
//  marketplaceRoutes.js — Messagerie projet + Devis versionné
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { notify } = require('../utils/notify');

// ══════════════════════════════════════
//  MESSAGERIE PAR PROJET
// ══════════════════════════════════════

// GET /marketplace/projets/:id/messages — Conversation d'un projet
router.get('/projets/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM projet_messages WHERE projet_id = $1 ORDER BY cree_le ASC',
      [req.params.id]
    );
    res.json({ messages: rows });
  } catch (err) {
    console.error('GET messages:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /marketplace/projets/:id/messages — Envoyer un message
router.post('/projets/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ erreur: 'Message requis' });

    const { rows } = await db.query(
      'INSERT INTO projet_messages (projet_id, auteur_id, auteur_nom, auteur_role, message, type) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.params.id, req.user.id, req.user.nom, req.user.role, message, type || 'message']
    );
    res.status(201).json({ message: rows[0] });
  } catch (err) {
    console.error('POST message:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ══════════════════════════════════════
//  DEVIS VERSIONNÉ
// ══════════════════════════════════════

// GET /marketplace/projets/:id/devis — Tous les devis d'un projet (toutes versions)
router.get('/projets/:id/devis', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT d.*, u.nom AS artisan_nom FROM projet_devis d LEFT JOIN users u ON u.id = d.artisan_id WHERE d.projet_id = $1 ORDER BY d.version DESC',
      [req.params.id]
    );
    res.json({ devis: rows });
  } catch (err) {
    console.error('GET devis:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /marketplace/projets/:id/devis — Envoyer un devis (V1 ou nouvelle version)
router.post('/projets/:id/devis', authenticateToken, async (req, res) => {
  try {
    const { lignes, montantHT, montantTVA, montantTTC, conditions, offreId } = req.body;
    if (!montantTTC) return res.status(400).json({ erreur: 'Montant TTC requis' });

    // Trouver la dernière version pour ce projet + artisan
    const last = await db.query(
      'SELECT MAX(version) as max_v FROM projet_devis WHERE projet_id = $1 AND artisan_id = $2',
      [req.params.id, req.user.id]
    );
    const version = (last.rows[0]?.max_v || 0) + 1;
    const numero = `DEV-${new Date().getFullYear()}-${String(req.params.id).padStart(3, '0')}-V${version}`;

    const { rows } = await db.query(
      `INSERT INTO projet_devis (projet_id, offre_id, artisan_id, version, numero, lignes, montant_ht, montant_tva, montant_ttc, conditions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.params.id, offreId || null, req.user.id, version, numero,
       JSON.stringify(lignes || []), montantHT || 0, montantTVA || 0, montantTTC, conditions || null]
    );

    // Ajouter un message système dans la conversation
    await db.query(
      "INSERT INTO projet_messages (projet_id, auteur_id, auteur_nom, auteur_role, message, type, metadata) VALUES ($1,$2,$3,$4,$5,'devis',$6)",
      [req.params.id, req.user.id, req.user.nom, req.user.role,
       `Devis ${numero} envoyé — ${montantTTC}€ TTC (Version ${version})`,
       JSON.stringify({ devisId: rows[0].id, version, montantTTC })]
    );

    // Notifier le client
    const projet = await db.query('SELECT client_id FROM projets_clients WHERE id = $1', [req.params.id]);
    if (projet.rows[0]?.client_id) {
      notify(projet.rows[0].client_id, 'devis', 'Nouveau devis reçu', 'Un artisan vous a envoyé un devis', '/client/dashboard').catch(() => {});
    }

    res.status(201).json({ devis: rows[0], message: `Devis V${version} envoyé` });
  } catch (err) {
    console.error('POST devis:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /marketplace/devis/:id/accepter — Client accepte un devis
router.put('/devis/:id/accepter', authenticateToken, async (req, res) => {
  try {
    // Marquer le devis comme accepté
    const { rows: devisRows } = await db.query(
      "UPDATE projet_devis SET statut = 'accepte' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!devisRows[0]) return res.status(404).json({ erreur: 'Devis introuvable' });

    const devis = devisRows[0];

    // Passer le projet en 'en_cours' et assigner l'artisan
    const artisan = await db.query('SELECT nom FROM users WHERE id = $1', [devis.artisan_id]);
    await db.query(
      "UPDATE projets_clients SET statut = 'en_cours', artisan_id = $1, artisan_nom = $2 WHERE id = $3",
      [devis.artisan_id, artisan.rows[0]?.nom || '', devis.projet_id]
    );

    // Refuser les autres offres
    await db.query(
      "UPDATE projet_offres SET statut = 'refusee' WHERE projet_id = $1 AND artisan_id != $2",
      [devis.projet_id, devis.artisan_id]
    );
    await db.query(
      "UPDATE projet_offres SET statut = 'acceptee' WHERE projet_id = $1 AND artisan_id = $2",
      [devis.projet_id, devis.artisan_id]
    );

    // Créer le chantier automatiquement
    const projet = await db.query('SELECT * FROM projets_clients WHERE id = $1', [devis.projet_id]);
    if (projet.rows[0]) {
      const p = projet.rows[0];
      await db.query(
        `INSERT INTO chantiers (nom, client, adresse, chef, statut, avancement, budget_prevu, date_debut, equipe, patron_id, description)
         VALUES ($1,$2,$3,$4,'en_cours',0,$5,NOW(),'[]',$6,$7)`,
        [`${p.metier} — ${p.titre}`, p.client_nom || '', p.ville || '', artisan.rows[0]?.nom || '',
         devis.montant_ttc, devis.artisan_id, p.description || '']
      );
    }

    // Message système
    await db.query(
      "INSERT INTO projet_messages (projet_id, auteur_id, auteur_nom, auteur_role, message, type) VALUES ($1,$2,$3,$4,$5,'systeme')",
      [devis.projet_id, req.user.id, req.user.nom, req.user.role,
       `Devis ${devis.numero} accepté — le chantier est créé ! Montant : ${devis.montant_ttc}€ TTC`]
    );

    // Notifier le patron/artisan
    notify(devis.artisan_id, 'devis', 'Devis accepté !', 'Le client a accepté votre devis', '/patron/suivi-projets').catch(() => {});

    res.json({ message: 'Devis accepté — chantier créé', devis: devisRows[0] });
  } catch (err) {
    console.error('PUT devis accepter:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /marketplace/devis/:id/contester — Client conteste un devis
router.put('/devis/:id/contester', authenticateToken, async (req, res) => {
  try {
    const { commentaire } = req.body;
    const { rows } = await db.query(
      "UPDATE projet_devis SET statut = 'conteste' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Devis introuvable' });

    // Message système
    await db.query(
      "INSERT INTO projet_messages (projet_id, auteur_id, auteur_nom, auteur_role, message, type) VALUES ($1,$2,$3,$4,$5,'systeme')",
      [rows[0].projet_id, req.user.id, req.user.nom, req.user.role,
       `Devis ${rows[0].numero} contesté${commentaire ? ' : ' + commentaire : ''}`]
    );

    res.json({ message: 'Devis contesté — l\'artisan peut envoyer une nouvelle version', devis: rows[0] });
  } catch (err) {
    console.error('PUT devis contester:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ══════════════════════════════════════
//  SUIVI PATRON — Mes projets en cours de négociation
// ══════════════════════════════════════

// GET /marketplace/mes-suivis — Projets où le patron a fait une offre
router.get('/mes-suivis', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT p.*, u.nom AS client_nom,
        o.prix_propose, o.statut AS offre_statut, o.created_at AS offre_date,
        (SELECT COUNT(*) FROM projet_messages pm WHERE pm.projet_id = p.id) AS nb_messages,
        (SELECT COUNT(*) FROM projet_devis pd WHERE pd.projet_id = p.id AND pd.artisan_id = $1) AS nb_devis,
        (SELECT MAX(pd.version) FROM projet_devis pd WHERE pd.projet_id = p.id AND pd.artisan_id = $1) AS derniere_version
      FROM projets_clients p
      JOIN projet_offres o ON o.projet_id = p.id AND o.artisan_id = $1
      LEFT JOIN users u ON u.id = p.client_id
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json({ suivis: rows });
  } catch (err) {
    console.error('GET mes-suivis:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /marketplace/projets/:id/refuser — Patron se retire du projet
router.put('/projets/:id/refuser', authenticateToken, async (req, res) => {
  try {
    await db.query("UPDATE projet_offres SET statut = 'retiree' WHERE projet_id = $1 AND artisan_id = $2", [req.params.id, req.user.id]);

    await db.query(
      "INSERT INTO projet_messages (projet_id, auteur_id, auteur_nom, auteur_role, message, type) VALUES ($1,$2,$3,$4,$5,'systeme')",
      [req.params.id, req.user.id, req.user.nom, req.user.role, `${req.user.nom} s'est retiré du projet.`]
    );

    res.json({ message: 'Vous vous êtes retiré du projet' });
  } catch (err) {
    console.error('PUT refuser:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
