import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import api from '../../services/api';
import { IconBank, IconAlert, IconTrendUp, IconCheck, IconCalendar, IconScale, IconClock, IconDocument } from '../../components/ui/Icons';

// ── Demo data (fallback when API is unavailable) ──────────────────────────────

const DEMO_HISTORIQUE = {
  cotisationsPayees: 28_640,
  enAttente: 5_940,
  declarations: [
    { id: 1, periode: 'Mars 2025', ca: 19_800, cotisationsCalculees: 5_940, dateLimite: '15/04/2025', statut: 'en_attente', joursRestants: 20 },
    { id: 2, periode: 'Fév 2025',  ca: 16_500, cotisationsCalculees: 4_950, dateLimite: '15/03/2025', statut: 'payée' },
    { id: 3, periode: 'Jan 2025',  ca: 14_200, cotisationsCalculees: 4_260, dateLimite: '15/02/2025', statut: 'payée' },
    { id: 4, periode: 'Déc 2024',  ca: 8_600,  cotisationsCalculees: 2_580, dateLimite: '15/01/2025', statut: 'payée' },
    { id: 5, periode: 'Nov 2024',  ca: 12_400, cotisationsCalculees: 3_720, dateLimite: '15/12/2024', statut: 'payée' },
    { id: 6, periode: 'Oct 2024',  ca: 9_800,  cotisationsCalculees: 2_940, dateLimite: '15/11/2024', statut: 'payée' },
    { id: 7, periode: 'Sep 2024',  ca: 11_200, cotisationsCalculees: 3_360, dateLimite: '15/10/2024', statut: 'payée' },
    { id: 8, periode: 'Aoû 2024',  ca: 7_100,  cotisationsCalculees: 2_130, dateLimite: '15/09/2024', statut: 'payée' },
  ],
};

const DEMO_RECAPITULATIF = {
  totalCA12Mois: 164_200,
  graphique12Mois: [
    { mois: 'Avr 24', cotisationsEstimees: 2_100 },
    { mois: 'Mai 24', cotisationsEstimees: 2_850 },
    { mois: 'Jun 24', cotisationsEstimees: 3_200 },
    { mois: 'Jul 24', cotisationsEstimees: 2_550 },
    { mois: 'Aoû 24', cotisationsEstimees: 2_130 },
    { mois: 'Sep 24', cotisationsEstimees: 3_360 },
    { mois: 'Oct 24', cotisationsEstimees: 2_940 },
    { mois: 'Nov 24', cotisationsEstimees: 3_720 },
    { mois: 'Déc 24', cotisationsEstimees: 2_580 },
    { mois: 'Jan 25', cotisationsEstimees: 4_260 },
    { mois: 'Fév 25', cotisationsEstimees: 4_950 },
    { mois: 'Mar 25', cotisationsEstimees: 5_940 },
  ],
};

const DEMO_ALERTES = {
  message: '1 déclaration à soumettre avant le 15 avril 2025',
  prochaines: [
    { id: 1, periode: 'Mars 2025', cotisationsCalculees: 5_940, dateLimite: '15/04/2025', joursRestants: 20 },
  ],
};

// ── Taux de cotisation 2025 (référence) ──────────────────────────────────────

