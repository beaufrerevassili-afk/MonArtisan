import React, { useState } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };
const REQSTAR = { color:'#DC2626', marginLeft:2 };

const EMPLOYEUR = { nom:'Freample Artisans BTP', siret:'123 456 789 000 12', adresse:'24 rue de la Liberté', cp:'06000', ville:'Nice', codeRisque:'452BB', tel:'04 93 XX XX XX', representant:'Vassili Beaufrere', fonction:'Gérant' };

const SALARIES = [
  { id:1, civilite:'M.', nom:'Martin', prenom:'Jean', numSecu:'1 85 06 75 123 456 78', dateNaissance:'15/06/1985', lieuNaissance:'Nice', nationalite:'Française', poste:'Maçon qualifié', qualification:'N3P2', dateEmbauche:'01/09/2024', typeContrat:'CDI', salaireBase:2800, adresse:'12 rue Pastorelli', cp:'06000', ville:'Nice', dateFin:'' },
  { id:2, civilite:'Mme', nom:'Duval', prenom:'Sophie', numSecu:'2 90 03 06 789 012 34', dateNaissance:'08/03/1990', lieuNaissance:'Lyon', nationalite:'Française', poste:'Électricienne', qualification:'N3P1', dateEmbauche:'01/10/2025', typeContrat:'CDI', salaireBase:2600, adresse:'8 av de la Libération', cp:'06000', ville:'Nice', dateFin:'' },
  { id:3, civilite:'M.', nom:'Lambert', prenom:'Marc', numSecu:'1 82 11 06 456 789 01', dateNaissance:'22/11/1982', lieuNaissance:'Marseille', nationalite:'Française', poste:'Plombier', qualification:'N3P2', dateEmbauche:'15/03/2026', typeContrat:'CDI', salaireBase:2700, adresse:'3 bd Gambetta', cp:'06000', ville:'Nice', dateFin:'' },
  { id:4, civilite:'M.', nom:'Garcia', prenom:'Lucas', numSecu:'1 88 07 75 234 567 89', dateNaissance:'21/07/1988', lieuNaissance:'Paris', nationalite:'Française', poste:'Peintre', qualification:'N2P2', dateEmbauche:'01/04/2026', typeContrat:'CDD', salaireBase:2400, adresse:'7 rue Lepic', cp:'75018', ville:'Paris', dateFin:'30/09/2026' },
];

function calculerAnciennete(dateEmbauche) {
  const parts = dateEmbauche.split('/');
  const debut = new Date(parts[2], parts[1]-1, parts[0]);
  const now = new Date();
  const mois = (now.getFullYear()-debut.getFullYear())*12 + now.getMonth()-debut.getMonth();
  if (mois < 12) return `${mois} mois`;
  const ans = Math.floor(mois/12); const reste = mois%12;
  return reste > 0 ? `${ans} an${ans>1?'s':''} et ${reste} mois` : `${ans} an${ans>1?'s':''}`;
}

