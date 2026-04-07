import React, { useState, useEffect } from 'react';
import DS from '../../design/ds';
import { genererPDF_DAT, genererPDF_FAT, genererPDF_DMP, genererPDF_ITI, genererPDF_ATT } from '../../utils/pdfCerfa';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'10px 20px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'9px 11px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:12, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:10, fontWeight:600, color:'#555', display:'block', marginBottom:3 };
const REQ = { color:'#DC2626' };
const SEC = { fontSize:14, fontWeight:700, margin:'18px 0 10px', padding:'6px 0', borderBottom:'2px solid #E8E6E1' };
const SUBSEC = { fontSize:12, fontWeight:700, color:'#555', margin:'12px 0 6px' };
const G = (cols='1fr 1fr') => ({ display:'grid', gridTemplateColumns:cols, gap:8, marginBottom:8 });
const CHK = { display:'flex', alignItems:'center', gap:6, fontSize:12, cursor:'pointer', padding:'3px 0' };

const EMPLOYEUR = { nom:'Freample Artisans BTP', siret:'12345678900012', adresse:'24 rue de la Liberté', cp:'06000', ville:'Nice', codeNAF:'4399C', codeRisque:'452BB', tel:'0493XXXXXX', cpam:'CPAM des Alpes-Maritimes, 48 av du Roi Robert, 06000 Nice', representant:'Vassili Beaufrere', fonction:'Gérant' };

const SALARIES = [
  { id:1, civ:'M.', nom:'Martin', prenom:'Jean', nomUsage:'', numSecu:'185067512345678', dn:'15/06/1985', lieuN:'Nice', sexe:'M', nat:'Française', poste:'Maçon qualifié', qualif:'Ouvrier qualifié', emb:'01/09/2024', contrat:'CDI', adr:'12 rue Pastorelli', cp:'06000', ville:'Nice', tel:'0612345678', email:'jean.martin@email.com', dateFin:'' },
  { id:2, civ:'Mme', nom:'Duval', prenom:'Sophie', nomUsage:'', numSecu:'290030678901234', dn:'08/03/1990', lieuN:'Lyon', sexe:'F', nat:'Française', poste:'Électricienne', qualif:'Ouvrier qualifié', emb:'01/10/2025', contrat:'CDI', adr:'8 av de la Libération', cp:'06000', ville:'Nice', tel:'0698765432', email:'sophie.duval@email.com', dateFin:'' },
  { id:3, civ:'M.', nom:'Lambert', prenom:'Marc', nomUsage:'', numSecu:'182110645678901', dn:'22/11/1982', lieuN:'Marseille', sexe:'M', nat:'Française', poste:'Plombier', qualif:'Ouvrier qualifié', emb:'15/03/2026', contrat:'CDI', adr:'3 bd Gambetta', cp:'06000', ville:'Nice', tel:'0645678901', email:'marc.lambert@email.com', dateFin:'' },
  { id:4, civ:'M.', nom:'Garcia', prenom:'Lucas', nomUsage:'', numSecu:'188077523456789', dn:'21/07/1988', lieuN:'Paris', sexe:'M', nat:'Française', poste:'Peintre', qualif:'Ouvrier qualifié', emb:'01/04/2026', contrat:'CDD', adr:'7 rue Lepic', cp:'75018', ville:'Paris', tel:'0623456789', email:'lucas.garcia@email.com', dateFin:'30/09/2026' },
];

function anc(d) { const p=d.split('/'); const deb=new Date(p[2],p[1]-1,p[0]); const now=new Date(); const m=(now.getFullYear()-deb.getFullYear())*12+now.getMonth()-deb.getMonth(); if(m<12)return`${m} mois`; const a=Math.floor(m/12),r=m%12; return r>0?`${a} an${a>1?'s':''} et ${r} mois`:`${a} an${a>1?'s':''}` }

