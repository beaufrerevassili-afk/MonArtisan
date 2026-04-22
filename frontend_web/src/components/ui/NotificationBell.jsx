// ============================================================
//  NotificationBell — Standalone bell for all dashboards
//  Fetches from /notifications API, shows badge + dropdown
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ICONS = {
  nouveau_devis: '📩', mission_acceptee: '✅', mission_refusee: '❌',
  artisan_en_route: '🚗', paiement_recu: '💰', habilitation_expire: '⚠️',
  nouveau_litige: '🔴', facture_en_retard: '📋', compte_valide: '🎉',
  compte_suspendu: '🔒', nouvelle_offre: '📨', avis_recu: '⭐',
  message_recu: '💬', projet_statut: '📋', default: '🔔',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function NotificationBell({ dark = false, style = {} }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const ref = useRef(null);
  const unreadCount = notifs.filter(n => !n.lu).length;

  const fetchNotifs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get(`/notifications?userId=${user.id}`);
      if (data.notifications) setNotifs(data.notifications);
    } catch {
      // API not available — lire depuis localStorage selon le rôle
      const role = user?.role;
      let localNotifs = [];
      try {
        if (role === 'patron') {
          localNotifs = JSON.parse(localStorage.getItem('freample_notifs_patron') || '[]');
        } else if (role === 'client') {
          localNotifs = JSON.parse(localStorage.getItem('freample_notifs_client') || '[]');
        } else if (role === 'employe') {
          localNotifs = JSON.parse(localStorage.getItem('freample_notifs_employe') || '[]');
        }
      } catch {}
      // Convertir au format attendu
      const formatted = localNotifs.map(n => ({
        id: n.id, titre: n.titre, contenu: n.message, type: n.type || 'default',
        lu: n.lu || false, creeLe: n.date, lien: n.lien,
      }));
      // Si pas de notifs réelles, fallback démo
      if (formatted.length > 0) {
        setNotifs(formatted);
      } else {
        setNotifs([
          { id: 1, titre: 'Bienvenue sur Freample', contenu: 'Votre compte est actif', type: 'compte_valide', lu: true, creeLe: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    }
  }, [user?.id]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  // Poll every 30s
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function updateLocalNotifs(updatedNotifs) {
    const role = user?.role;
    const key = role === 'patron' ? 'freample_notifs_patron' : role === 'client' ? 'freample_notifs_client' : role === 'employe' ? 'freample_notifs_employe' : null;
    if (key) {
      try {
        const local = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = local.map(n => {
          const match = updatedNotifs.find(u => u.id === n.id);
          return match ? { ...n, lu: true } : n;
        });
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
    }
  }

  async function markRead(id) {
    setNotifs(prev => { const updated = prev.map(n => n.id === id ? { ...n, lu: true } : n); updateLocalNotifs(updated); return updated; });
    try { await api.put(`/notifications/${id}/lire`); } catch {}
  }

  async function markAllRead() {
    setNotifs(prev => { const updated = prev.map(n => ({ ...n, lu: true })); updateLocalNotifs(updated); return updated; });
    try { await api.put('/notifications/tout-lire', { userId: user?.id }); } catch {}
  }

  const textColor = dark ? '#F5EFE0' : '#1A1A1A';
  const textSecColor = dark ? 'rgba(245,239,224,0.6)' : '#555';

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          color: textColor, padding: 6, display: 'flex', alignItems: 'center',
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            minWidth: 16, height: 16, borderRadius: 8,
            background: '#DC2626', color: '#fff',
            fontSize: 10, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: dark ? '2px solid #2C2520' : '2px solid #fff',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, maxWidth: 'calc(100vw - 32px)',
          background: '#fff', border: '1px solid #E8E6E1',
          borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 1100, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F0EDE8' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
              Notifications
              {unreadCount > 0 && <span style={{ background: '#DC2626', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, marginLeft: 8 }}>{unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600 }}>
                Tout lire
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 13 }}>
                Aucune notification
              </div>
            ) : notifs.slice(0, 15).map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid #F8F7F4',
                  background: !n.lu ? '#FFFBEB' : 'transparent',
                  cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = !n.lu ? '#FFF7D6' : '#FAFAF8'}
                onMouseLeave={e => e.currentTarget.style.background = !n.lu ? '#FFFBEB' : 'transparent'}
              >
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>
                  {ICONS[n.type] || ICONS.default}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: !n.lu ? 600 : 400, color: '#1A1A1A', marginBottom: 2 }}>
                    {n.titre || n.contenu}
                  </div>
                  {n.titre && n.contenu && (
                    <div style={{ fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.contenu}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#999', marginTop: 3 }}>{timeAgo(n.creeLe)}</div>
                </div>
                {!n.lu && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A68B4B', flexShrink: 0, marginTop: 6 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
