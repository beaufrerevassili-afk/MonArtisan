// ══════════════════════════════════════════════════════════════
//  Service de calcul et validation de devis
// ══════════════════════════════════════════════════════════════

function calculerDevis(lignes = [], remiseGlobale = 0) {
  const lignesCalculees = lignes.map((l, i) => {
    const qte = Number(l.quantite || l.qte) || 0;
    const pu = Number(l.prixHT || l.pu) || 0;
    const tva = Number(l.tva) || 20;
    const remise = Number(l.remise) || 0;
    const totalHT = Math.round(qte * pu * (1 - remise / 100) * 100) / 100;
    const totalTVA = Math.round(totalHT * tva / 100 * 100) / 100;
    const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100;
    return { ligne: i + 1, description: l.description || l.desc || '', quantite: qte, prixUnitaireHT: pu, tva, remise, totalHT, totalTVA, totalTTC };
  });

  const sousTotal = lignesCalculees.reduce((s, l) => s + l.totalHT, 0);
  const montantRemise = remiseGlobale > 0 ? Math.round(sousTotal * remiseGlobale / 100 * 100) / 100 : 0;
  const totalHT = Math.round((sousTotal - montantRemise) * 100) / 100;
  const totalTVA = Math.round(lignesCalculees.reduce((s, l) => s + l.totalTVA, 0) * (1 - remiseGlobale / 100) * 100) / 100;
  const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100;

  return {
    lignes: lignesCalculees,
    remiseGlobale,
    montantRemise,
    totalHT,
    totalTVA,
    totalTTC,
    nbLignes: lignesCalculees.length,
  };
}

function validerDevis(devis) {
  const erreurs = [];
  if (!devis.lignes || devis.lignes.length === 0) erreurs.push('Au moins une ligne est requise');
  if (devis.lignes) {
    devis.lignes.forEach((l, i) => {
      if (!l.description && !l.desc) erreurs.push(`Ligne ${i + 1} : description manquante`);
      if ((Number(l.quantite || l.qte) || 0) <= 0) erreurs.push(`Ligne ${i + 1} : quantité invalide`);
      if ((Number(l.prixHT || l.pu) || 0) <= 0) erreurs.push(`Ligne ${i + 1} : prix unitaire invalide`);
    });
  }
  return { valide: erreurs.length === 0, erreurs };
}

module.exports = { calculerDevis, validerDevis };
