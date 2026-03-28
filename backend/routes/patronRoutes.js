// ============================================================
//  patronRoutes.js — ERP Patron
//  Devis Pro, Chantiers, Pipeline Commercial
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ============================================================
//  INFORMATIONS SOCIÉTÉ (statiques)
// ============================================================

const companyInfo = {
  nom:          'Bernard Martin BTP',
  siret:        '123 456 789 00012',
  adresse:      '15 rue du Commerce, 75015 Paris',
  telephone:    '01 45 67 89 00',
  email:        'contact@bernardmartin-btp.fr',
  tva_intracom: 'FR12 123456789',
  garantie:     'GD-2024-BM-001 — AXA Assurances',
  rcs:          'RCS Paris B 123 456 789',
};

// Pipeline commercial statique (données fictives)
const pipeline = {
  prospects: [
    { id: 1, nom: 'M. Dubois — Extension maison',       valeur: 35000, contact: 'j.dubois@email.com', dateContact: '2024-03-20', probabilite: 70 },
    { id: 2, nom: 'Copropriété Les Pins — Ravalement',  valeur: 85000, contact: 'syndic@lespins.fr',   dateContact: '2024-03-18', probabilite: 45 },
    { id: 3, nom: 'Mme Koch — Salle de bain',           valeur: 8500,  contact: 'm.koch@gmail.com',    dateContact: '2024-03-25', probabilite: 85 },
  ],
  devisEnvoyes: [
    { id: 1, nom: 'M. Lefebvre — Cuisine',  numero: 'DEV-2024-001', valeur: 4868,  dateEnvoi: '2024-03-16', joursRestants: 25 },
  ],
  signes: [
    { id: 2, nom: 'SCI Immo — Toiture', numero: 'DEV-2024-002', valeur: 12100, dateSigned: '2024-03-15' },
  ],
};

// Alertes financières statiques
const ALERTES_FINANCIERES = [
  { type: 'impayee',  severity: 'high',   msg: 'Facture FAC-2024-098 en retard de 45 jours — 4 200 €',  client: 'M. Moreau',    montant: 4200  },
  { type: 'impayee',  severity: 'medium', msg: 'Facture FAC-2024-102 en retard de 32 jours — 8 500 €',  client: 'SCI Les Pins', montant: 8500  },
  { type: 'echeance', severity: 'high',   msg: 'Déclaration TVA CA3 — échéance 20 avril 2024',           montant: 2840           },
  { type: 'echeance', severity: 'medium', msg: 'Charges URSSAF — échéance 5 mai 2024',                   montant: 6120           },
  { type: 'chantier', severity: 'low',    msg: 'Chantier Toiture SCI Immo — retard estimé 3 jours',     chantier: 'Toiture SCI' },
  { type: 'stock',    severity: 'low',    msg: 'Stock ciment bas — seuil critique atteint'                                       },
];

function mapDevis(d) {
  return {
    id:           d.id,
    numero:       d.numero,
    client:       d.client,
    titre:        d.titre,
    lignes:       d.lignes,
    totalHT:      d.total_ht,
    tva:          d.tva,
    totalTTC:     d.total_ttc,
    validite:     d.validite,
    validiteDate: d.validite_date,
    conditions:   d.conditions,
    statut:       d.statut,
    creeLe:       d.cree_le,
    envoyeLe:     d.envoye_le,
    signeLe:      d.signe_le,
    signatureNom: d.signature_nom,
  };
}

function mapChantier(c) {
  return {
    id:            c.id,
    nom:           c.nom,
    client:        c.client,
    adresse:       c.adresse,
    chef:          c.chef,
    statut:        c.statut,
    avancement:    c.avancement,
    budgetPrevu:   c.budget_prevu,
    budgetReel:    c.budget_reel,
    dateDebut:     c.date_debut,
    dateFin:       c.date_fin,
    dateFinReelle: c.date_fin_reelle,
    equipe:        c.equipe,
    description:   c.description,
    alertes:       c.alertes,
    creeLe:        c.cree_le,
  };
}

// ============================================================
//  DEVIS PROFESSIONNELS
// ============================================================

