import React, { useState, useMemo } from 'react';
import DS from '../../design/ds';
import { jsPDF } from 'jspdf';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'9px 11px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:12, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:10, fontWeight:600, color:'#555', display:'block', marginBottom:3 };

const EMPLOYEUR = { nom:'Freample Artisans BTP', siret:'123 456 789 000 12', adresse:'45 boulevard de la Libération, 13001 Marseille', rcs:'Nice B 123 456 789', assuranceDecennale:'AXA n° POL-2026-DEC-001', rcPro:'SMABTP n° RC-2026-PRO-002', representant:'Vassili Beaufrere', fonction:'Gérant' };

// ══ CLAUSES ÉDITABLES PAR CONTRAT ══
const CONTRATS = [
  { id:'sous-traitance', cat:'Sous-traitance', titre:'Contrat de sous-traitance BTP', ref:'Loi n° 75-1334 du 31/12/1975', clauses:[
    { id:'objet', titre:'Article 1 — Objet', defaut:'Le Donneur d\'ordre confie au Sous-traitant l\'exécution des travaux suivants :\n[DESCRIPTION DES TRAVAUX]\n\nsur le chantier situé à [ADRESSE DU CHANTIER], pour le compte du client [NOM DU CLIENT].', editable:true },
    { id:'prix', titre:'Article 2 — Prix', defaut:'Le prix global et forfaitaire des travaux est fixé à [MONTANT] € HT, soit [MONTANT TTC] € TTC (TVA [TAUX]%).\n\nCe prix comprend l\'ensemble des fournitures, main d\'œuvre, matériel et frais nécessaires à la bonne exécution des travaux.', editable:true },
    { id:'delais', titre:'Article 3 — Délais d\'exécution', defaut:'Les travaux devront être exécutés dans un délai de [DURÉE] à compter de l\'ordre de service.\n\nDate de début prévue : [DATE DÉBUT]\nDate de fin prévue : [DATE FIN]\n\nEn cas de retard imputable au Sous-traitant, des pénalités de retard de 1/1000ème du montant HT par jour calendaire de retard seront appliquées, plafonnées à 5% du montant total.', editable:true },
    { id:'paiement', titre:'Article 4 — Conditions de paiement', defaut:'Le paiement sera effectué par virement bancaire dans un délai de 30 jours à compter de la réception de la facture.\n\nUn acompte de [POURCENTAGE]% sera versé à la signature du présent contrat.\n\nFacturation : situation mensuelle sur la base de l\'avancement des travaux.', editable:true },
    { id:'assurances', titre:'Article 5 — Assurances', defaut:'Le Sous-traitant s\'engage à justifier de la souscription :\n- d\'une assurance responsabilité civile professionnelle\n- d\'une assurance décennale couvrant les travaux objet du présent contrat\n\nLes attestations d\'assurance en cours de validité doivent être remises au Donneur d\'ordre avant le démarrage des travaux.', editable:true },
    { id:'securite', titre:'Article 6 — Sécurité et prévention', defaut:'Le Sous-traitant s\'engage à respecter les règles d\'hygiène et de sécurité en vigueur sur le chantier.\n\nIl s\'engage notamment à :\n- Fournir les EPI à son personnel\n- Respecter le plan de prévention / PPSPS\n- Disposer des habilitations nécessaires\n- Déclarer tout accident du travail survenu sur le chantier', editable:true },
    { id:'reception', titre:'Article 7 — Réception des travaux', defaut:'À l\'achèvement des travaux, il sera procédé à une réception contradictoire.\n\nEn cas de réserves, le Sous-traitant disposera de [DÉLAI] jours pour y remédier.\n\nLa garantie de parfait achèvement court pendant 1 an à compter de la réception.', editable:true },
    { id:'resiliation', titre:'Article 8 — Résiliation', defaut:'Le présent contrat pourra être résilié par l\'une ou l\'autre des parties en cas de manquement grave, après mise en demeure restée infructueuse pendant 15 jours.\n\nEn cas de résiliation pour faute du Sous-traitant, le Donneur d\'ordre pourra retenir les sommes nécessaires à l\'achèvement des travaux.', editable:true },
    { id:'litiges', titre:'Article 9 — Litiges', defaut:'En cas de litige, les parties s\'engagent à rechercher une solution amiable.\nÀ défaut d\'accord dans un délai de 30 jours, le litige sera soumis au Tribunal de commerce de [VILLE].', editable:true },
    { id:'paiement_direct', titre:'Article 10 — Paiement direct (marchés publics)', defaut:'Conformément à l\'article L2193-10 du Code de la commande publique, le Sous-traitant peut demander le paiement direct au maître d\'ouvrage pour la part des travaux qu\'il exécute.\n\n[  ] Cette clause s\'applique (marché public)\n[  ] Cette clause ne s\'applique pas (marché privé)', editable:true },
  ]},
  { id:'marche-prive', cat:'Marchés', titre:'Marché privé de travaux', ref:'Norme NF P 03-001', clauses:[
    { id:'parties', titre:'Article 1 — Les parties', defaut:'MAÎTRE D\'OUVRAGE :\n[NOM DU CLIENT]\n[ADRESSE]\n\nENTREPRISE :\n'+EMPLOYEUR.nom+'\nSIRET : '+EMPLOYEUR.siret+'\n'+EMPLOYEUR.adresse+'\nReprésentation : '+EMPLOYEUR.representant+', '+EMPLOYEUR.fonction, editable:true },
    { id:'objet', titre:'Article 2 — Objet des travaux', defaut:'L\'Entreprise s\'engage à exécuter les travaux suivants :\n[DESCRIPTION DÉTAILLÉE DES TRAVAUX]\n\nLot(s) concerné(s) : [LOTS]\n\nLieu d\'exécution : [ADRESSE DU CHANTIER]', editable:true },
    { id:'documents', titre:'Article 3 — Documents contractuels', defaut:'Les documents contractuels sont, par ordre de priorité décroissante :\n1. Le présent contrat et ses avenants éventuels\n2. Le devis n° [NUMÉRO] du [DATE]\n3. Le CCTP (Cahier des Clauses Techniques Particulières)\n4. Les plans d\'exécution\n5. Les normes et DTU applicables', editable:true },
    { id:'prix', titre:'Article 4 — Prix et révision', defaut:'Le prix des travaux est fixé à [MONTANT] € HT.\nTVA applicable : [TAUX]%\nMontant TTC : [MONTANT TTC] €\n\nLe prix est [  ] ferme et définitif / [  ] révisable selon l\'indice BT01.', editable:true },
    { id:'paiement', titre:'Article 5 — Modalités de paiement', defaut:'Acompte à la signature : [POURCENTAGE]% soit [MONTANT] €\nSituations mensuelles : [POURCENTAGE]% sur avancement\nSolde à la réception : [POURCENTAGE]%\n\nDélai de paiement : 30 jours date de facture.\nPénalités de retard : 3 fois le taux d\'intérêt légal + indemnité forfaitaire de 40€.', editable:true },
    { id:'delais', titre:'Article 6 — Délais', defaut:'Durée des travaux : [DURÉE]\nDate de début : [DATE]\nDate de fin : [DATE]\n\nPénalités de retard : [MONTANT]€ / jour calendaire de retard, plafonnées à 5% du marché.', editable:true },
    { id:'assurances', titre:'Article 7 — Assurances', defaut:'L\'Entreprise justifie de :\n- Assurance décennale : '+EMPLOYEUR.assuranceDecennale+'\n- RC Professionnelle : '+EMPLOYEUR.rcPro+'\n\nLe Maître d\'ouvrage est invité à souscrire une assurance dommages-ouvrage (Art. L242-1 du Code des assurances).', editable:true },
    { id:'reception', titre:'Article 8 — Réception', defaut:'La réception sera prononcée contradictoirement à la fin des travaux.\nSi des réserves sont formulées, l\'Entreprise dispose de [DÉLAI] jours pour les lever.\n\nRetenue de garantie : 5% du montant TTC, restituée 1 an après la réception si absence de réserves.', editable:true },
    { id:'garanties', titre:'Article 9 — Garanties', defaut:'L\'Entreprise est tenue des garanties suivantes :\n- Garantie de parfait achèvement : 1 an (Art. 1792-6 du Code civil)\n- Garantie biennale : 2 ans (Art. 1792-3)\n- Garantie décennale : 10 ans (Art. 1792 et 1792-2)', editable:true },
  ]},
  { id:'cdi-btp', cat:'Contrats de travail', titre:'Contrat CDI BTP', ref:'Convention collective nationale des ouvriers du BTP (IDCC 1597)', clauses:[
    { id:'parties', titre:'Entre les soussignés', defaut:'L\'EMPLOYEUR :\n'+EMPLOYEUR.nom+'\nSIRET : '+EMPLOYEUR.siret+'\n'+EMPLOYEUR.adresse+'\nReprésenté par '+EMPLOYEUR.representant+', '+EMPLOYEUR.fonction+'\n\nLE SALARIÉ :\nM./Mme [NOM PRÉNOM]\nNé(e) le [DATE] à [LIEU]\nDemeurant [ADRESSE]\nN° Sécurité sociale : [N° SS]', editable:true },
    { id:'engagement', titre:'Article 1 — Engagement', defaut:'Le salarié est engagé à compter du [DATE] en qualité de [POSTE] (niveau [NIVEAU], position [POSITION] de la convention collective BTP).\n\nLe présent contrat est conclu pour une durée indéterminée.', editable:true },
    { id:'lieu', titre:'Article 2 — Lieu de travail', defaut:'Le lieu de travail principal est situé à [ADRESSE DÉPÔT/BUREAU].\n\nLe salarié pourra être amené à travailler sur différents chantiers selon les besoins de l\'entreprise.\n\nLes conditions de déplacement sont régies par la convention collective BTP.', editable:true },
    { id:'remuneration', titre:'Article 3 — Rémunération', defaut:'La rémunération mensuelle brute est fixée à [MONTANT] € pour un horaire hebdomadaire de 35 heures.\n\nS\'ajoutent le cas échéant :\n- Indemnités de petits déplacements (selon barème en vigueur)\n- Indemnité de repas / panier\n- Prime de vacances BTP (30% de l\'indemnité de congés payés)', editable:true },
    { id:'horaires', titre:'Article 4 — Durée du travail', defaut:'La durée hebdomadaire de travail est fixée à 35 heures réparties du lundi au vendredi.\n\nHoraires habituels : [HORAIRES]\n\nLes heures supplémentaires seront rémunérées conformément aux dispositions légales et conventionnelles :\n- De la 36ème à la 43ème heure : majoration de 25%\n- Au-delà : majoration de 50%', editable:true },
    { id:'essai', titre:'Article 5 — Période d\'essai', defaut:'Le présent contrat est soumis à une période d\'essai de [DURÉE] mois, renouvelable une fois pour une durée identique.\n\nPendant cette période, chacune des parties peut mettre fin au contrat sans indemnité, en respectant un délai de prévenance.', editable:true },
    { id:'conges', titre:'Article 6 — Congés payés', defaut:'Les congés payés sont gérés par la Caisse des Congés Payés du BTP (CIBTP) conformément aux dispositions de la convention collective.\n\nLe salarié bénéficie de 2,5 jours ouvrables de congé par mois de travail effectif, soit 30 jours ouvrables par an.', editable:true },
    { id:'confidentialite', titre:'Article 7 — Obligations', defaut:'Le salarié s\'engage à :\n- Respecter le règlement intérieur de l\'entreprise\n- Observer les consignes de sécurité\n- Conserver la confidentialité des informations de l\'entreprise\n- Se soumettre à la visite médicale d\'embauche', editable:true },
    { id:'rupture', titre:'Article 8 — Rupture du contrat', defaut:'Le présent contrat peut être rompu conformément aux dispositions légales :\n- Démission (préavis selon ancienneté et qualification)\n- Licenciement (respect de la procédure légale et conventionnelle)\n- Rupture conventionnelle (accord des deux parties)\n- Mise à la retraite ou départ volontaire en retraite', editable:true },
  ]},
  { id:'cdd-chantier', cat:'Contrats de travail', titre:'Contrat CDD de chantier', ref:'Art. L1242-2 et D1242-8 du Code du travail', clauses:[
    { id:'parties', titre:'Entre les soussignés', defaut:'L\'EMPLOYEUR :\n'+EMPLOYEUR.nom+'\nSIRET : '+EMPLOYEUR.siret+'\n\nLE SALARIÉ :\nM./Mme [NOM PRÉNOM]\nN° SS : [N° SS]', editable:true },
    { id:'motif', titre:'Article 1 — Motif du recours', defaut:'Le présent contrat est conclu pour la durée du chantier suivant :\n[NOM DU CHANTIER]\n[ADRESSE DU CHANTIER]\n\nConformément à l\'article D1242-8 du Code du travail, le recours au CDD de chantier est autorisé dans le secteur du BTP.', editable:true },
    { id:'duree', titre:'Article 2 — Durée', defaut:'Le contrat prend effet le [DATE DE DÉBUT].\n\nIl prendra fin à l\'achèvement des travaux pour lesquels il a été conclu, et au plus tard le [DATE FIN ESTIMÉE].\n\nLe salarié sera informé de la fin du chantier avec un préavis de [DURÉE] jours.', editable:true },
    { id:'poste', titre:'Article 3 — Emploi et qualification', defaut:'Le salarié est engagé en qualité de [POSTE] (niveau [NIVEAU]).\n\nIl exercera ses fonctions principalement sur le chantier désigné ci-dessus.', editable:true },
    { id:'remuneration', titre:'Article 4 — Rémunération', defaut:'Rémunération mensuelle brute : [MONTANT] €\nPrime de fin de CDD (indemnité de précarité) : 10% de la rémunération brute totale\nIndemnité compensatrice de congés payés : 10%', editable:true },
  ]},
  { id:'pv-reception', cat:'Chantier', titre:'PV de réception des travaux', ref:'Art. 1792-6 du Code civil', clauses:[
    { id:'identification', titre:'Identification du chantier', defaut:'Chantier : [NOM]\nAdresse : [ADRESSE]\nMaître d\'ouvrage : [CLIENT]\nEntreprise : '+EMPLOYEUR.nom, editable:true },
    { id:'reception', titre:'Réception', defaut:'Date de la réception : [DATE]\n\nLes parties se sont rendues sur les lieux et ont constaté l\'état des travaux.\n\n[  ] Réception sans réserves\n[  ] Réception avec réserves (voir liste ci-dessous)\n[  ] Refus de réception (motifs ci-dessous)', editable:true },
    { id:'reserves', titre:'Réserves éventuelles', defaut:'Réserve 1 : [DESCRIPTION] — Délai de levée : [DÉLAI]\nRéserve 2 : [DESCRIPTION] — Délai de levée : [DÉLAI]\nRéserve 3 : [DESCRIPTION] — Délai de levée : [DÉLAI]', editable:true },
    { id:'garanties', titre:'Rappel des garanties', defaut:'À compter de la date de réception :\n• Garantie de parfait achèvement : 1 an\n• Garantie de bon fonctionnement : 2 ans\n• Garantie décennale : 10 ans\n\nRetenue de garantie de 5% : [MONTANT] € — restituable 1 an après réception.', editable:true },
    { id:'signatures', titre:'Signatures', defaut:'Le Maître d\'ouvrage :                L\'Entreprise :\n\n\n_________________________          _________________________\n[NOM]                                '+EMPLOYEUR.representant, editable:true },
  ]},
  { id:'mise-demeure', cat:'Litiges', titre:'Mise en demeure (impayé)', ref:'Art. 1344 du Code civil', clauses:[
    { id:'expediteur', titre:'Expéditeur', defaut:EMPLOYEUR.nom+'\n'+EMPLOYEUR.adresse+'\nSIRET : '+EMPLOYEUR.siret, editable:false },
    { id:'destinataire', titre:'Destinataire', defaut:'[NOM DU CLIENT]\n[ADRESSE]', editable:true },
    { id:'corps', titre:'Corps de la lettre', defaut:'Lettre recommandée avec accusé de réception\n\nObjet : Mise en demeure de payer — Facture n° [NUMÉRO]\n\nMadame, Monsieur,\n\nMalgré nos relances, nous constatons que la facture n° [NUMÉRO] d\'un montant de [MONTANT] € TTC, émise le [DATE FACTURE] et échue depuis le [DATE ÉCHÉANCE], demeure impayée à ce jour.\n\nPar la présente, nous vous mettons en demeure de procéder au règlement intégral de cette somme dans un délai de 8 jours à compter de la réception du présent courrier.\n\nConformément aux articles L441-10 et L441-11 du Code de commerce, des pénalités de retard au taux de 3 fois le taux d\'intérêt légal, ainsi qu\'une indemnité forfaitaire de recouvrement de 40€, sont applicables de plein droit.\n\nÀ défaut de règlement dans ce délai, nous nous verrons contraints d\'engager toute procédure judiciaire utile au recouvrement de notre créance, sans autre avis.\n\nVeuillez agréer, Madame, Monsieur, l\'expression de nos salutations distinguées.', editable:true },
    { id:'signature', titre:'Signature', defaut:EMPLOYEUR.representant+'\n'+EMPLOYEUR.fonction+'\n\n[Signature]', editable:false },
  ]},
];

