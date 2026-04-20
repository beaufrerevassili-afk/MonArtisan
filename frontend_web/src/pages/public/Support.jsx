import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DS from '../../design/ds';

const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '24px 28px' };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const BTN = { padding: '12px 24px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };

export default function Support() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const motifParam = searchParams.get('motif') || '';

  const [form, setForm] = useState({ email: emailParam, nom: '', sujet: 'Compte suspendu', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.email || !form.message) { setError('Email et message requis'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/support/ticket`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await r.json();
      if (r.ok) { setSent(true); } else { setError(data.erreur || 'Erreur'); }
    } catch { setError('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 500 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A' }}>Freample<span style={{ color: '#A68B4B' }}>.</span></span>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Support</div>
        </div>

        {sent ? (
          <div style={CARD}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A', marginBottom: 8 }}>Message envoyé</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                Votre demande a bien été reçue. L'équipe Freample vous répondra dans les plus brefs délais.
              </div>
            </div>
          </div>
        ) : (
          <div style={CARD}>
            {motifParam && (
              <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #DC262640', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#DC2626' }}>
                <strong>Motif de suspension :</strong> {motifParam}
              </div>
            )}

            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>Contactez le support</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Décrivez votre problème et nous vous répondrons rapidement.</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Email *</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" style={INP} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Nom</label>
                <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Votre nom" style={INP} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Sujet</label>
                <select value={form.sujet} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} style={INP}>
                  <option>Compte suspendu</option>
                  <option>Problème technique</option>
                  <option>Question sur la plateforme</option>
                  <option>Signaler un problème</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Message *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Décrivez votre problème..." style={{ ...INP, resize: 'vertical' }} />
              </div>
            </div>

            {error && <div style={{ marginTop: 12, padding: '8px 12px', background: '#FEF2F2', borderRadius: 6, fontSize: 12, color: '#DC2626' }}>{error}</div>}

            <button onClick={submit} disabled={loading} style={{ ...BTN, width: '100%', marginTop: 16, opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Envoi...' : 'Envoyer mon message'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
