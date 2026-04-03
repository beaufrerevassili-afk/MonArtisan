import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const CUISINES = ['Tout', '🍕 Pizza', '🍣 Sushi', '🍔 Burger', '🥗 Végétarien', '🍝 Italien', '🥩 Grill', '☕ Brunch'];

const RESTAURANTS = [
  { id:'1', nom:'Trattoria Genovese',    type:'🍝 Italien',     ville:'Paris 11e',  adresse:'18 rue de la Roquette',      note:4.9, avis:312, distance:'0.2 km', prixMin:14, tempsLivraison:'20-30 min', fraisLivraison:'0€',    dispo:true,  grad:'linear-gradient(140deg,#E8C8A0,#C8A070)', initials:'TG', tags:['Sur place','Livraison','Terrasse'] },
  { id:'2', nom:'Sakura Sushi',          type:'🍣 Sushi',       ville:'Paris 3e',   adresse:'42 rue de Bretagne',         note:4.8, avis:189, distance:'0.7 km', prixMin:18, tempsLivraison:'25-35 min', fraisLivraison:'1.99€', dispo:true,  grad:'linear-gradient(140deg,#E8A0B0,#C87090)', initials:'SS', tags:['Livraison','À emporter','Menu midi'] },
  { id:'3', nom:'Big Smoke Burgers',     type:'🍔 Burger',      ville:'Paris 18e',  adresse:'7 rue Lepic',               note:4.7, avis:278, distance:'1.2 km', prixMin:12, tempsLivraison:'15-25 min', fraisLivraison:'0€',    dispo:true,  grad:'linear-gradient(140deg,#E8B870,#C89040)', initials:'BS', tags:['Sur place','Livraison','Bio'] },
  { id:'4', nom:'Le Jardin Vert',        type:'🥗 Végétarien',  ville:'Paris 4e',   adresse:'5 rue des Archives',        note:4.8, avis:156, distance:'0.5 km', prixMin:11, tempsLivraison:'20-30 min', fraisLivraison:'0€',    dispo:true,  grad:'linear-gradient(140deg,#A8D0A8,#70B070)', initials:'JV', tags:['Végétarien','Bio','Sans gluten'] },
  { id:'5', nom:'Casa Brasil Grill',     type:'🥩 Grill',       ville:'Paris 8e',   adresse:'12 avenue Hoche',           note:4.6, avis:94,  distance:'2.0 km', prixMin:22, tempsLivraison:'30-40 min', fraisLivraison:'2.99€', dispo:false, grad:'linear-gradient(140deg,#D0A080,#B07850)', initials:'CB', tags:['Sur place','Réservation'] },
  { id:'6', nom:'Morning Glory Café',   type:'☕ Brunch',       ville:'Paris 9e',   adresse:'28 rue des Martyrs',        note:4.9, avis:421, distance:'1.5 km', prixMin:9,  tempsLivraison:'15-20 min', fraisLivraison:'0€',    dispo:true,  grad:'linear-gradient(140deg,#C8D0E8,#A0A8C8)', initials:'MG', tags:['Brunch','Café','Sur place'] },
];

function Stars({ note, size = 11 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(note) ? DS.gold : '#E0DDD8', fontSize: size }}>★</span>
      ))}
    </span>
  );
}

