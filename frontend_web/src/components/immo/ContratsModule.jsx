import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const MODELES = [
  // Transaction (20)
  {id:1,cat:'Transaction',titre:'Mandat de vente simple'},{id:2,cat:'Transaction',titre:'Mandat de vente exclusif'},{id:3,cat:'Transaction',titre:'Mandat de vente semi-exclusif'},{id:4,cat:'Transaction',titre:'Avenant au mandat de vente'},{id:5,cat:'Transaction',titre:'Offre d\'achat'},{id:6,cat:'Transaction',titre:'Contre-offre'},{id:7,cat:'Transaction',titre:'Compromis de vente'},{id:8,cat:'Transaction',titre:'Promesse unilatérale de vente'},{id:9,cat:'Transaction',titre:'Bon de visite'},{id:10,cat:'Transaction',titre:'Procuration de vente'},{id:11,cat:'Transaction',titre:'Attestation de vente'},{id:12,cat:'Transaction',titre:'Lettre d\'intention d\'achat'},{id:13,cat:'Transaction',titre:'Notification SRU (rétractation)'},{id:14,cat:'Transaction',titre:'Résiliation de mandat'},{id:15,cat:'Transaction',titre:'Attestation de financement'},{id:16,cat:'Transaction',titre:'Mandat de recherche'},{id:17,cat:'Transaction',titre:'Convention d\'honoraires'},{id:18,cat:'Transaction',titre:'Certificat de conformité'},{id:19,cat:'Transaction',titre:'Attestation de non-vente'},{id:20,cat:'Transaction',titre:'Dossier de diagnostic technique'},
  // Location (15)
  {id:21,cat:'Location',titre:'Bail habitation vide'},{id:22,cat:'Location',titre:'Bail habitation meublé'},{id:23,cat:'Location',titre:'Bail commercial (3-6-9)'},{id:24,cat:'Location',titre:'Bail professionnel'},{id:25,cat:'Location',titre:'Bail mixte'},{id:26,cat:'Location',titre:'Avenant au bail'},{id:27,cat:'Location',titre:'État des lieux d\'entrée'},{id:28,cat:'Location',titre:'État des lieux de sortie'},{id:29,cat:'Location',titre:'Congé du locataire'},{id:30,cat:'Location',titre:'Congé du bailleur (vente)'},{id:31,cat:'Location',titre:'Congé du bailleur (reprise)'},{id:32,cat:'Location',titre:'Renouvellement de bail'},{id:33,cat:'Location',titre:'Caution solidaire'},{id:34,cat:'Location',titre:'Acte de cautionnement'},{id:35,cat:'Location',titre:'Quittance de loyer'},
  // Gestion (10)
  {id:36,cat:'Gestion',titre:'Mandat de gestion locative'},{id:37,cat:'Gestion',titre:'Mise en demeure loyer impayé'},{id:38,cat:'Gestion',titre:'Attestation de loyer (CAF)'},{id:39,cat:'Gestion',titre:'Régularisation des charges'},{id:40,cat:'Gestion',titre:'Révision de loyer (IRL)'},{id:41,cat:'Gestion',titre:'Augmentation de loyer'},{id:42,cat:'Gestion',titre:'Attestation d\'assurance PNO'},{id:43,cat:'Gestion',titre:'Lettre de relance amiable'},{id:44,cat:'Gestion',titre:'Restitution dépôt de garantie'},{id:45,cat:'Gestion',titre:'Décompte de charges'},
  // Copropriété (6)
  {id:46,cat:'Copropriété',titre:'Convocation AG'},{id:47,cat:'Copropriété',titre:'PV d\'assemblée générale'},{id:48,cat:'Copropriété',titre:'Appel de charges copropriété'},{id:49,cat:'Copropriété',titre:'Contestation charges copro'},{id:50,cat:'Copropriété',titre:'Demande de travaux copro'},{id:51,cat:'Copropriété',titre:'Résolution AG'},
  // Divers (5)
  {id:52,cat:'Divers',titre:'Attestation sur l\'honneur'},{id:53,cat:'Divers',titre:'Procuration générale'},{id:54,cat:'Divers',titre:'Lettre de recommandation'},{id:55,cat:'Divers',titre:'Accord de confidentialité'},{id:56,cat:'Divers',titre:'Convention de partenariat'},
];