const TAUX_2025 = [
  { categorie: 'Maladie / Maternité / Invalidité',  patronal: '13,00 %', salarial: '0,75 %',  base: 'Totalité du salaire brut' },
  { categorie: 'Retraite de base (CNAV)',           patronal: '8,55 %',  salarial: '6,90 %',  base: 'Dans la limite du plafond SS (T1)' },
  { categorie: 'Retraite complémentaire (Agirc-Arrco) T1', patronal: '4,72 %', salarial: '3,15 %', base: 'Tranche 1 (≤ 1 PSS)' },
  { categorie: 'Retraite complémentaire T2',        patronal: '12,95 %', salarial: '8,64 %', base: 'Tranche 2 (1 à 8 PSS)' },
  { categorie: 'Allocations familiales',            patronal: '3,45 %',  salarial: '—',       base: 'Totalité du salaire brut' },
  { categorie: 'AT/MP (BTP — taux moyen)',          patronal: '~4,00 %', salarial: '—',       base: 'Totalité — variable selon sinistralité' },
  { categorie: 'Assurance chômage',                 patronal: '4,05 %',  salarial: '—',       base: 'Dans la limite de 4 PSS' },
  { categorie: 'AGS (garantie salaires)',           patronal: '0,25 %',  salarial: '—',       base: 'Dans la limite de 4 PSS' },
  { categorie: 'Autonomie (CASA)',                  patronal: '0,30 %',  salarial: '—',       base: 'Totalité du salaire brut' },
  { categorie: 'FNAL',                              patronal: '0,10 %*', salarial: '—',       base: '* 0,50% si ≥ 50 salariés' },
  { categorie: 'CSG déductible',                   patronal: '—',       salarial: '6,80 %',  base: '98,25% du salaire brut' },
  { categorie: 'CSG / CRDS non déductible',        patronal: '—',       salarial: '2,90 %',  base: '98,25% du salaire brut' },
  { categorie: 'Formation professionnelle',         patronal: '0,55 %*', salarial: '—',       base: '* 1% si ≥ 11 salariés' },
  { categorie: 'Taxe d\'apprentissage',            patronal: '0,68 %',  salarial: '—',       base: 'Totalité du salaire brut' },
];

// ── Calcul détaillé de la simulation ─────────────────────────────────────────

function calculerCotisationsDetaillees(ca, regime, nbSalaries) {
  if (regime === 'micro') {
    // Micro-entreprise artisan BTP : 22% du CA (taux 2025)
    const cotisations = ca * 0.22;
    const details = [
      { poste: 'Cotisations maladie',         montant: ca * 0.065, patronal: true  },
      { poste: 'Retraite de base',            montant: ca * 0.085, patronal: true  },
      { poste: 'Retraite complémentaire',     montant: ca * 0.035, patronal: true  },
      { poste: 'Invalidité-Décès',            montant: ca * 0.013, patronal: true  },
      { poste: 'Allocations familiales',      montant: ca * 0.031, patronal: true  },
      { poste: 'Formation professionnelle',   montant: ca * 0.003, patronal: false },
    ];
    return { total: Math.round(cotisations), tauxEffectif: 22, regime: 'Micro-entreprise', details, plafond: 'Pas de plafond SS applicable' };
  }

  // Régime réel — estimation par salarié (base 1 salarié au SMIC si 0 indiqué)
  const nbSal = Math.max(1, nbSalaries);
  const smic2025 = 1_801.80;
  const salaireMoyen = ca > 0 ? Math.min(ca / (nbSal * 12), 8_000) : smic2025;
  const plafondSS = 3_864; // PSS mensuel 2025

  const masseAnnuelle = salaireMoyen * nbSal * 12;

  // Cotisations patronales estimées
  const maladie        = masseAnnuelle * 0.130;
  const retraiteBase   = Math.min(masseAnnuelle, plafondSS * nbSal * 12) * 0.0855;
  const retraiteCompl  = Math.min(masseAnnuelle, plafondSS * nbSal * 12) * 0.0472;
  const famille        = masseAnnuelle * 0.0345;
  const atmp           = masseAnnuelle * 0.040;
  const chomage        = Math.min(masseAnnuelle, plafondSS * 4 * nbSal * 12) * 0.0405;
  const ags            = Math.min(masseAnnuelle, plafondSS * 4 * nbSal * 12) * 0.0025;
  const autonomie      = masseAnnuelle * 0.003;
  const fnal           = masseAnnuelle * (nbSal >= 50 ? 0.005 : 0.001);
  const formation      = masseAnnuelle * (nbSal >= 11 ? 0.010 : 0.0055);
  const apprentissage  = masseAnnuelle * 0.0068;

  const totalPatronal = maladie + retraiteBase + retraiteCompl + famille + atmp + chomage + ags + autonomie + fnal + formation + apprentissage;

  // Cotisations salariales estimées
  const csgDeductible   = masseAnnuelle * 0.9825 * 0.068;
  const csgNonDed       = masseAnnuelle * 0.9825 * 0.029;
  const retrBaseSal     = Math.min(masseAnnuelle, plafondSS * nbSal * 12) * 0.069;
  const retrComplSal    = Math.min(masseAnnuelle, plafondSS * nbSal * 12) * 0.0315;
  const maladieSal      = masseAnnuelle * 0.0075;

  const totalSalarial = csgDeductible + csgNonDed + retrBaseSal + retrComplSal + maladieSal;
  const total = totalPatronal + totalSalarial;
  const tauxEffectif = masseAnnuelle > 0 ? (total / masseAnnuelle * 100).toFixed(1) : 0;

  const details = [
    { poste: 'Maladie (patronal)',             montant: Math.round(maladie),        patronal: true  },
    { poste: 'Retraite base (patronal)',       montant: Math.round(retraiteBase),   patronal: true  },
    { poste: 'Retraite complémentaire (pat.)', montant: Math.round(retraiteCompl), patronal: true  },
    { poste: 'Allocations familiales',         montant: Math.round(famille),        patronal: true  },
    { poste: 'AT/MP BTP',                      montant: Math.round(atmp),           patronal: true  },
    { poste: 'Assurance chômage',              montant: Math.round(chomage),        patronal: true  },
    { poste: 'Formation + Apprentissage',      montant: Math.round(formation + apprentissage), patronal: true },
    { poste: 'Autres (AGS, FNAL, Autonomie)',  montant: Math.round(ags + fnal + autonomie),   patronal: true },
    { poste: 'CSG / CRDS (salarial)',          montant: Math.round(csgDeductible + csgNonDed), patronal: false },
    { poste: 'Retraite base (salarial)',       montant: Math.round(retrBaseSal),    patronal: false },
    { poste: 'Retraite compl. (salarial)',     montant: Math.round(retrComplSal),   patronal: false },
    { poste: 'Maladie (salarial)',             montant: Math.round(maladieSal),     patronal: false },
  ];

  return {
    total: Math.round(total),
    totalPatronal: Math.round(totalPatronal),
    totalSalarial: Math.round(totalSalarial),
    tauxEffectif,
    regime: 'Régime réel',
    masseAnnuelle: Math.round(masseAnnuelle),
    nbSalaries: nbSal,
    salaireMoyen: Math.round(salaireMoyen),
    details,
    plafond: `Plafond SS 2025 : ${plafondSS.toLocaleString('fr-FR')} €/mois`,
  };
}