router.get('/devis-pro', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM devis_pro ORDER BY cree_le DESC');
    const devis  = result.rows.map(mapDevis);

    const nonBrouillons = devis.filter(d => d.statut !== 'brouillon');
    const signes        = devis.filter(d => d.statut === 'signé');

    const stats = {
      total:     devis.length,
      brouillon: devis.filter(d => d.statut === 'brouillon').length,
      envoye:    devis.filter(d => d.statut === 'envoyé').length,
      signe:     signes.length,
      ca_signe:  signes.reduce((s, d) => s + parseFloat(d.totalTTC || 0), 0),
      taux_conv: nonBrouillons.length > 0
        ? Math.round(signes.length / nonBrouillons.length * 100)
        : 0,
    };

    res.json({ companyInfo, stats, devis });
  } catch (err) {
    console.error('GET /patron/devis-pro :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

router.get('/devis-pro/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM devis_pro WHERE id = $1', [parseInt(req.params.id)]);
    if (!result.rows.length) return res.status(404).json({ erreur: 'Devis introuvable' });
    res.json({ devis: mapDevis(result.rows[0]), companyInfo });
  } catch (err) {
    console.error('GET /patron/devis-pro/:id :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

router.post('/devis-pro', async (req, res) => {
  try {
    const { client, titre, lignes, validite, conditions } = req.body;
    if (!client?.nom || !titre || !Array.isArray(lignes) || !lignes.length) {
      return res.status(400).json({ erreur: 'client.nom, titre, lignes requis' });
    }

    const totalHT  = lignes.reduce((s, l) => s + (l.quantite * l.prixHT), 0);
    const tvaMont  = lignes.reduce((s, l) => s + (l.quantite * l.prixHT * (l.tva || 0.10)), 0);
    const totalTTC = totalHT + tvaMont;
    const validiteJours = validite || 30;

    // Générer le numéro séquentiel pour l'année en cours
    const annee   = new Date().getFullYear();
    const countRes = await db.query(
      `SELECT COUNT(*)+1 AS n FROM devis_pro WHERE EXTRACT(year FROM cree_le) = $1`,
      [annee]
    );
    const n      = parseInt(countRes.rows[0].n);
    const numero = `DEV-${annee}-${String(n).padStart(3, '0')}`;

    const validiteDate = new Date(Date.now() + validiteJours * 86400000).toISOString().slice(0, 10);
    const lignesCalc   = lignes.map(l => ({ ...l, totalHT: Math.round(l.quantite * l.prixHT * 100) / 100 }));

    const result = await db.query(
      `INSERT INTO devis_pro
         (numero, client, titre, lignes, total_ht, tva, total_ttc, validite, validite_date, conditions, statut, envoye_le, signe_le, signature_nom)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'brouillon', NULL, NULL, NULL)
       RETURNING *`,
      [
        numero,
        JSON.stringify(client),
        titre,
        JSON.stringify(lignesCalc),
        Math.round(totalHT  * 100) / 100,
        Math.round(tvaMont  * 100) / 100,
        Math.round(totalTTC * 100) / 100,
        validiteJours,
        validiteDate,
        conditions || 'Acompte 30 % à la commande. Solde à réception des travaux.',
      ]
    );

    res.status(201).json({ message: 'Devis créé', devis: mapDevis(result.rows[0]) });
  } catch (err) {
    console.error('POST /patron/devis-pro :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

router.put('/devis-pro/:id/envoyer', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE devis_pro SET statut = 'envoyé', envoye_le = NOW() WHERE id = $1 RETURNING *`,
      [parseInt(req.params.id)]
    );
    if (!result.rows.length) return res.status(404).json({ erreur: 'Devis introuvable' });

    const devis = mapDevis(result.rows[0]);
    res.json({
      message: 'Devis marqué comme envoyé',
      lienSignature: `http://localhost:3001/devis/${devis.id}/signer`,
      devis,
    });
  } catch (err) {
    console.error('PUT /patron/devis-pro/:id/envoyer :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// Route PUBLIQUE — signature client
router.post('/devis-pro/:id/signer', async (req, res) => {
  try {
    const devisId = parseInt(req.params.id);
    const { signatureNom } = req.body;
    if (!signatureNom?.trim()) return res.status(400).json({ erreur: 'signatureNom requis' });

    // Vérifier si déjà signé
    const existing = await db.query('SELECT statut FROM devis_pro WHERE id = $1', [devisId]);
    if (!existing.rows.length) return res.status(404).json({ erreur: 'Devis introuvable' });
    if (existing.rows[0].statut === 'signé') return res.status(400).json({ erreur: 'Ce devis a déjà été signé' });

    const result = await db.query(
      `UPDATE devis_pro
       SET statut = 'signé', signe_le = NOW(), signature_nom = $1
       WHERE id = $2
       RETURNING *`,
      [signatureNom.trim(), devisId]
    );

    res.json({ message: 'Devis signé avec succès', devis: mapDevis(result.rows[0]) });
  } catch (err) {
    console.error('POST /patron/devis-pro/:id/signer :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  CHANTIERS
// ============================================================

router.get('/chantiers', async (req, res) => {
  try {
    const result   = await db.query('SELECT * FROM chantiers ORDER BY cree_le DESC');
    const chantiers = result.rows.map(mapChantier);

    const stats = {
      total:        chantiers.length,
      en_cours:     chantiers.filter(c => c.statut === 'en_cours').length,
      planifie:     chantiers.filter(c => c.statut === 'planifie').length,
      termine:      chantiers.filter(c => c.statut === 'termine').length,
      en_retard:    chantiers.filter(c => Array.isArray(c.alertes) && c.alertes.length > 0).length,
      budget_actif: chantiers
        .filter(c => ['en_cours', 'planifie'].includes(c.statut))
        .reduce((s, c) => s + parseFloat(c.budgetPrevu || 0), 0),
    };

    res.json({ stats, chantiers });
  } catch (err) {
    console.error('GET /patron/chantiers :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

router.post('/chantiers', async (req, res) => {
  try {
    const { nom, client, adresse, budgetPrevu, dateDebut, dateFin, description } = req.body;
    if (!nom || !budgetPrevu) return res.status(400).json({ erreur: 'nom, budgetPrevu requis' });

    const result = await db.query(
      `INSERT INTO chantiers
         (nom, client, adresse, chef, statut, avancement, budget_prevu, budget_reel,
          date_debut, date_fin, date_fin_reelle, equipe, description, alertes)
       VALUES ($1, $2, $3, 'Bernard Martin', 'planifie', 0, $4, 0, $5, $6, NULL, '[]', $7, '[]')
       RETURNING *`,
      [
        nom,
        client || '',
        adresse || '',
        parseFloat(budgetPrevu),
        dateDebut || null,
        dateFin   || null,
        description || '',
      ]
    );

    res.status(201).json({ message: 'Chantier créé', chantier: mapChantier(result.rows[0]) });
  } catch (err) {
    console.error('POST /patron/chantiers :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

router.put('/chantiers/:id/avancement', async (req, res) => {
  try {
    const chantierId = parseInt(req.params.id);
    const { avancement, statut, budgetReel } = req.body;

    const existing = await db.query('SELECT * FROM chantiers WHERE id = $1', [chantierId]);
    if (!existing.rows.length) return res.status(404).json({ erreur: 'Chantier introuvable' });

    const c = existing.rows[0];

    const newAvancement = avancement !== undefined
      ? Math.min(100, Math.max(0, parseInt(avancement)))
      : c.avancement;
    const newBudgetReel = budgetReel !== undefined ? parseFloat(budgetReel) : c.budget_reel;

    let newStatut       = statut || c.statut;
    let newDateFinReelle = c.date_fin_reelle;

    if (newAvancement === 100 && newStatut !== 'termine') {
      newStatut        = 'termine';
      newDateFinReelle = new Date().toISOString().slice(0, 10);
    }

    const result = await db.query(
      `UPDATE chantiers
       SET avancement = $1, statut = $2, budget_reel = $3, date_fin_reelle = $4
       WHERE id = $5
       RETURNING *`,
      [newAvancement, newStatut, newBudgetReel, newDateFinReelle, chantierId]
    );

    res.json({ message: 'Mis à jour', chantier: mapChantier(result.rows[0]) });
  } catch (err) {
    console.error('PUT /patron/chantiers/:id/avancement :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  PIPELINE COMMERCIAL
// ============================================================

router.get('/pipeline', (req, res) => {
  const nbEnvoyesEtSignes = pipeline.devisEnvoyes.length + pipeline.signes.length;
  const stats = {
    nb_prospects:     pipeline.prospects.length,
    nb_devis_envoyes: pipeline.devisEnvoyes.length,
    nb_signes:        pipeline.signes.length,
    ca_signe:         pipeline.signes.reduce((s, d) => s + d.valeur, 0),
    ca_potentiel:     Math.round(pipeline.prospects.reduce((s, p) => s + p.valeur * p.probabilite / 100, 0)),
    taux_conversion:  nbEnvoyesEtSignes > 0
      ? Math.round(pipeline.signes.length / nbEnvoyesEtSignes * 100)
      : 0,
  };
  res.json({ pipeline, stats });
});

// ============================================================
//  ALERTES FINANCIÈRES
// ============================================================

router.get('/alertes', (req, res) => {
  res.json({ alertes: ALERTES_FINANCIERES });
});

// ============================================================
//  STOCK
// ============================================================
router.get('/stock', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM stock_articles ORDER BY designation');
    res.json({ articles: rows.map(r => ({
      id: r.id, ref: r.ref, designation: r.designation, categorie: r.categorie,
      quantite: parseFloat(r.quantite), seuilAlerte: parseFloat(r.seuil_alerte),
      unite: r.unite, valeurUnitaire: parseFloat(r.valeur_unitaire), fournisseur: r.fournisseur
    }))});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.post('/stock', async (req, res) => {
  try {
    const { ref, designation, categorie, quantite, seuilAlerte, unite, valeurUnitaire, fournisseur } = req.body;
    const { rows } = await db.query(
      `INSERT INTO stock_articles (ref, designation, categorie, quantite, seuil_alerte, unite, valeur_unitaire, fournisseur)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [ref||null, designation, categorie||'Matériaux', quantite||0, seuilAlerte||0, unite||'u', valeurUnitaire||0, fournisseur||null]
    );
    const r = rows[0];
    res.status(201).json({ article: { id: r.id, ref: r.ref, designation: r.designation, categorie: r.categorie, quantite: parseFloat(r.quantite), seuilAlerte: parseFloat(r.seuil_alerte), unite: r.unite, valeurUnitaire: parseFloat(r.valeur_unitaire), fournisseur: r.fournisseur }});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.put('/stock/:id', async (req, res) => {
  try {
    const { ref, designation, categorie, quantite, seuilAlerte, unite, valeurUnitaire, fournisseur } = req.body;
    const { rows } = await db.query(
      `UPDATE stock_articles SET ref=$1, designation=$2, categorie=$3, quantite=$4, seuil_alerte=$5, unite=$6, valeur_unitaire=$7, fournisseur=$8, modifie_le=NOW()
       WHERE id=$9 RETURNING *`,
      [ref||null, designation, categorie||'Matériaux', quantite||0, seuilAlerte||0, unite||'u', valeurUnitaire||0, fournisseur||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Article introuvable' });
    const r = rows[0];
    res.json({ article: { id: r.id, ref: r.ref, designation: r.designation, categorie: r.categorie, quantite: parseFloat(r.quantite), seuilAlerte: parseFloat(r.seuil_alerte), unite: r.unite, valeurUnitaire: parseFloat(r.valeur_unitaire), fournisseur: r.fournisseur }});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.delete('/stock/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM stock_articles WHERE id=$1', [req.params.id]);
    res.json({ message: 'Article supprimé' });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ============================================================
//  AGENDA
// ============================================================
router.get('/agenda', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM agenda_events ORDER BY date, heure');
    res.json({ events: rows.map(r => ({
      id: String(r.id), type: r.type, title: r.title, date: r.date?.toISOString().slice(0,10),
      heure: r.heure, heureFin: r.heure_fin, salarie: r.salarie, lieu: r.lieu, vehicule: r.vehicule, note: r.note
    }))});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.post('/agenda', async (req, res) => {
  try {
    const { type, title, date, heure, heureFin, salarie, lieu, vehicule, note } = req.body;
    const { rows } = await db.query(
      `INSERT INTO agenda_events (type, title, date, heure, heure_fin, salarie, lieu, vehicule, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [type||'rdv', title, date, heure||null, heureFin||null, salarie||null, lieu||null, vehicule||null, note||null]
    );
    const r = rows[0];
    res.status(201).json({ event: { id: String(r.id), type: r.type, title: r.title, date: r.date?.toISOString().slice(0,10), heure: r.heure, heureFin: r.heure_fin, salarie: r.salarie, lieu: r.lieu, vehicule: r.vehicule, note: r.note }});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.delete('/agenda/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM agenda_events WHERE id=$1', [req.params.id]);
    res.json({ message: 'Événement supprimé' });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ============================================================
//  AVIS / RÉPUTATION
// ============================================================
router.get('/avis', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM avis ORDER BY cree_le DESC');
    res.json({ avis: rows.map(r => ({
      id: r.id, client: r.client, artisan: r.artisan, specialite: r.specialite,
      travail: r.travail, note: parseFloat(r.note), recommande: r.recommande,
      verifie: r.verifie, commentaire: r.commentaire, criteres: r.criteres,
      reponse: r.reponse, date: r.cree_le?.toISOString().slice(0,10)
    }))});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.post('/avis/:id/repondre', async (req, res) => {
  try {
    const { reponse } = req.body;
    await db.query('UPDATE avis SET reponse=$1 WHERE id=$2', [reponse, req.params.id]);
    res.json({ message: 'Réponse enregistrée' });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

module.exports = router;
