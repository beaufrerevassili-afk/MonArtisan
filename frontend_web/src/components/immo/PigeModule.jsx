import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const DEFAULT_PIGE = {
  listings: [
    { id:1, adresse:'24 rue Pastorelli, Nice', prix:245000, surface:52, type:'Appartement', pieces:2, source:'LeBonCoin', datePublication:'2026-04-04', statut:'nouveau', description:'T2 rénové, lumineux, balcon', contact:'Particulier', tel:'06XXXXXXXX', prixM2:4712 },
    { id:2, adresse:'8 rue Gioffredo, Nice', prix:189000, prixInitial:210000, surface:35, type:'Studio', pieces:1, source:'SeLoger', datePublication:'2026-03-20', statut:'baisse', description:'Studio meublé, idéal investisseur', contact:'Agence Riviera', tel:'04XXXXXXXX', prixM2:5400 },
    { id:3, adresse:'15 bd Victor Hugo, Nice', prix:385000, surface:75, type:'Appartement', pieces:3, source:'Bien\'ici', datePublication:'2026-04-02', statut:'nouveau', description:'T3 standing, terrasse 15m², vue mer', contact:'Particulier', tel:'06XXXXXXXX', prixM2:5133 },
    { id:4, adresse:'42 av Jean Médecin, Nice', prix:165000, surface:28, type:'Studio', pieces:1, source:'PAP', datePublication:'2026-03-28', statut:'ancien', description:'Studio à rénover, bon emplacement', contact:'Particulier', tel:'07XXXXXXXX', prixM2:5893 },
    { id:5, adresse:'3 rue de la Buffa, Nice', prix:520000, surface:95, type:'Appartement', pieces:4, source:'LeBonCoin', datePublication:'2026-04-01', statut:'nouveau', description:'T4 familial, 2 balcons, cave', contact:'Notaire', tel:'04XXXXXXXX', prixM2:5474 },
    { id:6, adresse:'10 place Garibaldi, Nice', prix:295000, prixInitial:320000, surface:60, type:'Appartement', pieces:3, source:'SeLoger', datePublication:'2026-03-15', statut:'baisse', description:'T3 charme, parquet, moulures', contact:'Agence Centro', tel:'04XXXXXXXX', prixM2:4917 },
    { id:7, adresse:'7 rue Lepic, Paris 18e', prix:350000, surface:38, type:'Appartement', pieces:2, source:'SeLoger', datePublication:'2026-04-03', statut:'nouveau', description:'T2 Montmartre, dernier étage', contact:'Particulier', tel:'06XXXXXXXX', prixM2:9211 },
    { id:8, adresse:'25 rue des Abbesses, Paris 18e', prix:195000, surface:22, type:'Studio', pieces:1, source:'LeBonCoin', datePublication:'2026-04-05', statut:'nouveau', description:'Studio refait, rentabilité 5.5%', contact:'Particulier', tel:'06XXXXXXXX', prixM2:8864 },
    { id:9, adresse:'5 av de la Libération, Nice', prix:410000, prixInitial:450000, surface:82, type:'Appartement', pieces:4, source:'Bien\'ici', datePublication:'2026-03-10', statut:'baisse', description:'T4 avec garage, quartier calme', contact:'Agence Libération Immo', tel:'04XXXXXXXX', prixM2:5000 },
    { id:10, adresse:'12 rue Rossini, Nice', prix:275000, surface:48, type:'Appartement', pieces:2, source:'PAP', datePublication:'2026-04-02', statut:'nouveau', description:'T2 avec cave et parking', contact:'Particulier', tel:'06XXXXXXXX', prixM2:5729 },
    { id:11, adresse:'18 bd Gambetta, Nice', prix:850, surface:35, type:'Studio', pieces:1, source:'LeBonCoin', datePublication:'2026-04-05', statut:'nouveau', description:'Location studio meublé', contact:'Particulier', tel:'06XXXXXXXX', prixM2:24, location:true },
    { id:12, adresse:'30 rue de France, Nice', prix:1450, surface:65, type:'Appartement', pieces:3, source:'SeLoger', datePublication:'2026-04-04', statut:'nouveau', description:'Location T3 vue mer', contact:'Agence Promenade', tel:'04XXXXXXXX', prixM2:22, location:true },
    { id:13, adresse:'22 rue Trachel, Nice', prix:155000, surface:30, type:'Studio', pieces:1, source:'LeBonCoin', datePublication:'2026-03-25', statut:'ancien', description:'Studio quartier gare, à rénover', contact:'Particulier', tel:'07XXXXXXXX', prixM2:5167 },
    { id:14, adresse:'9 av Thiers, Nice', prix:320000, prixInitial:345000, surface:58, type:'Appartement', pieces:3, source:'Explorimmo', datePublication:'2026-03-18', statut:'baisse', description:'T3 traversant, double exposition', contact:'Agence Thiers', tel:'04XXXXXXXX', prixM2:5517 },
    { id:15, adresse:'6 rue Smolett, Nice', prix:225000, surface:42, type:'Appartement', pieces:2, source:'Green-Acres', datePublication:'2026-04-03', statut:'nouveau', description:'T2 vieux Nice, charme', contact:'Particulier', tel:'06XXXXXXXX', prixM2:5357 },
  ],
  annotations: {},
  suivis: [],
};

