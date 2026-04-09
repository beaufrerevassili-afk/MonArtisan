// ══════════════════════════════════════════════════════════════
//  Service de scoring investissement immobilier
//  4 piliers : Rentabilité, Cashflow, Géorisques, Structure
// ══════════════════════════════════════════════════════════════

function calcScore(dossier, geo, profil = 'equilibre') {
  const prixTotal = (dossier.prix || 0) + (dossier.fraisNotaire || 0) + (dossier.travaux || 0);
  const loyerAn = (dossier.loyer || 0) * (12 - (dossier.vacanceMois || 1));
  const chargesAn = ((dossier.charges || 0) + (dossier.taxeFonciere || 0) + (dossier.assurance || 0)) * 12;
  const creditAn = (dossier.mensualite || 0) * 12;
  const cfAn = loyerAn - chargesAn - creditAn;
  const cfMois = Math.round(cfAn / 12);
  const rdtBrut = prixTotal > 0 ? Math.round((dossier.loyer || 0) * 12 / prixTotal * 10000) / 100 : 0;
  const rdtNet = prixTotal > 0 ? Math.round(loyerAn / prixTotal * 10000) / 100 : 0;
  const effort = (dossier.loyer || 0) > 0 ? Math.round((dossier.mensualite || 0) / dossier.loyer * 100) : 100;

  // Score rentabilité (0-25)
  let r = 0;
  if (profil === 'conservateur') r = rdtNet >= 4 ? 25 : rdtNet >= 3 ? 18 : rdtNet >= 2 ? 10 : 5;
  else if (profil === 'equilibre') r = rdtNet >= 6 ? 25 : rdtNet >= 4 ? 18 : rdtNet >= 3 ? 10 : 5;
  else r = rdtNet >= 8 ? 25 : rdtNet >= 6 ? 20 : rdtNet >= 4 ? 12 : 5;

  // Score cashflow (0-25)
  let c = cfMois >= 200 ? 25 : cfMois >= 50 ? 20 : cfMois >= 0 ? 15 : cfMois >= -100 ? 8 : 0;
  if (profil === 'conservateur' && cfMois < 0) c = 0;

  // Score risque géo (0-25)
  let g = 25;
  if (geo) {
    if (geo.nbRisques > 8) g -= 15; else if (geo.nbRisques > 4) g -= 8; else if (geo.nbRisques > 2) g -= 3;
    if (geo.sismique >= 4) g -= 8; else if (geo.sismique >= 3) g -= 4;
    if (geo.radon >= 3) g -= 5; else if (geo.radon >= 2) g -= 2;
    if (geo.nbCatnat > 10) g -= 5; else if (geo.nbCatnat > 5) g -= 2;
    g = Math.max(0, g);
  }

  // Score structure (0-25)
  let st = 0;
  if (effort < 70) st += 10; else if (effort < 90) st += 5;
  if ((dossier.vacanceMois || 1) <= 1) st += 8; else if ((dossier.vacanceMois || 1) <= 2) st += 4;
  if ((dossier.travaux || 0) < (dossier.prix || 1) * 0.1) st += 7; else if ((dossier.travaux || 0) < (dossier.prix || 1) * 0.2) st += 3;

  const total = Math.min(100, Math.max(0, r + c + Math.min(25, g) + st));

  // TRI (Newton-Raphson)
  const n = dossier.dureeCredit || 20;
  const invest = -(prixTotal - (dossier.apport || 0));
  const revente = (dossier.prix || 0) * 1.02 ** n;
  let tri = 0.05;
  if (invest < 0 && n > 0) {
    for (let iter = 0; iter < 50; iter++) {
      let npv = invest, dnpv = 0;
      for (let t = 1; t <= n; t++) { const d = (1 + tri) ** t; npv += cfAn / d; dnpv -= t * cfAn / (d * (1 + tri)); }
      npv += revente / (1 + tri) ** n; dnpv -= n * revente / ((1 + tri) ** (n + 1));
      if (Math.abs(npv) < 1) break;
      tri -= npv / dnpv;
      if (tri < -0.5) { tri = -0.5; break; } if (tri > 1) { tri = 1; break; }
    }
  }

  return {
    total, scoreRenta: r, scoreCash: c, scoreGeo: Math.min(25, g), scoreStruct: st,
    rdtBrut, rdtNet, cfMois, cfAn, prixTotal, loyerAn, chargesAn, creditAn, effort,
    tri: Math.round(tri * 1000) / 10,
    verdict: total >= 80 ? 'FONCEZ' : total >= 65 ? 'GO' : total >= 45 ? 'A_ETUDIER' : total >= 25 ? 'PRUDENCE' : 'PASSER',
  };
}

module.exports = { calcScore };
