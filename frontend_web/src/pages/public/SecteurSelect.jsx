import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'coiffure',    emoji: '✂️',  label: 'Coiffure & Beauté'  },
  { id: 'restaurant',  emoji: '🍽️', label: 'Restaurants'         },
  { id: 'boulangerie', emoji: '🥖',  label: 'Boulangeries'        },
  { id: 'garage',      emoji: '🔧',  label: 'Garages & Auto'      },
  { id: 'btp',         emoji: '🔨',  label: 'Artisans & Travaux'  },
  { id: 'commerce',    emoji: '🛍️', label: 'Commerces'           },
];

// Professionnels en vedette (démo)
const PROS_VEDETTE = [
  { id: 1, secteur: 'coiffure',    nom: 'Salon Léa',       metier: 'Coiffeuse',         ville: 'Paris 11e',   note: 4.9, avis: 142, dispo: 'Dispo aujourd\'hui', prix: 'À partir de 35€', color: '#EC4899' },
  { id: 2, secteur: 'restaurant',  nom: 'Chez Marco',       metier: 'Restaurant italien', ville: 'Lyon 2e',     note: 4.8, avis: 89,  dispo: 'Table ce soir',     prix: 'Menu 22€',        color: '#F97316' },
  { id: 3, secteur: 'boulangerie', nom: 'Maison Dupont',    metier: 'Boulangerie',        ville: 'Bordeaux',    note: 4.9, avis: 213, dispo: 'Commande possible',  prix: 'À partir de 1,20€', color: '#D97706' },
  { id: 4, secteur: 'coiffure',    nom: 'Barbershop Alex',  metier: 'Barbier',            ville: 'Marseille',   note: 5.0, avis: 67,  dispo: 'Dispo ce soir',     prix: 'À partir de 18€', color: '#EC4899' },
  { id: 5, secteur: 'garage',      nom: 'Garage Martin',    metier: 'Mécanicien',         ville: 'Toulouse',    note: 4.7, avis: 54,  dispo: 'RDV demain',        prix: 'Devis gratuit',   color: '#10B981' },
  { id: 6, secteur: 'btp',         nom: 'Tom Plomberie',    metier: 'Plombier',           ville: 'Nantes',      note: 4.8, avis: 98,  dispo: 'Urgent possible',   prix: 'Devis gratuit',   color: '#5B5BD6' },
];

