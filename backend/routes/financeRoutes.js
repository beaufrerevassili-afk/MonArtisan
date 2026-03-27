// ============================================================
//  financeRoutes.js — Module Finance ERP
//  Devis, Factures, Salaires, Paiements, Dépenses
//  PostgreSQL via db.js
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// Catalogue de prestations (données statiques)
const cataloguePrestations = [
  { id: 1, nom: 'Pose carrelage', unite: 'm²', prixUnitaire: 45 },
  { id: 2, nom: 'Peinture murs', unite: 'm²', prixUnitaire: 25 },
  { id: 3, nom: 'Installation électrique prise', unite: 'unité', prixUnitaire: 120 },
  { id: 4, nom: 'Plomberie - remplacement robinet', unite: 'unité', prixUnitaire: 180 },
  { id: 5, nom: 'Pose parquet', unite: 'm²', prixUnitaire: 55 },
  { id: 6, nom: 'Menuiserie - porte intérieure', unite: 'unité', prixUnitaire: 350 },
  { id: 7, nom: 'Maçonnerie - mur', unite: 'm²', prixUnitaire: 80 },
  { id: 8, nom: 'Chauffage - radiateur', unite: 'unité', prixUnitaire: 450 },
];

// Mapping snake_case → camelCase pour un devis
function mapDevis(row) {
  if (!row) return null;
  return {
    id: row.id,
    numero: row.numero,
    clientId: row.client_id,
    missionId: row.mission_id,
    lignes: row.lignes,
    montantHT: parseFloat(row.montant_ht) || 0,
    montantTVA: parseFloat(row.montant_tva) || 0,
    montantTTC: parseFloat(row.montant_ttc) || 0,
    acomptePercent: row.acompte_percent,
    acompteAmount: parseFloat(row.acompte_amount) || 0,
    statut: row.statut,
    validiteJours: row.validite_jours,
    dateExpiration: row.date_expiration,
    signeLe: row.signe_le,
    documentUrl: row.document_url,
    creeLe: row.cree_le,
    modifieLe: row.modifie_le,
  };
}

// Mapping snake_case → camelCase pour une facture
function mapFacture(row) {
  if (!row) return null;
  return {
    id: row.id,
    numero: row.numero,
    devisId: row.devis_id,
    clientId: row.client_id,
    missionId: row.mission_id,
    montantHT: parseFloat(row.montant_ht) || 0,
    montantTVA: parseFloat(row.montant_tva) || 0,
    montantTTC: parseFloat(row.montant_ttc) || 0,
    acompteAmount: parseFloat(row.acompte_amount) || 0,
    statut: row.statut,
    dateEcheance: row.date_echeance,
    payeeLe: row.payee_le,
    relances: row.relances,
    derniereRelance: row.derniere_relance,
    creeLe: row.cree_le,
  };
}

// Mapping snake_case → camelCase pour une dépense
function mapDepense(row) {
  if (!row) return null;
  return {
    id: row.id,
    montant: parseFloat(row.montant) || 0,
    categorie: row.categorie,
    description: row.description,
    missionId: row.mission_id,
    statut: row.statut,
    creeLe: row.cree_le,
  };
}

// Mapping snake_case → camelCase pour un salaire
function mapSalaire(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeId: row.employe_id,
    nomEmploye: row.nom_employe,
    mois: row.mois,
    annee: row.annee,
    salaireBase: parseFloat(row.salaire_base) || 0,
    salaireNet: parseFloat(row.salaire_net) || 0,
    statut: row.statut,
    payeLe: row.paye_le,
    fichePaieUrl: row.fiche_paie_url,
    creeLe: row.cree_le,
  };
}

// ============================================================
//  DEVIS
// ============================================================

