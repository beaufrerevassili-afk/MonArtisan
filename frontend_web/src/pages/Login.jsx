import React, { useState } from 'react';
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/public/PublicNavbar';
import DS from '../design/ds';

// ─── Comptes démo ────────────────────────────────────────────────────────────
const CLIENT_DEMO = {
  role: 'Client', email: 'client@demo.com', motdepasse: 'client123',
  color: DS.accent, icon: '👤', universal: true,
};

const SECTEUR_COMPTES = {
  btp: [
    { role: 'Patron BTP',  email: 'patron.btp@demo.com',  motdepasse: 'patron123',  color: '#5B5BD6', icon: '🏗️' },
    { role: 'Employé BTP', email: 'employe.btp@demo.com', motdepasse: 'employe123', color: '#7C85D6', icon: '👷' },
  ],
  coiffure: [
    { role: 'Patron Coiffure',  email: 'patron.coiffure@demo.com',  motdepasse: 'patron123',  color: '#E535AB', icon: '✂️' },
    { role: 'Employé Coiffure', email: 'employe.coiffure@demo.com', motdepasse: 'employe123', color: '#FF6DC4', icon: '💇' },
  ],
  restaurant: [
    { role: 'Patron Restaurant',  email: 'patron.restaurant@demo.com',  motdepasse: 'patron123',  color: '#FF6000', icon: '🍽️' },
    { role: 'Employé Restaurant', email: 'employe.restaurant@demo.com', motdepasse: 'employe123', color: '#FF9333', icon: '👨‍🍳' },
  ],
  vacances: [
    { role: 'Patron Hôtel',  email: 'patron.hotel@demo.com',  motdepasse: 'patron123',  color: '#0080FF', icon: '🏨' },
    { role: 'Employé Hôtel', email: 'employe.hotel@demo.com', motdepasse: 'employe123', color: '#33A0FF', icon: '🛎️' },
  ],
};

const GENERIC_DEMO = [
  { role: 'Client',  email: 'client@demo.com',  motdepasse: 'client123',  color: DS.accent,   icon: '👤', universal: true },
  { role: 'Patron',  email: 'patron@demo.com',  motdepasse: 'patron123',  color: '#7C3AED',   icon: '🏗️' },
  { role: 'Artisan', email: 'artisan@demo.com', motdepasse: 'artisan123', color: '#059669',   icon: '🔨' },
];

// ─── Config secteur ───────────────────────────────────────────────────────────
const SECTOR_CONFIG = {
  btp:        { label: 'BTP & Travaux',    color: '#5B5BD6', bg: '#EEF2FF', icon: '🔨' },
  coiffure:   { label: 'Coiffure',         color: '#E535AB', bg: '#FFF0F8', icon: '✂️' },
  restaurant: { label: 'Restaurant',       color: '#FF6000', bg: '#FFF3E8', icon: '🍽️' },
  vacances:   { label: 'Vacances & Hôtel', color: '#0080FF', bg: '#E8F4FF', icon: '🏖️' },
};

const REDIRECTIONS = {
  client:      '/client/dashboard',
  patron:      '/patron/dashboard',
  artisan:     '/artisan/dashboard',
  super_admin: '/admin/dashboard',
  fondateur:   '/fondateur/dashboard',
};

const PUBLIC_SECTORS = ['vacances', 'restaurant', 'coiffure', 'btp'];

