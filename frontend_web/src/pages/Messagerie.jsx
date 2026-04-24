import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DS from '../design/luxe';
import { isDemo as _isDemo } from '../utils/storage';

function timeAgo(date) {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString('fr-FR');
}

const CTX_ICONS = { projet: '🏗️', recrutement: '👤', devis: '📋', support: '🔧', direct: '💬', message: '💬' };

export default function Messagerie() {
  const { user } = useAuth();
  const isDemo = _isDemo();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    loadConversations();
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  function loadConversations() {
    api.get('/messagerie/conversations').then(({ data }) => {
      setConversations(data.conversations || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  function openConversation(conv) {
    setActiveConv(conv);
    api.get(`/messagerie/conversation/${conv.conversationId}`).then(({ data }) => {
      setMessages(data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }).catch(() => {});
    setConversations(prev => prev.map(c => c.conversationId === conv.conversationId ? { ...c, nonLus: 0 } : c));
  }

  async function envoyer() {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      await api.post('/messagerie/envoyer', {
        receiverId: activeConv.autreId, contenu: newMsg.trim(),
        contexte: activeConv.contexte, contexteId: activeConv.contexteId, contexteTitre: activeConv.contexteTitre,
      });
      setNewMsg('');
      const { data } = await api.get(`/messagerie/conversation/${activeConv.conversationId}`);
      setMessages(data.messages || []);
      loadConversations();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {} finally { setSending(false); }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const showList = !isMobile || !activeConv;
  const showChat = !isMobile || !!activeConv;

  if (isDemo) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', color: '#636363', fontSize: 14, fontFamily: DS.font }}>
        La messagerie est disponible pour les comptes réels.
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', fontFamily: DS.font }}>
      {/* Liste conversations */}
      {showList && (
        <div style={{ width: isMobile ? '100%' : 320, borderRight: isMobile ? 'none' : '1px solid #E8E6E1', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#fff' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E6E1' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Messages</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && <div style={{ padding: 40, textAlign: 'center', color: '#636363', fontSize: 13 }}>Chargement...</div>}
            {!loading && conversations.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>💬</div>
                <div style={{ fontSize: 14, color: '#636363' }}>Aucune conversation</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Vos messages apparaîtront ici</div>
              </div>
            )}
            {conversations.map(c => (
              <div key={c.conversationId} onClick={() => openConversation(c)}
                style={{ padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #F2F2F7', background: activeConv?.conversationId === c.conversationId ? '#F8F7F4' : '#fff', display: 'flex', gap: 12, alignItems: 'center', transition: 'background .1s' }}
                onMouseEnter={e => { if (activeConv?.conversationId !== c.conversationId) e.currentTarget.style.background = '#FAFAF8'; }}
                onMouseLeave={e => { if (activeConv?.conversationId !== c.conversationId) e.currentTarget.style.background = '#fff'; }}>
                {c.autrePhoto ? (
                  <img src={c.autrePhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {(c.autreNom || '?')[0]}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: c.nonLus > 0 ? 800 : 600, color: '#1A1A1A' }}>{c.autreNom}</span>
                    <span style={{ fontSize: 10, color: '#636363', flexShrink: 0 }}>{timeAgo(c.dernierDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12 }}>{CTX_ICONS[c.contexte] || '💬'}</span>
                    <span style={{ fontSize: 12, color: c.nonLus > 0 ? '#1A1A1A' : '#636363', fontWeight: c.nonLus > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.dernierMessage?.substring(0, 50)}
                    </span>
                  </div>
                  {c.contexteTitre && <div style={{ fontSize: 10, color: '#A68B4B', marginTop: 2 }}>{c.contexteTitre}</div>}
                </div>
                {c.nonLus > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#A68B4B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{c.nonLus}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      {showChat && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FAFAF8' }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>💬</div>
              <div style={{ color: '#636363', fontSize: 14 }}>Sélectionnez une conversation</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #E8E6E1', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                {isMobile && <button onClick={() => setActiveConv(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#A68B4B', fontWeight: 700, padding: 0 }}>←</button>}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                  {(activeConv.autreNom || '?')[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{activeConv.autreNom}</div>
                  {activeConv.contexteTitre && <div style={{ fontSize: 11, color: '#A68B4B' }}>{CTX_ICONS[activeConv.contexte]} {activeConv.contexteTitre}</div>}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map(m => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', padding: '10px 14px', borderRadius: 14,
                        background: isMe ? '#2C2520' : '#fff', color: isMe ? '#F5EFE0' : '#1A1A1A',
                        border: isMe ? 'none' : '1px solid #E8E6E1',
                        borderBottomRightRadius: isMe ? 4 : 14, borderBottomLeftRadius: isMe ? 14 : 4,
                      }}>
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.contenu}</div>
                        <div style={{ fontSize: 9, color: isMe ? 'rgba(245,239,224,0.5)' : '#636363', marginTop: 4, textAlign: 'right' }}>
                          {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid #E8E6E1', background: '#fff', display: 'flex', gap: 10 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
                  placeholder="Tapez votre message..."
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid #E8E6E1', borderRadius: 24, fontSize: 14, outline: 'none', fontFamily: DS.font }} />
                <button onClick={envoyer} disabled={!newMsg.trim() || sending}
                  style={{ padding: '12px 20px', background: newMsg.trim() ? '#2C2520' : '#E8E6E1', color: '#F5EFE0', border: 'none', borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: newMsg.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
                  {sending ? '...' : 'Envoyer'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
