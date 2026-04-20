import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '24px 28px' };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1A1A1A' };
const BTN = { padding: '12px 24px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };

export default function Support() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const motifParam = searchParams.get('motif') || '';

  const [form, setForm] = useState({ email: emailParam, nom: '', sujet: 'Compte suspendu', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mesTickets, setMesTickets] = useState([]);
  const [viewTicket, setViewTicket] = useState(null);
  const [reponseForm, setReponseForm] = useState('');
  const [lookupEmail, setLookupEmail] = useState(emailParam);
  const [lookupDone, setLookupDone] = useState(false);

  // Charger mes tickets si email fourni
  useEffect(() => {
    if (emailParam) {
      chargerTickets(emailParam);
    }
  }, [emailParam]);

  const chargerTickets = async (email) => {
    try {
      const r = await fetch(`${API}/support/mes-tickets?email=${encodeURIComponent(email)}`);
      const data = await r.json();
      if (data.tickets) { setMesTickets(data.tickets); setLookupDone(true); }
    } catch {}
  };

  const submit = async () => {
    if (!form.email || !form.message) { setError('Email et message requis'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/support/ticket`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await r.json();
      if (r.ok) { setSent(true); setLookupEmail(form.email); chargerTickets(form.email); }
      else { setError(data.erreur || 'Erreur'); }
    } catch { setError('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  const envoyerReponse = async (ticketId) => {
    if (!reponseForm.trim()) return;
    try {
      await fetch(`${API}/support/tickets/${ticketId}/user-reply`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lookupEmail, reponse: reponseForm })
      });
      setReponseForm('');
      chargerTickets(lookupEmail);
      // Refresh le ticket affiché
      const r = await fetch(`${API}/support/mes-tickets?email=${encodeURIComponent(lookupEmail)}`);
      const data = await r.json();
      if (data.tickets) {
        setMesTickets(data.tickets);
        setViewTicket(data.tickets.find(t => t.id === ticketId) || null);
      }
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Inter', -apple-system, sans-serif", color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 550 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A' }}>Freample<span style={{ color: '#A68B4B' }}>.</span></span>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Centre de support</div>
        </div>

        {/* Vue ticket détaillé */}
        {viewTicket && (
          <div style={CARD}>
            <button onClick={() => setViewTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 16 }}>← Retour</button>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>{viewTicket.sujet || 'Demande de support'}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Statut : <span style={{ fontWeight: 700, color: viewTicket.statut === 'ouvert' ? '#D97706' : '#16A34A' }}>{viewTicket.statut === 'ouvert' ? 'En attente' : 'Fermé'}</span>
                  · {new Date(viewTicket.cree_le).toLocaleDateString('fr-FR')}
              </div>
            </div>

            {/* Message initial */}
            <div style={{ padding: '12px 14px', background: '#F8F7F4', borderRadius: 10, marginBottom: 12, borderLeft: '3px solid #D97706' }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>Vous — {new Date(viewTicket.cree_le).toLocaleString('fr-FR')}</div>
              <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.6 }}>{viewTicket.message}</div>
            </div>

            {/* Réponses */}
            {(viewTicket.reponses || []).map((r, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 8, borderLeft: `3px solid ${r.auteur === 'Freample' ? '#A68B4B' : '#2563EB'}`, background: r.auteur === 'Freample' ? '#F5EFE0' : '#EFF6FF' }}>
                <div style={{ fontSize: 11, color: r.auteur === 'Freample' ? '#A68B4B' : '#2563EB', fontWeight: 700, marginBottom: 4 }}>{r.auteur} — {new Date(r.date).toLocaleString('fr-FR')}</div>
                <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.6 }}>{r.message}</div>
              </div>
            ))}

            {/* Formulaire réponse utilisateur */}
            {viewTicket.statut === 'ouvert' && (
              <div style={{ marginTop: 16 }}>
                <textarea value={reponseForm} onChange={e => setReponseForm(e.target.value)} rows={3}
                  placeholder="Votre réponse..." style={{ ...INP, resize: 'vertical' }} />
                <button onClick={() => envoyerReponse(viewTicket.id)} disabled={!reponseForm.trim()}
                  style={{ ...BTN, width: '100%', marginTop: 8, opacity: reponseForm.trim() ? 1 : 0.5 }}>
                  Répondre
                </button>
              </div>
            )}
          </div>
        )}

        {/* Liste tickets existants */}
        {!viewTicket && lookupDone && mesTickets.length > 0 && (
          <div style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>Mes demandes ({mesTickets.length})</div>
            {mesTickets.map(t => (
              <div key={t.id} onClick={() => setViewTicket(t)}
                style={{ padding: '12px 14px', background: '#F8F7F4', borderRadius: 8, marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0EDE8'} onMouseLeave={e => e.currentTarget.style.background = '#F8F7F4'}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{t.sujet || 'Demande'}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{new Date(t.cree_le).toLocaleDateString('fr-FR')} · {(t.reponses || []).length} réponse{(t.reponses || []).length > 1 ? 's' : ''}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: t.statut === 'ouvert' ? '#FFFBEB' : '#F0FDF4', color: t.statut === 'ouvert' ? '#D97706' : '#16A34A' }}>
                  {t.statut === 'ouvert' ? 'En attente' : 'Résolu'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire nouveau ticket ou lookup */}
        {!viewTicket && !sent && (
          <div style={CARD}>
            {motifParam && (
              <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#DC2626' }}>
                <strong>Motif de suspension :</strong> {motifParam}
              </div>
            )}

            {/* Lookup tickets existants */}
            {!lookupDone && !emailParam && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: '#F8F7F4', borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Vous avez déjà un ticket ?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={lookupEmail} onChange={e => setLookupEmail(e.target.value)} placeholder="Votre email" style={{ ...INP, flex: 1 }} />
                  <button onClick={() => { if (lookupEmail) chargerTickets(lookupEmail); }} style={{ ...BTN, padding: '10px 16px', fontSize: 12 }}>Voir</button>
                </div>
              </div>
            )}

            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>Nouveau message</div>
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

        {/* Confirmation */}
        {!viewTicket && sent && (
          <div style={CARD}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A', marginBottom: 8 }}>Message envoyé</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                Votre demande a bien été reçue. L'équipe Freample vous répondra dans les plus brefs délais.
              </div>
              <button onClick={() => setSent(false)} style={{ ...BTN, marginTop: 16, background: '#F8F7F4', color: '#1A1A1A', border: '1px solid #E8E6E1' }}>
                Envoyer un autre message
              </button>
            </div>
          </div>
        )}

        {/* Lien retour */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/login" style={{ fontSize: 12, color: '#A68B4B', textDecoration: 'none', fontWeight: 600 }}>← Retour à la connexion</a>
        </div>
      </div>
    </div>
  );
}