const FORMS = [
  { id:'dat', titre:'Déclaration d\'accident du travail', cerfa:'Cerfa 14463 (S6200)', color:'#DC2626', delai:'48 heures', lien:'https://www.service-public.fr/particuliers/vosdroits/F171', pdf:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_14463.do' },
  { id:'fat', titre:'Feuille d\'accident du travail / MP', cerfa:'Cerfa 11383 (S6201)', color:'#DC2626', delai:'Jour même', lien:'https://www.service-public.fr/particuliers/vosdroits/F171', pdf:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_11383.do' },
  { id:'dmp', titre:'Déclaration de maladie professionnelle', cerfa:'Cerfa 16130 (S6100)', color:'#D97706', delai:'15 jours', lien:'https://www.service-public.fr/particuliers/vosdroits/F176', pdf:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_16130.do' },
  { id:'iti', titre:'Indemnité temporaire d\'inaptitude', cerfa:'Cerfa 14103 (S6110)', color:'#2563EB', delai:'Après avis inaptitude', lien:'https://www.service-public.fr/particuliers/vosdroits/F726', pdf:'https://www.formulaires.service-public.gouv.fr/gf/cerfa_14103.do' },
  { id:'att', titre:'Attestation de travail', cerfa:'Document libre', color:'#16A34A', delai:'Sur demande', lien:'', pdf:'' },
];

// Composant champ avec label
function F({label,req,children}) { return <div><label style={LBL}>{label}{req && <span style={REQ}> *</span>}</label>{children}</div>; }
function Inp({label,req,val,set,type='text',ph=''}) { return <F label={label} req={req}><input type={type} value={val||''} onChange={e=>set(e.target.value)} placeholder={ph} style={{...INP, borderColor:req&&!val?'#DC262640':'#E8E6E1'}}/></F>; }
function Sel({label,req,val,set,opts}) { return <F label={label} req={req}><select value={val||''} onChange={e=>set(e.target.value)} style={{...INP, borderColor:req&&!val?'#DC262640':'#E8E6E1'}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></F>; }
function Chk({label,val,set}) { return <label style={CHK}><input type="checkbox" checked={!!val} onChange={e=>set(e.target.checked)}/>{label}</label>; }
function Txt({label,req,val,set,rows=3}) { return <F label={label} req={req}><textarea value={val||''} onChange={e=>set(e.target.value)} rows={rows} style={{...INP, resize:'vertical', borderColor:req&&!val?'#DC262640':'#E8E6E1'}}/></F>; }

// Auto-fill section lecture seule
function AutoBlock({s,e}) {
  return <div style={{background:'#F0FDF4',border:'1px solid #16A34A20',borderRadius:8,padding:'10px 12px',marginBottom:12,fontSize:11,lineHeight:1.7}}>
    <strong style={{color:'#16A34A'}}>Données auto-remplies depuis le profil</strong><br/>
    <strong>Employeur :</strong> {e.nom} · SIRET {e.siret} · {e.adresse}, {e.cp} {e.ville}<br/>
    <strong>Salarié :</strong> {s.civ} {s.prenom} {s.nom} · N°SS {s.numSecu}<br/>
    Né(e) le {s.dn} à {s.lieuN} · {s.poste} ({s.qualif})<br/>
    {s.adr}, {s.cp} {s.ville} · {s.contrat} depuis le {s.emb} ({anc(s.emb)})
  </div>;
}

export default function FormulairesAMELI() {
  const [sel, setSel] = useState(null);
  const [sid, setSid] = useState('');
  const [f, setF] = useState({});
  const [preview, setPreview] = useState('');
  const [err, setErr] = useState([]);
  const [showInfo, setShowInfo] = useState(true);

  const s = SALARIES.find(x=>x.id===Number(sid));
  const e = EMPLOYEUR;
  const form = FORMS.find(x=>x.id===sel);
  const u = (k,v) => setF(p=>({...p,[k]:v}));

  // Génération document complet
  const generer = () => {
    if(!s) { setErr(['Sélectionnez un salarié']); return; }
    setErr([]);
    const date = new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
    const d = '─'.repeat(55);
    const dd = '═'.repeat(55);
    let t = '';

    if(sel==='dat') {
      t += `${dd}\nDÉCLARATION D'ACCIDENT DU TRAVAIL OU DE TRAJET\n${form.cerfa} — Art. L441-2 CSS\nÀ envoyer à la CPAM sous 48 heures\n${dd}\n\n`;
      t += `1. EMPLOYEUR\n${d}\n`;
      t += `SIRET                    : ${e.siret}\nCode risque sécu. soc.   : ${e.codeRisque}\nRaison sociale           : ${e.nom}\nAdresse                  : ${e.adresse}\nCode postal              : ${e.cp}\nCommune                  : ${e.ville}\nTéléphone                : ${e.tel}\nCode NAF/APE             : ${e.codeNAF}\nOrganisme cotisations AT : ${e.cpam}\n\n`;
      t += `2. VICTIME\n${d}\n`;
      t += `Nom de naissance         : ${s.nom}\nNom d'usage              : ${s.nomUsage||'—'}\nPrénom(s)                : ${s.prenom}\nN° Sécurité sociale      : ${s.numSecu}\nDate de naissance        : ${s.dn}\nSexe                     : ${s.sexe==='M'?'Masculin':'Féminin'}\nNationalité              : ${s.nat}\nAdresse                  : ${s.adr}\nCode postal              : ${s.cp}\nCommune                  : ${s.ville}\nProfession               : ${s.poste}\nQualification            : ${s.qualif}\nDate d'embauche          : ${s.emb}\nAncienneté dans le poste : ${anc(s.emb)}\nNature du contrat        : ${s.contrat}\nDernier examen médical   : ${f.examMedical||'Non renseigné'}\n\n`;
      t += `3. ACCIDENT\n${d}\n`;
      t += `Date de l'accident       : ${f.dateAcc||''}\nHeure de l'accident      : ${f.heureAcc||''}\nHoraire de travail       : de ${f.horaireDebut||'___'} à ${f.horaireFin||'___'}\n`;
      t += `Date/heure information   : ${f.dateInfo||''} ${f.heureInfo||''}\n\n`;
      t += `Lieu de l'accident :\n`;
      t += `  [${f.lieuHabituel?'X':' '}] Lieu de travail habituel\n`;
      t += `  [${f.lieuOccasionnel?'X':' '}] Lieu de travail occasionnel\n`;
      t += `  [${f.lieuDeplacement?'X':' '}] Déplacement pour l'employeur\n`;
      t += `  [${f.lieuDomicile?'X':' '}] Domicile du salarié\n`;
      t += `  [${f.lieuTrajetAller?'X':' '}] Trajet aller domicile → travail\n`;
      t += `  [${f.lieuTrajetRetour?'X':' '}] Trajet retour travail → domicile\n`;
      t += `  [${f.lieuTrajetRepas?'X':' '}] Trajet travail → lieu de restauration\n`;
      t += `Adresse précise          : ${f.adresseLieu||''}\n\n`;
      t += `Transport vers           : ${f.transportVers||'—'}\n\n`;
      t += `Activité de la victime   :\n${f.activite||''}\n\n`;
      t += `4. CIRCONSTANCES DÉTAILLÉES\n${d}\n${f.circonstances||''}\n\n`;
      t += `5. LÉSIONS\n${d}\nSiège des lésions        : ${f.siege||''}\nNature des lésions       : ${f.nature||''}\n\n`;
      t += `6. TIERS\n${d}\nAccident causé par tiers  : ${f.tiers?'OUI':'NON'}\n`;
      if(f.tiers) t += `Nom/adresse du tiers     : ${f.tiersNom||''}\n`;
      t += `\n7. TÉMOINS\n${d}\nTémoin(s) présent(s)     : ${f.temoinOui?'OUI':'NON'}\n`;
      if(f.temoinOui) { t += `Témoin 1                 : ${f.temoin1Nom||''}\n                           ${f.temoin1Adr||''}\n`; t += `Témoin 2                 : ${f.temoin2Nom||''}\n                           ${f.temoin2Adr||''}\n`; }
      t += `\n8. ARRÊT DE TRAVAIL\n${d}\n`;
      t += `Cessation le jour même   : ${f.cessation?'OUI':'NON'}\n`;
      t += `Cessation ultérieure     : ${f.cessationUlt||'—'}\n`;
      t += `Dernier jour de travail  : ${f.dernierJour||''}\n`;
      t += `Journée intégralement payée : ${f.journeePayee?'OUI':'NON'}\n`;
      t += `Date de reprise          : ${f.dateReprise||'Non connue'}\n\n`;
      t += `9. RÉSERVES DE L'EMPLOYEUR\n${d}\nRéserves motivées        : ${f.reserves?'OUI':'NON'}\n`;
      if(f.reserves) t += `Motifs                   :\n${f.reservesMotif||''}\n`;
      t += `\n${dd}\nFait à ${e.ville}, le ${date}\n\nSignature et cachet de l'employeur :\n\n\n_________________________________\n`;
    }

    if(sel==='fat') {
      t += `${dd}\nFEUILLE D'ACCIDENT DU TRAVAIL\nOU DE MALADIE PROFESSIONNELLE\n${form.cerfa} — À remettre à la victime\n${dd}\n\n`;
      t += `CAISSE PRIMAIRE\n${d}\n${e.cpam}\n\n`;
      t += `EMPLOYEUR\n${d}\nSIRET : ${e.siret}\n${e.nom}\n${e.adresse}, ${e.cp} ${e.ville}\n\n`;
      t += `VICTIME\n${d}\nN° SS : ${s.numSecu}\nNom de naissance : ${s.nom}\nNom d'usage : ${s.nomUsage||'—'}\nPrénom(s) : ${s.prenom}\nAdresse : ${s.adr}, ${s.cp} ${s.ville}\n\n`;
      t += `ACCIDENT / MALADIE\n${d}\n`;
      t += `Nature : [${f.typeAT?'X':' '}] Accident du travail  [${f.typeTrajet?'X':' '}] Accident de trajet  [${f.typeMP?'X':' '}] Maladie professionnelle\n`;
      t += `Date : ${f.dateEvt||''}\n\n`;
      t += `Cette feuille est à présenter à tout professionnel de santé\npour la prise en charge à 100% des soins liés à l'AT/MP,\nsans avance de frais (tiers payant intégral).\n\nValable jusqu'à la date de guérison ou consolidation.\n\n`;
      t += `VOLET 1 — à conserver par le praticien\nVOLET 2 — à adresser à la CPAM\nVOLET 3 — à conserver par la victime\n\n`;
      t += `Date de délivrance : ${date}\nSignature employeur : _________________________________\nCachet : \n`;
    }

    if(sel==='dmp') {
      t += `${dd}\nDÉCLARATION DE MALADIE PROFESSIONNELLE\nOU DEMANDE DE RECONNAISSANCE\n${form.cerfa} — Art. L461-5 CSS\n${dd}\n\n`;
      t += `1. LA VICTIME\n${d}\n`;
      t += `N° Sécurité sociale      : ${s.numSecu}\nNom de naissance         : ${s.nom}\nNom d'usage              : ${s.nomUsage||'—'}\nPrénom(s)                : ${s.prenom}\nDate de naissance        : ${s.dn}\nSexe                     : ${s.sexe==='M'?'Masculin':'Féminin'}\nAdresse                  : ${s.adr}\nCode postal              : ${s.cp}\nCommune                  : ${s.ville}\nTéléphone                : ${s.tel}\nCourriel                 : ${s.email}\n`;
      t += `Situation actuelle       : [${f.sitActivite?'X':' '}] En activité  [${f.sitArret?'X':' '}] Arrêt travail  [${f.sitRecherche?'X':' '}] Recherche emploi  [${f.sitRetraite?'X':' '}] Retraité  [${f.sitAutre?'X':' '}] Autre\n`;
      if(f.sitAutre) t += `Préciser                 : ${f.sitAutreDetail||''}\n`;
      t += `\n2. LA MALADIE\n${d}\n`;
      t += `Désignation (selon CMI)  : ${f.designationMP||''}\n`;
      t += `Date 1ère constatation   : ${f.dateConstat||''}\n`;
      t += `Tableau MP               : [${f.tableauOui?'X':' '}] Oui n°${f.tableauNum||'___'}  [${f.tableauNon?'X':' '}] Non  [${f.tableauNSP?'X':' '}] Ne sait pas\n`;
      t += `Date du CMI              : ${f.dateCMI||''}\n`;
      t += `Nom du médecin CMI       : ${f.medecinCMI||''}\n\n`;
      t += `3. EXPOSITION AU RISQUE\n${d}\n`;
      t += `Employeur                : ${e.nom}\nSIRET                    : ${e.siret}\nAdresse                  : ${e.adresse}, ${e.cp} ${e.ville}\nActivité entreprise      : BTP\nEmploi / poste           : ${s.poste}\n`;
      t += `Début exposition         : ${f.debutExpo||''}\n`;
      t += `Fin exposition           : ${f.finExpo||''}\n`;
      t += `Nature des travaux       :\n${f.travaux||''}\n`;
      t += `Agents nocifs/produits   : ${f.agents||''}\n`;
      t += `Durée exposition         : ${f.dureeExpo||''} heures/jour, ${f.joursExpo||''} jours/semaine\n\n`;
      t += `4. INDEMNISATION\n${d}\n`;
      t += `Versement IJ sur compte  : ${f.versementCompte?'OUI':'NON'}\n`;
      if(f.versementCompte) t += `IBAN : ${f.iban||''}\nBIC : ${f.bic||''}\nTitulaire : ${s.prenom} ${s.nom}\n`;
      t += `\n5. PIÈCES JOINTES\n${d}\n`;
      t += `[${f.pjCMI?'X':' '}] Certificat médical initial (2 exemplaires)\n`;
      t += `[${f.pjAttestation?'X':' '}] Attestation de salaire\n`;
      t += `[${f.pjExamens?'X':' '}] Résultats d'examens complémentaires\n\n`;
      t += `6. DÉCLARATION\n${d}\nJe certifie l'exactitude des renseignements ci-dessus.\n\nFait à ${s.ville}, le ${date}\n\nSignature : _________________________________\n`;
    }

    if(sel==='iti') {
      t += `${dd}\nDEMANDE D'INDEMNITÉ TEMPORAIRE D'INAPTITUDE\n${form.cerfa} — Art. D433-3 CSS\n${dd}\n\n`;
      t += `VOLET 1 — SALARIÉ\n${'━'.repeat(55)}\n\n`;
      t += `1. IDENTIFICATION DU SALARIÉ\n${d}\n`;
      t += `N° Sécurité sociale      : ${s.numSecu}\nNom de naissance         : ${s.nom}\nNom d'usage              : ${s.nomUsage||'—'}\nPrénom(s)                : ${s.prenom}\nDate de naissance        : ${s.dn}\nAdresse                  : ${s.adr}\nCode postal              : ${s.cp}\nCommune                  : ${s.ville}\nTéléphone                : ${s.tel}\n\n`;
      t += `2. EMPLOYEUR ACTUEL\n${d}\n`;
      t += `Raison sociale           : ${e.nom}\nSIRET                    : ${e.siret}\nAdresse                  : ${e.adresse}, ${e.cp} ${e.ville}\nTéléphone                : ${e.tel}\n\n`;
      t += `3. ORIGINE DE L'INAPTITUDE\n${d}\n`;
      t += `Consécutive à : [${f.origineAT?'X':' '}] Accident du travail  [${f.origineTrajet?'X':' '}] Accident de trajet  [${f.origineMP?'X':' '}] Maladie professionnelle\n`;
      t += `Date de l'AT/trajet      : ${f.dateOrigine||''}\nDate constat. MP         : ${f.dateConstatMP||''}\nN° tableau MP            : ${f.numTableau||''}\n`;
      t += `Caractère pro reconnu    : [${f.reconuOui?'X':' '}] Oui  [${f.reconuNon?'X':' '}] Non  [${f.reconuEnCours?'X':' '}] En cours\nN° dossier CPAM          : ${f.numDossier||''}\n\n`;
      t += `4. AVIS D'INAPTITUDE\n${d}\n`;
      t += `Date de l'avis           : ${f.dateAvis||''}\nMédecin du travail       : ${f.medecinTravail||''}\nLien inaptitude/AT-MP    : [${f.lienOui?'X':' '}] Oui  [${f.lienNon?'X':' '}] Non\n\n`;
      t += `5. SITUATION DU SALARIÉ\n${d}\n`;
      t += `Perçoit des IJ AT/MP     : [${f.ijOui?'X':' '}] Oui  [${f.ijNon?'X':' '}] Non\n`;
      t += `Perçoit une rente AT/MP  : [${f.renteOui?'X':' '}] Oui  [${f.renteNon?'X':' '}] Non\n`;
      t += `A été reclassé           : [${f.reclasseOui?'X':' '}] Oui  [${f.reclasseNon?'X':' '}] Non\n`;
      t += `A été licencié           : [${f.licencieOui?'X':' '}] Oui  [${f.licencieNon?'X':' '}] Non\n`;
      t += `Dans délai 1 mois        : [${f.delaiOui?'X':' '}] Oui  [${f.delaiNon?'X':' '}] Non\n`;
      t += `Autre activité           : [${f.autreActivOui?'X':' '}] Oui  [${f.autreActivNon?'X':' '}] Non\n`;
      if(f.autreActivOui) t += `Nature et revenus        : ${f.autreActivDetail||''}\n`;
      t += `Alloc. chômage           : [${f.chomOui?'X':' '}] Oui  [${f.chomNon?'X':' '}] Non\n`;
      t += `Pension invalidité       : [${f.pensionOui?'X':' '}] Oui  [${f.pensionNon?'X':' '}] Non\n\n`;
      t += `6. COORDONNÉES BANCAIRES\n${d}\nIBAN : ${f.iban||''}\nBIC : ${f.bic||''}\nTitulaire : ${s.prenom} ${s.nom}\n\n`;
      t += `Je certifie sur l'honneur l'exactitude de ces renseignements.\nFait à ${s.ville}, le ${date}\nSignature du salarié : _________________________________\n\n`;
      t += `${'━'.repeat(55)}\nVOLET 2 — EMPLOYEUR\n${'━'.repeat(55)}\n\n`;
      t += `Le salarié n'a pas été reclassé : [${f.empReclasseNon?'X':' '}] Confirmé\n`;
      t += `Le salarié n'a pas été licencié : [${f.empLicencieNon?'X':' '}] Confirmé\n`;
      t += `Date de l'avis inaptitude       : ${f.dateAvis||''}\n\n`;
      t += `Fait à ${e.ville}, le ${date}\nSignature et cachet employeur : _________________________________\n`;
    }

    if(sel==='att') {
      t += `${e.nom}\n${e.representant}\n${e.fonction}\n${e.adresse}\n${e.cp} ${e.ville}\n\n\n`;
      t += `${s.civ} ${s.prenom} ${s.nom}\n        ${s.adr}\n${s.cp} ${s.ville}\n\n\n`;
      t += `À ${e.ville}, le ${date}\n\n`;
      t += `Objet : attestation de travail de ${s.civ} ${s.nom} ${s.prenom}\n\n`;
      t += `${s.civ==='Mme'?'Madame':'Monsieur'},\n\n`;
      t += `Je soussigné(e), ${e.representant}, ${e.fonction} de la société ${e.nom}, établie au ${e.adresse}, ${e.cp} ${e.ville} et immatriculée sous le numéro ${e.siret}, atteste et certifie que ${s.civ} ${s.prenom} ${s.nom}, né(e) le ${s.dn} à ${s.lieuN} et demeurant au ${s.adr}, ${s.cp} ${s.ville} est employé(e) en tant que ${s.poste} au sein de notre société.\n\n`;
      if(s.contrat==='CDI') t += `Son contrat, conclu sous la forme d'un contrat à durée indéterminée, a débuté le ${s.emb}. À ce jour, ${s.sexe==='F'?'elle':'il'} bénéficie d'une ancienneté de ${anc(s.emb)}.\n\n`;
      else if(s.dateFin) t += `Son contrat, conclu sous la forme d'un ${s.contrat}, a débuté le ${s.emb}. Son terme est fixé pour le ${s.dateFin}. À ce jour, ${s.sexe==='F'?'elle':'il'} bénéficie d'une ancienneté de ${anc(s.emb)}.\n\n`;
      else t += `Son contrat, conclu sous la forme d'un ${s.contrat}, a débuté le ${s.emb} et est censé prendre fin le jour de la réalisation de l'évènement y mettant un terme. À ce jour, ${s.sexe==='F'?'elle':'il'} bénéficie d'une ancienneté de ${anc(s.emb)}.\n\n`;
      t += `Cette attestation est délivrée pour servir et valoir ce que de droit.\n\n\n`;
      t += `${e.representant}\n${e.fonction}\n\n[Signature]\n`;
    }

    setPreview(t);
  };

  const exporterTxt = () => { if(!preview) return; const b=new Blob([preview],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${form?.cerfa||'doc'}_${s?.nom||''}_${new Date().toISOString().slice(0,10)}.txt`; a.click(); };
  const exporterPDF = () => {
    if(!s||!preview) return;
    if(sel==='dat') genererPDF_DAT(s,e,f);
    else if(sel==='fat') genererPDF_FAT(s,e,f);
    else if(sel==='dmp') genererPDF_DMP(s,e,f);
    else if(sel==='iti') genererPDF_ITI(s,e,f);
    else if(sel==='att') genererPDF_ATT(s,e);
  };

  // LISTE
  if(!sel) return (
    <div>
      <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 6px'}}>Formulaires AMELI / CPAM</h2>
      <p style={{fontSize:12,color:'#555',marginBottom:16}}>Documents officiels auto-remplis. Cliquez pour voir la démarche et remplir.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
        {FORMS.map(f=>(
          <div key={f.id} onClick={()=>{setSel(f.id);setShowInfo(true);setPreview('');setF({});}} style={{...CARD,cursor:'pointer',borderLeft:`4px solid ${f.color}`,transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:14,fontWeight:700}}>{f.titre}</span>
              <span style={{fontSize:10,fontWeight:700,color:f.color,background:`${f.color}12`,padding:'2px 8px',borderRadius:6}}>{f.cerfa}</span>
            </div>
            <div style={{fontSize:10,color:f.color,fontWeight:600}}>Délai : {f.delai} · Voir démarche →</div>
          </div>
        ))}
      </div>
    </div>
  );

  // FORMULAIRE
  return (
    <div>
      <button onClick={()=>{setSel(null);setPreview('');}} style={{...BTN_O,marginBottom:12,fontSize:11}}>← Retour</button>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{width:5,height:28,borderRadius:3,background:form.color}}/>
        <div style={{flex:1}}><h3 style={{fontSize:16,fontWeight:800,margin:0}}>{form.titre}</h3><span style={{fontSize:11,color:'#555'}}>{form.cerfa} · Délai : {form.delai}</span></div>
        <button onClick={()=>setShowInfo(true)} style={showInfo?BTN:BTN_O}>Démarche</button>
        <button onClick={()=>setShowInfo(false)} style={!showInfo?BTN:BTN_O}>Formulaire</button>
      </div>

      {showInfo && <div style={CARD}>
        <h3 style={{fontSize:15,fontWeight:700,margin:'0 0 10px'}}>Démarche complète</h3>
        {sel==='dat' && <div style={{fontSize:12,lineHeight:1.8,color:'#333'}}>L'employeur doit déclarer tout accident du travail dans les <strong>48 heures</strong> (dimanches/fériés non compris) à la CPAM dont relève la victime.<br/><br/><strong>Comment :</strong> En ligne sur net-entreprises.fr ou par courrier recommandé AR.<br/><br/><strong>Pièces :</strong><br/>• Ce formulaire rempli et signé<br/>• Le certificat médical initial (CMI) du médecin<br/>• La feuille d'accident S6201 remise au salarié<br/><br/><strong>Sanction :</strong> Amende 750€ si non-déclaration (Art. R471-3 CSS).<br/><br/>Le salarié a 2 ans pour déclarer lui-même si l'employeur ne le fait pas.</div>}
        {sel==='fat' && <div style={{fontSize:12,lineHeight:1.8,color:'#333'}}>L'employeur remet cette feuille au salarié <strong>le jour même</strong> de l'accident.<br/><br/>Elle permet la prise en charge à <strong>100% des soins</strong> liés à l'AT/MP, sans avance de frais.<br/><br/>Le salarié la présente à chaque professionnel de santé.<br/>Valable jusqu'à guérison ou consolidation.<br/>En cas de rechute, une nouvelle feuille est nécessaire.</div>}
        {sel==='dmp' && <div style={{fontSize:12,lineHeight:1.8,color:'#333'}}>La déclaration peut être faite par le salarié ou ses ayants droit. Le <strong>Cerfa 16130</strong> remplace l'ancien S6100.<br/><br/><strong>Conditions :</strong><br/>• Maladie dans un tableau de MP (annexe II CSS)<br/>• OU reconnaissance par le CRRMP si hors tableau<br/><br/><strong>Pièces :</strong><br/>• CMI (2 exemplaires)<br/>• Attestation de salaire (DSN ou formulaire)<br/>• Justificatifs d'exposition<br/><br/><strong>Délai CPAM :</strong> 120 jours (+120 si CRRMP).<br/><strong>Prescription :</strong> 2 ans.</div>}
        {sel==='iti' && <div style={{fontSize:12,lineHeight:1.8,color:'#333'}}>L'ITI est versée au salarié déclaré <strong>inapte par le médecin du travail</strong> suite à un AT/MP.<br/><br/><strong>Conditions :</strong><br/>• Inaptitude liée à un AT ou MP<br/>• Pas d'IJ en cours, pas de rupture du contrat<br/><br/><strong>Montant :</strong> Égal aux dernières IJ AT/MP.<br/><strong>Durée :</strong> 1 mois max après l'avis d'inaptitude.<br/><br/><strong>Formulaire :</strong> Volet 1 (salarié) + Volet 2 (employeur) + partie médecin du travail.</div>}
        {sel==='att' && <div style={{fontSize:12,lineHeight:1.8,color:'#333'}}>Attestation d'emploi établie par l'employeur sur demande du salarié.<br/><br/><strong>Utilisations :</strong> Logement, prêt bancaire, démarches CAF/préfecture.<br/><br/><strong>Pas de Cerfa</strong> — document libre avec mentions obligatoires.<br/>Ce document est <strong>100% automatique</strong> depuis le profil du salarié.</div>}
        <div style={{display:'flex',gap:8,marginTop:16}}>
          {form.lien && <a href={form.lien} target="_blank" rel="noopener noreferrer" style={{...BTN,background:'#2563EB',textDecoration:'none',fontSize:12}}>service-public.fr →</a>}
          {form.pdf && <a href={form.pdf} target="_blank" rel="noopener noreferrer" style={{...BTN,background:'#D97706',textDecoration:'none',fontSize:12}}>Cerfa officiel PDF →</a>}
          <button onClick={()=>setShowInfo(false)} style={{...BTN,background:form.color}}>Remplir →</button>
        </div>
      </div>}

      {!showInfo && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{...CARD,maxHeight:'75vh',overflowY:'auto'}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Salarié <span style={REQ}>*</span></div>
          <select value={sid} onChange={e=>{setSid(e.target.value);setPreview('');}} style={{...INP,marginBottom:10}}>
            <option value="">— Choisir —</option>
            {SALARIES.map(x=><option key={x.id} value={x.id}>{x.civ} {x.prenom} {x.nom} — {x.poste}</option>)}
          </select>
          {s && <>
            <AutoBlock s={s} e={e}/>

            {/* ═══ CHAMPS SPÉCIFIQUES PAR FORMULAIRE ═══ */}

            {sel==='dat' && <>
              <div style={SEC}>Accident</div>
              <div style={G('1fr 1fr 1fr')}><Inp label="Date accident" req val={f.dateAcc} set={v=>u('dateAcc',v)} type="date"/><Inp label="Heure" req val={f.heureAcc} set={v=>u('heureAcc',v)} type="time"/><Inp label="Dernier examen médical" val={f.examMedical} set={v=>u('examMedical',v)} type="date"/></div>
              <div style={G('1fr 1fr')}><Inp label="Horaire travail : de" val={f.horaireDebut} set={v=>u('horaireDebut',v)} type="time"/><Inp label="à" val={f.horaireFin} set={v=>u('horaireFin',v)} type="time"/></div>
              <div style={G('1fr 1fr')}><Inp label="Date info employeur" val={f.dateInfo} set={v=>u('dateInfo',v)} type="date"/><Inp label="Heure info" val={f.heureInfo} set={v=>u('heureInfo',v)} type="time"/></div>
              <div style={SUBSEC}>Lieu de l'accident</div>
              <Chk label="Lieu de travail habituel" val={f.lieuHabituel} set={v=>u('lieuHabituel',v)}/>
              <Chk label="Lieu de travail occasionnel" val={f.lieuOccasionnel} set={v=>u('lieuOccasionnel',v)}/>
              <Chk label="Déplacement pour l'employeur" val={f.lieuDeplacement} set={v=>u('lieuDeplacement',v)}/>
              <Chk label="Domicile du salarié" val={f.lieuDomicile} set={v=>u('lieuDomicile',v)}/>
              <Chk label="Trajet aller domicile → travail" val={f.lieuTrajetAller} set={v=>u('lieuTrajetAller',v)}/>
              <Chk label="Trajet retour travail → domicile" val={f.lieuTrajetRetour} set={v=>u('lieuTrajetRetour',v)}/>
              <Chk label="Trajet travail → restauration" val={f.lieuTrajetRepas} set={v=>u('lieuTrajetRepas',v)}/>
              <div style={{marginTop:8}}><Inp label="Adresse précise du lieu" req val={f.adresseLieu} set={v=>u('adresseLieu',v)}/></div>
              <Inp label="Transport vers (hôpital, domicile...)" val={f.transportVers} set={v=>u('transportVers',v)}/>
              <div style={SEC}>Circonstances</div>
              <Txt label="Activité de la victime au moment de l'accident" req val={f.activite} set={v=>u('activite',v)}/>
              <Txt label="Circonstances détaillées (objet, substance, mouvement)" req val={f.circonstances} set={v=>u('circonstances',v)} rows={4}/>
              <div style={G('1fr 1fr')}><Inp label="Siège des lésions" req val={f.siege} set={v=>u('siege',v)} ph="Main gauche, genou..."/><Inp label="Nature des lésions" req val={f.nature} set={v=>u('nature',v)} ph="Coupure, contusion..."/></div>
              <div style={SEC}>Tiers & Témoins</div>
              <Chk label="Accident causé par un tiers" val={f.tiers} set={v=>u('tiers',v)}/>
              {f.tiers && <Inp label="Nom et adresse du tiers" val={f.tiersNom} set={v=>u('tiersNom',v)}/>}
              <Chk label="Témoin(s) présent(s)" val={f.temoinOui} set={v=>u('temoinOui',v)}/>
              {f.temoinOui && <><div style={G('1fr 1fr')}><Inp label="Témoin 1 — Nom" val={f.temoin1Nom} set={v=>u('temoin1Nom',v)}/><Inp label="Adresse" val={f.temoin1Adr} set={v=>u('temoin1Adr',v)}/></div><div style={G('1fr 1fr')}><Inp label="Témoin 2 — Nom" val={f.temoin2Nom} set={v=>u('temoin2Nom',v)}/><Inp label="Adresse" val={f.temoin2Adr} set={v=>u('temoin2Adr',v)}/></div></>}
              <div style={SEC}>Arrêt de travail</div>
              <Chk label="La victime a cessé le travail le jour même" val={f.cessation} set={v=>u('cessation',v)}/>
              <div style={G('1fr 1fr')}><Inp label="Dernier jour de travail" val={f.dernierJour} set={v=>u('dernierJour',v)} type="date"/><Inp label="Date de reprise (si connue)" val={f.dateReprise} set={v=>u('dateReprise',v)} type="date"/></div>
              <Chk label="Journée intégralement payée" val={f.journeePayee} set={v=>u('journeePayee',v)}/>
              <div style={SEC}>Réserves</div>
              <Chk label="L'employeur émet des réserves motivées" val={f.reserves} set={v=>u('reserves',v)}/>
              {f.reserves && <Txt label="Motifs des réserves" val={f.reservesMotif} set={v=>u('reservesMotif',v)}/>}
            </>}

            {sel==='fat' && <>
              <div style={SEC}>Nature de l'événement</div>
              <Chk label="Accident du travail" val={f.typeAT} set={v=>u('typeAT',v)}/>
              <Chk label="Accident de trajet" val={f.typeTrajet} set={v=>u('typeTrajet',v)}/>
              <Chk label="Maladie professionnelle" val={f.typeMP} set={v=>u('typeMP',v)}/>
              <div style={{marginTop:8}}><Inp label="Date de l'accident ou 1ère constatation" req val={f.dateEvt} set={v=>u('dateEvt',v)} type="date"/></div>
            </>}

            {sel==='dmp' && <>
              <div style={SEC}>Situation actuelle</div>
              <Chk label="En activité" val={f.sitActivite} set={v=>u('sitActivite',v)}/>
              <Chk label="En arrêt de travail" val={f.sitArret} set={v=>u('sitArret',v)}/>
              <Chk label="En recherche d'emploi" val={f.sitRecherche} set={v=>u('sitRecherche',v)}/>
              <Chk label="Retraité" val={f.sitRetraite} set={v=>u('sitRetraite',v)}/>
              <Chk label="Autre" val={f.sitAutre} set={v=>u('sitAutre',v)}/>
              {f.sitAutre && <Inp label="Préciser" val={f.sitAutreDetail} set={v=>u('sitAutreDetail',v)}/>}
              <div style={SEC}>La maladie</div>
              <Txt label="Désignation de la maladie (selon le CMI)" req val={f.designationMP} set={v=>u('designationMP',v)} rows={2}/>
              <div style={G('1fr 1fr')}><Inp label="Date 1ère constatation" req val={f.dateConstat} set={v=>u('dateConstat',v)} type="date"/><Inp label="Date du CMI" req val={f.dateCMI} set={v=>u('dateCMI',v)} type="date"/></div>
              <Inp label="Nom du médecin CMI" req val={f.medecinCMI} set={v=>u('medecinCMI',v)}/>
              <div style={{marginTop:6}}>
                <Chk label="Tableau de MP : Oui" val={f.tableauOui} set={v=>u('tableauOui',v)}/>
                {f.tableauOui && <Inp label="N° du tableau" val={f.tableauNum} set={v=>u('tableauNum',v)} ph="57, 30, 42..."/>}
                <Chk label="Non" val={f.tableauNon} set={v=>u('tableauNon',v)}/>
                <Chk label="Ne sait pas" val={f.tableauNSP} set={v=>u('tableauNSP',v)}/>
              </div>
              <div style={SEC}>Exposition au risque</div>
              <div style={G('1fr 1fr')}><Inp label="Début exposition" req val={f.debutExpo} set={v=>u('debutExpo',v)} type="date"/><Inp label="Fin exposition" val={f.finExpo} set={v=>u('finExpo',v)} type="date"/></div>
              <Txt label="Nature des travaux effectués" req val={f.travaux} set={v=>u('travaux',v)} rows={2}/>
              <Inp label="Agents nocifs / produits" req val={f.agents} set={v=>u('agents',v)} ph="Amiante, silice, bruit..."/>
              <div style={G('1fr 1fr')}><Inp label="Heures/jour d'exposition" val={f.dureeExpo} set={v=>u('dureeExpo',v)} ph="6"/><Inp label="Jours/semaine" val={f.joursExpo} set={v=>u('joursExpo',v)} ph="5"/></div>
              <div style={SEC}>Indemnisation</div>
              <Chk label="Versement IJ sur compte bancaire" val={f.versementCompte} set={v=>u('versementCompte',v)}/>
              {f.versementCompte && <div style={G('2fr 1fr')}><Inp label="IBAN" val={f.iban} set={v=>u('iban',v)}/><Inp label="BIC" val={f.bic} set={v=>u('bic',v)}/></div>}
              <div style={SEC}>Pièces jointes</div>
              <Chk label="Certificat médical initial (2 ex.)" val={f.pjCMI} set={v=>u('pjCMI',v)}/>
              <Chk label="Attestation de salaire" val={f.pjAttestation} set={v=>u('pjAttestation',v)}/>
              <Chk label="Résultats d'examens" val={f.pjExamens} set={v=>u('pjExamens',v)}/>
            </>}

            {sel==='iti' && <>
              <div style={SEC}>Origine de l'inaptitude</div>
              <Chk label="Accident du travail" val={f.origineAT} set={v=>u('origineAT',v)}/>
              <Chk label="Accident de trajet" val={f.origineTrajet} set={v=>u('origineTrajet',v)}/>
              <Chk label="Maladie professionnelle" val={f.origineMP} set={v=>u('origineMP',v)}/>
              <div style={G('1fr 1fr')}><Inp label="Date AT / trajet" val={f.dateOrigine} set={v=>u('dateOrigine',v)} type="date"/><Inp label="Date constatation MP" val={f.dateConstatMP} set={v=>u('dateConstatMP',v)} type="date"/></div>
              <div style={G('1fr 1fr')}><Inp label="N° tableau MP" val={f.numTableau} set={v=>u('numTableau',v)}/><Inp label="N° dossier CPAM" val={f.numDossier} set={v=>u('numDossier',v)}/></div>
              <div style={{marginTop:4}}>
                <span style={{fontSize:11,fontWeight:600,color:'#555'}}>Caractère professionnel reconnu :</span>
                <div style={{display:'flex',gap:12,marginTop:4}}>
                  <Chk label="Oui" val={f.reconuOui} set={v=>u('reconuOui',v)}/>
                  <Chk label="Non" val={f.reconuNon} set={v=>u('reconuNon',v)}/>
                  <Chk label="En cours" val={f.reconuEnCours} set={v=>u('reconuEnCours',v)}/>
                </div>
              </div>
              <div style={SEC}>Avis d'inaptitude</div>
              <div style={G('1fr 1fr')}><Inp label="Date de l'avis" req val={f.dateAvis} set={v=>u('dateAvis',v)} type="date"/><Inp label="Médecin du travail" req val={f.medecinTravail} set={v=>u('medecinTravail',v)}/></div>
              <div style={{display:'flex',gap:12,marginTop:4}}>
                <span style={{fontSize:11,color:'#555'}}>Lien inaptitude / AT-MP mentionné :</span>
                <Chk label="Oui" val={f.lienOui} set={v=>u('lienOui',v)}/>
                <Chk label="Non" val={f.lienNon} set={v=>u('lienNon',v)}/>
              </div>
              <div style={SEC}>Situation du salarié</div>
              <div style={G('1fr 1fr')}>
                <div><span style={{fontSize:11,color:'#555'}}>IJ AT/MP :</span><div style={{display:'flex',gap:8}}><Chk label="Oui" val={f.ijOui} set={v=>u('ijOui',v)}/><Chk label="Non" val={f.ijNon} set={v=>u('ijNon',v)}/></div></div>
                <div><span style={{fontSize:11,color:'#555'}}>Rente AT/MP :</span><div style={{display:'flex',gap:8}}><Chk label="Oui" val={f.renteOui} set={v=>u('renteOui',v)}/><Chk label="Non" val={f.renteNon} set={v=>u('renteNon',v)}/></div></div>
              </div>
              <div style={G('1fr 1fr')}>
                <div><span style={{fontSize:11,color:'#555'}}>Reclassé :</span><div style={{display:'flex',gap:8}}><Chk label="Oui" val={f.reclasseOui} set={v=>u('reclasseOui',v)}/><Chk label="Non" val={f.reclasseNon} set={v=>u('reclasseNon',v)}/></div></div>
                <div><span style={{fontSize:11,color:'#555'}}>Licencié :</span><div style={{display:'flex',gap:8}}><Chk label="Oui" val={f.licencieOui} set={v=>u('licencieOui',v)}/><Chk label="Non" val={f.licencieNon} set={v=>u('licencieNon',v)}/></div></div>
              </div>
              <div style={G('1fr 1fr')}>
                <div><span style={{fontSize:11,color:'#555'}}>Délai 1 mois :</span><div style={{display:'flex',gap:8}}><Chk label="Oui" val={f.delaiOui} set={v=>u('delaiOui',v)}/><Chk label="Non" val={f.delaiNon} set={v=>u('delaiNon',v)}/></div></div>
                <div><span style={{fontSize:11,color:'#555'}}>Chômage :</span><div style={{display:'flex',gap:8}}><Chk label="Oui" val={f.chomOui} set={v=>u('chomOui',v)}/><Chk label="Non" val={f.chomNon} set={v=>u('chomNon',v)}/></div></div>
              </div>
              <Chk label="Autre activité professionnelle" val={f.autreActivOui} set={v=>u('autreActivOui',v)}/>
              {f.autreActivOui && <Inp label="Nature et revenus" val={f.autreActivDetail} set={v=>u('autreActivDetail',v)}/>}
              <Chk label="Pension d'invalidité" val={f.pensionOui} set={v=>u('pensionOui',v)}/>
              <div style={SEC}>Coordonnées bancaires</div>
              <div style={G('2fr 1fr')}><Inp label="IBAN" val={f.iban} set={v=>u('iban',v)}/><Inp label="BIC" val={f.bic} set={v=>u('bic',v)}/></div>
              <div style={SEC}>Volet employeur</div>
              <Chk label="Confirme : salarié non reclassé" val={f.empReclasseNon} set={v=>u('empReclasseNon',v)}/>
              <Chk label="Confirme : salarié non licencié" val={f.empLicencieNon} set={v=>u('empLicencieNon',v)}/>
            </>}

            {sel==='att' && <div style={{background:'#EFF6FF',border:'1px solid #2563EB20',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#2563EB'}}>
              Ce document est <strong>100% automatique</strong>. Cliquez directement sur "Générer".
            </div>}

            <button onClick={generer} style={{...BTN,width:'100%',padding:12,marginTop:12,background:form.color}}>Générer le document</button>
          </>}
        </div>

        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Aperçu</div>
          {preview ? <>
            <div style={{background:'#FAFAF8',border:'1px solid #E8E6E1',borderRadius:8,padding:14,maxHeight:'65vh',overflowY:'auto',fontFamily:'monospace',fontSize:10,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{preview}</div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <button onClick={exporterPDF} style={{...BTN,flex:1,background:'#DC2626'}}>PDF</button>
              <button onClick={exporterTxt} style={{...BTN_O,flex:1}}>TXT</button>
              <button onClick={()=>window.print()} style={{...BTN_O,flex:1}}>Imprimer</button>
              <button onClick={()=>alert('Envoi par email simulé — en production, envoie via Resend/Nodemailer')} style={{...BTN,flex:1,background:'#2563EB'}}>Envoyer par email</button>
            </div>
          </> : <div style={{background:'#F8F7F4',border:'1px solid #E8E6E1',borderRadius:8,padding:40,textAlign:'center',color:'#555',fontSize:12}}>{!s?'Sélectionnez un salarié':'Remplissez les champs puis "Générer"'}</div>}
        </div>
      </div>}
    </div>
  );
}
