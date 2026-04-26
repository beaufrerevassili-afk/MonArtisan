import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';
import { IconPlus, IconDownload, IconRefresh, IconFinance, IconDocument, IconCheck, IconAlert, IconX, IconArrowUp, IconArrowDown, IconTrendUp } from '../../components/ui/Icons';
// Facturation.jsx est géré via DevisFactures.jsx, pas ici
import PipelineCommercial from '../../components/rh/PipelineCommercial';
import ExportCompta from '../../components/rh/ExportCompta';
import BiblothequePrix from '../../components/rh/BiblothequePrix';
import SuiviPaieModule from '../../components/rh/SuiviPaieModule';
import SimulateurTrajetModule from '../../components/rh/SimulateurTrajetModule';
// URSSAF intégré inline (ancien fichier supprimé)
function URSSAF() { return <div style={{ padding: 20, background: '#F8F7F4', borderRadius: 10, fontSize: 13, color: '#555', textAlign: 'center' }}>Module URSSAF — déclarations et cotisations disponibles prochainement.</div>; }

const PRINT_FACTURE = `@media print { body *{visibility:hidden!important;} #facture-print,#facture-print *{visibility:visible!important;} #facture-print{position:fixed;top:0;left:0;width:100%;padding:30px;background:#fff;font-family:Arial,sans-serif;} .no-print{display:none!important;} }`;

const TABS = [
  { id: 'vue-ensemble',   label: 'Vue d\'ensemble' },
  { id: 'tva-urssaf',     label: 'TVA & URSSAF' },
  { id: 'comptabilite',   label: 'Comptabilité' },
  { id: 'paie',           label: 'Paie' },
];

const STATUT_DEVIS = {
  brouillon:  { cls: 'badge badge-gray',   label: 'Brouillon'  },
  'envoyé':   { cls: 'badge badge-blue',   label: 'Envoyé'     },
  'accepté':  { cls: 'badge badge-green',  label: 'Accepté'    },
  'refusé':   { cls: 'badge badge-red',    label: 'Refusé'     },
  en_attente: { cls: 'badge badge-yellow', label: 'En attente' },
  'payée':    { cls: 'badge badge-green',  label: 'Payée'      },
  en_retard:  { cls: 'badge badge-red',    label: 'En retard'  },
};

function StatutBadge({ statut }) {
  const s = STATUT_DEVIS[statut];
  return <span className={s?.cls || 'badge badge-gray'}>{s?.label || statut}</span>;
}

const DEMO_FINANCE = {
  chiffreAffaires: { total: 142_800, facturesEmises: 38, montantEnAttente: 18_500, totalPrecedent: 118_400 },
  devis: { acceptes: 24, tauxConversion: 68, tauxPrecedent: 61 },
  marge: 31_200, margePrecedente: 24_900,
  mensuel: [
    { mois: 'Oct', ca: 9_800,  charges: 6_500 },
    { mois: 'Nov', ca: 12_400, charges: 7_800 },
    { mois: 'Déc', ca: 8_600,  charges: 5_200 },
    { mois: 'Jan', ca: 14_200, charges: 9_100 },
    { mois: 'Fév', ca: 16_500, charges: 10_200 },
    { mois: 'Mar', ca: 19_800, charges: 11_800 },
  ],
  repartition: [
    { label: 'Maçonnerie',  pct: 38, color: '#5B5BD6', ca: 54_264 },
    { label: 'Plomberie',   pct: 22, color: '#34C759', ca: 31_416 },
    { label: 'Électricité', pct: 18, color: '#FF9500', ca: 25_704 },
    { label: 'Peinture',    pct: 14, color: '#AF52DE', ca: 19_992 },
    { label: 'Autres',      pct: 8,  color: '#636363', ca: 11_424 },
  ],
  topClients: [
    { nom: 'Copropriété Les Acacias',      ca: 28_400, factures: 6,  taux: 100, ville: 'Marseille 6e' },
    { nom: 'Résidence du Parc',    ca: 19_800, factures: 4,  taux: 100, ville: 'Aix-en-Provence'  },
    { nom: 'M. & Mme Bertrand',    ca: 14_500, factures: 3,  taux: 67,  ville: 'Aubagne'  },
    { nom: 'SARL Dupont Immo',     ca: 12_900, factures: 5,  taux: 80,  ville: 'La Ciotat'   },
    { nom: 'Copropriété Voltaire', ca: 9_200,  factures: 2,  taux: 100, ville: 'Marseille 12e'  },
  ],
};

// Données de trésorerie prévisionnelle
const DEMO_TRESORERIE = {
  soldeActuel: 42_800,
  encaissementsAttendus: [
    { label: 'FAC-2025-038 · Copropriété Les Acacias',   montant: 8_400, datePrevu: '2025-04-10', statut: 'facturé',   joursRestants: 14 },
    { label: 'FAC-2025-037 · Résidence du Parc', montant: 5_200, datePrevu: '2025-04-18', statut: 'relancé',   joursRestants: 22 },
    { label: 'FAC-2025-036 · M. Bertrand',       montant: 3_800, datePrevu: '2025-04-30', statut: 'facturé',   joursRestants: 34 },
    { label: 'Acompte Devis #041',               montant: 4_500, datePrevu: '2025-05-05', statut: 'en attente', joursRestants: 39 },
    { label: 'FAC-2025-034 · Copropriété Vol.',  montant: 9_200, datePrevu: '2025-05-15', statut: 'en retard',  joursRestants: -5  },
  ],
  decaissementsPrevis: [
    { label: 'Salaires avril 2025',       montant: 12_400, datePrevu: '2025-04-28', categorie: 'salaires'    },
    { label: 'Charges URSSAF T1 2025',    montant: 5_940,  datePrevu: '2025-04-15', categorie: 'urssaf'      },
    { label: 'Fournisseur Matériaux SA',  montant: 3_200,  datePrevu: '2025-04-20', categorie: 'fournisseur' },
    { label: 'Assurance RC Pro',          montant: 820,    datePrevu: '2025-05-01', categorie: 'assurance'   },
    { label: 'Leasing véhicule',          montant: 680,    datePrevu: '2025-04-05', categorie: 'charges'     },
  ],
  previsionnel3Mois: [
    { mois: 'Avril',   encaissements: 21_900, decaissements: 22_040, solde: 42_660 },
    { mois: 'Mai',     encaissements: 18_400, decaissements: 14_800, solde: 46_260 },
    { mois: 'Juin',    encaissements: 22_500, decaissements: 16_200, solde: 52_560 },
  ],
};

const DEMO_SALARIES = {
  employes: [
    { employeId: 1, nom: 'Lucas Martin',  poste: 'Chef de chantier',  salaireBrutTotal: 3_200, cotisationsSalariales: 640,  salaireNet: 2_560 },
    { employeId: 2, nom: 'Karim Benali',  poste: 'Maçon qualifié',    salaireBrutTotal: 2_450, cotisationsSalariales: 490,  salaireNet: 1_960 },
    { employeId: 3, nom: 'Théo Leblanc', poste: 'Électricien N3',    salaireBrutTotal: 2_700, cotisationsSalariales: 540,  salaireNet: 2_160 },
    { employeId: 4, nom: 'Sarah Morel',  poste: 'Secrétaire admin.', salaireBrutTotal: 2_100, cotisationsSalariales: 420,  salaireNet: 1_680 },
  ],
  resume: { totalBrut: 10_450, totalNet: 8_360, totalChargesPatronales: 4_390 },
};

const FINANCE_TAB_MAP = { facturation:'vue-ensemble', factures:'vue-ensemble', tresorerie:'vue-ensemble', pipeline:'vue-ensemble', rapprochement:'comptabilite', urssaf:'tva-urssaf', tva:'tva-urssaf', salaires:'paie', bareme:'comptabilite', compta:'comptabilite', bilan:'comptabilite', prix:'comptabilite', 'suivi-paie':'paie', simulateur:'paie' };

