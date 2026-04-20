// ============================================================
//  immoRoutes.js — Module Immobilier / Gestion SCI
//  SCIs, Biens, Locataires, Paiements, Dépenses, Crédits,
//  Associés, Banque, Candidatures, Travaux, Comptabilité SCI,
//  Déclarations fiscales (2072, 2065, 2044)
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// ─── Migration auto des tables ───────────────────────────────
async function ensureImmoTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS immo_scis (
      id            SERIAL PRIMARY KEY,
      patron_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      nom           TEXT NOT NULL,
      type          TEXT NOT NULL DEFAULT 'IR',
      parts         INTEGER DEFAULT 100,
      tva           BOOLEAN DEFAULT false,
      cloture       TEXT DEFAULT '31/12',
      siret         TEXT,
      cree_le       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_biens (
      id              SERIAL PRIMARY KEY,
      patron_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sci_id          INTEGER REFERENCES immo_scis(id) ON DELETE SET NULL,
      nom             TEXT NOT NULL,
      type            TEXT DEFAULT 'Appartement',
      adresse         TEXT,
      surface         NUMERIC(10,2),
      pieces          INTEGER,
      prix_achat      NUMERIC(12,2),
      frais_notaire   NUMERIC(10,2),
      travaux         NUMERIC(10,2) DEFAULT 0,
      date_acquisition DATE,
      valeur          NUMERIC(12,2),
      loyer           NUMERIC(10,2),
      autres_revenus  NUMERIC(10,2) DEFAULT 0,
      charges         NUMERIC(10,2) DEFAULT 0,
      charges_non_recup NUMERIC(10,2) DEFAULT 0,
      vacance_locative NUMERIC(5,2) DEFAULT 0,
      locataire_id    INTEGER,
      dpe             TEXT DEFAULT 'D',
      loyer_ref       NUMERIC(10,2),
      assurance_pno   NUMERIC(10,2) DEFAULT 0,
      assurance_gli   NUMERIC(10,2) DEFAULT 0,
      taxe_fonciere   NUMERIC(10,2) DEFAULT 0,
      meuble          BOOLEAN DEFAULT false,
      publie          BOOLEAN DEFAULT false,
      description     TEXT,
      photos          JSONB DEFAULT '[]',
      cree_le         TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_locataires (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id     INTEGER REFERENCES immo_biens(id) ON DELETE SET NULL,
      nom         TEXT NOT NULL,
      prenom      TEXT,
      email       TEXT,
      tel         TEXT,
      debut       DATE,
      fin         DATE,
      depot       NUMERIC(10,2) DEFAULT 0,
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_paiements (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id     INTEGER REFERENCES immo_biens(id) ON DELETE CASCADE,
      mois        TEXT NOT NULL,
      montant     NUMERIC(10,2) NOT NULL,
      date        DATE,
      statut      TEXT DEFAULT 'paye',
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_depenses (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id     INTEGER REFERENCES immo_biens(id) ON DELETE CASCADE,
      cat         TEXT,
      description TEXT,
      montant     NUMERIC(10,2) NOT NULL,
      date        DATE,
      deductible  BOOLEAN DEFAULT true,
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_credits (
      id              SERIAL PRIMARY KEY,
      patron_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id         INTEGER REFERENCES immo_biens(id) ON DELETE SET NULL,
      banque          TEXT,
      montant         NUMERIC(12,2),
      duree           INTEGER,
      taux            NUMERIC(5,3),
      mensualite      NUMERIC(10,2),
      assurance_credit NUMERIC(10,2) DEFAULT 0,
      debut           DATE,
      restant         NUMERIC(12,2),
      cree_le         TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_associes (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sci_id      INTEGER REFERENCES immo_scis(id) ON DELETE CASCADE,
      nom         TEXT NOT NULL,
      parts       INTEGER DEFAULT 0,
      role        TEXT DEFAULT 'Associé',
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_banque (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id     INTEGER,
      date        DATE,
      label       TEXT,
      montant     NUMERIC(10,2),
      rapproche   BOOLEAN DEFAULT false,
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_candidatures (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id     INTEGER REFERENCES immo_biens(id) ON DELETE CASCADE,
      nom         TEXT NOT NULL,
      prenom      TEXT,
      email       TEXT,
      tel         TEXT,
      message     TEXT,
      revenus     NUMERIC(10,2),
      statut      TEXT DEFAULT 'nouvelle',
      date        DATE DEFAULT CURRENT_DATE,
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_travaux (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id     INTEGER REFERENCES immo_biens(id) ON DELETE CASCADE,
      type        TEXT,
      description TEXT,
      statut      TEXT DEFAULT 'planifie',
      artisan     TEXT,
      devis       NUMERIC(10,2),
      facture     NUMERIC(10,2),
      date        DATE,
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_ecritures (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sci_id      INTEGER REFERENCES immo_scis(id) ON DELETE CASCADE,
      bien_id     INTEGER,
      date        DATE NOT NULL,
      journal     TEXT DEFAULT 'OD',
      compte      TEXT NOT NULL,
      libelle     TEXT NOT NULL,
      debit       NUMERIC(12,2) DEFAULT 0,
      credit      NUMERIC(12,2) DEFAULT 0,
      piece       TEXT,
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS immo_courriers (
      id          SERIAL PRIMARY KEY,
      patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bien_id     INTEGER,
      locataire_id INTEGER,
      type        TEXT,
      objet       TEXT,
      contenu     TEXT,
      date        DATE DEFAULT CURRENT_DATE,
      cree_le     TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Indexes
  await db.query(`CREATE INDEX IF NOT EXISTS idx_immo_biens_patron ON immo_biens(patron_id)`).catch(() => {});
  await db.query(`CREATE INDEX IF NOT EXISTS idx_immo_paiements_bien ON immo_paiements(bien_id)`).catch(() => {});
  await db.query(`CREATE INDEX IF NOT EXISTS idx_immo_depenses_bien ON immo_depenses(bien_id)`).catch(() => {});
  await db.query(`CREATE INDEX IF NOT EXISTS idx_immo_ecritures_sci ON immo_ecritures(sci_id)`).catch(() => {});
}
ensureImmoTables().catch(e => console.error('immo ensureTables:', e.message));

// ─── CRUD générique pour tables immo ─────────────────────────
function immoCrud(table, responseKey) {
  const key = responseKey || table.replace('immo_', '');

  router.get(`/${key}`, async (req, res) => {
    try {
      const { rows } = await db.query(`SELECT * FROM ${table} WHERE patron_id = $1 ORDER BY cree_le DESC`, [req.user.id]);
      res.json({ [key]: rows });
    } catch (err) { console.error(`GET /immo/${key}:`, err.message); res.status(500).json({ erreur: 'Erreur serveur' }); }
  });

  router.get(`/${key}/:id`, async (req, res) => {
    try {
      const { rows } = await db.query(`SELECT * FROM ${table} WHERE id = $1 AND patron_id = $2`, [req.params.id, req.user.id]);
      if (!rows[0]) return res.status(404).json({ erreur: 'Non trouvé' });
      res.json(rows[0]);
    } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
  });

  router.post(`/${key}`, async (req, res) => {
    try {
      const data = req.body;
      const cols = Object.keys(data).filter(k => k !== 'id' && k !== 'cree_le');
      const validCol = /^[a-z][a-z0-9_]*$/;
      if (!cols.every(c => validCol.test(c.replace(/([A-Z])/g, '_$1').toLowerCase()))) {
        return res.status(400).json({ erreur: 'Nom de colonne invalide' });
      }
      const vals = cols.map(k => data[k]);
      cols.push('patron_id'); vals.push(req.user.id);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
      const colNames = cols.map(c => c.replace(/([A-Z])/g, '_$1').toLowerCase()).join(',');
      const { rows } = await db.query(`INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) RETURNING *`, vals);
      res.status(201).json({ message: 'Créé', item: rows[0] });
    } catch (err) { console.error(`POST /immo/${key}:`, err.message); res.status(500).json({ erreur: 'Erreur serveur' }); }
  });

  router.put(`/${key}/:id`, async (req, res) => {
    try {
      const data = req.body;
      const cols = Object.keys(data).filter(k => k !== 'id' && k !== 'cree_le' && k !== 'patron_id');
      if (!cols.length) return res.status(400).json({ erreur: 'Rien à mettre à jour' });
      const validCol = /^[a-z][a-z0-9_]*$/;
      if (!cols.every(c => validCol.test(c.replace(/([A-Z])/g, '_$1').toLowerCase()))) {
        return res.status(400).json({ erreur: 'Nom de colonne invalide' });
      }
      const sets = cols.map((c, i) => `${c.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`).join(', ');
      const vals = cols.map(k => data[k]);
      vals.push(req.params.id, req.user.id);
      const { rows } = await db.query(`UPDATE ${table} SET ${sets} WHERE id = $${vals.length - 1} AND patron_id = $${vals.length} RETURNING *`, vals);
      if (!rows[0]) return res.status(404).json({ erreur: 'Non trouvé' });
      res.json({ message: 'Mis à jour', item: rows[0] });
    } catch (err) { console.error(`PUT /immo/${key}/:id:`, err.message); res.status(500).json({ erreur: 'Erreur serveur' }); }
  });

  router.delete(`/${key}/:id`, async (req, res) => {
    try {
      const { rowCount } = await db.query(`DELETE FROM ${table} WHERE id = $1 AND patron_id = $2`, [req.params.id, req.user.id]);
      if (!rowCount) return res.status(404).json({ erreur: 'Non trouvé' });
      res.json({ message: 'Supprimé' });
    } catch (err) { res.status(500).json({ erreur: 'Erreur serveur' }); }
  });
}

// ── Enregistrer les CRUD ──
immoCrud('immo_scis', 'scis');
immoCrud('immo_biens', 'biens');
immoCrud('immo_locataires', 'locataires');
immoCrud('immo_paiements', 'paiements');
immoCrud('immo_depenses', 'depenses');
immoCrud('immo_credits', 'credits');
immoCrud('immo_associes', 'associes');
immoCrud('immo_banque', 'banque');
immoCrud('immo_candidatures', 'candidatures');
immoCrud('immo_travaux', 'travaux');
immoCrud('immo_ecritures', 'ecritures');
immoCrud('immo_courriers', 'courriers');

// ═══════════════════════════════════════════════════════════════
//  COMPTABILITÉ SCI — Plan comptable, bilan, compte de résultat
// ═══════════════════════════════════════════════════════════════

const PLAN_COMPTABLE_SCI = {
  '2': { label: 'Immobilisations', comptes: [
    { code: '211', label: 'Terrains' },
    { code: '213', label: 'Constructions' },
    { code: '2135', label: 'Aménagements' },
    { code: '2813', label: 'Amort. constructions' },
  ]},
  '4': { label: 'Tiers', comptes: [
    { code: '401', label: 'Fournisseurs' },
    { code: '411', label: 'Locataires (créances)' },
    { code: '4551', label: 'Associés - comptes courants' },
    { code: '4456', label: 'TVA déductible' },
    { code: '4457', label: 'TVA collectée' },
  ]},
  '5': { label: 'Financier', comptes: [
    { code: '512', label: 'Banque' },
    { code: '530', label: 'Caisse' },
  ]},
  '6': { label: 'Charges', comptes: [
    { code: '6132', label: 'Locations immobilières' },
    { code: '614', label: 'Charges locatives' },
    { code: '6155', label: 'Entretien et réparations' },
    { code: '616', label: 'Assurances' },
    { code: '6226', label: 'Honoraires (gestion, comptable)' },
    { code: '6311', label: 'Taxe foncière' },
    { code: '6611', label: 'Intérêts emprunts' },
    { code: '6612', label: 'Assurance emprunt' },
    { code: '6811', label: 'Dotations amortissements' },
    { code: '6871', label: 'Provisions pour dépréciation' },
  ]},
  '7': { label: 'Produits', comptes: [
    { code: '706', label: 'Loyers encaissés' },
    { code: '708', label: 'Charges refacturées' },
    { code: '7588', label: 'Autres produits' },
  ]},
};

// GET /immo/comptabilite/plan — Plan comptable SCI
router.get('/comptabilite/plan', (req, res) => {
  res.json({ planComptable: PLAN_COMPTABLE_SCI });
});

// GET /immo/comptabilite/bilan/:sciId — Bilan simplifié
router.get('/comptabilite/bilan/:sciId', async (req, res) => {
  try {
    const patronId = req.user.id;
    const sciId = req.params.sciId;

    // Vérifier propriété
    const sci = await db.query('SELECT * FROM immo_scis WHERE id = $1 AND patron_id = $2', [sciId, patronId]);
    if (!sci.rows[0]) return res.status(404).json({ erreur: 'SCI non trouvée' });

    // Biens de la SCI
    const biens = await db.query('SELECT * FROM immo_biens WHERE sci_id = $1 AND patron_id = $2', [sciId, patronId]);
    const totalAchat = biens.rows.reduce((s, b) => s + parseFloat(b.prix_achat || 0), 0);
    const totalFrais = biens.rows.reduce((s, b) => s + parseFloat(b.frais_notaire || 0), 0);
    const totalTravaux = biens.rows.reduce((s, b) => s + parseFloat(b.travaux || 0), 0);
    const totalValeur = biens.rows.reduce((s, b) => s + parseFloat(b.valeur || 0), 0);

    // Crédits
    const credits = await db.query('SELECT * FROM immo_credits WHERE bien_id = ANY(SELECT id FROM immo_biens WHERE sci_id = $1) AND patron_id = $2', [sciId, patronId]);
    const totalDette = credits.rows.reduce((s, c) => s + parseFloat(c.restant || 0), 0);

    // Comptes courants associés
    const associes = await db.query('SELECT * FROM immo_associes WHERE sci_id = $1 AND patron_id = $2', [sciId, patronId]);

    // Trésorerie (solde banque)
    const banque = await db.query('SELECT COALESCE(SUM(montant), 0) as solde FROM immo_banque WHERE patron_id = $1', [patronId]);
    const tresorerie = parseFloat(banque.rows[0].solde || 0);

    // Amortissements (SCI IS uniquement)
    const isIS = sci.rows[0].type === 'IS';
    const dureeAmort = 25; // 25 ans standard construction
    const amortAnnuel = isIS ? Math.round((totalAchat - totalFrais * 0.15) / dureeAmort) : 0; // terrain ~15% non amortissable

    const actif = {
      immobilisations: { brut: totalAchat + totalFrais + totalTravaux, amortissements: amortAnnuel, net: totalAchat + totalFrais + totalTravaux - amortAnnuel },
      tresorerie,
      total: totalAchat + totalFrais + totalTravaux - amortAnnuel + tresorerie,
    };

    const passif = {
      capitaux: { capital: sci.rows[0].parts * 1, reserves: 0 },
      dettes: { emprunts: totalDette, fournisseurs: 0 },
      total: sci.rows[0].parts * 1 + totalDette,
    };

    res.json({
      sci: sci.rows[0],
      bilan: { actif, passif },
      biens: biens.rows,
      credits: credits.rows,
      associes: associes.rows,
      valeurPatrimoine: totalValeur,
    });
  } catch (err) {
    console.error('GET /comptabilite/bilan:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /immo/comptabilite/resultat/:sciId?annee=2026 — Compte de résultat
router.get('/comptabilite/resultat/:sciId', async (req, res) => {
  try {
    const patronId = req.user.id;
    const sciId = req.params.sciId;
    const annee = req.query.annee || new Date().getFullYear();

    const sci = await db.query('SELECT * FROM immo_scis WHERE id = $1 AND patron_id = $2', [sciId, patronId]);
    if (!sci.rows[0]) return res.status(404).json({ erreur: 'SCI non trouvée' });

    // Biens de la SCI
    const biens = await db.query('SELECT * FROM immo_biens WHERE sci_id = $1 AND patron_id = $2', [sciId, patronId]);
    const bienIds = biens.rows.map(b => b.id);

    // Produits : loyers encaissés
    let totalLoyers = 0, totalChargesRefact = 0;
    if (bienIds.length > 0) {
      const paiements = await db.query(
        `SELECT COALESCE(SUM(montant), 0) as total FROM immo_paiements WHERE bien_id = ANY($1) AND patron_id = $2 AND mois LIKE $3 AND statut = 'paye'`,
        [bienIds, patronId, `${annee}%`]
      );
      totalLoyers = parseFloat(paiements.rows[0].total || 0);
      totalChargesRefact = biens.rows.reduce((s, b) => s + parseFloat(b.charges || 0) * 12, 0);
    }

    // Charges
    let totalDepenses = 0, depensesParCat = {};
    if (bienIds.length > 0) {
      const depenses = await db.query(
        `SELECT * FROM immo_depenses WHERE bien_id = ANY($1) AND patron_id = $2 AND EXTRACT(YEAR FROM date) = $3`,
        [bienIds, patronId, annee]
      );
      depenses.rows.forEach(d => {
        const m = parseFloat(d.montant || 0);
        totalDepenses += m;
        depensesParCat[d.cat || 'Autre'] = (depensesParCat[d.cat || 'Autre'] || 0) + m;
      });
    }

    // Intérêts d'emprunt
    const credits = await db.query(
      `SELECT * FROM immo_credits WHERE bien_id = ANY($1::int[]) AND patron_id = $2`,
      [bienIds.length > 0 ? bienIds : [0], patronId]
    );
    const totalInterets = credits.rows.reduce((s, c) => {
      const taux = parseFloat(c.taux || 0) / 100;
      const restant = parseFloat(c.restant || 0);
      return s + restant * taux;
    }, 0);
    const totalAssuranceCredit = credits.rows.reduce((s, c) => s + parseFloat(c.assurance_credit || 0) * 12, 0);

    // Taxes foncières
    const totalTaxeFonciere = biens.rows.reduce((s, b) => s + parseFloat(b.taxe_fonciere || 0), 0);

    // Assurances PNO
    const totalAssurancePNO = biens.rows.reduce((s, b) => s + parseFloat(b.assurance_pno || 0), 0);

    // Amortissements (IS uniquement)
    const isIS = sci.rows[0].type === 'IS';
    const totalAchat = biens.rows.reduce((s, b) => s + parseFloat(b.prix_achat || 0), 0);
    const amortAnnuel = isIS ? Math.round((totalAchat * 0.85) / 25) : 0;

    const produits = {
      loyers: totalLoyers,
      chargesRefacturees: totalChargesRefact,
      total: totalLoyers + totalChargesRefact,
    };

    const charges = {
      taxeFonciere: totalTaxeFonciere,
      assurancePNO: totalAssurancePNO,
      interetsEmprunt: Math.round(totalInterets),
      assuranceCredit: totalAssuranceCredit,
      depensesEntretien: totalDepenses,
      amortissements: amortAnnuel,
      detailDepenses: depensesParCat,
      total: totalTaxeFonciere + totalAssurancePNO + Math.round(totalInterets) + totalAssuranceCredit + totalDepenses + amortAnnuel,
    };

    const resultat = produits.total - charges.total;

    res.json({
      sci: sci.rows[0],
      annee: parseInt(annee),
      produits,
      charges,
      resultat,
      isDeficitaire: resultat < 0,
    });
  } catch (err) {
    console.error('GET /comptabilite/resultat:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  DÉCLARATIONS FISCALES — 2072 (SCI IR), 2065 (SCI IS), 2044
// ═══════════════════════════════════════════════════════════════

// GET /immo/fiscal/2072/:sciId?annee=2026 — Déclaration 2072 (SCI IR)
router.get('/fiscal/2072/:sciId', async (req, res) => {
  try {
    const patronId = req.user.id;
    const sciId = req.params.sciId;
    const annee = req.query.annee || new Date().getFullYear() - 1;

    const sci = await db.query('SELECT * FROM immo_scis WHERE id = $1 AND patron_id = $2 AND type = $3', [sciId, patronId, 'IR']);
    if (!sci.rows[0]) return res.status(404).json({ erreur: 'SCI IR non trouvée' });

    const biens = await db.query('SELECT * FROM immo_biens WHERE sci_id = $1 AND patron_id = $2', [sciId, patronId]);
    const bienIds = biens.rows.map(b => b.id);

    // Revenus bruts
    let revenusBruts = 0;
    if (bienIds.length > 0) {
      const p = await db.query(`SELECT COALESCE(SUM(montant), 0) as t FROM immo_paiements WHERE bien_id = ANY($1) AND patron_id = $2 AND mois LIKE $3 AND statut = 'paye'`, [bienIds, patronId, `${annee}%`]);
      revenusBruts = parseFloat(p.rows[0].t || 0);
    }

    // Charges déductibles
    let chargesDeductibles = 0;
    if (bienIds.length > 0) {
      const d = await db.query(`SELECT COALESCE(SUM(montant), 0) as t FROM immo_depenses WHERE bien_id = ANY($1) AND patron_id = $2 AND EXTRACT(YEAR FROM date) = $3 AND deductible = true`, [bienIds, patronId, annee]);
      chargesDeductibles = parseFloat(d.rows[0].t || 0);
    }

    const taxeFonciere = biens.rows.reduce((s, b) => s + parseFloat(b.taxe_fonciere || 0), 0);
    const assurancePNO = biens.rows.reduce((s, b) => s + parseFloat(b.assurance_pno || 0), 0);

    const credits = await db.query(`SELECT * FROM immo_credits WHERE bien_id = ANY($1::int[]) AND patron_id = $2`, [bienIds.length > 0 ? bienIds : [0], patronId]);
    const interets = credits.rows.reduce((s, c) => s + parseFloat(c.restant || 0) * (parseFloat(c.taux || 0) / 100), 0);

    const totalCharges = chargesDeductibles + taxeFonciere + assurancePNO + Math.round(interets);
    const revenuNet = revenusBruts - totalCharges;

    // Répartition par associé
    const associes = await db.query('SELECT * FROM immo_associes WHERE sci_id = $1 AND patron_id = $2', [sciId, patronId]);
    const totalParts = associes.rows.reduce((s, a) => s + (a.parts || 0), 0) || 1;

    const repartition = associes.rows.map(a => ({
      nom: a.nom,
      parts: a.parts,
      pourcentage: Math.round(a.parts / totalParts * 100),
      revenuImposable: Math.round(revenuNet * a.parts / totalParts),
    }));

    res.json({
      declaration: '2072',
      annee: parseInt(annee),
      sci: sci.rows[0],
      lignes: {
        L1_revenusBruts: revenusBruts,
        L2_fraisAdministration: Math.round(chargesDeductibles * 0.2),
        L3_travauxEntretien: Math.round(chargesDeductibles * 0.8),
        L4_taxeFonciere: taxeFonciere,
        L5_assurances: assurancePNO,
        L6_interetsEmprunt: Math.round(interets),
        L7_totalCharges: totalCharges,
        L8_revenuNet: revenuNet,
      },
      repartition,
      biens: biens.rows.map(b => ({ id: b.id, nom: b.nom, adresse: b.adresse, loyer: parseFloat(b.loyer || 0) })),
    });
  } catch (err) {
    console.error('GET /fiscal/2072:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /immo/fiscal/2065/:sciId?annee=2026 — Déclaration 2065 (SCI IS)
router.get('/fiscal/2065/:sciId', async (req, res) => {
  try {
    const patronId = req.user.id;
    const sciId = req.params.sciId;
    const annee = req.query.annee || new Date().getFullYear() - 1;

    const sci = await db.query('SELECT * FROM immo_scis WHERE id = $1 AND patron_id = $2 AND type = $3', [sciId, patronId, 'IS']);
    if (!sci.rows[0]) return res.status(404).json({ erreur: 'SCI IS non trouvée' });

    const biens = await db.query('SELECT * FROM immo_biens WHERE sci_id = $1 AND patron_id = $2', [sciId, patronId]);
    const bienIds = biens.rows.map(b => b.id);

    // CA (loyers)
    let ca = 0;
    if (bienIds.length > 0) {
      const p = await db.query(`SELECT COALESCE(SUM(montant), 0) as t FROM immo_paiements WHERE bien_id = ANY($1) AND patron_id = $2 AND mois LIKE $3 AND statut = 'paye'`, [bienIds, patronId, `${annee}%`]);
      ca = parseFloat(p.rows[0].t || 0);
    }

    // Charges
    let totalDepenses = 0;
    if (bienIds.length > 0) {
      const d = await db.query(`SELECT COALESCE(SUM(montant), 0) as t FROM immo_depenses WHERE bien_id = ANY($1) AND patron_id = $2 AND EXTRACT(YEAR FROM date) = $3`, [bienIds, patronId, annee]);
      totalDepenses = parseFloat(d.rows[0].t || 0);
    }

    const taxeFonciere = biens.rows.reduce((s, b) => s + parseFloat(b.taxe_fonciere || 0), 0);
    const assurancePNO = biens.rows.reduce((s, b) => s + parseFloat(b.assurance_pno || 0), 0);
    const totalAchat = biens.rows.reduce((s, b) => s + parseFloat(b.prix_achat || 0), 0);

    const credits = await db.query(`SELECT * FROM immo_credits WHERE bien_id = ANY($1::int[]) AND patron_id = $2`, [bienIds.length > 0 ? bienIds : [0], patronId]);
    const interets = credits.rows.reduce((s, c) => s + parseFloat(c.restant || 0) * (parseFloat(c.taux || 0) / 100), 0);

    // Amortissements IS
    const amortissement = Math.round((totalAchat * 0.85) / 25);

    const totalCharges = totalDepenses + taxeFonciere + assurancePNO + Math.round(interets) + amortissement;
    const resultatFiscal = ca - totalCharges;

    // IS : 15% jusqu'à 42 500€, 25% au-delà
    let impotSocietes = 0;
    if (resultatFiscal > 0) {
      if (resultatFiscal <= 42500) {
        impotSocietes = Math.round(resultatFiscal * 0.15);
      } else {
        impotSocietes = Math.round(42500 * 0.15 + (resultatFiscal - 42500) * 0.25);
      }
    }

    res.json({
      declaration: '2065',
      annee: parseInt(annee),
      sci: sci.rows[0],
      lignes: {
        chiffreAffaires: ca,
        charges: { depenses: totalDepenses, taxeFonciere, assurances: assurancePNO, interets: Math.round(interets), amortissements: amortissement },
        totalCharges,
        resultatFiscal,
        impotSocietes,
        resultatNet: resultatFiscal - impotSocietes,
      },
    });
  } catch (err) {
    console.error('GET /fiscal/2065:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /immo/fiscal/2044?annee=2026 — Déclaration 2044 (revenus fonciers hors SCI)
router.get('/fiscal/2044', async (req, res) => {
  try {
    const patronId = req.user.id;
    const annee = req.query.annee || new Date().getFullYear() - 1;

    // Biens hors SCI
    const biens = await db.query('SELECT * FROM immo_biens WHERE patron_id = $1 AND sci_id IS NULL', [patronId]);
    const bienIds = biens.rows.map(b => b.id);

    let revenusBruts = 0;
    if (bienIds.length > 0) {
      const p = await db.query(`SELECT COALESCE(SUM(montant), 0) as t FROM immo_paiements WHERE bien_id = ANY($1) AND patron_id = $2 AND mois LIKE $3 AND statut = 'paye'`, [bienIds, patronId, `${annee}%`]);
      revenusBruts = parseFloat(p.rows[0].t || 0);
    }

    let totalDepenses = 0;
    if (bienIds.length > 0) {
      const d = await db.query(`SELECT COALESCE(SUM(montant), 0) as t FROM immo_depenses WHERE bien_id = ANY($1) AND patron_id = $2 AND EXTRACT(YEAR FROM date) = $3 AND deductible = true`, [bienIds, patronId, annee]);
      totalDepenses = parseFloat(d.rows[0].t || 0);
    }

    const taxeFonciere = biens.rows.reduce((s, b) => s + parseFloat(b.taxe_fonciere || 0), 0);
    const assurancePNO = biens.rows.reduce((s, b) => s + parseFloat(b.assurance_pno || 0), 0);

    const credits = await db.query(`SELECT * FROM immo_credits WHERE bien_id = ANY($1::int[]) AND patron_id = $2`, [bienIds.length > 0 ? bienIds : [0], patronId]);
    const interets = credits.rows.reduce((s, c) => s + parseFloat(c.restant || 0) * (parseFloat(c.taux || 0) / 100), 0);

    const totalCharges = totalDepenses + taxeFonciere + assurancePNO + Math.round(interets);
    const revenuNet = revenusBruts - totalCharges;

    // Micro-foncier possible si revenus bruts < 15 000€
    const microFoncierEligible = revenusBruts <= 15000;
    const microFoncierNet = microFoncierEligible ? Math.round(revenusBruts * 0.7) : null;

    res.json({
      declaration: '2044',
      annee: parseInt(annee),
      regime: {
        reel: { revenusBruts, totalCharges, revenuNet },
        microFoncier: microFoncierEligible ? { revenusBruts, abattement: 30, revenuNet: microFoncierNet } : null,
        conseilRegime: microFoncierEligible && microFoncierNet < revenuNet ? 'micro-foncier' : 'réel',
      },
      biens: biens.rows.map(b => ({ id: b.id, nom: b.nom, adresse: b.adresse })),
    });
  } catch (err) {
    console.error('GET /fiscal/2044:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// GET /immo/dashboard — Tableau de bord patrimoine
router.get('/dashboard', async (req, res) => {
  try {
    const patronId = req.user.id;
    const scis = await db.query('SELECT * FROM immo_scis WHERE patron_id = $1', [patronId]);
    const biens = await db.query('SELECT * FROM immo_biens WHERE patron_id = $1', [patronId]);
    const locataires = await db.query('SELECT * FROM immo_locataires WHERE patron_id = $1', [patronId]);
    const paiements = await db.query(`SELECT * FROM immo_paiements WHERE patron_id = $1 AND mois LIKE $2`, [patronId, `${new Date().getFullYear()}%`]);
    const credits = await db.query('SELECT * FROM immo_credits WHERE patron_id = $1', [patronId]);

    const totalValeur = biens.rows.reduce((s, b) => s + parseFloat(b.valeur || 0), 0);
    const totalDette = credits.rows.reduce((s, c) => s + parseFloat(c.restant || 0), 0);
    const loyersMensuels = biens.rows.reduce((s, b) => s + parseFloat(b.loyer || 0), 0);
    const loyersEncaisses = paiements.rows.filter(p => p.statut === 'paye').reduce((s, p) => s + parseFloat(p.montant || 0), 0);
    const impayes = paiements.rows.filter(p => p.statut === 'impaye').length;

    res.json({
      nbScis: scis.rows.length,
      nbBiens: biens.rows.length,
      nbLocataires: locataires.rows.length,
      totalValeur,
      totalDette,
      actifNet: totalValeur - totalDette,
      loyersMensuels,
      loyersEncaissesAnnee: loyersEncaisses,
      impayes,
      rendementBrut: totalValeur > 0 ? Math.round(loyersMensuels * 12 / totalValeur * 10000) / 100 : 0,
    });
  } catch (err) {
    console.error('GET /immo/dashboard:', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
