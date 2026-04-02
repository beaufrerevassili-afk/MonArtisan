import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconPlus, IconX, IconDownload, IconSend, IconEye,
  IconDocument, IconCheck, IconClock, IconBuilding, IconUser, IconCalendar, IconSearch
} from '../../components/ui/Icons';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TVA_RATES = [0, 5.5, 10, 20];
const VALIDITE_OPTIONS = [15, 30, 45, 60, 90];
const UNITES = ['u', 'm²', 'm', 'ml', 'h', 'j', 'forfait', 'kg', 'm³', 'ensemble'];

/* ── BTP Quick Templates ── */
const TEMPLATES = [
  { cat: 'Maçonnerie', items: [
    { description: 'Réalisation de mur en parpaings 20 cm — fourniture et pose', unite: 'm²', prixUnitaire: 85, tva: 10 },
    { description: 'Enduit de façade projeté — préparation + application', unite: 'm²', prixUnitaire: 45, tva: 10 },
    { description: 'Chape liquide autonivelante — fourniture et pose', unite: 'm²', prixUnitaire: 28, tva: 10 },
  ]},
  { cat: 'Carrelage / Sol', items: [
    { description: 'Pose de carrelage 60×60 rectifié — fourniture et pose', unite: 'm²', prixUnitaire: 65, tva: 10 },
    { description: 'Ragréage de sol — préparation et pose', unite: 'm²', prixUnitaire: 18, tva: 10 },
    { description: 'Pose de plinthes carrelage', unite: 'ml', prixUnitaire: 22, tva: 10 },
  ]},
  { cat: 'Peinture / Revêtements', items: [
    { description: 'Peinture intérieure 2 couches — préparation + application', unite: 'm²', prixUnitaire: 22, tva: 10 },
    { description: 'Pose de papier peint — dépose ancienne et pose nouveau', unite: 'm²', prixUnitaire: 35, tva: 10 },
    { description: 'Ravalement de façade — nettoyage + peinture', unite: 'm²', prixUnitaire: 55, tva: 10 },
  ]},
  { cat: 'Plomberie', items: [
    { description: 'Installation salle de bain complète — fourniture et pose', unite: 'forfait', prixUnitaire: 2800, tva: 10 },
    { description: 'Remplacement chauffe-eau — fourniture et pose', unite: 'u', prixUnitaire: 950, tva: 10 },
    { description: 'Pose WC suspendu — fourniture et pose', unite: 'u', prixUnitaire: 650, tva: 10 },
  ]},
  { cat: 'Électricité', items: [
    { description: 'Mise aux normes tableau électrique', unite: 'forfait', prixUnitaire: 1200, tva: 10 },
    { description: 'Pose de prises et interrupteurs', unite: 'u', prixUnitaire: 85, tva: 10 },
    { description: 'Installation éclairage — fourniture et pose', unite: 'u', prixUnitaire: 120, tva: 10 },
  ]},
  { cat: 'Divers', items: [
    { description: 'Dépose et évacuation déchets de chantier', unite: 'forfait', prixUnitaire: 350, tva: 20 },
    { description: 'Protection et nettoyage chantier', unite: 'forfait', prixUnitaire: 180, tva: 20 },
    { description: 'Installation de chantier', unite: 'forfait', prixUnitaire: 250, tva: 20 },
  ]},
];

const ECHEANCIER_DEFAUT = [
  { label: 'Acompte à la commande', pct: 30 },
  { label: 'Situation en cours de chantier', pct: 40 },
  { label: 'Solde à la réception', pct: 30 },
];

const CONDITIONS_DEFAULT = `1. VALIDITÉ DU DEVIS
Le présent devis est valable pour une durée de 30 jours à compter de sa date d'émission.

2. MODALITÉS DE PAIEMENT
- 30 % à la commande (acompte)
- 40 % en cours de chantier (sur situation)
- 30 % à la réception des travaux (après levée de réserves)
Paiement par chèque ou virement bancaire. Tout retard de paiement entraîne l'application de pénalités au taux légal majoré de 3 points (art. L441-6 du C.com) ainsi qu'une indemnité forfaitaire de recouvrement de 40 €.

3. DÉLAI D'EXÉCUTION
Le délai d'exécution sera convenu d'un commun accord après acceptation du devis et versement de l'acompte.

4. GARANTIES LÉGALES
Les travaux réalisés bénéficient des garanties suivantes conformément au Code Civil :
- Garantie décennale (art. 1792 et suivants) : 10 ans
- Garantie biennale (art. 1792-3) : 2 ans sur les équipements
- Garantie de parfait achèvement (art. 1792-6) : 1 an

5. ASSURANCES
Notre entreprise est couverte par :
- Responsabilité Civile Professionnelle
- Assurance Décennale (loi Spinetta n°78-12 du 4 janvier 1978)
Les attestations d'assurances sont disponibles sur demande.

6. RÉSILIATION
Toute résiliation du contrat doit être notifiée par lettre recommandée. Les travaux effectués resteront dus.

7. LITIGES
Tout litige relatif à l'exécution du présent contrat sera soumis à la juridiction compétente du ressort du siège social.`;