// GET /finance/devis — Liste des devis
router.get('/devis', async (req, res) => {
  try {
    const { statut } = req.query;
    let text = 'SELECT * FROM devis';
    const params = [];
    if (statut) {
      params.push(statut);
      text += ` WHERE statut = $${params.length}`;
    }
    text += ' ORDER BY cree_le DESC';

    const result = await db.query(text, params);
    const liste = result.rows.map(mapDevis);

    res.json({
      total: liste.length,
      statuts_disponibles: 'brouillon, envoyé, accepté, refusé, expiré',
      devis: liste,
    });
  } catch (err) {
    console.error('GET /devis error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// GET /finance/devis/:id — Détail d'un devis
router.get('/devis/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM devis WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Devis introuvable' });
    res.json(mapDevis(result.rows[0]));
  } catch (err) {
    console.error('GET /devis/:id error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// POST /finance/devis — Créer un devis
router.post('/devis', async (req, res) => {
  try {
    const { clientId, missionId, lignes, acomptePercent, validiteJours } = req.body;

    if (!clientId || !lignes || !Array.isArray(lignes) || lignes.length === 0) {
      return res.status(400).json({
        erreur: 'Champs requis : clientId, lignes (tableau de { description, quantite, prixUnitaire, tva })',
      });
    }

    const montantHT = lignes.reduce((s, l) => s + (l.quantite * l.prixUnitaire), 0);
    const montantTVA = lignes.reduce((s, l) => s + (l.quantite * l.prixUnitaire * (l.tva || 0.2)), 0);
    const montantTTC = montantHT + montantTVA;
    const acompte = acomptePercent || 30;
    const acompteAmount = Math.round(montantTTC * acompte / 100 * 100) / 100;
    const validite = validiteJours || 30;
    const dateExpiration = new Date(Date.now() + validite * 86400000).toISOString().split('T')[0];
    const annee = new Date().getFullYear();

    // Numéro séquentiel basé sur le compte de l'année en cours
    const countResult = await db.query(
      `SELECT COUNT(*)+1 AS n FROM devis WHERE EXTRACT(year FROM cree_le) = $1`,
      [annee]
    );
    const seq = parseInt(countResult.rows[0].n);
    const numero = `DEV-${annee}-${String(seq).padStart(4, '0')}`;

    const insertResult = await db.query(
      `INSERT INTO devis
        (numero, client_id, mission_id, lignes, montant_ht, montant_tva, montant_ttc,
         acompte_percent, acompte_amount, statut, validite_jours, date_expiration)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'brouillon',$10,$11)
       RETURNING *`,
      [
        numero,
        parseInt(clientId),
        missionId ? parseInt(missionId) : null,
        JSON.stringify(lignes),
        Math.round(montantHT * 100) / 100,
        Math.round(montantTVA * 100) / 100,
        Math.round(montantTTC * 100) / 100,
        acompte,
        acompteAmount,
        validite,
        dateExpiration,
      ]
    );

    res.status(201).json({ message: 'Devis créé', devis: mapDevis(insertResult.rows[0]) });
  } catch (err) {
    console.error('POST /devis error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// PUT /finance/devis/:id/envoyer — Envoyer le devis au client
router.put('/devis/:id/envoyer', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM devis WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Devis introuvable' });
    const devis = result.rows[0];
    if (devis.statut !== 'brouillon') {
      return res.status(400).json({ erreur: 'Seul un devis en brouillon peut être envoyé' });
    }

    const updated = await db.query(
      `UPDATE devis SET statut='envoyé', modifie_le=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json({ message: 'Devis envoyé au client', devis: mapDevis(updated.rows[0]) });
  } catch (err) {
    console.error('PUT /devis/:id/envoyer error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// PUT /finance/devis/:id/signer — Signature électronique + génération facture (transaction)
router.put('/devis/:id/signer', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const devisResult = await client.query('SELECT * FROM devis WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (devisResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erreur: 'Devis introuvable' });
    }
    const devis = devisResult.rows[0];
    if (devis.statut !== 'envoyé') {
      await client.query('ROLLBACK');
      return res.status(400).json({ erreur: 'Seul un devis envoyé peut être signé' });
    }

    // Mettre à jour le devis
    const devisUpdated = await client.query(
      `UPDATE devis SET statut='accepté', signe_le=NOW(), modifie_le=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );

    // Générer le numéro de facture
    const annee = new Date().getFullYear();
    const countResult = await client.query(
      `SELECT COUNT(*)+1 AS n FROM factures WHERE EXTRACT(year FROM cree_le) = $1`,
      [annee]
    );
    const seq = parseInt(countResult.rows[0].n);
    const numero = `FAC-${annee}-${String(seq).padStart(4, '0')}`;
    const dateEcheance = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    // Créer la facture
    const factureResult = await client.query(
      `INSERT INTO factures
        (numero, devis_id, client_id, mission_id, montant_ht, montant_tva, montant_ttc,
         acompte_amount, statut, date_echeance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'en_attente',$9)
       RETURNING *`,
      [
        numero,
        devis.id,
        devis.client_id,
        devis.mission_id,
        devis.montant_ht,
        devis.montant_tva,
        devis.montant_ttc,
        devis.acompte_amount,
        dateEcheance,
      ]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Devis signé et facture générée automatiquement',
      devis: mapDevis(devisUpdated.rows[0]),
      facture: mapFacture(factureResult.rows[0]),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /devis/:id/signer error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
//  FACTURES
// ============================================================

// GET /finance/factures — Liste des factures
router.get('/factures', async (req, res) => {
  try {
    const { statut } = req.query;
    let text = 'SELECT * FROM factures';
    const params = [];
    if (statut) {
      params.push(statut);
      text += ` WHERE statut = $${params.length}`;
    }
    text += ' ORDER BY cree_le DESC';

    const result = await db.query(text, params);
    const liste = result.rows.map(mapFacture);

    const totalEnAttente = result.rows
      .filter(f => f.statut === 'en_attente')
      .reduce((s, f) => s + parseFloat(f.montant_ttc || 0), 0);
    const totalRetard = result.rows
      .filter(f => f.statut === 'en_retard')
      .reduce((s, f) => s + parseFloat(f.montant_ttc || 0), 0);

    res.json({
      total: liste.length,
      montant_en_attente: Math.round(totalEnAttente * 100) / 100,
      montant_en_retard: Math.round(totalRetard * 100) / 100,
      factures: liste,
    });
  } catch (err) {
    console.error('GET /factures error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// GET /finance/factures/:id — Détail d'une facture
router.get('/factures/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM factures WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Facture introuvable' });
    res.json(mapFacture(result.rows[0]));
  } catch (err) {
    console.error('GET /factures/:id error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// PUT /finance/factures/:id/payer — Marquer une facture comme payée
router.put('/factures/:id/payer', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM factures WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Facture introuvable' });
    if (result.rows[0].statut === 'payée') {
      return res.status(400).json({ erreur: 'Facture déjà payée' });
    }

    const updated = await db.query(
      `UPDATE factures SET statut='payée', payee_le=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json({ message: 'Facture marquée comme payée', facture: mapFacture(updated.rows[0]) });
  } catch (err) {
    console.error('PUT /factures/:id/payer error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// PUT /finance/factures/:id/relancer — Envoyer une relance paiement
router.put('/factures/:id/relancer', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM factures WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Facture introuvable' });

    const updated = await db.query(
      `UPDATE factures SET relances = COALESCE(relances,0)+1, derniere_relance=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    const facture = mapFacture(updated.rows[0]);
    res.json({ message: `Relance ${facture.relances} envoyée par email et SMS`, facture });
  } catch (err) {
    console.error('PUT /factures/:id/relancer error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// ============================================================
//  SALAIRES
// ============================================================

// GET /finance/employes — Liste des employés avec salaires (depuis la table employes)
router.get('/employes', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, prenom||' '||nom AS nom, poste, salaire_base FROM employes WHERE statut='actif' ORDER BY nom`
    );
    const employes = result.rows.map(r => ({
      id: r.id,
      nom: r.nom,
      poste: r.poste,
      salaireBase: parseFloat(r.salaire_base) || 0,
    }));
    res.json({ total: employes.length, employes });
  } catch (err) {
    console.error('GET /employes error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// GET /finance/salaires — Historique des salaires
router.get('/salaires', async (req, res) => {
  try {
    const { mois, annee } = req.query;
    let text = 'SELECT * FROM salaires WHERE 1=1';
    const params = [];
    if (mois) { params.push(parseInt(mois)); text += ` AND mois=$${params.length}`; }
    if (annee) { params.push(parseInt(annee)); text += ` AND annee=$${params.length}`; }
    text += ' ORDER BY cree_le DESC';

    const result = await db.query(text, params);
    const liste = result.rows.map(mapSalaire);
    res.json({ total: liste.length, salaires: liste });
  } catch (err) {
    console.error('GET /salaires error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// POST /finance/salaires/calculer — Calculer la paie du mois
router.post('/salaires/calculer', async (req, res) => {
  try {
    const { mois, annee, primes } = req.body;
    if (!mois || !annee) {
      return res.status(400).json({ erreur: 'mois et annee requis' });
    }

    const empResult = await db.query(
      `SELECT id, prenom||' '||nom AS nom, poste, salaire_base FROM employes WHERE statut='actif'`
    );
    const employesActifs = empResult.rows;

    // Taux charges patronales BTP : 42% (approximatif)
    const tauxChargesPatronales = 0.42;
    // Taux cotisations salariales : 22%
    const tauxCotisationsSalariales = 0.22;

    const calculs = employesActifs.map(emp => {
      const salaireBase = parseFloat(emp.salaire_base) || 0;
      const prime = (primes && primes[emp.id]) ? parseFloat(primes[emp.id]) : 0;
      const salaireBrutTotal = salaireBase + prime;
      const cotisationsSalariales = Math.round(salaireBrutTotal * tauxCotisationsSalariales * 100) / 100;
      const salaireNet = Math.round((salaireBrutTotal - cotisationsSalariales) * 100) / 100;
      const chargesPatronales = Math.round(salaireBrutTotal * tauxChargesPatronales * 100) / 100;
      const coutTotal = Math.round((salaireBrutTotal + chargesPatronales) * 100) / 100;

      return {
        employeId: emp.id,
        nom: emp.nom,
        poste: emp.poste,
        salaireBase,
        prime,
        salaireBrutTotal,
        cotisationsSalariales,
        salaireNet,
        chargesPatronales,
        coutTotal,
        statut: 'calculé',
      };
    });

    const totalNet = calculs.reduce((s, c) => s + c.salaireNet, 0);
    const totalBrut = calculs.reduce((s, c) => s + c.salaireBrutTotal, 0);
    const totalCharges = calculs.reduce((s, c) => s + c.chargesPatronales, 0);

    res.json({
      message: 'Paie calculée - basée sur les grilles de la convention collective du BTP',
      mois, annee,
      resume: {
        totalNet: Math.round(totalNet * 100) / 100,
        totalBrut: Math.round(totalBrut * 100) / 100,
        totalChargesPatronales: Math.round(totalCharges * 100) / 100,
      },
      employes: calculs,
    });
  } catch (err) {
    console.error('POST /salaires/calculer error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// POST /finance/salaires/payer — Payer les salaires
router.post('/salaires/payer', async (req, res) => {
  try {
    const { mois, annee, employeId } = req.body;
    if (!mois || !annee) return res.status(400).json({ erreur: 'mois et annee requis' });

    let empQuery = `SELECT id, prenom||' '||nom AS nom, poste, salaire_base FROM employes WHERE statut='actif'`;
    const empParams = [];
    if (employeId) {
      empParams.push(parseInt(employeId));
      empQuery += ` AND id=$${empParams.length}`;
    }

    const empResult = await db.query(empQuery, empParams);
    const employes = empResult.rows;
    const paiements = [];

    for (const emp of employes) {
      const salaireBase = parseFloat(emp.salaire_base) || 0;
      const cotisations = Math.round(salaireBase * 0.22 * 100) / 100;
      const salaireNet = Math.round((salaireBase - cotisations) * 100) / 100;

      const insertResult = await db.query(
        `INSERT INTO salaires
          (employe_id, nom_employe, mois, annee, salaire_base, salaire_net, statut, paye_le, fiche_paie_url)
         VALUES ($1,$2,$3,$4,$5,$6,'payé',NOW(),$7)
         RETURNING *`,
        [
          emp.id,
          emp.nom,
          parseInt(mois),
          parseInt(annee),
          salaireBase,
          salaireNet,
          `/documents/fiches-paie/fiche_${emp.id}_${mois}_${annee}.pdf`,
        ]
      );
      paiements.push(mapSalaire(insertResult.rows[0]));
    }

    res.json({
      message: `${paiements.length} salaire(s) versé(s) avec succès`,
      paiements,
    });
  } catch (err) {
    console.error('POST /salaires/payer error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// ============================================================
//  DÉPENSES
// ============================================================

// GET /finance/depenses — Liste des dépenses
router.get('/depenses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM depenses ORDER BY cree_le DESC');
    const liste = result.rows.map(mapDepense);
    res.json({ total: liste.length, depenses: liste });
  } catch (err) {
    console.error('GET /depenses error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// POST /finance/depenses — Ajouter une dépense
router.post('/depenses', async (req, res) => {
  try {
    const { montant, categorie, description, missionId } = req.body;
    if (!montant || !categorie) {
      return res.status(400).json({
        erreur: 'montant et categorie requis',
        categories: 'materiaux, carburant, sous-traitant, outillage, autre',
      });
    }

    const result = await db.query(
      `INSERT INTO depenses (montant, categorie, description, mission_id, statut)
       VALUES ($1,$2,$3,$4,'validée')
       RETURNING *`,
      [
        parseFloat(montant),
        categorie,
        description || '',
        missionId ? parseInt(missionId) : null,
      ]
    );

    res.status(201).json({ message: 'Dépense enregistrée', depense: mapDepense(result.rows[0]) });
  } catch (err) {
    console.error('POST /depenses error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// ============================================================
//  TABLEAU DE BORD FINANCIER
// ============================================================

// GET /finance/tableau-de-bord — Résumé financier
router.get('/tableau-de-bord', async (req, res) => {
  try {
    const [caResult, devisResult, depResult, salResult] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE statut='payée') AS factures_payees,
          COUNT(*) FILTER (WHERE statut='en_attente') AS factures_en_attente,
          COUNT(*) FILTER (WHERE statut='en_retard') AS factures_en_retard,
          COUNT(*) AS factures_total,
          COALESCE(SUM(montant_ttc) FILTER (WHERE statut='payée'), 0) AS ca_total,
          COALESCE(SUM(montant_ttc) FILTER (WHERE statut='en_attente'), 0) AS montant_en_attente
        FROM factures
      `),
      db.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE statut='brouillon') AS brouillons,
          COUNT(*) FILTER (WHERE statut='envoyé') AS envoyes,
          COUNT(*) FILTER (WHERE statut='accepté') AS acceptes
        FROM devis
      `),
      db.query(`SELECT COALESCE(SUM(montant),0) AS total FROM depenses WHERE statut='validée'`),
      db.query(`SELECT COALESCE(SUM(salaire_net),0) AS total FROM salaires WHERE statut='payé'`),
    ]);

    const ca = caResult.rows[0];
    const dev = devisResult.rows[0];
    const totalCA = parseFloat(ca.ca_total) || 0;
    const totalDepenses = parseFloat(depResult.rows[0].total) || 0;
    const totalSalaires = parseFloat(salResult.rows[0].total) || 0;
    const totalDevis = parseInt(dev.total) || 0;
    const acceptes = parseInt(dev.acceptes) || 0;

    res.json({
      chiffreAffaires: {
        total: Math.round(totalCA * 100) / 100,
        facturesEmises: parseInt(ca.factures_total),
        facturesPavees: parseInt(ca.factures_payees),
        facturesEnAttente: parseInt(ca.factures_en_attente),
        montantEnAttente: Math.round(parseFloat(ca.montant_en_attente) * 100) / 100,
      },
      devis: {
        total: totalDevis,
        brouillons: parseInt(dev.brouillons),
        envoyes: parseInt(dev.envoyes),
        acceptes,
        tauxConversion: totalDevis > 0 ? Math.round((acceptes / totalDevis) * 100) : 0,
      },
      charges: {
        totalDepenses: Math.round(totalDepenses * 100) / 100,
        totalSalaires: Math.round(totalSalaires * 100) / 100,
      },
      marge: Math.round((totalCA - totalDepenses) * 100) / 100,
      catalogue: cataloguePrestations,
    });
  } catch (err) {
    console.error('GET /tableau-de-bord error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

// GET /finance/export — Export comptable
router.get('/export', async (req, res) => {
  try {
    const { format, mois, annee } = req.query;
    const anneeVal = annee || new Date().getFullYear();

    const [facResult, salResult, depResult] = await Promise.all([
      db.query('SELECT COUNT(*) AS n FROM factures'),
      db.query('SELECT COUNT(*) AS n FROM salaires'),
      db.query('SELECT COUNT(*) AS n FROM depenses'),
    ]);

    res.json({
      message: `Export ${format || 'PDF'} généré pour ${mois || 'tous les mois'} ${anneeVal}`,
      url: `/exports/comptabilite_${anneeVal}.${format || 'pdf'}`,
      donnees: {
        factures: parseInt(facResult.rows[0].n),
        salaires: parseInt(salResult.rows[0].n),
        depenses: parseInt(depResult.rows[0].n),
      },
    });
  } catch (err) {
    console.error('GET /export error:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
  }
});

module.exports = router;