const DEFAULT_CONTRATS = [
  { id:1, type:'Compromis de vente', categorie:'Transaction', mandatId:null, statut:'signe', dateCreation:'2026-03-28', dateSignature:'2026-03-28', signataires:[{nom:'Emma Faure',signe:true,date:'2026-03-28'},{nom:'SCI Patrimoine 75',signe:true,date:'2026-03-28'}] },
  { id:2, type:'Mandat de vente exclusif', categorie:'Transaction', mandatId:1, statut:'signe', dateCreation:'2026-03-25', dateSignature:'2026-03-25', signataires:[{nom:'Philippe Martin',signe:true,date:'2026-03-25'}] },
  { id:3, type:'Bail habitation meublé', categorie:'Location', mandatId:null, statut:'envoye', dateCreation:'2026-04-04', dateSignature:null, signataires:[{nom:'Locataire A',signe:false,date:null},{nom:'SCI Riviera',signe:true,date:'2026-04-04'}] },
  { id:4, type:'Bon de visite', categorie:'Transaction', mandatId:null, statut:'archive', dateCreation:'2026-04-02', dateSignature:'2026-04-02', signataires:[{nom:'Thomas Kessler',signe:true,date:'2026-04-02'}] },
];

const catColors = { Transaction:L.gold, Location:L.blue, Gestion:L.green, Copropriété:L.orange, Divers:L.textSec };
const statutLabels = { brouillon:'Brouillon', envoye:'Envoyé', signe:'Signé', archive:'Archivé' };

