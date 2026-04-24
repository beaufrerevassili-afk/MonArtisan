// ============================================================
//  patronRoutes.js — ERP Patron
//  Devis Pro, Chantiers, Pipeline Commercial
// ============================================================

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Auto-create missing tables
async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS stock_articles (
      id SERIAL PRIMARY KEY,
      ref VARCHAR(50),
      designation VARCHAR(255),
      categorie VARCHAR(100),
      quantite NUMERIC DEFAULT 0,
      seuil_alerte NUMERIC DEFAULT 0,
      unite VARCHAR(20) DEFAULT 'u',
      valeur_unitaire NUMERIC DEFAULT 0,
      fournisseur VARCHAR(255),
      patron_id INTEGER,
      cree_le TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS agenda_events (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50),
      title VARCHAR(255),
      date DATE,
      heure VARCHAR(10),
      heure_fin VARCHAR(10),
      salarie VARCHAR(255),
      lieu VARCHAR(500),
      vehicule VARCHAR(255),
      note TEXT,
      patron_id INTEGER,
      cree_le TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS avis (
      id SERIAL PRIMARY KEY,
      patron_id INTEGER,
      client_nom VARCHAR(255),
      note INTEGER,
      commentaire TEXT,
      reponse TEXT,
      cree_le TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS profil_entreprise (
      id SERIAL PRIMARY KEY,
      patron_id INTEGER UNIQUE NOT NULL,
      description TEXT,
      specialites TEXT,
      zone_intervention VARCHAR(500),
      certifications JSONB DEFAULT '[]',
      photos JSONB DEFAULT '[]',
      annee_creation VARCHAR(10),
      effectif VARCHAR(50),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS avis_clients (
      id SERIAL PRIMARY KEY,
      patron_id INTEGER NOT NULL,
      client_nom VARCHAR(255),
      client_id INTEGER,
      projet_titre VARCHAR(255),
      note INTEGER CHECK (note >= 1 AND note <= 5),
      commentaire TEXT,
      reponse_patron TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS factures_avoir (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(50),
      facture_origine_id INTEGER,
      facture_origine_numero VARCHAR(50),
      client JSONB,
      motif TEXT,
      lignes JSONB DEFAULT '[]',
      total_ht NUMERIC DEFAULT 0,
      tva NUMERIC DEFAULT 0,
      total_ttc NUMERIC DEFAULT 0,
      statut VARCHAR(20) DEFAULT 'brouillon',
      patron_id INTEGER,
      cree_le TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS bons_commande (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(50),
      fournisseur JSONB,
      chantier_ref VARCHAR(255),
      lignes JSONB DEFAULT '[]',
      total_ht NUMERIC DEFAULT 0,
      tva NUMERIC DEFAULT 0,
      total_ttc NUMERIC DEFAULT 0,
      date_livraison_prevue DATE,
      statut VARCHAR(20) DEFAULT 'brouillon',
      patron_id INTEGER,
      cree_le TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS bons_livraison (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(50),
      bon_commande_id INTEGER,
      fournisseur JSONB,
      chantier_ref VARCHAR(255),
      lignes JSONB DEFAULT '[]',
      date_reception DATE DEFAULT CURRENT_DATE,
      receptionnaire VARCHAR(255),
      observations TEXT,
      conforme BOOLEAN DEFAULT TRUE,
      statut VARCHAR(20) DEFAULT 'recu',
      patron_id INTEGER,
      cree_le TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Bibliothèque d'ouvrages personnalisée
  await db.query(`
    CREATE TABLE IF NOT EXISTS bibliotheque_ouvrages (
      id SERIAL PRIMARY KEY,
      patron_id INTEGER NOT NULL,
      categorie VARCHAR(100),
      description VARCHAR(500) NOT NULL,
      unite VARCHAR(20) DEFAULT 'u',
      prix_unitaire NUMERIC DEFAULT 0,
      tva NUMERIC DEFAULT 10,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Situations de chantier (factures intermédiaires)
  await db.query(`
    CREATE TABLE IF NOT EXISTS situations_chantier (
      id SERIAL PRIMARY KEY,
      devis_id INTEGER,
      devis_numero VARCHAR(50),
      numero_situation INTEGER DEFAULT 1,
      pourcentage NUMERIC DEFAULT 0,
      montant_ht NUMERIC DEFAULT 0,
      tva NUMERIC DEFAULT 0,
      montant_ttc NUMERIC DEFAULT 0,
      cumul_anterieur NUMERIC DEFAULT 0,
      client JSONB,
      statut VARCHAR(20) DEFAULT 'brouillon',
      patron_id INTEGER,
      cree_le TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Add patron_id column if missing (for existing tables)
  await db.query('ALTER TABLE stock_articles ADD COLUMN IF NOT EXISTS patron_id INTEGER').catch(()=>{});
  await db.query('ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS patron_id INTEGER').catch(()=>{});
  await db.query('ALTER TABLE avis ADD COLUMN IF NOT EXISTS patron_id INTEGER').catch(()=>{});
  await db.query('ALTER TABLE devis_pro ADD COLUMN IF NOT EXISTS patron_id INTEGER').catch(()=>{});
}
ensureTables().catch(e => console.error('patronRoutes ensureTables:', e.message));

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
    const result = await db.query('SELECT * FROM devis_pro WHERE patron_id = $1 OR patron_id IS NULL ORDER BY cree_le DESC', [req.user.id]);
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
         (numero, client, titre, lignes, total_ht, tva, total_ttc, validite, validite_date, conditions, statut, envoye_le, signe_le, signature_nom, patron_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'brouillon', NULL, NULL, NULL, $11)
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
        req.user.id,
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
    const sigToken = require('crypto').randomBytes(32).toString('hex');
    const result = await db.query(
      `UPDATE devis_pro SET statut = 'envoyé', envoye_le = NOW(), signature_token = $1 WHERE id = $2 RETURNING *`,
      [sigToken, parseInt(req.params.id)]
    );
    if (!result.rows.length) return res.status(404).json({ erreur: 'Devis introuvable' });

    const devis = mapDevis(result.rows[0]);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.json({
      message: 'Devis marqué comme envoyé',
      lienSignature: `${baseUrl}/devis/${devis.id}/signer?token=${sigToken}`,
      devis,
    });
  } catch (err) {
    console.error('PUT /patron/devis-pro/:id/envoyer :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// Route PUBLIQUE — signature client (protégée par signature_token)
router.post('/devis-pro/:id/signer', async (req, res) => {
  try {
    const devisId = parseInt(req.params.id);
    const { nomSignataire, token } = req.body;

    if (!nomSignataire?.trim() || nomSignataire.trim().length < 2 || nomSignataire.trim().length > 120) {
      return res.status(400).json({ erreur: 'Nom du signataire invalide (2–120 caractères requis)' });
    }
    if (!token) return res.status(400).json({ erreur: 'Token de signature manquant' });

    const existing = await db.query('SELECT statut, signature_token FROM devis_pro WHERE id = $1', [devisId]);
    if (!existing.rows.length) return res.status(404).json({ erreur: 'Devis introuvable' });
    if (existing.rows[0].statut === 'signé') return res.status(400).json({ erreur: 'Ce devis a déjà été signé' });
    if (existing.rows[0].signature_token !== token) return res.status(403).json({ erreur: 'Token invalide' });

    const result = await db.query(
      `UPDATE devis_pro
       SET statut = 'signé', signe_le = NOW(), signature_nom = $1, signature_token = NULL
       WHERE id = $2
       RETURNING *`,
      [nomSignataire.trim(), devisId]
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
    const patronId = req.user?.id;
    const result = await db.query('SELECT * FROM chantiers WHERE (patron_id = $1 OR patron_id IS NULL) AND (statut IS NULL OR statut != \'archive\') ORDER BY cree_le DESC', [patronId]);
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

    const patronId = req.user?.id;
    const patronNom = req.user?.nom || '';
    const result = await db.query(
      `INSERT INTO chantiers
         (nom, client, adresse, chef, statut, avancement, budget_prevu, budget_reel,
          date_debut, date_fin, date_fin_reelle, equipe, description, alertes, patron_id)
       VALUES ($1, $2, $3, $4, 'planifie', 0, $5, 0, $6, $7, NULL, '[]', $8, '[]', $9)
       RETURNING *`,
      [
        nom,
        client || '',
        adresse || '',
        patronNom,
        parseFloat(budgetPrevu),
        dateDebut || null,
        dateFin   || null,
        description || '',
        patronId,
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
    const { rows } = await db.query('SELECT * FROM stock_articles WHERE patron_id=$1 ORDER BY designation', [req.user.id]);
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
      `INSERT INTO stock_articles (ref, designation, categorie, quantite, seuil_alerte, unite, valeur_unitaire, fournisseur, patron_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [ref||null, designation, categorie||'Matériaux', quantite||0, seuilAlerte||0, unite||'u', valeurUnitaire||0, fournisseur||null, req.user.id]
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
       WHERE id=$9 AND patron_id=$10 RETURNING *`,
      [ref||null, designation, categorie||'Matériaux', quantite||0, seuilAlerte||0, unite||'u', valeurUnitaire||0, fournisseur||null, req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Article introuvable' });
    const r = rows[0];
    res.json({ article: { id: r.id, ref: r.ref, designation: r.designation, categorie: r.categorie, quantite: parseFloat(r.quantite), seuilAlerte: parseFloat(r.seuil_alerte), unite: r.unite, valeurUnitaire: parseFloat(r.valeur_unitaire), fournisseur: r.fournisseur }});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.delete('/stock/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM stock_articles WHERE id=$1 AND patron_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Article supprimé' });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ============================================================
//  AGENDA
// ============================================================
router.get('/agenda', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM agenda_events WHERE patron_id=$1 ORDER BY date, heure', [req.user.id]);
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
      `INSERT INTO agenda_events (type, title, date, heure, heure_fin, salarie, lieu, vehicule, note, patron_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [type||'rdv', title, date, heure||null, heureFin||null, salarie||null, lieu||null, vehicule||null, note||null, req.user.id]
    );
    const r = rows[0];
    res.status(201).json({ event: { id: String(r.id), type: r.type, title: r.title, date: r.date?.toISOString().slice(0,10), heure: r.heure, heureFin: r.heure_fin, salarie: r.salarie, lieu: r.lieu, vehicule: r.vehicule, note: r.note }});
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

router.delete('/agenda/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM agenda_events WHERE id=$1 AND patron_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Événement supprimé' });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// ============================================================
//  AVIS / RÉPUTATION
// ============================================================
router.get('/avis', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM avis WHERE patron_id=$1 ORDER BY cree_le DESC', [req.user.id]);
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
    await db.query('UPDATE avis SET reponse=$1 WHERE id=$2 AND patron_id=$3', [reponse, req.params.id, req.user.id]);
    res.json({ message: 'Réponse enregistrée' });
  } catch (err) { res.status(500).json({ erreur: err.message }); }
});

// Auto-archive completed chantiers after 7 days
async function archiveCompletedChantiers() {
  try {
    const { rows } = await db.query(`
      UPDATE chantiers SET statut = 'archive', modifie_le = NOW()
      WHERE statut IN ('terminee', 'complete')
        AND modifie_le < NOW() - INTERVAL '7 days'
        AND statut != 'archive'
      RETURNING id, nom, patron_id
    `);
    if (rows.length > 0) {
      const { notify } = require('../utils/notify');
      // Group by patron
      const byPatron = {};
      rows.forEach(r => { if (!byPatron[r.patron_id]) byPatron[r.patron_id] = []; byPatron[r.patron_id].push(r.nom); });
      for (const [patronId, noms] of Object.entries(byPatron)) {
        await notify(parseInt(patronId), 'system', 'Chantiers archivés',
          `${noms.length} chantier(s) terminé(s) ont été archivés : ${noms.join(', ')}`,
          '/patron/missions'
        );
      }
    }
  } catch (err) {
    console.error('archiveCompletedChantiers:', err.message);
  }
}
setTimeout(archiveCompletedChantiers, 15000);
setInterval(archiveCompletedChantiers, 24 * 60 * 60 * 1000);

// GET /patron/chantiers/archives — archived chantiers
router.get('/chantiers/archives', async (req, res) => {
  try {
    const patronId = req.user?.id;
    const result = await db.query('SELECT * FROM chantiers WHERE (patron_id = $1 OR patron_id IS NULL) AND statut = \'archive\' ORDER BY modifie_le DESC', [patronId]);
    res.json({ chantiers: result.rows.map(mapChantier) });
  } catch (err) {
    console.error('GET /patron/chantiers/archives :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  PROFIL ENTREPRISE (image publique)
// ============================================================

// GET /patron/mon-image — Mon profil entreprise (authentifié)
router.get('/mon-image', async (req, res) => {
  try {
    const { rows: profil } = await db.query('SELECT * FROM profil_entreprise WHERE patron_id = $1', [req.user.id]);
    const { rows: avis } = await db.query('SELECT * FROM avis_clients WHERE patron_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const noteMoyenne = avis.length > 0 ? Math.round(avis.reduce((s, a) => s + a.note, 0) / avis.length * 10) / 10 : null;
    res.json({
      profil: profil[0] || null,
      avis: avis.map(a => ({ id: a.id, clientNom: a.client_nom, projetTitre: a.projet_titre, note: a.note, commentaire: a.commentaire, reponsePatron: a.reponse_patron, creeLe: a.created_at })),
      noteMoyenne,
      nbAvis: avis.length
    });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /patron/mon-image — Mettre à jour mon profil entreprise (authentifié)
router.put('/mon-image', async (req, res) => {
  try {
    const { description, specialites, zoneIntervention, certifications, photos, anneeCreation, effectif } = req.body;
    // Photos are base64 strings, limit total size
    if (photos && JSON.stringify(photos).length > 2000000) return res.status(400).json({ erreur: 'Photos trop volumineuses (max 2 Mo total)' });

    const { rows: existing } = await db.query('SELECT id FROM profil_entreprise WHERE patron_id = $1', [req.user.id]);
    if (existing.length > 0) {
      await db.query(`UPDATE profil_entreprise SET description=$1, specialites=$2, zone_intervention=$3, certifications=$4, photos=$5, annee_creation=$6, effectif=$7, updated_at=NOW() WHERE patron_id=$8`,
        [description, specialites, zoneIntervention, JSON.stringify(certifications || []), JSON.stringify(photos || []), anneeCreation, effectif, req.user.id]);
    } else {
      await db.query(`INSERT INTO profil_entreprise (patron_id, description, specialites, zone_intervention, certifications, photos, annee_creation, effectif) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [req.user.id, description, specialites, zoneIntervention, JSON.stringify(certifications || []), JSON.stringify(photos || []), anneeCreation, effectif]);
    }
    res.json({ message: 'Profil mis à jour' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// PUT /patron/avis-client/:id/repondre — Répondre à un avis client (authentifié)
router.put('/avis-client/:id/repondre', async (req, res) => {
  try {
    const { reponse } = req.body;
    if (!reponse?.trim()) return res.status(400).json({ erreur: 'Réponse requise' });
    const { rows } = await db.query('UPDATE avis_clients SET reponse_patron = $1 WHERE id = $2 AND patron_id = $3 RETURNING *', [reponse.trim(), req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Avis introuvable' });
    res.json({ message: 'Réponse enregistrée' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  FACTURES D'AVOIR
// ============================================================

// GET /patron/avoirs
router.get('/avoirs', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM factures_avoir WHERE patron_id = $1 ORDER BY cree_le DESC', [req.user.id]);
    res.json({ avoirs: rows.map(r => ({ id: r.id, numero: r.numero, factureOrigineNumero: r.facture_origine_numero, client: r.client, motif: r.motif, lignes: r.lignes, totalHT: r.total_ht, tva: r.tva, totalTTC: r.total_ttc, statut: r.statut, creeLe: r.cree_le })) });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// POST /patron/avoirs
router.post('/avoirs', async (req, res) => {
  try {
    const { factureOrigineNumero, client, motif, lignes, totalHT, tva, totalTTC } = req.body;
    if (!client?.nom || !motif) return res.status(400).json({ erreur: 'Client et motif requis' });
    const annee = new Date().getFullYear();
    const countRes = await db.query(`SELECT COUNT(*)+1 AS n FROM factures_avoir WHERE patron_id = $1 AND EXTRACT(year FROM cree_le) = $2`, [req.user.id, annee]);
    const numero = `AV-${annee}-${String(parseInt(countRes.rows[0].n)).padStart(3, '0')}`;
    const { rows } = await db.query(`INSERT INTO factures_avoir (numero, facture_origine_numero, client, motif, lignes, total_ht, tva, total_ttc, patron_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [numero, factureOrigineNumero || null, JSON.stringify(client), motif, JSON.stringify(lignes || []), totalHT || 0, tva || 0, totalTTC || 0, req.user.id]);
    res.status(201).json({ avoir: rows[0], message: 'Facture d\'avoir créée' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// DELETE /patron/avoirs/:id
router.delete('/avoirs/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM factures_avoir WHERE id = $1 AND patron_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Avoir supprimé' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// ============================================================
//  BONS DE COMMANDE
// ============================================================

// GET /patron/bons-commande
router.get('/bons-commande', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bons_commande WHERE patron_id = $1 ORDER BY cree_le DESC', [req.user.id]);
    res.json({ bons: rows.map(r => ({ id: r.id, numero: r.numero, fournisseur: r.fournisseur, chantierRef: r.chantier_ref, lignes: r.lignes, totalHT: r.total_ht, tva: r.tva, totalTTC: r.total_ttc, dateLivraisonPrevue: r.date_livraison_prevue, statut: r.statut, creeLe: r.cree_le })) });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// POST /patron/bons-commande
router.post('/bons-commande', async (req, res) => {
  try {
    const { fournisseur, chantierRef, lignes, totalHT, tva, totalTTC, dateLivraisonPrevue } = req.body;
    if (!fournisseur?.nom) return res.status(400).json({ erreur: 'Fournisseur requis' });
    const annee = new Date().getFullYear();
    const countRes = await db.query(`SELECT COUNT(*)+1 AS n FROM bons_commande WHERE patron_id = $1 AND EXTRACT(year FROM cree_le) = $2`, [req.user.id, annee]);
    const numero = `BC-${annee}-${String(parseInt(countRes.rows[0].n)).padStart(3, '0')}`;
    const { rows } = await db.query(`INSERT INTO bons_commande (numero, fournisseur, chantier_ref, lignes, total_ht, tva, total_ttc, date_livraison_prevue, patron_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [numero, JSON.stringify(fournisseur), chantierRef || null, JSON.stringify(lignes || []), totalHT || 0, tva || 0, totalTTC || 0, dateLivraisonPrevue || null, req.user.id]);
    res.status(201).json({ bon: rows[0], message: 'Bon de commande créé' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// PUT /patron/bons-commande/:id/statut
router.put('/bons-commande/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const { rows } = await db.query('UPDATE bons_commande SET statut = $1 WHERE id = $2 AND patron_id = $3 RETURNING *', [statut, req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ erreur: 'Bon introuvable' });
    res.json({ message: 'Statut mis à jour' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// DELETE /patron/bons-commande/:id
router.delete('/bons-commande/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bons_commande WHERE id = $1 AND patron_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Bon supprimé' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// ============================================================
//  BONS DE LIVRAISON
// ============================================================

// GET /patron/bons-livraison
router.get('/bons-livraison', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bons_livraison WHERE patron_id = $1 ORDER BY cree_le DESC', [req.user.id]);
    res.json({ bons: rows.map(r => ({ id: r.id, numero: r.numero, bonCommandeId: r.bon_commande_id, fournisseur: r.fournisseur, chantierRef: r.chantier_ref, lignes: r.lignes, dateReception: r.date_reception, receptionnaire: r.receptionnaire, observations: r.observations, conforme: r.conforme, statut: r.statut, creeLe: r.cree_le })) });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// POST /patron/bons-livraison
router.post('/bons-livraison', async (req, res) => {
  try {
    const { bonCommandeId, fournisseur, chantierRef, lignes, dateReception, receptionnaire, observations, conforme } = req.body;
    if (!fournisseur?.nom) return res.status(400).json({ erreur: 'Fournisseur requis' });
    const annee = new Date().getFullYear();
    const countRes = await db.query(`SELECT COUNT(*)+1 AS n FROM bons_livraison WHERE patron_id = $1 AND EXTRACT(year FROM cree_le) = $2`, [req.user.id, annee]);
    const numero = `BL-${annee}-${String(parseInt(countRes.rows[0].n)).padStart(3, '0')}`;
    const { rows } = await db.query(`INSERT INTO bons_livraison (numero, bon_commande_id, fournisseur, chantier_ref, lignes, date_reception, receptionnaire, observations, conforme, patron_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [numero, bonCommandeId || null, JSON.stringify(fournisseur), chantierRef || null, JSON.stringify(lignes || []), dateReception || new Date().toISOString().slice(0,10), receptionnaire || null, observations || null, conforme !== false, req.user.id]);
    res.status(201).json({ bon: rows[0], message: 'Bon de livraison créé' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// DELETE /patron/bons-livraison/:id
router.delete('/bons-livraison/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bons_livraison WHERE id = $1 AND patron_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Bon supprimé' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// ============================================================
//  AUTO-RELANCE DEVIS SANS RÉPONSE (7 JOURS)
// ============================================================
async function checkDevisRelance() {
  try {
    const { notify } = require('../utils/notify');
    const { rows } = await db.query(`
      SELECT id, numero, titre, client, patron_id
      FROM devis_pro
      WHERE statut = 'envoyé'
        AND envoye_le < NOW() - INTERVAL '7 days'
        AND envoye_le > NOW() - INTERVAL '8 days'
    `);
    for (const d of rows) {
      const clientNom = typeof d.client === 'string' ? d.client : (d.client?.nom || 'Client');
      await notify(d.patron_id, 'devis', 'Devis sans réponse',
        `Le devis ${d.numero} envoyé à ${clientNom} n'a pas été signé depuis 7 jours. Pensez à relancer !`,
        '/patron/devis-factures'
      ).catch(() => {});
    }
  } catch (err) {
    console.error('checkDevisRelance:', err.message);
  }
}
setTimeout(checkDevisRelance, 20000);
setInterval(checkDevisRelance, 24 * 60 * 60 * 1000);

// ============================================================
//  BIBLIOTHÈQUE D'OUVRAGES PERSONNALISÉE
// ============================================================

// GET /patron/bibliotheque
router.get('/bibliotheque', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bibliotheque_ouvrages WHERE patron_id = $1 ORDER BY categorie, description', [req.user.id]);
    res.json({ ouvrages: rows.map(r => ({ id: r.id, categorie: r.categorie, description: r.description, unite: r.unite, prixUnitaire: parseFloat(r.prix_unitaire), tva: parseFloat(r.tva) })) });
  } catch { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// POST /patron/bibliotheque
router.post('/bibliotheque', async (req, res) => {
  try {
    const { categorie, description, unite, prixUnitaire, tva } = req.body;
    if (!description) return res.status(400).json({ erreur: 'Description requise' });
    const { rows } = await db.query('INSERT INTO bibliotheque_ouvrages (patron_id, categorie, description, unite, prix_unitaire, tva) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.id, categorie || 'Divers', description, unite || 'u', prixUnitaire || 0, tva || 10]);
    res.status(201).json({ ouvrage: rows[0] });
  } catch { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// DELETE /patron/bibliotheque/:id
router.delete('/bibliotheque/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bibliotheque_ouvrages WHERE id = $1 AND patron_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Supprimé' });
  } catch { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// ============================================================
//  SITUATIONS DE CHANTIER (factures intermédiaires)
// ============================================================

// GET /patron/situations
router.get('/situations', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM situations_chantier WHERE patron_id = $1 ORDER BY cree_le DESC', [req.user.id]);
    res.json({ situations: rows });
  } catch { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

// POST /patron/situations — Create a situation from a signed devis
router.post('/situations', async (req, res) => {
  try {
    const { devisId, devisNumero, pourcentage, client } = req.body;
    if (!pourcentage) return res.status(400).json({ erreur: 'Pourcentage requis' });

    // Get previous situations for this devis
    const { rows: prev } = await db.query('SELECT COALESCE(SUM(pourcentage), 0) as cumul FROM situations_chantier WHERE devis_id = $1', [devisId]);
    const cumulAnterieur = parseFloat(prev[0].cumul) || 0;
    if (cumulAnterieur + parseFloat(pourcentage) > 100) return res.status(400).json({ erreur: 'Le cumul dépasse 100%' });

    // Get devis total
    const { rows: devisRows } = await db.query('SELECT total_ht, tva, total_ttc FROM devis_pro WHERE id = $1', [devisId]);
    const devisTotals = devisRows[0] || { total_ht: 0, tva: 0, total_ttc: 0 };

    const pct = parseFloat(pourcentage) / 100;
    const montantHT = Math.round(parseFloat(devisTotals.total_ht) * pct * 100) / 100;
    const tvaMontant = Math.round(parseFloat(devisTotals.tva) * pct * 100) / 100;
    const montantTTC = montantHT + tvaMontant;

    const numSit = Math.floor(cumulAnterieur / 10) + 1;

    const { rows } = await db.query(`
      INSERT INTO situations_chantier (devis_id, devis_numero, numero_situation, pourcentage, montant_ht, tva, montant_ttc, cumul_anterieur, client, patron_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
    `, [devisId, devisNumero, numSit, pourcentage, montantHT, tvaMontant, montantTTC, cumulAnterieur, JSON.stringify(client || {}), req.user.id]);

    res.status(201).json({ situation: rows[0], message: 'Situation créée' });
  } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
});

module.exports = router;
