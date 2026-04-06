import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_ACQUEREURS = [
  { id:1, nom:'Lefebvre', prenom:'Sophie', email:'sophie.lefebvre@outlook.com', tel:'0645678901', type:'acquereur', budgetMin:250000, budgetMax:300000, surfaceMin:40, nbPieces:2, secteursVoulus:['Paris 18e','Paris 20e'], typeRecherche:'Appartement', centresInteret:['premier achat','calme','métro proche'], score:65, derniereRelance:'2026-03-28', mandatRecherche:false, statut:'actif' },
  { id:2, nom:'Garcia', prenom:'Lucas', email:'lucas.garcia@gmail.com', tel:'0623456789', type:'acquereur', budgetMin:150000, budgetMax:200000, surfaceMin:20, nbPieces:1, secteursVoulus:['Paris 18e','Nice Centre'], typeRecherche:'Studio', centresInteret:['investissement','LMNP','rendement >5%'], score:85, derniereRelance:'2026-04-04', mandatRecherche:true, statut:'actif' },
  { id:3, nom:'Morel', prenom:'Camille', email:'c.morel@gmail.com', tel:'0667890123', type:'acquereur', budgetMin:350000, budgetMax:450000, surfaceMin:70, nbPieces:3, secteursVoulus:['Nice Gambetta','Nice Libération'], typeRecherche:'Appartement', centresInteret:['famille','école proche','parking'], score:72, derniereRelance:'2026-04-01', mandatRecherche:false, statut:'actif' },
  { id:4, nom:'Bernard', prenom:'Nathalie', email:'nathalie.b@gmail.com', tel:'0656789012', type:'locataire', budgetMin:600, budgetMax:900, surfaceMin:30, nbPieces:2, secteursVoulus:['Nice Centre'], typeRecherche:'Appartement', centresInteret:['meublé','courte durée'], score:35, derniereRelance:'2026-04-01', mandatRecherche:false, statut:'actif' },
  { id:5, nom:'Kessler', prenom:'Thomas', email:'t.kessler@proton.me', tel:'0678123456', type:'acquereur', budgetMin:500000, budgetMax:700000, surfaceMin:80, nbPieces:4, secteursVoulus:['Nice Cimiez','Nice Centre'], typeRecherche:'Appartement', centresInteret:['standing','terrasse','vue mer'], score:90, derniereRelance:'2026-04-05', mandatRecherche:true, statut:'actif' },
  { id:6, nom:'Faure', prenom:'Emma', email:'emma.faure@yahoo.fr', tel:'0690123456', type:'acquereur', budgetMin:180000, budgetMax:240000, surfaceMin:35, nbPieces:2, secteursVoulus:['Nice Libération','Nice Gambetta'], typeRecherche:'Appartement', centresInteret:['premier achat','travaux OK'], score:55, derniereRelance:'2026-03-20', mandatRecherche:false, statut:'en_pause' },
];

const RAPPROCHEMENTS = [
  { acquereurId:2, bien:'25 rue des Abbesses, Paris 18e — Studio 195k€', match:92, raison:'Budget OK, type studio, Paris 18e, investissement' },
  { acquereurId:1, bien:'24 rue Pastorelli, Nice — T2 245k€', match:78, raison:'Budget OK, T2, mais Nice au lieu de Paris' },
  { acquereurId:5, bien:'3 rue de la Buffa, Nice — T4 520k€', match:87, raison:'Budget OK, T4, Nice Centre, standing' },
  { acquereurId:3, bien:'15 bd Victor Hugo, Nice — T3 385k€', match:82, raison:'Budget OK, T3, terrasse, proche secteur souhaité' },
  { acquereurId:6, bien:'10 place Garibaldi, Nice — T3 295k€', match:71, raison:'T3 au lieu de T2, prix > budget mais négociable' },
];

