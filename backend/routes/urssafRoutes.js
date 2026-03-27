// ============================================================
//  urssafRoutes.js — Module URSSAF
//  Cotisations, Simulateur, Historique, Alertes
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// Taux de cotisations (approximatifs, BTP 2024)
const TAUX = {
  assuranceMaladie:       0.1310,  // 13.10%
  retraiteBase:           0.1690,  // 16.90%
  retraiteComplementaire: 0.0620,  //  6.20%
  chomage:                0.0405,  //  4.05%
  accidentsWork:          0.0350,  //  3.50% (variable)
  formationPro:           0.0100,  //  1.00%
  taxeApprentissage:      0.0068,  //  0.68%
  congesPayesBTP:         0.2500,  // 25% (caisse congés BTP)
};

function getProchaineTrimestre() {
  const now   = new Date();
  const mois  = now.getMonth();
  const annee = now.getFullYear();
  if (mois < 3) return { periode: `T1-${annee}`,     dateLimite: `${annee}-04-30` };
  if (mois < 6) return { periode: `T2-${annee}`,     dateLimite: `${annee}-07-31` };
  if (mois < 9) return { periode: `T3-${annee}`,     dateLimite: `${annee}-10-31` };
  return         { periode: `T4-${annee}`, dateLimite: `${annee + 1}-01-31` };
}

function mapDeclaration(d) {
  return {
    id:                   d.id,
    periode:              d.periode,
    ca:                   d.ca,
    cotisationsCalculees: d.cotisations_calculees,
    statut:               d.statut,
    dateLimite:           d.date_limite,
    payeeLe:              d.payee_le,
  };
}

// ============================================================
//  SIMULATEUR DE CHARGES
// ============================================================

// POST /urssaf/simuler — Simuler les cotisations (stateless, pas de DB)
router.post('/simuler', (req, res) => {
  const { ca, regime, nbSalaries } = req.body;
  if (!ca) return res.status(400).json({ erreur: "ca (chiffre d'affaires) requis" });

  const caNum      = parseFloat(ca);
  const regimeType = regime || 'reel';

  let simulation;

  if (regimeType === 'micro') {
    const tauxMicro = 0.22;
    simulation = {
      regime:           'micro-entreprise',
      ca:               caNum,
      tauxGlobal:       tauxMicro,
      cotisationsTotal: Math.round(caNum * tauxMicro * 100) / 100,
      detail: {
        cotisationsSociales: Math.round(caNum * tauxMicro * 100) / 100,
      },
    };
  } else {
    const beneficeEstime = caNum * 0.35;
    const cotisations = {
      assuranceMaladie:       Math.round(beneficeEstime * TAUX.assuranceMaladie       * 100) / 100,
      retraiteBase:           Math.round(beneficeEstime * TAUX.retraiteBase           * 100) / 100,
      retraiteComplementaire: Math.round(beneficeEstime * TAUX.retraiteComplementaire * 100) / 100,
      chomage:                Math.round(beneficeEstime * TAUX.chomage                * 100) / 100,
      accidentsDuTravail:     Math.round(beneficeEstime * TAUX.accidentsWork          * 100) / 100,
      formationPro:           Math.round(caNum          * TAUX.formationPro           * 100) / 100,
      taxeApprentissage:      Math.round(caNum          * TAUX.taxeApprentissage      * 100) / 100,
    };

    let cotisationsSalariales = 0;
    if (nbSalaries && parseInt(nbSalaries) > 0) {
      const masseSalarialeMoyenne = 2200 * parseInt(nbSalaries);
      cotisationsSalariales = Math.round(masseSalarialeMoyenne * 0.42 * 100) / 100;
    }

    const total = Object.values(cotisations).reduce((s, v) => s + v, 0) + cotisationsSalariales;

    simulation = {
      regime:               'régime réel',
      ca:                   caNum,
      beneficeEstime,
      detail:               cotisations,
      cotisationsSalariales,
      cotisationsTotal:     Math.round(total * 100) / 100,
      tauxEffectif:         Math.round((total / caNum) * 100 * 10) / 10,
      taux:                 TAUX,
    };
  }

  res.json({
    simulation,
    message: 'Simulation indicative — consultez votre comptable pour des calculs exacts',
    prochaineTrimestre: getProchaineTrimestre(),
  });
});

