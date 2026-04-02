// ============================================================
//  utils/qsePDF.js — Génération PDF professionnelle pour documents QSE
//  jsPDF + jspdf-autotable
// ============================================================

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const VIOLET = [91, 91, 214];
const NOIR   = [28, 28, 30];
const GRIS   = [142, 142, 147];
const ROUGE  = [192, 57, 43];
const VERT   = [26, 127, 67];
const ORANGE = [230, 126, 34];

/** En-tête commun à tous les documents */
function enteteDocument(doc, titre, soustitre, entreprise, siret) {
  const pw = doc.internal.pageSize.getWidth();

  // Bande supérieure violette
  doc.setFillColor(...VIOLET);
  doc.rect(0, 0, pw, 18, 'F');

  // Logo texte
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTISANS PRO', 14, 12);

  // Titre document
  doc.setTextColor(...NOIR);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(titre, 14, 32);

  if (soustitre) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS);
    doc.text(soustitre, 14, 39);
  }

  // Entreprise / date
  doc.setFontSize(9);
  doc.setTextColor(...NOIR);
  doc.setFont('helvetica', 'bold');
  doc.text(entreprise || 'Votre Entreprise BTP', pw - 14, 27, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRIS);
  doc.text(`SIRET : ${siret || '000 000 000 00000'}`, pw - 14, 33, { align: 'right' });
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pw - 14, 38, { align: 'right' });

  // Ligne de séparation
  doc.setDrawColor(...VIOLET);
  doc.setLineWidth(0.5);
  doc.line(14, 43, pw - 14, 43);

  return 50; // y de départ après l'en-tête
}

/** Titre de section */
function sectionTitre(doc, texte, y) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(14, y - 5, pw - 28, 10, 2, 2, 'F');
  doc.setTextColor(...VIOLET);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(texte.toUpperCase(), 18, y + 1);
  return y + 10;
}

/** Zone signature bas de page */
function zoneSignatures(doc, signataires, y) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const colW = (pw - 28) / signataires.length;

  // Si pas assez de place
  if (y > ph - 60) { doc.addPage(); y = 20; }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, y, pw - 14, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NOIR);
  doc.text('SIGNATURES', 14, y);
  y += 8;

  signataires.forEach((sig, i) => {
    const x = 14 + i * colW;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NOIR);
    doc.text(sig.titre, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS);
    doc.text(sig.nom || '____________________________', x, y + 5);
    doc.text(`Date : ${sig.date || '___/___/______'}`, x, y + 10);
    // Zone signature
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y + 13, colW - 6, 20);
  });
}

/** Pied de page légal */
function piedPage(doc, mentions) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const nbPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= nbPages; i++) {
    doc.setPage(i);
    doc.setFillColor(245, 245, 250);
    doc.rect(0, ph - 14, pw, 14, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...GRIS);
    doc.setFont('helvetica', 'normal');
    const ref = mentions[0] || '';
    doc.text(ref, 14, ph - 5);
    doc.text(`Page ${i} / ${nbPages}`, pw - 14, ph - 5, { align: 'right' });
  }
}

// ─────────────────────────────────────────────
//  REGISTRE DE SÉCURITÉ INCENDIE
// ─────────────────────────────────────────────

