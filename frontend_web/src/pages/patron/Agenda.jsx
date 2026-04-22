import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../services/api';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';

/* ── Helpers ───────────────────────────────────────────── */
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function ymd(date) {
  return date.toISOString().slice(0, 10);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(s) { return s || ''; }
function dayKey(d) { return ymd(typeof d === 'string' ? new Date(d) : d); }
function fromNow(s) {
  const diff = Math.round((new Date(s) - TODAY) / 86400000);
  if (diff < 0) return `il y a ${-diff}j`;
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return 'demain';
  return `dans ${diff}j`;
}

/* ── Event types ───────────────────────────────────────── */
const TYPES = {
  rdv:      { label: 'RDV',          color: '#5B5BD6', bg: '#EBF5FF',  dot: '#5B5BD6' },
  chantier: { label: 'Chantier',     color: '#34C759', bg: '#ECFDF5',  dot: '#34C759' },
  echeance: { label: 'Échéance',     color: '#FF9500', bg: '#FFFBEB',  dot: '#FF9500' },
  ct:       { label: 'CT Véhicule',  color: '#FF3B30', bg: '#FFF1F0',  dot: '#FF3B30' },
  autre:    { label: 'Autre',        color: '#636363', bg: '#F2F2F7',  dot: '#636363' },
};

/* ── Demo events ───────────────────────────────────────── */
function rel(n) { return ymd(addDays(TODAY, n)); }

const DEMO_EVENTS = [
  { id: 'e1',  type: 'rdv',      date: rel(1),   title: 'RDV Mme Dupont — cuisine', heure: '09:30', salarie: 'Pierre M.', lieu: '12 rue de la Liberté, Marseille' },
  { id: 'e2',  type: 'rdv',      date: rel(2),   title: 'RDV M. Rousseau — devis SDB', heure: '14:00', salarie: 'Sophie D.', lieu: '24 rue Paradis, Marseille' },
  { id: 'e3',  type: 'chantier', date: rel(0),   title: 'Chantier Dupont — rénovation cuisine', heureFin: rel(14) },
  { id: 'e4',  type: 'chantier', date: rel(5),   title: 'Syndic Voltaire — peinture parties communes', heureFin: rel(12) },
  { id: 'e5',  type: 'echeance', date: rel(3),   title: 'Déclaration URSSAF T1 2026' },
  { id: 'e6',  type: 'echeance', date: rel(10),  title: 'Paiement charges sociales — avril' },
  { id: 'e7',  type: 'ct',       date: rel(7),   title: 'CT à renouveler — Renault Trafic AB-123-CD', vehicule: 'Renault Trafic AB-123-CD' },
  { id: 'e8',  type: 'rdv',      date: rel(8),   title: 'RDV M. Leblanc — extension garage', heure: '10:00', salarie: 'Pierre M.' },
  { id: 'e9',  type: 'echeance', date: rel(30),  title: 'TVA mensuelle — déclaration' },
  { id: 'e10', type: 'rdv',      date: rel(0),   title: 'Visite chantier Copropriété Les Oliviers', heure: '16:00', salarie: 'Claire B.' },
  { id: 'e11', type: 'chantier', date: rel(-5),  title: 'Chantier Rousseau — SDB terminé', heureFin: rel(-2) },
];

const SALARIES = ['Pierre M.', 'Sophie D.', 'Lucas G.', 'Luc M.', 'Claire B.'];
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const HORAIRES_PAR_SECTEUR = {
  btp:        { debut: '07:30', fin: '17:30', joursTravail: [0,1,2,3,4]    }, // Lun-Ven standard
  btp_ete:    { debut: '06:30', fin: '16:00', joursTravail: [0,1,2,3,4]    }, // Été (chaleur)
  btp_hiver:  { debut: '08:00', fin: '17:00', joursTravail: [0,1,2,3,4]    }, // Hiver (luminosité)
  btp_samedi: { debut: '07:30', fin: '17:30', joursTravail: [0,1,2,3,4,5]  }, // Lun-Sam
  astreinte:  { debut: '07:00', fin: '19:00', joursTravail: [0,1,2,3,4,5,6] }, // 7j/7 urgences
  default:    { debut: '07:30', fin: '17:30', joursTravail: [0,1,2,3,4]    },
};
const JOURS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const FORM_VIDE = { type: 'rdv', title: '', heure: '', salarie: '', lieu: '', note: '', date: '' };

/* ── Event chip ────────────────────────────────────────── */
function EventChip({ event, onClick, mini }) {
  const t = TYPES[event.type];
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(event); }}
      style={{
        background: t.bg, color: t.color,
        borderLeft: `3px solid ${t.dot}`,
        borderRadius: mini ? 4 : 6,
        padding: mini ? '1px 5px' : '3px 8px',
        fontSize: mini ? '0.65rem' : '0.75rem',
        fontWeight: 500, cursor: 'pointer',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        marginBottom: 2, transition: 'opacity 0.1s',
        lineHeight: 1.4,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      title={event.title}
    >
      {event.heure && <span style={{ opacity: 0.7 }}>{event.heure} </span>}
      {event.title}
    </div>
  );
}

