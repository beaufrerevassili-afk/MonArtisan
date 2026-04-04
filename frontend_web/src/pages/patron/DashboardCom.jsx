import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const V = '#8B5CF6';
const V_BG = '#F5F3FF';
const V_SOFT = '#EDE9FE';

const CARD = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E9E5F5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const HDR = { fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN = { background:V, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const GHOST = { background:'transparent', color:'#6B7280', border:'1px solid #E9E5F5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const OVL = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:560, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil',   icon:'🏠', label:'Accueil' },
  { id:'projets',   icon:'🎬', label:'Projets' },
  { id:'devis',     icon:'📝', label:'Devis' },
  { id:'factures',  icon:'💳', label:'Facturation' },
  { id:'paiements', icon:'💳', label:'Paiements' },
  { id:'clients',   icon:'👥', label:'Clients' },
  { id:'tarifs',    icon:'💰', label:'Grille tarifaire' },
  { id:'equipe',    icon:'👨‍💻', label:'Équipe' },
  { id:'rapports',  icon:'📊', label:'Rapports' },
];

const PROJET_STATUS = {
  demande:    { label:'Demande',    bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  devis_envoye:{ label:'Devis envoyé', bg:'#DBEAFE', border:'#93C5FD', color:'#1D4ED8' },
  en_cours:   { label:'En cours',   bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  revision:   { label:'Révision',   bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  livre:      { label:'Livré',      bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
  paye:       { label:'Payé',       bg:'#F0FDF4', border:'#5EEAD4', color:'#0F766E' },
};

const PROJETS_INIT = [
  { id:1, titre:'Pack 10 TikToks — @emma.lifestyle', client:'Emma Lifestyle', type:'Montage vidéo', categorie:'TikTok', montant:349, statut:'en_cours', monteur:'Maxime D.', dateDebut:'2026-04-01', dateFin:'2026-04-08', revisions:1, fichiers:10, notes:'Style dynamique, sous-titres colorés', devisRef:'DC-2026-018' },
  { id:2, titre:'Vidéo YouTube — Salon Léa', client:'Salon Léa', type:'Montage vidéo', categorie:'YouTube', montant:199, statut:'revision', monteur:'Maxime D.', dateDebut:'2026-04-02', dateFin:'2026-04-06', revisions:2, fichiers:1, notes:'Présentation du salon, ambiance chaleureuse', devisRef:'DC-2026-019' },
  { id:3, titre:'Gestion Instagram — Big Smoke', client:'Big Smoke Burgers', type:'Réseaux sociaux', categorie:'Instagram', montant:699, statut:'en_cours', monteur:'Sarah K.', dateDebut:'2026-04-01', dateFin:'2026-04-30', revisions:0, fichiers:12, notes:'3 posts/semaine + stories quotidiennes', devisRef:'DC-2026-015' },
  { id:4, titre:'Logo + Charte — Taco Loco', client:'Taco Loco', type:'Design', categorie:'Branding', montant:249, statut:'livre', monteur:'Léa M.', dateDebut:'2026-03-25', dateFin:'2026-04-02', revisions:3, fichiers:5, notes:'Style mexicain moderne, couleurs vives', devisRef:'DC-2026-014' },
  { id:5, titre:'5 Reels Instagram — @alex.fitness', client:'Alex Fitness', type:'Montage vidéo', categorie:'Reels', montant:199, statut:'demande', monteur:null, dateDebut:null, dateFin:null, revisions:0, fichiers:0, notes:'Montage sportif, transitions rapides', devisRef:null },
  { id:6, titre:'Campagne Meta Ads — La Trattoria', client:'La Trattoria', type:'Publicité', categorie:'Meta Ads', montant:399, statut:'paye', monteur:'Sarah K.', dateDebut:'2026-03-15', dateFin:'2026-03-31', revisions:1, fichiers:3, notes:'Objectif: +30% commandes en ligne', devisRef:'DC-2026-012' },
  { id:7, titre:'Clip promo 30s — Freample Course', client:'Freample Course', type:'Montage vidéo', categorie:'Clip', montant:349, statut:'devis_envoye', monteur:null, dateDebut:null, dateFin:null, revisions:0, fichiers:0, notes:'Clip publicitaire pour lancement', devisRef:'DC-2026-020' },
];

const DEVIS_INIT = [
  { id:'DC-2026-020', client:'Freample Course', objet:'Clip promotionnel 30s', montantHT:349, tva:20, statut:'envoye', date:'2026-04-03', validite:'30 jours' },
  { id:'DC-2026-019', client:'Salon Léa', objet:'Vidéo YouTube présentation', montantHT:199, tva:20, statut:'accepte', date:'2026-04-01', validite:'30 jours' },
  { id:'DC-2026-018', client:'Emma Lifestyle', objet:'Pack 10 TikToks', montantHT:349, tva:20, statut:'accepte', date:'2026-03-30', validite:'30 jours' },
  { id:'DC-2026-015', client:'Big Smoke Burgers', objet:'Gestion Instagram 1 mois', montantHT:699, tva:20, statut:'accepte', date:'2026-03-25', validite:'30 jours' },
  { id:'DC-2026-014', client:'Taco Loco', objet:'Logo + Charte graphique', montantHT:249, tva:20, statut:'accepte', date:'2026-03-20', validite:'30 jours' },
  { id:'DC-2026-012', client:'La Trattoria', objet:'Campagne Meta Ads 2 semaines', montantHT:399, tva:20, statut:'paye', date:'2026-03-12', validite:'30 jours' },
];

const FACTURES_INIT = [
  { id:'FC-2026-008', devis:'DC-2026-014', client:'Taco Loco', objet:'Logo + Charte graphique', montantHT:249, tva:20, dateEmission:'2026-04-02', statut:'envoyee' },
  { id:'FC-2026-007', devis:'DC-2026-012', client:'La Trattoria', objet:'Campagne Meta Ads', montantHT:399, tva:20, dateEmission:'2026-03-31', statut:'payee' },
  { id:'FC-2026-006', devis:'DC-2026-015', client:'Big Smoke Burgers', objet:'Gestion Instagram (acompte)', montantHT:350, tva:20, dateEmission:'2026-04-01', statut:'envoyee' },
];

const CLIENTS_INIT = [
  { id:1, nom:'Emma Lifestyle', type:'Influenceuse', email:'emma@lifestyle.com', tel:'06 12 34 56 78', projets:4, ca:1240, fidelite:'vip', note:5 },
  { id:2, nom:'Salon Léa', type:'Commerce', email:'contact@salonlea.fr', tel:'01 23 45 67 89', projets:3, ca:680, fidelite:'fidele', note:4.8 },
  { id:3, nom:'Big Smoke Burgers', type:'Restaurant', email:'marketing@bigsmoke.fr', tel:'01 34 56 78 90', projets:2, ca:1398, fidelite:'vip', note:4.9 },
  { id:4, nom:'Alex Fitness', type:'Influenceur', email:'alex@fitness.com', tel:'06 45 67 89 01', projets:6, ca:1890, fidelite:'vip', note:5 },
  { id:5, nom:'Taco Loco', type:'Restaurant', email:'hello@tacoloco.fr', tel:'01 56 78 90 12', projets:1, ca:249, fidelite:'nouveau', note:4.5 },
  { id:6, nom:'La Trattoria', type:'Restaurant', email:'contact@trattoria.fr', tel:'01 42 33 44 55', projets:2, ca:798, fidelite:'fidele', note:4.7 },
];

const EQUIPE_INIT = [
  { id:1, nom:'Maxime Dupont', poste:'Monteur vidéo senior', specialite:'TikTok, YouTube', projetsActifs:2, ca:2480, dispo:true, color:'#8B5CF6' },
  { id:2, nom:'Sarah Khelifi', poste:'Social Media Manager', specialite:'Instagram, Meta Ads', projetsActifs:2, ca:1798, dispo:true, color:'#EC4899' },
  { id:3, nom:'Léa Martin', poste:'Designer graphique', specialite:'Logo, Branding, Print', projetsActifs:0, ca:890, dispo:true, color:'#3B82F6' },
  { id:4, nom:'Hugo Bernard', poste:'Monteur vidéo junior', specialite:'Reels, Shorts', projetsActifs:0, ca:420, dispo:false, color:'#10B981' },
];

const TARIFS_GRILLE = [
  { cat:'Montage vidéo', items:[{nom:'TikTok / Reel (15-60s)',prix:49},{nom:'YouTube Short (60s-3min)',prix:89},{nom:'Vidéo YouTube (5-15min)',prix:199},{nom:'Clip promotionnel (30s-2min)',prix:349},{nom:'Pack 5 TikToks',prix:199},{nom:'Pack 10 TikToks',prix:349},{nom:'Pack 20 TikToks',prix:599}] },
  { cat:'Réseaux sociaux', items:[{nom:'Gestion 1 réseau / mois',prix:299},{nom:'Gestion 3 réseaux / mois',prix:699},{nom:'Stratégie + audit complet',prix:149},{nom:'Shooting photo (10 visuels)',prix:249}] },
  { cat:'Design graphique', items:[{nom:'Logo simple',prix:99},{nom:'Logo + charte graphique',prix:249},{nom:'Pack 10 visuels réseaux',prix:149},{nom:'Flyer / Affiche A4',prix:69},{nom:'Carte de visite (recto-verso)',prix:49}] },
  { cat:'Publicité en ligne', items:[{nom:'Setup campagne (1 plateforme)',prix:199},{nom:'Gestion Ads mensuelle',prix:399},{nom:'Audit + recommandations',prix:99}] },
];

const REVENUS_7J = [
  { jour:'Lun', montant:280 },{ jour:'Mar', montant:420 },{ jour:'Mer', montant:180 },
  { jour:'Jeu', montant:520 },{ jour:'Ven', montant:390 },{ jour:'Sam', montant:150 },
  { jour:'Dim', montant:0 },
];

const PAIEMENTS_INIT = [
  { id:'P001', date:'2026-04-04', client:'Emma Lifestyle', projet:'Pack 10 TikToks', montant:349, statut:'bloque', type:'paiement' },
  { id:'P002', date:'2026-04-04', client:'Big Smoke Burgers', projet:'Gestion Instagram', montant:699, statut:'bloque', type:'paiement' },
  { id:'P003', date:'2026-04-03', client:'Taco Loco', projet:'Logo + Charte', montant:249, statut:'libere', type:'paiement' },
  { id:'P004', date:'2026-04-02', client:'La Trattoria', projet:'Campagne Meta Ads', montant:399, statut:'libere', type:'paiement' },
  { id:'P005', date:'2026-04-01', client:'Alex Fitness', projet:'5 Reels Instagram', montant:199, statut:'libere', type:'paiement' },
  { id:'VIRT1', date:'2026-03-31', client:'', projet:'Virement mensuel', montant:1200, statut:'vire', type:'virement' },
];

const DEMO_FILES = [
  { nom:'montage_v1.mp4', taille:'48 Mo', date:'2026-04-03' },
  { nom:'montage_v2_final.mp4', taille:'52 Mo', date:'2026-04-05' },
];

const DEMO_MESSAGES = [
  { from:'Sarah K.', msg:'Brief reçu, je commence lundi !', time:'Lun 10:00', isMe:true },
  { from:'Emma Lifestyle', msg:'Super ! Hâte de voir le résultat 😍', time:'Lun 10:15', isMe:false },
  { from:'Sarah K.', msg:'Premier rendu envoyé, dis-moi ce que tu en penses', time:'Mar 16:00', isMe:true },
];

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD, flex:1, minWidth:140 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:accent||'#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#8B8B8B', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ statut }) {
  const s = PROJET_STATUS[statut]; if(!s) return null;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

function FidBadge({ f }) {
  const m = { vip:{bg:'#FEF3C7',c:'#92400E',l:'VIP'}, fidele:{bg:'#D1FAE5',c:'#065F46',l:'Fidèle'}, regulier:{bg:'#DBEAFE',c:'#1D4ED8',l:'Régulier'}, nouveau:{bg:'#F3F3F3',c:'#8B8B8B',l:'Nouveau'} };
  const s = m[f]||m.nouveau;
  return <span style={{ background:s.bg, color:s.c, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{s.l}</span>;
}

const TAB_MAP = { projets:'projets', devis:'devis', factures:'factures', paiements:'paiements', clients:'clients', tarifs:'tarifs', equipe:'equipe', rapports:'rapports' };

export default function DashboardCom() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB_MAP[searchParams.get('onglet')] || 'accueil');
  const [projets, setProjets] = useState(PROJETS_INIT);
  const [devis, setDevis] = useState(DEVIS_INIT);
  const [factures] = useState(FACTURES_INIT);
  const [clients] = useState(CLIENTS_INIT);
  const [equipe] = useState(EQUIPE_INIT);
  const [paiements, setPaiements] = useState(PAIEMENTS_INIT);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && TAB_MAP[o]) setTab(TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3500); };

  const [modalProjet, setModalProjet] = useState(null);
  const [modalDevis, setModalDevis] = useState(false);
  const [modalNewProjet, setModalNewProjet] = useState(false);
  const [modalVirement, setModalVirement] = useState(false);
  const [projetFilter, setProjetFilter] = useState('tous');
  const [paiementFilter, setPaiementFilter] = useState('tous');
  const [clientSearch, setClientSearch] = useState('');

  // IMPROVEMENT 5: Devis with detailed lines
  const [devisForm, setDevisForm] = useState({
    client:'', objet:'', tva:20, conditions:'Paiement à réception. Validité 30 jours.',
    lignes:[{ description:'', quantite:1, prixUnitaire:'' }]
  });

  // IMPROVEMENT 1: New project form
  const [newProjetForm, setNewProjetForm] = useState({
    client:'', type:'Montage vidéo', categorie:'TikTok', titre:'', brief:'', deadline:'', monteur:'', budget:''
  });

  // IMPROVEMENT 4: Chat messages per project
  const [projetMessages, setProjetMessages] = useState({});
  const [chatInput, setChatInput] = useState('');

  const projetsEnCours = projets.filter(p => ['en_cours','revision'].includes(p.statut)).length;
  const caTotal = projets.filter(p => ['livre','paye'].includes(p.statut)).reduce((s,p) => s+p.montant, 0);
  const revenuMois = projets.reduce((s,p) => s+p.montant, 0);
  const maxRev = Math.max(...REVENUS_7J.map(r => r.montant), 1);

  const filteredProjets = projetFilter === 'tous' ? projets : projets.filter(p => p.statut === projetFilter);
  const filteredClients = clients.filter(c => c.nom.toLowerCase().includes(clientSearch.toLowerCase()));

  const filteredPaiements = paiementFilter === 'tous' ? paiements : paiements.filter(p => p.statut === paiementFilter);
  const paiementsBloques = paiements.filter(p => p.statut === 'bloque').reduce((s,p) => s+p.montant, 0);
  const paiementsLiberes = paiements.filter(p => p.statut === 'libere').reduce((s,p) => s+p.montant, 0);
  const paiementsVires = paiements.filter(p => p.statut === 'vire').reduce((s,p) => s+p.montant, 0);

  const livrerProjet = (id) => { setProjets(prev => prev.map(p => p.id===id ? {...p, statut:'livre'} : p)); showToast('Projet livré au client !'); setModalProjet(null); };

  // IMPROVEMENT 1: Submit new project
  const submitNewProjet = () => {
    if (!newProjetForm.client || !newProjetForm.titre) return;
    const newId = Math.max(...projets.map(p => p.id)) + 1;
    setProjets(prev => [...prev, {
      id: newId,
      titre: newProjetForm.titre,
      client: newProjetForm.client,
      type: newProjetForm.type,
      categorie: newProjetForm.categorie,
      montant: Number(newProjetForm.budget) || 0,
      statut: 'demande',
      monteur: newProjetForm.monteur || null,
      dateDebut: null,
      dateFin: newProjetForm.deadline || null,
      revisions: 0,
      fichiers: 0,
      notes: newProjetForm.brief,
      devisRef: null,
    }]);
    showToast('Projet créé !');
    setModalNewProjet(false);
    setNewProjetForm({ client:'', type:'Montage vidéo', categorie:'TikTok', titre:'', brief:'', deadline:'', monteur:'', budget:'' });
  };

  // IMPROVEMENT 5: Submit devis with lines
  const submitDevis = () => {
    const totalHT = devisForm.lignes.reduce((s,l) => s + (Number(l.quantite)||0) * (Number(l.prixUnitaire)||0), 0);
    if (!devisForm.client || !devisForm.objet || totalHT <= 0) return;
    const newDevisId = `DC-2026-${String(devis.length + 21).padStart(3,'0')}`;
    setDevis(prev => [{ id:newDevisId, client:devisForm.client, objet:devisForm.objet, montantHT:totalHT, tva:devisForm.tva, statut:'envoye', date:'2026-04-04', validite:'30 jours' }, ...prev]);
    showToast('Devis créé et envoyé !');
    setModalDevis(false);
    setDevisForm({ client:'', objet:'', tva:20, conditions:'Paiement à réception. Validité 30 jours.', lignes:[{ description:'', quantite:1, prixUnitaire:'' }] });
  };

  // IMPROVEMENT 2: Send files to client
  const envoyerFichiers = (id) => {
    setProjets(prev => prev.map(p => p.id===id ? {...p, statut:'livre'} : p));
    showToast('Fichiers envoyés au client ! Facture générée automatiquement.');
  };

  // IMPROVEMENT 4: Send chat message
  const sendMessage = (projetId) => {
    if (!chatInput.trim()) return;
    const msgs = projetMessages[projetId] || [];
    setProjetMessages(prev => ({...prev, [projetId]: [...msgs, { from:'Moi', msg:chatInput.trim(), time:'Maintenant', isMe:true }]}));
    setChatInput('');
    showToast('Message envoyé');
  };

  // Devis line helpers
  const addDevisLine = () => setDevisForm(p => ({...p, lignes:[...p.lignes, { description:'', quantite:1, prixUnitaire:'' }]}));
  const updateDevisLine = (idx, field, val) => setDevisForm(p => ({...p, lignes:p.lignes.map((l,i) => i===idx ? {...l, [field]:val} : l)}));
  const removeDevisLine = (idx) => { if(devisForm.lignes.length > 1) setDevisForm(p => ({...p, lignes:p.lignes.filter((_,i) => i!==idx)})); };

  const devisTotalHT = devisForm.lignes.reduce((s,l) => s + (Number(l.quantite)||0) * (Number(l.prixUnitaire)||0), 0);
  const devisTVA = Math.round(devisTotalHT * devisForm.tva / 100);
  const devisTotalTTC = devisTotalHT + devisTVA;

  const getMessagesForProjet = (projetId) => {
    const custom = projetMessages[projetId] || [];
    return [...DEMO_MESSAGES, ...custom];
  };

  const inputStyle = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };
  const labelStyle = { fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 };

  return (
    <div style={{ padding:'24px 28px', background:V_BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1C1C1E' }}>🎬 Freample Com</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:2 }}>Communication · Marketing · Montage</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setModalNewProjet(true)} style={{ ...BTN, display:'flex', alignItems:'center', gap:6, background:'#059669' }}>+ Nouveau projet</button>
          <button onClick={() => setModalDevis(true)} style={{ ...BTN, display:'flex', alignItems:'center', gap:6 }}>+ Nouveau devis</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E9E5F5', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight: tab===t.id ? 700 : 500, background: tab===t.id ? V : 'transparent', color: tab===t.id ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* TAB: Accueil */}
      {tab === 'accueil' && (<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Projets en cours" value={projetsEnCours} accent={V} />
          <KpiCard label="CA livré" value={`${caTotal}€`} accent="#059669" />
          <KpiCard label="Revenu potentiel" value={`${revenuMois}€`} accent="#3B82F6" />
          <KpiCard label="Clients actifs" value={clients.length} accent="#EC4899" />
        </div>
        <div style={CARD}>
          <div style={HDR}>Projets actifs</div>
          {projets.filter(p => !['livre','paye'].includes(p.statut)).map(p => (
            <div key={p.id} onClick={() => setModalProjet(p)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#FAFAFA', borderRadius:10, marginBottom:8, cursor:'pointer', border:'1px solid #F0F0F0' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:V_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎬</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{p.titre}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{p.type} · {p.monteur || 'Non assigné'} · {p.montant}€</div>
              </div>
              <StatusBadge statut={p.statut} />
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Projets */}
      {tab === 'projets' && (<div>
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {[['tous','Tous'],['demande','Demandes'],['devis_envoye','Devis envoyé'],['en_cours','En cours'],['revision','Révision'],['livre','Livrés'],['paye','Payés']].map(([v,l]) => (
            <button key={v} onClick={() => setProjetFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: projetFilter===v ? 700 : 500, background: projetFilter===v ? V : '#F3F3F3', color: projetFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
          ))}
        </div>
        {filteredProjets.map(p => (
          <div key={p.id} onClick={() => setModalProjet(p)} style={{ ...CARD, marginBottom:10, cursor:'pointer', padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{p.titre}</div>
              <StatusBadge statut={p.statut} />
            </div>
            <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:6 }}>{p.type} · {p.categorie} · {p.client}</div>
            <div style={{ display:'flex', gap:16, fontSize:12, color:'#8B8B8B' }}>
              <span>👤 {p.monteur || 'Non assigné'}</span>
              <span>📁 {p.fichiers} fichier{p.fichiers>1?'s':''}</span>
              <span>🔄 {p.revisions} révision{p.revisions>1?'s':''}</span>
            </div>
            <div style={{ fontWeight:800, color:V, fontSize:16, marginTop:8 }}>{p.montant}€</div>
          </div>
        ))}
      </div>)}

      {/* TAB: Devis */}
      {tab === 'devis' && (<div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700 }}>Devis</div>
          <button onClick={() => setModalDevis(true)} style={BTN}>+ Créer un devis</button>
        </div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {devis.map((d,i) => (
            <div key={d.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < devis.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{d.objet}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{d.client} · {d.id} · {d.date}</div>
              </div>
              <div style={{ fontWeight:800, color:V, fontSize:15 }}>{d.montantHT}€ HT</div>
              <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: d.statut==='paye'?'#D1FAE5':d.statut==='accepte'?'#DBEAFE':'#FEF3C7', color: d.statut==='paye'?'#065F46':d.statut==='accepte'?'#1D4ED8':'#D97706' }}>
                {d.statut==='paye'?'✓ Payé':d.statut==='accepte'?'✓ Accepté':'En attente'}
              </span>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Facturation */}
      {tab === 'factures' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Factures</div>
        <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
          <KpiCard label="Total facturé" value={`${factures.reduce((s,f)=>s+f.montantHT,0)}€`} accent={V} />
          <KpiCard label="Payées" value={`${factures.filter(f=>f.statut==='payee').reduce((s,f)=>s+f.montantHT,0)}€`} accent="#059669" />
          <KpiCard label="En attente" value={`${factures.filter(f=>f.statut==='envoyee').reduce((s,f)=>s+f.montantHT,0)}€`} accent="#D97706" />
        </div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {factures.map((f,i) => (
            <div key={f.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < factures.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{f.objet}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{f.client} · {f.id} · {f.dateEmission}</div>
              </div>
              <div style={{ fontWeight:800, color:V, fontSize:15 }}>{Math.round(f.montantHT*(1+f.tva/100))}€ TTC</div>
              <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: f.statut==='payee'?'#D1FAE5':'#FEF3C7', color: f.statut==='payee'?'#065F46':'#D97706' }}>
                {f.statut==='payee'?'✓ Payée':'En attente'}
              </span>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Paiements (IMPROVEMENT 3) */}
      {tab === 'paiements' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Paiements</div>
        <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
          <KpiCard label="Bloqués" value={`${paiementsBloques}€`} accent="#D97706" />
          <KpiCard label="Libérés" value={`${paiementsLiberes}€`} accent="#059669" />
          <KpiCard label="Virés" value={`${paiementsVires}€`} accent={V} />
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {[['tous','Tous'],['bloque','Bloqués'],['libere','Libérés'],['vire','Virés']].map(([v,l]) => (
            <button key={v} onClick={() => setPaiementFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: paiementFilter===v ? 700 : 500, background: paiementFilter===v ? V : '#F3F3F3', color: paiementFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
          ))}
        </div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {filteredPaiements.map((p,i) => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredPaiements.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ width:40, height:40, borderRadius:10, background: p.type==='virement' ? '#DBEAFE' : V_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                {p.type==='virement' ? '🏦' : '💳'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{p.projet}</div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{p.client ? `${p.client} · ` : ''}{p.id} · {p.date}</div>
              </div>
              <div style={{ fontWeight:800, color: p.type==='virement' ? '#1D4ED8' : V, fontSize:15 }}>{p.type==='virement' ? '-' : '+'}{p.montant}€</div>
              <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: p.statut==='vire'?'#DBEAFE':p.statut==='libere'?'#D1FAE5':'#FEF3C7', color: p.statut==='vire'?'#1D4ED8':p.statut==='libere'?'#065F46':'#D97706' }}>
                {p.statut==='vire'?'Viré':p.statut==='libere'?'Libéré':'Bloqué'}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:20, textAlign:'center' }}>
          <button onClick={() => setModalVirement(true)} style={{ ...BTN, padding:'12px 28px' }}>🏦 Demander un virement</button>
        </div>
      </div>)}

      {/* TAB: Clients */}
      {tab === 'clients' && (<div>
        <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Rechercher un client..." style={{ width:'100%', maxWidth:360, padding:'10px 16px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', marginBottom:20, boxSizing:'border-box' }} />
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {filteredClients.map((c,i) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom: i < filteredClients.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:V_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:V, fontSize:15 }}>{c.nom[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{c.nom} <span style={{ fontSize:12, color:'#8B8B8B', fontWeight:400 }}>· {c.type}</span></div>
                <div style={{ fontSize:12, color:'#8B8B8B' }}>{c.projets} projets · {c.email}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:800, color:V, fontSize:14 }}>{c.ca}€</div>
                <FidBadge f={c.fidelite} />
              </div>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Grille tarifaire */}
      {tab === 'tarifs' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Grille tarifaire</div>
        {TARIFS_GRILLE.map(t => (
          <div key={t.cat} style={{ marginBottom:20 }}>
            <div style={HDR}>{t.cat}</div>
            <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
              {t.items.map((item,j) => (
                <div key={j} style={{ display:'flex', justifyContent:'space-between', padding:'12px 20px', borderBottom: j < t.items.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                  <span style={{ fontSize:14 }}>{item.nom}</span>
                  <span style={{ fontSize:14, fontWeight:800, color:V }}>{item.prix}€</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>)}

      {/* TAB: Équipe */}
      {tab === 'equipe' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Équipe créative</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
          {equipe.map(e => (
            <div key={e.id} style={CARD}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:`${e.color}18`, border:`2px solid ${e.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:e.color, fontSize:14 }}>{e.nom.split(' ').map(n=>n[0]).join('')}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{e.nom}</div>
                  <div style={{ fontSize:12, color:'#8B8B8B' }}>{e.poste}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:'#8B8B8B', marginBottom:10 }}>🎯 {e.specialite}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}><span style={{ color:'#8B8B8B' }}>Projets actifs</span><span style={{ fontWeight:700 }}>{e.projetsActifs}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}><span style={{ color:'#8B8B8B' }}>CA généré</span><span style={{ fontWeight:700, color:V }}>{e.ca}€</span></div>
              <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: e.dispo ? '#16A34A' : '#DC2626' }} />
                <span style={{ fontSize:12, fontWeight:600, color: e.dispo ? '#16A34A' : '#DC2626' }}>{e.dispo ? 'Disponible' : 'Occupé'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Rapports */}
      {tab === 'rapports' && (<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="CA ce mois" value={`${revenuMois}€`} accent={V} />
          <KpiCard label="Projets livrés" value={projets.filter(p=>p.statut==='livre'||p.statut==='paye').length} accent="#059669" />
          <KpiCard label="Taux conversion devis" value="83%" accent="#3B82F6" />
          <KpiCard label="Client top" value="Alex Fitness" sub="1 890€ de CA" accent="#EC4899" />
        </div>
        <div style={{ ...CARD, marginBottom:24 }}>
          <div style={HDR}>Revenus des 7 derniers jours</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
            {REVENUS_7J.map(r => (
              <div key={r.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:12, fontWeight:700, color:V }}>{r.montant}€</div>
                <div style={{ width:'100%', background:V, borderRadius:'6px 6px 0 0', height:`${Math.max(4,Math.round((r.montant/maxRev)*120))}px` }} />
                <div style={{ fontSize:11, color:'#8B8B8B', fontWeight:600 }}>{r.jour}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={CARD}>
            <div style={HDR}>Meilleurs clients</div>
            {[...clients].sort((a,b)=>b.ca-a.ca).slice(0,5).map((c,i) => (
              <div key={c.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:13 }}>{i+1}. {c.nom} <span style={{ color:'#8B8B8B', fontSize:11 }}>({c.type})</span></span>
                <span style={{ fontWeight:700, color:V, fontSize:13 }}>{c.ca}€</span>
              </div>
            ))}
          </div>
          <div style={CARD}>
            <div style={HDR}>Répartition par service</div>
            {[{cat:'Montage vidéo',pct:52,color:V},{cat:'Réseaux sociaux',pct:24,color:'#EC4899'},{cat:'Design',pct:14,color:'#3B82F6'},{cat:'Publicité',pct:10,color:'#F59E0B'}].map(c => (
              <div key={c.cat} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}><span>{c.cat}</span><span style={{ fontWeight:700 }}>{c.pct}%</span></div>
                <div style={{ background:'#F3F3F3', borderRadius:4, height:6 }}><div style={{ background:c.color, borderRadius:4, height:6, width:`${c.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>)}

      {/* MODAL: Projet detail (with IMPROVEMENT 2 + 4) */}
      {modalProjet && (
        <div style={OVL} onClick={() => { setModalProjet(null); setChatInput(''); }}>
          <div style={{ ...BOX, maxWidth:620 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:2 }}>{modalProjet.titre}</div>
            <div style={{ color:'#8B8B8B', fontSize:14, marginBottom:16 }}>{modalProjet.type} · {modalProjet.categorie} · <StatusBadge statut={modalProjet.statut} /></div>
            <div style={{ ...CARD, background:'#FAFAFA', marginBottom:16 }}>
              {[{l:'Client',v:modalProjet.client},{l:'Monteur',v:modalProjet.monteur||'Non assigné'},{l:'Montant',v:`${modalProjet.montant}€`},{l:'Fichiers',v:`${modalProjet.fichiers} fichier(s)`},{l:'Révisions',v:modalProjet.revisions},{l:'Devis',v:modalProjet.devisRef||'—'}].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#8B8B8B' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
                </div>
              ))}
            </div>
            {modalProjet.notes && <div style={{ padding:'12px 14px', background:V_SOFT, borderRadius:10, marginBottom:16, fontSize:13, color:'#5B21B6' }}>📝 {modalProjet.notes}</div>}

            {/* IMPROVEMENT 2: Fichiers livrés */}
            {['en_cours','revision','livre','paye'].includes(modalProjet.statut) && (
              <div style={{ marginBottom:16 }}>
                <div style={HDR}>📁 Fichiers livrés</div>
                <div style={{ ...CARD, background:'#FAFAFA', padding:'12px 16px' }}>
                  {DEMO_FILES.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom: i < DEMO_FILES.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>🎬 {f.nom}</div>
                        <div style={{ fontSize:11, color:'#8B8B8B' }}>{f.taille} · {f.date}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <button onClick={() => showToast('Fichier ajouté')} style={{ ...GHOST, fontSize:13, padding:'8px 14px' }}>📎 Ajouter un fichier</button>
                    {['en_cours','revision'].includes(modalProjet.statut) && (
                      <button onClick={() => { envoyerFichiers(modalProjet.id); setModalProjet(null); }} style={{ ...BTN, fontSize:13, padding:'8px 14px', background:'#059669' }}>📦 Envoyer au client</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* IMPROVEMENT 4: Messagerie par projet */}
            <div style={{ marginBottom:16 }}>
              <div style={HDR}>💬 Messages</div>
              <div style={{ ...CARD, background:'#FAFAFA', padding:'12px 16px' }}>
                <div style={{ maxHeight:200, overflowY:'auto', marginBottom:12 }}>
                  {getMessagesForProjet(modalProjet.id).map((m,i) => (
                    <div key={i} style={{ display:'flex', flexDirection: m.isMe ? 'row-reverse' : 'row', alignItems:'flex-end', gap:8, marginBottom:10 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background: m.isMe ? V_SOFT : '#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color: m.isMe ? V : '#1D4ED8', flexShrink:0 }}>
                        {m.from[0]}
                      </div>
                      <div style={{ maxWidth:'70%' }}>
                        <div style={{ fontSize:11, color:'#8B8B8B', marginBottom:2, textAlign: m.isMe ? 'right' : 'left' }}>{m.from} · {m.time}</div>
                        <div style={{ background: m.isMe ? V_SOFT : '#DBEAFE', padding:'8px 12px', borderRadius: m.isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', fontSize:13, color:'#1C1C1E' }}>
                          {m.msg}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter') sendMessage(modalProjet.id); }}
                    placeholder="Écrire un message..."
                    style={{ ...inputStyle, flex:1 }}
                  />
                  <button onClick={() => sendMessage(modalProjet.id)} style={{ ...BTN, padding:'10px 16px' }}>Envoyer</button>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              {['en_cours','revision'].includes(modalProjet.statut) && <button onClick={() => livrerProjet(modalProjet.id)} style={{ ...BTN, flex:1, padding:'12px', background:'#059669' }}>📦 Livrer au client</button>}
              <button onClick={() => { setModalProjet(null); setChatInput(''); }} style={{ ...GHOST, flex:1, padding:'12px' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nouveau devis (IMPROVEMENT 5: Detailed lines) */}
      {modalDevis && (
        <div style={OVL} onClick={() => setModalDevis(false)}>
          <div style={{ ...BOX, maxWidth:640 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Créer un devis</div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Client *</label>
              <select value={devisForm.client} onChange={e => setDevisForm(p => ({...p, client:e.target.value}))} style={inputStyle}>
                <option value="">-- Sélectionner un client --</option>
                {CLIENTS_INIT.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Objet *</label>
              <input type="text" value={devisForm.objet} onChange={e => setDevisForm(p => ({...p, objet:e.target.value}))} placeholder="Pack 10 TikToks, Logo, Gestion Instagram..." style={inputStyle} />
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ ...labelStyle, marginBottom:0 }}>Lignes de devis *</label>
                <button onClick={addDevisLine} style={{ ...GHOST, padding:'4px 12px', fontSize:12 }}>+ Ajouter une ligne</button>
              </div>
              {devisForm.lignes.map((ligne, idx) => (
                <div key={idx} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                  <input type="text" value={ligne.description} onChange={e => updateDevisLine(idx, 'description', e.target.value)} placeholder="Description" style={{ ...inputStyle, flex:3 }} />
                  <input type="number" value={ligne.quantite} onChange={e => updateDevisLine(idx, 'quantite', e.target.value)} placeholder="Qté" min="1" style={{ ...inputStyle, flex:1, textAlign:'center' }} />
                  <input type="number" value={ligne.prixUnitaire} onChange={e => updateDevisLine(idx, 'prixUnitaire', e.target.value)} placeholder="Prix €" min="0" style={{ ...inputStyle, flex:1, textAlign:'right' }} />
                  <div style={{ fontSize:13, fontWeight:700, color:V, minWidth:60, textAlign:'right' }}>{((Number(ligne.quantite)||0)*(Number(ligne.prixUnitaire)||0))}€</div>
                  {devisForm.lignes.length > 1 && (
                    <button onClick={() => removeDevisLine(idx)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#DC2626', padding:4 }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>TVA (%)</label>
              <select value={devisForm.tva} onChange={e => setDevisForm(p => ({...p, tva:Number(e.target.value)}))} style={inputStyle}>
                <option value={20}>20%</option><option value={10}>10%</option><option value={5.5}>5.5%</option><option value={0}>0%</option>
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Conditions</label>
              <textarea value={devisForm.conditions} onChange={e => setDevisForm(p => ({...p, conditions:e.target.value}))} rows={2} style={{ ...inputStyle, resize:'vertical' }} />
            </div>

            {devisTotalHT > 0 && (
              <div style={{ padding:'14px 16px', background:V_SOFT, borderRadius:10, marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:6 }}><span style={{ color:'#555' }}>Total HT</span><span style={{ fontWeight:700 }}>{devisTotalHT}€</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:6 }}><span style={{ color:'#555' }}>TVA ({devisForm.tva}%)</span><span style={{ fontWeight:700 }}>{devisTVA}€</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800, borderTop:'1px solid #C4B5FD', paddingTop:8, marginTop:4 }}><span>Total TTC</span><span style={{ color:V }}>{devisTotalTTC}€</span></div>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitDevis} style={{ ...BTN, flex:1, padding:'12px' }}>📝 Créer et envoyer</button>
              <button onClick={() => setModalDevis(false)} style={{ ...GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nouveau Projet (IMPROVEMENT 1) */}
      {modalNewProjet && (
        <div style={OVL} onClick={() => setModalNewProjet(false)}>
          <div style={{ ...BOX, maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Nouveau Projet</div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Client *</label>
              <select value={newProjetForm.client} onChange={e => setNewProjetForm(p => ({...p, client:e.target.value}))} style={inputStyle}>
                <option value="">-- Sélectionner un client --</option>
                {CLIENTS_INIT.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Type de prestation *</label>
              <select value={newProjetForm.type} onChange={e => setNewProjetForm(p => ({...p, type:e.target.value}))} style={inputStyle}>
                {['Montage vidéo','Réseaux sociaux','Design','Publicité'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Catégorie *</label>
              <select value={newProjetForm.categorie} onChange={e => setNewProjetForm(p => ({...p, categorie:e.target.value}))} style={inputStyle}>
                {['TikTok','YouTube','Reels','Stories','Instagram','Logo','Branding','Meta Ads','Google Ads'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Titre du projet *</label>
              <input type="text" value={newProjetForm.titre} onChange={e => setNewProjetForm(p => ({...p, titre:e.target.value}))} placeholder="Ex: Pack 10 TikToks — @client" style={inputStyle} />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Brief / Description</label>
              <textarea value={newProjetForm.brief} onChange={e => setNewProjetForm(p => ({...p, brief:e.target.value}))} rows={3} placeholder="Décrivez le projet, les attentes, le style souhaité..." style={{ ...inputStyle, resize:'vertical' }} />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Deadline</label>
              <input type="date" value={newProjetForm.deadline} onChange={e => setNewProjetForm(p => ({...p, deadline:e.target.value}))} style={inputStyle} />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Monteur assigné</label>
              <select value={newProjetForm.monteur} onChange={e => setNewProjetForm(p => ({...p, monteur:e.target.value}))} style={inputStyle}>
                <option value="">Non assigné</option>
                {EQUIPE_INIT.map(e => <option key={e.id} value={e.nom}>{e.nom} — {e.poste}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={labelStyle}>Budget (€)</label>
              <input type="number" value={newProjetForm.budget} onChange={e => setNewProjetForm(p => ({...p, budget:e.target.value}))} placeholder="349" min="0" style={inputStyle} />
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitNewProjet} style={{ ...BTN, flex:1, padding:'12px' }}>✅ Créer le projet</button>
              <button onClick={() => setModalNewProjet(false)} style={{ ...GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Demander un virement (IMPROVEMENT 3) */}
      {modalVirement && (
        <div style={OVL} onClick={() => setModalVirement(false)}>
          <div style={BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>Demander un virement</div>
            <div style={{ ...CARD, background:'#FAFAFA', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                <span style={{ color:'#8B8B8B' }}>Solde libéré disponible</span>
                <span style={{ fontWeight:800, color:'#059669' }}>{paiementsLiberes}€</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:14 }}>
                <span style={{ color:'#8B8B8B' }}>Paiements bloqués</span>
                <span style={{ fontWeight:800, color:'#D97706' }}>{paiementsBloques}€</span>
              </div>
            </div>
            <p style={{ fontSize:13, color:'#8B8B8B', marginBottom:20 }}>Le virement sera effectué sous 2-3 jours ouvrés sur votre compte bancaire enregistré.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => {
                const virId = `VIRT${paiements.filter(p=>p.type==='virement').length + 1}`;
                setPaiements(prev => [...prev, { id:virId, date:'2026-04-04', client:'', projet:'Virement demandé', montant:paiementsLiberes, statut:'vire', type:'virement' }]);
                showToast(`Virement de ${paiementsLiberes}€ demandé !`);
                setModalVirement(false);
              }} style={{ ...BTN, flex:1, padding:'12px' }}>🏦 Confirmer le virement</button>
              <button onClick={() => setModalVirement(false)} style={{ ...GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{ position:'fixed', top:24, right:24, background:'#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000, maxWidth:360 }}>{toast}</div>}
    </div>
  );
}
