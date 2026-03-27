import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconHome, IconMissions, IconMessage, IconCreditCard,
  IconGift, IconUser, IconLogout, IconMenu, IconDocument,
  IconSearch, IconStar,
} from '../ui/Icons';

const NAV = [
  { label: 'Accueil',           path: '/client/dashboard',  Icon: IconHome       },
  { label: 'Trouver un artisan',path: '/client/recherche',  Icon: IconSearch     },
  { label: 'Mes devis',         path: '/client/devis',       Icon: IconMissions,  badge: 2 },
  { label: 'Travaux passés',    path: '/client/travaux',     Icon: IconDocument   },
  { label: 'Mes avis',          path: '/client/avis',        Icon: IconStar       },
  { label: 'Messagerie',        path: '/client/messagerie',  Icon: IconMessage,   badge: 1 },
  { label: 'Paiements',         path: '/client/paiements',   Icon: IconCreditCard },
  { label: 'Parrainage',        path: '/client/parrainage',  Icon: IconGift       },
  { label: 'Mon profil',        path: '/client/profil',      Icon: IconUser       },
];

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <style>{`
        .cl-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; border-radius: 9px;
          color: rgba(255,255,255,0.45); font-size: 0.875rem; font-weight: 500;
          text-decoration: none; cursor: pointer; border: none;
          transition: all 0.2s ease; margin-bottom: 2px; position: relative; overflow: hidden;
          background: transparent;
        }
        .cl-nav-item:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.06); }
        .cl-nav-item.active {
          color: #fff; font-weight: 600;
          background: linear-gradient(135deg, rgba(91,91,214,0.25), rgba(124,58,237,0.18));
          box-shadow: inset 0 0 0 1px rgba(91,91,214,0.25), 0 2px 8px rgba(91,91,214,0.12);
        }
        .cl-nav-item.active::before {
          content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #818CF8, #7C3AED);
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 256,
        minWidth: collapsed ? 64 : 256,
        background: 'linear-gradient(180deg, #0D0D1A 0%, #0A0A14 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.25,0.46,0.45,0.94), min-width 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
        overflow: 'hidden',
        zIndex: 10,
      }}>

        {/* Logo + toggle */}
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 14px' : '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: 10,
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 4px 10px rgba(91,91,214,0.35)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                Artisans<span style={{ background: 'linear-gradient(135deg, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Pro</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.2s',
              marginLeft: collapsed ? 'auto' : 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            <IconMenu size={16} />
          </button>
        </div>

        {/* Profile card */}
        {!collapsed && (
          <div style={{
            margin: '12px 10px 4px',
            padding: '12px 14px',
            background: 'rgba(91,91,214,0.08)',
            border: '1px solid rgba(91,91,214,0.15)',
            borderRadius: 12,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(91,91,214,0.35)',
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.nom}
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: '0.6875rem', fontWeight: 500,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                padding: '3px 8px', borderRadius: 20, color: 'rgba(255,255,255,0.45)',
              }}>
                <svg width="10" height="8" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="18" height="12" rx="2"/>
                  <line x1="1" y1="5" x2="19" y2="5"/>
                </svg>
                Visa •••• 4242
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(({ label, path, Icon, badge }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                className={`cl-nav-item${active ? ' active' : ''}`}
                style={{
                  padding: collapsed ? 10 : '8px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={17} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                    {badge && (
                      <span style={{
                        background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
                        color: 'white',
                        fontSize: '0.625rem', fontWeight: 700,
                        padding: '2px 6px', borderRadius: 20, lineHeight: 1.4,
                        flexShrink: 0, boxShadow: '0 2px 6px rgba(91,91,214,0.4)',
                      }}>{badge}</span>
                    )}
                  </>
                )}
                {collapsed && badge && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#5B5BD6', boxShadow: '0 0 6px rgba(91,91,214,0.6)',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: collapsed ? '12px 8px' : 10, flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            className="cl-nav-item"
            style={{
              width: '100%', cursor: 'pointer',
              padding: collapsed ? 10 : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.background = ''; }}
          >
            <IconLogout size={17} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
