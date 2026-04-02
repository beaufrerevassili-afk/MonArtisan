import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Données ───────────────────────────────────────────────────────────────────

const SECTEURS = [
  {
    id: 'btp',
    emoji: '🔨',
    label: 'Artisans & Travaux',
    sub: 'Plombier, électricien, peintre...',
    color: '#5B5BD6',
    grad: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
    bg: 'rgba(91,91,214,0.1)',
    border: 'rgba(91,91,214,0.25)',
    searches: ['Plombier urgence', 'Peintre appartement', 'Électricien'],
  },
  {
    id: 'coiffure',
    emoji: '✂️',
    label: 'Coiffure & Beauté',
    sub: 'Salon, barbier, institut...',
    color: '#EC4899',
    grad: 'linear-gradient(135deg, #EC4899, #A855F7)',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.25)',
    searches: ['Coiffeur ce soir', 'Barbier', 'Balayage'],
  },
  {
    id: 'restaurant',
    emoji: '🍽️',
    label: 'Restaurants',
    sub: 'Table, livraison, traiteur...',
    color: '#F97316',
    grad: 'linear-gradient(135deg, #F97316, #EF4444)',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.25)',
    searches: ['Table ce soir', 'Italien', 'Livraison'],
  },
  {
    id: 'boulangerie',
    emoji: '🥖',
    label: 'Boulangeries',
    sub: 'Pain, pâtisserie, viennoiseries...',
    color: '#D97706',
    grad: 'linear-gradient(135deg, #D97706, #DC2626)',
    bg: 'rgba(217,119,6,0.1)',
    border: 'rgba(217,119,6,0.25)',
    searches: ['Pain au levain', 'Croissant', 'Commande gâteau'],
  },
  {
    id: 'garage',
    emoji: '🔧',
    label: 'Garages & Auto',
    sub: 'Réparation, entretien, pneus...',
    color: '#10B981',
    grad: 'linear-gradient(135deg, #10B981, #0891B2)',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    searches: ['Vidange rapide', 'Pneus hiver', 'Diagnostic'],
  },
  {
    id: 'commerce',
    emoji: '🛍️',
    label: 'Commerces',
    sub: 'Épicerie, fleuriste, pressing...',
    color: '#6366F1',
    grad: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
    searches: ['Fleuriste', 'Pressing express', 'Épicerie fine'],
  },
];

const TENDANCES = [
  '✂️ Coiffeur disponible aujourd\'hui',
  '🔨 Plombier urgence',
  '🍽️ Réserver une table',
  '🥖 Commander un gâteau',
  '🔧 Vidange rapide',
  '🎨 Peintre appartement',
];

const AVIS = [
  { nom: 'Camille R.', note: 5, texte: 'Coiffeur trouvé en 2 minutes, rdv le soir même. Impeccable !', secteur: '✂️ Coiffure', ville: 'Lyon' },
  { nom: 'Marc D.', note: 5, texte: 'Plombier arrivé en 45min. Problème réglé, prix clair. Je recommande.', secteur: '🔨 BTP', ville: 'Paris' },
  { nom: 'Sofia K.', note: 5, texte: 'Table réservée en 30 secondes, SMS de confirmation immédiat.', secteur: '🍽️ Restaurant', ville: 'Bordeaux' },
];

// ─── Composant carte secteur ───────────────────────────────────────────────────

