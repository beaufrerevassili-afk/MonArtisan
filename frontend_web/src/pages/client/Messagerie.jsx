import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { IconSend, IconMessage } from '../../components/ui/Icons';


// Colour per artisan initials
const AVATAR_COLORS = ['#5B5BD6', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function Messagerie() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [conv, setConv]           = useState(null);
  const [messages, setMessages]   = useState([]);
  const [texte, setTexte]         = useState('');
  const [sending, setSending]     = useState(false);
  const [typing, setTyping]       = useState(false);
  const [online, setOnline]       = useState({});
  const bottomRef   = useRef(null);
  const channelRef  = useRef(null);
  const typingTimer = useRef(null);
  const inputRef    = useRef(null);

  // Load conversations list on mount
  useEffect(() => {
    api.get('/client/conversations')
      .then(({ data }) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0) setConv(convs[0]);
      })
      .catch(() => {});
  }, []);

  // Load messages when conversation changes
  const loadMessages = useCallback(async (missionId) => {
    try {
      const { data } = await api.get(`/client/messages-list/${missionId}`);
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!conv) return;
    loadMessages(conv.missionId);
    inputRef.current?.focus();
  }, [conv, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // BroadcastChannel — listen for messages from artisan tab
  useEffect(() => {
    if (!conv) return;

    // Close previous channel
    channelRef.current?.close();
    const ch = new BroadcastChannel(`mission_${conv.missionId}`);
    channelRef.current = ch;

    ch.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === 'typing') {
        setTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 2500);
        return;
      }
      if (msg.type === 'online_status') {
        setOnline(prev => ({ ...prev, [conv.missionId]: msg.online }));
        return;
      }
      // New message from artisan
      if (msg.auteur !== 'client') {
        setTyping(false);
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    return () => {
      ch.close();
      clearTimeout(typingTimer.current);
    };
  }, [conv]);

  async function envoyer(e) {
    e.preventDefault();
    if (!texte.trim() || !conv || sending) return;
    const draft = texte.trim();
    setTexte('');
    setSending(true);
    try {
      await api.post(`/client/messages-list/${conv.missionId}`, {
        texte: draft,
        nomAuteur: user?.nom,
      });
      await loadMessages(conv.missionId);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  // Notify artisan tab that client is typing
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyer(e);
      return;
    }
    try {
      const ch = new BroadcastChannel(`mission_${conv.missionId}`);
      ch.postMessage({ type: 'typing', from: 'client' });
      ch.close();
    } catch {}
  }

  const isOnline = online[conv?.missionId] ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <style>{`
        .msg-conv-item {
          display: flex; gap: 12px; padding: 12px 14px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
          cursor: pointer; text-align: left; width: 100%;
          transition: all 0.18s ease; margin-bottom: 4px;
        }
        .msg-conv-item:hover { background: rgba(255,255,255,0.05); }
        .msg-conv-item.active {
          background: rgba(91,91,214,0.12);
          border-color: rgba(91,91,214,0.3);
          box-shadow: 0 0 0 1px rgba(91,91,214,0.15);
        }
        .msg-input {
          flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 10px 18px; font-size: 0.875rem;
          color: var(--text, #fff); outline: none; resize: none; transition: border-color 0.2s;
          font-family: inherit;
        }
        .msg-input::placeholder { color: rgba(255,255,255,0.3); }
        .msg-input:focus { border-color: rgba(91,91,214,0.5); }
        .msg-send-btn {
          width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer; flex-shrink: 0;
          background: linear-gradient(135deg, #5B5BD6, #7C3AED);
          color: white; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; box-shadow: 0 4px 12px rgba(91,91,214,0.35);
        }
        .msg-send-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 6px 16px rgba(91,91,214,0.5); }
        .msg-send-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        @keyframes typingDot { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text, #fff)' }}>Messagerie</h1>
        <p style={{ marginTop: 4, color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
          Échangez en temps réel avec vos artisans
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden', minHeight: 0 }}>

        {/* ── Conversations list ── */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>
            Conversations
          </p>
          {conversations.map(c => {
            const active = conv?.missionId === c.missionId;
            const isOnlineConv = online[c.missionId] ?? false;
            return (
              <button
                key={c.missionId}
                onClick={() => setConv(c)}
                className={`msg-conv-item${active ? ' active' : ''}`}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    background: `linear-gradient(135deg, ${avatarColor(c.artisan)}, ${avatarColor(c.artisan)}99)`,
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1rem', boxShadow: `0 4px 10px ${avatarColor(c.artisan)}40`,
                  }}>
                    {c.artisan.charAt(0)}
                  </div>
                  {/* Online dot */}
                  <span style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 10, height: 10, borderRadius: '50%',
                    background: isOnlineConv ? '#34D399' : 'rgba(255,255,255,0.2)',
                    border: '2px solid #0D0D1A',
                    transition: 'background 0.3s',
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.artisan}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.titre}
                  </p>
                  <p style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
                    {c.specialite}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Tip */}
          <div style={{
            padding: '12px 14px', marginTop: 16,
            background: 'rgba(91,91,214,0.08)', border: '1px solid rgba(91,91,214,0.2)',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              💡 Ouvrez un onglet artisan en parallèle pour tester la messagerie en temps réel.
            </p>
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, minWidth: 0,
        }}>
          {/* Chat header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `linear-gradient(135deg, ${avatarColor(conv?.artisan || '')}, ${avatarColor(conv?.artisan || '')}99)`,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                boxShadow: `0 4px 10px ${avatarColor(conv?.artisan || '')}40`,
              }}>
                {conv?.artisan?.charAt(0)}
              </div>
              <span style={{
                position: 'absolute', bottom: 1, right: 1,
                width: 10, height: 10, borderRadius: '50%',
                background: isOnline ? '#34D399' : 'rgba(255,255,255,0.2)',
                border: '2px solid #0D0D1A',
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--text, #fff)', fontSize: '0.9375rem' }}>{conv?.artisan}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {isOnline ? (
                  <span style={{ color: '#34D399' }}>En ligne</span>
                ) : (
                  <span>{conv?.specialite}</span>
                )}
                {' · '}{conv?.titre}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'rgba(91,91,214,0.12)', border: '1px solid rgba(91,91,214,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconMessage size={24} color="#818CF8" />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Démarrez la conversation</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.auteur === 'client';
                const showDate = idx === 0 || new Date(messages[idx - 1].date).toDateString() !== new Date(msg.date).toDateString();
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div style={{ textAlign: 'center', margin: '8px 0' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 20 }}>
                          {new Date(msg.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                      {!isMe && (
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          background: `linear-gradient(135deg, ${avatarColor(msg.nomAuteur || '')}, ${avatarColor(msg.nomAuteur || '')}99)`,
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.6875rem',
                        }}>
                          {(msg.nomAuteur || '?').charAt(0)}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '68%',
                        background: isMe
                          ? 'linear-gradient(135deg, #5B5BD6, #7C3AED)'
                          : 'rgba(255,255,255,0.07)',
                        color: 'white',
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        padding: '10px 14px',
                        fontSize: '0.875rem',
                        boxShadow: isMe ? '0 4px 12px rgba(91,91,214,0.3)' : '0 1px 4px rgba(0,0,0,0.2)',
                      }}>
                        {!isMe && (
                          <p style={{ fontSize: '0.6875rem', fontWeight: 600, marginBottom: 4, color: avatarColor(msg.nomAuteur || '') }}>
                            {msg.nomAuteur}
                          </p>
                        )}
                        <p style={{ lineHeight: 1.55 }}>{msg.texte}</p>
                        <p style={{ fontSize: '0.625rem', marginTop: 5, opacity: 0.55, textAlign: 'right' }}>
                          {formatTime(msg.date)}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: `linear-gradient(135deg, ${avatarColor(conv?.artisan || '')}, ${avatarColor(conv?.artisan || '')}99)`,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.6875rem',
                }}>
                  {conv?.artisan?.charAt(0)}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)',
                      display: 'inline-block',
                      animation: `typingDot 1s ${delay}ms infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={envoyer}
            style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}
          >
            <input
              ref={inputRef}
              className="msg-input"
              placeholder={`Message à ${conv?.artisan}…`}
              value={texte}
              onChange={e => setTexte(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="msg-send-btn"
              disabled={sending || !texte.trim()}
              title="Envoyer (Entrée)"
            >
              <IconSend size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
