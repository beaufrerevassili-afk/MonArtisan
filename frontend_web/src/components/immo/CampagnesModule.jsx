import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const MODELES_CAMPAGNE = [
  {id:1,cat:'Prospection',type:'email',titre:'Estimation gratuite de votre bien'},{id:2,cat:'Prospection',type:'sms',titre:'SMS estimation gratuite'},{id:3,cat:'Prospection',type:'courrier',titre:'Lettre de prospection quartier'},{id:4,cat:'Prospection',type:'flyer',titre:'Flyer estimation gratuite'},
  {id:5,cat:'Relance',type:'email',titre:'Relance estimation sans suite'},{id:6,cat:'Relance',type:'sms',titre:'SMS relance mandat expiré'},{id:7,cat:'Relance',type:'email',titre:'Relance acquéreur inactif'},{id:8,cat:'Relance',type:'email',titre:'Nouveau bien correspondant'},
  {id:9,cat:'Information',type:'email',titre:'Newsletter marché immobilier'},{id:10,cat:'Information',type:'email',titre:'Bilan trimestriel du marché'},{id:11,cat:'Information',type:'email',titre:'Évolution des prix quartier'},{id:12,cat:'Information',type:'courrier',titre:'Rapport annuel propriétaire'},
  {id:13,cat:'Festif',type:'email',titre:'Joyeux anniversaire'},{id:14,cat:'Festif',type:'sms',titre:'SMS vœux nouvelle année'},{id:15,cat:'Festif',type:'email',titre:'Bonnes fêtes de fin d\'année'},{id:16,cat:'Festif',type:'email',titre:'Félicitations achat'},
  {id:17,cat:'Promotion',type:'email',titre:'Journée portes ouvertes'},{id:18,cat:'Promotion',type:'flyer',titre:'Flyer nouveau mandat exclusif'},{id:19,cat:'Promotion',type:'email',titre:'Bien de la semaine'},{id:20,cat:'Promotion',type:'sms',titre:'SMS alerte nouveau bien'},
  {id:21,cat:'Prospection',type:'email',titre:'Invitation estimation offerte'},{id:22,cat:'Relance',type:'email',titre:'Suivi post-visite'},{id:23,cat:'Information',type:'email',titre:'Guide primo-accédant'},
];

const DEFAULT_CAMPAGNES = [
  { id:1, nom:'Estimation gratuite — Nice Centre', type:'email', modeleId:1, statut:'envoyee', dateCreation:'2026-03-15', dateEnvoi:'2026-03-15', stats:{envoyes:245,ouverts:89,cliques:34,reponses:8}, cible:{types:['prospect'],secteurs:['Nice Centre']} },
  { id:2, nom:'Relance acquéreurs mars', type:'email', modeleId:7, statut:'envoyee', dateCreation:'2026-03-28', dateEnvoi:'2026-03-28', stats:{envoyes:42,ouverts:18,cliques:7,reponses:3}, cible:{types:['client']} },
  { id:3, nom:'Vœux 2026', type:'sms', modeleId:14, statut:'envoyee', dateCreation:'2026-01-01', dateEnvoi:'2026-01-01', stats:{envoyes:380,ouverts:380,cliques:0,reponses:15}, cible:{types:['client','prospect','vendeur']} },
  { id:4, nom:'Flyer portes ouvertes avril', type:'flyer', modeleId:18, statut:'brouillon', dateCreation:'2026-04-05', dateEnvoi:null, stats:{envoyes:0,ouverts:0,cliques:0,reponses:0}, cible:{types:['prospect'],secteurs:['Nice Libération']} },
];

const typeEmoji = {email:'📧',sms:'💬',courrier:'✉️',flyer:'📄'};
const catColors = {Prospection:L.blue,Relance:L.orange,Information:L.green,Festif:'#EC4899',Promotion:L.gold};

