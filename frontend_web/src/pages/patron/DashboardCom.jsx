import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTarifs, saveTarifs, resetTarifs } from '../../data/tarifsCom';
import api from '../../services/api';

const V = '#8B5CF6';
const V_BG = '#F5F3FF';
const V_SOFT = '#EDE9FE';

const CARD = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E9E5F5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const HDR = { fontSize:13, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN = { background:V, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const GHOST = { background:'transparent', color:'#6B7280', border:'1px solid #E9E5F5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const OVL = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:560, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil',   icon:'🏠', label:'Accueil' },
  { id:'projets',   icon:'🎬', label:'Projets' },
  { id:'archives',  icon:'📦', label:'Archives' },
  { id:'devis',     icon:'📝', label:'Devis' },
  { id:'factures',  icon:'💳', label:'Facturation' },
  { id:'paiements', icon:'💳', label:'Paiements' },
  { id:'clients',   icon:'👥', label:'Clients' },
  { id:'tarifs',    icon:'💰', label:'Grille tarifaire' },
  { id:'portfolio', icon:'🎥', label:'Portfolio' },
  { id:'equipe',    icon:'👨‍💻', label:'Équipe' },
  { id:'rapports',  icon:'📊', label:'Rapports' },
  { id:'stats',     icon:'📈', label:'Statistiques site' },
];

const PROJET_STATUS = {
  demande:    { label:'Demande',    bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  devis_envoye:{ label:'Devis envoyé', bg:'#DBEAFE', border:'#93C5FD', color:'#1D4ED8' },
  en_cours:   { label:'En cours',   bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  revision:   { label:'Révision',   bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  livre:      { label:'Livré',      bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
  paye:       { label:'Payé',       bg:'#F0FDF4', border:'#5EEAD4', color:'#0F766E' },
  archive:    { label:'Archivé',    bg:'#F3F3F3', border:'#E5E5E5', color:'#636363' },
};

// ── Données vides — les vrais projets viennent de la base via /com/projets ──
const PROJETS_INIT = [];
const DEVIS_INIT = [];
const FACTURES_INIT = [];
const CLIENTS_INIT = [];

const EQUIPE_INIT = [
  { id:1, nom:'Vassili', poste:'Admin · Tech & Stratégie', specialite:'Développement, Produit, Direction', projetsActifs:0, projetsTotal:0, charge:0, dispo:true, color:'#8B5CF6' },
  { id:2, nom:'Mathieu', poste:'Admin · Gestion & Com', specialite:'Gestion de projet, Stratégie, Relation client', projetsActifs:0, projetsTotal:0, charge:0, dispo:true, color:'#3B82F6' },
  { id:3, nom:'Marius', poste:'Monteur · Vidéo & Prospection', specialite:'TikTok, YouTube, Reels, Montage, Prospection', projetsActifs:0, projetsTotal:0, charge:0, dispo:true, color:'#EC4899' },
  { id:4, nom:'Maxence', poste:'Monteur · Vidéo & Création', specialite:'TikTok, Reels, Shorts, Montage, Effets', projetsActifs:0, projetsTotal:0, charge:0, dispo:true, color:'#10B981' },
];

const REVENUS_7J = [
  { jour:'Lun', montant:0 },{ jour:'Mar', montant:0 },{ jour:'Mer', montant:0 },
  { jour:'Jeu', montant:0 },{ jour:'Ven', montant:0 },{ jour:'Sam', montant:0 },
  { jour:'Dim', montant:0 },
];

const PAIEMENTS_INIT = [];

const DEMO_FILES = [];
const DEMO_MESSAGES = [];

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD, flex:1, minWidth:140 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#636363', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:accent||'#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#636363', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ statut }) {
  const s = PROJET_STATUS[statut]; if(!s) return null;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

function FidBadge({ f }) {
  const m = { vip:{bg:'#FEF3C7',c:'#92400E',l:'VIP'}, fidele:{bg:'#D1FAE5',c:'#065F46',l:'Fidèle'}, regulier:{bg:'#DBEAFE',c:'#1D4ED8',l:'Régulier'}, nouveau:{bg:'#F3F3F3',c:'#636363',l:'Nouveau'} };
  const s = m[f]||m.nouveau;
  return <span style={{ background:s.bg, color:s.c, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{s.l}</span>;
}

const TAB_MAP = { projets:'projets', agenda:'agenda', archives:'archives', devis:'devis', factures:'factures', paiements:'paiements', clients:'clients', tarifs:'tarifs', portfolio:'portfolio', equipe:'equipe', rapports:'rapports', stats:'stats' };

const MONTEUR_COLORS = { 'Marius':{ bg:'#DBEAFE', border:'#3B82F6', color:'#1D4ED8', dot:'#3B82F6' }, 'Maxence':{ bg:'#FEE2E2', border:'#EF4444', color:'#DC2626', dot:'#EF4444' }, 'Vassili':{ bg:'#F5F3FF', border:'#8B5CF6', color:'#5B21B6', dot:'#8B5CF6' }, 'Mathieu':{ bg:'#D1FAE5', border:'#10B981', color:'#065F46', dot:'#10B981' } };
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const HEURES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

export default function DashboardCom() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB_MAP[searchParams.get('onglet')] || 'accueil');
  const [projets, setProjets] = useState(PROJETS_INIT);
  const [devis, setDevis] = useState(DEVIS_INIT);
  const [factures] = useState(FACTURES_INIT);
  const [clients] = useState(CLIENTS_INIT);
  const [equipe] = useState(EQUIPE_INIT);
  const [tarifs, setTarifs] = useState(getTarifs);
  const [editingTarif, setEditingTarif] = useState(null); // {catIdx, itemIdx}
  const [editPrix, setEditPrix] = useState('');
  const [editNom, setEditNom] = useState('');
  const PACKS_DEFAULT = [
    { nom:'Starter', prix:149, desc:'4 TikToks par mois', populaire:false, features:['4 TikToks / mois','Sous-titres animés','Musique tendance','1 révision / vidéo','Livraison 72h'] },
    { nom:'Growth',  prix:349, desc:'10 TikToks + 5 Reels', populaire:true, features:['10 TikToks / mois','5 Reels Instagram','Sous-titres + effets','2 révisions / vidéo','Livraison 72h','Stratégie contenu'] },
    { nom:'Pro',     prix:699, desc:'20 TikToks + gestion RS', populaire:false, features:['20 TikToks / mois','10 Reels Instagram','Gestion 1 réseau social','Révisions illimitées','Livraison 72h','Appel stratégie mensuel'] },
  ];
  const [packs, setPacks] = useState(PACKS_DEFAULT);
  const [editingPack, setEditingPack] = useState(null); // index
  const [portfolio, setPortfolio] = useState([]);
  const [newVideo, setNewVideo] = useState({ titre:'', description:'', categorie:'Montage vidéo', video_url:'', thumbnail_url:'' });
  const [siteStats, setSiteStats] = useState(null);
  const [paiements, setPaiements] = useState(PAIEMENTS_INIT);
  const [vue, setVue] = useState(localStorage.getItem('com_vue') || 'monteur');

  // Écouter le changement de vue depuis la sidebar
  useEffect(() => {
    const handler = (e) => { setVue(e.detail); setTab('accueil'); };
    window.addEventListener('com-vue-change', handler);
    return () => window.removeEventListener('com-vue-change', handler);
  }, []);
  const [agendaEvents, setAgendaEvents] = useState([]);
  const [chrono, setChrono] = useState(() => {
    try { return JSON.parse(localStorage.getItem('com_chrono') || '{}'); } catch { return {}; }
  }); // { [projetId]: { total: secondes, running: bool, start: timestamp } }
  const [agendaModal, setAgendaModal] = useState(null); // null | { jour, heure } | event object
  const [agendaForm, setAgendaForm] = useState({ titre:'', heure:'09:00', heureFin:'10:00', jour:0, type:'montage', projet:'', personne:'Marius' });
  const [semainOffset, setSemainOffset] = useState(0);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && TAB_MAP[o]) {
      setTab(TAB_MAP[o]);
      // Sync vue si l'onglet n'est pas dans la vue actuelle
      const monteurTabs = ['accueil','projets','agenda','archives','equipe'];
      if (vue === 'monteur' && !monteurTabs.includes(TAB_MAP[o])) setVue('gestion');
      if (vue === 'gestion' && monteurTabs.includes(TAB_MAP[o]) && !['projets','archives','equipe'].includes(TAB_MAP[o])) {} // projets/archives/equipe sont dans les deux
    }
    else if (!o) setTab('accueil');
  }, [searchParams]);

  // Charger les vrais projets depuis l'API
  useEffect(() => {
    api.get('/com/projets').then(r => {
      if (r.data?.projets?.length) {
        const mapped = r.data.projets.map(p => ({
          id: p.id,
          titre: `${p.type}${p.format ? ' · ' + p.format : ''} — ${p.client_nom}`,
          client: p.client_nom,
          type: p.type,
          categorie: p.format || p.type,
          montant: Number(p.montant_ht) || 0,
          statut: p.statut === 'brief_recu' ? 'demande' : p.statut,
          responsable: p.responsable || null,
          dateDebut: p.created_at?.split('T')[0],
          dateFin: p.deadline,
          revisions: 0,
          fichiers: 0,
          notes: p.description || '',
          devisRef: p.devis_ref || null,
          clientEmail: p.client_email,
          clientTel: p.client_telephone,
          quantite: p.quantite || '1',
          style: p.style || '',
          options: p.options || [],
          reference: p.reference || '',
          fichiersFaits: p.fichiers_faits || 0,
          dbId: p.id,
        }));
        setProjets(mapped);
      }
    }).catch(() => {});

    // Charger agenda depuis l'API
    api.get('/com/agenda').then(r => {
      if (r.data?.events) setAgendaEvents(r.data.events.map(e => ({ ...e, id:e.id, heureFin:e.heure_fin })));
    }).catch(() => {});

    // Charger tarifs + packs depuis l'API
    api.get('/com/tarifs').then(r => {
      if (r.data?.tarifs) { setTarifs(r.data.tarifs); saveTarifs(r.data.tarifs); }
      if (r.data?.packs) setPacks(r.data.packs);
    }).catch(() => {});
    // Charger portfolio
    api.get('/com/portfolio').then(r => setPortfolio(r.data.items || [])).catch(() => {});
    // Charger stats site
    api.get('/analytics/stats').then(r => setSiteStats(r.data)).catch(() => {});
  }, []);

  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3500); };

  const [modalProjet, setModalProjet] = useState(null);
  const [modalDevis, setModalDevis] = useState(false);
  const [modalNewProjet, setModalNewProjet] = useState(false);
  const [modalVirement, setModalVirement] = useState(false);
  const [projetFilter, setProjetFilter] = useState('tous');
  const [mesTaches, setMesTaches] = useState(false); // filtre "Mes tâches"
  const [paiementFilter, setPaiementFilter] = useState('tous');
  const [clientSearch, setClientSearch] = useState('');

  // IMPROVEMENT 5: Devis with detailed lines
  const [devisForm, setDevisForm] = useState({
    client:'', objet:'', tva:20, conditions:'Paiement à réception. Validité 30 jours.',
    lignes:[{ description:'', quantite:1, prixUnitaire:'' }]
  });

  // IMPROVEMENT 1: New project form
  const [newProjetForm, setNewProjetForm] = useState({
    client:'', type:'Montage vidéo', categorie:'TikTok', titre:'', brief:'', deadline:'', responsable:'', budget:''
  });

  // IMPROVEMENT 4: Chat messages per project
  const [projetMessages, setProjetMessages] = useState({});
  const [chatInput, setChatInput] = useState('');

  const projetsEnCours = projets.filter(p => ['en_cours','revision'].includes(p.statut)).length;
  const caTotal = projets.filter(p => ['livre','paye'].includes(p.statut)).reduce((s,p) => s+p.montant, 0);
  const revenuMois = projets.reduce((s,p) => s+p.montant, 0);
  const maxRev = Math.max(...REVENUS_7J.map(r => r.montant), 1);

  let filteredProjets = (projetFilter === 'tous' ? projets : projets.filter(p => p.statut === projetFilter)).filter(p => p.statut !== 'archive');
  if (mesTaches) filteredProjets = filteredProjets.filter(p => p.responsable); // only assigned
  const filteredClients = clients.filter(c => c.nom.toLowerCase().includes(clientSearch.toLowerCase()));

  // Calcul avancement auto : fichiers livrés / quantité totale
  const getAvancement = (p) => {
    const qte = Number(p.quantite) || 1;
    const fait = Number(p.fichiersFaits) || 0;
    if (p.statut === 'livre' || p.statut === 'paye') return 100;
    if (p.statut === 'demande' || p.statut === 'devis_envoye') return 0;
    if (fait >= qte) return 100;
    return Math.round((fait / qte) * 100);
  };

  // Deadline urgence
  const getUrgence = (p) => {
    if (!p.dateFin) return null;
    const diff = Math.ceil((new Date(p.dateFin) - new Date()) / (1000*60*60*24));
    if (diff < 0) return 'retard';
    if (diff <= 2) return 'urgent';
    if (diff <= 5) return 'bientot';
    return null;
  };

  // Incrémenter fichiers faits
  const incrementFichier = async (projetId) => {
    const p = projets.find(pr => pr.id === projetId);
    const fait = (Number(p?.fichiersFaits) || 0) + 1;
    const qte = Number(p?.quantite) || 1;
    const newStatut = fait >= qte ? 'livre' : p?.statut;

    setProjets(prev => prev.map(pr => pr.id !== projetId ? pr : { ...pr, fichiersFaits: fait, statut: newStatut }));

    // Sync avancement + statut avec l'API
    if (p?.dbId) {
      try { await api.put(`/com/projets/${p.dbId}/avancement`, { fichiers_faits: fait }); } catch(e) {}
      if (fait >= qte) {
        try { await api.put(`/com/projets/${p.dbId}/statut`, { statut:'livre' }); } catch(e) {}
      }
    }
  };

  const filteredPaiements = paiementFilter === 'tous' ? paiements : paiements.filter(p => p.statut === paiementFilter);
  const paiementsBloques = paiements.filter(p => p.statut === 'bloque').reduce((s,p) => s+p.montant, 0);
  const paiementsLiberes = paiements.filter(p => p.statut === 'libere').reduce((s,p) => s+p.montant, 0);
  const paiementsVires = paiements.filter(p => p.statut === 'vire').reduce((s,p) => s+p.montant, 0);

  // ── Actions API connectées ──

  // Changer le statut d'un projet (API)
  const updateStatut = async (id, statut) => {
    const dbId = projets.find(p=>p.id===id)?.dbId || id;
    try { await api.put(`/com/projets/${dbId}/statut`, { statut }); } catch(e) {}
    setProjets(prev => prev.map(p => p.id===id ? {...p, statut} : p));
  };

  // Accepter un brief → crée un devis auto basé sur la grille tarifaire
  const accepterBrief = async (projet) => {
    const tarifs = getTarifs();
    // Trouver le prix dans la grille
    let prixUnitaire = 49; // défaut TikTok
    for (const cat of tarifs) {
      for (const item of cat.items) {
        if (projet.categorie && item.nom.toLowerCase().includes(projet.categorie.toLowerCase())) {
          prixUnitaire = item.prix; break;
        }
      }
    }
    const qte = Number(projet.quantite) || 1;
    const montantHT = prixUnitaire * qte;
    const lignes = [{ description:`${projet.type}${projet.categorie ? ' — '+projet.categorie : ''}`, quantite:qte, prixUnitaire }];

    const dbId = projet.dbId || projet.id;
    try {
      const r = await api.post(`/com/projets/${dbId}/devis`, { montantHT, tva:20, lignes });
      setProjets(prev => prev.map(p => p.id===projet.id ? {...p, statut:'devis_envoye', montant:montantHT, devisRef:r.data?.devisRef||null} : p));
      showToast(`Devis de ${montantHT}€ envoyé au client par email !`);
    } catch(e) {
      // Fallback local
      setProjets(prev => prev.map(p => p.id===projet.id ? {...p, statut:'devis_envoye', montant:montantHT} : p));
      showToast('Devis créé (email en attente du domaine)');
    }
    setModalProjet(null);
  };

  // Contre-proposition → ouvre le modal devis pré-rempli
  const contreProposition = (projet) => {
    const tarifs = getTarifs();
    let prixUnitaire = 49;
    for (const cat of tarifs) {
      for (const item of cat.items) {
        if (projet.categorie && item.nom.toLowerCase().includes(projet.categorie.toLowerCase())) {
          prixUnitaire = item.prix; break;
        }
      }
    }
    setDevisForm({
      client: projet.client,
      objet: `${projet.type}${projet.categorie ? ' — '+projet.categorie : ''} pour ${projet.client}`,
      tva: 20,
      conditions: 'Paiement à réception. Validité 30 jours. Révisions incluses.',
      lignes: [{ description:`${projet.type}${projet.categorie ? ' — '+projet.categorie : ''}`, quantite: Number(projet.quantite)||1, prixUnitaire }],
      projetId: projet.id,
      projetDbId: projet.dbId || projet.id,
      clientEmail: projet.clientEmail,
    });
    setModalDevis(true);
    setModalProjet(null);
  };

  // Refuser un brief → email poli + suppression
  const refuserBrief = async (projet) => {
    const dbId = projet.dbId || projet.id;
    try { await api.put(`/com/projets/${dbId}/statut`, { statut:'refuse' }); } catch(e) {}
    setProjets(prev => prev.filter(p => p.id !== projet.id));
    showToast('Demande refusée — email envoyé au client');
    setModalProjet(null);
  };

  // Livrer le projet
  const livrerProjet = async (id) => {
    await updateStatut(id, 'livre');
    showToast('Projet livré au client !');
    setModalProjet(null);
  };

  // Marquer client a accepté le devis → en cours
  const clientAAccepte = async (id) => {
    await updateStatut(id, 'en_cours');
    showToast('Projet démarré !');
    setModalProjet(null);
  };

  // Assigner un responsable
  const assignerResponsable = async (projetId, responsable) => {
    const dbId = projets.find(p=>p.id===projetId)?.dbId || projetId;
    try { await api.put(`/com/projets/${dbId}/statut`, { statut:'en_cours' }); } catch(e) {}
    setProjets(prev => prev.map(p => p.id===projetId ? {...p, responsable} : p));
  };

  // Supprimer un projet
  const supprimerProjet = async (id) => {
    const dbId = projets.find(p=>p.id===id)?.dbId || id;
    try { await api.delete(`/com/projets/${dbId}`); } catch(e) {}
    setProjets(prev => prev.filter(p => p.id !== id));
    showToast('Projet supprimé');
    setModalProjet(null);
  };

  // Archiver un projet terminé
  const archiverProjet = async (id) => {
    await updateStatut(id, 'archive');
    showToast('Projet archivé');
    setModalProjet(null);
  };

  // Agenda: sauvegarder un événement
  const saveAgendaEvent = async (joursDates) => {
    if (!agendaForm.titre) return;
    const jourIdx = typeof agendaModal?.jour === 'number' ? agendaModal.jour : agendaForm.jour;
    const dateStr = joursDates?.[jourIdx]?.date || new Date().toISOString().split('T')[0];
    const payload = { titre:agendaForm.titre, heure:agendaForm.heure, heure_fin:agendaForm.heureFin, jour:jourIdx, date:dateStr, type:agendaForm.type, personne:agendaForm.personne, projet:agendaForm.projet };

    if (agendaModal?.id && typeof agendaModal.id === 'number' && agendaModal.id < 1e12) {
      try { await api.put(`/com/agenda/${agendaModal.id}`, payload); } catch(e) {}
      setAgendaEvents(prev => prev.map(e => e.id === agendaModal.id ? { ...e, ...agendaForm, date:dateStr, heureFin:agendaForm.heureFin } : e));
    } else {
      try {
        const r = await api.post('/com/agenda', payload);
        setAgendaEvents(prev => [...prev, { id:r.data?.id||Date.now(), ...agendaForm, date:dateStr, heureFin:agendaForm.heureFin }]);
      } catch(e) {
        setAgendaEvents(prev => [...prev, { id:Date.now(), ...agendaForm, date:dateStr, heureFin:agendaForm.heureFin }]);
      }
    }
    setAgendaModal(null);
    setAgendaForm({ titre:'', heure:'09:00', heureFin:'10:00', jour:0, type:'montage', projet:'', personne:'Marius' });
    showToast(agendaModal?.id ? 'Événement modifié' : 'Événement ajouté');
  };

  // Agenda: supprimer un événement
  const deleteAgendaEvent = async (id) => {
    try { await api.delete(`/com/agenda/${id}`); } catch(e) {}
    setAgendaEvents(prev => prev.filter(e => e.id !== id));
    setAgendaModal(null);
    showToast('Événement supprimé');
  };

  // Submit new project
  const submitNewProjet = () => {
    if (!newProjetForm.client || !newProjetForm.titre) return;
    const newId = projets.length ? Math.max(...projets.map(p => p.id)) + 1 : 1;
    setProjets(prev => [...prev, {
      id: newId, titre: newProjetForm.titre, client: newProjetForm.client,
      type: newProjetForm.type, categorie: newProjetForm.categorie,
      montant: Number(newProjetForm.budget) || 0, statut:'demande',
      responsable: newProjetForm.responsable || null, dateDebut:null,
      dateFin: newProjetForm.deadline || null, revisions:0, fichiers:0,
      notes: newProjetForm.brief, devisRef:null,
    }]);
    showToast('Projet créé !');
    setModalNewProjet(false);
    setNewProjetForm({ client:'', type:'Montage vidéo', categorie:'TikTok', titre:'', brief:'', deadline:'', responsable:'', budget:'' });
  };

  // IMPROVEMENT 5: Submit devis with lines
  const submitDevis = async () => {
    const totalHT = devisForm.lignes.reduce((s,l) => s + (Number(l.quantite)||0) * (Number(l.prixUnitaire)||0), 0);
    if (!devisForm.client || !devisForm.objet || totalHT <= 0) return;

    // Si lié à un projet, envoyer via l'API
    if (devisForm.projetDbId) {
      try {
        const r = await api.post(`/com/projets/${devisForm.projetDbId}/devis`, {
          montantHT: totalHT, tva: devisForm.tva, lignes: devisForm.lignes, conditions: devisForm.conditions,
        });
        setProjets(prev => prev.map(p => p.id === devisForm.projetId ? {...p, statut:'devis_envoye', montant:totalHT, devisRef:r.data?.devisRef||null} : p));
        showToast(`Devis de ${totalHT}€ envoyé par email au client !`);
      } catch(e) {
        showToast('Devis créé (email en attente du domaine)');
        setProjets(prev => prev.map(p => p.id === devisForm.projetId ? {...p, statut:'devis_envoye', montant:totalHT} : p));
      }
    } else {
      showToast('Devis créé !');
    }

    const newDevisId = `DC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    setDevis(prev => [{ id:newDevisId, client:devisForm.client, objet:devisForm.objet, montantHT:totalHT, tva:devisForm.tva, statut:'envoye', date:new Date().toISOString().split('T')[0], validite:'30 jours' }, ...prev]);
    setModalDevis(false);
    setDevisForm({ client:'', objet:'', tva:20, conditions:'Paiement à réception. Validité 30 jours.', lignes:[{ description:'', quantite:1, prixUnitaire:'' }] });
  };

  const envoyerFichiers = async (id) => {
    await updateStatut(id, 'livre');
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

  // ── Chrono ──
  const startChrono = (projetId) => {
    setChrono(prev => {
      const updated = { ...prev, [projetId]: { total: prev[projetId]?.total || 0, running: true, start: Date.now() } };
      localStorage.setItem('com_chrono', JSON.stringify(updated));
      return updated;
    });
  };
  const stopChrono = (projetId) => {
    setChrono(prev => {
      const c = prev[projetId];
      if (!c || !c.running) return prev;
      const elapsed = Math.floor((Date.now() - c.start) / 1000);
      const updated = { ...prev, [projetId]: { total: (c.total || 0) + elapsed, running: false, start: null } };
      localStorage.setItem('com_chrono', JSON.stringify(updated));
      return updated;
    });
  };
  const getChronoDisplay = (projetId) => {
    const c = chrono[projetId];
    if (!c) return '0h00';
    let total = c.total || 0;
    if (c.running && c.start) total += Math.floor((Date.now() - c.start) / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return `${h}h${String(m).padStart(2,'0')}`;
  };
  const getChronoRentabilite = (projetId, montant) => {
    const c = chrono[projetId];
    if (!c) return null;
    let total = c.total || 0;
    if (c.running && c.start) total += Math.floor((Date.now() - c.start) / 1000);
    if (total < 60) return null;
    const heures = total / 3600;
    return Math.round(montant / heures);
  };

  // Refresh chrono display every 10s
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const hasRunning = Object.values(chrono).some(c => c.running);
    if (!hasRunning) return;
    const interval = setInterval(() => forceUpdate(n => n + 1), 10000);
    return () => clearInterval(interval);
  }, [chrono]);
  const labelStyle = { fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 };

  return (
    <div style={{ padding:'24px 28px', background:V_BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      {/* Actions rapides (gestion uniquement) */}
      {vue === 'gestion' && (
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginBottom:16 }}>
          <button onClick={() => setModalNewProjet(true)} style={{ ...BTN, display:'flex', alignItems:'center', gap:6, background:'#059669', fontSize:13, padding:'8px 14px' }}>+ Projet</button>
          <button onClick={() => setModalDevis(true)} style={{ ...BTN, display:'flex', alignItems:'center', gap:6, fontSize:13, padding:'8px 14px' }}>+ Devis</button>
        </div>
      )}

      {/* ═══ VUE MONTEUR : ACCUEIL = TO-DO LIST ═══ */}
      {vue === 'monteur' && tab === 'accueil' && (<div>

        {/* ── Emploi du temps du jour ── */}
        {(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const todayJour = (new Date().getDay() + 6) % 7; // 0=Lun
          const todayEvents = agendaEvents.filter(e => e.date === todayStr || (e.jour === todayJour && !e.date));
          const sortedEvents = [...todayEvents].sort((a,b) => (a.heure||'').localeCompare(b.heure||''));
          const now = new Date();
          const nowH = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

          return (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#1C1C1E' }}>📅 Aujourd'hui — {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</div>
                <button onClick={() => setTab('agenda')} style={{ ...GHOST, padding:'6px 12px', fontSize:12 }}>Voir l'agenda →</button>
              </div>

              {sortedEvents.length === 0 ? (
                <div style={{ ...CARD, padding:'20px', textAlign:'center', color:'#636363', border:'1px dashed #E9E5F5' }}>
                  <div style={{ fontSize:14 }}>Aucun événement aujourd'hui</div>
                  <button onClick={() => setTab('agenda')} style={{ ...GHOST, padding:'6px 14px', fontSize:12, marginTop:8 }}>+ Planifier</button>
                </div>
              ) : (
                <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
                  {sortedEvents.map((evt, i) => {
                    const mc = MONTEUR_COLORS[evt.personne] || { bg:'#F3F3F3', border:'#E5E5E5', color:'#636363', dot:'#636363' };
                    const tc = { montage:{icon:'🎬'}, revision:{icon:'🔄'}, reunion:{icon:'📞'}, livraison:{icon:'📦'}, prospection:{icon:'🔍'}, perso:{icon:'👤'} };
                    const isPast = evt.heureFin && evt.heureFin < nowH;
                    const isCurrent = evt.heure <= nowH && (!evt.heureFin || evt.heureFin > nowH);
                    return (
                      <div key={evt.id || i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: i < sortedEvents.length-1 ? '1px solid #F0F0F0' : 'none', opacity: isPast ? 0.5 : 1, background: isCurrent ? mc.bg+'40' : 'transparent' }}>
                        {/* Barre couleur monteur */}
                        <div style={{ width:4, height:36, borderRadius:2, background:mc.dot, flexShrink:0 }} />
                        {/* Heure */}
                        <div style={{ minWidth:50, flexShrink:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color: isCurrent ? mc.color : '#1C1C1E' }}>{evt.heure}</div>
                          {evt.heureFin && <div style={{ fontSize:11, color:'#636363' }}>{evt.heureFin}</div>}
                        </div>
                        {/* Contenu */}
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:'#1C1C1E', display:'flex', alignItems:'center', gap:6 }}>
                            {tc[evt.type]?.icon || '📌'} {evt.titre}
                            {isPast && <span style={{ fontSize:11, color:'#636363' }}>✓</span>}
                            {isCurrent && <span style={{ width:6, height:6, borderRadius:'50%', background:mc.dot, display:'inline-block', animation:'pulse 2s infinite' }} />}
                          </div>
                          {evt.projet && <div style={{ fontSize:12, color:'#636363' }}>🔗 {evt.projet}</div>}
                        </div>
                        {/* Badge monteur */}
                        <div style={{ padding:'3px 10px', borderRadius:999, background:mc.bg, border:`1px solid ${mc.border}`, fontSize:11, fontWeight:700, color:mc.color, flexShrink:0 }}>
                          {evt.personne || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Demandes à traiter */}
        {projets.filter(p => p.statut === 'demande').length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#D97706', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:15, fontWeight:800, color:'#D97706' }}>Demandes à traiter ({projets.filter(p=>p.statut==='demande').length})</span>
            </div>
            {projets.filter(p => p.statut === 'demande').map(p => (
              <div key={p.id} onClick={() => setModalProjet(p)} style={{ ...CARD, marginBottom:8, cursor:'pointer', padding:'16px 20px', border:'2px solid #FDE68A', background:'#FFFBEB' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{p.titre}</div>
                  <span style={{ fontSize:12, fontWeight:700, color:'#D97706', background:'#FEF3C7', padding:'3px 10px', borderRadius:10 }}>Nouveau</span>
                </div>
                <div style={{ fontSize:13, color:'#636363', marginBottom:8 }}>{p.client} · {p.clientEmail || ''}</div>
                {p.notes && <div style={{ fontSize:13, color:'#5B21B6', background:V_SOFT, padding:'8px 12px', borderRadius:8, marginBottom:8 }}>📝 {p.notes.slice(0,100)}{p.notes.length>100?'...':''}</div>}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={(e) => { e.stopPropagation(); accepterBrief(p); }} style={{ ...BTN, padding:'8px 16px', fontSize:13 }}>✅ Accepter</button>
                  <button onClick={(e) => { e.stopPropagation(); contreProposition(p); }} style={{ ...GHOST, padding:'8px 16px', fontSize:13 }}>📝 Contre-prop</button>
                  <button onClick={(e) => { e.stopPropagation(); refuserBrief(p); }} style={{ ...GHOST, padding:'8px 14px', fontSize:13, color:'#DC2626', borderColor:'#FECACA' }}>✗</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mes projets en cours */}
        {projets.filter(p => ['en_cours','revision'].includes(p.statut)).length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:15, fontWeight:800, color:V, marginBottom:12 }}>🎬 En cours ({projets.filter(p=>['en_cours','revision'].includes(p.statut)).length})</div>
            {projets.filter(p => ['en_cours','revision'].includes(p.statut)).map(p => {
              const qte = Number(p.quantite)||1;
              const fait = Number(p.fichiersFaits)||0;
              const pct = qte > 0 ? Math.round((fait/qte)*100) : 0;
              const urgence = getUrgence(p);
              return (
                <div key={p.id} style={{ ...CARD, marginBottom:10, padding:'18px 20px', border: urgence==='retard'?'2px solid #FECACA':urgence==='urgent'?'2px solid #FDE68A':undefined }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{p.titre}</div>
                    {urgence && <span style={{ fontSize:12, fontWeight:700, color:urgence==='retard'?'#DC2626':'#D97706' }}>{urgence==='retard'?'⚠️ Retard':'🔥 Urgent'}</span>}
                  </div>
                  <div style={{ fontSize:13, color:'#636363', marginBottom:10 }}>{p.client} · {p.responsable || 'À assigner'}{p.dateFin ? ` · 📅 ${p.dateFin}` : ''}</div>

                  {/* Grande barre d'avancement */}
                  <div style={{ background:'#F0F0F0', borderRadius:6, height:10, marginBottom:8 }}>
                    <div style={{ background: pct >= 100 ? '#059669' : V, borderRadius:6, height:10, width:`${pct}%`, transition:'width .3s' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ fontSize:14, fontWeight:700, color: pct >= 100 ? '#059669' : V }}>{fait}/{qte} terminé{fait>1?'s':''} · {pct}%</div>
                    <div style={{ display:'flex', gap:8 }}>
                      {pct < 100 && (
                        <button onClick={() => { incrementFichier(p.id); showToast(`${fait+1}/${qte} ✅`); }} style={{ ...BTN, padding:'8px 16px', fontSize:13 }}>
                          ✅ +1 terminé
                        </button>
                      )}
                      {pct >= 100 && (
                        <button onClick={() => livrerProjet(p.id)} style={{ ...BTN, padding:'8px 16px', fontSize:13, background:'#059669' }}>
                          📦 Livrer
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Chrono */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#FAFAFA', borderRadius:8 }}>
                    <span style={{ fontSize:18, fontWeight:800, color: chrono[p.id]?.running ? V : '#1C1C1E', fontFamily:'monospace' }}>{getChronoDisplay(p.id)}</span>
                    {chrono[p.id]?.running ? (
                      <button onClick={() => stopChrono(p.id)} style={{ padding:'5px 12px', background:'#FEE2E2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>⏸ Pause</button>
                    ) : (
                      <button onClick={() => startChrono(p.id)} style={{ padding:'5px 12px', background:V_SOFT, color:V, border:`1px solid ${V}40`, borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>▶ Chrono</button>
                    )}
                    {(() => { const r = getChronoRentabilite(p.id, p.montant); return r ? <span style={{ fontSize:12, color: r >= 30 ? '#059669' : r >= 15 ? '#D97706' : '#DC2626', fontWeight:600 }}>{r}€/h</span> : null; })()}
                    {p.montant > 0 && <span style={{ fontSize:11, color:'#636363' }}>({p.montant}€ le projet)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Devis en attente de réponse */}
        {projets.filter(p => p.statut === 'devis_envoye').length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:15, fontWeight:800, color:'#1D4ED8', marginBottom:12 }}>⏳ En attente de réponse client ({projets.filter(p=>p.statut==='devis_envoye').length})</div>
            {projets.filter(p => p.statut === 'devis_envoye').map(p => (
              <div key={p.id} onClick={() => setModalProjet(p)} style={{ ...CARD, marginBottom:8, cursor:'pointer', padding:'14px 18px', border:'1px solid #93C5FD', background:'#EFF6FF' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{p.titre}</div>
                    <div style={{ fontSize:12, color:'#636363' }}>{p.client} · {p.montant?p.montant+'€':'—'}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); clientAAccepte(p.id); }} style={{ ...BTN, padding:'7px 14px', fontSize:12, background:'#059669' }}>Client OK → Démarrer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Livrés en attente de validation */}
        {projets.filter(p => p.statut === 'livre').length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:15, fontWeight:800, color:'#059669', marginBottom:12 }}>📦 Livrés — attente validation ({projets.filter(p=>p.statut==='livre').length})</div>
            {projets.filter(p => p.statut === 'livre').map(p => (
              <div key={p.id} onClick={() => setModalProjet(p)} style={{ ...CARD, marginBottom:8, cursor:'pointer', padding:'14px 18px', background:'#F0FDF4', border:'1px solid #86EFAC' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{p.titre}</div>
                    <div style={{ fontSize:12, color:'#636363' }}>{p.client} · {p.montant?p.montant+'€':'—'}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); archiverProjet(p.id); }} style={{ ...GHOST, padding:'7px 14px', fontSize:12 }}>📦 Archiver</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rien à faire */}
        {projets.filter(p => !['archive','refuse','paye'].includes(p.statut)).length === 0 && (
          <div style={{ ...CARD, padding:40, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>☕</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#1C1C1E', marginBottom:6 }}>Rien à faire pour le moment</div>
            <div style={{ fontSize:14, color:'#636363' }}>Les nouvelles demandes apparaîtront ici automatiquement</div>
          </div>
        )}

        <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
      </div>)}

      {/* ═══ VUE GESTION : ACCUEIL = KPIs (ancien) ═══ */}
      {vue === 'gestion' && tab === 'accueil' && (<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Projets en cours" value={projetsEnCours} accent={V} />
          <KpiCard label="Demandes à traiter" value={projets.filter(p=>p.statut==='demande').length} accent="#D97706" sub={projets.filter(p=>p.statut==='demande').length>0?'⚡ À répondre':'Aucun'} />
          <KpiCard label="CA livré" value={`${caTotal}€`} accent="#059669" />
          <KpiCard label="Revenu potentiel" value={`${revenuMois}€`} accent="#3B82F6" />
        </div>

        {/* Filtre Mes tâches */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <button onClick={()=>setMesTaches(false)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:!mesTaches?700:500, background:!mesTaches?V:'#F3F3F3', color:!mesTaches?'#fff':'#666', fontFamily:'inherit', fontSize:'0.825rem' }}>Tous les projets</button>
          <button onClick={()=>setMesTaches(true)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:mesTaches?700:500, background:mesTaches?V:'#F3F3F3', color:mesTaches?'#fff':'#666', fontFamily:'inherit', fontSize:'0.825rem' }}>Assignés uniquement</button>
        </div>

        <div style={CARD}>
          <div style={HDR}>Projets actifs</div>
          {projets.filter(p => !['livre','paye','refuse','archive'].includes(p.statut)).filter(p => !mesTaches || p.responsable).length === 0 && (
            <div style={{ padding:24, textAlign:'center', color:'#636363', fontSize:14 }}>Aucun projet en cours — les demandes apparaîtront ici</div>
          )}
          {projets.filter(p => !['livre','paye','refuse','archive'].includes(p.statut)).filter(p => !mesTaches || p.responsable).map(p => {
            const avancement = getAvancement(p);
            const urgence = getUrgence(p);
            return (
              <div key={p.id} onClick={() => setModalProjet(p)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background: urgence==='retard'?'#FEF2F2':urgence==='urgent'?'#FFFBEB':'#FAFAFA', borderRadius:10, marginBottom:8, cursor:'pointer', border:`1px solid ${urgence==='retard'?'#FECACA':urgence==='urgent'?'#FDE68A':'#F0F0F0'}` }}>
                <div style={{ width:40, height:40, borderRadius:10, background:V_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎬</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.titre}</div>
                  <div style={{ fontSize:12, color:'#636363' }}>{p.responsable || '⚠️ À assigner'} · {p.montant?p.montant+'€':'À définir'}</div>
                  {/* Barre avancement */}
                  {['en_cours','revision'].includes(p.statut) && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                      <div style={{ flex:1, background:'#F0F0F0', borderRadius:3, height:4 }}>
                        <div style={{ background:V, borderRadius:3, height:4, width:`${avancement}%`, transition:'width .3s' }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:V }}>{avancement}%</span>
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  <StatusBadge statut={p.statut} />
                  {p.dateFin && (
                    <span style={{ fontSize:11, fontWeight:600, color: urgence==='retard'?'#DC2626':urgence==='urgent'?'#D97706':'#636363' }}>
                      {urgence==='retard'?'⚠️ En retard':urgence==='urgent'?'🔥 J-'+Math.ceil((new Date(p.dateFin)-new Date())/(1000*60*60*24)):'📅 '+p.dateFin}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>)}

      {/* TAB: Projets */}
      {tab === 'projets' && (<div>
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {[['tous','Tous'],['demande','Demandes'],['devis_envoye','Devis envoyé'],['en_cours','En cours'],['revision','Révision'],['livre','Livrés'],['paye','Payés']].map(([v,l]) => (
            <button key={v} onClick={() => setProjetFilter(v)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight: projetFilter===v ? 700 : 500, background: projetFilter===v ? V : '#F3F3F3', color: projetFilter===v ? '#fff' : '#666', fontFamily:'inherit', fontSize:'0.825rem' }}>{l}</button>
          ))}
        </div>
        {filteredProjets.length === 0 && <div style={{ ...CARD, padding:32, textAlign:'center', color:'#636363' }}>Aucun projet</div>}
        {filteredProjets.map(p => {
          const avancement = getAvancement(p);
          const urgence = getUrgence(p);
          const qte = Number(p.quantite)||1;
          const fait = Number(p.fichiersFaits)||0;
          return (
            <div key={p.id} onClick={() => setModalProjet(p)} style={{ ...CARD, marginBottom:10, cursor:'pointer', padding:'16px 20px', borderColor:urgence==='retard'?'#FECACA':urgence==='urgent'?'#FDE68A':undefined }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div style={{ fontWeight:700, fontSize:15, flex:1 }}>{p.titre}</div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                  {urgence && <span style={{ fontSize:11, fontWeight:700, color:urgence==='retard'?'#DC2626':'#D97706' }}>{urgence==='retard'?'⚠️ Retard':'🔥 Urgent'}</span>}
                  <StatusBadge statut={p.statut} />
                </div>
              </div>
              <div style={{ fontSize:13, color:'#636363', marginBottom:6 }}>{p.client} · 👤 {p.responsable || 'À assigner'}{p.dateFin ? ` · 📅 ${p.dateFin}` : ''}</div>
              {/* Avancement */}
              {['en_cours','revision'].includes(p.statut) && (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ flex:1, background:'#F0F0F0', borderRadius:3, height:5 }}>
                    <div style={{ background:V, borderRadius:3, height:5, width:`${avancement}%` }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:V, minWidth:60, textAlign:'right' }}>{fait}/{qte} · {avancement}%</span>
                </div>
              )}
              <div style={{ fontWeight:800, color:V, fontSize:16 }}>{p.montant?p.montant+'€':'À définir'}</div>
            </div>
          );
        })}
      </div>)}

      {/* TAB: Agenda */}
      {tab === 'agenda' && (() => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1 + semainOffset * 7);
        const joursDates = JOURS.map((j, i) => {
          const d = new Date(monday); d.setDate(monday.getDate() + i);
          return { label:j, date:d.toISOString().split('T')[0], num:d.getDate(), isToday: d.toDateString() === today.toDateString() };
        });

        const saveEvent = () => saveAgendaEvent(joursDates);
        const deleteEvent = (id) => deleteAgendaEvent(id);

        const typeColors = { montage:{bg:'#F5F3FF',border:'#C4B5FD',color:'#5B21B6',label:'🎬 Montage'}, revision:{bg:'#FFF7ED',border:'#FED7AA',color:'#C2410C',label:'🔄 Révision'}, reunion:{bg:'#DBEAFE',border:'#93C5FD',color:'#1D4ED8',label:'📞 Réunion'}, livraison:{bg:'#D1FAE5',border:'#86EFAC',color:'#065F46',label:'📦 Livraison'}, prospection:{bg:'#FEF3C7',border:'#FDE047',color:'#713F12',label:'🔍 Prospection'}, perso:{bg:'#F3F3F3',border:'#E5E5E5',color:'#636363',label:'👤 Perso'} };

        // Deadlines des projets en cours
        const deadlines = projets.filter(p => p.dateFin && ['en_cours','revision'].includes(p.statut)).map(p => ({ ...p, isDeadline:true }));

        return (<div>
          {/* Header semaine */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <button onClick={() => setSemainOffset(s=>s-1)} style={{ ...GHOST, padding:'8px 14px' }}>← Semaine précédente</button>
            <div style={{ fontSize:16, fontWeight:700 }}>
              {semainOffset === 0 ? 'Cette semaine' : semainOffset === 1 ? 'Semaine prochaine' : semainOffset === -1 ? 'Semaine dernière' : `Semaine du ${joursDates[0].date}`}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {semainOffset !== 0 && <button onClick={() => setSemainOffset(0)} style={{ ...GHOST, padding:'8px 14px' }}>Aujourd'hui</button>}
              <button onClick={() => setSemainOffset(s=>s+1)} style={{ ...GHOST, padding:'8px 14px' }}>Semaine suivante →</button>
            </div>
          </div>

          {/* Grille semaine */}
          <div style={{ display:'grid', gridTemplateColumns:'60px repeat(7, 1fr)', gap:0, background:'#fff', borderRadius:14, border:'1px solid #E9E5F5', overflow:'hidden' }}>
            {/* Header jours */}
            <div style={{ padding:'10px', borderBottom:'1px solid #E9E5F5', background:'#FAFAFA' }} />
            {joursDates.map((j, i) => (
              <div key={i} style={{ padding:'10px 8px', borderBottom:'1px solid #E9E5F5', borderLeft:'1px solid #E9E5F5', textAlign:'center', background: j.isToday ? V_SOFT : '#FAFAFA' }}>
                <div style={{ fontSize:12, fontWeight:600, color: j.isToday ? V : '#636363' }}>{j.label}</div>
                <div style={{ fontSize:18, fontWeight:800, color: j.isToday ? V : '#1C1C1E' }}>{j.num}</div>
              </div>
            ))}

            {/* Lignes horaires */}
            {HEURES.map(h => (<React.Fragment key={h}>
              <div style={{ padding:'6px 8px', borderBottom:'1px solid #F0F0F0', fontSize:11, color:'#636363', textAlign:'right', minHeight:48, display:'flex', alignItems:'flex-start', justifyContent:'flex-end' }}>{h}</div>
              {joursDates.map((j, ji) => {
                const evts = agendaEvents.filter(e => (e.date === j.date || e.jour === ji) && e.heure === h);
                const dls = deadlines.filter(p => p.dateFin === j.date && h === '09:00');
                return (
                  <div key={ji} onClick={() => { setAgendaForm({ titre:'', heure:h, heureFin:HEURES[HEURES.indexOf(h)+1]||'19:00', jour:ji, type:'montage', projet:'' }); setAgendaModal({ jour:ji, heure:h }); }}
                    style={{ borderBottom:'1px solid #F0F0F0', borderLeft:'1px solid #F0F0F0', minHeight:48, padding:2, cursor:'pointer', position:'relative' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    {evts.map(evt => {
                      const mc = MONTEUR_COLORS[evt.personne] || { bg:'#F3F3F3', border:'#E5E5E5', color:'#636363' };
                      return (
                        <div key={evt.id} onClick={(e) => { e.stopPropagation(); setAgendaForm(evt); setAgendaModal(evt); }}
                          style={{ background:mc.bg, border:`1px solid ${mc.border}`, borderLeft:`3px solid ${mc.border}`, borderRadius:6, padding:'3px 6px', fontSize:11, fontWeight:600, color:mc.color, marginBottom:2, cursor:'pointer' }}>
                          {evt.titre}
                        </div>
                      );
                    })}
                    {dls.map(dl => (
                      <div key={dl.id} style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:6, padding:'3px 6px', fontSize:10, fontWeight:700, color:'#DC2626', marginBottom:2 }}>
                        📅 Deadline: {dl.titre?.slice(0,20)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>))}
          </div>

          {/* Légende monteurs */}
          <div style={{ display:'flex', gap:16, marginTop:16, flexWrap:'wrap' }}>
            {Object.entries(MONTEUR_COLORS).map(([nom,mc]) => (
              <div key={nom} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:14, height:14, borderRadius:4, background:mc.bg, border:`2px solid ${mc.border}` }} />
                <span style={{ fontSize:13, fontWeight:600, color:mc.color }}>{nom}</span>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:14, height:14, borderRadius:4, background:'#FEE2E2', border:'2px solid #FCA5A5' }} />
              <span style={{ fontSize:13, fontWeight:600, color:'#DC2626' }}>Deadline</span>
            </div>
          </div>

          {/* Modal ajout/édition */}
          {agendaModal && (
            <div style={OVL} onClick={() => setAgendaModal(null)}>
              <div style={{ ...BOX, maxWidth:420 }} onClick={e => e.stopPropagation()}>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>{agendaModal?.id ? 'Modifier' : 'Nouvel événement'}</div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Titre *</label>
                  <input value={agendaForm.titre} onChange={e => setAgendaForm(p=>({...p,titre:e.target.value}))} placeholder="Montage TikTok @emma..." style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Début</label>
                    <select value={agendaForm.heure} onChange={e => setAgendaForm(p=>({...p,heure:e.target.value}))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}>
                      {HEURES.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Fin</label>
                    <select value={agendaForm.heureFin} onChange={e => setAgendaForm(p=>({...p,heureFin:e.target.value}))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}>
                      {HEURES.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Type</label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {Object.entries(typeColors).map(([k,v]) => (
                      <button key={k} onClick={() => setAgendaForm(p=>({...p,type:k}))}
                        style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${agendaForm.type===k?v.border:'#E9E5F5'}`, background:agendaForm.type===k?v.bg:'#fff', color:agendaForm.type===k?v.color:'#636363', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Qui ?</label>
                  <div style={{ display:'flex', gap:6 }}>
                    {['Marius','Maxence','Vassili','Mathieu'].map(nom => {
                      const mc = MONTEUR_COLORS[nom];
                      return (
                        <button key={nom} onClick={() => setAgendaForm(p=>({...p,personne:nom}))}
                          style={{ padding:'7px 14px', borderRadius:999, border:`2px solid ${agendaForm.personne===nom?mc.border:'#E9E5F5'}`, background:agendaForm.personne===nom?mc.bg:'#fff', color:agendaForm.personne===nom?mc.color:'#636363', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          {nom}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>Projet lié</label>
                  <select value={agendaForm.projet} onChange={e => setAgendaForm(p=>({...p,projet:e.target.value}))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}>
                    <option value="">Aucun</option>
                    {projets.filter(p=>['en_cours','revision'].includes(p.statut)).map(p=>(
                      <option key={p.id} value={p.titre}>{p.titre}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={saveEvent} style={{ ...BTN, flex:1, padding:'12px' }}>{agendaModal?.id ? 'Modifier' : 'Ajouter'}</button>
                  {agendaModal?.id && <button onClick={() => deleteEvent(agendaModal.id)} style={{ padding:'12px 16px', background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' }}>🗑️</button>}
                  <button onClick={() => setAgendaModal(null)} style={{ ...GHOST, padding:'12px' }}>Annuler</button>
                </div>
              </div>
            </div>
          )}
        </div>);
      })()}

      {/* TAB: Archives */}
      {tab === 'archives' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Projets archivés</div>
        {projets.filter(p => p.statut === 'archive').length === 0 && (
          <div style={{ ...CARD, padding:32, textAlign:'center', color:'#636363' }}>Aucun projet archivé</div>
        )}
        {projets.filter(p => p.statut === 'archive').map(p => (
          <div key={p.id} onClick={() => setModalProjet(p)} style={{ ...CARD, marginBottom:10, cursor:'pointer', padding:'16px 20px', opacity:0.7 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{p.titre}</div>
              <StatusBadge statut={p.statut} />
            </div>
            <div style={{ fontSize:13, color:'#636363', marginBottom:4 }}>{p.client} · {p.responsable || '—'}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:800, color:'#636363', fontSize:15 }}>{p.montant?p.montant+'€':'—'}</span>
              <span style={{ fontSize:12, color:'#636363' }}>{p.dateDebut || '—'}</span>
            </div>
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
                <div style={{ fontSize:12, color:'#636363' }}>{d.client} · {d.id} · {d.date}</div>
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
                <div style={{ fontSize:12, color:'#636363' }}>{f.client} · {f.id} · {f.dateEmission}</div>
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
                <div style={{ fontSize:12, color:'#636363' }}>{p.client ? `${p.client} · ` : ''}{p.id} · {p.date}</div>
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
                <div style={{ fontWeight:700, fontSize:14 }}>{c.nom} <span style={{ fontSize:12, color:'#636363', fontWeight:400 }}>· {c.type}</span></div>
                <div style={{ fontSize:12, color:'#636363' }}>{c.projets} projets · {c.email}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:800, color:V, fontSize:14 }}>{c.ca}€</div>
                <FidBadge f={c.fidelite} />
              </div>
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Grille tarifaire (éditable) */}
      {tab === 'tarifs' && (<div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Grille tarifaire</div>
            <div style={{ fontSize:13, color:'#636363', marginTop:2 }}>Ajoutez, modifiez ou supprimez des lignes — visible en temps réel sur le site</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { const r = resetTarifs(); setTarifs(r); api.put('/com/tarifs', { tarifs: r, packs }).catch(()=>{}); showToast('Tarifs réinitialisés'); }} style={GHOST}>↺ Réinitialiser</button>
          </div>
        </div>
        {tarifs.map((t, ci) => (
          <div key={t.cat} style={{ marginBottom:20 }}>
            <div style={{ ...HDR, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{t.cat}</span>
              <button onClick={() => {
                const newId = `${t.cat.slice(0,2).toLowerCase()}${Date.now()}`;
                const updated = tarifs.map((cat, i) => i !== ci ? cat : { ...cat, items: [...cat.items, { id: newId, nom: 'Nouveau service', prix: 0 }] });
                setTarifs(updated);
                saveTarifs(updated);
                api.put('/com/tarifs', { tarifs: updated, packs }).catch(() => {});
                setEditingTarif({ catIdx: ci, itemIdx: updated[ci].items.length - 1 });
                setEditNom('Nouveau service');
                setEditPrix('0');
              }} style={{ background:'none', border:`1px solid ${V}40`, borderRadius:8, padding:'4px 12px', cursor:'pointer', fontSize:12, fontWeight:700, color:V, fontFamily:'inherit' }}>
                + Ajouter
              </button>
            </div>
            <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
              {t.items.map((item, ji) => {
                const isEditing = editingTarif && editingTarif.catIdx === ci && editingTarif.itemIdx === ji;
                return (
                  <div key={item.id||ji} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderBottom: ji < t.items.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                    {isEditing ? (
                      <>
                        <input value={editNom} onChange={e=>setEditNom(e.target.value)} placeholder="Nom du service" style={{ flex:1, padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none' }} />
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <input type="number" value={editPrix} onChange={e=>setEditPrix(e.target.value)} placeholder="Prix" style={{ width:80, padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', textAlign:'right' }} />
                          <span style={{ fontSize:14, fontWeight:700, color:V }}>€</span>
                        </div>
                        <button onClick={() => {
                          const updated = tarifs.map((cat, i) => i !== ci ? cat : { ...cat, items: cat.items.map((it, j) => j !== ji ? it : { ...it, nom: editNom, prix: Number(editPrix) }) });
                          setTarifs(updated);
                          saveTarifs(updated);
                          api.put('/com/tarifs', { tarifs: updated, packs }).catch(() => {});
                          setEditingTarif(null);
                          showToast('Prix mis à jour — visible sur le site');
                        }} style={{ ...BTN, padding:'7px 14px', fontSize:13 }}>✓</button>
                        <button onClick={() => setEditingTarif(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#636363', fontSize:16 }}>✕</button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex:1, fontSize:14 }}>{item.nom}</span>
                        <span style={{ fontSize:15, fontWeight:800, color:V, minWidth:60, textAlign:'right' }}>{item.prix}€</span>
                        <button onClick={() => { setEditingTarif({catIdx:ci, itemIdx:ji}); setEditPrix(String(item.prix)); setEditNom(item.nom); }}
                          style={{ background:'none', border:'1px solid #E9E5F5', borderRadius:8, padding:'5px 10px', cursor:'pointer', fontSize:12, color:'#636363', fontFamily:'inherit', transition:'all .15s' }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=V;e.currentTarget.style.color=V;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='#E9E5F5';e.currentTarget.style.color='#636363';}}>
                          ✎ Modifier
                        </button>
                        <button onClick={() => {
                          const updated = tarifs.map((cat, i) => i !== ci ? cat : { ...cat, items: cat.items.filter((_, j) => j !== ji) });
                          setTarifs(updated);
                          saveTarifs(updated);
                          api.put('/com/tarifs', { tarifs: updated, packs }).catch(() => {});
                          showToast('Ligne supprimée');
                        }}
                          style={{ background:'none', border:'1px solid #FECACA', borderRadius:8, padding:'5px 10px', cursor:'pointer', fontSize:12, color:'#DC2626', fontFamily:'inherit', transition:'all .15s' }}
                          onMouseEnter={e=>{e.currentTarget.style.background='#FEF2F2';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
                          ✕ Suppr.
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              {t.items.length === 0 && (
                <div style={{ padding:'20px', textAlign:'center', fontSize:13, color:'#636363' }}>Aucun service dans cette catégorie</div>
              )}
            </div>
          </div>
        ))}
        {/* ── Packs / Formules ── */}
        <div style={{ marginTop:32 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700 }}>Formules (packs mensuels)</div>
              <div style={{ fontSize:13, color:'#636363', marginTop:2 }}>Visibles sur la page publique /com</div>
            </div>
          </div>
          {packs.map((pack, pi) => {
            const isEditing = editingPack === pi;
            return (
              <div key={pi} style={{ ...CARD, marginBottom:12, padding:'18px 20px' }}>
                {isEditing ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      <div style={{ flex:'1 1 140px' }}>
                        <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Nom</label>
                        <input value={pack.nom} onChange={e => { const u = [...packs]; u[pi] = { ...u[pi], nom: e.target.value }; setPacks(u); }}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                      </div>
                      <div style={{ flex:'0 0 100px' }}>
                        <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Prix €/mois</label>
                        <input type="number" value={pack.prix} onChange={e => { const u = [...packs]; u[pi] = { ...u[pi], prix: Number(e.target.value) }; setPacks(u); }}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', textAlign:'right', boxSizing:'border-box' }} />
                      </div>
                      <div style={{ flex:'1 1 200px' }}>
                        <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Description courte</label>
                        <input value={pack.desc} onChange={e => { const u = [...packs]; u[pi] = { ...u[pi], desc: e.target.value }; setPacks(u); }}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Avantages (un par ligne)</label>
                      <textarea value={pack.features.join('\n')} onChange={e => { const u = [...packs]; u[pi] = { ...u[pi], features: e.target.value.split('\n') }; setPacks(u); }}
                        rows={4} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                        <input type="checkbox" checked={pack.populaire} onChange={e => { const u = [...packs]; u[pi] = { ...u[pi], populaire: e.target.checked }; setPacks(u); }} />
                        Badge "Populaire"
                      </label>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => {
                        api.put('/com/tarifs', { tarifs, packs }).catch(() => {});
                        setEditingPack(null);
                        showToast('Pack mis à jour — visible sur le site');
                      }} style={{ ...BTN, padding:'8px 18px', fontSize:13 }}>Enregistrer</button>
                      <button onClick={() => setEditingPack(null)} style={{ ...GHOST, padding:'8px 14px', fontSize:13 }}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:15, fontWeight:700 }}>{pack.nom}</span>
                        {pack.populaire && <span style={{ fontSize:10, fontWeight:700, background:V, color:'#fff', padding:'2px 8px', borderRadius:10 }}>Populaire</span>}
                      </div>
                      <div style={{ fontSize:13, color:'#636363', marginTop:2 }}>{pack.desc} — {pack.features.length} avantages</div>
                    </div>
                    <span style={{ fontSize:20, fontWeight:800, color:V }}>{pack.prix}€<span style={{ fontSize:12, fontWeight:400, color:'#636363' }}>/mois</span></span>
                    <button onClick={() => setEditingPack(pi)}
                      style={{ background:'none', border:'1px solid #E9E5F5', borderRadius:8, padding:'5px 10px', cursor:'pointer', fontSize:12, color:'#636363', fontFamily:'inherit' }}>
                      ✎ Modifier
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding:'14px 18px', background:V_SOFT, borderRadius:12, marginTop:8, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>💡</span>
          <span style={{ fontSize:13, color:'#5B21B6' }}>Les modifications sont sauvegardées automatiquement et visibles immédiatement sur la page publique <strong>/com</strong></span>
        </div>
      </div>)}

      {/* TAB: Portfolio */}
      {tab === 'portfolio' && (<div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Portfolio</div>
            <div style={{ fontSize:13, color:'#636363', marginTop:2 }}>Ajoutez vos réalisations — visibles sur la page publique /com</div>
          </div>
          <div style={{ fontSize:13, color:V, fontWeight:700 }}>{portfolio.length} vidéo{portfolio.length > 1 ? 's' : ''}</div>
        </div>

        {/* Formulaire d'ajout */}
        <div style={{ ...CARD, marginBottom:20, padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Ajouter une vidéo</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:10 }}>
            <div style={{ flex:'1 1 200px' }}>
              <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Titre</label>
              <input value={newVideo.titre} onChange={e => setNewVideo(p=>({...p, titre:e.target.value}))} placeholder="Ex: Montage TikTok @influenceur"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ flex:'0 0 160px' }}>
              <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Catégorie</label>
              <select value={newVideo.categorie} onChange={e => setNewVideo(p=>({...p, categorie:e.target.value}))}
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' }}>
                <option>Montage vidéo</option>
                <option>TikTok</option>
                <option>YouTube</option>
                <option>Reels</option>
                <option>Design</option>
                <option>Autre</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:10 }}>
            <div style={{ flex:'1 1 300px' }}>
              <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Lien vidéo (YouTube, TikTok, Vimeo, Google Drive…)</label>
              <input value={newVideo.video_url} onChange={e => setNewVideo(p=>({...p, video_url:e.target.value}))} placeholder="https://..."
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ flex:'1 1 200px' }}>
              <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>URL miniature (optionnel)</label>
              <input value={newVideo.thumbnail_url} onChange={e => setNewVideo(p=>({...p, thumbnail_url:e.target.value}))} placeholder="https://... image.jpg"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'#636363', display:'block', marginBottom:4 }}>Description courte (optionnel)</label>
            <input value={newVideo.description} onChange={e => setNewVideo(p=>({...p, description:e.target.value}))} placeholder="Montage dynamique pour campagne été 2026"
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
          </div>
          <button onClick={() => {
            if (!newVideo.titre || !newVideo.video_url) return showToast('Titre et lien vidéo requis');
            api.post('/com/portfolio', newVideo).then(r => {
              setPortfolio(p => [r.data, ...p]);
              setNewVideo({ titre:'', description:'', categorie:'Montage vidéo', video_url:'', thumbnail_url:'' });
              showToast('Vidéo ajoutée au portfolio');
            }).catch(() => showToast('Erreur lors de l\'ajout'));
          }} style={{ ...BTN, padding:'10px 24px', fontSize:14 }}>
            Ajouter au portfolio
          </button>
        </div>

        {/* Liste des vidéos */}
        {portfolio.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 20px', color:'#636363' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎥</div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Aucune vidéo dans le portfolio</div>
            <div style={{ fontSize:13 }}>Ajoutez vos réalisations pour les afficher sur la page publique</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
            {portfolio.map(item => (
              <div key={item.id} style={{ ...CARD, padding:0, overflow:'hidden' }}>
                {/* Thumbnail */}
                <div style={{ height:160, background:'#1C1C1E', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.titre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <span style={{ fontSize:48, opacity:0.3 }}>🎬</span>
                  )}
                  <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                    style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)', opacity:0, transition:'opacity .2s', textDecoration:'none' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <span style={{ background:'rgba(255,255,255,0.95)', borderRadius:12, padding:'8px 20px', fontSize:13, fontWeight:700, color:'#1C1C1E' }}>▶ Voir la vidéo</span>
                  </a>
                </div>
                {/* Info */}
                <div style={{ padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{item.titre}</div>
                      {item.description && <div style={{ fontSize:12, color:'#636363', marginBottom:4 }}>{item.description}</div>}
                      <span style={{ fontSize:11, fontWeight:600, color:V, background:V_SOFT, padding:'2px 8px', borderRadius:6 }}>{item.categorie}</span>
                    </div>
                    <button onClick={() => {
                      api.delete(`/com/portfolio/${item.id}`).then(() => {
                        setPortfolio(p => p.filter(x => x.id !== item.id));
                        showToast('Vidéo supprimée');
                      }).catch(() => showToast('Erreur'));
                    }} style={{ background:'none', border:'1px solid #FECACA', borderRadius:8, padding:'4px 8px', cursor:'pointer', fontSize:11, color:'#DC2626', fontFamily:'inherit', flexShrink:0 }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>)}

      {/* TAB: Équipe interne */}
      {tab === 'equipe' && (<div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Équipe Freample Com</div>
            <div style={{ fontSize:13, color:'#636363', marginTop:2 }}>Votre équipe interne — {equipe.length} membres</div>
          </div>
        </div>

        {/* Vue charge de travail */}
        <div style={{ ...CARD, marginBottom:20 }}>
          <div style={HDR}>Charge de travail</div>
          {equipe.map(e => (
            <div key={e.id} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:`${e.color}18`, border:`2px solid ${e.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:e.color, fontSize:12, flexShrink:0 }}>{e.nom.split(' ').map(n=>n[0]).join('')}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>{e.nom}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: e.charge > 80 ? '#DC2626' : e.charge > 50 ? '#D97706' : '#16A34A' }}>{e.charge}%</span>
                </div>
                <div style={{ background:'#F3F3F3', borderRadius:4, height:6 }}>
                  <div style={{ background: e.charge > 80 ? '#DC2626' : e.charge > 50 ? '#D97706' : '#16A34A', borderRadius:4, height:6, width:`${e.charge}%`, transition:'width .3s' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fiches membres */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
          {equipe.map(e => (
            <div key={e.id} style={CARD}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:`${e.color}18`, border:`2px solid ${e.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:e.color, fontSize:15 }}>{e.nom.split(' ').map(n=>n[0]).join('')}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{e.nom}</div>
                  <div style={{ fontSize:13, color:'#636363' }}>{e.poste}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:'#636363', marginBottom:12, padding:'8px 12px', background:V_SOFT, borderRadius:8 }}>🎯 {e.specialite}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ color:'#636363' }}>Projets actifs</span>
                <span style={{ fontWeight:700 }}>{e.projetsActifs}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ color:'#636363' }}>Projets réalisés</span>
                <span style={{ fontWeight:700 }}>{e.projetsTotal}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ color:'#636363' }}>Charge</span>
                <span style={{ fontWeight:700, color: e.charge > 80 ? '#DC2626' : e.charge > 50 ? '#D97706' : '#16A34A' }}>{e.charge}%</span>
              </div>
              <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: e.dispo ? '#16A34A' : '#DC2626' }} />
                <span style={{ fontSize:12, fontWeight:600, color: e.dispo ? '#16A34A' : '#DC2626' }}>{e.dispo ? 'Disponible' : 'Occupé'}</span>
              </div>

              {/* Projets assignés */}
              {projets.filter(p => p.responsable === e.nom && !['paye','livre'].includes(p.statut)).length > 0 && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #F0F0F0' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Projets en cours</div>
                  {projets.filter(p => p.responsable === e.nom && !['paye','livre'].includes(p.statut)).map(p => (
                    <div key={p.id} style={{ fontSize:12, color:'#5E5E5E', marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                      <span>{p.titre.length > 30 ? p.titre.slice(0,30)+'…' : p.titre}</span>
                      <StatusBadge statut={p.statut} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>)}

      {/* TAB: Rapports */}
      {tab === 'rapports' && (<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="CA ce mois" value={`${revenuMois}€`} accent={V} />
          <KpiCard label="Projets livrés" value={projets.filter(p=>p.statut==='livre'||p.statut==='paye').length} accent="#059669" />
          <KpiCard label="Projets en cours" value={projetsEnCours} accent="#3B82F6" />
          <KpiCard label="Clients" value={projets.filter(p=>['livre','paye'].includes(p.statut)).length} sub="Projets livrés" accent="#EC4899" />
        </div>
        <div style={{ ...CARD, marginBottom:24 }}>
          <div style={HDR}>Revenus des 7 derniers jours</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
            {REVENUS_7J.map(r => (
              <div key={r.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:12, fontWeight:700, color:V }}>{r.montant}€</div>
                <div style={{ width:'100%', background:V, borderRadius:'6px 6px 0 0', height:`${Math.max(4,Math.round((r.montant/maxRev)*120))}px` }} />
                <div style={{ fontSize:11, color:'#636363', fontWeight:600 }}>{r.jour}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={CARD}>
            <div style={HDR}>Meilleurs clients</div>
            {[...clients].sort((a,b)=>b.ca-a.ca).slice(0,5).map((c,i) => (
              <div key={c.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:13 }}>{i+1}. {c.nom} <span style={{ color:'#636363', fontSize:11 }}>({c.type})</span></span>
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

      {/* TAB: Statistiques site */}
      {tab === 'stats' && (<div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Statistiques du site</div>
            <div style={{ fontSize:13, color:'#636363', marginTop:2 }}>Visites en temps réel sur toutes les pages Freample</div>
          </div>
          <button onClick={()=>api.get('/analytics/stats').then(r=>setSiteStats(r.data)).catch(()=>{})} style={GHOST}>↻ Actualiser</button>
        </div>

        {!siteStats ? (
          <div style={{ textAlign:'center', padding:40, color:'#636363' }}>Chargement des statistiques...</div>
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
              <KpiCard label="Aujourd'hui" value={siteStats.today} accent="#22C55E" />
              <KpiCard label="Cette semaine" value={siteStats.week} accent="#3B82F6" />
              <KpiCard label="Ce mois" value={siteStats.month} accent={V} />
              <KpiCard label="Total" value={siteStats.total} accent="#F59E0B" />
            </div>

            {/* Graphique 30 jours */}
            {siteStats.byDay?.length > 0 && (
              <div style={{ ...CARD, marginBottom:24 }}>
                <div style={HDR}>Visites des 30 derniers jours</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:140, padding:'10px 0' }}>
                  {siteStats.byDay.map(d => {
                    const max = Math.max(...siteStats.byDay.map(x=>parseInt(x.views)||1));
                    const h = Math.max(4, Math.round((parseInt(d.views)/max)*120));
                    const date = new Date(d.day);
                    const label = `${date.getDate()}/${date.getMonth()+1}`;
                    return (
                      <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }} title={`${label}: ${d.views} visites`}>
                        <div style={{ fontSize:10, fontWeight:700, color:V }}>{d.views}</div>
                        <div style={{ width:'100%', background:V, borderRadius:'4px 4px 0 0', height:h, minWidth:4, transition:'height .3s' }} />
                        <div style={{ fontSize:8, color:'#636363', transform:'rotate(-45deg)', whiteSpace:'nowrap' }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pages les plus visitées */}
            <div style={CARD}>
              <div style={HDR}>Pages les plus visitées</div>
              {(siteStats.byPage||[]).length === 0 ? (
                <div style={{ padding:20, textAlign:'center', color:'#636363', fontSize:13 }}>Aucune donnée encore</div>
              ) : (siteStats.byPage||[]).map((p,i) => (
                <div key={p.page} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:i<siteStats.byPage.length-1?'1px solid #F0F0F0':'none' }}>
                  <div style={{ width:28, height:28, background:V_SOFT, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, fontSize:12, fontWeight:700, color:V }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:14, color:'#1C1C1E', fontWeight:500 }}>{p.page}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:V }}>{p.views} <span style={{ fontSize:11, fontWeight:400, color:'#636363' }}>visites</span></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>)}

      {/* MODAL: Projet detail (with IMPROVEMENT 2 + 4) */}
      {modalProjet && (
        <div style={OVL} onClick={() => { setModalProjet(null); setChatInput(''); }}>
          <div style={{ ...BOX, maxWidth:620 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:2 }}>{modalProjet.titre}</div>
            <div style={{ color:'#636363', fontSize:14, marginBottom:16 }}>{modalProjet.type} · {modalProjet.categorie} · <StatusBadge statut={modalProjet.statut} /></div>
            <div style={{ ...CARD, background:'#FAFAFA', marginBottom:16 }}>
              {[{l:'Client',v:modalProjet.client},{l:'Email',v:modalProjet.clientEmail||'—'},{l:'Téléphone',v:modalProjet.clientTel||'—'},{l:'Responsable',v:modalProjet.responsable||'À assigner'},{l:'Montant',v:modalProjet.montant?`${modalProjet.montant}€`:'À définir'},{l:'Devis',v:modalProjet.devisRef||'—'}].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#636363' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
                </div>
              ))}
            </div>
            {/* Détails de la demande */}
            {(modalProjet.notes || modalProjet.style || modalProjet.reference || modalProjet.options?.length > 0) && (
              <div style={{ padding:'14px 16px', background:V_SOFT, borderRadius:10, marginBottom:16, fontSize:13, color:'#5B21B6' }}>
                {modalProjet.style && <div style={{ marginBottom:4 }}><strong>Style :</strong> {modalProjet.style}</div>}
                {modalProjet.options?.length > 0 && <div style={{ marginBottom:4 }}><strong>Options :</strong> {Array.isArray(modalProjet.options) ? modalProjet.options.join(', ') : modalProjet.options}</div>}
                {modalProjet.reference && <div style={{ marginBottom:4 }}><strong>Référence :</strong> <a href={modalProjet.reference} target="_blank" rel="noopener noreferrer" style={{ color:'#7C3AED' }}>{modalProjet.reference}</a></div>}
                {modalProjet.notes && <div>📝 {modalProjet.notes}</div>}
              </div>
            )}

            {/* Avancement : compteur fichiers */}
            {['en_cours','revision'].includes(modalProjet.statut) && (() => {
              const qte = Number(modalProjet.quantite)||1;
              const fait = Number(projets.find(p=>p.id===modalProjet.id)?.fichiersFaits)||0;
              const pct = Math.round((fait/qte)*100);
              return (
                <div style={{ ...CARD, background:V_SOFT, marginBottom:16, padding:'16px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#5B21B6' }}>Avancement</div>
                    <div style={{ fontSize:16, fontWeight:800, color:V }}>{fait}/{qte} · {pct}%</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.5)', borderRadius:4, height:8, marginBottom:12 }}>
                    <div style={{ background:V, borderRadius:4, height:8, width:`${pct}%`, transition:'width .3s' }} />
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <button onClick={(e) => { e.stopPropagation(); incrementFichier(modalProjet.id); showToast(`${fait+1}/${qte} terminé${fait+1>1?'s':''}`); }}
                      style={{ ...BTN, padding:'10px 18px', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                      ✅ +1 fichier terminé
                    </button>
                    <span style={{ fontSize:12, color:'#636363' }}>
                      {fait >= qte ? '🎉 Tout est fait ! Prêt à livrer.' : `${qte - fait} restant${qte-fait>1?'s':''}`}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Fichiers livrés */}
            {['en_cours','revision','livre','paye'].includes(modalProjet.statut) && (
              <div style={{ marginBottom:16 }}>
                <div style={HDR}>📁 Fichiers livrés</div>
                <div style={{ ...CARD, background:'#FAFAFA', padding:'12px 16px' }}>
                  {DEMO_FILES.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom: i < DEMO_FILES.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>🎬 {f.nom}</div>
                        <div style={{ fontSize:11, color:'#636363' }}>{f.taille} · {f.date}</div>
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
                        <div style={{ fontSize:11, color:'#636363', marginBottom:2, textAlign: m.isMe ? 'right' : 'left' }}>{m.from} · {m.time}</div>
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

            {/* ── Actions selon le statut ── */}
            <div style={{ padding:'16px 0 0', borderTop:'1px solid #F0F0F0' }}>

              {/* Brief reçu → Accepter / Contre-proposition / Refuser */}
              {modalProjet.statut === 'demande' && (
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#636363', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Répondre à la demande</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <button onClick={() => accepterBrief(modalProjet)} style={{ ...BTN, width:'100%', padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      ✅ Accepter — Envoyer un devis automatique
                    </button>
                    <button onClick={() => contreProposition(modalProjet)} style={{ ...GHOST, width:'100%', padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      📝 Contre-proposition — Modifier le prix
                    </button>
                    <button onClick={() => refuserBrief(modalProjet)} style={{ width:'100%', padding:'12px', background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      ✗ Refuser cette demande
                    </button>
                  </div>
                </div>
              )}

              {/* Devis envoyé → Attente réponse client */}
              {modalProjet.statut === 'devis_envoye' && (
                <div>
                  <div style={{ padding:'12px 16px', background:'#DBEAFE', borderRadius:10, marginBottom:10, fontSize:13, color:'#1D4ED8', fontWeight:600 }}>
                    ⏳ Devis envoyé au client — en attente de réponse
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => clientAAccepte(modalProjet.id)} style={{ ...BTN, flex:1, padding:'12px', background:'#059669' }}>✅ Client a accepté → Démarrer</button>
                    <button onClick={() => contreProposition(modalProjet)} style={{ ...GHOST, flex:1, padding:'12px' }}>📝 Modifier le devis</button>
                  </div>
                </div>
              )}

              {/* En cours → Assigner + Livrer */}
              {modalProjet.statut === 'en_cours' && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {!modalProjet.responsable && (
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                      <span style={{ fontSize:13, color:'#636363' }}>Assigner à :</span>
                      {EQUIPE_INIT.map(e => (
                        <button key={e.id} onClick={() => assignerResponsable(modalProjet.id, e.nom)}
                          style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${V}20`, background:V_SOFT, color:V, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          {e.nom}
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => livrerProjet(modalProjet.id)} style={{ ...BTN, width:'100%', padding:'12px', background:'#059669' }}>📦 Livrer au client</button>
                </div>
              )}

              {/* Révision → re-livrer */}
              {modalProjet.statut === 'revision' && (
                <button onClick={() => livrerProjet(modalProjet.id)} style={{ ...BTN, width:'100%', padding:'12px', background:'#059669' }}>📦 Envoyer la version corrigée</button>
              )}

              {/* Livré → en attente validation client + archiver */}
              {modalProjet.statut === 'livre' && (
                <div>
                  <div style={{ padding:'12px 16px', background:'#D1FAE5', borderRadius:10, fontSize:13, color:'#065F46', fontWeight:600, marginBottom:8 }}>
                    ✅ Livré — en attente de validation par le client
                  </div>
                  <button onClick={() => archiverProjet(modalProjet.id)} style={{ ...GHOST, width:'100%', padding:'10px', fontSize:13, color:'#636363' }}>📦 Archiver ce projet</button>
                </div>
              )}

              {/* Payé → terminé + archiver */}
              {modalProjet.statut === 'paye' && (
                <div>
                  <div style={{ padding:'12px 16px', background:'#F0FDF4', borderRadius:10, fontSize:13, color:'#0F766E', fontWeight:600, marginBottom:8 }}>
                    💰 Projet terminé et payé
                  </div>
                  <button onClick={() => archiverProjet(modalProjet.id)} style={{ ...GHOST, width:'100%', padding:'10px', fontSize:13, color:'#636363' }}>📦 Archiver ce projet</button>
                </div>
              )}

              {/* Archivé */}
              {modalProjet.statut === 'archive' && (
                <div style={{ padding:'12px 16px', background:'#F3F3F3', borderRadius:10, fontSize:13, color:'#636363', fontWeight:600 }}>
                  📦 Projet archivé
                </div>
              )}

              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={() => { setModalProjet(null); setChatInput(''); }} style={{ ...GHOST, flex:1, padding:'12px' }}>Fermer</button>
                <button onClick={() => { if(window.confirm('Supprimer ce projet définitivement ?')) supprimerProjet(modalProjet.id); }} style={{ padding:'12px 16px', background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' }}>🗑️ Supprimer</button>
              </div>
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
              <label style={labelStyle}>Description du projet</label>
              <textarea value={newProjetForm.brief} onChange={e => setNewProjetForm(p => ({...p, brief:e.target.value}))} rows={3} placeholder="Décrivez le projet, les attentes, le style souhaité..." style={{ ...inputStyle, resize:'vertical' }} />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Deadline</label>
              <input type="date" value={newProjetForm.deadline} onChange={e => setNewProjetForm(p => ({...p, deadline:e.target.value}))} style={inputStyle} />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Responsable (équipe)</label>
              <select value={newProjetForm.responsable} onChange={e => setNewProjetForm(p => ({...p, monteur:e.target.value}))} style={inputStyle}>
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
                <span style={{ color:'#636363' }}>Solde libéré disponible</span>
                <span style={{ fontWeight:800, color:'#059669' }}>{paiementsLiberes}€</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:14 }}>
                <span style={{ color:'#636363' }}>Paiements bloqués</span>
                <span style={{ fontWeight:800, color:'#D97706' }}>{paiementsBloques}€</span>
              </div>
            </div>
            <p style={{ fontSize:13, color:'#636363', marginBottom:20 }}>Le virement sera effectué sous 2-3 jours ouvrés sur votre compte bancaire enregistré.</p>
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
