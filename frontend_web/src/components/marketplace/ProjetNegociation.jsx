import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '16px 20px' };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1A1A1A' };

export default function ProjetNegociation({ projetId, userId, addToast, chargerProjets, setProjetDetail }) {
  const [messages, setMessages] = useState([]);
  const [devis, setDevis] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const bottomRef = useRef(null);

  const charger = async () => {
    try {
      const [mRes, dRes] = await Promise.all([
        api.get(`/marketplace/projets/${projetId}/messages`),
        api.get(`/marketplace/projets/${projetId}/devis`),
      ]);
      if (mRes.data?.messages) setMessages(mRes.data.messages);
      if (dRes.data?.devis) setDevis(dRes.data.devis);
    } catch {}
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 5000);
    return () => clearInterval(interval);
  }, [projetId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const envoyerMsg = async () => {
    if (!msgInput.trim()) return;
    await api.post(`/marketplace/projets/${projetId}/messages`, { message: msgInput });
    setMsgInput('');
    charger();
  };

  const accepterDevis = async (devisId) => {
    try {
      await api.put(`/marketplace/devis/${devisId}/accepter`);
      if (addToast) addToast('Devis accepté — le chantier est créé !', 'success');
      if (chargerProjets) chargerProjets();
      if (setProjetDetail) setProjetDetail(null);
    } catch {}
  };

  const contesterDevis = async (devisId) => {
    const commentaire = prompt('Raison de la contestation :');
    if (commentaire === null) return;
    try {
      await api.put(`/marketplace/devis/${devisId}/contester`, { commentaire });
      charger();
    } catch {}
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Devis versionnés */}
      {devis.length > 0 && (
        <div style={{ ...CARD, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Devis reçus</div>
          {devis.map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: d.statut === 'accepte' ? '#F0FDF4' : '#F8F7F4', borderRadius: 8, marginBottom: 6, border: d.statut === 'accepte' ? '2px solid #16A34A' : '1px solid #E8E6E1' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{d.numero} — {Number(d.montant_ttc).toLocaleString('fr-FR')}€</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Par {d.artisan_nom || 'Artisan'}{d.conditions ? ' · ' + d.conditions.slice(0, 50) : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {d.statut === 'envoye' && (
                  <>
                    <button onClick={() => accepterDevis(d.id)} style={{ padding: '6px 12px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Accepter</button>
                    <button onClick={() => contesterDevis(d.id)} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Négocier</button>
                  </>
                )}
                {d.statut === 'accepte' && <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A' }}>Accepté</span>}
                {d.statut === 'conteste' && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626' }}>Contesté</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conversation */}
      <div style={CARD}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Discussion</div>
        <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 10 }}>
          {messages.length === 0 && <div style={{ textAlign: 'center', color: '#555', fontSize: 12, padding: 16 }}>Discutez avec l'artisan avant d'accepter</div>}
          {messages.map(m => {
            const isMe = m.auteur_id === userId;
            const isSys = m.type === 'systeme' || m.type === 'devis';
            if (isSys) return <div key={m.id} style={{ textAlign: 'center', padding: '4px 0', fontSize: 11, color: m.type === 'devis' ? '#A68B4B' : '#555', fontWeight: 600 }}>{m.message}</div>;
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: isMe ? '#2C2520' : '#F8F7F4', color: isMe ? '#F5EFE0' : '#1A1A1A', fontSize: 12, lineHeight: 1.5 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: isMe ? '#A68B4B' : '#555', marginBottom: 2 }}>{m.auteur_nom}</div>
                  {m.message}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); envoyerMsg(); } }} placeholder="Votre message..." style={{ flex: 1, ...INP, fontSize: 12 }} />
          <button onClick={envoyerMsg} disabled={!msgInput.trim()} style={{ padding: '9px 16px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: msgInput.trim() ? 1 : 0.5 }}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}
