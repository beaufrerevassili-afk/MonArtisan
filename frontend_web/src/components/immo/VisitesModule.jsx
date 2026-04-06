import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_VISITES = [
  { id:1, date:'2026-04-07', heure:'10:00', bien:'8 av Jean Médecin, Nice', acquereur:'Lucas Garcia', duree:30, statut:'planifiee', bonDeVisite:false, compteRendu:'', noteVisiteur:0, signatureAcquereur:false },
  { id:2, date:'2026-04-07', heure:'11:00', bien:'3 rue Rossini, Nice', acquereur:'Thomas Kessler', duree:30, statut:'planifiee', bonDeVisite:true, compteRendu:'', noteVisiteur:0, signatureAcquereur:true },
  { id:3, date:'2026-04-07', heure:'14:30', bien:'24 rue Pastorelli, Nice', acquereur:'Sophie Lefebvre', duree:45, statut:'planifiee', bonDeVisite:false, compteRendu:'', noteVisiteur:0, signatureAcquereur:false },
  { id:4, date:'2026-04-04', heure:'10:00', bien:'8 av Jean Médecin, Nice', acquereur:'Emma Faure', duree:30, statut:'effectuee', bonDeVisite:true, compteRendu:'Bien apprécié mais budget légèrement au-dessus. À suivre.', noteVisiteur:4, signatureAcquereur:true },
  { id:5, date:'2026-04-03', heure:'15:00', bien:'3 rue Rossini, Nice', acquereur:'Camille Morel', duree:45, statut:'effectuee', bonDeVisite:true, compteRendu:'Pas intéressée, trop de travaux selon elle.', noteVisiteur:2, signatureAcquereur:true },
  { id:6, date:'2026-04-02', heure:'09:30', bien:'42 bd Voltaire, Paris 11e', acquereur:'Emma Faure', duree:30, statut:'annulee', bonDeVisite:false, compteRendu:'', noteVisiteur:0, signatureAcquereur:false },
];

const statutColors = { planifiee:{color:L.blue,label:'Planifiée'}, effectuee:{color:L.green,label:'Effectuée'}, annulee:{color:L.red,label:'Annulée'} };