const FORMULAIRES = [
  { id:'at_declaration', cerfa:'S6200', titre:'Déclaration d\'accident du travail', desc:'Déclaration obligatoire à la CPAM sous 48h.', color:'#DC2626', delai:'48h', lienService:'https://www.service-public.fr/particuliers/vosdroits/F171', lienCerfa:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_14463.do',
    demarche:'L\'employeur doit déclarer tout accident du travail dans les 48 heures (dimanches et jours fériés non compris). La déclaration se fait en ligne sur net-entreprises.fr ou par courrier recommandé à la CPAM du salarié.\n\nPièces à fournir :\n• Ce formulaire rempli et signé\n• Le certificat médical initial (établi par le médecin)\n• La feuille d\'accident S6201 (à remettre au salarié)\n\nSanctions : L\'absence de déclaration est passible d\'une amende de 750€ (Art. R471-3 CSS).\n\nLe salarié dispose de 2 ans pour déclarer lui-même l\'accident si l\'employeur ne le fait pas.' },
  { id:'at_feuille', cerfa:'S6201', titre:'Feuille d\'accident du travail / MP', desc:'À remettre au salarié pour la prise en charge des soins à 100%.', color:'#DC2626', delai:'Jour même', lienService:'https://www.service-public.fr/particuliers/vosdroits/F171', lienCerfa:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_11383.do',
    demarche:'L\'employeur doit remettre cette feuille au salarié victime le jour de l\'accident. Elle permet la prise en charge à 100% des frais médicaux liés à l\'accident.\n\nLe salarié la présente à chaque professionnel de santé (médecin, pharmacien, hôpital).\n\nElle est valable jusqu\'à la date de guérison ou de consolidation.\n\nEn cas de rechute, une nouvelle feuille doit être établie.' },
  { id:'mp_declaration', cerfa:'S6100 / 16130', titre:'Déclaration de maladie professionnelle', desc:'Déclaration ou demande de reconnaissance d\'une maladie professionnelle.', color:'#D97706', delai:'15 jours', lienService:'https://www.service-public.fr/particuliers/vosdroits/F176', lienCerfa:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_16130.do',
    demarche:'La déclaration de maladie professionnelle peut être faite par le salarié ou ses ayants droit. Le formulaire Cerfa 16130 remplace l\'ancien S6100.\n\nConditions de reconnaissance :\n• La maladie doit figurer dans un tableau de maladies professionnelles (annexe II du Code de la Sécurité sociale)\n• OU être reconnue par le Comité Régional de Reconnaissance (CRRMP) si hors tableau\n\nPièces à joindre :\n• Certificat médical initial (CMI) établi par le médecin\n• Attestation de salaire (via DSN ou formulaire)\n• Tout document prouvant l\'exposition au risque\n\nLa CPAM dispose de 120 jours pour statuer (+ 120 jours si CRRMP).\n\nPrescription : 2 ans à compter de la cessation du travail ou de la date du certificat médical.' },
  { id:'inaptitude', cerfa:'S6110 (14103)', titre:'Indemnité temporaire d\'inaptitude', desc:'Demande d\'indemnité pour salarié déclaré inapte suite AT/MP.', color:'#2563EB', delai:'—', lienService:'https://www.service-public.fr/particuliers/vosdroits/F726', lienCerfa:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_14103.do',
    demarche:'L\'indemnité temporaire d\'inaptitude (ITI) est versée au salarié déclaré inapte par le médecin du travail, lorsque cette inaptitude est consécutive à un accident du travail ou une maladie professionnelle.\n\nConditions :\n• Le salarié doit être déclaré inapte par le médecin du travail\n• L\'inaptitude doit être liée à un AT ou une MP\n• Le salarié ne doit pas percevoir d\'indemnités journalières\n• Le contrat de travail ne doit pas être rompu\n\nMontant : Égal aux indemnités journalières versées avant l\'avis d\'inaptitude.\n\nDurée : Versée pendant 1 mois maximum à compter de l\'avis d\'inaptitude.\n\nLe formulaire Cerfa 14103 doit être rempli conjointement par l\'employeur (volet 1) et le médecin du travail (volet 2).' },
  { id:'reprise_ipp', cerfa:'S6908', titre:'Reprise d\'activité après IPP', desc:'Déclaration de reprise pour un salarié en incapacité permanente partielle.', color:'#16A34A', delai:'—', lienService:'https://www.service-public.fr/particuliers/vosdroits/F178', lienCerfa:'',
    demarche:'Ce formulaire concerne la reprise d\'activité d\'un salarié bénéficiant d\'une rente d\'incapacité permanente partielle (IPP) suite à un AT/MP.\n\nL\'employeur doit informer la CPAM de la reprise du salarié.\n\nSi le taux d\'IPP est ≥ 10%, le salarié bénéficie d\'une rente. Si < 10%, il reçoit un capital.\n\nL\'employeur doit adapter le poste de travail si nécessaire (obligation de reclassement Art. L1226-10 du Code du travail).' },
  { id:'attestation_activite', cerfa:'Attestation', titre:'Attestation de travail', desc:'Attestation d\'emploi à fournir au salarié sur demande.', color:'#2563EB', delai:'Sur demande', lienService:'', lienCerfa:'',
    demarche:'L\'attestation de travail (ou attestation d\'emploi) est un document établi par l\'employeur qui certifie que le salarié est bien employé au sein de l\'entreprise.\n\nElle peut être demandée par le salarié pour :\n• Une demande de logement\n• Un prêt bancaire\n• Des démarches administratives (CAF, préfecture, etc.)\n\nL\'employeur est tenu de la fournir sur demande du salarié. Il n\'existe pas de formulaire Cerfa — c\'est un document libre mais qui doit contenir certaines mentions obligatoires.' },
];

// Champs obligatoires par formulaire
const CHAMPS_REQUIS = {
  at_declaration: ['dateAccident','heureAccident','lieuAccident','activite','circonstances','natureLesion','siegeLesion','arret','soinsSurPlace','transport'],
  at_feuille: ['dateAccident','natureLesion'],
  mp_declaration: ['tableauMP','designation','dateConstatation','travaux','dureeExposition','agents'],
  inaptitude: ['dateInaptitude','medecinTravail','atOrigine','dateAvisInaptitude'],
  reprise_ipp: ['dateReprise','tauxIPP'],
  attestation_activite: [],
};

