// ══════════════════════════════════════════════════════════════
//  Service de calcul de paie BTP — Convention collective
//  Indemnités trajet, panier repas, heures sup, grand déplacement
// ══════════════════════════════════════════════════════════════

const BAREME_TRAJET = [
  { min: 0, max: 20, indemnite: 0, label: 'Zone 1 (0-20 km) — Pas d\'indemnité' },
  { min: 20, max: 50, indemnite: 10, label: 'Zone 2 (20-50 km)' },
  { min: 50, max: 100, indemnite: 20, label: 'Zone 3 (50-100 km)' },
  { min: 100, max: 200, indemnite: 40, label: 'Zone 4 (100-200 km)' },
  { min: 200, max: Infinity, indemnite: 80, label: 'Zone 5 (> 200 km) — GRAND DÉPLACEMENT' },
];

const PANIER_REPAS_BTP = 13.40;
const FORFAIT_GRAND_DEPLACEMENT = 75;

const COTISATIONS_SALARIALES = [
  { cat: 'Sécurité sociale', label: 'Maladie / Maternité', taux: 0.75, base: 'brut' },
  { cat: 'Sécurité sociale', label: 'Vieillesse (déplafonnée)', taux: 0.40, base: 'brut' },
  { cat: 'Sécurité sociale', label: 'Vieillesse (plafonnée)', taux: 6.90, base: 'plafond' },
  { cat: 'Chômage', label: 'Assurance chômage', taux: 2.40, base: 'brut' },
  { cat: 'Retraite compl.', label: 'AGIRC-ARRCO T1', taux: 3.15, base: 'plafond' },
  { cat: 'Retraite compl.', label: 'AGIRC-ARRCO T2', taux: 8.64, base: 'tranche2' },
  { cat: 'Retraite compl.', label: 'CEG T1', taux: 0.86, base: 'plafond' },
  { cat: 'CSG / CRDS', label: 'CSG déductible', taux: 6.80, base: 'csg' },
  { cat: 'CSG / CRDS', label: 'CSG non déductible', taux: 2.40, base: 'csg' },
  { cat: 'CSG / CRDS', label: 'CRDS', taux: 0.50, base: 'csg' },
];

const COTISATIONS_PATRONALES = [
  { cat: 'Sécurité sociale', label: 'Maladie / Maternité', taux: 7.00, base: 'brut' },
  { cat: 'Sécurité sociale', label: 'AT / MP', taux: 2.22, base: 'brut' },
  { cat: 'Sécurité sociale', label: 'Allocations familiales', taux: 3.45, base: 'brut' },
  { cat: 'Sécurité sociale', label: 'Vieillesse (déplafonnée)', taux: 1.90, base: 'brut' },
  { cat: 'Sécurité sociale', label: 'Vieillesse (plafonnée)', taux: 8.55, base: 'plafond' },
  { cat: 'Chômage', label: 'Assurance chômage', taux: 4.05, base: 'brut' },
  { cat: 'Chômage', label: 'AGS', taux: 0.15, base: 'brut' },
  { cat: 'Retraite compl.', label: 'AGIRC-ARRCO T1', taux: 4.72, base: 'plafond' },
  { cat: 'Retraite compl.', label: 'AGIRC-ARRCO T2', taux: 12.95, base: 'tranche2' },
  { cat: 'Retraite compl.', label: 'CEG T1', taux: 1.29, base: 'plafond' },
  { cat: 'Retraite compl.', label: 'CET', taux: 0.14, base: 'brut' },
  { cat: 'Autres', label: 'FNAL', taux: 0.50, base: 'brut' },
  { cat: 'Autres', label: 'Formation prof.', taux: 0.55, base: 'brut' },
  { cat: 'Autres', label: 'Taxe apprentissage', taux: 0.68, base: 'brut' },
  { cat: 'BTP', label: 'Congés payés BTP', taux: 19.80, base: 'brut' },
  { cat: 'BTP', label: 'Chômage intempéries', taux: 0.68, base: 'brut' },
  { cat: 'BTP', label: 'OPPBTP', taux: 0.11, base: 'brut' },
];

const PMSS = 3864; // Plafond mensuel sécurité sociale 2026

function getBase(type, brut) {
  const plafond = Math.min(brut, PMSS);
  const tranche2 = Math.max(0, Math.min(brut - PMSS, PMSS * 7));
  const csg = brut * 0.9825;
  if (type === 'plafond') return plafond;
  if (type === 'tranche2') return tranche2;
  if (type === 'csg') return csg;
  return brut;
}

function calculerIndemniteTrajet(distanceKm) {
  if (typeof distanceKm !== 'number' || distanceKm < 0) {
    return { indemnite: 0, zone: 'Erreur', grandDeplacement: false, distanceTotale: 0 };
  }
  const zone = BAREME_TRAJET.find(z => distanceKm >= z.min && distanceKm < z.max) || BAREME_TRAJET[0];
  return {
    indemnite: zone.indemnite,
    zone: zone.label,
    grandDeplacement: distanceKm > 200,
    distanceTotale: distanceKm * 2,
  };
}

function calculerRemunerationJournaliere({ distanceKm, salaireBaseJournalier, panierRepas = 0, heuresTravaillees = 7, nbHeuresSupp = 0 }) {
  const trajet = calculerIndemniteTrajet(distanceKm);
  const tauxHoraire = salaireBaseJournalier / 7;
  const hs25 = Math.min(nbHeuresSupp, 8);
  const hs50 = Math.max(0, nbHeuresSupp - 8);
  const montantHeuresSupp = (hs25 * tauxHoraire * 1.25) + (hs50 * tauxHoraire * 1.50);
  const indemGrandDeplacement = trajet.grandDeplacement ? FORFAIT_GRAND_DEPLACEMENT : 0;
  const salaireTotal = salaireBaseJournalier + trajet.indemnite + panierRepas + montantHeuresSupp + indemGrandDeplacement;

  return {
    salaireTotal: Math.round(salaireTotal * 100) / 100,
    detail: {
      salaireBase: salaireBaseJournalier, tauxHoraire: Math.round(tauxHoraire * 100) / 100,
      heuresTravaillees, distanceAllerSimple: distanceKm, ...trajet,
      indemGrandDeplacement, panierRepas, nbHeuresSupp, montantHeuresSupp: Math.round(montantHeuresSupp * 100) / 100,
    },
  };
}

function calculerBulletinPaie(brut) {
  const salariales = COTISATIONS_SALARIALES.map(c => {
    const base = getBase(c.base, brut);
    const montant = Math.round(base * c.taux / 100 * 100) / 100;
    return { ...c, base: Math.round(base * 100) / 100, montant };
  });
  const patronales = COTISATIONS_PATRONALES.map(c => {
    const base = getBase(c.base, brut);
    const montant = Math.round(base * c.taux / 100 * 100) / 100;
    return { ...c, base: Math.round(base * 100) / 100, montant };
  });
  const totalSalarial = salariales.reduce((s, c) => s + c.montant, 0);
  const totalPatronal = patronales.reduce((s, c) => s + c.montant, 0);
  const net = Math.round((brut - totalSalarial) * 100) / 100;
  const coutTotal = Math.round((brut + totalPatronal) * 100) / 100;

  return { brut, net, totalSalarial: Math.round(totalSalarial * 100) / 100, totalPatronal: Math.round(totalPatronal * 100) / 100, coutTotal, salariales, patronales };
}

module.exports = { calculerIndemniteTrajet, calculerRemunerationJournaliere, calculerBulletinPaie, BAREME_TRAJET, PANIER_REPAS_BTP, PMSS };
