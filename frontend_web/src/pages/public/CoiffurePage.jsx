import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const SOUS_TYPES = ['Tout','Coiffeur','Barbier','Manucure','Institut de beauté','Bien-être'];

const SALONS = [
  { id:'1', nom:'Salon Léa',           type:'Coiffeur',           ville:'Paris 11e',  adresse:'24 rue de la Roquette',      note:4.9, avis:142, distance:'0.3 km', prixMin:30, dispo:true,  grad:'linear-gradient(140deg,#E8C5D0,#C9A0C0)', initials:'SL', tags:['Coloriste','Balayage','Bio'] },
  { id:'2', nom:'Barbershop Alex',      type:'Barbier',            ville:'Paris 3e',   adresse:'8 rue de Bretagne',          note:5.0, avis:67,  distance:'0.8 km', prixMin:22, dispo:true,  grad:'linear-gradient(140deg,#A8B8D8,#7890BC)', initials:'BA', tags:['Barbier','Rasoir droit'] },
  { id:'3', nom:'Studio Inès',          type:'Coiffeur',           ville:'Paris 18e',  adresse:'52 rue Lepic',               note:4.7, avis:89,  distance:'1.4 km', prixMin:42, dispo:true,  grad:'linear-gradient(140deg,#C5B0D8,#A090C0)', initials:'SI', tags:['Bouclés','Kératine'] },
  { id:'4', nom:'Atelier Beauté Marais',type:'Institut de beauté', ville:'Paris 4e',   adresse:'12 rue des Archives',        note:4.8, avis:204, distance:'0.6 km', prixMin:22, dispo:true,  grad:'linear-gradient(140deg,#B8D0C0,#90B098)', initials:'AB', tags:['Manucure','Soins visage'] },
  { id:'5', nom:'Le Barbier du Marais', type:'Barbier',            ville:'Paris 4e',   adresse:'27 rue Vieille du Temple',   note:4.6, avis:156, distance:'0.9 km', prixMin:25, dispo:false, grad:'linear-gradient(140deg,#D0B898,#B09070)', initials:'BM', tags:['Ciseau','Rasage'] },
  { id:'6', nom:'Spa Lumière',          type:'Bien-être',          ville:'Paris 8e',   adresse:'5 avenue Montaigne',         note:4.9, avis:78,  distance:'2.1 km', prixMin:70, dispo:true,  grad:'linear-gradient(140deg,#A8C5D8,#80A8C0)', initials:'SL', tags:['Spa','Massage'] },
];

function Stars({ note }) {
  return <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(note)?DS.gold:'#E0DDD8',fontSize:14}}>★</span>)}</span>;
}

