import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DEMO_FICHES_SALARIES } from '../../utils/profilEntreprise';
import {
  IconTeam, IconDocument, IconAlert, IconPlus, IconCheck, IconX,
  IconDownload, IconUser, IconCalendar,
} from '../../components/ui/Icons';
import PointageModule from '../../components/rh/PointageModule';
import EntretiensModule from '../../components/rh/EntretiensModule';
import OnboardingModule from '../../components/rh/OnboardingModule';
import ContratsBTPModule from '../../components/rh/ContratsBTPModule';
import SimulateurTrajetModule from '../../components/rh/SimulateurTrajetModule';
import SuiviPaieModule from '../../components/rh/SuiviPaieModule';

/* ── French payroll cotisations config ── */
const COTISATIONS_SALARIALES = [
  { cat: 'Sécurité sociale',   label: 'Maladie / Maternité',          taux: 0.75,  base: 'brut',    note: 'Totalité du salaire' },
  { cat: 'Sécurité sociale',   label: 'Vieillesse (déplafonnée)',      taux: 0.40,  base: 'brut',    note: 'Totalité du salaire' },
  { cat: 'Sécurité sociale',   label: 'Vieillesse (plafonnée)',        taux: 6.90,  base: 'plafond', note: 'Dans la limite du plafond SS' },
  { cat: 'Chômage',            label: 'Assurance chômage',             taux: 2.40,  base: 'brut',    note: 'Totalité (dans 4×PS)' },
  { cat: 'Retraite compl.',    label: 'AGIRC-ARRCO Tranche 1',        taux: 3.15,  base: 'plafond', note: 'Jusqu\'à 1×PMSS' },
  { cat: 'Retraite compl.',    label: 'AGIRC-ARRCO Tranche 2',        taux: 8.64,  base: 'tranche2',note: 'De 1 à 8×PMSS' },
  { cat: 'Retraite compl.',    label: 'CEG Tranche 1',                taux: 0.86,  base: 'plafond', note: 'Contribution d\'équilibre général' },
  { cat: 'CSG / CRDS',         label: 'CSG déductible',               taux: 6.80,  base: 'csg',     note: '98,25% du brut' },
  { cat: 'CSG / CRDS',         label: 'CSG non déductible',           taux: 2.40,  base: 'csg',     note: '98,25% du brut' },
  { cat: 'CSG / CRDS',         label: 'CRDS',                         taux: 0.50,  base: 'csg',     note: '98,25% du brut' },
];

const COTISATIONS_PATRONALES = [
  { cat: 'Sécurité sociale',   label: 'Maladie / Maternité',          taux: 7.00,  base: 'brut' },
  { cat: 'Sécurité sociale',   label: 'Accident du travail / MP',     taux: 2.22,  base: 'brut' },
  { cat: 'Sécurité sociale',   label: 'Allocations familiales',       taux: 3.45,  base: 'brut' },
  { cat: 'Sécurité sociale',   label: 'Vieillesse (déplafonnée)',      taux: 1.90,  base: 'brut' },
  { cat: 'Sécurité sociale',   label: 'Vieillesse (plafonnée)',        taux: 8.55,  base: 'plafond' },
  { cat: 'Chômage',            label: 'Assurance chômage',             taux: 4.05,  base: 'brut' },
  { cat: 'Chômage',            label: 'AGS (garantie salaires)',       taux: 0.15,  base: 'brut' },
  { cat: 'Retraite compl.',    label: 'AGIRC-ARRCO Tranche 1',        taux: 4.72,  base: 'plafond' },
  { cat: 'Retraite compl.',    label: 'AGIRC-ARRCO Tranche 2',        taux: 12.95, base: 'tranche2' },
  { cat: 'Retraite compl.',    label: 'CEG Tranche 1',                taux: 1.29,  base: 'plafond' },
  { cat: 'Retraite compl.',    label: 'CET',                          taux: 0.14,  base: 'brut' },
  { cat: 'Autres',             label: 'FNAL',                         taux: 0.50,  base: 'brut' },
  { cat: 'Autres',             label: 'Formation prof. (0.55%)',      taux: 0.55,  base: 'brut' },
  { cat: 'Autres',             label: 'Taxe d\'apprentissage',        taux: 0.68,  base: 'brut' },
];

const PMSS = 3864; // Plafond mensuel sécurité sociale 2025 approx.

function calcPayroll(brut) {
  const plafond = Math.min(brut, PMSS);
  const tranche2 = Math.max(0, Math.min(brut - PMSS, PMSS * 7));
  const baseCSG = brut * 0.9825;

  function getBase(type) {
    if (type === 'plafond') return plafond;
    if (type === 'tranche2') return tranche2;
    if (type === 'csg') return baseCSG;
    return brut;
  }

  const sal = COTISATIONS_SALARIALES.map(c => ({
    ...c,
    baseCalc: getBase(c.base),
    montant: getBase(c.base) * c.taux / 100,
  }));

  const pat = COTISATIONS_PATRONALES.map(c => ({
    ...c,
    baseCalc: getBase(c.base),
    montant: getBase(c.base) * c.taux / 100,
  }));

  const totalSal = sal.reduce((s, c) => s + c.montant, 0);
  const totalPat = pat.reduce((s, c) => s + c.montant, 0);
  const netImposable = brut - sal.filter(c => c.cat !== 'CSG / CRDS').reduce((s, c) => s + c.montant, 0);
  const netAPayer = brut - totalSal;
  const coutEmployeur = brut + totalPat;

  return { sal, pat, totalSal, totalPat, netImposable, netAPayer, coutEmployeur };
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function formatCur(n) { return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
function formatDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

const PRINT_STYLE = `@media print {
  body * { visibility: hidden !important; }
  #fiche-paie-print, #fiche-paie-print * { visibility: visible !important; }
  #fiche-paie-print { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; background: #fff; font-size: 11px; }
  .no-print { display: none !important; }
}`;

function StatutBadge({ statut }) {
  const map = {
    en_attente: { bg: '#FFFDE7', color: '#856404', label: 'En attente' },
    approuvé:   { bg: '#D1F2E0', color: '#1A7F43', label: 'Approuvé' },
    refusé:     { bg: '#FFE5E5', color: '#C0392B', label: 'Refusé' },
    approuvée:  { bg: '#D1F2E0', color: '#1A7F43', label: 'Approuvée' },
    refusée:    { bg: '#FFE5E5', color: '#C0392B', label: 'Refusée' },
  };
  const s = map[statut] || { bg: '#F2F2F7', color: '#6E6E73', label: statut };
  return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
}

/* ── Legal banner ── */
function RHLegalBanner() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ background: '#F3E5F5', border: '1px solid #8E44AD', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>⚖️</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#5B2C6F', flex: 1 }}>
          Obligations RH — droit du travail français (SMIC 2025 : 11,88 €/h · 1 801,80 €/mois)
        </span>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E44AD', fontSize: '0.8125rem', fontWeight: 600 }}>
          {open ? 'Masquer ▲' : 'Voir ▼'}
        </button>
      </div>
      {open && (
        <ul style={{ margin: '10px 0 0 22px', padding: 0, fontSize: '0.8125rem', color: '#1D1D1F', lineHeight: 1.9 }}>
          <li><strong>DPAE obligatoire</strong> auprès de l'URSSAF dans les 8 jours avant tout premier jour travaillé (Art. L1221-10 CT) — risque : requalification travail dissimulé</li>
          <li>Contrat écrit obligatoire pour CDD, temps partiel, intérim, apprentissage</li>
          <li><strong>Registre unique du personnel</strong> à tenir à jour (Art. L1221-13 CT)</li>
          <li>Congés payés : <strong>2,5 jours ouvrables par mois</strong> = 30 jours/an (5 semaines) — Art. L3141-3 CT</li>
          <li>Durée maximale : 10 h/jour · 48 h/semaine · 44 h en moyenne sur 12 semaines</li>
          <li>Convention collective applicable BTP : CCN Ouvriers (IDCC 1597) — mention obligatoire sur fiche de paie</li>
          <li>Carte d'identification professionnelle BTP obligatoire pour tout salarié sur chantier (Décret 2016-175)</li>
          <li>Visite médicale d'embauche à organiser avant ou dans les 3 mois suivant la prise de poste</li>
          <li><strong>Fiche de paie</strong> : conservation illimitée pour le salarié, 5 ans pour l'employeur</li>
        </ul>
      )}
    </div>
  );
}

const TABS_LABELS = ['Tableau de bord', 'Employés', 'Planning', 'Congés', 'Recrutement', 'Formation', 'Pointage', 'Notes de frais', 'Entretiens', 'Onboarding'];
const RH_ONGLET_MAP = { pointage:'Pointage', planning:'Planning', conges:'Congés', frais:'Notes de frais', entretiens:'Entretiens', onboarding:'Onboarding', formation:'Formation', recrutement:'Recrutement' };