function genererDocument(formulaireId, salarie, champs) {
  const s = salarie; const e = EMPLOYEUR;
  const date = new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  const anc = calculerAnciennete(s.dateEmbauche);

  if (formulaireId === 'attestation_activite') {
    let txt = `${e.nom}\n${e.representant}\n${e.fonction}\n${e.adresse}\n${e.cp} ${e.ville}\n\n\n`;
    txt += `${s.civilite} ${s.prenom} ${s.nom}\n        ${s.adresse}\n${s.cp} ${s.ville}\n\n\n`;
    txt += `À ${e.ville}, le ${date}\n\n`;
    txt += `Objet : attestation de travail de ${s.civilite} ${s.nom} ${s.prenom}\n\n`;
    txt += `${s.civilite === 'Mme' ? 'Madame' : 'Monsieur'},\n\n`;
    txt += `Je soussigné(e), ${e.representant}, ${e.fonction} de la société ${e.nom}, établie au ${e.adresse}, ${e.cp} ${e.ville} et immatriculée sous le numéro ${e.siret}, atteste et certifie que ${s.civilite} ${s.prenom} ${s.nom}, né(e) le ${s.dateNaissance} à ${s.lieuNaissance} et demeurant au ${s.adresse}, ${s.cp} ${s.ville} est employé(e) en tant que ${s.poste} au sein de notre société.\n\n`;
    if (s.typeContrat === 'CDI') {
      txt += `Son contrat, conclu sous la forme d'un contrat à durée indéterminée, a débuté le ${s.dateEmbauche}. À ce jour, ${s.civilite === 'Mme' ? 'elle' : 'il'} bénéficie d'une ancienneté de ${anc}.\n\n`;
    } else if (s.dateFin) {
      txt += `Son contrat, conclu sous la forme d'un ${s.typeContrat}, a débuté le ${s.dateEmbauche}. Son terme est fixé pour le ${s.dateFin}. À ce jour, ${s.civilite === 'Mme' ? 'elle' : 'il'} bénéficie d'une ancienneté de ${anc}.\n\n`;
    } else {
      txt += `Son contrat, conclu sous la forme d'un ${s.typeContrat}, a débuté le ${s.dateEmbauche} et est censé prendre fin le jour de la réalisation de l'évènement y mettant un terme. À ce jour, ${s.civilite === 'Mme' ? 'elle' : 'il'} bénéficie d'une ancienneté de ${anc}.\n\n`;
    }
    txt += ``;
    txt += `Cette attestation est délivrée pour servir et valoir ce que de droit.\n\n\n`;
    txt += `${e.representant}\n${e.fonction}\n\n[Signature]\n`;
    return txt;
  }

  if (formulaireId === 'inaptitude') {
    // Cerfa 14103 — 2 volets
    let txt = `${'═'.repeat(60)}\n`;
    txt += `  DEMANDE D'INDEMNITÉ TEMPORAIRE D'INAPTITUDE\n`;
    txt += `  Cerfa n° 14103*01 — Formulaire S6110\n`;
    txt += `  Art. D433-3 du Code de la Sécurité sociale\n`;
    txt += `${'═'.repeat(60)}\n\n`;
    txt += `VOLET 1 — À REMPLIR PAR L'EMPLOYEUR\n${'─'.repeat(50)}\n\n`;
    txt += `A. IDENTIFICATION DE L'EMPLOYEUR\n`;
    txt += `Nom ou raison sociale : ${e.nom}\n`;
    txt += `N° SIRET             : ${e.siret}\n`;
    txt += `Adresse              : ${e.adresse}, ${e.cp} ${e.ville}\n`;
    txt += `Code risque AT       : ${e.codeRisque}\n`;
    txt += `Téléphone            : ${e.tel}\n\n`;
    txt += `B. IDENTIFICATION DU SALARIÉ\n`;
    txt += `Nom                  : ${s.nom}\n`;
    txt += `Prénom               : ${s.prenom}\n`;
    txt += `N° Sécurité Sociale  : ${s.numSecu}\n`;
    txt += `Date de naissance    : ${s.dateNaissance}\n`;
    txt += `Adresse              : ${s.adresse}, ${s.cp} ${s.ville}\n`;
    txt += `Emploi occupé        : ${s.poste}\n`;
    txt += `Qualification        : ${s.qualification}\n`;
    txt += `Date d'embauche      : ${s.dateEmbauche}\n`;
    txt += `Nature du contrat    : ${s.typeContrat}\n\n`;
    txt += `C. RENSEIGNEMENTS RELATIFS À L'INAPTITUDE\n`;
    txt += `Date de l'avis d'inaptitude         : ${champs.dateAvisInaptitude}\n`;
    txt += `Médecin du travail ayant prononcé   : ${champs.medecinTravail}\n`;
    txt += `  l'inaptitude\n`;
    txt += `AT ou MP à l'origine de l'inaptitude: ${champs.atOrigine}\n`;
    txt += `Date de l'AT ou de la MP            : ${champs.dateInaptitude}\n\n`;
    txt += `D. SITUATION DU SALARIÉ À LA DATE DE L'AVIS\n`;
    txt += `Le salarié perçoit-il des IJ ?               : NON\n`;
    txt += `Le contrat de travail est-il rompu ?         : NON\n\n`;
    txt += `Je certifie l'exactitude des renseignements ci-dessus.\n\n`;
    txt += `Fait à ${e.ville}, le ${date}\n`;
    txt += `Signature et cachet de l'employeur :\n\n\n_________________________________\n\n`;
    txt += `${'─'.repeat(50)}\n`;
    txt += `VOLET 2 — À REMPLIR PAR LE MÉDECIN DU TRAVAIL\n${'─'.repeat(50)}\n\n`;
    txt += `Je soussigné(e), Docteur ${champs.medecinTravail},\nmédecin du travail, certifie avoir déclaré inapte\n${s.civilite} ${s.prenom} ${s.nom} à son poste de ${s.poste}\nle ${champs.dateAvisInaptitude}.\n\n`;
    txt += `L'inaptitude est consécutive à :\n`;
    txt += `  [X] Un accident du travail / une maladie professionnelle\n`;
    txt += `      Référence : ${champs.atOrigine}\n`;
    txt += `      Date      : ${champs.dateInaptitude}\n\n`;
    txt += `Date et signature du médecin du travail :\n\n\n_________________________________\n`;
    return txt;
  }

  if (formulaireId === 'mp_declaration') {
    let txt = `${'═'.repeat(60)}\n`;
    txt += `  DÉCLARATION DE MALADIE PROFESSIONNELLE\n`;
    txt += `  OU DEMANDE DE RECONNAISSANCE\n`;
    txt += `  Cerfa n° 16130*01 — Art. L461-5 CSS\n`;
    txt += `${'═'.repeat(60)}\n\n`;
    txt += `Lien formulaire officiel :\nhttps://www.formulaires.service-public.gouv.fr/gf/cerfa_16130.do\n\n`;
    txt += `1. DÉCLARANT\n${'─'.repeat(40)}\n`;
    txt += `[X] L'employeur\n`;
    txt += `Nom ou raison sociale : ${e.nom}\n`;
    txt += `SIRET                 : ${e.siret}\n`;
    txt += `Adresse               : ${e.adresse}, ${e.cp} ${e.ville}\n\n`;
    txt += `2. VICTIME\n${'─'.repeat(40)}\n`;
    txt += `${s.civilite} ${s.prenom} ${s.nom}\n`;
    txt += `N° Sécurité Sociale   : ${s.numSecu}\n`;
    txt += `Né(e) le ${s.dateNaissance} à ${s.lieuNaissance}\n`;
    txt += `Adresse               : ${s.adresse}, ${s.cp} ${s.ville}\n`;
    txt += `Profession exercée    : ${s.poste}\n`;
    txt += `Date d'embauche       : ${s.dateEmbauche}\n\n`;
    txt += `3. MALADIE PROFESSIONNELLE\n${'─'.repeat(40)}\n`;
    txt += `N° du tableau de MP              : ${champs.tableauMP}\n`;
    txt += `Désignation de la maladie        : ${champs.designation}\n`;
    txt += `Date de 1ère constatation méd.   : ${champs.dateConstatation}\n`;
    txt += `Date de cessation de travail     : ${champs.dateCessation || 'Non applicable'}\n\n`;
    txt += `4. EXPOSITION AU RISQUE\n${'─'.repeat(40)}\n`;
    txt += `Nature des travaux effectués     : ${champs.travaux}\n`;
    txt += `Durée de l'exposition au risque  : ${champs.dureeExposition}\n`;
    txt += `Produits ou agents en cause      : ${champs.agents}\n`;
    txt += `Dernière exposition              : ${champs.derniereExposition || 'À la cessation'}\n\n`;
    txt += `5. PIÈCES JOINTES\n${'─'.repeat(40)}\n`;
    txt += `[ ] Certificat médical initial (CMI)\n`;
    txt += `[ ] Attestation de salaire (DSN ou formulaire)\n`;
    txt += `[ ] Justificatifs d'exposition au risque\n\n`;
    txt += `Je certifie l'exactitude des renseignements ci-dessus.\n\n`;
    txt += `Fait à ${e.ville}, le ${date}\n`;
    txt += `Signature : _________________________________\n\n`;
    txt += `RAPPEL : La CPAM dispose de 120 jours pour statuer.\nPrescription : 2 ans à compter de la cessation du travail.\n`;
    return txt;
  }

  if (formulaireId === 'at_declaration') {
    let txt = `${'═'.repeat(60)}\n  DÉCLARATION D'ACCIDENT DU TRAVAIL\n  Cerfa S6200 — Art. L441-2 CSS\n  À envoyer à la CPAM sous 48 heures\n${'═'.repeat(60)}\n\n`;
    txt += `1. EMPLOYEUR\n${'─'.repeat(40)}\nRaison sociale    : ${e.nom}\nSIRET             : ${e.siret}\nAdresse           : ${e.adresse}, ${e.cp} ${e.ville}\nCode risque AT/MP : ${e.codeRisque}\nTéléphone         : ${e.tel}\n\n`;
    txt += `2. VICTIME\n${'─'.repeat(40)}\nNom               : ${s.nom}\nPrénom            : ${s.prenom}\nN° Sécurité Soc.  : ${s.numSecu}\nDate de naissance  : ${s.dateNaissance}\nLieu de naissance : ${s.lieuNaissance}\nNationalité       : ${s.nationalite}\nAdresse           : ${s.adresse}, ${s.cp} ${s.ville}\nQualification     : ${s.qualification}\nPoste occupé      : ${s.poste}\nDate d'embauche   : ${s.dateEmbauche}\nContrat           : ${s.typeContrat}\nAncienneté        : ${anc}\n\n`;
    txt += `3. ACCIDENT\n${'─'.repeat(40)}\nDate              : ${champs.dateAccident}\nHeure             : ${champs.heureAccident}\nLieu              : ${champs.lieuAccident}\nActivité          : ${champs.activite}\n\n`;
    txt += `4. CIRCONSTANCES DÉTAILLÉES\n${'─'.repeat(40)}\n${champs.circonstances}\n\n`;
    txt += `5. LÉSIONS\n${'─'.repeat(40)}\nNature : ${champs.natureLesion}\nSiège  : ${champs.siegeLesion}\n\n`;
    txt += `6. TÉMOINS\n${'─'.repeat(40)}\n${champs.temoins || 'Aucun témoin'}\n\n`;
    txt += `7. ARRÊT DE TRAVAIL\n${'─'.repeat(40)}\nArrêt prescrit : ${champs.arret}\n`;
    if (champs.arret==='OUI') txt += `Du : ${champs.dateArret||'___'} · Durée : ${champs.dureeArret||'___'} jours\n`;
    txt += `\n8. PREMIERS SOINS\n${'─'.repeat(40)}\nSoins sur place    : ${champs.soinsSurPlace}\nTransport urgences : ${champs.transport}\nMédecin            : ${champs.medecin||'—'}\n\n`;
    txt += `${'═'.repeat(60)}\nFait à ${e.ville}, le ${date}\n\nSignature employeur :\n\n\n_________________________________\n`;
    return txt;
  }

  if (formulaireId === 'at_feuille') {
    let txt = `${'═'.repeat(60)}\n  FEUILLE D'ACCIDENT DU TRAVAIL\n  OU DE MALADIE PROFESSIONNELLE\n  Cerfa S6201 — À remettre au salarié\n${'═'.repeat(60)}\n\n`;
    txt += `EMPLOYEUR : ${e.nom} · SIRET ${e.siret}\n${e.adresse}, ${e.cp} ${e.ville}\n\n`;
    txt += `VICTIME : ${s.prenom} ${s.nom}\nN° SS : ${s.numSecu}\nNé(e) le ${s.dateNaissance} à ${s.lieuNaissance}\nAdresse : ${s.adresse}, ${s.cp} ${s.ville}\n\n`;
    txt += `ACCIDENT / MALADIE\nDate : ${champs.dateAccident}\nNature des lésions : ${champs.natureLesion}\n\n`;
    txt += `Cette feuille est à présenter à tout professionnel de santé\npour la prise en charge à 100% des soins liés à l'AT/MP.\nValable jusqu'à la date de guérison ou consolidation.\n\n`;
    txt += `Fait à ${e.ville}, le ${date}\nSignature : _________________________________\n`;
    return txt;
  }

  if (formulaireId === 'reprise_ipp') {
    let txt = `${'═'.repeat(60)}\n  REPRISE D'ACTIVITÉ — VICTIME IPP\n  Cerfa S6908\n${'═'.repeat(60)}\n\n`;
    txt += `EMPLOYEUR : ${e.nom} · SIRET ${e.siret}\n${e.adresse}, ${e.cp} ${e.ville}\n\n`;
    txt += `SALARIÉ : ${s.prenom} ${s.nom} · N° SS ${s.numSecu}\nPoste : ${s.poste}\n\n`;
    txt += `REPRISE D'ACTIVITÉ\nDate de reprise      : ${champs.dateReprise}\nPoste repris         : ${champs.posteReprise||s.poste}\nTaux IPP             : ${champs.tauxIPP}%\nAménagement de poste : ${champs.amenagement||'NON'}\n\n`;
    txt += `Fait à ${e.ville}, le ${date}\nSignature : _________________________________\n`;
    return txt;
  }

  return '';
}