function SalonCard({ salon, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ padding:'16px 18px', borderBottom:`1px solid ${DS.border}`, cursor:'pointer', background:selected?DS.bgSoft:DS.bg, transition:'background .12s' }}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=DS.bgSoft; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background=DS.bg; }}>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <div style={{ width:56, height:56, borderRadius:14, background:salon.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'rgba(255,255,255,0.95)', fontWeight:800, flexShrink:0 }}>{salon.initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div style={{ fontSize:16, fontWeight:700, color:DS.ink, letterSpacing:'-0.02em', lineHeight:1.3 }}>{salon.nom}</div>
            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0, marginLeft:8 }}>
              <span style={{ color:DS.gold, fontSize:14 }}>★</span>
              <span style={{ fontSize:14, fontWeight:700, color:DS.ink }}>{salon.note}</span>
            </div>
          </div>
          <div style={{ fontSize:13, color:DS.muted, marginBottom:8 }}>{salon.type} · {salon.ville} · {salon.distance}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
            {salon.tags.map(t=><span key={t} style={{ padding:'4px 10px', background:DS.surface, borderRadius:DS.r.full, fontSize:12, color:DS.ink2, fontWeight:500 }}>{t}</span>)}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:DS.muted }}>À partir de <strong style={{color:DS.ink}}>{salon.prixMin} €</strong></span>
            {salon.dispo
              ? <span style={{ fontSize:12, color:DS.green, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}><span style={{ width:6, height:6, borderRadius:'50%', background:DS.green, display:'inline-block' }}/>Dispo</span>
              : <span style={{ fontSize:12, color:DS.subtle }}>Prochain dispo →</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoiffurePage() {
  const navigate = useNavigate();
  const [sousType, setSousType] = useState('Tout');
  const [recherche, setRecherche] = useState('');
  const [ville, setVille] = useState('Paris');
  const [selectedId, setSelectedId] = useState('1');

  const selected = SALONS.find(s=>s.id===selectedId) || SALONS[0];

  const filtered = SALONS.filter(s => {
    const tm = sousType==='Tout'||s.type===sousType||(sousType==='Manucure'&&s.tags.includes('Manucure'));
    const sm = !recherche||s.nom.toLowerCase().includes(recherche.toLowerCase())||s.tags.some(t=>t.toLowerCase().includes(recherche.toLowerCase()));
    return tm&&sm;
  });

  const subNav = (
    <div style={{ display:'flex', padding:'0 clamp(16px,4vw,48px)', overflowX:'auto', scrollbarWidth:'none' }}>
      {SOUS_TYPES.map(type=>(
        <button key={type} onClick={()=>setSousType(type)} style={{ padding:'12px 16px', background:'none', border:'none', borderBottom:`2px solid ${sousType===type?DS.accent:'transparent'}`, fontSize:14, fontWeight:sousType===type?700:500, color:sousType===type?DS.ink:DS.muted, cursor:'pointer', whiteSpace:'nowrap', marginBottom:-1, transition:'color .15s', fontFamily:DS.font }}>
          {type}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:DS.font, color:DS.ink }}>
      <RecrutementBanner secteur="coiffure" />
      <PublicNavbar subNav={subNav} />

      {/* Barre de recherche */}
      <div style={{ background:DS.bg, borderBottom:`1px solid ${DS.border}`, padding:'16px clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', border:`1.5px solid ${DS.border}`, borderRadius:16, overflow:'hidden', boxShadow:DS.shadow.sm, transition:'box-shadow .2s', flexWrap:'wrap' }}
          onFocusCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.md}
          onBlurCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.sm}>
          <div style={{ flex:'1 1 200px', display:'flex', flexDirection:'column', padding:'12px 18px', borderRight:`1px solid ${DS.border}` }}>
            <label style={{ fontSize:12, fontWeight:600, color:DS.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Que cherchez-vous ?</label>
            <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Coupe, balayage, massage…" style={{ border:'none', outline:'none', fontSize:16, color:DS.ink, background:'none', fontFamily:DS.font, padding:'4px 0' }} />
          </div>
          <div style={{ flex:'1 1 140px', display:'flex', flexDirection:'column', padding:'12px 18px' }}>
            <label style={{ fontSize:12, fontWeight:600, color:DS.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Où ?</label>
            <input value={ville} onChange={e=>setVille(e.target.value)} placeholder="Paris, Lyon…" style={{ border:'none', outline:'none', fontSize:16, color:DS.ink, background:'none', fontFamily:DS.font, padding:'4px 0' }} />
          </div>
          <button style={{ padding:'14px 28px', background:DS.ink, border:'none', cursor:'pointer', color:'#fff', fontSize:15, fontWeight:700, transition:'opacity .15s', minHeight:48, flex:'0 0 auto' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Chercher
          </button>
        </div>
      </div>

      {/* Layout deux colonnes */}
      <div className="resp-split" style={{ display:'flex', minHeight:'calc(100vh - 200px)', flexDirection:'row', flexWrap:'wrap' }}>
        {/* Liste */}
        <div className="resp-sidebar" style={{ width:390, maxWidth:'100%', flexShrink:0, borderRight:`1px solid ${DS.border}`, overflowY:'auto', background:DS.bg }}>
          <div style={{ padding:'13px 20px', borderBottom:`1px solid ${DS.border}` }}>
            <span style={{ fontSize:13, color:DS.muted, fontWeight:500 }}>{filtered.length} établissement{filtered.length>1?'s':''}</span>
          </div>
          {filtered.map(s=><SalonCard key={s.id} salon={s} selected={selectedId===s.id} onClick={()=>setSelectedId(s.id)} />)}
        </div>

        {/* Détail */}
        <div className="resp-main" style={{ flex:1, overflowY:'auto', background:DS.bgSoft }}>
          <div style={{ height:220, background:selected.grad, position:'relative', display:'flex', alignItems:'flex-end', padding:'0 24px 24px' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, rgba(10,10,10,0.5))' }} />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:600, marginBottom:6 }}>{selected.type}</div>
              <div style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:'-0.04em' }}>{selected.nom}</div>
            </div>
          </div>
          <div style={{ padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Stars note={selected.note} />
              <span style={{ fontSize:15, fontWeight:700, color:DS.ink }}>{selected.note}</span>
              <span style={{ fontSize:14, color:DS.muted }}>({selected.avis} avis) · {selected.distance}</span>
            </div>
            <div style={{ fontSize:14, color:DS.muted, marginBottom:20 }}>📍 {selected.adresse}, {selected.ville}</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={()=>navigate(`/coiffure/salon/${selected.id}`)}
                style={{ flex:1, padding:'14px', background:DS.accent, color:'#fff', border:'none', borderRadius:14, fontWeight:700, fontSize:15, cursor:'pointer', transition:'background .15s', fontFamily:DS.font, minHeight:48, minWidth:180 }}
                onMouseEnter={e=>e.currentTarget.style.background=DS.accentHover}
                onMouseLeave={e=>e.currentTarget.style.background=DS.accent}>
                Voir le salon & Réserver
              </button>
              <button style={{ padding:'14px 20px', background:'none', border:`1.5px solid ${DS.border}`, borderRadius:14, fontSize:14, color:DS.muted, cursor:'pointer', fontFamily:DS.font, minHeight:48 }}>
                📍 Itinéraire
              </button>
            </div>
            <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8 }}>
              {selected.tags.map(t=><span key={t} style={{ display:'inline-block', padding:'6px 14px', background:DS.surface, borderRadius:DS.r.full, fontSize:13, color:DS.ink2, fontWeight:500 }}>{t}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