function RestaurantCard({ resto, selected, onClick }) {
  return (
    <div onClick={onClick}
      style={{ padding:'18px 20px', borderBottom:`1px solid ${DS.border}`, cursor:'pointer', background:selected?DS.bgSoft:DS.bg, transition:'background .12s' }}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=DS.bgSoft; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background=DS.bg; }}>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <div style={{ width:54, height:54, borderRadius:DS.r.md, background:resto.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'rgba(255,255,255,0.9)', fontWeight:800, flexShrink:0 }}>{resto.initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:2 }}>
            <div style={{ fontSize:15, fontWeight:700, color:DS.ink, letterSpacing:'-0.03em', lineHeight:1.3 }}>{resto.nom}</div>
            <div style={{ display:'flex', alignItems:'center', gap:3, flexShrink:0, marginLeft:8 }}>
              <span style={{ color:DS.gold, fontSize:11 }}>★</span>
              <span style={{ fontSize:12, fontWeight:700, color:DS.ink }}>{resto.note}</span>
            </div>
          </div>
          <div style={{ fontSize:11.5, color:DS.muted, marginBottom:7 }}>{resto.type.replace(/^[^ ]+ /,'')} · {resto.ville} · {resto.distance}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
            {resto.tags.map(t => <span key={t} style={{ padding:'3px 8px', background:DS.surface, borderRadius:DS.r.full, fontSize:11, color:DS.ink2, fontWeight:500 }}>{t}</span>)}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color:DS.muted }}>
              À partir de <strong style={{ color:DS.ink }}>{resto.prixMin}€</strong>
              {' · '}<span style={{ color:DS.muted }}>{resto.tempsLivraison}</span>
            </span>
            {resto.dispo
              ? <span style={{ fontSize:11, color:DS.green, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:DS.green, display:'inline-block' }}/>Ouvert
                </span>
              : <span style={{ fontSize:11, color:DS.subtle }}>Fermé →</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const navigate = useNavigate();
  const [cuisine, setCuisine] = useState('Tout');
  const [recherche, setRecherche] = useState('');
  const [ville, setVille] = useState('Paris');
  const [selectedId, setSelectedId] = useState('1');

  const selected = RESTAURANTS.find(r => r.id === selectedId) || RESTAURANTS[0];

  const filtered = RESTAURANTS.filter(r => {
    const cm = cuisine === 'Tout' || r.type === cuisine;
    const sm = !recherche || r.nom.toLowerCase().includes(recherche.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(recherche.toLowerCase()));
    return cm && sm;
  });

  const subNav = (
    <div style={{ display:'flex', padding:'0 clamp(16px,4vw,48px)', overflowX:'auto', scrollbarWidth:'none' }}>
      {CUISINES.map(c => (
        <button key={c} onClick={() => setCuisine(c)}
          style={{ padding:'11px 16px', background:'none', border:'none', borderBottom:`2px solid ${cuisine===c?DS.accent:'transparent'}`, fontSize:12.5, fontWeight:cuisine===c?700:400, color:cuisine===c?DS.ink:DS.muted, cursor:'pointer', whiteSpace:'nowrap', marginBottom:-1, transition:'color .15s', fontFamily:DS.font }}>
          {c}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:DS.font, color:DS.ink }}>
      <RecrutementBanner secteur="restaurant" />
      <PublicNavbar subNav={subNav} />

      {/* Barre de recherche */}
      <div style={{ background:DS.bg, borderBottom:`1px solid ${DS.border}`, padding:'14px clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', border:`1.5px solid ${DS.border}`, borderRadius:DS.r.full, overflow:'hidden', boxShadow:DS.shadow.sm, transition:'box-shadow .2s' }}
          onFocusCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.md}
          onBlurCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.sm}>
          <div style={{ flex:1.3, display:'flex', flexDirection:'column', padding:'10px 20px', borderRight:`1px solid ${DS.border}` }}>
            <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:3 }}>Que cherchez-vous ?</label>
            <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Pizza, sushi, burger…"
              style={{ border:'none', outline:'none', fontSize:13.5, color:DS.ink, background:'none', fontFamily:DS.font }} />
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 20px' }}>
            <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:3 }}>Où ?</label>
            <input value={ville} onChange={e=>setVille(e.target.value)} placeholder="Paris, Lyon…"
              style={{ border:'none', outline:'none', fontSize:13.5, color:DS.ink, background:'none', fontFamily:DS.font }} />
          </div>
          <button style={{ padding:'0 24px', background:DS.ink, border:'none', cursor:'pointer', color:'#fff', fontSize:13, fontWeight:700, transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Chercher
          </button>
        </div>
      </div>

      {/* Layout deux colonnes */}
      <div style={{ display:'flex', height:'calc(100vh - 200px)' }}>
        {/* Liste */}
        <div style={{ width:390, flexShrink:0, borderRight:`1px solid ${DS.border}`, overflowY:'auto', background:DS.bg }}>
          <div style={{ padding:'13px 20px', borderBottom:`1px solid ${DS.border}` }}>
            <span style={{ fontSize:12, color:DS.muted }}>{filtered.length} restaurant{filtered.length>1?'s':''}</span>
          </div>
          {filtered.map(r => <RestaurantCard key={r.id} resto={r} selected={selectedId===r.id} onClick={() => setSelectedId(r.id)} />)}
        </div>

        {/* Détail */}
        <div style={{ flex:1, overflowY:'auto', background:DS.bgSoft }}>
          {/* Cover */}
          <div style={{ height:200, background:selected.grad, position:'relative', display:'flex', alignItems:'flex-end', padding:'0 28px 20px' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, rgba(10,10,10,0.45))' }} />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)', textTransform:'uppercase', letterSpacing:2.5, fontWeight:600, marginBottom:4 }}>
                {selected.type}
              </div>
              <div style={{ fontSize:24, fontWeight:900, color:'#fff', letterSpacing:'-0.05em' }}>{selected.nom}</div>
            </div>
          </div>

          <div style={{ padding:'20px 28px' }}>
            {/* Rating + infos */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <Stars note={selected.note} />
              <span style={{ fontSize:13, fontWeight:700, color:DS.ink }}>{selected.note}</span>
              <span style={{ fontSize:13, color:DS.muted }}>({selected.avis} avis) · {selected.distance}</span>
            </div>
            <div style={{ fontSize:13, color:DS.muted, marginBottom:14 }}>📍 {selected.adresse}, {selected.ville}</div>

            {/* Livraison info */}
            <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.md }}>
                <span style={{ fontSize:15 }}>🕐</span>
                <div>
                  <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>Délai</div>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.ink }}>{selected.tempsLivraison}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.md }}>
                <span style={{ fontSize:15 }}>🛵</span>
                <div>
                  <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>Livraison</div>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.ink }}>{selected.fraisLivraison === '0€' ? 'Gratuite' : selected.fraisLivraison}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.md }}>
                <span style={{ fontSize:15 }}>💶</span>
                <div>
                  <div style={{ fontSize:10, color:DS.muted, textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>Min.</div>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.ink }}>À partir de {selected.prixMin}€</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display:'flex', gap:10 }}>
              <button
                style={{ flex:1, padding:'13px', background:DS.accent, color:'#fff', border:'none', borderRadius:DS.r.full, fontWeight:700, fontSize:14, cursor:'pointer', transition:'background .15s', fontFamily:DS.font }}
                onMouseEnter={e=>e.currentTarget.style.background=DS.accentHover}
                onMouseLeave={e=>e.currentTarget.style.background=DS.accent}>
                Commander / Réserver →
              </button>
              <button style={{ padding:'13px 20px', background:'none', border:`1px solid ${DS.border}`, borderRadius:DS.r.full, fontSize:13, color:DS.muted, cursor:'pointer', fontFamily:DS.font }}>
                📍 Itinéraire
              </button>
            </div>

            {/* Tags */}
            <div style={{ marginTop:18 }}>
              {selected.tags.map(t => (
                <span key={t} style={{ display:'inline-block', marginRight:6, marginBottom:6, padding:'4px 10px', background:DS.surface, borderRadius:DS.r.full, fontSize:12, color:DS.ink2 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
