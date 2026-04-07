// ══════════════════════════════════════════════════════════════
//  Calculateur de paie artisan BTP
//  Indemnités de déplacement, panier repas, grand déplacement
//  Conforme convention collective BTP
// ══════════════════════════════════════════════════════════════

/**
 * Calcule l'indemnité de déplacement selon la distance dépôt → chantier
 * @param {number} distanceKm - Distance aller simple en km
 * @returns {{ indemnite: number, zone: string, grandDeplacement: boolean, distanceTotale: number }}
 */
export function calculerIndemniteTrajet(distanceKm) {
  if (typeof distanceKm !== 'number' || distanceKm < 0) {
    return { indemnite: 0, zone: 'Erreur', grandDeplacement: false, distanceTotale: 0, erreur: 'Distance invalide (doit être un nombre positif)' };
  }

  const distanceTotale = distanceKm * 2; // Aller-retour

  // Barème indemnité selon distance aller simple
  let indemnite = 0;
  let zone = '';
  let grandDeplacement = false;

  if (distanceKm <= 20) {
    indemnite = 0;
    zone = 'Zone 1 (0-20 km) — Pas d\'indemnité';
  } else if (distanceKm <= 50) {
    indemnite = 10;
    zone = 'Zone 2 (20-50 km)';
  } else if (distanceKm <= 100) {
    indemnite = 20;
    zone = 'Zone 3 (50-100 km)';
  } else if (distanceKm <= 200) {
    indemnite = 40;
    zone = 'Zone 4 (100-200 km)';
  } else {
    indemnite = 80;
    zone = 'Zone 5 (> 200 km) — GRAND DÉPLACEMENT';
    grandDeplacement = true;
  }

  return { indemnite, zone, grandDeplacement, distanceTotale };
}

/**
 * Calcule la rémunération journalière complète d'un artisan
 * @param {Object} params
 * @param {number} params.distanceKm - Distance aller simple dépôt → chantier (km)
 * @param {number} params.salaireBaseJournalier - Salaire brut journalier (€)
 * @param {number} [params.panierRepas=0] - Indemnité panier repas (€, défaut 0)
 * @param {number} [params.heuresTravaillees=7] - Heures travaillées dans la journée
 * @param {boolean} [params.heuresSupp=false] - Si heures supplémentaires
 * @param {number} [params.nbHeuresSupp=0] - Nombre d'heures supp
 * @returns {Object} Détail complet de la rémunération
 */
export function calculerRemunerationJournaliere({
  distanceKm,
  salaireBaseJournalier,
  panierRepas = 0,
  heuresTravaillees = 7,
  heuresSupp = false,
  nbHeuresSupp = 0,
}) {
  // Validation des entrées
  const erreurs = [];
  if (typeof distanceKm !== 'number' || distanceKm < 0) erreurs.push('Distance invalide');
  if (typeof salaireBaseJournalier !== 'number' || salaireBaseJournalier <= 0) erreurs.push('Salaire de base invalide');
  if (typeof panierRepas !== 'number' || panierRepas < 0) erreurs.push('Panier repas invalide');
  if (heuresTravaillees <= 0 || heuresTravaillees > 24) erreurs.push('Heures travaillées invalides');

  if (erreurs.length > 0) {
    return { erreurs, salaireTotal: 0, detail: null };
  }

  // Calcul indemnité trajet
  const trajet = calculerIndemniteTrajet(distanceKm);

  // Calcul heures supplémentaires (majoration 25% pour les 8 premières, 50% au-delà)
  const tauxHoraire = salaireBaseJournalier / 7; // base 7h/jour
  let montantHeuresSupp = 0;
  if (heuresSupp && nbHeuresSupp > 0) {
    const hs25 = Math.min(nbHeuresSupp, 8); // 25% pour les 8 premières
    const hs50 = Math.max(0, nbHeuresSupp - 8); // 50% au-delà
    montantHeuresSupp = (hs25 * tauxHoraire * 1.25) + (hs50 * tauxHoraire * 1.50);
  }

  // Indemnité grand déplacement (hébergement + repas soir)
  let indemGrandDeplacement = 0;
  if (trajet.grandDeplacement) {
    indemGrandDeplacement = 75; // Forfait hébergement + repas soir
  }

  // Total journalier
  const salaireTotal = salaireBaseJournalier + trajet.indemnite + panierRepas + montantHeuresSupp + indemGrandDeplacement;

  return {
    erreurs: [],
    salaireTotal: Math.round(salaireTotal * 100) / 100,
    detail: {
      salaireBase: salaireBaseJournalier,
      tauxHoraire: Math.round(tauxHoraire * 100) / 100,
      heuresTravaillees,
      // Trajet
      distanceAllerSimple: distanceKm,
      distanceTotale: trajet.distanceTotale,
      zone: trajet.zone,
      indemniteTrajet: trajet.indemnite,
      grandDeplacement: trajet.grandDeplacement,
      indemGrandDeplacement,
      // Repas
      panierRepas,
      // Heures supp
      nbHeuresSupp,
      montantHeuresSupp: Math.round(montantHeuresSupp * 100) / 100,
      // Total
      salaireTotal: Math.round(salaireTotal * 100) / 100,
    },
  };
}

