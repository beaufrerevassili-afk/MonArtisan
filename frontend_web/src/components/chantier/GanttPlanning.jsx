import React, { useState, useMemo } from 'react';

const PHASES_DEFAUT = [
  { id: 'preparation', label: 'Préparation', pct: 10, color: '#6B7280' },
  { id: 'gros_oeuvre', label: 'Gros oeuvre', pct: 30, color: '#D97706' },
  { id: 'second_oeuvre', label: 'Second oeuvre', pct: 30, color: '#2563EB' },
  { id: 'finitions', label: 'Finitions', pct: 20, color: '#16A34A' },
  { id: 'reception', label: 'Réception', pct: 10, color: '#A68B4B' },
];

const STATUT_COLORS = {
  en_cours: '#16A34A', planifie: '#2563EB', en_attente: '#D97706',
  en_attente_acompte: '#D97706', terminee: '#6B7280', annulee: '#DC2626',
};

function daysBetween(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function genPhases(chantier) {
  if (chantier.phases?.length) return chantier.phases;
  const debut = chantier.dateDebut;
  const fin = chantier.dateFin;
  if (!debut) return [];
  const totalJours = fin ? daysBetween(debut, fin) : 30;
  let cursor = debut;
  return PHASES_DEFAUT.map(p => {
    const jours = Math.max(1, Math.round(totalJours * p.pct / 100));
    const phaseDebut = cursor;
    const phaseFin = addDays(cursor, jours);
    cursor = phaseFin;
    return { ...p, dateDebut: phaseDebut, dateFin: phaseFin, jours };
  });
}

export default function GanttPlanning({ items = [], employes = [], onOpenDetail }) {
  const [zoom, setZoom] = useState('mois'); // 'mois' | 'trimestre'
  const [filterEmploye, setFilterEmploye] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  // Filtrer chantiers actifs (pas annulés, pas terminés sauf récents)
  const chantiers = useMemo(() => {
    let list = items.filter(c => c.statut !== 'annulee' && c.dateDebut);
    if (filterEmploye) {
      list = list.filter(c => (c.equipe || []).some(e =>
        e.toLowerCase().includes(filterEmploye.toLowerCase())
      ));
    }
    return list.sort((a, b) => (a.dateDebut || '').localeCompare(b.dateDebut || ''));
  }, [items, filterEmploye]);

  // Calculer la plage de dates visible
  const { startDate, endDate, totalDays, weeks } = useMemo(() => {
    if (chantiers.length === 0) {
      const s = today;
      const e = addDays(today, 90);
      return { startDate: s, endDate: e, totalDays: 90, weeks: genWeeks(s, e) };
    }
    const dates = chantiers.flatMap(c => [c.dateDebut, c.dateFin || addDays(c.dateDebut, 30)]);
    let earliest = dates.reduce((a, b) => a < b ? a : b);
    let latest = dates.reduce((a, b) => a > b ? a : b);
    // Padding 7 jours avant/après
    earliest = addDays(earliest, -7);
    latest = addDays(latest, 14);
    // Minimum 60 jours
    const days = Math.max(60, daysBetween(earliest, latest));
    latest = addDays(earliest, days);
    return { startDate: earliest, endDate: latest, totalDays: days, weeks: genWeeks(earliest, latest) };
  }, [chantiers, today]);

  // Pointages du jour
  const pointages = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('freample_pointages') || '[]'); } catch { return []; }
  }, []);
  const todayPointages = pointages.filter(p => p.date === today && p.type === 'arrivee');

  // Factures par chantier
  const factures = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('freample_factures') || '[]'); } catch { return []; }
  }, []);

  // Conflits d'équipe (même personne sur 2 chantiers qui se chevauchent)
  const conflits = useMemo(() => {
    const map = {};
    chantiers.forEach(c => {
      (c.equipe || []).forEach(nom => {
        if (!map[nom]) map[nom] = [];
        map[nom].push({ id: c.id, debut: c.dateDebut, fin: c.dateFin || addDays(c.dateDebut, 30) });
      });
    });
    const result = [];
    Object.entries(map).forEach(([nom, assignments]) => {
      for (let i = 0; i < assignments.length; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
          const a = assignments[i], b = assignments[j];
          if (a.debut <= b.fin && b.debut <= a.fin) {
            result.push({ nom, chantier1: a.id, chantier2: b.id });
          }
        }
      }
    });
    return result;
  }, [chantiers]);

  // KPIs
  const enCours = chantiers.filter(c => c.statut === 'en_cours').length;
  const enRetard = chantiers.filter(c => {
    if (!c.dateFin || c.statut === 'terminee') return false;
    return c.dateFin < today && c.statut !== 'terminee';
  }).length;
  const terminesCeMois = chantiers.filter(c => c.statut === 'terminee' && (c.dateFin || '').startsWith(today.slice(0, 7))).length;

  // Position d'un jour sur la timeline (en %)
  function dayPos(dateStr) {
    const d = daysBetween(startDate, dateStr);
    return Math.max(0, Math.min(100, (d / totalDays) * 100));
  }

  function barStyle(debut, fin, color, avancement = 0) {
    const left = dayPos(debut);
    const width = Math.max(1, dayPos(fin) - left);
    return {
      position: 'absolute', left: `${left}%`, width: `${width}%`,
      height: 28, borderRadius: 6, background: color + '30',
      border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center',
      overflow: 'hidden', cursor: 'pointer', transition: 'all .15s',
    };
  }

  const todayPos = dayPos(today);

  // Noms uniques des employés pour le filtre
  const employeNames = [...new Set(items.flatMap(c => c.equipe || []))];

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ padding: '10px 16px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #16A34A40' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#16A34A' }}>{enCours}</span>
          <span style={{ fontSize: 12, color: '#555', marginLeft: 6 }}>en cours</span>
        </div>
        {enRetard > 0 && (
          <div style={{ padding: '10px 16px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #DC262640' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#DC2626' }}>{enRetard}</span>
            <span style={{ fontSize: 12, color: '#555', marginLeft: 6 }}>en retard</span>
          </div>
        )}
        <div style={{ padding: '10px 16px', background: '#F8F7F4', borderRadius: 10, border: '1px solid #E8E6E1' }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{terminesCeMois}</span>
          <span style={{ fontSize: 12, color: '#555', marginLeft: 6 }}>terminés ce mois</span>
        </div>
        {conflits.length > 0 && (
          <div style={{ padding: '10px 16px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #D97706' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#D97706' }}>{conflits.length}</span>
            <span style={{ fontSize: 12, color: '#555', marginLeft: 6 }}>conflit{conflits.length > 1 ? 's' : ''} d'équipe</span>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setZoom('mois')} style={zoomBtn(zoom === 'mois')}>Mois</button>
          <button onClick={() => setZoom('trimestre')} style={zoomBtn(zoom === 'trimestre')}>Trimestre</button>
        </div>
        {employeNames.length > 0 && (
          <select value={filterEmploye} onChange={e => setFilterEmploye(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff' }}>
            <option value="">Tous les salariés</option>
            {employeNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
        <span style={{ fontSize: 11, color: '#6E6E73', marginLeft: 'auto' }}>
          {chantiers.length} chantier{chantiers.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Gantt chart */}
      <div style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, overflow: 'hidden' }}>
        {/* Header timeline */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E8E6E1', position: 'relative' }}>
          <div style={{ width: 180, minWidth: 180, padding: '10px 14px', background: '#FAFAF8', borderRight: '1px solid #E8E6E1', fontSize: 11, fontWeight: 700, color: '#6E6E73' }}>
            CHANTIER
          </div>
          <div style={{ flex: 1, position: 'relative', overflowX: 'auto' }}>
            <div style={{ display: 'flex', minWidth: zoom === 'mois' ? 800 : 500 }}>
              {weeks.map((w, i) => (
                <div key={i} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#6E6E73', borderRight: '1px solid #F2F1ED', background: w.isCurrentWeek ? '#FFFBEB' : 'transparent' }}>
                  {w.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        {chantiers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6E6E73' }}>
            Aucun chantier avec des dates. Ajoutez des dates de début et fin à vos chantiers pour voir le planning.
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          {chantiers.map(c => {
            const phases = genPhases(c);
            const color = STATUT_COLORS[c.statut] || '#6B7280';
            const isRetard = c.dateFin && c.dateFin < today && c.statut !== 'terminee';
            const presentsAujourdui = todayPointages.filter(p => p.chantierId === c.id).map(p => p.salarie || 'Ouvrier');
            const factureChantier = factures.find(f => f.chantierId === c.id || f.devisId === c.devisId);
            const paiementStatut = factureChantier ? (factureChantier.statut === 'sequestre' || factureChantier.statut === 'payee' ? 'ok' : 'attente') : null;
            const hasConflict = conflits.some(cf => cf.chantier1 === c.id || cf.chantier2 === c.id);

            return (
              <div key={c.id} style={{ display: 'flex', borderBottom: '1px solid #F2F1ED', minHeight: 56, background: isRetard ? '#FEF2F208' : 'transparent' }}>
                {/* Label chantier */}
                <div onClick={() => onOpenDetail?.(c.id)}
                  style={{ width: 180, minWidth: 180, padding: '8px 14px', borderRight: '1px solid #E8E6E1', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.titre || c.metier || 'Chantier'}</span>
                    {isRetard && <span style={{ fontSize: 9, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '1px 5px', borderRadius: 4, flexShrink: 0 }}>RETARD</span>}
                    {hasConflict && <span title="Conflit d'équipe" style={{ fontSize: 9, color: '#D97706', flexShrink: 0 }}>⚠</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#6E6E73', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span>{c.client || ''}</span>
                    {c.avancement != null && <span style={{ fontWeight: 600, color }}>{c.avancement}%</span>}
                    {paiementStatut === 'ok' && <span style={{ color: '#16A34A', fontSize: 9 }}>$ OK</span>}
                    {paiementStatut === 'attente' && <span style={{ color: '#D97706', fontSize: 9 }}>$ En attente</span>}
                  </div>
                  {/* Équipe */}
                  {(c.equipe || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                      {(c.equipe || []).slice(0, 4).map((e, i) => {
                        const isPresent = presentsAujourdui.some(p => p.toLowerCase().includes(e.toLowerCase()));
                        return (
                          <span key={i} title={e + (isPresent ? ' (sur site)' : '')}
                            style={{ width: 18, height: 18, borderRadius: '50%', background: isPresent ? '#16A34A' : '#E8E6E1', color: isPresent ? '#fff' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, border: isPresent ? '2px solid #16A34A' : '1px solid #D1D5DB' }}>
                            {e.charAt(0)}
                          </span>
                        );
                      })}
                      {(c.equipe || []).length > 4 && <span style={{ fontSize: 9, color: '#6E6E73', alignSelf: 'center' }}>+{c.equipe.length - 4}</span>}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div style={{ flex: 1, position: 'relative', minWidth: zoom === 'mois' ? 800 : 500, padding: '4px 0' }}>
                  {/* Ligne aujourd'hui */}
                  <div style={{ position: 'absolute', left: `${todayPos}%`, top: 0, bottom: 0, width: 2, background: '#DC2626', zIndex: 10, opacity: 0.6 }} />

                  {/* Barre principale */}
                  <div onClick={() => onOpenDetail?.(c.id)} style={{ ...barStyle(c.dateDebut, c.dateFin || addDays(c.dateDebut, 30), color, c.avancement), top: 4 }}>
                    {/* Remplissage avancement */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${c.avancement || 0}%`, background: color + '50', borderRadius: '5px 0 0 5px' }} />
                    <span style={{ position: 'relative', zIndex: 1, fontSize: 10, fontWeight: 700, color: '#1A1A1A', paddingLeft: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.titre || c.metier} — {c.avancement || 0}%
                    </span>
                  </div>

                  {/* Sous-barres phases */}
                  {phases.length > 0 && (
                    <div style={{ position: 'relative', top: 6, height: 12 }}>
                      {phases.map(p => {
                        const left = dayPos(p.dateDebut);
                        const width = Math.max(0.5, dayPos(p.dateFin) - left);
                        return (
                          <div key={p.id} title={`${p.label} (${p.dateDebut} → ${p.dateFin})`}
                            style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: 10, borderRadius: 3, background: p.color + '60', border: `1px solid ${p.color}40` }} />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div style={{ padding: '10px 14px', background: '#FAFAF8', borderTop: '1px solid #E8E6E1', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6E6E73' }}>PHASES :</span>
          {PHASES_DEFAUT.map(p => (
            <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#555' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: p.color + '60', border: `1px solid ${p.color}` }} />
              {p.label}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#DC2626' }}>
            <span style={{ width: 2, height: 12, background: '#DC2626', borderRadius: 1 }} />
            Aujourd'hui
          </span>
        </div>
      </div>

      {/* Conflits détaillés */}
      {conflits.length > 0 && (
        <div style={{ marginTop: 14, padding: 14, background: '#FFFBEB', border: '1px solid #D97706', borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#D97706', marginBottom: 8 }}>Conflits d'équipe détectés</div>
          {conflits.map((cf, i) => {
            const c1 = items.find(c => c.id === cf.chantier1);
            const c2 = items.find(c => c.id === cf.chantier2);
            return (
              <div key={i} style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                <strong>{cf.nom}</strong> est assigné sur <em>{c1?.titre || 'Chantier'}</em> et <em>{c2?.titre || 'Chantier'}</em> en même temps
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function genWeeks(startDate, endDate) {
  const weeks = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  // Aligner au lundi
  current.setDate(current.getDate() - (current.getDay() || 7) + 1);
  const now = new Date();
  const nowWeekStart = new Date(now);
  nowWeekStart.setDate(nowWeekStart.getDate() - (nowWeekStart.getDay() || 7) + 1);
  const nowWeekStr = nowWeekStart.toISOString().slice(0, 10);

  while (current <= end) {
    const weekStart = current.toISOString().slice(0, 10);
    const label = current.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    weeks.push({ label, date: weekStart, isCurrentWeek: weekStart === nowWeekStr });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

function zoomBtn(active) {
  return {
    padding: '6px 14px', border: active ? 'none' : '1px solid #E5E5EA', borderRadius: 8,
    background: active ? '#2C2520' : '#fff', color: active ? '#F5EFE0' : '#6E6E73',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  };
}
