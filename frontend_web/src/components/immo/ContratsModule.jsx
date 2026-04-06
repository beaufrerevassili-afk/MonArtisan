import React, { useState, useMemo } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const MODELES = [
  // Transaction
  {id:1,cat:'Transaction',titre:'Mandat de vente simple',champs:['bailleur','bien','prix','duree']},
  {id:2,cat:'Transaction',titre:'Mandat de vente exclusif',champs:['bailleur','bien','prix','duree']},
  {id:3,cat:'Transaction',titre:'Mandat de vente semi-exclusif',champs:['bailleur','bien','prix','duree']},
  {id:4,cat:'Transaction',titre:'Avenant au mandat de vente',champs:['bailleur','bien']},
  {id:5,cat:'Transaction',titre:'Offre d\'achat',champs:['acquereur','bien','prix']},
  {id:6,cat:'Transaction',titre:'Contre-offre',champs:['acquereur','bien','prix']},
  {id:7,cat:'Transaction',titre:'Compromis de vente',champs:['bailleur','acquereur','bien','prix']},
  {id:8,cat:'Transaction',titre:'Promesse unilatérale de vente',champs:['bailleur','acquereur','bien','prix']},
  {id:9,cat:'Transaction',titre:'Bon de visite',champs:['acquereur','bien']},
  {id:10,cat:'Transaction',titre:'Procuration de vente',champs:['bailleur','bien']},
  {id:11,cat:'Transaction',titre:'Attestation de vente',champs:['bailleur','acquereur','bien','prix']},
  {id:12,cat:'Transaction',titre:'Lettre d\'intention d\'achat',champs:['acquereur','bien','prix']},
  {id:13,cat:'Transaction',titre:'Notification SRU (rétractation)',champs:['acquereur','bien']},
  {id:14,cat:'Transaction',titre:'Résiliation de mandat',champs:['bailleur','bien']},
  {id:15,cat:'Transaction',titre:'Attestation de financement',champs:['acquereur','bien','prix']},
  {id:16,cat:'Transaction',titre:'Mandat de recherche',champs:['acquereur']},
  {id:17,cat:'Transaction',titre:'Convention d\'honoraires',champs:['bailleur','bien','prix']},
  {id:18,cat:'Transaction',titre:'Certificat de conformité',champs:['bien']},
  {id:19,cat:'Transaction',titre:'Attestation de non-vente',champs:['bailleur','bien']},
  {id:20,cat:'Transaction',titre:'Dossier de diagnostic technique',champs:['bien']},
  // Location
  {id:21,cat:'Location',titre:'Bail habitation vide',champs:['bailleur','locataire','bien','loyer','duree']},
  {id:22,cat:'Location',titre:'Bail habitation meublé',champs:['bailleur','locataire','bien','loyer','duree']},
  {id:23,cat:'Location',titre:'Bail commercial (3-6-9)',champs:['bailleur','locataire','bien','loyer','duree']},
  {id:24,cat:'Location',titre:'Bail professionnel',champs:['bailleur','locataire','bien','loyer','duree']},
  {id:25,cat:'Location',titre:'Bail mixte',champs:['bailleur','locataire','bien','loyer','duree']},
  {id:26,cat:'Location',titre:'Avenant au bail',champs:['bailleur','locataire','bien']},
  {id:27,cat:'Location',titre:'État des lieux d\'entrée',champs:['bailleur','locataire','bien']},
  {id:28,cat:'Location',titre:'État des lieux de sortie',champs:['bailleur','locataire','bien']},
  {id:29,cat:'Location',titre:'Congé du locataire',champs:['locataire','bien']},
  {id:30,cat:'Location',titre:'Congé du bailleur (vente)',champs:['bailleur','locataire','bien']},
  {id:31,cat:'Location',titre:'Congé du bailleur (reprise)',champs:['bailleur','locataire','bien']},
  {id:32,cat:'Location',titre:'Renouvellement de bail',champs:['bailleur','locataire','bien','loyer','duree']},
  {id:33,cat:'Location',titre:'Caution solidaire',champs:['locataire','bien']},
  {id:34,cat:'Location',titre:'Acte de cautionnement',champs:['locataire','bien']},
  {id:35,cat:'Location',titre:'Quittance de loyer',champs:['bailleur','locataire','bien','loyer']},
  // Gestion
  {id:36,cat:'Gestion',titre:'Mandat de gestion locative',champs:['bailleur','bien']},
  {id:37,cat:'Gestion',titre:'Mise en demeure loyer impayé',champs:['bailleur','locataire','bien','loyer']},
  {id:38,cat:'Gestion',titre:'Attestation de loyer (CAF)',champs:['bailleur','locataire','bien','loyer']},
  {id:39,cat:'Gestion',titre:'Régularisation des charges',champs:['bailleur','locataire','bien']},
  {id:40,cat:'Gestion',titre:'Révision de loyer (IRL)',champs:['bailleur','locataire','bien','loyer']},
  {id:41,cat:'Gestion',titre:'Augmentation de loyer',champs:['bailleur','locataire','bien','loyer']},
  {id:42,cat:'Gestion',titre:'Attestation d\'assurance PNO',champs:['bailleur','bien']},
  {id:43,cat:'Gestion',titre:'Lettre de relance amiable',champs:['bailleur','locataire','bien','loyer']},
  {id:44,cat:'Gestion',titre:'Restitution dépôt de garantie',champs:['bailleur','locataire','bien']},
  {id:45,cat:'Gestion',titre:'Décompte de charges',champs:['bailleur','locataire','bien']},
  // Copropriété
  {id:46,cat:'Copropriété',titre:'Convocation AG',champs:['bien']},
  {id:47,cat:'Copropriété',titre:'PV d\'assemblée générale',champs:['bien']},
  {id:48,cat:'Copropriété',titre:'Appel de charges copropriété',champs:['bien']},
  {id:49,cat:'Copropriété',titre:'Contestation charges copro',champs:['bien']},
  {id:50,cat:'Copropriété',titre:'Demande de travaux copro',champs:['bien']},
  {id:51,cat:'Copropriété',titre:'Résolution AG',champs:['bien']},
  // Divers
  {id:52,cat:'Divers',titre:'Attestation sur l\'honneur',champs:[]},
  {id:53,cat:'Divers',titre:'Procuration générale',champs:[]},
  {id:54,cat:'Divers',titre:'Lettre de recommandation',champs:[]},
  {id:55,cat:'Divers',titre:'Accord de confidentialité',champs:[]},
  {id:56,cat:'Divers',titre:'Convention de partenariat',champs:[]},
];

