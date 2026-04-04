import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  IconHome, IconMissions, IconFinance, IconTeam, IconShield,
  IconBank, IconSettings, IconLogout, IconMenu, IconDocument, IconBuilding,
  IconDownload, IconBox, IconBell, IconSearch, IconCalendar, IconCreditCard,
  IconChevronDown, IconScale, IconStar, IconUser, IconMessage, IconGift,
} from '../ui/Icons';

/* ── Inline icon helpers ───────────────────────────────── */
function IconSun({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function IconMoon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

/* ── Menu structure ────────────────────────────────────── */

// Client menus per sector tab
const CLIENT_TAB_MENUS = {
  accueil: [
    { label: 'Accueil',          path: '/client/dashboard',                   Icon: IconHome       },
    { label: 'Freample Com',     path: '/client/com',                         Icon: IconDocument   },
    { label: 'Paiements',        path: '/client/paiements',                   Icon: IconCreditCard },
    { label: 'Messagerie',       path: '/client/messagerie',                  Icon: IconMessage    },
    { label: 'Parrainage',       path: '/client/parrainage',                  Icon: IconGift       },
    { label: 'Mon profil',       path: '/client/profil',                      Icon: IconUser       },
  ],
  btp: [
    { label: '← Accueil', path: '/client/dashboard',                  Icon: IconHome,     isBack: true },
    { label: 'Mes missions',      path: '/client/travaux',                     Icon: IconMissions  },
    { label: 'Mes devis',         path: '/client/devis',                       Icon: IconDocument  },
    { label: 'Paiements',         path: '/client/paiements',                   Icon: IconCreditCard},
    { label: 'Mes avis',          path: '/client/avis',                        Icon: IconStar      },
    { label: 'Messagerie',        path: '/client/messagerie',                  Icon: IconMessage   },
    { label: 'Mon profil',        path: '/client/profil',                      Icon: IconUser      },
  ],
  coiffure: [
    { label: '← Accueil', path: '/client/dashboard',                    Icon: IconHome,     isBack: true },
    { label: 'Mes rendez-vous',   path: '/client/dashboard?tab=coiffure',       Icon: IconCalendar  },
    { label: 'Salons favoris',    path: '/client/dashboard?tab=coiffure',       Icon: IconStar      },
    { label: 'Historique',        path: '/client/travaux',                       Icon: IconMissions  },
    { label: 'Paiements',         path: '/client/paiements',                    Icon: IconCreditCard},
    { label: 'Messagerie',        path: '/client/messagerie',                   Icon: IconMessage   },
    { label: 'Mon profil',        path: '/client/profil',                       Icon: IconUser      },
  ],
  restaurant: [
    { label: '← Accueil', path: '/client/dashboard',                    Icon: IconHome,     isBack: true },
    { label: 'Mes réservations',  path: '/client/dashboard?tab=restaurant',     Icon: IconCalendar  },
    { label: 'Mes commandes',     path: '/client/dashboard?tab=restaurant',     Icon: IconMissions  },
    { label: 'Mes habitudes',     path: '/client/dashboard?tab=restaurant',     Icon: IconStar      },
    { label: 'Paiements',         path: '/client/paiements',                    Icon: IconCreditCard},
    { label: 'Messagerie',        path: '/client/messagerie',                   Icon: IconMessage   },
    { label: 'Mon profil',        path: '/client/profil',                       Icon: IconUser      },
  ],
  vacances: [
    { label: '← Accueil', path: '/client/dashboard',                    Icon: IconHome,     isBack: true },
    { label: 'Mes séjours',       path: '/client/dashboard?tab=vacances',       Icon: IconCalendar  },
    { label: 'Logements favoris', path: '/client/dashboard?tab=vacances',       Icon: IconStar      },
    { label: 'Mes voyageurs',     path: '/client/profil',                       Icon: IconUser      },
    { label: 'Paiements',         path: '/client/paiements',                    Icon: IconCreditCard},
    { label: 'Messagerie',        path: '/client/messagerie',                   Icon: IconMessage   },
    { label: 'Mon profil',        path: '/client/profil',                       Icon: IconUser      },
  ],
};

const SECTOR_HEADERS = {
  btp:        { label: '🔨 BTP & Travaux',  color: '#5B5BD6', bg: '#EBF5FF' },
  coiffure:   { label: '✂️ Coiffure',        color: '#E535AB', bg: '#FFF0F8' },
  restaurant: { label: '🍽️ Restaurant',      color: '#FF6000', bg: '#FFF3E8' },
  vacances:   { label: '🏖️ Vacances',        color: '#0080FF', bg: '#E8F4FF' },
};

const MENUS = {
  client: CLIENT_TAB_MENUS.accueil, // default; overridden dynamically
  patron: null, // groups used instead
  super_admin: [
    { label: 'Administration',  path: '/admin/dashboard',  Icon: IconSettings },
  ],
  fondateur: [
    { label: 'Administration',  path: '/fondateur/dashboard', Icon: IconSettings },
  ],
  artisan: [
    { label: 'Tableau de bord', path: '/artisan/dashboard',                    Icon: IconHome       },
    { label: 'Mes missions',    path: '/artisan/dashboard?tab=missions',       Icon: IconMissions   },
    { label: 'Planning',        path: '/artisan/dashboard?tab=planning',       Icon: IconCalendar   },
    { label: 'Notes de frais',  path: '/artisan/dashboard?tab=frais',          Icon: IconDocument   },
    { label: 'Frais chantier',  path: '/artisan/dashboard?tab=chantier',       Icon: IconBuilding   },
    { label: 'Fiches de paie',  path: '/artisan/dashboard?tab=paie',           Icon: IconCreditCard },
    { label: 'Congés',          path: '/artisan/dashboard?tab=conges',         Icon: IconShield     },
    { label: 'Messagerie',      path: '/artisan/dashboard?tab=messagerie',     Icon: IconMessage    },
    { label: 'Mon profil',      path: '/artisan/dashboard?tab=profil',         Icon: IconUser       },
  ],
};

// Grouped menu for patron role
const PATRON_GROUPS = [
  {
    id: 'operations',
    label: 'Opérations',
    items: [
      { label: 'Tableau de bord', path: '/patron/dashboard', Icon: IconHome },
      { label: 'Missions & Chantiers', path: '/patron/missions', Icon: IconBuilding },
      { label: 'Agenda',          path: '/patron/agenda',    Icon: IconCalendar },
      { label: 'Devis Pro',       path: '/patron/devis-pro', Icon: IconDocument },
    ],
  },
  {
    id: 'finances',
    label: 'Finances',
    items: [
      { label: 'Vue d\'ensemble', path: '/patron/finance',                    Icon: IconFinance    },
      { label: 'Trésorerie',      path: '/patron/finance?onglet=tresorerie',  Icon: IconFinance    },
      { label: 'Facturation',     path: '/patron/finance?onglet=facturation', Icon: IconCreditCard },
      { label: 'URSSAF',          path: '/patron/finance?onglet=urssaf',      Icon: IconBank       },
      { label: 'Salaires',        path: '/patron/finance?onglet=salaires',    Icon: IconBank       },
      { label: 'Stock',           path: '/patron/stock',                      Icon: IconBox        },
    ],
  },
  {
    id: 'equipe',
    label: 'Équipe & Clients',
    items: [
      { label: 'Ressources H.',  path: '/patron/rh',          Icon: IconTeam },
      { label: 'QSE',            path: '/patron/qse',          Icon: IconShield },
      { label: 'Clients RFM',    path: '/patron/clients-rfm',  Icon: IconTeam },
      { label: 'Réputation',     path: '/patron/reputation',   Icon: IconStar },
    ],
  },
  {
    id: 'gestion',
    label: 'Gestion',
    items: [
      { label: 'Documents',        path: '/patron/documents',        Icon: IconDownload },
      { label: 'Gestion logiciel', path: '/patron/gestion-logiciel', Icon: IconSettings },
      { label: 'Rappel juridique', path: '/patron/rappel-juridique', Icon: IconScale },
      { label: 'Mon profil',       path: '/patron/profil',           Icon: IconUser },
    ],
  },
];

// Flat menus for non-BTP patron sectors
const PATRON_SECTOR_MENUS = {
  coiffure: [
    { label: 'Tableau de bord',   path: '/patron/dashboard',                Icon: IconHome       },
    { label: 'Rendez-vous',       path: '/patron/dashboard?onglet=rdv',     Icon: IconCalendar   },
    { label: 'Services & Tarifs', path: '/patron/dashboard?onglet=services',Icon: IconDocument   },
    { label: 'Clients',           path: '/patron/dashboard?onglet=clients', Icon: IconTeam       },
    { label: 'Équipe',            path: '/patron/dashboard?onglet=equipe',  Icon: IconTeam       },
    { label: 'Paiements',         path: '/patron/dashboard?onglet=paiements',Icon: IconFinance   },
    { label: 'Rapports',          path: '/patron/dashboard?onglet=rapports',Icon: IconStar       },
    { label: 'Mon profil',        path: '/patron/profil',                   Icon: IconUser       },
  ],
  restaurant: [
    { label: 'Tableau de bord',   path: '/patron/dashboard',                Icon: IconHome       },
    { label: 'Tables',            path: '/patron/dashboard?onglet=tables',  Icon: IconBuilding   },
    { label: 'Cuisine',           path: '/patron/dashboard?onglet=commandes',Icon: IconDocument  },
    { label: 'Réservations',      path: '/patron/dashboard?onglet=reservations',Icon: IconCalendar},
    { label: 'Menu',              path: '/patron/dashboard?onglet=menu',    Icon: IconDocument   },
    { label: 'Paiements',         path: '/patron/dashboard?onglet=paiements',Icon: IconFinance   },
    { label: 'Clients',           path: '/patron/dashboard?onglet=clients', Icon: IconTeam       },
    { label: 'Rapports',          path: '/patron/dashboard?onglet=rapports',Icon: IconStar       },
    { label: 'Paramètres',        path: '/patron/dashboard?onglet=parametres',Icon: IconSettings },
    { label: 'Mon profil',        path: '/patron/profil',                   Icon: IconUser       },
  ],
  vacances: [
    { label: 'Tableau de bord',   path: '/patron/dashboard',                    Icon: IconHome       },
    { label: 'Réservations',      path: '/patron/dashboard?onglet=reservations',Icon: IconCalendar   },
    { label: 'Chambres',          path: '/patron/dashboard?onglet=chambres',    Icon: IconBuilding   },
    { label: 'Check-in / out',    path: '/patron/dashboard?onglet=checkin',     Icon: IconDocument   },
    { label: 'Paiements',         path: '/patron/dashboard?onglet=paiements',   Icon: IconFinance    },
    { label: 'Clients',           path: '/patron/dashboard?onglet=clients',     Icon: IconTeam       },
    { label: 'Paramètres',        path: '/patron/dashboard?onglet=parametres',  Icon: IconSettings   },
    { label: 'Rapports',          path: '/patron/dashboard?onglet=rapports',    Icon: IconStar       },
    { label: 'Mon profil',        path: '/patron/profil',                       Icon: IconUser       },
  ],
  course: [
    { label: 'Tableau de bord',   path: '/patron/dashboard',                    Icon: IconHome       },
    { label: 'Courses',           path: '/patron/dashboard?onglet=courses',     Icon: IconMissions   },
    { label: 'Historique',        path: '/patron/dashboard?onglet=historique',   Icon: IconDocument   },
    { label: 'Paiements',         path: '/patron/dashboard?onglet=paiements',   Icon: IconFinance    },
    { label: 'Véhicule',          path: '/patron/dashboard?onglet=vehicule',    Icon: IconBuilding   },
    { label: 'Clients',           path: '/patron/dashboard?onglet=clients',     Icon: IconTeam       },
    { label: 'Paramètres',        path: '/patron/dashboard?onglet=parametres',  Icon: IconSettings   },
    { label: 'Rapports',          path: '/patron/dashboard?onglet=rapports',    Icon: IconStar       },
    { label: 'Mon profil',        path: '/patron/profil',                       Icon: IconUser       },
  ],
  eat: [
    { label: 'Tableau de bord',   path: '/patron/dashboard',                    Icon: IconHome       },
    { label: 'Livraisons',        path: '/patron/dashboard?onglet=livraisons',  Icon: IconMissions   },
    { label: 'Historique',        path: '/patron/dashboard?onglet=historique',   Icon: IconDocument   },
    { label: 'Paiements',         path: '/patron/dashboard?onglet=paiements',   Icon: IconFinance    },
    { label: 'Restaurants',       path: '/patron/dashboard?onglet=restaurants',  Icon: IconBuilding   },
    { label: 'Livreurs',          path: '/patron/dashboard?onglet=livreurs',    Icon: IconTeam       },
    { label: 'Paramètres',        path: '/patron/dashboard?onglet=parametres',  Icon: IconSettings   },
    { label: 'Rapports',          path: '/patron/dashboard?onglet=rapports',    Icon: IconStar       },
    { label: 'Mon profil',        path: '/patron/profil',                       Icon: IconUser       },
  ],
  com: 'dynamic', // handled dynamically based on vue toggle
};

const PATRON_SECTOR_HEADERS = {
  coiffure:   { label: '✂️ Coiffure',         color: '#E535AB', bg: '#FFF0F8' },
  restaurant: { label: '🍽️ Restaurant',       color: '#FF6000', bg: '#FFF3E8' },
  vacances:   { label: '🏨 Hôtel & Vacances', color: '#0080FF', bg: '#E8F4FF' },
  course:     { label: '🚗 Freample Course',  color: '#000000', bg: '#F3F3F3' },
  eat:        { label: '🛵 Freample Eat',     color: '#05944F', bg: '#F0FDF4' },
  com:        { label: '🎬 Freample Com',    color: '#8B5CF6', bg: '#F5F3FF' },
};

const DEMO_NOTIFS = [
  { id: 1, text: 'Nouveau devis accepté par M. Rousseau', time: 'Il y a 5 min', unread: true },
  { id: 2, text: 'Contrôle technique à renouveler : AA-123-BB', time: 'Il y a 1 h',  unread: true },
  { id: 3, text: 'Facture #F-2024-018 en retard de paiement', time: 'Hier',         unread: false },
  { id: 4, text: 'Salarié Martin absent demain', time: 'Hier',                      unread: false },
];

const ROLE_LABELS_BY_SECTOR = {
  btp:        { patron:'Chef d\'entreprise BTP', artisan:'Artisan BTP' },
  coiffure:   { patron:'Gérant Salon', artisan:'Coiffeur·se' },
  restaurant: { patron:'Restaurateur', artisan:'Employé Restaurant' },
  vacances:   { patron:'Hôtelier', artisan:'Réceptionniste' },
  course:     { patron:'Gérant VTC', artisan:'Chauffeur' },
  eat:        { patron:'Gérant Eat', artisan:'Livreur' },
  com:        { patron:'Freample Com', artisan:'Monteur' },
};
function getRoleLabel(user) {
  if (!user) return '';
  if (user.role === 'client') return 'Client';
  if (user.role === 'super_admin') return 'Super Admin';
  if (user.role === 'fondateur') return 'Fondateur';
  const sector = ROLE_LABELS_BY_SECTOR[user.secteur];
  if (sector) return sector[user.role] || user.role;
  return user.role === 'patron' ? 'Chef d\'entreprise' : 'Employé';
}

const FONDATEUR_VIEWS = [
  { key: 'admin',   label: 'Admin',   path: '/fondateur/dashboard', icon: '⚙️' },
  { key: 'patron',  label: 'Patron',  path: '/patron/dashboard',    icon: '🏗️' },
  { key: 'client',  label: 'Client',  path: '/client/dashboard',    icon: '👤' },
  { key: 'artisan', label: 'Artisan', path: '/artisan/dashboard',   icon: '🔨' },
];

/* ── Group item ────────────────────────────────────────── */
function NavGroup({ group, collapsed, location, onNavigate }) {
  const storageKey = `nav-group-${group.id}`;
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) return saved === 'true';
    // default open if any item in group is active
    return group.items.some(i => location.pathname === i.path || location.pathname.startsWith(i.path));
  });

  useEffect(() => {
    localStorage.setItem(storageKey, String(open));
  }, [open, storageKey]);

  if (collapsed) {
    return (
      <>
        {group.items.map(({ label, path, Icon }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavigate}
              className={`nav-item${active ? ' active' : ''}`}
              style={{ padding: 8, justifyContent: 'center', marginBottom: 2 }}
              title={label}
            >
              <Icon size={17} />
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '5px 10px', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-tertiary)',
          fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          borderRadius: 6, transition: 'var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
      >
        <span>{group.label}</span>
        <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'flex' }}>
          <IconChevronDown size={12} />
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 2 }}>
          {group.items.map(({ label, path, Icon }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                onClick={onNavigate}
                className={`nav-item${active ? ' active' : ''}`}
                style={{ padding: '7px 12px', marginBottom: 1, overflow: 'hidden' }}
              >
                <Icon size={16} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Notification bell ─────────────────────────────────── */
function NotifBell({ isMobile }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const ref = useRef(null);
  const { user } = useAuth();
  const unreadCount = notifs.filter(n => n.unread).length;

  // Charger les vraies notifications pour Freample Com
  useEffect(() => {
    if (user?.secteur === 'com') {
      // api already imported at top
      api.get('/com/projets').then(r => {
        if (r.data?.projets?.length) {
          const realNotifs = r.data.projets
            .filter(p => p.statut === 'brief_recu')
            .map((p, i) => ({
              id: p.id,
              text: `🎬 Nouvelle demande de ${p.client_nom} — ${p.type || 'Projet'}`,
              time: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'Récent',
              unread: true,
            }));
          // Ajouter les projets en attente de réponse
          const waiting = r.data.projets
            .filter(p => p.statut === 'devis_envoye')
            .map(p => ({
              id: 1000 + p.id,
              text: `⏳ Devis en attente — ${p.client_nom}`,
              time: 'En cours',
              unread: false,
            }));
          setNotifs([...realNotifs, ...waiting]);
        } else {
          setNotifs([{ id:0, text:'Aucune notification', time:'', unread:false }]);
        }
      }).catch(() => {
        setNotifs([{ id:0, text:'Aucune notification', time:'', unread:false }]);
      });
    } else {
      // Autres secteurs : garder les notifs démo
      setNotifs(DEMO_NOTIFS);
    }
  }, [user?.secteur]);

  // Polling toutes les 30s pour les nouvelles demandes (Com uniquement)
  useEffect(() => {
    if (user?.secteur !== 'com') return;
    const interval = setInterval(() => {
      // api already imported at top
      api.get('/com/projets').then(r => {
        if (r.data?.projets) {
          const briefs = r.data.projets.filter(p => p.statut === 'brief_recu');
          if (briefs.length > 0) {
            setNotifs(prev => {
              const existingIds = prev.map(n => n.id);
              const newOnes = briefs.filter(p => !existingIds.includes(p.id)).map(p => ({
                id: p.id,
                text: `🎬 Nouvelle demande de ${p.client_nom} — ${p.type || 'Projet'}`,
                time: 'À l\'instant',
                unread: true,
              }));
              return newOnes.length ? [...newOnes, ...prev] : prev;
            });
          }
        }
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.secteur]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function markAllRead() {
    setNotifs(n => n.map(x => ({ ...x, unread: false })));
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', padding: '6px', borderRadius: 8,
          display: 'flex', alignItems: 'center', transition: 'var(--transition)',
        }}
        title="Notifications"
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <IconBell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--danger)', border: '2px solid var(--card)',
          }} />
        )}
      </button>

      {open && (
        <div className="notif-dropdown" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 320, background: 'var(--card)',
          border: '1px solid var(--border)', borderRadius: 12,
          boxShadow: 'var(--shadow-md)', zIndex: 100,
          animation: 'slideUpFade 0.15s ease-out',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
              Notifications {unreadCount > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: '0.6875rem', marginLeft: 6 }}>{unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
                Tout marquer lu
              </button>
            )}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Aucune notification</div>
            ) : notifs.map(n => (
              <div
                key={n.id}
                onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-light)',
                  background: n.unread ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.1s', display: 'flex', gap: 10, alignItems: 'flex-start',
                }}
                onMouseEnter={e => e.currentTarget.style.background = n.unread ? 'var(--primary-light)' : 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'var(--primary-light)' : 'transparent'}
              >
                {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 5 }} />}
                {!n.unread && <span style={{ width: 7, flexShrink: 0 }} />}
                <div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: n.unread ? 500 : 400, marginBottom: 3 }}>{n.text}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Layout ────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = e => { setIsMobile(e.matches); if (!e.matches) setMobileOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const isFondateur = user?.role === 'fondateur';
  const isPatron = user?.role === 'patron';
  const isClient = user?.role === 'client';
  const clientTab = isClient ? (searchParams.get('tab') || 'accueil') : null;
  const activeClientMenu = isClient ? (CLIENT_TAB_MENUS[clientTab] || CLIENT_TAB_MENUS.accueil) : null;
  const sectorHeader = clientTab ? SECTOR_HEADERS[clientTab] : null;
  const menu = isClient ? activeClientMenu : (MENUS[user?.role] || []);
  const initials = user?.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Flat list for search across all patron items
  const allPatronItems = PATRON_GROUPS.flatMap(g => g.items);
  const searchResults = search.trim().length > 1
    ? allPatronItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside aria-label="Menu principal" style={{
        // Sur mobile : position fixed → hors du flux flex → width 0 pour ne pas pousser le contenu
        width:    isMobile ? 0 : (collapsed ? 64 : 'var(--sidebar-width)'),
        minWidth: isMobile ? 0 : (collapsed ? 64 : 'var(--sidebar-width)'),
        background: 'var(--card)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), width 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
        overflow: 'hidden',
        boxShadow: isMobile ? 'var(--shadow-xl)' : '1px 0 0 var(--border-light)',
        zIndex: 50,
        ...(isMobile ? {
          position: 'fixed',
          width: 'var(--sidebar-width)',   // largeur réelle de la sidebar elle-même
          top: 0, bottom: 0, left: 0,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        } : {}),
      }}>
        {/* Logo + toggles */}
        <div style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 10px' : '0 12px',
          borderBottom: '1px solid var(--border-light)',
          gap: 6,
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div onClick={() => navigate(user?.role === 'client' ? '/' : `/${user?.role || ''}/dashboard`)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px var(--primary-glow)',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.75)"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.025em', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                Freample{(isPatron || user?.role === 'artisan' || isFondateur) && <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span>}
              </span>
            </div>
          )}
          <button
            onClick={() => setDark(d => !d)}
            aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)',
              marginLeft: collapsed ? 'auto' : 0,
            }}
            title={dark ? 'Mode clair' : 'Mode sombre'}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            {dark ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <IconMenu size={15} />
          </button>
        </div>

        {/* Search bar (patron, expanded only) */}
        {isPatron && !collapsed && (
          <div style={{ padding: '10px 8px 4px', flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', display: 'flex', pointerEvents: 'none' }}>
                <IconSearch size={13} />
              </span>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg)', border: '1px solid var(--border-light)',
                  borderRadius: 8, padding: '6px 10px 6px 28px',
                  fontSize: '0.8125rem', color: 'var(--text)', outline: 'none',
                  fontFamily: 'inherit', transition: 'var(--transition)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 8, right: 8,
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 10, boxShadow: 'var(--shadow-md)', zIndex: 50,
                overflow: 'hidden',
              }}>
                {searchResults.map(({ label, path, Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setSearch('')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 12px', color: 'var(--text)',
                      fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fondateur view switcher */}
        {isFondateur && !collapsed && (
          <div style={{ padding: '8px 8px 0', flexShrink: 0 }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '0 10px', marginBottom: 6 }}>
              Vue
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {FONDATEUR_VIEWS.map(v => {
                const active = location.pathname.startsWith(v.path.split('/').slice(0, 2).join('/'));
                return (
                  <Link
                    key={v.key}
                    to={v.path}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
                      fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
                      background: active ? 'var(--primary-light)' : 'transparent',
                      color: active ? 'var(--primary)' : 'var(--text-secondary)',
                      border: `1px solid ${active ? 'var(--primary)' : 'transparent'}`,
                      transition: 'var(--transition)',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{v.icon}</span>
                    {v.label}
                  </Link>
                );
              })}
            </div>
            <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 4px' }} />
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {(isPatron || (isFondateur && location.pathname.startsWith('/patron'))) ? (() => {
            let sectorMenu = isPatron && user?.secteur ? PATRON_SECTOR_MENUS[user.secteur] : null;
            const sectorHdr  = isPatron && user?.secteur ? PATRON_SECTOR_HEADERS[user.secteur] : null;

            // Freample Com: menu dynamique selon la vue monteur/gestion
            if (sectorMenu === 'dynamic') {
              const comVue = localStorage.getItem('com_vue') || 'monteur';
              sectorMenu = comVue === 'monteur' ? [
                { label: 'Ma journée',    path: '/patron/dashboard',                    Icon: IconHome     },
                { label: 'Mes projets',   path: '/patron/dashboard?onglet=projets',     Icon: IconMissions },
                { label: 'Agenda',        path: '/patron/dashboard?onglet=agenda',      Icon: IconCalendar },
                { label: 'Archives',      path: '/patron/dashboard?onglet=archives',    Icon: IconBox      },
                { label: 'Équipe',        path: '/patron/dashboard?onglet=equipe',      Icon: IconTeam     },
              ] : [
                { label: 'Accueil',        path: '/patron/dashboard',                    Icon: IconHome       },
                { label: 'Projets',        path: '/patron/dashboard?onglet=projets',     Icon: IconMissions   },
                { label: 'Archives',       path: '/patron/dashboard?onglet=archives',    Icon: IconBox        },
                { label: 'Devis',          path: '/patron/dashboard?onglet=devis',       Icon: IconDocument   },
                { label: 'Facturation',    path: '/patron/dashboard?onglet=factures',    Icon: IconCreditCard },
                { label: 'Paiements',      path: '/patron/dashboard?onglet=paiements',   Icon: IconFinance    },
                { label: 'Clients',        path: '/patron/dashboard?onglet=clients',     Icon: IconTeam       },
                { label: 'Tarifs',         path: '/patron/dashboard?onglet=tarifs',       Icon: IconFinance    },
                { label: 'Équipe',         path: '/patron/dashboard?onglet=equipe',      Icon: IconTeam       },
                { label: 'Rapports',       path: '/patron/dashboard?onglet=rapports',    Icon: IconStar       },
              ];
            }

            if (sectorMenu) {
              return (
                <>
                  {sectorHdr && !collapsed && (
                    <div style={{ margin:'0 4px 10px', padding:'8px 12px', borderRadius:10, background:sectorHdr.bg, border:`1px solid ${sectorHdr.color}30`, fontSize:'0.8125rem', fontWeight:700, color:sectorHdr.color }}>
                      {sectorHdr.label}
                    </div>
                  )}
                  {/* Toggle Monteur/Gestion pour Com */}
                  {user?.secteur === 'com' && !collapsed && (
                    <div style={{ margin:'0 4px 12px', display:'flex', background:'var(--bg-secondary)', borderRadius:8, padding:3 }}>
                      <button onClick={() => { localStorage.setItem('com_vue','monteur'); window.location.reload(); }}
                        style={{ flex:1, padding:'6px 0', borderRadius:6, border:'none', cursor:'pointer', fontWeight: (localStorage.getItem('com_vue')||'monteur')==='monteur'?700:500, background: (localStorage.getItem('com_vue')||'monteur')==='monteur'?'var(--primary)':'transparent', color: (localStorage.getItem('com_vue')||'monteur')==='monteur'?'#fff':'var(--text-secondary)', fontFamily:'inherit', fontSize:12 }}>
                        🎬 Monteur
                      </button>
                      <button onClick={() => { localStorage.setItem('com_vue','gestion'); window.location.reload(); }}
                        style={{ flex:1, padding:'6px 0', borderRadius:6, border:'none', cursor:'pointer', fontWeight: localStorage.getItem('com_vue')==='gestion'?700:500, background: localStorage.getItem('com_vue')==='gestion'?'var(--primary)':'transparent', color: localStorage.getItem('com_vue')==='gestion'?'#fff':'var(--text-secondary)', fontFamily:'inherit', fontSize:12 }}>
                        ⚙️ Gestion
                      </button>
                    </div>
                  )}
                  {sectorMenu.map(({ label, path, Icon }) => {
                    const active = location.pathname === path && path !== '/patron/dashboard' ? false : location.pathname === path;
                    const isDash = path === '/patron/dashboard';
                    const isActive = isDash ? location.pathname === '/patron/dashboard' : location.pathname === path;
                    return (
                      <Link key={label} to={path} className={`nav-item${isActive ? ' active' : ''}`}
                        style={{ padding: collapsed ? '8px' : '8px 12px', justifyContent: collapsed ? 'center' : 'flex-start', marginBottom:2, overflow:'hidden' }}
                        title={collapsed ? label : undefined}
                        onClick={isMobile ? () => setMobileOpen(false) : undefined}
                      >
                        <Icon size={17} />
                        {!collapsed && <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>}
                      </Link>
                    );
                  })}
                </>
              );
            }
            return PATRON_GROUPS.map(group => (
              <NavGroup key={group.id} group={group} collapsed={collapsed} location={location} onNavigate={isMobile ? () => setMobileOpen(false) : undefined} />
            ));
          })() : (
            <>
              {/* Sector header badge for client tabs */}
              {sectorHeader && !collapsed && (
                <div style={{
                  margin: '0 4px 10px',
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: sectorHeader.bg,
                  border: `1px solid ${sectorHeader.color}30`,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: sectorHeader.color,
                }}>
                  {sectorHeader.label}
                </div>
              )}
              {(isFondateur && location.pathname.startsWith('/client') ? CLIENT_TAB_MENUS.accueil :
                isFondateur && location.pathname.startsWith('/artisan') ? MENUS.artisan :
                menu
              ).map(({ label, path, Icon, isBack }) => {
                const active = !isBack && location.pathname === path;
                return (
                  <Link
                    key={label}
                    to={path}
                    className={`nav-item${active ? ' active' : ''}`}
                    style={{
                      padding: collapsed ? '8px' : '8px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      marginBottom: isBack ? 6 : 2,
                      overflow: 'hidden',
                      opacity: isBack ? 0.65 : 1,
                      borderBottom: isBack && !collapsed ? '1px solid var(--border-light)' : 'none',
                      paddingBottom: isBack && !collapsed ? 10 : undefined,
                    }}
                    title={collapsed ? label : undefined}
                    onClick={isMobile ? () => setMobileOpen(false) : undefined}
                  >
                    <Icon size={17} />
                    {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
                  </Link>
                );
              })}</>
          )
          }
        </nav>

        {/* User profile */}
        <div style={{
          borderTop: '1px solid var(--border-light)',
          padding: collapsed ? '12px 8px' : '12px',
          flexShrink: 0,
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px', background: 'var(--primary-light)', borderRadius: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: '#fff', letterSpacing: '-0.01em', boxShadow: '0 2px 8px var(--primary-glow)' }}>{initials}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.015em' }}>
                  {user?.nom}
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {getRoleLabel(user)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', padding: 4, borderRadius: 6,
                  display: 'flex', alignItems: 'center',
                  transition: 'var(--transition)', flexShrink: 0,
                }}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                <IconLogout size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', padding: 8, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', transition: 'var(--transition)',
              }}
              title="Se déconnecter"
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <IconLogout size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: isMobile ? '0 12px' : '0 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--card)', flexShrink: 0, gap: 6, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: 32, minHeight: 32, justifyContent: 'center' }}
            >
              <IconMenu size={18} />
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, padding: '6px 8px', borderRadius: 8, transition: 'var(--transition)', flexShrink: 0, minHeight: 32 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {!isMobile && <span className="topbar-back-text">Retour</span>}
          </button>
          {!isMobile && (
            <span className="topbar-breadcrumb" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location.pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' › ')}
            </span>
          )}
          {isMobile && <span style={{ flex: 1 }} />}
          <NotifBell isMobile={isMobile} />
        </div>
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px 80px' : '28px 32px' }}>
          {children}
        </main>
        {/* Mobile bottom nav */}
        {isMobile && (
          <nav style={{
            display: 'flex',
            background: 'var(--card)',
            borderTop: '1px solid var(--border-light)',
            padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
            flexShrink: 0,
            zIndex: 30,
          }}>
            {(isPatron ? [
              { label: 'Accueil',    path: '/patron/dashboard', Icon: IconHome      },
              { label: 'Missions',   path: '/patron/missions',  Icon: IconBuilding  },
              { label: 'Finance',    path: '/patron/finance',   Icon: IconFinance   },
              { label: 'RH',         path: '/patron/rh',        Icon: IconTeam      },
              { label: 'Plus',       path: null,                Icon: IconMenu, action: () => setMobileOpen(true) },
            ] : menu.slice(0, 5)).map(({ label, path, Icon, action }) => {
              const active = path && (location.pathname === path || location.pathname.startsWith(path + '/'));
              return (
                <button
                  key={label}
                  onClick={() => action ? action() : path && navigate(path)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 3, padding: '6px 4px', background: 'none', border: 'none',
                    cursor: 'pointer', color: active ? 'var(--primary)' : 'var(--text-tertiary)',
                    fontSize: '0.625rem', fontWeight: active ? 600 : 400,
                    transition: 'color 0.15s',
                  }}
                >
                  <Icon size={active ? 20 : 18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
