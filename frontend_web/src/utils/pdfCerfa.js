import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ══════════════════════════════════════════════════════════════
//  Génération PDF des formulaires Cerfa — mise en page officielle
// ══════════════════════════════════════════════════════════════

const BLEU = [37, 99, 235];
const ROUGE = [220, 38, 38];
const GRIS = [100, 100, 100];
const NOIR = [10, 10, 10];
const FOND = [248, 248, 248];

function initPDF(titre, cerfa) {
  const doc = new jsPDF('p', 'mm', 'a4');
  // En-tête type Cerfa
  doc.setFillColor(...BLEU);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(titre, 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(cerfa, 105, 19, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Document généré par Freample Artisans — Conforme aux exigences réglementaires', 105, 25, { align: 'center' });
  doc.setTextColor(...NOIR);
  return doc;
}

function section(doc, y, titre) {
  doc.setFillColor(...BLEU);
  doc.rect(15, y, 180, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(titre, 18, y + 5);
  doc.setTextColor(...NOIR);
  doc.setFont('helvetica', 'normal');
  return y + 10;
}

function ligne(doc, y, label, valeur, opts = {}) {
  if (y > 275) { doc.addPage(); y = 15; }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRIS);
  doc.text(label, 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...NOIR);
  doc.setFontSize(9);
  doc.text(String(valeur || '—'), opts.x || 75, y);
  return y + 5;
}

function checkbox(doc, y, label, checked) {
  if (y > 275) { doc.addPage(); y = 15; }
  doc.setFontSize(8);
  doc.rect(18, y - 3, 3.5, 3.5);
  if (checked) {
    doc.setFillColor(...BLEU);
    doc.rect(18, y - 3, 3.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('X', 18.8, y - 0.3);
  }
  doc.setTextColor(...NOIR);
  doc.setFontSize(8);
  doc.text(label, 24, y);
  return y + 5;
}

function texteLibre(doc, y, label, texte) {
  if (y > 270) { doc.addPage(); y = 15; }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRIS);
  doc.text(label, 18, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...NOIR);
  doc.setFontSize(8);
  const lines = doc.splitTextToSize(String(texte || '—'), 170);
  lines.forEach(l => {
    if (y > 280) { doc.addPage(); y = 15; }
    doc.text(l, 18, y);
    y += 4;
  });
  return y + 2;
}

function footer(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...GRIS);
    doc.text(`Page ${i}/${pages} — Généré le ${new Date().toLocaleDateString('fr-FR')} par Freample Artisans`, 105, 290, { align: 'center' });
  }
}

