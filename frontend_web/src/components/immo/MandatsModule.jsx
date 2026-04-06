import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const typeColors = { exclusif:L.gold, 'semi-exclusif':L.orange, simple:L.blue, recherche:'#7C3AED', gestion:L.green };
const statutColors = { brouillon:{color:L.textSec,label:'Brouillon'}, signe:{color:L.blue,label:'Signé'}, actif:{color:L.green,label:'Actif'}, vendu:{color:L.gold,label:'Vendu'}, expire:{color:L.red,label:'Expiré'} };

const DEFAULT_MANDATS = [
  { id:1, numero:'MAN-2026-001', type:'exclusif', adresse:'8 av Jean Médecin, Nice', prix:210000, honoraires:8400, honorairesPct:4, duree:3, dateDebut:'2026-03-25', dateFin:'2026-06-25', statut:'actif', vendeur:{nom:'Philippe Martin',tel:'0698765432',email:'p.martin@orange.fr'}, signataires:[{nom:'Philippe Martin',date:'2026-03-25',signe:true},{nom:'Vassili B.',date:'2026-03-25',signe:true}], delegations:[], historique:[{date:'2026-03-20',action:'Estimation réalisée'},{date:'2026-03-25',action:'Mandat signé'},{date:'2026-03-26',action:'Mise en commercialisation'}], commercialisation:{portails:['SeLoger','LeBonCoin','Bien\'ici'],relances:['2026-04-01']} },
  { id:2, numero:'MAN-2026-002', type:'simple', adresse:'3 rue Rossini, Nice', prix:310000, honoraires:12400, honorairesPct:4, duree:6, dateDebut:'2026-02-15', dateFin:'2026-08-15', statut:'actif', vendeur:{nom:'Catherine Petit',tel:'0634567890',email:'catherine.petit@free.fr'}, signataires:[{nom:'Catherine Petit',date:'2026-02-15',signe:true}], delegations:[{agence:'Agence Riviera',date:'2026-03-01'}], historique:[{date:'2026-02-15',action:'Mandat signé'},{date:'2026-03-01',action:'Délégation Agence Riviera'}], commercialisation:{portails:['LeBonCoin'],relances:[]} },
  { id:3, numero:'MAN-2026-003', type:'exclusif', adresse:'15 bd Victor Hugo, Nice', prix:395000, honoraires:15800, honorairesPct:4, duree:3, dateDebut:'2026-04-10', dateFin:'2026-07-10', statut:'brouillon', vendeur:{nom:'',tel:'',email:''}, signataires:[], delegations:[], historique:[{date:'2026-04-03',action:'Estimation en cours'}], commercialisation:{portails:[],relances:[]} },
  { id:4, numero:'MAN-2026-004', type:'gestion', adresse:'24 rue de la Liberté, Nice', prix:850, honoraires:68, honorairesPct:8, duree:12, dateDebut:'2025-09-01', dateFin:'2026-09-01', statut:'actif', vendeur:{nom:'SCI Riviera',tel:'',email:''}, signataires:[{nom:'Vassili B.',date:'2025-09-01',signe:true}], delegations:[], historique:[{date:'2025-09-01',action:'Mandat gestion signé'}], commercialisation:{portails:[],relances:[]} },
  { id:5, numero:'MAN-2026-005', type:'recherche', adresse:'Paris 18e', prix:300000, honoraires:9000, honorairesPct:3, duree:6, dateDebut:'2026-03-01', dateFin:'2026-09-01', statut:'actif', vendeur:{nom:'Lucas Garcia',tel:'0623456789',email:'lucas.garcia@gmail.com'}, signataires:[{nom:'Lucas Garcia',date:'2026-03-01',signe:true}], delegations:[], historique:[{date:'2026-03-01',action:'Mandat recherche signé'}], commercialisation:{portails:[],relances:['2026-04-05']} },
];

