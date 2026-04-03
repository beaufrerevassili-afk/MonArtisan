import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const CATEGORIES = [
  { id: 'coiffure',   emoji: '✂️',  label: 'Coiffure & Beauté',  sub: 'Coiffeurs, barbiers, instituts' },
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurants',         sub: 'Sur place, livraison, traiteur' },
  { id: 'vacances',   emoji: '🏖️', label: 'Vacances & Séjours',  sub: 'Hôtels, villas, appartements' },
  { id: 'btp',        emoji: '🏗️', label: 'Artisans & Travaux',  sub: 'Plombier, électricien, maçon' },
];

const SUGGESTIONS = [
  // Coiffure
  { label: 'Coiffeur',          secteur: 'coiffure' },
  { label: 'Barbier',           secteur: 'coiffure' },
  { label: 'Coloriste',         secteur: 'coiffure' },
  { label: 'Manucure',          secteur: 'coiffure' },
  { label: 'Institut de beauté',secteur: 'coiffure' },
  { label: 'Spa & bien-être',   secteur: 'coiffure' },
  { label: 'Balayage',          secteur: 'coiffure' },
  { label: 'Épilation',         secteur: 'coiffure' },
  // Restaurant
  { label: 'Restaurant',        secteur: 'restaurant' },
  { label: 'Pizzeria',          secteur: 'restaurant' },
  { label: 'Sushi',             secteur: 'restaurant' },
  { label: 'Burger',            secteur: 'restaurant' },
  { label: 'Cuisine italienne', secteur: 'restaurant' },
  { label: 'Gastronomique',     secteur: 'restaurant' },
  { label: 'Cuisine française', secteur: 'restaurant' },
  { label: 'Végétarien',        secteur: 'restaurant' },
  { label: 'Kebab',             secteur: 'restaurant' },
  { label: 'Café & brunch',     secteur: 'restaurant' },
  // BTP
  { label: 'Plombier',          secteur: 'btp' },
  { label: 'Électricien',       secteur: 'btp' },
  { label: 'Maçon',             secteur: 'btp' },
  { label: 'Peintre',           secteur: 'btp' },
  { label: 'Menuisier',         secteur: 'btp' },
  { label: 'Couvreur',          secteur: 'btp' },
  { label: 'Chauffagiste',      secteur: 'btp' },
  { label: 'Serrurier',         secteur: 'btp' },
  { label: 'Carreleur',         secteur: 'btp' },
  { label: 'Isolation',         secteur: 'btp' },
  { label: 'Architecte',        secteur: 'btp' },
  // Vacances
  { label: 'Hôtel',                secteur: 'vacances' },
  { label: 'Location de vacances', secteur: 'vacances' },
  { label: "Chambre d'hôtes",      secteur: 'vacances' },
  { label: 'Villa',                secteur: 'vacances' },
  { label: 'Appartement',          secteur: 'vacances' },
  { label: 'Insolite',             secteur: 'vacances' },
];

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [query, setQuery]   = useState('');
  const [mounted, setMounted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef();
  const dropdownRef = useRef();

  useEffect(() => { setMounted(true); }, []);

  const filteredSuggestions = query.length >= 1
    ? SUGGESTIONS.filter(s => s.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && e.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToSecteur = (secteur, q = query) => {
    navigate(`/${secteur}?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (filteredSuggestions.length > 0) {
      const target = filteredSuggestions[activeIdx >= 0 ? activeIdx : 0];
      goToSecteur(target.secteur, target.label);
    } else {
      const q = query.toLowerCase();
      if (q.includes('coiff') || q.includes('cheveux') || q.includes('barb') || q.includes('manuc') || q.includes('salon') || q.includes('spa'))
        navigate(`/coiffure?q=${encodeURIComponent(query)}`);
      else if (q.includes('resto') || q.includes('pizza') || q.includes('sushi') || q.includes('burger') || q.includes('manger') || q.includes('gastro'))
        navigate(`/restaurant?q=${encodeURIComponent(query)}`);
      else if (q.includes('hotel') || q.includes('hôtel') || q.includes('vacanc') || q.includes('villa') || q.includes('appart') || q.includes('séjour') || q.includes('sejour'))
        navigate(`/vacances?q=${encodeURIComponent(query)}`);
      else
        navigate(`/btp?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filteredSuggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Escape')    { setShowSuggestions(false); setActiveIdx(-1); }
  };

  const catLabel = id => CATEGORIES.find(c => c.id === id)?.label || id;
  const catEmoji = id => CATEGORIES.find(c => c.id === id)?.emoji || '';

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
            Coiffeurs, artisans, restaurants, hôtels — réservez en quelques secondes, sans compte.
          </p>

          {/* Barre de recherche + autocomplete */}
          <div style={{ position:'relative', maxWidth:560, margin:'0 auto' }}>
            <form onSubmit={handleSearch}
              style={{ display:'flex', background:DS.bg, border:`1.5px solid ${DS.border}`, borderRadius:DS.r.full, overflow:'visible', boxShadow:DS.shadow.md, transition:'box-shadow .2s' }}
              onFocusCapture={e => e.currentTarget.style.boxShadow=DS.shadow.lg}
              onBlurCapture={e => e.currentTarget.style.boxShadow=DS.shadow.md}>
              <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 20px', gap:10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.subtle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setShowSuggestions(true); setActiveIdx(-1); }}
                  onFocus={() => { if (query.length >= 1) setShowSuggestions(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Coiffeur, plombier, restaurant, villa…"
                  autoComplete="off"
                  style={{ flex:1, border:'none', outline:'none', fontSize:15, color:DS.ink, background:'none', fontFamily:DS.font, padding:'15px 0' }}
                />
                {query && (
                  <button type="button"
                    onClick={() => { setQuery(''); setShowSuggestions(false); inputRef.current?.focus(); }}
                    style={{ background:'none', border:'none', cursor:'pointer', color:DS.subtle, padding:2, display:'flex', flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
              <button type="submit"
                style={{ padding:'0 28px', background:DS.ink, border:'none', cursor:'pointer', color:'#fff', fontSize:13, fontWeight:700, transition:'opacity .15s', borderRadius:`0 ${DS.r.full}px ${DS.r.full}px 0`, flexShrink:0 }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                Rechercher
              </button>
            </form>

            {/* Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div ref={dropdownRef}
                style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, boxShadow:DS.shadow.lg, zIndex:200, overflow:'hidden' }}>
                {filteredSuggestions.map((s, i) => (
                  <div key={i}
                    onMouseDown={() => goToSecteur(s.secteur, s.label)}
                    onMouseEnter={() => setActiveIdx(i)}
                    style={{ padding:'11px 18px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:i===activeIdx?DS.bgSoft:'transparent', transition:'background .1s', borderBottom: i < filteredSuggestions.length-1 ? `1px solid ${DS.borderLight || DS.border}` : 'none' }}>
                    <span style={{ fontSize:16 }}>{catEmoji(s.secteur)}</span>
                    <span style={{ flex:1, fontSize:14, color:DS.ink, fontWeight:500 }}>{s.label}</span>
                    <span style={{ fontSize:11, color:DS.subtle, background:DS.bgSoft, padding:'2px 9px', borderRadius:DS.r.full, flexShrink:0 }}>
                      {catLabel(s.secteur)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Catégories ── */}
      <section style={{ padding:'clamp(32px,5vh,52px) clamp(16px,5vw,48px)', maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ fontSize:13, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2.5, margin:'0 0 24px' }}>Explorer par catégorie</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(168px,1fr))', gap:12 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => navigate(`/${cat.id}`)}
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

      {/* ── CTA professionnels ── */}
      <section style={{ margin:'0 clamp(16px,5vw,48px) clamp(40px,6vh,64px)', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, padding:'clamp(28px,4vh,44px) clamp(24px,4vw,48px)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:DS.gold, textTransform:'uppercase', letterSpacing:3, marginBottom:10 }}>Vous êtes professionnel ?</div>
          <h3 style={{ fontSize:'clamp(1.25rem,3vw,1.625rem)', fontWeight:800, color:DS.ink, letterSpacing:'-0.04em', margin:'0 0 8px' }}>Développez votre activité<br/>avec Freample.</h3>
          <p style={{ fontSize:14, color:DS.muted, lineHeight:1.6, margin:0 }}>Réservations en ligne, gestion agenda, paiements — tout en un.</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={() => navigate('/register?role=patron')}
            style={{ padding:'12px 24px', background:DS.ink, border:'none', borderRadius:DS.r.full, fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', transition:'opacity .15s', whiteSpace:'nowrap' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Créer mon espace pro →
          </button>
          <button onClick={() => navigate('/recrutement')}
            style={{ padding:'12px 24px', background:'none', border:`1px solid ${DS.border}`, borderRadius:DS.r.full, fontSize:13, fontWeight:500, color:DS.muted, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=DS.ink; e.currentTarget.style.color=DS.ink; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=DS.border; e.currentTarget.style.color=DS.muted; }}>
            Consulter les offres d'emploi
          </button>
        </div>
      </section>
    </div>
  );
}
