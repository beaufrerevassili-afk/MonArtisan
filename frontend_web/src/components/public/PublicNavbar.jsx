import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DS from '../../design/ds';

export default function PublicNavbar({ subNav = null, transparent = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 200 }}>
      {/* Barre principale */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,48px)', height: DS.navH,
        background: solid ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: solid ? 'blur(20px)' : 'none',
        borderBottom: solid ? `1px solid ${DS.border}` : '1px solid transparent',
        transition: 'background .25s, border-color .25s, backdrop-filter .25s',
        fontFamily: DS.font,
      }}>
        {/* Logo */}
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, fontWeight: 800, color: DS.ink, letterSpacing: '-0.05em',
          display: 'flex', alignItems: 'center', gap: 2, fontFamily: DS.font,
          lineHeight: 1,
        }}>
          Artisans<span style={{ color: DS.gold }}>.</span>
        </button>

        {/* Actions droite */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => navigate('/recrutement')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: DS.muted, padding: '6px 10px', borderRadius: DS.r.sm, transition: 'color .15s', fontFamily: DS.font }}
            onMouseEnter={e => e.currentTarget.style.color = DS.ink}
            onMouseLeave={e => e.currentTarget.style.color = DS.muted}>
            Emploi
          </button>
          <button onClick={() => {
              const sector = location.pathname.split('/')[1];
              const valid = ['vacances','restaurant','coiffure','btp'];
              navigate(valid.includes(sector) ? `/login?from=${sector}` : '/login');
            }}
            style={{ padding: '7px 16px', background: 'none', border: `1px solid ${DS.border}`, borderRadius: DS.r.full, fontSize: 13, fontWeight: 500, color: DS.muted, cursor: 'pointer', transition: 'all .15s', fontFamily: DS.font }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.color = DS.ink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.muted; }}>
            Se connecter
          </button>
          <button onClick={() => {
              const sector = location.pathname.split('/')[1];
              const valid = ['vacances','restaurant','coiffure','btp'];
              navigate(valid.includes(sector) ? `/register?secteur=${sector}` : '/register');
            }}
            style={{ padding: '7px 20px', background: DS.ink, border: 'none', borderRadius: DS.r.full, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'opacity .15s', fontFamily: DS.font }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Créer un compte
          </button>
        </div>
      </nav>

      {/* Sous-nav optionnel (sticky sous le nav principal) */}
      {subNav && (
        <div style={{
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${DS.border}`,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {subNav}
        </div>
      )}
    </div>
  );
}