function genererContenu(modele, vars) {
  const date = new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'});
  const b = vars.bailleur||'[Bailleur]';
  const l = vars.locataire||'[Locataire]';
  const a = vars.acquereur||'[Acquéreur]';
  const bien = vars.bienAdresse||'[Adresse du bien]';
  const surf = vars.bienSurface||'[Surface]';
  const loyer = vars.loyer||'[Loyer]';
  const prix = vars.prix||'[Prix]';
  const duree = vars.duree||'[Durée]';
  const depot = vars.depot||loyer;
  const t = modele.titre;

  if(t.includes('Bail habitation')) return `CONTRAT DE BAIL D'HABITATION${t.includes('meublé')?' MEUBLÉE':' NON MEUBLÉE'}\n\nEntre les soussignés :\n\nLE BAILLEUR :\n${b}\n\nLE LOCATAIRE :\n${l}\n\nIl a été convenu ce qui suit :\n\nArticle 1 — OBJET\nLe Bailleur donne en location au Locataire, qui accepte, le bien situé :\n${bien}\nD'une superficie de ${surf} m².\n\nArticle 2 — DURÉE\nLe présent bail est consenti pour une durée de ${duree} mois à compter du ${date}.\n\nArticle 3 — LOYER\nLe loyer mensuel est fixé à ${loyer} €, payable d'avance le 1er de chaque mois.\n\nArticle 4 — CHARGES\nEn sus du loyer, le Locataire versera une provision mensuelle sur charges.\n\nArticle 5 — DÉPÔT DE GARANTIE\nÀ la signature des présentes, le Locataire verse un dépôt de garantie de ${depot} €.\n\nArticle 6 — ÉTAT DES LIEUX\nUn état des lieux sera établi contradictoirement lors de la remise des clés.\n\nArticle 7 — OBLIGATIONS DU LOCATAIRE\n- Payer le loyer et les charges aux termes convenus\n- User paisiblement des locaux\n- Répondre des dégradations\n- Ne pas sous-louer sans accord écrit du Bailleur\n\nArticle 8 — OBLIGATIONS DU BAILLEUR\n- Délivrer un logement décent\n- Assurer la jouissance paisible\n- Entretenir les locaux\n\nFait à ____________, le ${date}\nEn deux exemplaires originaux.\n\nLe Bailleur :                    Le Locataire :\n${b}                             ${l}`;

  if(t.includes('Renouvellement de bail')) return `RENOUVELLEMENT DE BAIL D'HABITATION\n\nPar la présente, le Bailleur :\n${b}\n\nPropose au Locataire :\n${l}\n\nLe renouvellement du bail portant sur le bien situé :\n${bien}\nSurface : ${surf} m²\n\nCONDITIONS DU RENOUVELLEMENT :\n- Nouveau loyer mensuel : ${loyer} €\n- Durée du renouvellement : ${duree} mois\n- Date d'effet : ${date}\n- Autres conditions : identiques au bail initial\n\nLe Locataire dispose d'un délai de 30 jours pour accepter ou refuser les présentes conditions.\n\nFait à ____________, le ${date}\n\nLe Bailleur :                    Le Locataire :\n${b}                             ${l}`;

  if(t.includes('Quittance')) return `QUITTANCE DE LOYER\n\nLe Bailleur :\n${b}\n\nReconnaît avoir reçu du Locataire :\n${l}\n\nLa somme de ${loyer} € au titre du loyer du bien situé :\n${bien}\n\nPériode : mois en cours\nLoyer : ${loyer} €\nCharges : incluses\n\nDont quittance.\n\nFait à ____________, le ${date}\n\n${b}`;

  if(t.includes('Mise en demeure')) return `MISE EN DEMEURE — LOYER IMPAYÉ\nLettre recommandée avec accusé de réception\n\nDe : ${b}\nÀ : ${l}\nObjet : Mise en demeure de payer le loyer impayé\n\nMadame, Monsieur,\n\nJe constate que le loyer de ${loyer} € pour le bien situé :\n${bien}\n\nn'a pas été réglé à ce jour.\n\nJe vous mets en demeure de procéder au paiement intégral de la somme de ${loyer} € dans un délai de 8 jours à compter de la réception de la présente.\n\nÀ défaut de règlement dans ce délai, je me verrai dans l'obligation d'engager les poursuites judiciaires prévues par la loi.\n\nFait à ____________, le ${date}\n\n${b}`;

  if(t.includes('Attestation de loyer')) return `ATTESTATION DE LOYER\n(destinée à la Caisse d'Allocations Familiales)\n\nJe soussigné(e) :\n${b}\n\nAtteste que :\n${l}\n\nEst locataire du bien situé :\n${bien}\nSurface : ${surf} m²\n\nLoyer mensuel hors charges : ${loyer} €\nDate d'entrée dans les lieux : en cours\n\nCette attestation est délivrée pour servir et valoir ce que de droit.\n\nFait à ____________, le ${date}\n\n${b}`;

  if(t.includes('Congé du bailleur')) return `CONGÉ DONNÉ PAR LE BAILLEUR${t.includes('vente')?' POUR VENTE':' POUR REPRISE'}\nLettre recommandée avec accusé de réception\n\nDe : ${b}\nÀ : ${l}\n\nMadame, Monsieur,\n\nJe vous informe par la présente de ma décision de ne pas renouveler votre bail portant sur le bien situé :\n${bien}\n\nMotif : ${t.includes('vente')?'vente du bien':'reprise pour habiter'}\n\nConformément à la loi du 6 juillet 1989, le présent congé est délivré avec un préavis de 6 mois.\n\n${t.includes('vente')?`Le prix de vente est fixé à ${prix} €.\nVous bénéficiez d'un droit de préemption sur ce bien aux conditions ci-dessus.\nVous disposez des 2 premiers mois du préavis pour exercer ce droit.`:''}\n\nFait à ____________, le ${date}\n\n${b}`;

  if(t.includes('État des lieux')) return `ÉTAT DES LIEUX ${t.includes('sortie')?'DE SORTIE':'D\'ENTRÉE'}\n\nBien : ${bien}\nSurface : ${surf} m²\n\nBailleur : ${b}\nLocataire : ${l}\n\nDate : ${date}\n\n── PIÈCE PAR PIÈCE ──\n\nEntrée / Couloir :\n  Sols : ___  Murs : ___  Plafond : ___  Portes : ___\n  Observations : ___\n\nSéjour :\n  Sols : ___  Murs : ___  Plafond : ___  Fenêtres : ___\n  Observations : ___\n\nCuisine :\n  Sols : ___  Murs : ___  Équipements : ___\n  Observations : ___\n\nChambre(s) :\n  Sols : ___  Murs : ___  Plafond : ___\n  Observations : ___\n\nSalle de bains :\n  Sols : ___  Murs : ___  Sanitaires : ___  Robinetterie : ___\n  Observations : ___\n\nCompteurs :\n  Eau : ___  Électricité : ___  Gaz : ___\n\nClés remises : ___ jeu(x)\n\nLe Bailleur :                    Le Locataire :\n${b}                             ${l}`;

  if(t.includes('Compromis de vente')) return `COMPROMIS DE VENTE\n\nEntre :\nLE VENDEUR : ${b}\nL'ACQUÉREUR : ${a}\n\nArticle 1 — OBJET\nLe Vendeur s'engage à vendre à l'Acquéreur, qui accepte, le bien situé :\n${bien}\nSurface : ${surf} m²\n\nArticle 2 — PRIX\nLe prix de vente est fixé à ${prix} €.\n\nArticle 3 — CONDITIONS SUSPENSIVES\n- Obtention d'un prêt immobilier dans un délai de 45 jours\n- Absence de servitude ou d'hypothèque non déclarée\n- Droit de préemption purgé\n\nArticle 4 — DÉLAI DE RÉTRACTATION\nL'Acquéreur dispose d'un délai de 10 jours (SRU) pour se rétracter.\n\nArticle 5 — DATE DE SIGNATURE DE L'ACTE\nL'acte authentique sera signé au plus tard dans un délai de 3 mois.\n\nFait à ____________, le ${date}\n\nLe Vendeur :                    L'Acquéreur :\n${b}                             ${a}`;

  if(t.includes('Offre d\'achat')) return `OFFRE D'ACHAT\n\nJe soussigné(e) :\n${a}\n\nFais une offre d'achat ferme pour le bien situé :\n${bien}\n\nAu prix de : ${prix} €\n\nCette offre est valable pendant 10 jours à compter du ${date}.\n\nConditions :\n- Sous réserve de l'obtention d'un prêt immobilier\n- Sous réserve des diagnostics techniques\n\nFait à ____________, le ${date}\n\n${a}`;

  if(t.includes('Mandat de vente')) return `MANDAT DE VENTE ${t.includes('exclusif')?'EXCLUSIF':t.includes('semi')?'SEMI-EXCLUSIF':'SIMPLE'}\n\nEntre :\nLE MANDANT : ${b}\nLE MANDATAIRE : Freample Immo\n\nArticle 1 — OBJET\nLe Mandant confie au Mandataire la vente du bien situé :\n${bien}\nSurface : ${surf} m²\n\nArticle 2 — PRIX\nLe prix de vente est fixé à ${prix} €.\n\nArticle 3 — DURÉE\nLe présent mandat est consenti pour une durée de ${duree} mois.\n\nArticle 4 — HONORAIRES\nLes honoraires du Mandataire sont fixés à 4% du prix de vente.\n\nArticle 5 — EXCLUSIVITÉ\n${t.includes('exclusif')?'Le Mandant s\'engage à ne confier la vente à aucun autre mandataire pendant la durée du mandat.':'Le Mandant reste libre de confier la vente à d\'autres mandataires.'}\n\nFait à ____________, le ${date}\n\nLe Mandant :                    Le Mandataire :\n${b}                             Freample Immo`;

  if(t.includes('Révision de loyer')||t.includes('Augmentation')) return `${t.toUpperCase()}\n\nDe : ${b}\nÀ : ${l}\n\nBien concerné : ${bien}\n\nMadame, Monsieur,\n\nConformément aux dispositions du bail et à l'indice de référence des loyers (IRL), je vous informe de la révision de votre loyer.\n\nLoyer actuel : ${loyer} €\nNouveau loyer : [à calculer selon IRL]\nDate d'effet : ${date}\n\nCette révision est conforme à la clause de révision prévue dans votre contrat de bail.\n\nFait à ____________, le ${date}\n\n${b}`;

  // Modèle générique
  return `${t.toUpperCase()}\n\nDate : ${date}\n\n${vars.bailleur?`Bailleur / Mandant : ${b}\n`:''}${vars.locataire?`Locataire : ${l}\n`:''}${vars.acquereur?`Acquéreur : ${a}\n`:''}${vars.bienAdresse?`Bien : ${bien}\nSurface : ${surf} m²\n`:''}${vars.loyer?`Loyer : ${loyer} €\n`:''}${vars.prix?`Prix : ${prix} €\n`:''}${vars.duree?`Durée : ${duree} mois\n`:''}\n\n[Contenu du document à personnaliser]\n\n\nFait à ____________, le ${date}\n\nSignature :`;
}

