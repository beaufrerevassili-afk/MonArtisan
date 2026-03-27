import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const { token }     = useParams();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ motdepasse: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.motdepasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (form.motdepasse !== form.confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reset-password', { token, motdepasse: form.motdepasse });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            Nouveau mot de passe
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.875rem' }}>
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(52,199,89,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                Mot de passe mis à jour !
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Vous allez être redirigé vers la page de connexion...
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 8,
                  background: 'var(--primary)',
                  color: 'white', fontSize: '0.875rem', fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Se connecter maintenant
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label className="label">Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input"
                    value={form.motdepasse}
                    onChange={e => setForm({ ...form, motdepasse: e.target.value })}
                    placeholder="••••••••"
                    required
                    autoFocus
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                      padding: 2,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {showPwd
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
                {form.motdepasse && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: form.motdepasse.length >= i * 3
                          ? i <= 1 ? '#FF3B30' : i <= 2 ? '#FF9500' : i <= 3 ? '#FFCC00' : '#34C759'
                          : 'var(--border)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirmer le mot de passe</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  placeholder="••••••••"
                  required
                />
                {form.confirm && form.motdepasse !== form.confirm && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>
                    Les mots de passe ne correspondent pas
                  </p>
                )}
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
                style={{ width: '100%', padding: '11px 16px', justifyContent: 'center', fontSize: '0.9375rem', marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                    Mise à jour...
                  </>
                ) : 'Mettre à jour le mot de passe'}
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
          )}
        </div>

      </div>
    </div>
  );
}