/**
 * Calcule la paie mensuelle avec déplacements variables par jour
 * @param {Object} params
 * @param {number} params.salaireBaseMensuel - Salaire brut mensuel
 * @param {Array} params.jours - [{distanceKm, panierRepas?, heuresSupp?, nbHeuresSupp?}]
 * @returns {Object} Synthèse mensuelle
 */
export function calculerPaieMensuelle({ salaireBaseMensuel, jours = [] }) {
  const nbJoursTravailles = jours.length || 21;
  const salaireBaseJournalier = Math.round(salaireBaseMensuel / 21 * 100) / 100;

  let totalIndemnites = 0;
  let totalPaniers = 0;
  let totalHeuresSupp = 0;
  let totalGrandDeplacement = 0;
  let nbGrandsDeplacement = 0;
  const detailJours = [];

  jours.forEach((jour, i) => {
    const result = calculerRemunerationJournaliere({
      distanceKm: jour.distanceKm || 0,
      salaireBaseJournalier,
      panierRepas: jour.panierRepas || 0,
      heuresTravaillees: jour.heuresTravaillees || 7,
      heuresSupp: jour.heuresSupp || false,
      nbHeuresSupp: jour.nbHeuresSupp || 0,
    });
    if (result.detail) {
      totalIndemnites += result.detail.indemniteTrajet;
      totalPaniers += result.detail.panierRepas;
      totalHeuresSupp += result.detail.montantHeuresSupp;
      totalGrandDeplacement += result.detail.indemGrandDeplacement;
      if (result.detail.grandDeplacement) nbGrandsDeplacement++;
      detailJours.push({ jour: i + 1, ...result.detail });
    }
  });

  const totalBrut = salaireBaseMensuel + totalIndemnites + totalPaniers + totalHeuresSupp + totalGrandDeplacement;

  return {
    salaireBaseMensuel,
    salaireBaseJournalier,
    nbJoursTravailles,
    totalIndemnites: Math.round(totalIndemnites * 100) / 100,
    totalPaniers: Math.round(totalPaniers * 100) / 100,
    totalHeuresSupp: Math.round(totalHeuresSupp * 100) / 100,
    totalGrandDeplacement: Math.round(totalGrandDeplacement * 100) / 100,
    nbGrandsDeplacement,
    totalBrut: Math.round(totalBrut * 100) / 100,
    detailJours,
  };
}

// ══ Constantes de référence BTP ══
export const BAREME_TRAJET = [
  { min: 0, max: 20, indemnite: 0, label: 'Zone 1 — Local' },
  { min: 20, max: 50, indemnite: 10, label: 'Zone 2 — Proche' },
  { min: 50, max: 100, indemnite: 20, label: 'Zone 3 — Moyen' },
  { min: 100, max: 200, indemnite: 40, label: 'Zone 4 — Éloigné' },
  { min: 200, max: Infinity, indemnite: 80, label: 'Zone 5 — Grand déplacement' },
];

export const PANIER_REPAS_BTP = 13.40; // Montant 2026 (à mettre à jour annuellement)
export const FORFAIT_GRAND_DEPLACEMENT = 75; // Hébergement + repas soir