const sourceColors = { LeBonCoin:'#F97316', SeLoger:'#3B82F6', 'Bien\'ici':'#22C55E', PAP:'#8B5CF6', Explorimmo:'#EC4899', 'Green-Acres':'#14B8A6', 'Agence':'#D97706' };

export default function PigeModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('flux');
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const pige = data.pige || DEFAULT_PIGE;
  if(!data.pige) setData(d=>({...d, pige:DEFAULT_PIGE}));

  const listings = pige.listings || [];
  const annotations = pige.annotations || {};
  const baisses = listings.filter(l=>l.statut==='baisse');

  const filtered = listings.filter(l=>{
    if(sub==='baisses' && l.statut!=='baisse') return false;
    if(filterSource && l.source!==filterSource) return false;
    if(filterStatut && l.statut!==filterStatut) return false;
    if(search) { const s=search.toLowerCase(); return (l.adresse+' '+l.description+' '+l.type).toLowerCase().includes(s); }
    return true;
  });

  const addAnnotation = (listingId) => {
    setData(d=>({...d, pige:{...pige, annotations:{...annotations, [listingId]:form.annotation||''}}}));
    setModal(null); setForm({}); showToast('Annotation sauvegardée');
  };

  const sources = [...new Set(listings.map(l=>l.source))];

  return (
    <div>
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:`1px solid ${L.border}`}}>
        {[{id:'flux',label:`Flux (${listings.length})`},{id:'baisses',label:`Baisses de prix (${baisses.length})`},{id:'annotations',label:'Annotations'},{id:'rapprochement',label:'Rapprochement'}].map(t=>(
          <button key={t.id} onClick={()=>setSub(t.id)} style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${sub===t.id?L.gold:'transparent'}`,fontSize:12,fontWeight:sub===t.id?700:400,color:sub===t.id?L.text:L.textSec,cursor:'pointer',fontFamily:L.font}}>{t.label}</button>
        ))}
      </div>

      {(sub==='flux'||sub==='baisses') && <>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher adresse, type..." style={{...INP,flex:1}}/>
          <select value={filterSource} onChange={e=>setFilterSource(e.target.value)} style={{...INP,width:140}}><option value="">Toutes sources</option>{sources.map(s=><option key={s} value={s}>{s}</option>)}</select>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(l=>(
            <div key={l.id} style={{...CARD,padding:'14px 18px',display:'flex',alignItems:'center',gap:14,borderLeft:l.statut==='baisse'?`4px solid ${L.red}`:l.statut==='nouveau'?`4px solid ${L.green}`:`4px solid ${L.border}`}}>
              <div style={{width:56,height:56,background:L.cream,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{l.location?'🏘️':'��'}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={{fontSize:14,fontWeight:700}}>{l.adresse}</span>
                  <span style={{fontSize:10,fontWeight:600,color:sourceColors[l.source]||L.textSec,background:`${sourceColors[l.source]||L.textSec}12`,padding:'2px 6px'}}>{l.source}</span>
                  {l.statut==='nouveau' && <span style={{fontSize:10,fontWeight:600,color:L.green,background:L.greenBg,padding:'2px 6px'}}>Nouveau</span>}
                  {l.statut==='baisse' && <span style={{fontSize:10,fontWeight:600,color:L.red,background:L.redBg,padding:'2px 6px'}}>⬇ Baisse {l.prixInitial?`-${Math.round((1-l.prix/l.prixInitial)*100)}%`:''}</span>}
                </div>
                <div style={{fontSize:12,color:L.textSec}}>{l.description}</div>
                <div style={{fontSize:11,color:L.textLight,marginTop:2}}>{l.type} · {l.surface}m² · {l.pieces}P · {l.contact} · {l.datePublication}</div>
                {annotations[l.id] && <div style={{fontSize:11,color:L.gold,fontWeight:600,marginTop:2}}>📝 {annotations[l.id]}</div>}
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:800,color:l.location?L.blue:L.gold}}>{l.location?l.prix+'€/mois':l.prix.toLocaleString()+'€'}</div>
                {l.prixInitial && <div style={{fontSize:11,color:L.red,textDecoration:'line-through'}}>{l.prixInitial.toLocaleString()}€</div>}
                <div style={{fontSize:11,color:L.textLight}}>{l.prixM2>100?l.prixM2+'€/m²':''}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
                <button onClick={()=>{setForm({annotation:annotations[l.id]||''});setModal({type:'annotate',listingId:l.id});}} style={{...BTN_OUTLINE,fontSize:9,padding:'3px 8px'}}>📝 Annoter</button>
                <button onClick={()=>showToast('Transféré en estimation')} style={{...BTN_OUTLINE,fontSize:9,padding:'3px 8px'}}>→ Estimation</button>
                <button onClick={()=>showToast('Contact propriétaire (simulé)')} style={{...BTN_OUTLINE,fontSize:9,padding:'3px 8px'}}>📞 Contacter</button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{padding:32,textAlign:'center',color:L.textLight}}>Aucune annonce trouvée</div>}
        </div>
      </>}

      {sub==='annotations' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Mes annotations</h2>
        {Object.keys(annotations).length>0 ? Object.entries(annotations).map(([lid,note])=>{
          const listing = listings.find(l=>l.id===Number(lid));
          if(!listing||!note) return null;
          return <div key={lid} style={{...CARD,marginBottom:8,display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700}}>{listing.adresse}</div>
              <div style={{fontSize:12,color:L.textSec}}>{listing.prix.toLocaleString()}{listing.location?'€/mois':'€'} · {listing.source}</div>
              <div style={{fontSize:12,color:L.gold,marginTop:4}}>📝 {note}</div>
            </div>
          </div>;
        }) : <div style={{...CARD,textAlign:'center',color:L.textLight}}>Aucune annotation. Annotez des annonces depuis le flux.</div>}
      </>}

      {sub==='rapprochement' && <>
        <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Rapprochement intelligent</h2>
        <p style={{fontSize:13,color:L.textSec,marginBottom:16}}>Les annonces de la pige sont automatiquement rapprochées avec vos fiches acquéreurs.</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            {listing:'24 rue Pastorelli — T2 245k€',acquereur:'Sophie Lefebvre',match:'92%',raison:'Budget OK, secteur OK, surface OK'},
            {listing:'8 rue Gioffredo — Studio 189k€',acquereur:'Lucas Garcia',match:'87%',raison:'Budget OK, type OK, investisseur LMNP'},
            {listing:'25 rue Abbesses — Studio 195k€',acquereur:'Lucas Garcia',match:'78%',raison:'Budget OK, type OK, Paris 18e'},
          ].map((r,i)=>(
            <div key={i} style={{...CARD,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:13,fontWeight:700}}>{r.listing}</div>
                <div style={{fontSize:12,color:L.textSec}}>↔ {r.acquereur}</div>
                <div style={{fontSize:11,color:L.textLight}}>{r.raison}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:40,height:40,borderRadius:'50%',border:`2px solid ${Number(r.match)>85?L.green:L.orange}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:Number(r.match)>85?L.green:L.orange}}>{r.match}</div>
                <button onClick={()=>showToast('Acquéreur notifié')} style={{...BTN,fontSize:10,padding:'5px 10px',background:L.green}}>Notifier</button>
              </div>
            </div>
          ))}
        </div>
      </>}

      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setModal(null)}>
          <div style={{background:L.white,width:'100%',maxWidth:420,padding:'28px 24px'}} onClick={e=>e.stopPropagation()}>
            {modal.type==='annotate' && <>
              <h3 style={{fontSize:16,fontWeight:700,margin:'0 0 16px'}}>Annoter cette annonce</h3>
              <textarea value={form.annotation||''} onChange={e=>setForm(f=>({...f,annotation:e.target.value}))} rows={4} style={{...INP,resize:'vertical',marginBottom:14}} placeholder="Vos notes sur cette annonce..."/>
              <button onClick={()=>addAnnotation(modal.listingId)} style={{...BTN,width:'100%',padding:'12px'}} onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>Sauvegarder</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
