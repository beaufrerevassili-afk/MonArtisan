// ============================================================
//  DevisFactures.jsx — Page unifiée Devis & Factures
//  Double flux : Freample (séquestre) / Manuel (classique)
//  Lien direct patron → client
// ============================================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { secureToken } from '../../utils/security';
import { IconDocument, IconCreditCard, IconTrendUp, IconPlus, IconCheck, IconSearch } from '../../components/ui/Icons';
import DevisFormulaire from '../../components/DevisFormulaire';
import EnvoyerDevisButton from '../../components/devis/EnvoyerDevisButton';

const CARD = { background: '#fff', border: '1px solid #E5E5EA', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const BTN = { padding: '8px 18px', background: '#1C1C1E', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
const BTN_O = { ...BTN, background: 'transparent', color: '#1C1C1E', border: '1px solid #E5E5EA' };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
const LBL = { fontSize: 11, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' };

function lsGet(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function fmt(n) { return Number(n || 0).toLocaleString('fr-FR'); }
function fmtE(n) { return `${fmt(n)} €`; }

const STATUT_DEVIS = {
  brouillon: { label: 'Brouillon', color: '#6E6E73', bg: '#F2F2F7' },
  envoye: { label: 'Envoyé', color: '#D97706', bg: '#FFFBEB' },
  signe: { label: 'Signé', color: '#16A34A', bg: '#F0FDF4' },
  refuse: { label: 'Refusé', color: '#DC2626', bg: '#FEF2F2' },
};

const STATUT_FACTURE = {
  sequestre_acompte: { label: 'Acompte bloqué', color: '#2563EB', bg: '#EFF6FF' },
  sequestre_attente: { label: 'En attente validation', color: '#D97706', bg: '#FFFBEB' },
  sequestre_libere: { label: 'Libéré', color: '#16A34A', bg: '#F0FDF4' },
  sequestre_litige: { label: 'Litige', color: '#DC2626', bg: '#FEF2F2' },
  envoyee: { label: 'Envoyée', color: '#2563EB', bg: '#EFF6FF' },
  payee: { label: 'Payée', color: '#16A34A', bg: '#F0FDF4' },
  en_retard: { label: 'En retard', color: '#DC2626', bg: '#FEF2F2' },
};

// Données démo
const DEMO_DEVIS = [
  { id: 1, numero: 'DEV-2026-001', client: 'M. Leblanc', objet: 'Rénovation façade — Immeuble Leblanc', montantHT: 18500, tva: 1850, montantTTC: 20350, statut: 'signe', source: 'marketplace', chantierId: 1, date: '2026-03-15', versions: [] },
  { id: 2, numero: 'DEV-2026-002', client: 'Mme Dupont', objet: 'Pose carrelage — Appartement T3', montantHT: 3200, tva: 320, montantTTC: 3520, statut: 'envoye', source: 'marketplace', chantierId: 2, date: '2026-04-01', versions: [] },
  { id: 3, numero: 'DEV-2026-003', client: 'Copropriété Les Oliviers', objet: 'Installation électrique neuve', montantHT: 4800, tva: 480, montantTTC: 5280, statut: 'signe', source: 'manuel', chantierId: 3, date: '2026-03-10', versions: [] },
  { id: 4, numero: 'DEV-2026-004', client: 'Syndic Voltaire', objet: 'Remplacement chauffe-eau collectif', montantHT: 2200, tva: 220, montantTTC: 2420, statut: 'brouillon', source: 'manuel', chantierId: null, date: '2026-04-10', versions: [] },
  { id: 5, numero: 'DEV-2026-005', client: 'M. Rousseau', objet: 'Peinture intérieure T4', montantHT: 5600, tva: 560, montantTTC: 6160, statut: 'refuse', source: 'direct', chantierId: null, date: '2026-03-20', versions: [] },
];

const DEMO_FACTURES = [
  { id: 1, numero: 'FAC-2026-001', devisId: 1, client: 'M. Leblanc', objet: 'Rénovation façade', montantTTC: 20350, source: 'marketplace', statut: 'sequestre_attente', acompte: 6105, solde: 14245, avancement: 65, date: '2026-03-20', chantierId: 1 },
  { id: 2, numero: 'FAC-2026-002', devisId: 3, client: 'Copropriété Les Oliviers', objet: 'Installation électrique', montantTTC: 5280, source: 'manuel', statut: 'en_retard', date: '2026-03-15', chantierId: 3, dateLimite: '2026-04-15' },
];

export default function DevisFactures() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState(urlTab || 'devis');
  // Sync tab when URL query changes (clicking sidebar link twice, navigating between Devis/Factures)
  useEffect(() => {
    if (urlTab && urlTab !== tab) setTab(urlTab);
  }, [urlTab]);
  const [filtre, setFiltre] = useState('tous');
  const [search, setSearch] = useState('');
  const [devis, setDevis] = useState(() => {
    const saved = lsGet('freample_devis', []);
    return saved.length > 0 ? saved : DEMO_DEVIS;
  });
  const [factures, setFactures] = useState(() => {
    const saved = lsGet('freample_factures_patron', []);
    return saved.length > 0 ? saved : DEMO_FACTURES;
  });
  const [lienDirect, setLienDirect] = useState(null); // modal lien direct
  const [showNewDevis, setShowNewDevis] = useState(false);
  const [editingDevis, setEditingDevis] = useState(null);
  const [devisAEnvoyer, setDevisAEnvoyer] = useState(null);
  const [lienForm, setLienForm] = useState({ clientNom: '', clientEmail: '', objet: '', montantHT: '' });
  const [lienGenere, setLienGenere] = useState(null);

  // Persist
  useEffect(() => { lsSet('freample_devis', devis); }, [devis]);
  useEffect(() => { lsSet('freample_factures_patron', factures); }, [factures]);

  // KPIs
  const devisEnAttente = devis.filter(d => d.statut === 'envoye').length;
  const montantEnAttente = devis.filter(d => d.statut === 'envoye').reduce((s, d) => s + (d.montantTTC || 0), 0);
  const facturesEnCours = factures.filter(f => !['payee', 'sequestre_libere'].includes(f.statut)).length;
  const montantImpaye = factures.filter(f => f.statut === 'en_retard').reduce((s, f) => s + (f.montantTTC || 0), 0);
  const devisSignes = devis.filter(d => d.statut === 'signe').length;
  const devisEnvoyes = devis.filter(d => ['envoye', 'signe', 'refuse'].includes(d.statut)).length;
  const tauxConversion = devisEnvoyes > 0 ? Math.round(devisSignes / devisEnvoyes * 100) : 0;

  // Filtrage
  const filteredDevis = useMemo(() => devis
    .filter(d => filtre === 'tous' || d.source === filtre)
    .filter(d => !search || d.client?.toLowerCase().includes(search.toLowerCase()) || d.objet?.toLowerCase().includes(search.toLowerCase()) || d.numero?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  , [devis, filtre, search]);

  const filteredFactures = useMemo(() => factures
    .filter(f => filtre === 'tous' || f.source === filtre)
    .filter(f => !search || f.client?.toLowerCase().includes(search.toLowerCase()) || f.objet?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  , [factures, filtre, search]);

  // Actions
  function signerDevis(id) {
    setDevis(prev => prev.map(d => d.id === id ? { ...d, statut: 'signe', versions: [...(d.versions || []), { statut: 'envoye', date: d.date }] } : d));
    // Générer écriture comptable
    const d = devis.find(x => x.id === id);
    if (d) {
      const ecritures = lsGet('freample_ecritures', []);
      ecritures.push(
        { date: new Date().toISOString().slice(0, 10), journal: 'VE', piece: d.numero, compte: '411000', libelle: `Client ${d.client}`, debit: d.montantTTC || 0, credit: 0 },
        { date: new Date().toISOString().slice(0, 10), journal: 'VE', piece: d.numero, compte: '706000', libelle: `Prestation ${d.objet}`, debit: 0, credit: d.montantHT || 0 },
        { date: new Date().toISOString().slice(0, 10), journal: 'VE', piece: d.numero, compte: '445710', libelle: 'TVA collectée', debit: 0, credit: d.tva || 0 },
      );
      lsSet('freample_ecritures', ecritures);
    }
  }

  function genererFacture(devisItem) {
    const num = `FAC-2026-${String(factures.length + 1).padStart(3, '0')}`;
    const source = devisItem.source || 'manuel';
    // Récupérer l'emetteur depuis le devis (snapshot figé à l'envoi) ou depuis le profil
    const emetteur = devisItem.emetteur || (() => {
      try { return JSON.parse(localStorage.getItem('freample_profil_patron') || '{}'); } catch { return {}; }
    })();
    const newFac = {
      id: Date.now(), numero: num, devisId: devisItem.id,
      client: devisItem.client, clientEmail: devisItem.clientEmail, clientTel: devisItem.clientTel,
      clientAdresse: devisItem.clientAdresse, adresseChantier: devisItem.adresseChantier,
      objet: devisItem.objet,
      emetteur,
      montantHT: devisItem.montantHT, tva: devisItem.tva, montantTTC: devisItem.montantTTC,
      tvaDetails: devisItem.tvaDetails,
      source, date: new Date().toISOString().slice(0, 10),
      chantierId: devisItem.chantierId,
      statut: source === 'marketplace' || source === 'direct' ? 'sequestre_acompte' : 'envoyee',
      acompte: source !== 'manuel' ? Math.round(devisItem.montantTTC * 0.3) : 0,
      solde: source !== 'manuel' ? Math.round(devisItem.montantTTC * 0.7) : 0,
      avancement: 0,
      dateLimite: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    };
    setFactures(prev => [newFac, ...prev]);
  }

  function marquerPayee(id) {
    setFactures(prev => prev.map(f => f.id === id ? { ...f, statut: 'payee' } : f));
  }
  function libererSequestre(id) {
    setFactures(prev => prev.map(f => f.id === id ? { ...f, statut: 'sequestre_libere' } : f));
  }

  // Lien direct
  function genererLienDirect() {
    const id = Date.now();
    const lien = `${window.location.origin}/devis/${id}/signer?token=${secureToken(8)}`;
    const newDevis = {
      id, numero: `DEV-2026-${String(devis.length + 1).padStart(3, '0')}`,
      client: lienForm.clientNom, objet: lienForm.objet, montantHT: Number(lienForm.montantHT) || 0,
      tva: Math.round((Number(lienForm.montantHT) || 0) * 0.1),
      montantTTC: Math.round((Number(lienForm.montantHT) || 0) * 1.1),
      statut: 'envoye', source: 'direct', chantierId: null,
      date: new Date().toISOString().slice(0, 10), versions: [], lienSignature: lien,
    };
    setDevis(prev => [newDevis, ...prev]);
    setLienGenere(lien);
  }

  const sourceBadge = (source) => {
    const map = { marketplace: { label: 'Freample', color: '#16A34A', bg: '#F0FDF4' }, direct: { label: 'Lien direct', color: '#2563EB', bg: '#EFF6FF' }, manuel: { label: 'Manuel', color: '#6E6E73', bg: '#F2F2F7' } };
    const s = map[source] || map.manuel;
    return <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 4 }}>{s.label}</span>;
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Devis & Factures</h1>
          <p style={{ color: '#6E6E73', marginTop: 4, fontSize: 14 }}>Gérez vos devis, facturez, suivez vos paiements</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowNewDevis(true)} style={BTN}><IconPlus size={14} style={{ marginRight: 6 }} />Nouveau devis</button>
        </div>
      </div>

      {/* Nouveau devis / Modification (formulaire complet) */}
      {showNewDevis && (
        <div style={{ marginBottom: 24 }}>
          <DevisFormulaire
            user={{ entrepriseType: 'patron' }}
            initialData={editingDevis}
            onSoumettre={(devisData) => {
              const all = lsGet('freample_devis', []);
              const action = devisData._action || 'brouillon';
              const editingId = devisData._editingId;
              let finalDevis;

              if (editingId) {
                const idx = all.findIndex(d => d.id === editingId);
                if (idx >= 0) {
                  const old = all[idx];
                  if (old.statut !== 'brouillon') {
                    // V2 - devis deja envoye/signe
                    const parentVersion = old.version || 1;
                    const baseNum = (old.numero || '').split('-V')[0];
                    finalDevis = {
                      ...devisData,
                      id: Date.now(), numero: `${baseNum}-V${parentVersion + 1}`,
                      version: parentVersion + 1, parentId: old.id,
                      client: devisData.client?.nom || '', clientEmail: devisData.client?.email || '',
                      clientTel: devisData.client?.telephone || '', clientAdresse: devisData.client?.adresse || '',
                      adresseChantier: devisData.client?.adresseChantier || '',
                      montantHT: devisData.totalHT, tva: devisData.totalTVA, montantTTC: devisData.totalTTC,
                      source: old.source || 'manuel', statut: action === 'envoyer' ? 'envoye' : 'brouillon',
                      date: new Date().toISOString().slice(0, 10),
                    };
                    all[idx] = { ...old, statut: 'archive', remplaceParId: finalDevis.id };
                    all.push(finalDevis);
                  } else {
                    finalDevis = {
                      ...old,
                      client: devisData.client?.nom || '', clientEmail: devisData.client?.email || '',
                      clientTel: devisData.client?.telephone || '', clientAdresse: devisData.client?.adresse || '',
                      adresseChantier: devisData.client?.adresseChantier || '',
                      objet: devisData.objet, lignes: devisData.lignes, lots: devisData.lots,
                      options: devisData.options, echeancier: devisData.echeancier,
                      conditions: devisData.conditions, notes: devisData.notes,
                      emetteur: devisData.emetteur,
                      montantHT: devisData.totalHT, tva: devisData.totalTVA, montantTTC: devisData.totalTTC,
                      tvaDetails: devisData.tvaDetails, parType: devisData.parType,
                      validiteJours: devisData.validiteJours, dateDebut: devisData.dateDebut, dureeEstimee: devisData.dureeEstimee,
                      remiseGlobale: devisData.remiseGlobale,
                      statut: action === 'envoyer' ? 'envoye' : 'brouillon',
                      modifieLe: new Date().toISOString(),
                    };
                    all[idx] = finalDevis;
                  }
                }
              } else {
                const num = `DEV-${new Date().getFullYear()}-${String(all.length + 1).padStart(3, '0')}`;
                finalDevis = {
                  id: Date.now(), numero: num, version: 1,
                  client: devisData.client?.nom || '', clientEmail: devisData.client?.email || '',
                  clientTel: devisData.client?.telephone || '', clientAdresse: devisData.client?.adresse || '',
                  adresseChantier: devisData.client?.adresseChantier || '',
                  objet: devisData.objet, lignes: devisData.lignes, lots: devisData.lots,
                  options: devisData.options, echeancier: devisData.echeancier,
                  conditions: devisData.conditions, notes: devisData.notes,
                  emetteur: devisData.emetteur,
                  montantHT: devisData.totalHT, tva: devisData.totalTVA, montantTTC: devisData.totalTTC,
                  tvaDetails: devisData.tvaDetails, parType: devisData.parType,
                  validiteJours: devisData.validiteJours, dateDebut: devisData.dateDebut, dureeEstimee: devisData.dureeEstimee,
                  remiseGlobale: devisData.remiseGlobale,
                  source: 'manuel', statut: action === 'envoyer' ? 'envoye' : 'brouillon',
                  date: new Date().toISOString().slice(0, 10),
                };
                all.push(finalDevis);
              }

              lsSet('freample_devis', all);
              setDevis(all);
              setShowNewDevis(false); setEditingDevis(null);
              if (action === 'envoyer') { setDevisAEnvoyer(finalDevis); addToast('Devis créé — envoyez-le au client', 'success'); }
              else if (action === 'pdf') { addToast('Devis sauvegardé — impression en cours', 'info'); setTimeout(() => window.print(), 300); }
              else addToast('Devis sauvegardé en brouillon', 'success');
            }}
            onAnnuler={() => { setShowNewDevis(false); setEditingDevis(null); }}
            onOuvrirProfil={() => { setShowNewDevis(false); setEditingDevis(null); navigate('/patron/profil'); }}
          />
        </div>
      )}

      {/* Confirmation devis créé, proposition envoi immédiat */}
      {devisAEnvoyer && (
        <div style={{ ...CARD, borderLeft: '4px solid #16A34A', background: '#F0FDF4', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#16A34A', marginBottom: 4 }}>Devis {devisAEnvoyer.numero} créé</div>
          <div style={{ fontSize: 12, color: '#6E6E73', marginBottom: 10 }}>Envoyez-le maintenant à votre client par email.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <EnvoyerDevisButton devis={devisAEnvoyer} label="Envoyer maintenant" onEnvoye={() => setDevis(lsGet('freample_devis', []))} />
            <button onClick={() => setDevisAEnvoyer(null)} style={{ ...BTN_O, fontSize: 12 }}>Plus tard</button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#D9770618', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDocument size={16} /></div>
            <span style={{ fontSize: 12, color: '#6E6E73' }}>Devis en attente</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#D97706' }}>{devisEnAttente}</div>
          <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>{fmtE(montantEnAttente)} de CA potentiel</div>
        </div>
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: montantImpaye > 0 ? '#DC262618' : '#16A34A18', color: montantImpaye > 0 ? '#DC2626' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCreditCard size={16} /></div>
            <span style={{ fontSize: 12, color: '#6E6E73' }}>Paiements en cours</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: montantImpaye > 0 ? '#DC2626' : '#16A34A' }}>{facturesEnCours}</div>
          {montantImpaye > 0 && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 2 }}>{fmtE(montantImpaye)} d'impayés</div>}
        </div>
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#16A34A18', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTrendUp size={16} /></div>
            <span style={{ fontSize: 12, color: '#6E6E73' }}>Taux de conversion</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: tauxConversion >= 50 ? '#16A34A' : tauxConversion >= 30 ? '#D97706' : '#DC2626' }}>{tauxConversion}%</div>
          <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>{devisSignes} signés / {devisEnvoyes} envoyés</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ id: 'tous', label: 'Tous' }, { id: 'marketplace', label: 'Freample' }, { id: 'direct', label: 'Lien direct' }, { id: 'manuel', label: 'Manuels' }].map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)} style={{ padding: '6px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filtre === f.id ? '#1C1C1E' : '#F2F2F7', color: filtre === f.id ? '#fff' : '#6E6E73' }}>{f.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <IconSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#636363' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ ...INP, paddingLeft: 34 }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 22, width: 'fit-content' }}>
        {[{ id: 'devis', label: `Devis (${filteredDevis.length})` }, { id: 'factures', label: `Factures (${filteredFactures.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 20px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#1C1C1E' : '#6E6E73', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.10)' : 'none' }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ DEVIS ═══ */}
      {tab === 'devis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredDevis.filter(d => d.statut !== 'archive').length === 0 && <div style={{ ...CARD, textAlign: 'center', padding: 48, color: '#6E6E73' }}>Aucun devis pour ce filtre.</div>}
          {filteredDevis.filter(d => d.statut !== 'archive').map(d => {
            const st = STATUT_DEVIS[d.statut] || STATUT_DEVIS.brouillon;
            const canEdit = d.statut !== 'signe' && d.statut !== 'signé' && d.statut !== 'refuse';
            return (
              <div key={d.id} style={{ ...CARD, borderLeft: `3px solid ${st.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{d.numero}</span>
                    {d.version > 1 && <span style={{ fontSize: 10, fontWeight: 700, color: '#A68B4B', background: '#FFF9F0', padding: '2px 6px', borderRadius: 4 }}>V{d.version}</span>}
                    <span style={{ fontSize: 10, fontWeight: 600, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 4 }}>{st.label}</span>
                    {sourceBadge(d.source)}
                    {d.aFinaliserRole === 'patron' && d.statut === 'brouillon' && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#DC2626', padding: '3px 8px', borderRadius: 4, animation: 'pulse 2s infinite' }}>🔔 À FINALISER</span>
                    )}
                  </div>
                  {d.aFinaliserRole === 'patron' && d.statut === 'brouillon' && (
                    <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginBottom: 4 }}>Le client a accepté votre offre — finalisez ce devis et envoyez-le</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>{d.client} — {d.objet}</div>
                  <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>{d.date}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtE(d.montantTTC)}</div>
                  <div style={{ fontSize: 11, color: '#6E6E73' }}>{fmtE(d.montantHT)} HT</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                  {canEdit && (
                    <button onClick={() => {
                      setEditingDevis({ ...d, client: { nom: d.client, email: d.clientEmail, telephone: d.clientTel, adresse: d.clientAdresse, adresseChantier: d.adresseChantier } });
                      setShowNewDevis(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} style={{ ...BTN_O, fontSize: 11, padding: '6px 12px' }}>
                      {d.statut === 'brouillon' ? 'Modifier' : 'Créer V2'}
                    </button>
                  )}
                  {d.statut === 'brouillon' && (
                    <button onClick={() => {
                      if (!window.confirm('Supprimer ce brouillon ?')) return;
                      const all = lsGet('freample_devis', []);
                      lsSet('freample_devis', all.filter(x => x.id !== d.id));
                      setDevis(lsGet('freample_devis', []));
                    }} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Supprimer</button>
                  )}
                  {(d.statut === 'brouillon' || d.statut === 'envoye' || d.statut === 'modif_demandee') && (
                    <EnvoyerDevisButton devis={d} size="sm" onEnvoye={() => { setDevis(lsGet('freample_devis', [])); }} />
                  )}
                  {d.statut === 'envoye' && <button onClick={() => signerDevis(d.id)} style={{ ...BTN, background: '#16A34A', fontSize: 11, padding: '6px 12px' }}>Marquer signé</button>}
                  {(d.statut === 'signe' || d.statut === 'signé') && !factures.find(f => f.devisId === d.id) && (
                    <button onClick={() => genererFacture(d)} style={{ ...BTN, background: '#2563EB', fontSize: 11, padding: '6px 12px' }}>
                      {d.source === 'manuel' ? 'Créer la facture' : 'Déclencher le séquestre'}
                    </button>
                  )}
                  {(d.statut === 'signe' || d.statut === 'signé') && factures.find(f => f.devisId === d.id) && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '4px 10px', borderRadius: 4 }}>Facturé</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ FACTURES ═══ */}
      {tab === 'factures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredFactures.length === 0 && <div style={{ ...CARD, textAlign: 'center', padding: 48, color: '#6E6E73' }}>Aucune facture pour ce filtre.</div>}
          {filteredFactures.map(f => {
            const st = STATUT_FACTURE[f.statut] || STATUT_FACTURE.envoyee;
            const isFreample = f.source === 'marketplace' || f.source === 'direct';
            const isRetard = f.statut === 'en_retard';
            return (
              <div key={f.id} style={{ ...CARD, borderLeft: `3px solid ${st.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{f.numero}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 4 }}>{st.label}</span>
                      {sourceBadge(f.source)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.client} — {f.objet}</div>
                    <div style={{ fontSize: 11, color: '#6E6E73', marginTop: 2 }}>Émise le {f.date}{f.dateLimite ? ` — Échéance ${f.dateLimite}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtE(f.montantTTC)}</div>
                  </div>
                </div>

                {/* Détail séquestre Freample */}
                {isFreample && (
                  <div style={{ marginTop: 14, padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Paiement sécurisé Freample</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span>Acompte 30%</span>
                        <span style={{ fontWeight: 600, color: '#16A34A' }}>{fmtE(f.acompte)} — Bloqué sur séquestre</span>
                      </div>
                      {f.avancement > 0 && f.avancement < 100 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>Situation {f.avancement}%</span>
                          <span style={{ fontWeight: 600, color: f.statut === 'sequestre_attente' ? '#D97706' : '#16A34A' }}>
                            {fmtE(Math.round(f.montantTTC * f.avancement / 100 - f.acompte))} — {f.statut === 'sequestre_attente' ? 'En attente de validation client' : 'Libéré'}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span>Solde</span>
                        <span style={{ color: '#6E6E73' }}>{fmtE(f.solde)} — {f.avancement >= 100 ? 'En attente' : 'Non déclenché'}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: '#16A34A' }}>Tout est géré par Freample. Libération automatique après validation client (7 jours max).</div>
                    {f.statut === 'sequestre_attente' && (
                      <button onClick={() => libererSequestre(f.id)} style={{ ...BTN, background: '#16A34A', fontSize: 11, marginTop: 10 }}>Simuler la libération</button>
                    )}
                  </div>
                )}

                {/* Gestion manuelle */}
                {!isFreample && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ padding: '12px 16px', background: '#FFFBEB', border: '1px solid #D9770630', borderRadius: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E' }}>Chantier hors marketplace — gestion financière manuelle</div>
                      <div style={{ fontSize: 11, color: '#92400E', marginTop: 2 }}>Cette facture n'est pas sécurisée par Freample. Passez par la marketplace ou envoyez un lien direct pour un paiement garanti.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {f.statut !== 'payee' && <button onClick={() => marquerPayee(f.id)} style={{ ...BTN, background: '#16A34A', fontSize: 11, padding: '6px 12px' }}>Marquer payée</button>}
                      {isRetard && <button onClick={() => { window.open(`mailto:?subject=${encodeURIComponent('Relance facture ' + f.numero)}&body=${encodeURIComponent(`Bonjour,\n\nLa facture ${f.numero} de ${fmtE(f.montantTTC)} est en attente de règlement depuis le ${f.date}.\n\nMerci de régulariser.\n\nCordialement`)}`); }} style={{ ...BTN, background: '#DC2626', fontSize: 11, padding: '6px 12px' }}>Relancer</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ MODAL LIEN DIRECT ═══ */}
      {lienDirect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setLienDirect(null); setLienGenere(null); setLienForm({ clientNom: '', clientEmail: '', objet: '', montantHT: '' }); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {!lienGenere ? (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Envoyer un devis à votre client</h3>
                <p style={{ fontSize: 13, color: '#6E6E73', margin: '0 0 20px' }}>Votre client recevra un lien pour voir et signer le devis. Le paiement passera par le séquestre Freample. Commission 1%.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={LBL}>Nom du client</label><input value={lienForm.clientNom} onChange={e => setLienForm(f => ({ ...f, clientNom: e.target.value }))} placeholder="Jean Dupont" style={INP} /></div>
                  <div><label style={LBL}>Email du client</label><input type="email" value={lienForm.clientEmail} onChange={e => setLienForm(f => ({ ...f, clientEmail: e.target.value }))} placeholder="jean@email.com" style={INP} /></div>
                  <div><label style={LBL}>Objet des travaux</label><input value={lienForm.objet} onChange={e => setLienForm(f => ({ ...f, objet: e.target.value }))} placeholder="Rénovation salle de bain" style={INP} /></div>
                  <div><label style={LBL}>Montant HT estimé (€)</label><input type="number" value={lienForm.montantHT} onChange={e => setLienForm(f => ({ ...f, montantHT: e.target.value }))} placeholder="5000" style={INP} /></div>
                </div>
                <div style={{ marginTop: 20, padding: '12px 16px', background: '#EFF6FF', borderRadius: 10, fontSize: 12, color: '#1E40AF' }}>
                  Le client verra votre devis et pourra le signer en ligne. Le paiement sera sécurisé par le séquestre Freample. Vous ne perdez jamais votre client — le devis est envoyé directement à lui, pas sur la marketplace.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={genererLienDirect} disabled={!lienForm.clientNom || !lienForm.objet || !lienForm.montantHT} style={{ ...BTN, flex: 1, background: '#2563EB', opacity: (!lienForm.clientNom || !lienForm.objet || !lienForm.montantHT) ? 0.5 : 1 }}>Générer le lien</button>
                  <button onClick={() => { setLienDirect(null); setLienGenere(null); }} style={{ ...BTN_O }}>Annuler</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><IconCheck size={24} color="#16A34A" /></div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Lien généré</h3>
                  <p style={{ fontSize: 13, color: '#6E6E73', margin: 0 }}>Envoyez ce lien à {lienForm.clientNom} pour qu'il signe le devis.</p>
                </div>
                <div style={{ padding: '12px 14px', background: '#F8F9FA', borderRadius: 10, fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 16 }}>{lienGenere}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(lienGenere); }} style={{ ...BTN, flex: 1, background: '#2563EB' }}>Copier le lien</button>
                  {lienForm.clientEmail && <button onClick={() => { window.open(`mailto:${lienForm.clientEmail}?subject=${encodeURIComponent(`Devis — ${lienForm.objet}`)}&body=${encodeURIComponent(`Bonjour ${lienForm.clientNom},\n\nVeuillez trouver ci-dessous le lien pour consulter et signer votre devis :\n\n${lienGenere}\n\nCordialement`)}`); }} style={{ ...BTN, flex: 1 }}>Envoyer par email</button>}
                </div>
                <button onClick={() => { setLienDirect(null); setLienGenere(null); setLienForm({ clientNom: '', clientEmail: '', objet: '', montantHT: '' }); }} style={{ ...BTN_O, width: '100%', marginTop: 10 }}>Fermer</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
