// ============================================================
//  NotificationBell — Standalone bell for all dashboards
//  Fetches from /notifications API, shows badge + dropdown
//  Demo accounts get static fallback notifications
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { isDemo as _isDemo } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

const TYPE_ICONS = {
  projet: '📋', candidature: '👤', devis: '💰', avis_passage: '📝',
  conge: '📅', embauche: '🎉', system: '🔔',
  nouveau_devis: '📩', mission_acceptee: '✅', mission_refusee: '❌',
  artisan_en_route: '🚗', paiement_recu: '💰', habilitation_expire: '⚠️',
  nouveau_litige: '🔴', facture_en_retard: '📋', compte_valide: '🎉',
  compte_suspendu: '🔒', nouvelle_offre: '📨', avis_recu: '⭐',
  message_recu: '💬', projet_statut: '📋', default: '🔔',
};

const DEMO_NOTIFICATIONS = [
  { id: 1, titre: 'Bienvenue sur Freample', message: 'Votre compte est actif', type: 'compte_valide', lu: true, creeLe: new Date(Date.now() - 86400000).toISOString() },
];

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const demo = _isDemo();

  // ---- Real account: load from API + poll every 30s ----
  const fetchNotifs = useCallback(async () => {
    if (demo || !user?.id) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setCount(data.nonLues || 0);
    } catch {
      // API not available yet — silent fail
    }
  }, [demo, user?.id]);

  useEffect(() => {
    if (demo) {
      setNotifications(DEMO_NOTIFICATIONS);
      setCount(0);
      return;
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [demo, fetchNotifs]);

  // ---- Close on outside click ----
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ---- Toggle dropdown; mark all read when opening ----
  function handleBellClick() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && count > 0 && !demo) {
      api.put('/notifications/lire').catch(() => {});
      setCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    }
  }

  // ---- Click a single notification ----
  function handleNotifClick(notif) {
    // Mark individual as read
    if (!notif.lu && !demo) {
      api.put(`/notifications/${notif.id}/lire`).catch(() => {});
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, lu: true } : n)
      );
      setCount(prev => Math.max(0, prev - 1));
    }
    // Navigate if there's a link
    if (notif.lien) {
      setOpen(false);
      navigate(notif.lien);
    }
  }

  const textColor = dark ? '#F5EFE0' : '#1A1A1A';

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
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
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            minWidth: 16, height: 16, borderRadius: 8,
            background: '#DC2626', color: '#fff',
            fontSize: 10, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: dark ? '2px solid #2C2520' : '2px solid #fff',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, maxWidth: 'calc(100vw - 32px)',
          background: '#fff', border: '1px solid #E8E6E1',
          borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 1100, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid #F0EDE8',
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
              Notifications
            </span>
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 13 }}>
                Aucune notification
              </div>
            ) : notifications.slice(0, 15).map(n => (
              <div
                key={n.id}
                onClick={() => handleNotifClick(n)}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid #F8F7F4',
                  background: !n.lu ? '#FFFBEB' : 'transparent',
                  cursor: n.lien ? 'pointer' : 'default',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = !n.lu ? '#FFF7D6' : '#FAFAF8'}
                onMouseLeave={e => e.currentTarget.style.background = !n.lu ? '#FFFBEB' : 'transparent'}
              >
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>
                  {TYPE_ICONS[n.type] || TYPE_ICONS.default}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: !n.lu ? 600 : 400,
                    color: '#1A1A1A', marginBottom: 2,
                  }}>
                    {n.titre}
                  </div>
                  {n.message && (
                    <div style={{
                      fontSize: 12, color: '#555',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {n.message}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
                    {timeAgo(n.creeLe)}
                  </div>
                </div>
                {!n.lu && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#A68B4B', flexShrink: 0, marginTop: 6,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
