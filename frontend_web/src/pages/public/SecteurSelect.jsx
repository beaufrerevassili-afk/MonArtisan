import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const CATEGORIES = [
  { id: 'coiffure',    emoji: '✂️',  label: 'Coiffure & Beauté',     sub: 'Coiffeurs, barbiers, instituts' },
  { id: 'restaurant',  emoji: '🍽️', label: 'Restaurants',            sub: 'Sur place, livraison, traiteur' },
  { id: 'boulangerie', emoji: '🥖',  label: 'Boulangerie',            sub: 'Pain, viennoiserie, pâtisserie' },
  { id: 'garage',      emoji: '🔧',  label: 'Auto & Mécanique',       sub: 'Garage, carrosserie, pneus' },
  { id: 'btp',         emoji: '🏗️', label: 'Artisans & Travaux',     sub: 'Plombier, électricien, maçon' },
  { id: 'commerce',    emoji: '🛍️', label: 'Commerces de proximité', sub: 'Fleuriste, pressing, épicerie' },
];

const PROS_FEATURED = [
  { id:1, secteur:'coiffure',    nom:'Salon Léa',        metier:'Coloriste · Paris 11e',     note:4.9, avis:142, grad:'linear-gradient(140deg,#E8C5D0,#C9A0C0)', initials:'SL' },
  { id:2, secteur:'restaurant',  nom:'Chez Marco',        metier:'Cuisine italienne · Lyon',  note:4.8, avis:89,  grad:'linear-gradient(140deg,#E8C8A0,#C8A070)', initials:'CM' },
  { id:3, secteur:'boulangerie', nom:'Maison Dupont',     metier:'Boulangerie · Bordeaux',    note:4.9, avis:213, grad:'linear-gradient(140deg,#E8D8A0,#C8B870)', initials:'MD' },
  { id:4, secteur:'coiffure',    nom:'Barbershop Alex',   metier:'Barbier · Paris 3e',        note:5.0, avis:67,  grad:'linear-gradient(140deg,#A8B8D8,#7890BC)', initials:'BA' },
  { id:5, secteur:'garage',      nom:'Garage Martin',     metier:'Mécanicien · Toulouse',     note:4.7, avis:54,  grad:'linear-gradient(140deg,#B0C0B0,#909888)', initials:'GM' },
  { id:6, secteur:'btp',         nom:'Tom Plomberie',     metier:'Plombier certifié · Nantes',note:4.8, avis:98,  grad:'linear-gradient(140deg,#B8C8D8,#90A8C0)', initials:'TP' },
];