export default function Finance() {
  const navigate = useNavigate();
  const isDemo = _isDemo();
  const [searchParams] = useSearchParams();
  const onglet = searchParams.get('onglet');
  const [tab, setTab] = useState(FINANCE_TAB_MAP[onglet] || 'vue-ensemble');

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && FINANCE_TAB_MAP[o]) setTab(FINANCE_TAB_MAP[o]);
    else if (!o) setTab('vue-ensemble');
  }, [searchParams]);
  const [data, setData]       = useState(null);
  const [devis, setDevis]     = useState([]);
  const [factures, setFac]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({
    clientId: '',
    lignes: [{ description: '', quantite: 1, prixUnitaire: 0, tva: 0.2 }],
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/finance/tableau-de-bord').catch(() => null),
      api.get('/finance/devis').catch(() => null),
      api.get('/finance/factures').catch(() => null),
    ]).then(([tdb, dv, fac]) => {
      setData(tdb?.data || null);
      setDevis(dv?.data?.devis || []);
      setFac(fac?.data?.factures || []);
    }).finally(() => setLoading(false));
  }, []);

  async function creerDevis(e) {
    e.preventDefault();
    try {
      await api.post('/finance/devis', form);
      const { data: dv } = await api.get('/finance/devis');
      setDevis(dv.devis);
      setForm({ clientId: '', lignes: [{ description: '', quantite: 1, prixUnitaire: 0, tva: 0.2 }] });
    } catch (err) {
      alert(err.response?.data?.erreur || 'Erreur lors de la création');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Finance</h1>
          <p style={{ marginTop: 4 }}>Vue d'ensemble financière, salaires et barèmes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" aria-label="Sections de la finance">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            className={`tab-item${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : (
        <>
          {/* ── Vue d'ensemble : tableau de bord + pipeline + trésorerie ── */}
          {tab === 'vue-ensemble' && (<>
            {(() => {
              const d = data || (isDemo ? DEMO_FINANCE : { chiffreAffaires: { total: 0, montantEnAttente: 0, facturesEmises: 0, totalPrecedent: 0 }, topClients: [], devisStats: { enCours: 0, acceptes: 0, refuses: 0 }, devis: { acceptes: 0, tauxConversion: 0, tauxPrecedent: 0 }, marge: 0, margePrecedente: 0, mensuel: [], repartition: [] });
              const noApiData = !data;
              const caTrend = d.chiffreAffaires?.totalPrecedent > 0
                ? ((d.chiffreAffaires.total - d.chiffreAffaires.totalPrecedent) / d.chiffreAffaires.totalPrecedent * 100).toFixed(1)
                : null;
              const margeTrend = d.margePrecedente > 0
                ? ((d.marge - d.margePrecedente) / d.margePrecedente * 100).toFixed(1)
                : null;
              const txTrend = d.devis?.tauxPrecedent != null
                ? (d.devis.tauxConversion - d.devis.tauxPrecedent)
                : null;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {isDemo && (
                    <div style={{ background: 'rgba(255,149,0,0.08)', borderRadius: 10, padding: '10px 16px', fontSize: '0.8125rem', color: '#7A5C00', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,149,0,0.2)' }}>
                      <span>📊</span> Données de démonstration — connectez l'API pour afficher vos chiffres réels.
                    </div>
                  )}

                  {/* Raccourcis */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {[
                      { label: 'Devis Pro', sub: 'Créer et gérer vos devis', icon: <IconDocument size={18} />, path: '/patron/devis-pro', bg: 'var(--primary-light)', fg: 'var(--primary)', border: 'rgba(91,91,214,0.2)' },
                      { label: 'Facturation', sub: 'Suivre vos factures', icon: <IconCheck size={18} />, path: '/patron/facturation', bg: 'rgba(52,199,89,0.08)', fg: '#1A7A3C', border: 'rgba(52,199,89,0.2)' },
                      { label: 'Trésorerie', sub: 'Flux entrants / sortants', icon: <IconTrendUp size={18} />, path: null, onClick: () => {}, bg: 'rgba(124,58,237,0.08)', fg: '#7C3AED', border: 'rgba(124,58,237,0.2)' },
                    ].map(({ label, sub, icon, path, onClick, bg, fg, border }) => (
                      <button key={label} onClick={onClick || (() => navigate(path))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: bg, border: `1px solid ${border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ color: fg }}>{icon}</span>
                        <div>
                          <p style={{ fontWeight: 700, color: fg, fontSize: '0.875rem' }}>{label}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub} →</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* KPI grid avec tendances */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 14 }}>
                    <KpiCard label="CA Total (12 mois)" valeur={`${(d.chiffreAffaires?.total || 0).toLocaleString('fr-FR')} €`} Icon={IconFinance} color="blue" trend={caTrend} trendLabel="vs période préc." />
                    <KpiCard label="Factures émises"    valeur={d.chiffreAffaires?.facturesEmises || 0}                          Icon={IconDocument} color="blue" />
                    <KpiCard label="En attente paiement" valeur={`${(d.chiffreAffaires?.montantEnAttente || 0).toLocaleString('fr-FR')} €`} Icon={IconAlert} color="red" />
                    <KpiCard label="Taux de conversion" valeur={`${d.devis?.tauxConversion || 0} %`} Icon={IconFinance} color={d.devis?.tauxConversion >= 60 ? 'green' : 'orange'} trend={txTrend} trendLabel="pts vs période préc." trendUnit="pts" />
                    <KpiCard label="Marge brute"        valeur={`${(d.marge || 0).toLocaleString('fr-FR')} €`} Icon={IconFinance} color="green" trend={margeTrend} trendLabel="vs période préc." />
                    <KpiCard label="Taux de marge"      valeur={d.chiffreAffaires?.total > 0 ? `${(d.marge / d.chiffreAffaires.total * 100).toFixed(1)} %` : '—'} Icon={IconTrendUp} color="blue" />
                  </div>

                  {/* Charts row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
                    {/* CA + Charges mensuel */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>CA vs Charges (6 mois)</div>
                        <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} /> CA
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,59,48,0.5)' }} /> Charges
                          </span>
                        </div>
                      </div>
                      {d.mensuel && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130 }}>
                          {d.mensuel.map((item, i) => {
                            const maxVal = Math.max(...d.mensuel.map(x => x.ca));
                            const hCa = Math.round((item.ca / maxVal) * 100);
                            const hCh = Math.round(((item.charges || 0) / maxVal) * 100);
                            const marge = item.ca - (item.charges || 0);
                            return (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                <div style={{ fontSize: '0.625rem', color: marge >= 0 ? '#1A7A3C' : '#FF3B30', fontWeight: 700 }}>
                                  {marge >= 0 ? '+' : ''}{(marge / 1000).toFixed(0)}k
                                </div>
                                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: 1, height: 100 }}>
                                  <div style={{ flex: 1, height: `${hCa}%`, background: i === d.mensuel.length - 1 ? 'var(--primary)' : 'rgba(91,91,214,0.35)', borderRadius: '3px 3px 0 0', minHeight: 3 }} />
                                  <div style={{ flex: 1, height: `${hCh}%`, background: 'rgba(255,59,48,0.4)', borderRadius: '3px 3px 0 0', minHeight: 3 }} />
                                </div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{item.mois}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Répartition par activité — calculée depuis données réelles */}
                    {(() => {
                      const COLORS = ['#5B5BD6','#34C759','#FF9500','#AF52DE','#636363','#DC2626','#2563EB','#D97706'];
                      // Lire devis signés + chantiers pour calculer CA par métier
                      const lsDevisF = demoGet('freample_devis', []);
                      const lsChantiersF = demoGet('freample_chantiers_custom', []);
                      const profilF = (() => { try { return JSON.parse(localStorage.getItem('freample_profil_patron') || '{}'); } catch { return {}; } })();
                      const metiersEntreprise = profilF.metiers || [];
                      // Calculer CA par métier depuis les devis signés
                      const caParMetier = {};
                      lsDevisF.filter(dv => dv.statut === 'signe' || dv.statut === 'accepte').forEach(dv => {
                        const m = dv.metier || 'Autre';
                        caParMetier[m] = (caParMetier[m] || 0) + (Number(dv.montantTTC) || 0);
                      });
                      // Compléter avec chantiers qui ont un métier
                      lsChantiersF.forEach(ch => {
                        if (ch.metier && !caParMetier[ch.metier] && ch.budget) {
                          caParMetier[ch.metier] = (caParMetier[ch.metier] || 0) + (Number(ch.budget) || 0);
                        }
                      });
                      // Si aucune donnée réelle, utiliser les données demo
                      const hasRealData = Object.keys(caParMetier).length > 0;
                      const repartition = hasRealData
                        ? Object.entries(caParMetier).map(([label, ca], i) => ({ label, ca, color: COLORS[i % COLORS.length] }))
                        : (d.repartition || []);
                      const totalCA = repartition.reduce((s, r) => s + (r.ca || 0), 0);
                      const repartitionPct = repartition.map(r => ({ ...r, pct: totalCA > 0 ? Math.round(r.ca / totalCA * 100) : 0 }));
                      // Ajouter les métiers de l'entreprise sans CA
                      metiersEntreprise.forEach(m => {
                        if (!repartitionPct.find(r => r.label.toLowerCase() === m.toLowerCase())) {
                          repartitionPct.push({ label: m, ca: 0, pct: 0, color: '#E8E6E1' });
                        }
                      });
                      return (
                        <div className="card" style={{ padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>Répartition par activité</div>
                            {!hasRealData && <span style={{ fontSize: 10, color: '#D97706', fontWeight: 600 }}>Données exemple</span>}
                            {hasRealData && <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>Données réelles</span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {repartitionPct.map((r, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text)', width: 100, flexShrink: 0, fontWeight: 500 }}>{r.label}</div>
                                <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 3, transition: 'width 0.6s' }} />
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', width: 36, textAlign: 'right', flexShrink: 0 }}>{r.pct}%</div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: 70, textAlign: 'right', flexShrink: 0 }}>{(r.ca || 0).toLocaleString('fr-FR')}€</div>
                              </div>
                            ))}
                          </div>
                          {totalCA > 0 && (
                            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                              Total : <strong style={{ color: 'var(--text)' }}>{totalCA.toLocaleString('fr-FR')} €</strong>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Top clients */}
                  {d.topClients?.length > 0 && (
                    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="section-title">Top clients (12 mois)</h3>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Par CA généré</span>
                      </div>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Ville</th>
                            <th style={{ textAlign: 'right' }}>CA généré</th>
                            <th style={{ textAlign: 'right' }}>Factures</th>
                            <th>Taux paiement</th>
                            <th style={{ textAlign: 'right' }}>% du CA total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.topClients.map((c, i) => {
                            const pct = d.chiffreAffaires?.total > 0 ? (c.ca / d.chiffreAffaires.total * 100).toFixed(1) : 0;
                            return (
                              <tr key={i}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>
                                      {i + 1}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{c.nom}</span>
                                  </div>
                                </td>
                                <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{c.ville}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700 }}>{c.ca.toLocaleString('fr-FR')} €</td>
                                <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{c.factures}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                                      <div style={{ width: `${c.taux}%`, height: '100%', background: c.taux >= 90 ? '#34C759' : c.taux >= 60 ? '#FF9500' : '#FF3B30', borderRadius: 3 }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.taux >= 90 ? '#1A7A3C' : c.taux >= 60 ? '#7A5C00' : '#CC3B2F', width: 32 }}>{c.taux}%</span>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{pct}%</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Retenues de garantie */}
                  <RetenuesDeGarantie />
                </div>
              );
            })()}

            {/* Pipeline commercial */}
            <div style={{ marginTop: 24 }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>Pipeline commercial</h3>
              <PipelineCommercial />
            </div>

            {/* Trésorerie */}
            <div style={{ marginTop: 24 }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>Trésorerie</h3>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', color: '#6E6E73', fontSize: 13 }}>
                Prévision de trésorerie disponible après connexion du compte bancaire.
              </div>
            </div>
          </>)}

          {/* ── TVA & URSSAF ── */}
          {tab === 'tva-urssaf' && (<>
            <div>
              <h3 className="section-title" style={{ marginBottom: 12 }}>TVA (CA3)</h3>
              <DeclarationTVACA3 />
            </div>
            <div style={{ marginTop: 24 }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>URSSAF</h3>
              <URSSAF />
            </div>
          </>)}

          {/* ── Comptabilité avec sous-onglets ── */}
          {tab === 'comptabilite' && (() => {
            const subCompta = form.subCompta || 'journal';
            return <>
              <div style={{ display: 'flex', gap: 4, background: '#F2F2F7', borderRadius: 10, padding: 3, marginBottom: 20, width: 'fit-content' }}>
                {[
                  { id: 'journal', label: 'Journal & FEC' },
                  { id: 'bilan', label: 'Bilan' },
                  { id: 'outils', label: 'Outils' },
                ].map(s => (
                  <button key={s.id} onClick={() => setForm(f => ({ ...f, subCompta: s.id }))} style={{
                    padding: '7px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: subCompta === s.id ? '#fff' : 'transparent',
                    color: subCompta === s.id ? '#1C1C1E' : '#6E6E73',
                    boxShadow: subCompta === s.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>{s.label}</button>
                ))}
              </div>

              {subCompta === 'journal' && <ExportCompta />}

              {subCompta === 'bilan' && <>
                <BilanResultatView />
                <div style={{ marginTop: 24 }}>
                  <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', color: '#6E6E73', fontSize: 13 }}>
                    Le rapprochement bancaire sera disponible après connexion de votre compte bancaire (synchronisation DSP2).
                  </div>
                </div>
              </>}

              {subCompta === 'outils' && <>
                <BaremePaiementView />
                <div style={{ marginTop: 24 }}>
                  <BiblothequePrix />
                </div>
              </>}
            </>;
          })()}

          {/* ── Paie ── */}
          {tab === 'paie' && (<>
            {/* Heures terrain from employee pointages */}
            {(() => {
              const chantierKeys = _isDemo() ? Object.keys(localStorage).filter(k => k.startsWith('freample_heures_')) : [];
              const heuresParChantier = chantierKeys.map(k => {
                const cid = k.replace('freample_heures_', '');
                const data = JSON.parse(localStorage.getItem(k) || '{}');
                const totalH = Object.values(data).reduce((s, days) => s + Object.values(days || {}).reduce((a, h) => a + (parseFloat(h) || 0), 0), 0);
                return { chantierId: cid, heures: totalH };
              }).filter(c => c.heures > 0);
              // Also read pointages for total hours
              const pointages = demoGet('freample_pointages', []);
              const pointagesByDate = {};
              pointages.forEach(p => {
                if (!pointagesByDate[p.date]) pointagesByDate[p.date] = [];
                pointagesByDate[p.date].push(p);
              });
              let totalPointageMinutes = 0;
              Object.values(pointagesByDate).forEach(dayEntries => {
                for (let i = 0; i < dayEntries.length; i++) {
                  const a = dayEntries.find((p, j) => j >= i && p.type === 'arrivee');
                  if (!a) break;
                  const aIdx = dayEntries.indexOf(a);
                  const d = dayEntries.find((p, j) => j > aIdx && p.type === 'depart');
                  if (!d) break;
                  const [ah, am] = a.heure.split(':').map(Number);
                  const [dh, dm] = d.heure.split(':').map(Number);
                  totalPointageMinutes += (dh * 60 + dm) - (ah * 60 + am);
                  i = dayEntries.indexOf(d);
                }
              });
              const totalPointageH = totalPointageMinutes > 0 ? `${Math.floor(totalPointageMinutes / 60)}h${String(totalPointageMinutes % 60).padStart(2, '0')}` : null;
              return (heuresParChantier.length > 0 || totalPointageH) ? (
                <div className="card" style={{ marginBottom: 20, padding: 18 }}>
                  <h3 className="section-title" style={{ marginBottom: 12, fontSize: '0.95rem' }}>Heures terrain</h3>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {totalPointageH && (
                      <div style={{ padding: '10px 16px', background: 'rgba(37,99,235,0.08)', borderRadius: 10, minWidth: 120 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Pointages employ\u00e9s</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{totalPointageH}</div>
                      </div>
                    )}
                    {heuresParChantier.map(hc => (
                      <div key={hc.chantierId} style={{ padding: '10px 16px', background: 'rgba(37,99,235,0.06)', borderRadius: 10, minWidth: 120 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Chantier #{hc.chantierId}</div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{hc.heures.toFixed(1)}h</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            <div>
              <h3 className="section-title" style={{ marginBottom: 12 }}>Salaires</h3>
              <SalairesView />
            </div>
            <div style={{ marginTop: 24 }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>Suivi de paie</h3>
              <SuiviPaieModule />
            </div>
            <div style={{ marginTop: 24 }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>Simulateur trajet</h3>
              <SimulateurTrajetModule />
            </div>
          </>)}
        </>
      )}
    </div>
  );
}

/* ── Trésorerie ── */
function TrésorerieView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/finance/tresorerie').catch(() => null)
      .then(r => setData(r?.data || null))
      .finally(() => setLoading(false));
  }, []);

  const isDemoToken = _isDemo();
  const d = data || (isDemoToken ? DEMO_TRESORERIE : { soldeActuel: 0, encaissementsAttendus: [], decaissementsPrevis: [], previsionnel3Mois: [] });
  const isDemo = !data;

  const totalEncaissements = d.encaissementsAttendus.reduce((s, e) => s + e.montant, 0);
  const totalDecaissements = d.decaissementsPrevis.reduce((s, e) => s + e.montant, 0);
  const soldeProj = d.soldeActuel + totalEncaissements - totalDecaissements;

  const CAT_COLORS = {
    salaires: { bg: 'rgba(91,91,214,0.1)', fg: 'var(--primary)', label: 'Salaires' },
    urssaf:   { bg: 'rgba(255,149,0,0.1)', fg: '#7A5C00',        label: 'URSSAF' },
    fournisseur: { bg: 'rgba(255,59,48,0.1)', fg: 'var(--danger)', label: 'Fournisseur' },
    assurance:{ bg: 'rgba(52,199,89,0.1)', fg: '#1A7A3C',        label: 'Assurance' },
    charges:  { bg: 'rgba(142,142,147,0.1)', fg: '#6E6E73',      label: 'Charges fixes' },
  };

  const STATUT_ENCAISSE = {
    'facturé':    { bg: 'rgba(91,91,214,0.1)',  fg: 'var(--primary)' },
    'relancé':    { bg: 'rgba(255,149,0,0.1)',  fg: '#7A5C00'        },
    'en attente': { bg: 'rgba(142,142,147,0.1)',fg: '#6E6E73'        },
    'en retard':  { bg: 'rgba(255,59,48,0.1)',  fg: 'var(--danger)'  },
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isDemo && (
        <div style={{ background: 'rgba(255,149,0,0.08)', borderRadius: 10, padding: '10px 16px', fontSize: '0.8125rem', color: '#7A5C00', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,149,0,0.2)' }}>
          <span>📊</span> Données de démonstration — connectez l'API pour afficher votre trésorerie réelle.
        </div>
      )}

      {/* Soldes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {[
          { label: 'Solde actuel',             val: d.soldeActuel,       color: 'var(--primary)', sub: 'Compte courant' },
          { label: 'Encaissements attendus',    val: totalEncaissements,  color: '#1A7A3C',        sub: `${d.encaissementsAttendus.length} factures en cours` },
          { label: 'Décaissements prévus',      val: -totalDecaissements, color: 'var(--danger)',  sub: `${d.decaissementsPrevis.length} échéances` },
        ].map(({ label, val, color, sub }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: '1.625rem', fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {val >= 0 ? '' : '−'}{Math.abs(val).toLocaleString('fr-FR')} €
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Solde projeté + barre */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Solde projeté après toutes les échéances</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: soldeProj >= 0 ? '#1A7A3C' : 'var(--danger)', letterSpacing: '-0.04em', marginTop: 4 }}>
              {soldeProj.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Variation</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: soldeProj >= d.soldeActuel ? '#1A7A3C' : 'var(--danger)' }}>
              {soldeProj >= d.soldeActuel ? '+' : ''}{(soldeProj - d.soldeActuel).toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
        {/* Stacked bar */}
        <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', background: 'var(--bg)', display: 'flex' }}>
          <div style={{ flex: d.soldeActuel, background: 'var(--primary)', minWidth: 3 }} title={`Solde actuel : ${d.soldeActuel.toLocaleString('fr-FR')} €`} />
          <div style={{ flex: totalEncaissements, background: '#34C759', minWidth: 3 }} title={`Encaissements : +${totalEncaissements.toLocaleString('fr-FR')} €`} />
          <div style={{ flex: totalDecaissements, background: '#FF3B30', minWidth: 3 }} title={`Décaissements : -${totalDecaissements.toLocaleString('fr-FR')} €`} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {[
            { label: 'Solde actuel', color: 'var(--primary)' },
            { label: 'Encaissements', color: '#34C759' },
            { label: 'Décaissements', color: '#FF3B30' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />{l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Prévisionnel 3 mois */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Prévisionnel trésorerie — 3 prochains mois</h3>
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 100, marginBottom: 8 }}>
          {d.previsionnel3Mois.map((m, i) => {
            const maxVal = Math.max(...d.previsionnel3Mois.map(x => Math.max(x.encaissements, x.decaissements)));
            const hEnc = Math.round((m.encaissements / maxVal) * 90);
            const hDec = Math.round((m.decaissements / maxVal) * 90);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '80%', display: 'flex', alignItems: 'flex-end', gap: 2, height: 90 }}>
                  <div style={{ flex: 1, height: `${hEnc}%`, background: 'rgba(52,199,89,0.6)', borderRadius: '3px 3px 0 0', minHeight: 4 }} title={`Encaissements : ${m.encaissements.toLocaleString('fr-FR')} €`} />
                  <div style={{ flex: 1, height: `${hDec}%`, background: 'rgba(255,59,48,0.5)', borderRadius: '3px 3px 0 0', minHeight: 4 }} title={`Décaissements : ${m.decaissements.toLocaleString('fr-FR')} €`} />
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{m.mois}</div>
                <div style={{ fontSize: '0.6875rem', color: m.solde >= d.soldeActuel ? '#1A7A3C' : '#FF3B30', fontWeight: 700 }}>
                  {(m.solde / 1000).toFixed(0)}k€
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Encaissements attendus */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Encaissements attendus</h3>
            <span style={{ fontWeight: 700, color: '#1A7A3C' }}>+{totalEncaissements.toLocaleString('fr-FR')} €</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {d.encaissementsAttendus.map((e, i) => {
              const sc = STATUT_ENCAISSE[e.statut] || STATUT_ENCAISSE['facturé'];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < d.encaissementsAttendus.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Prévu le {new Date(e.datePrevu).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: e.joursRestants < 0 ? 'var(--danger)' : '#1A7A3C' }}>
                      +{e.montant.toLocaleString('fr-FR')} €
                    </p>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '1px 6px', borderRadius: 8, background: sc.bg, color: sc.fg }}>{e.statut}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Décaissements prévus */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Décaissements prévus</h3>
            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>−{totalDecaissements.toLocaleString('fr-FR')} €</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {d.decaissementsPrevis.map((e, i) => {
              const cc = CAT_COLORS[e.categorie] || CAT_COLORS['charges'];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < d.decaissementsPrevis.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: cc.bg, color: cc.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.625rem', fontWeight: 700 }}>
                    {cc.label.slice(0, 3).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(e.datePrevu).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--danger)', flexShrink: 0 }}>−{e.montant.toLocaleString('fr-FR')} €</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Factures ── */
const LIGNE_VIDE = { designation: '', quantite: 1, unite: 'u', prixHT: '', tva: 20 };
const MENTIONS_LEGALES = [
  'Conformément à l\'art. L441-6 du Code de Commerce, tout retard de paiement entraîne des pénalités de retard exigibles sans rappel à un taux égal à 3 fois le taux d\'intérêt légal.',
  'Indemnité forfaitaire pour frais de recouvrement : 40 € (Décret n°2012-1115).',
  'Pas d\'escompte pour paiement anticipé.',
  'TVA non applicable, article 293B du CGI — si applicable.',
];

function FacturesView({ factures, setFac }) {
  const [mode, setMode] = useState('list'); // list | create | preview
  const [factureEnCours, setFactureEnCours] = useState(null);
  const [form, setForm] = useState({
    clientNom: '', clientAdresse: '', clientVille: '', clientSiret: '',
    dateEmission: new Date().toISOString().split('T')[0],
    dateEcheance: '',
    lignes: [{ ...LIGNE_VIDE }],
    remise: 0,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = PRINT_FACTURE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const totalHT = form.lignes.reduce((s, l) => s + (Number(l.quantite) * Number(l.prixHT) || 0), 0);
  const remiseMt = totalHT * (Number(form.remise) / 100);
  const baseHT = totalHT - remiseMt;
  const totalTVA = form.lignes.reduce((s, l) => s + ((Number(l.quantite) * Number(l.prixHT) || 0) * (Number(l.tva) / 100)), 0);
  const totalTTC = baseHT + totalTVA;

  function setLigne(i, key, val) {
    setForm(p => { const ls = [...p.lignes]; ls[i] = { ...ls[i], [key]: val }; return { ...p, lignes: ls }; });
  }
  function addLigne() { setForm(p => ({ ...p, lignes: [...p.lignes, { ...LIGNE_VIDE }] })); }
  function removeLigne(i) { setForm(p => ({ ...p, lignes: p.lignes.filter((_, j) => j !== i) })); }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, montantHT: baseHT, montantTVA: totalTVA, montantTTC: totalTTC };
      const r = await api.post('/finance/factures', payload);
      const newFac = r.data.facture || { ...payload, id: Date.now(), numero: `FAC-${Date.now()}`, statut: 'en_attente', creeLe: new Date().toISOString() };
      setFac(prev => [newFac, ...prev]);
      setFactureEnCours(newFac);
      setMode('preview');
    } catch {
      setFactureEnCours({ ...form, id: Date.now(), numero: `FAC-${Date.now().toString().slice(-6)}`, statut: 'en_attente', montantHT: baseHT, montantTVA: totalTVA, montantTTC: totalTTC, creeLe: new Date().toISOString() });
      setMode('preview');
    } finally { setSaving(false); }
  }

  async function handleEnvoyer() {
    setEnvoi(true);
    await api.put(`/finance/factures/${factureEnCours.id}/envoyer`).catch(() => {});
    setTimeout(() => { setEnvoi(false); alert('Facture envoyée au client.'); setMode('list'); }, 1200);
  }

  if (mode === 'preview' && factureEnCours) {
    const f = factureEnCours;
    const lignes = form.lignes;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setMode('list')} style={{ padding: '8px 16px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>← Retour</button>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', border: 'none', borderRadius: 10, background: '#1C1C1E', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><IconDownload size={14} /> Télécharger PDF</button>
          <button onClick={handleEnvoyer} disabled={envoi} style={{ padding: '8px 16px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{envoi ? 'Envoi…' : 'Envoyer au client'}</button>
        </div>

        <div id="facture-print" style={{ background: '#fff', borderRadius: 14, padding: 40, boxShadow: '0 1px 8px rgba(0,0,0,0.10)', maxWidth: 760, margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#1C1C1E' }}>FACTURE</div>
              <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 4 }}>{f.numero}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Bernard Martin BTP</div>
              <div style={{ color: '#6E6E73' }}>12 rue des Artisans, 13005 Marseille</div>
              <div style={{ color: '#6E6E73' }}>SIRET : 123 456 789 00012</div>
              <div style={{ color: '#6E6E73' }}>APE : 4391A · N° TVA : FR12 123456789</div>
            </div>
          </div>

          {/* Client + dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>
            <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Facturé à</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{form.clientNom || '—'}</div>
              <div style={{ fontSize: 13, color: '#6E6E73' }}>{form.clientAdresse}</div>
              <div style={{ fontSize: 13, color: '#6E6E73' }}>{form.clientVille}</div>
              {form.clientSiret && <div style={{ fontSize: 12, color: '#636363', marginTop: 4 }}>SIRET : {form.clientSiret}</div>}
            </div>
            <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Informations</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ color: '#6E6E73' }}>Date d'émission</span><span style={{ fontWeight: 600 }}>{new Date(form.dateEmission).toLocaleDateString('fr-FR')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#6E6E73' }}>Échéance</span><span style={{ fontWeight: 600, color: '#FF3B30' }}>{form.dateEcheance ? new Date(form.dateEcheance).toLocaleDateString('fr-FR') : 'À réception'}</span></div>
            </div>
          </div>

          {/* Lignes */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
            <thead>
              <tr style={{ background: '#1C1C1E', color: '#fff' }}>
                {['Désignation', 'Qté', 'Unité', 'P.U. HT', 'TVA %', 'Total HT'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: h === 'Désignation' ? 'left' : 'right', fontWeight: 700, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => {
                const ht = Number(l.quantite) * Number(l.prixHT) || 0;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F2F2F7', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '9px 12px' }}>{l.designation}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>{l.quantite}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#6E6E73' }}>{l.unite}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>{Number(l.prixHT).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#6E6E73' }}>{l.tva} %</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>{ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ width: 280 }}>
              {[
                { label: 'Total HT', val: totalHT, bold: false },
                form.remise > 0 && { label: `Remise (${form.remise}%)`, val: -remiseMt, bold: false, color: '#34C759' },
                form.remise > 0 && { label: 'Base HT', val: baseHT, bold: false },
                { label: 'TVA', val: totalTVA, bold: false },
              ].filter(Boolean).map(({ label, val, bold, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: '1px solid #F2F2F7' }}>
                  <span style={{ color: '#6E6E73' }}>{label}</span>
                  <span style={{ fontWeight: bold ? 800 : 600, color: color || '#1C1C1E' }}>{val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#5B5BD6', borderRadius: 8, marginTop: 8 }}>
                <span style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>NET À PAYER TTC</span>
                <span style={{ fontWeight: 800, color: '#fff', fontSize: 17 }}>{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>

          {/* Mentions légales */}
          <div style={{ borderTop: '2px solid #E5E5EA', paddingTop: 16, fontSize: 10.5, color: '#636363', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, fontSize: 11, color: '#6E6E73', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mentions légales</div>
            {MENTIONS_LEGALES.map((m, i) => <div key={i} style={{ marginBottom: 3 }}>• {m}</div>)}
            <div style={{ marginTop: 8 }}>Votre entreprise — Mentions légales générées depuis votre profil</div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={() => setMode('list')} style={{ padding: '8px 16px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>← Annuler</button>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Nouvelle facture</h2>
        </div>

        {/* Client */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5 }}>Client</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">Nom / Raison sociale *</label><input className="input" required value={form.clientNom} onChange={e => setForm(p => ({ ...p, clientNom: e.target.value }))} placeholder="Nom du client" /></div>
            <div><label className="label">SIRET client</label><input className="input" value={form.clientSiret} onChange={e => setForm(p => ({ ...p, clientSiret: e.target.value }))} placeholder="123 456 789 00012" /></div>
            <div><label className="label">Adresse</label><input className="input" value={form.clientAdresse} onChange={e => setForm(p => ({ ...p, clientAdresse: e.target.value }))} placeholder="12 rue du Client" /></div>
            <div><label className="label">Code postal / Ville</label><input className="input" value={form.clientVille} onChange={e => setForm(p => ({ ...p, clientVille: e.target.value }))} placeholder="13001 Marseille" /></div>
            <div><label className="label">Date d'émission</label><input type="date" className="input" value={form.dateEmission} onChange={e => setForm(p => ({ ...p, dateEmission: e.target.value }))} /></div>
            <div><label className="label">Date d'échéance</label><input type="date" className="input" value={form.dateEcheance} onChange={e => setForm(p => ({ ...p, dateEcheance: e.target.value }))} /></div>
          </div>
        </div>

        {/* Lignes */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5 }}>Prestations</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #F2F2F7' }}>
                {['Désignation', 'Qté', 'Unité', 'P.U. HT (€)', 'TVA %', 'Total HT', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#636363' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.lignes.map((l, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F8F8F8' }}>
                  <td style={{ padding: '6px 8px', minWidth: 200 }}><input className="input" style={{ padding: '6px 8px', fontSize: 13 }} value={l.designation} onChange={e => setLigne(i, 'designation', e.target.value)} placeholder="Description de la prestation" /></td>
                  <td style={{ padding: '6px 8px', width: 70 }}><input type="number" className="input" style={{ padding: '6px 8px', fontSize: 13 }} value={l.quantite} onChange={e => setLigne(i, 'quantite', e.target.value)} /></td>
                  <td style={{ padding: '6px 8px', width: 80 }}>
                    <select className="input" style={{ padding: '6px 8px', fontSize: 13 }} value={l.unite} onChange={e => setLigne(i, 'unite', e.target.value)}>
                      {['u','h','m²','m³','m','j','forfait','kg'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 8px', width: 110 }}><input type="number" className="input" style={{ padding: '6px 8px', fontSize: 13 }} value={l.prixHT} onChange={e => setLigne(i, 'prixHT', e.target.value)} /></td>
                  <td style={{ padding: '6px 8px', width: 80 }}>
                    <select className="input" style={{ padding: '6px 8px', fontSize: 13 }} value={l.tva} onChange={e => setLigne(i, 'tva', e.target.value)}>
                      {[0, 5.5, 10, 20].map(r => <option key={r} value={r}>{r} %</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>{((Number(l.quantite) * Number(l.prixHT)) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                  <td style={{ padding: '6px 4px' }}><button type="button" onClick={() => removeLigne(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30' }}><IconX size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <button type="button" onClick={addLigne} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px dashed #C7C7CC', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#5B5BD6' }}><IconPlus size={13} /> Ajouter une ligne</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#6E6E73' }}>Remise</label>
              <input type="number" className="input" style={{ width: 70, padding: '6px 10px', textAlign: 'right' }} value={form.remise} onChange={e => setForm(p => ({ ...p, remise: e.target.value }))} min={0} max={100} />
              <span style={{ fontSize: 13 }}>%</span>
            </div>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <div style={{ width: 260 }}>
              {[{ l: 'Total HT', v: totalHT }, { l: `Remise (${form.remise}%)`, v: -remiseMt }, { l: 'Base HT', v: baseHT }, { l: 'Total TVA', v: totalTVA }].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: '1px solid #F2F2F7' }}>
                  <span style={{ color: '#6E6E73' }}>{l}</span>
                  <span>{v.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #1C1C1E', marginTop: 4 }}>
                <span style={{ fontWeight: 800 }}>TOTAL TTC</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#5B5BD6' }}>{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card" style={{ padding: 22 }}>
          <label className="label">Notes / Conditions particulières</label>
          <textarea className="input" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Conditions de règlement, informations complémentaires…" style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={() => setMode('list')} style={{ padding: '10px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: saving ? '#C7C7CC' : '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            {saving ? 'Création…' : 'Créer la facture'}
          </button>
        </div>
      </form>
    );
  }

  // List view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setMode('create')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          <IconPlus size={14} /> Nouvelle facture
        </button>
      </div>
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <span className="section-title">{factures.length} facture{factures.length !== 1 ? 's' : ''}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Numéro</th><th>Client</th><th>Montant TTC</th><th>Statut</th><th>Échéance</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {factures.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><p className="empty-state-text">Aucune facture — cliquez sur "Nouvelle facture"</p></div></td></tr>
            ) : factures.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 600 }}>{f.numero}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{f.clientNom || '—'}</td>
                <td style={{ fontWeight: 700 }}>{Number(f.montantTTC || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                <td><StatutBadge statut={f.statut} /></td>
                <td style={{ color: 'var(--text-tertiary)' }}>{f.dateEcheance || '—'}</td>
                <td>
                  {f.statut === 'en_attente' && (
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => api.put(`/finance/factures/${f.id}/relancer`).then(() => alert('Relance envoyée'))}>
                      <IconRefresh size={13} /> Relancer
                    </button>
                  )}
                  <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem', marginLeft: 4 }} onClick={() => { setFactureEnCours(f); setForm({ ...f, lignes: f.lignes || [{ ...LIGNE_VIDE }] }); setMode('preview'); }}>
                    <IconDocument size={13} /> Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalairesView() {
  const [mois, setMois]       = useState(new Date().getMonth() + 1);
  const [annee, setAnnee]     = useState(new Date().getFullYear());
  const [calcul, setCalcul]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo]   = useState(false);
  const [paid, setPaid]       = useState(false);
  const [depotAdresse, setDepotAdresse] = useState(() => localStorage.getItem('btp_depot_adresse') || '');
  const [trajets, setTrajets] = useState({});

  async function calculer() {
    setLoading(true);
    setPaid(false);
    try {
      const { data } = await api.post('/finance/salaires/calculer', { mois, annee });
      setCalcul(data);
      setIsDemo(false);
    } catch {
      // Fallback to demo data with selected period label
      const moisLabel = new Date(0, mois - 1).toLocaleString('fr-FR', { month: 'long' });
      const isDemoToken = _isDemo();
      setCalcul(isDemoToken ? { ...DEMO_SALARIES, periode: `${moisLabel} ${annee}` } : { employes: [], resume: { totalBrut: 0, totalNet: 0, totalChargesPatronales: 0 }, periode: `${moisLabel} ${annee}` });
      setIsDemo(isDemoToken);
    } finally {
      setLoading(false);
    }
  }

  async function payer() {
    try {
      await api.post('/finance/salaires/payer', { mois, annee });
    } catch { /* demo mode */ }
    // Écriture comptable auto — salaires
    const totalBrut = calcul?.resume?.totalBrut || 0;
    const totalNets = calcul?.resume?.totalNet || 0;
    const totalChPat = calcul?.resume?.totalChargesPatronales || 0;
    const ecritures = demoGet('freample_ecritures', []);
    const ref = `SAL-${String(annee)}-${String(mois).padStart(2, '0')}`;
    ecritures.push(
      { date: new Date().toISOString().slice(0,10), journal: 'OD', piece: ref, compte: '641000', libelle: 'Salaires bruts', debit: totalBrut, credit: 0 },
      { date: new Date().toISOString().slice(0,10), journal: 'OD', piece: ref, compte: '645000', libelle: 'Charges sociales patronales', debit: totalChPat, credit: 0 },
      { date: new Date().toISOString().slice(0,10), journal: 'OD', piece: ref, compte: '512000', libelle: 'Virement salaires nets', debit: 0, credit: totalNets },
      { date: new Date().toISOString().slice(0,10), journal: 'OD', piece: ref, compte: '401000', libelle: 'Organismes sociaux', debit: 0, credit: totalBrut + totalChPat - totalNets },
    );
    demoSet('freample_ecritures', ecritures);
    setPaid(true);
  }

  function getBTPZoneRate(km) {
    const k = Number(km) || 0;
    if (k <= 10) return { zone: 'Zone 1', rate: 1.50 };
    if (k <= 20) return { zone: 'Zone 2', rate: 1.84 };
    if (k <= 30) return { zone: 'Zone 3', rate: 2.00 };
    if (k <= 40) return { zone: 'Zone 4', rate: 2.32 };
    if (k <= 50) return { zone: 'Zone 5', rate: 2.67 };
    return { zone: 'Zone 6', rate: 3.05 };
  }
  function getTrajet(employeId) { return trajets[employeId] || { km: 0, jours: 22, inclure: false }; }
  function setTrajet(employeId, patch) { setTrajets(p => ({ ...p, [employeId]: { ...getTrajet(employeId), ...patch } })); }

  const totalChargesPatronales = calcul?.resume?.totalChargesPatronales || 0;
  const coutTotal = (calcul?.resume?.totalBrut || 0) + totalChargesPatronales;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 4, fontSize: '1rem', fontWeight: 700 }}>Calcul de la paie</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
          Sélectionnez la période pour calculer les salaires nets et les charges sociales.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label className="label">Mois</label>
            <select className="select" style={{ width: 160 }} value={mois} onChange={e => setMois(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Année</label>
            <input type="number" className="input" style={{ width: 100 }} value={annee} onChange={e => setAnnee(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={calculer} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Calcul...</> : 'Calculer la paie'}
          </button>
        </div>
      </div>

      {calcul && (
        <>
          {isDemo && (
            <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 10, padding: '10px 16px', fontSize: '0.8125rem', color: '#7A5C00', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📊</span> Données de démonstration pour {calcul.periode}.
            </div>
          )}

          {/* Résumé financier */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Salaires bruts', val: calcul.resume?.totalBrut, color: 'var(--text)' },
              { label: 'Total net à verser', val: calcul.resume?.totalNet, color: '#1A7A3C' },
              { label: 'Charges patronales', val: totalChargesPatronales, color: 'var(--danger)' },
              { label: 'Coût total employeur', val: coutTotal, color: 'var(--primary)' },
            ].map(({ label, val, color }) => (
              <div key={label} className="stat-card" style={{ padding: '14px 18px' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: '1.375rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>
                  {(val || 0).toLocaleString('fr-FR')} €
                </p>
              </div>
            ))}
          </div>

          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                Détail par employé — {calcul.periode || `${new Date(0, mois-1).toLocaleString('fr-FR', { month: 'long' })} ${annee}`}
              </h3>
              {!paid ? (
                <button className="btn-primary" onClick={payer} style={{ padding: '8px 16px' }}>
                  <IconCheck size={14} /> Valider le virement
                </button>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: '#1A7A3C' }}>
                  <IconCheck size={14} /> Salaires virés
                </span>
              )}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Poste</th>
                  <th style={{ textAlign: 'right' }}>Brut</th>
                  <th style={{ textAlign: 'right' }}>Cotis. sal.</th>
                  <th style={{ textAlign: 'right' }}>Net</th>
                  <th style={{ textAlign: 'right' }}>Taux net</th>
                </tr>
              </thead>
              <tbody>
                {calcul.employes?.map(e => {
                  const tauxNet = e.salaireBrutTotal > 0 ? (e.salaireNet / e.salaireBrutTotal * 100).toFixed(0) : '—';
                  return (
                    <tr key={e.employeId}>
                      <td style={{ fontWeight: 600 }}>{e.nom}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{e.poste || '—'}</td>
                      <td style={{ textAlign: 'right' }}>{e.salaireBrutTotal?.toLocaleString('fr-FR')} €</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>− {e.cotisationsSalariales?.toLocaleString('fr-FR')} €</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A7A3C' }}>{e.salaireNet?.toLocaleString('fr-FR')} €</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{tauxNet} %</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg)' }}>
                  <td colSpan={2} style={{ padding: '10px 16px', fontWeight: 700 }}>Total</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700 }}>{calcul.resume?.totalBrut?.toLocaleString('fr-FR')} €</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>
                    − {calcul.employes?.reduce((s, e) => s + (e.cotisationsSalariales || 0), 0).toLocaleString('fr-FR')} €
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: '#1A7A3C' }}>{calcul.resume?.totalNet?.toLocaleString('fr-FR')} €</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Indemnités de trajet BTP */}
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', background: 'rgba(91,91,214,0.04)' }}>
              <h3 style={{ margin: '0 0 2px', fontSize: '0.9375rem', fontWeight: 700 }}>Indemnités de trajet BTP</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Barème BTP 2024 · Art. R3261-1 Code du Travail · Exonérées de cotisations dans la limite des plafonds URSSAF
              </p>
            </div>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <label className="label">Adresse du dépôt de l'entreprise</label>
              <input className="input" style={{ maxWidth: 420 }}
                value={depotAdresse}
                onChange={e => { setDepotAdresse(e.target.value); localStorage.setItem('btp_depot_adresse', e.target.value); }}
                placeholder="Ex : 12 rue de la Paix, 45000 Orléans" />
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th style={{ textAlign: 'right' }}>Distance aller (km)</th>
                  <th style={{ textAlign: 'right' }}>Jours travaillés</th>
                  <th>Zone BTP</th>
                  <th style={{ textAlign: 'right' }}>Indemnité / jour</th>
                  <th style={{ textAlign: 'right' }}>Total mois</th>
                  <th style={{ textAlign: 'center' }}>Inclure</th>
                </tr>
              </thead>
              <tbody>
                {calcul.employes?.map(emp => {
                  const t = getTrajet(emp.employeId);
                  const { zone, rate } = getBTPZoneRate(t.km);
                  const totalMois = rate * (Number(t.jours) || 0);
                  return (
                    <tr key={emp.employeId}>
                      <td style={{ fontWeight: 600 }}>{emp.nom}</td>
                      <td style={{ textAlign: 'right' }}>
                        <input type="number" min={0} max={300} step={0.5} className="input"
                          style={{ width: 80, textAlign: 'right', padding: '4px 8px' }}
                          value={t.km} onChange={e => setTrajet(emp.employeId, { km: e.target.value })} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <input type="number" min={0} max={31} step={1} className="input"
                          style={{ width: 70, textAlign: 'right', padding: '4px 8px' }}
                          value={t.jours} onChange={e => setTrajet(emp.employeId, { jours: e.target.value })} />
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, background: 'rgba(91,91,214,0.08)', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 600 }}>
                          {zone}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{rate.toFixed(2)} €</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: t.inclure ? '#1A7A3C' : 'var(--text)' }}>
                        {totalMois.toFixed(2)} €
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={!!t.inclure}
                          onChange={e => setTrajet(emp.employeId, { inclure: e.target.checked })}
                          style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg)' }}>
                  <td colSpan={5} style={{ padding: '10px 16px', fontWeight: 700 }}>Total indemnités incluses dans la paie</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: '#1A7A3C' }}>
                    {(calcul.employes?.reduce((sum, emp) => {
                      const t = getTrajet(emp.employeId);
                      if (!t.inclure) return sum;
                      return sum + getBTPZoneRate(t.km).rate * (Number(t.jours) || 0);
                    }, 0) || 0).toFixed(2)} €
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
            <div style={{ padding: '10px 20px', background: 'rgba(91,91,214,0.04)', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Ces indemnités sont indicatives et à reporter manuellement sur le bulletin de paie. Elles ne sont pas transmises au serveur.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Barème de paiement ── */
function BaremePaiementView() {
  const [montantDevis, setMontantDevis] = useState('');
  const [modele, setModele] = useState('standard');
  const [retenue, setRetenue] = useState(5);

  const montant = parseFloat(montantDevis) || 0;

  const MODELES = {
    standard: {
      label: 'Standard BTP',
      desc: 'Modèle courant pour travaux de 5 000 € à 50 000 €',
      echeances: [
        { label: 'Acompte à la signature',     pct: 30, timing: 'À la signature',          type: 'acompte' },
        { label: 'Situation 1 — 30% travaux',  pct: 20, timing: '30% des travaux réalisés', type: 'situation' },
        { label: 'Situation 2 — 60% travaux',  pct: 20, timing: '60% des travaux réalisés', type: 'situation' },
        { label: 'Situation 3 — 90% travaux',  pct: 15, timing: '90% des travaux réalisés', type: 'situation' },
        { label: 'Solde (hors retenue)',       pct: 15 - retenue, timing: 'Réception des travaux', type: 'solde' },
        { label: `Retenue de garantie (${retenue}%)`, pct: retenue, timing: '1 an après réception (levée des réserves)', type: 'retenue' },
      ],
    },
    gros_travaux: {
      label: 'Grands travaux (> 50 000 €)',
      desc: 'Situations mensuelles adaptées aux chantiers longs',
      echeances: [
        { label: 'Acompte à la signature',      pct: 20, timing: 'À la signature',     type: 'acompte' },
        { label: 'Situation mensuelle × 4',    pct: 15, timing: 'Chaque mois (×4)',    type: 'situation' },
        { label: 'Situation 5 (fin de chantier)', pct: 15, timing: 'Fin de chantier', type: 'situation' },
        { label: 'Solde (hors retenue)',         pct: 10 - retenue, timing: 'Réception', type: 'solde' },
        { label: `Retenue de garantie (${retenue}%)`, pct: retenue, timing: '1 an après réception', type: 'retenue' },
      ],
    },
    petit: {
      label: 'Petits travaux (< 5 000 €)',
      desc: 'Simplicité pour devis courts',
      echeances: [
        { label: 'Acompte à la commande',       pct: 40, timing: 'À la commande',     type: 'acompte' },
        { label: 'Solde (hors retenue)',         pct: 60 - retenue, timing: 'À réception', type: 'solde' },
        { label: `Retenue de garantie (${retenue}%)`, pct: retenue, timing: '1 an après réception', type: 'retenue' },
      ],
    },
  };

  const m = MODELES[modele];
  const echeances = m.echeances;
  const totalPct = echeances.reduce((s, e) => s + e.pct, 0);

  const TYPE_COLORS = {
    acompte:  { bg: '#EBF5FF', color: '#5B5BD6', label: 'Acompte' },
    situation:{ bg: '#FFF3CD', color: '#856404', label: 'Situation' },
    solde:    { bg: '#D1F2E0', color: '#1A7F43', label: 'Solde' },
    retenue:  { bg: '#F2F2F7', color: '#6E6E73', label: 'Retenue garantie' },
  };

  function formatCur(n) { return Number(n||0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Info légale */}
      <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)30', borderRadius: 12, padding: '14px 18px', fontSize: '0.875rem', color: 'var(--primary)' }}>
        <strong>Retenue de garantie légale :</strong> Art. 1792-6 du Code civil + Loi n°71-584 du 16 juillet 1971.
        La retenue de garantie est plafonnée à <strong>5%</strong> du montant TTC du marché. Elle est libérée 1 an après réception des travaux si aucune réserve n'est levée.
        Le maître d'ouvrage peut la remplacer par une caution bancaire.
      </div>

      {/* Paramètres */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Paramètres du barème</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label className="label">Montant du devis TTC (€)</label>
            <input type="number" min="0" step="100" value={montantDevis} onChange={e => setMontantDevis(e.target.value)} placeholder="Ex: 25000" className="input" />
          </div>
          <div>
            <label className="label">Modèle de paiement</label>
            <select value={modele} onChange={e => setModele(e.target.value)} className="select">
              {Object.entries(MODELES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Retenue de garantie (%)</label>
            <input type="number" min="0" max="5" step="0.5" value={retenue} onChange={e => setRetenue(Number(e.target.value))} className="input" />
            {retenue > 5 && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>⚠️ Maximum légal : 5%</span>}
          </div>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{m.desc}</p>
      </div>

      {/* Tableau des échéances */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Échéancier de paiement</h3>
          {montant > 0 && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total : <strong>{formatCur(montant)}</strong></span>}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['N°', 'Libellé', 'Type', '% Marché', montant > 0 ? 'Montant TTC' : null, 'Déclenchement'].filter(Boolean).map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: h.includes('Montant') || h === '% Marché' ? 'right' : 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {echeances.map((e, i) => {
              const tc = TYPE_COLORS[e.type];
              const montantEch = montant * e.pct / 100;
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '13px 16px', color: 'var(--text-tertiary)', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 600 }}>{e.label}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: tc.bg, color: tc.color }}>{tc.label}</span>
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: e.type === 'retenue' ? 'var(--text-tertiary)' : 'var(--text)' }}>
                    {e.pct}%
                  </td>
                  {montant > 0 && (
                    <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: e.type === 'retenue' ? 'var(--text-secondary)' : 'var(--primary)' }}>
                      {formatCur(montantEch)}
                    </td>
                  )}
                  <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{e.timing}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--text)', background: 'var(--bg)' }}>
              <td colSpan={3} style={{ padding: '12px 16px', fontWeight: 800, fontSize: '0.9375rem' }}>TOTAL</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: totalPct === 100 ? 'var(--success)' : 'var(--danger)' }}>
                {totalPct}%{totalPct !== 100 && ' ⚠️'}
              </td>
              {montant > 0 && (
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                  {formatCur(montant)}
                </td>
              )}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Barre de progression visuelle */}
      {montant > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Répartition visuelle</h3>
          <div style={{ display: 'flex', height: 36, borderRadius: 10, overflow: 'hidden', gap: 2 }}>
            {echeances.map((e, i) => {
              const tc = TYPE_COLORS[e.type];
              return (
                <div key={i} title={`${e.label} — ${e.pct}%`} style={{ flex: e.pct, background: tc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: e.pct > 5 ? 'auto' : 0, transition: 'flex 0.3s' }}>
                  {e.pct > 8 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{e.pct}%</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            {Object.entries(TYPE_COLORS).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: v.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes de bas */}
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>À retenir :</strong><br />
        • L'acompte est encaissé à la commande — il sécurise le chantier.<br />
        • Les <em>situations de travaux</em> sont établies au fur et à mesure de l'avancement réel.<br />
        • La retenue de garantie (max 5%) peut être remplacée par une caution bancaire à la demande du client (Loi 71-584).<br />
        • En cas de litige à la réception, la retenue est bloquée jusqu'à levée des réserves ou décision judiciaire.
      </div>
    </div>
  );
}

/* ── Retenues de garantie ── */
function RetenuesDeGarantie() {
  const DEMO_RETENUES = [
    { id: 1, client: 'Copropriété Les Acacias', chantier: 'Rénovation halls A & B', montantFacture: 28_400, dateReception: '2025-01-15' },
    { id: 2, client: 'Résidence du Parc', chantier: 'Ravalement façade', montantFacture: 19_800, dateReception: '2025-03-20' },
    { id: 3, client: 'SARL Dupont Immo', chantier: 'Mise aux normes élec.', montantFacture: 12_900, dateReception: '2024-11-05' },
    { id: 4, client: 'Copropriété Voltaire', chantier: 'Réfection toiture', montantFacture: 9_200, dateReception: '2024-02-10' },
    { id: 5, client: 'M. & Mme Bertrand', chantier: 'Extension véranda', montantFacture: 14_500, dateReception: '2023-12-01' },
  ];

  const isDemo = _isDemo();
  const today = new Date();
  const retenuesSrc = isDemo ? DEMO_RETENUES : [];
  const retenues = retenuesSrc.map(r => {
    const dateLib = new Date(r.dateReception);
    dateLib.setFullYear(dateLib.getFullYear() + 1);
    const liberee = today >= dateLib;
    return { ...r, retenue5: r.montantFacture * 0.05, dateLiberation: dateLib.toISOString().slice(0, 10), liberee };
  });

  const totalEnCours = retenues.filter(r => !r.liberee).reduce((s, r) => s + r.retenue5, 0);

  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Retenues de garantie (5%)</h3>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#D97706' }}>En cours : {totalEnCours.toLocaleString('fr-FR')} €</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Chantier</th>
            <th style={{ textAlign: 'right' }}>Montant facturé</th>
            <th style={{ textAlign: 'right' }}>Retenue 5%</th>
            <th>Date libération</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {retenues.map(r => (
            <tr key={r.id}>
              <td style={{ fontWeight: 600 }}>{r.client}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{r.chantier}</td>
              <td style={{ textAlign: 'right' }}>{r.montantFacture.toLocaleString('fr-FR')} €</td>
              <td style={{ textAlign: 'right', fontWeight: 700, color: r.liberee ? '#1A7A3C' : '#D97706' }}>{r.retenue5.toLocaleString('fr-FR')} €</td>
              <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{new Date(r.dateLiberation).toLocaleDateString('fr-FR')}</td>
              <td>
                {r.liberee
                  ? <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: 'rgba(52,199,89,0.1)', color: '#1A7A3C' }}>Libérée</span>
                  : <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,149,0,0.1)', color: '#D97706' }}>Retenue</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: '10px 20px', background: 'var(--bg)', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
        Art. 1 loi n°71-584 du 16 juillet 1971 — La retenue de garantie de 5% est libérable 1 an après la réception des travaux, sauf réserves non levées.
      </div>
    </div>
  );
}

/* ── Déclaration TVA CA3 ── */
function DeclarationTVACA3() {
  const isDemoTVA = _isDemo();
  const now = new Date();
  const [moisTVA, setMoisTVA] = useState(now.getMonth());
  const [anneeTVA, setAnneeTVA] = useState(now.getFullYear());

  const [l08Base, setL08Base] = useState(isDemoTVA ? 54264 : 0);
  const [l09Base, setL09Base] = useState(isDemoTVA ? 25704 : 0);
  const [l9bBase, setL9bBase] = useState(isDemoTVA ? 11424 : 0);

  const [l19, setL19] = useState(isDemoTVA ? 8200 : 0);
  const [l20, setL20] = useState(isDemoTVA ? 3400 : 0);

  const [sousTraitanceHT, setSousTraitanceHT] = useState(isDemoTVA ? 6500 : 0);

  const tva08 = Math.round(l08Base * 0.20 * 100) / 100;
  const tva09 = Math.round(l09Base * 0.10 * 100) / 100;
  const tva9b = Math.round(l9bBase * 0.055 * 100) / 100;
  const totalCollectee = tva08 + tva09 + tva9b;

  const totalDeductible = l19 + l20;
  const autoLiqTVA = Math.round(sousTraitanceHT * 0.20 * 100) / 100;
  const tvaNette = totalCollectee + autoLiqTVA - totalDeductible;

  const fmt = (n) => Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleExport() {
    const moisLabel = new Date(anneeTVA, moisTVA).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const lines = [
      `Déclaration TVA CA3 — ${moisLabel}`,
      '',
      'TVA COLLECTÉE',
      `Ligne 08 — Opérations à 20% : Base HT ${fmt(l08Base)} € | TVA ${fmt(tva08)} €`,
      `Ligne 09 — Opérations à 10% : Base HT ${fmt(l09Base)} € | TVA ${fmt(tva09)} €`,
      `Ligne 9B — Opérations à 5,5% : Base HT ${fmt(l9bBase)} € | TVA ${fmt(tva9b)} €`,
      `Total TVA collectée : ${fmt(totalCollectee)} €`,
      '',
      'TVA DÉDUCTIBLE',
      `Ligne 19 — Achats et frais généraux : ${fmt(l19)} €`,
      `Ligne 20 — Immobilisations : ${fmt(l20)} €`,
      `Total TVA déductible : ${fmt(totalDeductible)} €`,
      '',
      'AUTOLIQUIDATION SOUS-TRAITANCE BTP',
      `Montant HT sous-traitance : ${fmt(sousTraitanceHT)} €`,
      `TVA auto-liquidée (20%) : ${fmt(autoLiqTVA)} €`,
      '',
      `TVA NETTE : ${fmt(tvaNette)} € ${tvaNette >= 0 ? '(TVA à reverser)' : '(Crédit de TVA)'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => alert('Valeurs copiées dans le presse-papier.'));
  }

  const inputStyle = { width: 130, padding: '6px 10px', textAlign: 'right', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>Déclaration TVA — CA3</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Formulaire mensuel de TVA (régime réel normal)</p>
        </div>
        <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#1C1C1E', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          <IconDownload size={14} /> Exporter / Copier
        </button>
      </div>

      {/* Période */}
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Période :</span>
        <select className="select" style={{ width: 160 }} value={moisTVA} onChange={e => setMoisTVA(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}</option>
          ))}
        </select>
        <input type="number" className="input" style={{ width: 90 }} value={anneeTVA} onChange={e => setAnneeTVA(Number(e.target.value))} />
      </div>

      {/* TVA Collectée */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', background: 'rgba(91,91,214,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>TVA Collectée (ventes)</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Ligne</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Description</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Base HT</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>TVA</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 700 }}>08</td>
              <td style={{ padding: '12px 16px' }}>Opérations taxables à 20%</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}><input type="number" style={inputStyle} value={l08Base} onChange={e => setL08Base(Number(e.target.value))} /></td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>{fmt(tva08)} €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 700 }}>09</td>
              <td style={{ padding: '12px 16px' }}>Opérations taxables à 10%</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}><input type="number" style={inputStyle} value={l09Base} onChange={e => setL09Base(Number(e.target.value))} /></td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>{fmt(tva09)} €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 700 }}>9B</td>
              <td style={{ padding: '12px 16px' }}>Opérations taxables à 5,5%</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}><input type="number" style={inputStyle} value={l9bBase} onChange={e => setL9bBase(Number(e.target.value))} /></td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>{fmt(tva9b)} €</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg)' }}>
              <td colSpan={3} style={{ padding: '12px 16px', fontWeight: 800 }}>Total TVA collectée</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{fmt(totalCollectee)} €</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* TVA Déductible */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', background: 'rgba(52,199,89,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>TVA Déductible (achats)</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Ligne</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Description</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Montant TVA</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 700 }}>19</td>
              <td style={{ padding: '12px 16px' }}>Achats et frais généraux</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}><input type="number" style={inputStyle} value={l19} onChange={e => setL19(Number(e.target.value))} /></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 700 }}>20</td>
              <td style={{ padding: '12px 16px' }}>Immobilisations</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}><input type="number" style={inputStyle} value={l20} onChange={e => setL20(Number(e.target.value))} /></td>
            </tr>
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg)' }}>
              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 800 }}>Total TVA déductible</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#1A7A3C' }}>{fmt(totalDeductible)} €</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Autoliquidation sous-traitance BTP */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,149,0,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>TVA auto-liquidée — Sous-traitance BTP</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Art. 283-2 nonies du CGI</p>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem' }}>Montant HT des prestations de sous-traitance reçues</span>
            <input type="number" style={inputStyle} value={sousTraitanceHT} onChange={e => setSousTraitanceHT(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>TVA auto-liquidée (20%)</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#D97706' }}>{fmt(autoLiqTVA)} €</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '8px 12px', background: 'rgba(255,149,0,0.06)', borderRadius: 8, lineHeight: 1.6 }}>
            En tant que donneur d'ordre BTP, vous déclarez et payez la TVA à la place du sous-traitant. Cette TVA est à la fois collectée (ligne 02 du CA3) et déductible (ligne 20), l'opération est donc neutre sur votre trésorerie.
          </div>
        </div>
      </div>

      {/* Solde */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '0.9375rem', fontWeight: 700 }}>Solde TVA du mois</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'rgba(91,91,214,0.06)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Collectée</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>{fmt(totalCollectee)} €</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(255,149,0,0.06)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Auto-liquidée</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#D97706' }}>{fmt(autoLiqTVA)} €</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(52,199,89,0.06)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Déductible</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1A7A3C' }}>- {fmt(totalDeductible)} €</div>
          </div>
          <div style={{ padding: '12px 14px', background: tvaNette >= 0 ? 'rgba(255,59,48,0.06)' : 'rgba(52,199,89,0.06)', borderRadius: 10, textAlign: 'center', border: `2px solid ${tvaNette >= 0 ? 'rgba(255,59,48,0.2)' : 'rgba(52,199,89,0.2)'}` }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>TVA nette</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: tvaNette >= 0 ? 'var(--danger)' : '#1A7A3C' }}>{fmt(tvaNette)} €</div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderRadius: 10, background: tvaNette >= 0 ? 'rgba(255,59,48,0.06)' : 'rgba(52,199,89,0.06)', border: `1px solid ${tvaNette >= 0 ? 'rgba(255,59,48,0.15)' : 'rgba(52,199,89,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: tvaNette >= 0 ? 'var(--danger)' : '#1A7A3C' }}>
            {tvaNette >= 0 ? 'TVA à reverser au Trésor public' : 'Crédit de TVA à reporter'}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: tvaNette >= 0 ? 'var(--danger)' : '#1A7A3C' }}>
            {fmt(Math.abs(tvaNette))} €
          </span>
        </div>
      </div>

      {/* Note légale */}
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Rappel :</strong><br />
        • La CA3 doit être déposée avant le 19 du mois suivant la période (ou le 24 selon votre calendrier fiscal).<br />
        • L'autoliquidation BTP (art. 283-2 nonies CGI) s'applique aux travaux immobiliers réalisés par un sous-traitant pour le compte d'un donneur d'ordre assujetti.<br />
        • Les montants affichés sont indicatifs et doivent être vérifiés avec votre comptable avant télédéclaration.
      </div>
    </div>
  );
}

function KpiCard({ label, valeur, Icon, color = 'blue', trend, trendLabel, trendUnit = '%' }) {
  const colors = {
    blue:   { bg: 'var(--primary-light)',  fg: 'var(--primary)' },
    green:  { bg: 'rgba(52,199,89,0.1)',   fg: '#1A7A3C'        },
    red:    { bg: 'var(--danger-light)',   fg: 'var(--danger)'  },
    orange: { bg: 'rgba(255,149,0,0.1)',   fg: '#7A5C00'        },
  };
  const c = colors[color] || colors.blue;
  const trendVal = parseFloat(trend);
  const up = !isNaN(trendVal) && trendVal > 0;
  const dn = !isNaN(trendVal) && trendVal < 0;
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} />
        </div>
        {trend != null && !isNaN(trendVal) && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 700,
            color: up ? '#1A7A3C' : dn ? 'var(--danger)' : 'var(--text-tertiary)',
            background: up ? 'rgba(52,199,89,0.1)' : dn ? 'var(--danger-light)' : 'var(--bg)',
            padding: '2px 7px', borderRadius: 20,
          }}>
            {up ? <IconArrowUp size={10} /> : dn ? <IconArrowDown size={10} /> : null}
            {up ? '+' : ''}{trendVal}{trendUnit}
          </span>
        )}
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: color === 'red' ? 'var(--danger)' : 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{valeur}</p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 5 }}>{label}</p>
      {trendLabel && trend != null && (
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 3 }}>{trendLabel}</p>
      )}
    </div>
  );
}

/* ── Bilan & Compte de résultat simplifié ── */
function BilanResultatView() {
  // Lire les vraies données de l'écosystème Freample
  const factures = demoGet('freample_factures_patron', []);
  const devisData = demoGet('freample_devis', []);
  const ecritures = demoGet('freample_ecritures', []);
  const mouvements = demoGet('freample_stock_mouvements', []);

  // PRODUITS — depuis les factures et devis signés
  const facturesPayees = factures.filter(f => f.statut === 'payee' || f.statut === 'sequestre_libere');
  const caEncaisse = facturesPayees.reduce((s, f) => s + (f.montantTTC || 0), 0);
  const devisSignes = devisData.filter(d => d.statut === 'signe');
  const caTotal = devisSignes.reduce((s, d) => s + (d.montantTTC || d.ttc || 0), 0);
  const isDemoToken = _isDemo();
  const totalProduits = caTotal || caEncaisse || (isDemoToken ? DEMO_FINANCE.chiffreAffaires.total : 0);

  // CHARGES — depuis les écritures comptables auto + mouvements stock
  const achatsCompta = ecritures.filter(e => e.compte === '601000' && e.debit > 0).reduce((s, e) => s + e.debit, 0);
  const achatsStock = mouvements.filter(m => m.type === 'sortie' || m.type === 'Sortie').reduce((s, m) => s + ((m.quantite || 0) * (m.prixUnitaire || 0)), 0);
  const achatsFournisseurs = mouvements.filter(m => m.type === 'achat' || m.type === 'Achat').reduce((s, m) => s + (m.montantHT || m.montant || 0), 0);
  const achatsMatieresEtFournitures = achatsCompta || (achatsStock + achatsFournisseurs) || (isDemoToken ? 18_600 : 0);

  const sousTraitanceCompta = ecritures.filter(e => e.libelle?.toLowerCase().includes('sous-trait')).reduce((s, e) => s + e.debit, 0);
  const sousTraitance = sousTraitanceCompta || 0;

  const chargesPersonnelCompta = ecritures.filter(e => e.compte === '641000').reduce((s, e) => s + e.debit, 0);
  const chargesPersonnel = chargesPersonnelCompta || (isDemoToken ? DEMO_SALARIES.resume.totalBrut * 12 : 0);

  const chargesSocialesCompta = ecritures.filter(e => e.compte === '645000').reduce((s, e) => s + e.debit, 0);
  const chargesSocialesPatronales = chargesSocialesCompta || (isDemoToken ? DEMO_SALARIES.resume.totalChargesPatronales * 12 : 0);

  const totalCharges = achatsMatieresEtFournitures + sousTraitance + chargesPersonnel + chargesSocialesPatronales;
  const resultatNet = totalProduits - totalCharges;

  // BILAN — depuis les vraies données
  const creancesClients = factures.filter(f => !['payee', 'sequestre_libere'].includes(f.statut)).reduce((s, f) => s + (f.montantTTC || 0), 0) || (isDemoToken ? DEMO_FINANCE.chiffreAffaires.montantEnAttente : 0);
  const tresorerie = caEncaisse - totalCharges * 0.7; // estimation simplifiée
  const immobilisations = isDemoToken ? 45_000 : 0; // à renseigner par le patron (futur)
  const totalActif = immobilisations + creancesClients + Math.max(0, tresorerie);

  const capitauxPropres = isDemoToken ? 30_000 : 0; // à renseigner par le patron (futur)
  const resultatExercice = resultatNet;
  const dettesFournisseurs = ecritures.filter(e => e.compte === '401000' && e.credit > 0).reduce((s, e) => s + e.credit, 0) || 0;
  const totalPassif = capitauxPropres + resultatExercice + dettesFournisseurs;

  // Indicateurs pour le patron (pas du jargon comptable)
  const margeGlobale = totalProduits > 0 ? Math.round(resultatNet / totalProduits * 100) : 0;

  const cellStyle = { padding: '8px 14px', fontSize: 13, fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid var(--border)' };
  const headerCell = { ...cellStyle, fontWeight: 700, fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--bg)' };
  const totalRow = { ...cellStyle, fontWeight: 800, fontSize: 14, borderTop: '3px double var(--text)', borderBottom: '3px double var(--text)', background: 'var(--bg)' };
  const amountRight = { textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

  const fmt = (v) => v.toLocaleString('fr-FR') + ' \u20AC';

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 12 }}>Bilan & Compte de résultat</h2>

      {/* Résumé lisible pour le patron */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #E5E5EA', borderTop: '3px solid #16A34A' }}>
          <div style={{ fontSize: 11, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 4 }}>Chiffre d'affaires</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#16A34A' }}>{fmt(totalProduits)}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #E5E5EA', borderTop: '3px solid #DC2626' }}>
          <div style={{ fontSize: 11, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 4 }}>Total charges</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626' }}>{fmt(totalCharges)}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #E5E5EA', borderTop: `3px solid ${resultatNet >= 0 ? '#16A34A' : '#DC2626'}` }}>
          <div style={{ fontSize: 11, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 4 }}>Résultat net</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: resultatNet >= 0 ? '#16A34A' : '#DC2626' }}>{resultatNet >= 0 ? '+' : ''}{fmt(resultatNet)}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #E5E5EA', borderTop: `3px solid ${margeGlobale >= 20 ? '#16A34A' : margeGlobale >= 10 ? '#D97706' : '#DC2626'}` }}>
          <div style={{ fontSize: 11, color: '#6E6E73', textTransform: 'uppercase', marginBottom: 4 }}>Marge globale</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: margeGlobale >= 20 ? '#16A34A' : margeGlobale >= 10 ? '#D97706' : '#DC2626' }}>{margeGlobale}%</div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Calculé depuis vos devis signés, factures, achats matériaux et salaires enregistrés sur Freample.</p>

      {/* BILAN SIMPLIFIE */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid var(--text)' }}>Bilan simplifi\u00E9</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* ACTIF */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr><th colSpan={2} style={{ ...headerCell, textAlign: 'center', fontSize: 13, fontWeight: 800, background: '#EBF5FF', color: '#1D4ED8' }}>ACTIF</th></tr>
            </thead>
            <tbody>
              <tr><td style={cellStyle}>Immobilisations (mat\u00E9riel, v\u00E9hicules)</td><td style={{ ...cellStyle, ...amountRight }}>{fmt(immobilisations)}</td></tr>
              <tr><td style={cellStyle}>Cr\u00E9ances clients (factures en attente)</td><td style={{ ...cellStyle, ...amountRight }}>{fmt(creancesClients)}</td></tr>
              <tr><td style={cellStyle}>Tr\u00E9sorerie (banque)</td><td style={{ ...cellStyle, ...amountRight }}>{fmt(tresorerie)}</td></tr>
              <tr><td style={totalRow}>TOTAL ACTIF</td><td style={{ ...totalRow, ...amountRight }}>{fmt(totalActif)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* PASSIF */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr><th colSpan={2} style={{ ...headerCell, textAlign: 'center', fontSize: 13, fontWeight: 800, background: '#FEF3C7', color: '#92400E' }}>PASSIF</th></tr>
            </thead>
            <tbody>
              <tr><td style={cellStyle}>Capitaux propres</td><td style={{ ...cellStyle, ...amountRight }}>{fmt(capitauxPropres)}</td></tr>
              <tr><td style={cellStyle}>R\u00E9sultat de l'exercice</td><td style={{ ...cellStyle, ...amountRight, color: resultatExercice >= 0 ? '#16A34A' : '#DC2626' }}>{fmt(resultatExercice)}</td></tr>
              <tr><td style={cellStyle}>Dettes fournisseurs</td><td style={{ ...cellStyle, ...amountRight }}>{fmt(dettesFournisseurs)}</td></tr>
              <tr><td style={cellStyle}>Emprunts</td><td style={{ ...cellStyle, ...amountRight }}>{fmt(emprunts)}</td></tr>
              <tr><td style={totalRow}>TOTAL PASSIF</td><td style={{ ...totalRow, ...amountRight }}>{fmt(totalPassif)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {totalActif !== totalPassif && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#991B1B' }}>
          Ecart Actif/Passif : {fmt(totalActif - totalPassif)} \u2014 les estimations de capitaux propres peuvent n\u00E9cessiter un ajustement.
        </div>
      )}

      {/* COMPTE DE RESULTAT */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid var(--text)' }}>Compte de r\u00E9sultat simplifi\u00E9</h3>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr>
              <th style={headerCell}>Libell\u00E9</th>
              <th style={{ ...headerCell, ...amountRight }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {/* Produits */}
            <tr><td colSpan={2} style={{ ...cellStyle, fontWeight: 800, fontSize: 12, background: '#F0FDF4', color: '#166534', letterSpacing: '0.03em' }}>PRODUITS</td></tr>
            <tr><td style={cellStyle}>CA prestations de services</td><td style={{ ...cellStyle, ...amountRight, color: '#16A34A' }}>{fmt(caPrestation)}</td></tr>
            <tr><td style={cellStyle}>Autres produits</td><td style={{ ...cellStyle, ...amountRight, color: '#16A34A' }}>{fmt(autresProduits)}</td></tr>
            <tr><td style={{ ...cellStyle, fontWeight: 700, background: '#F0FDF4' }}>Total produits</td><td style={{ ...cellStyle, ...amountRight, fontWeight: 700, background: '#F0FDF4', color: '#16A34A' }}>{fmt(totalProduits)}</td></tr>

            {/* Charges */}
            <tr><td colSpan={2} style={{ ...cellStyle, fontWeight: 800, fontSize: 12, background: '#FEF2F2', color: '#991B1B', letterSpacing: '0.03em' }}>CHARGES</td></tr>
            <tr><td style={cellStyle}>Achats mati\u00E8res et fournitures</td><td style={{ ...cellStyle, ...amountRight, color: '#DC2626' }}>{fmt(achatsMatieresEtFournitures)}</td></tr>
            <tr><td style={cellStyle}>Sous-traitance</td><td style={{ ...cellStyle, ...amountRight, color: '#DC2626' }}>{fmt(sousTraitance)}</td></tr>
            <tr><td style={cellStyle}>Charges de personnel</td><td style={{ ...cellStyle, ...amountRight, color: '#DC2626' }}>{fmt(chargesPersonnel)}</td></tr>
            <tr><td style={cellStyle}>Charges sociales patronales</td><td style={{ ...cellStyle, ...amountRight, color: '#DC2626' }}>{fmt(chargesSocialesPatronales)}</td></tr>
            <tr><td style={cellStyle}>Dotations aux amortissements</td><td style={{ ...cellStyle, ...amountRight, color: '#DC2626' }}>{fmt(dotationsAmortissements)}</td></tr>
            <tr><td style={cellStyle}>Autres charges</td><td style={{ ...cellStyle, ...amountRight, color: '#DC2626' }}>{fmt(autresCharges)}</td></tr>
            <tr><td style={{ ...cellStyle, fontWeight: 700, background: '#FEF2F2' }}>Total charges</td><td style={{ ...cellStyle, ...amountRight, fontWeight: 700, background: '#FEF2F2', color: '#DC2626' }}>{fmt(totalCharges)}</td></tr>

            {/* Resultat */}
            <tr>
              <td style={{ ...totalRow, fontSize: 15 }}>R\u00C9SULTAT NET</td>
              <td style={{ ...totalRow, ...amountRight, fontSize: 15, color: resultatNet >= 0 ? '#16A34A' : '#DC2626' }}>{resultatNet >= 0 ? '+' : ''}{fmt(resultatNet)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
        Les produits et charges sont calculés depuis vos devis, factures et achats sur Freample. Les immobilisations et capitaux propres sont des estimations à ajuster avec votre comptable.
      </div>
    </div>
  );
}