export default function AcquereursModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('fiches');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const acquereurs = data.acquereurs || DEFAULT_ACQUEREURS;
  if(!data.acquereurs) setData(d=>({...d, acquereurs:DEFAULT_ACQUEREURS}));

  const actifs = acquereurs.filter(a=>a.statut==='actif');

  const addAcquereur = () => {
    const a = { id:genId(), nom:form.nom||'', prenom:form.prenom||'', email:form.email||'', tel:form.tel||'', type:form.type||'acquereur', budgetMin:Number(form.budgetMin)||0, budgetMax:Number(form.budgetMax)||0, surfaceMin:Number(form.surfaceMin)||0, nbPieces:Number(form.nbPieces)||0, secteursVoulus:form.secteurs?form.secteurs.split(',').map(s=>s.trim()):[], typeRecherche:form.typeRecherche||'Appartement', centresInteret:form.interets?form.interets.split(',').map(s=>s.trim()):[], score:50, derniereRelance:new Date().toISOString().slice(0,10), mandatRecherche:false, statut:'actif' };
    setData(d=>({...d, acquereurs:[a,...(d.acquereurs||DEFAULT_ACQUEREURS)]}));
    setModal(null); setForm({}); showToast('Fiche acquéreur créée');
  };

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'fiches',label:`Fiches (${acquereurs.length})`},{id:'rapprochements',label:'Rapprochements'},{id:'mandats_recherche',label:'Mandats recherche'},{id:'extranet',label:'Extranet'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {sub==='fiches' && <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{fontSize:18,fontWeight:800,margin:0}}>Fiches acquéreurs</h2>
          <button onClick={()=>{setForm({type:'acquereur',typeRecherche:'Appartement'});setModal({type:'add'});}} style={BTN} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>+ Nouvelle fiche</button>
        </div>
        {acquereurs.map(a=>(
          <div key={a.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',gap:12,opacity:a.statut==='en_pause'?0.5:1}}>
            <div style={{width:40,height:40,background:a.score>=70?L.greenBg:a.score>=40?`${L.orange}12`:L.redBg,border:`1px solid ${a.score>=70?L.green:a.score>=40?L.orange:L.red}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:a.score>=70?L.green:a.score>=40?L.orange:L.red,flexShrink:0}}>{a.score}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:14,fontWeight:700}}>{a.prenom} {a.nom}</span>
                <span style={{fontSize:10,fontWeight:600,color:a.type==='acquereur'?L.gold:L.blue,background:a.type==='acquereur'?`${L.gold}12`:L.blueBg,padding:'2px 8px'}}>{a.type}</span>
                {a.mandatRecherche && <span style={{fontSize:10,fontWeight:600,color:'#7C3AED',background:'#F5F3FF',padding:'2px 8px'}}>Mandat recherche</span>}
                {a.statut==='en_pause' && <span style={{fontSize:10,color:L.textLight}}>En pause</span>}
              </div>
              <div style={{fontSize:12,color:L.textSec}}>Budget: {a.budgetMin.toLocaleString()}–{a.budgetMax.toLocaleString()}€ · {a.typeRecherche} · ≥{a.surfaceMin}m² · {a.nbPieces}P</div>
              <div style={{fontSize:11,color:L.textLight}}>Secteurs: {a.secteursVoulus.join(', ')}</div>
              <div style={{display:'flex',gap:3,marginTop:3}}>{a.centresInteret.slice(0,3).map(ci=><span key={ci} style={{fontSize:9,padding:'1px 6px',background:L.cream,border:`1px solid ${L.border}`}}>{ci}</span>)}</div>
            </div>
            <div style={{display:'flex',gap:4,flexShrink:0}}>
              <button onClick={()=>showToast('Relance envoyée')} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 8px'}}>Relancer</button>
              <button onClick={()=>showToast('Prescription courtier envoyée')} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 8px'}}>→ Courtier</button>
            </div>
          </div>
        ))}
      </>}

      {sub==='rapprochements' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Rapprochements intelligents</h2>
        <p style={{fontSize:13,color:L.textSec,marginBottom:16}}>Les biens disponibles sont automatiquement rapprochés avec vos fiches acquéreurs.</p>
        {RAPPROCHEMENTS.map((r,i)=>{
          const acq = acquereurs.find(a=>a.id===r.acquereurId);
          return <div key={i} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700}}>{r.bien}</div>
              <div style={{fontSize:12,color:L.textSec}}>↔ {acq?.prenom} {acq?.nom}</div>
              <div style={{fontSize:11,color:L.textLight}}>{r.raison}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:40,height:40,borderRadius:'50%',border:`2px solid ${r.match>85?L.green:r.match>60?L.orange:L.red}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:r.match>85?L.green:r.match>60?L.orange:L.red}}>{r.match}%</div>
              <button onClick={()=>showToast(`${acq?.prenom} notifié(e)`)} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.green}}>Notifier</button>
            </div>
          </div>;
        })}
      </>}

      {sub==='mandats_recherche' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Mandats de recherche</h2>
        {acquereurs.filter(a=>a.mandatRecherche).map(a=>(
          <div key={a.id} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>{a.prenom} {a.nom}</div>
              <div style={{fontSize:12,color:L.textSec}}>Recherche: {a.typeRecherche} · {a.budgetMin.toLocaleString()}–{a.budgetMax.toLocaleString()}€ · {a.secteursVoulus.join(', ')}</div>
            </div>
            <button onClick={()=>showToast('Mandat de recherche envoyé pour signature')} style={{...BTN,fontSize:10,padding:'5px 12px',background:'#7C3AED'}}>✍ Faire signer</button>
          </div>
        ))}
        {acquereurs.filter(a=>!a.mandatRecherche&&a.statut==='actif').length>0 && <>
          <div style={{fontSize:13,fontWeight:700,marginTop:16,marginBottom:8}}>Acquéreurs sans mandat de recherche</div>
          {acquereurs.filter(a=>!a.mandatRecherche&&a.statut==='actif').map(a=>(
            <div key={a.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${L.border}`}}>
              <span style={{fontSize:13}}>{a.prenom} {a.nom}</span>
              <button onClick={()=>{setData(d=>({...d,acquereurs:(d.acquereurs||[]).map(x=>x.id===a.id?{...x,mandatRecherche:true}:x)}));showToast('Mandat de recherche créé');}} style={{...BTN_OUTLINE,fontSize:10,padding:'4px 10px'}}>Créer mandat</button>
            </div>
          ))}
        </>}
      </>}

      {sub==='extranet' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Extranet acquéreurs</h2>
        <div style={{...CARD,textAlign:'center',padding:40,background:L.cream}}>
          <div style={{fontSize:32,marginBottom:8,opacity:0.3}}>🌐</div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Espace candidat en ligne</div>
          <div style={{fontSize:12,color:L.textSec,marginBottom:12}}>Vos acquéreurs peuvent mettre à jour leur profil, consulter les biens proposés et suivre l'avancement de leur recherche depuis un espace dédié.</div>
          <div style={{fontSize:11,color:L.textLight}}>URL: app.freample.com/extranet/acquereur</div>
        </div>
      </>}

      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:480,maxHeight:'85vh',overflowY:'auto',padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Nouvelle fiche acquéreur</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={LBL}>Nom</label><input value={form.nom||''} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>Prénom</label><input value={form.prenom||''} onChange={e=>setForm(f=>({...f,prenom:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={LBL}>Email</label><input value={form.email||''} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>Tél</label><input value={form.tel||''} onChange={e=>setForm(f=>({...f,tel:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={LBL}>Budget min</label><input type="number" value={form.budgetMin||''} onChange={e=>setForm(f=>({...f,budgetMin:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>Budget max</label><input type="number" value={form.budgetMax||''} onChange={e=>setForm(f=>({...f,budgetMax:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={LBL}>Surface min (m²)</label><input type="number" value={form.surfaceMin||''} onChange={e=>setForm(f=>({...f,surfaceMin:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>Nb pièces</label><input type="number" value={form.nbPieces||''} onChange={e=>setForm(f=>({...f,nbPieces:e.target.value}))} style={INP}/></div>
            </div>
            <div style={{marginBottom:10}}><label style={LBL}>Secteurs souhaités (séparés par virgule)</label><input value={form.secteurs||''} onChange={e=>setForm(f=>({...f,secteurs:e.target.value}))} style={INP} placeholder="Nice Centre, Paris 18e..."/></div>
            <div style={{marginBottom:14}}><label style={LBL}>Centres d'intérêt (séparés par virgule)</label><input value={form.interets||''} onChange={e=>setForm(f=>({...f,interets:e.target.value}))} style={INP} placeholder="investissement, calme, parking..."/></div>
            <button onClick={addAcquereur} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Créer la fiche</button>
          </div>
        </div>
      )}
    </div>
  );
}
