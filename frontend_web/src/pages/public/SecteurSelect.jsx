import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import HideForClient from '../../components/public/HideForClient';

const CATEGORIES = [
  { id: 'coiffure',   emoji: '✂️',  label: 'Coiffure & Beauté',  sub: 'Coiffeurs, barbiers, instituts' },
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurants',         sub: 'Sur place, livraison, traiteur' },
  { id: 'eat',        emoji: 'FRe', label: 'Bientôt disponible',   sub: 'Nouveau service en préparation', locked: true },
  { id: 'course',     emoji: 'FRc', label: 'Bientôt disponible',  sub: 'Nouveau service en préparation', locked: true },
  { id: 'com',        emoji: '🎬', label: 'Freample Com',        sub: 'Marketing, montage vidéo, design' },
  { id: 'vacances',   emoji: 'V',  label: 'Bientôt disponible',   sub: 'Nouveau service en préparation', locked: true },
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
  // Freample Com
  { label: 'Montage vidéo',        secteur: 'com' },
  { label: 'TikTok',               secteur: 'com' },
  { label: 'YouTube',              secteur: 'com' },
  { label: 'Marketing',            secteur: 'com' },
  { label: 'Design graphique',     secteur: 'com' },
  { label: 'Logo',                 secteur: 'com' },
  { label: 'Réseaux sociaux',      secteur: 'com' },
  { label: 'Community management', secteur: 'com' },
  { label: 'Publicité en ligne',   secteur: 'com' },
  // Freample Eat
  { label: 'Livraison repas',      secteur: 'eat' },
  { label: 'Commander à manger',   secteur: 'eat' },
  { label: 'Livraison pizza',      secteur: 'eat' },
  { label: 'Livraison sushi',      secteur: 'eat' },
  { label: 'Livraison burger',     secteur: 'eat' },
  // Freample Course
  { label: 'VTC',                  secteur: 'course' },
  { label: 'Chauffeur privé',      secteur: 'course' },
  { label: 'Course',               secteur: 'course' },
  { label: 'Livraison colis',      secteur: 'course' },
  { label: 'Transport',            secteur: 'course' },
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

  // Chantier lock
  const [lockModal, setLockModal] = useState(null); // locked cat id
  const [lockEmail, setLockEmail] = useState('');
  const [lockPwd, setLockPwd] = useState('');
  const [lockError, setLockError] = useState('');
  const [unlockedSectors, setUnlockedSectors] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('unlocked_sectors') || '[]'); } catch { return []; }
  });

  const handleUnlock = () => {
    if (lockEmail === 'freamplecom@gmail.com' && lockPwd === 'freamplecomazerty19') {
      const updated = [...new Set([...unlockedSectors, lockModal])];
      setUnlockedSectors(updated);
      sessionStorage.setItem('unlocked_sectors', JSON.stringify(updated));
      setLockError('');
      setLockEmail('');
      setLockPwd('');
      const targetId = lockModal;
      setLockModal(null);
      navigate(`/login?from=${targetId}`);
    } else {
      setLockError('Identifiants incorrects');
    }
  };

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
      else if (q.includes('montage') || q.includes('tiktok') || q.includes('youtube') || q.includes('market') || q.includes('design') || q.includes('logo') || q.includes('vidéo') || q.includes('video') || q.includes('commun'))
        navigate(`/com?q=${encodeURIComponent(query)}`);
      else if (q.includes('livr') || q.includes('eat') || q.includes('command') || q.includes('repas'))
        navigate(`/eat?q=${encodeURIComponent(query)}`);
      else if (q.includes('vtc') || q.includes('chauffeur') || q.includes('course') || q.includes('taxi') || q.includes('colis') || q.includes('transport'))
        navigate(`/course?q=${encodeURIComponent(query)}`);
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
          <HideForClient>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', background:DS.goldLight, border:`1px solid #EDE8D4`, borderRadius:DS.r.full, fontSize:12, color:DS.goldDark, fontWeight:600, letterSpacing:0.3, marginBottom:24 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:DS.gold }} />
              Plateforme de réservation & gestion pour pros
            </div>
          </HideForClient>

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
          {CATEGORIES.map(cat => {
            const isLocked = cat.locked && !unlockedSectors.includes(cat.id);
            return (
              <button key={cat.id} onClick={() => isLocked ? setLockModal(cat.id) : navigate(`/${cat.id}`)}
                style={{ padding:'20px 16px', background: isLocked ? '#F9FAFB' : DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, cursor:'pointer', textAlign:'left', transition:'all .18s', fontFamily:DS.font, position:'relative', overflow:'hidden' }}
                onMouseEnter={e=>{ e.currentTarget.style.background = isLocked ? '#F3F4F6' : DS.bgSoft; if(!isLocked) { e.currentTarget.style.borderColor=DS.ink; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=DS.shadow.md; } }}
                onMouseLeave={e=>{ e.currentTarget.style.background = isLocked ? '#F9FAFB' : DS.bg; e.currentTarget.style.borderColor=DS.border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ fontSize: cat.emoji.length > 2 ? 16 : 26, marginBottom:10, filter: isLocked ? 'grayscale(1) opacity(0.4)' : 'none', fontWeight: cat.emoji.length > 2 ? 800 : 400, color: isLocked ? '#9CA3AF' : DS.ink, letterSpacing: cat.emoji.length > 2 ? '-0.03em' : 0 }}>{cat.emoji}</div>
                <div style={{ fontSize:14, fontWeight:700, color: isLocked ? '#9CA3AF' : DS.ink, marginBottom:4, letterSpacing:'-0.02em' }}>{cat.label}</div>
                <div style={{ fontSize:11.5, color:DS.muted, lineHeight:1.4 }}>{isLocked ? 'En cours de développement' : cat.sub}</div>
                {isLocked && (
                  <div style={{ position:'absolute', top:10, right:10, width:24, height:24, borderRadius:'50%', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🚧</div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── CTA professionnels (caché pour les clients) ── */}
      <HideForClient><section style={{ margin:'0 clamp(16px,5vw,48px) clamp(40px,6vh,64px)', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, padding:'clamp(28px,4vh,44px) clamp(24px,4vw,48px)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
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
        </div>
      </section></HideForClient>

      {/* ── Modal déverrouillage ── */}
      {lockModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={() => { setLockModal(null); setLockError(''); setLockEmail(''); setLockPwd(''); }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'32px 28px', maxWidth:400, width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🚧</div>
              <div style={{ fontSize:20, fontWeight:800, color:DS.ink, marginBottom:4 }}>Accès restreint</div>
              <div style={{ fontSize:14, color:DS.muted }}>Cette fonctionnalité est en cours de développement. Connectez-vous avec vos identifiants Freample pour accéder à la démo.</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Email</label>
              <input type="email" value={lockEmail} onChange={e => setLockEmail(e.target.value)} placeholder="votre@email.com"
                style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${DS.border}`, fontSize:15, fontFamily:DS.font, outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Mot de passe</label>
              <input type="password" value={lockPwd} onChange={e => setLockPwd(e.target.value)} placeholder="••••••••"
                onKeyDown={e => { if(e.key === 'Enter') handleUnlock(); }}
                style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${DS.border}`, fontSize:15, fontFamily:DS.font, outline:'none', boxSizing:'border-box' }} />
            </div>
            {lockError && (
              <div style={{ padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, fontSize:13, color:'#DC2626', marginBottom:14 }}>
                {lockError}
              </div>
            )}
            <button onClick={handleUnlock}
              style={{ width:'100%', padding:'13px', background:DS.ink, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:DS.font, marginBottom:8 }}>
              Débloquer l'accès
            </button>
            <button onClick={() => { setLockModal(null); setLockError(''); }}
              style={{ width:'100%', padding:'10px', background:'none', color:DS.muted, border:'none', cursor:'pointer', fontFamily:DS.font, fontSize:14 }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
