// ============================================================
//  modulesRoutes.js — Routes CRUD pour tous les modules
//  Incidents, NC, BSDD, Certifications, Audits, Entretiens,
//  Onboarding, Pointages, Pipeline, Bibliothèque prix,
//  Contrats, Photos chantier
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Helper CRUD générique ──
function crudRoutes(table, mapFn) {
  // GET all (filtered by patron_id)
  router.get(`/${table}`, async (req, res) => {
    try {
      const patronId = req.user?.id;
      const { rows } = await db.query(`SELECT * FROM ${table} WHERE patron_id = $1 ORDER BY cree_le DESC`, [patronId]);
      res.json({ [table]: mapFn ? rows.map(mapFn) : rows });
    } catch (err) {
      console.error(`GET /${table} error:`, err.message);
      res.status(500).json({ erreur: 'Erreur serveur' });
    }
  });

  // GET by id (vérifie ownership via patron_id)
  router.get(`/${table}/:id`, async (req, res) => {
    try {
      const { rows } = await db.query(`SELECT * FROM ${table} WHERE id = $1 AND patron_id = $2`, [req.params.id, req.user?.id]);
      if (rows.length === 0) return res.status(404).json({ erreur: 'Non trouvé' });
      res.json(mapFn ? mapFn(rows[0]) : rows[0]);
    } catch (err) {
      res.status(500).json({ erreur: 'Erreur serveur' });
    }
  });

  // POST create
  router.post(`/${table}`, async (req, res) => {
    try {
      const patronId = req.user?.id;
      const data = req.body;
      const cols = Object.keys(data).filter(k => k !== 'id' && k !== 'cree_le');
      const vals = cols.map(k => data[k]);
      cols.push('patron_id');
      vals.push(patronId);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
      const colNames = cols.map(c => c.replace(/([A-Z])/g, '_$1').toLowerCase()).join(',');
      const { rows } = await db.query(
        `INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) RETURNING *`,
        vals
      );
      res.status(201).json({ message: 'Créé', item: mapFn ? mapFn(rows[0]) : rows[0] });
    } catch (err) {
      console.error(`POST /${table} error:`, err.message);
      res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
    }
  });

  // PUT update
  router.put(`/${table}/:id`, async (req, res) => {
    try {
      const data = req.body;
      const cols = Object.keys(data).filter(k => k !== 'id' && k !== 'cree_le' && k !== 'patron_id');
      if (cols.length === 0) return res.status(400).json({ erreur: 'Rien à mettre à jour' });
      const sets = cols.map((c, i) => `${c.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`).join(', ');
      const vals = cols.map(k => data[k]);
      vals.push(req.params.id, req.user?.id);
      const { rows } = await db.query(
        `UPDATE ${table} SET ${sets} WHERE id = $${vals.length - 1} AND patron_id = $${vals.length} RETURNING *`,
        vals
      );
      if (rows.length === 0) return res.status(404).json({ erreur: 'Non trouvé' });
      res.json({ message: 'Mis à jour', item: mapFn ? mapFn(rows[0]) : rows[0] });
    } catch (err) {
      console.error(`PUT /${table}/:id error:`, err.message);
      res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
    }
  });

  // DELETE
  router.delete(`/${table}/:id`, async (req, res) => {
    try {
      const { rowCount } = await db.query(`DELETE FROM ${table} WHERE id = $1 AND patron_id = $2`, [req.params.id, req.user?.id]);
      if (rowCount === 0) return res.status(404).json({ erreur: 'Non trouvé' });
      res.json({ message: 'Supprimé' });
    } catch (err) {
      res.status(500).json({ erreur: 'Erreur serveur' });
    }
  });
}

// ── Enregistrer toutes les tables ──
crudRoutes('incidents');
crudRoutes('non_conformites');
crudRoutes('bsdd');
crudRoutes('certifications');
crudRoutes('audits');
crudRoutes('entretiens');
crudRoutes('onboarding');
crudRoutes('pointages');
crudRoutes('pipeline');
crudRoutes('biblio_prix');
crudRoutes('contrats_generes');
crudRoutes('photos_chantier');

module.exports = router;
