import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import HideForClient from '../../components/public/HideForClient';

const CATEGORIES = [
  { id: 'btp',        emoji: '🏗️', label: 'Travaux & Dépannage',  desc: 'Besoin d\'un plombier, électricien ou peintre ? Comparez les pros et demandez un devis gratuit.', cta: 'Découvrir la démo', demo: true },
  { id: 'coiffure',   emoji: '✂️',  label: 'Coiffure & Beauté',   desc: 'Coiffeurs, barbiers, instituts de beauté — consultez les disponibilités et réservez en ligne.', cta: 'Découvrir la démo', demo: true },
  { id: 'com',        emoji: '🎬', label: 'Freample Com',         desc: 'Montage vidéo pro pour TikTok, YouTube, Reels. Envoyez votre brief, on s\'occupe du reste.', cta: 'Envoyer mon brief', active: true },
  { id: 'restaurant', emoji: 'FR', label: 'Bientôt disponible',   desc: 'Nouveau service en préparation', locked: true },
  { id: 'eat',        emoji: 'FRe', label: 'Bientôt disponible',  desc: 'Nouveau service en préparation', locked: true },
  { id: 'course',     emoji: 'FRc', label: 'Bientôt disponible',  desc: 'Nouveau service en préparation', locked: true },
  { id: 'vacances',   emoji: 'V',  label: 'Bientôt disponible',   desc: 'Nouveau service en préparation', locked: true },
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

      {/* ── 3 services direct ── */}
      <section style={{
        padding: 'clamp(40px,7vh,72px) clamp(16px,5vw,48px) 0',
        maxWidth: 1100, margin: '0 auto',
        opacity: mounted?1:0, transform: mounted?'none':'translateY(12px)',
        transition: 'opacity .5s ease, transform .5s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,4vh,44px)' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem,4.5vw,2.75rem)', fontWeight: 900, color: DS.ink, letterSpacing: '-0.05em', lineHeight: 1.1, margin: '0 0 12px' }}>
            Freample, la simplicité à votre service.
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem,2vw,1.125rem)', color: DS.muted, lineHeight: 1.6, margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Choisissez ce dont vous avez besoin, on s'occupe du reste.
          </p>
        </div>
        {/* FreampleCom — mis en avant */}
        {CATEGORIES.filter(c => c.active).map(cat => (
          <div key={cat.id} onClick={() => navigate(`/${cat.id}`)}
            style={{ background: DS.ink, borderRadius: 20, padding: 'clamp(28px,4vh,40px) clamp(24px,4vw,36px)', cursor: 'pointer', transition: 'all .2s', marginBottom: 16, position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ position: 'absolute', top: 16, right: 20, background: '#22C55E', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.02em' }}>Disponible maintenant</div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>{cat.label}</div>
            <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, maxWidth: 420, marginBottom: 20 }}>{cat.desc}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: '#fff', color: DS.ink, borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
              {cat.cta} <span style={{ fontSize: 16 }}>→</span>
            </div>
          </div>
        ))}

        {/* BTP + Coiffure */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {CATEGORIES.filter(c => !c.locked && !c.active).map(cat => (
            <div key={cat.id} onClick={() => navigate(`/${cat.id}`)}
              style={{ padding: '32px 28px', background: '#fff', border: `1.5px solid ${DS.border}`, borderRadius: 20, cursor: 'pointer', fontFamily: DS.font, transition: 'all .2s', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ position: 'absolute', top: 16, right: 16, background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.01em' }}>En cours de développement</div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: DS.ink, letterSpacing: '-0.03em', marginBottom: 6 }}>{cat.label}</div>
              <div style={{ fontSize: 14, color: DS.muted, lineHeight: 1.55, marginBottom: 20, flex: 1 }}>{cat.desc}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: DS.bgSoft, color: DS.ink, borderRadius: 10, fontSize: 13, fontWeight: 700, alignSelf: 'flex-start' }}>
                {cat.cta} <span style={{ fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── D'autres services arrivent ── */}
      <section style={{ padding: '0 clamp(16px,5vw,48px) clamp(40px,6vh,64px)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '28px 20px', background: '#FAFAFA', borderRadius: 14, border: '1px dashed #E0E0E0' }}
          onClick={() => setLockModal('eat')}>
          <span style={{ fontSize: 14, color: DS.muted, cursor: 'pointer' }}>D'autres services arrivent bientôt — restez connectés.</span>
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
