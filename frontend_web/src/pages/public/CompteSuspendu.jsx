import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '20px 24px' };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1A1A1A' };
const BTN = { padding: '12px 24px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };

export default function CompteSuspendu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [viewTicket, setViewTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [reponseForm, setReponseForm] = useState('');
  const [sent, setSent] = useState(false);

  const email = user?.email || '';
  const motif = user?.motifSuspension || '';

  useEffect(() => {
    if (!email) return;
    fetch(`${API}/support/mes-tickets?email=${encodeURIComponent(email)}`)
      .then(r => r.json()).then(d => { if (d.tickets) setTickets(d.tickets); }).catch(() => {});
  }, [email, sent]);

  const envoyerTicket = async () => {
    if (!newMessage.trim()) return;
    await fetch(`${API}/support/ticket`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nom: user?.nom || '', sujet: 'Compte suspendu', message: newMessage })
    });
    setNewMessage('');
    setSent(!sent);
  };

  const envoyerReponse = async (ticketId) => {
    if (!reponseForm.trim()) return;
    await fetch(`${API}/support/tickets/${ticketId}/user-reply`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reponse: reponseForm })
    });
    setReponseForm('');
    setSent(!sent);
    // Refresh
    const r = await fetch(`${API}/support/mes-tickets?email=${encodeURIComponent(email)}`);
    const d = await r.json();
    if (d.tickets) { setTickets(d.tickets); setViewTicket(d.tickets.find(t => t.id === ticketId)); }
  };

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Inter', -apple-system, sans-serif", color: '#1A1A1A' }}>
      {/* Header */}
      <div style={{ background: '#2C2520', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#F5EFE0' }}>Freample<span style={{ color: '#A68B4B' }}>.</span></span>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(245,239,224,0.3)', borderRadius: 8, padding: '6px 14px', color: '#F5EFE0', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Se déconnecter</button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        {/* Bandeau suspension */}
        <div style={{ background: '#FEF2F2', border: '2px solid #DC2626', borderRadius: 14, padding: '24px 28px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626', marginBottom: 8 }}>Votre compte a été suspendu</div>
          {motif && (
            <div style={{ fontSize: 14, color: '#1A1A1A', marginTop: 8, padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #DC262640' }}>
              <strong>Motif :</strong> {motif}
            </div>
          )}
          <div style={{ fontSize: 13, color: '#555', marginTop: 12, lineHeight: 1.6 }}>
            Vous pouvez contacter le support ci-dessous pour contester ou demander la réactivation de votre compte.
          </div>
        </div>

        {/* Vue ticket détaillé */}
        {viewTicket && (
          <div style={CARD}>
            <button onClick={() => setViewTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 16 }}>← Retour</button>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>{viewTicket.sujet || 'Ma demande'}</div>

            {/* Message initial */}
            <div style={{ padding: '12px 14px', background: '#F8F7F4', borderRadius: 10, marginBottom: 10, borderLeft: '3px solid #D97706' }}>
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

            {/* Répondre */}
            {viewTicket.statut === 'ouvert' && (
              <div style={{ marginTop: 16 }}>
                <textarea value={reponseForm} onChange={e => setReponseForm(e.target.value)} rows={3} placeholder="Votre réponse..." style={{ ...INP, resize: 'vertical' }} />
                <button onClick={() => envoyerReponse(viewTicket.id)} disabled={!reponseForm.trim()} style={{ ...BTN, width: '100%', marginTop: 8, opacity: reponseForm.trim() ? 1 : 0.5 }}>
                  Répondre
                </button>
              </div>
            )}
          </div>
        )}

        {/* Liste tickets + nouveau message */}
        {!viewTicket && (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A', marginBottom: 16 }}>Messagerie support</div>

            {/* Tickets existants */}
            {tickets.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {tickets.map(t => (
                  <div key={t.id} onClick={() => setViewTicket(t)}
                    style={{ ...CARD, marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#A68B4B'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{t.sujet || 'Ma demande'}</div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{new Date(t.cree_le).toLocaleDateString('fr-FR')} · {(t.reponses || []).length} réponse{(t.reponses || []).length > 1 ? 's' : ''}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: t.statut === 'ouvert' ? '#FFFBEB' : '#F0FDF4', color: t.statut === 'ouvert' ? '#D97706' : '#16A34A' }}>
                      {t.statut === 'ouvert' ? 'En attente' : 'Résolu'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Nouveau message */}
            <div style={CARD}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Envoyer un message</div>
              <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4}
                placeholder="Décrivez votre situation ou contestez la suspension..."
                style={{ ...INP, resize: 'vertical' }} />
              <button onClick={envoyerTicket} disabled={!newMessage.trim()} style={{ ...BTN, width: '100%', marginTop: 10, opacity: newMessage.trim() ? 1 : 0.5 }}>
                Envoyer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