// ── Composants ────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: 'var(--shadow-md)', fontSize: '0.8125rem' }}>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{payload[0].value?.toLocaleString('fr-FR')} €</p>
    </div>
  );
};

function KpiCard({ label, valeur, Icon, color = 'blue', sub }) {
  const colors = {
    blue:  { bg: 'var(--primary-light)', fg: 'var(--primary)' },
    green: { bg: 'rgba(52,199,89,0.1)',  fg: '#1A7A3C'        },
    red:   { bg: 'var(--danger-light)',  fg: 'var(--danger)'  },
    orange:{ bg: 'rgba(255,149,0,0.1)', fg: '#7A5C00'        },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="stat-card">
      <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={17} />
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: color === 'red' ? 'var(--danger)' : 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{valeur}</p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 5 }}>{label}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function CountdownBadge({ jours }) {
  if (jours == null) return null;
  const color = jours <= 3 ? '#FF3B30' : jours <= 7 ? '#FF9500' : '#34C759';
  const bg    = jours <= 3 ? 'rgba(255,59,48,0.1)' : jours <= 7 ? 'rgba(255,149,0,0.1)' : 'rgba(52,199,89,0.1)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: bg, fontSize: '0.75rem', fontWeight: 700, color }}>
      <IconClock size={11} /> J−{jours}
    </span>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function URSSAF() {
  const [historique, setHistorique] = useState(null);
  const [recapitulatif, setRecap]   = useState(null);
  const [alertes, setAlertes]       = useState(null);
  const [isDemo, setIsDemo]         = useState(false);
  const [loading, setLoading]       = useState(true);

  // Simulateur
  const [ca, setCa]               = useState('');
  const [regime, setRegime]       = useState('reel');
  const [nbSalaries, setNbSalaries] = useState('');
  const [simulation, setSimulation] = useState(null);

  // UI state
  const [showTaux, setShowTaux]   = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/urssaf/historique').catch(() => null),
      api.get('/urssaf/recapitulatif').catch(() => null),
      api.get('/urssaf/alertes').catch(() => null),
    ]).then(([h, r, a]) => {
      const demo = !h?.data && !r?.data;
      setIsDemo(demo);
      setHistorique(demo ? DEMO_HISTORIQUE : h.data);
      setRecap(demo ? DEMO_RECAPITULATIF : r.data);
      setAlertes(demo ? DEMO_ALERTES : a?.data);
    }).finally(() => setLoading(false));
  }, []);

  function simuler(e) {
    e.preventDefault();
    const caVal = parseFloat(ca);
    const nbSal = parseInt(nbSalaries) || 0;
    if (!caVal || caVal <= 0) return;
    const result = calculerCotisationsDetaillees(caVal, regime, nbSal);
    setSimulation(result);
  }

  const graphData = useMemo(() =>
    recapitulatif?.graphique12Mois?.map(m => ({
      mois: m.mois?.slice(0, 6) || m.mois,
      cotisations: m.cotisationsEstimees,
    })), [recapitulatif]);

  const maxGraph = graphData ? Math.max(...graphData.map(d => d.cotisations)) : 1;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  );

  const hist = historique || DEMO_HISTORIQUE;
  const recap = recapitulatif || DEMO_RECAPITULATIF;

  // Prochain trimestre : estimer prochaine échéance DSN
  const today = new Date();
  const moisCourant = today.getMonth() + 1;
  const joursAvantEcheance = 15 - today.getDate();
  const periodeEnCours = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Demo banner */}
      {isDemo && (
        <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.25)', borderRadius: 10, padding: '10px 16px', fontSize: '0.8125rem', color: '#7A5C00', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📊</span> Données de démonstration — connectez l'API backend pour afficher vos chiffres réels.
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>URSSAF</h1>
          <p style={{ marginTop: 4 }}>Suivi des cotisations sociales, DSN et simulateur de charges</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowTaux(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
          >
            <IconScale size={14} /> Taux 2025
          </button>
          <button
            onClick={() => setShowLegal(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid rgba(91,91,214,0.3)', borderRadius: 9, background: 'var(--primary-light)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}
          >
            ⚖️ Obligations légales
          </button>
        </div>
      </div>

      {/* Taux de cotisation (collapsible) */}
      {showTaux && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title">Taux de cotisation 2025 — Référence</h2>
            <button onClick={() => setShowTaux(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1rem' }}>✕</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 280 }}>Cotisation</th>
                  <th style={{ textAlign: 'right' }}>Part patronale</th>
                  <th style={{ textAlign: 'right' }}>Part salariale</th>
                  <th>Assiette</th>
                </tr>
              </thead>
              <tbody>
                {TAUX_2025.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{t.categorie}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{t.patronal}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#7C3AED' }}>{t.salarial}</td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{t.base}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    Source : URSSAF 2025 · Plafond mensuel de la Sécurité Sociale (PSS) 2025 : 3 864 €/mois · SMIC 2025 : 1 801,80 €/mois brut
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Legal banner (collapsible) */}
      {showLegal && (
        <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(91,91,214,0.2)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>
              ⚖️ Obligations URSSAF — Art. L133-5-3 Code de la Sécurité Sociale
            </span>
            <button onClick={() => setShowLegal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.875rem' }}>✕</button>
          </div>
          <ul style={{ margin: '0 0 0 18px', padding: 0, fontSize: '0.8125rem', color: 'var(--text)', lineHeight: 2 }}>
            <li><strong>DSN mensuelle</strong> : avant le 5 du mois M+1 (effectif &gt; 50 sal.) ou le 15 du mois M+1 (≤ 50 sal.)</li>
            <li>Paiement <strong>mensuel</strong> si masse salariale &gt; 1,6 M€/an — <strong>trimestriel</strong> sinon</li>
            <li><strong>Pénalités de retard :</strong> 5 % du montant dû + 0,2 % par mois de retard supplémentaire</li>
            <li>Taux AT/MP BTP 2025 : ~3,5 % à 6 % du brut selon sinistralité de l'établissement</li>
            <li>En cas de difficultés : demander un <strong>délai de paiement URSSAF avant l'échéance</strong> — accord possible sur justification</li>
            <li>Redressement possible sur <strong>3 ans</strong> (5 ans en cas de fraude avérée)</li>
          </ul>
        </div>
      )}

      {/* Alertes échéances */}
      {alertes?.prochaines?.length > 0 && (
        <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.3)', borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontWeight: 700, color: '#7A5C00', fontSize: '0.875rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert size={16} /> {alertes.message}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertes.prochaines.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '10px 14px' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{e.periode}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Cotisations estimées : {e.cotisationsCalculees?.toLocaleString('fr-FR')} €</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Échéance DSN</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{e.dateLimite}</p>
                  </div>
                  <CountdownBadge jours={e.joursRestants} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prochaine DSN automatique */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div className="card" style={{ padding: '16px 18px', borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconCalendar size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prochaine DSN</span>
          </div>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}>15 mai 2025</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Déclaration avril 2025</p>
        </div>
        <div className="card" style={{ padding: '16px 18px', borderLeft: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconCheck size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Déclarations payées</span>
          </div>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}>{hist.declarations?.filter(d => d.statut === 'payée').length || 0} sur {hist.declarations?.length || 0}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>12 derniers mois</p>
        </div>
        <div className="card" style={{ padding: '16px 18px', borderLeft: '3px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconAlert size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Montant en attente</span>
          </div>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--danger)' }}>{(hist.enAttente || 0).toLocaleString('fr-FR')} €</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>À régler avant échéance</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <KpiCard label="Cotisations payées (12 mois)" valeur={`${(hist.cotisationsPayees || 0).toLocaleString('fr-FR')} €`} Icon={IconCheck} color="green" />
        <KpiCard label="Solde en attente"             valeur={`${(hist.enAttente || 0).toLocaleString('fr-FR')} €`}         Icon={IconAlert} color="red" sub="Avant prochaine échéance" />
        <KpiCard label="CA déclaré (12 mois)"         valeur={`${(recap.totalCA12Mois || 0).toLocaleString('fr-FR')} €`}    Icon={IconTrendUp} color="blue" />
        <KpiCard
          label="Taux de cotisation moyen"
          valeur={recap.totalCA12Mois > 0 ? `${((hist.cotisationsPayees + hist.enAttente) / recap.totalCA12Mois * 100).toFixed(1)} %` : '— %'}
          Icon={IconBank}
          color="orange"
          sub="Sur CA brut"
        />
      </div>

      {/* Graphique */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="section-title">Cotisations sur 12 mois glissants</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            Total : <strong style={{ color: 'var(--text)' }}>{(graphData || []).reduce((s, d) => s + d.cotisations, 0).toLocaleString('fr-FR')} €</strong>
          </span>
        </div>
        {graphData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={graphData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-light)', radius: 4 }} />
              <Bar dataKey="cotisations" radius={[4, 4, 0, 0]}>
                {(graphData || []).map((entry, i) => (
                  <Cell key={i} fill={i === graphData.length - 1 ? 'var(--primary)' : 'rgba(91,91,214,0.35)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state"><p className="empty-state-text">Données insuffisantes</p></div>
        )}
      </div>

      {/* Simulateur */}
      <div className="card" style={{ padding: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 4 }}>Simulateur de charges sociales</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Estimation des cotisations selon votre régime. Calcul basé sur les taux officiels URSSAF 2025.
        </p>
        <form onSubmit={simuler} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label className="label">Chiffre d'affaires annuel (€)</label>
            <input type="number" className="input" style={{ width: 180 }} placeholder="150 000" value={ca}
              onChange={e => setCa(e.target.value)} required min="1" />
          </div>
          <div>
            <label className="label">Régime fiscal</label>
            <select className="select" value={regime} onChange={e => setRegime(e.target.value)}>
              <option value="reel">Régime réel</option>
              <option value="micro">Micro-entreprise</option>
            </select>
          </div>
          {regime === 'reel' && (
            <div>
              <label className="label">Nombre de salariés</label>
              <input type="number" className="input" style={{ width: 120 }} placeholder="1" value={nbSalaries}
                onChange={e => setNbSalaries(e.target.value)} min="0" />
            </div>
          )}
          <button type="submit" className="btn-primary">
            Calculer les charges →
          </button>
        </form>

        {simulation && (
          <div style={{ marginTop: 24 }}>
            {/* Résumé principal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(91,91,214,0.15)', borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total charges</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.04em' }}>
                  {simulation.total?.toLocaleString('fr-FR')} €
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginTop: 4 }}>Taux effectif : {simulation.tauxEffectif} %</p>
              </div>
              {simulation.totalPatronal != null && (
                <div style={{ background: 'rgba(52,199,89,0.07)', border: '1px solid rgba(52,199,89,0.2)', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Part patronale</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A7A3C', letterSpacing: '-0.03em' }}>{simulation.totalPatronal?.toLocaleString('fr-FR')} €</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Masse salariale : {simulation.masseAnnuelle?.toLocaleString('fr-FR')} €</p>
                </div>
              )}
              {simulation.totalSalarial != null && (
                <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Part salariale</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7C3AED', letterSpacing: '-0.03em' }}>{simulation.totalSalarial?.toLocaleString('fr-FR')} €</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{simulation.plafond}</p>
                </div>
              )}
            </div>

            {/* Détail par poste */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Détail par poste — {simulation.regime}
                  {simulation.nbSalaries > 0 && ` · ${simulation.nbSalaries} salarié${simulation.nbSalaries > 1 ? 's' : ''} · Salaire moyen estimé ${simulation.salaireMoyen?.toLocaleString('fr-FR')} €/mois`}
                </p>
              </div>
              {simulation.details.map((d, i) => {
                const pct = simulation.total > 0 ? (d.montant / simulation.total * 100) : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < simulation.details.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: d.patronal ? 'var(--primary)' : '#7C3AED' }} />
                    <span style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--text)' }}>{d.poste}</span>
                    <div style={{ width: 120, height: 5, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: d.patronal ? 'var(--primary)' : '#7C3AED', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)', width: 80, textAlign: 'right', flexShrink: 0 }}>
                      {d.montant.toLocaleString('fr-FR')} €
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: 32, textAlign: 'right', flexShrink: 0 }}>
                      {pct.toFixed(0)} %
                    </span>
                    <span style={{ fontSize: '0.6875rem', padding: '1px 6px', borderRadius: 4, background: d.patronal ? 'var(--primary-light)' : 'rgba(124,58,237,0.1)', color: d.patronal ? 'var(--primary)' : '#7C3AED', fontWeight: 600, flexShrink: 0 }}>
                      {d.patronal ? 'PAT.' : 'SAL.'}
                    </span>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 10, fontStyle: 'italic' }}>
              ⚠️ Estimation indicative basée sur les taux 2025. Consultez un expert-comptable pour votre situation exacte.
            </p>
          </div>
        )}
      </div>

      {/* Historique des déclarations */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title">Historique des déclarations DSN</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{hist.declarations?.length || 0} déclarations</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Période</th>
              <th style={{ textAlign: 'right' }}>CA déclaré</th>
              <th style={{ textAlign: 'right' }}>Cotisations</th>
              <th style={{ textAlign: 'right' }}>Taux</th>
              <th>Échéance DSN</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {(hist.declarations || []).length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><p className="empty-state-text">Aucune déclaration enregistrée</p></div></td></tr>
            ) : (hist.declarations || []).map(d => {
              const taux = d.ca > 0 ? (d.cotisationsCalculees / d.ca * 100).toFixed(1) : '—';
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.periode}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{d.ca?.toLocaleString('fr-FR')} €</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{d.cotisationsCalculees?.toLocaleString('fr-FR')} €</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{taux} %</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {d.dateLimite}
                    {d.joursRestants != null && d.statut !== 'payée' && (
                      <span style={{ marginLeft: 6 }}><CountdownBadge jours={d.joursRestants} /></span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${d.statut === 'payée' ? 'badge-green' : 'badge-yellow'}`}>
                      {d.statut === 'payée' ? '✓ Payée' : '⏳ En attente'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note bas de page */}
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.8, border: '1px solid var(--border-light)' }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Rappel réglementaire :</strong>{' '}
        En cas de difficulté de trésorerie, contactez votre URSSAF <strong>avant</strong> l'échéance pour demander un délai de paiement ou un échelonnement.
        Un accord amiable évite les pénalités (5% + 0,2%/mois). Votre expert-comptable peut vous accompagner dans cette démarche.
        Numéro national URSSAF : <strong>3957</strong> (0,12 €/min).
      </div>
    </div>
  );
}
