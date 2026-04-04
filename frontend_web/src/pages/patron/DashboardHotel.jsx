import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const H = '#0080FF';
const H_BG = '#E8F4FF';
const H_SOFT = '#DBEAFE';

const CARD_STYLE = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E8E6E1', boxShadow:'0 1px 4px rgba(0,0,0,.06)' };
const SECTION_HDR = { fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN_PRIMARY = { background:H, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const BTN_GHOST = { background:'transparent', color:'#666', border:'1px solid #E5E7EB', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const MODAL_OVERLAY = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const MODAL_BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil',       icon:'\u{1F3E8}', label:'Accueil' },
  { id:'reservations',  icon:'\u{1F4C5}', label:'Réservations' },
  { id:'chambres',      icon:'\u{1F6CF}\uFE0F', label:'Chambres' },
  { id:'checkinout',    icon:'\u{1F6AC}', label:'Check-in/out' },
  { id:'paiements',     icon:'\u{1F4B3}', label:'Paiements' },
  { id:'clients',       icon:'\u{1F465}', label:'Clients' },
  { id:'parametres',    icon:'\u2699\uFE0F', label:'Paramètres' },
  { id:'rapports',      icon:'\u{1F4CA}', label:'Rapports' },
];

const HOTEL_TAB_MAP = { reservations:'reservations', chambres:'chambres', checkinout:'checkinout', paiements:'paiements', clients:'clients', parametres:'parametres', rapports:'rapports' };

const CHAMBRE_STATUS = {
  libre:       { label:'Libre',       bg:'#F0FDF4', border:'#86EFAC', color:'#166534' },
  occupee:     { label:'Occupée',     bg:'#FEF2F2', border:'#FCA5A5', color:'#DC2626' },
  reservee:    { label:'Réservée',    bg:'#EFF6FF', border:'#93C5FD', color:'#1D4ED8' },
  nettoyage:   { label:'Nettoyage',   bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  maintenance: { label:'Maintenance', bg:'#F9FAFB', border:'#E5E7EB', color:'#6B7280' },
  depart:      { label:'Départ',      bg:'#FEF3C7', border:'#FDE047', color:'#D97706' },
};

const CHAMBRES_INIT = [
  { id:1,  num:'101', type:'Double',    etage:1, vue:'Jardin',      tarif:140, statut:'occupee',    propre:true,  client:'Famille Martin',     arrivee:'2026-04-02', depart:'2026-04-05', code:'HOT-1842' },
  { id:2,  num:'102', type:'Double',    etage:1, vue:'Rue',         tarif:120, statut:'libre',      propre:true,  client:'',                   arrivee:'', depart:'', code:'' },
  { id:3,  num:'103', type:'Simple',    etage:1, vue:'Rue',         tarif:90,  statut:'nettoyage',  propre:false, client:'',                   arrivee:'', depart:'', code:'' },
  { id:4,  num:'104', type:'Double',    etage:1, vue:'Jardin',      tarif:140, statut:'depart',     propre:false, client:'Mme Laurent',        arrivee:'2026-04-01', depart:'2026-04-04', code:'HOT-2953' },
  { id:5,  num:'105', type:'Familiale', etage:1, vue:'Jardin',      tarif:190, statut:'libre',      propre:true,  client:'',                   arrivee:'', depart:'', code:'' },
  { id:6,  num:'201', type:'Double',    etage:2, vue:'Mer',         tarif:180, statut:'occupee',    propre:true,  client:'Groupe Leclerc',     arrivee:'2026-04-03', depart:'2026-04-07', code:'HOT-3064' },
  { id:7,  num:'202', type:'Simple',    etage:2, vue:'Rue',         tarif:90,  statut:'libre',      propre:true,  client:'',                   arrivee:'', depart:'', code:'' },
  { id:8,  num:'203', type:'Double',    etage:2, vue:'Mer',         tarif:180, statut:'maintenance',propre:false, client:'',                   arrivee:'', depart:'', code:'' },
  { id:9,  num:'205', type:'Suite',     etage:2, vue:'Mer',         tarif:240, statut:'occupee',    propre:true,  client:'M. Dupont',          arrivee:'2026-04-03', depart:'2026-04-06', code:'HOT-4175' },
  { id:10, num:'210', type:'Suite',     etage:2, vue:'Panoramique', tarif:280, statut:'depart',     propre:false, client:'M. et Mme Chen',     arrivee:'2026-04-01', depart:'2026-04-04', code:'HOT-5286' },
  { id:11, num:'301', type:'Triple',    etage:3, vue:'Mer',         tarif:220, statut:'reservee',   propre:true,  client:'',                   arrivee:'', depart:'', code:'' },
  { id:12, num:'302', type:'Triple',    etage:3, vue:'Mer',         tarif:220, statut:'libre',      propre:true,  client:'',                   arrivee:'', depart:'', code:'' },
];

const RESERVATIONS_INIT = [
  { id:1, client:'Famille Martin',   email:'martin@gmail.com',   telephone:'06 12 34 56 78', chambre:'101', type:'Double',    arrivee:'2026-04-02', depart:'2026-04-05', nuits:3, montant:420,  statut:'en_cours',           personnes:4, code:'HOT-1842', notes:'' },
  { id:2, client:'M. Dupont',        email:'dupont@gmail.com',   telephone:'06 23 45 67 89', chambre:'205', type:'Suite',     arrivee:'2026-04-03', depart:'2026-04-06', nuits:3, montant:720,  statut:'en_cours',           personnes:2, code:'HOT-4175', notes:'Late check-out demandé' },
  { id:3, client:'Mme Garcia',       email:'garcia@gmail.com',   telephone:'06 34 56 78 90', chambre:'103', type:'Simple',    arrivee:'2026-04-04', depart:'2026-04-05', nuits:1, montant:90,   statut:'arrivee_aujourd',    personnes:1, code:'HOT-6397', notes:'' },
  { id:4, client:'Groupe Leclerc',   email:'leclerc@gmail.com',  telephone:'06 45 67 89 01', chambre:'201', type:'Double',    arrivee:'2026-04-03', depart:'2026-04-07', nuits:4, montant:720,  statut:'en_cours',           personnes:3, code:'HOT-3064', notes:'Petit-déjeuner inclus' },
  { id:5, client:'Mme Laurent',      email:'laurent@gmail.com',  telephone:'06 56 78 90 12', chambre:'104', type:'Double',    arrivee:'2026-04-01', depart:'2026-04-04', nuits:3, montant:420,  statut:'depart_aujourd',     personnes:2, code:'HOT-2953', notes:'' },
  { id:6, client:'M. et Mme Chen',   email:'chen@gmail.com',     telephone:'06 67 89 01 23', chambre:'210', type:'Suite',     arrivee:'2026-04-01', depart:'2026-04-04', nuits:3, montant:840,  statut:'depart_aujourd',     personnes:2, code:'HOT-5286', notes:'VIP' },
  { id:7, client:'Sophie Garnier',   email:'garnier@gmail.com',  telephone:'06 78 90 12 34', chambre:'301', type:'Triple',    arrivee:'2026-04-05', depart:'2026-04-08', nuits:3, montant:660,  statut:'a_venir',            personnes:3, code:'HOT-7408', notes:'Anniversaire de mariage' },
  { id:8, client:'Pierre Fontaine',  email:'fontaine@gmail.com', telephone:'07 89 01 23 45', chambre:'302', type:'Triple',    arrivee:'2026-04-06', depart:'2026-04-09', nuits:3, montant:660,  statut:'a_venir',            personnes:4, code:'HOT-8519', notes:'Allergie arachides' },
];

const TRANSACTIONS_INIT = [
  { id:'T001', date:'2026-04-04', client:'Mme Laurent',      chambre:'104', montant:420,  statut:'bloque',  type:'paiement', facture:false },
  { id:'T002', date:'2026-04-04', client:'M. et Mme Chen',   chambre:'210', montant:840,  statut:'bloque',  type:'paiement', facture:false },
  { id:'T003', date:'2026-04-03', client:'Famille Martin',   chambre:'101', montant:420,  statut:'bloque',  type:'paiement', facture:false },
  { id:'T004', date:'2026-04-02', client:'Famille Rousseau', chambre:'105', montant:380,  statut:'libere',  type:'paiement', facture:true },
  { id:'T005', date:'2026-04-01', client:'Jean Moreau',      chambre:'202', montant:270,  statut:'libere',  type:'paiement', facture:true },
  { id:'VIRT1',date:'2026-03-31', client:'',                 chambre:'',    montant:2400, statut:'vire',    type:'virement', facture:false },
];

const CLIENTS_INIT = [
  { id:1, nom:'Famille Martin',   email:'martin@gmail.com',   telephone:'06 12 34 56 78', sejours:5,  dernierSejour:'2026-04-02', depense:2100, fidelite:'fidele',   preferences:'Chambre calme, vue jardin' },
  { id:2, nom:'M. Dupont',        email:'dupont@gmail.com',   telephone:'06 23 45 67 89', sejours:12, dernierSejour:'2026-04-03', depense:8640, fidelite:'vip',      preferences:'Suite vue mer, champagne à l\'arrivée' },
  { id:3, nom:'Sophie Garnier',   email:'garnier@gmail.com',  telephone:'06 78 90 12 34', sejours:2,  dernierSejour:'2026-03-15', depense:440,  fidelite:'nouveau',  preferences:'' },
  { id:4, nom:'M. et Mme Chen',   email:'chen@gmail.com',     telephone:'06 67 89 01 23', sejours:8,  dernierSejour:'2026-04-01', depense:5600, fidelite:'vip',      preferences:'Late check-out, oreillers hypoallergéniques' },
  { id:5, nom:'Mme Laurent',      email:'laurent@gmail.com',  telephone:'06 56 78 90 12', sejours:3,  dernierSejour:'2026-04-01', depense:1260, fidelite:'regulier', preferences:'Étage bas si possible' },
];

const REVENUS_7J = [
  { jour:'Lun', montant:1480 }, { jour:'Mar', montant:1820 }, { jour:'Mer', montant:1390 },
  { jour:'Jeu', montant:2110 }, { jour:'Ven', montant:2850 }, { jour:'Sam', montant:3240 },
  { jour:'Dim', montant:1940 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function genCode() {
  return 'HOT-' + Math.floor(1000 + Math.random() * 9000);
}

function FakeQRCode({ code, size = 110 }) {
  const seed = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: 121 }, (_, i) => {
    const v = (seed * (i + 1) * 2654435761) >>> 0;
    return v % 3 !== 0;
  });
  const grid = cells.map((v, i) => {
    const row = Math.floor(i / 11), col = i % 11;
    if (row === 0 || row === 10 || col === 0 || col === 10) return true;
    if ((row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3)) return true;
    return v;
  });
  const cellSize = size / 11;
  return (
    <div style={{ display:'inline-grid', gridTemplateColumns:`repeat(11,${cellSize}px)`, gap:0, border:'3px solid #000', borderRadius:4, background:'#fff', padding:4 }}>
      {grid.map((v, i) => <div key={i} style={{ width:cellSize, height:cellSize, background:v ? '#000' : '#fff' }} />)}
    </div>
  );
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD_STYLE, flex:1, minWidth:140 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:accent || '#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#888', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function ChambreBadge({ statut }) {
  const s = CHAMBRE_STATUS[statut] || CHAMBRE_STATUS.libre;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

function FideliteBadge({ fidelite }) {
  const map = {
    vip:      { bg:'#FFF7ED', color:'#C2410C', label:'VIP' },
    fidele:   { bg:'#F0FDF4', color:'#166534', label:'Fidèle' },
    regulier: { bg:'#EFF6FF', color:'#1D4ED8', label:'Régulier' },
    nouveau:  { bg:'#F9FAFB', color:'#6B7280', label:'Nouveau' },
  };
  const s = map[fidelite] || map.nouveau;
  return <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{s.label}</span>;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardHotel() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const onglet = searchParams.get('onglet');
  const [tab, setTab] = useState(HOTEL_TAB_MAP[onglet] || 'accueil');

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && HOTEL_TAB_MAP[o]) setTab(HOTEL_TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const [chambres, setChambres] = useState(CHAMBRES_INIT);
  const [reservations, setReservations] = useState(RESERVATIONS_INIT);
  const [transactions, setTransactions] = useState(TRANSACTIONS_INIT);
  const [clients] = useState(CLIENTS_INIT);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals
  const [modalQR, setModalQR]             = useState(null);  // reservation object
  const [modalCheckout, setModalCheckout]  = useState(null);  // reservation object
  const [modalFacture, setModalFacture]    = useState(null);  // { reservation, numero }
  const [modalResa, setModalResa]          = useState(false);
  const [modalWalkin, setModalWalkin]      = useState(null);  // 'choose' or chambre id
  const [modalVirement, setModalVirement]  = useState(false);
  const [virementDone, setVirementDone]    = useState(false);
  const [modalClient, setModalClient]      = useState(null);  // client object

  // QR modal
  const [qrTab, setQrTab]     = useState('qr');
  const [qrInput, setQrInput] = useState('');

  // Forms
  const [resaForm, setResaForm] = useState({ client:'', email:'', telephone:'', personnes:2, arrivee:'2026-04-05', depart:'2026-04-07', chambre:'', notes:'' });
  const [walkinForm, setWalkinForm] = useState({ client:'', email:'', personnes:1, nuits:1 });
  const [payFilter, setPayFilter] = useState('tous');
  const [clientSearch, setClientSearch] = useState('');
  const [virementAmount, setVirementAmount] = useState('');
  const [hotelSettings, setHotelSettings] = useState({
    nom: 'Le Grand Bleu', adresse: '45 Boulevard de la Croisette, 06400 Cannes', tel: '04 93 38 44 55', email: 'contact@legrandbleu.fr',
    checkinHeure: '15:00', checkoutHeure: '11:00',
    types: [
      { type:'Simple', tarif:90 }, { type:'Double', tarif:140 }, { type:'Triple', tarif:220 },
      { type:'Suite', tarif:260 }, { type:'Familiale', tarif:190 },
    ],
    notifResa: true, notifCheckin: true, notifCheckout: true, notifPaiement: true,
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  const occupees   = chambres.filter(c => c.statut === 'occupee').length;
  const libres     = chambres.filter(c => c.statut === 'libre' && c.propre).length;
  const arrivees   = reservations.filter(r => r.statut === 'arrivee_aujourd').length;
  const departs    = reservations.filter(r => r.statut === 'depart_aujourd').length;
  const tauxOccup  = Math.round(occupees / chambres.length * 100);
  const totalBloque = transactions.filter(t => t.statut === 'bloque').reduce((s, t) => s + t.montant, 0);
  const maxRevenu  = Math.max(...REVENUS_7J.map(r => r.montant));

  const filteredTransactions = transactions.filter(t =>
    payFilter === 'tous'      ? true :
    payFilter === 'bloques'   ? t.statut === 'bloque' :
    payFilter === 'liberes'   ? t.statut === 'libere' :
    t.type === 'virement'
  );
  const filteredClients = clients.filter(c =>
    c.nom.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // ── Mutations ───────────────────────────────────────────────────────────
  const mutChambre = (id, changes) =>
    setChambres(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c));

  const marquerPropre = (id) => {
    setChambres(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newStatut = (c.statut === 'depart' || c.statut === 'nettoyage') ? 'libre' : c.statut;
      return { ...c, propre:true, statut:newStatut, client:'', arrivee:'', depart:'', code:'' };
    }));
    showToast('Chambre marquée propre et libre');
  };

  const openQRModal = (resa) => { setModalQR(resa); setQrTab('qr'); setQrInput(''); };

  const confirmCheckin = (resa) => {
    if (qrTab === 'code' && qrInput.toUpperCase() !== resa.code) {
      showToast('Code incorrect', 'error'); return;
    }
    setReservations(prev => prev.map(r => r.id === resa.id ? { ...r, statut:'en_cours' } : r));
    const ch = chambres.find(c => c.num === resa.chambre);
    if (ch) mutChambre(ch.id, { statut:'occupee', client:resa.client, arrivee:resa.arrivee, depart:resa.depart, code:resa.code });
    // create blocked payment
    const newT = { id:'T'+Date.now(), date:'2026-04-04', client:resa.client, chambre:resa.chambre, montant:resa.montant, statut:'bloque', type:'paiement', facture:false };
    setTransactions(prev => [newT, ...prev]);
    setModalQR(null);
    showToast(`Check-in ${resa.client} — Chambre ${resa.chambre} — Paiement de ${resa.montant}€ bloqué`);
  };

  const confirmCheckout = (resa) => {
    const num = genCode();
    setReservations(prev => prev.map(r => r.id === resa.id ? { ...r, statut:'termine' } : r));
    const ch = chambres.find(c => c.num === resa.chambre);
    if (ch) mutChambre(ch.id, { statut:'nettoyage', propre:false });
    setTransactions(prev =>
      prev.map(t => t.client === resa.client && t.statut === 'bloque'
        ? { ...t, statut:'libere', facture:true } : t)
    );
    setModalCheckout(null);
    setModalFacture({ reservation:resa, numero:num });
    showToast(`Check-out ${resa.client} — Facture envoyée à ${resa.email}`);
  };

  // ── Walk-in ───────────────────────────────────────────────────────────
  const confirmerWalkin = (chambreId) => {
    const ch = chambres.find(c => c.id === chambreId);
    if (!ch) return;
    const code = genCode();
    const nuits = Number(walkinForm.nuits) || 1;
    const montant = ch.tarif * nuits;
    const resa = {
      id: Date.now(), client: walkinForm.client || 'Client walk-in', email: walkinForm.email || '', telephone:'',
      chambre: ch.num, type: ch.type, arrivee:'2026-04-04', depart:'2026-04-0'+(4+nuits),
      nuits, montant, statut:'en_cours', personnes: Number(walkinForm.personnes) || 1, code, notes:'Walk-in'
    };
    setReservations(prev => [...prev, resa]);
    mutChambre(chambreId, { statut:'occupee', client:resa.client, arrivee:resa.arrivee, depart:resa.depart, code });
    const newT = { id:'T'+Date.now(), date:'2026-04-04', client:resa.client, chambre:ch.num, montant, statut:'bloque', type:'paiement', facture:false };
    setTransactions(prev => [newT, ...prev]);
    setModalWalkin(null);
    setWalkinForm({ client:'', email:'', personnes:1, nuits:1 });
    showToast(`Walk-in ${resa.client} — Chambre ${ch.num} (${code})`);
  };

  // ── Réservation ───────────────────────────────────────────────────────
  const submitResa = () => {
    if (!resaForm.client || !resaForm.arrivee || !resaForm.depart) return;
    const code = genCode();
    const d1 = new Date(resaForm.arrivee), d2 = new Date(resaForm.depart);
    const nuits = Math.max(1, Math.round((d2 - d1) / 86400000));
    const ch = chambres.find(c => c.num === resaForm.chambre);
    const montant = ch ? ch.tarif * nuits : 140 * nuits;
    const newR = {
      id:Date.now(), ...resaForm, personnes:Number(resaForm.personnes), nuits, montant,
      type: ch ? ch.type : 'Double', statut:'a_venir', code
    };
    setReservations(prev => [...prev, newR]);
    if (ch) mutChambre(ch.id, { statut:'reservee' });
    setModalResa(false);
    setResaForm({ client:'', email:'', telephone:'', personnes:2, arrivee:'2026-04-05', depart:'2026-04-07', chambre:'', notes:'' });
    showToast(`Réservation confirmée — Code ${code}`);
  };

  // ── Virement ──────────────────────────────────────────────────────────
  const submitVirement = () => {
    if (!virementAmount || isNaN(virementAmount)) return;
    const v = { id:'VIRT'+Date.now(), date:'2026-04-04', client:'', chambre:'', montant:Number(virementAmount), statut:'vire', type:'virement', facture:false };
    setTransactions(prev => [v, ...prev]);
    setVirementDone(true);
    setTimeout(() => { setModalVirement(false); setVirementDone(false); setVirementAmount(''); }, 2500);
    showToast(`Virement de ${virementAmount}€ initié`);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ padding:'24px 28px', background:H_BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1C1C1E' }}>{'\u{1F3E8}'} Freample Stay — Dashboard Hôtel</div>
          <div style={{ fontSize:14, color:'#888', marginTop:2 }}>Réservations · Chambres · Paiements en temps réel</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setModalWalkin('choose')} style={{ ...BTN_PRIMARY, display:'flex', alignItems:'center', gap:6 }}>+ Walk-in</button>
          <button onClick={() => setModalResa(true)} style={BTN_GHOST}>{'\u{1F4C5}'} Nouvelle réservation</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E8E6E1', boxShadow:'0 1px 4px rgba(0,0,0,.06)', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer',
            fontWeight: tab === t.id ? 700 : 500,
            background: tab === t.id ? H : 'transparent',
            color: tab === t.id ? '#fff' : '#666',
            fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ── TAB: Accueil ── */}
      {tab === 'accueil' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
            <KpiCard label="Taux d'occupation" value={`${tauxOccup}%`}          sub={`${occupees}/${chambres.length} chambres`} accent={H} />
            <KpiCard label="Arrivées aujourd'hui" value={arrivees}              sub="Check-in en attente"       accent="#7C3AED" />
            <KpiCard label="Départs aujourd'hui" value={departs}                sub="Check-out en attente"      accent="#D97706" />
            <KpiCard label="Chambres disponibles" value={libres}                sub="Propres et libres"         accent="#059669" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
            {/* Mini floor plan */}
            <div style={CARD_STYLE}>
              <div style={{ ...SECTION_HDR, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                Plan des étages
                <button onClick={() => setTab('chambres')} style={{ fontSize:11, color:H, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Voir tout {'\u2192'}</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
                {chambres.map(c => {
                  const s = CHAMBRE_STATUS[c.statut];
                  return (
                    <div key={c.id} onClick={() => setTab('chambres')} style={{ background:s.bg, border:`2px solid ${s.border}`, borderRadius:10, padding:'10px 6px', textAlign:'center', cursor:'pointer' }}>
                      <div style={{ fontWeight:800, fontSize:14, color:s.color }}>{c.num}</div>
                      <div style={{ fontSize:9, color:s.color, fontWeight:600 }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:12 }}>
                {Object.entries(CHAMBRE_STATUS).map(([k, v]) => (
                  <div key={k} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#888' }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:v.color, display:'inline-block' }} />
                    {v.label} ({chambres.filter(c => c.statut === k).length})
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Activité récente</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { icon:'\u{1F535}', text:'Famille Martin — séjour en cours (Chambre 101)', time:'14:00' },
                  { icon:'\u{1F7E0}', text:'Mme Laurent — check-out prévu aujourd\'hui (Ch. 104)', time:'10:30' },
                  { icon:'\u{1F7E3}', text:'M. et Mme Chen — check-out prévu (Ch. 210)', time:'10:00' },
                  { icon:'\u{1F4B3}', text:'Famille Rousseau — paiement libéré 380€', time:'09:15' },
                  { icon:'\u{1F4C5}', text:'Sophie Garnier — réservation 05/04 confirmée', time:'08:30' },
                ].map((a, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ fontSize:16 }}>{a.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'#1C1C1E' }}>{a.text}</div>
                      <div style={{ fontSize:11, color:'#999' }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active rooms */}
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Chambres actives</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {chambres.filter(c => c.statut !== 'libre').map(c => {
                const s = CHAMBRE_STATUS[c.statut];
                return (
                  <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'#FAFAFA', borderRadius:10, border:'1px solid #F0F0F0' }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:s.bg, border:`2px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:s.color }}>{c.num}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{c.client || '\u2014'}</div>
                      <div style={{ fontSize:12, color:'#888' }}>{c.type} · Vue {c.vue} · {c.tarif}€/nuit</div>
                    </div>
                    <ChambreBadge statut={c.statut} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Réservations ── */}
      {tab === 'reservations' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontSize:16, fontWeight:700 }}>Réservations</div>
            <button onClick={() => setModalResa(true)} style={BTN_PRIMARY}>+ Nouvelle réservation</button>
          </div>
          {['arrivee_aujourd','depart_aujourd','en_cours','a_venir'].map(grp => {
            const grpLabel = { arrivee_aujourd:"Arrivées aujourd'hui", depart_aujourd:"Départs aujourd'hui", en_cours:'Séjours en cours', a_venir:'À venir' }[grp];
            const grpResas = reservations.filter(r => r.statut === grp);
            if (!grpResas.length) return null;
            return (
              <div key={grp} style={{ marginBottom:24 }}>
                <div style={SECTION_HDR}>{grpLabel} ({grpResas.length})</div>
                <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
                  {grpResas.map((r, i) => (
                    <div key={r.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < grpResas.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                      <div style={{ fontWeight:800, fontSize:15, color:H, minWidth:48 }}>Ch.{r.chambre}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{r.client}</div>
                        <div style={{ fontSize:12, color:'#888' }}>{r.personnes} pers. · {r.nuits} nuit{r.nuits > 1 ? 's' : ''} · {r.montant}€ · {r.code}</div>
                        {r.notes && <div style={{ fontSize:12, color:'#7C3AED', marginTop:2 }}>{r.notes}</div>}
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {r.statut === 'arrivee_aujourd' && (
                          <button onClick={() => openQRModal(r)} style={{ ...BTN_PRIMARY, padding:'6px 12px', fontSize:'0.8rem' }}>Check-in</button>
                        )}
                        {r.statut === 'depart_aujourd' && (
                          <button onClick={() => setModalCheckout(r)} style={{ ...BTN_PRIMARY, padding:'6px 12px', fontSize:'0.8rem', background:'#D97706' }}>Check-out</button>
                        )}
                        {r.statut === 'en_cours' && <span style={{ fontSize:12, color:'#059669', fontWeight:700 }}>{'\u2713'} En séjour</span>}
                        {r.statut === 'a_venir' && (
                          <button onClick={() => setReservations(prev => prev.filter(x => x.id !== r.id))} style={{ ...BTN_GHOST, padding:'6px 12px', fontSize:'0.8rem', color:'#DC2626', borderColor:'#FEE2E2' }}>Annuler</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: Chambres ── */}
      {tab === 'chambres' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontSize:16, fontWeight:700 }}>Gestion des chambres</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {Object.entries(CHAMBRE_STATUS).map(([k, v]) => (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#555' }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:v.color, display:'inline-block' }} />
                  {v.label}
                </div>
              ))}
            </div>
          </div>

          {[1, 2, 3].map(etage => (
            <div key={etage} style={{ marginBottom:28 }}>
              <div style={SECTION_HDR}>Étage {etage}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
                {chambres.filter(c => c.etage === etage).map(c => {
                  const s = CHAMBRE_STATUS[c.statut];
                  return (
                    <div key={c.id} style={{ background:'#fff', border:`2px solid ${s.border}`, borderRadius:16, padding:18, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:20, fontWeight:800, color:s.color }}>#{c.num}</div>
                          <div style={{ fontSize:12, color:'#888' }}>{c.type} · Vue {c.vue}</div>
                        </div>
                        <ChambreBadge statut={c.statut} />
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#1C1C1E', marginBottom:8 }}>{c.tarif}€ / nuit</div>
                      {c.client && (
                        <div style={{ fontSize:12, color:'#888', marginBottom:8, background:'#F9F9FB', borderRadius:6, padding:'5px 8px' }}>
                          {c.client} {c.depart ? `(\u2192 ${new Date(c.depart).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })})` : ''}
                        </div>
                      )}
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {c.statut === 'libre' && (
                          <button onClick={() => { setModalWalkin(c.id); setWalkinForm({ client:'', email:'', personnes:1, nuits:1 }); }} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem' }}>+ Walk-in</button>
                        )}
                        {c.statut === 'reservee' && (() => {
                          const resa = reservations.find(r => r.chambre === c.num && r.statut === 'arrivee_aujourd');
                          return resa ? <button onClick={() => openQRModal(resa)} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem' }}>{'\u2713'} Check-in</button> : <span style={{ fontSize:12, color:'#1D4ED8' }}>Réservée</span>;
                        })()}
                        {c.statut === 'occupee' && (() => {
                          const resa = reservations.find(r => r.chambre === c.num && ['depart_aujourd','en_cours'].includes(r.statut));
                          return resa && resa.statut === 'depart_aujourd' ? <button onClick={() => setModalCheckout(resa)} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem', background:'#D97706' }}>Check-out</button> : <span style={{ fontSize:12, color:'#DC2626', fontWeight:600 }}>En séjour</span>;
                        })()}
                        {c.statut === 'depart' && (
                          <button onClick={() => {
                            const resa = reservations.find(r => r.chambre === c.num && r.statut === 'depart_aujourd');
                            if (resa) setModalCheckout(resa);
                          }} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem', background:'#D97706' }}>Check-out</button>
                        )}
                        {(c.statut === 'nettoyage' || (c.statut === 'depart' && !c.propre)) && (
                          <button onClick={() => marquerPropre(c.id)} style={{ ...BTN_GHOST, padding:'8px 14px', fontSize:'0.8rem', color:'#C2410C', borderColor:'#FED7AA' }}>{'\u{1F9F9}'} Marquer propre</button>
                        )}
                        {c.statut === 'maintenance' && (
                          <button onClick={() => mutChambre(c.id, { statut:'libre', propre:true })} style={{ ...BTN_GHOST, padding:'8px 14px', fontSize:'0.8rem' }}>{'\u2713'} Fin maintenance</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Check-in/out ── */}
      {tab === 'checkinout' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {/* Check-in column */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:18 }}>{'\u{1F6EC}'}</span>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0, color:'#1C1C1E' }}>Check-in ({arrivees})</h2>
              </div>
              {reservations.filter(r => r.statut === 'arrivee_aujourd').length === 0 && (
                <div style={{ ...CARD_STYLE, textAlign:'center', color:'#888', padding:40 }}>Aucune arrivée en attente</div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {reservations.filter(r => r.statut === 'arrivee_aujourd').map(r => (
                  <div key={r.id} style={{ background:'#fff', border:`1.5px solid ${H}40`, borderRadius:14, padding:'16px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1C1C1E' }}>{r.client}</div>
                        <div style={{ fontSize:12, color:'#888', marginTop:3 }}>Chambre {r.chambre} — {r.type} · {r.personnes} pers.</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:14, fontWeight:800, color:H }}>{r.montant}€</div>
                        <div style={{ fontSize:11, color:'#888' }}>{r.nuits} nuit{r.nuits > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12, fontSize:11, color:'#888' }}>
                      <div><strong>Arrivée :</strong> {new Date(r.arrivee).toLocaleDateString('fr-FR')}</div>
                      <div><strong>Départ :</strong> {new Date(r.depart).toLocaleDateString('fr-FR')}</div>
                    </div>
                    {r.notes && <div style={{ fontSize:12, color:'#7C3AED', marginBottom:10 }}>{r.notes}</div>}
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => openQRModal(r)} style={{ flex:1, ...BTN_PRIMARY, padding:'9px' }}>{'\u2713'} Effectuer le check-in</button>
                      <button style={{ ...BTN_GHOST, padding:'9px 14px' }}>Détails</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-out column */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:18 }}>{'\u{1F6EB}'}</span>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0, color:'#1C1C1E' }}>Check-out ({departs})</h2>
              </div>
              {reservations.filter(r => r.statut === 'depart_aujourd').length === 0 && (
                <div style={{ ...CARD_STYLE, textAlign:'center', color:'#888', padding:40 }}>Aucun départ en attente</div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {reservations.filter(r => r.statut === 'depart_aujourd').map(r => (
                  <div key={r.id} style={{ background:'#fff', border:'1.5px solid #D9770640', borderRadius:14, padding:'16px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1C1C1E' }}>{r.client}</div>
                        <div style={{ fontSize:12, color:'#888', marginTop:3 }}>Chambre {r.chambre} — {r.type} · {r.personnes} pers.</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:14, fontWeight:800, color:'#D97706' }}>{r.montant}€</div>
                        <div style={{ fontSize:11, color:'#888' }}>{r.nuits} nuit{r.nuits > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12, fontSize:11, color:'#888' }}>
                      <div><strong>Arrivée :</strong> {new Date(r.arrivee).toLocaleDateString('fr-FR')}</div>
                      <div><strong>Départ :</strong> {new Date(r.depart).toLocaleDateString('fr-FR')}</div>
                    </div>
                    {r.notes && <div style={{ fontSize:12, color:'#7C3AED', marginBottom:10 }}>{r.notes}</div>}
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => setModalCheckout(r)} style={{ flex:1, ...BTN_PRIMARY, padding:'9px', background:'#D97706' }}>{'\u2713'} Effectuer le check-out</button>
                      <button style={{ ...BTN_GHOST, padding:'9px 14px' }}>Facture</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Paiements ── */}
      {tab === 'paiements' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
            <KpiCard label="Bloqués"              value={`${totalBloque}€`} sub="En attente de libération" accent="#D97706" />
            <KpiCard label="Libérés aujourd'hui"   value={`${transactions.filter(t => t.date === '2026-04-04' && t.statut === 'libere').reduce((s, t) => s + t.montant, 0)}€`} sub="Paiements validés" accent="#059669" />
            <KpiCard label="Total viré"            value={`${transactions.filter(t => t.type === 'virement').reduce((s, t) => s + t.montant, 0)}€`} sub="Virements effectués" accent="#2563EB" />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:8 }}>
              {[['tous','Tous'],['bloques','Bloqués'],['liberes','Libérés'],['virements','Virements']].map(([v, l]) => (
                <button key={v} onClick={() => setPayFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: payFilter === v ? 700 : 500, background: payFilter === v ? H : '#F3F4F6', color: payFilter === v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setModalVirement(true); setVirementDone(false); setVirementAmount(''); }} style={BTN_PRIMARY}>{'\u{1F4B8}'} Demander un virement</button>
          </div>
          <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
            {filteredTransactions.map((t, i) => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredTransactions.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{t.type === 'virement' ? 'Virement vers votre compte' : t.client}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{t.date}{t.chambre ? ` · Ch. ${t.chambre}` : ''} · {t.id}</div>
                </div>
                <div style={{ fontWeight:800, fontSize:16, color: t.type === 'virement' ? '#2563EB' : t.statut === 'libere' ? '#059669' : t.statut === 'bloque' ? '#D97706' : '#1C1C1E' }}>{t.type === 'virement' ? '\u2212' : ''}{t.montant}€</div>
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: t.statut === 'libere' || t.statut === 'vire' ? '#D1FAE5' : '#FEF3C7', color: t.statut === 'libere' || t.statut === 'vire' ? '#065F46' : '#D97706' }}>
                  {t.statut === 'libere' ? '\u2713 Libéré' : t.statut === 'bloque' ? '\u23F3 Bloqué' : '\u2713 Viré'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Clients ── */}
      {tab === 'clients' && (
        <div>
          <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Rechercher un client..." style={{ width:'100%', maxWidth:360, padding:'10px 16px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', marginBottom:20, boxSizing:'border-box' }} />
          <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
            {filteredClients.map((c, i) => (
              <div key={c.id} onClick={() => setModalClient(c)} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredClients.length - 1 ? '1px solid #F0F0F0' : 'none', cursor:'pointer' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:H_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:H, fontSize:16 }}>{c.nom[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{c.nom}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{c.email} · {c.sejours} séjour{c.sejours > 1 ? 's' : ''}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:800, color:H, fontSize:14 }}>{c.depense}€</div>
                  <FideliteBadge fidelite={c.fidelite} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Paramètres ── */}
      {tab === 'parametres' && (
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1C1C1E', marginBottom:20 }}>Paramètres de l'hôtel</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Hotel info */}
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Informations</div>
              {[{label:'Nom de l\'hôtel',key:'nom'},{label:'Adresse',key:'adresse'},{label:'Téléphone',key:'tel'},{label:'Email',key:'email'}].map(f => (
                <div key={f.key} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>{f.label}</label>
                  <input value={hotelSettings[f.key]} onChange={e => setHotelSettings(p => ({ ...p, [f.key]:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                </div>
              ))}
            </div>

            {/* Check-in/out hours + room types */}
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Horaires check-in / check-out</div>
              <div style={{ display:'flex', gap:12, marginBottom:20 }}>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Check-in à partir de</label>
                  <input type="time" value={hotelSettings.checkinHeure} onChange={e => setHotelSettings(p => ({ ...p, checkinHeure:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Check-out avant</label>
                  <input type="time" value={hotelSettings.checkoutHeure} onChange={e => setHotelSettings(p => ({ ...p, checkoutHeure:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={SECTION_HDR}>Types de chambre & tarifs</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {hotelSettings.types.map((t, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#FAFAFA', borderRadius:8 }}>
                    <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{t.type}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <input type="number" value={t.tarif} onChange={e => setHotelSettings(p => {
                        const types = [...p.types]; types[i] = { ...types[i], tarif:Number(e.target.value) }; return { ...p, types };
                      })} style={{ width:70, padding:'6px 10px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, textAlign:'right', fontFamily:'inherit', outline:'none' }} />
                      <span style={{ fontSize:12, color:'#888' }}>€/nuit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ ...CARD_STYLE, marginTop:20 }}>
            <div style={SECTION_HDR}>Notifications</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                {key:'notifResa',     label:'Nouvelle réservation', desc:'Être notifié à chaque nouvelle réservation'},
                {key:'notifCheckin',  label:'Check-in effectué',    desc:'Notification quand un client arrive'},
                {key:'notifCheckout', label:'Check-out effectué',   desc:'Notification quand un client part'},
                {key:'notifPaiement', label:'Paiement reçu',        desc:'Alerte quand un paiement est libéré'},
              ].map(n => (
                <div key={n.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#FAFAFA', borderRadius:10 }}>
                  <div><div style={{ fontSize:14, fontWeight:600 }}>{n.label}</div><div style={{ fontSize:12, color:'#888', marginTop:2 }}>{n.desc}</div></div>
                  <button onClick={() => setHotelSettings(p => ({ ...p, [n.key]:!p[n.key] }))} style={{ width:48, height:26, borderRadius:13, border:'none', cursor:'pointer', background:hotelSettings[n.key] ? H : '#D1D5DB', position:'relative', transition:'background .2s' }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left:hotelSettings[n.key] ? 24 : 2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => showToast('Paramètres sauvegardés')} style={{ ...BTN_PRIMARY, marginTop:20, padding:'12px 24px' }}>{'\u{1F4BE}'} Sauvegarder les paramètres</button>
        </div>
      )}

      {/* ── TAB: Rapports ── */}
      {tab === 'rapports' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
            <KpiCard label="Nuitées ce mois"       value="428"              sub="+18% vs mois dernier"      accent={H} />
            <KpiCard label="RevPAR"                 value="145€"             sub="Revenu par chambre dispo"  accent="#7C3AED" />
            <KpiCard label="Durée moy. séjour"     value="2.8 nuits"        sub="Moyenne globale"           accent="#059669" />
            <KpiCard label="Taux occupation"        value={`${tauxOccup}%`}  sub="En ce moment"              accent="#2563EB" />
          </div>
          <div style={{ ...CARD_STYLE, marginBottom:24 }}>
            <div style={SECTION_HDR}>Revenus des 7 derniers jours</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
              {REVENUS_7J.map(r => (
                <div key={r.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:H }}>{r.montant}€</div>
                  <div style={{ width:'100%', background:H, borderRadius:'6px 6px 0 0', height:`${Math.round((r.montant / maxRevenu) * 120)}px` }} />
                  <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>{r.jour}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Top types de chambre</div>
              {[{nom:'Suite',n:42,rev:'11 760€'},{nom:'Double',n:38,rev:'5 320€'},{nom:'Triple',n:28,rev:'6 160€'},{nom:'Familiale',n:22,rev:'4 180€'},{nom:'Simple',n:15,rev:'1 350€'}].map((p, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:13 }}>{i + 1}. {p.nom}</span>
                  <div style={{ display:'flex', gap:12 }}>
                    <span style={{ fontSize:12, color:'#888' }}>{p.n} nuitées</span>
                    <span style={{ fontWeight:700, color:H, fontSize:13 }}>{p.rev}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Sources de réservation</div>
              {[
                {canal:'Direct / Téléphone', pct:35, color:'#059669'},
                {canal:'Booking.com',         pct:28, color:'#003580'},
                {canal:'Site web',            pct:22, color:H},
                {canal:'Airbnb',              pct:15, color:'#FF5A5F'},
              ].map((c, i) => (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                    <span>{c.canal}</span><span style={{ fontWeight:700 }}>{c.pct}%</span>
                  </div>
                  <div style={{ background:'#F3F4F6', borderRadius:4, height:6 }}>
                    <div style={{ background:c.color, borderRadius:4, height:6, width:`${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ MODALS ══════════════════════════ */}

      {/* Modal: QR / Check-in */}
      {modalQR && (
        <div style={MODAL_OVERLAY} onClick={() => setModalQR(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Check-in client</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>Chambre {modalQR.chambre} · {modalQR.client}</div>
            <div style={{ display:'flex', background:'#F3F4F6', borderRadius:10, marginBottom:24, overflow:'hidden' }}>
              {['qr','code'].map(t => (
                <button key={t} onClick={() => setQrTab(t)} style={{ flex:1, padding:'10px', border:'none', cursor:'pointer', fontWeight:700, background: qrTab === t ? H : 'transparent', color: qrTab === t ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.875rem' }}>{t === 'qr' ? 'QR Code' : 'Saisir le code'}</button>
              ))}
            </div>
            {qrTab === 'qr' ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, marginBottom:24 }}>
                <FakeQRCode code={modalQR.code || 'HOT-0000'} size={140} />
                <div style={{ fontSize:22, fontWeight:800, letterSpacing:4 }}>{modalQR.code}</div>
                <div style={{ fontSize:13, color:'#888', textAlign:'center' }}>Le client présente ce QR code ou ce code à la réception</div>
              </div>
            ) : (
              <div style={{ marginBottom:24 }}>
                <input value={qrInput} onChange={e => setQrInput(e.target.value)} placeholder={`Code (ex: ${modalQR.code})`} style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:16, textAlign:'center', letterSpacing:4, fontWeight:700, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            )}
            <div style={{ background:H_BG, borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:H, fontWeight:600, border:`1px solid ${H}30` }}>
              {'\u{1F4B3}'} Paiement de {modalQR.montant}€ sera bloqué sur la plateforme au check-in
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => confirmCheckin(modalQR)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>{'\u2713'} Confirmer le check-in</button>
              <button onClick={() => setModalQR(null)} style={{ ...BTN_GHOST, flex:1, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Check-out */}
      {modalCheckout && (
        <div style={MODAL_OVERLAY} onClick={() => setModalCheckout(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Check-out — Chambre {modalCheckout.chambre}</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>{modalCheckout.client}</div>
            <div style={{ ...CARD_STYLE, background:'#FAFAFA', marginBottom:16 }}>
              <div style={SECTION_HDR}>Récapitulatif du séjour</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span>Chambre {modalCheckout.chambre} ({modalCheckout.type})</span>
                <span style={{ fontWeight:600 }}>{modalCheckout.tarif || ''}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span>{modalCheckout.nuits} nuit{modalCheckout.nuits > 1 ? 's' : ''} ({new Date(modalCheckout.arrivee).toLocaleDateString('fr-FR')} {'\u2192'} {new Date(modalCheckout.depart).toLocaleDateString('fr-FR')})</span>
              </div>
              <div style={{ borderTop:'2px solid #E5E7EB', paddingTop:10, marginTop:10, display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16 }}>
                <span>Total TTC</span><span style={{ color:H }}>{modalCheckout.montant}€</span>
              </div>
            </div>
            <div style={{ background:'#D1FAE5', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#065F46', fontWeight:600 }}>
              {'\u2713'} Paiement sécurisé reçu via la plateforme — les fonds seront libérés vers votre compte
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => confirmCheckout(modalCheckout)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px', background:'#D97706' }}>Check-out + Envoyer facture</button>
              <button onClick={() => setModalCheckout(null)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Facture */}
      {modalFacture && (
        <div style={MODAL_OVERLAY} onClick={() => setModalFacture(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px' }}>{'\u2713'}</div>
              <div style={{ fontWeight:800, fontSize:18 }}>Facture envoyée !</div>
              <div style={{ color:'#888', fontSize:14, marginTop:4 }}>Envoyée à {modalFacture.reservation.email}</div>
            </div>
            <div style={{ background:'#FAFAFA', border:'1px solid #E5E7EB', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontWeight:800, color:H, fontSize:15 }}>{'\u{1F3E8}'} Freample Stay</div>
                <div style={{ fontSize:12, color:'#888' }}>Facture {modalFacture.numero}</div>
              </div>
              <div style={{ fontSize:13, color:'#888', marginBottom:14 }}>Chambre {modalFacture.reservation.chambre} · {new Date().toLocaleDateString('fr-FR')}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span>{modalFacture.reservation.type} — {modalFacture.reservation.nuits} nuit{modalFacture.reservation.nuits > 1 ? 's' : ''}</span>
                <span style={{ fontWeight:700 }}>{modalFacture.reservation.montant}€</span>
              </div>
              <div style={{ borderTop:'1px solid #E5E7EB', paddingTop:10, marginTop:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:4 }}>
                  <span>Sous-total HT</span><span>{Math.round(modalFacture.reservation.montant / 1.1)}€</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:8 }}>
                  <span>TVA 10%</span><span>{modalFacture.reservation.montant - Math.round(modalFacture.reservation.montant / 1.1)}€</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16 }}>
                  <span>Total TTC</span><span style={{ color:H }}>{modalFacture.reservation.montant}€</span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => window.print()} style={{ ...BTN_PRIMARY, flex:1 }}>{'\u2B07'} Télécharger PDF</button>
              <button onClick={() => window.open(`mailto:${modalFacture.reservation.email}?subject=Votre facture Freample Stay`)} style={{ ...BTN_GHOST, flex:1 }}>{'\u2709\uFE0F'} Email</button>
              <button onClick={() => setModalFacture(null)} style={BTN_GHOST}>{'\u2715'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nouvelle réservation */}
      {modalResa && (
        <div style={MODAL_OVERLAY} onClick={() => setModalResa(false)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Nouvelle réservation</div>
            {[
              { label:'Nom du client *', key:'client',    type:'text' },
              { label:'Email',           key:'email',     type:'email' },
              { label:'Téléphone',       key:'telephone', type:'tel' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>{f.label}</label>
                <input type={f.type} value={resaForm[f.key]} onChange={e => setResaForm(p => ({ ...p, [f.key]:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Arrivée *</label>
                <input type="date" value={resaForm.arrivee} onChange={e => setResaForm(p => ({ ...p, arrivee:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Départ *</label>
                <input type="date" value={resaForm.depart} onChange={e => setResaForm(p => ({ ...p, depart:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Personnes</label>
                <input type="number" min={1} max={10} value={resaForm.personnes} onChange={e => setResaForm(p => ({ ...p, personnes:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Chambre</label>
                <select value={resaForm.chambre} onChange={e => setResaForm(p => ({ ...p, chambre:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}>
                  <option value="">À assigner</option>
                  {chambres.filter(c => c.statut === 'libre').map(c => <option key={c.id} value={c.num}>Ch. {c.num} ({c.type}) — {c.tarif}€/nuit</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Notes</label>
              <textarea value={resaForm.notes} onChange={e => setResaForm(p => ({ ...p, notes:e.target.value }))} placeholder="Demandes spéciales, allergies..." style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:70, boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitResa} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>{'\u2713'} Confirmer la réservation</button>
              <button onClick={() => setModalResa(false)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Walk-in choose room */}
      {modalWalkin === 'choose' && (
        <div style={MODAL_OVERLAY} onClick={() => setModalWalkin(null)}>
          <div style={{ ...MODAL_BOX, maxWidth:440 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Walk-in — Chambre disponible</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>Choisissez une chambre libre</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
              {chambres.filter(c => c.statut === 'libre' && c.propre).map(c => (
                <button key={c.id} onClick={() => { setModalWalkin(c.id); setWalkinForm({ client:'', email:'', personnes:1, nuits:1 }); }} style={{ padding:'14px 10px', borderRadius:12, border:'2px solid #86EFAC', background:'#F0FDF4', cursor:'pointer', fontFamily:'inherit' }}>
                  <div style={{ fontWeight:800, fontSize:18, color:'#166534' }}>Ch. {c.num}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{c.type} · {c.tarif}€</div>
                </button>
              ))}
            </div>
            {chambres.filter(c => c.statut === 'libre' && c.propre).length === 0 && (
              <div style={{ textAlign:'center', color:'#888', padding:20 }}>Aucune chambre disponible pour le moment</div>
            )}
            <button onClick={() => setModalWalkin(null)} style={{ ...BTN_GHOST, width:'100%', padding:'11px' }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Modal: Walk-in form */}
      {modalWalkin && modalWalkin !== 'choose' && typeof modalWalkin === 'number' && (
        <div style={MODAL_OVERLAY} onClick={() => setModalWalkin(null)}>
          <div style={{ ...MODAL_BOX, maxWidth:400 }} onClick={e => e.stopPropagation()}>
            {(() => { const ch = chambres.find(c => c.id === modalWalkin); return ch ? (
              <>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Chambre {ch.num} — Walk-in</div>
                <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>{ch.type} · Vue {ch.vue} · {ch.tarif}€/nuit</div>
              </>
            ) : null; })()}
            {[{ label:'Nom du client', key:'client', type:'text' }, { label:'Email (optionnel)', key:'email', type:'email' }].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>{f.label}</label>
                <input type={f.type} value={walkinForm[f.key]} onChange={e => setWalkinForm(p => ({ ...p, [f.key]:e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Personnes</label>
                <input type="number" min={1} max={10} value={walkinForm.personnes} onChange={e => setWalkinForm(p => ({ ...p, personnes:Number(e.target.value) }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Nuits</label>
                <input type="number" min={1} max={30} value={walkinForm.nuits} onChange={e => setWalkinForm(p => ({ ...p, nuits:Number(e.target.value) }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => confirmerWalkin(modalWalkin)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>{'\u2713'} Check-in walk-in</button>
              <button onClick={() => setModalWalkin(null)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Virement */}
      {modalVirement && (
        <div style={MODAL_OVERLAY} onClick={() => { if (!virementDone) setModalVirement(false); }}>
          <div style={{ ...MODAL_BOX, maxWidth:400 }} onClick={e => e.stopPropagation()}>
            {virementDone ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:52, marginBottom:16 }}>{'\u{1F389}'}</div>
                <div style={{ fontWeight:800, fontSize:20, marginBottom:8 }}>Virement initié !</div>
                <div style={{ color:'#888', fontSize:14 }}>Vous recevrez les fonds sous 1–2 jours ouvrés</div>
              </div>
            ) : (
              <>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Demander un virement</div>
                <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>Disponible : <strong style={{ color:'#059669' }}>{totalBloque}€</strong> sur la plateforme</div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Montant à virer (€)</label>
                  <input type="number" value={virementAmount} onChange={e => setVirementAmount(e.target.value)} placeholder={`Max: ${totalBloque}€`} style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={submitVirement} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>{'\u{1F4B8}'} Confirmer le virement</button>
                  <button onClick={() => setModalVirement(false)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Client detail */}
      {modalClient && (
        <div style={MODAL_OVERLAY} onClick={() => setModalClient(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:H_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:H, fontSize:22 }}>{modalClient.nom[0]}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>{modalClient.nom}</div>
                <FideliteBadge fidelite={modalClient.fidelite} />
              </div>
            </div>
            {[
              { label:'Email',          val: modalClient.email },
              { label:'Téléphone',      val: modalClient.telephone },
              { label:'Séjours',        val: `${modalClient.sejours} séjour${modalClient.sejours > 1 ? 's' : ''}` },
              { label:'Dépense totale', val: `${modalClient.depense}€` },
              { label:'Dernier séjour', val: modalClient.dernierSejour },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0F0F0', fontSize:14 }}>
                <span style={{ color:'#888' }}>{r.label}</span>
                <span style={{ fontWeight:600 }}>{r.val}</span>
              </div>
            ))}
            {modalClient.preferences && (
              <div style={{ marginTop:16, padding:'12px 14px', background:H_BG, borderRadius:10, border:`1px solid ${H}30` }}>
                <div style={{ fontSize:12, fontWeight:700, color:H, marginBottom:4 }}>PRÉFÉRENCES</div>
                <div style={{ fontSize:13, color:'#1C1C1E' }}>{modalClient.preferences}</div>
              </div>
            )}
            <button onClick={() => setModalClient(null)} style={{ ...BTN_GHOST, width:'100%', padding:'11px', marginTop:20 }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, background: toast.type === 'error' ? '#DC2626' : '#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000, maxWidth:360 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