function Stars({ note }) {
  return <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(note)?DS.gold:'#E0DDD8',fontSize:10}}>★</span>)}</span>;
}

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [query, setQuery]   = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef();

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.toLowerCase();
    if (q.includes('coiff') || q.includes('cheveux') || q.includes('barbier') || q.includes('manucure') || q.includes('salon')) navigate(`/coiffure?q=${encodeURIComponent(query)}`);
    else if (q.includes('restaurant') || q.includes('pizza') || q.includes('sushi')) navigate(`/restaurant?q=${encodeURIComponent(query)}`);
    else if (q.includes('pain') || q.includes('boulan') || q.includes('patiss')) navigate(`/boulangerie?q=${encodeURIComponent(query)}`);
    else if (q.includes('garage') || q.includes('voiture') || q.includes('pneu')) navigate(`/garage?q=${encodeURIComponent(query)}`);
    else if (q.includes('plomb') || q.includes('elec') || q.includes('maçon') || q.includes('artisan')) navigate(`/btp?q=${encodeURIComponent(query)}`);
    else navigate(`/btp?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:DS.font, color:DS.ink }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* ── Hero ── */}
      <section style={{
        background: DS.bg,
        padding: 'clamp(48px,9vh,88px) clamp(16px,5vw,48px) clamp(36px,6vh,64px)',
        textAlign: 'center',
        borderBottom: `1px solid ${DS.border}`,
        opacity: mounted?1:0, transform: mounted?'none':'translateY(16px)',
        transition: 'opacity .55s ease, transform .55s ease',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', background:DS.goldLight, border:`1px solid #EDE8D4`, borderRadius:DS.r.full, fontSize:12, color:DS.goldDark, fontWeight:600, letterSpacing:0.3, marginBottom:24 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:DS.gold }} />
            Plateforme de réservation & gestion pour pros
          </div>

          <h1 style={{ fontSize:'clamp(2rem,5.5vw,3.25rem)', fontWeight:900, letterSpacing:'-0.055em', lineHeight:1.08, margin:'0 0 18px', color:DS.ink }}>
            Trouvez et réservez les<br/>meilleurs professionnels
          </h1>
          <p style={{ fontSize:'clamp(1rem,2vw,1.125rem)', color:DS.muted, lineHeight:1.65, margin:'0 0 36px', fontWeight:400 }}>
            Coiffeurs, artisans, restaurants, garages — réservez en quelques secondes, sans compte.
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} style={{ maxWidth:560, margin:'0 auto', display:'flex', background:DS.bg, border:`1.5px solid ${DS.border}`, borderRadius:DS.r.full, overflow:'hidden', boxShadow:DS.shadow.md, transition:'box-shadow .2s' }}
            onFocusCapture={e => e.currentTarget.style.boxShadow=DS.shadow.lg}
            onBlurCapture={e => e.currentTarget.style.boxShadow=DS.shadow.md}>
            <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 20px', gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.subtle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)}
                placeholder="Coiffeur, plombier, restaurant…"
                style={{ flex:1, border:'none', outline:'none', fontSize:15, color:DS.ink, background:'none', fontFamily:DS.font, padding:'15px 0' }} />
            </div>
            <button type="submit" style={{ padding:'0 28px', background:DS.ink, border:'none', cursor:'pointer', color:'#fff', fontSize:13, fontWeight:700, transition:'opacity .15s', borderRadius:`0 ${DS.r.full}px ${DS.r.full}px 0` }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* ── Catégories ── */}
      <section style={{ padding:'clamp(32px,5vh,52px) clamp(16px,5vw,48px)', maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ fontSize:13, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2.5, margin:'0 0 24px' }}>Explorer par catégorie</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(168px,1fr))', gap:12 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={()=>navigate(`/${cat.id}`)}
              style={{ padding:'20px 16px', background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, cursor:'pointer', textAlign:'left', transition:'all .18s', fontFamily:DS.font }}
              onMouseEnter={e=>{ e.currentTarget.style.background=DS.bgSoft; e.currentTarget.style.borderColor=DS.ink; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=DS.shadow.md; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=DS.bg; e.currentTarget.style.borderColor=DS.border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{cat.emoji}</div>
              <div style={{ fontSize:14, fontWeight:700, color:DS.ink, marginBottom:4, letterSpacing:'-0.02em' }}>{cat.label}</div>
              <div style={{ fontSize:11.5, color:DS.muted, lineHeight:1.4 }}>{cat.sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Pros à la une ── */}
      <section style={{ padding:'0 clamp(16px,5vw,48px) clamp(40px,6vh,64px)', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:24 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2.5, margin:0 }}>Professionnels à la une</h2>
          <button onClick={()=>navigate('/coiffure')} style={{ fontSize:13, color:DS.accent, fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir plus →</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
          {PROS_FEATURED.map(pro => (
            <button key={pro.id} onClick={()=>navigate(`/${pro.secteur}`)}
              style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, overflow:'hidden', cursor:'pointer', textAlign:'left', transition:'all .18s', fontFamily:DS.font }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow=DS.shadow.md; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='transparent'; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor=DS.border; }}>
              <div style={{ height:72, background:pro.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'rgba(255,255,255,0.9)', fontWeight:800 }}>{pro.initials}</div>
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontSize:14, fontWeight:700, color:DS.ink, letterSpacing:'-0.02em', marginBottom:2 }}>{pro.nom}</div>
                <div style={{ fontSize:11.5, color:DS.muted, marginBottom:8 }}>{pro.metier}</div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <Stars note={pro.note} />
                  <span style={{ fontSize:12, fontWeight:700, color:DS.ink }}>{pro.note}</span>
                  <span style={{ fontSize:11, color:DS.subtle }}>({pro.avis})</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA professionnels ── */}
      <section style={{ margin:'0 clamp(16px,5vw,48px) clamp(40px,6vh,64px)', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, padding:'clamp(28px,4vh,44px) clamp(24px,4vw,48px)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:DS.gold, textTransform:'uppercase', letterSpacing:3, marginBottom:10 }}>Vous êtes professionnel ?</div>
          <h3 style={{ fontSize:'clamp(1.25rem,3vw,1.625rem)', fontWeight:800, color:DS.ink, letterSpacing:'-0.04em', margin:'0 0 8px' }}>Développez votre activité<br/>avec Artisans.</h3>
          <p style={{ fontSize:14, color:DS.muted, lineHeight:1.6, margin:0 }}>Réservations en ligne, gestion agenda, paiements — tout en un.</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={()=>navigate('/register?role=patron')} style={{ padding:'12px 24px', background:DS.ink, border:'none', borderRadius:DS.r.full, fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', transition:'opacity .15s', whiteSpace:'nowrap' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Créer mon espace pro →
          </button>
          <button onClick={()=>navigate('/recrutement')} style={{ padding:'12px 24px', background:'none', border:`1px solid ${DS.border}`, borderRadius:DS.r.full, fontSize:13, fontWeight:500, color:DS.muted, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=DS.ink; e.currentTarget.style.color=DS.ink; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=DS.border; e.currentTarget.style.color=DS.muted; }}>
            Consulter les offres d'emploi
          </button>
        </div>
      </section>
    </div>
  );
}