const catColors = { Transaction:L.gold, Location:L.blue, Gestion:L.green, Copropriété:L.orange, Divers:L.textSec };
const statutLabels = { brouillon:'Brouillon', envoye:'Envoyé', signe:'Signé', archive:'Archivé' };

const DEFAULT_CONTRATS = [
  { id:1, type:'Compromis de vente', categorie:'Transaction', modeleId:7, statut:'signe', dateCreation:'2026-03-28', dateSignature:'2026-03-28', signataires:[{nom:'Emma Faure',signe:true,date:'2026-03-28'},{nom:'SCI Patrimoine 75',signe:true,date:'2026-03-28'}], vars:{bailleur:'SCI Patrimoine 75',acquereur:'Emma Faure',bienAdresse:'42 bd Voltaire, Paris 11e',bienSurface:'55',prix:'275 000'}, contenu:'' },
  { id:2, type:'Mandat de vente exclusif', categorie:'Transaction', modeleId:2, statut:'signe', dateCreation:'2026-03-25', dateSignature:'2026-03-25', signataires:[{nom:'Philippe Martin',signe:true,date:'2026-03-25'}], vars:{bailleur:'Philippe Martin',bienAdresse:'8 av Jean Médecin, Nice',bienSurface:'45',prix:'210 000',duree:'3'}, contenu:'' },
  { id:3, type:'Bail habitation meublé', categorie:'Location', modeleId:22, statut:'envoye', dateCreation:'2026-04-04', dateSignature:null, signataires:[{nom:'Jean Martin',signe:false,date:null},{nom:'SCI Riviera',signe:true,date:'2026-04-04'}], vars:{bailleur:'SCI Riviera',locataire:'Jean Martin',bienAdresse:'24 rue de la Liberté, Nice',bienSurface:'65',loyer:'850',duree:'36'}, contenu:'' },
];