function ProCard({ pro }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  const initials = pro.nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/${pro.secteur}?focus=${pro.id}`)}
      style={{
        flexShrink: 0, width: 220,
        background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Cover / avatar */}
      <div style={{ height: 90, background: `${pro.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${pro.color}, ${pro.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 800, color: '#fff', boxShadow: `0 4px 16px ${pro.color}50` }}>
          {initials}
        </div>
        {/* Dispo badge */}
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, color: '#10B981' }}>
          {pro.dispo}
        </div>
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 2 }}>{pro.nom}</div>
        <div style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{pro.metier} · {pro.ville}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{pro.note}</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>({pro.avis} avis)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: pro.color }}>{pro.prix}</span>
          <span style={{ fontSize: '0.75rem', color: hov ? '#fff' : 'rgba(255,255,255,0.35)', fontWeight: 600, transition: 'color 0.2s' }}>Réserver →</span>
        </div>
      </div>
    </div>
  );
}

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    // Detect sector from query
    const q = query.toLowerCase();
    if (q.includes('coiff') || q.includes('cheveux') || q.includes('barbier')) navigate(`/coiffure?q=${encodeURIComponent(query)}`);
    else if (q.includes('restaurant') || q.includes('table') || q.includes('manger')) navigate(`/restaurant?q=${encodeURIComponent(query)}`);
    else if (q.includes('pain') || q.includes('boulan') || q.includes('pâtis')) navigate(`/boulangerie?q=${encodeURIComponent(query)}`);
    else if (q.includes('garage') || q.includes('voiture') || q.includes('méca')) navigate(`/garage?q=${encodeURIComponent(query)}`);
    else if (q.includes('plombier') || q.includes('électricien') || q.includes('peintre') || q.includes('artisan')) navigate(`/btp?q=${encodeURIComponent(query)}`);
    else navigate(`/btp?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#09090F',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      color: '#fff', overflowX: 'hidden',
    }}>

      {/* ── Subtle radial glow ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 100% 60% at 50% -10%, rgba(91,91,214,0.14) 0%, transparent 60%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Nav ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(20px, 5vw, 56px)', height: 58,
          background: 'rgba(9,9,15,0.9)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(91,91,214,0.5)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.65)"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.03em' }}>
              Artisans<span style={{ background: 'linear-gradient(90deg, #A5A5FF, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => navigate('/recrutement')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.825rem', color: 'rgba(255,255,255,0.4)', padding: '6px 10px', borderRadius: 8, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}
            >Emploi</button>
            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '7px 15px', borderRadius: 8, fontSize: '0.825rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.11)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.75)'; }}
            >Connexion</button>
            <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', cursor: 'pointer', padding: '7px 15px', borderRadius: 8, fontSize: '0.825rem', fontWeight: 600, color: '#fff', boxShadow: '0 4px 12px rgba(91,91,214,0.35)', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}
            >Inscription</button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{
          padding: 'clamp(64px, 11vh, 100px) clamp(20px, 5vw, 56px) clamp(48px, 7vh, 72px)',
          textAlign: 'center', maxWidth: 780, margin: '0 auto',
          opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(18px)',
          transition: 'opacity .55s ease, transform .55s ease',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.25rem, 6vw, 4rem)',
            fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.05em',
            color: '#fff', margin: '0 0 20px',
          }}>
            Trouvez et réservez<br />
            <span style={{ background: 'linear-gradient(135deg, #A5A5FF, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              les meilleurs pros
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: 'rgba(255,255,255,0.4)', margin: '0 0 36px', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
            Coiffeur, restaurant, artisan, boulangerie — sans compte, sans attente.
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex', maxWidth: 560, margin: '0 auto',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Coiffeur, restaurant, plombier..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.9375rem', color: '#fff', fontFamily: 'inherit', padding: '15px 0', letterSpacing: '-0.01em' }}
              />
            </div>
            <button onClick={handleSearch} style={{ background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', cursor: 'pointer', padding: '0 22px', fontWeight: 700, color: '#fff', fontSize: '0.9375rem', transition: 'opacity .15s', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}
            >Rechercher</button>
          </div>
        </div>

        {/* ── Catégories ── */}
        <div style={{ padding: '0 clamp(20px, 5vw, 56px) 56px', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(14px)', transition: 'opacity .5s .1s, transform .5s .1s' }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 680, margin: '0 auto' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => navigate(`/${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 40, padding: '9px 18px', cursor: 'pointer', transition: 'all .2s', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.transform=''; }}
              >
                <span style={{ fontSize: '1rem' }}>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pros en vedette ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(36px, 5vh, 52px) 0 clamp(40px, 6vh, 60px)' }}>
          <div style={{ padding: '0 clamp(20px, 5vw, 56px)', marginBottom: 20, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Disponibles maintenant</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.01em' }}
              onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}
            >Voir tout →</button>
          </div>
          {/* Horizontal scroll */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px clamp(20px, 5vw, 56px) 8px', scrollbarWidth: 'none' }}>
            {PROS_VEDETTE.map(pro => <ProCard key={pro.id} pro={pro} />)}
          </div>
        </div>

        {/* ── Bandeau pro ── */}
        <div style={{
          margin: '0 clamp(20px, 5vw, 56px) clamp(40px, 6vh, 60px)',
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(91,91,214,0.12) 0%, rgba(124,58,237,0.08) 100%)',
          border: '1px solid rgba(91,91,214,0.2)',
          padding: 'clamp(24px, 4vh, 36px) clamp(20px, 4vw, 40px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(165,165,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 6 }}>Vous êtes un professionnel ?</div>
            <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.375rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
              Publiez vos services, gérez vos réservations
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>Gratuit pour commencer · Visibilité immédiate · Paiement sécurisé</div>
          </div>
          <button onClick={() => navigate('/register')}
            style={{ flexShrink: 0, background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', cursor: 'pointer', padding: '12px 24px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 700, color: '#fff', boxShadow: '0 6px 20px rgba(91,91,214,0.35)', whiteSpace: 'nowrap', transition: 'transform .15s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform=''}
          >
            Rejoindre gratuitement →
          </button>
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px clamp(20px, 5vw, 56px) 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.18)' }}>© 2025 Artisans Pro</span>
          <div style={{ display: 'flex', gap: 18 }}>
            {[['CGU', '/cgu'], ['Connexion', '/login'], ['Recrutement', '/recrutement']].map(([l, p]) => (
              <button key={p} onClick={() => navigate(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.775rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em', transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}
              >{l}</button>
            ))}
          </div>
        </div>

      </div>
      <style>{`input::placeholder{color:rgba(255,255,255,0.28);} *::-webkit-scrollbar{display:none;}`}</style>
    </div>
  );
}
