import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DS from '../../design/ds';
import { useAuth } from '../../context/AuthContext';

const DEV_EMAIL = 'freamplecom@gmail.com';
const NAV_PUBLIC = [
  { label:'Freample Artisans', icon:'🏗️', href:'/btp' },
  { label:'Freample Com', icon:'🎬', href:'/com' },
  { label:'Freample Immo', icon:'🏠', href:'/immo' },
  { label:'Freample Logement', icon:'🔑', href:'/immo/logement' },
  { label:'Freample Droit', icon:'⚖️', href:'/droit' },
  { label:'Freample Beauté', icon:'✂️', href:'/coiffure' },
  { label:'Recrutement', icon:'💼', href:'/recrutement' },
  { label:'Espace pro', icon:'🏢', href:'/pro' },
];
const NAV_DEV = [
  { label:'Freample Artisans', icon:'🏗️', href:'/btp' },
  { label:'Freample Com', icon:'🎬', href:'/com' },
  { label:'Freample Immo', icon:'🏠', href:'/immo' },
  { label:'Freample Logement', icon:'🔑', href:'/immo/logement' },
  { label:'Freample Droit', icon:'⚖️', href:'/droit' },
  { label:'Freample Beauté', icon:'✂️', href:'/coiffure' },
  { label:'Recrutement', icon:'💼', href:'/recrutement' },
  { label:'Espace pro', icon:'🏢', href:'/pro' },
  { label:'Immo Démo', icon:'📊', href:'/immo/demo' },
  { label:'Statistiques', icon:'📈', href:'/admin/stats' },
];