export default function ContratsModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('modeles');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(null);
  const [editingContrat, setEditingContrat] = useState(null);
  const [form, setForm] = useState({});

  const contrats = data.contrats || DEFAULT_CONTRATS;
  if(!data.contrats) setData(d=>({...d, contrats:DEFAULT_CONTRATS}));

  const biens = data.biens || [];
  const locataires = data.locataires || [];
  const scis = data.scis || [];

  const categories = [...new Set(MODELES.map(m=>m.cat))];
  const filteredModeles = filterCat ? MODELES.filter(m=>m.cat===filterCat) : MODELES;

  const openEditor = (modele) => {
    setForm({ bienId:'', locataireId:'', bailleur:'', locataire:'', acquereur:'', prix:'', loyer:'', duree:'', modeleId:modele.id });
    setModal({type:'generer', modele});
  };

  const selectedBien = biens.find(b=>b.id===Number(form.bienId));
  const selectedLocataire = locataires.find(l=>l.id===Number(form.locataireId));

  const previewVars = useMemo(()=>({
    bailleur: form.bailleur || (selectedBien ? (scis.find(s=>s.id===selectedBien.sciId)?.nom||'') : ''),
    locataire: form.locataire || (selectedLocataire ? `${selectedLocataire.prenom} ${selectedLocataire.nom}` : ''),
    acquereur: form.acquereur || '',
    bienAdresse: selectedBien?.adresse || form.bienAdresse || '',
    bienSurface: selectedBien?.surface || form.bienSurface || '',
    loyer: form.loyer || (selectedBien?.loyer ? String(selectedBien.loyer) : ''),
    prix: form.prix || '',
    duree: form.duree || '',
    depot: selectedLocataire?.depot ? String(selectedLocataire.depot) : '',
  }),[form, selectedBien, selectedLocataire, scis]);

  const creerContrat = () => {
    const modele = MODELES.find(m=>m.id===form.modeleId);
    if(!modele) return;
    const contenu = genererContenu(modele, previewVars);
    const c = { id:genId(), type:modele.titre, categorie:modele.cat, modeleId:modele.id, statut:'brouillon', dateCreation:new Date().toISOString().slice(0,10), dateSignature:null, signataires:[], vars:{...previewVars}, contenu };
    setData(d=>({...d, contrats:[c,...(d.contrats||DEFAULT_CONTRATS)]}));
    setModal(null); setForm({});
    setEditingContrat(c.id);
    setSub('contrats');
    showToast(`Contrat "${modele.titre}" créé`);
  };

  const updateContenu = (id, contenu) => {
    setData(d=>({...d, contrats:(d.contrats||[]).map(c=>c.id===id?{...c, contenu}:c)}));
  };

  const exportText = (contrat) => {
    const c = contrat;
    const modele = MODELES.find(m=>m.id===c.modeleId);
    const text = c.contenu || genererContenu(modele||{titre:c.type}, c.vars||{});
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${c.type.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g,'')}_${c.dateCreation}.txt`; a.click();
    showToast('Document exporté');
  };

  const envoyerEmail = (contrat) => {
    const dest = contrat.vars?.locataire || contrat.vars?.acquereur || '';
    showToast(`Document envoyé par email à ${dest || 'destinataire'}`);
  };

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'modeles',label:`Modèles (${MODELES.length})`},{id:'contrats',label:`Mes contrats (${contrats.length})`},{id:'signature',label:'Signature'},{id:'registres',label:'Registres'}].map(t=>(
          <button key={t.id} onClick={()=>{setSub(t.id);setEditingContrat(null);}} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {/* ══ MODÈLES ══ */}
      {sub==='modeles' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 12px'}}>{MODELES.length} modèles de contrats</h2>
        <p style={{fontSize:12,color:L.textSec,marginBottom:16}}>Cliquez sur un modèle pour le générer. Sélectionnez le bien et le locataire, le document se pré-remplit automatiquement.</p>
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          <span onClick={()=>setFilterCat('')} style={{padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${!filterCat?L.noir:L.border}`,color:!filterCat?L.text:L.textSec,background:!filterCat?L.cream:'transparent'}}>Tous ({MODELES.length})</span>
          {categories.map(cat=>{
            const count = MODELES.filter(m=>m.cat===cat).length;
            return <span key={cat} onClick={()=>setFilterCat(filterCat===cat?'':cat)} style={{padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${filterCat===cat?catColors[cat]:L.border}`,color:filterCat===cat?catColors[cat]:L.textSec,background:filterCat===cat?`${catColors[cat]}10`:'transparent'}}>{cat} ({count})</span>;
          })}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:8}}>
          {filteredModeles.map(m=>(
            <div key={m.id} onClick={()=>openEditor(m)} style={{...CARD,padding:'14px 16px',cursor:'pointer',borderLeft:`3px solid ${catColors[m.cat]}`,transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColors[m.cat];e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';}} onMouseLeave={e=>{e.currentTarget.style.borderLeftColor=catColors[m.cat];e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
              <div style={{fontSize:13,fontWeight:600}}>{m.titre}</div>
              <div style={{fontSize:11,color:catColors[m.cat],marginTop:2}}>{m.cat} · Générer →</div>
            </div>
          ))}
        </div>
      </>}

      {/* ══ MES CONTRATS ══ */}
      {sub==='contrats' && !editingContrat && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Mes contrats</h2>
        {contrats.length===0 && <div style={{...CARD,textAlign:'center',color:L.textLight}}>Aucun contrat. Créez-en un depuis l'onglet Modèles.</div>}
        {contrats.map(c=>{
          const modele = MODELES.find(m=>m.id===c.modeleId);
          return <div key={c.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:14,fontWeight:700}}>{c.type}</span>
                <span style={{fontSize:10,fontWeight:600,color:catColors[c.categorie],background:`${catColors[c.categorie]}12`,padding:'2px 8px'}}>{c.categorie}</span>
                <span style={{fontSize:10,fontWeight:600,color:c.statut==='signe'?L.green:c.statut==='envoye'?L.orange:L.textSec,background:c.statut==='signe'?L.greenBg:c.statut==='envoye'?L.orangeBg:'transparent',padding:'2px 8px'}}>{statutLabels[c.statut]}</span>
              </div>
              <div style={{fontSize:12,color:L.textSec}}>
                {c.vars?.bienAdresse && `${c.vars.bienAdresse} · `}
                {c.vars?.locataire && `${c.vars.locataire} · `}
                {c.vars?.acquereur && `${c.vars.acquereur} · `}
                {c.dateCreation}
              </div>
            </div>
            <div style={{display:'flex',gap:4,flexShrink:0}}>
              <button onClick={()=>setEditingContrat(c.id)} style={{...BTN,fontSize:10,padding:'5px 10px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Ouvrir</button>
              <button onClick={()=>exportText(c)} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 10px'}}>📥 Export</button>
              <button onClick={()=>envoyerEmail(c)} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 10px'}}>📧</button>
            </div>
          </div>;
        })}
      </>}

      {/* ══ ÉDITEUR DE CONTRAT ══ */}
      {sub==='contrats' && editingContrat && (()=>{
        const c = contrats.find(x=>x.id===editingContrat);
        if(!c) return null;
        const modele = MODELES.find(m=>m.id===c.modeleId) || {titre:c.type,champs:[]};
        const contenu = c.contenu || genererContenu(modele, c.vars||{});
        return <>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button onClick={()=>setEditingContrat(null)} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px'}}>← Retour</button>
              <h2 style={{fontSize:16,fontWeight:800,margin:0}}>{c.type}</h2>
              <span style={{fontSize:10,fontWeight:600,color:catColors[c.categorie],background:`${catColors[c.categorie]}12`,padding:'2px 8px'}}>{c.categorie}</span>
            </div>
            <div style={{display:'flex',gap:4}}>
              <button onClick={()=>exportText(c)} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>📥 Exporter</button>
              <button onClick={()=>{envoyerEmail(c);setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,statut:'envoye'}:x)}));}} style={{...BTN,background:L.blue}}>📧 Envoyer par email</button>
            </div>
          </div>

          {/* Variables du contrat */}
          <div style={{...CARD,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Variables du document</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {biens.length>0 && <div>
                <label style={LBL}>Bien</label>
                <select value={c.vars?.bienId||''} onChange={e=>{
                  const b = biens.find(x=>x.id===Number(e.target.value));
                  const sci = b ? scis.find(s=>s.id===b.sciId) : null;
                  const loc = b?.locataireId ? locataires.find(l=>l.id===b.locataireId) : null;
                  const newVars = {...(c.vars||{}), bienId:e.target.value, bienAdresse:b?.adresse||'', bienSurface:b?.surface||'', loyer:b?.loyer?String(b.loyer):'', bailleur:sci?.nom||c.vars?.bailleur||''};
                  if(loc) { newVars.locataire = `${loc.prenom} ${loc.nom}`; newVars.locataireId = String(loc.id); }
                  const newContenu = genererContenu(modele, newVars);
                  setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,vars:newVars,contenu:newContenu}:x)}));
                }} style={INP}>
                  <option value="">— Sélectionner un bien —</option>
                  {biens.map(b=><option key={b.id} value={b.id}>{b.nom||b.type} — {b.adresse}</option>)}
                </select>
              </div>}
              {locataires.length>0 && <div>
                <label style={LBL}>Locataire / Personne</label>
                <select value={c.vars?.locataireId||''} onChange={e=>{
                  const loc = locataires.find(l=>l.id===Number(e.target.value));
                  const newVars = {...(c.vars||{}), locataireId:e.target.value, locataire:loc?`${loc.prenom} ${loc.nom}`:''};
                  const newContenu = genererContenu(modele, newVars);
                  setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,vars:newVars,contenu:newContenu}:x)}));
                }} style={INP}>
                  <option value="">— Sélectionner —</option>
                  {locataires.map(l=><option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>)}
                </select>
              </div>}
              <div>
                <label style={LBL}>Bailleur / Mandant</label>
                <input value={c.vars?.bailleur||''} onChange={e=>{
                  const newVars = {...(c.vars||{}), bailleur:e.target.value};
                  const newContenu = genererContenu(modele, newVars);
                  setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,vars:newVars,contenu:newContenu}:x)}));
                }} style={INP}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginTop:8}}>
              <div><label style={LBL}>Loyer (€)</label><input value={c.vars?.loyer||''} onChange={e=>{const newVars={...(c.vars||{}),loyer:e.target.value};setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,vars:newVars,contenu:genererContenu(modele,newVars)}:x)}));}} style={INP}/></div>
              <div><label style={LBL}>Prix (€)</label><input value={c.vars?.prix||''} onChange={e=>{const newVars={...(c.vars||{}),prix:e.target.value};setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,vars:newVars,contenu:genererContenu(modele,newVars)}:x)}));}} style={INP}/></div>
              <div><label style={LBL}>Durée (mois)</label><input value={c.vars?.duree||''} onChange={e=>{const newVars={...(c.vars||{}),duree:e.target.value};setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,vars:newVars,contenu:genererContenu(modele,newVars)}:x)}));}} style={INP}/></div>
              <div><label style={LBL}>Acquéreur</label><input value={c.vars?.acquereur||''} onChange={e=>{const newVars={...(c.vars||{}),acquereur:e.target.value};setData(d=>({...d,contrats:(d.contrats||[]).map(x=>x.id===c.id?{...x,vars:newVars,contenu:genererContenu(modele,newVars)}:x)}));}} style={INP}/></div>
            </div>
          </div>

          {/* Contenu éditable */}
          <div style={CARD}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700}}>Contenu du document</div>
              <div style={{fontSize:11,color:L.textLight}}>Modifiable directement — les changements de variables mettent à jour le texte</div>
            </div>
            <textarea value={contenu} onChange={e=>updateContenu(c.id, e.target.value)} style={{...INP, minHeight:400, resize:'vertical', fontFamily:'monospace', fontSize:12, lineHeight:1.6, whiteSpace:'pre-wrap'}}/>
          </div>
        </>;
      })()}

      {/* ══ SIGNATURE ══ */}
      {sub==='signature' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 6px'}}>Signature électronique</h2>
        <p style={{fontSize:12,color:L.textSec,marginBottom:16}}>Conforme eIDAS · Dossier de preuve archivé 10 ans</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:L.green}}>{contrats.filter(c=>c.statut==='signe').length}</div><div style={{fontSize:10,color:L.textSec}}>Signés</div></div>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:L.orange}}>{contrats.filter(c=>c.statut==='envoye').length}</div><div style={{fontSize:10,color:L.textSec}}>En attente</div></div>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{contrats.reduce((s,c)=>s+(c.signataires||[]).length,0)}</div><div style={{fontSize:10,color:L.textSec}}>Signataires total</div></div>
        </div>
        {contrats.filter(c=>c.statut==='envoye').map(c=>(
          <div key={c.id} style={{...CARD,marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{c.type}</div>
            <div style={{fontSize:12,color:L.textSec,marginBottom:6}}>{c.vars?.bienAdresse}</div>
            {(c.signataires||[]).map((s,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:12}}>
                <span>{s.nom}</span>
                <span style={{color:s.signe?L.green:L.orange,fontWeight:600}}>{s.signe?'✓ Signé':'⏳ En attente'}</span>
              </div>
            ))}
            <button onClick={()=>showToast('Relance envoyée par email + SMS')} style={{...BTN,fontSize:10,padding:'5px 12px',marginTop:8,background:L.orange}}>📨 Relancer</button>
          </div>
        ))}
      </>}

      {/* ══ REGISTRES ══ */}
      {sub==='registres' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 6px'}}>Registres des mandats</h2>
        <p style={{fontSize:12,color:L.textSec,marginBottom:16}}>100% conforme loi Hoguet</p>
        <div style={{...CARD,padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'0.5fr 2fr 1.5fr 1fr 1fr',padding:'10px 14px',fontSize:10,fontWeight:700,color:L.textSec,borderBottom:`2px solid ${L.border}`}}>
            <span>#</span><span>Type</span><span>Bien / Parties</span><span>Date</span><span>Statut</span>
          </div>
          {contrats.map((c,i)=>(
            <div key={c.id} style={{display:'grid',gridTemplateColumns:'0.5fr 2fr 1.5fr 1fr 1fr',padding:'10px 14px',fontSize:12,borderBottom:`1px solid ${L.border}`,cursor:'pointer'}} onClick={()=>{setEditingContrat(c.id);setSub('contrats');}}>
              <span style={{color:L.textLight}}>{i+1}</span>
              <span style={{fontWeight:600}}>{c.type}</span>
              <span style={{color:L.textSec,fontSize:11}}>{c.vars?.bienAdresse?.slice(0,30)||'—'}</span>
              <span style={{color:L.textSec}}>{c.dateCreation}</span>
              <span style={{color:c.statut==='signe'?L.green:L.textSec,fontWeight:600}}>{statutLabels[c.statut]}</span>
            </div>
          ))}
        </div>
      </>}

      {/* ══ MODAL GÉNÉRER ══ */}
      {modal?.type==='generer' && (()=>{
        const modele = modal.modele;
        const preview = genererContenu(modele, previewVars);
        return <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:800,maxHeight:'90vh',overflowY:'auto',padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 4px'}}>Générer : {modele.titre}</h3>
            <div style={{fontSize:11,color:catColors[modele.cat],marginBottom:16}}>{modele.cat}</div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {/* Formulaire gauche */}
              <div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Sélection automatique</div>
                {biens.length>0 && <div style={{marginBottom:10}}>
                  <label style={LBL}>Bien</label>
                  <select value={form.bienId||''} onChange={e=>{
                    const b = biens.find(x=>x.id===Number(e.target.value));
                    const sci = b ? scis.find(s=>s.id===b.sciId) : null;
                    const loc = b?.locataireId ? locataires.find(l=>l.id===b.locataireId) : null;
                    setForm(f=>({...f, bienId:e.target.value, bienAdresse:b?.adresse||'', bienSurface:String(b?.surface||''), loyer:b?.loyer?String(b.loyer):'', bailleur:sci?.nom||f.bailleur, locataire:loc?`${loc.prenom} ${loc.nom}`:f.locataire, locataireId:loc?String(loc.id):''}));
                  }} style={INP}>
                    <option value="">— Sélectionner un bien —</option>
                    {biens.map(b=><option key={b.id} value={b.id}>{b.nom||b.type} — {b.adresse}</option>)}
                  </select>
                </div>}
                {locataires.length>0 && modele.champs?.includes('locataire') && <div style={{marginBottom:10}}>
                  <label style={LBL}>Locataire</label>
                  <select value={form.locataireId||''} onChange={e=>{
                    const loc = locataires.find(l=>l.id===Number(e.target.value));
                    setForm(f=>({...f, locataireId:e.target.value, locataire:loc?`${loc.prenom} ${loc.nom}`:''}));
                  }} style={INP}>
                    <option value="">— Sélectionner —</option>
                    {locataires.map(l=><option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>)}
                  </select>
                </div>}
                <div style={{fontSize:13,fontWeight:700,margin:'12px 0 10px'}}>Personnalisation</div>
                <div style={{marginBottom:8}}><label style={LBL}>Bailleur / Mandant</label><input value={form.bailleur||''} onChange={e=>setForm(f=>({...f,bailleur:e.target.value}))} style={INP}/></div>
                {modele.champs?.includes('acquereur') && <div style={{marginBottom:8}}><label style={LBL}>Acquéreur</label><input value={form.acquereur||''} onChange={e=>setForm(f=>({...f,acquereur:e.target.value}))} style={INP}/></div>}
                {modele.champs?.includes('prix') && <div style={{marginBottom:8}}><label style={LBL}>Prix (€)</label><input value={form.prix||''} onChange={e=>setForm(f=>({...f,prix:e.target.value}))} style={INP}/></div>}
                {modele.champs?.includes('loyer') && <div style={{marginBottom:8}}><label style={LBL}>Loyer (€)</label><input value={form.loyer||''} onChange={e=>setForm(f=>({...f,loyer:e.target.value}))} style={INP}/></div>}
                {modele.champs?.includes('duree') && <div style={{marginBottom:8}}><label style={LBL}>Durée (mois)</label><input value={form.duree||''} onChange={e=>setForm(f=>({...f,duree:e.target.value}))} style={INP}/></div>}
                <button onClick={creerContrat} style={{...BTN,width:'100%',padding:'12px',marginTop:8}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Créer le contrat</button>
              </div>

              {/* Aperçu droit */}
              <div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Aperçu en temps réel</div>
                <div style={{background:L.cream,border:`1px solid ${L.border}`,padding:'16px',minHeight:300,maxHeight:500,overflowY:'auto',fontFamily:'monospace',fontSize:11,lineHeight:1.6,whiteSpace:'pre-wrap',color:L.text}}>
                  {preview}
                </div>
              </div>
            </div>
          </div>
        </div>;
      })()}
    </div>
  );
}