export function genererRegistreIncendie(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  let y = enteteDocument(
    doc,
    'REGISTRE DE SÉCURITÉ INCENDIE',
    'Art. R123-51 CCH · Arrêté du 25 juin 1980 · Obligatoire pour tout établissement',
    data.entreprise,
    data.siret
  );

  // ─── SECTION 1 : Informations établissement
  y = sectionTitre(doc, '1. Informations de l\'établissement', y);
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 248, 252] }, 1: { cellWidth: 'auto' } },
    body: [
      ['Nom de l\'établissement', data.etablissement || data.entreprise || ''],
      ['Adresse', data.adresse || ''],
      ['Type d\'établissement', data.typeEtablissement || ''],
      ['Catégorie ERP', data.categorieERP || 'Non applicable (chantier)'],
      ['Responsable sécurité incendie', data.responsableIncendie || ''],
      ['Effectif maximal', data.effectifMaximal || ''],
      ['Dernière mise à jour du registre', new Date().toLocaleDateString('fr-FR')],
    ],
    theme: 'plain',
  });
  y = doc.lastAutoTable.finalY + 8;

  // ─── SECTION 2 : Extincteurs
  y = sectionTitre(doc, '2. Extincteurs — Vérification annuelle obligatoire (Art. MS40 IGH)', y);
  const extincteurs = data.extincteurs?.length ? data.extincteurs : [
    { localisation: '', type: '', numero: '', dateDernier: '', dateProchain: '', organisme: '', resultat: '' }
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    head: [['Localisation', 'Type', 'N° série', 'Dernier contrôle', 'Prochain', 'Organisme', 'Résultat']],
    body: extincteurs.map(e => [
      e.localisation, e.type, e.numero,
      e.dateDernier ? new Date(e.dateDernier).toLocaleDateString('fr-FR') : '—',
      e.dateProchain ? new Date(e.dateProchain).toLocaleDateString('fr-FR') : '—',
      e.organisme, e.resultat || 'Conforme'
    ]),
  });
  y = doc.lastAutoTable.finalY + 8;

  // ─── SECTION 3 : RIA et colonnes
  y = sectionTitre(doc, '3. Robinets d\'Incendie Armés (RIA) et colonnes sèches — Contrôle semestriel', y);
  const ria = data.ria?.length ? data.ria : [
    { localisation: '', numero: '', dateDernier: '', dateProchain: '', organisme: '', resultat: '' }
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    head: [['Localisation / N°', 'Type', 'Dernier contrôle', 'Prochain contrôle', 'Organisme', 'Résultat']],
    body: ria.map(r => [
      `${r.localisation} ${r.numero}`.trim(), r.type || 'RIA DN25',
      r.dateDernier ? new Date(r.dateDernier).toLocaleDateString('fr-FR') : '—',
      r.dateProchain ? new Date(r.dateProchain).toLocaleDateString('fr-FR') : '—',
      r.organisme, r.resultat || 'Conforme'
    ]),
  });
  y = doc.lastAutoTable.finalY + 8;

  // ─── SECTION 4 : Détection et alarme
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitre(doc, '4. Système de Sécurité Incendie (SSI) et détection automatique', y);
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    head: [['Équipement', 'Localisation', 'Dernier contrôle', 'Prochain', 'Organisme', 'Conforme']],
    body: (data.ssi || [
      { equipement: 'Centrale SSI', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
      { equipement: 'Détecteurs automatiques', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
      { equipement: 'Déclencheurs manuels', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
      { equipement: 'Éclairage de sécurité (BAES)', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
      { equipement: 'Désenfumage', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'N/A' },
      { equipement: 'Portes coupe-feu', localisation: '', dateDernier: '', dateProchain: '', organisme: '', conforme: 'Oui' },
    ]).map(s => [
      s.equipement, s.localisation,
      s.dateDernier ? new Date(s.dateDernier).toLocaleDateString('fr-FR') : '—',
      s.dateProchain ? new Date(s.dateProchain).toLocaleDateString('fr-FR') : '—',
      s.organisme, s.conforme || 'À vérifier'
    ]),
  });
  y = doc.lastAutoTable.finalY + 8;

  // ─── SECTION 5 : Exercices d'évacuation (annuel obligatoire)
  if (y > 200) { doc.addPage(); y = 20; }
  y = sectionTitre(doc, '5. Exercices d\'évacuation — Annuel obligatoire (Art. R4227-39 CT)', y);
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    head: [['Date', 'Heure', 'Participants', 'Durée évacuation', 'Observations / Anomalies', 'Responsable']],
    body: (data.exercices?.length ? data.exercices : [
      { date: '', heure: '', participants: '', duree: '', observations: 'Premier exercice à planifier', responsable: '' }
    ]).map(e => [
      e.date ? new Date(e.date).toLocaleDateString('fr-FR') : '—',
      e.heure || '—', e.participants || '—', e.duree || '—',
      e.observations || '—', e.responsable || '—'
    ]),
  });
  y = doc.lastAutoTable.finalY + 8;

  // ─── SECTION 6 : Incidents et interventions
  if (y > 200) { doc.addPage(); y = 20; }
  y = sectionTitre(doc, '6. Incidents et interventions des secours', y);
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    head: [['Date / Heure', 'Nature de l\'incident', 'Zone concernée', 'Pompiers intervenus', 'Mesures prises', 'Déclaration assurance']],
    body: (data.incidents?.length ? data.incidents : [
      { date: '', nature: 'Aucun incident recensé', zone: '', pompiers: 'Non', mesures: '—', declaration: 'N/A' }
    ]).map(i => [
      i.date ? `${new Date(i.date).toLocaleDateString('fr-FR')} ${i.heure || ''}` : '—',
      i.nature || '—', i.zone || '—', i.pompiers || '—', i.mesures || '—', i.declaration || '—'
    ]),
  });
  y = doc.lastAutoTable.finalY + 8;

  // ─── SECTION 7 : Personnel formé
  if (y > 200) { doc.addPage(); y = 20; }
  y = sectionTitre(doc, '7. Personnel formé à la sécurité incendie', y);
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    head: [['Nom / Prénom', 'Fonction', 'Formation', 'Organisme', 'Date formation', 'Validité']],
    body: (data.personnelForme?.length ? data.personnelForme : [
      { nom: '', fonction: 'Sauveteur Secouriste du Travail (SST)', formation: 'SST', organisme: '', dateFormation: '', validite: '2 ans' }
    ]).map(p => [
      p.nom || '—', p.fonction || '—', p.formation || '—',
      p.organisme || '—',
      p.dateFormation ? new Date(p.dateFormation).toLocaleDateString('fr-FR') : '—',
      p.validite || '—'
    ]),
  });
  y = doc.lastAutoTable.finalY + 12;

  // ─── Signatures
  zoneSignatures(doc, [
    { titre: 'Responsable sécurité incendie', nom: data.responsableIncendie, date: new Date().toLocaleDateString('fr-FR') },
    { titre: 'Dirigeant / Gérant', nom: data.dirigeant, date: new Date().toLocaleDateString('fr-FR') },
    { titre: 'Organisme vérificateur', nom: data.organismeRef, date: '' },
  ], y + 5);

  // ─── Pied de page
  piedPage(doc, [
    'Art. R123-51 CCH · Art. R123-43 · Arrêté du 25 juin 1980 · Conservation : durée de vie de l\'établissement',
    'Contrôle annuel extincteurs obligatoire · Exercice d\'évacuation annuel obligatoire',
  ]);

  doc.save(`Registre_Securite_Incendie_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─────────────────────────────────────────────
//  PERMIS DE FEU
// ─────────────────────────────────────────────

export function genererPermisFeu(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  let y = enteteDocument(
    doc,
    'PERMIS DE FEU',
    'Travaux par points chauds · APSAD R6 · Obligatoire avant tout travail de soudure, découpage, meulage',
    data.entreprise,
    data.siret
  );

  // Avertissement
  doc.setFillColor(255, 235, 230);
  doc.setDrawColor(...ROUGE);
  doc.roundedRect(14, y, pw - 28, 12, 2, 2, 'FD');
  doc.setTextColor(...ROUGE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠  Ce permis doit être affiché sur le lieu de travail et conservé 5 ans.', 19, y + 8);
  y += 18;

  // ─── Identification
  y = sectionTitre(doc, '1. Identification', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 248, 252] } },
    theme: 'plain',
    body: [
      ['N° du permis', data.numero || `PF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`],
      ['Date de validité', `Du ${data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : '___'} au ${data.dateFin ? new Date(data.dateFin).toLocaleDateString('fr-FR') : '___'}`],
      ['Heure de début', data.heureDebut || '___:___'],
      ['Heure de fin', data.heureFin || '___:___'],
      ['Chantier / Établissement', data.chantier || ''],
      ['Localisation précise des travaux', data.localisation || ''],
      ['Entreprise exécutante', data.entrepriseExecutante || data.entreprise || ''],
      ['Nom de l\'exécutant', data.executant || ''],
    ],
  });
  y = doc.lastAutoTable.finalY + 6;

  // ─── Nature des travaux
  y = sectionTitre(doc, '2. Nature des travaux par points chauds', y);
  const typesTravaux = ['Soudure à l\'arc', 'Soudure oxyacétylénique', 'Découpage plasma/oxycoupage', 'Meulage / disqueuse', 'Chalumeau / décapeur', 'Brasage / soudo-brasage', 'Autre'];
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 6 }, 1: { cellWidth: 80 }, 2: { cellWidth: 6 }, 3: {} },
    theme: 'plain',
    body: typesTravaux.map((t, i) => {
      const selectionnes = data.typesTravaux || [];
      const sel = selectionnes.includes(t);
      const isLeft = i % 2 === 0;
      if (isLeft) {
        const suivant = typesTravaux[i + 1];
        const selSuivant = suivant ? selectionnes.includes(suivant) : false;
        return [`${sel ? '☑' : '☐'}`, t, suivant ? `${selSuivant ? '☑' : '☐'}` : '', suivant || ''];
      }
      return null;
    }).filter(Boolean),
  });
  y = doc.lastAutoTable.finalY + 4;
  if (data.descriptionTravaux) {
    doc.setFontSize(9);
    doc.setTextColor(...NOIR);
    doc.setFont('helvetica', 'bold');
    doc.text('Description des travaux :', 14, y + 4);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.descriptionTravaux, pw - 28);
    doc.text(lines, 14, y + 9);
    y += 9 + lines.length * 5;
  }
  y += 4;

  // ─── Analyse des risques
  y = sectionTitre(doc, '3. Analyse des risques', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
    body: [
      ['Matériaux inflammables dans la zone ?', data.materiauxInflammables || 'Non', 'Distance sécurité maintenue ?', data.distanceSecurite || '≥ 5m'],
      ['Risque d\'explosion ?', data.risqueExplosion || 'Non', 'Ventilation suffisante ?', data.ventilationSuffisante || 'Oui'],
      ['Canalisations gaz/liquides inflammables proches ?', data.canalisationsProches || 'Non', 'Permis délivré par', data.permisDelivrePar || ''],
    ],
    columnStyles: { 0: { fillColor: [248, 248, 252], fontStyle: 'bold' }, 2: { fillColor: [248, 248, 252], fontStyle: 'bold' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ─── Mesures préventives
  y = sectionTitre(doc, '4. Mesures préventives obligatoires', y);
  const mesures = [
    ['Protections contre la projection d\'étincelles (écrans, bâches ignifugées)', data.mesures?.projections],
    ['Arrosage préalable des zones combustibles', data.mesures?.arrosage],
    ['Extincteur chargé à portée immédiate du poste', data.mesures?.extincteur],
    ['EPI portés : lunettes, gants, écran facial, vêtements ignifugés', data.mesures?.epi],
    ['Mise hors service des détecteurs automatiques dans la zone (si applicable)', data.mesures?.detecteurs],
    ['Zone dégagée de tout matériau combustible sur ≥ 5m', data.mesures?.zone],
    ['Communication avec le gardien / agent de sécurité', data.mesures?.communication],
  ];
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Mesure de prévention', 'Réalisée']],
    body: mesures.map(([m, v]) => [m, v === true ? '✓ Oui' : v === false ? '✗ Non' : '☐']),
    columnStyles: { 1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ─── Surveillance après travaux
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitre(doc, '5. Surveillance après travaux (OBLIGATOIRE — 1h minimum après arrêt)', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: [248, 248, 252], cellWidth: 70 } },
    theme: 'plain',
    body: [
      ['Heure de fin effective des travaux', data.heureFinTravaux || '___:___'],
      ['Durée de surveillance post-travaux', data.dureeeSurveillance || '1 heure minimum'],
      ['Heure de fin de surveillance', data.heureFinSurveillance || '___:___'],
      ['Personne assurant la surveillance', data.surveillant || ''],
      ['Vérification finale : aucun foyer résiduel', data.verificationFinale || '☐ Oui'],
    ],
  });
  y = doc.lastAutoTable.finalY + 12;

  // ─── Signatures
  zoneSignatures(doc, [
    { titre: 'Donneur d\'ordre / Employeur', nom: data.donneurOrdre, date: data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : '' },
    { titre: 'Exécutant des travaux', nom: data.executant, date: data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : '' },
    { titre: 'Agent de sécurité / SST', nom: data.agentSecurite, date: '' },
  ], y);

  piedPage(doc, [
    'APSAD R6 · Art. R4227-1 CT · Recommandation CNPP — Conservation 5 ans minimum',
    'En cas d\'incident : appeler le 18 (pompiers) ou le 112 (secours européen)',
  ]);

  doc.save(`Permis_Feu_${data.chantier ? data.chantier.replace(/[^a-z0-9]/gi, '_').slice(0, 20) : ''}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─────────────────────────────────────────────
//  PPSPS — Plan Particulier de Sécurité et de Protection de la Santé
// ─────────────────────────────────────────────

export function genererPPSPS(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  let y = enteteDocument(
    doc,
    'PPSPS',
    'Plan Particulier de Sécurité et de Protection de la Santé · Art. R4532-61 à R4532-98 CT',
    data.entreprise,
    data.siret
  );

  // 1. Renseignements généraux chantier
  y = sectionTitre(doc, '1. Renseignements généraux du chantier', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65, fillColor: [248, 248, 252] } },
    theme: 'plain',
    body: [
      ['Intitulé de l\'opération', data.intitule || ''],
      ['Adresse du chantier', data.adresseChantier || ''],
      ['Maître d\'ouvrage', data.maitreouvrage || ''],
      ['Maître d\'œuvre / Architecte', data.maitreouvre || ''],
      ['Coordonnateur SPS (CSPS)', data.csps || ''],
      ['Entreprise principale', data.entreprisePrincipale || data.entreprise || ''],
      ['Montant estimatif des travaux', data.montantTravaux || ''],
      ['Date de début prévue', data.dateDebut ? new Date(data.dateDebut).toLocaleDateString('fr-FR') : ''],
      ['Date de fin prévue', data.dateFin ? new Date(data.dateFin).toLocaleDateString('fr-FR') : ''],
      ['Durée totale', data.duree || ''],
      ['Effectif maximal simultané', data.effectif || ''],
      ['Tranche horaire de travail', data.horaires || '7h30 – 17h30'],
      ['Zone géographique / Conditions météo particulières', data.conditionsMeteo || ''],
    ],
  });
  y = doc.lastAutoTable.finalY + 6;

  // 2. Description des travaux
  doc.addPage(); y = 20;
  y = sectionTitre(doc, '2. Description des travaux et phasage', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Phase', 'Description des travaux', 'Période', 'Entreprises intervenantes']],
    body: (data.phases?.length ? data.phases : [
      { phase: '1', description: data.descriptionTravaux || '', periode: `${data.dateDebut || ''}`, entreprises: data.entreprise || '' },
    ]).map(p => [p.phase, p.description, p.periode, p.entreprises]),
  });
  y = doc.lastAutoTable.finalY + 6;

  // 3. Organisation générale de la sécurité
  y = sectionTitre(doc, '3. Organisation générale de la prévention', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70, fillColor: [248, 248, 252] } },
    theme: 'plain',
    body: [
      ['Responsable sécurité sur chantier', data.responsableSecurite || ''],
      ['N° de téléphone urgences site', data.telUrgences || ''],
      ['Médecin du travail', data.medecinTravail || ''],
      ['Service des urgences le plus proche', data.urgences || 'SAMU : 15 · Pompiers : 18 · Police : 17'],
      ['Hôpital / Clinique le plus proche', data.hopital || ''],
      ['Infirmerie / SST sur chantier', data.infirmerie || ''],
      ['Point de rassemblement en cas d\'évacuation', data.pointRassemblement || ''],
      ['Itinéraire d\'accès secours', data.itineraireSecours || ''],
    ],
  });
  y = doc.lastAutoTable.finalY + 6;

  // 4. Risques spécifiques et mesures
  if (y > 200) { doc.addPage(); y = 20; }
  y = sectionTitre(doc, '4. Risques spécifiques et mesures de prévention', y);
  const risques = data.risquesSpecifiques?.length ? data.risquesSpecifiques : [
    { risque: 'Chutes de hauteur', mesures: 'Garde-corps, harnais, planchers de travail stables', responsable: 'Chef de chantier', epc: 'Garde-corps', epi: 'Harnais antichute' },
    { risque: 'Risque électrique', mesures: 'Habilitations électriques, consignation, TGBT cadenassé', responsable: 'Chef de chantier', epc: 'Balisage zone', epi: 'Gants isolants' },
    { risque: 'Co-activité', mesures: 'Planning coordination, zones exclusion, réunions sécurité', responsable: 'CSPS', epc: 'Signalétique', epi: 'EPI standards' },
    { risque: 'Manutention manuelle', mesures: 'Formation gestes et postures, aides mécaniques', responsable: 'RH', epc: 'Chariots élévateurs', epi: 'Gants, chaussures sécurité' },
    ...(data.risquesSpecifiques || []),
  ].slice(0, 8);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Risque identifié', 'Mesures de prévention', 'Responsable', 'EPC', 'EPI']],
    body: risques.map(r => [r.risque, r.mesures, r.responsable, r.epc, r.epi]),
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // 5. Gestion des déchets et environnement
  doc.addPage(); y = 20;
  y = sectionTitre(doc, '5. Gestion des déchets de chantier', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Type de déchet', 'Filière d\'élimination', 'Prestataire', 'Conteneur / Zone de tri']],
    body: (data.dechets?.length ? data.dechets : [
      { type: 'Déchets inertes (béton, terre)', filiere: 'Décharge classe 3', prestataire: '', conteneur: 'Benne dédiée' },
      { type: 'Déchets industriels banals (bois, plastiques)', filiere: 'Centre de tri', prestataire: '', conteneur: 'Benne' },
      { type: 'Déchets dangereux (peintures, solvants)', filiere: 'Centre agréé BSDD', prestataire: '', conteneur: 'Fûts étanches' },
      { type: 'Métaux / ferrailles', filiere: 'Ferrailleur agréé', prestataire: '', conteneur: 'Zone dédiée' },
    ]).map(d => [d.type, d.filiere, d.prestataire, d.conteneur]),
  });
  y = doc.lastAutoTable.finalY + 6;

  // 6. Installations de chantier
  y = sectionTitre(doc, '6. Installations de chantier et conditions de travail', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70, fillColor: [248, 248, 252] } },
    theme: 'plain',
    body: [
      ['Vestiaires', data.vestiaires || '☐ Sur chantier  ☐ Véhicule aménagé  ☐ Autre'],
      ['Sanitaires / WC', data.sanitaires || '☐ Sanitaires fixes  ☐ Sanitaires mobiles'],
      ['Réfectoire / Salle de repas', data.refectoire || '☐ Présent  ☐ Absent'],
      ['Eau potable', data.eauPotable || '☐ Robinet  ☐ Bouteilles'],
      ['Electricité de chantier', data.electricite || '☐ TGBT chantier  ☐ Groupe électrogène'],
      ['Accès chantier (livraisons, engins)', data.acces || ''],
      ['Plan de circulation chantier joint', data.planCirculation || '☐ Oui  ☐ Non'],
      ['Signalisation extérieure mise en place', data.signalisation || '☐ Oui  ☐ Non'],
    ],
  });
  y = doc.lastAutoTable.finalY + 6;

  // 7. Formations sécurité et premiers secours
  y = sectionTitre(doc, '7. Formations sécurité — Personnel sur chantier', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Nom / Prénom', 'Qualification / Rôle', 'Habilitations / Formations', 'Validité']],
    body: (data.personnelSecurite?.length ? data.personnelSecurite : [
      { nom: '', qualification: 'Chef de chantier', habilitations: 'Formation sécurité, habilitation électrique', validite: '' },
      { nom: '', qualification: 'SST — Sauveteur Secouriste du Travail', habilitations: 'SST', validite: '2 ans' },
    ]).map(p => [p.nom, p.qualification, p.habilitations, p.validite]),
  });
  y = doc.lastAutoTable.finalY + 12;

  // Signatures
  zoneSignatures(doc, [
    { titre: 'Responsable de l\'entreprise', nom: data.dirigeant || '', date: new Date().toLocaleDateString('fr-FR') },
    { titre: 'Chef de chantier', nom: data.responsableSecurite || '', date: '' },
    { titre: 'Coordinateur SPS (CSPS)', nom: data.csps || '', date: '' },
  ], y);

  piedPage(doc, [
    'Art. R4532-61 à R4532-98 CT · Décret n°94-1159 du 26/12/1994 · Remis au CSPS avant démarrage',
    'Mis à jour à chaque modification significative des conditions de travail',
  ]);

  doc.save(`PPSPS_${data.intitule ? data.intitule.replace(/[^a-z0-9]/gi, '_').slice(0, 25) : 'Chantier'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─────────────────────────────────────────────
//  AFFICHAGE OBLIGATOIRE BTP
// ─────────────────────────────────────────────

export function genererAffichageObligatoire(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  let y = enteteDocument(
    doc,
    'TABLEAU D\'AFFICHAGE OBLIGATOIRE BTP',
    'Vérification de conformité des affichages légaux · Art. L1221-13 et R4141-13 CT',
    data.entreprise,
    data.siret
  );

  const check = (val) => val ? '✓' : '☐';

  const sections = [
    {
      titre: '1. Affichages obligatoires en entreprise (bureau / siège)',
      items: [
        ['Coordonnées de l\'inspecteur du travail compétent (DREETS)', check(data.inspecteurTravail), 'Art. L8112-1 CT'],
        ['Coordonnées du médecin du travail / service de santé au travail', check(data.medecinTravail), 'Art. R4624-1 CT'],
        ['Adresse et téléphone des services d\'urgence (SAMU, Pompiers, Police)', check(data.urgences), 'Art. R4227-37 CT'],
        ['Convention collective applicable (intitulé et lieu de consultation)', check(data.conventionCollective), 'Art. D2261-3 CT'],
        ['Règlement intérieur (si ≥ 50 salariés)', check(data.reglementInterieur), 'Art. L1321-4 CT'],
        ['Panneau "Interdiction de fumer et de vapoter"', check(data.interFumer), 'Décret n°2006-1386'],
        ['Lutte contre le harcèlement moral', check(data.harcelementMoral), 'Art. L1153-5 CT'],
        ['Lutte contre le harcèlement sexuel', check(data.harcelementSexuel), 'Art. L1153-5 CT'],
        ['Égalité de rémunération femmes/hommes', check(data.egaliteHF), 'Art. L3221-9 CT'],
        ['Lutte contre les discriminations', check(data.discriminations), 'Art. L1142-8 CT'],
        ['Voies de recours en matière de harcèlement', check(data.voiesRecours), 'Art. L1154-1 CT'],
        ['Emplacement du Document Unique d\'Évaluation des Risques (DUER)', check(data.duer), 'Art. R4121-4 CT'],
      ],
    },
    {
      titre: '2. Affichages spécifiques chantier BTP',
      items: [
        ['Panneau de chantier (déclaration préalable / permis de construire)', check(data.panneauChantier), 'Art. R421-39 Code Urbanisme'],
        ['Plan d\'installation du chantier', check(data.planInstallation), 'Art. R4532-8 CT'],
        ['Consignes de sécurité du chantier', check(data.consignesSecurite), 'Art. R4141-14 CT'],
        ['EPI obligatoires sur le chantier (pictogrammes)', check(data.epiObligatoires), 'Art. R4323-95 CT'],
        ['Panneau "Risque électrique"', check(data.risqueElectrique), 'NF C 18-510'],
        ['Panneau "Port du casque obligatoire"', check(data.casqueObligatoire), 'Art. R4323-91 CT'],
        ['Panneau "Port des chaussures de sécurité obligatoire"', check(data.chaussuresSecurite), 'Art. R4323-91 CT'],
        ['Coordonnées CSPS / Coordinateur SPS', check(data.csps), 'Art. L4532-4 CT'],
        ['Plan d\'évacuation et point de rassemblement', check(data.planEvacuation), 'Art. R4227-39 CT'],
        ['Registre de sécurité incendie (emplacement)', check(data.registreIncendie), 'Art. R123-51 CCH'],
        ['Fiches de données de sécurité (FDS) accessibles', check(data.fds), 'Règlement REACH (CE) 1907/2006'],
        ['Panneau "Carte BTP obligatoire"', check(data.carteBTP), 'Art. L8291-1 CT'],
        ['Signalisation de circulation / voie d\'accès des secours', check(data.signalisationCirculation), 'Art. R4214-23 CT'],
        ['Interdiction d\'accès aux personnes non autorisées', check(data.interdictionAcces), 'Art. R4214-1 CT'],
      ],
    },
    {
      titre: '3. Affichages liés aux risques spécifiques',
      items: [
        ['Risque amiante — signalisation de zone', check(data.amiante), 'Décret n°2012-639'],
        ['Risque plomb — signalisation de zone', check(data.plomb), 'Art. R4412-160 CT'],
        ['Travaux en hauteur — pictogramme port EPI anti-chute', check(data.travauxHauteur), 'Art. R4323-88 CT'],
        ['Travaux sur voie publique — signalisation réglementaire', check(data.voiePublique), 'Arrêté du 20 jan. 2000'],
        ['Produits chimiques dangereux — étiquetage CLP', check(data.chimique), 'Règlement (CE) 1272/2008'],
        ['Installations électriques temporaires — balisage TGBT', check(data.electriciteTemp), 'NF C 18-510'],
      ],
    },
  ];

  sections.forEach(section => {
    if (y > 220) { doc.addPage(); y = 20; }
    y = sectionTitre(doc, section.titre, y);
    autoTable(doc, {
      startY: y, margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Affichage obligatoire', 'En place', 'Référence légale']],
      body: section.items,
      columnStyles: {
        1: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 48, fontSize: 7, textColor: GRIS },
      },
      bodyStyles: { textColor: NOIR },
      didParseCell: (hookData) => {
        if (hookData.column.index === 1) {
          const v = hookData.cell.raw;
          if (v === '✓') hookData.cell.styles.textColor = VERT;
          else hookData.cell.styles.textColor = ORANGE;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 6;
  });

  // Bilan
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitre(doc, '4. Bilan et plan de mise en conformité', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70, fillColor: [248, 248, 252] } },
    theme: 'plain',
    body: [
      ['Date de vérification', new Date().toLocaleDateString('fr-FR')],
      ['Vérificateur', data.verificateur || ''],
      ['Affichages manquants identifiés', data.manquants || 'Aucun'],
      ['Actions correctives prévues', data.actionsCorrectives || '—'],
      ['Date de mise en conformité prévue', data.dateMiseConformite || '—'],
      ['Prochaine vérification', data.prochaineVerification || ''],
    ],
  });
  y = doc.lastAutoTable.finalY + 12;

  zoneSignatures(doc, [
    { titre: 'Responsable sécurité / QSE', nom: data.verificateur, date: new Date().toLocaleDateString('fr-FR') },
    { titre: 'Dirigeant / Gérant', nom: data.dirigeant, date: new Date().toLocaleDateString('fr-FR') },
  ], y);

  piedPage(doc, [
    'Art. L1221-13 CT · Art. R4141-13 CT · Vérification recommandée au minimum annuellement',
    'Tout affichage manquant peut donner lieu à une mise en demeure de l\'inspection du travail',
  ]);

  doc.save(`Affichage_Obligatoire_BTP_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─────────────────────────────────────────────
//  PLAN DE PRÉVENTION (amélioré)
// ─────────────────────────────────────────────

export function genererPlanPrevention(plan, entreprise, siret) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  let y = enteteDocument(
    doc,
    'PLAN DE PRÉVENTION',
    'Co-activité avec entreprises extérieures · Art. R4512-6 à R4512-12 CT',
    entreprise,
    siret
  );

  y = sectionTitre(doc, '1. Identification du chantier et des intervenants', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65, fillColor: [248, 248, 252] } },
    theme: 'plain',
    body: [
      ['Chantier / Établissement d\'accueil', plan.chantier || ''],
      ['Date d\'inspection préalable', plan.date ? new Date(plan.date).toLocaleDateString('fr-FR') : ''],
      ['Date de début des travaux', plan.dateDebut ? new Date(plan.dateDebut).toLocaleDateString('fr-FR') : ''],
      ['Date de fin prévue', plan.dateFin ? new Date(plan.dateFin).toLocaleDateString('fr-FR') : ''],
      ['Entreprise utilisatrice (EU)', entreprise],
      ['Entreprises extérieures (EE)', (plan.entreprises || []).join(', ')],
    ],
  });
  y = doc.lastAutoTable.finalY + 6;

  y = sectionTitre(doc, '2. Risques d\'interférence et mesures de prévention', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Risque d\'interférence', 'Mesure de prévention associée', 'Responsable']],
    body: (plan.risques || []).map(r => [r, 'À définir en concertation', 'EU + EE']),
  });
  y = doc.lastAutoTable.finalY + 6;

  y = sectionTitre(doc, '3. Mesures générales convenues', y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...NOIR);
  const mesuresText = plan.mesures || 'Mesures à définir lors de l\'inspection préalable.';
  const lines = doc.splitTextToSize(mesuresText, pw - 28);
  doc.text(lines, 14, y);
  y += lines.length * 5 + 10;

  zoneSignatures(doc, [
    { titre: 'Représentant de l\'Entreprise Utilisatrice', nom: '', date: plan.date ? new Date(plan.date).toLocaleDateString('fr-FR') : '' },
    { titre: 'Représentant de l\'Entreprise Extérieure', nom: '', date: '' },
  ], y);

  piedPage(doc, [
    'Art. R4512-6 à R4512-12 CT · Plan de prévention écrit obligatoire si opération > 400 heures ou travaux dangereux',
  ]);

  doc.save(`Plan_Prevention_${plan.chantier ? plan.chantier.replace(/[^a-z0-9]/gi, '_').slice(0, 20) : ''}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─────────────────────────────────────────────
//  DUERP — PDF professionnel
// ─────────────────────────────────────────────

export function genererDUERP(risques, entreprise, siret) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  let y = enteteDocument(
    doc,
    'DUERP — Document Unique d\'Évaluation des Risques Professionnels',
    'Art. R4121-1 CT · Obligatoire dès 1 salarié · Mise à jour annuelle et après tout incident',
    entreprise,
    siret
  );

  y = sectionTitre(doc, 'Tableau d\'évaluation des risques professionnels', y);

  const getNiveauColor = (c) => {
    if (c >= 13) return [255, 235, 238];
    if (c >= 9) return [255, 243, 224];
    if (c >= 5) return [255, 253, 231];
    return [232, 245, 233];
  };

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    head: [['Unité de Travail', 'Danger identifié', 'Source du risque', 'Effectifs', 'P', 'G', 'C', 'Niveau', 'Mesures de prévention', 'Responsable', 'Délai', 'Statut']],
    body: risques.map(r => {
      const c = Number(r.P) * Number(r.G);
      const { label } = r.P && r.G ? { label: c >= 13 ? 'CRITIQUE' : c >= 9 ? 'ÉLEVÉ' : c >= 5 ? 'MOYEN' : 'FAIBLE' } : { label: '—' };
      return [r.ut, r.danger, r.source, r.effectifs, r.P, r.G, c, label, r.mesures, r.responsable, r.delai ? new Date(r.delai).toLocaleDateString('fr-FR') : '—', r.statut === 'realise' ? 'Réalisé' : r.statut === 'en_cours' ? 'En cours' : 'Planifié'];
    }),
    columnStyles: {
      0: { cellWidth: 28 }, 1: { cellWidth: 28 }, 2: { cellWidth: 28 },
      3: { cellWidth: 14, halign: 'center' }, 4: { cellWidth: 8, halign: 'center' },
      5: { cellWidth: 8, halign: 'center' }, 6: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 40 }, 9: { cellWidth: 22 }, 10: { cellWidth: 18 }, 11: { cellWidth: 20 },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 6) {
        const c = Number(hookData.cell.raw);
        hookData.cell.styles.fillColor = getNiveauColor(c);
        hookData.cell.styles.textColor = c >= 13 ? ROUGE : c >= 9 ? ORANGE : c >= 5 ? [133, 100, 4] : VERT;
      }
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Légende
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NOIR);
  doc.text('Légende :', 14, y);
  const legende = [
    { label: 'FAIBLE (1-4)', color: [232, 245, 233], text: VERT },
    { label: 'MOYEN (5-8)', color: [255, 253, 231], text: [133, 100, 4] },
    { label: 'ÉLEVÉ (9-12)', color: [255, 243, 224], text: ORANGE },
    { label: 'CRITIQUE (13-16)', color: [255, 235, 238], text: ROUGE },
  ];
  legende.forEach((l, i) => {
    const x = 35 + i * 45;
    doc.setFillColor(...l.color);
    doc.rect(x, y - 4, 40, 7, 'F');
    doc.setTextColor(...l.text);
    doc.setFont('helvetica', 'bold');
    doc.text(l.label, x + 2, y);
  });

  zoneSignatures(doc, [
    { titre: 'Responsable de l\'entreprise', nom: '', date: new Date().toLocaleDateString('fr-FR') },
    { titre: 'Représentant du personnel (si applicable)', nom: '', date: '' },
  ], y + 15);

  piedPage(doc, [
    'Art. R4121-1 CT · Mise à jour annuelle obligatoire et après tout AT, maladie professionnelle ou aménagement important · Conservation : 40 ans',
    'P = Probabilité (1 à 4) · G = Gravité (1 à 4) · C = Criticité (P × G)',
  ]);

  doc.save(`DUERP_${entreprise ? entreprise.replace(/[^a-z0-9]/gi, '_').slice(0, 20) : 'Entreprise'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─────────────────────────────────────────────
//  PLAN DE GESTION DES DÉCHETS (BSDD)
// ─────────────────────────────────────────────

export function genererPlanDechet(data) {
  const { identification = {}, dechetsInertes = [], dechetsNonDangereux = [], dechetsDangereux = [], tri5flux = {}, tracabilite = {}, entreprise = 'Bernard Martin BTP', siret = '123 456 789 00012' } = data;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  let y = enteteDocument(doc, 'PLAN DE GESTION DES DÉCHETS DE CHANTIER', 'Loi n°2020-105 · Art. L541-1 CE · Décret n°2020-1573 (tri 5 flux) · BSDD obligatoire', entreprise, siret);

  y = sectionTitre(doc, '1. Identification du chantier', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [240, 255, 244] } },
    theme: 'plain',
    body: [
      ['Chantier', identification.nomChantier || ''],
      ['Adresse', identification.adresse || ''],
      ['Maître d\'ouvrage', identification.maitreouvrage || ''],
      ['Responsable déchets', identification.responsable || ''],
      ['Période de chantier', `${identification.dateDebut || '—'} → ${identification.dateFin || '—'}`],
      ['Surface concernée', identification.surface || ''],
    ],
  });
  y = doc.lastAutoTable.finalY + 6;

  const cols5flux = ['Flux', 'Benne dédiée', 'Prestataire', 'Fréquence enlèvement', 'Centre de valorisation'];
  const FLUX = ['Bois', 'Métal / Ferraille', 'Plastique', 'Plâtre', 'Gravats / Béton / Briques'];
  y = sectionTitre(doc, '2. Plan de tri sur chantier — 5 flux obligatoires (Décret 2020-1573)', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [26, 127, 67], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [cols5flux],
    body: FLUX.map(flux => {
      const f = tri5flux[flux.toLowerCase().replace(/[^a-z]/g, '_')] || {};
      return [flux, f.benneDediee ? '✓' : '—', f.prestataire || '—', f.frequence || '—', f.centre || '—'];
    }),
  });
  y = doc.lastAutoTable.finalY + 6;

  y = sectionTitre(doc, '3. Déchets inertes (DI) — Code déchet 17 xx xx', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [91, 91, 214], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Nature déchet', 'Code déchet', 'Quantité estimée (t)', 'Mode élimination', 'Centre de traitement', 'Distance (km)']],
    body: dechetsInertes.length > 0 ? dechetsInertes.map(d => [d.nature, d.code, d.quantite, d.mode, d.centre, d.distance]) : [['—', '—', '—', '—', '—', '—']],
  });
  y = doc.lastAutoTable.finalY + 6;

  y = sectionTitre(doc, '4. Déchets non dangereux (DND) — Code déchet 17 02 xx / 20 xx xx', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [230, 126, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Nature déchet', 'Code déchet', 'Quantité estimée (t)', 'Mode élimination', 'Centre de traitement', 'Distance (km)']],
    body: dechetsNonDangereux.length > 0 ? dechetsNonDangereux.map(d => [d.nature, d.code, d.quantite, d.mode, d.centre, d.distance]) : [['—', '—', '—', '—', '—', '—']],
  });
  y = doc.lastAutoTable.finalY + 6;

  if (doc.internal.getCurrentPageInfo().pageNumber === 1 && y > 160) { doc.addPage(); y = 20; }

  y = sectionTitre(doc, '5. Déchets dangereux (DD) — BSDD obligatoire', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [192, 57, 43], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Nature déchet', 'Code déchet', 'Quantité estimée (t)', 'Mode élimination', 'Transporteur agréé', 'BSDD requis']],
    body: dechetsDangereux.length > 0 ? dechetsDangereux.map(d => [d.nature, d.code, d.quantite, d.mode, d.transporteur, '✓ Obligatoire']) : [['—', '—', '—', '—', '—', '—']],
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 5) {
        hookData.cell.styles.textColor = [192, 57, 43];
        hookData.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  y = sectionTitre(doc, '6. Traçabilité et transport', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70, fillColor: [240, 255, 244] } },
    theme: 'plain',
    body: [
      ['Responsable suivi déchets', tracabilite.responsable || ''],
      ['Opérateur agréé d\'élimination', tracabilite.operateur || ''],
      ['Fréquence d\'enlèvement', tracabilite.frequence || ''],
      ['Registre BSDD', tracabilite.registre || 'Tenu à jour — disponible sur demande'],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  zoneSignatures(doc, [
    { titre: 'Responsable chantier', nom: '', date: new Date().toLocaleDateString('fr-FR') },
    { titre: 'Responsable QSE / Environnement', nom: '', date: '' },
  ], y);

  piedPage(doc, [
    'Loi n°2020-105 du 10 février 2020 relative à la lutte contre le gaspillage et à l\'économie circulaire',
    'Art. L541-1 et suivants Code de l\'environnement · Décret n°2020-1573 du 11 décembre 2020 (tri 5 flux obligatoire)',
    'BSDD (Bordereau de Suivi de Déchets Dangereux) — conservation 3 ans minimum (Art. R541-43 CE)',
  ]);

  doc.save(`Plan_Dechets_${identification.nomChantier ? identification.nomChantier.replace(/[^a-z0-9]/gi, '_').slice(0, 20) : 'Chantier'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─────────────────────────────────────────────
//  DIAGNOSTIC AVANT DÉMOLITION / RÉHABILITATION
// ─────────────────────────────────────────────

export function genererDiagnostic(data) {
  const { batiment = {}, amiante = [], plomb = [], autresSubstances = [], estimationDechets = [], recommandations = '', operateur = {}, signatures = {}, entreprise = 'Bernard Martin BTP', siret = '123 456 789 00012' } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = enteteDocument(doc, 'DIAGNOSTIC AVANT DÉMOLITION / RÉHABILITATION', 'Art. R4412-97 CT (amiante) · Art. R4412-152 CT (plomb) · Décret 96-97 · Art. L271-4 CCH', entreprise, siret);

  y = sectionTitre(doc, '1. Identification du bâtiment', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65, fillColor: [255, 249, 230] } },
    theme: 'plain',
    body: [
      ['Adresse du bâtiment', batiment.adresse || ''],
      ['Date de construction', batiment.dateConstruction || ''],
      ['N° de permis de construire', batiment.numeroPc || ''],
      ['Propriétaire', batiment.proprietaire || ''],
      ['Surface totale', batiment.surface || ''],
      ['Usage', batiment.usage || ''],
      ['Nature de l\'opération', batiment.natureOperation || ''],
    ],
  });
  y = doc.lastAutoTable.finalY + 6;

  y = sectionTitre(doc, '2. Diagnostic amiante (Art. R4412-97 CT)', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [133, 100, 4], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Localisation', 'Type de matériau', 'État conservation', 'Surface/Quantité', 'Recommandation']],
    body: amiante.length > 0 ? amiante.map(a => [a.localisation, a.type, a.etat, a.quantite, a.recommandation]) : [['Pas de matériaux amiantés identifiés', '—', '—', '—', '—']],
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.cell.raw && (hookData.cell.raw.includes('SS3') || hookData.cell.raw.includes('SS4'))) {
        hookData.cell.styles.textColor = ROUGE;
        hookData.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  y = sectionTitre(doc, '3. Diagnostic plomb / CREP (Art. L271-4 CCH)', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [192, 57, 43], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Zone / Pièce', 'Teneur plomb (mg/cm²)', 'État (dégradé/non dégradé)', 'Action requise']],
    body: plomb.length > 0 ? plomb.map(p => [p.zone, p.teneur, p.etat, p.action]) : [['Négatif — pas de plomb détecté', '< 1 mg/cm²', 'Non applicable', '—']],
  });
  y = doc.lastAutoTable.finalY + 6;

  if (autresSubstances.length > 0) {
    y = sectionTitre(doc, '4. Autres substances (PCB, HAP, Mercure)', y);
    autoTable(doc, {
      startY: y, margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Substance', 'Localisation', 'Concentration détectée', 'Action requise']],
      body: autresSubstances.map(s => [s.substance, s.localisation, s.concentration, s.action]),
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  y = sectionTitre(doc, '5. Estimation des déchets de démolition', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [91, 91, 214], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Nature des déchets', 'Code déchet', 'Quantité estimée (t)', 'Filière de traitement']],
    body: estimationDechets.length > 0 ? estimationDechets.map(d => [d.nature, d.code, d.quantite, d.filiere]) : [['—', '—', '—', '—']],
  });
  y = doc.lastAutoTable.finalY + 6;

  if (recommandations) {
    y = sectionTitre(doc, '6. Recommandations et mesures de protection', y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NOIR);
    const pw = doc.internal.pageSize.getWidth();
    const lines = doc.splitTextToSize(recommandations, pw - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 6;
  }

  y = sectionTitre(doc, '7. Qualifications de l\'opérateur', y);
  autoTable(doc, {
    startY: y, margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65, fillColor: [248, 248, 252] } },
    theme: 'plain',
    body: [
      ['Opérateur diagnostiqueur', operateur.nom || ''],
      ['Certification', operateur.certification || ''],
      ['N° de certification', operateur.numeroCertif || ''],
      ['Validité de la certification', operateur.validiteCertif || ''],
      ['Date du diagnostic', operateur.dateDiagnostic || new Date().toLocaleDateString('fr-FR')],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  zoneSignatures(doc, [
    { titre: 'Opérateur diagnostiqueur', nom: operateur.nom || '', date: operateur.dateDiagnostic || new Date().toLocaleDateString('fr-FR') },
    { titre: 'Maître d\'ouvrage', nom: '', date: '' },
  ], y);

  piedPage(doc, [
    'Art. R4412-97 CT — Repérage amiante avant travaux obligatoire (Décret 2012-639)',
    'Art. L271-4 CCH — CREP obligatoire avant vente de logement construit avant 1949',
    'Art. R4412-152 CT — Protection travailleurs exposition au plomb',
    'Arrêté du 12 décembre 2012 — Modalités du repérage de l\'amiante avant travaux',
  ]);

  doc.save(`Diagnostic_Demolition_${batiment.adresse ? batiment.adresse.replace(/[^a-z0-9]/gi, '_').slice(0, 20) : 'Batiment'}_${new Date().toISOString().split('T')[0]}.pdf`);
}