export default function VisitesModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('planning');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [visitesEnLigne, setVisitesEnLigne] = useState(true);

  const visites = data.visites || DEFAULT_VISITES;
  if(!data.visites) setData(d=>({...d, visites:DEFAULT_VISITES}));

  const effectuees = visites.filter(v=>v.statut==='effectuee');
  const noteMoyenne = effectuees.filter(v=>v.noteVisiteur>0).length>0 ? (effectuees.reduce((s,v)=>s+v.noteVisiteur,0)/effectuees.filter(v=>v.noteVisiteur>0).length).toFixed(1) : '—';
  const planifiees = visites.filter(v=>v.statut==='planifiee');
  const tempsTotal = planifiees.reduce((s,v)=>s+v.duree,0);

  const addVisite = () => {
    const v = { id:genId(), date:form.date||'', heure:form.heure||'10:00', bien:form.bien||'', acquereur:form.acquereur||'', duree:Number(form.duree)||30, statut:'planifiee', bonDeVisite:false, compteRendu:'', noteVisiteur:0, signatureAcquereur:false };
    setData(d=>({...d, visites:[v,...(d.visites||DEFAULT_VISITES)]}));
    setModal(null); setForm({}); showToast('Visite planifiée · Confirmation envoyée');
  };

  const markDone = (id) => {
    setData(d=>({...d, visites:(d.visites||[]).map(v=>v.id===id?{...v,statut:'effectuee',bonDeVisite:true,signatureAcquereur:true}:v)}));
    showToast('Visite effectuée');
  };

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'planning',label:'Planning'},{id:'bons',label:'Bons de visite'},{id:'comptes_rendus',label:'Comptes rendus'},{id:'optimisation',label:'Optimisation'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='planning' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Planning visites</h2>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span onClick={()=>setVisitesEnLigne(!visitesEnLigne)} style={{cursor:'pointer',fontSize:11,padding:'4px 10px',background:visitesEnLigne?L.greenBg:L.redBg,color:visitesEnLigne?L.green:L.red,fontWeight:600}}>Visites en ligne: {visitesEnLigne?'ON':'OFF'}</span>
            <button onClick={()=>{setForm({});setModal({type:'add'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Planifier visite</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Planifiées',v:planifiees.length,c:L.blue},{l:'Effectuées',v:effectuees.length,c:L.green},{l:'Note moyenne',v:noteMoyenne+'/5',c:L.gold},{l:'Temps planifié',v:`${tempsTotal}min`,c:L.orange}].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        {visites.sort((a,b)=>b.date.localeCompare(a.date)||b.heure.localeCompare(a.heure)).map(v=>{
          const st=statutColors[v.statut];
          return <div key={v.id} style={{...CARD,marginBottom:6,padding:'12px 18px',display:'flex',alignItems:'center',gap:10,opacity:v.statut==='annulee'?0.4:1}}>
            <div style={{width:50,textAlign:'center',flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:200,fontFamily:L.serif}}>{v.heure}</div>
              <div style={{fontSize:10,color:L.textLight}}>{v.duree}min</div>
            </div>
            <div style={{width:1,height:36,background:L.border}}/>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:13,fontWeight:700}}>{v.bien}</span>
                <span style={{fontSize:10,fontWeight:600,color:st.color,background:`${st.color}12`,padding:'2px 6px'}}>{st.label}</span>
              </div>
              <div style={{fontSize:12,color:L.textSec}}>{v.acquereur} · {v.date}</div>
            </div>
            <div style={{display:'flex',gap:4,flexShrink:0}}>
              {v.statut==='planifiee' && <>
                <button onClick={()=>markDone(v.id)} style={{...BTN,fontSize:10,padding:'4px 10px',background:L.green}}>✓ Effectuée</button>
                <button onClick={()=>{setData(d=>({...d,visites:(d.visites||[]).map(x=>x.id===v.id?{...x,statut:'annulee'}:x)}));showToast('Visite annulée');}} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px',color:L.red,borderColor:L.red+'40'}}>Annuler</button>
              </>}
              {v.bonDeVisite && <span style={{fontSize:10,color:L.green}}>✓ Bon signé</span>}
            </div>
          </div>;
        })}
      </>}

      {sub==='bons' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Bons de visite</h2>
        {visites.filter(v=>v.bonDeVisite).map(v=>(
          <div key={v.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>{v.bien}</div>
              <div style={{fontSize:12,color:L.textSec}}>{v.acquereur} · {v.date} {v.heure}</div>
            </div>
            <div style={{display:'flex',gap:4,alignItems:'center'}}>
              {v.signatureAcquereur && <span style={{fontSize:10,color:L.green,fontWeight:600}}>✓ Signé</span>}
              <button onClick={()=>showToast('Bon de visite imprimé (simulé)')} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px'}}>🖨️</button>
              <button onClick={()=>showToast('Bon envoyé par email')} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px'}}>📧</button>
            </div>
          </div>
        ))}
      </>}

      {sub==='comptes_rendus' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Comptes rendus</h2>
        {effectuees.map(v=>(
          <div key={v.id} style={{...CARD,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div><span style={{fontSize:14,fontWeight:700}}>{v.bien}</span><span style={{fontSize:12,color:L.textSec,marginLeft:8}}>{v.acquereur} · {v.date}</span></div>
              {v.noteVisiteur>0 && <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(n=><span key={n} style={{color:n<=v.noteVisiteur?L.gold:L.border}}>★</span>)}</div>}
            </div>
            {v.compteRendu ? <div style={{fontSize:12,color:L.textSec,background:L.cream,padding:'10px 14px',fontStyle:'italic'}}>{v.compteRendu}</div>
            : <button onClick={()=>{
              setData(d=>({...d,visites:(d.visites||[]).map(x=>x.id===v.id?{...x,compteRendu:'Compte rendu auto: visite effectuée, bien conforme à l\'annonce.'}:x)}));
              showToast('Compte rendu auto généré');
            }} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 12px'}}>Générer compte rendu auto</button>}
          </div>
        ))}
      </>}

      {sub==='optimisation' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Optimisation des visites</h2>
        <div style={{...CARD,marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Temps total planifié: {tempsTotal} minutes ({planifiees.length} visites)</div>
          <div style={{fontSize:12,color:L.textSec,marginBottom:12}}>Temps de trajet estimé entre les visites: ~15 min</div>
          <div style={{background:L.noir,color:'#fff',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13}}>Durée totale estimée de la tournée</span>
            <span style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:L.gold}}>{tempsTotal + (planifiees.length-1)*15} min</span>
          </div>
        </div>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Statistiques de conversion</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            <div style={{background:L.cream,padding:'12px',textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Visites → Offres</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:L.gold}}>{effectuees.length>0?Math.round(1/effectuees.length*100):0}%</div></div>
            <div style={{background:L.cream,padding:'12px',textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Note moyenne</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{noteMoyenne}/5</div></div>
            <div style={{background:L.cream,padding:'12px',textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Taux annulation</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif,color:L.red}}>{visites.length>0?Math.round(visites.filter(v=>v.statut==='annulee').length/visites.length*100):0}%</div></div>
          </div>
        </div>
      </>}

      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:420,padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Planifier une visite</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={LBL}>Date</label><input type="date" value={form.date||''} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>Heure</label><input type="time" value={form.heure||'10:00'} onChange={e=>setForm(f=>({...f,heure:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{marginBottom:10}}><label style={LBL}>Bien</label><input value={form.bien||''} onChange={e=>setForm(f=>({...f,bien:e.target.value}))} style={INP} placeholder="Adresse du bien"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              <div><label style={LBL}>Acquéreur</label><input value={form.acquereur||''} onChange={e=>setForm(f=>({...f,acquereur:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>Durée (min)</label><input type="number" value={form.duree||'30'} onChange={e=>setForm(f=>({...f,duree:e.target.value}))} style={INP}/></div>
            </div>
            <button onClick={addVisite} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Planifier</button>
          </div>
        </div>
      )}
    </div>
  );
}