function SecteurCard({ s, onSearch }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/${s.id}`)}
      style={{
        background: hov ? s.bg : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? s.border : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20,
        padding: '22px 20px 18px',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.34,1.1,0.64,1)',
        transform: hov ? 'translateY(-5px)' : 'none',
        boxShadow: hov ? `0 16px 40px ${s.color}25` : 'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: hov ? s.grad : `${s.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', marginBottom: 14,
        transition: 'all 0.22s',
        boxShadow: hov ? `0 6px 20px ${s.color}40` : 'none',
      }}>
        {s.emoji}
      </div>

      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>
        {s.label}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.4 }}>
        {s.sub}
      </div>

      {/* Popular searches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {s.searches.map(q => (
          <button
            key={q}
            onClick={e => { e.stopPropagation(); onSearch(q, s.id); }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '5px 10px', fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.55)', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = `${s.color}20`; e.currentTarget.style.borderColor = `${s.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            🔍 {q}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: hov ? s.color : 'rgba(255,255,255,0.3)', transition: 'color 0.2s', letterSpacing: '-0.01em' }}>
          Voir les pros
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hov ? s.color : 'rgba(255,255,255,0.25)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'all 0.2s', transform: hov ? 'translateX(4px)' : 'none' }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [mounted, setMounted] = useState(false);
  const [tendanceIdx, setTendanceIdx] = useState(0);
  const [avisIdx, setAvisIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    // Rotate trending searches
    const t = setInterval(() => setTendanceIdx(i => (i + 1) % TENDANCES.length), 3000);
    // Rotate testimonials
    const a = setInterval(() => setAvisIdx(i => (i + 1) % AVIS.length), 4000);
    return () => { clearInterval(t); clearInterval(a); };
  }, []);

  const handleSearch = (q = query, secteur = null) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('ou', location);
    const base = secteur ? `/${secteur}` : '/btp';
    navigate(`${base}?${params.toString()}`);
  };

  const handleQuickSearch = (q, secteur) => {
    navigate(`/${secteur}?q=${encodeURIComponent(q)}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080F',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      color: '#fff',
      overflowX: 'hidden',
    }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(ellipse 90% 55% at 50% -5%, rgba(91,91,214,0.16) 0%, transparent 55%),
          radial-gradient(ellipse 50% 35% at 90% 90%, rgba(236,72,153,0.06) 0%, transparent 50%)
        `,
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navbar ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(20px, 5vw, 60px)', height: 60,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(8,8,15,0.85)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91,91,214,0.4)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.7)"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.025em' }}>
              Artisans<span style={{ background: 'linear-gradient(90deg, #A5A5FF, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => navigate('/recrutement')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', padding: '6px 12px', borderRadius: 8 }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >Emploi</button>
            <button onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '7px 16px', borderRadius: 9, fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            >Connexion</button>
            <button onClick={() => navigate('/register')}
              style={{ background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', cursor: 'pointer', padding: '7px 16px', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, color: '#fff', boxShadow: '0 4px 14px rgba(91,91,214,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >Inscription</button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(52px, 9vh, 88px) clamp(20px, 5vw, 60px) clamp(40px, 6vh, 60px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.55s ease, transform 0.55s ease',
        }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 24, padding: '5px 14px 5px 10px', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>Des pros disponibles près de chez vous</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1.08,
            letterSpacing: '-0.045em',
            color: '#fff', margin: '0 auto 16px', maxWidth: 720,
          }}>
            Trouvez le bon{' '}
            <span style={{
              background: 'linear-gradient(135deg, #A5A5FF 0%, #C084FC 40%, #F472B6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              professionnel
            </span>
            <br />près de chez vous
          </h1>

          <p style={{
            fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
            color: 'rgba(255,255,255,0.45)',
            margin: '0 auto 36px', maxWidth: 480,
            lineHeight: 1.65, letterSpacing: '-0.01em',
          }}>
            Coiffeur, plombier, restaurant, boulangerie — réservez en quelques secondes, sans compte.
          </p>

          {/* ── Barre de recherche ── */}
          <div style={{
            display: 'flex', gap: 0, maxWidth: 620,
            margin: '0 auto 24px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 16,
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
            {/* Quoi */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: 16, flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={TENDANCES[tendanceIdx]}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  padding: '16px 16px 16px 44px',
                  fontSize: '0.9375rem', color: '#fff',
                  fontFamily: 'inherit', letterSpacing: '-0.01em',
                }}
              />
            </div>
            {/* Séparateur */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
            {/* Où */}
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', minWidth: 140 }}>
              <svg style={{ marginLeft: 14, flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Ville, code postal"
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  padding: '16px 12px',
                  fontSize: '0.9375rem', color: '#fff',
                  fontFamily: 'inherit', letterSpacing: '-0.01em',
                }}
              />
            </div>
            {/* Bouton */}
            <button
              onClick={() => handleSearch()}
              style={{
                flexShrink: 0,
                background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
                border: 'none', cursor: 'pointer',
                padding: '0 24px',
                fontSize: '0.9375rem', fontWeight: 700, color: '#fff',
                transition: 'opacity 0.15s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Chercher
            </button>
          </div>

          {/* Social proof mini */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {/* Avatars */}
            <div style={{ display: 'flex' }}>
              {['#5B5BD6','#EC4899','#F97316','#10B981'].map((c, i) => (
                <div key={c} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid #08080F', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: '#fff' }}>
                  {['C','M','S','A'][i]}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em' }}>
              <strong style={{ color: 'rgba(255,255,255,0.7)' }}>4 800+</strong> réservations ce mois
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>·</span>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>
              ⭐ <strong style={{ color: 'rgba(255,255,255,0.7)' }}>4,8/5</strong> satisfaction
            </span>
          </div>
        </div>

        {/* ── Secteurs ── */}
        <div style={{ padding: '0 clamp(20px, 5vw, 60px) clamp(40px, 6vh, 64px)', maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            Que cherchez-vous ?
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s 0.15s, transform 0.5s 0.15s',
          }}>
            {SECTEURS.map((s, i) => (
              <SecteurCard key={s.id} s={s} onSearch={handleQuickSearch} />
            ))}
          </div>
        </div>

        {/* ── Comment ça marche ── */}
        <div style={{
          padding: 'clamp(40px, 6vh, 64px) clamp(20px, 5vw, 60px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)',
        }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.035em', margin: '0 0 36px' }}>
            Simple comme bonjour
          </h2>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
            {[
              { num: '1', titre: 'Choisissez', desc: 'Sélectionnez votre service et indiquez votre ville.', icon: '🔍' },
              { num: '2', titre: 'Comparez', desc: 'Notes, disponibilités, tarifs — tout est transparent.', icon: '⭐' },
              { num: '3', titre: 'Réservez', desc: 'Confirmez en 1 clic. Rappel automatique par SMS.', icon: '✅' },
            ].map((step, i) => (
              <div key={i} style={{ flex: '1 1 200px', maxWidth: 260, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{step.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{step.num}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{step.titre}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Avis clients ── */}
        <div style={{ padding: 'clamp(36px, 5vh, 56px) clamp(20px, 5vw, 60px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20, padding: '28px 28px 24px',
              transition: 'opacity 0.4s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 14 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.65, margin: '0 0 18px' }}>
                "{AVIS[avisIdx].texte}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                  {AVIS[avisIdx].nom[0]}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{AVIS[avisIdx].nom}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{AVIS[avisIdx].secteur} · {AVIS[avisIdx].ville}</div>
                </div>
              </div>
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              {AVIS.map((_, i) => (
                <button key={i} onClick={() => setAvisIdx(i)}
                  style={{ width: i === avisIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === avisIdx ? '#5B5BD6' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA Pros ── */}
        <div style={{
          padding: 'clamp(36px, 5vh, 56px) clamp(20px, 5vw, 60px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20, flexWrap: 'wrap',
          maxWidth: 1200, margin: '0 auto',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>Vous êtes un professionnel ?</div>
            <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              Développez votre clientèle avec Artisans Pro
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              Visibilité, réservations en ligne, gestion simplifiée — gratuit pour commencer.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')}
              style={{ background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', cursor: 'pointer', padding: '12px 24px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 700, color: '#fff', boxShadow: '0 6px 20px rgba(91,91,214,0.35)', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              Rejoindre gratuitement →
            </button>
            <button onClick={() => navigate('/recrutement')}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: '12px 20px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              👷 Recrutement
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '16px clamp(20px, 5vw, 60px) 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.2)' }}>© 2025 Artisans Pro</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['CGU', '/cgu'], ['Connexion', '/login'], ['Inscription', '/register']].map(([l, p]) => (
              <button key={p} onClick={() => navigate(p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '-0.01em' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
              >{l}</button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}
