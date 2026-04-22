import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DS from '../../design/luxe';

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: DS.font, color: '#1A1A1A' };

export default function SuiviProjets() {
  const { user } = useAuth();
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [devisVersions, setDevisVersions] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [devisForm, setDevisForm] = useState({ montantTTC: '', conditions: '' });
  const bottomRef = useRef(null);

  const isDemo = localStorage.getItem('token')?.endsWith('.dev');

  // Charger mes suivis
  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    api.get('/marketplace/mes-suivis').then(({ data }) => {
      if (data.suivis) setSuivis(data.suivis);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Charger messages + devis quand on sélectionne un projet
  const chargerConversation = async (projetId) => {
    try {
      const [msgRes, devisRes] = await Promise.all([
        api.get(`/marketplace/projets/${projetId}/messages`),
        api.get(`/marketplace/projets/${projetId}/devis`),
      ]);
      if (msgRes.data?.messages) setMessages(msgRes.data.messages);
      if (devisRes.data?.devis) setDevisVersions(devisRes.data.devis);
    } catch {}
  };

  // Polling messages toutes les 5s
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => {
    if (!selected) return;
    chargerConversation(selected.id);
    const interval = setInterval(() => {
      if (selectedRef.current) chargerConversation(selectedRef.current.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  // Scroll en bas quand nouveaux messages
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const envoyerMessage = async () => {
    if (!newMsg.trim() || !selected) return;
    await api.post(`/marketplace/projets/${selected.id}/messages`, { message: newMsg });
    setNewMsg('');
    chargerConversation(selected.id);
  };

  const envoyerDevis = async () => {
    if (!devisForm.montantTTC || !selected) return;
    await api.post(`/marketplace/projets/${selected.id}/devis`, {
      montantTTC: Number(devisForm.montantTTC),
      conditions: devisForm.conditions,
    });
    setShowDevisForm(false);
    setDevisForm({ montantTTC: '', conditions: '' });
    chargerConversation(selected.id);
  };

  const refuserProjet = async () => {
    if (!selected || !window.confirm('Se retirer de ce projet ?')) return;
    await api.put(`/marketplace/projets/${selected.id}/refuser`);
    setSuivis(prev => prev.filter(s => s.id !== selected.id));
    setSelected(null);
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>;

  // ══ VUE CONVERSATION ══
  if (selected) {
    const dernierDevis = devisVersions[0];
    return (
      <div style={{ padding: 28, maxWidth: 800, margin: '0 auto' }}>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 16, fontFamily: DS.font }}>← Retour aux suivis</button>

        {/* Header projet */}
        <div style={{ ...CARD, marginBottom: 16, borderLeft: '4px solid #A68B4B' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#A68B4B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{selected.metier}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>{selected.titre}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{selected.client_nom || 'Client'} · {selected.ville || 'Marseille'} · Budget : {Number(selected.budget_estime || 0).toLocaleString('fr-FR')}€</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#FFFBEB', color: '#D97706' }}>
              {selected.offre_statut === 'acceptee' ? '✅ Accepté' : selected.offre_statut === 'retiree' ? '↩️ Retiré' : '⏳ En négociation'}
            </span>
            {dernierDevis && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#2563EB' }}>Devis V{dernierDevis.version} — {Number(dernierDevis.montant_ttc).toLocaleString('fr-FR')}€</span>}
          </div>
        </div>

        {/* Devis existants */}
        {devisVersions.length > 0 && (
          <div style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Historique devis</div>
            {devisVersions.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F2F2F7' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{d.numero}</span>
                  <span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>{Number(d.montant_ttc).toLocaleString('fr-FR')}€ TTC</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: d.statut === 'accepte' ? '#F0FDF4' : d.statut === 'conteste' ? '#FEF2F2' : '#FFFBEB', color: d.statut === 'accepte' ? '#16A34A' : d.statut === 'conteste' ? '#DC2626' : '#D97706' }}>
                  {d.statut === 'accepte' ? 'Accepté' : d.statut === 'conteste' ? 'Contesté' : 'Envoyé'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Conversation */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Conversation</div>
          <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 12, padding: '8px 4px' }}>
            {messages.length === 0 && <div style={{ textAlign: 'center', color: '#555', fontSize: 13, padding: 20 }}>Aucun message — commencez la conversation</div>}
            {messages.map(m => {
              const isMe = m.auteur_id === user?.id;
              const isSystem = m.type === 'systeme' || m.type === 'devis';
              if (isSystem) return (
                <div key={m.id} style={{ textAlign: 'center', padding: '6px 0', fontSize: 11, color: m.type === 'devis' ? '#A68B4B' : '#555', fontWeight: 600 }}>
                  {m.message}
                </div>
              );
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px', background: isMe ? '#2C2520' : '#F8F7F4', color: isMe ? '#F5EFE0' : '#1A1A1A', fontSize: 13, lineHeight: 1.5 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 3, color: isMe ? '#A68B4B' : '#555' }}>{m.auteur_nom}</div>
                    {m.message}
                    <div style={{ fontSize: 9, marginTop: 4, textAlign: 'right', color: isMe ? 'rgba(245,239,224,0.5)' : '#999' }}>{new Date(m.cree_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input message */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); envoyerMessage(); } }}
              placeholder="Votre message..." style={{ ...INP, flex: 1 }} />
            <button onClick={envoyerMessage} disabled={!newMsg.trim()} style={{ ...BTN, opacity: newMsg.trim() ? 1 : 0.5 }}>Envoyer</button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowDevisForm(!showDevisForm)} style={{ ...BTN, background: '#A68B4B' }}>
            {showDevisForm ? 'Annuler' : `Envoyer un devis${dernierDevis ? ' (V' + (dernierDevis.version + 1) + ')' : ''}`}
          </button>
          <button onClick={refuserProjet} style={{ padding: '10px 20px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>
            Se retirer du projet
          </button>
        </div>

        {/* Formulaire devis */}
        {showDevisForm && (
          <div style={{ ...CARD, marginTop: 12, borderLeft: '4px solid #A68B4B' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>
              Nouveau devis {dernierDevis ? `(V${dernierDevis.version + 1})` : '(V1)'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4 }}>Montant TTC (€) *</label>
                <input type="number" value={devisForm.montantTTC} onChange={e => setDevisForm(f => ({ ...f, montantTTC: e.target.value }))} placeholder="3500" style={INP} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4 }}>Conditions / détails</label>
                <textarea value={devisForm.conditions} onChange={e => setDevisForm(f => ({ ...f, conditions: e.target.value }))} rows={3} placeholder="Délai, conditions de paiement, détails..." style={{ ...INP, resize: 'vertical' }} />
              </div>
              <button onClick={envoyerDevis} disabled={!devisForm.montantTTC} style={{ ...BTN, background: '#A68B4B', opacity: devisForm.montantTTC ? 1 : 0.5 }}>
                Envoyer le devis
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══ LISTE DES SUIVIS ══
  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#1A1A1A' }}>Suivi futurs projets</h1>
      <p style={{ fontSize: 13, color: '#555', margin: '0 0 20px' }}>{suivis.length} projet{suivis.length > 1 ? 's' : ''} en négociation</p>

      {suivis.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Aucun projet en cours</div>
          <div style={{ fontSize: 13, color: '#555' }}>Quand vous répondez à un projet client, il apparaît ici pour le suivi.</div>
        </div>
      )}

      {suivis.map(s => (
        <div key={s.id} onClick={() => setSelected(s)}
          style={{ ...CARD, marginBottom: 10, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all .15s', borderLeft: `4px solid ${s.offre_statut === 'acceptee' ? '#16A34A' : '#A68B4B'}` }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{s.titre}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: s.offre_statut === 'acceptee' ? '#F0FDF4' : '#FFFBEB', color: s.offre_statut === 'acceptee' ? '#16A34A' : '#D97706' }}>
                {s.offre_statut === 'acceptee' ? 'Accepté' : 'En négo'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>{s.metier} · {s.client_nom || 'Client'} · {s.ville || ''} · {Number(s.budget_estime || 0).toLocaleString('fr-FR')}€</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              {Number(s.nb_messages) || 0} message{Number(s.nb_messages) > 1 ? 's' : ''} · {Number(s.nb_devis) || 0} devis
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      ))}
    </div>
  );
}
