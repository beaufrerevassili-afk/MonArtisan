import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_PARAMS = {
  bareme: [
    { id:1, type:'Vente <100k€', taux:6, fixe:0 },
    { id:2, type:'Vente 100-200k€', taux:5, fixe:0 },
    { id:3, type:'Vente 200-500k€', taux:4, fixe:0 },
    { id:4, type:'Vente >500k€', taux:3.5, fixe:0 },
    { id:5, type:'Location', taux:0, fixe:1, note:'1 mois de loyer' },
    { id:6, type:'Gestion locative', taux:8, fixe:0, note:'% des loyers encaissés' },
  ],
  parrainage: { actif:true, type:'forfait', montant:500, parrainages:[
    { id:1, parrain:'Me Moreau', filleul:'Martin Philippe', statut:'commission_versee', commission:500, date:'2026-03-25' },
    { id:2, parrain:'Dubois Antoine', filleul:'Garcia Lucas', statut:'en_cours', commission:500, date:'2026-04-01' },
    { id:3, parrain:'Benali Karim', filleul:'Kessler Thomas', statut:'en_cours', commission:500, date:'2026-04-05' },
  ]},
  agences: [
    { id:1, nom:'Freample Immo Nice', ville:'Nice', responsable:'Vassili B.' },
    { id:2, nom:'Freample Immo Paris', ville:'Paris', responsable:'—' },
  ],
  abonnement: { plan:'Premium', prixMois:0, credits:999, historique:[
    { date:'2026-04-01', action:'Renouvellement automatique', credits:'+999' },
    { date:'2026-03-15', action:'Signature électronique x3', credits:'-3' },
    { date:'2026-03-01', action:'Renouvellement automatique', credits:'+999' },
  ]},
};

const parrainageStatuts = { en_cours:{color:L.orange,label:'En cours'}, commission_versee:{color:L.green,label:'Commission versée'}, annule:{color:L.red,label:'Annulé'} };

export default function ParametresModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('bareme');

  const params = data.parametres || DEFAULT_PARAMS;
  if(!data.parametres) setData(d=>({...d, parametres:DEFAULT_PARAMS}));

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'bareme',label:'Barème'},{id:'parrainage',label:'Parrainage'},{id:'agences',label:'Multi-agences'},{id:'abonnement',label:'Abonnement'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='bareme' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Barème d'honoraires</h2>
        <div style={{...CARD,padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',padding:'10px 18px',fontSize:10,fontWeight:700,color:L.textSec,borderBottom:`2px solid ${L.border}`}}>
            <span>Type de prestation</span><span style={{textAlign:'right'}}>Taux (%)</span><span style={{textAlign:'right'}}>Fixe (€)</span><span>Notes</span>
          </div>
          {params.bareme.map(b=>(
            <div key={b.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr',padding:'12px 18px',fontSize:13,borderBottom:`1px solid ${L.border}`,alignItems:'center'}}>
              <span style={{fontWeight:600}}>{b.type}</span>
              <span style={{textAlign:'right',color:L.gold,fontWeight:700}}>{b.taux>0?`${b.taux}%`:'—'}</span>
              <span style={{textAlign:'right'}}>{b.fixe>0?`${b.fixe}€`:'—'}</span>
              <span style={{fontSize:11,color:L.textSec}}>{b.note||''}</span>
            </div>
          ))}
        </div>
        <div style={{...CARD,marginTop:12}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>Modèles d'affichage</div>
          <div style={{fontSize:12,color:L.textSec}}>Le barème est automatiquement intégré dans vos mandats, devis et contrats. Les honoraires se calculent en temps réel.</div>
          <button onClick={()=>showToast('Barème mis à jour')} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 12px',marginTop:8}}>Modifier le barème</button>
        </div>
      </>}

      {sub==='parrainage' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Programme de parrainage</h2>
          <div onClick={()=>{setData(d=>({...d,parametres:{...params,parrainage:{...params.parrainage,actif:!params.parrainage.actif}}}));}} style={{width:44,height:24,borderRadius:12,background:params.parrainage.actif?L.green:L.border,cursor:'pointer',position:'relative',transition:'background .2s'}}>
            <div style={{width:20,height:20,borderRadius:10,background:'#fff',position:'absolute',top:2,left:params.parrainage.actif?22:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.15)'}}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Type</div><div style={{fontSize:16,fontWeight:700}}>{params.parrainage.type==='forfait'?'Forfait':'Pourcentage'}</div></div>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Montant</div><div style={{fontSize:16,fontWeight:700,color:L.gold}}>{params.parrainage.montant}{params.parrainage.type==='forfait'?'€':'%'}</div></div>
          <div style={{...CARD,textAlign:'center'}}><div style={{fontSize:10,color:L.textSec}}>Parrainages actifs</div><div style={{fontSize:16,fontWeight:700}}>{params.parrainage.parrainages.length}</div></div>
        </div>
        <div style={{...CARD,padding:0}}>
          {params.parrainage.parrainages.map((p,i)=>{
            const st=parrainageStatuts[p.statut]||parrainageStatuts.en_cours;
            return <div key={p.id} style={{padding:'12px 18px',borderBottom:i<params.parrainage.parrainages.length-1?`1px solid ${L.border}`:'none',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:13}}><strong>{p.parrain}</strong> → {p.filleul}</div>
                <div style={{fontSize:11,color:L.textSec}}>{p.date} · Commission: {p.commission}€</div>
              </div>
              <span style={{fontSize:10,fontWeight:600,color:st.color,background:`${st.color}12`,padding:'3px 8px'}}>{st.label}</span>
            </div>;
          })}
        </div>
      </>}

      {sub==='agences' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Multi-agences</h2>
        {params.agences.map(a=>(
          <div key={a.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>{a.nom}</div>
              <div style={{fontSize:12,color:L.textSec}}>{a.ville} · Responsable: {a.responsable}</div>
            </div>
            <span style={{fontSize:10,color:L.green,fontWeight:600,background:L.greenBg,padding:'3px 8px'}}>Active</span>
          </div>
        ))}
        <button onClick={()=>showToast('Fonctionnalité multi-agences disponible sur le plan Enterprise')} style={{...BTN_OUTLINE,fontSize:11,marginTop:8}}>+ Ajouter une agence</button>
      </>}

      {sub==='abonnement' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Abonnement & Crédits</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{background:L.noir,color:'#fff',padding:'20px',textAlign:'center'}}>
            <div style={{fontSize:10,color:L.gold,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Plan</div>
            <div style={{fontSize:24,fontWeight:200,fontFamily:L.serif}}>{params.abonnement.plan}</div>
          </div>
          <div style={{...CARD,textAlign:'center'}}>
            <div style={{fontSize:10,color:L.textSec}}>Prix</div>
            <div style={{fontSize:24,fontWeight:200,fontFamily:L.serif,color:L.green}}>{params.abonnement.prixMois}€<span style={{fontSize:12}}>/mois</span></div>
          </div>
          <div style={{...CARD,textAlign:'center'}}>
            <div style={{fontSize:10,color:L.textSec}}>Crédits restants</div>
            <div style={{fontSize:24,fontWeight:200,fontFamily:L.serif,color:L.gold}}>{params.abonnement.credits}</div>
          </div>
        </div>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Historique des crédits</div>
          {params.abonnement.historique.map((h,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${L.border}`,fontSize:12}}>
              <span style={{color:L.textSec}}>{h.date}</span>
              <span>{h.action}</span>
              <span style={{fontWeight:600,color:h.credits.startsWith('+')?L.green:L.red}}>{h.credits}</span>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}
