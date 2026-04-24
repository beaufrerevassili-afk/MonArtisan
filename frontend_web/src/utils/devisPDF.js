// ── Génération PDF professionnel pour devis/factures BTP ──
import { jsPDF } from 'jspdf';

export function genererDevisPDF(devis, entreprise = {}) {
  const doc = new jsPDF();
  const gold = [166, 139, 75];
  const dark = [44, 37, 32];
  const gray = [99, 99, 99];

  // Header with company info
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 40, 'F');

  // Logo (if photo_profil exists as base64)
  if (entreprise.logo) {
    try { doc.addImage(entreprise.logo, 'JPEG', 15, 8, 24, 24); } catch(e) { /* logo invalide */ }
  }

  const xInfo = entreprise.logo ? 45 : 15;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(entreprise.nom || 'Mon Entreprise', xInfo, 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${entreprise.adresse || ''} ${entreprise.codePostal || ''} ${entreprise.ville || ''}`.trim(), xInfo, 24);
  doc.text(`SIRET : ${entreprise.siret || '\u2014'} | TVA : ${entreprise.tvaIntra || '\u2014'}`, xInfo, 29);
  doc.text(`Tel : ${entreprise.telephone || '\u2014'} | Email : ${entreprise.email || '\u2014'}`, xInfo, 34);

  // DEVIS title + number
  doc.setTextColor(...gold);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 15, 55);
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.text(devis.numero || '', 50, 55);

  // Date + validite
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  const dateStr = devis.date ? new Date(devis.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  doc.text(`Date : ${dateStr}`, 15, 62);
  doc.text(`Validite : ${devis.validite || 30} jours`, 15, 67);

  // Client box
  doc.setFillColor(248, 247, 244);
  doc.roundedRect(120, 45, 75, 30, 3, 3, 'F');
  doc.setTextColor(...dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 125, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const clientNom = typeof devis.client === 'string' ? devis.client : devis.client?.nom || '';
  doc.text(clientNom, 125, 58);
  doc.setFontSize(8);
  doc.text(devis.clientEmail || devis.client?.email || '', 125, 63);
  doc.text(devis.clientAdresse || devis.client?.adresse || '', 125, 68);

  // Object
  if (devis.objet || devis.titre) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(`Objet : ${devis.objet || devis.titre}`, 15, 82);
  }

  // Table header
  let y = 90;
  doc.setFillColor(...gold);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 17, y + 5.5);
  doc.text('Qte', 120, y + 5.5);
  doc.text('P.U. HT', 135, y + 5.5);
  doc.text('TVA', 158, y + 5.5);
  doc.text('Total HT', 173, y + 5.5);
  y += 10;

  // Lines
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...dark);
  const lignes = devis.lignes || [];
  lignes.forEach((l, i) => {
    if (y > 260) { doc.addPage(); y = 20; }
    const bg = i % 2 === 0 ? [255, 255, 255] : [250, 250, 248];
    doc.setFillColor(...bg);
    doc.rect(15, y - 1, 180, 7, 'F');
    doc.setFontSize(8);
    const desc = l.description || l.desc || '';
    doc.text(desc.substring(0, 55), 17, y + 4);
    doc.text(String(l.quantite || 1), 122, y + 4);
    const pu = Number(l.prixUnitaire || l.prixHT || l.prix || 0);
    doc.text(pu.toLocaleString('fr-FR') + ' \u20AC', 137, y + 4);
    const tva = l.tva !== undefined ? (l.tva > 1 ? l.tva : l.tva * 100) : 10;
    doc.text(tva + '%', 160, y + 4);
    const totalLigne = (Number(l.quantite) || 1) * pu;
    doc.text(totalLigne.toLocaleString('fr-FR') + ' \u20AC', 175, y + 4);
    y += 7;
  });

  // Totals
  y += 5;
  const totalHT = Number(devis.montantHT || devis.totalHT || 0);
  const totalTVA = Number(devis.tva || devis.totalTVA || 0);
  const totalTTC = Number(devis.montantTTC || devis.totalTTC || totalHT + totalTVA);

  doc.setFillColor(248, 247, 244);
  doc.roundedRect(120, y, 75, 28, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text('Total HT', 125, y + 7);
  doc.text('TVA', 125, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text(totalHT.toLocaleString('fr-FR') + ' \u20AC', 175, y + 7, { align: 'right' });
  doc.text(totalTVA.toLocaleString('fr-FR') + ' \u20AC', 175, y + 14, { align: 'right' });
  doc.setFillColor(...dark);
  doc.rect(120, y + 18, 75, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('TOTAL TTC', 125, y + 25);
  doc.text(totalTTC.toLocaleString('fr-FR') + ' \u20AC', 190, y + 25, { align: 'right' });

  // Legal mentions
  y += 40;
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.setFont('helvetica', 'normal');
  const mentions = [
    `Assurance decennale : ${entreprise.decennale || entreprise.assuranceDecennale || 'N\u00B0 a renseigner'} \u2014 ${entreprise.decennaleAssureur || 'Assureur a renseigner'}`,
    `RC Professionnelle : ${entreprise.rcpro || entreprise.rcPro || 'N\u00B0 a renseigner'} \u2014 ${entreprise.rcproAssureur || entreprise.rcProAssureur || 'Assureur a renseigner'}`,
    `Conditions : Acompte 30% a la commande. Solde a reception. Penalites de retard : 3x taux legal.`,
    `Garanties : Parfait achevement (1 an) - Biennale (2 ans) - Decennale (10 ans)`,
    `Devis valable ${devis.validite || 30} jours. Signature du client valant acceptation des conditions ci-dessus.`,
  ];
  mentions.forEach((m, i) => { doc.text(m, 15, y + i * 4); });

  // Signature zone
  y += 25;
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([2, 2]);
  doc.rect(15, y, 85, 25);
  doc.rect(110, y, 85, 25);
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('Signature entreprise', 17, y + 5);
  doc.text('Bon pour accord \u2014 Signature client', 112, y + 5);
  doc.text('Date :', 112, y + 21);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text('Genere par Freample \u2014 freample.com', 105, 290, { align: 'center' });

  return doc;
}

export function genererFacturePDF(facture, entreprise = {}) {
  // Reuse devis PDF structure with facture data
  const doc = genererDevisPDF({ ...facture, numero: facture.numero }, entreprise);
  return doc;
}