// ══ DÉCLARATION AT (S6200) ══
export function genererPDF_DAT(s, e, f) {
  const doc = initPDF("DÉCLARATION D'ACCIDENT DU TRAVAIL OU DE TRAJET", "Cerfa 14463 (S6200) — Art. L441-2 CSS — Délai : 48 heures");
  let y = 35;

  y = section(doc, y, '1. EMPLOYEUR');
  y = ligne(doc, y, 'SIRET', e.siret);
  y = ligne(doc, y, 'Code risque AT', e.codeRisque);
  y = ligne(doc, y, 'Raison sociale', e.nom);
  y = ligne(doc, y, 'Adresse', `${e.adresse}, ${e.cp} ${e.ville}`);
  y = ligne(doc, y, 'Téléphone', e.tel);
  y = ligne(doc, y, 'Code NAF/APE', e.codeNAF);
  y = ligne(doc, y, 'Organisme AT', e.cpam);
  y += 3;

  y = section(doc, y, '2. VICTIME');
  y = ligne(doc, y, 'Nom de naissance', s.nom);
  y = ligne(doc, y, 'Nom d\'usage', s.nomUsage || '—');
  y = ligne(doc, y, 'Prénom(s)', s.prenom);
  y = ligne(doc, y, 'N° Sécurité sociale', s.numSecu);
  y = ligne(doc, y, 'Date de naissance', s.dn);
  y = ligne(doc, y, 'Sexe', s.sexe === 'M' ? 'Masculin' : 'Féminin');
  y = ligne(doc, y, 'Nationalité', s.nat);
  y = ligne(doc, y, 'Adresse', `${s.adr}, ${s.cp} ${s.ville}`);
  y = ligne(doc, y, 'Profession', s.poste);
  y = ligne(doc, y, 'Qualification', s.qualif);
  y = ligne(doc, y, 'Date d\'embauche', s.emb);
  y = ligne(doc, y, 'Contrat', s.contrat);
  y = ligne(doc, y, 'Examen médical', f.examMedical || 'Non renseigné');
  y += 3;

  y = section(doc, y, '3. ACCIDENT');
  y = ligne(doc, y, 'Date', f.dateAcc);
  y = ligne(doc, y, 'Heure', f.heureAcc);
  y = ligne(doc, y, 'Horaire travail', `de ${f.horaireDebut || '___'} à ${f.horaireFin || '___'}`);
  y = ligne(doc, y, 'Info employeur', `${f.dateInfo || ''} ${f.heureInfo || ''}`);
  y += 2;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRIS);
  doc.text('Lieu de l\'accident :', 18, y); y += 5;
  y = checkbox(doc, y, 'Lieu de travail habituel', f.lieuHabituel);
  y = checkbox(doc, y, 'Lieu de travail occasionnel', f.lieuOccasionnel);
  y = checkbox(doc, y, 'Déplacement pour l\'employeur', f.lieuDeplacement);
  y = checkbox(doc, y, 'Domicile du salarié', f.lieuDomicile);
  y = checkbox(doc, y, 'Trajet aller domicile → travail', f.lieuTrajetAller);
  y = checkbox(doc, y, 'Trajet retour travail → domicile', f.lieuTrajetRetour);
  y = checkbox(doc, y, 'Trajet travail → restauration', f.lieuTrajetRepas);
  y = ligne(doc, y, 'Adresse précise', f.adresseLieu);
  y += 3;

  y = section(doc, y, '4. CIRCONSTANCES');
  y = texteLibre(doc, y, 'Activité de la victime', f.activite);
  y = texteLibre(doc, y, 'Circonstances détaillées', f.circonstances);
  y = ligne(doc, y, 'Siège des lésions', f.siege);
  y = ligne(doc, y, 'Nature des lésions', f.nature);
  y += 3;

  y = section(doc, y, '5. TIERS & TÉMOINS');
  y = checkbox(doc, y, 'Accident causé par un tiers', f.tiers);
  if (f.tiers) y = ligne(doc, y, 'Tiers', f.tiersNom);
  y = checkbox(doc, y, 'Témoin(s) présent(s)', f.temoinOui);
  if (f.temoinOui) {
    y = ligne(doc, y, 'Témoin 1', `${f.temoin1Nom || ''} — ${f.temoin1Adr || ''}`);
    y = ligne(doc, y, 'Témoin 2', `${f.temoin2Nom || ''} — ${f.temoin2Adr || ''}`);
  }
  y += 3;

  y = section(doc, y, '6. ARRÊT DE TRAVAIL');
  y = checkbox(doc, y, 'Cessation le jour même', f.cessation);
  y = ligne(doc, y, 'Dernier jour de travail', f.dernierJour);
  y = checkbox(doc, y, 'Journée intégralement payée', f.journeePayee);
  y = ligne(doc, y, 'Date de reprise', f.dateReprise || 'Non connue');
  y += 3;

  y = section(doc, y, '7. RÉSERVES');
  y = checkbox(doc, y, 'Réserves motivées de l\'employeur', f.reserves);
  if (f.reserves) y = texteLibre(doc, y, 'Motifs', f.reservesMotif);
  y += 8;

  // Signature
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.text(`Fait à ${e.ville}, le ${new Date().toLocaleDateString('fr-FR')}`, 18, y);
  y += 8;
  doc.text('Signature et cachet de l\'employeur :', 18, y);
  y += 15;
  doc.setDrawColor(...GRIS);
  doc.line(18, y, 90, y);

  // Rappel légal
  y += 10;
  doc.setFillColor(255, 240, 240);
  doc.rect(15, y - 3, 180, 18, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...ROUGE);
  doc.text('RAPPELS IMPORTANTS', 18, y + 2);
  doc.setTextColor(...NOIR);
  doc.text('• Délai de déclaration : 48 heures (Art. L441-2 CSS)', 18, y + 6);
  doc.text('• Amende : 750€ par infraction en cas de non-déclaration (Art. R471-3 CSS)', 18, y + 10);
  doc.text('• Remettre la feuille d\'accident S6201 au salarié le jour même · Conserver ce document 5 ans', 18, y + 14);

  footer(doc);
  doc.save(`Declaration_AT_${s.nom}_${f.dateAcc || 'date'}.pdf`);
}