// ─── Composant ────────────────────────────────────────────────────────────────
export default function Login() {
  const { user, login } = useAuth();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  const fromSector = searchParams.get('from');
  const sector     = fromSector && PUBLIC_SECTORS.includes(fromSector) ? fromSector : null;
  const sectorCfg  = sector ? SECTOR_CONFIG[sector] : null;

  const [form, setForm]           = useState({ email: '', motdepasse: '' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [demoSector, setDemoSector] = useState(null); // secteur choisi manuellement dans les démos
  const [pendingRole, setPendingRole] = useState(null); // rôle en attente de choix secteur ('patron'|'artisan')

  const getDestination = (role) => {
    if (role === 'client' && sector) return `/client/dashboard?tab=${sector}`;
    return REDIRECTIONS[role] || '/';
  };

  if (user) return <Navigate to={getDestination(user.role)} replace />;

  // Secteur effectif : depuis l'URL ou choisi manuellement
  const activeSector = sector || demoSector;
  const activeSectorCfg = activeSector ? SECTOR_CONFIG[activeSector] : null;

  // Comptes démo filtrés : client universel + comptes du secteur actif
  const demoAccounts = activeSector
    ? [CLIENT_DEMO, ...(SECTEUR_COMPTES[activeSector] || [])]
    : GENERIC_DEMO;

  const accentColor = sectorCfg?.color || DS.ink;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.motdepasse);
      navigate(getDestination(data.role));
    } catch (err) {
      setError(err.response?.data?.erreur || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  async function remplirDemo(compte) {
    // Si c'est un compte générique Patron/Artisan sans secteur choisi → forcer le choix
    const isGenericPatronArtisan = !compte.universal && !activeSector
      && ['Patron', 'Artisan'].includes(compte.role);
    if (isGenericPatronArtisan) {
      setPendingRole(compte.role === 'Patron' ? 'patron' : 'artisan');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await login(compte.email, compte.motdepasse);
      navigate(getDestination(data.role));
    } catch (err) {
      setError(err.response?.data?.erreur || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  // Quand un secteur est choisi après clic sur Patron/Artisan générique → connexion auto
  function handleSectorSelect(id) {
    if (demoSector === id && !pendingRole) {
      setDemoSector(null);
      return;
    }
    setDemoSector(id);
    if (pendingRole) {
      const comptesSecteur = SECTEUR_COMPTES[id] || [];
      // Patron → premier compte du secteur, Artisan → deuxième (employé)
      const compte = pendingRole === 'patron' ? comptesSecteur[0] : comptesSecteur[1];
      if (compte) {
        setPendingRole(null);
        // Petit délai pour voir la sélection avant connexion
        setTimeout(() => remplirDemo(compte), 300);
      }
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', borderRadius: DS.r.md,
    border: `1.5px solid ${DS.border}`, background: DS.bg,
    fontSize: 14, color: DS.ink, outline: 'none',
    fontFamily: DS.font, transition: 'border-color .15s',
  };

  return (
    <div style={{ minHeight: '100vh', background: DS.bgSoft, fontFamily: DS.font }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-border { 0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); } 50% { box-shadow: 0 0 0 6px rgba(245,158,11,0); } }
      `}</style>
      <PublicNavbar />

      <div style={{ display: 'flex', justifyContent: 'center', padding: 'clamp(28px,5vh,56px) 20px 48px' }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: DS.bg, borderRadius: DS.r.xxl,
          border: `1px solid ${DS.border}`, boxShadow: DS.shadow.xl,
          padding: 'clamp(24px,5vw,40px)',
        }}>

          {/* ── Badge secteur ── */}
          {sectorCfg && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: DS.r.full,
              background: sectorCfg.bg, border: `1px solid ${sectorCfg.color}30`,
              marginBottom: 22,
            }}>
              <span style={{ fontSize: 15 }}>{sectorCfg.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: sectorCfg.color }}>
                Espace {sectorCfg.label}
              </span>
            </div>
          )}

          {/* ── En-tête ── */}
          <div style={{ marginBottom: 26 }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 14, fontSize: 17, fontWeight: 800, color: DS.ink, letterSpacing: '-0.05em', fontFamily: DS.font, lineHeight: 1 }}
            >
              Freample<span style={{ color: DS.gold }}>.</span>
            </button>
            <h1 style={{ fontSize: 'clamp(1.25rem,3vw,1.625rem)', fontWeight: 900, color: DS.ink, letterSpacing: '-0.04em', margin: '0 0 6px', lineHeight: 1.15 }}>
              {sectorCfg ? 'Connectez-vous' : 'Bon retour 👋'}
            </h1>
            <p style={{ fontSize: 14, color: DS.muted, margin: 0, lineHeight: 1.5 }}>
              {sectorCfg
                ? `Accédez à votre espace ${sectorCfg.label}`
                : 'Accédez à votre espace professionnel'}
            </p>
          </div>

          {/* ── Formulaire ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: DS.ink2 }}>
                Adresse e-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = accentColor}
                onBlur={e => e.currentTarget.style.borderColor = DS.border}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 600, color: DS.ink2 }}>
                  Mot de passe
                </label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: accentColor, textDecoration: 'none', fontWeight: 500 }}>
                  Oublié ?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.motdepasse}
                  onChange={e => setForm({ ...form, motdepasse: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.currentTarget.style.borderColor = accentColor}
                  onBlur={e => e.currentTarget.style.borderColor = DS.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DS.subtle, display: 'flex', padding: 2, transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = DS.ink}
                  onMouseLeave={e => e.currentTarget.style.color = DS.subtle}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {showPwd
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" style={{ background: DS.redBg, border: `1px solid ${DS.red}40`, borderRadius: DS.r.sm, padding: '10px 14px', color: DS.red, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 24px', borderRadius: DS.r.md,
                background: accentColor, border: 'none', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, fontFamily: DS.font,
                transition: 'opacity .15s', marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.7' : '1'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Connexion…
                </>
              ) : 'Se connecter →'}
            </button>
          </form>

          {/* ── Séparateur ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: DS.border }} />
            <span style={{ fontSize: 12, color: DS.subtle, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {activeSector ? `Comptes ${activeSectorCfg?.label || activeSector}` : 'Comptes de démonstration'}
            </span>
            <div style={{ flex: 1, height: 1, background: DS.border }} />
          </div>

          {/* ── Sélecteur de secteur (quand pas de secteur dans l'URL) ── */}
          {!sector && (
            <div style={{
              marginBottom: 12,
              ...(pendingRole ? {
                background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: DS.r.md,
                padding: '14px 16px', animation: 'pulse-border .6s ease-in-out',
              } : {}),
            }}>
              {pendingRole ? (
                <div style={{ fontSize: 13, fontWeight: 700, color: '#B45309', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>👆</span>
                  Choisissez votre secteur pour accéder au compte {pendingRole === 'patron' ? 'Patron' : 'Artisan'}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: DS.subtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Choisir un espace
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(SECTOR_CONFIG).map(([id, cfg]) => (
                  <button
                    key={id}
                    onClick={() => handleSectorSelect(id)}
                    style={{
                      padding: pendingRole ? '8px 16px' : '5px 12px',
                      borderRadius: DS.r.full, fontSize: pendingRole ? 13 : 12, fontWeight: 600,
                      border: `1.5px solid ${demoSector === id ? cfg.color : pendingRole ? cfg.color + '60' : DS.border}`,
                      background: demoSector === id ? cfg.bg : DS.bg,
                      color: demoSector === id ? cfg.color : pendingRole ? cfg.color : DS.muted,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>
              {pendingRole && (
                <button onClick={() => setPendingRole(null)} style={{ marginTop: 10, fontSize: 12, color: DS.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: DS.font, textDecoration: 'underline' }}>
                  Annuler
                </button>
              )}
            </div>
          )}

          {/* ── Comptes démo (filtrés par secteur) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {demoAccounts.map((c, i) => (
              <button
                key={i}
                onClick={() => remplirDemo(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: DS.r.md,
                  background: DS.bgSoft, border: `1px solid ${DS.border}`,
                  cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
                  fontFamily: DS.font, width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = DS.bgMuted; e.currentTarget.style.borderColor = DS.muted; }}
                onMouseLeave={e => { e.currentTarget.style.background = DS.bgSoft; e.currentTarget.style.borderColor = DS.border; }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: DS.r.sm, flexShrink: 0,
                  background: `${c.color}18`, border: `1px solid ${c.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink }}>{c.role}</div>
                  <div style={{ fontSize: 11, color: DS.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                </div>
                {c.universal && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: DS.green, background: DS.greenBg, padding: '2px 8px', borderRadius: DS.r.full, flexShrink: 0 }}>
                    Universel
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* ── Lien inscription ── */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: DS.muted }}>
            Pas encore de compte ?{' '}
            <Link
              to={sector ? `/register?secteur=${sector}` : '/register'}
              style={{ color: accentColor, textDecoration: 'none', fontWeight: 600 }}
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
