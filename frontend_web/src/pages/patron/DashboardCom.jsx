import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTarifs, saveTarifs, resetTarifs } from '../../data/tarifsCom';
import api from '../../services/api';

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
  { id:'archives',  icon:'📦', label:'Archives' },
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
  archive:    { label:'Archivé',    bg:'#F3F3F3', border:'#E5E5E5', color:'#8B8B8B' },
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

const TAB_MAP = { projets:'projets', archives:'archives', devis:'devis', factures:'factures', paiements:'paiements', clients:'clients', tarifs:'tarifs', equipe:'equipe', rapports:'rapports' };

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
  const [paiements, setPaiements] = useState(PAIEMENTS_INIT);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && TAB_MAP[o]) setTab(TAB_MAP[o]);
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
          dbId: p.id,
        }));
        setProjets(mapped);
      }
    }).catch(() => {});
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
    setProjets(prev => prev.map(p => {
      if (p.id !== projetId) return p;
      const fait = (Number(p.fichiersFaits) || 0) + 1;
      const qte = Number(p.quantite) || 1;
      return { ...p, fichiersFaits: fait, statut: fait >= qte ? 'livre' : p.statut };
    }));
    // Sync avec l'API
    const p = projets.find(pr => pr.id === projetId);
    if (p?.dbId) {
      const fait = (Number(p.fichiersFaits) || 0) + 1;
      const qte = Number(p.quantite) || 1;
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
    showToast('Brief refusé — email envoyé au client');
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

  // Archiver un projet terminé
  const archiverProjet = async (id) => {
    await updateStatut(id, 'archive');
    showToast('Projet archivé');
    setModalProjet(null);
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
          <KpiCard label="Briefs à traiter" value={projets.filter(p=>p.statut==='demande').length} accent="#D97706" sub={projets.filter(p=>p.statut==='demande').length>0?'⚡ À répondre':'Aucun'} />
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
            <div style={{ padding:24, textAlign:'center', color:'#8B8B8B', fontSize:14 }}>Aucun projet en cours — les briefs apparaîtront ici</div>
          )}
          {projets.filter(p => !['livre','paye','refuse','archive'].includes(p.statut)).filter(p => !mesTaches || p.responsable).map(p => {
            const avancement = getAvancement(p);
            const urgence = getUrgence(p);
            return (
              <div key={p.id} onClick={() => setModalProjet(p)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background: urgence==='retard'?'#FEF2F2':urgence==='urgent'?'#FFFBEB':'#FAFAFA', borderRadius:10, marginBottom:8, cursor:'pointer', border:`1px solid ${urgence==='retard'?'#FECACA':urgence==='urgent'?'#FDE68A':'#F0F0F0'}` }}>
                <div style={{ width:40, height:40, borderRadius:10, background:V_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎬</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.titre}</div>
                  <div style={{ fontSize:12, color:'#8B8B8B' }}>{p.responsable || '⚠️ À assigner'} · {p.montant?p.montant+'€':'À définir'}</div>
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
                    <span style={{ fontSize:11, fontWeight:600, color: urgence==='retard'?'#DC2626':urgence==='urgent'?'#D97706':'#8B8B8B' }}>
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
        {filteredProjets.length === 0 && <div style={{ ...CARD, padding:32, textAlign:'center', color:'#8B8B8B' }}>Aucun projet</div>}
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
              <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:6 }}>{p.client} · 👤 {p.responsable || 'À assigner'}{p.dateFin ? ` · 📅 ${p.dateFin}` : ''}</div>
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

      {/* TAB: Archives */}
      {tab === 'archives' && (<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Projets archivés</div>
        {projets.filter(p => p.statut === 'archive').length === 0 && (
          <div style={{ ...CARD, padding:32, textAlign:'center', color:'#8B8B8B' }}>Aucun projet archivé</div>
        )}
        {projets.filter(p => p.statut === 'archive').map(p => (
          <div key={p.id} onClick={() => setModalProjet(p)} style={{ ...CARD, marginBottom:10, cursor:'pointer', padding:'16px 20px', opacity:0.7 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{p.titre}</div>
              <StatusBadge statut={p.statut} />
            </div>
            <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:4 }}>{p.client} · {p.responsable || '—'}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:800, color:'#8B8B8B', fontSize:15 }}>{p.montant?p.montant+'€':'—'}</span>
              <span style={{ fontSize:12, color:'#8B8B8B' }}>{p.dateDebut || '—'}</span>
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

      {/* TAB: Grille tarifaire (éditable) */}
      {tab === 'tarifs' && (<div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Grille tarifaire</div>
            <div style={{ fontSize:13, color:'#8B8B8B', marginTop:2 }}>Modifiez les prix — les changements sont visibles immédiatement sur le site</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { const r = resetTarifs(); setTarifs(r); showToast('Tarifs réinitialisés aux valeurs par défaut'); }} style={GHOST}>↺ Réinitialiser</button>
          </div>
        </div>
        {tarifs.map((t, ci) => (
          <div key={t.cat} style={{ marginBottom:20 }}>
            <div style={HDR}>{t.cat}</div>
            <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
              {t.items.map((item, ji) => {
                const isEditing = editingTarif && editingTarif.catIdx === ci && editingTarif.itemIdx === ji;
                return (
                  <div key={item.id||ji} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderBottom: ji < t.items.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                    {isEditing ? (
                      <>
                        <input value={editNom} onChange={e=>setEditNom(e.target.value)} style={{ flex:1, padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none' }} />
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <input type="number" value={editPrix} onChange={e=>setEditPrix(e.target.value)} style={{ width:80, padding:'8px 12px', borderRadius:8, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', textAlign:'right' }} />
                          <span style={{ fontSize:14, fontWeight:700, color:V }}>€</span>
                        </div>
                        <button onClick={() => {
                          const updated = tarifs.map((cat, i) => i !== ci ? cat : { ...cat, items: cat.items.map((it, j) => j !== ji ? it : { ...it, nom: editNom, prix: Number(editPrix) }) });
                          setTarifs(updated);
                          saveTarifs(updated);
                          setEditingTarif(null);
                          showToast('Prix mis à jour — visible sur le site');
                        }} style={{ ...BTN, padding:'7px 14px', fontSize:13 }}>✓</button>
                        <button onClick={() => setEditingTarif(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#8B8B8B', fontSize:16 }}>✕</button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex:1, fontSize:14 }}>{item.nom}</span>
                        <span style={{ fontSize:15, fontWeight:800, color:V, minWidth:60, textAlign:'right' }}>{item.prix}€</span>
                        <button onClick={() => { setEditingTarif({catIdx:ci, itemIdx:ji}); setEditPrix(String(item.prix)); setEditNom(item.nom); }}
                          style={{ background:'none', border:'1px solid #E9E5F5', borderRadius:8, padding:'5px 10px', cursor:'pointer', fontSize:12, color:'#8B8B8B', fontFamily:'inherit', transition:'all .15s' }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=V;e.currentTarget.style.color=V;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='#E9E5F5';e.currentTarget.style.color='#8B8B8B';}}>
                          ✎ Modifier
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ padding:'14px 18px', background:V_SOFT, borderRadius:12, marginTop:8, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>💡</span>
          <span style={{ fontSize:13, color:'#5B21B6' }}>Les modifications sont sauvegardées automatiquement et visibles immédiatement sur la page publique <strong>/com</strong></span>
        </div>
      </div>)}

      {/* TAB: Équipe interne */}
      {tab === 'equipe' && (<div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Équipe Freample Com</div>
            <div style={{ fontSize:13, color:'#8B8B8B', marginTop:2 }}>Votre équipe interne — {equipe.length} membres</div>
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
                  <div style={{ fontSize:13, color:'#8B8B8B' }}>{e.poste}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:'#8B8B8B', marginBottom:12, padding:'8px 12px', background:V_SOFT, borderRadius:8 }}>🎯 {e.specialite}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ color:'#8B8B8B' }}>Projets actifs</span>
                <span style={{ fontWeight:700 }}>{e.projetsActifs}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ color:'#8B8B8B' }}>Projets réalisés</span>
                <span style={{ fontWeight:700 }}>{e.projetsTotal}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ color:'#8B8B8B' }}>Charge</span>
                <span style={{ fontWeight:700, color: e.charge > 80 ? '#DC2626' : e.charge > 50 ? '#D97706' : '#16A34A' }}>{e.charge}%</span>
              </div>
              <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: e.dispo ? '#16A34A' : '#DC2626' }} />
                <span style={{ fontSize:12, fontWeight:600, color: e.dispo ? '#16A34A' : '#DC2626' }}>{e.dispo ? 'Disponible' : 'Occupé'}</span>
              </div>

              {/* Projets assignés */}
              {projets.filter(p => p.responsable === e.nom && !['paye','livre'].includes(p.statut)).length > 0 && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #F0F0F0' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Projets en cours</div>
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
              {[{l:'Client',v:modalProjet.client},{l:'Email',v:modalProjet.clientEmail||'—'},{l:'Téléphone',v:modalProjet.clientTel||'—'},{l:'Responsable',v:modalProjet.responsable||'À assigner'},{l:'Montant',v:modalProjet.montant?`${modalProjet.montant}€`:'À définir'},{l:'Devis',v:modalProjet.devisRef||'—'}].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#8B8B8B' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
                </div>
              ))}
            </div>
            {/* Brief détaillé */}
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
                    <span style={{ fontSize:12, color:'#8B8B8B' }}>
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

            {/* ── Actions selon le statut ── */}
            <div style={{ padding:'16px 0 0', borderTop:'1px solid #F0F0F0' }}>

              {/* Brief reçu → Accepter / Contre-proposition / Refuser */}
              {modalProjet.statut === 'demande' && (
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#8B8B8B', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Répondre au brief</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <button onClick={() => accepterBrief(modalProjet)} style={{ ...BTN, width:'100%', padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      ✅ Accepter — Envoyer un devis automatique
                    </button>
                    <button onClick={() => contreProposition(modalProjet)} style={{ ...GHOST, width:'100%', padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      📝 Contre-proposition — Modifier le prix
                    </button>
                    <button onClick={() => refuserBrief(modalProjet)} style={{ width:'100%', padding:'12px', background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      ✗ Refuser ce brief
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
                      <span style={{ fontSize:13, color:'#8B8B8B' }}>Assigner à :</span>
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
                  <button onClick={() => archiverProjet(modalProjet.id)} style={{ ...GHOST, width:'100%', padding:'10px', fontSize:13, color:'#8B8B8B' }}>📦 Archiver ce projet</button>
                </div>
              )}

              {/* Payé → terminé + archiver */}
              {modalProjet.statut === 'paye' && (
                <div>
                  <div style={{ padding:'12px 16px', background:'#F0FDF4', borderRadius:10, fontSize:13, color:'#0F766E', fontWeight:600, marginBottom:8 }}>
                    💰 Projet terminé et payé
                  </div>
                  <button onClick={() => archiverProjet(modalProjet.id)} style={{ ...GHOST, width:'100%', padding:'10px', fontSize:13, color:'#8B8B8B' }}>📦 Archiver ce projet</button>
                </div>
              )}

              {/* Archivé */}
              {modalProjet.statut === 'archive' && (
                <div style={{ padding:'12px 16px', background:'#F3F3F3', borderRadius:10, fontSize:13, color:'#8B8B8B', fontWeight:600 }}>
                  📦 Projet archivé
                </div>
              )}

              <button onClick={() => { setModalProjet(null); setChatInput(''); }} style={{ ...GHOST, width:'100%', padding:'12px', marginTop:8 }}>Fermer</button>
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