export default function MandatsModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('mandats');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const mandats = data.mandats || DEFAULT_MANDATS;
  if(!data.mandats) setData(d=>({...d, mandats:DEFAULT_MANDATS}));

  const nbActifs = mandats.filter(m=>m.statut==='actif').length;
  const nbExclusifs = mandats.filter(m=>m.type==='exclusif'&&m.statut==='actif').length;
  const caTotal = mandats.filter(m=>m.statut==='vendu').reduce((s,m)=>s+m.honoraires,0);
  const nextNum = `MAN-2026-${String(mandats.length+1).padStart(3,'0')}`;

  const addMandat = () => {
    const m = { id:genId(), numero:nextNum, type:form.type||'simple', adresse:form.adresse||'', prix:Number(form.prix)||0, honoraires:Math.round((Number(form.prix)||0)*(Number(form.honorairesPct)||4)/100), honorairesPct:Number(form.honorairesPct)||4, duree:Number(form.duree)||3, dateDebut:new Date().toISOString().slice(0,10), dateFin:'', statut:'brouillon', vendeur:{nom:form.vendeurNom||'',tel:form.vendeurTel||'',email:form.vendeurEmail||''}, signataires:[], delegations:[], historique:[{date:new Date().toISOString().slice(0,10),action:'Mandat créé'}], commercialisation:{portails:[],relances:[]} };
    m.dateFin = new Date(Date.now()+m.duree*30*24*60*60*1000).toISOString().slice(0,10);
    setData(d=>({...d, mandats:[m,...(d.mandats||DEFAULT_MANDATS)]}));
    setModal(null); setForm({}); showToast('Mandat créé — '+m.numero);
  };

  const updateStatut = (id, statut) => {
    setData(d=>({...d, mandats:(d.mandats||[]).map(m=>m.id===id?{...m,statut,historique:[...m.historique,{date:new Date().toISOString().slice(0,10),action:`Statut → ${statut}`}]}:m)}));
    showToast('Statut mis à jour');
  };

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'mandats',label:'Mandats'},{id:'registre',label:'Registre'},{id:'delegation',label:'Délégation'},{id:'commercialisation',label:'Commercialisation'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='mandats' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Mandats ({mandats.length})</h2>
          <button onClick={()=>{setForm({type:'simple',honorairesPct:'4',duree:'3'});setModal({type:'add'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Nouveau mandat</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Actifs',v:nbActifs,c:L.green},{l:'Exclusifs',v:nbExclusifs,c:L.gold},{l:'Brouillons',v:mandats.filter(m=>m.statut==='brouillon').length,c:L.textSec},{l:'CA honoraires',v:`${caTotal.toLocaleString()}€`,c:'#7C3AED'}].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        {mandats.map(m=>{
          const st = statutColors[m.statut]||statutColors.brouillon;
          return <div key={m.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:12,fontWeight:800,color:L.textLight}}>{m.numero}</span>
                <span style={{fontSize:14,fontWeight:700}}>{m.adresse}</span>
                <span style={{fontSize:10,fontWeight:600,color:typeColors[m.type],background:`${typeColors[m.type]}12`,padding:'2px 8px'}}>{m.type}</span>
                <span style={{fontSize:10,fontWeight:600,color:st.color,background:`${st.color}12`,padding:'2px 8px'}}>{st.label}</span>
              </div>
              <div style={{fontSize:12,color:L.textSec}}>{m.vendeur.nom} · {m.prix.toLocaleString()}€ · Honoraires: {m.honoraires.toLocaleString()}€ ({m.honorairesPct}%)</div>
              <div style={{fontSize:11,color:L.textLight}}>{m.dateDebut} → {m.dateFin}</div>
            </div>
            <div style={{display:'flex',gap:4,flexShrink:0}}>
              {m.statut==='brouillon' && <button onClick={()=>updateStatut(m.id,'signe')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.blue}}>✍ Signer</button>}
              {m.statut==='signe' && <button onClick={()=>updateStatut(m.id,'actif')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.green}}>Activer</button>}
              {m.statut==='actif' && <button onClick={()=>updateStatut(m.id,'vendu')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.gold}}>Vendu !</button>}
              <button onClick={()=>setModal({type:'detail',data:m})} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 10px'}}>Détail</button>
            </div>
          </div>;
        })}
      </>}

      {sub==='registre' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 6px'}}>Registre des mandats</h2>
        <p style={{fontSize:12,color:L.textSec,marginBottom:16}}>Conforme loi Hoguet — Registre des mandats transaction et gestion</p>
        <div style={{...CARD,padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr 1fr 1fr 1fr 1fr',padding:'10px 14px',fontSize:10,fontWeight:700,color:L.textSec,borderBottom:`2px solid ${L.border}`}}>
            <span>N° Mandat</span><span>Bien</span><span>Type</span><span>Mandant</span><span>Date</span><span>Statut</span>
          </div>
          {mandats.map(m=>{
            const st=statutColors[m.statut]||statutColors.brouillon;
            return <div key={m.id} style={{display:'grid',gridTemplateColumns:'1fr 2fr 1fr 1fr 1fr 1fr',padding:'10px 14px',fontSize:12,borderBottom:`1px solid ${L.border}`,alignItems:'center'}}>
              <span style={{fontWeight:700}}>{m.numero}</span>
              <span>{m.adresse}</span>
              <span style={{color:typeColors[m.type],fontWeight:600}}>{m.type}</span>
              <span>{m.vendeur.nom||'—'}</span>
              <span style={{color:L.textSec}}>{m.dateDebut}</span>
              <span style={{color:st.color,fontWeight:600}}>{st.label}</span>
            </div>;
          })}
        </div>
      </>}

      {sub==='delegation' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Délégations de mandats</h2>
        {mandats.filter(m=>m.delegations?.length>0).length>0 ? mandats.filter(m=>m.delegations?.length>0).map(m=>(
          <div key={m.id} style={{...CARD,marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:700}}>{m.numero} — {m.adresse}</div>
            {m.delegations.map((d,i)=>(
              <div key={i} style={{fontSize:12,color:L.textSec,marginTop:4}}>→ Délégué à <strong>{d.agence}</strong> le {d.date}</div>
            ))}
          </div>
        )) : <div style={{...CARD,textAlign:'center',color:L.textLight}}>Aucune délégation en cours</div>}
      </>}

      {sub==='commercialisation' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Commercialisation</h2>
        {mandats.filter(m=>m.statut==='actif').map(m=>(
          <div key={m.id} style={{...CARD,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div><span style={{fontSize:14,fontWeight:700}}>{m.adresse}</span><span style={{fontSize:12,color:L.textSec,marginLeft:8}}>{m.numero}</span></div>
              <button onClick={()=>showToast('Relance acquéreurs envoyée')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.blue}}>Relancer acquéreurs</button>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {(m.commercialisation?.portails||[]).map(p=><span key={p} style={{fontSize:10,padding:'3px 8px',background:L.greenBg,color:L.green,fontWeight:600}}>✓ {p}</span>)}
              {(m.commercialisation?.portails||[]).length===0 && <span style={{fontSize:11,color:L.textLight}}>Aucun portail activé</span>}
            </div>
            <div style={{marginTop:8,fontSize:11,color:L.textSec}}>Historique: {m.historique.slice(-2).map(h=>`${h.date}: ${h.action}`).join(' · ')}</div>
          </div>
        ))}
      </>}

      {/* MODALS */}
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:500,maxHeight:'85vh',overflowY:'auto',padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            {modal.type==='add' && <>
              <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Nouveau mandat — {nextNum}</h3>
              <div style={{marginBottom:10}}><label style={LBL}>Adresse du bien *</label><input value={form.adresse||''} onChange={e=>setForm(f=>({...f,adresse:e.target.value}))} style={INP}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                <div><label style={LBL}>Type</label><select value={form.type||'simple'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={INP}><option value="exclusif">Exclusif</option><option value="semi-exclusif">Semi-exclusif</option><option value="simple">Simple</option><option value="recherche">Recherche</option><option value="gestion">Gestion</option></select></div>
                <div><label style={LBL}>Durée (mois)</label><input type="number" value={form.duree||''} onChange={e=>setForm(f=>({...f,duree:e.target.value}))} style={INP}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                <div><label style={LBL}>Prix (€)</label><input type="number" value={form.prix||''} onChange={e=>setForm(f=>({...f,prix:e.target.value}))} style={INP}/></div>
                <div><label style={LBL}>Honoraires (%)</label><input type="number" value={form.honorairesPct||''} onChange={e=>setForm(f=>({...f,honorairesPct:e.target.value}))} style={INP}/></div>
              </div>
              <div style={{marginBottom:10}}><label style={LBL}>Nom du mandant</label><input value={form.vendeurNom||''} onChange={e=>setForm(f=>({...f,vendeurNom:e.target.value}))} style={INP}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                <div><label style={LBL}>Tél mandant</label><input value={form.vendeurTel||''} onChange={e=>setForm(f=>({...f,vendeurTel:e.target.value}))} style={INP}/></div>
                <div><label style={LBL}>Email mandant</label><input value={form.vendeurEmail||''} onChange={e=>setForm(f=>({...f,vendeurEmail:e.target.value}))} style={INP}/></div>
              </div>
              <button onClick={addMandat} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Créer le mandat</button>
            </>}
            {modal.type==='detail' && modal.data && (()=>{
              const m=modal.data;
              return <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontSize:16,fontWeight:700,margin:0}}>{m.numero}</h3>
                  <span style={{fontSize:11,fontWeight:600,color:typeColors[m.type],background:`${typeColors[m.type]}12`,padding:'3px 10px'}}>{m.type}</span>
                </div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{m.adresse}</div>
                <div style={{fontSize:13,color:L.textSec,marginBottom:12}}>Prix: {m.prix.toLocaleString()}€ · Honoraires: {m.honoraires.toLocaleString()}€</div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Mandant</div>
                <div style={{fontSize:12,color:L.textSec,marginBottom:12}}>{m.vendeur.nom||'—'} · {m.vendeur.tel} · {m.vendeur.email}</div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Historique</div>
                {m.historique.map((h,i)=>(
                  <div key={i} style={{display:'flex',gap:8,padding:'4px 0',fontSize:12,borderBottom:`1px solid ${L.border}`}}>
                    <span style={{color:L.textLight,flexShrink:0}}>{h.date}</span><span>{h.action}</span>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,marginTop:16}}>
                  <button onClick={()=>{showToast('Signature électronique envoyée');setModal(null);}} style={{...BTN,flex:1}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>✍ Envoyer signature</button>
                  <button onClick={()=>setModal(null)} style={{...BTN_OUTLINE,flex:1}}>Fermer</button>
                </div>
              </>;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
