import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ── Demo data ─────────────────────────────────────────── */
const TODAY = new Date();
function daysAgo(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function daysFromNow(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const DEMO_FACTURES = [
  {
    id: 'F-2024-021', devisRef: 'D-2024-031', client: 'M. Rousseau', adresse: '3 impasse des Acacias, 69003 Lyon',
    objet: 'Rénovation salle de bain complète', montantHT: 4200, tva: 10,
    dateEmission: daysAgo(5), dateEcheance: daysFromNow(25),
    statut: 'envoyee', paiements: [],
  },
  {
    id: 'F-2024-020', devisRef: 'D-2024-028', client: 'Mme Leblanc', adresse: '14 rue des Lilas, 75019 Paris',
    objet: 'Installation électrique cuisine', montantHT: 1850, tva: 20,
    dateEmission: daysAgo(18), dateEcheance: daysAgo(3),
    statut: 'en_retard', paiements: [],
  },
  {
    id: 'F-2024-019', devisRef: 'D-2024-025', client: 'SCI Dupont', adresse: '8 avenue Foch, 75016 Paris',
    objet: 'Ravalement façade', montantHT: 12400, tva: 10,
    dateEmission: daysAgo(30), dateEcheance: daysAgo(0),
    statut: 'partielle', paiements: [{ date: daysAgo(10), montant: 5000, mode: 'Virement' }],
  },
  {
    id: 'F-2024-018', devisRef: 'D-2024-019', client: 'M. Martin', adresse: '22 rue Pasteur, 33000 Bordeaux',
    objet: 'Plomberie – remplacement chaudière', montantHT: 3100, tva: 10,
    dateEmission: daysAgo(45), dateEcheance: daysAgo(15),
    statut: 'payee', paiements: [{ date: daysAgo(14), montant: 3410, mode: 'Chèque' }],
  },
  {
    id: 'F-2024-017', devisRef: 'D-2024-015', client: 'Résidence Les Pins', adresse: '5 allée des Pins, 06200 Nice',
    objet: 'Peinture intérieure – 3 appartements', montantHT: 7800, tva: 10,
    dateEmission: daysAgo(60), dateEcheance: daysAgo(30),
    statut: 'payee', paiements: [{ date: daysAgo(28), montant: 8580, mode: 'Virement' }],
  },
  {
    id: 'F-2024-016', devisRef: null, client: 'Mme Petit', adresse: '9 rue du Commerce, 44000 Nantes',
    objet: 'Pose carrelage salle d\'eau', montantHT: 2200, tva: 10,
    dateEmission: daysAgo(2), dateEcheance: daysFromNow(28),
    statut: 'brouillon', paiements: [],
  },
];

// Accepted devis not yet invoiced (for "Créer depuis devis" feature)
const DEVIS_ACCEPTES = [
  { id: 'D-2024-033', client: 'M. Fontaine', objet: 'Extension terrasse', montantHT: 5600, tva: 10 },
  { id: 'D-2024-032', client: 'Mme Girard', objet: 'Isolation combles', montantHT: 3800, tva: 5.5 },
];

const STATUT_META = {
  brouillon:  { label: 'Brouillon',   color: 'var(--text-tertiary)',   bg: 'var(--border-light)' },
  envoyee:    { label: 'Envoyée',     color: 'var(--primary)',          bg: 'var(--primary-light)' },
  partielle:  { label: 'Acompte reçu', color: '#7C3AED',               bg: '#F3EEFF' },
  en_retard:  { label: 'En retard',   color: 'var(--danger)',           bg: 'var(--danger-light)' },
  payee:      { label: 'Payée',       color: '#1A7A3C',                 bg: 'var(--success-light)' },
  annulee:    { label: 'Annulée',     color: 'var(--text-tertiary)',    bg: 'var(--border-light)' },
};

const MODES_PAIEMENT = ['Virement', 'Chèque', 'Espèces', 'Carte', 'Autre'];

function montantTTC(f) { return f.montantHT * (1 + f.tva / 100); }
function resteARegler(f) {
  const paid = f.paiements.reduce((s, p) => s + p.montant, 0);
  return Math.max(0, montantTTC(f) - paid);
}
function fmtMoney(n) { return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }); }
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function isOverdue(f) {
  return f.statut !== 'payee' && f.statut !== 'annulee' && f.dateEcheance < TODAY.toISOString().slice(0, 10);
}

