// ============================================================
//  qseRoutes.js — Module QSE (Qualité Sécurité Environnement)
//  Habilitations, CACES, Certifications, Documents sécurité
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// Données statiques en mémoire
const TYPES_HABILITATIONS = {
  electrique:     ['B0', 'H0', 'BR', 'BC', 'HC', 'B1', 'B2', 'H1', 'H2'],
  caces:          ['CACES 1', 'CACES 3', 'CACES 5', 'CACES R486', 'CACES R482 A', 'CACES R482 B', 'CACES R482 C'],
  metier:         ['RGE', 'Qualibat', 'Permis feu', 'Travail en hauteur', 'Amiante SS3', 'Amiante SS4'],
  administratif:  ['Contrat de travail', 'Visite médicale', 'Carte BTP', 'Permis de conduire'],
};

// ============================================================
//  HABILITATIONS ET COMPÉTENCES
// ============================================================

// GET /qse/habilitations — Toutes les habilitations
router.get('/habilitations', async (req, res) => {
  try {
    const { employeId, type, expire } = req.query;

    const maintenant = new Date();
    const dans30j = new Date(maintenant.getTime() + 30 * 86400000);
    const dans7j  = new Date(maintenant.getTime() + 7  * 86400000);

    let sql    = 'SELECT * FROM habilitations WHERE 1=1';
    const params = [];

    if (employeId) { params.push(parseInt(employeId)); sql += ` AND employe_id = $${params.length}`; }
    if (type)      { params.push(type);                sql += ` AND type = $${params.length}`; }
    if (expire === 'bientot') {
      params.push(dans30j.toISOString());
      sql += ` AND date_expiration <= $${params.length}`;
    }

    sql += ' ORDER BY date_expiration ASC';

    const result = await db.query(sql, params);
    let liste = result.rows;

    // Enrichir avec statut d'alerte
    liste = liste.map(h => {
      const dateExp = new Date(h.date_expiration);
      let alerte = null;
      if (dateExp < maintenant)   alerte = 'expirée';
      else if (dateExp <= dans7j)  alerte = 'urgente';
      else if (dateExp <= dans30j) alerte = 'bientôt';
      return {
        id:             h.id,
        employeId:      h.employe_id,
        type:           h.type,
        nom:            h.nom,
        dateObtention:  h.date_obtention,
        dateExpiration: h.date_expiration,
        documentUrl:    h.document_url,
        verifie:        h.verifie,
        creeLe:         h.cree_le,
        alerte,
      };
    });

    const expirees = liste.filter(h => h.alerte === 'expirée').length;
    const urgentes = liste.filter(h => h.alerte === 'urgente').length;
    const bientot  = liste.filter(h => h.alerte === 'bientôt').length;

    res.json({
      total: liste.length,
      alertes: { expirees, urgentes, bientot },
      types_disponibles: TYPES_HABILITATIONS,
      habilitations: liste,
    });
  } catch (err) {
    console.error('GET /qse/habilitations :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /qse/habilitations/:employeId — Profil compétences d'un employé
router.get('/habilitations/:employeId', async (req, res) => {
  try {
    const empId = parseInt(req.params.employeId);
    const result = await db.query(
      'SELECT * FROM habilitations WHERE employe_id = $1 ORDER BY date_expiration ASC',
      [empId]
    );

    const maintenant = new Date();
    const dans30j    = new Date(maintenant.getTime() + 30 * 86400000);

    const profile = { electrique: [], caces: [], metier: [], administratif: [] };
    let valides  = 0;
    let expirees = 0;

    result.rows.forEach(h => {
      const dateExp = new Date(h.date_expiration);
      const item = {
        id:             h.id,
        employeId:      h.employe_id,
        type:           h.type,
        nom:            h.nom,
        dateObtention:  h.date_obtention,
        dateExpiration: h.date_expiration,
        documentUrl:    h.document_url,
        verifie:        h.verifie,
        statut: dateExp < maintenant ? 'expirée' : dateExp <= dans30j ? 'expire_bientot' : 'valide',
      };
      if (profile[h.type]) profile[h.type].push(item);
      dateExp > maintenant ? valides++ : expirees++;
    });

    res.json({
      employeId:               empId,
      profil:                  profile,
      totalHabilitations:      result.rows.length,
      habilitationsValides:    valides,
      habilitationsExpirees:   expirees,
    });
  } catch (err) {
    console.error('GET /qse/habilitations/:employeId :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /qse/habilitations — Ajouter une habilitation
router.post('/habilitations', async (req, res) => {
  try {
    const { employeId, type, nom, dateObtention, dateExpiration } = req.body;
    if (!employeId || !type || !nom || !dateExpiration) {
      return res.status(400).json({
        erreur: 'Champs requis : employeId, type, nom, dateExpiration',
        types: Object.keys(TYPES_HABILITATIONS),
      });
    }

    const obtention = dateObtention || new Date().toISOString().split('T')[0];

    const result = await db.query(
      `INSERT INTO habilitations (employe_id, type, nom, date_obtention, date_expiration, document_url, verifie)
       VALUES ($1, $2, $3, $4, $5, NULL, false)
       RETURNING *`,
      [parseInt(employeId), type, nom, obtention, dateExpiration]
    );

    const h = result.rows[0];
    const habilitation = {
      id:             h.id,
      employeId:      h.employe_id,
      type:           h.type,
      nom:            h.nom,
      dateObtention:  h.date_obtention,
      dateExpiration: h.date_expiration,
      documentUrl:    h.document_url,
      verifie:        h.verifie,
      creeLe:         h.cree_le,
    };

    res.status(201).json({ message: 'Habilitation ajoutée', habilitation });
  } catch (err) {
    console.error('POST /qse/habilitations :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  ASSIGNATION INTELLIGENTE
// ============================================================

// POST /qse/verifier-assignation — Vérifier si un employé peut faire une mission
router.post('/verifier-assignation', async (req, res) => {
  try {
    const { employeId, competencesRequises } = req.body;
    if (!employeId || !competencesRequises) {
      return res.status(400).json({
        erreur: 'employeId et competencesRequises (tableau) requis',
        exemple: { employeId: 1, competencesRequises: ['BR', 'Travail en hauteur'] },
      });
    }

    const result = await db.query(
      `SELECT id, nom, type, date_expiration
       FROM habilitations
       WHERE employe_id = $1 AND date_expiration > NOW()`,
      [parseInt(employeId)]
    );

    const habilitationsValides = result.rows;
    const nomsHabilitations    = habilitationsValides.map(h => h.nom);

    const resultat = competencesRequises.map(comp => ({
      competence: comp,
      possede:    nomsHabilitations.includes(comp),
      habilitation: habilitationsValides.find(h => h.nom === comp) || null,
    }));

    const toutesOk  = resultat.every(r => r.possede);
    const manquantes = resultat.filter(r => !r.possede).map(r => r.competence);

    res.json({
      employeId:       parseInt(employeId),
      peutEtreAssigne: toutesOk,
      competences:     resultat,
      manquantes,
      message: toutesOk
        ? 'Employé qualifié pour cette mission'
        : `Compétences manquantes : ${manquantes.join(', ')}`,
    });
  } catch (err) {
    console.error('POST /qse/verifier-assignation :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /qse/trouver-employes-qualifies — Trouver les employés qualifiés pour une mission
router.post('/trouver-employes-qualifies', async (req, res) => {
  try {
    const { competencesRequises, employeIds } = req.body;
    if (!competencesRequises || !Array.isArray(competencesRequises)) {
      return res.status(400).json({ erreur: 'competencesRequises (tableau) requis' });
    }

    // Récupérer les habilitations valides pour les employés concernés
    let sql = `SELECT employe_id, nom, date_expiration
               FROM habilitations
               WHERE date_expiration > NOW()`;
    const params = [];

    if (employeIds && Array.isArray(employeIds) && employeIds.length > 0) {
      params.push(employeIds);
      sql += ` AND employe_id = ANY($1)`;
    }

    const result = await db.query(sql, params);

    // Regrouper par employé
    const parEmploye = {};
    result.rows.forEach(h => {
      if (!parEmploye[h.employe_id]) parEmploye[h.employe_id] = [];
      parEmploye[h.employe_id].push(h.nom);
    });

    // Si aucun employeIds fourni, prendre tous ceux présents en BDD
    const idsAVerifier = (employeIds && employeIds.length > 0)
      ? employeIds
      : Object.keys(parEmploye).map(Number);

    const resultat = idsAVerifier.map(empId => {
      const nomsHabilitations = parEmploye[empId] || [];
      const toutesOk   = competencesRequises.every(c => nomsHabilitations.includes(c));
      const manquantes = competencesRequises.filter(c => !nomsHabilitations.includes(c));
      return {
        employeId: empId,
        qualifie:  toutesOk,
        manquantes,
        couleur:   toutesOk ? 'vert' : 'gris',
      };
    });

    const qualifies = resultat.filter(r => r.qualifie);
    res.json({
      competencesRequises,
      employesQualifies:    qualifies,
      employesNonQualifies: resultat.filter(r => !r.qualifie),
      message: qualifies.length === 0
        ? "Aucun membre de votre équipe n'a les compétences requises. Voulez-vous sous-traiter ?"
        : `${qualifies.length} employé(s) qualifié(s) trouvé(s)`,
    });
  } catch (err) {
    console.error('POST /qse/trouver-employes-qualifies :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  DOCUMENTS QSE
// ============================================================

// GET /qse/documents — Documents QSE
router.get('/documents', async (req, res) => {
  try {
    const { missionId, type } = req.query;

    let sql    = 'SELECT * FROM documents_qse WHERE 1=1';
    const params = [];

    if (missionId) { params.push(parseInt(missionId)); sql += ` AND mission_id = $${params.length}`; }
    if (type)      { params.push(type);                sql += ` AND type = $${params.length}`; }

    sql += ' ORDER BY cree_le DESC';

    const result = await db.query(sql, params);

    const documents = result.rows.map(d => ({
      id:          d.id,
      missionId:   d.mission_id,
      type:        d.type,
      titre:       d.titre,
      contenu:     d.contenu,
      statut:      d.statut,
      signataires: d.signataires,
      documentUrl: d.document_url,
      creeLe:      d.cree_le,
      modifieLe:   d.modifie_le,
    }));

    res.json({
      total: documents.length,
      types_disponibles: ['plan_prevention', 'ppsps', 'duer', 'registre_accidents', 'checklist_chantier', 'epi'],
      documents,
    });
  } catch (err) {
    console.error('GET /qse/documents :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /qse/documents — Créer un document QSE
router.post('/documents', async (req, res) => {
  try {
    const { missionId, type, titre, contenu } = req.body;
    if (!type || !titre) {
      return res.status(400).json({ erreur: 'type et titre requis' });
    }

    const result = await db.query(
      `INSERT INTO documents_qse (mission_id, type, titre, contenu, statut, signataires, document_url)
       VALUES ($1, $2, $3, $4, 'brouillon', '[]', NULL)
       RETURNING *`,
      [missionId ? parseInt(missionId) : null, type, titre, contenu || '']
    );

    const d = result.rows[0];
    const document = {
      id:          d.id,
      missionId:   d.mission_id,
      type:        d.type,
      titre:       d.titre,
      contenu:     d.contenu,
      statut:      d.statut,
      signataires: d.signataires,
      documentUrl: d.document_url,
      creeLe:      d.cree_le,
    };

    res.status(201).json({ message: 'Document QSE créé', document });
  } catch (err) {
    console.error('POST /qse/documents :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /qse/documents/:id/signer — Signer un document QSE
router.put('/documents/:id/signer', async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const { employeId } = req.body;
    if (!employeId) return res.status(400).json({ erreur: 'employeId requis' });

    // Lire les signataires existants
    const existing = await db.query('SELECT signataires FROM documents_qse WHERE id = $1', [docId]);
    if (!existing.rows.length) return res.status(404).json({ erreur: 'Document introuvable' });

    const signataires = existing.rows[0].signataires || [];
    const empId = parseInt(employeId);
    if (!signataires.includes(empId)) signataires.push(empId);

    const result = await db.query(
      `UPDATE documents_qse
       SET signataires = $1, modifie_le = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(signataires), docId]
    );

    const d = result.rows[0];
    const document = {
      id:          d.id,
      missionId:   d.mission_id,
      type:        d.type,
      titre:       d.titre,
      contenu:     d.contenu,
      statut:      d.statut,
      signataires: d.signataires,
      documentUrl: d.document_url,
      creeLe:      d.cree_le,
      modifieLe:   d.modifie_le,
    };

    res.json({ message: 'Document signé', document });
  } catch (err) {
    console.error('PUT /qse/documents/:id/signer :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  EPI (Équipements de Protection Individuelle)
// ============================================================

// GET /qse/epi — Suivi EPI
router.get('/epi', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM epi ORDER BY cree_le DESC');

    const epi = result.rows.map(e => ({
      id:              e.id,
      employeId:       e.employe_id,
      equipements:     e.equipements,
      dateAttribution: e.date_attribution,
      statut:          e.statut,
      signature:       e.signature,
      creeLe:          e.cree_le,
    }));

    res.json({ total: epi.length, epi });
  } catch (err) {
    console.error('GET /qse/epi :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// POST /qse/epi — Attribuer des EPI
router.post('/epi', async (req, res) => {
  try {
    const { employeId, equipements } = req.body;
    if (!employeId || !equipements) {
      return res.status(400).json({
        erreur: 'employeId et equipements requis',
        exemple: { employeId: 1, equipements: ['casque', 'chaussures_securite', 'gilet_jaune'] },
      });
    }

    const result = await db.query(
      `INSERT INTO epi (employe_id, equipements, date_attribution, statut, signature)
       VALUES ($1, $2, CURRENT_DATE, 'attribué', NULL)
       RETURNING *`,
      [parseInt(employeId), JSON.stringify(equipements)]
    );

    const e = result.rows[0];
    const attribution = {
      id:              e.id,
      employeId:       e.employe_id,
      equipements:     e.equipements,
      dateAttribution: e.date_attribution,
      statut:          e.statut,
      signature:       e.signature,
      creeLe:          e.cree_le,
    };

    res.status(201).json({ message: 'EPI attribués', attribution });
  } catch (err) {
    console.error('POST /qse/epi :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  TABLEAU DE BORD QSE
// ============================================================

// GET /qse/tableau-de-bord
router.get('/tableau-de-bord', async (req, res) => {
  try {
    const maintenant = new Date();
    const dans30j    = new Date(maintenant.getTime() + 30 * 86400000);
    const dans7j     = new Date(maintenant.getTime() + 7  * 86400000);

    const [habResult, docResult, epiResult] = await Promise.all([
      db.query('SELECT id, employe_id, nom, type, date_expiration FROM habilitations'),
      db.query('SELECT id, statut FROM documents_qse'),
      db.query('SELECT COUNT(*) AS total FROM epi'),
    ]);

    const habilitations = habResult.rows;

    const expirees = habilitations.filter(h => new Date(h.date_expiration) < maintenant);
    const urgentes = habilitations.filter(h => {
      const d = new Date(h.date_expiration);
      return d >= maintenant && d <= dans7j;
    });
    const bientot = habilitations.filter(h => {
      const d = new Date(h.date_expiration);
      return d >= dans7j && d <= dans30j;
    });

    const documents    = docResult.rows;
    const epiTotal     = parseInt(epiResult.rows[0].total);

    res.json({
      alertes: {
        expirees:       expirees.length,
        urgentes:       urgentes.length,
        bientot:        bientot.length,
        detail_expirees: expirees,
        detail_urgentes: urgentes,
      },
      habilitations: {
        total:  habilitations.length,
        valides: habilitations.filter(h => new Date(h.date_expiration) > maintenant).length,
      },
      documents: {
        total:      documents.length,
        brouillons: documents.filter(d => d.statut === 'brouillon').length,
      },
      epi: { total: epiTotal },
    });
  } catch (err) {
    console.error('GET /qse/tableau-de-bord :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
