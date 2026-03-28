import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COMPTES_DEMO = [
  { role: 'Client',  email: 'client@demo.com',  motdepasse: 'client123',  color: '#5B5BD6', icon: '👤' },
  { role: 'Patron',  email: 'patron@demo.com',  motdepasse: 'patron123',  color: '#7C3AED', icon: '🏗️' },
  { role: 'Artisan', email: 'artisan@demo.com', motdepasse: 'artisan123', color: '#059669', icon: '🔨' },
];

const REDIRECTIONS = {
  client:      '/client/dashboard',
  patron:      '/patron/dashboard',
  artisan:     '/artisan/dashboard',
  super_admin: '/admin/dashboard',
  fondateur:   '/fondateur/dashboard',
};

const FEATURES = [
  { icon: '✦', text: 'Vérification SIRET officielle' },
  { icon: '✦', text: 'Devis signés électroniquement' },
  { icon: '✦', text: 'Avis clients certifiés' },
  { icon: '✦', text: 'Paiements sécurisés' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate        = useNavigate();
  const [form, setForm]       = useState({ email: '', motdepasse: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [focused, setFocused] = useState('');

  if (user) return <Navigate to={REDIRECTIONS[user.role] || '/'} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.motdepasse);
      navigate(REDIRECTIONS[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.erreur || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  async function remplirDemo(compte) {
    setError('');
    setLoading(true);
    try {
      const data = await login(compte.email, compte.motdepasse);
      navigate(REDIRECTIONS[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.erreur || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#08080F',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @keyframes loginOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginShimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .login-input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 0.9375rem;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.25); }
        .login-input:focus {
          border-color: rgba(91,91,214,0.6);
          background: rgba(91,91,214,0.08);
          box-shadow: 0 0 0 4px rgba(91,91,214,0.12);
        }
        .login-demo-btn {
          text-align: left;
          padding: 11px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .login-demo-btn:hover {
          background: rgba(91,91,214,0.12);
          border-color: rgba(91,91,214,0.3);
          transform: translateY(-1px);
        }
        .login-submit-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #5B5BD6, #7C3AED);
          background-size: 200% 200%;
          border: none;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .login-submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(91,91,214,0.45);
          animation: gradientShift 3s ease infinite;
        }
        .login-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-submit-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: none;
        }
        .login-submit-btn:not(:disabled):hover::after {
          animation: loginShimmer 0.6s ease;
        }
        .spinner-ring {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Left panel — Brand ── */}
      <div style={{
        flex: 1,
        display: 'none',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0A0A14 0%, #12103A 50%, #1E0A3C 100%)',
      }}
        className="login-left-panel"
      >
        <style>{`
          @media (min-width: 900px) { .login-left-panel { display: flex !important; flex-direction: column; justify-content: space-between; padding: 48px; } }
        `}</style>

        {/* Orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,91,214,0.25) 0%, transparent 70%)',
          animation: 'loginOrb 12s ease-in-out infinite',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          animation: 'loginOrb 16s ease-in-out infinite reverse',
          filter: 'blur(50px)',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, animation: 'loginFadeUp 0.6s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(91,91,214,0.4)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              Artisans<span style={{
                background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}> Pro</span>
            </span>
          </div>
        </div>

        {/* Main copy */}
        <div style={{ position: 'relative', zIndex: 1, animation: 'loginFadeUp 0.6s 0.15s ease both' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(91,91,214,0.8)', marginBottom: 20,
          }}>
            La plateforme de référence
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            color: '#fff', marginBottom: 24,
          }}>
            Gérez votre activité<br />
            <span style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              avec excellence.
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 380 }}>
            De la recherche d'artisans à la gestion complète des chantiers,
            Artisans Pro centralise tout ce dont vous avez besoin.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                animation: `loginFadeUp 0.6s ${0.25 + i * 0.08}s ease both`,
              }}>
                <span style={{
                  color: '#818CF8', fontSize: '0.75rem', fontWeight: 700,
                  width: 20, textAlign: 'center',
                }}>{f.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{
          position: 'relative', zIndex: 1,
          animation: 'loginFadeUp 0.6s 0.5s ease both',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 100,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex' }}>
              {['#5B5BD6','#7C3AED','#059669'].map((c, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: c, border: '2px solid #0A0A14',
                  marginLeft: i > 0 ? -6 : 0,
                }} />
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem' }}>
              +10 000 professionnels font confiance
            </span>
          </div>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 56px)',
        background: '#0E0E1A',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle bg gradient */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,91,214,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, animation: 'loginFadeUp 0.5s ease both' }}>
          {/* Mobile logo */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(91,91,214,0.35)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Artisans<span style={{
                  background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}> Pro</span>
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800,
              letterSpacing: '-0.03em', color: '#fff', marginTop: 28, marginBottom: 8,
            }}>
              Bon retour 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9375rem' }}>
              Connectez-vous à votre espace professionnel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{
                display: 'block', marginBottom: 8,
                fontSize: '0.8125rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em',
              }}>
                Adresse e-mail
              </label>
              <input
                type="email"
                className="login-input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{
                  fontSize: '0.8125rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em',
                }}>
                  Mot de passe
                </label>
                <Link to="/forgot-password" style={{
                  fontSize: '0.8125rem', color: '#818CF8',
                  textDecoration: 'none', fontWeight: 500,
                  transition: 'color 0.2s',
                }}>
                  Oublié ?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="login-input"
                  value={form.motdepasse}
                  onChange={e => setForm({ ...form, motdepasse: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused('')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s', padding: 2,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
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
              <div style={{
                background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 10, padding: '11px 14px',
                color: '#F87171', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? (
                <><div className="spinner-ring" />Connexion en cours…</>
              ) : (
                <>Se connecter <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Comptes de démonstration
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Demo accounts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {COMPTES_DEMO.map(c => (
              <button
                key={c.email}
                onClick={() => remplirDemo(c)}
                className="login-demo-btn"
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `${c.color}22`,
                  border: `1px solid ${c.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem',
                }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{c.role}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{c.email}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Register link */}
          <p style={{
            textAlign: 'center', marginTop: 32,
            color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem',
          }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{
              color: '#818CF8', textDecoration: 'none', fontWeight: 600,
              transition: 'color 0.2s',
            }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
