import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_ESTIMATIONS = [
  { id:1, adresse:'24 rue Pastorelli, Nice', type:'Appartement', surface:52, etage:3, etat:'bon', dateCreation:'2026-03-15', statut:'terminee', comparables:[{adresse:'18 rue Pastorelli',prix:240000,surface:48,prixM2:5000},{adresse:'30 rue Pastorelli',prix:260000,surface:55,prixM2:4727},{adresse:'12 rue Gioffredo',prix:235000,surface:50,prixM2:4700}], estimationBasse:245000, estimationHaute:275000, estimationMediane:260000, notes:'Bien en bon état, lumineux, balcon sud', contactId:102, mandatId:null },
  { id:2, adresse:'8 av Jean Médecin, Nice', type:'Appartement', surface:45, etage:5, etat:'moyen', dateCreation:'2026-03-20', statut:'mandat_signe', comparables:[{adresse:'12 av Médecin',prix:195000,surface:42,prixM2:4643},{adresse:'5 rue Halévy',prix:210000,surface:48,prixM2:4375}], estimationBasse:190000, estimationHaute:215000, estimationMediane:202000, notes:'Succession, vente rapide souhaitée', contactId:102, mandatId:1 },
  { id:3, adresse:'15 bd Victor Hugo, Nice', type:'Appartement', surface:75, etage:4, etat:'bon', dateCreation:'2026-04-01', statut:'en_cours', comparables:[], estimationBasse:0, estimationHaute:0, estimationMediane:0, notes:'RDV estimation prévu le 10/04', contactId:null, mandatId:null },
  { id:4, adresse:'3 rue Rossini, Nice', type:'Appartement', surface:68, etage:2, etat:'a_renover', dateCreation:'2026-02-28', statut:'sans_suite', comparables:[{adresse:'7 rue Rossini',prix:280000,surface:65,prixM2:4308},{adresse:'1 rue Dalpozzo',prix:310000,surface:72,prixM2:4306}], estimationBasse:270000, estimationHaute:310000, estimationMediane:290000, notes:'Propriétaire pas pressée, à relancer dans 3 mois', contactId:106, mandatId:null },
  { id:5, adresse:'42 bd Gambetta, Nice', type:'Appartement', surface:38, etage:1, etat:'bon', dateCreation:'2026-04-03', statut:'en_attente', comparables:[], estimationBasse:0, estimationHaute:0, estimationMediane:0, notes:'Demande reçue via site web', contactId:110, mandatId:null },
];

const statutColors = { en_attente:{bg:L.blueBg,color:L.blue,label:'En attente'}, en_cours:{bg:'#FFFBEB',color:L.orange,label:'En cours'}, terminee:{bg:L.greenBg,color:L.green,label:'Terminée'}, sans_suite:{bg:L.redBg,color:L.red,label:'Sans suite'}, mandat_signe:{bg:`${L.gold}12`,color:L.gold,label:'Mandat signé'} };