/* ── Legal notice inline ───────────────────────────────── */
function MentionsLegalesBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#EBF5FF', border: '1px solid #5B5BD6', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>⚖️</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0055B3', flex: 1 }}>
          Mentions légales obligatoires sur chaque facture (Art. L441-3 Code de commerce)
        </span>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B5BD6', fontSize: '0.8125rem', fontWeight: 600 }}>
          {open ? 'Masquer ▲' : 'Voir ▼'}
        </button>
      </div>
      {open && (
        <ul style={{ margin: '10px 0 0 22px', padding: 0, fontSize: '0.8125rem', color: '#1D1D1F', lineHeight: 1.8 }}>
          <li>N° de facture unique et séquentiel · Date d'émission</li>
          <li>SIRET, forme juridique, capital, RCS + ville du vendeur</li>
          <li>N° TVA intracommunautaire (si assujetti)</li>
          <li>Nom et adresse du client</li>
          <li>Description précise des travaux, quantités, prix unitaires HT</li>
          <li>Taux de TVA par ligne (5,5 % / 10 % / 20 %) — total HT, TVA, TTC</li>
          <li>Date d'échéance + conditions d'escompte (<em>ou "Pas d'escompte pour paiement anticipé"</em>)</li>
          <li><strong>Pénalités de retard :</strong> 3 × taux légal (~12,34 % en 2025) dès le lendemain de l'échéance</li>
          <li><strong>Indemnité forfaitaire recouvrement : 40 € par facture impayée</strong> (Art. D441-5)</li>
          <li>Si sous-traitant BTP : mention <em>"Auto-liquidation TVA — Art. 283-2 nonies CGI"</em></li>
          <li>N° police + compagnie d'assurance décennale et RC Pro</li>
        </ul>
      )}
    </div>
  );
}

/* ── Demo banner ───────────────────────────────────────── */
function DemoBanner() {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF3E0', border: '1px solid #FF9500', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
      <span>⚠️</span>
      <span style={{ fontSize: '0.8125rem', color: '#7A4900', fontWeight: 500, flex: 1 }}>
        Données de démonstration — les factures affichées sont fictives.
      </span>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF9500', fontWeight: 700, fontSize: '0.875rem' }}>✕</button>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────── */
function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ flex: 1, minWidth: 160 }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: '1.375rem', fontWeight: 700, color: color || 'var(--text)', letterSpacing: '-0.02em' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function Badge({ statut }) {
  const m = STATUT_META[statut] || STATUT_META.brouillon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 500,
      color: m.color, background: m.bg, whiteSpace: 'nowrap',
    }}>{m.label}</span>
  );
}