// ============================================================
//  HISTORIQUE DES DÉCLARATIONS
// ============================================================

// GET /urssaf/historique — Historique des déclarations
router.get('/historique', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM urssaf_declarations ORDER BY periode DESC');
    const declarations = result.rows.map(mapDeclaration);

    const totalCotisations   = declarations.reduce((s, d) => s + parseFloat(d.cotisationsCalculees || 0), 0);
    const cotisationsPayees  = declarations
      .filter(d => d.statut === 'payée')
      .reduce((s, d) => s + parseFloat(d.cotisationsCalculees || 0), 0);
    const enAttente = declarations
      .filter(d => d.statut === 'en_attente')
      .reduce((s, d) => s + parseFloat(d.cotisationsCalculees || 0), 0);

    res.json({
      total: declarations.length,
      totalCotisations:  Math.round(totalCotisations  * 100) / 100,
      cotisationsPayees: Math.round(cotisationsPayees * 100) / 100,
      enAttente:         Math.round(enAttente         * 100) / 100,
      declarations,
    });
  } catch (err) {
    console.error('GET /urssaf/historique :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  ALERTES ÉCHÉANCES
// ============================================================

// GET /urssaf/alertes — Alertes échéances à venir
router.get('/alertes', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM urssaf_declarations WHERE statut = 'en_attente' ORDER BY date_limite ASC"
    );

    const maintenant = new Date();
    const dans15j    = new Date(maintenant.getTime() + 15 * 86400000);

    const prochainesEcheances = result.rows.map(d => {
      const dateLimite   = new Date(d.date_limite);
      const joursRestants = Math.ceil((dateLimite - maintenant) / 86400000);
      return {
        ...mapDeclaration(d),
        joursRestants,
        urgent: dateLimite <= dans15j,
      };
    });

    res.json({
      prochaines:         prochainesEcheances,
      prochaineTrimestre: getProchaineTrimestre(),
      message: prochainesEcheances.some(e => e.urgent)
        ? 'URGENT : Une échéance URSSAF approche dans moins de 15 jours !'
        : 'Aucune échéance urgente',
      lienPortailUrssaf: 'https://www.urssaf.fr',
    });
  } catch (err) {
    console.error('GET /urssaf/alertes :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ============================================================
//  RÉCAPITULATIF MENSUEL / TRIMESTRIEL
// ============================================================

// GET /urssaf/recapitulatif — Récapitulatif des cotisations
router.get('/recapitulatif', async (req, res) => {
  try {
    const { periode } = req.query;

    const result = await db.query('SELECT * FROM urssaf_declarations ORDER BY periode DESC');
    const declarations = result.rows.map(mapDeclaration);

    // Graphique 12 mois glissants (données estimées stateless)
    const moisGlissants = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ca   = Math.round((20000 + Math.random() * 15000) * 100) / 100;
      moisGlissants.push({
        mois:               date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        ca,
        cotisationsEstimees: Math.round(ca * 0.23 * 100) / 100,
      });
    }

    res.json({
      periode:                 periode || 'mensuel',
      graphique12Mois:         moisGlissants,
      totalCA12Mois:           Math.round(moisGlissants.reduce((s, m) => s + m.ca, 0) * 100) / 100,
      totalCotisations12Mois:  Math.round(moisGlissants.reduce((s, m) => s + m.cotisationsEstimees, 0) * 100) / 100,
      declarations,
    });
  } catch (err) {
    console.error('GET /urssaf/recapitulatif :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

module.exports = router;
