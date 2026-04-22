import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AlertesInterModules from '../../components/rh/AlertesInterModules';
import OnboardingWizard, { isOnboardingDone, getOnboardingType } from '../../components/onboarding/OnboardingWizard';
import { DEMO_PLANNING as PLANNING_DEMO } from '../../utils/demoData';
import { isDemo as _isDemo, demoGet } from '../../utils/storage';

const STOCK_ALERTS = [
  { materiau: 'Ciment CEM II 32.5', stock: 8, seuil: 20, unite: 'sacs' },
  { materiau: 'Sable fin 0/4', stock: 0.5, seuil: 2, unite: 'tonnes' },
];

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// Nombre d'alertes inter-modules (démo = 7, réel = 0)
function countAlertes() {
  if (!_isDemo()) return 0;
  try {
    const dismissed = new Set(JSON.parse(localStorage.getItem('freample_alertes_dismissed') || '[]'));
    return Math.max(7 - dismissed.size, 0);
  } catch { return 7; }
}

export default function DashboardPatron() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDemo = _isDemo();
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone() && getOnboardingType(user) === 'patron');
  const [showAlertes, setShowAlertes] = useState(false);
  const [alerteCount, setAlerteCount] = useState(countAlertes);
  const [slotDetail, setSlotDetail] = useState(null); // { emp, jour, slot }
  const [showChantier, setShowChantier] = useState(null); // chantier label pour zoom

  const prenom = user?.nom?.split(' ')[0] || 'Patron';

  // ── Données écosystème depuis localStorage ──
  const lsDevis = demoGet('freample_devis', []);
  const lsFactures = demoGet('freample_factures', []);
  const lsChantiers = demoGet('freample_chantiers_custom', []);

  const moisCourant = new Date().toISOString().slice(0, 7);
  const facturesPayees = lsFactures.filter(f => f.statut === 'payee' || f.statut === 'sequestre_libere');
  const caMensuel = facturesPayees.filter(f => (f.date || '').startsWith(moisCourant)).reduce((s, f) => s + (Number(f.montantTTC) || 0), 0) || (isDemo ? 5200 : 0);
  const caAnnuel = facturesPayees.reduce((s, f) => s + (Number(f.montantTTC) || 0), 0) || (isDemo ? 48500 : 0);
  const margeNette = caAnnuel > 0 ? Math.round((caAnnuel * 0.18) / caAnnuel * 100) : (isDemo ? 18 : 0);
  const devisAFinaliser = lsDevis.filter(d => d.aFinaliserRole === 'patron' && d.statut === 'brouillon').length;
  const devisEnvoyes = lsDevis.filter(d => d.statut === 'envoye').length;
  const sequestreEnCours = lsFactures.filter(f => f.statut === 'sequestre' || f.statut === 'sequestre_acompte').reduce((s, f) => s + (Number(f.montantTTC) || 0), 0);

  // ── Taux d'occupation par semaine (3 semaines) ──
  const occupation = useMemo(() => {
    const todayD = new Date();
    const weeks = [];
    for (let w = 0; w < 3; w++) {
      const weekStart = new Date(todayD); weekStart.setDate(todayD.getDate() + w * 7 - todayD.getDay() + 1);
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 5);
      const wsStr = weekStart.toISOString().slice(0, 10);
      const weStr = weekEnd.toISOString().slice(0, 10);
      const allNames = [...new Set(lsChantiers.flatMap(c => c.equipe || []))];
      const occupes = allNames.filter(nom =>
        lsChantiers.some(c => {
          if (!c.dateDebut || c.statut === 'terminee' || c.statut === 'annulee') return false;
          const fin = c.dateFin || c.dateDebut;
          const inEquipe = (c.equipe || []).some(e => e.toLowerCase().includes(nom.toLowerCase()));
          return inEquipe && c.dateDebut <= weStr && fin >= wsStr;
        })
      );
      const total = Math.max(allNames.length, 1);
      const pct = Math.round(occupes.length / total * 100);
      weeks.push({ label: w === 0 ? 'Cette semaine' : w === 1 ? 'Semaine proch.' : 'Dans 2 sem.', pct, occupes: occupes.length, total: allNames.length });
    }
    return weeks;
  }, [lsChantiers]);

  // ── Projets marketplace filtrés par disponibilité ──
  const projetsRecommandes = useMemo(() => {
    const allProjets = demoGet('freample_projets', []);
    const metiersPatron = (demoGet('freample_profil_patron', {}).metiers || []).map(m => m.toLowerCase());
    const premierTrou = occupation.find(w => w.pct < 60);
    const toutBookes = !premierTrou;
    return allProjets
      .filter(p => p.statut === 'publie')
      .filter(p => metiersPatron.length === 0 || metiersPatron.some(m => (p.metier || '').toLowerCase().includes(m) || m.includes((p.metier || '').toLowerCase())))
      .filter(p => {
        if (toutBookes) return p.urgence === 'flexible';
        if (premierTrou === occupation[0]) return true;
        return p.urgence !== 'urgent';
      })
      .slice(0, 4)
      .map(p => ({
        ...p,
        suggestion: toutBookes ? 'Planning complet — projet flexible à planifier'
          : premierTrou === occupation[0] ? 'Vous êtes disponible maintenant'
          : `Correspond à votre creux (${premierTrou.label.toLowerCase()})`
      }));
  }, [occupation]);

  // ── Semaine courante pour le planning ──
  const semaineLabel = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return monday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
  }, []);

  // ── Onboarding ──
  if (showOnboarding) return <OnboardingWizard type="patron" onComplete={() => setShowOnboarding(false)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ══ HEADER + BOUTON ALERTES ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Bonjour {prenom}</h1>
          <p style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: 14 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => setShowAlertes(true)}
          style={{
            position: 'relative', padding: '8px 16px', background: alerteCount > 0 ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${alerteCount > 0 ? '#DC2626' : '#16A34A'}`, borderRadius: 10,
            cursor: 'pointer', fontSize: 13, fontWeight: 700, color: alerteCount > 0 ? '#DC2626' : '#16A34A',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, transition: 'transform .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Alertes modules
          {alerteCount > 0 && (
            <span style={{
              background: '#DC2626', color: '#fff', borderRadius: '50%',
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800,
            }}>{alerteCount}</span>
          )}
          {alerteCount === 0 && <span style={{ fontSize: 11 }}>OK</span>}
        </button>
      </div>

      {/* ══ MODAL ALERTES (overlay zoom) ══ */}
      {showAlertes && (
        <div
          onClick={() => { setShowAlertes(false); setAlerteCount(countAlertes()); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn .2s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: '28px 24px',
              width: '90%', maxWidth: 700, maxHeight: '80vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              animation: 'zoomIn .25s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Alertes inter-modules</h2>
              <button onClick={() => { setShowAlertes(false); setAlerteCount(countAlertes()); }}
                style={{ background: '#F2F2F7', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6E6E73' }}>
                Fermer
              </button>
            </div>
            <AlertesInterModules />
            {isDemo && STOCK_ALERTS.length > 0 && (
              <div onClick={() => { setShowAlertes(false); navigate('/patron/stock'); }}
                style={{ marginTop: 12, background: '#FFFBEB', border: '1px solid #D97706', borderLeft: '4px solid #D97706', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>Stock bas :</span>
                {STOCK_ALERTS.map((s, i) => (
                  <span key={i} style={{ fontSize: 12, color: '#555' }}>{s.materiau} ({s.stock} {s.unite})</span>
                ))}
                <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginLeft: 'auto' }}>Voir →</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAUX D'OCCUPATION ══ */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          Disponibilité de votre équipe
          {occupation[0]?.total === 0 && <span style={{ fontSize: 11, color: '#D97706', fontWeight: 500 }}>(aucun salarié assigné)</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {occupation.map((w, i) => {
            const color = w.pct > 80 ? '#16A34A' : w.pct > 50 ? '#D97706' : '#DC2626';
            return (
              <div key={i} style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#F2F1ED' }}>
                  <div style={{ height: '100%', width: `${w.pct}%`, background: color, borderRadius: 2, transition: 'width .5s' }} />
                </div>
                <div style={{ fontSize: 11, color: '#6E6E73', fontWeight: 600, marginBottom: 4 }}>{w.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{w.pct}%</div>
                <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>{w.occupes}/{w.total} salariés occupés</div>
              </div>
            );
          })}
        </div>
        {occupation.some(w => w.pct < 30) && (
          <div onClick={() => navigate('/patron/projets')} style={{ marginTop: 8, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #DC2626', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', flex: 1 }}>Trou d'activité détecté — consultez les projets disponibles</span>
            <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>Voir →</span>
          </div>
        )}
      </div>

      {/* ══ PLANNING HEBDO ÉQUIPE ══ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Planning équipe — Semaine du {semaineLabel}
          </div>
          <button onClick={() => navigate('/patron/rh?onglet=planning')} style={{ fontSize: 12, color: '#A68B4B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Planning complet →</button>
        </div>

        {/* Légende */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          {(isDemo ? PLANNING_DEMO : []).map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6E6E73' }}>
              <div style={{ width: 8, height: 8, borderRadius: 3, background: e.couleur, flexShrink: 0 }} />
              {e.nom}
            </div>
          ))}
        </div>

        {/* ── VUE DESKTOP : Grille planning compact ── */}
        <div className="planning-grid-desktop" style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E8E6E1' }}>
          {/* Header jours */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(6, 1fr)', borderBottom: '1px solid #F2F2F7' }}>
            <div style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#6E6E73', background: '#FAFAF8' }}></div>
            {JOURS.map(j => {
              const now = new Date();
              const dayIdx = (now.getDay() + 6) % 7;
              const jourIdx = JOURS.indexOf(j);
              const isToday = jourIdx === dayIdx;
              return (
                <div key={j} style={{
                  padding: '10px 6px', fontSize: 11, fontWeight: 700, textAlign: 'center',
                  background: isToday ? '#2563eb0a' : '#FAFAF8', borderLeft: '1px solid #F2F2F7',
                  color: isToday ? '#2563EB' : '#1C1C1E',
                }}>
                  {j}{isToday ? ' •' : ''}
                </div>
              );
            })}
          </div>

          {/* Lignes employés */}
          {(isDemo ? PLANNING_DEMO : []).map((emp, ri) => (
            <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '120px repeat(6, 1fr)', borderBottom: ri < (isDemo ? PLANNING_DEMO : []).length - 1 ? '1px solid #F2F2F7' : 'none' }}>
              <div style={{ padding: '10px 12px', borderRight: '1px solid #F2F2F7', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#1C1C1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.nom}</div>
                <div style={{ fontSize: 10, color: '#6E6E73', marginTop: 1 }}>{emp.poste}</div>
              </div>
              {JOURS.map(jour => {
                const slot = emp.semaine[jour];
                const isSelected = slotDetail?.emp?.id === emp.id && slotDetail?.jour === jour;
                return (
                  <div key={jour} style={{ padding: '6px 4px', borderLeft: '1px solid #F2F2F7', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {slot ? (
                      <div
                        onClick={() => setSlotDetail(isSelected ? null : { emp, jour, slot })}
                        style={{
                          width: '100%', background: isSelected ? emp.couleur + '30' : emp.couleur + '15',
                          borderLeft: `3px solid ${emp.couleur}`, borderRadius: 5, padding: '4px 6px',
                          cursor: 'pointer', transition: 'all .15s',
                          outline: isSelected ? `2px solid ${emp.couleur}` : 'none',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = emp.couleur + '25'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = emp.couleur + '15'; }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 700, color: emp.couleur }}>{slot.debut}h–{slot.fin}h</div>
                        <div style={{ fontSize: 9, color: '#6E6E73', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.label}</div>
                      </div>
                    ) : (
                      <div style={{ width: '80%', height: 4, background: '#F2F1ED', borderRadius: 2 }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── VUE MOBILE : Liste par employé ── */}
        <div className="planning-list-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(isDemo ? PLANNING_DEMO : []).map(emp => {
            const joursActifs = JOURS.filter(j => emp.semaine[j]);
            const totalH = Object.values(emp.semaine).reduce((s, d) => s + (d ? d.fin - d.debut : 0), 0);
            return (
              <div key={emp.id} style={{ background: '#fff', border: '1px solid #E8E6E1', borderLeft: `4px solid ${emp.couleur}`, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{emp.nom}</div>
                    <div style={{ fontSize: 11, color: '#6E6E73' }}>{emp.poste} · {joursActifs.length}j · {totalH}h</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: emp.couleur }}>{emp.semaine.Lun?.label || emp.semaine.Mar?.label || '—'}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {JOURS.map(j => {
                    const slot = emp.semaine[j];
                    const now = new Date();
                    const dayIdx = (now.getDay() + 6) % 7;
                    const isToday = JOURS.indexOf(j) === dayIdx;
                    return (
                      <div
                        key={j}
                        onClick={() => slot && setSlotDetail(slotDetail?.emp?.id === emp.id && slotDetail?.jour === j ? null : { emp, jour: j, slot })}
                        style={{
                          flex: 1, textAlign: 'center', padding: '6px 2px', borderRadius: 6,
                          background: slot ? emp.couleur + '18' : '#F8F8F6',
                          border: isToday ? `2px solid ${slot ? emp.couleur : '#2563EB'}` : '1px solid transparent',
                          cursor: slot ? 'pointer' : 'default',
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#2563EB' : '#6E6E73' }}>{j}</div>
                        {slot ? (
                          <div style={{ fontSize: 9, fontWeight: 700, color: emp.couleur, marginTop: 2 }}>{slot.debut}–{slot.fin}h</div>
                        ) : (
                          <div style={{ fontSize: 9, color: '#ccc', marginTop: 2 }}>—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── POPOVER DÉTAIL CRÉNEAU ── */}
        {slotDetail && (
          <div style={{
            marginTop: 10, background: '#fff', border: `2px solid ${slotDetail.emp.couleur}`,
            borderRadius: 14, padding: '16px 18px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            animation: 'zoomIn .2s ease-out',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1C1C1E' }}>{slotDetail.slot.label}</div>
                <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>{slotDetail.jour} · {slotDetail.slot.debut}h – {slotDetail.slot.fin}h ({slotDetail.slot.fin - slotDetail.slot.debut}h)</div>
              </div>
              <button onClick={() => setSlotDetail(null)} style={{ background: '#F2F2F7', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#6E6E73', fontWeight: 600 }}>×</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 10px', background: slotDetail.emp.couleur + '10', borderRadius: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: slotDetail.emp.couleur + '25', color: slotDetail.emp.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                {slotDetail.emp.nom.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{slotDetail.emp.nom}</div>
                <div style={{ fontSize: 11, color: '#6E6E73' }}>{slotDetail.emp.poste}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => { setShowChantier(slotDetail.slot.label); setSlotDetail(null); }}
                style={{ padding: '7px 14px', background: slotDetail.emp.couleur, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Voir le chantier
              </button>
              <button onClick={() => { setSlotDetail(null); navigate('/patron/rh?onglet=planning'); }}
                style={{ padding: '7px 14px', background: '#fff', color: slotDetail.emp.couleur, border: `1px solid ${slotDetail.emp.couleur}`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Modifier le planning
              </button>
              <button onClick={() => { setSlotDetail(null); navigate('/patron/employes'); }}
                style={{ padding: '7px 14px', background: '#F8F8F6', color: '#6E6E73', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Fiche employé
              </button>
            </div>
          </div>
        )}

        {/* Résumé heures */}
        {!slotDetail && (
          <div className="planning-grid-desktop" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {(isDemo ? PLANNING_DEMO : []).map(emp => {
              const total = Object.values(emp.semaine).reduce((s, d) => s + (d ? d.fin - d.debut : 0), 0);
              const jours = Object.values(emp.semaine).filter(Boolean).length;
              return (
                <div key={emp.id} style={{
                  padding: '6px 12px', background: '#fff', border: '1px solid #E8E6E1',
                  borderLeft: `3px solid ${emp.couleur}`, borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
                }}>
                  <span style={{ fontWeight: 700, color: '#1C1C1E' }}>{emp.nom.split(' ')[0]}</span>
                  <span style={{ color: '#6E6E73' }}>{jours}j · {total}h</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ PROJETS RECOMMANDÉS ══ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Projets recommandés pour vous
            {projetsRecommandes.length > 0 && <span style={{ fontSize: 11, color: '#6E6E73', fontWeight: 500, marginLeft: 6 }}>(adaptés à votre disponibilité)</span>}
          </div>
          <button onClick={() => navigate('/patron/projets')} style={{ fontSize: 12, color: '#A68B4B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir tous →</button>
        </div>
        {projetsRecommandes.length === 0 ? (
          <div style={{ background: '#FAFAF8', border: '1px solid #E8E6E1', borderRadius: 12, padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#6E6E73' }}>Aucun projet dans votre zone pour l'instant</div>
            <div style={{ fontSize: 11, color: '#A68B4B', marginTop: 4 }}>Vous serez notifié dès qu'un nouveau projet arrive</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projetsRecommandes.map(p => (
              <div key={p.id} onClick={() => navigate('/patron/projets')}
                style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#A68B4B'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E6E1'}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{p.metier}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: p.urgence === 'urgent' ? '#DC2626' : p.urgence === 'flexible' ? '#16A34A' : '#D97706', background: p.urgence === 'urgent' ? '#FEF2F2' : p.urgence === 'flexible' ? '#F0FDF4' : '#FFFBEB', padding: '2px 8px', borderRadius: 4 }}>
                      {p.urgence === 'urgent' ? 'Urgent' : p.urgence === 'flexible' ? 'Flexible' : 'Normal'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6E6E73' }}>{p.ville || 'Marseille'} · {p.clientNom || 'Client'}</div>
                  <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, marginTop: 4 }}>{p.suggestion}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#A68B4B' }}>{(p.budget || 0).toLocaleString('fr-FR')}€</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {occupation.every(w => w.pct > 80) && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #16A34A', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>Votre planning est plein — pensez à sous-traiter si un projet urgent vous intéresse.</span>
          </div>
        )}
      </div>

      {/* ══ ALERTES INLINE (devis à finaliser) ══ */}
      {devisAFinaliser > 0 && (
        <div onClick={() => navigate('/patron/devis-factures?tab=devis')}
          style={{ background: '#FEF2F2', border: '1px solid #DC2626', borderLeft: '4px solid #DC2626', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{devisAFinaliser} devis à finaliser</span>
          <span style={{ fontSize: 11, color: '#7A1F1F' }}>— vos clients attendent</span>
          <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginLeft: 'auto' }}>Finaliser →</span>
        </div>
      )}

      {/* ══ CHIFFRES RAPIDES ══ */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginRight: 4 }}>Vos chiffres</div>
        {[
          { label: 'CA mois', value: `${caMensuel.toLocaleString('fr-FR')}€`, color: '#1A1A1A' },
          { label: 'Séquestre', value: `${sequestreEnCours.toLocaleString('fr-FR')}€`, color: '#16A34A' },
          { label: 'Marge', value: `${margeNette}%`, color: margeNette >= 15 ? '#16A34A' : '#D97706' },
          { label: 'Devis en attente', value: `${devisEnvoyes}`, color: '#2563EB' },
        ].map(k => (
          <div key={k.label} style={{ padding: '8px 14px', background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#6E6E73' }}>{k.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: k.color }}>{k.value}</span>
          </div>
        ))}
        <button onClick={() => navigate('/patron/finance')} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #A68B4B', borderRadius: 10, color: '#A68B4B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          Détails financiers →
        </button>
      </div>

      {/* ══ RDV DU JOUR (depuis l'agenda) ══ */}
      {(() => {
        const today = new Date().toISOString().slice(0, 10);
        const agendaEvents = demoGet('freample_agenda_events', []);
        const rdvAujourdhui = agendaEvents.filter(e => e.date === today || (e.start && e.start.startsWith(today)));
        if (rdvAujourdhui.length === 0) return null;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Aujourd'hui</div>
              <button onClick={() => navigate('/patron/agenda')} style={{ fontSize: 12, color: '#A68B4B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Agenda →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {rdvAujourdhui.map((e, i) => (
                <div key={e.id || i} style={{ background: '#fff', border: '1px solid #E8E6E1', borderLeft: `3px solid ${e.type === 'chantier' ? '#D97706' : e.type === 'rdv' ? '#2563EB' : '#A68B4B'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{e.title || e.titre || '—'}</div>
                    {e.lieu && <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>{e.lieu}</div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#A68B4B' }}>{e.heure || ''}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ══ MODAL ZOOM CHANTIER ══ */}
      {showChantier && (() => {
        const allChantiers = demoGet('freample_chantiers_custom', []);
        const ch = allChantiers.find(c => (c.titre || '').toLowerCase().includes(showChantier.toLowerCase()) || showChantier.toLowerCase().includes((c.titre || '').toLowerCase().split('—')[0]?.trim()));
        const chantier = ch || { titre: showChantier, statut: 'en_cours', avancement: 50, client: '—', adresse: '—' };
        const devisLie = demoGet('freample_devis', []).find(d => d.projetId === chantier.projetId || (d.objet || '').toLowerCase().includes(showChantier.toLowerCase()));
        const equipe = chantier.equipe || [];
        const statusColors = { en_cours: '#D97706', planifie: '#2563EB', terminee: '#16A34A', en_attente: '#6E6E73', reception: '#8B5CF6' };
        const statusLabels = { en_cours: 'En cours', planifie: 'Planifié', terminee: 'Terminé', en_attente: 'En attente', reception: 'Réception' };

        return (
          <div onClick={() => setShowChantier(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s ease-out' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 20, width: '92%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'zoomIn .25s ease-out' }}>

              {/* Header */}
              <div style={{ background: '#2C2520', padding: '20px 24px', borderRadius: '20px 20px 0 0', color: '#F5EFE0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Chantier</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{chantier.titre || showChantier}</div>
                    <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.6)', marginTop: 4 }}>{chantier.client || '—'} · {chantier.adresse || '—'}</div>
                  </div>
                  <button onClick={() => setShowChantier(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 30, height: 30, color: '#F5EFE0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Avancement */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Avancement</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: (chantier.avancement || 0) >= 100 ? '#16A34A' : '#A68B4B' }}>{chantier.avancement || 0}%</span>
                  </div>
                  <div style={{ height: 8, background: '#E8E6E1', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${chantier.avancement || 0}%`, height: '100%', background: (chantier.avancement || 0) >= 100 ? '#16A34A' : '#A68B4B', borderRadius: 4 }} />
                  </div>
                </div>

                {/* Infos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                  {[
                    ['Statut', statusLabels[chantier.statut] || chantier.statut || '—'],
                    ['Début', chantier.dateDebut ? new Date(chantier.dateDebut).toLocaleDateString('fr-FR') : '—'],
                    ['Fin prévue', chantier.dateFin ? new Date(chantier.dateFin).toLocaleDateString('fr-FR') : 'À définir'],
                    ['Budget', `${(chantier.budgetPrevu || chantier.caDevis || 0).toLocaleString('fr-FR')}€`],
                    ['Source', chantier.source === 'marketplace' ? 'Marketplace' : 'Direct'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: '#F8F7F4', padding: '8px 10px', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Équipe */}
                {equipe.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Équipe assignée</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {equipe.map((nom, i) => (
                        <span key={i} style={{ padding: '5px 12px', background: '#F8F7F4', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{nom}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Devis lié */}
                {devisLie && (
                  <div style={{ background: '#F8F7F4', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#A68B4B' }}>Devis {devisLie.numero}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{(devisLie.lignes || []).length} ligne{(devisLie.lignes || []).length > 1 ? 's' : ''} · {(devisLie.montantTTC || 0).toLocaleString('fr-FR')}€ TTC</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: devisLie.statut === 'accepte' ? '#F0FDF4' : '#FFFBEB', color: devisLie.statut === 'accepte' ? '#16A34A' : '#D97706' }}>
                        {devisLie.statut === 'accepte' ? 'Accepté' : devisLie.statut === 'envoye' ? 'Envoyé' : devisLie.statut}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setShowChantier(null); navigate('/patron/missions'); }}
                    style={{ flex: 1, padding: '11px 0', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Gérer le chantier
                  </button>
                  <button onClick={() => setShowChantier(null)}
                    style={{ padding: '11px 20px', background: '#F2F2F7', color: '#6E6E73', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Animations + Responsive CSS */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .planning-list-mobile { display: none !important; }
        @media (max-width: 680px) {
          .planning-grid-desktop { display: none !important; }
          .planning-list-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