/* ── Main component ────────────────────────────────────── */
export default function Facturation() {
  const location = useLocation();
  const [factures, setFactures] = useState(DEMO_FACTURES);
  const [selected, setSelected] = useState(null);
  const [filterStatut, setFilterStatut] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showPaiement, setShowPaiement] = useState(false);
  const [paiementForm, setPaiementForm] = useState({ date: TODAY.toISOString().slice(0, 10), montant: '', mode: 'Virement', note: '' });
  const [createForm, setCreateForm] = useState({ devisRef: '', client: '', adresse: '', objet: '', montantHT: '', tva: '10', dateEcheance: daysFromNow(30) });
  const [fromDevis, setFromDevis] = useState(null);
  const [createSubmitted, setCreateSubmitted] = useState(false);
  const [showRelance, setShowRelance] = useState(false);
  const [relanceSent, setRelanceSent] = useState(false);

  /* Auto-open create modal when navigated from DevisPro */
  useEffect(() => {
    const fd = location.state?.fromDevis;
    if (fd) {
      setFromDevis(fd);
      setCreateForm({
        devisRef: fd.devisRef || '',
        client: fd.client || '',
        adresse: fd.adresse || '',
        objet: fd.objet || '',
        montantHT: fd.montantHT ? String(fd.montantHT) : '',
        tva: fd.tva ? String(fd.tva) : '10',
        dateEcheance: daysFromNow(30),
      });
      setShowCreate(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Derived data */
  const filtered = useMemo(() => {
    let list = factures;
    // Sync en_retard statut live
    list = list.map(f => ({
      ...f,
      statut: f.statut === 'envoyee' && isOverdue(f) ? 'en_retard' : f.statut,
    }));
    if (filterStatut !== 'all') list = list.filter(f => f.statut === filterStatut);
    if (search.trim()) list = list.filter(f =>
      f.id.toLowerCase().includes(search.toLowerCase()) ||
      f.client.toLowerCase().includes(search.toLowerCase()) ||
      f.objet.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [factures, filterStatut, search]);

  const kpis = useMemo(() => {
    const all = factures.map(f => ({
      ...f,
      statut: f.statut === 'envoyee' && isOverdue(f) ? 'en_retard' : f.statut,
    }));
    const ca = all.filter(f => f.statut === 'payee').reduce((s, f) => s + montantTTC(f), 0);
    const encours = all.filter(f => ['envoyee', 'partielle'].includes(f.statut)).reduce((s, f) => s + resteARegler(f), 0);
    const retard = all.filter(f => f.statut === 'en_retard').reduce((s, f) => s + resteARegler(f), 0);
    const nbRetard = all.filter(f => f.statut === 'en_retard').length;
    return { ca, encours, retard, nbRetard };
  }, [factures]);

  const selectedFacture = selected ? factures.find(f => f.id === selected) : null;

  /* Actions */
  function handleSelectDevis(devis) {
    setFromDevis(devis);
    setCreateForm({
      devisRef: devis.id,
      client: devis.client,
      adresse: '',
      objet: devis.objet,
      montantHT: String(devis.montantHT),
      tva: String(devis.tva),
      dateEcheance: daysFromNow(30),
    });
  }

  function handleCreate(e) {
    e.preventDefault();
    setCreateSubmitted(true);
    if (!createForm.client.trim() || !createForm.objet.trim() || !createForm.montantHT || !createForm.dateEcheance) return;
    const nextNum = factures.length + 1;
    const id = `F-2024-0${nextNum + 20}`;
    const f = {
      id,
      devisRef: createForm.devisRef || null,
      client: createForm.client,
      adresse: createForm.adresse,
      objet: createForm.objet,
      montantHT: parseFloat(createForm.montantHT),
      tva: parseFloat(createForm.tva),
      dateEmission: TODAY.toISOString().slice(0, 10),
      dateEcheance: createForm.dateEcheance,
      statut: 'envoyee',
      paiements: [],
    };
    setFactures(prev => [f, ...prev]);
    setSelected(f.id);
    setShowCreate(false);
    setFromDevis(null);
    setCreateSubmitted(false);
    setCreateForm({ devisRef: '', client: '', adresse: '', objet: '', montantHT: '', tva: '10', dateEcheance: daysFromNow(30) });
  }

  function handleAddPaiement(e) {
    e.preventDefault();
    const montant = parseFloat(paiementForm.montant);
    if (!montant || montant <= 0) return;
    setFactures(prev => prev.map(f => {
      if (f.id !== selected) return f;
      const newPaiements = [...f.paiements, { date: paiementForm.date, montant, mode: paiementForm.mode, note: paiementForm.note }];
      const totalPaid = newPaiements.reduce((s, p) => s + p.montant, 0);
      const ttc = montantTTC(f);
      const statut = totalPaid >= ttc ? 'payee' : 'partielle';
      return { ...f, paiements: newPaiements, statut };
    }));
    setShowPaiement(false);
    setPaiementForm({ date: TODAY.toISOString().slice(0, 10), montant: '', mode: 'Virement', note: '' });
  }

  function handleChangeStatut(id, statut) {
    setFactures(prev => prev.map(f => f.id === id ? { ...f, statut } : f));
  }

  /* CSV export */
  function exportCSV() {
    const rows = [['Numéro', 'Client', 'Objet', 'HT', 'TTC', 'Statut', 'Émission', 'Échéance']];
    filtered.forEach(f => rows.push([
      f.id, f.client, f.objet,
      f.montantHT.toFixed(2), montantTTC(f).toFixed(2),
      STATUT_META[f.statut]?.label || f.statut,
      f.dateEmission, f.dateEcheance,
    ]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'factures.csv'; a.click();
  }

  /* ── Render ── */
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', height: '100%' }}>
      {/* Left panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Demo banner */}
        <DemoBanner />
        {/* Legal notice */}
        <MentionsLegalesBanner />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Facturation</h1>
            <p style={{ fontSize: '0.875rem' }}>{factures.length} factures · gestion des paiements</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={exportCSV} style={{ fontSize: '0.8125rem' }}>
              ↓ Export CSV
            </button>
            <button className="btn-primary" onClick={() => { setShowCreate(true); setFromDevis(null); }}>
              + Nouvelle facture
            </button>
          </div>
        </div>

        {/* Overdue alert */}
        {kpis.nbRetard > 0 && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 500 }}>
              {kpis.nbRetard} facture{kpis.nbRetard > 1 ? 's' : ''} en retard — {fmtMoney(kpis.retard)} à relancer
            </span>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard label="CA encaissé" value={fmtMoney(kpis.ca)} />
          <StatCard label="En cours" value={fmtMoney(kpis.encours)} color="var(--primary)" />
          <StatCard label="En retard" value={fmtMoney(kpis.retard)} color={kpis.retard > 0 ? 'var(--danger)' : undefined} />
        </div>

        {/* Filters + search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
            <input
              className="input" placeholder="Rechercher..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32, fontSize: '0.8125rem' }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>🔍</span>
          </div>
          {['all', 'brouillon', 'envoyee', 'partielle', 'en_retard', 'payee', 'annulee'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500,
                border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                background: filterStatut === s ? 'var(--primary)' : 'var(--card)',
                color: filterStatut === s ? '#fff' : 'var(--text-secondary)',
                boxShadow: filterStatut === s ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              {s === 'all' ? 'Toutes' : STATUT_META[s]?.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Objet</th>
                <th style={{ textAlign: 'right' }}>Montant TTC</th>
                <th style={{ textAlign: 'right' }}>Reste à régler</th>
                <th>Échéance</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 32 }}>Aucune facture</td></tr>
              )}
              {filtered.map(f => {
                const ttc = montantTTC(f);
                const reste = resteARegler(f);
                const overdue = isOverdue(f);
                return (
                  <tr
                    key={f.id}
                    onClick={() => setSelected(f.id === selected ? null : f.id)}
                    style={{
                      cursor: 'pointer',
                      background: f.id === selected ? 'var(--primary-light)' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)', fontFamily: 'monospace' }}>{f.id}</td>
                    <td style={{ fontWeight: 500 }}>{f.client}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.objet}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(ttc)}</td>
                    <td style={{ textAlign: 'right', color: reste > 0 ? (overdue ? 'var(--danger)' : 'var(--warning)') : 'var(--success)', fontWeight: 500 }}>
                      {reste > 0 ? fmtMoney(reste) : '✓ Soldée'}
                    </td>
                    <td style={{ color: overdue ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {overdue && '⚠ '}{fmtDate(f.dateEcheance)}
                    </td>
                    <td><Badge statut={f.statut} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedFacture && (
        <div style={{
          width: 340, flexShrink: 0,
          position: 'sticky', top: 0,
          background: 'var(--card)', borderRadius: 12,
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          animation: 'scaleIn 0.15s ease-out',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Facture</p>
              <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)', fontFamily: 'monospace' }}>{selectedFacture.id}</p>
              {selectedFacture.devisRef && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Devis {selectedFacture.devisRef}</p>
              )}
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
          </div>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <Badge statut={selectedFacture.statut} />
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Client',    value: selectedFacture.client },
                { label: 'Adresse',   value: selectedFacture.adresse || '—' },
                { label: 'Objet',     value: selectedFacture.objet },
                { label: 'Émission',  value: fmtDate(selectedFacture.dateEmission) },
                { label: 'Échéance',  value: fmtDate(selectedFacture.dateEcheance) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amounts */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg)' }}>
            {[
              { label: `HT`, val: fmtMoney(selectedFacture.montantHT) },
              { label: `TVA ${selectedFacture.tva}%`, val: fmtMoney(selectedFacture.montantHT * selectedFacture.tva / 100) },
              { label: 'Total TTC', val: fmtMoney(montantTTC(selectedFacture)), bold: true },
            ].map(({ label, val, bold }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8125rem', color: bold ? 'var(--text)' : 'var(--text-secondary)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: bold ? 700 : 500, color: bold ? 'var(--text)' : 'var(--text-secondary)' }}>{val}</span>
              </div>
            ))}
            {selectedFacture.paiements.length > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
                {selectedFacture.paiements.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>✓ Reçu le {fmtDate(p.date)} ({p.mode})</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>−{fmtMoney(p.montant)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: resteARegler(selectedFacture) > 0 ? 'var(--danger)' : 'var(--success)' }}>Reste à régler</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: resteARegler(selectedFacture) > 0 ? 'var(--danger)' : 'var(--success)' }}>{fmtMoney(resteARegler(selectedFacture))}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedFacture.statut !== 'payee' && selectedFacture.statut !== 'annulee' && (
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowPaiement(true)}>
                + Enregistrer un paiement
              </button>
            )}
            {selectedFacture.statut === 'brouillon' && (
              <button className="btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }}
                onClick={() => handleChangeStatut(selectedFacture.id, 'envoyee')}>
                ✉ Marquer comme envoyée
              </button>
            )}
            {(selectedFacture.statut === 'en_retard' || selectedFacture.statut === 'envoyee' || selectedFacture.statut === 'partielle') && (
              <button className="btn-secondary" style={{ width: '100%', fontSize: '0.8125rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={() => { setShowRelance(true); setRelanceSent(false); }}>
                📧 Envoyer une relance
              </button>
            )}
            {selectedFacture.statut !== 'annulee' && selectedFacture.statut !== 'payee' && (
              <button className="btn-danger" style={{ width: '100%', fontSize: '0.8125rem' }}
                onClick={() => handleChangeStatut(selectedFacture.id, 'annulee')}>
                Annuler la facture
              </button>
            )}
          </div>

          {/* Paiement form */}
          {showPaiement && (
            <form onSubmit={handleAddPaiement} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: 12 }}>Enregistrer un paiement</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={paiementForm.date} onChange={e => setPaiementForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Montant (€)</label>
                  <input className="input" type="number" step="0.01" min="0.01"
                    placeholder={`Max ${fmtMoney(resteARegler(selectedFacture))}`}
                    value={paiementForm.montant}
                    onChange={e => setPaiementForm(p => ({ ...p, montant: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label">Mode de paiement</label>
                  <select className="select" value={paiementForm.mode} onChange={e => setPaiementForm(p => ({ ...p, mode: e.target.value }))}>
                    {MODES_PAIEMENT.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Valider</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowPaiement(false)}>Annuler</button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => { setShowCreate(false); setCreateSubmitted(false); }}>
          <div style={{
            background: 'var(--card)', borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
            animation: 'scaleIn 0.15s ease-out',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Nouvelle facture</h2>
              <button onClick={() => { setShowCreate(false); setCreateSubmitted(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
            </div>

            {/* From devis shortcut */}
            {DEVIS_ACCEPTES.length > 0 && !fromDevis && (
              <div style={{ marginBottom: 20, padding: 14, background: 'var(--primary-light)', borderRadius: 10 }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>
                  Créer depuis un devis accepté
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {DEVIS_ACCEPTES.map(d => (
                    <button key={d.id} onClick={() => handleSelectDevis(d)} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8,
                      padding: '8px 12px', cursor: 'pointer', transition: 'var(--transition)',
                    }}>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{d.id} — {d.client}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{d.objet}</p>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>{fmtMoney(d.montantHT * (1 + d.tva / 100))}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCreate} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {fromDevis && (
                  <div style={{ background: 'var(--success-light)', borderRadius: 8, padding: '8px 12px', fontSize: '0.8125rem', color: '#1A7A3C' }}>
                    ✓ Pré-rempli depuis le devis {fromDevis.id}
                  </div>
                )}
                <div>
                  <label className="label">Client *</label>
                  <input className="input" value={createForm.client} onChange={e => setCreateForm(f => ({ ...f, client: e.target.value }))} placeholder="Nom du client"
                    style={createSubmitted && !createForm.client.trim() ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(255,59,48,0.12)' } : {}} />
                  {createSubmitted && !createForm.client.trim() && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>Ce champ est requis</p>}
                </div>
                <div>
                  <label className="label">Adresse chantier</label>
                  <input className="input" value={createForm.adresse} onChange={e => setCreateForm(f => ({ ...f, adresse: e.target.value }))} placeholder="Adresse" />
                </div>
                <div>
                  <label className="label">Objet *</label>
                  <input className="input" value={createForm.objet} onChange={e => setCreateForm(f => ({ ...f, objet: e.target.value }))} placeholder="Description des travaux"
                    style={createSubmitted && !createForm.objet.trim() ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(255,59,48,0.12)' } : {}} />
                  {createSubmitted && !createForm.objet.trim() && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>Ce champ est requis</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Montant HT (€) *</label>
                    <input className="input" type="number" step="0.01" min="0" value={createForm.montantHT} onChange={e => setCreateForm(f => ({ ...f, montantHT: e.target.value }))} placeholder="0.00"
                      style={createSubmitted && !createForm.montantHT ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(255,59,48,0.12)' } : {}} />
                    {createSubmitted && !createForm.montantHT && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>Requis</p>}
                  </div>
                  <div>
                    <label className="label">TVA (%)</label>
                    <select className="select" value={createForm.tva} onChange={e => setCreateForm(f => ({ ...f, tva: e.target.value }))}>
                      {['0', '5.5', '10', '20'].map(t => <option key={t} value={t}>{t}%</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Date d'échéance *</label>
                  <input className="input" type="date" value={createForm.dateEcheance} onChange={e => setCreateForm(f => ({ ...f, dateEcheance: e.target.value }))}
                    style={createSubmitted && !createForm.dateEcheance ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(255,59,48,0.12)' } : {}} />
                  {createSubmitted && !createForm.dateEcheance && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>Ce champ est requis</p>}
                </div>
                {createForm.montantHT && (
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total TTC : </span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                      {fmtMoney(parseFloat(createForm.montantHT || 0) * (1 + parseFloat(createForm.tva || 0) / 100))}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Créer la facture</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Annuler</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Relance modal */}
      {showRelance && selectedFacture && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowRelance(false)}>
          <div style={{ background: 'var(--card)', borderRadius: 16, width: '100%', maxWidth: 500, padding: 28, boxShadow: 'var(--shadow-xl)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Relance client</h2>
              <button onClick={() => setShowRelance(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
            </div>

            {relanceSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Relance envoyée</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Un email de relance a été envoyé à {selectedFacture.client}.
                </p>
                <button className="btn-secondary" onClick={() => setShowRelance(false)}>Fermer</button>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--danger-light)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.875rem', color: 'var(--danger)' }}>
                  <strong>Facture {selectedFacture.id}</strong> — {fmtMoney(resteARegler(selectedFacture))} restant à régler<br />
                  Échéance : {fmtDate(selectedFacture.dateEcheance)}
                </div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px', marginBottom: 20, fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
{`Objet : Relance — Facture ${selectedFacture.id} impayée

Madame, Monsieur ${selectedFacture.client},

Sauf erreur de notre part, la facture ${selectedFacture.id} d'un montant de ${fmtMoney(montantTTC(selectedFacture))} TTC est arrivée à échéance le ${fmtDate(selectedFacture.dateEcheance)}.

Nous vous remercions de bien vouloir procéder au règlement dans les meilleurs délais.

Conformément à l'art. D441-5 du Code de commerce, des pénalités de retard et une indemnité forfaitaire de 40 € sont applicables dès le lendemain de l'échéance.

Cordialement,`}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-primary" style={{ flex: 1, background: 'var(--danger)' }} onClick={() => setRelanceSent(true)}>
                    📧 Envoyer la relance
                  </button>
                  <button className="btn-secondary" onClick={() => setShowRelance(false)}>Annuler</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