export default function CampagnesModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('campagnes');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const campagnes = data.campagnes || DEFAULT_CAMPAGNES;
  if(!data.campagnes) setData(d=>({...d, campagnes:DEFAULT_CAMPAGNES}));

  const totalEnvoyes = campagnes.reduce((s,c)=>s+c.stats.envoyes,0);
  const totalOuverts = campagnes.reduce((s,c)=>s+c.stats.ouverts,0);
  const tauxOuverture = totalEnvoyes>0?Math.round(totalOuverts/totalEnvoyes*100):0;
  const filteredModeles = filterCat ? MODELES_CAMPAGNE.filter(m=>m.cat===filterCat) : MODELES_CAMPAGNE;

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'campagnes',label:'Campagnes'},{id:'modeles',label:`Modèles (${MODELES_CAMPAGNE.length})`},{id:'ciblage',label:'Ciblage'},{id:'historique',label:'Historique'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='campagnes' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Campagnes ({campagnes.length})</h2>
          <button onClick={()=>{setForm({type:'email'});setModal({type:'add'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Nouvelle campagne</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Envoyés',v:totalEnvoyes,c:L.blue},{l:'Ouverts',v:totalOuverts,c:L.green},{l:'Taux ouverture',v:`${tauxOuverture}%`,c:tauxOuverture>30?L.green:L.orange},{l:'Réponses',v:campagnes.reduce((s,c)=>s+c.stats.reponses,0),c:L.gold}].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        {campagnes.map(c=>(
          <div key={c.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:16}}>{typeEmoji[c.type]}</span>
                <span style={{fontSize:14,fontWeight:700}}>{c.nom}</span>
                <span style={{fontSize:10,fontWeight:600,color:c.statut==='envoyee'?L.green:L.textSec,background:c.statut==='envoyee'?L.greenBg:'transparent',padding:'2px 8px'}}>{c.statut==='envoyee'?'Envoyée':'Brouillon'}</span>
              </div>
              {c.statut==='envoyee' && <div style={{display:'flex',gap:12,fontSize:11,color:L.textSec,marginTop:4}}>
                <span>{c.stats.envoyes} envoyés</span><span>{c.stats.ouverts} ouverts ({c.stats.envoyes>0?Math.round(c.stats.ouverts/c.stats.envoyes*100):0}%)</span><span>{c.stats.cliques} clics</span><span style={{color:L.gold,fontWeight:600}}>{c.stats.reponses} réponses</span>
              </div>}
            </div>
            <div style={{display:'flex',gap:4}}>
              {c.statut==='brouillon' && <button onClick={()=>{setData(d=>({...d,campagnes:(d.campagnes||[]).map(x=>x.id===c.id?{...x,statut:'envoyee',dateEnvoi:new Date().toISOString().slice(0,10),stats:{envoyes:150,ouverts:0,cliques:0,reponses:0}}:x)}));showToast('Campagne envoyée !');}} style={{...BTN,fontSize:10,padding:'5px 12px',background:L.green}}>Envoyer</button>}
              <button onClick={()=>showToast('Dupliquer la campagne')} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 10px'}}>Dupliquer</button>
            </div>
          </div>
        ))}
      </>}

      {sub==='modeles' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 12px'}}>Bibliothèque de modèles</h2>
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          {Object.keys(catColors).map(cat=>{
            const count=MODELES_CAMPAGNE.filter(m=>m.cat===cat).length;
            return <span key={cat} onClick={()=>setFilterCat(filterCat===cat?'':cat)} style={{padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${filterCat===cat?catColors[cat]:L.border}`,color:filterCat===cat?catColors[cat]:L.textSec}}>{cat} ({count})</span>;
          })}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:8}}>
          {filteredModeles.map(m=>(
            <div key={m.id} onClick={()=>showToast(`Modèle "${m.titre}" sélectionné`)} style={{...CARD,padding:'14px 16px',cursor:'pointer',borderLeft:`3px solid ${catColors[m.cat]}`,transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
              <div style={{display:'flex',alignItems:'center',gap:6}}><span>{typeEmoji[m.type]}</span><span style={{fontSize:13,fontWeight:600}}>{m.titre}</span></div>
              <div style={{fontSize:11,color:catColors[m.cat],marginTop:2}}>{m.cat} · {m.type}</div>
            </div>
          ))}
        </div>
      </>}

      {sub==='ciblage' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Ciblage précis</h2>
        <div style={{...CARD,marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Définir votre audience</div>
          <div style={{fontSize:12,color:L.textSec,marginBottom:8}}>Ciblez par type de contact, secteur géographique, tranche de budget et date de dernière interaction.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={{padding:12,background:L.cream,textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Contacts ciblables</div><div style={{fontSize:24,fontWeight:200,fontFamily:L.serif}}>~300</div></div>
            <div style={{padding:12,background:L.cream,textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Aucune limite d'envoi</div><div style={{fontSize:24,fontWeight:200,fontFamily:L.serif,color:L.green}}>∞</div></div>
          </div>
        </div>
      </>}

      {sub==='historique' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Historique des envois</h2>
        {campagnes.filter(c=>c.statut==='envoyee').map(c=>(
          <div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${L.border}`}}>
            <div><span style={{fontSize:13,fontWeight:600}}>{typeEmoji[c.type]} {c.nom}</span><span style={{fontSize:12,color:L.textSec,marginLeft:8}}>{c.dateEnvoi}</span></div>
            <span style={{fontSize:12,color:L.green,fontWeight:600}}>{c.stats.envoyes} envoyés · {c.stats.reponses} réponses</span>
          </div>
        ))}
      </>}

      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:420,padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Nouvelle campagne</h3>
            <div style={{marginBottom:10}}><label style={LBL}>Nom</label><input value={form.nom||''} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={INP} placeholder="Estimation gratuite - Nice Centre"/></div>
            <div style={{marginBottom:14}}><label style={LBL}>Type</label><select value={form.type||'email'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={INP}><option value="email">Email</option><option value="sms">SMS</option><option value="courrier">Courrier</option><option value="flyer">Flyer</option></select></div>
            <button onClick={()=>{
              const c={id:genId(),nom:form.nom||'Nouvelle campagne',type:form.type||'email',modeleId:null,statut:'brouillon',dateCreation:new Date().toISOString().slice(0,10),dateEnvoi:null,stats:{envoyes:0,ouverts:0,cliques:0,reponses:0},cible:{}};
              setData(d=>({...d,campagnes:[c,...(d.campagnes||DEFAULT_CAMPAGNES)]}));
              setModal(null);setForm({});showToast('Campagne créée');
            }} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Créer</button>
          </div>
        </div>
      )}
    </div>
  );
}