/* ── Legal banner ── */
function DevisLegalBanner() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ background: '#ECFDF5', border: '1px solid #34C759', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>⚖️</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A5C34', flex: 1 }}>
          Mentions obligatoires sur les devis (Art. L111-1 Code de la consommation)
        </span>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34C759', fontSize: '0.8125rem', fontWeight: 600 }}>
          {open ? 'Masquer ▲' : 'Voir ▼'}
        </button>
      </div>
      {open && (
        <ul style={{ margin: '10px 0 0 22px', padding: 0, fontSize: '0.8125rem', color: '#1D1D1F', lineHeight: 1.9 }}>
          <li>Nom, adresse, SIRET, forme juridique de l'entreprise</li>
          <li>Nom et adresse du maître d'ouvrage (client)</li>
          <li>Date de rédaction et <strong>durée de validité</strong> de l'offre (30 à 90 jours conseillés)</li>
          <li>Description précise et chiffrée des travaux — prix HT par poste, taux TVA applicable, total TTC</li>
          <li>Délai d'exécution prévisionnel et conditions de paiement</li>
          <li>N° police, compagnie et garanties de l'<strong>assurance décennale</strong> et RC Pro (Art. L241-1 Code des assurances)</li>
          <li>Pour travaux chez un particulier signés hors établissement : <strong>droit de rétractation de 14 jours</strong> (Art. L221-18 Code de la conso.)</li>
          <li>TVA 10 % applicable sur rénovation de logements achevés depuis + 2 ans · TVA 5,5 % sur travaux énergétiques (Art. 279-0 bis CGI)</li>
          <li>Mention <strong>"Bon pour accord"</strong> + date + signature manuscrite du client conseillée</li>
        </ul>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatCurrency(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function statutBadge(statut) {
  const map = {
    brouillon: { bg: '#F2F2F7', color: '#3C3C43', label: 'Brouillon' },
    envoyé:    { bg: '#FFF3CD', color: '#856404', label: 'Envoyé' },
    signé:     { bg: '#D1F2E0', color: '#1A7F43', label: 'Signé' },
    refusé:    { bg: '#FFE5E5', color: '#C0392B', label: 'Refusé' },
  };
  const s = map[statut] || map.brouillon;
  return <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
}

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #devis-print-area, #devis-print-area * { visibility: visible !important; }
  #devis-print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; background: #fff; font-size: 12px; }
  .no-print { display: none !important; }
  @page { margin: 1.5cm; }
}
`;

function calcLine(l) {
  const qty = Number(l.quantite) || 0;
  const pu = Number(l.prixUnitaire) || 0;
  const remisePct = Number(l.remise) || 0;
  const ht = qty * pu * (1 - remisePct / 100);
  return { ht, tvaAmt: ht * (Number(l.tva) || 0) / 100, ttc: ht * (1 + (Number(l.tva) || 0) / 100) };
}

function calcTotals(lignes, remiseGlobale = 0) {
  let totalHT = 0, totalTVA = 0;
  lignes.forEach(l => { const c = calcLine(l); totalHT += c.ht; totalTVA += c.tvaAmt; });
  const remiseMt = totalHT * remiseGlobale / 100;
  const baseHT = totalHT - remiseMt;
  // Recalculate TVA on discounted base (proportionally)
  const tvaOnBase = totalHT > 0 ? totalTVA * (baseHT / totalHT) : 0;
  return { totalHTBrut: totalHT, remiseMt, totalHT: baseHT, totalTVA: tvaOnBase, totalTTC: baseHT + tvaOnBase };
}

const LIGNE_VIDE = { description: '', quantite: 1, unite: 'm²', prixUnitaire: 0, tva: 10, remise: 0 };

const FORM_INIT = {
  entreprise: { nom: '', siret: '', tva: '', rcs: '', adresse: '', cp: '', ville: '', telephone: '', email: '', decennale: '', rcpro: '' },
  client: { nom: '', siret: '', adresse: '', cp: '', ville: '', telephone: '', email: '' },
  chantier: { adresse: '', cp: '', ville: '', description: '' },
  objet: '',
  lignes: [{ ...LIGNE_VIDE }],
  remiseGlobale: 0,
  echeancier: ECHEANCIER_DEFAUT.map(e => ({ ...e })),
  conditions: CONDITIONS_DEFAULT,
  validiteDays: 30,
  notes: '',
  dateDebut: '',
  dateFin: '',
};

export default function DevisPro() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [devis, setDevis] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchDevis, setSearchDevis] = useState('');
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const printRef = useRef();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const [form, setForm] = useState(FORM_INIT);

  /* ── Charge salariale interne ── */
  const [chargesOpen, setChargesOpen] = useState(false);
  const [depotAdresse, setDepotAdresse] = useState(() => localStorage.getItem('btp_depot_adresse') || '');
  const [mainOeuvre, setMainOeuvre] = useState([{ id: 1, nom: '', tauxHoraire: 0, heures: 0 }]);
  const [trajetChantier, setTrajetChantier] = useState({ km: 0, jours: 1, nbPersonnes: 1, inclure: false });

  function getBTPZoneRate(km) {
    const k = Number(km) || 0;
    if (k <= 10) return { zone: 'Zone 1', rate: 1.50 };
    if (k <= 20) return { zone: 'Zone 2', rate: 1.84 };
    if (k <= 30) return { zone: 'Zone 3', rate: 2.00 };
    if (k <= 40) return { zone: 'Zone 4', rate: 2.32 };
    if (k <= 50) return { zone: 'Zone 5', rate: 2.67 };
    return { zone: 'Zone 6', rate: 3.05 };
  }
  const totalMO = mainOeuvre.reduce((s, e) => s + (Number(e.tauxHoraire) || 0) * (Number(e.heures) || 0), 0);
  const { zone: btpZone, rate: btpRate } = getBTPZoneRate(trajetChantier.km);
  const totalTrajet = btpRate * (Number(trajetChantier.jours) || 0) * (Number(trajetChantier.nbPersonnes) || 0);

  function addMOLigne() {
    setMainOeuvre(prev => [...prev, { id: Date.now(), nom: '', tauxHoraire: 0, heures: 0 }]);
  }
  function updateMO(id, field, val) {
    setMainOeuvre(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));
  }
  function removeMO(id) {
    setMainOeuvre(prev => prev.length > 1 ? prev.filter(e => e.id !== id) : prev);
  }
  function addMOAsLigne() {
    if (totalMO <= 0) return;
    const desc = mainOeuvre.map(e => e.nom ? `${e.nom} (${e.heures}h)` : `${e.heures}h`).join(', ');
    addLine({ description: `Main d'œuvre — ${desc}`, prixUnitaire: totalMO, unite: 'forfait', tva: 20 });
  }
  function addTrajetAsLigne() {
    if (totalTrajet <= 0) return;
    addLine({ description: `Indemnités trajet BTP ${btpZone} — ${trajetChantier.jours}j × ${trajetChantier.nbPersonnes} pers.`, prixUnitaire: totalTrajet, unite: 'forfait', tva: 20 });
  }

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchDevis() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/patron/devis-pro`, { headers });
      const d = await r.json();
      setDevis(d.devis || []);
      setStats(d.stats || calcStats(d.devis || []));
    } catch (e) {
      setDevis([]);
      setStats(calcStats([]));
    }
    setLoading(false);
  }

  useEffect(() => { fetchDevis(); }, []);

  function calcStats(list) {
    return {
      total: list.length,
      brouillons: list.filter(d => d.statut === 'brouillon').length,
      envoyes: list.filter(d => d.statut === 'envoyé').length,
      signes: list.filter(d => d.statut === 'signé').length,
      caTotal: list.filter(d => d.statut === 'signé').reduce((s, d) => s + (d.totalTTC || 0), 0),
    };
  }

  const totals = calcTotals(form.lignes, form.remiseGlobale);

  function addLine(template) {
    const ligne = template ? { ...LIGNE_VIDE, ...template, remise: 0 } : { ...LIGNE_VIDE };
    setForm(f => ({ ...f, lignes: [...f.lignes, ligne] }));
    setShowTemplates(false);
  }

  function removeLine(i) { setForm(f => ({ ...f, lignes: f.lignes.filter((_, idx) => idx !== i) })); }

  function updateLine(i, field, val) {
    setForm(f => ({ ...f, lignes: f.lignes.map((l, idx) => idx === i ? { ...l, [field]: val } : l) }));
  }

  function updateEcheancier(i, field, val) {
    setForm(f => ({ ...f, echeancier: f.echeancier.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));
  }

  async function handleCreate() {
    const numero = `DVS-${new Date().getFullYear()}-${String(devis.length + 1).padStart(3, '0')}`;
    const payload = { ...form, numero, ...totals, creeLe: new Date().toISOString(), statut: 'brouillon' };
    try {
      const r = await fetch(`${API}/patron/devis-pro`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const d = await r.json();
      await fetchDevis();
      setSelectedDevis({ ...payload, id: d.id || Date.now() });
    } catch (e) {
      const newD = { ...payload, id: Date.now() };
      setDevis(prev => [newD, ...prev]);
      setSelectedDevis(newD);
    }
    setView('preview');
  }

  async function handleEnvoyer(id) {
    setSending(true);
    try {
      const r = await fetch(`${API}/patron/devis-pro/${id}/envoyer`, { method: 'PUT', headers });
      const d = await r.json();
      setSelectedDevis(prev => ({ ...prev, statut: 'envoyé', ...(d.devis || {}) }));
      await fetchDevis();
    } catch (e) {
      setSelectedDevis(prev => ({ ...prev, statut: 'envoyé' }));
    }
    setSending(false);
  }

  async function openPreview(devisItem) {
    try {
      const r = await fetch(`${API}/patron/devis-pro/${devisItem.id}`, { headers });
      const d = await r.json();
      setSelectedDevis(d);
    } catch (e) { setSelectedDevis(devisItem); }
    setView('preview');
  }

  function copyLink(link) {
    navigator.clipboard.writeText(link || '').catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function resetForm() { setForm({ ...FORM_INIT, lignes: [{ ...LIGNE_VIDE }], echeancier: ECHEANCIER_DEFAUT.map(e => ({ ...e })) }); }

  const filteredDevis = devis.filter(d =>
    !searchDevis || d.client?.nom?.toLowerCase().includes(searchDevis.toLowerCase()) ||
    d.numero?.toLowerCase().includes(searchDevis.toLowerCase()) ||
    d.objet?.toLowerCase().includes(searchDevis.toLowerCase())
  );

  /* ══════════════════════════════════════════════
     LIST VIEW
  ══════════════════════════════════════════════ */
  if (view === 'list') return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Legal reminder */}
      <DevisLegalBanner />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Devis professionnels</h1>
          {!isMobile && <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: 14 }}>Créez, personnalisez et suivez vos devis BTP</p>}
        </div>
        <button onClick={() => { resetForm(); setView('create'); }} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 15
        }}>
          <IconPlus size={16} /> Nouveau devis
        </button>
      </div>

      {/* Stats KPIs */}
      <div className="stats-grid" style={{ gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total || 0, color: '#5B5BD6', fmt: v => v },
          { label: 'Brouillons', value: stats.brouillons || 0, color: '#8E8E93', fmt: v => v },
          { label: 'Envoyés', value: stats.envoyes || 0, color: '#FF9500', fmt: v => v },
          { label: 'Signés', value: stats.signes || 0, color: '#34C759', fmt: v => v },
          { label: 'CA signé', value: stats.caTotal || 0, color: '#5B5BD6', fmt: v => formatCurrency(v) },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: s.color }}>{s.fmt(s.value)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <IconSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8E8E93' }} />
          <input value={searchDevis} onChange={e => setSearchDevis(e.target.value)} placeholder="Rechercher un devis, client…"
            style={{ width: '100%', paddingLeft: 36, padding: '9px 12px 9px 36px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--card)' }} />
        </div>
      </div>

      {/* Devis list */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement…</div>
      ) : filteredDevis.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <IconDocument size={40} />
          <p style={{ marginTop: 12 }}>Aucun devis pour l'instant</p>
          <button onClick={() => { resetForm(); setView('create'); }} className="btn-primary" style={{ marginTop: 16 }}>
            <IconPlus size={14} /> Créer un devis
          </button>
        </div>
      ) : isMobile ? (
        /* ── Mobile: card list ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredDevis.map(d => (
            <div key={d.id} className="card" onClick={() => openPreview(d)}
              style={{ padding: '14px 16px', cursor: 'pointer', borderLeft: `4px solid ${d.statut === 'signé' ? '#34C759' : d.statut === 'envoyé' ? '#FF9500' : 'var(--border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{d.numero}</span>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginLeft: 10 }}>{d.client?.nom || '—'}</span>
                </div>
                {statutBadge(d.statut)}
              </div>
              {d.objet && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.objet}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(d.creeLe)} · {d.validiteDays}j</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{formatCurrency(d.totalTTC)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Desktop: table ── */
        <div className="table-wrap" style={{ background: 'var(--card)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {['N° Devis', 'Client', 'Objet', 'Total TTC', 'Date', 'Validité', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDevis.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{d.numero}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>{d.client?.nom || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.objet}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700 }}>{formatCurrency(d.totalTTC)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(d.creeLe)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{d.validiteDays}j</td>
                  <td style={{ padding: '14px 16px' }}>{statutBadge(d.statut)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => openPreview(d)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                      <IconEye size={14} /> Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════════════
     CREATE FORM
  ══════════════════════════════════════════════ */
  if (view === 'create') {
    const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 };
    const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--card)', color: 'var(--text)' };
    const sec = { background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)' };
    const secTitle = { fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 };

    return (
      <div style={{ maxWidth: 980, margin: '0 auto', paddingBottom: isMobile ? 80 : 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 15, fontWeight: 600 }}>← Retour</button>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Nouveau devis</h1>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setView('list')} style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
              <button onClick={handleCreate} style={{ padding: '9px 24px', border: 'none', borderRadius: 10, background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Créer le devis</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Section 1 — Infos entreprise */}
          <section style={sec}>
            <h2 style={secTitle}><IconBuilding size={16} color="var(--primary)" /> Votre entreprise</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div><label style={lbl}>Nom de l'entreprise</label><input value={form.entreprise.nom} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, nom: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>SIRET</label><input value={form.entreprise.siret} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, siret: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>N° TVA intracommunautaire</label><input value={form.entreprise.tva} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, tva: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Adresse</label><input value={form.entreprise.adresse} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, adresse: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Code postal</label><input value={form.entreprise.cp} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, cp: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Ville</label><input value={form.entreprise.ville} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, ville: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Assurance décennale (assureur + police)</label><input value={form.entreprise.decennale} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, decennale: e.target.value } }))} placeholder="Ex : MAAF — Police n° 123…" style={inp} /></div>
              <div><label style={lbl}>RC Professionnelle (assureur + police)</label><input value={form.entreprise.rcpro} onChange={e => setForm(f => ({ ...f, entreprise: { ...f.entreprise, rcpro: e.target.value } }))} placeholder="Ex : AXA — Police n° 456…" style={inp} /></div>
            </div>
          </section>

          {/* Section 2 — Client */}
          <section style={sec}>
            <h2 style={secTitle}><IconUser size={16} color="var(--primary)" /> Client</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div><label style={lbl}>Nom / Raison sociale *</label><input value={form.client.nom} onChange={e => setForm(f => ({ ...f, client: { ...f.client, nom: e.target.value } }))} placeholder="Jean Dupont ou SARL Immo+" style={inp} /></div>
              <div><label style={lbl}>SIRET (si professionnel)</label><input value={form.client.siret} onChange={e => setForm(f => ({ ...f, client: { ...f.client, siret: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Email</label><input type="email" value={form.client.email} onChange={e => setForm(f => ({ ...f, client: { ...f.client, email: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Téléphone</label><input value={form.client.telephone} onChange={e => setForm(f => ({ ...f, client: { ...f.client, telephone: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Adresse</label><input value={form.client.adresse} onChange={e => setForm(f => ({ ...f, client: { ...f.client, adresse: e.target.value } }))} style={inp} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
                <div><label style={lbl}>CP</label><input value={form.client.cp} onChange={e => setForm(f => ({ ...f, client: { ...f.client, cp: e.target.value } }))} style={inp} /></div>
                <div><label style={lbl}>Ville</label><input value={form.client.ville} onChange={e => setForm(f => ({ ...f, client: { ...f.client, ville: e.target.value } }))} style={inp} /></div>
              </div>
            </div>
          </section>

          {/* Section 3 — Chantier + Objet */}
          <section style={sec}>
            <h2 style={secTitle}><IconBuilding size={16} color="var(--primary)" /> Chantier & Objet</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div><label style={lbl}>Objet du devis *</label><input value={form.objet} onChange={e => setForm(f => ({ ...f, objet: e.target.value }))} placeholder="Rénovation salle de bain — 12 m²" style={inp} /></div>
              <div><label style={lbl}>Validité</label>
                <select value={form.validiteDays} onChange={e => setForm(f => ({ ...f, validiteDays: Number(e.target.value) }))} style={inp}>
                  {VALIDITE_OPTIONS.map(v => <option key={v} value={v}>{v} jours</option>)}
                </select>
              </div>
              <div><label style={lbl}>Remise globale (%)</label>
                <input type="number" min="0" max="100" value={form.remiseGlobale} onChange={e => setForm(f => ({ ...f, remiseGlobale: Number(e.target.value) }))} style={inp} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr 1fr 1fr', gap: 14 }}>
              <div><label style={lbl}>Adresse chantier (si différente)</label><input value={form.chantier.adresse} onChange={e => setForm(f => ({ ...f, chantier: { ...f.chantier, adresse: e.target.value } }))} placeholder="Même que client" style={inp} /></div>
              <div><label style={lbl}>CP</label><input value={form.chantier.cp} onChange={e => setForm(f => ({ ...f, chantier: { ...f.chantier, cp: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Ville</label><input value={form.chantier.ville} onChange={e => setForm(f => ({ ...f, chantier: { ...f.chantier, ville: e.target.value } }))} style={inp} /></div>
              <div><label style={lbl}>Début travaux (estimé)</label><input type="date" value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} style={inp} /></div>
              <div><label style={lbl}>Fin travaux (estimée)</label><input type="date" value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))} style={inp} /></div>
            </div>
          </section>

          {/* Section 3b — Charge salariale interne (non visible client) */}
          <section style={{ ...sec, borderLeft: '3px solid #5B5BD6', paddingLeft: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ ...secTitle, margin: 0 }}>Charge salariale & déplacements
                  <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, background: '#E3F2FD', color: '#5B5BD6', padding: '2px 8px', borderRadius: 8 }}>Usage interne · Non visible client</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                  Calculez le coût de main d'œuvre et les indemnités trajet BTP 2024, puis ajoutez-les comme lignes de devis.
                </p>
              </div>
              <button onClick={() => setChargesOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#5B5BD6', padding: '4px 8px' }}>
                {chargesOpen ? '▲' : '▼'}
              </button>
            </div>

            {chargesOpen && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Main d'œuvre */}
                <div style={{ background: '#F8F8FE', borderRadius: 10, padding: 14 }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13 }}>Main d'œuvre</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#EDEDFC' }}>
                        {['Employé / Poste', 'Taux horaire (€/h)', 'Heures estimées', 'Coût', ''].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: h === 'Coût' || h === 'Heures estimées' || h === 'Taux horaire (€/h)' ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: '#5B5BD6' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mainOeuvre.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid #E8E8F8' }}>
                          <td style={{ padding: '6px 10px' }}>
                            <input value={emp.nom} onChange={e => updateMO(emp.id, 'nom', e.target.value)}
                              placeholder="Ex : Maçon, Chef équipe…" style={{ padding: '4px 8px', border: '1px solid #E5E5EA', borderRadius: 6, fontSize: 13, width: '100%' }} />
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                            <input type="number" min={0} step={0.5} value={emp.tauxHoraire}
                              onChange={e => updateMO(emp.id, 'tauxHoraire', e.target.value)}
                              style={{ padding: '4px 8px', border: '1px solid #E5E5EA', borderRadius: 6, fontSize: 13, width: 90, textAlign: 'right' }} />
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                            <input type="number" min={0} step={0.5} value={emp.heures}
                              onChange={e => updateMO(emp.id, 'heures', e.target.value)}
                              style={{ padding: '4px 8px', border: '1px solid #E5E5EA', borderRadius: 6, fontSize: 13, width: 90, textAlign: 'right' }} />
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>
                            {((Number(emp.tauxHoraire) || 0) * (Number(emp.heures) || 0)).toFixed(2)} €
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <button onClick={() => removeMO(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontSize: 16 }}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 700 }}>Total main d'œuvre</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#5B5BD6', fontSize: 15 }}>{totalMO.toFixed(2)} €</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button onClick={addMOLigne} style={{ padding: '6px 14px', background: '#F2F2F7', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      + Ajouter un employé
                    </button>
                    <button onClick={addMOAsLigne} disabled={totalMO <= 0} style={{ padding: '6px 14px', background: totalMO > 0 ? '#5B5BD6' : '#E5E5EA', color: totalMO > 0 ? '#fff' : '#8E8E93', border: 'none', borderRadius: 8, cursor: totalMO > 0 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}>
                      + Ajouter comme ligne de devis ({totalMO.toFixed(2)} €)
                    </button>
                  </div>
                </div>

                {/* Frais de déplacement */}
                <div style={{ background: '#F8FFF8', borderRadius: 10, padding: 14 }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13 }}>Indemnités trajet BTP 2024</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Adresse dépôt</label>
                      <input value={depotAdresse} onChange={e => { setDepotAdresse(e.target.value); localStorage.setItem('btp_depot_adresse', e.target.value); }}
                        placeholder="12 rue de la Paix, 45000 Orléans"
                        style={{ padding: '6px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Distance aller (km)</label>
                      <input type="number" min={0} max={300} step={1} value={trajetChantier.km}
                        onChange={e => setTrajetChantier(p => ({ ...p, km: e.target.value }))}
                        style={{ padding: '6px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Jours de chantier</label>
                      <input type="number" min={1} max={250} step={1} value={trajetChantier.jours}
                        onChange={e => setTrajetChantier(p => ({ ...p, jours: e.target.value }))}
                        style={{ padding: '6px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6E6E73', display: 'block', marginBottom: 3 }}>Nbre personnes</label>
                      <input type="number" min={1} max={50} step={1} value={trajetChantier.nbPersonnes}
                        onChange={e => setTrajetChantier(p => ({ ...p, nbPersonnes: e.target.value }))}
                        style={{ padding: '6px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 13, width: '100%' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#6E6E73', marginBottom: 3 }}>Zone / Taux</div>
                      <div style={{ padding: '6px 10px', background: '#E3F2FD', borderRadius: 8, fontWeight: 700, color: '#5B5BD6', fontSize: 13 }}>
                        {btpZone} · {btpRate.toFixed(2)} €/j
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6E6E73' }}>Total estimé :</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#1A7F43' }}>{totalTrajet.toFixed(2)} €</span>
                    <button onClick={addTrajetAsLigne} disabled={totalTrajet <= 0} style={{ padding: '6px 14px', background: totalTrajet > 0 ? '#34C759' : '#E5E5EA', color: totalTrajet > 0 ? '#fff' : '#8E8E93', border: 'none', borderRadius: 8, cursor: totalTrajet > 0 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}>
                      + Ajouter comme ligne de devis
                    </button>
                    <span style={{ fontSize: 11, color: '#8E8E93', marginLeft: 'auto' }}>Art. R3261-1 CT · Exonéré cotisations sociales</span>
                  </div>
                </div>

              </div>
            )}
          </section>

          {/* Section 4 — Lignes */}
          <section style={sec}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ ...secTitle, margin: 0 }}>Lignes du devis</h2>
              <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
                <button onClick={() => setShowTemplates(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F2F2F7', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  📋 Gabarits BTP
                </button>
                <button onClick={() => addLine()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <IconPlus size={13} /> Ajouter une ligne
                </button>
                {showTemplates && (
                  <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid #E5E5EA', zIndex: 100, width: 420, maxHeight: 420, overflowY: 'auto' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F2F2F7', fontWeight: 700, fontSize: 14 }}>Gabarits prestations BTP</div>
                    {TEMPLATES.map(cat => (
                      <div key={cat.cat}>
                        <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', background: '#FAFAFA' }}>{cat.cat}</div>
                        {cat.items.map((item, i) => (
                          <button key={i} onClick={() => addLine(item)} style={{ width: '100%', textAlign: 'left', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #F8F8F8' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F0F8FF'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <div style={{ fontWeight: 600, color: '#1C1C1E' }}>{item.description}</div>
                            <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>{item.prixUnitaire} €/{item.unite} · TVA {item.tva}%</div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lines header */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 70px 80px 110px 70px 70px 90px 32px', gap: 8, marginBottom: 8 }}>
              {['Description / Désignation', 'Qté', 'Unité', 'P.U. HT', 'TVA %', 'Remise', 'Total HT', ''].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</div>
              ))}
            </div>

            {form.lignes.map((l, i) => {
              const c = calcLine(l);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 70px 80px 110px 70px 70px 90px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input value={l.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Désignation de la prestation ou du matériau…" style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', color: 'var(--text)' }} />
                  <input type="number" min="0" step="0.1" value={l.quantite} onChange={e => updateLine(i, 'quantite', e.target.value)} style={{ padding: '8px 6px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', textAlign: 'right' }} />
                  <select value={l.unite} onChange={e => updateLine(i, 'unite', e.target.value)} style={{ padding: '8px 4px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, outline: 'none' }}>
                    {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <input type="number" min="0" step="0.01" value={l.prixUnitaire} onChange={e => updateLine(i, 'prixUnitaire', e.target.value)} style={{ padding: '8px 6px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', textAlign: 'right' }} />
                  <select value={l.tva} onChange={e => updateLine(i, 'tva', Number(e.target.value))} style={{ padding: '8px 4px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, outline: 'none' }}>
                    {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input type="number" min="0" max="100" value={l.remise} onChange={e => updateLine(i, 'remise', Number(e.target.value))} style={{ padding: '8px 4px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, outline: 'none', width: '100%', textAlign: 'right' }} />
                    <span style={{ fontSize: 11, color: '#8E8E93' }}>%</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{c.ht.toFixed(2)} €</div>
                  <button onClick={() => removeLine(i)} disabled={form.lignes.length === 1} style={{ background: 'none', border: 'none', cursor: form.lignes.length === 1 ? 'default' : 'pointer', color: form.lignes.length === 1 ? '#C7C7CC' : '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconX size={14} />
                  </button>
                </div>
              );
            })}

            {/* Totals */}
            <div style={{ marginTop: 20, borderTop: '2px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>Total HT brut</span><span>{formatCurrency(totals.totalHTBrut)}</span>
                </div>
                {form.remiseGlobale > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: '#FF3B30' }}>
                    <span>Remise globale ({form.remiseGlobale}%)</span><span>- {formatCurrency(totals.remiseMt)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>Total HT net</span><span>{formatCurrency(totals.totalHT)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>TVA</span><span>{formatCurrency(totals.totalTVA)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--primary)', borderTop: '1px solid var(--border)', marginTop: 4 }}>
                  <span>Total TTC</span><span>{formatCurrency(totals.totalTTC)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 — Échéancier */}
          <section style={sec}>
            <h2 style={secTitle}>💳 Échéancier de paiement</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {form.echeancier.map((e, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px auto', gap: 12, alignItems: 'center' }}>
                  <div>
                    <label style={lbl}>Libellé</label>
                    <input value={e.label} onChange={ev => updateEcheancier(i, 'label', ev.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Pourcentage (%)</label>
                    <input type="number" min="0" max="100" value={e.pct} onChange={ev => updateEcheancier(i, 'pct', Number(ev.target.value))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Montant TTC</label>
                    <div style={{ padding: '9px 12px', background: '#F8F9FA', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
                      {formatCurrency(totals.totalTTC * e.pct / 100)}
                    </div>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, echeancier: f.echeancier.filter((_, idx) => idx !== i) }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', marginTop: 18 }}>
                    <IconX size={14} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <button onClick={() => setForm(f => ({ ...f, echeancier: [...f.echeancier, { label: 'Nouvelle échéance', pct: 0 }] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <IconPlus size={13} /> Ajouter une échéance
                </button>
                <div style={{ fontSize: 13, color: form.echeancier.reduce((s, e) => s + e.pct, 0) === 100 ? '#34C759' : '#FF3B30', fontWeight: 700 }}>
                  Total : {form.echeancier.reduce((s, e) => s + e.pct, 0)}% {form.echeancier.reduce((s, e) => s + e.pct, 0) === 100 ? '✓' : '≠ 100%'}
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 — Conditions */}
          <section style={sec}>
            <h2 style={secTitle}>📋 Conditions générales & Notes</h2>
            <textarea value={form.conditions} onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))} rows={12}
              style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box', color: 'var(--text)' }} />
            <div style={{ marginTop: 14 }}>
              <label style={lbl}>Notes internes (non affichées sur le devis imprimé)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                placeholder="Commentaires, informations internes…"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', color: 'var(--text)' }} />
            </div>
          </section>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 32 }}>
            <button onClick={() => setView('list')} style={{ padding: '11px 24px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Annuler</button>
            <button onClick={handleCreate} style={{ padding: '11px 28px', border: 'none', borderRadius: 10, background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>Créer le devis ↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     PREVIEW / PRINT AREA
  ══════════════════════════════════════════════ */
  if (view === 'preview' && selectedDevis) {
    const d = selectedDevis;
    const ent = d.entreprise || FORM_INIT.entreprise;
    const t = { totalHTBrut: d.totalHTBrut || d.totalHT, remiseMt: d.remiseMt || 0, totalHT: d.totalHT, totalTVA: d.totalTVA, totalTTC: d.totalTTC };
    const signatureLink = d.lienSignature || `${window.location.origin}/devis/${d.id}/signer`;
    const echeancier = d.echeancier || ECHEANCIER_DEFAUT;

    return (
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        {/* Controls bar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => { setView('list'); fetchDevis(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 15, fontWeight: 600 }}>← Retour</button>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Devis {d.numero}</h1>
            {statutBadge(d.statut)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <IconDownload size={15} /> Télécharger PDF
            </button>
            {d.statut === 'brouillon' && (
              <button onClick={() => handleEnvoyer(d.id)} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 10, background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                <IconSend size={15} /> {sending ? 'Envoi…' : 'Envoyer au client'}
              </button>
            )}
            {d.statut === 'signé' && (
              <button onClick={() => navigate('/patron/facturation', { state: { fromDevis: {
                devisRef: d.numero,
                client: d.client?.nom || '',
                adresse: `${d.client?.adresse || ''} ${d.client?.cp || ''} ${d.client?.ville || ''}`.trim(),
                objet: d.objet,
                montantHT: d.totalHT,
                tva: d.totalTVA && d.totalHT ? Math.round((d.totalTVA / d.totalHT) * 100) : 10,
              }}})} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 10, background: '#1A7F43', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                <IconCheck size={15} /> Créer la facture
              </button>
            )}
          </div>
        </div>

        {/* Signature link banner */}
        {(d.statut === 'envoyé' || d.statut === 'signé') && (
          <div className="no-print" style={{ background: d.statut === 'signé' ? '#D1F2E0' : '#FFF3CD', border: `1px solid ${d.statut === 'signé' ? '#34C759' : '#FFC107'}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {d.statut === 'signé' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconCheck size={20} color="#34C759" />
                <div>
                  <div style={{ fontWeight: 700, color: '#1A7F43' }}>Devis signé électroniquement</div>
                  <div style={{ fontSize: 13, color: '#2D6A4F' }}>Par {d.signatureNom} le {formatDate(d.signeLe)}</div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 700, color: '#856404', marginBottom: 4 }}>Lien de signature client</div>
                <div style={{ fontSize: 12, color: '#856404', fontFamily: 'monospace', wordBreak: 'break-all' }}>{signatureLink}</div>
              </div>
            )}
            {d.statut === 'envoyé' && (
              <button onClick={() => copyLink(signatureLink)} style={{ background: '#856404', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {linkCopied ? '✓ Copié' : 'Copier le lien'}
              </button>
            )}
          </div>
        )}

        {/* ══ PRINT AREA ══ */}
        <div id="devis-print-area" ref={printRef} style={{ background: '#fff', borderRadius: 16, padding: '40px 44px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}>

          {/* Header — entreprise + DEVIS number */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, paddingBottom: 24, borderBottom: '3px solid #5B5BD6' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#5B5BD6', marginBottom: 6, letterSpacing: -0.5 }}>{ent.nom}</div>
              <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 2 }}>
                {ent.adresse}{ent.cp || ent.ville ? `, ${ent.cp} ${ent.ville}` : ''}<br />
                Tél : {ent.telephone} — {ent.email}<br />
                SIRET : {ent.siret} — TVA : {ent.tva}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1C1C1E', letterSpacing: -1 }}>DEVIS</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#5B5BD6', marginTop: 4 }}>{d.numero}</div>
              <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 10, lineHeight: 1.8 }}>
                Émis le : <strong>{formatDate(d.creeLe)}</strong><br />
                Valable jusqu'au : <strong>{d.creeLe ? formatDate(new Date(new Date(d.creeLe).getTime() + (d.validiteDays || 30) * 86400000).toISOString()) : '—'}</strong>
              </div>
              {d.statut === 'signé' && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D1F2E0', borderRadius: 8, padding: '4px 10px' }}>
                  <IconCheck size={13} color="#1A7F43" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A7F43' }}>SIGNÉ</span>
                </div>
              )}
            </div>
          </div>

          {/* Client + Chantier */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            <div style={{ background: '#F8F9FA', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Adressé à</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1C1C1E', marginBottom: 4 }}>{d.client?.nom || '—'}</div>
              {d.client?.siret && <div style={{ fontSize: 12, color: '#6E6E73' }}>SIRET : {d.client.siret}</div>}
              {d.client?.adresse && <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>{d.client.adresse}{d.client.cp || d.client.ville ? `, ${d.client.cp || ''} ${d.client.ville || ''}` : ''}</div>}
              {d.client?.email && <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>{d.client.email}</div>}
              {d.client?.telephone && <div style={{ fontSize: 12, color: '#6E6E73' }}>{d.client.telephone}</div>}
            </div>
            <div style={{ background: '#F8F9FA', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Chantier</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1C1E', marginBottom: 4 }}>{d.objet}</div>
              {d.chantier?.adresse && <div style={{ fontSize: 12, color: '#6E6E73' }}>📍 {d.chantier.adresse}{d.chantier.cp ? `, ${d.chantier.cp} ${d.chantier.ville}` : ''}</div>}
              {(d.dateDebut || d.dateFin) && (
                <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>
                  {d.dateDebut && <>Début : {formatDate(d.dateDebut)}</>}
                  {d.dateDebut && d.dateFin && ' → '}
                  {d.dateFin && <>Fin : {formatDate(d.dateFin)}</>}
                </div>
              )}
            </div>
          </div>

          {/* Lines table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#1C1C1E', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Désignation</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', width: 55 }}>Qté</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 55 }}>Unité</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', width: 90 }}>P.U. HT</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', width: 55 }}>Rem.</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', width: 55 }}>TVA</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: 90 }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {(d.lignes || []).map((l, i) => {
                const c = calcLine(l);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F2F2F7', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{l.description}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{l.quantite}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6E6E73' }}>{l.unite}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{Number(l.prixUnitaire).toFixed(2)} €</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: l.remise > 0 ? '#FF3B30' : '#C7C7CC' }}>{l.remise > 0 ? `${l.remise}%` : '—'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#6E6E73' }}>{l.tva}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{c.ht.toFixed(2)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals + Échéancier side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, marginBottom: 28, alignItems: 'start' }}>
            {/* Échéancier */}
            <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Échéancier de paiement</div>
              {echeancier.map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: '#3C3C43' }}>{e.label}</span>
                  <span style={{ fontWeight: 700, color: '#5B5BD6' }}>{formatCurrency((t.totalTTC || 0) * e.pct / 100)} <span style={{ fontWeight: 400, color: '#8E8E93' }}>({e.pct}%)</span></span>
                </div>
              ))}
            </div>

            {/* Totals block */}
            <div style={{ minWidth: 260, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E5EA' }}>
              {t.totalHTBrut && t.remiseMt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', fontSize: 12, color: '#6E6E73', borderBottom: '1px solid #F2F2F7' }}>
                  <span>Total HT brut</span><span>{formatCurrency(t.totalHTBrut)}</span>
                </div>
              )}
              {t.remiseMt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', fontSize: 12, color: '#FF3B30', borderBottom: '1px solid #F2F2F7' }}>
                  <span>Remise</span><span>- {formatCurrency(t.remiseMt)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', background: '#FAFAFA', fontSize: 13, borderBottom: '1px solid #F2F2F7' }}>
                <span>Total HT net</span><span style={{ fontWeight: 600 }}>{formatCurrency(t.totalHT)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', fontSize: 13, color: '#6E6E73', borderBottom: '1px solid #F2F2F7' }}>
                <span>TVA</span><span>{formatCurrency(t.totalTVA)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 14px', background: '#5B5BD6', color: '#fff', fontSize: 16, fontWeight: 800 }}>
                <span>Total TTC</span><span>{formatCurrency(t.totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div style={{ borderTop: '2px solid #F2F2F7', paddingTop: 22, marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Conditions générales</div>
            <pre style={{ fontSize: 11, color: '#6E6E73', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, margin: 0 }}>{d.conditions || CONDITIONS_DEFAULT}</pre>
          </div>

          {/* Assurance mentions */}
          {ent.decennale && (
            <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 11, color: '#6E6E73', lineHeight: 1.8 }}>
              <strong style={{ color: '#3C3C43', display: 'block', marginBottom: 4 }}>Attestations d'assurance</strong>
              Assurance décennale : {ent.decennale}<br />
              {ent.rcpro && <>RC Professionnelle : {ent.rcpro}</>}
            </div>
          )}

          {/* Signature zone */}
          {d.statut === 'signé' ? (
            <div style={{ background: '#D1F2E0', borderRadius: 10, padding: '16px 20px', border: '1px solid #34C759' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <IconCheck size={18} color="#34C759" />
                <span style={{ fontWeight: 700, color: '#1A7F43' }}>Devis accepté et signé électroniquement</span>
              </div>
              <div style={{ fontSize: 13, color: '#2D6A4F' }}>Signataire : <strong>{d.signatureNom}</strong> — Date : <strong>{formatDate(d.signeLe)}</strong></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
              <div style={{ border: '1px solid #C7C7CC', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Signature client</div>
                <div style={{ fontSize: 11, color: '#6E6E73', marginBottom: 4 }}>Lu et approuvé — Bon pour accord</div>
                <div style={{ fontSize: 11, color: '#6E6E73', marginBottom: 4 }}>Date : ___________________</div>
                <div style={{ height: 50 }} />
                <div style={{ fontSize: 11, color: '#6E6E73' }}>Signature et cachet :</div>
              </div>
              <div style={{ border: '1px solid #C7C7CC', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Signature entreprise</div>
                <div style={{ fontSize: 11, color: '#6E6E73', marginBottom: 4 }}>{ent.nom}</div>
                <div style={{ fontSize: 11, color: '#6E6E73', marginBottom: 4 }}>Date : ___________________</div>
                <div style={{ height: 50 }} />
                <div style={{ fontSize: 11, color: '#6E6E73' }}>Signature et cachet :</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #F2F2F7', fontSize: 10, color: '#8E8E93', textAlign: 'center', lineHeight: 1.8 }}>
            {ent.nom} — SIRET {ent.siret} — TVA {ent.tva} — {ent.adresse}, {ent.cp} {ent.ville}<br />
            Ce devis a été établi conformément aux dispositions légales en vigueur. Garantie décennale art. 1792 C. civ. — RC Pro selon loi Spinetta n°78-12.
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Demo data ── */
const DEMO_DEVIS = [
  {
    id: 1, numero: 'DVS-2025-001', statut: 'signé',
    client: { nom: 'M. Leblanc', email: 'leblanc@email.fr', adresse: '24 rue Victor Hugo', cp: '75015', ville: 'Paris' },
    objet: 'Rénovation salle de bain complète', validiteDays: 30,
    totalHT: 3200, totalTVA: 320, totalTTC: 3520, creeLe: '2025-03-01',
    lignes: [{ description: 'Pose carrelage 60×60', quantite: 12, unite: 'm²', prixUnitaire: 65, tva: 10, remise: 0 }, { description: 'Installation douche à l\'italienne', quantite: 1, unite: 'forfait', prixUnitaire: 2420, tva: 10, remise: 0 }],
    echeancier: ECHEANCIER_DEFAUT, conditions: CONDITIONS_DEFAULT,
  },
  {
    id: 2, numero: 'DVS-2025-002', statut: 'envoyé',
    client: { nom: 'SCI Horizon', email: 'contact@sci-horizon.fr', adresse: '5 rue Pasteur', cp: '94000', ville: 'Créteil' },
    objet: 'Ravalement façade + isolation', validiteDays: 45,
    totalHT: 18500, totalTVA: 1850, totalTTC: 20350, creeLe: '2025-03-10',
    lignes: [{ description: 'Ravalement façade enduit projeté', quantite: 220, unite: 'm²', prixUnitaire: 55, tva: 10, remise: 0 }, { description: 'Isolation thermique par l\'extérieur', quantite: 220, unite: 'm²', prixUnitaire: 29, tva: 10, remise: 5 }],
    echeancier: ECHEANCIER_DEFAUT, conditions: CONDITIONS_DEFAULT,
  },
  {
    id: 3, numero: 'DVS-2025-003', statut: 'brouillon',
    client: { nom: 'Mme Dupont', email: 'dupont@email.fr', adresse: '8 av. des Fleurs', cp: '92100', ville: 'Boulogne' },
    objet: 'Rénovation cuisine — dépose et repose complète', validiteDays: 30,
    totalHT: 6800, totalTVA: 680, totalTTC: 7480, creeLe: '2025-03-18',
    lignes: [{ description: 'Dépose ancienne cuisine', quantite: 1, unite: 'forfait', prixUnitaire: 400, tva: 10, remise: 0 }, { description: 'Pose cuisine équipée client fournie', quantite: 1, unite: 'forfait', prixUnitaire: 2600, tva: 10, remise: 0 }, { description: 'Carrelage plan de travail', quantite: 8, unite: 'm²', prixUnitaire: 75, tva: 10, remise: 0 }],
    echeancier: ECHEANCIER_DEFAUT, conditions: CONDITIONS_DEFAULT,
  },
];
