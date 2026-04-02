// ============================================================
//  routes/missionsRoutes.js — CRUD Missions
// ============================================================

const express = require('express');
const db      = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { mapMission } = require('../utils/mappers');

const router = express.Router();

// GET /missions
router.get('/', authenticateToken, async (req, res) => {
  try {
    let baseQuery = 'SELECT * FROM missions WHERE 1=1';
    const params  = [];
    let idx = 1;

    if (req.user.role === 'client') {
      baseQuery += ` AND client_id = $${idx++}`;
      params.push(req.user.id);
    } else if (req.user.role === 'artisan') {
      baseQuery += ` AND artisan_id = $${idx++}`;
      params.push(req.user.id);
    } else if (!['patron', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ erreur: 'Accès refusé' });
    }

    const { statut, priorite, artisanId, clientId } = req.query;
    if (statut)    { baseQuery += ` AND statut = $${idx++}`;     params.push(statut); }
    if (priorite)  { baseQuery += ` AND priorite = $${idx++}`;   params.push(priorite); }
    if (artisanId) { baseQuery += ` AND artisan_id = $${idx++}`; params.push(parseInt(artisanId)); }
    if (clientId)  { baseQuery += ` AND client_id = $${idx++}`;  params.push(parseInt(clientId)); }

    const { rows } = await db.query(baseQuery, params);
    res.json({ total: rows.length, missions: rows.map(mapMission) });
  } catch (err) {
    console.error('Erreur GET /missions :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /missions/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    if (req.user.role === 'client'  && mission.clientId  !== req.user.id) return res.status(403).json({ erreur: 'Accès refusé' });
    if (req.user.role === 'artisan' && mission.artisanId !== req.user.id) return res.status(403).json({ erreur: 'Accès refusé' });

    let client  = null;
    let artisan = null;
    if (mission.clientId) {
      const { rows: cr } = await db.query('SELECT id, nom, email, role FROM users WHERE id = $1', [mission.clientId]);
      client = cr[0] || null;
    }
    if (mission.artisanId) {
      const { rows: ar } = await db.query('SELECT id, nom, email, role, metier FROM users WHERE id = $1', [mission.artisanId]);
      artisan = ar[0] || null;
    }

    res.json({ ...mission, client, artisan });
  } catch (err) {
    console.error('Erreur GET /missions/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /missions
router.post('/', authenticateToken, authorizeRole('client', 'patron', 'super_admin'), async (req, res) => {
  try {
    const { titre, description, budget, priorite, dateDebut, dateFin, clientId, categorie, urgence, photos } = req.body;
    if (!titre || !description || !budget) return res.status(400).json({ erreur: 'titre, description, budget requis' });

    let cId = req.user.id;
    if (['patron', 'super_admin'].includes(req.user.role) && clientId) {
      const { rows: cr } = await db.query("SELECT id FROM users WHERE id = $1 AND role = 'client'", [parseInt(clientId)]);
      if (!cr[0]) return res.status(400).json({ erreur: `Aucun client trouvé avec l'id ${clientId}` });
      cId = parseInt(clientId);
    }

    const prioritesValides = ['basse', 'normale', 'haute', 'urgente'];
    const prioriteValide   = prioritesValides.includes(priorite) ? priorite : 'normale';

    const { rows: inserted } = await db.query(
      `INSERT INTO missions (titre, description, categorie, urgence, photos, client_id, artisan_id, statut, priorite, date_debut, date_fin, budget)
       VALUES ($1,$2,$3,$4,$5,$6,NULL,'en_attente',$7,$8,$9,$10)
       RETURNING *`,
      [
        titre, description,
        categorie || 'Autres',
        urgence || 'cette_semaine',
        JSON.stringify(photos || []),
        cId,
        prioriteValide,
        dateDebut || null,
        dateFin   || null,
        parseFloat(budget),
      ]
    );

    res.status(201).json({ message: 'Mission créée', mission: mapMission(inserted[0]) });
  } catch (err) {
    console.error('Erreur POST /missions :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /missions/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    const isPatronAdmin = ['patron', 'super_admin'].includes(req.user.role);
    const isOwner = req.user.role === 'client' && mission.clientId === req.user.id;
    if (!isPatronAdmin && !isOwner) return res.status(403).json({ erreur: 'Accès refusé' });
    if (isOwner && mission.statut !== 'en_attente') return res.status(400).json({ erreur: 'Modification impossible dans ce statut' });

    const fields  = [];
    const values  = [];
    let   idx     = 1;

    const mapping = {
      titre:       'titre',
      description: 'description',
      budget:      'budget',
      priorite:    'priorite',
      dateDebut:   'date_debut',
      dateFin:     'date_fin',
    };

    for (const [jsonKey, dbCol] of Object.entries(mapping)) {
      if (req.body[jsonKey] !== undefined) {
        fields.push(`${dbCol} = $${idx++}`);
        values.push(jsonKey === 'budget' ? parseFloat(req.body[jsonKey]) : req.body[jsonKey]);
      }
    }

    if (fields.length === 0) return res.status(400).json({ erreur: 'Aucun champ à modifier' });

    fields.push('modifie_le = NOW()');
    values.push(parseInt(req.params.id));

    const { rows: updated } = await db.query(
      `UPDATE missions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json({ message: 'Mission mise à jour', mission: mapMission(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /missions/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /missions/:id/assigner
router.put('/:id/assigner', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    const { artisanId } = req.body;
    if (!artisanId) return res.status(400).json({ erreur: 'artisanId requis' });

    const { rows: ar } = await db.query("SELECT id, nom, email, role FROM users WHERE id = $1 AND role = 'artisan'", [parseInt(artisanId)]);
    if (!ar[0]) return res.status(400).json({ erreur: `Aucun artisan avec l'id ${artisanId}` });
    if (['terminee', 'annulee'].includes(mission.statut)) return res.status(400).json({ erreur: "Impossible d'assigner dans ce statut" });

    const { rows: updated } = await db.query(
      "UPDATE missions SET artisan_id = $1, statut = 'assignee', modifie_le = NOW() WHERE id = $2 RETURNING *",
      [parseInt(artisanId), parseInt(req.params.id)]
    );

    res.json({ message: `Mission assignée à ${ar[0].nom}`, mission: mapMission(updated[0]), artisan: ar[0] });
  } catch (err) {
    console.error('Erreur PUT /missions/:id/assigner :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /missions/:id/statut
router.put('/:id/statut', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM missions WHERE id = $1', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    const mission = mapMission(rows[0]);

    const { statut } = req.body;
    const statutsValides = ['en_attente', 'assignee', 'en_cours', 'terminee', 'annulee'];
    if (!statut || !statutsValides.includes(statut)) return res.status(400).json({ erreur: 'Statut invalide', statuts_valides: statutsValides });

    const role = req.user.role;
    if (role === 'artisan') {
      if (mission.artisanId !== req.user.id) return res.status(403).json({ erreur: 'Mission non assignée' });
      if (!['en_cours', 'terminee'].includes(statut)) return res.status(403).json({ erreur: 'Artisan peut passer en : en_cours, terminee' });
    } else if (role === 'client') {
      if (mission.clientId !== req.user.id) return res.status(403).json({ erreur: 'Accès refusé' });
      if (statut !== 'annulee' || mission.statut !== 'en_attente') return res.status(403).json({ erreur: 'Client peut seulement annuler une mission en_attente' });
    }

    const { rows: updated } = await db.query(
      'UPDATE missions SET statut = $1, modifie_le = NOW() WHERE id = $2 RETURNING *',
      [statut, parseInt(req.params.id)]
    );

    res.json({ message: `Statut mis à jour : ${statut}`, mission: mapMission(updated[0]) });
  } catch (err) {
    console.error('Erreur PUT /missions/:id/statut :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// DELETE /missions/:id
router.delete('/:id', authenticateToken, authorizeRole('patron', 'super_admin'), async (req, res) => {
  try {
    const { rows } = await db.query('DELETE FROM missions WHERE id = $1 RETURNING *', [parseInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Mission introuvable' });
    res.json({ message: 'Mission supprimée', mission: mapMission(rows[0]) });
  } catch (err) {
    console.error('Erreur DELETE /missions/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