// ══ FEUILLE AT/MP (S6201) ══
export function genererPDF_FAT(s, e, f) {
  const doc = initPDF("FEUILLE D'ACCIDENT DU TRAVAIL\nOU DE MALADIE PROFESSIONNELLE", "Cerfa 11383 (S6201) — À remettre à la victime");
  let y = 35;

  y = section(doc, y, 'CAISSE PRIMAIRE D\'ASSURANCE MALADIE');
  y = texteLibre(doc, y, '', e.cpam);
  y += 3;

  y = section(doc, y, 'EMPLOYEUR');
  y = ligne(doc, y, 'SIRET', e.siret);
  y = ligne(doc, y, 'Raison sociale', e.nom);
  y = ligne(doc, y, 'Adresse', `${e.adresse}, ${e.cp} ${e.ville}`);
  y += 3;

  y = section(doc, y, 'VICTIME');
  y = ligne(doc, y, 'N° Sécurité sociale', s.numSecu);
  y = ligne(doc, y, 'Nom de naissance', s.nom);
  y = ligne(doc, y, 'Prénom(s)', s.prenom);
  y = ligne(doc, y, 'Adresse', `${s.adr}, ${s.cp} ${s.ville}`);
  y += 3;

  y = section(doc, y, 'ACCIDENT / MALADIE');
  y = checkbox(doc, y, 'Accident du travail', f.typeAT);
  y = checkbox(doc, y, 'Accident de trajet', f.typeTrajet);
  y = checkbox(doc, y, 'Maladie professionnelle', f.typeMP);
  y = ligne(doc, y, 'Date', f.dateEvt);
  y += 5;

  // Encadré info
  doc.setFillColor(240, 253, 244);
  doc.rect(15, y, 180, 28, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('Cette feuille est à présenter à tout professionnel de santé', 18, y + 6);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text('pour la prise en charge à 100% des soins liés à l\'AT/MP,', 18, y + 12);
  doc.text('sans avance de frais (tiers payant intégral).', 18, y + 17);
  doc.text('Valable jusqu\'à la date de guérison ou consolidation.', 18, y + 23);
  y += 35;

  doc.setFontSize(8); doc.setTextColor(...GRIS);
  doc.text('VOLET 1 — à conserver par le praticien', 18, y); y += 4;
  doc.text('VOLET 2 — à adresser à la CPAM par le praticien', 18, y); y += 4;
  doc.text('VOLET 3 — à conserver par la victime', 18, y); y += 10;

  doc.setTextColor(...NOIR); doc.setFontSize(9);
  doc.text(`Date de délivrance : ${new Date().toLocaleDateString('fr-FR')}`, 18, y); y += 8;
  doc.text('Signature et cachet de l\'employeur :', 18, y); y += 15;
  doc.line(18, y, 90, y);

  footer(doc);
  doc.save(`Feuille_AT_${s.nom}_${f.dateEvt || 'date'}.pdf`);
}

// ══ MALADIE PROFESSIONNELLE (Cerfa 16130) ══
export function genererPDF_DMP(s, e, f) {
  const doc = initPDF("DÉCLARATION DE MALADIE PROFESSIONNELLE\nOU DEMANDE DE RECONNAISSANCE", "Cerfa 16130 — Art. L461-5 CSS — Délai : 15 jours");
  let y = 35;

  y = section(doc, y, '1. LA VICTIME');
  y = ligne(doc, y, 'N° Sécurité sociale', s.numSecu);
  y = ligne(doc, y, 'Nom / Prénom', `${s.nom} ${s.prenom}`);
  y = ligne(doc, y, 'Date de naissance', s.dn);
  y = ligne(doc, y, 'Sexe', s.sexe === 'M' ? 'Masculin' : 'Féminin');
  y = ligne(doc, y, 'Adresse', `${s.adr}, ${s.cp} ${s.ville}`);
  y = ligne(doc, y, 'Téléphone', s.tel);
  y = ligne(doc, y, 'Email', s.email);
  y += 2;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text('Situation actuelle :', 18, y); y += 5;
  y = checkbox(doc, y, 'En activité', f.sitActivite);
  y = checkbox(doc, y, 'En arrêt de travail', f.sitArret);
  y = checkbox(doc, y, 'En recherche d\'emploi', f.sitRecherche);
  y = checkbox(doc, y, 'Retraité', f.sitRetraite);
  y += 3;

  y = section(doc, y, '2. LA MALADIE');
  y = texteLibre(doc, y, 'Désignation (selon CMI)', f.designationMP);
  y = ligne(doc, y, 'Date 1ère constatation', f.dateConstat);
  y = ligne(doc, y, 'Date du CMI', f.dateCMI);
  y = ligne(doc, y, 'Médecin CMI', f.medecinCMI);
  y += 2;
  y = checkbox(doc, y, `Tableau MP : Oui — n°${f.tableauNum || '___'}`, f.tableauOui);
  y = checkbox(doc, y, 'Non', f.tableauNon);
  y = checkbox(doc, y, 'Ne sait pas', f.tableauNSP);
  y += 3;

  y = section(doc, y, '3. EXPOSITION AU RISQUE');
  y = ligne(doc, y, 'Employeur', e.nom);
  y = ligne(doc, y, 'SIRET', e.siret);
  y = ligne(doc, y, 'Poste occupé', s.poste);
  y = ligne(doc, y, 'Début exposition', f.debutExpo);
  y = ligne(doc, y, 'Fin exposition', f.finExpo || '—');
  y = texteLibre(doc, y, 'Nature des travaux', f.travaux);
  y = ligne(doc, y, 'Agents nocifs', f.agents);
  y = ligne(doc, y, 'Durée', `${f.dureeExpo || '—'}h/jour, ${f.joursExpo || '—'}j/semaine`);
  y += 3;

  y = section(doc, y, '4. PIÈCES JOINTES');
  y = checkbox(doc, y, 'Certificat médical initial (2 exemplaires)', f.pjCMI);
  y = checkbox(doc, y, 'Attestation de salaire', f.pjAttestation);
  y = checkbox(doc, y, 'Résultats d\'examens complémentaires', f.pjExamens);
  y += 5;

  doc.setFontSize(9);
  doc.text('Je certifie l\'exactitude des renseignements ci-dessus.', 18, y); y += 8;
  doc.text(`Fait à ${s.ville}, le ${new Date().toLocaleDateString('fr-FR')}`, 18, y); y += 8;
  doc.text('Signature :', 18, y); y += 12;
  doc.line(18, y, 90, y);

  footer(doc);
  doc.save(`Declaration_MP_${s.nom}.pdf`);
}

// ══ ITI (Cerfa 14103) ══
export function genererPDF_ITI(s, e, f) {
  const doc = initPDF("DEMANDE D'INDEMNITÉ TEMPORAIRE D'INAPTITUDE", "Cerfa 14103 (S6110) — Art. D433-3 CSS");
  let y = 35;

  // VOLET 1 — SALARIÉ
  doc.setFillColor(255, 240, 240);
  doc.rect(15, y - 2, 180, 7, 'F');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...ROUGE);
  doc.text('VOLET 1 — À REMPLIR PAR LE SALARIÉ', 18, y + 3);
  doc.setTextColor(...NOIR); y += 10;

  y = section(doc, y, '1. IDENTIFICATION DU SALARIÉ');
  y = ligne(doc, y, 'N° Sécurité sociale', s.numSecu);
  y = ligne(doc, y, 'Nom / Prénom', `${s.nom} ${s.prenom}`);
  y = ligne(doc, y, 'Date de naissance', s.dn);
  y = ligne(doc, y, 'Adresse', `${s.adr}, ${s.cp} ${s.ville}`);
  y = ligne(doc, y, 'Téléphone', s.tel);
  y += 3;

  y = section(doc, y, '2. EMPLOYEUR');
  y = ligne(doc, y, 'Raison sociale', e.nom);
  y = ligne(doc, y, 'SIRET', e.siret);
  y = ligne(doc, y, 'Adresse', `${e.adresse}, ${e.cp} ${e.ville}`);
  y += 3;

  y = section(doc, y, '3. ORIGINE DE L\'INAPTITUDE');
  y = checkbox(doc, y, 'Accident du travail', f.origineAT);
  y = checkbox(doc, y, 'Accident de trajet', f.origineTrajet);
  y = checkbox(doc, y, 'Maladie professionnelle', f.origineMP);
  y = ligne(doc, y, 'Date AT / trajet', f.dateOrigine || '—');
  y = ligne(doc, y, 'Date constatation MP', f.dateConstatMP || '—');
  y = ligne(doc, y, 'N° tableau MP', f.numTableau || '—');
  y += 2;
  doc.setFontSize(8); doc.text('Caractère professionnel reconnu :', 18, y); y += 5;
  y = checkbox(doc, y, 'Oui', f.reconuOui);
  y = checkbox(doc, y, 'Non', f.reconuNon);
  y = checkbox(doc, y, 'En cours', f.reconuEnCours);
  y = ligne(doc, y, 'N° dossier CPAM', f.numDossier || '—');
  y += 3;

  y = section(doc, y, '4. AVIS D\'INAPTITUDE');
  y = ligne(doc, y, 'Date de l\'avis', f.dateAvis);
  y = ligne(doc, y, 'Médecin du travail', f.medecinTravail);
  y += 2;
  doc.setFontSize(8); doc.text('Lien inaptitude / AT-MP mentionné :', 18, y); y += 5;
  y = checkbox(doc, y, 'Oui', f.lienOui);
  y = checkbox(doc, y, 'Non', f.lienNon);
  y += 3;

  y = section(doc, y, '5. SITUATION DU SALARIÉ');
  const sits = [['IJ AT/MP', f.ijOui, f.ijNon], ['Rente AT/MP', f.renteOui, f.renteNon], ['Reclassé', f.reclasseOui, f.reclasseNon], ['Licencié', f.licencieOui, f.licencieNon], ['Délai 1 mois', f.delaiOui, f.delaiNon], ['Chômage', f.chomOui, f.chomNon], ['Pension invalidité', f.pensionOui, false]];
  sits.forEach(([lab, oui, non]) => {
    if (y > 275) { doc.addPage(); y = 15; }
    doc.setFontSize(8); doc.setTextColor(...GRIS); doc.text(lab + ' :', 18, y);
    doc.setTextColor(...NOIR);
    doc.text(oui ? 'OUI' : non ? 'NON' : '—', 75, y);
    y += 5;
  });
  y += 3;

  doc.setFontSize(9);
  doc.text('Je certifie sur l\'honneur l\'exactitude de ces renseignements.', 18, y); y += 8;
  doc.text(`Fait à ${s.ville}, le ${new Date().toLocaleDateString('fr-FR')}`, 18, y); y += 8;
  doc.text('Signature du salarié :', 18, y); y += 12;
  doc.line(18, y, 90, y); y += 10;

  // VOLET 2 — EMPLOYEUR
  if (y > 230) { doc.addPage(); y = 15; }
  doc.setFillColor(240, 248, 255);
  doc.rect(15, y - 2, 180, 7, 'F');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLEU);
  doc.text('VOLET 2 — À REMPLIR PAR L\'EMPLOYEUR', 18, y + 3);
  doc.setTextColor(...NOIR); y += 12;

  y = checkbox(doc, y, 'Je confirme que le salarié n\'a pas été reclassé', f.empReclasseNon);
  y = checkbox(doc, y, 'Je confirme que le salarié n\'a pas été licencié', f.empLicencieNon);
  y = ligne(doc, y, 'Date avis inaptitude', f.dateAvis);
  y += 8;
  doc.setFontSize(9);
  doc.text(`Fait à ${e.ville}, le ${new Date().toLocaleDateString('fr-FR')}`, 18, y); y += 8;
  doc.text('Signature et cachet de l\'employeur :', 18, y); y += 12;
  doc.line(18, y, 90, y);

  footer(doc);
  doc.save(`ITI_${s.nom}.pdf`);
}