export default function PublicNavbar({ subNav = null, transparent = false, onMenuOpen = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const logout = auth.logout || (() => {});
  const isDev = user?.email === DEV_EMAIL;
  const sidebarItems = isDev ? NAV_DEV : NAV_PUBLIC;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        {/* Hamburger + Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={()=>{ if(onMenuOpen) onMenuOpen(); else setSidebarOpen(true); }} aria-label="Menu"
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:4, opacity:0.5, transition:'opacity .2s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.5'}>
            <span style={{ width:18, height:1.5, background:DS.ink, display:'block' }}/><span style={{ width:18, height:1.5, background:DS.ink, display:'block' }}/>
          </button>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, fontWeight: 800, color: DS.ink, letterSpacing: '-0.05em',
            display: 'flex', alignItems: 'center', gap: 2, fontFamily: DS.font,
            lineHeight: 1,
          }}>
            Freample<span style={{ color: DS.gold }}>.</span>
          </button>
        </div>

        {/* Actions droite */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {user && user.email === 'freamplecom@gmail.com' ? (
            /* ── Compte dev — accès total avec dropdown ── */
            <div ref={menuRef} style={{ display:'flex', gap:6, alignItems:'center', position:'relative' }}>
              <button onClick={() => navigate('/patron/dashboard')}
                style={{ padding:'7px 14px', background:'none', border:'none', fontSize:13, fontWeight:500, color:DS.muted, cursor:'pointer', transition:'color .15s', fontFamily:DS.font }}
                onMouseEnter={e=>e.currentTarget.style.color=DS.ink} onMouseLeave={e=>e.currentTarget.style.color=DS.muted}>
                Dashboard
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{ width:32, height:32, borderRadius:'50%', background:'#22C55E', border:'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', cursor:'pointer', transition:'opacity .15s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                {user.nom ? user.nom[0].toUpperCase() : 'D'}
              </button>
              {menuOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'#fff', border:`1px solid ${DS.border}`, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', minWidth:220, overflow:'hidden', zIndex:300 }}>
                  <div style={{ padding:'14px 18px', borderBottom:`1px solid ${DS.border}` }}>
                    <div style={{ fontSize:14, fontWeight:700, color:DS.ink }}>{user.nom || 'Admin'}</div>
                    <div style={{ fontSize:12, color:DS.muted, marginTop:2 }}>{user.email}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#22C55E', marginTop:4 }}>Mode développeur</div>
                  </div>
                  {[
                    { label:'📊 Dashboard', action:()=>navigate('/patron/dashboard') },
                    { label:'📈 Statistiques', action:()=>navigate('/admin/stats') },
                    { label:'🏠 Accueil', action:()=>navigate('/') },
                  ].map(item=>(
                    <button key={item.label} onClick={()=>{item.action();setMenuOpen(false);}}
                      style={{ display:'block', width:'100%', padding:'11px 18px', background:'none', border:'none', textAlign:'left', fontSize:14, color:DS.ink, cursor:'pointer', fontFamily:DS.font, transition:'background .1s' }}
                      onMouseEnter={e=>e.currentTarget.style.background=DS.bgSoft} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop:`1px solid ${DS.border}` }}>
                    <button onClick={()=>{logout();setMenuOpen(false);navigate('/');}}
                      style={{ display:'block', width:'100%', padding:'11px 18px', background:'none', border:'none', textAlign:'left', fontSize:14, color:'#DC2626', cursor:'pointer', fontFamily:DS.font, fontWeight:600, transition:'background .1s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#FEF2F2'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      🚪 Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : user && user.role === 'client' ? (
            /* ── Connecté client : icône compte avec dropdown ── */
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
            /* ── Non connecté : Espace pro + login/register ── */
            <>
              <button onClick={() => navigate('/pro')}
                style={{ padding: '7px 14px', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: DS.muted, cursor: 'pointer', transition: 'color .15s', fontFamily: DS.font }}
                onMouseEnter={e => e.currentTarget.style.color = DS.ink}
                onMouseLeave={e => e.currentTarget.style.color = DS.muted}>
                Espace pro
              </button>
              <button onClick={() => {
                  const sector = location.pathname.split('/')[1];
                  const valid = ['coiffure','btp','com'];
                  navigate(valid.includes(sector) ? `/login?from=${sector}` : '/login');
                }}
                style={{ padding: '7px 16px', background: 'none', border: `1px solid ${DS.border}`, borderRadius: DS.r.full, fontSize: 13, fontWeight: 500, color: DS.muted, cursor: 'pointer', transition: 'all .15s', fontFamily: DS.font }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.color = DS.ink; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.muted; }}>
                Se connecter
              </button>
              <button onClick={() => {
                  const sector = location.pathname.split('/')[1];
                  const valid = ['coiffure','btp','com'];
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

      {/* ══ SIDEBAR GUCCI — built-in (when no external onMenuOpen) ══ */}
      {!onMenuOpen && (
        <>
          <div onClick={()=>setSidebarOpen(false)} style={{ position:'fixed', inset:0, zIndex:1999, background:'rgba(0,0,0,0.35)', opacity:sidebarOpen?1:0, pointerEvents:sidebarOpen?'auto':'none', transition:'opacity .35s' }} />
          <div style={{ position:'fixed', top:0, left:0, bottom:0, zIndex:2000, width:'clamp(300px,85vw,400px)', background:'#fff', transform:sidebarOpen?'translateX(0)':'translateX(-100%)', transition:'transform .4s cubic-bezier(0.25,0.46,0.45,0.94)', display:'flex', flexDirection:'column', boxShadow:sidebarOpen?'8px 0 32px rgba(0,0,0,0.1)':'none' }}>
            <div style={{ padding:'20px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${DS.border}` }}>
              <div style={{ fontSize:12, fontWeight:600, color:DS.gold, textTransform:'uppercase', letterSpacing:'0.25em' }}>Freample</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {isDev && <span style={{ fontSize:10, fontWeight:700, color:'#22C55E', background:'rgba(34,197,94,0.08)', padding:'3px 10px', borderRadius:4 }}>Dev</span>}
                <button onClick={()=>setSidebarOpen(false)} style={{ background:'none', border:`1px solid ${DS.border}`, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:'#A0A0A0', transition:'border-color .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=DS.ink} onMouseLeave={e=>e.currentTarget.style.borderColor=DS.border}>✕</button>
              </div>
            </div>
            <nav style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
              {sidebarItems.map(item => (
                <button key={item.href} onClick={()=>{setSidebarOpen(false);navigate(item.href);}}
                  style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontFamily:DS.font, textAlign:'left', padding:'14px 28px', display:'flex', alignItems:'center', gap:14, transition:'background .15s, color .15s', color:DS.ink }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#F5F2EC';e.currentTarget.style.color=DS.gold;}}
                  onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color=DS.ink;}}>
                  <span style={{ fontSize:18, width:28, textAlign:'center', opacity:0.7 }}>{item.icon}</span>
                  <span style={{ fontSize:15, fontWeight:600, letterSpacing:'-0.01em' }}>{item.label}</span>
                </button>
              ))}
            </nav>
            <div style={{ padding:'16px 28px', borderTop:`1px solid ${DS.border}`, display:'flex', gap:20 }}>
              <a href="https://wa.me/33769387193" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#A0A0A0', textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=DS.gold} onMouseLeave={e=>e.currentTarget.style.color='#A0A0A0'}>WhatsApp</a>
              <a href="mailto:freamplecom@gmail.com" style={{ fontSize:11, color:'#A0A0A0', textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=DS.gold} onMouseLeave={e=>e.currentTarget.style.color='#A0A0A0'}>Contact</a>
              <a href="/cgu" style={{ fontSize:11, color:'#A0A0A0', textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=DS.gold} onMouseLeave={e=>e.currentTarget.style.color='#A0A0A0'}>CGU</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
