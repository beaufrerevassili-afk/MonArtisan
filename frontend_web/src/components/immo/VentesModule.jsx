import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const PIPELINE_STAGES = ['prospection','estimation','mandat','commercialisation','visite','offre','compromis','acte'];
const stageLabels = {prospection:'Prospection',estimation:'Estimation',mandat:'Mandat',commercialisation:'Commercialisation',visite:'Visites',offre:'Offre',compromis:'Compromis',acte:'Acte'};
const stageColors = {prospection:L.textSec,estimation:L.blue,mandat:'#7C3AED',commercialisation:L.orange,visite:L.gold,offre:'#EC4899',compromis:L.green,acte:L.noir};

const DEFAULT_VENTES = [
  { id:1, bien:'8 av Jean Médecin, Nice', acquereur:'Lucas Garcia', vendeur:'Philippe Martin', mandatId:1, statut:'visite', prix:210000, honoraires:8400, offres:[], compromis:null, timeline:[{date:'2026-03-20',action:'Estimation réalisée'},{date:'2026-03-25',action:'Mandat signé'},{date:'2026-04-01',action:'Mise en commercialisation'},{date:'2026-04-04',action:'Visite Garcia'}] },
  { id:2, bien:'3 rue Rossini, Nice', acquereur:'Thomas Kessler', vendeur:'Catherine Petit', mandatId:2, statut:'offre', prix:310000, honoraires:12400, offres:[{id:1,prix:295000,date:'2026-04-03',statut:'en_attente'}], compromis:null, timeline:[{date:'2026-02-15',action:'Mandat signé'},{date:'2026-03-15',action:'Visites'},{date:'2026-04-03',action:'Offre 295k€ reçue'}] },
  { id:3, bien:'42 bd Voltaire, Paris 11e', acquereur:'Emma Faure', vendeur:'SCI Patrimoine 75', mandatId:null, statut:'compromis', prix:280000, honoraires:11200, offres:[{id:2,prix:265000,date:'2026-03-10',statut:'refusee'},{id:3,prix:275000,date:'2026-03-15',statut:'acceptee'}], compromis:{date:'2026-03-28',prix:275000,notaire:'Me Moreau',conditions:['Obtention prêt sous 45j','Absence servitude']}, timeline:[{date:'2026-01-15',action:'Mandat'},{date:'2026-02-20',action:'Visites'},{date:'2026-03-15',action:'Offre acceptée 275k€'},{date:'2026-03-28',action:'Compromis signé'}] },
  { id:4, bien:'15 rue Lepic, Paris 18e', acquereur:'', vendeur:'Succession Dupont', mandatId:null, statut:'commercialisation', prix:350000, honoraires:14000, offres:[], compromis:null, timeline:[{date:'2026-04-01',action:'Mise en vente'}] },
];