// ══ ATTESTATION DE TRAVAIL ══
export function genererPDF_ATT(s, e) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const anciennete = (() => { const p = s.emb.split('/'); const d = new Date(p[2], p[1] - 1, p[0]); const n = new Date(); const m = (n.getFullYear() - d.getFullYear()) * 12 + n.getMonth() - d.getMonth(); if (m < 12) return `${m} mois`; const a = Math.floor(m / 12), r = m % 12; return r > 0 ? `${a} an${a > 1 ? 's' : ''} et ${r} mois` : `${a} an${a > 1 ? 's' : ''}`; })();

  let y = 30;
  // En-tête employeur
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text(e.nom, 20, y); y += 6;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(e.representant, 20, y); y += 5;
  doc.text(e.fonction, 20, y); y += 5;
  doc.text(e.adresse, 20, y); y += 5;
  doc.text(`${e.cp} ${e.ville}`, 20, y); y += 15;

  // Destinataire
  doc.text(`${s.civ} ${s.prenom} ${s.nom}`, 120, y); y += 5;
  doc.text(s.adr, 128, y); y += 5;
  doc.text(`${s.cp} ${s.ville}`, 120, y); y += 15;

  // Lieu et date
  doc.text(`À ${e.ville}, le ${date}`, 20, y); y += 12;

  // Objet
  doc.setFont('helvetica', 'bold');
  doc.text(`Objet : attestation de travail de ${s.civ} ${s.nom} ${s.prenom}`, 20, y); y += 12;
  doc.setFont('helvetica', 'normal');

  // Corps
  doc.setFontSize(10);
  const genre = s.sexe === 'F' ? 'Madame' : 'Monsieur';
  doc.text(`${genre},`, 20, y); y += 8;

  const corps = `Je soussigné(e), ${e.representant}, ${e.fonction} de la société ${e.nom}, établie au ${e.adresse}, ${e.cp} ${e.ville} et immatriculée sous le numéro ${e.siret}, atteste et certifie que ${s.civ} ${s.prenom} ${s.nom}, né(e) le ${s.dn} à ${s.lieuN} et demeurant au ${s.adr}, ${s.cp} ${s.ville} est employé(e) en tant que ${s.poste} au sein de notre société.`;
  const lignes = doc.splitTextToSize(corps, 170);
  lignes.forEach(l => { doc.text(l, 20, y); y += 5; });
  y += 3;

  let contratTxt = '';
  if (s.contrat === 'CDI') {
    contratTxt = `Son contrat, conclu sous la forme d'un contrat à durée indéterminée, a débuté le ${s.emb}. À ce jour, ${s.sexe === 'F' ? 'elle' : 'il'} bénéficie d'une ancienneté de ${anciennete}.`;
  } else if (s.dateFin) {
    contratTxt = `Son contrat, conclu sous la forme d'un ${s.contrat}, a débuté le ${s.emb}. Son terme est fixé pour le ${s.dateFin}. À ce jour, ${s.sexe === 'F' ? 'elle' : 'il'} bénéficie d'une ancienneté de ${anciennete}.`;
  } else {
    contratTxt = `Son contrat, conclu sous la forme d'un ${s.contrat}, a débuté le ${s.emb} et est censé prendre fin le jour de la réalisation de l'évènement y mettant un terme. À ce jour, ${s.sexe === 'F' ? 'elle' : 'il'} bénéficie d'une ancienneté de ${anciennete}.`;
  }
  const lignes2 = doc.splitTextToSize(contratTxt, 170);
  lignes2.forEach(l => { doc.text(l, 20, y); y += 5; });
  y += 5;

  doc.text('Cette attestation est délivrée pour servir et valoir ce que de droit.', 20, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.text(e.representant, 20, y); y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(e.fonction, 20, y); y += 12;
  doc.text('[Signature]', 20, y);

  footer(doc);
  doc.save(`Attestation_travail_${s.nom}.pdf`);
}