export default function FormulairesAMELI() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedSalarie, setSelectedSalarie] = useState('');
  const [champs, setChamps] = useState({ arret:'NON', soinsSurPlace:'NON', transport:'NON' });
  const [preview, setPreview] = useState('');
  const [erreurs, setErreurs] = useState([]);
  const [showDemarche, setShowDemarche] = useState(false);

  const salarie = SALARIES.find(s => s.id === Number(selectedSalarie));
  const formInfo = FORMULAIRES.find(f => f.id === selectedForm);

  const LABELS = { dateAccident:'Date accident', heureAccident:'Heure', lieuAccident:'Lieu', activite:'Activité', circonstances:'Circonstances', natureLesion:'Nature lésions', siegeLesion:'Siège lésions', arret:'Arrêt', soinsSurPlace:'Soins sur place', transport:'Transport', tableauMP:'N° tableau MP', designation:'Désignation', dateConstatation:'Date constatation', travaux:'Travaux', dureeExposition:'Durée exposition', agents:'Agents', dateInaptitude:'Date AT/MP', medecinTravail:'Médecin travail', atOrigine:'AT/MP origine', dateAvisInaptitude:'Date avis inaptitude', dateReprise:'Date reprise', tauxIPP:'Taux IPP' };

  const valider = () => {
    if (!salarie) return ['Sélectionnez un salarié'];
    const requis = CHAMPS_REQUIS[selectedForm] || [];
    return requis.filter(c => !champs[c] || champs[c].trim?.() === '').map(c => LABELS[c] || c);
  };

  const generer = () => {
    const manquants = valider();
    setErreurs(manquants);
    if (manquants.length > 0) { setPreview(''); return; }
    setPreview(genererDocument(selectedForm, salarie, champs));
  };

  const exporter = () => {
    if (!preview) return;
    const blob = new Blob([preview], { type:'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${formInfo?.cerfa||'doc'}_${salarie?.nom||''}_${new Date().toISOString().slice(0,10)}.txt`; a.click();
  };

  // Vue liste des formulaires
  if (!selectedForm) return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>Formulaires AMELI / CPAM</h2>
      <p style={{ fontSize:12, color:'#555', marginBottom:16 }}>Cliquez sur un formulaire pour voir la démarche complète et générer le document auto-rempli.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:10 }}>
        {FORMULAIRES.map(f => (
          <div key={f.id} onClick={() => { setSelectedForm(f.id); setShowDemarche(true); setPreview(''); setErreurs([]); }} style={{ ...CARD, cursor:'pointer', borderLeft:`4px solid ${f.color}`, transition:'all .15s' }} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:14, fontWeight:700 }}>{f.titre}</span>
              <span style={{ fontSize:10, fontWeight:700, color:f.color, background:`${f.color}12`, padding:'2px 8px', borderRadius:6, flexShrink:0 }}>{f.cerfa}</span>
            </div>
            <div style={{ fontSize:11, color:'#555', lineHeight:1.5, marginBottom:6 }}>{f.desc}</div>
            <div style={{ fontSize:10, color:f.color, fontWeight:600 }}>Délai : {f.delai} · Voir la démarche →</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Vue démarche + formulaire
  return (
    <div>
      <button onClick={() => { setSelectedForm(null); setShowDemarche(false); setPreview(''); }} style={{ ...BTN_O, marginBottom:12, fontSize:11 }}>← Retour aux formulaires</button>

      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <div style={{ width:5, height:28, borderRadius:3, background:formInfo.color }} />
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:16, fontWeight:800, margin:0 }}>{formInfo.titre}</h3>
          <span style={{ fontSize:11, color:'#555' }}>{formInfo.cerfa} · Délai : {formInfo.delai}</span>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={()=>setShowDemarche(true)} style={showDemarche?BTN:BTN_O}>Démarche</button>
          <button onClick={()=>setShowDemarche(false)} style={!showDemarche?BTN:BTN_O}>Remplir le formulaire</button>
        </div>
      </div>

      {/* PAGE DÉMARCHE */}
      {showDemarche && (
        <div style={CARD}>
          <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>Démarche complète</h3>
          <div style={{ fontSize:13, lineHeight:1.8, whiteSpace:'pre-wrap', color:'#333', marginBottom:16 }}>{formInfo.demarche}</div>
          {formInfo.lienService && (
            <a href={formInfo.lienService} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 18px', background:'#2563EB', color:'#fff', borderRadius:10, fontSize:13, fontWeight:600, textDecoration:'none', marginRight:8 }}>
              Voir sur service-public.fr →
            </a>
          )}
          {formInfo.lienCerfa && (
            <a href={formInfo.lienCerfa} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 18px', background:'#D97706', color:'#fff', borderRadius:10, fontSize:13, fontWeight:600, textDecoration:'none' }}>
              Télécharger le Cerfa officiel →
            </a>
          )}
          <div style={{ marginTop:16 }}>
            <button onClick={()=>setShowDemarche(false)} style={{ ...BTN, background:formInfo.color }}>Remplir le formulaire auto-rempli →</button>
          </div>
        </div>
      )}

      {/* PAGE FORMULAIRE */}
      {!showDemarche && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={CARD}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>1. Sélectionner le salarié <span style={REQSTAR}>*</span></div>
            <select value={selectedSalarie} onChange={e=>{ setSelectedSalarie(e.target.value); setPreview(''); setErreurs([]); }} style={{ ...INP, marginBottom:12 }}>
              <option value="">— Choisir un salarié —</option>
              {SALARIES.map(s => <option key={s.id} value={s.id}>{s.civilite} {s.prenom} {s.nom} — {s.poste}</option>)}
            </select>

            {salarie && <>
              <div style={{ background:'#F0FDF4', border:'1px solid #16A34A25', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:11 }}>
                <strong style={{ color:'#16A34A' }}>Données auto-remplies depuis le profil :</strong><br/>
                {salarie.civilite} {salarie.prenom} {salarie.nom} · N° SS {salarie.numSecu}<br/>
                Né(e) le {salarie.dateNaissance} à {salarie.lieuNaissance}<br/>
                {salarie.adresse}, {salarie.cp} {salarie.ville}<br/>
                {salarie.poste} ({salarie.qualification}) · {salarie.typeContrat}<br/>
                Embauché le {salarie.dateEmbauche} · Ancienneté : {calculerAnciennete(salarie.dateEmbauche)}
              </div>

              <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>2. Champs spécifiques <span style={{ fontSize:10, color:'#DC2626' }}>(tous obligatoires)</span></div>

              {/* Champs par formulaire */}
              {(selectedForm==='at_declaration'||selectedForm==='at_feuille') && <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                  <div><label style={LBL}>Date accident <span style={REQSTAR}>*</span></label><input type="date" value={champs.dateAccident||''} onChange={e=>setChamps(c=>({...c,dateAccident:e.target.value}))} style={INP}/></div>
                  {selectedForm==='at_declaration' && <div><label style={LBL}>Heure <span style={REQSTAR}>*</span></label><input type="time" value={champs.heureAccident||''} onChange={e=>setChamps(c=>({...c,heureAccident:e.target.value}))} style={INP}/></div>}
                </div>
                {selectedForm==='at_declaration' && <>
                  <div style={{marginBottom:8}}><label style={LBL}>Lieu de l'accident <span style={REQSTAR}>*</span></label><input value={champs.lieuAccident||''} onChange={e=>setChamps(c=>({...c,lieuAccident:e.target.value}))} style={INP} placeholder="Adresse du chantier"/></div>
                  <div style={{marginBottom:8}}><label style={LBL}>Activité au moment <span style={REQSTAR}>*</span></label><input value={champs.activite||''} onChange={e=>setChamps(c=>({...c,activite:e.target.value}))} style={INP}/></div>
                  <div style={{marginBottom:8}}><label style={LBL}>Circonstances détaillées <span style={REQSTAR}>*</span></label><textarea value={champs.circonstances||''} onChange={e=>setChamps(c=>({...c,circonstances:e.target.value}))} rows={3} style={{...INP,resize:'vertical'}}/></div>
                </>}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>Nature lésions <span style={REQSTAR}>*</span></label><input value={champs.natureLesion||''} onChange={e=>setChamps(c=>({...c,natureLesion:e.target.value}))} style={INP}/></div>
                  {selectedForm==='at_declaration' && <div><label style={LBL}>Siège lésions <span style={REQSTAR}>*</span></label><input value={champs.siegeLesion||''} onChange={e=>setChamps(c=>({...c,siegeLesion:e.target.value}))} style={INP}/></div>}
                </div>
                {selectedForm==='at_declaration' && <>
                  <div style={{marginBottom:8}}><label style={LBL}>Témoins</label><input value={champs.temoins||''} onChange={e=>setChamps(c=>({...c,temoins:e.target.value}))} style={INP}/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
                    <div><label style={LBL}>Arrêt <span style={REQSTAR}>*</span></label><select value={champs.arret||'NON'} onChange={e=>setChamps(c=>({...c,arret:e.target.value}))} style={INP}><option>NON</option><option>OUI</option></select></div>
                    <div><label style={LBL}>Soins sur place <span style={REQSTAR}>*</span></label><select value={champs.soinsSurPlace||'NON'} onChange={e=>setChamps(c=>({...c,soinsSurPlace:e.target.value}))} style={INP}><option>NON</option><option>OUI</option></select></div>
                    <div><label style={LBL}>Transport urg. <span style={REQSTAR}>*</span></label><select value={champs.transport||'NON'} onChange={e=>setChamps(c=>({...c,transport:e.target.value}))} style={INP}><option>NON</option><option>OUI</option></select></div>
                  </div>
                  {champs.arret==='OUI' && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                    <div><label style={LBL}>Date arrêt</label><input type="date" value={champs.dateArret||''} onChange={e=>setChamps(c=>({...c,dateArret:e.target.value}))} style={INP}/></div>
                    <div><label style={LBL}>Durée (jours)</label><input type="number" value={champs.dureeArret||''} onChange={e=>setChamps(c=>({...c,dureeArret:e.target.value}))} style={INP}/></div>
                  </div>}
                  <div style={{marginBottom:8}}><label style={LBL}>Médecin</label><input value={champs.medecin||''} onChange={e=>setChamps(c=>({...c,medecin:e.target.value}))} style={INP}/></div>
                </>}
              </>}

              {selectedForm==='mp_declaration' && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>N° tableau MP <span style={REQSTAR}>*</span></label><input value={champs.tableauMP||''} onChange={e=>setChamps(c=>({...c,tableauMP:e.target.value}))} style={INP} placeholder="57, 30, 42..."/></div>
                  <div><label style={LBL}>Désignation <span style={REQSTAR}>*</span></label><input value={champs.designation||''} onChange={e=>setChamps(c=>({...c,designation:e.target.value}))} style={INP}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>Date 1ère constatation <span style={REQSTAR}>*</span></label><input type="date" value={champs.dateConstatation||''} onChange={e=>setChamps(c=>({...c,dateConstatation:e.target.value}))} style={INP}/></div>
                  <div><label style={LBL}>Durée exposition <span style={REQSTAR}>*</span></label><input value={champs.dureeExposition||''} onChange={e=>setChamps(c=>({...c,dureeExposition:e.target.value}))} style={INP} placeholder="5 ans..."/></div>
                </div>
                <div style={{marginBottom:8}}><label style={LBL}>Nature des travaux <span style={REQSTAR}>*</span></label><textarea value={champs.travaux||''} onChange={e=>setChamps(c=>({...c,travaux:e.target.value}))} rows={2} style={{...INP,resize:'vertical'}}/></div>
                <div style={{marginBottom:8}}><label style={LBL}>Produits / agents <span style={REQSTAR}>*</span></label><input value={champs.agents||''} onChange={e=>setChamps(c=>({...c,agents:e.target.value}))} style={INP} placeholder="Amiante, silice, bruit..."/></div>
              </>}

              {selectedForm==='inaptitude' && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>Date de l'avis d'inaptitude <span style={REQSTAR}>*</span></label><input type="date" value={champs.dateAvisInaptitude||''} onChange={e=>setChamps(c=>({...c,dateAvisInaptitude:e.target.value}))} style={INP}/></div>
                  <div><label style={LBL}>Médecin du travail <span style={REQSTAR}>*</span></label><input value={champs.medecinTravail||''} onChange={e=>setChamps(c=>({...c,medecinTravail:e.target.value}))} style={INP}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>AT/MP d'origine <span style={REQSTAR}>*</span></label><input value={champs.atOrigine||''} onChange={e=>setChamps(c=>({...c,atOrigine:e.target.value}))} style={INP} placeholder="Réf. dossier AT"/></div>
                  <div><label style={LBL}>Date AT/MP <span style={REQSTAR}>*</span></label><input type="date" value={champs.dateInaptitude||''} onChange={e=>setChamps(c=>({...c,dateInaptitude:e.target.value}))} style={INP}/></div>
                </div>
              </>}

              {selectedForm==='reprise_ipp' && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>Date de reprise <span style={REQSTAR}>*</span></label><input type="date" value={champs.dateReprise||''} onChange={e=>setChamps(c=>({...c,dateReprise:e.target.value}))} style={INP}/></div>
                  <div><label style={LBL}>Taux IPP (%) <span style={REQSTAR}>*</span></label><input type="number" value={champs.tauxIPP||''} onChange={e=>setChamps(c=>({...c,tauxIPP:e.target.value}))} style={INP}/></div>
                </div>
              </>}

              {selectedForm==='attestation_activite' && (
                <div style={{ background:'#EFF6FF', border:'1px solid #2563EB25', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#2563EB' }}>
                  Ce document est <strong>100% automatique</strong>. Toutes les informations proviennent du profil du salarié. Cliquez directement sur "Générer".
                </div>
              )}

              {erreurs.length > 0 && (
                <div style={{ background:'#FEF2F2', border:'1px solid #DC262625', borderRadius:8, padding:'10px 14px', marginTop:8, fontSize:11 }}>
                  <strong style={{ color:'#DC2626' }}>Champs obligatoires manquants :</strong>
                  <div style={{ color:'#DC2626', marginTop:4 }}>{erreurs.join(' · ')}</div>
                </div>
              )}
              <button onClick={generer} style={{ ...BTN, width:'100%', padding:12, marginTop:8, background:formInfo.color }}>Générer le document</button>
            </>}
          </div>

          {/* Aperçu */}
          <div>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Aperçu du document</div>
            {preview ? <>
              <div style={{ background:'#FAFAF8', border:'1px solid #E8E6E1', borderRadius:8, padding:16, maxHeight:500, overflowY:'auto', fontFamily:'monospace', fontSize:11, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{preview}</div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button onClick={exporter} style={{ ...BTN, flex:1 }}>Télécharger</button>
                <button onClick={()=>window.print()} style={{ ...BTN_O, flex:1 }}>Imprimer</button>
              </div>
            </> : (
              <div style={{ background:'#F8F7F4', border:'1px solid #E8E6E1', borderRadius:8, padding:40, textAlign:'center', color:'#555', fontSize:13 }}>
                {!salarie ? 'Sélectionnez un salarié' : 'Remplissez les champs puis cliquez "Générer"'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