export default function VentesModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('pipeline');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const ventes = data.ventes || DEFAULT_VENTES;
  if(!data.ventes) setData(d=>({...d, ventes:DEFAULT_VENTES}));

  const caPipeline = ventes.filter(v=>v.statut!=='acte').reduce((s,v)=>s+v.honoraires,0);
  const caRealise = ventes.filter(v=>v.statut==='acte').reduce((s,v)=>s+v.honoraires,0);

  const advanceStage = (id) => {
    setData(d=>({...d, ventes:(d.ventes||[]).map(v=>{
      if(v.id!==id) return v;
      const idx = PIPELINE_STAGES.indexOf(v.statut);
      if(idx<PIPELINE_STAGES.length-1) {
        const next = PIPELINE_STAGES[idx+1];
        return {...v, statut:next, timeline:[...v.timeline,{date:new Date().toISOString().slice(0,10),action:`→ ${stageLabels[next]}`}]};
      }
      return v;
    })}));
    showToast('Étape suivante');
  };

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'pipeline',label:'Pipeline'},{id:'offres',label:'Offres'},{id:'compromis',label:'Compromis'},{id:'suivi',label:'Suivi financier'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='pipeline' && <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Ventes en cours',v:ventes.length,c:L.blue},{l:'CA pipeline',v:`${caPipeline.toLocaleString()}€`,c:L.gold},{l:'CA réalisé',v:`${caRealise.toLocaleString()}€`,c:L.green},{l:'Honoraires moy.',v:ventes.length?`${Math.round(ventes.reduce((s,v)=>s+v.honoraires,0)/ventes.length).toLocaleString()}€`:'-',c:'#7C3AED'}].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        {/* Pipeline stages */}
        <div style={{display:'flex',gap:1,marginBottom:16,background:L.border}}>
          {PIPELINE_STAGES.map(stage=>{
            const count = ventes.filter(v=>v.statut===stage).length;
            return <div key={stage} style={{flex:1,background:count>0?`${stageColors[stage]}08`:L.white,padding:'10px 8px',textAlign:'center'}}>
              <div style={{fontSize:10,fontWeight:700,color:stageColors[stage],textTransform:'uppercase',marginBottom:4}}>{stageLabels[stage]}</div>
              <div style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:count>0?stageColors[stage]:L.textLight}}>{count}</div>
            </div>;
          })}
        </div>
        {ventes.map(v=>(
          <div key={v.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between',borderLeft:`4px solid ${stageColors[v.statut]}`}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:14,fontWeight:700}}>{v.bien}</span>
                <span style={{fontSize:10,fontWeight:600,color:stageColors[v.statut],background:`${stageColors[v.statut]}12`,padding:'2px 8px'}}>{stageLabels[v.statut]}</span>
              </div>
              <div style={{fontSize:12,color:L.textSec}}>{v.vendeur} → {v.acquereur||'En recherche'} · {v.prix.toLocaleString()}€ · Honoraires: {v.honoraires.toLocaleString()}€</div>
            </div>
            <button onClick={()=>advanceStage(v.id)} style={{...BTN,fontSize:10,padding:'5px 14px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Étape suivante →</button>
          </div>
        ))}
      </>}

      {sub==='offres' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Offres d'achat</h2>
        {ventes.filter(v=>v.offres?.length>0).map(v=>(
          <div key={v.id} style={{...CARD,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{v.bien}</div>
            {v.offres.map(o=>(
              <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${L.border}`}}>
                <div>
                  <span style={{fontSize:14,fontWeight:700,color:L.gold}}>{o.prix.toLocaleString()}€</span>
                  <span style={{fontSize:12,color:L.textSec,marginLeft:8}}>{o.date}</span>
                </div>
                <div style={{display:'flex',gap:4}}>
                  {o.statut==='en_attente' && <>
                    <button onClick={()=>{setData(d=>({...d,ventes:(d.ventes||[]).map(x=>x.id===v.id?{...x,offres:x.offres.map(of=>of.id===o.id?{...of,statut:'acceptee'}:of)}:x)}));showToast('Offre acceptée');}} style={{...BTN,fontSize:10,padding:'4px 10px',background:L.green}}>Accepter</button>
                    <button onClick={()=>{setData(d=>({...d,ventes:(d.ventes||[]).map(x=>x.id===v.id?{...x,offres:x.offres.map(of=>of.id===o.id?{...of,statut:'refusee'}:of)}:x)}));showToast('Offre refusée');}} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px',color:L.red,borderColor:L.red+'40'}}>Refuser</button>
                    <button onClick={()=>showToast('Contre-offre envoyée')} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px'}}>Contre-offre</button>
                  </>}
                  {o.statut!=='en_attente' && <span style={{fontSize:10,fontWeight:600,color:o.statut==='acceptee'?L.green:L.red}}>{o.statut==='acceptee'?'✓ Acceptée':'✕ Refusée'}</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
        {ventes.filter(v=>v.offres?.length>0).length===0 && <div style={{...CARD,textAlign:'center',color:L.textLight}}>Aucune offre en cours</div>}
      </>}

      {sub==='compromis' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Compromis de vente</h2>
        {ventes.filter(v=>v.compromis).map(v=>(
          <div key={v.id} style={{...CARD,marginBottom:12,borderLeft:`4px solid ${L.green}`}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{v.bien}</div>
            <div style={{fontSize:13,color:L.textSec}}>Prix: <strong>{v.compromis.prix.toLocaleString()}€</strong> · Notaire: {v.compromis.notaire} · Date: {v.compromis.date}</div>
            {v.compromis.conditions?.length>0 && <div style={{marginTop:8}}>
              <div style={{fontSize:11,fontWeight:600,color:L.textSec,marginBottom:4}}>Conditions suspensives:</div>
              {v.compromis.conditions.map((c,i)=><div key={i} style={{fontSize:12,color:L.textSec,padding:'2px 0'}}>• {c}</div>)}
            </div>}
            <div style={{display:'flex',gap:6,marginTop:12}}>
              <button onClick={()=>showToast('Notification SRU envoyée')} style={{...BTN,fontSize:10,padding:'5px 12px',background:L.blue}}>📨 Notification SRU</button>
              <button onClick={()=>showToast('Dossier envoyé au notaire')} style={{...BTN,fontSize:10,padding:'5px 12px',background:'#7C3AED'}}>📤 Envoyer au notaire</button>
              <button onClick={()=>showToast('Signature électronique envoyée')} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 12px'}}>✍ Signature</button>
            </div>
          </div>
        ))}
        {ventes.filter(v=>v.compromis).length===0 && <div style={{...CARD,textAlign:'center',color:L.textLight}}>Aucun compromis en cours</div>}
      </>}

      {sub==='suivi' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Suivi financier</h2>
        <div style={{...CARD,padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 14px',fontSize:10,fontWeight:700,color:L.textSec,borderBottom:`2px solid ${L.border}`}}>
            <span>Bien</span><span style={{textAlign:'right'}}>Prix</span><span style={{textAlign:'right'}}>Honoraires</span><span style={{textAlign:'right'}}>Étape</span><span style={{textAlign:'right'}}>Timeline</span>
          </div>
          {ventes.map(v=>(
            <div key={v.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 14px',fontSize:12,borderBottom:`1px solid ${L.border}`,alignItems:'center'}}>
              <span style={{fontWeight:600}}>{v.bien}</span>
              <span style={{textAlign:'right'}}>{v.prix.toLocaleString()}€</span>
              <span style={{textAlign:'right',color:L.gold,fontWeight:700}}>{v.honoraires.toLocaleString()}€</span>
              <span style={{textAlign:'right',color:stageColors[v.statut],fontWeight:600}}>{stageLabels[v.statut]}</span>
              <span style={{textAlign:'right',fontSize:11,color:L.textLight}}>{v.timeline.length} étapes</span>
            </div>
          ))}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'12px 14px',fontSize:12,fontWeight:800,background:L.cream}}>
            <span>TOTAL</span><span style={{textAlign:'right'}}>{ventes.reduce((s,v)=>s+v.prix,0).toLocaleString()}€</span><span style={{textAlign:'right',color:L.gold}}>{ventes.reduce((s,v)=>s+v.honoraires,0).toLocaleString()}€</span><span/><span/>
          </div>
        </div>
      </>}
    </div>
  );
}