export default function EstimationModule({ data, setData, showToast, genId, biens }) {
  const [sub, setSub] = useState('estimations');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const estimations = data.estimations || DEFAULT_ESTIMATIONS;
  if(!data.estimations) setData(d=>({...d, estimations:DEFAULT_ESTIMATIONS}));

  const stats = { total:estimations.length, terminees:estimations.filter(e=>e.statut==='terminee'||e.statut==='mandat_signe').length, mandats:estimations.filter(e=>e.statut==='mandat_signe').length, ssSuite:estimations.filter(e=>e.statut==='sans_suite').length };
  const tauxTransfo = stats.terminees>0?Math.round(stats.mandats/(stats.terminees+stats.ssSuite)*100):0;

  const addEstimation = () => {
    const e = { id:genId(), adresse:form.adresse||'', type:form.type||'Appartement', surface:Number(form.surface)||0, etage:Number(form.etage)||0, etat:form.etat||'bon', dateCreation:new Date().toISOString().slice(0,10), statut:'en_attente', comparables:[], estimationBasse:0, estimationHaute:0, estimationMediane:0, notes:form.notes||'', contactId:null, mandatId:null };
    setData(d=>({...d, estimations:[e,...(d.estimations||DEFAULT_ESTIMATIONS)]}));
    setModal(null); setForm({}); showToast('Estimation créée');
  };

  const updateStatut = (id, statut) => {
    setData(d=>({...d, estimations:(d.estimations||[]).map(e=>e.id===id?{...e,statut}:e)}));
    showToast('Statut mis à jour');
  };

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'estimations',label:'Estimations'},{id:'comparatifs',label:'Comparatifs'},{id:'rapports',label:'Rapports'},{id:'suivi',label:'Suivi & Relances'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='estimations' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Estimations ({estimations.length})</h2>
          <button onClick={()=>{setForm({type:'Appartement',etat:'bon'});setModal({type:'add'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Nouvelle estimation</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Total',v:stats.total,c:L.blue},{l:'Terminées',v:stats.terminees,c:L.green},{l:'Mandats signés',v:stats.mandats,c:L.gold},{l:'Taux transformation',v:`${tauxTransfo}%`,c:tauxTransfo>30?L.green:L.orange}].map(k=>(
            <div key={k.l} style={{...CARD,position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:2,background:k.c}}/><div style={{fontSize:10,color:L.textLight,textTransform:'uppercase',marginBottom:4}}>{k.l}</div><div style={{fontSize:20,fontWeight:200,fontFamily:L.serif}}>{k.v}</div></div>
          ))}
        </div>
        {estimations.map(est=>{
          const st = statutColors[est.statut]||statutColors.en_attente;
          return <div key={est.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:14,fontWeight:700}}>{est.adresse}</span>
                <span style={{fontSize:10,fontWeight:600,color:st.color,background:st.bg,padding:'2px 8px'}}>{st.label}</span>
              </div>
              <div style={{fontSize:12,color:L.textSec}}>{est.type} · {est.surface}m² · Étage {est.etage} · État: {est.etat} · {est.dateCreation}</div>
              {est.estimationMediane>0 && <div style={{fontSize:13,fontWeight:700,color:L.gold,marginTop:4}}>{est.estimationBasse.toLocaleString()}€ — {est.estimationMediane.toLocaleString()}€ — {est.estimationHaute.toLocaleString()}€</div>}
            </div>
            <div style={{display:'flex',gap:4,flexShrink:0}}>
              {est.statut==='en_attente' && <button onClick={()=>updateStatut(est.id,'en_cours')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.orange}}>Démarrer</button>}
              {est.statut==='en_cours' && <button onClick={()=>updateStatut(est.id,'terminee')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.green}}>Terminer</button>}
              {est.statut==='terminee' && <button onClick={()=>{updateStatut(est.id,'mandat_signe');showToast('Transféré en mandat');}} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.gold}}>→ Mandat</button>}
              {est.statut==='sans_suite' && <button onClick={()=>showToast('Relance envoyée')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.red}}>Relancer</button>}
              <button onClick={()=>setModal({type:'rapport',data:est})} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 10px'}}>Rapport</button>
            </div>
          </div>;
        })}
      </>}

      {sub==='comparatifs' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Méthode comparative</h2>
        <p style={{fontSize:13,color:L.textSec,marginBottom:16}}>Sélectionnez une estimation terminée pour voir les comparables et la méthode de calcul.</p>
        {estimations.filter(e=>e.comparables?.length>0).map(est=>(
          <div key={est.id} style={{...CARD,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>{est.adresse} — {est.surface}m²</div>
            <div style={{...CARD,padding:0,marginBottom:10}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'8px 14px',fontSize:10,fontWeight:700,color:L.textSec,borderBottom:`2px solid ${L.border}`}}>
                <span>Comparable</span><span style={{textAlign:'right'}}>Prix</span><span style={{textAlign:'right'}}>Surface</span><span style={{textAlign:'right'}}>Prix/m²</span>
              </div>
              {est.comparables.map((c,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'8px 14px',fontSize:12,borderBottom:`1px solid ${L.border}`}}>
                  <span>{c.adresse}</span><span style={{textAlign:'right'}}>{c.prix.toLocaleString()}€</span><span style={{textAlign:'right'}}>{c.surface}m²</span><span style={{textAlign:'right',fontWeight:700,color:L.gold}}>{c.prixM2}€</span>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'8px 14px',fontSize:12,fontWeight:800,background:L.cream}}>
                <span>Moyenne</span><span/><span/><span style={{textAlign:'right',color:L.gold}}>{Math.round(est.comparables.reduce((s,c)=>s+c.prixM2,0)/est.comparables.length)}€/m²</span>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              {[{l:'Estimation basse',v:est.estimationBasse,c:L.orange},{l:'Estimation médiane',v:est.estimationMediane,c:L.gold},{l:'Estimation haute',v:est.estimationHaute,c:L.green}].map(k=>(
                <div key={k.l} style={{background:L.cream,padding:'12px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:L.textSec,textTransform:'uppercase',marginBottom:4}}>{k.l}</div>
                  <div style={{fontSize:18,fontWeight:200,color:k.c,fontFamily:L.serif}}>{k.v.toLocaleString()}€</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>}

      {sub==='rapports' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Rapports d'estimation</h2>
        {estimations.filter(e=>e.estimationMediane>0).map(est=>(
          <div key={est.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>{est.adresse}</div>
              <div style={{fontSize:12,color:L.textSec}}>{est.estimationMediane.toLocaleString()}€ · {est.dateCreation}</div>
            </div>
            <div style={{display:'flex',gap:4}}>
              <button onClick={()=>setModal({type:'rapport',data:est})} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 12px'}}>Voir rapport</button>
              <button onClick={()=>showToast('Rapport envoyé par email')} style={{...BTN,fontSize:10,padding:'5px 12px',background:L.blue}}>Envoyer</button>
            </div>
          </div>
        ))}
      </>}

      {sub==='suivi' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Suivi & Relances automatisées</h2>
        <div style={{...CARD,marginBottom:12,borderLeft:`4px solid ${L.red}`}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>⚠️ Estimations sans suite à relancer ({stats.ssSuite})</div>
          {estimations.filter(e=>e.statut==='sans_suite').map(est=>(
            <div key={est.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${L.border}`}}>
              <div><span style={{fontSize:13,fontWeight:600}}>{est.adresse}</span><span style={{fontSize:12,color:L.textSec,marginLeft:8}}>Estimé le {est.dateCreation}</span></div>
              <button onClick={()=>showToast('Relance envoyée')} style={{...BTN,fontSize:10,padding:'5px 12px',background:L.red}}>Relancer</button>
            </div>
          ))}
          {stats.ssSuite===0 && <div style={{fontSize:13,color:L.textLight}}>Aucune estimation sans suite</div>}
        </div>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>Rappels de suivi automatiques</div>
          <div style={{fontSize:12,color:L.textSec}}>Les estimations "en cours" depuis plus de 7 jours génèrent un rappel automatique pour le conseiller.</div>
          {estimations.filter(e=>e.statut==='en_cours').map(est=>(
            <div key={est.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${L.border}`,marginTop:6}}>
              <span style={{fontSize:13}}>{est.adresse} — en cours depuis le {est.dateCreation}</span>
              <span style={{fontSize:11,color:L.orange,fontWeight:600}}>Rappel actif</span>
            </div>
          ))}
        </div>
      </>}

      {/* MODALS */}
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:modal.type==='rapport'?600:460,maxHeight:'85vh',overflowY:'auto',padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            {modal.type==='add' && <>
              <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Nouvelle estimation</h3>
              <div style={{marginBottom:10}}><label style={LBL}>Adresse *</label><input value={form.adresse||''} onChange={e=>setForm(f=>({...f,adresse:e.target.value}))} style={INP} placeholder="24 rue Pastorelli, Nice"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                <div><label style={LBL}>Type</label><select value={form.type||'Appartement'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={INP}><option>Appartement</option><option>Maison</option><option>Studio</option><option>Local commercial</option><option>Terrain</option></select></div>
                <div><label style={LBL}>Surface (m²)</label><input type="number" value={form.surface||''} onChange={e=>setForm(f=>({...f,surface:e.target.value}))} style={INP}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                <div><label style={LBL}>Étage</label><input type="number" value={form.etage||''} onChange={e=>setForm(f=>({...f,etage:e.target.value}))} style={INP}/></div>
                <div><label style={LBL}>État</label><select value={form.etat||'bon'} onChange={e=>setForm(f=>({...f,etat:e.target.value}))} style={INP}><option value="bon">Bon état</option><option value="moyen">État moyen</option><option value="a_renover">À rénover</option></select></div>
              </div>
              <div style={{marginBottom:14}}><label style={LBL}>Notes</label><textarea value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} style={{...INP,resize:'vertical'}}/></div>
              <button onClick={addEstimation} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Créer l'estimation</button>
            </>}
            {modal.type==='rapport' && modal.data && (()=>{
              const est = modal.data;
              return <>
                <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 4px'}}>Rapport d'estimation</h3>
                <div style={{fontSize:11,color:L.textLight,marginBottom:16}}>Généré le {new Date().toLocaleDateString('fr-FR')}</div>
                <div style={{border:`2px solid ${L.gold}`,padding:'20px',marginBottom:16}}>
                  <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>{est.adresse}</div>
                  <div style={{fontSize:13,color:L.textSec}}>{est.type} · {est.surface}m² · Étage {est.etage} · État: {est.etat}</div>
                </div>
                {est.comparables?.length>0 && <>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Biens comparables retenus</div>
                  {est.comparables.map((c,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${L.border}`,fontSize:12}}>
                      <span>{c.adresse}</span><span>{c.prix.toLocaleString()}€ ({c.prixM2}€/m²)</span>
                    </div>
                  ))}
                </>}
                <div style={{background:L.noir,color:'#fff',padding:'20px',marginTop:16,textAlign:'center'}}>
                  <div style={{fontSize:11,color:L.gold,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>Estimation de valeur</div>
                  <div style={{display:'flex',justifyContent:'center',gap:24}}>
                    <div><div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Basse</div><div style={{fontSize:18,fontWeight:200,fontFamily:L.serif}}>{est.estimationBasse.toLocaleString()}€</div></div>
                    <div><div style={{fontSize:11,color:L.gold}}>Médiane</div><div style={{fontSize:24,fontWeight:200,fontFamily:L.serif,color:L.gold}}>{est.estimationMediane.toLocaleString()}€</div></div>
                    <div><div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Haute</div><div style={{fontSize:18,fontWeight:200,fontFamily:L.serif}}>{est.estimationHaute.toLocaleString()}€</div></div>
                  </div>
                </div>
                {est.notes && <div style={{background:L.cream,padding:'12px 16px',marginTop:12,fontSize:12,color:L.textSec}}>{est.notes}</div>}
                <div style={{display:'flex',gap:8,marginTop:16}}>
                  <button onClick={()=>showToast('PDF téléchargé (simulé)')} style={{...BTN,flex:1}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>📄 Télécharger PDF</button>
                  <button onClick={()=>showToast('Envoyé par email')} style={{...BTN_OUTLINE,flex:1}}>📧 Envoyer</button>
                </div>
              </>;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