/* ── Demo banner ───────────────────────────────────────── */
function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF3E0', border: '1px solid #FF9500', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
      <span>⚠️</span>
      <span style={{ fontSize: '0.8125rem', color: '#7A4900', fontWeight: 500, flex: 1 }}>
        Données de démonstration — connectez votre backend pour synchroniser votre agenda.
      </span>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF9500', fontWeight: 700, fontSize: '0.875rem' }}>✕</button>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────── */
export default function Agenda() {
  const { token, user } = useAuth();
  const isDemo = _isDemo();
  const [view, setView] = useState('month'); // 'month' | 'week'
  const [cursor, setCursor] = useState(new Date(TODAY));
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addingDate, setAddingDate] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [addSubmitted, setAddSubmitted] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showHoraires, setShowHoraires] = useState(false);

  // Horaires de travail — initialisés selon le secteur de l'utilisateur
  const secteur = user?.secteur || 'default';
  const defaultH = HORAIRES_PAR_SECTEUR[secteur] || HORAIRES_PAR_SECTEUR.default;
  const [horaires, setHoraires] = useState(() => {
    try {
      const saved = localStorage.getItem('agenda_horaires');
      return saved ? JSON.parse(saved) : defaultH;
    } catch { return defaultH; }
  });

  function saveHoraires(h) {
    setHoraires(h);
    try { localStorage.setItem('agenda_horaires', JSON.stringify(h)); } catch {}
  }

  function resetHoraires() {
    saveHoraires(defaultH);
  }

  /* Load agenda events from API, then merge real chantiers/missions */
  useEffect(() => {
    const API_BASE = API_URL;
    const headers = { Authorization: `Bearer ${token}` };

    // Load custom agenda events first
    // Charger les events : d'abord API, sinon localStorage, sinon démo
    if (isDemo) {
      try {
        const stored = demoGet('freample_agenda_events', []);
        setEvents(stored.length ? stored : DEMO_EVENTS);
        if (!stored.length) demoSet('freample_agenda_events', DEMO_EVENTS);
      } catch { setEvents(DEMO_EVENTS); }
    } else {
      api.get('/patron/agenda')
        .then(({ data }) => { setEvents(data.events || []); })
        .catch(() => { setEvents([]); });
    }

    // Then merge chantiers/missions as readonly events
    Promise.all([
      fetch(`${API_BASE}/patron/missions`, { headers }).then(r => r.ok ? r.json() : {}),
      fetch(`${API_BASE}/patron/chantiers`, { headers }).then(r => r.ok ? r.json() : {}),
    ]).then(([dm, dc]) => {
      const missions  = dm.missions  || [];
      const chantiers = dc.chantiers || [];
      const chantierEvents = [...missions, ...chantiers]
        .filter(c => c.dateDebut)
        .map(c => ({
          id: `chantier-${c.id}`,
          type: 'chantier',
          date: c.dateDebut,
          dateFin: c.dateFin || null,
          title: c.titre || c.nom || 'Chantier',
          lieu: c.adresse || '',
          client: c.client?.nom || c.client || '',
          readonly: true,          // cannot be deleted from agenda
        }));
      if (chantierEvents.length > 0) {
        // Replace demo chantier events with real ones, keep other events
        setEvents(prev => [
          ...prev.filter(e => e.type !== 'chantier'),
          ...chantierEvents,
        ]);
      }
    }).catch(() => {}); // Fail silently — demo events remain
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* filtered events */
  const visibleEvents = useMemo(() =>
    filterType === 'all' ? events : events.filter(e => e.type === filterType),
    [events, filterType]
  );

  /* map date → events */
  const eventsByDay = useMemo(() => {
    const map = {};
    visibleEvents.forEach(ev => {
      const k = dayKey(ev.date);
      if (!map[k]) map[k] = [];
      map[k].push(ev);
    });
    return map;
  }, [visibleEvents]);

  /* ── Month grid ── */
  function buildMonthGrid() {
    const first = startOfMonth(cursor);
    const totalDays = daysInMonth(cursor);
    // day of week for first day (Mon=0 … Sun=6)
    let startDow = first.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  /* ── Week grid ── */
  function buildWeekDays() {
    const mon = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
  }

  /* ── Add event ── */
  function openAdd(date) {
    setAddingDate(date);
    setForm({ ...FORM_VIDE, date: ymd(date), heure: horaires.debut });
    setSelectedEvent(null);
    setAddSubmitted(false);
  }
  async function handleAdd(e) {
    e.preventDefault();
    setAddSubmitted(true);
    if (!form.title.trim() || !form.date) return;
    const payload = {
      type: form.type,
      date: form.date,
      title: form.title,
      heure: form.heure || undefined,
      salarie: form.salarie || undefined,
      lieu: form.lieu || undefined,
      note: form.note || undefined,
    };
    try {
      const { data } = await api.post('/patron/agenda', payload);
      setEvents(prev => [...prev, data.event || { id: 'ev-' + Date.now(), ...payload }]);
    } catch {
      // Fallback : ajouter localement si l'API échoue
      setEvents(prev => [...prev, { id: 'ev-' + Date.now(), ...payload }]);
    }
    setAddingDate(null);
    setAddSubmitted(false);
    setForm(FORM_VIDE);
  }
  async function handleDelete(id) {
    try {
      await api.delete(`/patron/agenda/${id}`);
    } catch {
      // Fail silently — suppression locale quand même
    }
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  }

  /* ── Upcoming list ── */
  const upcoming = useMemo(() =>
    visibleEvents
      .filter(e => new Date(e.date) >= addDays(TODAY, -1))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8),
    [visibleEvents]
  );

  /* ── Navigate ── */
  function prev() { setCursor(c => view === 'month' ? addMonths(c, -1) : addDays(startOfWeek(c), -7)); }
  function next() { setCursor(c => view === 'month' ? addMonths(c, 1)  : addDays(startOfWeek(c),  7)); }
  function goToday() { setCursor(new Date(TODAY)); }

  const monthCells = view === 'month' ? buildMonthGrid() : null;
  const weekDays   = view === 'week'  ? buildWeekDays()  : null;

  const title = view === 'month'
    ? `${MOIS[cursor.getMonth()]} ${cursor.getFullYear()}`
    : (() => {
        const mon = startOfWeek(cursor);
        const sun = addDays(mon, 6);
        return `${mon.getDate()} – ${sun.getDate()} ${MOIS[sun.getMonth()]} ${sun.getFullYear()}`;
      })();

  /* ── Render ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <DemoBanner />
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Main calendar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Agenda</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: '0.875rem' }}>RDV, chantiers, échéances et contrôles techniques</p>
              <button
                onClick={() => setShowHoraires(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                title="Configurer les horaires de travail"
              >
                🕐 {horaires.debut} – {horaires.fin}
              </button>
            </div>
          </div>
          <button className="btn-primary" onClick={() => openAdd(TODAY)}>+ Ajouter un événement</button>
        </div>

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', ...Object.keys(TYPES)].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500,
                border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                background: filterType === t
                  ? (t === 'all' ? 'var(--text)' : TYPES[t].dot)
                  : 'var(--card)',
                color: filterType === t ? '#fff' : 'var(--text-secondary)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              {t === 'all' ? 'Tous' : TYPES[t].label}
            </button>
          ))}
        </div>

        {/* Calendar nav */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8125rem' }} onClick={prev}>‹</button>
              <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8125rem' }} onClick={goToday}>Aujourd'hui</button>
              <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8125rem' }} onClick={next}>›</button>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{title}</span>
            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 8, padding: 3, gap: 2 }}>
              {['month', 'week'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem', fontWeight: 500, transition: 'var(--transition)',
                  background: view === v ? 'var(--card)' : 'transparent',
                  color: view === v ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: view === v ? 'var(--shadow)' : 'none',
                }}>
                  {v === 'month' ? 'Mois' : 'Semaine'}
                </button>
              ))}
            </div>
          </div>

          {/* Day names header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-light)' }}>
            {JOURS.map(j => (
              <div key={j} style={{ padding: '8px 0', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {j}
              </div>
            ))}
          </div>

          {/* Month view */}
          {view === 'month' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {monthCells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} style={{ minHeight: 90, borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', background: 'var(--bg)', opacity: 0.3 }} />;
                const k = ymd(day);
                const isToday = k === ymd(TODAY);
                const dayEvs = eventsByDay[k] || [];
                const col = (i % 7) + 1;
                return (
                  <div
                    key={k}
                    onClick={() => openAdd(day)}
                    style={{
                      minHeight: 90, padding: '6px 6px 4px',
                      borderRight: col < 7 ? '1px solid var(--border-light)' : 'none',
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer', transition: 'background 0.1s',
                      background: isToday ? 'rgba(0,122,255,0.04)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'rgba(0,122,255,0.04)' : 'transparent'; }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 4,
                      background: isToday ? 'var(--primary)' : 'transparent',
                      color: isToday ? '#fff' : 'var(--text)',
                      fontSize: '0.8125rem', fontWeight: isToday ? 700 : 500,
                    }}>{day.getDate()}</div>
                    {dayEvs.slice(0, 3).map(ev => (
                      <EventChip key={ev.id} event={ev} onClick={setSelectedEvent} mini />
                    ))}
                    {dayEvs.length > 3 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', paddingLeft: 4 }}>+{dayEvs.length - 3} autres</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Week view */}
          {view === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weekDays.map((day, i) => {
                const k = ymd(day);
                const isToday = k === ymd(TODAY);
                const dayEvs = eventsByDay[k] || [];
                return (
                  <div
                    key={k}
                    onClick={() => openAdd(day)}
                    style={{
                      minHeight: 200, padding: '8px 8px 6px',
                      borderRight: i < 6 ? '1px solid var(--border-light)' : 'none',
                      cursor: 'pointer', transition: 'background 0.1s',
                      background: isToday ? 'rgba(0,122,255,0.04)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'rgba(0,122,255,0.04)' : 'transparent'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {JOURS[i]}
                      </span>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isToday ? 'var(--primary)' : 'transparent',
                        color: isToday ? '#fff' : 'var(--text)',
                        fontSize: '0.9375rem', fontWeight: isToday ? 700 : 600, marginTop: 2,
                      }}>{day.getDate()}</div>
                    </div>
                    {dayEvs.map(ev => (
                      <EventChip key={ev.id} event={ev} onClick={setSelectedEvent} />
                    ))}
                    {dayEvs.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--border)', fontSize: '1.25rem', marginTop: 20 }}>+</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right column */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Upcoming */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>À venir</p>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {upcoming.length === 0 && (
              <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Aucun événement</p>
            )}
            {upcoming.map(ev => {
              const t = TYPES[ev.type];
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 3, borderRadius: 2, background: t.dot, alignSelf: 'stretch', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {fmtDate(ev.date)}{ev.heure ? ` · ${ev.heure}` : ''} · {fromNow(ev.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)', marginBottom: 10 }}>Légende</p>
          {Object.entries(TYPES).map(([k, t]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{t.label}</span>
            </div>
          ))}
        </div>

        {/* Horaires */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)' }}>Horaires de travail</p>
            <button onClick={() => setShowHoraires(true)} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              Modifier
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Ouverture</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>{horaires.debut}</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Fermeture</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>{horaires.fin}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {JOURS_LABELS.map((j, i) => {
              const actif = horaires.joursTravail.includes(i);
              return (
                <span key={j} style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 600, background: actif ? 'var(--primary)' : 'var(--bg)', color: actif ? '#fff' : 'var(--text-tertiary)' }}>
                  {j}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event detail panel */}
      {selectedEvent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 150,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.35)',
        }} onClick={() => setSelectedEvent(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)', borderRadius: 16, padding: 28,
              width: 380, boxShadow: 'var(--shadow-md)',
              animation: 'scaleIn 0.15s ease-out',
            }}
          >
            {(() => {
              const t = TYPES[selectedEvent.type];
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <span style={{ background: t.bg, color: t.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{t.label}</span>
                    <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
                  </div>
                  <h3 style={{ marginBottom: 16, lineHeight: 1.3 }}>{selectedEvent.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Date',       value: fmtDate(selectedEvent.date) + (selectedEvent.heure ? ` à ${selectedEvent.heure}` : '') },
                      selectedEvent.salarie && { label: 'Salarié',  value: selectedEvent.salarie },
                      selectedEvent.lieu    && { label: 'Lieu',     value: selectedEvent.lieu },
                      selectedEvent.vehicule && { label: 'Véhicule', value: selectedEvent.vehicule },
                      selectedEvent.note    && { label: 'Note',     value: selectedEvent.note },
                    ].filter(Boolean).map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 64, paddingTop: 1 }}>{label}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text)', flex: 1 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                    {selectedEvent.readonly ? (
                      <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        🔒 Chantier synchronisé — modifiable dans Missions & Chantiers
                      </div>
                    ) : (
                      <button
                        className="btn-danger"
                        style={{ flex: 1, fontSize: '0.8125rem' }}
                        onClick={() => handleDelete(selectedEvent.id)}
                      >
                        Supprimer
                      </button>
                    )}
                    <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8125rem' }} onClick={() => setSelectedEvent(null)}>
                      Fermer
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add event modal */}
      {addingDate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 150,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
        }} onClick={() => setAddingDate(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)', borderRadius: 16, padding: 28,
              width: 420, boxShadow: 'var(--shadow-md)',
              animation: 'scaleIn 0.15s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Nouvel événement</h3>
              <button onClick={() => setAddingDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleAdd} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div>
                  <label className="label">Type</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {Object.entries(TYPES).map(([k, t]) => (
                      <button
                        key={k} type="button"
                        onClick={() => setForm(f => ({ ...f, type: k }))}
                        style={{
                          padding: '5px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500,
                          border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                          background: form.type === k ? t.dot : 'var(--bg)',
                          color: form.type === k ? '#fff' : 'var(--text-secondary)',
                        }}
                      >{t.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Titre *</label>
                  <input
                    className="input" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Description de l'événement"
                    style={addSubmitted && !form.title.trim() ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(255,59,48,0.12)' } : {}}
                  />
                  {addSubmitted && !form.title.trim() && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>Ce champ est requis</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label">Date *</label>
                    <input
                      className="input" type="date" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      style={addSubmitted && !form.date ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(255,59,48,0.12)' } : {}}
                    />
                    {addSubmitted && !form.date && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>Requis</p>}
                  </div>
                  <div>
                    <label className="label">Heure</label>
                    <input className="input" type="time" value={form.heure} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))} />
                  </div>
                </div>
                {form.type === 'rdv' && (
                  <>
                    <div>
                      <label className="label">Salarié assigné</label>
                      <select className="select" value={form.salarie} onChange={e => setForm(f => ({ ...f, salarie: e.target.value }))}>
                        <option value="">— Aucun —</option>
                        {SALARIES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Lieu / Adresse</label>
                      <input className="input" value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} placeholder="Adresse du RDV" />
                    </div>
                  </>
                )}
                <div>
                  <label className="label">Note</label>
                  <textarea className="input" rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Informations complémentaires..." style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Ajouter</button>
                  <button type="button" className="btn-secondary" onClick={() => { setAddingDate(null); setAddSubmitted(false); }}>Annuler</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    {/* ── Horaires modal ── */}
    {showHoraires && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}
        onClick={() => setShowHoraires(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', borderRadius: 16, padding: 28, width: 400, boxShadow: 'var(--shadow-md)', animation: 'scaleIn 0.15s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Horaires de travail</h3>
            <button onClick={() => setShowHoraires(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
          </div>

          {/* Secteur presets */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Préréglages horaires BTP</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries({
                btp:        '🏗️ Standard',
                btp_ete:    '☀️ Été',
                btp_hiver:  '❄️ Hiver',
                btp_samedi: '📅 Lun-Sam',
                astreinte:  '🚨 Astreinte 7j/7',
              }).map(([s, label]) => (
                <button key={s} type="button"
                  onClick={() => setHoraires(HORAIRES_PAR_SECTEUR[s])}
                  style={{ padding: '5px 11px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)', background: secteur === s ? 'var(--primary)' : 'var(--bg)', color: secteur === s ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all .12s' }}
                  onMouseEnter={e => { if (secteur !== s) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}}
                  onMouseLeave={e => { if (secteur !== s) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                >
                  {label} ({HORAIRES_PAR_SECTEUR[s].debut}–{HORAIRES_PAR_SECTEUR[s].fin})
                </button>
              ))}
            </div>
          </div>

          {/* Time inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="label">Heure d'ouverture</label>
              <input className="input" type="time" value={horaires.debut}
                onChange={e => setHoraires(h => ({ ...h, debut: e.target.value }))} />
            </div>
            <div>
              <label className="label">Heure de fermeture</label>
              <input className="input" type="time" value={horaires.fin}
                onChange={e => setHoraires(h => ({ ...h, fin: e.target.value }))} />
            </div>
          </div>

          {/* Day toggles */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Jours de travail</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {JOURS_LABELS.map((j, i) => {
                const actif = horaires.joursTravail.includes(i);
                return (
                  <button key={j} type="button"
                    onClick={() => setHoraires(h => ({
                      ...h,
                      joursTravail: actif
                        ? h.joursTravail.filter(d => d !== i)
                        : [...h.joursTravail, i].sort(),
                    }))}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, border: `1.5px solid ${actif ? 'var(--primary)' : 'var(--border)'}`, background: actif ? 'var(--primary)' : 'var(--bg)', color: actif ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all .12s' }}
                  >{j}</button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => { saveHoraires(horaires); setShowHoraires(false); }}>Enregistrer</button>
            <button className="btn-secondary" onClick={resetHoraires}>Réinitialiser</button>
            <button className="btn-secondary" onClick={() => setShowHoraires(false)}>Annuler</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
