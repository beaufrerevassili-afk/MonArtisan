import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const R = '#F97316';
const R_BG = '#FFF8F0';
const R_SOFT = '#FEF3C7';

const CARD_STYLE = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E8E6E1', boxShadow:'0 1px 4px rgba(0,0,0,.06)' };
const SECTION_HDR = { fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN_PRIMARY = { background:R, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const BTN_GHOST = { background:'transparent', color:'#666', border:'1px solid #E5E7EB', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const MODAL_OVERLAY = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const MODAL_BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil',      icon:'🏠', label:'Accueil' },
  { id:'tables',       icon:'🍽️', label:'Tables' },
  { id:'commandes',    icon:'👨‍🍳', label:'Cuisine' },
  { id:'reservations', icon:'📅', label:'Réservations' },
  { id:'menu',         icon:'📋', label:'Menu' },
  { id:'paiements',    icon:'💳', label:'Paiements' },
  { id:'clients',      icon:'👥', label:'Clients' },
  { id:'rapports',     icon:'📊', label:'Rapports' },
  { id:'parametres',   icon:'⚙️', label:'Paramètres' },
];

const TABLE_STATUS = {
  libre:             { label:'Libre',                bg:'#F0FDF4', border:'#86EFAC', color:'#166534' },
  reservee:          { label:'Réservée',              bg:'#EFF6FF', border:'#93C5FD', color:'#1D4ED8' },
  arrivee:           { label:'Client arrivé',        bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  commande_en_cours: { label:'Commande en cours',    bg:'#FEFCE8', border:'#FDE047', color:'#713F12' },
  envoyee_cuisine:   { label:'En cuisine / Paiement',bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  paye:              { label:'Payé',                  bg:'#F0FDFA', border:'#5EEAD4', color:'#0F766E' },
  partie:            { label:'Client parti',         bg:'#F9FAFB', border:'#E5E7EB', color:'#6B7280' },
};

const TABLES_INIT = [
  { id:1, numero:1, places:2, zone:'Salle principale', statut:'libre',             reservation:null, commandes:[], total:0 },
  { id:2, numero:2, places:2, zone:'Salle principale', statut:'arrivee',           reservation:{ client:'Thomas Dupont',   email:'thomas.d@gmail.com',  telephone:'06 12 34 56 78', code:'FRE-1842', personnes:2 }, commandes:[], total:0 },
  { id:3, numero:3, places:4, zone:'Salle principale', statut:'commande_en_cours', reservation:{ client:'Claire Martin',   email:'claire.m@gmail.com',  telephone:'06 23 45 67 89', code:'FRE-2953', personnes:3 }, commandes:[{id:1,plat:'Entrecôte grillée',prix:24,qte:2,statut:'attente'},{id:2,plat:'Salade César',prix:12,qte:1,statut:'attente'},{id:3,plat:'Vin rouge (verre)',prix:7,qte:2,statut:'attente'}], total:74 },
  { id:4, numero:4, places:4, zone:'Salle principale', statut:'envoyee_cuisine',   reservation:{ client:'Marc Leblanc',    email:'marc.l@gmail.com',    telephone:'06 34 56 78 90', code:'FRE-3064', personnes:2 }, commandes:[{id:1,plat:'Foie gras maison',prix:18,qte:1,statut:'cuisine'},{id:2,plat:'Magret de canard',prix:28,qte:2,statut:'cuisine'},{id:3,plat:'Crème brûlée',prix:9,qte:2,statut:'cuisine'}], total:92 },
  { id:5, numero:5, places:4, zone:'Terrasse',         statut:'reservee',          reservation:{ client:'Amélie Rousseau', email:'amelie.r@gmail.com',  telephone:'06 45 67 89 01', code:'FRE-4175', personnes:4, heure:'20:30' }, commandes:[], total:0 },
  { id:6, numero:6, places:4, zone:'Terrasse',         statut:'paye',              reservation:{ client:'Lucas Bernard',   email:'lucas.b@gmail.com',   telephone:'06 56 78 90 12', code:'FRE-5286', personnes:2 }, commandes:[{id:1,plat:'Moules marinières',prix:16,qte:1,statut:'servi'},{id:2,plat:'Steak frites',prix:22,qte:2,statut:'servi'}], total:60 },
  { id:7, numero:7, places:6, zone:'Salon privé',      statut:'libre',             reservation:null, commandes:[], total:0 },
  { id:8, numero:8, places:6, zone:'Salon privé',      statut:'reservee',          reservation:{ client:'Groupe ABC',      email:'contact@abc.fr',      telephone:'01 23 45 67 89', code:'FRE-6397', personnes:6, heure:'19:00' }, commandes:[], total:0 },
  { id:9, numero:9, places:2, zone:'Bar',              statut:'libre',             reservation:null, commandes:[], total:0 },
  { id:10,numero:10,places:2, zone:'Bar',              statut:'commande_en_cours', reservation:{ client:'Isabelle Petit',  email:'isa.p@gmail.com',     telephone:'07 67 89 01 23', code:'FRE-7408', personnes:1 }, commandes:[{id:1,plat:'Planche charcuterie',prix:16,qte:1,statut:'attente'},{id:2,plat:'Vin blanc (verre)',prix:6,qte:2,statut:'attente'}], total:28 },
];

const MENU_INIT = [
  { id:1,  categorie:'Entrées',  nom:'Foie gras maison',    prix:18, dispo:true,  description:'Avec toast et confiture de figues', allergenes:'Gluten' },
  { id:2,  categorie:'Entrées',  nom:'Salade César',         prix:12, dispo:true,  description:'Laitue romaine, parmesan, croûtons', allergenes:'Gluten, Lactose' },
  { id:3,  categorie:'Entrées',  nom:'Moules marinières',    prix:16, dispo:true,  description:'500g de moules de bouchot', allergenes:'Mollusques' },
  { id:4,  categorie:'Entrées',  nom:'Planche charcuterie', prix:16, dispo:true,  description:'Sélection de charcuteries maison', allergenes:'' },
  { id:5,  categorie:'Plats',    nom:'Entrecôte grillée',    prix:24, dispo:true,  description:'250g, sauce au poivre ou béarnaise', allergenes:'Lactose' },
  { id:6,  categorie:'Plats',    nom:'Magret de canard',     prix:28, dispo:true,  description:'Sauce aux cerises, gratin dauphinois', allergenes:'Lactose' },
  { id:7,  categorie:'Plats',    nom:'Steak frites',         prix:22, dispo:true,  description:'200g de bœuf, frites maison', allergenes:'' },
  { id:8,  categorie:'Plats',    nom:'Risotto champignons',  prix:19, dispo:true,  description:'Champignons de saison, parmesan', allergenes:'Lactose, Gluten' },
  { id:9,  categorie:'Plats',    nom:'Saumon en croûte',     prix:26, dispo:false, description:'Saumon atlantique, épinards', allergenes:'Gluten, Poisson' },
  { id:10, categorie:'Desserts', nom:'Crème brûlée',         prix:9,  dispo:true,  description:'Recette maison à la vanille', allergenes:'Lactose, Œufs' },
  { id:11, categorie:'Desserts', nom:'Fondant chocolat',     prix:10, dispo:true,  description:'Coulant au chocolat noir', allergenes:'Gluten, Lactose' },
  { id:12, categorie:'Desserts', nom:'Tarte Tatin',          prix:9,  dispo:true,  description:'Pommes caramélisées, crème fraîche', allergenes:'Gluten, Lactose' },
  { id:13, categorie:'Boissons', nom:'Vin rouge (verre)',    prix:7,  dispo:true,  description:'Sélection du sommelier', allergenes:'Sulfites' },
  { id:14, categorie:'Boissons', nom:'Vin blanc (verre)',    prix:6,  dispo:true,  description:'Sélection du sommelier', allergenes:'Sulfites' },
  { id:15, categorie:'Boissons', nom:"Carafe d'eau",         prix:0,  dispo:true,  description:'Eau du robinet', allergenes:'' },
  { id:16, categorie:'Boissons', nom:'Jus de fruit frais',   prix:5,  dispo:true,  description:'Orange, pomme ou ananas', allergenes:'' },
];

const RESERVATIONS_INIT = [
  { id:1, client:'Thomas Dupont',   email:'thomas.d@gmail.com', telephone:'06 12 34 56 78', personnes:2, heure:'19:00', date:'2026-04-04', table:2, statut:'arrivee',  code:'FRE-1842', notes:'' },
  { id:2, client:'Claire Martin',   email:'claire.m@gmail.com', telephone:'06 23 45 67 89', personnes:3, heure:'19:30', date:'2026-04-04', table:3, statut:'en_cours', code:'FRE-2953', notes:'Anniversaire 🎂' },
  { id:3, client:'Marc Leblanc',    email:'marc.l@gmail.com',   telephone:'06 34 56 78 90', personnes:2, heure:'20:00', date:'2026-04-04', table:4, statut:'en_cours', code:'FRE-3064', notes:'' },
  { id:4, client:'Amélie Rousseau', email:'amelie.r@gmail.com', telephone:'06 45 67 89 01', personnes:4, heure:'20:30', date:'2026-04-04', table:5, statut:'a_venir',  code:'FRE-4175', notes:'Terrasse demandée' },
  { id:5, client:'Groupe ABC',      email:'contact@abc.fr',     telephone:'01 23 45 67 89', personnes:6, heure:'19:00', date:'2026-04-04', table:8, statut:'a_venir',  code:'FRE-6397', notes:'Facture professionnelle' },
  { id:6, client:'Sophie Garnier',  email:'sophie.g@gmail.com', telephone:'06 78 90 12 34', personnes:2, heure:'12:30', date:'2026-04-05', table:null, statut:'a_venir', code:'FRE-8519', notes:'' },
  { id:7, client:'Pierre Fontaine', email:'pierre.f@gmail.com', telephone:'07 89 01 23 45', personnes:4, heure:'20:00', date:'2026-04-05', table:null, statut:'a_venir', code:'FRE-9620', notes:'Allergie fruits de mer' },
];

const TRANSACTIONS_INIT = [
  { id:'T001', date:'2026-04-04', client:'Lucas Bernard', table:6,    montant:60,   statut:'libere', type:'paiement', facture:true },
  { id:'T002', date:'2026-04-04', client:'Marc Leblanc',  table:4,    montant:92,   statut:'bloque', type:'paiement', facture:false },
  { id:'T003', date:'2026-04-03', client:'Nina Lambert',  table:3,    montant:78,   statut:'libere', type:'paiement', facture:true },
  { id:'T004', date:'2026-04-03', client:'Jean Moreau',   table:1,    montant:45,   statut:'libere', type:'paiement', facture:true },
  { id:'T005', date:'2026-04-02', client:'Marie Blanc',   table:7,    montant:135,  statut:'libere', type:'paiement', facture:true },
  { id:'VIRT1',date:'2026-03-31', client:'',              table:null, montant:1240, statut:'vire',   type:'virement', facture:false },
];

const CLIENTS_INIT = [
  { id:1, nom:'Thomas Dupont',   email:'thomas.d@gmail.com', telephone:'06 12 34 56 78', visites:8,  dernierRepas:'2026-04-04', depense:480,  fidelite:'fidele',   preferences:'Table calme, amateur vin rouge' },
  { id:2, nom:'Claire Martin',   email:'claire.m@gmail.com', telephone:'06 23 45 67 89', visites:15, dernierRepas:'2026-04-04', depense:1120, fidelite:'vip',      preferences:'Anniversaire 15/04, allergie noix' },
  { id:3, nom:'Amélie Rousseau', email:'amelie.r@gmail.com', telephone:'06 45 67 89 01', visites:4,  dernierRepas:'2026-03-15', depense:210,  fidelite:'regulier', preferences:'Terrasse si possible' },
  { id:4, nom:'Lucas Bernard',   email:'lucas.b@gmail.com',  telephone:'06 56 78 90 12', visites:22, dernierRepas:'2026-04-04', depense:1650, fidelite:'vip',      preferences:'Menu dégustation, amateur de vin' },
  { id:5, nom:'Sophie Garnier',  email:'sophie.g@gmail.com', telephone:'06 78 90 12 34', visites:2,  dernierRepas:'2026-03-01', depense:95,   fidelite:'nouveau',  preferences:'' },
];

const REVENUS_7J = [
  { jour:'Lun', montant:480 }, { jour:'Mar', montant:620 }, { jour:'Mer', montant:390 },
  { jour:'Jeu', montant:710 }, { jour:'Ven', montant:850 }, { jour:'Sam', montant:1240 },
  { jour:'Dim', montant:540 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function genCode() {
  return 'FRE-' + Math.floor(1000 + Math.random() * 9000);
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

function StatusBadge({ statut }) {
  const s = TABLE_STATUS[statut] || TABLE_STATUS.libre;
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

const RESTO_TAB_MAP = { tables:'tables', commandes:'commandes', reservations:'reservations', menu:'menu', paiements:'paiements', clients:'clients', rapports:'rapports', parametres:'parametres' };

export default function DashboardRestaurant() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const onglet = searchParams.get('onglet');
  const [tab, setTab] = useState(RESTO_TAB_MAP[onglet] || 'accueil');
  const [tables, setTables] = useState(TABLES_INIT);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && RESTO_TAB_MAP[o]) setTab(RESTO_TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);
  const [menu, setMenu] = useState(MENU_INIT);
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
  const [modalQR, setModalQR]               = useState(null);  // table object
  const [modalCommande, setModalCommande]   = useState(null);  // table object
  const [modalDepart, setModalDepart]       = useState(null);  // table object
  const [modalFacture, setModalFacture]     = useState(null);  // { table, numero }
  const [modalResa, setModalResa]           = useState(false);
  const [modalWalkin, setModalWalkin]       = useState(null);  // table id or 'choose'
  const [modalVirement, setModalVirement]   = useState(false);
  const [virementDone, setVirementDone]     = useState(false);
  const [modalClient, setModalClient]       = useState(null);  // client object
  const [modalMenuItem, setModalMenuItem]   = useState(null);  // item object or 'new'

  // QR modal
  const [qrTab, setQrTab]   = useState('qr');
  const [qrInput, setQrInput] = useState('');

  // Order modal
  const [orderItems, setOrderItems] = useState([]);

  // Forms
  const [resaForm, setResaForm] = useState({ client:'', email:'', telephone:'', personnes:2, date:'2026-04-04', heure:'20:00', table:'', notes:'' });
  const [walkinForm, setWalkinForm] = useState({ client:'', email:'', personnes:2 });
  const [menuForm, setMenuForm] = useState({ categorie:'Plats', nom:'', prix:'', description:'', allergenes:'', dispo:true });
  const [payFilter, setPayFilter] = useState('tous');
  const [clientSearch, setClientSearch] = useState('');
  const [virementAmount, setVirementAmount] = useState('');
  const [restoSettings, setRestoSettings] = useState({
    nom: 'Le Bistrot Parisien', adresse: '12 rue de Rivoli, 75001 Paris', tel: '01 42 33 44 55', email: 'contact@bistrot-parisien.fr',
    ouverture: '10:00', fermeture: '23:00',
    jours: [true, true, true, true, true, true, false], // Lun-Sam ouverts, Dim fermé
    notifResa: true, notifPaiement: true, notifAnnulation: true,
    fermetures: [{ debut: '2026-08-01', fin: '2026-08-15', motif: 'Congés annuels' }],
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  const tablesOccupees  = tables.filter(t => !['libre','partie'].includes(t.statut)).length;
  const commandesActives = tables.filter(t => ['commande_en_cours','envoyee_cuisine'].includes(t.statut)).length;
  const revenuJour      = transactions.filter(t => t.date === '2026-04-04' && t.type === 'paiement').reduce((s, t) => s + t.montant, 0);
  const resasSoir       = reservations.filter(r => r.date === '2026-04-04' && r.statut === 'a_venir').length;
  const totalBloque     = transactions.filter(t => t.statut === 'bloque').reduce((s, t) => s + t.montant, 0);
  const maxRevenu       = Math.max(...REVENUS_7J.map(r => r.montant));

  const zones = [...new Set(tables.map(t => t.zone))];
  const menuCategories = [...new Set(menu.map(m => m.categorie))];
  const filteredTransactions = transactions.filter(t =>
    payFilter === 'tous'      ? true :
    payFilter === 'bloques'   ? t.statut === 'bloque' :
    payFilter === 'liberes'   ? t.statut === 'libere' :
    t.type === 'virement'
  );
  const filteredClients = clients.filter(c =>
    c.nom.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // ── Table mutations ───────────────────────────────────────────────────────
  const mutTable = (id, changes) =>
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));

  const openQRModal = (table) => { setModalQR(table); setQrTab('qr'); setQrInput(''); };

  const confirmArrivee = (table) => {
    if (qrTab === 'code' && qrInput.toUpperCase() !== table.reservation?.code) {
      showToast('Code incorrect', 'error'); return;
    }
    mutTable(table.id, { statut:'arrivee' });
    setReservations(prev => prev.map(r => r.code === table.reservation?.code ? { ...r, statut:'arrivee' } : r));
    setModalQR(null);
    showToast(`Arrivée de ${table.reservation?.client} confirmée — Table ${table.numero}`);
  };

  const openOrderModal = (table) => {
    setOrderItems([...table.commandes]);
    setModalCommande(table);
  };

  const addItem = (plat) => {
    setOrderItems(prev => {
      const ex = prev.find(i => i.plat === plat.nom);
      if (ex) return prev.map(i => i.plat === plat.nom ? { ...i, qte: i.qte + 1 } : i);
      return [...prev, { id: Date.now() + Math.random(), plat: plat.nom, prix: plat.prix, qte: 1, statut:'attente' }];
    });
  };

  const changeQte = (id, delta) => {
    setOrderItems(prev =>
      prev.map(i => i.id === id ? { ...i, qte: i.qte + delta } : i).filter(i => i.qte > 0)
    );
  };

  const saveOrder = (table) => {
    const total = orderItems.reduce((s, i) => s + i.prix * i.qte, 0);
    mutTable(table.id, { commandes: orderItems, total, statut: orderItems.length > 0 ? 'commande_en_cours' : table.statut });
    setModalCommande(null);
    showToast('Commande sauvegardée');
  };

  const envoyerCuisine = (table) => {
    const total = orderItems.reduce((s, i) => s + i.prix * i.qte, 0);
    const items = orderItems.map(i => ({ ...i, statut:'cuisine' }));
    mutTable(table.id, { commandes: items, total, statut:'envoyee_cuisine' });
    const newT = {
      id: 'T' + Date.now(),
      date: '2026-04-04',
      client: table.reservation?.client || '',
      table: table.numero,
      montant: total,
      statut: 'bloque',
      type: 'paiement',
      facture: false,
    };
    setTransactions(prev => [newT, ...prev]);
    setModalCommande(null);
    showToast(`Commande envoyée en cuisine — Paiement de ${total}€ demandé au client`);
  };

  const confirmDepart = (table) => {
    const num = genCode();
    mutTable(table.id, { statut:'paye' });
    setTransactions(prev =>
      prev.map(t => t.client === table.reservation?.client && t.statut === 'bloque'
        ? { ...t, statut:'libere', facture:true } : t)
    );
    setModalDepart(null);
    setModalFacture({ table, numero: num });
    showToast(`Facture envoyée à ${table.reservation?.email}`);
  };

  const libererTable = (id) => {
    mutTable(id, { statut:'libre', reservation:null, commandes:[], total:0 });
    showToast('Table libérée');
  };

  // ── Walk-in ───────────────────────────────────────────────────────────────
  const confirmerWalkin = (tableId) => {
    const code = genCode();
    const resa = { client: walkinForm.client || 'Client', email: walkinForm.email, telephone:'', code, personnes: walkinForm.personnes };
    mutTable(tableId, { statut:'arrivee', reservation: resa, commandes:[], total:0 });
    setModalWalkin(null);
    setWalkinForm({ client:'', email:'', personnes:2 });
    showToast(`Table ${tableId} — ${resa.client} installé·e (${code})`);
  };

  // ── Réservation ───────────────────────────────────────────────────────────
  const submitResa = () => {
    if (!resaForm.client || !resaForm.heure) return;
    const code = genCode();
    const newR = { id: Date.now(), ...resaForm, personnes: Number(resaForm.personnes), table: resaForm.table ? Number(resaForm.table) : null, statut:'a_venir', code };
    setReservations(prev => [...prev, newR]);
    if (newR.table) {
      mutTable(newR.table, { statut:'reservee', reservation:{ client:newR.client, email:newR.email, telephone:newR.telephone, code, personnes:newR.personnes, heure:newR.heure } });
    }
    setModalResa(false);
    setResaForm({ client:'', email:'', telephone:'', personnes:2, date:'2026-04-04', heure:'20:00', table:'', notes:'' });
    showToast(`Réservation confirmée — Code ${code}`);
  };

  // ── Menu ──────────────────────────────────────────────────────────────────
  const submitMenuItem = () => {
    if (!menuForm.nom || !menuForm.prix) return;
    if (modalMenuItem === 'new') {
      setMenu(prev => [...prev, { id: Date.now(), ...menuForm, prix: Number(menuForm.prix) }]);
      showToast('Plat ajouté au menu');
    } else {
      setMenu(prev => prev.map(m => m.id === modalMenuItem.id ? { ...m, ...menuForm, prix: Number(menuForm.prix) } : m));
      showToast('Plat mis à jour');
    }
    setModalMenuItem(null);
  };

  const toggleDispo = (id) => setMenu(prev => prev.map(m => m.id === id ? { ...m, dispo: !m.dispo } : m));
  const deleteMenuItem = (id) => { setMenu(prev => prev.filter(m => m.id !== id)); showToast('Plat supprimé'); };

  // ── Virement ──────────────────────────────────────────────────────────────
  const submitVirement = () => {
    if (!virementAmount || isNaN(virementAmount)) return;
    const v = { id:'VIRT'+Date.now(), date:'2026-04-04', client:'', table:null, montant:Number(virementAmount), statut:'vire', type:'virement', facture:false };
    setTransactions(prev => [v, ...prev]);
    setVirementDone(true);
    setTimeout(() => { setModalVirement(false); setVirementDone(false); setVirementAmount(''); }, 2500);
    showToast(`Virement de ${virementAmount}€ initié`);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ padding:'24px 28px', background:R_BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1C1C1E' }}>🍽️ Freample Eat — Dashboard Restaurant</div>
          <div style={{ fontSize:14, color:'#888', marginTop:2 }}>Réservations · Commandes · Paiements en temps réel</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setModalWalkin('choose')} style={{ ...BTN_PRIMARY, display:'flex', alignItems:'center', gap:6 }}>+ Accueillir un client</button>
          <button onClick={() => setModalResa(true)} style={BTN_GHOST}>📅 Nouvelle réservation</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E8E6E1', boxShadow:'0 1px 4px rgba(0,0,0,.06)', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer',
            fontWeight: tab === t.id ? 700 : 500,
            background: tab === t.id ? R : 'transparent',
            color: tab === t.id ? '#fff' : '#666',
            fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ── TAB: Accueil ── */}
      {tab === 'accueil' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
            <KpiCard label="Tables occupées"    value={`${tablesOccupees}/10`}  sub="En ce moment"        accent={R} />
            <KpiCard label="Commandes actives"  value={commandesActives}         sub="En cours / cuisine"  accent="#7C3AED" />
            <KpiCard label="Revenu du jour"     value={`${revenuJour}€`}         sub="Paiements reçus"     accent="#059669" />
            <KpiCard label="Réservations soir"  value={resasSoir}                sub="En attente d'arrivée" accent="#2563EB" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
            {/* Mini floor plan */}
            <div style={CARD_STYLE}>
              <div style={{ ...SECTION_HDR, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                Plan de salle
                <button onClick={() => setTab('tables')} style={{ fontSize:11, color:R, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Voir tout →</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                {tables.map(t => {
                  const s = TABLE_STATUS[t.statut];
                  return (
                    <div key={t.id} onClick={() => setTab('tables')} style={{ background:s.bg, border:`2px solid ${s.border}`, borderRadius:10, padding:'10px 6px', textAlign:'center', cursor:'pointer' }}>
                      <div style={{ fontWeight:800, fontSize:16, color:s.color }}>{t.numero}</div>
                      <div style={{ fontSize:10, color:s.color, fontWeight:600 }}>{t.places}p</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity feed */}
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Activité récente</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { icon:'🟣', text:'Marc Leblanc — commande envoyée en cuisine (Table 4)', time:'20:12' },
                  { icon:'🟠', text:'Thomas Dupont — arrivé à la Table 2', time:'19:58' },
                  { icon:'🟡', text:'Claire Martin — commande en cours (Table 3, 74€)', time:'19:45' },
                  { icon:'💳', text:'Lucas Bernard — paiement reçu 60€ (Table 6)', time:'19:30' },
                  { icon:'📅', text:'Amélie Rousseau — réservation 20h30 confirmée', time:'18:00' },
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

          {/* Active tables */}
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Tables actives</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {tables.filter(t => t.statut !== 'libre').map(t => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'#FAFAFA', borderRadius:10, border:'1px solid #F0F0F0' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:TABLE_STATUS[t.statut].bg, border:`2px solid ${TABLE_STATUS[t.statut].border}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:TABLE_STATUS[t.statut].color }}>{t.numero}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{t.reservation?.client || '—'}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{t.reservation?.personnes || 0} pers. · {t.zone}</div>
                  </div>
                  <StatusBadge statut={t.statut} />
                  {t.total > 0 && <div style={{ fontWeight:800, color:R, fontSize:15, minWidth:50, textAlign:'right' }}>{t.total}€</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Tables ── */}
      {tab === 'tables' && (
        <div>
          {zones.map(zone => (
            <div key={zone} style={{ marginBottom:28 }}>
              <div style={SECTION_HDR}>{zone}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                {tables.filter(t => t.zone === zone).map(t => {
                  const s = TABLE_STATUS[t.statut];
                  return (
                    <div key={t.id} style={{ background:'#fff', border:`2px solid ${s.border}`, borderRadius:16, padding:18, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:20, fontWeight:800, color:s.color }}>Table {t.numero}</div>
                          <div style={{ fontSize:12, color:'#888' }}>{t.places} personnes</div>
                        </div>
                        <StatusBadge statut={t.statut} />
                      </div>
                      {t.reservation && (
                        <div style={{ marginBottom:10 }}>
                          <div style={{ fontWeight:700, fontSize:13 }}>{t.reservation.client}</div>
                          <div style={{ fontSize:12, color:'#888' }}>{t.reservation.personnes} pers. · {t.reservation.code}</div>
                          {t.reservation.heure && <div style={{ fontSize:12, color:'#888' }}>Résa {t.reservation.heure}</div>}
                        </div>
                      )}
                      {t.total > 0 && <div style={{ fontWeight:800, color:R, fontSize:16, marginBottom:10 }}>{t.total}€</div>}
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {t.statut === 'libre' && (
                          <button onClick={() => { setModalWalkin(t.id); setWalkinForm({ client:'', email:'', personnes:2 }); }} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem' }}>+ Accueillir un client</button>
                        )}
                        {t.statut === 'reservee' && (
                          <button onClick={() => openQRModal(t)} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem' }}>✓ Valider l'arrivée</button>
                        )}
                        {t.statut === 'arrivee' && (
                          <button onClick={() => openOrderModal(t)} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem' }}>📝 Commencer la commande</button>
                        )}
                        {t.statut === 'commande_en_cours' && (
                          <button onClick={() => openOrderModal(t)} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem' }}>📝 Voir / modifier commande</button>
                        )}
                        {t.statut === 'envoyee_cuisine' && (
                          <button onClick={() => setModalDepart(t)} style={{ ...BTN_PRIMARY, padding:'8px 14px', fontSize:'0.8rem', background:'#059669' }}>🚪 Client parti</button>
                        )}
                        {t.statut === 'paye' && (
                          <button onClick={() => libererTable(t.id)} style={{ ...BTN_GHOST, padding:'8px 14px', fontSize:'0.8rem' }}>♻️ Libérer la table</button>
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

      {/* ── TAB: Cuisine ── */}
      {tab === 'commandes' && (
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1C1C1E', marginBottom:20 }}>Tickets de cuisine en cours</div>
          {tables.filter(t => ['commande_en_cours','envoyee_cuisine'].includes(t.statut)).length === 0 && (
            <div style={{ ...CARD_STYLE, textAlign:'center', color:'#888', padding:40 }}>Aucune commande en cours</div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {tables.filter(t => ['commande_en_cours','envoyee_cuisine'].includes(t.statut)).map(t => (
              <div key={t.id} style={{ background:'#fff', borderRadius:16, border:`2px solid ${t.statut === 'envoyee_cuisine' ? '#C4B5FD' : '#FDE047'}`, padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:17 }}>Table {t.numero}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{t.reservation?.client} · {t.reservation?.personnes}p</div>
                  </div>
                  <StatusBadge statut={t.statut} />
                </div>
                <div style={{ borderTop:'1px solid #F0F0F0', paddingTop:12, marginBottom:12 }}>
                  {t.commandes.map((c, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6, alignItems:'center' }}>
                      <span>{c.qte}× {c.plat}</span>
                      <span style={{ color: c.statut==='cuisine' ? '#7C3AED' : c.statut==='servi' ? '#059669' : '#999', fontWeight:600, fontSize:11 }}>
                        {c.statut==='cuisine' ? '🔥 Cuisine' : c.statut==='servi' ? '✓ Servi' : '⏳ Attente'}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontWeight:800, color:R, fontSize:16 }}>{t.total}€</div>
                  {t.statut === 'commande_en_cours' && (
                    <button onClick={() => openOrderModal(t)} style={{ ...BTN_PRIMARY, padding:'7px 14px', fontSize:'0.8rem' }}>Envoyer en cuisine</button>
                  )}
                  {t.statut === 'envoyee_cuisine' && (
                    <button onClick={() => setModalDepart(t)} style={{ ...BTN_PRIMARY, padding:'7px 14px', fontSize:'0.8rem', background:'#059669' }}>Client parti</button>
                  )}
                </div>
              </div>
            ))}
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
          {['2026-04-04','2026-04-05'].map(date => {
            const dayResas = reservations.filter(r => r.date === date);
            if (!dayResas.length) return null;
            return (
              <div key={date} style={{ marginBottom:24 }}>
                <div style={SECTION_HDR}>{date === '2026-04-04' ? "Aujourd'hui" : 'Demain'} — {date}</div>
                <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
                  {dayResas.map((r, i) => (
                    <div key={r.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < dayResas.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                      <div style={{ fontWeight:800, fontSize:15, color:R, minWidth:48 }}>{r.heure}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{r.client}</div>
                        <div style={{ fontSize:12, color:'#888' }}>{r.personnes} pers. · Table {r.table || '?'} · {r.code}</div>
                        {r.notes && <div style={{ fontSize:12, color:'#7C3AED', marginTop:2 }}>{r.notes}</div>}
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {r.statut === 'a_venir' && (
                          <button onClick={() => { const t = tables.find(tb => tb.id === r.table); if (t) openQRModal(t); }} style={{ ...BTN_PRIMARY, padding:'6px 12px', fontSize:'0.8rem' }}>Valider arrivée</button>
                        )}
                        {r.statut === 'arrivee'  && <span style={{ fontSize:12, color:'#059669', fontWeight:700 }}>✓ Arrivé</span>}
                        {r.statut === 'en_cours' && <span style={{ fontSize:12, color:R, fontWeight:700 }}>En cours</span>}
                        <button onClick={() => setReservations(prev => prev.filter(x => x.id !== r.id))} style={{ ...BTN_GHOST, padding:'6px 12px', fontSize:'0.8rem', color:'#DC2626', borderColor:'#FEE2E2' }}>Annuler</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: Menu ── */}
      {tab === 'menu' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontSize:16, fontWeight:700 }}>Gestion du menu</div>
            <button onClick={() => { setMenuForm({ categorie:'Plats', nom:'', prix:'', description:'', allergenes:'', dispo:true }); setModalMenuItem('new'); }} style={BTN_PRIMARY}>+ Ajouter un plat</button>
          </div>
          {menuCategories.map(cat => (
            <div key={cat} style={{ marginBottom:24 }}>
              <div style={SECTION_HDR}>{cat}</div>
              <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
                {menu.filter(m => m.categorie === cat).map((m, i, arr) => (
                  <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < arr.length - 1 ? '1px solid #F0F0F0' : 'none', opacity: m.dispo ? 1 : 0.55 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color: m.dispo ? '#1C1C1E' : '#999' }}>{m.nom}</div>
                      <div style={{ fontSize:12, color:'#888' }}>{m.description}</div>
                      {m.allergenes && <div style={{ fontSize:11, color:'#F97316', marginTop:2 }}>⚠️ {m.allergenes}</div>}
                    </div>
                    <div style={{ fontWeight:800, fontSize:16, color:R, minWidth:54, textAlign:'right' }}>{m.prix > 0 ? `${m.prix}€` : 'Gratuit'}</div>
                    <button onClick={() => toggleDispo(m.id)} style={{ ...BTN_GHOST, padding:'5px 12px', fontSize:'0.78rem', color: m.dispo ? '#059669' : '#DC2626', borderColor: m.dispo ? '#BBF7D0' : '#FEE2E2' }}>{m.dispo ? '✓ Dispo' : '✗ Indispo'}</button>
                    <button onClick={() => { setMenuForm({ categorie:m.categorie, nom:m.nom, prix:String(m.prix), description:m.description, allergenes:m.allergenes, dispo:m.dispo }); setModalMenuItem(m); }} style={{ ...BTN_GHOST, padding:'5px 10px', fontSize:'0.78rem' }}>✎</button>
                    <button onClick={() => deleteMenuItem(m.id)} style={{ ...BTN_GHOST, padding:'5px 10px', fontSize:'0.78rem', color:'#DC2626', borderColor:'#FEE2E2' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Paiements ── */}
      {tab === 'paiements' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
            <KpiCard label="Bloqués"            value={`${totalBloque}€`} sub="En attente de libération" accent="#D97706" />
            <KpiCard label="Libérés aujourd'hui" value={`${transactions.filter(t=>t.date==='2026-04-04'&&t.statut==='libere').reduce((s,t)=>s+t.montant,0)}€`} sub="Paiements validés" accent="#059669" />
            <KpiCard label="Total viré"          value={`${transactions.filter(t=>t.type==='virement').reduce((s,t)=>s+t.montant,0)}€`} sub="Virements effectués" accent="#2563EB" />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:8 }}>
              {[['tous','Tous'],['bloques','Bloqués'],['liberes','Libérés'],['virements','Virements']].map(([v, l]) => (
                <button key={v} onClick={() => setPayFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: payFilter===v ? 700 : 500, background: payFilter===v ? R : '#F3F4F6', color: payFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setModalVirement(true); setVirementDone(false); setVirementAmount(''); }} style={BTN_PRIMARY}>💸 Demander un virement</button>
          </div>
          <div style={{ ...CARD_STYLE, padding:0, overflow:'hidden' }}>
            {filteredTransactions.map((t, i) => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredTransactions.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{t.type==='virement' ? 'Virement vers votre compte' : t.client}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{t.date}{t.table ? ` · Table ${t.table}` : ''} · {t.id}</div>
                </div>
                <div style={{ fontWeight:800, fontSize:16, color: t.type==='virement' ? '#2563EB' : t.statut==='libere' ? '#059669' : t.statut==='bloque' ? '#D97706' : '#1C1C1E' }}>{t.type==='virement' ? '−' : ''}{t.montant}€</div>
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: t.statut==='libere'||t.statut==='vire' ? '#D1FAE5' : '#FEF3C7', color: t.statut==='libere'||t.statut==='vire' ? '#065F46' : '#D97706' }}>
                  {t.statut==='libere' ? '✓ Libéré' : t.statut==='bloque' ? '⏳ Bloqué' : '✓ Viré'}
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
                <div style={{ width:40, height:40, borderRadius:'50%', background:R_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:R, fontSize:16 }}>{c.nom[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{c.nom}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{c.email} · {c.visites} visites</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:800, color:R, fontSize:14 }}>{c.depense}€</div>
                  <FideliteBadge fidelite={c.fidelite} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Rapports ── */}
      {tab === 'rapports' && (
        <div>
          <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
            <KpiCard label="Couverts ce mois"  value="318"    sub="+12% vs mois dernier"     accent={R} />
            <KpiCard label="Ticket moyen"       value="48€"    sub="Par couvert"               accent="#7C3AED" />
            <KpiCard label="Meilleur plat"      value="Entrecôte" sub="42 commandes ce mois"  accent="#059669" />
            <KpiCard label="Taux occupation"    value="68%"    sub="Tables occupées en moyenne" accent="#2563EB" />
          </div>
          <div style={{ ...CARD_STYLE, marginBottom:24 }}>
            <div style={SECTION_HDR}>Revenus des 7 derniers jours</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
              {REVENUS_7J.map(r => (
                <div key={r.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:R }}>{r.montant}€</div>
                  <div style={{ width:'100%', background:R, borderRadius:'6px 6px 0 0', height:`${Math.round((r.montant / maxRevenu) * 120)}px` }} />
                  <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>{r.jour}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Top plats commandés</div>
              {[{nom:'Entrecôte grillée',n:42},{nom:'Magret de canard',n:38},{nom:'Crème brûlée',n:35},{nom:'Steak frites',n:31},{nom:'Foie gras maison',n:28}].map((p, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:13 }}>{i+1}. {p.nom}</span>
                  <span style={{ fontWeight:700, color:R, fontSize:13 }}>{p.n}×</span>
                </div>
              ))}
            </div>
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Répartition revenus</div>
              {[{cat:'Plats',pct:58,color:'#F97316'},{cat:'Boissons',pct:22,color:'#7C3AED'},{cat:'Entrées',pct:12,color:'#059669'},{cat:'Desserts',pct:8,color:'#2563EB'}].map((c, i) => (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                    <span>{c.cat}</span><span style={{ fontWeight:700 }}>{c.pct}%</span>
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

      {/* ── TAB: Paramètres ── */}
      {tab === 'parametres' && (
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1C1C1E', marginBottom:20 }}>Paramètres du restaurant</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Infos restaurant */}
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Informations</div>
              {[{label:'Nom du restaurant',key:'nom'},{label:'Adresse',key:'adresse'},{label:'Téléphone',key:'tel'},{label:'Email',key:'email'}].map(f=>(
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#555',display:'block',marginBottom:5}}>{f.label}</label>
                  <input value={restoSettings[f.key]} onChange={e=>setRestoSettings(p=>({...p,[f.key]:e.target.value}))} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid #E5E7EB',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} />
                </div>
              ))}
            </div>

            {/* Horaires */}
            <div style={CARD_STYLE}>
              <div style={SECTION_HDR}>Horaires d'ouverture</div>
              <div style={{display:'flex',gap:12,marginBottom:16}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#555',display:'block',marginBottom:5}}>Ouverture</label>
                  <input type="time" value={restoSettings.ouverture} onChange={e=>setRestoSettings(p=>({...p,ouverture:e.target.value}))} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid #E5E7EB',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} />
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#555',display:'block',marginBottom:5}}>Fermeture</label>
                  <input type="time" value={restoSettings.fermeture} onChange={e=>setRestoSettings(p=>({...p,fermeture:e.target.value}))} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid #E5E7EB',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} />
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:'#555',display:'block',marginBottom:8}}>Jours d'ouverture</label>
                <div style={{display:'flex',gap:6}}>
                  {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((j,i)=>(
                    <button key={j} onClick={()=>setRestoSettings(p=>{const jours=[...p.jours]; jours[i]=!jours[i]; return{...p,jours};})} style={{width:44,height:44,borderRadius:10,border:`2px solid ${restoSettings.jours[i]?R:'#E5E7EB'}`,background:restoSettings.jours[i]?R_SOFT:'#fff',color:restoSettings.jours[i]?R:'#888',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{j}</button>
                  ))}
                </div>
              </div>

              {/* Fermetures exceptionnelles */}
              <div style={SECTION_HDR}>Fermetures exceptionnelles</div>
              {restoSettings.fermetures.map((f,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,padding:'8px 12px',background:'#FAFAFA',borderRadius:8}}>
                  <span style={{flex:1,fontSize:13}}>{f.debut} → {f.fin} · {f.motif}</span>
                  <button onClick={()=>setRestoSettings(p=>({...p,fermetures:p.fermetures.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:'#DC2626',cursor:'pointer',fontWeight:700}}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div style={{...CARD_STYLE,marginTop:20}}>
            <div style={SECTION_HDR}>Notifications</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[{key:'notifResa',label:'Nouvelle réservation',desc:'Être notifié à chaque nouvelle réservation'},{key:'notifPaiement',label:'Paiement reçu',desc:'Notification quand un client paie sa commande'},{key:'notifAnnulation',label:'Annulation',desc:'Alerte si un client annule sa réservation'}].map(n=>(
                <div key={n.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'#FAFAFA',borderRadius:10}}>
                  <div><div style={{fontSize:14,fontWeight:600}}>{n.label}</div><div style={{fontSize:12,color:'#888',marginTop:2}}>{n.desc}</div></div>
                  <button onClick={()=>setRestoSettings(p=>({...p,[n.key]:!p[n.key]}))} style={{width:48,height:26,borderRadius:13,border:'none',cursor:'pointer',background:restoSettings[n.key]?R:'#D1D5DB',position:'relative',transition:'background .2s'}}>
                    <div style={{width:22,height:22,borderRadius:'50%',background:'#fff',position:'absolute',top:2,left:restoSettings[n.key]?24:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={()=>showToast('Paramètres sauvegardés')} style={{...BTN_PRIMARY,marginTop:20,padding:'12px 24px'}}>💾 Sauvegarder les paramètres</button>
        </div>
      )}

      {/* ══════════════════════════ MODALS ══════════════════════════ */}

      {/* Modal: QR / Valider arrivée */}
      {modalQR && (
        <div style={MODAL_OVERLAY} onClick={() => setModalQR(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Valider l'arrivée</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>Table {modalQR.numero} · {modalQR.reservation?.client}</div>
            <div style={{ display:'flex', background:'#F3F4F6', borderRadius:10, marginBottom:24, overflow:'hidden' }}>
              {['qr','code'].map(t => (
                <button key={t} onClick={() => setQrTab(t)} style={{ flex:1, padding:'10px', border:'none', cursor:'pointer', fontWeight:700, background: qrTab===t ? R : 'transparent', color: qrTab===t ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.875rem' }}>{t==='qr' ? 'QR Code' : 'Saisir le code'}</button>
              ))}
            </div>
            {qrTab === 'qr' ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, marginBottom:24 }}>
                <FakeQRCode code={modalQR.reservation?.code || 'FRE-0000'} size={140} />
                <div style={{ fontSize:22, fontWeight:800, letterSpacing:4 }}>{modalQR.reservation?.code}</div>
                <div style={{ fontSize:13, color:'#888', textAlign:'center' }}>Le client présente ce QR code ou ce code à l'entrée</div>
              </div>
            ) : (
              <div style={{ marginBottom:24 }}>
                <input value={qrInput} onChange={e => setQrInput(e.target.value)} placeholder={`Code (ex: ${modalQR.reservation?.code})`} style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:16, textAlign:'center', letterSpacing:4, fontWeight:700, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => confirmArrivee(modalQR)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>✓ Confirmer l'arrivée</button>
              <button onClick={() => setModalQR(null)} style={{ ...BTN_GHOST, flex:1, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Commande */}
      {modalCommande && (
        <div style={MODAL_OVERLAY} onClick={() => setModalCommande(null)}>
          <div style={{ ...MODAL_BOX, maxWidth:700 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:2 }}>Commande — Table {modalCommande.numero}</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>{modalCommande.reservation?.client} · {modalCommande.reservation?.personnes} personnes</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              {/* Menu */}
              <div style={{ maxHeight:480, overflowY:'auto' }}>
                <div style={SECTION_HDR}>Carte</div>
                {menuCategories.map(cat => (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', marginBottom:6 }}>{cat}</div>
                    {menu.filter(m => m.categorie === cat && m.dispo).map(m => (
                      <div key={m.id} onClick={() => addItem(m)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', borderRadius:8, cursor:'pointer', marginBottom:3 }}
                        onMouseEnter={e => e.currentTarget.style.background='#FFF8F0'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600 }}>{m.nom}</div>
                          {m.allergenes && <div style={{ fontSize:10, color:'#F97316' }}>⚠️ {m.allergenes}</div>}
                        </div>
                        <span style={{ fontSize:13, fontWeight:700, color:R, whiteSpace:'nowrap', marginLeft:8 }}>{m.prix > 0 ? `${m.prix}€ +` : 'Offert +'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Order */}
              <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={SECTION_HDR}>Commande en cours</div>
                {orderItems.length === 0 ? (
                  <div style={{ color:'#aaa', fontSize:13, padding:'20px 0', textAlign:'center', flex:1 }}>Aucun article — cliquez sur la carte pour ajouter</div>
                ) : (
                  <div style={{ flex:1, overflowY:'auto', marginBottom:12 }}>
                    {orderItems.map(item => (
                      <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'#FAFAFA', borderRadius:8, marginBottom:5 }}>
                        <div style={{ flex:1, fontSize:13, fontWeight:600 }}>{item.plat}</div>
                        <div style={{ fontSize:13, color:R, fontWeight:700, minWidth:46, textAlign:'right' }}>{item.prix * item.qte}€</div>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <button onClick={() => changeQte(item.id, -1)} style={{ width:24, height:24, borderRadius:6, border:'1px solid #E5E7EB', background:'#fff', cursor:'pointer', fontWeight:700 }}>−</button>
                          <span style={{ fontSize:13, fontWeight:700, minWidth:18, textAlign:'center' }}>{item.qte}</span>
                          <button onClick={() => changeQte(item.id, 1)} style={{ width:24, height:24, borderRadius:6, border:'1px solid #E5E7EB', background:'#fff', cursor:'pointer', fontWeight:700 }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ borderTop:'2px solid #F0F0F0', paddingTop:10, marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16 }}>
                    <span>Total</span>
                    <span style={{ color:R }}>{orderItems.reduce((s, i) => s + i.prix * i.qte, 0)}€</span>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button onClick={() => envoyerCuisine(modalCommande)} style={{ ...BTN_PRIMARY, padding:'12px' }}>🔥 Envoyer en cuisine + Demander paiement</button>
                  <button onClick={() => saveOrder(modalCommande)} style={{ ...BTN_GHOST, padding:'12px' }}>💾 Sauvegarder sans envoyer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Client parti */}
      {modalDepart && (
        <div style={MODAL_OVERLAY} onClick={() => setModalDepart(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Client parti — Table {modalDepart.numero}</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>{modalDepart.reservation?.client}</div>
            <div style={{ ...CARD_STYLE, background:'#FAFAFA', marginBottom:16 }}>
              <div style={SECTION_HDR}>Récapitulatif de la commande</div>
              {modalDepart.commandes.map((c, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                  <span>{c.qte}× {c.plat}</span>
                  <span style={{ fontWeight:700 }}>{c.prix * c.qte}€</span>
                </div>
              ))}
              <div style={{ borderTop:'2px solid #E5E7EB', paddingTop:10, marginTop:10, display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16 }}>
                <span>Total TTC</span><span style={{ color:R }}>{modalDepart.total}€</span>
              </div>
            </div>
            <div style={{ background:'#D1FAE5', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#065F46', fontWeight:600 }}>
              ✓ Paiement sécurisé reçu via la plateforme — les fonds seront libérés vers votre compte
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => confirmDepart(modalDepart)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px', background:'#059669' }}>🚪 Confirmer départ + Envoyer facture</button>
              <button onClick={() => setModalDepart(null)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Facture */}
      {modalFacture && (
        <div style={MODAL_OVERLAY} onClick={() => setModalFacture(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px' }}>✓</div>
              <div style={{ fontWeight:800, fontSize:18 }}>Facture envoyée !</div>
              <div style={{ color:'#888', fontSize:14, marginTop:4 }}>Envoyée à {modalFacture.table.reservation?.email}</div>
            </div>
            <div style={{ background:'#FAFAFA', border:'1px solid #E5E7EB', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontWeight:800, color:R, fontSize:15 }}>🍽️ Freample Eat</div>
                <div style={{ fontSize:12, color:'#888' }}>Facture {modalFacture.numero}</div>
              </div>
              <div style={{ fontSize:13, color:'#888', marginBottom:14 }}>Table {modalFacture.table.numero} · {new Date().toLocaleDateString('fr-FR')}</div>
              {modalFacture.table.commandes.map((c, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                  <span>{c.qte}× {c.plat}</span>
                  <span style={{ fontWeight:700 }}>{c.prix * c.qte}€</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid #E5E7EB', paddingTop:10, marginTop:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:4 }}>
                  <span>Sous-total HT</span><span>{Math.round(modalFacture.table.total / 1.1)}€</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:8 }}>
                  <span>TVA 10%</span><span>{modalFacture.table.total - Math.round(modalFacture.table.total / 1.1)}€</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16 }}>
                  <span>Total TTC</span><span style={{ color:R }}>{modalFacture.table.total}€</span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => window.print()} style={{ ...BTN_PRIMARY, flex:1 }}>⬇ Télécharger PDF</button>
              <button onClick={() => window.open(`mailto:${modalFacture.table.reservation?.email}?subject=Votre facture Freample Eat`)} style={{ ...BTN_GHOST, flex:1 }}>✉️ Email</button>
              <button onClick={() => setModalFacture(null)} style={{ ...BTN_GHOST }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Réservation */}
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
                <input type={f.type} value={resaForm[f.key]} onChange={e => setResaForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Date *</label>
                <input type="date" value={resaForm.date} onChange={e => setResaForm(p => ({ ...p, date: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Heure *</label>
                <input type="time" value={resaForm.heure} onChange={e => setResaForm(p => ({ ...p, heure: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Personnes *</label>
                <input type="number" min={1} max={20} value={resaForm.personnes} onChange={e => setResaForm(p => ({ ...p, personnes: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Table</label>
                <select value={resaForm.table} onChange={e => setResaForm(p => ({ ...p, table: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}>
                  <option value="">À assigner</option>
                  {tables.filter(t => t.statut === 'libre').map(t => <option key={t.id} value={t.id}>Table {t.numero} ({t.places}p) — {t.zone}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Notes</label>
              <textarea value={resaForm.notes} onChange={e => setResaForm(p => ({ ...p, notes: e.target.value }))} placeholder="Allergies, demandes spéciales, occasion..." style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:70, boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitResa} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>✓ Confirmer la réservation</button>
              <button onClick={() => setModalResa(false)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Walk-in choose table */}
      {modalWalkin === 'choose' && (
        <div style={MODAL_OVERLAY} onClick={() => setModalWalkin(null)}>
          <div style={{ ...MODAL_BOX, maxWidth:440 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Accueillir un client</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>Choisissez une table libre</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
              {tables.filter(t => t.statut === 'libre').map(t => (
                <button key={t.id} onClick={() => { setModalWalkin(t.id); setWalkinForm({ client:'', email:'', personnes:2 }); }} style={{ padding:'14px 10px', borderRadius:12, border:'2px solid #86EFAC', background:'#F0FDF4', cursor:'pointer', fontFamily:'inherit' }}>
                  <div style={{ fontWeight:800, fontSize:18, color:'#166534' }}>Table {t.numero}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{t.places} pers. · {t.zone}</div>
                </button>
              ))}
            </div>
            {tables.filter(t => t.statut === 'libre').length === 0 && (
              <div style={{ textAlign:'center', color:'#888', padding:20 }}>Aucune table libre pour le moment</div>
            )}
            <button onClick={() => setModalWalkin(null)} style={{ ...BTN_GHOST, width:'100%', padding:'11px' }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Modal: Walk-in form */}
      {modalWalkin && modalWalkin !== 'choose' && typeof modalWalkin === 'number' && (
        <div style={MODAL_OVERLAY} onClick={() => setModalWalkin(null)}>
          <div style={{ ...MODAL_BOX, maxWidth:400 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Table {modalWalkin} — Sans réservation</div>
            <div style={{ color:'#888', fontSize:14, marginBottom:20 }}>Renseignez les informations du client</div>
            {[{ label:'Nom du client', key:'client', type:'text' }, { label:'Email (optionnel)', key:'email', type:'email' }].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>{f.label}</label>
                <input type={f.type} value={walkinForm[f.key]} onChange={e => setWalkinForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Nombre de personnes</label>
              <input type="number" min={1} max={20} value={walkinForm.personnes} onChange={e => setWalkinForm(p => ({ ...p, personnes: Number(e.target.value) }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => confirmerWalkin(modalWalkin)} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>✓ Installer à la table {modalWalkin}</button>
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
                <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
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
                  <button onClick={submitVirement} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>💸 Confirmer le virement</button>
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
              <div style={{ width:52, height:52, borderRadius:'50%', background:R_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:R, fontSize:22 }}>{modalClient.nom[0]}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>{modalClient.nom}</div>
                <FideliteBadge fidelite={modalClient.fidelite} />
              </div>
            </div>
            {[
              { label:'Email',         val: modalClient.email },
              { label:'Téléphone',     val: modalClient.telephone },
              { label:'Visites',       val: `${modalClient.visites} repas` },
              { label:'Dépense totale',val: `${modalClient.depense}€` },
              { label:'Dernier repas', val: modalClient.dernierRepas },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0F0F0', fontSize:14 }}>
                <span style={{ color:'#888' }}>{r.label}</span>
                <span style={{ fontWeight:600 }}>{r.val}</span>
              </div>
            ))}
            {modalClient.preferences && (
              <div style={{ marginTop:16, padding:'12px 14px', background:'#FFF8F0', borderRadius:10, border:'1px solid #FED7AA' }}>
                <div style={{ fontSize:12, fontWeight:700, color:R, marginBottom:4 }}>PRÉFÉRENCES</div>
                <div style={{ fontSize:13, color:'#1C1C1E' }}>{modalClient.preferences}</div>
              </div>
            )}
            <button onClick={() => setModalClient(null)} style={{ ...BTN_GHOST, width:'100%', padding:'11px', marginTop:20 }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Modal: Menu item */}
      {modalMenuItem && (
        <div style={MODAL_OVERLAY} onClick={() => setModalMenuItem(null)}>
          <div style={{ ...MODAL_BOX, maxWidth:440 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>{modalMenuItem === 'new' ? 'Ajouter un plat' : 'Modifier le plat'}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Catégorie</label>
                <select value={menuForm.categorie} onChange={e => setMenuForm(p => ({ ...p, categorie: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}>
                  {['Entrées','Plats','Desserts','Boissons'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Prix (€)</label>
                <input type="number" value={menuForm.prix} onChange={e => setMenuForm(p => ({ ...p, prix: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Nom du plat *</label>
              <input value={menuForm.nom} onChange={e => setMenuForm(p => ({ ...p, nom: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Description</label>
              <input value={menuForm.description} onChange={e => setMenuForm(p => ({ ...p, description: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Allergènes</label>
              <input value={menuForm.allergenes} onChange={e => setMenuForm(p => ({ ...p, allergenes: e.target.value }))} placeholder="ex: Gluten, Lactose, Sulfites..." style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitMenuItem} style={{ ...BTN_PRIMARY, flex:1, padding:'12px' }}>✓ Enregistrer</button>
              <button onClick={() => setModalMenuItem(null)} style={{ ...BTN_GHOST, padding:'12px' }}>Annuler</button>
            </div>
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