const catColors = { 'Sous-traitance':'#7C3AED', 'Marchés':'#2563EB', 'Contrats de travail':DS.gold, 'Chantier':'#16A34A', 'Litiges':'#DC2626' };

export default function ContratsBTPModule() {
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [clauses, setClauses] = useState({});
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [filterCat, setFilterCat] = useState('');

  const contrat = CONTRATS.find(c => c.id === selectedContrat);
  const categories = [...new Set(CONTRATS.map(c => c.cat))];
  const filtered = filterCat ? CONTRATS.filter(c => c.cat === filterCat) : CONTRATS;

  const initClauses = (c) => {
    const init = {};
    c.clauses.forEach(cl => { init[cl.id] = cl.defaut; });
    setClauses(init);
  };

  const genererTexte = () => {
    if (!contrat) return '';
    let txt = `${'═'.repeat(60)}\n${contrat.titre.toUpperCase()}\n${contrat.ref}\n${'═'.repeat(60)}\n\n`;
    contrat.clauses.forEach(cl => {
      txt += `${cl.titre}\n${'─'.repeat(40)}\n${clauses[cl.id] || cl.defaut}\n\n`;
    });
    txt += `\nFait en deux exemplaires originaux.\nÀ ${EMPLOYEUR.adresse.split(',').pop()?.trim()}, le ${new Date().toLocaleDateString('fr-FR')}\n`;
    return txt;
  };

  const exporterPDF = () => {
    if (!contrat) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(contrat.titre, 105, 10, { align: 'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(contrat.ref, 105, 17, { align: 'center' });
    doc.setTextColor(10, 10, 10);

    let y = 30;
    contrat.clauses.forEach(cl => {
      if (y > 265) { doc.addPage(); y = 15; }
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text(cl.titre, 15, y); y += 6;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      const text = clauses[cl.id] || cl.defaut;
      const lines = doc.splitTextToSize(text, 180);
      lines.forEach(l => {
        if (y > 280) { doc.addPage(); y = 15; }
        doc.text(l, 15, y); y += 4.5;
      });
      y += 4;
    });

    if (y > 260) { doc.addPage(); y = 15; }
    y += 8;
    doc.setFontSize(9);
    doc.text(`Fait en deux exemplaires. À Nice, le ${new Date().toLocaleDateString('fr-FR')}`, 15, y);

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(100, 100, 100); doc.text(`Page ${i}/${pages} — ${contrat.titre} — Freample Artisans`, 105, 290, { align: 'center' }); }

    doc.save(`${contrat.titre.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '')}.pdf`);
    setGeneratedDocs(prev => [{ id: Date.now(), titre: contrat.titre, date: new Date().toISOString().slice(0, 10) }, ...prev]);
  };

  // Vue liste
  if (!selectedContrat) return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Contrats & Documents juridiques BTP</h2>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>{CONTRATS.length} modèles avec clauses éditables. Cliquez pour personnaliser et générer en PDF.</p>

      {generatedDocs.length > 0 && <>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Documents générés ({generatedDocs.length})</div>
        {generatedDocs.slice(0, 3).map(d => (
          <div key={d.id} style={{ ...CARD, padding: 10, marginBottom: 4, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>{d.titre}</span><span style={{ color: '#555' }}>{d.date}</span>
          </div>
        ))}
        <div style={{ height: 12 }} />
      </>}

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterCat('')} style={!filterCat ? BTN : BTN_O}>Tous ({CONTRATS.length})</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(filterCat === cat ? '' : cat)} style={filterCat === cat ? { ...BTN, background: catColors[cat] } : BTN_O}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 8 }}>
        {filtered.map(c => (
          <div key={c.id} onClick={() => { setSelectedContrat(c.id); initClauses(c); }} style={{ ...CARD, padding: 14, cursor: 'pointer', borderLeft: `3px solid ${catColors[c.cat]}`, transition: 'all .15s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{c.titre}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: catColors[c.cat], background: `${catColors[c.cat]}12`, padding: '2px 6px', borderRadius: 4 }}>{c.cat}</span>
            </div>
            <div style={{ fontSize: 10, color: '#555' }}>{c.ref}</div>
            <div style={{ fontSize: 10, color: catColors[c.cat], fontWeight: 600, marginTop: 4 }}>{c.clauses.length} clauses éditables →</div>
          </div>
        ))}
      </div>

      <div style={{ ...CARD, marginTop: 16, borderLeft: '4px solid #2563EB', padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>Besoin d'un avis juridique ?</div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Pour les situations complexes, consultez un juriste spécialisé en droit du BTP.</div>
        <button onClick={() => window.location.href = '/cgu'} style={{ ...BTN, background: '#2563EB', fontSize: 11, padding: '6px 14px' }}>Voir les mentions légales →</button>
      </div>
    </div>
  );

  // Vue éditeur de contrat
  return (
    <div>
      <button onClick={() => setSelectedContrat(null)} style={{ ...BTN_O, marginBottom: 12, fontSize: 11 }}>← Retour aux modèles</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{contrat.titre}</h2>
          <p style={{ fontSize: 11, color: '#555', margin: '2px 0 0' }}>{contrat.ref} · {contrat.clauses.length} clauses</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={exporterPDF} style={{ ...BTN, background: '#DC2626' }}>Exporter PDF</button>
          <button onClick={() => window.print()} style={BTN_O}>Imprimer</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Éditeur de clauses */}
        <div style={{ ...CARD, maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Clauses du contrat</div>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 12 }}>Modifiez chaque clause pour l'adapter à votre situation. Les textes entre [CROCHETS] sont à personnaliser.</div>
          {contrat.clauses.map(cl => (
            <div key={cl.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: catColors[contrat.cat] }}>{cl.titre}</div>
              {cl.editable ? (
                <textarea value={clauses[cl.id] || ''} onChange={e => setClauses(prev => ({ ...prev, [cl.id]: e.target.value }))} rows={Math.max(3, (clauses[cl.id] || '').split('\n').length)} style={{ ...INP, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
              ) : (
                <div style={{ padding: '8px 12px', background: '#F8F7F4', borderRadius: 8, fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{clauses[cl.id]}</div>
              )}
            </div>
          ))}
        </div>

        {/* Aperçu */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Aperçu du document</div>
          <div style={{ background: '#FAFAF8', border: '1px solid #E8E6E1', borderRadius: 8, padding: 16, maxHeight: '70vh', overflowY: 'auto', fontFamily: 'monospace', fontSize: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {genererTexte()}
          </div>
        </div>
      </div>
    </div>
  );
}
