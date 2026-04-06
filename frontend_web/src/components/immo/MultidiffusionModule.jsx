import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_MULTI = {
  portails: [
    { id:1, nom:'SeLoger', emoji:'🔵', actif:true, maxAnnonces:10, geolocalisation:'exacte', annonces:['MAN-2026-001'], stats:{vues:1240,emails:18,appels:7,budget:350,ca:8400} },
    { id:2, nom:'LeBonCoin', emoji:'🟠', actif:true, maxAnnonces:20, geolocalisation:'exacte', annonces:['MAN-2026-001','MAN-2026-002'], stats:{vues:3500,emails:45,appels:12,budget:0,ca:12400} },
    { id:3, nom:'Bien\'ici', emoji:'🟢', actif:true, maxAnnonces:10, geolocalisation:'partielle', annonces:['MAN-2026-001'], stats:{vues:680,emails:8,appels:3,budget:120,ca:0} },
    { id:4, nom:'Logic-Immo', emoji:'🟣', actif:false, maxAnnonces:5, geolocalisation:'partielle', annonces:[], stats:{vues:0,emails:0,appels:0,budget:0,ca:0} },
    { id:5, nom:'PAP', emoji:'🔴', actif:false, maxAnnonces:5, geolocalisation:'exacte', annonces:[], stats:{vues:0,emails:0,appels:0,budget:0,ca:0} },
    { id:6, nom:'Explorimmo', emoji:'🩷', actif:false, maxAnnonces:5, geolocalisation:'partielle', annonces:[], stats:{vues:0,emails:0,appels:0,budget:0,ca:0} },
    { id:7, nom:'Green-Acres', emoji:'🌿', actif:false, maxAnnonces:5, geolocalisation:'exacte', annonces:[], stats:{vues:0,emails:0,appels:0,budget:0,ca:0} },
    { id:8, nom:'Freample Logement', emoji:'⭐', actif:true, maxAnnonces:99, geolocalisation:'exacte', annonces:['MAN-2026-001','MAN-2026-002'], stats:{vues:420,emails:6,appels:2,budget:0,ca:0} },
  ],
};

export default function MultidiffusionModule({ data, setData, showToast, genId }) {
  const multi = data.multidiffusion || DEFAULT_MULTI;
  if(!data.multidiffusion) setData(d=>({...d, multidiffusion:DEFAULT_MULTI}));

  const portails = multi.portails||[];
  const actifs = portails.filter(p=>p.actif);
  const totalVues = portails.reduce((s,p)=>s+p.stats.vues,0);
  const totalLeads = portails.reduce((s,p)=>s+p.stats.emails+p.stats.appels,0);
  const totalBudget = portails.reduce((s,p)=>s+p.stats.budget,0);
  const totalCA = portails.reduce((s,p)=>s+p.stats.ca,0);

  const togglePortail = (id) => {
    setData(d=>({...d, multidiffusion:{...multi, portails:portails.map(p=>p.id===id?{...p,actif:!p.actif}:p)}}));
  };

  const setGeoloc = (id, geo) => {
    setData(d=>({...d, multidiffusion:{...multi, portails:portails.map(p=>p.id===id?{...p,geolocalisation:geo}:p)}}));
  };

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Multidiffusion ({actifs.length} portails actifs)</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[{l:'Vues totales',v:totalVues.toLocaleString(),c:L.blue},{l:'Leads (emails+appels)',v:totalLeads,c:L.green},{l:'Budget dépensé',v:`${totalBudget}€`,c:L.red},{l:'CA généré',v:`${totalCA.toLocaleString()}€`,c:L.gold}].map(k=>(
          <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
        {portails.map(p=>(
          <div key={p.id} style={{...CARD,padding:'14px 18px',display:'flex',alignItems:'center',gap:14,opacity:p.actif?1:0.5}}>
            <span style={{fontSize:24}}>{p.emoji}</span>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14,fontWeight:700}}>{p.nom}</span>
                <span style={{fontSize:10,fontWeight:600,color:p.actif?L.green:L.red,background:p.actif?L.greenBg:L.redBg,padding:'2px 8px'}}>{p.actif?'Actif':'Inactif'}</span>
                <span style={{fontSize:10,color:L.textSec}}>{p.annonces.length} annonce{p.annonces.length>1?'s':''} · Max {p.maxAnnonces}</span>
              </div>
              {p.actif && <div style={{display:'flex',gap:12,fontSize:11,color:L.textSec,marginTop:4}}>
                <span>{p.stats.vues} vues</span><span>{p.stats.emails} emails</span><span>{p.stats.appels} appels</span>
                {p.stats.budget>0 && <span style={{color:L.red}}>{p.stats.budget}€ budget</span>}
                {p.stats.ca>0 && <span style={{color:L.green,fontWeight:600}}>{p.stats.ca.toLocaleString()}€ CA</span>}
              </div>}
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
              <select value={p.geolocalisation} onChange={e=>setGeoloc(p.id,e.target.value)} style={{padding:'4px 8px',fontSize:10,border:`1px solid ${L.border}`,fontFamily:L.font,background:L.white}}>
                <option value="exacte">📍 Exacte</option>
                <option value="partielle">📍 Partielle</option>
              </select>
              <button onClick={()=>togglePortail(p.id)} style={{...p.actif?{...BTN_OUTLINE,fontSize:10,padding:'5px 12px',color:L.red,borderColor:L.red+'40'}:{...BTN,fontSize:10,padding:'5px 12px',background:L.green}}}>{p.actif?'Désactiver':'Activer'}</button>
            </div>
          </div>
        ))}
      </div>

      <div style={CARD}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Budget vs CA par portail</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:16,height:120}}>
          {portails.filter(p=>p.actif).map(p=>{
            const max = Math.max(...portails.map(x=>Math.max(x.stats.ca,x.stats.budget)))||1;
            return <div key={p.id} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <div style={{display:'flex',gap:2,alignItems:'flex-end',height:80}}>
                <div style={{width:16,background:L.red,borderRadius:'2px 2px 0 0',height:Math.max(4,p.stats.budget/max*70),opacity:0.7}} title={`Budget: ${p.stats.budget}€`}/>
                <div style={{width:16,background:L.green,borderRadius:'2px 2px 0 0',height:Math.max(4,p.stats.ca/max*70),opacity:0.7}} title={`CA: ${p.stats.ca}€`}/>
              </div>
              <div style={{fontSize:10,color:L.textSec,textAlign:'center'}}>{p.nom.split(' ')[0]}</div>
            </div>;
          })}
        </div>
        <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:8,fontSize:11}}>
          <span style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:10,height:10,background:L.red,opacity:0.7}}/>Budget</span>
          <span style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:10,height:10,background:L.green,opacity:0.7}}/>CA généré</span>
        </div>
      </div>
    </div>
  );
}