export default function RH() {
  const urlOnglet = new URLSearchParams(window.location.search).get('onglet');
  const [tab, setTab] = useState(RH_ONGLET_MAP[urlOnglet] || 'Tableau de bord');
  const [employes, setEmployes] = useState([]);
  const [tdb, setTdb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/rh/employes'),
      api.get('/rh/tableau-de-bord'),
    ]).then(([e, t]) => {
      setEmployes(e.data.employes);
      setTdb(t.data);
    }).catch(() => {
      // Fallback localStorage — charger depuis les fiches salariés
      try {
        const fiches = JSON.parse(localStorage.getItem('freample_fiches_salaries') || '[]');
        if (fiches.length > 0) {
          setEmployes(fiches.map(f => ({ id: f.id, prenom: f.prenom, nom: f.nom, poste: f.poste, email: f.email || '', telephone: f.telephone || '', dateEntree: f.dateEntree || '', salaireBase: f.salaireBase || 2500, typeContrat: f.typeContrat || 'CDI', statut: f.actif ? 'actif' : 'inactif' })));
        } else {
          // Fallback démo depuis profilEntreprise
          setEmployes(DEMO_FICHES_SALARIES.filter(f => !f.isPatron).map(f => ({ id: f.id, prenom: f.prenom, nom: f.nom, poste: f.poste, email: f.email || '', telephone: f.telephone || '', dateEntree: f.dateEntree || '', salaireBase: 2500, typeContrat: 'CDI', statut: 'actif' })));
        }
      } catch {}
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>;

  const alertes = (tdb?.alertes?.congesEnAttente || 0) + (tdb?.alertes?.fraisEnAttente || 0);

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
      {/* Legal banner */}
      <RHLegalBanner />

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Ressources Humaines</h1>
        <p style={{ color: '#6E6E73', marginTop: 4, fontSize: 14 }}>Équipe · Congés · Frais · Paie</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Employés actifs',  value: tdb?.equipe?.actifs || 0,       color: '#5B5BD6', Icon: IconTeam, tabLink: 'Employés' },
          { label: 'CDI',              value: tdb?.equipe?.contratsCDI || 0,   color: '#34C759', Icon: IconDocument, tabLink: null },
          { label: 'CDD',              value: tdb?.equipe?.contratsCDD || 0,   color: '#5B5BD6', Icon: IconDocument, tabLink: null },
          { label: 'Masse salariale',  value: `${(tdb?.masseSalariale?.totalBrut || 0).toLocaleString('fr-FR')} €`, color: '#FF9500', Icon: IconTeam, tabLink: 'Masse salariale', clickable: true },
        ].map(k => (
          <div key={k.label}
            onClick={() => k.tabLink && setTab(k.tabLink)}
            style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: k.clickable ? 'pointer' : 'default', transition: 'transform 0.15s, box-shadow 0.15s', position: 'relative' }}
            onMouseEnter={e => { if (k.clickable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'; }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}18`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <k.Icon size={16} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1E', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 5 }}>{k.label}</div>
            {k.clickable && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, color: k.color, fontWeight: 600 }}>Voir →</div>}
          </div>
        ))}
      </div>

      {alertes > 0 && (
        <div style={{ background: '#FFF3CD', border: '1px solid #FFC107', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <IconAlert size={16} color="#856404" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            {tdb?.alertes?.congesEnAttente > 0 && <p style={{ fontSize: 14, color: '#856404', fontWeight: 500 }}>{tdb.alertes.congesEnAttente} demande(s) de congés en attente</p>}
            {tdb?.alertes?.fraisEnAttente > 0 && <p style={{ fontSize: 14, color: '#856404', fontWeight: 500, marginTop: 2 }}>{tdb.alertes.fraisEnAttente} note(s) de frais en attente</p>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: 4, background: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {TABS_LABELS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#1C1C1E' : '#6E6E73',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Tableau de bord'         && <TabDashboardRH employes={employes} tdb={tdb} setTab={setTab} />}
      {tab === 'Employés'                && <EmployesView employes={employes} />}
      {tab === 'Planning' && <PlanningLocalisationView employes={employes} />}
      {tab === 'Congés'                  && <CongesView />}
      {tab === 'Notes de frais'   && <NotesFraisView />}
      {tab === 'Recrutement'      && <RecrutementView />}
      {tab === 'Formation'        && <FormationView />}
      {tab === 'Pointage'         && <PointageModule employes={employes} />}
      {tab === 'Entretiens'       && <EntretiensModule employes={employes} />}
      {tab === 'Onboarding'       && <OnboardingModule employes={employes} />}
    </div>
  );
}

/* ── Tableau de bord RH ── */
const ACTIVITES_DEMO = [
  { type: 'conge',  text: 'Sophie M. — Congé payé approuvé (15–25 juin)', date: '2025-03-20', color: '#34C759' },
  { type: 'frais',  text: 'Henri L. — Note de frais 142€ en attente',      date: '2025-03-19', color: '#FF9500' },
  { type: 'contrat',text: 'Marc B. — Renouvellement CDD à planifier',      date: '2025-03-18', color: '#FF3B30' },
  { type: 'paie',   text: 'Bulletins de paie Mars générés — 4 employés',  date: '2025-03-15', color: '#5B5BD6' },
];

function TabDashboardRH({ employes, tdb, setTab }) {
  const nb = tdb?.equipe?.actifs || employes?.length || 0;
  const masseBrute = tdb?.masseSalariale?.totalBrut || 0;
  const congesEnAttente = tdb?.alertes?.congesEnAttente || 0;
  const fraisEnAttente  = tdb?.alertes?.fraisEnAttente  || 0;

  const kpis = [
    { label: 'Effectif actif', val: nb, suffix: '', color: '#5B5BD6', sub: `${tdb?.equipe?.contratsCDI||0} CDI · ${tdb?.equipe?.contratsCDD||0} CDD`, tab: 'Employés' },
    { label: 'Masse salariale/mois', val: masseBrute ? (masseBrute/12).toFixed(0) : 28500, suffix: ' €', color: '#FF9500', sub: 'Brut charges incluses', tab: 'Masse salariale' },
    { label: 'Congés en attente', val: congesEnAttente || 2, suffix: '', color: congesEnAttente>0?'#FF3B30':'#34C759', sub: 'demandes à valider', tab: 'Congés' },
    { label: 'Frais à rembourser', val: fraisEnAttente || 3, suffix: '', color: fraisEnAttente>0?'#FF9500':'#34C759', sub: 'notes en attente', tab: 'Notes de frais' },
    { label: 'Bulletins à générer', val: nb, suffix: '', color: '#5B5BD6', sub: `Mars ${new Date().getFullYear()}`, tab: 'Paie' },
    { label: 'Candidats pipeline', val: 5, suffix: '', color: '#AF52DE', sub: '2 en entretien', tab: 'Recrutement' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {kpis.map(k => (
          <div key={k.label} onClick={() => setTab(k.tab)} style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', cursor: 'pointer', transition: 'all 0.15s', border: `1.5px solid transparent` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = k.color + '60'; e.currentTarget.style.boxShadow = `0 8px 24px ${k.color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1 }}>{Number(k.val).toLocaleString('fr-FR')}{k.suffix}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', margin: '6px 0 2px' }}>{k.label}</div>
            <div style={{ fontSize: 11, color: '#636363' }}>{k.sub}</div>
            <div style={{ marginTop: 10, fontSize: 10, color: k.color, fontWeight: 600 }}>Voir détail →</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Répartition contrats */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>Répartition de l'effectif</h3>
          {[
            { label: 'CDI', count: tdb?.equipe?.contratsCDI || 3, total: nb || 4, color: '#5B5BD6' },
            { label: 'CDD', count: tdb?.equipe?.contratsCDD || 1, total: nb || 4, color: '#FF9500' },
            { label: 'Apprentissage', count: 0, total: nb || 4, color: '#34C759' },
            { label: 'Intérim', count: 0, total: nb || 4, color: '#AF52DE' },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#3C3C43' }}>{r.label}</span>
                <span style={{ color: '#636363' }}>{r.count} / {r.total}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#F2F2F7', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.total > 0 ? (r.count / r.total) * 100 : 0}%`, background: r.color, borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Activité récente */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>Activité récente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ACTIVITES_DEMO.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#1C1C1E', lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: '#636363', marginTop: 2 }}>{new Date(a.date).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes RH */}
      <div style={{ background: 'linear-gradient(135deg, #5B5BD6, #0066CC)', borderRadius: 16, padding: '20px 24px', color: '#fff' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions à faire cette semaine</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { emoji: '📋', text: 'Générer les bulletins de paie Mars', urgent: true },
            { emoji: '✅', text: `Valider ${congesEnAttente || 2} demandes de congés`, urgent: congesEnAttente > 0 },
            { emoji: '💰', text: `Rembourser ${fraisEnAttente || 3} notes de frais`, urgent: fraisEnAttente > 0 },
          ].map((a, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 14px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{a.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{a.text}</div>
              {a.urgent && <div style={{ fontSize: 10, marginTop: 4, background: 'rgba(255,59,48,0.3)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>Urgent</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Recrutement ── */
const PIPELINE_STAGES = ['nouvelle', 'examinée', 'entretien', 'retenue', 'rejetée'];
const PIPELINE_LABELS = { nouvelle:'Nouvelle', examinée:'CV examiné', entretien:'Entretien', retenue:'Retenue', rejetée:'Rejetée' };
const PIPELINE_COLORS = { nouvelle:'#636363', examinée:'#5B5BD6', entretien:'#FF9500', retenue:'#34C759', rejetée:'#C0392B' };
const CONTRATS = ['CDI','CDD','Intérim','Alternance','Stage','Freelance'];
const POSTES_BTP = ['Maçon','Plombier','Électricien','Charpentier','Menuisier','Carreleur','Peintre','Chef de chantier','Conducteur de travaux','Grutier','Coffreur','Étancheur','Autre'];

const FORM_ANNONCE_INIT = { titre:'', poste:'', typeContrat:'CDI', description:'', localisation:'', salaireMin:'', salaireMax:'', experience:'', competences:'', dateDebut:'', nomEntreprise:'' };

function RecrutementView() {
  const [view, setView] = useState('annonces'); // 'annonces' | 'pipeline' | 'create'
  const [annonces, setAnnonces] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [form, setForm] = useState(FORM_ANNONCE_INIT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedCand, setSelectedCand] = useState(null);
  const [candDetail, setCandDetail] = useState(null);
  const [embaucheForm, setEmbaucheForm] = useState({ poste:'', typeContrat:'CDI', salaireBase:'', dateEntree:'' });
  const [showEmbaucheForm, setShowEmbaucheForm] = useState(false);
  const [docsSent, setDocsSent] = useState({});
  const [empDocs, setEmpDocs] = useState([]);
  const [loadingAction, setLoadingAction] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function fetchAnnonces() {
    try {
      const r = await api.get('/recrutement/patron/annonces');
      setAnnonces(r.data.annonces || []);
    } catch { setAnnonces([]); }
  }

  async function fetchCandidatures(annonceId) {
    try {
      const r = await api.get(`/recrutement/patron/annonces/${annonceId}/candidatures`);
      setCandidatures(r.data.candidatures || []);
    } catch { setCandidatures([]); }
  }

  useEffect(() => { fetchAnnonces(); }, []);

  async function creerAnnonce(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/recrutement/patron/annonces', {
        ...form,
        salaireMin: form.salaireMin ? Number(form.salaireMin) : null,
        salaireMax: form.salaireMax ? Number(form.salaireMax) : null,
      });
      showToast('Annonce publiée sur la page d\'accueil !');
      await fetchAnnonces();
      setView('annonces');
      setForm(FORM_ANNONCE_INIT);
    } catch (err) {
      showToast(err.response?.data?.erreur || 'Erreur lors de la publication');
    }
    setSaving(false);
  }

  async function fermerAnnonce(id) {
    await api.put(`/recrutement/patron/annonces/${id}`, { statut: 'fermée' }).catch(() => {});
    showToast('Annonce fermée');
    await fetchAnnonces();
  }

  async function supprimerAnnonce(id) {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    await api.delete(`/recrutement/patron/annonces/${id}`).catch(() => {});
    showToast('Annonce supprimée');
    await fetchAnnonces();
  }

  async function avancerCandidature(candId, statut) {
    setLoadingAction(statut);
    await api.put(`/recrutement/patron/candidatures/${candId}`, { statut }).catch(() => {});
    await fetchCandidatures(selectedAnnonce.id);
    setLoadingAction('');
    const labels = { examinée:'CV marqué comme examiné — notification envoyée', entretien:'Entretien planifié — notification envoyée', retenue:'Candidature retenue — notification envoyée', rejetée:'Candidature rejetée — notification envoyée' };
    showToast(labels[statut] || 'Statut mis à jour');
  }

  async function noterCandidature(candId, noteInterne) {
    await api.put(`/recrutement/patron/candidatures/${candId}`, { noteInterne }).catch(() => {});
    setCandidatures(prev => prev.map(c => c.id === candId ? { ...c, noteInterne } : c));
  }

  async function envoyerDocsEmail(candId) {
    setLoadingAction('docs');
    try {
      await api.post(`/recrutement/patron/candidatures/${candId}/envoyer-documents`);
      setDocsSent(prev => ({ ...prev, [candId]: true }));
      showToast('Email envoyé avec la liste des documents à fournir');
    } catch { showToast('Erreur lors de l\'envoi'); }
    setLoadingAction('');
  }

  async function creerEmployeDepuisCand(candId) {
    setLoadingAction('embauche');
    try {
      const { data } = await api.post(`/recrutement/patron/candidatures/${candId}/creer-employe`, embaucheForm);
      showToast(`Compte créé ! Identifiants envoyés à ${data.identifiants.email}`);
      setCandDetail(d => ({ ...d, employeId: data.employe.id, identifiants: data.identifiants }));
      setShowEmbaucheForm(false);
      await fetchCandidatures(selectedAnnonce.id);
    } catch (err) { showToast(err.response?.data?.erreur || 'Erreur création compte'); }
    setLoadingAction('');
  }

  async function fetchEmployeDocs(employeId) {
    try {
      const { data } = await api.get(`/rh/employes/${employeId}/documents`);
      setEmpDocs(data.documents || []);
    } catch { setEmpDocs([]); }
  }

  async function validerDocument(docId, statut) {
    await api.put(`/rh/documents/${docId}/valider`, { statut }).catch(() => {});
    if (candDetail?.employeId) fetchEmployeDocs(candDetail.employeId);
    showToast(`Document ${statut === 'valide' ? 'validé' : 'refusé'}`);
  }

  const statutBadgeAnnonce = (s) => {
    const m = { active:{ bg:'#D1F2E0', c:'#1A7F43', l:'Active' }, fermée:{ bg:'#FFE5E5', c:'#C0392B', l:'Fermée' } };
    const x = m[s] || m.active;
    return <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700, background:x.bg, color:x.c }}>{x.l}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: '#1A7F43', color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E5E5EA', paddingBottom: 0 }}>
        {[['annonces','Mes annonces'],['pipeline','Pipeline candidatures']].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} style={{ padding: '9px 18px', background: 'none', border: 'none', borderBottom: view === v ? '2px solid #5B5BD6' : '2px solid transparent', cursor: 'pointer', fontWeight: view === v ? 700 : 500, color: view === v ? '#5B5BD6' : '#6E6E73', fontSize: 14, marginBottom: -1 }}>
            {l}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setView('create')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, marginBottom: 4 }}>
          <IconPlus size={14} /> Publier une annonce
        </button>
      </div>

      {/* ── Formulaire création ── */}
      {view === 'create' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Nouvelle annonce de recrutement</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>Elle sera visible sur la page d'accueil dans la section "Ils recrutent"</p>
            </div>
            <button onClick={() => setView('annonces')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#636363' }}>×</button>
          </div>
          <form onSubmit={creerAnnonce}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Titre de l'annonce *</label>
                <input value={form.titre} onChange={e => setForm(p => ({...p, titre: e.target.value}))} required
                  placeholder="Ex : Maçon qualifié N3 — CDI Orléans" style={{ ...inp, fontSize: 15, fontWeight: 600 }} />
              </div>
              <div>
                <label style={lbl}>Poste / Métier *</label>
                <select value={form.poste} onChange={e => setForm(p => ({...p, poste: e.target.value}))} required style={inp}>
                  <option value="">Sélectionner…</option>
                  {POSTES_BTP.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Type de contrat</label>
                <select value={form.typeContrat} onChange={e => setForm(p => ({...p, typeContrat: e.target.value}))} style={inp}>
                  {CONTRATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Localisation *</label>
                <input value={form.localisation} onChange={e => setForm(p => ({...p, localisation: e.target.value}))} required
                  placeholder="Ex : Orléans (45)" style={inp} />
              </div>
              <div>
                <label style={lbl}>Nom de l'entreprise (affiché publiquement)</label>
                <input value={form.nomEntreprise} onChange={e => setForm(p => ({...p, nomEntreprise: e.target.value}))}
                  placeholder="Ex : Bernard Martin BTP" style={inp} />
              </div>
              <div>
                <label style={lbl}>Salaire min (€ brut/mois)</label>
                <input type="number" min={0} value={form.salaireMin} onChange={e => setForm(p => ({...p, salaireMin: e.target.value}))}
                  placeholder="Ex : 2200" style={inp} />
              </div>
              <div>
                <label style={lbl}>Salaire max (€ brut/mois)</label>
                <input type="number" min={0} value={form.salaireMax} onChange={e => setForm(p => ({...p, salaireMax: e.target.value}))}
                  placeholder="Ex : 2800" style={inp} />
              </div>
              <div>
                <label style={lbl}>Expérience requise</label>
                <input value={form.experience} onChange={e => setForm(p => ({...p, experience: e.target.value}))}
                  placeholder="Ex : 3 ans minimum, N2/N3" style={inp} />
              </div>
              <div>
                <label style={lbl}>Date de démarrage souhaitée</label>
                <input type="date" value={form.dateDebut} onChange={e => setForm(p => ({...p, dateDebut: e.target.value}))} style={inp} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Compétences recherchées</label>
                <input value={form.competences} onChange={e => setForm(p => ({...p, competences: e.target.value}))}
                  placeholder="Ex : Maçonnerie traditionnelle, coffrage, lecture de plans, CACES…" style={inp} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Description du poste *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required rows={6}
                  placeholder="Décrivez les missions, les conditions de travail, les avantages, les qualités recherchées…"
                  style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setView('annonces'); setForm(FORM_ANNONCE_INIT); }} style={{ padding: '9px 20px', background: '#F2F2F7', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Annuler
              </button>
              <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 24px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14 }}>
                {saving ? 'Publication…' : '🚀 Publier l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Liste des annonces ── */}
      {view === 'annonces' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {annonces.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, padding: 60, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1C1C1E', marginBottom: 8 }}>Aucune annonce publiée</p>
              <p style={{ color: '#636363', marginBottom: 20, fontSize: 14 }}>Publiez votre première offre d'emploi, elle apparaîtra sur la page d'accueil.</p>
              <button onClick={() => setView('create')} style={{ padding: '10px 24px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                <IconPlus size={14} /> Publier une annonce
              </button>
            </div>
          ) : annonces.map(a => (
            <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#1C1C1E' }}>{a.titre}</span>
                  {statutBadgeAnnonce(a.statut)}
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: '#6E6E73' }}>
                  <span>💼 {a.typeContrat}</span>
                  <span>📍 {a.localisation}</span>
                  {a.salaireMin && <span>💶 {a.salaireMin.toLocaleString('fr-FR')} – {a.salaireMax?.toLocaleString('fr-FR') || '?'} €/mois</span>}
                  <span>📅 Publiée le {new Date(a.creeLe).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { setSelectedAnnonce(a); fetchCandidatures(a.id); setView('pipeline'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#E3F2FD', color: '#1565C0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  👥 {a.nbCandidatures} candidature{a.nbCandidatures !== 1 ? 's' : ''}
                </button>
                {a.statut === 'active' && (
                  <button onClick={() => fermerAnnonce(a.id)} style={{ padding: '7px 14px', background: '#FFF3E0', color: '#E65100', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    Fermer
                  </button>
                )}
                <button onClick={() => supprimerAnnonce(a.id)} style={{ padding: '7px 12px', background: '#FFE5E5', color: '#C0392B', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pipeline candidatures ── */}
      {view === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => { setView('annonces'); setSelectedAnnonce(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B5BD6', fontWeight: 600, fontSize: 14 }}>
              ← Retour aux annonces
            </button>
            {selectedAnnonce && (
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>
                {selectedAnnonce.titre} — {candidatures.length} candidature{candidatures.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Kanban */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {PIPELINE_STAGES.map(stage => {
              const stageCands = candidatures.filter(c => c.statut === stage);
              const sc = PIPELINE_COLORS[stage];
              const sl = PIPELINE_LABELS[stage];
              return (
                <div key={stage} style={{ background: '#F8F9FA', borderRadius: 12, padding: 12, minHeight: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sc, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sl}</span>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: sc + '22', color: sc, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stageCands.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stageCands.map(c => (
                      <div key={c.id} onClick={() => setCandDetail(c)} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `3px solid ${sc}`, cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1E', marginBottom: 1 }}>{c.prenom} {c.nom}</div>
                        <div style={{ fontSize: 11, color: '#636363', marginBottom: 4 }}>{c.email}</div>
                        {c.telephone && <div style={{ fontSize: 11, color: '#6E6E73', marginBottom: 4 }}>📞 {c.telephone}</div>}
                        <div style={{ fontSize: 10, color: '#5B5BD6', fontWeight: 600, marginTop: 4 }}>Cliquer pour voir le profil →</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Panel détail candidature ── */}
      {candDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) { setCandDetail(null); setShowEmbaucheForm(false); setEmpDocs([]); } }}>
          <div style={{ width: '100%', maxWidth: 540, background: '#fff', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>
            {/* Header sticky */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1C1C1E' }}>{candDetail.prenom} {candDetail.nom}</h3>
                <StatutBadge statut={candDetail.statut} />
              </div>
              <button onClick={() => { setCandDetail(null); setShowEmbaucheForm(false); setEmpDocs([]); }} style={{ background: '#F2F2F7', border: 'none', cursor: 'pointer', fontSize: 18, color: '#3A3A3C', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Coordonnées */}
              <div style={{ background: '#F9F9FB', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordonnées</p>
                <p style={{ margin: '4px 0', fontSize: 13, color: '#1C1C1E' }}>📧 <a href={`mailto:${candDetail.email}`} style={{ color: '#5B5BD6', textDecoration: 'none' }}>{candDetail.email}</a></p>
                {candDetail.telephone && <p style={{ margin: '4px 0', fontSize: 13, color: '#1C1C1E' }}>📞 <a href={`tel:${candDetail.telephone}`} style={{ color: '#5B5BD6', textDecoration: 'none' }}>{candDetail.telephone}</a></p>}
                <p style={{ margin: '8px 0 0', fontSize: 11, color: '#636363' }}>Candidature reçue le {new Date(candDetail.creeLe).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
              </div>

              {/* Lettre de motivation */}
              {candDetail.lettre && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lettre de motivation</p>
                  <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#3A3A3C', lineHeight: 1.75, whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto', border: '1px solid #F2F2F7' }}>
                    {candDetail.lettre}
                  </div>
                </div>
              )}

              {/* CV / Expérience */}
              {candDetail.cvTexte && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expériences & CV</p>
                  <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#3A3A3C', lineHeight: 1.75, whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto', border: '1px solid #F2F2F7' }}>
                    {candDetail.cvTexte}
                  </div>
                </div>
              )}

              {/* Note interne */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note interne</p>
                <textarea
                  defaultValue={candDetail.noteInterne || ''}
                  onBlur={async e => { if (e.target.value !== (candDetail.noteInterne || '')) { await noterCandidature(candDetail.id, e.target.value); setCandDetail(d => ({ ...d, noteInterne: e.target.value })); }}}
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                  placeholder="Note privée visible uniquement par votre équipe…"
                />
              </div>

              {/* ── Actions pipeline ── */}
              <div style={{ borderTop: '1px solid #F2F2F7', paddingTop: 16 }}>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline de recrutement</p>

                {/* Barre de progression visuelle */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {PIPELINE_STAGES.filter(s => s !== 'rejetée').map(s => {
                    const idx = PIPELINE_STAGES.indexOf(s);
                    const currentIdx = PIPELINE_STAGES.indexOf(candDetail.statut);
                    const done = candDetail.statut !== 'rejetée' && currentIdx >= idx;
                    return <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: 4, borderRadius: 2, background: done ? PIPELINE_COLORS[s] : '#E5E5EA', marginBottom: 4, transition: 'background .3s' }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: done ? PIPELINE_COLORS[s] : '#8E8E93' }}>{PIPELINE_LABELS[s]}</span>
                    </div>;
                  })}
                </div>

                {/* Boutons d'avancement contextuels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {candDetail.statut === 'nouvelle' && (
                    <button disabled={loadingAction === 'examinée'} onClick={async () => { await avancerCandidature(candDetail.id, 'examinée'); setCandDetail(d => ({ ...d, statut: 'examinée' })); }}
                      style={{ padding: '12px 16px', background: '#EEF2FF', color: '#5B5BD6', border: '1px solid rgba(91,91,214,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'left' }}>
                      👀 {loadingAction === 'examinée' ? 'Envoi notification...' : 'Marquer CV comme examiné'} <span style={{ float: 'right', fontSize: 11, opacity: 0.7 }}>→ Notification envoyée au candidat</span>
                    </button>
                  )}

                  {candDetail.statut === 'examinée' && <>
                    <button disabled={loadingAction === 'entretien'} onClick={async () => { await avancerCandidature(candDetail.id, 'entretien'); setCandDetail(d => ({ ...d, statut: 'entretien' })); }}
                      style={{ padding: '12px 16px', background: '#FFF7ED', color: '#C2610C', border: '1px solid rgba(194,97,12,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'left' }}>
                      📞 {loadingAction === 'entretien' ? 'Envoi...' : 'Proposer un entretien'} <span style={{ float: 'right', fontSize: 11, opacity: 0.7 }}>→ Notification envoyée</span>
                    </button>
                    <button disabled={loadingAction === 'rejetée'} onClick={async () => { await avancerCandidature(candDetail.id, 'rejetée'); setCandDetail(d => ({ ...d, statut: 'rejetée' })); }}
                      style={{ padding: '10px 16px', background: '#FEF2F2', color: '#C0392B', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12, textAlign: 'left' }}>
                      ❌ Rejeter la candidature
                    </button>
                  </>}

                  {candDetail.statut === 'entretien' && <>
                    <div style={{ background: '#FFF7ED', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(194,97,12,0.15)' }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#C2610C' }}>📞 Entretien en cours</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#636363' }}>Appelez le candidat ou rencontrez-le. Mettez à jour le statut après l'entretien.</p>
                    </div>
                    <button disabled={loadingAction === 'retenue'} onClick={async () => { await avancerCandidature(candDetail.id, 'retenue'); setCandDetail(d => ({ ...d, statut: 'retenue' })); }}
                      style={{ padding: '12px 16px', background: '#F0FDF4', color: '#1A7F43', border: '1px solid rgba(26,127,67,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'left' }}>
                      ✅ {loadingAction === 'retenue' ? 'Envoi...' : 'Retenir / Embaucher'} <span style={{ float: 'right', fontSize: 11, opacity: 0.7 }}>→ Email de félicitations envoyé</span>
                    </button>
                    <button disabled={loadingAction === 'rejetée'} onClick={async () => { await avancerCandidature(candDetail.id, 'rejetée'); setCandDetail(d => ({ ...d, statut: 'rejetée' })); }}
                      style={{ padding: '10px 16px', background: '#FEF2F2', color: '#C0392B', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12, textAlign: 'left' }}>
                      ❌ Rejeter après entretien
                    </button>
                  </>}

                  {candDetail.statut === 'retenue' && <>
                    <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(26,127,67,0.15)' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1A7F43' }}>🎉 Candidature retenue</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#636363' }}>Le candidat a reçu un email de félicitations. Suivez les étapes ci-dessous pour finaliser l'embauche.</p>
                    </div>

                    {/* Étape 1 : Envoyer la liste des documents */}
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: docsSent[candDetail.id] ? '#16A34A' : '#5B5BD6', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{docsSent[candDetail.id] ? '✓' : '1'}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Envoyer la liste des documents</span>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#636363', paddingLeft: 34 }}>
                        Envoie un email au candidat avec la liste complète des documents à fournir (pièce d'identité, RIB, carte vitale, diplômes...)
                      </p>
                      {!docsSent[candDetail.id] ? (
                        <button disabled={loadingAction === 'docs'} onClick={() => envoyerDocsEmail(candDetail.id)}
                          style={{ marginLeft: 34, padding: '8px 16px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                          {loadingAction === 'docs' ? 'Envoi en cours...' : '📧 Envoyer l\'email des documents'}
                        </button>
                      ) : (
                        <p style={{ margin: 0, paddingLeft: 34, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>✅ Email envoyé</p>
                      )}
                    </div>

                    {/* Étape 2 : Créer le compte salarié */}
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: candDetail.employeId ? '#16A34A' : '#5B5BD6', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{candDetail.employeId ? '✓' : '2'}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Créer le compte salarié</span>
                      </div>

                      {candDetail.employeId ? (
                        <div style={{ paddingLeft: 34 }}>
                          <p style={{ margin: '0 0 6px', fontSize: 12, color: '#16A34A', fontWeight: 600 }}>✅ Compte créé — identifiants envoyés par email</p>
                          {candDetail.identifiants && (
                            <div style={{ background: '#F4F4F8', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                              <p style={{ margin: '0 0 4px' }}><strong>Email :</strong> {candDetail.identifiants.email}</p>
                              <p style={{ margin: 0 }}><strong>Mot de passe temporaire :</strong> <code style={{ background: '#E8E6E1', padding: '1px 6px', borderRadius: 4 }}>{candDetail.identifiants.motdepasse}</code></p>
                            </div>
                          )}
                        </div>
                      ) : !showEmbaucheForm ? (
                        <button onClick={() => { setEmbaucheForm({ poste: selectedAnnonce?.poste || '', typeContrat: selectedAnnonce?.typeContrat || 'CDI', salaireBase: '', dateEntree: '' }); setShowEmbaucheForm(true); }}
                          style={{ marginLeft: 34, padding: '8px 16px', background: '#1A7F43', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                          👤 Créer le compte et envoyer les codes
                        </button>
                      ) : (
                        <div style={{ paddingLeft: 34, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Poste</label>
                              <input value={embaucheForm.poste} onChange={e => setEmbaucheForm(f => ({ ...f, poste: e.target.value }))}
                                style={{ width: '100%', padding: '7px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, boxSizing: 'border-box', outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Contrat</label>
                              <select value={embaucheForm.typeContrat} onChange={e => setEmbaucheForm(f => ({ ...f, typeContrat: e.target.value }))}
                                style={{ width: '100%', padding: '7px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, boxSizing: 'border-box', outline: 'none' }}>
                                {CONTRATS.map(c => <option key={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Salaire brut (€)</label>
                              <input type="number" value={embaucheForm.salaireBase} onChange={e => setEmbaucheForm(f => ({ ...f, salaireBase: e.target.value }))}
                                placeholder="2400" style={{ width: '100%', padding: '7px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, boxSizing: 'border-box', outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Date d'entrée</label>
                              <input type="date" value={embaucheForm.dateEntree} onChange={e => setEmbaucheForm(f => ({ ...f, dateEntree: e.target.value }))}
                                style={{ width: '100%', padding: '7px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, boxSizing: 'border-box', outline: 'none' }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button disabled={loadingAction === 'embauche'} onClick={() => creerEmployeDepuisCand(candDetail.id)}
                              style={{ padding: '8px 16px', background: '#1A7F43', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                              {loadingAction === 'embauche' ? 'Création...' : '✅ Confirmer et envoyer les identifiants'}
                            </button>
                            <button onClick={() => setShowEmbaucheForm(false)}
                              style={{ padding: '8px 12px', background: '#F2F2F7', color: '#636363', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Étape 3 : Suivi documents employé (temps réel) */}
                    {candDetail.employeId && (
                      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#5B5BD6', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Documents déposés par le salarié</span>
                          </div>
                          <button onClick={() => fetchEmployeDocs(candDetail.employeId)}
                            style={{ padding: '4px 10px', background: '#F2F2F7', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#5B5BD6' }}>
                            ↻ Actualiser
                          </button>
                        </div>
                        {empDocs.length === 0 ? (
                          <p style={{ margin: 0, paddingLeft: 34, fontSize: 12, color: '#8E8E93' }}>Aucun document déposé pour le moment. Le salarié peut les déposer depuis son espace "Mes documents".</p>
                        ) : (
                          <div style={{ paddingLeft: 34, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {empDocs.map(doc => {
                              const sColor = { en_attente:'#D97706', valide:'#16A34A', refuse:'#DC2626' };
                              const sLabel = { en_attente:'En attente', valide:'Validé', refuse:'Refusé' };
                              return (
                                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#F9F9FB', borderRadius: 8, fontSize: 12 }}>
                                  <div>
                                    <span style={{ fontWeight: 600 }}>{doc.type_document.replace(/_/g, ' ')}</span>
                                    <span style={{ color: '#8E8E93', marginLeft: 8 }}>{doc.nom_fichier}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: sColor[doc.statut], background: sColor[doc.statut] + '18', padding: '2px 6px', borderRadius: 4 }}>{sLabel[doc.statut]}</span>
                                    {doc.statut === 'en_attente' && <>
                                      <button onClick={() => validerDocument(doc.id, 'valide')} style={{ padding: '3px 8px', background: '#F0FDF4', color: '#16A34A', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>✓</button>
                                      <button onClick={() => validerDocument(doc.id, 'refuse')} style={{ padding: '3px 8px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>✗</button>
                                    </>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>}

                  {candDetail.statut === 'rejetée' && (
                    <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(192,57,43,0.15)' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#C0392B' }}>❌ Candidature rejetée</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#636363' }}>Le candidat a été notifié par email.</p>
                    </div>
                  )}
                </div>

                <p style={{ margin: '12px 0 0', fontSize: 11, color: '#636363' }}>
                  💡 Le candidat reçoit un email de notification à chaque changement de statut.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Formation ── */
const FORMATIONS_DEMO = [
  { id:1, titre:'Habilitations électriques B1/B2', employe:'Marc Bernard', organisme:'APAVE', dateDebut:'2025-04-10', dateFin:'2025-04-12', cout:890, statut:'planifie', obligatoire:true },
  { id:2, titre:'Travail en hauteur — Port du harnais', employe:'Pierre Martin', organisme:'PREVENTIS', dateDebut:'2025-05-05', dateFin:'2025-05-05', cout:350, statut:'planifie', obligatoire:true },
  { id:3, titre:'CACES R489 — Chariot élévateur', employe:'Jacques Durand', organisme:'Bureau Véritas', dateDebut:'2025-03-15', dateFin:'2025-03-17', cout:720, statut:'realise', obligatoire:false },
  { id:4, titre:'Management d\'équipe de chantier', employe:'Sophie RH', organisme:'AFPA', dateDebut:'2025-06-02', dateFin:'2025-06-03', cout:1200, statut:'planifie', obligatoire:false },
];

function FormationView() {
  const [formations, setFormations] = useState(FORMATIONS_DEMO);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre:'', employe:'', organisme:'', dateDebut:'', dateFin:'', cout:'', statut:'planifie', obligatoire:false });

  const totalBudget = formations.reduce((s, f) => s + Number(f.cout||0), 0);
  const coutRealise = formations.filter(f => f.statut === 'realise').reduce((s, f) => s + Number(f.cout||0), 0);

  const statMap = { planifie:{bg:'#E3F2FD',c:'#1565C0',l:'Planifiée'}, realise:{bg:'#D1F2E0',c:'#1A7F43',l:'Réalisée'}, annule:{bg:'#FFE5E5',c:'#C0392B',l:'Annulée'} };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Plan de formation</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>Obligation formation : {formatCur(coutRealise)} réalisés sur {formatCur(totalBudget)} prévus</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          <IconPlus size={14} /> Ajouter une formation
        </button>
      </div>

      {/* Budget bar */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Budget formation {new Date().getFullYear()}</span>
          <span style={{ color: '#6E6E73' }}>{formatCur(coutRealise)} / {formatCur(totalBudget)}</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: '#F2F2F7', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalBudget > 0 ? Math.min(100, (coutRealise/totalBudget)*100) : 0}%`, background: '#34C759', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 11, color: '#636363', marginTop: 6 }}>Obligation légale : 0,55% de la masse salariale en formation professionnelle (Art. L6331-1)</div>
      </div>

      {showForm && (
        <div style={{ background: '#F0F7FF', border: '2px solid rgba(0,122,255,0.2)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>Nouvelle formation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ gridColumn:'1/3' }}><label style={lbl}>Intitulé de la formation</label><input value={form.titre} onChange={e=>setForm(p=>({...p,titre:e.target.value}))} placeholder="Ex: Habilitation électrique B1" style={inp}/></div>
            <div><label style={lbl}>Salarié concerné</label><input value={form.employe} onChange={e=>setForm(p=>({...p,employe:e.target.value}))} placeholder="Nom Prénom" style={inp}/></div>
            <div><label style={lbl}>Organisme</label><input value={form.organisme} onChange={e=>setForm(p=>({...p,organisme:e.target.value}))} placeholder="APAVE, AFPA…" style={inp}/></div>
            <div><label style={lbl}>Date début</label><input type="date" value={form.dateDebut} onChange={e=>setForm(p=>({...p,dateDebut:e.target.value}))} style={inp}/></div>
            <div><label style={lbl}>Date fin</label><input type="date" value={form.dateFin} onChange={e=>setForm(p=>({...p,dateFin:e.target.value}))} style={inp}/></div>
            <div><label style={lbl}>Coût (€)</label><input type="number" value={form.cout} onChange={e=>setForm(p=>({...p,cout:e.target.value}))} placeholder="0" style={inp}/></div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" id="oblig" checked={form.obligatoire} onChange={e=>setForm(p=>({...p,obligatoire:e.target.checked}))} style={{ width:16,height:16 }}/>
              <label htmlFor="oblig" style={{...lbl, marginBottom:0, cursor:'pointer'}}>Formation réglementaire</label>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            <button onClick={() => setShowForm(false)} style={{ padding:'8px 16px', border:'1px solid #E5E5EA', borderRadius:9, background:'#fff', cursor:'pointer', fontWeight:600, fontSize:13 }}>Annuler</button>
            <button onClick={() => { if(!form.titre||!form.employe) return; setFormations(p=>[...p,{...form,id:Date.now()}]); setShowForm(false); setForm({titre:'',employe:'',organisme:'',dateDebut:'',dateFin:'',cout:'',statut:'planifie',obligatoire:false}); }} style={{ padding:'8px 18px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:13 }}>Ajouter</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
              {['Formation','Salarié','Organisme','Dates','Coût','Oblig.','Statut'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formations.map(f => {
              const sm = statMap[f.statut] || statMap.planifie;
              return (
                <tr key={f.id} style={{ borderBottom: '1px solid #F8F8F8' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{f.titre}</td>
                  <td style={{ padding: '10px 14px', color: '#6E6E73' }}>{f.employe}</td>
                  <td style={{ padding: '10px 14px', color: '#6E6E73', fontSize: 12 }}>{f.organisme}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6E6E73' }}>{formatDate(f.dateDebut)}{f.dateFin && f.dateFin !== f.dateDebut ? ` → ${formatDate(f.dateFin)}` : ''}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1C1C1E' }}>{formatCur(f.cout)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{f.obligatoire ? <span style={{ fontSize: 12, color: '#C0392B', fontWeight: 700 }}>Oui</span> : '—'}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:sm.bg, color:sm.c }}>{sm.l}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Employés ── */
const EMPLOYE_VIDE = {
  prenom:'', nom:'', email:'', telephone:'',
  adresse:'', codePostal:'', ville:'',
  dateNaissance:'', lieuNaissance:'', nationalite:'Française',
  numeroSecuriteSociale:'',
  poste:'', qualification:'', typeContrat:'CDI',
  dateEntree:'', dateFinContrat:'',
  salaireBase:'',
  iban:'', bic:'', nomBanque:'',
  urgenceNom:'', urgenceTel:'', urgenceLien:'',
  medecineVisite:'', mutuelle:'', coefficient:'',
  carteProBTPNumero:'', carteProBTPExpiration:'',
};

function EmployesView({ employes: initEmployes }) {
  const [employes, setEmployes] = useState(initEmployes);
  const [modal, setModal] = useState(null); // null | 'add' | employe-object (edit)
  const [form, setForm] = useState(EMPLOYE_VIDE);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  function openAdd() { setForm(EMPLOYE_VIDE); setModal('add'); }
  function openEdit(e) { setForm({ ...EMPLOYE_VIDE, ...e }); setModal(e); setSelected(e.id); }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        const r = await api.post('/rh/employes', form);
        setEmployes(prev => [...prev, r.data.employe || { ...form, id: Date.now() }]);
      } else {
        await api.put(`/rh/employes/${modal.id}`, form);
        setEmployes(prev => prev.map(e => e.id === modal.id ? { ...e, ...form } : e));
      }
      setModal(null);
    } catch (err) {
      const r = await api.get('/rh/employes').catch(() => null);
      if (r) setEmployes(r.data.employes);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  const Section = ({ title }) => (
    <div style={{ gridColumn: '1/-1', paddingTop: 10, borderTop: '1px solid #F2F2F7', marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          <IconPlus size={14} /> Ajouter un employé
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
              {['Employé', 'Poste', 'Contrat', 'Salaire brut', 'Entrée', 'Statut', 'Contact', ''].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employes.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#636363' }}>Aucun employé — cliquez sur "Ajouter" pour commencer</td></tr>
            ) : employes.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #F2F2F7', cursor: 'pointer' }} onClick={() => openEdit(e)}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#5B5BD620', color: '#5B5BD6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {((e.prenom?.[0] || '') + (e.nom?.[0] || '')).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{e.prenom} {e.nom}</div>
                      <div style={{ fontSize: 12, color: '#636363' }}>{e.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{e.poste}</div>
                  {e.qualification && <div style={{ fontSize: 11, color: '#636363' }}>{e.qualification}</div>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: e.typeContrat === 'CDI' ? '#D1F2E0' : e.typeContrat === 'CDD' ? '#E3F2FD' : '#FFF3CD', color: e.typeContrat === 'CDI' ? '#1A7F43' : e.typeContrat === 'CDD' ? '#1565C0' : '#856404' }}>
                    {e.typeContrat}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{Number(e.salaireBase || 0).toLocaleString('fr-FR')} €</td>
                <td style={{ padding: '12px 16px', color: '#6E6E73', fontSize: 13 }}>{e.dateEntree || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  {e.statut === 'inactif' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: 10, display: 'inline-block' }}>Inactif</span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '3px 10px', borderRadius: 10, display: 'inline-block' }}>Actif</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#6E6E73' }}>{e.telephone || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={ev => { ev.stopPropagation(); openEdit(e); }} style={{ padding: '5px 12px', border: '1px solid #E5E5EA', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#5B5BD6' }}>
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal add/edit */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 740, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{modal === 'add' ? 'Nouvel employé' : `Modifier — ${form.prenom} ${form.nom}`}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#636363' }}>✕</button>
            </div>

            {/* Option recruter un compte existant */}
            {modal === 'add' && (
              <div style={{ marginBottom: 20, padding: '14px 18px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3730A3', marginBottom: 8 }}>🔍 Recruter un utilisateur Freample existant</div>
                <div style={{ fontSize: 13, color: '#5B5BD6', marginBottom: 12 }}>Si l'employé a déjà un compte Freample (ex: ancien employé d'une autre entreprise), entrez son email pour le rattacher à votre entreprise.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="Email du compte Freample existant" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #C7D2FE', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                  <button type="button" onClick={() => alert('Fonctionnalité bientôt disponible — le compte sera rattaché à votre entreprise')} style={{ padding: '10px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>Rechercher</button>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>L'employé recevra une invitation à rejoindre votre entreprise. Son historique et ses compétences seront conservés.</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                <Section title="Identité" />
                <div><label style={lbl}>Prénom *</label><input {...f('prenom')} required placeholder="Jean" style={inp}/></div>
                <div><label style={lbl}>Nom *</label><input {...f('nom')} required placeholder="Dupont" style={inp}/></div>
                <div><label style={lbl}>Date de naissance</label><input type="date" {...f('dateNaissance')} style={inp}/></div>
                <div><label style={lbl}>Lieu de naissance</label><input {...f('lieuNaissance')} placeholder="Paris (75)" style={inp}/></div>
                <div><label style={lbl}>Nationalité</label><input {...f('nationalite')} placeholder="Française" style={inp}/></div>
                <div><label style={lbl}>N° Sécurité Sociale</label><input {...f('numeroSecuriteSociale')} placeholder="1 85 06 75 123 456 78" style={inp}/></div>

                <Section title="Coordonnées" />
                <div><label style={lbl}>Email</label><input type="email" {...f('email')} placeholder="jean.dupont@email.com" style={inp}/></div>
                <div><label style={lbl}>Téléphone</label><input {...f('telephone')} placeholder="06 12 34 56 78" style={inp}/></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Adresse</label><input {...f('adresse')} placeholder="12 rue des Artisans" style={inp}/></div>
                <div><label style={lbl}>Code postal</label><input {...f('codePostal')} placeholder="75001" style={inp}/></div>
                <div><label style={lbl}>Ville</label><input {...f('ville')} placeholder="Paris" style={inp}/></div>

                <Section title="Contrat" />
                <div><label style={lbl}>Poste *</label><input {...f('poste')} required placeholder="Maçon, Électricien…" style={inp}/></div>
                <div><label style={lbl}>Qualification / Coefficient</label><input {...f('qualification')} placeholder="Ouvrier P2, Technicien N2…" style={inp}/></div>
                <div>
                  <label style={lbl}>Type de contrat</label>
                  <select {...f('typeContrat')} style={inp}>
                    {['CDI','CDD','Intérim','Apprentissage','Stage'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Salaire brut mensuel (€) *</label><input type="number" {...f('salaireBase')} required placeholder="2500" style={inp}/></div>
                <div><label style={lbl}>Date d'entrée</label><input type="date" {...f('dateEntree')} style={inp}/></div>
                <div><label style={lbl}>Date fin contrat (CDD)</label><input type="date" {...f('dateFinContrat')} style={inp}/></div>

                <Section title="RIB / Coordonnées bancaires" />
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>IBAN</label><input {...f('iban')} placeholder="FR76 3000 6000 0112 3456 7890 189" style={{ ...inp, fontFamily: 'monospace' }}/></div>
                <div><label style={lbl}>BIC / SWIFT</label><input {...f('bic')} placeholder="BNPAFRPPXXX" style={{ ...inp, fontFamily: 'monospace' }}/></div>
                <div><label style={lbl}>Nom de la banque</label><input {...f('nomBanque')} placeholder="BNP Paribas" style={inp}/></div>

                <Section title="Prévoyance & santé" />
                <div><label style={lbl}>Mutuelle</label><input {...f('mutuelle')} placeholder="Nom de la mutuelle" style={inp}/></div>
                <div><label style={lbl}>Dernière visite méd. travail</label><input type="date" {...f('medecineVisite')} style={inp}/></div>

                <Section title="Contact en cas d'urgence" />
                <div><label style={lbl}>Nom du contact</label><input {...f('urgenceNom')} placeholder="Marie Dupont" style={inp}/></div>
                <div><label style={lbl}>Téléphone</label><input {...f('urgenceTel')} placeholder="06 98 76 54 32" style={inp}/></div>
                <div><label style={lbl}>Lien (conjoint, parent…)</label><input {...f('urgenceLien')} placeholder="Conjoint(e)" style={inp}/></div>

                <Section title="Carte Professionnelle BTP" />
                <div style={{ gridColumn: '1/-1', background: '#FFF8F0', border: '1px solid #FF950040', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#856404', marginBottom: 4 }}>
                  Obligatoire sur les chantiers (Loi Macron 2015). À renouveler tous les 5 ans auprès de la CIBTP.
                </div>
                <div><label style={lbl}>Numéro de carte</label><input {...f('carteProBTPNumero')} placeholder="BTP-XXXX-XXXXX" style={inp}/></div>
                <div><label style={lbl}>Date d'expiration</label><input type="date" {...f('carteProBTPExpiration')} style={inp}/></div>
              </div>

              {/* Bouton désactiver / réactiver (seulement en édition) */}
              {modal !== 'add' && (
                <div style={{ marginTop: 18, padding: '14px 16px', background: form.statut === 'inactif' ? '#EFF6FF' : '#FEF2F2', border: `1px solid ${form.statut === 'inactif' ? '#BFDBFE' : '#FECACA'}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.statut === 'inactif' ? '#1E40AF' : '#DC2626', marginBottom: 6 }}>
                    {form.statut === 'inactif' ? '🔄 Réactiver cet employé' : '⚠️ Désactiver cet employé'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
                    {form.statut === 'inactif'
                      ? 'L\'employé retrouvera accès à son compte et sera rattaché à votre entreprise.'
                      : 'L\'employé passe en statut inactif. Son compte Freample reste actif et il pourra être recruté par une autre entreprise via "Ils recrutent" ou directement.'}
                  </div>
                  <button type="button" onClick={() => {
                    const newStatut = form.statut === 'inactif' ? 'actif' : 'inactif';
                    setForm(p => ({ ...p, statut: newStatut }));
                    setEmployes(prev => prev.map(e => e.id === modal.id ? { ...e, statut: newStatut } : e));
                    setModal(null);
                  }} style={{ padding: '8px 18px', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: form.statut === 'inactif' ? '#3B82F6' : '#DC2626', color: '#fff' }}>
                    {form.statut === 'inactif' ? 'Réactiver' : 'Désactiver l\'employé'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 18, borderTop: '1px solid #F2F2F7' }}>
                <button type="button" onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: saving ? '#C7C7CC' : '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  {saving ? 'Enregistrement…' : modal === 'add' ? 'Créer l\'employé' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Planning & Localisation ── */
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const HEURES = ['07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'];
const COLORS = ['#5B5BD6', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA', '#FF6B6B'];

const PLANNING_DEMO = [
  { employeId: 1, nom: 'Pierre Martin', poste: 'Maçon', chantier: 'Rénovation façade — Leblanc', adresse: '24 rue Victor Hugo, Paris 15e', lat: 48.840, lng: 2.290, couleur: '#5B5BD6',
    semaine: { Lun: { debut: 7, fin: 17, label: 'Chantier Leblanc' }, Mar: { debut: 7, fin: 17, label: 'Chantier Leblanc' }, Mer: { debut: 7, fin: 12, label: 'Chantier Leblanc' }, Jeu: null, Ven: { debut: 8, fin: 16, label: 'Chantier Leblanc' }, Sam: null } },
  { employeId: 2, nom: 'Jacques Durand', poste: 'Électricien', chantier: 'Installation électrique — SCI Horizon', adresse: '5 rue Pasteur, Créteil', lat: 48.790, lng: 2.455, couleur: '#34C759',
    semaine: { Lun: null, Mar: { debut: 8, fin: 18, label: 'SCI Horizon' }, Mer: { debut: 8, fin: 18, label: 'SCI Horizon' }, Jeu: { debut: 8, fin: 18, label: 'SCI Horizon' }, Ven: { debut: 8, fin: 14, label: 'SCI Horizon' }, Sam: null } },
  { employeId: 3, nom: 'Sophie Petit', poste: 'Plombier', chantier: 'Plomberie — Chauffe-eau Voltaire', adresse: '15 bd Voltaire, Paris 11e', lat: 48.856, lng: 2.378, couleur: '#FF9500',
    semaine: { Lun: { debut: 9, fin: 17, label: 'Voltaire' }, Mar: { debut: 9, fin: 17, label: 'Voltaire' }, Mer: null, Jeu: { debut: 9, fin: 17, label: 'Voltaire' }, Ven: { debut: 9, fin: 13, label: 'Congé après-midi' }, Sam: null } },
  { employeId: 4, nom: 'Marc Bernard', poste: 'Chef de chantier', chantier: 'Pose carrelage — Dupont', adresse: '8 av. des Fleurs, Boulogne', lat: 48.835, lng: 2.240, couleur: '#AF52DE',
    semaine: { Lun: { debut: 7, fin: 18, label: 'Dupont Boulogne' }, Mar: { debut: 7, fin: 18, label: 'Dupont Boulogne' }, Mer: { debut: 7, fin: 18, label: 'Dupont Boulogne' }, Jeu: { debut: 7, fin: 18, label: 'Dupont Boulogne' }, Ven: { debut: 7, fin: 12, label: 'Dupont Boulogne' }, Sam: null } },
];

function PlanningLocalisationView({ employes: initEmployes }) {
  const [view, setView] = useState('planning'); // planning | localisation
  const [semaine] = useState(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return monday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 2, background: '#F2F2F7', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[['planning', '📅 Planning hebdomadaire']].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 20px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            background: view === v ? '#fff' : 'transparent',
            color: view === v ? '#1C1C1E' : '#6E6E73',
            boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      {view === 'planning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>Semaine du {semaine}</div>
            <div style={{ fontSize: 12, color: '#6E6E73', background: '#F2F2F7', padding: '4px 10px', borderRadius: 8 }}>Données de démonstration</div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {PLANNING_DEMO.map(e => (
              <div key={e.employeId} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6E6E73' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: e.couleur, flexShrink: 0 }} />
                {e.nom}
              </div>
            ))}
          </div>

          {/* Gantt-style grid */}
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {/* Header: jours */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(6, 1fr)', borderBottom: '1px solid #F2F2F7' }}>
              <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#6E6E73', background: '#FAFAFA' }}>Employé</div>
              {JOURS.map(j => (
                <div key={j} style={{ padding: '12px 8px', fontSize: 12, fontWeight: 700, color: '#1C1C1E', textAlign: 'center', background: '#FAFAFA', borderLeft: '1px solid #F2F2F7' }}>{j}</div>
              ))}
            </div>

            {/* Rows */}
            {PLANNING_DEMO.map((emp, ri) => (
              <div key={emp.employeId} style={{ display: 'grid', gridTemplateColumns: '160px repeat(6, 1fr)', borderBottom: ri < PLANNING_DEMO.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                {/* Employee name */}
                <div style={{ padding: '14px 16px', borderRight: '1px solid #F2F2F7' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{emp.nom}</div>
                  <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>{emp.poste}</div>
                </div>
                {/* Day cells */}
                {JOURS.map(jour => {
                  const slot = emp.semaine[jour];
                  return (
                    <div key={jour} style={{ padding: '8px 6px', borderLeft: '1px solid #F2F2F7', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {slot ? (
                        <div style={{ width: '100%', background: emp.couleur + '20', border: `1px solid ${emp.couleur}40`, borderLeft: `3px solid ${emp.couleur}`, borderRadius: 6, padding: '6px 8px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: emp.couleur }}>{slot.debut}h – {slot.fin}h</div>
                          <div style={{ fontSize: 10, color: '#6E6E73', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.label}</div>
                        </div>
                      ) : (
                        <div style={{ width: '90%', height: 6, background: '#F2F2F7', borderRadius: 3 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Hours summary per employee */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {PLANNING_DEMO.map(emp => {
              const total = Object.values(emp.semaine).reduce((s, d) => s + (d ? d.fin - d.debut : 0), 0);
              const jours = Object.values(emp.semaine).filter(Boolean).length;
              return (
                <div key={emp.employeId} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${emp.couleur}` }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{emp.nom}</div>
                  <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>{jours} jour{jours > 1 ? 's' : ''} · {total}h planifiées</div>
                  <div style={{ fontSize: 11, color: emp.couleur, marginTop: 6, fontWeight: 600 }}>{emp.chantier}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'localisation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34C759', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E' }}>Mise à jour en temps réel</span>
            <span style={{ fontSize: 12, color: '#6E6E73' }}>— Aujourd'hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Map placeholder */}
          <div style={{ background: '#E5E5EA', borderRadius: 16, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Simulated map background */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 50%, #FFF3E0 100%)', opacity: 0.6 }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>Carte interactive</div>
              <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>Intégration Google Maps / Mapbox à configurer</div>
            </div>
            {/* Simulated pins */}
            {PLANNING_DEMO.map((emp, i) => (
              <div key={emp.employeId} style={{
                position: 'absolute',
                left: `${20 + i * 20}%`,
                top: `${25 + (i % 2) * 30}%`,
                zIndex: 2,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: '50% 50% 50% 0', background: emp.couleur, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ transform: 'rotate(45deg)', fontSize: 12, color: '#fff', fontWeight: 800 }}>
                    {emp.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Employee location cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {PLANNING_DEMO.map(emp => {
              const auj = new Date().getDay(); // 0=dim, 1=lun ... 6=sam
              const jourIdx = auj === 0 ? null : auj - 1;
              const jourLabel = jourIdx !== null ? JOURS[jourIdx] : null;
              const slot = jourLabel ? emp.semaine[jourLabel] : null;
              const enChantier = slot && new Date().getHours() >= slot.debut && new Date().getHours() < slot.fin;
              return (
                <div key={emp.employeId} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: emp.couleur + '20', color: emp.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                    {emp.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1C1E' }}>{emp.nom}</div>
                    <div style={{ fontSize: 12, color: '#6E6E73' }}>{emp.poste}</div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: enChantier ? '#34C759' : '#636363', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: enChantier ? '#34C759' : '#636363' }}>
                        {enChantier ? 'En chantier' : (slot ? `Prévu ${slot.debut}h–${slot.fin}h` : 'Non planifié aujourd\'hui')}
                      </span>
                    </div>
                    {emp.adresse && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#6E6E73', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                        <span style={{ flexShrink: 0 }}>📍</span>
                        <span>{emp.adresse}</span>
                      </div>
                    )}
                    {emp.chantier && (
                      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: emp.couleur }}>
                        {emp.chantier}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Congés ── */
function CongesView() {
  const [conges, setConges] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [form, setForm] = useState({ employeId: '', dateDebut: '', dateFin: '', type: 'conge_paye', motif: '' });
  const [solde, setSolde] = useState(null);
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterEmploye, setFilterEmploye] = useState('tous');
  const [refusModal, setRefusModal] = useState(null);
  const [refusCommentaire, setRefusCommentaire] = useState('');

  useEffect(() => {
    api.get('/rh/conges').then(r => setConges(r.data.conges)).catch(() => {
      // Fallback localStorage — lire les congés soumis par les salariés
      try {
        const local = JSON.parse(localStorage.getItem('freample_conges') || '[]');
        if (local.length > 0) setConges(local);
      } catch {}
    });
    api.get('/rh/employes').then(r => setEmployes(r.data.employes || [])).catch(() => {});
  }, []);

  const refresh = () => {
    api.get('/rh/conges').then(r => setConges(r.data.conges)).catch(() => {
      try { setConges(JSON.parse(localStorage.getItem('freample_conges') || '[]')); } catch {}
    });
  };

  function nomEmploye(id) {
    const emp = employes.find(e => String(e.id) === String(id));
    return emp ? `${emp.prenom} ${emp.nom}` : `Employé #${id}`;
  }

  function handleEmployeChange(id) {
    setForm(p => ({ ...p, employeId: id }));
    setSolde(null);
    if (id) {
      api.get(`/rh/solde-conges/${id}`).then(r => setSolde(r.data)).catch(() => setSolde(null));
    }
  }

  async function soumettre(e) {
    e.preventDefault();
    await api.post('/rh/conges', form).catch(() => {});
    await refresh();
    setForm({ employeId: '', dateDebut: '', dateFin: '', type: 'conge_paye', motif: '' });
    setSolde(null);
  }

  async function approuver(id) {
    await api.put(`/rh/conges/${id}/valider`, { decision: 'approuvé' }).catch(() => {});
    // Mettre à jour localStorage pour synchro salarié
    try {
      const local = JSON.parse(localStorage.getItem('freample_conges') || '[]');
      const updated = local.map(c => c.id === id ? { ...c, statut: 'approuve' } : c);
      localStorage.setItem('freample_conges', JSON.stringify(updated));
      setConges(updated);
    } catch {}
    await refresh();
  }

  async function confirmerRefus() {
    if (!refusModal) return;
    await api.put(`/rh/conges/${refusModal.id}/valider`, { decision: 'refusé', commentaire: refusCommentaire }).catch(() => {});
    // Mettre à jour localStorage pour synchro salarié
    try {
      const local = JSON.parse(localStorage.getItem('freample_conges') || '[]');
      const updated = local.map(c => c.id === refusModal.id ? { ...c, statut: 'rejete', commentaire: refusCommentaire } : c);
      localStorage.setItem('freample_conges', JSON.stringify(updated));
      setConges(updated);
    } catch {}
    setRefusModal(null);
    setRefusCommentaire('');
    await refresh();
  }

  const now = new Date();
  const kpiEnAttente = conges.filter(c => c.statut === 'en_attente').length;
  const kpiApprouvesMois = conges.filter(c => {
    if (c.statut !== 'approuvé') return false;
    const d = new Date(c.dateDebut);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const kpiRefuses = conges.filter(c => c.statut === 'refusé').length;

  const congesFiltres = conges.filter(c => {
    if (filterStatut !== 'tous' && c.statut !== filterStatut) return false;
    if (filterEmploye !== 'tous' && String(c.employeId) !== filterEmploye) return false;
    return true;
  });

  const inputStyle = { padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KPI */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { label: 'En attente', val: kpiEnAttente, bg: '#FFF7E6', color: '#92610A', border: '#F5C842' },
          { label: 'Approuvées ce mois', val: kpiApprouvesMois, bg: '#E8F8EE', color: '#1A7F43', border: '#5CC88A' },
          { label: 'Refusées', val: kpiRefuses, bg: '#FFE5E5', color: '#C0392B', border: '#F5A5A5' },
        ].map(k => (
          <div key={k.label} style={{ flex: 1, background: k.bg, border: `1px solid ${k.border}`, borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: k.color, opacity: 0.8, marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>Nouvelle demande de congé</h3>
        <form onSubmit={soumettre} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 }}>Employé</label>
            <select value={form.employeId} onChange={e => handleEmployeChange(e.target.value)} required style={{ ...inputStyle, minWidth: 180 }}>
              <option value="">Sélectionner…</option>
              {employes.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>
              ))}
            </select>
            {solde && (
              <div style={{ fontSize: 11, color: '#1A7F43', marginTop: 4, fontWeight: 600 }}>
                Solde restant : {solde.soldeRestant ?? solde.joursRestants ?? '—'} j
              </div>
            )}
          </div>
          {[
            { lbl: 'Début', key: 'dateDebut', type: 'date', w: 150 },
            { lbl: 'Fin',   key: 'dateFin',   type: 'date', w: 150 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 }}>{f.lbl}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ ...inputStyle, width: f.w }} required />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 }}>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
              <option value="conge_paye">Congé payé</option>
              <option value="rtt">RTT</option>
              <option value="sans_solde">Sans solde</option>
            </select>
          </div>
          <div style={{ flexBasis: '100%' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 }}>Motif (optionnel)</label>
            <textarea value={form.motif} onChange={e => setForm(p => ({ ...p, motif: e.target.value }))} rows={2}
              placeholder="Raison de la demande…"
              style={{ ...inputStyle, width: '100%', maxWidth: 500, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            <IconPlus size={14} /> Soumettre
          </button>
        </form>
      </div>

      {/* Filtres */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6E6E73' }}>Filtres :</span>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6E6E73', marginRight: 6 }}>Statut</label>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none' }}>
            <option value="tous">Tous</option>
            <option value="en_attente">En attente</option>
            <option value="approuvé">Approuvé</option>
            <option value="refusé">Refusé</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6E6E73', marginRight: 6 }}>Employé</label>
          <select value={filterEmploye} onChange={e => setFilterEmploye(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none' }}>
            <option value="tous">Tous</option>
            {employes.map(emp => (
              <option key={emp.id} value={String(emp.id)}>{emp.prenom} {emp.nom}</option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: 12, color: '#636363', marginLeft: 'auto' }}>{congesFiltres.length} résultat(s)</span>
      </div>

      {/* Tableau */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
              {['Employé', 'Période', 'Jours', 'Type', 'Motif', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {congesFiltres.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#636363' }}>Aucune demande de congé</td></tr>
            ) : congesFiltres.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #F2F2F7' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{nomEmploye(c.employeId)}</td>
                <td style={{ padding: '12px 16px' }}>{c.dateDebut} → {c.dateFin}</td>
                <td style={{ padding: '12px 16px' }}>{c.nbJours}j</td>
                <td style={{ padding: '12px 16px', color: '#6E6E73', textTransform: 'capitalize' }}>{c.type?.replace('_', ' ')}</td>
                <td style={{ padding: '12px 16px', color: '#6E6E73', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.motif || '—'}</td>
                <td style={{ padding: '12px 16px' }}><StatutBadge statut={c.statut} /></td>
                <td style={{ padding: '12px 16px' }}>
                  {c.statut === 'en_attente' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => approuver(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#D1F2E0', color: '#1A7F43', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          <IconCheck size={11} /> Approuver
                        </button>
                        <button onClick={() => { setRefusModal({ id: c.id }); setRefusCommentaire(''); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#FFE5E5', color: '#C0392B', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          <IconX size={11} /> Refuser
                        </button>
                      </div>
                      {refusModal?.id === c.id && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#FFF5F5', border: '1px solid #F5A5A5', borderRadius: 8, padding: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#C0392B' }}>Motif du refus</label>
                          <input value={refusCommentaire} onChange={e => setRefusCommentaire(e.target.value)}
                            placeholder="Raison du refus…"
                            style={{ padding: '6px 8px', border: '1px solid #F5A5A5', borderRadius: 6, fontSize: 12, outline: 'none', minWidth: 200 }}
                            autoFocus />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={confirmerRefus} style={{ padding: '4px 10px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                              Confirmer le refus
                            </button>
                            <button onClick={() => setRefusModal(null)} style={{ padding: '4px 10px', background: '#F2F2F7', color: '#6E6E73', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Notes de frais ── */
function NotesFraisView() {
  const [notes, setNotes] = useState([]);
  useEffect(() => { api.get('/rh/notes-frais').then(r => setNotes(r.data.notesFrais)).catch(() => {}); }, []);
  const refresh = () => api.get('/rh/notes-frais').then(r => setNotes(r.data.notesFrais)).catch(() => {});

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
            {['Employé', 'Montant', 'Catégorie', 'Statut', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {notes.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#636363' }}>Aucune note de frais</td></tr>
          ) : notes.map(n => (
            <tr key={n.id} style={{ borderBottom: '1px solid #F2F2F7' }}>
              <td style={{ padding: '12px 16px' }}>Employé #{n.employeId}</td>
              <td style={{ padding: '12px 16px', fontWeight: 600 }}>{n.montant?.toLocaleString('fr-FR')} €</td>
              <td style={{ padding: '12px 16px', color: '#6E6E73', textTransform: 'capitalize' }}>{n.categorie}</td>
              <td style={{ padding: '12px 16px' }}><StatutBadge statut={n.statut} /></td>
              <td style={{ padding: '12px 16px' }}>
                {n.statut === 'en_attente' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => api.put(`/rh/notes-frais/${n.id}/valider`, { decision: 'approuvée' }).then(refresh)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#D1F2E0', color: '#1A7F43', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      <IconCheck size={11} /> Approuver
                    </button>
                    <button onClick={() => api.put(`/rh/notes-frais/${n.id}/valider`, { decision: 'refusée' }).then(refresh)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#FFE5E5', color: '#C0392B', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      <IconX size={11} /> Refuser
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Paie ── */
function PaieView({ employes }) {
  const now = new Date();
  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [mois, setMois] = useState(now.getMonth());
  const [annee, setAnnee] = useState(now.getFullYear());
  const [brutSaisi, setBrutSaisi] = useState('');
  const [primeMensuelle, setPrimeMensuelle] = useState('');
  const [primeAnnuelle, setPrimeAnnuelle] = useState('');
  const [typePrime, setTypePrime] = useState('classique'); // 'classique' | 'ppv'
  const [paid, setPaid] = useState(false);
  const [notifSent, setNotifSent] = useState(false);
  const [notesEmploye, setNotesEmploye] = useState([]);
  const [fraisInclus, setFraisInclus] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const employe = employes.find(e => String(e.id) === String(selectedEmploye)) || null;
  const brutBase = Number(brutSaisi) || (employe?.salaireBase || 0);
  const primeMens = Number(primeMensuelle) || 0;
  const primeAnn = Number(primeAnnuelle) || 0;
  // PPV = exonérée de charges sociales, ajoutée directement au net
  // Prime classique = soumise à charges, intégrée au brut
  const primeSoumise = typePrime === 'classique' ? primeMens + (primeAnn / 12) : 0;
  const primeExoneree = typePrime === 'ppv' ? primeMens + (primeAnn / 12) : 0;
  const brut = brutBase + primeSoumise;
  const result = brut > 0 ? calcPayroll(brut) : null;
  const fraisTotal = notesEmploye.filter(n => fraisInclus.includes(n.id)).reduce((s, n) => s + (n.montant || 0), 0);
  const netFinal = result ? result.netAPayer + fraisTotal + primeExoneree : 0;

  function handleSelectEmploye(id) {
    setSelectedEmploye(id);
    const emp = employes.find(e => String(e.id) === String(id));
    if (emp) setBrutSaisi(String(emp.salaireBase || ''));
    setPaid(false);
    setNotifSent(false);
    setFraisInclus([]);
    setPrimeMensuelle('');
    setPrimeAnnuelle('');
    if (id && id !== 'manuel') {
      setLoadingNotes(true);
      api.get(`/rh/notes-frais?employeId=${id}`)
        .then(r => {
          const approved = (r.data.notesFrais || []).filter(n => n.statut === 'approuvée' && !n.inclus);
          setNotesEmploye(approved);
        })
        .catch(() => setNotesEmploye([]))
        .finally(() => setLoadingNotes(false));
    } else {
      setNotesEmploye([]);
    }
  }

  function toggleFrais(id) {
    setFraisInclus(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleValiderPaie() {
    if (!result || !employe) return;
    try {
      await api.post('/rh/bulletins-paie', {
        employeId: employe.id,
        mois: mois + 1,
        annee,
        salaireBase: brut,
        fraisIds: fraisInclus,
        fraisTotal,
        netAPayer: netFinal,
        coutEmployeur: result.coutEmployeur + fraisTotal,
      });
    } catch (_) {}
    setPaid(true);
    setTimeout(() => setNotifSent(true), 800);
  }

  const periodeLabel = `${MOIS[mois]} ${annee}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Selector */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Paramètres de paie</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Employé</label>
            <select value={selectedEmploye} onChange={e => handleSelectEmploye(e.target.value)} style={inp}>
              <option value="">— Choisir un employé —</option>
              {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
              <option value="manuel">Saisie manuelle</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Mois</label>
            <select value={mois} onChange={e => setMois(Number(e.target.value))} style={inp}>
              {MOIS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Année</label>
            <select value={annee} onChange={e => setAnnee(Number(e.target.value))} style={inp}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Salaire brut de base (€)</label>
            <input type="number" min="0" step="0.01" value={brutSaisi} onChange={e => { setBrutSaisi(e.target.value); setPaid(false); setNotifSent(false); }} placeholder="Ex: 2500" style={inp} />
          </div>
          <div>
            <label style={lbl}>Prime mensuelle (€)</label>
            <input type="number" min="0" step="0.01" value={primeMensuelle} onChange={e => { setPrimeMensuelle(e.target.value); setPaid(false); setNotifSent(false); }} placeholder="0.00" style={inp} />
          </div>
          <div>
            <label style={lbl}>Prime annuelle (€ / an)</label>
            <input type="number" min="0" step="0.01" value={primeAnnuelle} onChange={e => { setPrimeAnnuelle(e.target.value); setPaid(false); setNotifSent(false); }} placeholder="0.00" style={inp} />
          </div>
          {(primeMens > 0 || primeAnn > 0) && (
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Type de prime</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { key: 'classique', label: 'Prime classique', desc: 'Soumise aux charges sociales et IR — intégrée au brut', color: '#FF9500' },
                  { key: 'ppv', label: 'PPV (Prime Macron)', desc: 'Exonérée de charges et d\'IR sous conditions légales (max 3 000 €/an)', color: '#34C759' },
                ].map(t => (
                  <button key={t.key} type="button" onClick={() => { setTypePrime(t.key); setPaid(false); }} style={{ flex: 1, padding: '10px 12px', border: `2px solid ${typePrime === t.key ? t.color : '#E5E5EA'}`, borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12, textAlign: 'left', background: typePrime === t.key ? `${t.color}10` : '#fff', transition: 'all 0.15s' }}>
                    <div style={{ color: typePrime === t.key ? t.color : '#1C1C1E', marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#636363', fontWeight: 400 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {(primeMens > 0 || primeAnn > 0) && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: typePrime === 'ppv' ? '#D1F2E0' : '#EBF5FF', borderRadius: 10, fontSize: 13, color: typePrime === 'ppv' ? '#1A7F43' : '#5B5BD6', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {typePrime === 'classique' ? (
              <>
                <span>Brut de base : <strong>{formatCur(brutBase)}</strong></span>
                {primeMens > 0 && <span>+ Prime mensuelle (brut) : <strong>{formatCur(primeMens)}</strong></span>}
                {primeAnn > 0 && <span>+ Prime annuelle /12 : <strong>{formatCur(primeAnn / 12)}</strong></span>}
                <span style={{ marginLeft: 'auto', fontWeight: 700 }}>= Brut total : <strong>{formatCur(brut)}</strong> (charges incluses)</span>
              </>
            ) : (
              <>
                <span>Brut de base : <strong>{formatCur(brutBase)}</strong></span>
                <span style={{ fontWeight: 700, color: '#1A7F43' }}>+ PPV exonérée : <strong>{formatCur(primeMens + primeAnn / 12)}</strong> (ajoutée directement au net, pas de charges)</span>
                {(primeMens + primeAnn / 12) > 250 && <span style={{ color: '#856404', fontWeight: 600, background: '#FFF3CD', padding: '2px 8px', borderRadius: 8 }}>⚠ Vérifier plafond annuel PPV (3 000 € / salarié)</span>}
              </>
            )}
          </div>
        )}
      </div>

      {/* Notes de frais à inclure */}
      {employe && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Notes de frais approuvées</h3>
            {fraisInclus.length > 0 && (
              <span style={{ background: '#5B5BD6', color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '3px 12px' }}>
                {formatCur(fraisTotal)} inclus
              </span>
            )}
          </div>
          {loadingNotes ? (
            <div style={{ textAlign: 'center', color: '#636363', padding: 20, fontSize: 13 }}>Chargement...</div>
          ) : notesEmploye.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#636363', padding: 20, fontSize: 13 }}>Aucune note de frais approuvée en attente pour cet employé.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #F2F2F7' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', width: 36 }}></th>
                  {['Date', 'Catégorie', 'Description', 'Montant'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Montant' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#636363' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notesEmploye.map(n => {
                  const checked = fraisInclus.includes(n.id);
                  return (
                    <tr key={n.id} onClick={() => !paid && toggleFrais(n.id)} style={{ borderBottom: '1px solid #F8F8F8', cursor: paid ? 'default' : 'pointer', background: checked ? '#F0F9FF' : '#fff' }}>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? '#5B5BD6' : '#C7C7CC'}`, background: checked ? '#5B5BD6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {checked && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </td>
                      <td style={{ padding: '9px 12px', color: '#6E6E73' }}>{n.date}</td>
                      <td style={{ padding: '9px 12px' }}><span style={{ background: '#F2F2F7', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>{n.categorie}</span></td>
                      <td style={{ padding: '9px 12px' }}>{n.description}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#5B5BD6' }}>{formatCur(n.montant)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #E5E5EA', background: '#F8F9FA' }}>
                  <td colSpan={4} style={{ padding: '9px 12px', fontWeight: 700, fontSize: 13 }}>Total frais inclus dans la paie</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, fontSize: 15, color: fraisTotal > 0 ? '#5B5BD6' : '#636363' }}>{formatCur(fraisTotal)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {result && (
        <>
          {/* Notification banner */}
          {paid && (
            <div style={{ background: '#D1F2E0', border: '1px solid #34C759', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconCheck size={22} color="#34C759" />
              <div>
                <div style={{ fontWeight: 700, color: '#1A7F43', fontSize: 15 }}>Paie validée et versée !</div>
                {notifSent && employe && (
                  <div style={{ fontSize: 13, color: '#2D6A4F', marginTop: 2 }}>
                    {employe.prenom} {employe.nom} a reçu une notification et peut consulter sa fiche de paie dans sa banque de documents.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bulletin de paie */}
          <div id="fiche-paie-print" style={{ background: '#fff', borderRadius: 14, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #1C1C1E' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#5B5BD6' }}>Bernard Martin BTP</div>
                <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.7, marginTop: 4 }}>
                  12 rue des Artisans, 69002 Lyon<br />
                  SIRET : 123 456 789 00012 · NAF : 4329A<br />
                  Convention collective : BTP (IDCC 1597/1596)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E' }}>BULLETIN DE PAIE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#5B5BD6', marginTop: 4 }}>Période : {periodeLabel}</div>
                <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>Date de paiement : {new Date(annee, mois + 1, 0).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>

            {/* Employee info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Employé</div>
                {employe ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{employe.prenom} {employe.nom}</div>
                    <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 4 }}>{employe.poste} · {employe.typeContrat}</div>
                    <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>Entrée : {employe.dateEntree}</div>
                  </>
                ) : (
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Employé (saisie manuelle)</div>
                )}
              </div>
              <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Synthèse</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Salaire de base</span><span style={{ fontWeight: 600 }}>{formatCur(brutBase || brut)}</span>
                </div>
                {primeSoumise > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#FF9500' }}>
                    <span>Prime {primeAnn > 0 ? 'annuelle /12' : 'mensuelle'} <span style={{ fontSize: 10, background: '#FFF3CD', color: '#856404', padding: '1px 5px', borderRadius: 4 }}>Soumise charges</span></span>
                    <span style={{ fontWeight: 600 }}>+{formatCur(primeSoumise)}</span>
                  </div>
                )}
                {primeSoumise > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, borderTop: '1px dashed #E5E5EA', paddingTop: 4 }}>
                    <span style={{ fontWeight: 600 }}>Brut total (avec prime)</span><span style={{ fontWeight: 700 }}>{formatCur(brut)}</span>
                  </div>
                )}
                {primeExoneree > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#1A7F43' }}>
                    <span>PPV — Prime de Partage de la Valeur <span style={{ fontSize: 10, background: '#D1F2E0', color: '#1A7F43', padding: '1px 5px', borderRadius: 4 }}>Exonérée charges + IR</span></span>
                    <span style={{ fontWeight: 600 }}>+{formatCur(primeExoneree)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Net salarial</span><span style={{ fontWeight: 600 }}>{formatCur(result.netAPayer)}</span>
                </div>
                {fraisTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#5B5BD6' }}>
                    <span>Remboursements frais</span><span style={{ fontWeight: 600 }}>+{formatCur(fraisTotal)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 4, borderTop: '1px solid #E5E5EA', paddingTop: 6, marginTop: 6 }}>
                  <span style={{ fontWeight: 700 }}>NET À PAYER</span><span style={{ fontWeight: 800, color: '#34C759' }}>{formatCur(netFinal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6E6E73' }}>
                  <span>Coût total employeur</span><span>{formatCur(result.coutEmployeur + fraisTotal)}</span>
                </div>
              </div>
            </div>

            {/* Cotisations salariales */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, background: '#E3F2FD', padding: '7px 12px', borderRadius: 6 }}>
                Cotisations salariales
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                    {['Libellé', 'Base de calcul', 'Taux salarié', 'Montant salarié'].map(h => (
                      <th key={h} style={{ padding: '7px 10px', textAlign: h.includes('Montant') || h.includes('Taux') ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#636363' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    result.sal.reduce((groups, c) => {
                      (groups[c.cat] = groups[c.cat] || []).push(c);
                      return groups;
                    }, {})
                  ).map(([cat, items]) => (
                    <React.Fragment key={cat}>
                      <tr>
                        <td colSpan={4} style={{ padding: '8px 10px 4px', fontSize: 11, fontWeight: 700, color: '#6E6E73', background: '#FAFAFA' }}>{cat}</td>
                      </tr>
                      {items.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F8F8F8' }}>
                          <td style={{ padding: '6px 10px' }}>{c.label}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#6E6E73' }}>{formatCur(c.baseCalc)}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#6E6E73' }}>{c.taux.toFixed(2)} %</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{formatCur(c.montant)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr style={{ borderTop: '2px solid #1C1C1E', background: '#F8F9FA' }}>
                    <td colSpan={3} style={{ padding: '9px 10px', fontWeight: 700, fontSize: 13 }}>Total cotisations salariales</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, fontSize: 13, color: '#C0392B' }}>{formatCur(result.totalSal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Frais remboursés */}
            {fraisTotal > 0 && (
              <div style={{ background: '#EBF5FF', border: '1px solid #BFD7F5', borderRadius: 10, padding: '12px 18px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#5B5BD6' }}>Remboursements de frais ({fraisInclus.length} note{fraisInclus.length > 1 ? 's' : ''})</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#5B5BD6' }}>+{formatCur(fraisTotal)}</span>
              </div>
            )}

            {/* Net à payer */}
            <div style={{ background: '#5B5BD6', color: '#fff', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>NET À PAYER</span>
              <span style={{ fontWeight: 800, fontSize: 22 }}>{formatCur(netFinal)}</span>
            </div>

            {/* Cotisations patronales */}
            <details style={{ marginBottom: 16 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#6E6E73', padding: '8px 0', userSelect: 'none' }}>
                Charges patronales (coût employeur : {formatCur(result.coutEmployeur)})
              </summary>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 10 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                    {['Libellé', 'Base', 'Taux patronal', 'Montant patronal'].map(h => (
                      <th key={h} style={{ padding: '7px 10px', textAlign: h.includes('Montant') || h.includes('Taux') ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#636363' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    result.pat.reduce((groups, c) => {
                      (groups[c.cat] = groups[c.cat] || []).push(c);
                      return groups;
                    }, {})
                  ).map(([cat, items]) => (
                    <React.Fragment key={cat}>
                      <tr>
                        <td colSpan={4} style={{ padding: '8px 10px 4px', fontSize: 11, fontWeight: 700, color: '#6E6E73', background: '#FAFAFA' }}>{cat}</td>
                      </tr>
                      {items.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F8F8F8' }}>
                          <td style={{ padding: '6px 10px' }}>{c.label}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#6E6E73' }}>{formatCur(c.baseCalc)}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#6E6E73' }}>{c.taux.toFixed(2)} %</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{formatCur(c.montant)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr style={{ borderTop: '2px solid #1C1C1E', background: '#F8F9FA' }}>
                    <td colSpan={3} style={{ padding: '9px 10px', fontWeight: 700, fontSize: 13 }}>Total charges patronales</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{formatCur(result.totalPat)}</td>
                  </tr>
                </tbody>
              </table>
            </details>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #F2F2F7', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#636363' }}>
              <span>Bulletin de paie établi par Bernard Martin BTP · Période : {periodeLabel}</span>
              <span>Net imposable : {formatCur(result.netImposable)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="no-print" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <IconDownload size={15} /> Télécharger la fiche
            </button>
            {!paid && (
              <button onClick={handleValiderPaie} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', border: 'none', borderRadius: 10, background: '#34C759', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                <IconCheck size={15} /> Valider et payer
              </button>
            )}
          </div>
        </>
      )}

      {!result && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#636363', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <IconUser size={40} />
          <p style={{ marginTop: 12 }}>Sélectionnez un employé et saisissez le salaire brut pour calculer la fiche de paie.</p>
        </div>
      )}

      {/* Guide méthodologique */}
      <div className="no-print" style={{ marginTop: 20, background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #F2F2F7' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#1C1C1E' }}>Cycle de paie mensuel — Guide DSN</h3>
        <p style={{ fontSize: 12, color: '#636363', marginBottom: 16 }}>Obligations légales du patron chaque mois</p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { n: '1', label: 'Calcul du brut', sub: 'Base + heures sup\n+ primes soumises', color: '#5B5BD6' },
            { n: '2', label: 'Fiche de paie', sub: 'Cotisations salariales\net patronales calculées', color: '#34C759' },
            { n: '3', label: 'DSN URSSAF', sub: 'Déclaration avant\nle 5 du mois M+1', color: '#FF9500' },
            { n: '4', label: 'Paiement charges', sub: 'Virement URSSAF\n+ caisses retraite', color: '#FF3B30' },
            { n: '5', label: 'Virement salarié', sub: 'Net versé avant\ndernier jour ouvré', color: '#AF52DE' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <div style={{ flex: '0 0 auto', width: 120, textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, margin: '0 auto 8px' }}>{s.n}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1E', marginBottom: 4, lineHeight: 1.3 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: '#636363', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{s.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ flex: '0 0 24px', display: 'flex', alignItems: 'flex-start', paddingTop: 10, color: '#C7C7CC', fontSize: 20, fontWeight: 300 }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Net à payer', ratio: '100 %', desc: 'Ce que perçoit le salarié', color: '#34C759' },
            { label: 'Salaire brut', ratio: '~ 130 % du net', desc: 'Net + cotisations salariales (22–25 %)', color: '#5B5BD6' },
            { label: 'Coût employeur total', ratio: '~ 170 % du net', desc: 'Brut + charges patronales (42–45 %)', color: '#FF9500' },
          ].map(c => (
            <div key={c.label} style={{ background: `${c.color}0D`, border: `1px solid ${c.color}30`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.ratio}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1E', margin: '5px 0 3px' }}>{c.label}</div>
              <div style={{ fontSize: 11, color: '#636363' }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            'Art. L3243-1 CT — Bulletin de paie obligatoire',
            'Décret 2016-611 — DSN avant le 5 M+1',
            'CCN BTP — Convention collective nationale bâtiment',
            'Loi 2023-1107 — PPV max 3 000 €/an exonérée',
            'PMSS 2025 — 3 864 €/mois',
          ].map(r => (
            <div key={r} style={{ fontSize: 10, background: '#F2F2F7', color: '#6E6E73', padding: '4px 10px', borderRadius: 20 }}>{r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Masse salariale ── */
function MasseSalarialeView({ employes = [] }) {
  const now = new Date();
  const [annee, setAnnee] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    api.get(`/rh/masse-salariale?annee=${annee}`)
      .then(r => setData(r.data.mois || DEMO_MASSE))
      .catch(() => setData(DEMO_MASSE))
      .finally(() => setLoading(false));
  }, [annee]);

  const moisData = data || DEMO_MASSE;
  const maxVal = Math.max(...moisData.map(m => m.coutEmployeur || 0), 1);
  const totalBrut = moisData.reduce((s, m) => s + (m.totalBrut || 0), 0);
  const totalPat = moisData.reduce((s, m) => s + (m.totalChargesPatronales || 0), 0);
  const totalFrais = moisData.reduce((s, m) => s + (m.totalFrais || 0), 0);
  const totalCout = moisData.reduce((s, m) => s + (m.coutEmployeur || 0), 0);
  const [selectedMois, setSelectedMois] = useState(null); // index month for drill-down

  // Simulate per-employee cost breakdown
  const EMPLOYES_COUT_DEMO = [
    { nom: 'Marc Bernard', poste: 'Chef de chantier', brut: 3200, cout: 3200 * 1.42 },
    { nom: 'Pierre Martin', poste: 'Maçon N3', brut: 2650, cout: 2650 * 1.42 },
    { nom: 'Jacques Durand', poste: 'Électricien N2', brut: 2450, cout: 2450 * 1.42 },
    { nom: 'Sophie Petit', poste: 'Assistante RH', brut: 2200, cout: 2200 * 1.42 },
  ];
  const costData = employes.length > 0
    ? employes.map(e => ({ nom: `${e.prenom} ${e.nom}`, poste: e.poste||'', brut: Number(e.salaireBase||0), cout: Number(e.salaireBase||0)*1.42 })).filter(e=>e.brut>0)
    : EMPLOYES_COUT_DEMO;
  const maxCout = Math.max(...costData.map(e => e.cout), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Masse salariale brute', val: totalBrut, color: '#5B5BD6' },
          { label: 'Charges patronales', val: totalPat, color: '#FF9500' },
          { label: 'Frais remboursés', val: totalFrais, color: '#34C759' },
          { label: 'Coût total employeur', val: totalCout, color: '#FF3B30' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{formatCur(k.val)}</div>
            <div style={{ fontSize: 11, color: '#C7C7CC', marginTop: 4 }}>Cumul {annee}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Évolution mensuelle {annee}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {[{ color: '#5B5BD6', label: 'Brut' }, { color: '#FF9500', label: 'Charges' }, { color: '#34C759', label: 'Frais' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                <span style={{ color: '#6E6E73' }}>{l.label}</span>
              </div>
            ))}
            <select value={annee} onChange={e => setAnnee(Number(e.target.value))} style={{ padding: '5px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none' }}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#636363', padding: 40 }}>Chargement...</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, paddingBottom: 28, position: 'relative' }}>
            {/* Y-axis grid */}
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} style={{ position: 'absolute', left: 0, right: 0, bottom: 28 + (pct / 100) * 172, borderBottom: '1px dashed #F2F2F7', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: '#C7C7CC', marginLeft: 2 }}>{formatCur((pct / 100) * maxVal)}</span>
              </div>
            ))}
            {moisData.map((m, i) => {
              const brutH = Math.round(((m.totalBrut || 0) / maxVal) * 172);
              const chargesH = Math.round(((m.totalChargesPatronales || 0) / maxVal) * 172);
              const fraisH = Math.round(((m.totalFrais || 0) / maxVal) * 172);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 172 }}>
                    <div title={`Brut: ${formatCur(m.totalBrut)}`} style={{ width: 10, height: brutH, background: '#5B5BD6', borderRadius: '3px 3px 0 0', opacity: 0.9 }} />
                    <div title={`Charges: ${formatCur(m.totalChargesPatronales)}`} style={{ width: 10, height: chargesH, background: '#FF9500', borderRadius: '3px 3px 0 0', opacity: 0.9 }} />
                    <div title={`Frais: ${formatCur(m.totalFrais)}`} style={{ width: 10, height: fraisH, background: '#34C759', borderRadius: '3px 3px 0 0', opacity: 0.9 }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#636363', textAlign: 'center', position: 'absolute', bottom: 0 }}>{MOIS[i]?.slice(0, 3)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Qui coûte le plus */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Coût employeur par salarié</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#636363' }}>Salaire brut + charges patronales (~42%) — du plus au moins coûteux</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...costData].sort((a,b) => b.cout - a.cout).map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i===0?'#FF9500':i===1?'#636363':i===2?'#CD7F32':'#F2F2F7', color: i<3?'#fff':'#6E6E73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{e.nom}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#FF3B30' }}>{formatCur(e.cout)}<span style={{ fontSize: 10, fontWeight: 400, color: '#636363' }}>/mois</span></div>
                    <div style={{ fontSize: 11, color: '#636363' }}>Brut : {formatCur(e.brut)}</div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#F2F2F7', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(e.cout/maxCout)*100}%`, background: i===0?'#FF9500':i===1?'#5B5BD6':'#34C759', borderRadius: 3, transition: 'width 0.6s' }}/>
                </div>
                <div style={{ fontSize: 10, color: '#636363', marginTop: 2 }}>{e.poste}</div>
              </div>
            </div>
          ))}
        </div>
        {costData.length > 0 && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#F8F9FA', borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#6E6E73' }}>Total masse salariale mensuelle</span>
            <span style={{ fontWeight: 700, color: '#FF3B30' }}>{formatCur(costData.reduce((s,e)=>s+e.cout,0))} / mois</span>
          </div>
        )}
      </div>

      {/* Detail table */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Détail mensuel</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #F2F2F7' }}>
              {['Mois', 'Nbre salariés', 'Masse brute', 'Charges patronales', 'Frais remboursés', 'Coût employeur'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Mois' ? 'left' : 'right', fontSize: 11, fontWeight: 600, color: '#636363' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {moisData.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F8F8F8' }}>
                <td style={{ padding: '9px 14px', fontWeight: 600 }}>{MOIS[i]}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right', color: '#6E6E73' }}>{m.nbEmployes || 0}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right' }}>{formatCur(m.totalBrut)}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right', color: '#FF9500' }}>{formatCur(m.totalChargesPatronales)}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right', color: '#34C759' }}>{formatCur(m.totalFrais)}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: '#FF3B30' }}>{formatCur(m.coutEmployeur)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #1C1C1E', background: '#F8F9FA', fontWeight: 700 }}>
              <td style={{ padding: '10px 14px' }}>TOTAL</td>
              <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
              <td style={{ padding: '10px 14px', textAlign: 'right' }}>{formatCur(totalBrut)}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#FF9500' }}>{formatCur(totalPat)}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34C759' }}>{formatCur(totalFrais)}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#FF3B30' }}>{formatCur(totalCout)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const DEMO_MASSE = MOIS.map((_, i) => ({
  mois: i + 1,
  nbEmployes: 3 + (i % 2),
  totalBrut: 8500 + Math.sin(i) * 400,
  totalChargesPatronales: (8500 + Math.sin(i) * 400) * 0.42,
  totalFrais: 200 + (i % 3) * 150,
  coutEmployeur: (8500 + Math.sin(i) * 400) * 1.42 + 200 + (i % 3) * 150,
}));

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

/* ── Zones de trajet CCN BTP ── */
const CCN_ZONES = [
  { zone: 0, label: 'Zone 0', distance: 'Moins de 3 km',      jourSemaine: 0.00,  note: 'Pas d\'indemnité (< 3 km)' },
  { zone: 1, label: 'Zone I', distance: '3 à moins de 5 km',  jourSemaine: 1.09,  note: 'Indemnité journalière' },
  { zone: 2, label: 'Zone II', distance: '5 à moins de 10 km', jourSemaine: 2.17, note: 'Indemnité journalière' },
  { zone: 3, label: 'Zone III', distance: '10 à moins de 20 km', jourSemaine: 3.09, note: 'Indemnité journalière' },
  { zone: 4, label: 'Zone IV', distance: '20 à moins de 30 km', jourSemaine: 3.79, note: 'Indemnité journalière' },
  { zone: 5, label: 'Zone V', distance: '30 km et plus',       jourSemaine: 4.44, note: 'Indemnité journalière' },
];

function ZonesTrajetView({ employes = [] }) {
  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [zoneSelectionnee, setZoneSelectionnee] = useState('');
  const [joursParMois, setJoursParMois] = useState(22);
  const [dateDebut, setDateDebut] = useState('');
  const [dateRetro, setDateRetro] = useState('');

  const today = new Date();
  const limitRetro = new Date(today);
  limitRetro.setMonth(limitRetro.getMonth() - 3);
  const limitRetroStr = limitRetro.toISOString().split('T')[0];

  const zone = CCN_ZONES.find(z => String(z.zone) === String(zoneSelectionnee));
  const indemniteJour = zone ? zone.jourSemaine : 0;
  const indemniteMois = indemniteJour * joursParMois;
  const indemniteAnnee = indemniteMois * 12;

  const dateTropAncienne = dateRetro && dateRetro < limitRetroStr;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Avertissement rétroactivité */}
      <div style={{ background: '#FFF3CD', border: '1px solid #FFD60A60', borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 22, flexShrink: 0 }}>⚠️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#856404', marginBottom: 6 }}>Règle légale — Rétroactivité limitée à 3 mois</div>
          <p style={{ fontSize: 13, color: '#856404', lineHeight: 1.6, margin: 0 }}>
            Les indemnités de trajet CCN BTP ne peuvent pas être réclamées rétroactivement au-delà de <strong>3 mois</strong> avant la date de la demande
            (prescription triennale réduite contractuellement, Art. L3245-1 du Code du travail).
            Toute demande antérieure au <strong>{limitRetro.toLocaleDateString('fr-FR')}</strong> est irrecevable.
          </p>
        </div>
      </div>

      {/* Barème CCN BTP */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Barème zones de trajet — CCN BTP (Ouvriers)</h3>
          <span style={{ fontSize: 12, color: '#636363', background: '#F2F2F7', padding: '4px 10px', borderRadius: 20 }}>Mise à jour 2025 · Art. 8.10 CCN</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8F9FA' }}>
              {['Zone', 'Distance domicile–chantier', 'Indemnité / jour travaillé', '22 jours/mois', 'Notes'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.3 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CCN_ZONES.map(z => (
              <tr
                key={z.zone}
                onClick={() => setZoneSelectionnee(String(z.zone))}
                style={{ borderBottom: '1px solid #F2F2F7', cursor: 'pointer', background: String(z.zone) === String(zoneSelectionnee) ? '#EBF5FF' : '#fff', transition: 'background 0.1s' }}
              >
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontWeight: 700, color: '#5B5BD6', fontSize: 14 }}>{z.label}</span>
                </td>
                <td style={{ padding: '12px 14px', color: '#1C1C1E' }}>{z.distance}</td>
                <td style={{ padding: '12px 14px' }}>
                  {z.jourSemaine > 0
                    ? <span style={{ fontWeight: 700, color: '#34C759' }}>{z.jourSemaine.toFixed(2)} €</span>
                    : <span style={{ color: '#636363' }}>—</span>}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {z.jourSemaine > 0
                    ? <span style={{ fontWeight: 600 }}>{(z.jourSemaine * 22).toFixed(2)} €</span>
                    : <span style={{ color: '#636363' }}>—</span>}
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#6E6E73' }}>{z.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 12, color: '#636363', marginTop: 12, marginBottom: 0 }}>
          Cliquez sur une zone pour la sélectionner dans le calculateur ci-dessous. Les montants sont exonérés de cotisations sociales dans la limite légale (URSSAF).
        </p>
      </div>

      {/* Calculateur */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Calculateur d'indemnités de trajet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={lbl}>Employé</label>
            <select value={selectedEmploye} onChange={e => setSelectedEmploye(e.target.value)} style={inp}>
              <option value="">— Tous / Manuelle —</option>
              {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Zone de trajet</label>
            <select value={zoneSelectionnee} onChange={e => setZoneSelectionnee(e.target.value)} style={inp}>
              <option value="">— Sélectionner —</option>
              {CCN_ZONES.map(z => (
                <option key={z.zone} value={z.zone}>{z.label} — {z.distance}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Jours travaillés / mois</label>
            <input type="number" min="1" max="31" value={joursParMois} onChange={e => setJoursParMois(Number(e.target.value))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Date de début (application)</label>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Si rétroactif — date de début demandée</label>
            <input type="date" value={dateRetro} onChange={e => setDateRetro(e.target.value)} style={inp} />
          </div>
        </div>

        {dateTropAncienne && (
          <div style={{ background: '#FFE5E5', border: '1px solid #FF3B3040', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>🚫</span>
            <div>
              <div style={{ fontWeight: 700, color: '#C0392B', fontSize: 14 }}>Date antérieure à la limite légale de 3 mois</div>
              <div style={{ fontSize: 13, color: '#C0392B', marginTop: 3 }}>
                Le {new Date(dateRetro).toLocaleDateString('fr-FR')} est antérieur au {limitRetro.toLocaleDateString('fr-FR')}.
                Vous ne pouvez réclamer les indemnités qu'à partir du <strong>{limitRetro.toLocaleDateString('fr-FR')}</strong>.
              </div>
            </div>
          </div>
        )}

        {zone && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { label: 'Indemnité / jour', value: formatCur(indemniteJour), color: '#34C759' },
              { label: `Indemnité / mois (${joursParMois}j)`, value: formatCur(indemniteMois), color: '#5B5BD6' },
              { label: 'Indemnité annuelle', value: formatCur(indemniteAnnee), color: '#FF9500' },
            ].map(k => (
              <div key={k.label} style={{ background: '#F8F9FA', borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}
        {!zone && (
          <div style={{ textAlign: 'center', color: '#636363', padding: '20px 0', fontSize: 14 }}>
            Sélectionnez une zone pour calculer les indemnités
          </div>
        )}
      </div>

      {/* Tableau récapitulatif par salarié */}
      {employes.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Zones de trajet par salarié</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {['Salarié', 'Poste', 'Zone actuelle', 'Indemnité mensuelle', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employes.map((e, i) => {
                const z = CCN_ZONES[i % CCN_ZONES.length];
                const mensuel = z.jourSemaine * 22;
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F2F2F7' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>{e.prenom} {e.nom}</td>
                    <td style={{ padding: '11px 14px', color: '#6E6E73' }}>{e.poste}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontWeight: 700, color: '#5B5BD6', background: '#EBF5FF', padding: '2px 9px', borderRadius: 10, fontSize: 12 }}>{z.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: '#34C759' }}>
                      {mensuel > 0 ? formatCur(mensuel) : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#D1F2E0', color: '#1A7F43' }}>Actif</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
