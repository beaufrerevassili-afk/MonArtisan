import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/forgot-password', { email });
      setSent(true);
      if (data.demo_token) setDemoToken(data.demo_token);
    } catch (err) {
      setError(err.response?.data?.erreur || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(0,122,255,0.25)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            Mot de passe oublié
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.875rem' }}>
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {sent ? (
          <div className="card" style={{ padding: 28 }}>
            {/* Success state */}
            <div style={{
              background: 'rgba(52,199,89,0.1)',
              border: '1px solid rgba(52,199,89,0.25)',
              borderRadius: 10, padding: '16px 18px', marginBottom: 20,
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.15 1.17a2 2 0 012-2.17h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 6.91a16 16 0 006.18 6.18l1.2-1.2a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2z"/>
              </svg>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  Lien envoyé !
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Si l'adresse <strong>{email}</strong> est associée à un compte, vous recevrez un email avec les instructions.
                </p>
              </div>
            </div>

            {/* Demo token banner */}
            {demoToken && (
              <div style={{
                background: 'rgba(255,149,0,0.08)',
                border: '1px solid rgba(255,149,0,0.3)',
                borderRadius: 8, padding: '12px 14px', marginBottom: 20,
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FF9500', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mode démo — token de réinitialisation
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  En production, ce lien serait envoyé par email. Cliquez ci-dessous pour tester :
                </p>
                <Link
                  to={`/reset-password/${demoToken}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Ouvrir le lien de réinitialisation
                </Link>
              </div>
            )}

            <Link
              to="/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 8,
                background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: '0.875rem', fontWeight: 500,
                textDecoration: 'none', transition: 'var(--transition)',
              }}
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Adresse e-mail</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && (
                <div style={{
                  background: 'var(--danger-light)',
                  border: '1px solid rgba(255,59,48,0.2)',
                  borderRadius: 8, padding: '10px 14px',
                  color: 'var(--danger)', fontSize: '0.8125rem',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '11px 16px', justifyContent: 'center', fontSize: '0.9375rem' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                    Envoi en cours...
                  </>
                ) : 'Envoyer le lien de réinitialisation'}
              </button>

              <Link
                to="/login"
                style={{
                  textAlign: 'center', fontSize: '0.875rem',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Retour à la connexion
              </Link>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