export default function ContratsModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('contrats');
  const [filterCat, setFilterCat] = useState('');

  const contrats = data.contrats || DEFAULT_CONTRATS;
  if(!data.contrats) setData(d=>({...d, contrats:DEFAULT_CONTRATS}));

  const categories = [...new Set(MODELES.map(m=>m.cat))];
  const filteredModeles = filterCat ? MODELES.filter(m=>m.cat===filterCat) : MODELES;

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'contrats',label:`Mes contrats (${contrats.length})`},{id:'modeles',label:`Modèles (${MODELES.length})`},{id:'signature',label:'Signature'},{id:'registres',label:'Registres'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='contrats' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Mes contrats</h2>
        {contrats.map(c=>(
          <div key={c.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:14,fontWeight:700}}>{c.type}</span>
                <span style={{fontSize:10,fontWeight:600,color:catColors[c.categorie],background:`${catColors[c.categorie]}12`,padding:'2px 8px'}}>{c.categorie}</span>
                <span style={{fontSize:10,fontWeight:600,color:c.statut==='signe'?L.green:c.statut==='envoye'?L.orange:L.textSec,background:c.statut==='signe'?L.greenBg:c.statut==='envoye'?L.orangeBg:'transparent',padding:'2px 8px'}}>{statutLabels[c.statut]}</span>
              </div>
              <div style={{fontSize:12,color:L.textSec}}>Créé le {c.dateCreation} · {c.signataires.length} signataire{c.signataires.length>1?'s':''} · {c.signataires.filter(s=>s.signe).length}/{c.signataires.length} signés</div>
            </div>
            <div style={{display:'flex',gap:4}}>
              {c.statut==='envoye' && <button onClick={()=>showToast('Relance signature envoyée')} style={{...BTN,fontSize:10,padding:'4px 10px',background:L.orange}}>Relancer</button>}
              <button onClick={()=>showToast('PDF téléchargé')} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px'}}>📄 PDF</button>
            </div>
          </div>
        ))}
      </>}

      {sub==='modeles' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>{MODELES.length} modèles de contrats</h2>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          <span onClick={()=>setFilterCat('')} style={{padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${!filterCat?L.noir:L.border}`,color:!filterCat?L.text:L.textSec,background:!filterCat?L.cream:'transparent'}}>Tous ({MODELES.length})</span>
          {categories.map(cat=>{
            const count = MODELES.filter(m=>m.cat===cat).length;
            return <span key={cat} onClick={()=>setFilterCat(filterCat===cat?'':cat)} style={{padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${filterCat===cat?catColors[cat]:L.border}`,color:filterCat===cat?catColors[cat]:L.textSec,background:filterCat===cat?`${catColors[cat]}10`:'transparent'}}>{cat} ({count})</span>;
          })}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:8}}>
          {filteredModeles.map(m=>(
            <div key={m.id} onClick={()=>{
              const c = {id:genId(),type:m.titre,categorie:m.cat,mandatId:null,statut:'brouillon',dateCreation:new Date().toISOString().slice(0,10),dateSignature:null,signataires:[]};
              setData(d=>({...d,contrats:[c,...(d.contrats||DEFAULT_CONTRATS)]}));
              showToast(`Contrat "${m.titre}" créé en brouillon`);
            }} style={{...CARD,padding:'14px 16px',cursor:'pointer',borderLeft:`3px solid ${catColors[m.cat]}`,transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor=catColors[m.cat]} onMouseLeave={e=>{e.currentTarget.style.borderLeftColor=catColors[m.cat];e.currentTarget.style.borderColor=L.border;}}>
              <div style={{fontSize:13,fontWeight:600}}>{m.titre}</div>
              <div style={{fontSize:11,color:catColors[m.cat],marginTop:2}}>{m.cat} · Générer →</div>
            </div>
          ))}
        </div>
      </>}

      {sub==='signature' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 6px'}}>Signature électronique</h2>
        <p style={{fontSize:12,color:L.textSec,marginBottom:16}}>Conforme eIDAS · Dossier de preuve archivé 10 ans · Face à face ou à distance</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:L.green}}>{contrats.filter(c=>c.statut==='signe').length}</div><div style={{fontSize:10,color:L.textSec}}>Signés</div></div>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:L.orange}}>{contrats.filter(c=>c.statut==='envoye').length}</div><div style={{fontSize:10,color:L.textSec}}>En attente</div></div>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{contrats.reduce((s,c)=>s+c.signataires.length,0)}</div><div style={{fontSize:10,color:L.textSec}}>Signataires total</div></div>
        </div>
        {contrats.filter(c=>c.statut==='envoye').map(c=>(
          <div key={c.id} style={{...CARD,marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{c.type}</div>
            {c.signataires.map((s,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:12}}>
                <span>{s.nom}</span>
                <span style={{color:s.signe?L.green:L.orange,fontWeight:600}}>{s.signe?'✓ Signé':'⏳ En attente'}</span>
              </div>
            ))}
            <button onClick={()=>showToast('Relance envoyée par email + SMS')} style={{...BTN,fontSize:10,padding:'5px 12px',marginTop:8,background:L.orange}}>📨 Relancer par email + SMS</button>
          </div>
        ))}
      </>}

      {sub==='registres' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 6px'}}>Registres des mandats</h2>
        <p style={{fontSize:12,color:L.textSec,marginBottom:16}}>100% conforme loi Hoguet · Transaction et Gestion</p>
        <div style={{...CARD,padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'0.5fr 2fr 1fr 1fr 1fr',padding:'10px 14px',fontSize:10,fontWeight:700,color:L.textSec,borderBottom:`2px solid ${L.border}`}}>
            <span>#</span><span>Type de contrat</span><span>Catégorie</span><span>Date</span><span>Statut</span>
          </div>
          {contrats.map((c,i)=>(
            <div key={c.id} style={{display:'grid',gridTemplateColumns:'0.5fr 2fr 1fr 1fr 1fr',padding:'10px 14px',fontSize:12,borderBottom:`1px solid ${L.border}`}}>
              <span style={{color:L.textLight}}>{i+1}</span>
              <span style={{fontWeight:600}}>{c.type}</span>
              <span style={{color:catColors[c.categorie]}}>{c.categorie}</span>
              <span style={{color:L.textSec}}>{c.dateCreation}</span>
              <span style={{color:c.statut==='signe'?L.green:L.textSec,fontWeight:600}}>{statutLabels[c.statut]}</span>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}
