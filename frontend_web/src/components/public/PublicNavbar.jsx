import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DS from '../../design/ds';
import { useAuth } from '../../context/AuthContext';

export default function PublicNavbar({ subNav = null, transparent = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const logout = auth.logout || (() => {});
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
          Freample<span style={{ color: DS.gold }}>.</span>
        </button>

        {/* Actions droite */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => navigate('/recrutement')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: DS.muted, padding: '6px 10px', borderRadius: DS.r.sm, transition: 'color .15s', fontFamily: DS.font }}
            onMouseEnter={e => e.currentTarget.style.color = DS.ink}
            onMouseLeave={e => e.currentTarget.style.color = DS.muted}>
            Emploi
          </button>

          {user && user.role === 'client' ? (
            /* ── Connecté : icône compte avec dropdown ── */
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{ width: 38, height: 38, borderRadius: '50%', background: DS.ink, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: DS.font, transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {user.nom ? user.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '👤'}
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 220, overflow: 'hidden', zIndex: 300 }}>
                  {/* User info */}
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.border}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{user.nom || 'Client'}</div>
                    <div style={{ fontSize: 12, color: DS.muted, marginTop: 2 }}>{user.email}</div>
                  </div>
                  {/* Menu items */}
                  {[
                    { label: '👤 Mon profil', action: () => navigate('/client/profil') },
                    { label: '📊 Mes activités', action: () => navigate('/client/dashboard') },
                    { label: '🎬 Freample Com', action: () => navigate('/client/com') },
                    { label: '💳 Paiements', action: () => navigate('/client/paiements') },
                    { label: '💬 Messagerie', action: () => navigate('/client/messagerie') },
                  ].map(item => (
                    <button key={item.label} onClick={() => { item.action(); setMenuOpen(false); }}
                      style={{ display: 'block', width: '100%', padding: '11px 18px', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, color: DS.ink, cursor: 'pointer', fontFamily: DS.font, transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = DS.bgSoft}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: `1px solid ${DS.border}` }}>
                    <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                      style={{ display: 'block', width: '100%', padding: '11px 18px', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, color: '#DC2626', cursor: 'pointer', fontFamily: DS.font, fontWeight: 600, transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      🚪 Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Non connecté : boutons login/register ── */
            <>
              <button onClick={() => {
                  const sector = location.pathname.split('/')[1];
                  const valid = ['vacances','restaurant','coiffure','btp','course','eat','com'];
                  navigate(valid.includes(sector) ? `/login?from=${sector}` : '/login');
                }}
                style={{ padding: '7px 16px', background: 'none', border: `1px solid ${DS.border}`, borderRadius: DS.r.full, fontSize: 13, fontWeight: 500, color: DS.muted, cursor: 'pointer', transition: 'all .15s', fontFamily: DS.font }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.color = DS.ink; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.muted; }}>
                Se connecter
              </button>
              <button onClick={() => {
                  const sector = location.pathname.split('/')[1];
                  const valid = ['vacances','restaurant','coiffure','btp','course','eat','com'];
                  navigate(valid.includes(sector) ? `/register?secteur=${sector}` : '/register');
                }}
                style={{ padding: '7px 20px', background: DS.ink, border: 'none', borderRadius: DS.r.full, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'opacity .15s', fontFamily: DS.font }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Créer un compte
              </button>
            </>
          )}
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
