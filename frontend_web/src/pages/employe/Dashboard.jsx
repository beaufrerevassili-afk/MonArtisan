import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../services/api';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';
import DS from '../../design/luxe';
import NotificationBell from '../../components/ui/NotificationBell';
import { IconHome, IconCalendar, IconCreditCard, IconClock, IconDocument, IconBox, IconUser, IconShield, IconMissions } from '../../components/ui/Icons';
import AvisDePassage from '../../components/chantier/AvisDePassage';
import PhotoProfil from '../../components/ui/PhotoProfil';

const MENU_ITEMS = [
  { id: 'matin', label: 'Mon matin', Icon: IconHome },
  { id: 'mafiche', label: 'Ma fiche', Icon: IconShield },
  { id: 'planning', label: 'Planning semaine', Icon: IconCalendar },
  { id: 'paie', label: 'Fiches de paie', Icon: IconCreditCard },
  { id: 'conges', label: 'Congés', Icon: IconClock },
  { id: 'frais', label: 'Notes de frais', Icon: IconDocument },
  { id: 'chantiers', label: 'Chantiers', Icon: IconMissions },
  { id: 'documents', label: 'Documents', Icon: IconBox },
  { id: 'messages', label: 'Messages', Icon: IconDocument },
  { id: 'profil', label: 'Profil', Icon: IconUser },
];

const DOCUMENTS_REQUIS = [
  { id: 'piece_identite',      label: 'Pièce d\'identité (CNI ou passeport)', icon: '🪪' },
  { id: 'carte_vitale',        label: 'Carte Vitale (attestation ou copie)', icon: '💚' },
  { id: 'rib',                 label: 'RIB (pour le versement du salaire)', icon: '🏦' },
  { id: 'justificatif_domicile', label: 'Justificatif de domicile (< 3 mois)', icon: '🏠' },
  { id: 'diplomes',            label: 'Diplômes et certifications', icon: '🎓' },
  { id: 'permis_conduire',     label: 'Permis de conduire', icon: '🚗' },
  { id: 'photo_identite',      label: 'Photo d\'identité', icon: '📷' },
  { id: 'attestation_securite_sociale', label: 'Attestation de sécurité sociale', icon: '📋' },
  { id: 'casier_judiciaire',   label: 'Extrait de casier judiciaire', icon: '📄' },
];

const DEMO_CHANTIERS = (() => { try { if (_isDemo()) { const c = JSON.parse(localStorage.getItem('freample_chantiers_custom')); if (c?.length) return c; } } catch {} return [
  { id:'ch1', titre:'Rénovation cuisine — Mme Dupont', adresse:'12 rue de la Liberté, 13001 Marseille', statut:'en_cours', dateDebut:'2026-04-01', dateFin:'2026-04-25', chef:'Marc Lambert', equipe:['Pierre Martin','Sophie Duval','Lucas Garcia'] },
  { id:'ch2', titre:'Mise aux normes électriques — Copropriété Les Oliviers', adresse:'5 rue Pasteur, 13006 Marseille', statut:'planifie', dateDebut:'2026-04-28', dateFin:'2026-05-10', chef:'Marc Lambert', equipe:['Claire Bernard'] },
  { id:'ch3', titre:'Peinture parties communes — Syndic Voltaire', adresse:'15 bd Voltaire, 13005 Marseille', statut:'en_cours', dateDebut:'2026-04-07', dateFin:'2026-04-18', chef:'Marc Lambert', equipe:['Luc Moreau','Pierre Martin'] },
]; })();

const DEMO_BULLETINS = [
  { id:1, periode:'Mars 2026', brut:2800, net:2184, date:'2026-03-28', statut:'paye' },
  { id:2, periode:'Février 2026', brut:2800, net:2184, date:'2026-02-27', statut:'paye' },
  { id:3, periode:'Janvier 2026', brut:2800, net:2184, date:'2026-01-29', statut:'paye' },
];

const DEMO_CONGES = [
  { id:1, debut:'2026-02-17', fin:'2026-02-21', jours:5, type:'vacances', statut:'approuve', commentaire:'Vacances ski' },
  { id:2, debut:'2026-03-14', fin:'2026-03-14', jours:1, type:'maladie', statut:'approuve', commentaire:'Grippe' },
  { id:3, debut:'2026-05-05', fin:'2026-05-09', jours:5, type:'vacances', statut:'en_attente', commentaire:'Pont mai' },
];

const DEMO_FRAIS = [
  { id:1, date:'2026-04-02', montant:45.80, categorie:'Transport', description:'Trajet chantier Pastorelli', statut:'rembourse' },
  { id:2, date:'2026-04-04', montant:12.50, categorie:'Repas', description:'Déjeuner chantier', statut:'approuve' },
  { id:3, date:'2026-04-05', montant:89.00, categorie:'Matériel', description:'Outillage Leroy Merlin', statut:'en_attente' },
];

const DEMO_PLANNING_FALLBACK = [
  { id:1, jour:'Lundi', heure:'07:30-17:00', tache:'Chantier Dupont — Démolition cuisine', lieu:'12 rue de la Liberté, Marseille' },
  { id:2, jour:'Mardi', heure:'07:30-17:00', tache:'Chantier Dupont — Plomberie', lieu:'12 rue de la Liberté, Marseille' },
  { id:3, jour:'Mercredi', heure:'07:30-12:00', tache:'Chantier Dupont — Électricité', lieu:'12 rue de la Liberté, Marseille' },
  { id:4, jour:'Mercredi', heure:'14:00-17:00', tache:'Réunion équipe', lieu:'Bureau' },
  { id:5, jour:'Jeudi', heure:'07:30-17:00', tache:'Chantier Dupont — Pose carrelage', lieu:'12 rue de la Liberté, Marseille' },
  { id:6, jour:'Vendredi', heure:'07:30-16:00', tache:'Chantier Dupont — Finitions', lieu:'12 rue de la Liberté, Marseille' },
];

// Générer le planning réel depuis les chantiers du patron
function buildPlanningFromChantiers(chantiers, userName) {
  const JOURS_SEMAINE = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const now = new Date();
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const planning = [];
  for (let d = 0; d < 6; d++) {
    const day = new Date(monday); day.setDate(monday.getDate() + d);
    const dayStr = day.toISOString().slice(0, 10);
    const jourLabel = JOURS_SEMAINE[day.getDay()];
    chantiers.forEach(c => {
      if (c.statut === 'terminee' || c.statut === 'annulee') return;
      if (!c.dateDebut) return;
      const fin = c.dateFin || c.dateDebut;
      if (dayStr < c.dateDebut || dayStr > fin) return;
      // Vérifier si le salarié est dans l'équipe
      const inEquipe = !c.equipe || c.equipe.length === 0 || c.equipe.some(e => (userName || '').toLowerCase().split(' ').some(n => n.length > 2 && e.toLowerCase().includes(n)));
      if (!inEquipe) return;
      planning.push({ id: `${c.id}-${d}`, jour: jourLabel, heure: '07:30-17:00', tache: c.titre || c.description?.slice(0, 50) || 'Chantier', lieu: c.adresse || c.ville || '—' });
    });
  }
  return planning;
}

const DEMO_PROFIL = { prenom:'Lucas', nom:'Garcia', poste:'Carreleur', email:'lucas.garcia@lambertbtp.fr', telephone:'06 34 56 78 90', typeContrat:'CDI', salaireBase:2500, dateEntree:'2023-09-01', statut:'actif' };
const DEMO_PATRON = (() => {
  try {
    const p = JSON.parse(localStorage.getItem('freample_profil_patron') || 'null');
    if (p?.nom) return { nom: p.nom, email: p.email || '', siret: p.siret || '', adresse: p.adresse || 'Marseille', metier: (p.metiers || []).join(', ') || p.metier || 'BTP' };
  } catch {}
  return { nom:'Lambert BTP', email:'contact@lambertbtp.fr', siret:'12345678900012', adresse:'Marseille', metier:'BTP' };
})();

const statutColors = { en_cours:'#2563EB', planifie:'#D97706', complete:'#16A34A', en_attente:'#D97706', approuve:'#16A34A', rejete:'#DC2626', rembourse:'#16A34A', paye:'#16A34A', parti:'#DC2626' };
const statutLabels = { en_cours:'En cours', planifie:'Planifié', complete:'Terminé', en_attente:'En attente', approuve:'Approuvé', rejete:'Rejeté', rembourse:'Remboursé', paye:'Payé', parti:'Parti' };

const CARD_DESKTOP = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const CARD_MOBILE = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:'12px 14px' };
const BTN = { padding:'10px 20px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };

function useIsMobile(bp = 640) {
  const [m, setM] = useState(() => window.innerWidth <= bp);
  useEffect(() => { const h = () => setM(window.innerWidth <= bp); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, [bp]);
  return m;
}

export default function DashboardEmploye() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const CARD = isMobile ? CARD_MOBILE : CARD_DESKTOP;
  const isDemo = _isDemo();
  const [tab, setTab] = useState('matin');
  const [chantiers, setChantiers] = useState(isDemo ? DEMO_CHANTIERS : []);
  const [bulletins, setBulletins] = useState(isDemo ? DEMO_BULLETINS : []);
  const [conges, setConges] = useState(isDemo ? DEMO_CONGES : []);
  const [frais, setFrais] = useState(isDemo ? DEMO_FRAIS : []);
  const [profil, setProfil] = useState(isDemo ? DEMO_PROFIL : {});
  const [patron, setPatron] = useState(isDemo ? DEMO_PATRON : {});
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [mesDocs, setMesDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [bulletinPreview, setBulletinPreview] = useState(null);
  const [pointages, setPointages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('freample_pointages') || '[]'); } catch { return []; }
  });
  const [signalForm, setSignalForm] = useState({ desc: '', type: 'defaut' });
  const [signalOpen, setSignalOpen] = useState(null);
  const [rapportForm, setRapportForm] = useState({ note: '' });
  const [rapportOpen, setRapportOpen] = useState(null);
  const [messageForm, setMessageForm] = useState('');
  const [messageOpen, setMessageOpen] = useState(null);
  const [meteoOpen, setMeteoOpen] = useState(null);
  const [trajetPointage, setTrajetPointage] = useState(() => {
    try { return JSON.parse(localStorage.getItem('freample_trajet_today') || 'null'); } catch { return null; }
  });

  // Carburant states
  const [carburantForm, setCarburantForm] = useState({ litres: '', montant: '', km: '' });
  const [carburantOpen, setCarburantOpen] = useState(null); // chantierId
  const [carburantConfirm, setCarburantConfirm] = useState(null);

  // Stock management states
  const [stockExpandedChantier, setStockExpandedChantier] = useState(null); // { chantierId, section: 'stock'|'achat'|'surplus' }
  const [stockQties, setStockQties] = useState({}); // { articleId: qty }
  const [achatForm, setAchatForm] = useState({ fournisseur: '', tva: '20' });
  const [achatLignes, setAchatLignes] = useState([{ article: '', quantite: '', unite: 'u', prixUnitaire: '' }]);
  const [surplusForm, setSurplusForm] = useState({ article: '', quantite: '', prixUnitaire: '' });
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [stockSuggestIdx, setStockSuggestIdx] = useState(null); // which input shows suggestions
  const [stockConfirmation, setStockConfirmation] = useState(null);

  // Todo demain states
  const [todoForm, setTodoForm] = useState('');
  const [todoOpen, setTodoOpen] = useState(null);

  // Note de frais chantier states
  const [fraisChantierForm, setFraisChantierForm] = useState({ montant: '', categorie: 'Repas', description: '' });
  const [fraisChantierOpen, setFraisChantierOpen] = useState(null);

  // Chantier detail + avis de passage states
  const [selectedChantier, setSelectedChantier] = useState(null);
  const [showAvis, setShowAvis] = useState(false);
  const [avisPassages, setAvisPassages] = useState([]);

  const [hasEntreprise, setHasEntreprise] = useState(!!user?.patronId);

  useEffect(() => {
    api.get('/rh/mon-profil').then(({ data }) => {
      if (data.employe) setProfil(data.employe);
      if (data.patron) { setPatron(data.patron); setHasEntreprise(true); }
      else { setPatron({}); setHasEntreprise(false); }
    }).catch(() => {});
    api.get('/missions').then(({ data }) => { if (data.missions?.length) setChantiers(data.missions); }).catch(() => {
      const patronChantiers = JSON.parse(localStorage.getItem('freample_chantiers_custom') || '[]');
      if (patronChantiers.length > 0) {
        setChantiers(patronChantiers);
      }
      // Keep DEMO_CHANTIERS as additional fallback (already set as initial state)
    });
    api.get('/rh/bulletins-paie').then(({ data }) => { if (data.bulletins?.length) setBulletins(data.bulletins); }).catch(() => {});
    api.get('/rh/conges').then(({ data }) => { if (data.conges?.length) setConges(data.conges); }).catch(() => {
      // Fallback localStorage — lire les congés avec statuts mis à jour par le patron
      try {
        const local = JSON.parse(localStorage.getItem('freample_conges') || '[]');
        if (local.length > 0) setConges(local);
      } catch {}
    });
    api.get('/rh/notes-frais').then(({ data }) => { if (data.notes?.length) setFrais(data.notes); }).catch(() => {});
    api.get('/rh/documents').then(({ data }) => { if (data.documents) setMesDocs(data.documents); }).catch(() => {});
  }, []);

  const congesRestants = 25 - conges.filter(c => c.statut === 'approuve' && c.type === 'vacances').reduce((s, c) => s + c.jours, 0);
  const fraisEnAttente = frais.filter(f => f.statut === 'en_attente').reduce((s, f) => s + f.montant, 0);

  const submitConge = () => {
    const c = { id: Date.now(), debut: form.debut, fin: form.fin, jours: Math.max(1, Math.ceil((new Date(form.fin) - new Date(form.debut)) / 86400000) + 1), type: form.typeConge || 'vacances', statut: 'en_attente', commentaire: form.commentaire || '', employe: profil.prenom + ' ' + profil.nom };
    setConges(prev => [c, ...prev]);
    api.post('/rh/conges', c).catch(() => {});
    // Persist to shared localStorage for patron dashboard
    const allConges = JSON.parse(localStorage.getItem('freample_conges') || '[]');
    allConges.push(c);
    localStorage.setItem('freample_conges', JSON.stringify(allConges));
    setModal(null); setForm({});
  };

  const submitFrais = () => {
    const f = { id: Date.now(), date: form.dateFrais || new Date().toISOString().slice(0, 10), montant: Number(form.montant) || 0, categorie: form.categorie || 'Autre', description: form.descFrais || '', statut: 'en_attente', chantierId: form.chantierId || null, employe: profil.prenom + ' ' + profil.nom };
    setFrais(prev => [f, ...prev]);
    api.post('/rh/notes-frais', f).catch(() => {});
    // Persist to shared localStorage for patron dashboard
    const allFrais = JSON.parse(localStorage.getItem('freample_frais_chantier') || '[]');
    allFrais.push(f);
    localStorage.setItem('freample_frais_chantier', JSON.stringify(allFrais));
    setModal(null); setForm({});
  };

  const recordPointage = (type) => {
    const now = new Date();
    const entry = { date: now.toISOString().slice(0, 10), type, heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    const updated = [...pointages, entry];
    setPointages(updated);
    localStorage.setItem('freample_pointages', JSON.stringify(updated));
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPointages = pointages.filter(p => p.date === todayStr);
  const todayArrivees = todayPointages.filter(p => p.type === 'arrivee');
  const todayDeparts = todayPointages.filter(p => p.type === 'depart');
  const todayHoursWorked = (() => {
    let total = 0;
    for (let i = 0; i < todayPointages.length; i++) {
      const a = todayPointages.find((p, j) => j >= i && p.type === 'arrivee');
      if (!a) break;
      const aIdx = todayPointages.indexOf(a);
      const d = todayPointages.find((p, j) => j > aIdx && p.type === 'depart');
      if (!d) break;
      const [ah, am] = a.heure.split(':').map(Number);
      const [dh, dm] = d.heure.split(':').map(Number);
      total += (dh * 60 + dm) - (ah * 60 + am);
      i = todayPointages.indexOf(d);
    }
    return total > 0 ? `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}` : '0h00';
  })();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font }}>
      {/* Header sombre */}
      <div style={{ background: '#2C2520', padding: isMobile ? '0 12px' : '0 clamp(20px,4vw,40px)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 6, flexShrink: 0 }}>
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? 14 : 16, fontWeight: 900, color: '#F5EFE0', fontFamily: DS.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: '#A68B4B' }}>.</span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isMobile && <span style={{ color: '#F5EFE0', fontSize: 13 }}>{profil.prenom} {profil.nom}</span>}
          <NotificationBell dark />
          {hasEntreprise && !isMobile && <span style={{ fontSize: 12, color: '#A68B4B', fontWeight: 600 }}>{patron?.nom}</span>}
        </div>
      </div>

      {/* Sidebar burger */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1000, transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .3s', boxShadow: menuOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E8E6E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Espace salarié</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: DS.muted }}>×</button>
        </div>
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {MENU_ITEMS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }}
              style={{ width: '100%', padding: '12px 20px', background: tab === t.id ? '#F8F7F4' : 'none', border: 'none', borderLeft: `3px solid ${tab === t.id ? '#2C2520' : 'transparent'}`, cursor: 'pointer', fontFamily: DS.font, fontSize: 14, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? DS.ink : DS.muted, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .1s' }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = '#FAFAF8'; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'none'; }}>
              <t.Icon size={16} /> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E8E6E1' }}>
          <button onClick={async () => { await logout(); navigate('/login'); }} style={{ width: '100%', padding: '10px 16px', background: 'transparent', color: '#DC2626', border: '1px solid #DC2626', borderRadius: 8, cursor: 'pointer', fontFamily: DS.font, fontSize: 13, fontWeight: 600 }}>Se déconnecter</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '16px 12px' : '20px clamp(20px,4vw,40px)' }}>

      {/* Banner si pas d'entreprise */}
      {!hasEntreprise && profil.statut === 'parti' && (
        <div style={{ ...CARD, borderLeft: '4px solid #D97706', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>Vous n'êtes plus rattaché à une entreprise</div>
            <div style={{ fontSize: 12, color: DS.muted }}>Votre compte reste actif. Retrouvez des offres sur la page recrutement.</div>
          </div>
          <button onClick={() => navigate('/recrutement')} style={{ ...BTN, background: '#D97706' }}>Voir les offres</button>
        </div>
      )}

      {/* ═══ MON MATIN ═══ */}
      {tab === 'matin' && (() => {
        const today = new Date().toISOString().slice(0, 10);
        const mesChantiers = chantiers.filter(c => {
          const isInEquipe = (c.equipe || []).some(nom =>
            nom.toLowerCase().includes(profil.nom?.toLowerCase()) ||
            nom.toLowerCase().includes(profil.prenom?.toLowerCase())
          );
          const isActive = c.dateDebut && c.dateDebut <= today && (!c.dateFin || c.dateFin >= today);
          const notDone = c.statut !== 'terminee' && c.statut !== 'annulee' && c.statut !== 'complete';
          return (isInEquipe && isActive && notDone) || (c.statut === 'en_cours' && isActive);
        });

        // ── Compteur heures semaine ──
        const allPts = (() => { try { return JSON.parse(localStorage.getItem('freample_pointages') || '[]'); } catch { return []; } })();
        const now = new Date();
        const mondayDate = new Date(now); mondayDate.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        const mondayStr = mondayDate.toISOString().slice(0, 10);
        let heuresSemaine = 0;
        const joursPtes = [...new Set(allPts.filter(p => p.date >= mondayStr && p.date <= today).map(p => p.date))];
        joursPtes.forEach(d => {
          const arr = allPts.find(p => p.date === d && p.type === 'arrivee');
          const dep = allPts.find(p => p.date === d && p.type === 'depart');
          if (arr && dep) {
            const [ah, am] = arr.heure.split(':').map(Number);
            const [dh, dm] = dep.heure.split(':').map(Number);
            heuresSemaine += (dh * 60 + dm - ah * 60 - am) / 60;
          }
        });
        const heuresSupp = Math.max(0, heuresSemaine - 35);

        // ── Alertes salarié ──
        const alertesSalarie = [];
        const lsConges = (() => { try { return JSON.parse(localStorage.getItem('freample_conges') || '[]'); } catch { return []; } })();
        const mesCg = lsConges.filter(c => c.employe && `${profil.prenom} ${profil.nom}`.toLowerCase().includes(c.employe.toLowerCase().split(' ').pop()));
        mesCg.forEach(c => {
          if (c.statut === 'approuve') alertesSalarie.push({ type: 'success', msg: `Congé du ${c.debut} au ${c.fin} approuvé` });
          if (c.statut === 'rejete') alertesSalarie.push({ type: 'danger', msg: `Congé du ${c.debut} au ${c.fin} refusé${c.commentaire ? ' — ' + c.commentaire : ''}` });
        });
        const lsFrais = (() => { try { return JSON.parse(localStorage.getItem('freample_frais_chantier') || '[]'); } catch { return []; } })();
        const mesFr = lsFrais.filter(f => f.employe && `${profil.prenom} ${profil.nom}`.toLowerCase().includes(f.employe.toLowerCase().split(' ').pop()));
        mesFr.forEach(f => {
          if (f.statut === 'rembourse') alertesSalarie.push({ type: 'success', msg: `Note de frais "${f.description}" remboursée (${f.montant}€)` });
        });

        // ── Numéro patron ──
        const patronTel = (() => { try { const p = JSON.parse(localStorage.getItem('freample_profil_patron') || '{}'); return p.telephone || p.tel || ''; } catch { return ''; } })();

        return <>
        {/* Header + compteur + appel patron */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Bonjour {profil.prenom}</div>
            <div style={{ fontSize: 13, color: DS.muted }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          {patronTel && (
            <a href={`tel:${patronTel}`} style={{ padding: '8px 14px', background: '#16A34A', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Patron
            </a>
          )}
        </div>

        {/* Compteur heures semaine */}
        <div style={{ display: 'flex', gap: isMobile ? 6 : 8, marginBottom: 16 }}>
          <div style={{ flex: 1, padding: isMobile ? '8px 8px' : '10px 14px', background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 9 : 10, color: DS.muted, fontWeight: 600, textTransform: 'uppercase' }}>Cette semaine</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, color: DS.ink }}>{heuresSemaine.toFixed(1)}h</div>
          </div>
          <div style={{ flex: 1, padding: isMobile ? '8px 8px' : '10px 14px', background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 9 : 10, color: DS.muted, fontWeight: 600, textTransform: 'uppercase' }}>Heures sup</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, color: heuresSupp > 0 ? '#D97706' : '#16A34A' }}>{heuresSupp.toFixed(1)}h</div>
          </div>
          <div style={{ flex: 1, padding: isMobile ? '8px 8px' : '10px 14px', background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 9 : 10, color: DS.muted, fontWeight: 600, textTransform: 'uppercase' }}>Jours pointés</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, color: DS.ink }}>{joursPtes.length}/5</div>
          </div>
        </div>

        {/* Alertes salarié */}
        {alertesSalarie.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {alertesSalarie.map((a, i) => (
              <div key={i} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: a.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${a.type === 'success' ? '#16A34A40' : '#DC262640'}`,
                color: a.type === 'success' ? '#16A34A' : '#DC2626',
              }}>
                {a.type === 'success' ? '✓' : '✕'} {a.msg}
              </div>
            ))}
          </div>
        )}

        {/* Trajet pointage */}
        {!trajetPointage && (
          <button onClick={() => {
            const t = { departDepot: new Date().toISOString(), heureDepart: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) };
            setTrajetPointage(t);
            localStorage.setItem('freample_trajet_today', JSON.stringify(t));
          }} style={{ width: '100%', padding: '16px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
            Départ du dépôt
          </button>
        )}
        {trajetPointage && !trajetPointage.arriveeChantier && (
          <div style={{ padding: '12px 16px', background: '#EFF6FF', border: '1px solid #2563EB30', borderRadius: 12, marginBottom: 16, fontSize: 13 }}>
            En route depuis {trajetPointage.heureDepart}
          </div>
        )}

        {/* Pas de chantier */}
        {mesChantiers.length === 0 && (
          <div style={{ ...CARD, textAlign: 'center', padding: 32, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: DS.ink }}>Pas de chantier prévu aujourd'hui</div>
            <div style={{ fontSize: 13, color: DS.muted, marginBottom: 16 }}>Consultez le planning de la semaine</div>
            <button onClick={() => setTab('planning')} style={BTN}>Voir le planning</button>
          </div>
        )}

        {/* Chantiers du jour */}
        {mesChantiers.map(c => {
          const allPointages = JSON.parse(localStorage.getItem('freample_pointages') || '[]');
          const chantierPointages = allPointages.filter(p => p.date === today && p.chantierId === c.id);
          const hasArrived = chantierPointages.some(p => p.type === 'arrivee');
          const hasDeparted = chantierPointages.some(p => p.type === 'depart');
          const arrivalTime = chantierPointages.find(p => p.type === 'arrivee')?.heure;
          const departTime = chantierPointages.find(p => p.type === 'depart')?.heure;

          const isExpanded = stockExpandedChantier?.chantierId === c.id;
          const activeSection = isExpanded ? stockExpandedChantier.section : null;
          const toggleSection = (section) => {
            if (isExpanded && activeSection === section) {
              setStockExpandedChantier(null); setStockQties({}); setAchatForm({ fournisseur: '', tva: '20' }); setAchatLignes([{ article: '', quantite: '', unite: 'u', prixUnitaire: '' }]); setSurplusForm({ article: '', quantite: '', prixUnitaire: '' }); setStockConfirmation(null);
            } else {
              setStockExpandedChantier({ chantierId: c.id, section }); setStockQties({}); setAchatForm({ fournisseur: '', tva: '20' }); setAchatLignes([{ article: '', quantite: '', unite: 'u', prixUnitaire: '' }]); setSurplusForm({ article: '', quantite: '', prixUnitaire: '' }); setStockConfirmation(null);
            }
          };

          const messages = JSON.parse(localStorage.getItem(`freample_messages_${c.id}`) || '[]');

          return (
          <div key={c.id} style={{ ...CARD, marginBottom: 16 }}>
            {/* Todo from yesterday */}
            {(() => {
              const todo = JSON.parse(localStorage.getItem(`freample_todo_${c.id}`) || 'null');
              const isForToday = todo && todo.date === today;
              if (!isForToday) return null;
              return (
                <div style={{ marginBottom: 12, padding: '12px 14px', background: '#FEF3C7', border: '2px solid #D97706', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>À faire aujourd'hui</div>
                  <div style={{ fontSize: 13, color: DS.ink, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{todo.note}</div>
                  <div style={{ fontSize: 11, color: DS.muted, marginBottom: 8 }}>Noté par {todo.salarie}</div>
                  <button onClick={() => { localStorage.removeItem(`freample_todo_${c.id}`); setTodoOpen(prev => prev === null ? undefined : null); /* force re-render */ }} style={{ ...BTN, background: '#16A34A', fontSize: 11, padding: '6px 14px' }}>Fait</button>
                </div>
              );
            })()}
            {/* Chantier header */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: DS.ink, marginBottom: 2 }}>{c.titre}</div>
              {c.adresse && <a href={`https://maps.google.com/?q=${encodeURIComponent(c.adresse)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563EB', textDecoration: 'underline' }}>{c.adresse}</a>}
              {/* Équipe aujourd'hui */}
              {c.equipe && c.equipe.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: DS.muted, fontWeight: 600 }}>Équipe :</span>
                  {c.equipe.map((nom, ei) => {
                    const isMe = nom.toLowerCase().includes(profil.nom?.toLowerCase()) || nom.toLowerCase().includes(profil.prenom?.toLowerCase());
                    return (
                      <span key={ei} style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: isMe ? '#2563EB15' : '#F8F7F4',
                        color: isMe ? '#2563EB' : DS.ink,
                        border: isMe ? '1px solid #2563EB40' : '1px solid #E8E6E1',
                      }}>
                        {nom}{isMe ? ' (vous)' : ''}
                      </span>
                    );
                  })}
                </div>
              )}
              {c.vehicule && (
                <div style={{ fontSize: 12, color: DS.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🚛</span> {c.vehicule.modele || c.vehicule.model || 'Véhicule'} — {c.vehicule.immatriculation}
                </div>
              )}
            </div>

            {/* Pointage per chantier */}
            <div style={{ marginBottom: 14, padding: '12px 14px', background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
              {!hasArrived && (
                <button onClick={() => {
                  const now = new Date();
                  const entry = { id: Date.now(), date: today, type: 'arrivee', heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), chantierId: c.id };
                  const updated = [...JSON.parse(localStorage.getItem('freample_pointages') || '[]'), entry];
                  localStorage.setItem('freample_pointages', JSON.stringify(updated));
                  setPointages(updated);
                  if (trajetPointage && !trajetPointage.arriveeChantier) {
                    const updatedTrajet = { ...trajetPointage, arriveeChantier: new Date().toISOString() };
                    setTrajetPointage(updatedTrajet);
                    localStorage.setItem('freample_trajet_today', JSON.stringify(updatedTrajet));
                  }
                }} style={{ width: '100%', padding: '14px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Arrivée sur chantier
                </button>
              )}
              {hasArrived && !hasDeparted && (
                <div>
                  <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, marginBottom: 8 }}>Arrivé à {arrivalTime}</div>
                  <button onClick={() => {
                    const now = new Date();
                    const entry = { id: Date.now(), date: today, type: 'depart', heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), chantierId: c.id };
                    const updated = [...JSON.parse(localStorage.getItem('freample_pointages') || '[]'), entry];
                    localStorage.setItem('freample_pointages', JSON.stringify(updated));
                    setPointages(updated);
                  }} style={{ width: '100%', padding: '14px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Départ du chantier
                  </button>
                </div>
              )}
              {hasArrived && hasDeparted && (
                <div style={{ fontSize: 13, color: DS.ink }}>
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>Arrivée : {arrivalTime}</span> — <span style={{ color: '#DC2626', fontWeight: 600 }}>Départ : {departTime}</span>
                </div>
              )}
            </div>

            {/* Météo */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: DS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Météo du jour</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ label: 'Soleil', icon: '☀️' }, { label: 'Nuageux', icon: '⛅' }, { label: 'Pluie', icon: '🌧️' }, { label: 'Neige', icon: '❄️' }].map(m => (
                  <button key={m.label} onClick={() => {
                    const journal = JSON.parse(localStorage.getItem(`freample_journal_${c.id}`) || '[]');
                    const todayEntry = journal.find(j => j.date === today);
                    if (todayEntry) todayEntry.meteo = m.label;
                    else journal.push({ date: today, meteo: m.label, nbOuvriers: mesChantiers.length, description: '', problemes: '' });
                    localStorage.setItem(`freample_journal_${c.id}`, JSON.stringify(journal));
                    setMeteoOpen(c.id + '_' + m.label);
                  }} style={{ flex: 1, padding: '8px 4px', background: meteoOpen === c.id + '_' + m.label ? '#2563EB15' : '#FAFAF8', border: meteoOpen === c.id + '_' + m.label ? '2px solid #2563EB' : '1px solid #E8E6E1', borderRadius: 8, cursor: 'pointer', fontSize: 18, textAlign: 'center' }}
                  title={m.label}>
                    {m.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 8 action buttons (4x2 grid desktop, 2x4 mobile) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              <button onClick={() => toggleSection('stock')} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: activeSection === 'stock' ? '#0A0A0A' : 'transparent', color: activeSection === 'stock' ? '#fff' : '#0A0A0A', textAlign: 'center' }}>Prendre du stock</button>
              <button onClick={() => toggleSection('achat')} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: activeSection === 'achat' ? '#0A0A0A' : 'transparent', color: activeSection === 'achat' ? '#fff' : '#0A0A0A', textAlign: 'center' }}>Achat fournisseur</button>
              <button onClick={() => { setCarburantOpen(carburantOpen === c.id ? null : c.id); setCarburantForm({ litres: '', montant: '', km: '' }); setCarburantConfirm(null); }} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: carburantOpen === c.id ? '#0A0A0A' : 'transparent', color: carburantOpen === c.id ? '#fff' : '#0A0A0A', textAlign: 'center' }}>Plein carburant</button>
              <button onClick={() => toggleSection('surplus')} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: activeSection === 'surplus' ? '#0A0A0A' : 'transparent', color: activeSection === 'surplus' ? '#fff' : '#0A0A0A', textAlign: 'center' }}>Surplus à retourner</button>
              <button onClick={() => setSignalOpen(signalOpen === c.id ? null : c.id)} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: signalOpen === c.id ? '#DC2626' : 'transparent', color: signalOpen === c.id ? '#fff' : '#DC2626', borderColor: '#DC2626', textAlign: 'center' }}>Signaler problème</button>
              <button onClick={() => setRapportOpen(rapportOpen === c.id ? null : c.id)} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: rapportOpen === c.id ? '#0A0A0A' : 'transparent', color: rapportOpen === c.id ? '#fff' : '#0A0A0A', textAlign: 'center' }}>Rapport du jour</button>
              <button onClick={() => setTodoOpen(todoOpen === c.id ? null : c.id)} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: todoOpen === c.id ? '#0A0A0A' : 'transparent', color: todoOpen === c.id ? '#fff' : '#0A0A0A', textAlign: 'center' }}>À faire demain</button>
              <button onClick={() => setFraisChantierOpen(fraisChantierOpen === c.id ? null : c.id)} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: fraisChantierOpen === c.id ? '#0A0A0A' : 'transparent', color: fraisChantierOpen === c.id ? '#fff' : '#0A0A0A', textAlign: 'center' }}>Note de frais</button>
              <button onClick={() => { setSelectedChantier(c); setShowAvis(true); }} style={{ ...BTN_O, fontSize: 11, padding: '10px 6px', background: '#A68B4B', color: '#fff', borderColor: '#A68B4B', textAlign: 'center', gridColumn: '1 / -1' }}>📋 Faire signer un avis de passage</button>
            </div>

            {/* Confirmation message */}
            {stockConfirmation && isExpanded && (
              <div style={{ marginBottom: 10, padding: '8px 12px', background: '#16A34A18', border: '1px solid #16A34A40', borderRadius: 8, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{stockConfirmation}</div>
            )}

            {/* ── Utiliser le stock ── */}
            {activeSection === 'stock' && (() => {
              const articles = JSON.parse(localStorage.getItem('freample_stock_articles') || '[]');
              return (
                <div style={{ marginBottom: 10, padding: 14, background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Stock disponible</div>
                  {articles.length === 0 && <div style={{ fontSize: 12, color: DS.muted }}>Aucun article en stock</div>}
                  {articles.map((art, idx) => (
                    <div key={art.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < articles.length - 1 ? '1px solid #E8E6E1' : 'none', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{art.designation}</div>
                        <div style={{ fontSize: 11, color: DS.muted }}>Dispo: {art.quantite} {art.unite} · {art.prixUnitaire != null ? `${art.prixUnitaire}€/u` : ''}</div>
                      </div>
                      <input type="number" min="0" max={art.quantite} placeholder="Qté" value={stockQties[art.id || idx] || ''} onChange={e => setStockQties(prev => ({ ...prev, [art.id || idx]: e.target.value }))} style={{ ...INP, width: 80 }} />
                    </div>
                  ))}
                  {articles.length > 0 && (
                    <button onClick={() => {
                      const arts = JSON.parse(localStorage.getItem('freample_stock_articles') || '[]');
                      const mouvements = JSON.parse(localStorage.getItem('freample_stock_mouvements') || '[]');
                      const matieres = JSON.parse(localStorage.getItem(`freample_matieres_stock_${c.id}`) || '[]');
                      let count = 0;
                      arts.forEach((art, idx) => {
                        const key = art.id || idx;
                        const qty = Number(stockQties[key]);
                        if (!qty || qty <= 0) return;
                        const realQty = Math.min(qty, art.quantite);
                        art.quantite = art.quantite - realQty;
                        matieres.push({ id: Date.now() + idx, articleId: art.id, designation: art.designation, quantite: realQty, unite: art.unite, prixUnitaire: art.prixUnitaire || 0, total: realQty * (art.prixUnitaire || 0), date: today });
                        mouvements.push({ id: Date.now() + idx + 1000, type: 'sortie', article: art.designation, quantite: realQty, unite: art.unite, prixUnitaire: art.prixUnitaire || 0, chantier: c.titre, salarie: profil.prenom + ' ' + profil.nom, date: today, chantierId: c.id });
                        count += realQty;
                      });
                      if (count > 0) {
                        localStorage.setItem('freample_stock_articles', JSON.stringify(arts));
                        localStorage.setItem('freample_stock_mouvements', JSON.stringify(mouvements));
                        localStorage.setItem(`freample_matieres_stock_${c.id}`, JSON.stringify(matieres));
                        setStockQties({});
                        setStockConfirmation(`${count} article${count > 1 ? 's' : ''} sorti${count > 1 ? 's' : ''} du stock`);
                      }
                    }} style={{ ...BTN, marginTop: 12, fontSize: 12 }}>Valider</button>
                  )}
                </div>
              );
            })()}

            {/* ── Achat fournisseur (multi-lignes) ── */}
            {activeSection === 'achat' && (() => {
              const totalHT = achatLignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0);
              const tvaRate = Number(achatForm.tva) || 20;
              const totalTTC = Math.round(totalHT * (1 + tvaRate / 100) * 100) / 100;
              return (
              <div style={{ marginBottom: 10, padding: 14, background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Nouvel achat fournisseur</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Fournisseur</label>
                  <input value={achatForm.fournisseur} onChange={e => setAchatForm(f => ({ ...f, fournisseur: e.target.value }))} style={INP} placeholder="ex: Point P" />
                </div>

                {/* Lignes d'articles */}
                <div style={{ fontSize: 11, fontWeight: 600, color: DS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Articles</div>
                {achatLignes.map((ligne, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1.2fr auto', gap: 6, marginBottom: isMobile ? 12 : 6, alignItems: 'end' }}>
                    <div>
                      {idx === 0 && <label style={{ fontSize: 10, color: DS.muted, display: 'block', marginBottom: 2 }}>Article</label>}
                      <div style={{ position: 'relative' }}>
                        <input value={ligne.article}
                          onChange={e => {
                            const val = e.target.value;
                            const updated = [...achatLignes]; updated[idx] = { ...updated[idx], article: val }; setAchatLignes(updated);
                            if (val.length >= 2) {
                              const arts = (() => { try { return JSON.parse(localStorage.getItem('freample_stock_articles') || '[]'); } catch { return []; } })();
                              const matches = arts.filter(a => a.designation.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
                              setStockSuggestions(matches); setStockSuggestIdx(matches.length > 0 ? `achat-${idx}` : null);
                            } else { setStockSuggestIdx(null); }
                          }}
                          onFocus={() => { if (ligne.article.length >= 2) { const arts = (() => { try { return JSON.parse(localStorage.getItem('freample_stock_articles') || '[]'); } catch { return []; } })(); const m = arts.filter(a => a.designation.toLowerCase().includes(ligne.article.toLowerCase())).slice(0, 5); setStockSuggestions(m); setStockSuggestIdx(m.length > 0 ? `achat-${idx}` : null); } }}
                          onBlur={() => setTimeout(() => setStockSuggestIdx(null), 200)}
                          style={{ ...INP, fontSize: 12 }} placeholder="Désignation" />
                        {stockSuggestIdx === `achat-${idx}` && stockSuggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E8E6E1', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 10, marginTop: 2 }}>
                            {stockSuggestions.map(s => (
                              <div key={s.id} onMouseDown={() => {
                                const updated = [...achatLignes]; updated[idx] = { ...updated[idx], article: s.designation, unite: s.unite || 'u', prixUnitaire: s.valeurUnitaire || '' }; setAchatLignes(updated); setStockSuggestIdx(null);
                              }} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid #F2F2F7' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F8F7F4'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                <span style={{ fontWeight: 600 }}>{s.designation}</span>
                                <span style={{ color: '#777', marginLeft: 6 }}>{s.quantite} {s.unite} · {(s.valeurUnitaire || 0).toFixed(2)}€</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {idx === 0 && <label style={{ fontSize: 10, color: DS.muted, display: 'block', marginBottom: 2 }}>Qté</label>}
                      <input type="number" min="0" value={ligne.quantite} onChange={e => { const updated = [...achatLignes]; updated[idx] = { ...updated[idx], quantite: e.target.value }; setAchatLignes(updated); }} style={{ ...INP, fontSize: 12 }} placeholder="0" />
                    </div>
                    <div>
                      {idx === 0 && <label style={{ fontSize: 10, color: DS.muted, display: 'block', marginBottom: 2 }}>Unité</label>}
                      <select value={ligne.unite} onChange={e => { const updated = [...achatLignes]; updated[idx] = { ...updated[idx], unite: e.target.value }; setAchatLignes(updated); }} style={{ ...INP, fontSize: 12 }}>
                        <option value="u">u</option><option value="sac">sac</option><option value="kg">kg</option><option value="m">m</option><option value="m²">m²</option><option value="boîte">boîte</option>
                      </select>
                    </div>
                    <div>
                      {idx === 0 && <label style={{ fontSize: 10, color: DS.muted, display: 'block', marginBottom: 2 }}>Prix unit. HT</label>}
                      <input type="number" min="0" step="0.01" value={ligne.prixUnitaire} onChange={e => { const updated = [...achatLignes]; updated[idx] = { ...updated[idx], prixUnitaire: e.target.value }; setAchatLignes(updated); }} style={{ ...INP, fontSize: 12 }} placeholder="0.00" />
                    </div>
                    <div>
                      {idx === 0 && <label style={{ fontSize: 10, color: 'transparent', display: 'block', marginBottom: 2 }}>&nbsp;</label>}
                      {achatLignes.length > 1 ? (
                        <button onClick={() => setAchatLignes(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: '1px solid #DC262640', borderRadius: 6, color: '#DC2626', cursor: 'pointer', fontSize: 14, width: 30, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DS.font }}>&times;</button>
                      ) : <div style={{ width: 30, height: 36 }} />}
                    </div>
                  </div>
                ))}
                <button onClick={() => setAchatLignes(prev => [...prev, { article: '', quantite: '', unite: 'u', prixUnitaire: '' }])} style={{ ...BTN_O, fontSize: 11, padding: '6px 12px', marginBottom: 10 }}>+ Ajouter une ligne</button>

                {/* TVA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>TVA %</label>
                    <select value={achatForm.tva} onChange={e => setAchatForm(f => ({ ...f, tva: e.target.value }))} style={INP}>
                      <option value="0">0%</option><option value="5.5">5.5%</option><option value="10">10%</option><option value="20">20%</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                    <div style={{ fontSize: 12, color: DS.muted }}>Total HT : <strong style={{ color: DS.ink }}>{totalHT.toFixed(2)} €</strong></div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink }}>Total TTC : {totalTTC.toFixed(2)} €</div>
                  </div>
                </div>

                <button onClick={() => {
                  const validLignes = achatLignes.filter(l => l.article && Number(l.quantite) > 0 && Number(l.prixUnitaire) > 0);
                  if (!achatForm.fournisseur || validLignes.length === 0) return;
                  const tva = Number(achatForm.tva);
                  const montantHT = validLignes.reduce((s, l) => s + Number(l.quantite) * Number(l.prixUnitaire), 0);
                  const montantTTC = Math.round(montantHT * (1 + tva / 100) * 100) / 100;
                  const achats = JSON.parse(localStorage.getItem(`freample_matieres_achat_${c.id}`) || '[]');
                  const mouvements = JSON.parse(localStorage.getItem('freample_stock_mouvements') || '[]');
                  // Save each line individually
                  validLignes.forEach((l, idx) => {
                    const ligneHT = Number(l.quantite) * Number(l.prixUnitaire);
                    achats.push({ id: Date.now() + idx, fournisseur: achatForm.fournisseur, article: l.article, quantite: Number(l.quantite), unite: l.unite, prixUnitaire: Number(l.prixUnitaire), montantHT: ligneHT, tva, date: today, chantierId: c.id });
                    mouvements.push({ id: Date.now() + idx + 500, type: 'achat', article: l.article, quantite: Number(l.quantite), unite: l.unite, prixUnitaire: Number(l.prixUnitaire), fournisseur: achatForm.fournisseur, montantHT: ligneHT, tva, montantTTC: Math.round(ligneHT * (1 + tva / 100) * 100) / 100, chantier: c.titre, salarie: profil.prenom + ' ' + profil.nom, date: today, chantierId: c.id });
                  });
                  localStorage.setItem(`freample_matieres_achat_${c.id}`, JSON.stringify(achats));
                  localStorage.setItem('freample_stock_mouvements', JSON.stringify(mouvements));
                  // Comptabilité
                  const ecritures = JSON.parse(localStorage.getItem('freample_ecritures') || '[]');
                  const montantTVA = Math.round(montantHT * tva / 100 * 100) / 100;
                  const refCompta = `ACH-${Date.now()}`;
                  const descriptionCompta = validLignes.map(l => l.article).join(', ');
                  ecritures.push(
                    { date: today, journal: 'HA', piece: refCompta, compte: '601000', libelle: `Achat ${descriptionCompta} — Chantier`, debit: montantHT, credit: 0 },
                    { date: today, journal: 'HA', piece: refCompta, compte: '445660', libelle: 'TVA déductible', debit: montantTVA, credit: 0 },
                    { date: today, journal: 'HA', piece: refCompta, compte: '401000', libelle: `Fournisseur ${achatForm.fournisseur}`, debit: 0, credit: montantHT + montantTVA },
                  );
                  localStorage.setItem('freample_ecritures', JSON.stringify(ecritures));
                  setAchatForm({ fournisseur: '', tva: '20' });
                  setAchatLignes([{ article: '', quantite: '', unite: 'u', prixUnitaire: '' }]);
                  setStockConfirmation(`Achat enregistré : ${validLignes.length} article${validLignes.length > 1 ? 's' : ''} — ${montantHT.toFixed(2)}€ HT chez ${achatForm.fournisseur}`);
                }} style={{ ...BTN, fontSize: 12 }}>Valider l'achat</button>
              </div>
              );
            })()}

            {/* ── Surplus à retourner ── */}
            {activeSection === 'surplus' && (
              <div style={{ marginBottom: 10, padding: 14, background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Retourner du surplus au stock</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Article</label>
                    <input value={surplusForm.article}
                      onChange={e => {
                        const val = e.target.value;
                        setSurplusForm(f => ({ ...f, article: val }));
                        if (val.length >= 2) {
                          const arts = (() => { try { return JSON.parse(localStorage.getItem('freample_stock_articles') || '[]'); } catch { return []; } })();
                          const matches = arts.filter(a => a.designation.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
                          setStockSuggestions(matches); setStockSuggestIdx(matches.length > 0 ? 'surplus' : null);
                        } else { setStockSuggestIdx(null); }
                      }}
                      onFocus={() => { if (surplusForm.article.length >= 2) { const arts = (() => { try { return JSON.parse(localStorage.getItem('freample_stock_articles') || '[]'); } catch { return []; } })(); const m = arts.filter(a => a.designation.toLowerCase().includes(surplusForm.article.toLowerCase())).slice(0, 5); setStockSuggestions(m); setStockSuggestIdx(m.length > 0 ? 'surplus' : null); } }}
                      onBlur={() => setTimeout(() => setStockSuggestIdx(null), 200)}
                      style={INP} placeholder="Désignation" />
                    {stockSuggestIdx === 'surplus' && stockSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E8E6E1', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 10, marginTop: 2 }}>
                        {stockSuggestions.map(s => (
                          <div key={s.id} onMouseDown={() => { setSurplusForm(f => ({ ...f, article: s.designation, prixUnitaire: s.valeurUnitaire || '' })); setStockSuggestIdx(null); }}
                            style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid #F2F2F7' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F8F7F4'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                            <span style={{ fontWeight: 600 }}>{s.designation}</span>
                            <span style={{ color: '#777', marginLeft: 6 }}>{s.quantite} {s.unite} · {(s.valeurUnitaire || 0).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Quantité</label><input type="number" value={surplusForm.quantite} onChange={e => setSurplusForm(f => ({ ...f, quantite: e.target.value }))} style={INP} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Prix unitaire (€)</label><input type="number" value={surplusForm.prixUnitaire} onChange={e => setSurplusForm(f => ({ ...f, prixUnitaire: e.target.value }))} style={INP} /></div>
                </div>
                <button onClick={() => {
                  const qty = Number(surplusForm.quantite);
                  const prix = Number(surplusForm.prixUnitaire);
                  if (!surplusForm.article || !qty || qty <= 0) return;
                  const articles = JSON.parse(localStorage.getItem('freample_stock_articles') || '[]');
                  const existing = articles.find(a => a.designation.toLowerCase() === surplusForm.article.toLowerCase());
                  if (existing) { existing.quantite = (existing.quantite || 0) + qty; if (prix) existing.prixUnitaire = prix; }
                  else { articles.push({ id: Date.now(), designation: surplusForm.article, quantite: qty, unite: 'u', prixUnitaire: prix || 0 }); }
                  localStorage.setItem('freample_stock_articles', JSON.stringify(articles));
                  const matieres = JSON.parse(localStorage.getItem(`freample_matieres_stock_${c.id}`) || '[]');
                  matieres.push({ id: Date.now() + 1, designation: surplusForm.article, quantite: -qty, unite: 'u', prixUnitaire: prix || 0, total: -(qty * (prix || 0)), date: today, type: 'surplus' });
                  localStorage.setItem(`freample_matieres_stock_${c.id}`, JSON.stringify(matieres));
                  const mouvements = JSON.parse(localStorage.getItem('freample_stock_mouvements') || '[]');
                  mouvements.push({ id: Date.now() + 2, type: 'surplus', article: surplusForm.article, quantite: qty, prixUnitaire: prix || 0, chantier: c.titre, salarie: profil.prenom + ' ' + profil.nom, date: today, chantierId: c.id });
                  localStorage.setItem('freample_stock_mouvements', JSON.stringify(mouvements));
                  setSurplusForm({ article: '', quantite: '', prixUnitaire: '' });
                  setStockConfirmation(`${qty} ${surplusForm.article} retourné${qty > 1 ? 's' : ''} au stock`);
                }} style={{ ...BTN, fontSize: 12 }}>Retourner au stock</button>
              </div>
            )}

            {/* ── Plein carburant ── */}
            {carburantOpen === c.id && (
              <div style={{ marginBottom: 10, padding: 14, background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Plein carburant{c.vehicule ? ` — ${c.vehicule.modele || c.vehicule.model || 'Véhicule'}` : ''}</div>
                {carburantConfirm && <div style={{ marginBottom: 8, padding: '6px 10px', background: '#16A34A18', border: '1px solid #16A34A40', borderRadius: 8, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{carburantConfirm}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Litres</label><input type="number" step="0.1" value={carburantForm.litres} onChange={e => setCarburantForm(f => ({ ...f, litres: e.target.value }))} style={INP} placeholder="ex: 45" /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Montant €</label><input type="number" step="0.01" value={carburantForm.montant} onChange={e => setCarburantForm(f => ({ ...f, montant: e.target.value }))} style={INP} placeholder="ex: 78.50" /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Km compteur</label><input type="number" value={carburantForm.km} onChange={e => setCarburantForm(f => ({ ...f, km: e.target.value }))} style={INP} placeholder="ex: 45230" /></div>
                </div>
                <button onClick={() => {
                  const vehiculeId = c.vehicule?.id || c.vehicule?.immatriculation || c.id;
                  const litres = parseFloat(carburantForm.litres);
                  const montant = parseFloat(carburantForm.montant);
                  const km = parseInt(carburantForm.km) || 0;
                  if (!litres || !montant) return;
                  const entries = JSON.parse(localStorage.getItem(`freample_carburant_${vehiculeId}`) || '[]');
                  entries.push({ id: Date.now(), date: today, litres, montant, km, employe: profil.prenom + ' ' + profil.nom, chantier: c.titre });
                  localStorage.setItem(`freample_carburant_${vehiculeId}`, JSON.stringify(entries));
                  setCarburantForm({ litres: '', montant: '', km: '' });
                  setCarburantConfirm(`Plein enregistré : ${litres}L / ${montant.toFixed(2)}€`);
                }} style={{ ...BTN, fontSize: 12 }}>Enregistrer le plein</button>
              </div>
            )}

            {/* ── Signaler un problème ── */}
            {signalOpen === c.id && (
              <div style={{ marginBottom: 10, padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #DC262640' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#DC2626' }}>Signaler un problème</div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Type</label>
                  <select value={signalForm.type} onChange={e => setSignalForm(f => ({ ...f, type: e.target.value }))} style={INP}>
                    <option value="defaut">Défaut</option>
                    <option value="malfacon">Malfaçon</option>
                    <option value="securite">Sécurité</option>
                    <option value="materiel_manquant">Matériel manquant</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea value={signalForm.desc} onChange={e => setSignalForm(f => ({ ...f, desc: e.target.value }))} style={{ ...INP, minHeight: 60, resize: 'vertical' }} placeholder="Décrivez le problème..." />
                </div>
                <button onClick={() => {
                  if (!signalForm.desc.trim()) return;
                  const signalements = JSON.parse(localStorage.getItem(`freample_signalements_${c.id}`) || '[]');
                  signalements.push({ id: Date.now(), date: today, type: signalForm.type, description: signalForm.desc, salarie: profil.prenom + ' ' + profil.nom, chantierId: c.id });
                  localStorage.setItem(`freample_signalements_${c.id}`, JSON.stringify(signalements));
                  setSignalForm({ desc: '', type: 'defaut' });
                  setSignalOpen(null);
                }} style={{ ...BTN, background: '#DC2626', fontSize: 12 }}>Envoyer le signalement</button>
              </div>
            )}

            {/* ── Rapport du jour ── */}
            {rapportOpen === c.id && (
              <div style={{ marginBottom: 10, padding: 14, background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Rapport du jour</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Ce qui a été fait aujourd'hui</label>
                  <textarea value={rapportForm.note} onChange={e => setRapportForm(f => ({ ...f, note: e.target.value }))} style={{ ...INP, minHeight: 80, resize: 'vertical' }} placeholder="Décrivez l'avancement..." />
                </div>
                <button onClick={() => {
                  if (!rapportForm.note.trim()) return;
                  const rapports = JSON.parse(localStorage.getItem(`freample_rapports_${c.id}`) || '[]');
                  rapports.push({ id: Date.now(), date: today, note: rapportForm.note, salarie: profil.prenom + ' ' + profil.nom });
                  localStorage.setItem(`freample_rapports_${c.id}`, JSON.stringify(rapports));
                  // Also save to journal
                  const journal = JSON.parse(localStorage.getItem(`freample_journal_${c.id}`) || '[]');
                  const todayEntry = journal.find(j => j.date === today);
                  if (todayEntry) { todayEntry.description = (todayEntry.description ? todayEntry.description + '\n' : '') + rapportForm.note; }
                  else { journal.push({ date: today, meteo: '', nbOuvriers: 0, description: rapportForm.note, problemes: '' }); }
                  localStorage.setItem(`freample_journal_${c.id}`, JSON.stringify(journal));
                  setRapportForm({ note: '' });
                  setRapportOpen(null);
                }} style={{ ...BTN, fontSize: 12 }}>Enregistrer le rapport</button>
              </div>
            )}

            {/* ── À faire demain ── */}
            {todoOpen === c.id && (
              <div style={{ marginBottom: 10, padding: 14, background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>À faire demain</div>
                <div style={{ marginBottom: 10 }}>
                  <textarea value={todoForm} onChange={e => setTodoForm(e.target.value)} style={{ ...INP, minHeight: 70, resize: 'vertical' }} placeholder="Ce qu'il faudra faire demain sur ce chantier..." />
                </div>
                <button onClick={() => {
                  if (!todoForm.trim()) return;
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
                  localStorage.setItem(`freample_todo_${c.id}`, JSON.stringify({ date: tomorrowStr, note: todoForm, salarie: profil.prenom + ' ' + profil.nom }));
                  setTodoForm('');
                  setTodoOpen(null);
                  setStockConfirmation('Note "à faire demain" enregistrée');
                }} style={{ ...BTN, fontSize: 12 }}>Enregistrer</button>
              </div>
            )}

            {/* ── Note de frais chantier ── */}
            {fraisChantierOpen === c.id && (
              <div style={{ marginBottom: 10, padding: 14, background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Note de frais — {c.titre}</div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Catégorie</label>
                  <select value={fraisChantierForm.categorie} onChange={e => setFraisChantierForm(f => ({ ...f, categorie: e.target.value }))} style={INP}>
                    <option value="Repas">Repas</option><option value="Transport">Transport</option><option value="Péage">Péage</option><option value="Matériel">Matériel</option><option value="Autre">Autre</option>
                  </select>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Description</label>
                  <input value={fraisChantierForm.description} onChange={e => setFraisChantierForm(f => ({ ...f, description: e.target.value }))} style={INP} placeholder="ex: Déjeuner équipe" />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Montant (€)</label>
                  <input type="number" step="0.01" value={fraisChantierForm.montant} onChange={e => setFraisChantierForm(f => ({ ...f, montant: e.target.value }))} style={INP} placeholder="0.00" />
                </div>
                <button onClick={() => {
                  const montant = Number(fraisChantierForm.montant);
                  if (!montant || !fraisChantierForm.description) return;
                  const allFrais = JSON.parse(localStorage.getItem('freample_frais_chantier') || '[]');
                  allFrais.push({ id: Date.now(), chantierId: c.id, chantier: c.titre, salarie: profil.prenom + ' ' + profil.nom, date: today, categorie: fraisChantierForm.categorie, description: fraisChantierForm.description, montant });
                  localStorage.setItem('freample_frais_chantier', JSON.stringify(allFrais));
                  // Also add to the frais state for display in Notes de frais tab
                  const newFrais = { id: Date.now(), date: today, montant, categorie: fraisChantierForm.categorie, description: fraisChantierForm.description, statut: 'en_attente', chantierId: c.id, employe: profil.prenom + ' ' + profil.nom };
                  setFrais(prev => [newFrais, ...prev]);
                  setFraisChantierForm({ montant: '', categorie: 'Repas', description: '' });
                  setFraisChantierOpen(null);
                  setStockConfirmation(`Note de frais enregistrée : ${montant.toFixed(2)}€ (${fraisChantierForm.categorie})`);
                }} style={{ ...BTN, fontSize: 12 }}>Valider</button>
              </div>
            )}

            {/* ── Messages client ── */}
            <div style={{ marginTop: 4, padding: '12px 14px', background: '#F8F7F4', borderRadius: 10, border: '1px solid #E8E6E1' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: DS.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Messages chantier</div>
              {messages.length === 0 && <div style={{ fontSize: 12, color: DS.muted, marginBottom: 8 }}>Aucun message</div>}
              {messages.slice(-3).map(msg => (
                <div key={msg.id} style={{ padding: '6px 0', borderBottom: '1px solid #E8E6E140', fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: msg.from === 'salarie' ? '#2563EB' : DS.ink }}>{msg.auteur}</span>
                  <span style={{ color: DS.muted, marginLeft: 6 }}>{msg.date}</span>
                  <div style={{ color: DS.ink, marginTop: 2 }}>{msg.texte}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input value={messageOpen === c.id ? messageForm : ''} onFocus={() => setMessageOpen(c.id)} onChange={e => { setMessageOpen(c.id); setMessageForm(e.target.value); }} placeholder="Écrire un message..." style={{ ...INP, flex: 1 }} />
                <button onClick={() => {
                  if (!messageForm.trim() || messageOpen !== c.id) return;
                  const msgs = JSON.parse(localStorage.getItem(`freample_messages_${c.id}`) || '[]');
                  msgs.push({ id: Date.now(), date: today, from: 'salarie', auteur: profil.prenom + ' ' + profil.nom, texte: messageForm });
                  localStorage.setItem(`freample_messages_${c.id}`, JSON.stringify(msgs));
                  setMessageForm('');
                }} style={{ ...BTN, fontSize: 12, padding: '8px 16px' }}>Envoyer</button>
              </div>
            </div>
          </div>
          );
        })}
        </>;
      })()}

      {/* ═══ MA FICHE ═══ */}
      {tab === 'mafiche' && (() => {
        const fichesSalaries = (() => { try { return JSON.parse(localStorage.getItem('freample_fiches_salaries') || '[]'); } catch { return []; } })();
        const maFiche = fichesSalaries.find(f => f.actif && (f.email === user?.email || `${f.prenom} ${f.nom}`.toLowerCase().includes((user?.nom || '').toLowerCase().split(' ').pop())));
        if (!maFiche) return (
          <div style={{ ...CARD, textAlign: 'center', padding: 30 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: DS.muted }}>Fiche non disponible</div>
            <div style={{ fontSize: 12, color: DS.subtle, marginTop: 4 }}>Votre employeur n'a pas encore créé votre fiche. Contactez-le pour qu'il la renseigne.</div>
          </div>
        );
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Ma fiche</h2>
            {/* Infos */}
            <div style={CARD}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                {[['Poste', maFiche.poste], ['Téléphone', maFiche.telephone || '—'], ['Email', maFiche.email || '—'], ['Date entrée', maFiche.dateEntree || '—']].map(([k,v]) => (
                  <div key={k} style={{ padding: '8px 12px', background: DS.bgSoft, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: DS.muted, fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Compétences */}
            <div style={CARD}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Mes compétences</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(maFiche.competences || []).length > 0
                  ? maFiche.competences.map(c => <span key={c} style={{ padding: '4px 12px', background: '#F5EFE0', color: '#A68B4B', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{c}</span>)
                  : <span style={{ fontSize: 12, color: DS.subtle }}>Aucune compétence renseignée</span>
                }
              </div>
            </div>
            {/* Habilitations */}
            <div style={CARD}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Mes habilitations</div>
              {(maFiche.habilitations || []).length === 0 && <div style={{ fontSize: 12, color: DS.subtle }}>Aucune habilitation</div>}
              {(maFiche.habilitations || []).map((h, i) => {
                const jours = h.dateExpiration ? Math.round((new Date(h.dateExpiration) - new Date()) / 86400000) : null;
                const expired = jours !== null && jours < 0;
                const soon = jours !== null && jours >= 0 && jours < 30;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: expired ? '#FEF2F2' : soon ? '#FFFBEB' : DS.bgSoft, borderRadius: 8, marginBottom: 6, border: expired ? '1px solid #DC2626' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{h.type}</div>
                      <div style={{ fontSize: 10, color: DS.subtle }}>{h.organisme} · N°{h.numero}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {expired && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626' }}>EXPIREE</span>}
                      {soon && <span style={{ fontSize: 10, fontWeight: 700, color: '#D97706' }}>Expire dans {jours}j</span>}
                      {!expired && !soon && jours !== null && <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>Valide ({jours}j)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Carte BTP + Visite médicale */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={CARD}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Carte BTP</div>
                {maFiche.carteBTP?.numero ? (
                  <div><div style={{ fontSize: 12 }}>N° {maFiche.carteBTP.numero}</div><div style={{ fontSize: 11, color: DS.subtle }}>Expire : {maFiche.carteBTP.dateExpiration || '—'}</div></div>
                ) : <div style={{ fontSize: 12, color: DS.subtle }}>Non renseignée</div>}
              </div>
              <div style={CARD}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Visite médicale</div>
                {maFiche.visiteMedicale?.prochaine ? (
                  <div><div style={{ fontSize: 12 }}>Prochaine : {maFiche.visiteMedicale.prochaine}</div><div style={{ fontSize: 11, color: DS.subtle }}>Dernière : {maFiche.visiteMedicale.derniere || '—'}</div></div>
                ) : <div style={{ fontSize: 12, color: DS.subtle }}>Non renseignée</div>}
              </div>
            </div>
            <div style={{ fontSize: 11, color: DS.subtle, textAlign: 'center' }}>Ces informations sont gérées par votre employeur. Contactez-le pour toute modification.</div>
          </div>
        );
      })()}

      {/* ═══ MON PLANNING ═══ */}
      {tab === 'planning' && (() => {
        const realPlanning = buildPlanningFromChantiers(chantiers, profil.prenom + ' ' + profil.nom);
        const planning = realPlanning.length > 0 ? realPlanning : (isDemo ? DEMO_PLANNING_FALLBACK : []);
        const isReal = realPlanning.length > 0;
        return <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: DS.ink }}>Planning de la semaine</h2>
            {!isReal && <span style={{ fontSize: 11, color: DS.muted, background: '#F2F2F7', padding: '4px 10px', borderRadius: 6 }}>Données de démonstration</span>}
          </div>
          <div style={{ ...CARD, padding: 0 }}>
            {planning.map((p, i) => (
              <div key={p.id} style={{ padding: '12px 18px', borderBottom: i < planning.length - 1 ? '1px solid #E8E6E1' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: DS.accent, flexShrink: 0 }}>{p.jour}</div>
                <div style={{ width: 100, fontSize: 12, color: DS.muted, flexShrink: 0 }}>{p.heure}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.tache}</div>
                  <div style={{ fontSize: 11, color: DS.muted }}>{p.lieu}</div>
                </div>
              </div>
            ))}
          </div>
        </>;
      })()}

      {/* ═══ FICHES DE PAIE ═══ */}
      {tab === 'paie' && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: DS.ink }}>Fiches de paie</h2>
        <div style={{ ...CARD, padding: 0 }}>
          {bulletins.map((b, i) => (
            <div key={b.id} style={{ padding: '14px 18px', borderBottom: i < bulletins.length - 1 ? '1px solid #E8E6E1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{b.periode}</div>
                <div style={{ fontSize: 12, color: DS.muted }}>Brut: {b.brut}€ · Net: {b.net}€ · Versé le {b.date}</div>
              </div>
              <button onClick={() => setBulletinPreview(b)} style={BTN_O}>Télécharger</button>
            </div>
          ))}
        </div>
      </>}

      {/* ═══ CONGÉS ═══ */}
      {tab === 'conges' && <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: DS.ink }}>Congés</h2>
          <button onClick={() => { setForm({ typeConge: 'vacances' }); setModal('conge'); }} style={BTN}>+ Demander un congé</button>
        </div>
        <div style={{ ...CARD, marginBottom: 16, display: 'flex', gap: 20 }}>
          <div><div style={{ fontSize: 11, color: DS.muted, textTransform: 'uppercase' }}>Solde congés</div><div style={{ fontSize: 28, fontWeight: 300, color: '#16A34A' }}>{congesRestants} j</div></div>
          <div><div style={{ fontSize: 11, color: DS.muted, textTransform: 'uppercase' }}>Pris cette année</div><div style={{ fontSize: 28, fontWeight: 300 }}>{25 - congesRestants} j</div></div>
          <div><div style={{ fontSize: 11, color: DS.muted, textTransform: 'uppercase' }}>En attente</div><div style={{ fontSize: 28, fontWeight: 300, color: '#D97706' }}>{conges.filter(c => c.statut === 'en_attente').reduce((s, c) => s + c.jours, 0)} j</div></div>
        </div>
        <div style={{ ...CARD, padding: 0 }}>
          {conges.map((c, i) => (
            <div key={c.id} style={{ padding: '12px 18px', borderBottom: i < conges.length - 1 ? '1px solid #E8E6E1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.debut} → {c.fin} ({c.jours} jour{c.jours > 1 ? 's' : ''})</div>
                <div style={{ fontSize: 11, color: DS.muted }}>{c.type} · {c.commentaire}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {c.statut === 'en_attente' && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#D97706', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />}
                {c.statut === 'approuve' && <span style={{ color: '#16A34A', fontSize: 14 }}>✓</span>}
                {c.statut === 'rejete' && <span style={{ color: '#DC2626', fontSize: 14 }}>✕</span>}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: statutColors[c.statut], background: `${statutColors[c.statut]}15`, padding: '3px 10px', borderRadius: 6, display: 'inline-block' }}>{statutLabels[c.statut]}</span>
                  {c.statut === 'en_attente' && <div style={{ fontSize: 10, color: '#D97706', marginTop: 2 }}>En attente d'approbation par {patron.nom}</div>}
                  {c.statut === 'approuve' && <div style={{ fontSize: 10, color: '#16A34A', marginTop: 2 }}>Approuvé</div>}
                  {c.statut === 'rejete' && <div style={{ fontSize: 10, color: '#DC2626', marginTop: 2 }}>Refusé{c.raison ? ` — ${c.raison}` : ''}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* ═══ NOTES DE FRAIS ═══ */}
      {tab === 'frais' && <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: DS.ink }}>Notes de frais</h2>
          <button onClick={() => { setForm({ categorie: 'Transport' }); setModal('frais'); }} style={BTN}>+ Nouvelle note</button>
        </div>
        <div style={{ ...CARD, padding: 0 }}>
          {frais.map((f, i) => (
            <div key={f.id} style={{ padding: '12px 18px', borderBottom: i < frais.length - 1 ? '1px solid #E8E6E1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f.description}</div>
                <div style={{ fontSize: 11, color: DS.muted }}>{f.categorie} · {f.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{f.montant.toFixed(2)}€</span>
                {f.statut === 'en_attente' && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#D97706', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />}
                {f.statut === 'approuve' && <span style={{ color: '#16A34A', fontSize: 14 }}>✓</span>}
                {f.statut === 'rejete' && <span style={{ color: '#DC2626', fontSize: 14 }}>✕</span>}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: statutColors[f.statut], background: `${statutColors[f.statut]}15`, padding: '3px 10px', borderRadius: 6, display: 'inline-block' }}>{statutLabels[f.statut]}</span>
                  {f.statut === 'en_attente' && <div style={{ fontSize: 10, color: '#D97706', marginTop: 2 }}>En attente d'approbation par {patron.nom}</div>}
                  {f.statut === 'approuve' && <div style={{ fontSize: 10, color: '#16A34A', marginTop: 2 }}>Approuvé</div>}
                  {f.statut === 'rejete' && <div style={{ fontSize: 10, color: '#DC2626', marginTop: 2 }}>Refusé{f.raison ? ` — ${f.raison}` : ''}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* ═══ MES CHANTIERS ═══ */}
      {tab === 'chantiers' && (() => {
        const selectChantier = (ch) => {
          setSelectedChantier(ch);
          if (!isDemo) {
            api.get(`/avis-passage/chantier/${ch.id}`).then(({ data }) => setAvisPassages(data.avis || [])).catch(() => {});
          } else {
            setAvisPassages(demoGet('freample_avis_passages', []).filter(a => a.chantierId === ch.id || a.chantierTitre === ch.titre));
          }
        };

        if (selectedChantier) {
          const ch = selectedChantier;
          const avancement = ch.avancement || (ch.statut === 'en_cours' ? 50 : ch.statut === 'complete' || ch.statut === 'terminee' ? 100 : 0);
          return <>
            <button onClick={() => { setSelectedChantier(null); setAvisPassages([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: DS.font, fontSize: 14, fontWeight: 600, color: DS.muted, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Retour aux chantiers
            </button>

            <div style={CARD}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: DS.ink }}>{ch.titre || ch.description}</h2>
              <div style={{ fontSize: 13, color: DS.muted, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                📍 {ch.adresse || ch.ville || '—'}
              </div>
              <div style={{ fontSize: 13, color: DS.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                📅 {ch.dateDebut || '—'} → {ch.dateFin || '—'}
                <span style={{ marginLeft: 8 }}>·</span>
                <span style={{ fontWeight: 600, color: DS.ink }}>Avancement : {avancement}%</span>
              </div>
              <div style={{ height: 6, background: '#E8E6E1', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${avancement}%`, background: avancement >= 100 ? '#16A34A' : '#2563EB', borderRadius: 3, transition: 'width .3s' }} />
              </div>
              {ch.chef && <div style={{ fontSize: 12, color: DS.muted, marginTop: 8 }}>Chef de chantier : {ch.chef}</div>}
              {ch.equipe?.length > 0 && <div style={{ fontSize: 12, color: DS.muted }}>Équipe : {ch.equipe.join(', ')}</div>}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowAvis(true)} style={{ ...CARD, cursor: 'pointer', border: '1px solid #E8E6E1', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>📋</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>Faire signer un avis</div>
                  <div style={{ fontSize: 11, color: DS.muted }}>Avis de passage client</div>
                </div>
              </button>
              <button onClick={() => recordPointage(todayArrivees.length <= todayDeparts.length ? 'arrivee' : 'depart')} style={{ ...CARD, cursor: 'pointer', border: '1px solid #E8E6E1', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>⏰</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{todayArrivees.length <= todayDeparts.length ? 'Pointer mon arrivée' : 'Pointer mon départ'}</div>
                  <div style={{ fontSize: 11, color: DS.muted }}>Pointage du jour</div>
                </div>
              </button>
              <button style={{ ...CARD, cursor: 'not-allowed', border: '1px solid #E8E6E1', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
                <span style={{ fontSize: 24 }}>📸</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>Ajouter une photo</div>
                  <div style={{ fontSize: 11, color: DS.muted }}>Bientôt disponible</div>
                </div>
              </button>
            </div>

            {/* Past avis de passage */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: DS.ink, margin: '0 0 12px', borderBottom: '1px solid #E8E6E1', paddingBottom: 8 }}>
                Avis de passage signés
              </h3>
              {avisPassages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: DS.muted, fontSize: 13 }}>
                  Aucun avis de passage pour ce chantier
                </div>
              ) : (
                <div style={{ ...CARD, padding: 0 }}>
                  {avisPassages.map((a, i) => {
                    const d = a.date ? new Date(a.date) : null;
                    return (
                      <div key={a.id || i} style={{ padding: '12px 18px', borderBottom: i < avisPassages.length - 1 ? '1px solid #E8E6E1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '—'}</div>
                          <div style={{ fontSize: 11, color: DS.muted }}>{a.heureArrivee || '—'} - {a.heureDepart || '—'}</div>
                          {a.travauxRealises && <div style={{ fontSize: 11, color: DS.muted, marginTop: 2 }}>{a.travauxRealises.slice(0, 60)}{a.travauxRealises.length > 60 ? '…' : ''}</div>}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', background: '#16A34A15', padding: '3px 10px', borderRadius: 6 }}>
                          ✅ Signé
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>;
        }

        // Chantiers list view
        return <>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: DS.ink }}>🏗️ Mes chantiers</h2>
          {chantiers.length === 0 ? (
            <div style={{ ...CARD, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏗️</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: DS.ink }}>Aucun chantier assigné</div>
              <div style={{ fontSize: 13, color: DS.muted, marginTop: 4 }}>Vos chantiers apparaîtront ici dès qu'ils vous seront attribués.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {chantiers.map(ch => {
                const avancement = ch.avancement || (ch.statut === 'en_cours' ? 50 : ch.statut === 'complete' || ch.statut === 'terminee' ? 100 : 0);
                return (
                  <button key={ch.id} onClick={() => selectChantier(ch)} style={{ ...CARD, cursor: 'pointer', textAlign: 'left', width: '100%', display: 'block', transition: 'box-shadow .15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DS.ink, flex: 1 }}>{ch.titre || ch.description}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statutColors[ch.statut] || DS.muted, background: `${statutColors[ch.statut] || '#999'}15`, padding: '3px 10px', borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>
                        {statutLabels[ch.statut] || ch.statut}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: DS.muted, marginBottom: 4 }}>📍 {ch.adresse || ch.ville || '—'}</div>
                    <div style={{ fontSize: 12, color: DS.muted, marginBottom: 8 }}>📅 {ch.dateDebut || '—'} → {ch.dateFin || '—'}</div>
                    <div style={{ height: 4, background: '#E8E6E1', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${avancement}%`, background: avancement >= 100 ? '#16A34A' : '#2563EB', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 11, color: DS.muted, marginTop: 4, textAlign: 'right' }}>{avancement}%</div>
                  </button>
                );
              })}
            </div>
          )}
        </>;
      })()}

      {/* ═══ MES DOCUMENTS ═══ */}
      {tab === 'documents' && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: DS.ink }}>Mes documents</h2>
        <p style={{ fontSize: 13, color: DS.muted, marginBottom: 16 }}>Déposez les documents demandés par votre employeur. Ils seront visibles en temps réel.</p>

        {/* Barre de progression */}
        {(() => {
          const deposés = DOCUMENTS_REQUIS.filter(d => mesDocs.some(m => m.type_document === d.id));
          const validés = DOCUMENTS_REQUIS.filter(d => mesDocs.some(m => m.type_document === d.id && m.statut === 'valide'));
          const pct = Math.round(deposés.length / DOCUMENTS_REQUIS.length * 100);
          return (
            <div style={{ ...CARD, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Progression : {deposés.length}/{DOCUMENTS_REQUIS.length} documents déposés</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? '#16A34A' : '#D97706' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: '#E8E6E1', borderRadius: 3 }}>
                <div style={{ height: 6, background: pct === 100 ? '#16A34A' : '#D97706', borderRadius: 3, width: `${pct}%`, transition: 'width .3s' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: DS.muted }}>
                <span style={{ color: '#16A34A' }}>✓ {validés.length} validé{validés.length > 1 ? 's' : ''}</span>
                <span style={{ color: '#D97706' }}>{deposés.length - validés.length} en attente</span>
                <span>{DOCUMENTS_REQUIS.length - deposés.length} manquant{DOCUMENTS_REQUIS.length - deposés.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          );
        })()}

        {/* Liste des documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DOCUMENTS_REQUIS.map(doc => {
            const uploaded = mesDocs.find(m => m.type_document === doc.id);
            const sColor = { en_attente: '#D97706', valide: '#16A34A', refuse: '#DC2626' };
            const sLabel = { en_attente: 'En attente de validation', valide: 'Validé par l\'employeur', refuse: 'Refusé — à renvoyer' };
            return (
              <div key={doc.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <span style={{ fontSize: 22 }}>{doc.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DS.ink }}>{doc.label}</div>
                  {uploaded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#636363' }}>{uploaded.nom_fichier}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sColor[uploaded.statut], background: sColor[uploaded.statut] + '18', padding: '2px 6px', borderRadius: 4 }}>
                        {sLabel[uploaded.statut]}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>Non déposé</div>
                  )}
                  {uploaded?.commentaire && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 2 }}>💬 {uploaded.commentaire}</div>}
                </div>
                <div>
                  <label style={{ padding: '7px 14px', background: uploaded ? (uploaded.statut === 'refuse' ? '#DC2626' : '#F2F2F7') : DS.accent, color: uploaded ? (uploaded.statut === 'refuse' ? '#fff' : '#636363') : '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 11, display: 'inline-block' }}>
                    {uploadingDoc === doc.id ? 'Envoi...' : uploaded ? (uploaded.statut === 'refuse' ? 'Renvoyer' : 'Remplacer') : 'Déposer'}
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingDoc(doc.id);
                      try {
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const base64 = reader.result.split(',')[1];
                          await api.post('/rh/documents', {
                            typeDocument: doc.id,
                            nomFichier: file.name,
                            contenuBase64: base64.slice(0, 500),
                            taille: file.size,
                            mimeType: file.type,
                          });
                          const { data } = await api.get('/rh/documents');
                          setMesDocs(data.documents || []);
                          setUploadingDoc('');
                        };
                        reader.readAsDataURL(file);
                      } catch { setUploadingDoc(''); }
                    }} />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </>}

      {/* ═══ MESSAGES ═══ */}
      {tab === 'messages' && (() => { navigate('/messagerie'); return null; })()}

      {/* ═══ MON PROFIL ═══ */}
      {tab === 'profil' && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <PhotoProfil size={64} />
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: DS.ink }}>Mon profil</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={CARD}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Informations personnelles</div>
            {[
              ['Nom', `${profil.prenom} ${profil.nom}`],
              ['Poste', profil.poste],
              ['Email', profil.email],
              ['Téléphone', profil.telephone],
              ['Contrat', profil.typeContrat],
              ['Date d\'entrée', profil.dateEntree],
              ['Salaire brut', `${profil.salaireBase}€`],
              ['Statut', profil.statut],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E8E6E1', fontSize: 13 }}>
                <span style={{ color: DS.muted }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={CARD}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Mon entreprise</div>
            {hasEntreprise || patron ? <>
              {[
                ['Nom', patron?.nom],
                ['SIRET', patron?.siret],
                ['Adresse', patron?.adresse],
                ['Métier', patron?.metier],
                ['Email', patron?.email],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E8E6E1', fontSize: 13 }}>
                  <span style={{ color: DS.muted }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v || '—'}</span>
                </div>
              ))}
            </> : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706', marginBottom: 8 }}>Aucune entreprise</div>
                <div style={{ fontSize: 12, color: DS.muted, marginBottom: 12 }}>Vous n'êtes plus rattaché à une entreprise.</div>
                <button onClick={() => navigate('/recrutement')} style={{ ...BTN, background: '#D97706' }}>Chercher une entreprise</button>
              </div>
            )}
          </div>
        </div>

        {/* Changer le mot de passe */}
        {!isDemo && <ChangerMotDePasseEmploye />}

        {/* Zone dangereuse — Suppression RGPD */}
        {!isDemo && <SupprimerCompteEmploye logout={logout} navigate={navigate} />}
      </>}

      </div>{/* fin maxWidth container */}

      {/* ═══ MODALS ═══ */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: isMobile ? 0 : 16, width: '100%', maxWidth: isMobile ? '100%' : 420, padding: isMobile ? '20px 16px' : '28px 24px', minHeight: isMobile ? '100vh' : 'auto', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {modal === 'conge' && <>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Demander un congé</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Date début</label><input type="date" value={form.debut || ''} onChange={e => setForm(f => ({ ...f, debut: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Date fin</label><input type="date" value={form.fin || ''} onChange={e => setForm(f => ({ ...f, fin: e.target.value }))} style={INP} /></div>
              </div>
              <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Type</label><select value={form.typeConge || 'vacances'} onChange={e => setForm(f => ({ ...f, typeConge: e.target.value }))} style={INP}><option value="vacances">Vacances</option><option value="maladie">Maladie</option><option value="formation">Formation</option><option value="sans_solde">Sans solde</option></select></div>
              <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Commentaire</label><input value={form.commentaire || ''} onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))} style={INP} /></div>
              <button onClick={submitConge} style={{ ...BTN, width: '100%' }}>Envoyer la demande</button>
            </>}
            {modal === 'frais' && <>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Nouvelle note de frais</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Montant (€)</label><input type="number" value={form.montant || ''} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Date</label><input type="date" value={form.dateFrais || ''} onChange={e => setForm(f => ({ ...f, dateFrais: e.target.value }))} style={INP} /></div>
              </div>
              <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Catégorie</label><select value={form.categorie || 'Transport'} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={INP}><option>Transport</option><option>Repas</option><option>Matériel</option><option>Hébergement</option><option>Autre</option></select></div>
              <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Description</label><input value={form.descFrais || ''} onChange={e => setForm(f => ({ ...f, descFrais: e.target.value }))} style={INP} /></div>
              <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Chantier associé</label><select value={form.chantierId || ''} onChange={e => setForm(f => ({ ...f, chantierId: e.target.value }))} style={INP}><option value="">— Aucun —</option>{chantiers.map(ch => <option key={ch.id} value={ch.id}>{ch.titre}</option>)}</select></div>
              <button onClick={submitFrais} style={{ ...BTN, width: '100%' }}>Soumettre</button>
            </>}
          </div>
        </div>
      )}
      {/* ═══ BULLETIN PREVIEW MODAL ═══ */}
      {bulletinPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }} onClick={() => setBulletinPreview(null)}>
          <div style={{ background: '#fff', borderRadius: isMobile ? 0 : 16, width: '100%', maxWidth: isMobile ? '100%' : 540, padding: isMobile ? '20px 16px' : '28px 24px', minHeight: isMobile ? '100vh' : 'auto', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Bulletin de paie</h3>
              <button onClick={() => setBulletinPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: DS.muted }}>×</button>
            </div>
            <div id="bulletin-print" style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, background: '#FAFAF8', border: '1px solid #E8E6E1', borderRadius: 10, padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 16, borderBottom: '2px solid #0A0A0A', paddingBottom: 12 }}>BULLETIN DE PAIE — {bulletinPreview.periode}</div>
              <div style={{ marginBottom: 12 }}>
                <div><strong>Employeur :</strong> {patron.nom} | <strong>SIRET :</strong> {patron.siret}</div>
                <div><strong>Salarié :</strong> {profil.prenom} {profil.nom} | <strong>Poste :</strong> {profil.poste}</div>
              </div>
              <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '12px 0', margin: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Salaire brut</span><span>{bulletinPreview.brut.toFixed(2)} €</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}><span>Cotisations salariales (~22%)</span><span>-{(bulletinPreview.brut * 0.22).toFixed(2)} €</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginTop: 8 }}><span>NET À PAYER</span><span>{bulletinPreview.net.toFixed(2)} €</span></div>
              </div>
              <div><strong>Date de versement :</strong> {bulletinPreview.date}</div>
              <div><strong>Mode :</strong> Virement bancaire</div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setBulletinPreview(null)} style={BTN_O}>Fermer</button>
              <button onClick={() => window.print()} style={BTN}>Imprimer / PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AVIS DE PASSAGE OVERLAY ═══ */}
      {showAvis && selectedChantier && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }} onClick={() => setShowAvis(false)}>
          <div style={{ background: '#fff', borderRadius: isMobile ? 0 : 16, width: '100%', maxWidth: isMobile ? '100%' : 480, maxHeight: isMobile ? '100vh' : '90vh', minHeight: isMobile ? '100vh' : 'auto', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <AvisDePassage chantier={selectedChantier} onClose={() => setShowAvis(false)} onSaved={() => {
              if (!isDemo) {
                api.get(`/avis-passage/chantier/${selectedChantier.id}`).then(({ data }) => setAvisPassages(data.avis || [])).catch(() => {});
              } else {
                setAvisPassages(demoGet('freample_avis_passages', []).filter(a => a.chantierId === selectedChantier.id || a.chantierTitre === selectedChantier.titre));
              }
            }} />
          </div>
        </div>
      )}

      {/* Print CSS + pulse animation + mobile responsive */}
      <style>{`
        @media print { body * { visibility: hidden !important; } #bulletin-print, #bulletin-print * { visibility: visible !important; } #bulletin-print { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; background: #fff; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }
        @media (max-width: 640px) {
          canvas[data-signature] { max-width: 100% !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

// ── Composant changement de mot de passe (employé) ──
function ChangerMotDePasseEmploye() {
  const [pwForm, setPwForm] = useState({ ancien: '', nouveau: '', confirmer: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  async function changerMotDePasse() {
    setPwMsg(''); setPwErr('');
    if (pwForm.nouveau !== pwForm.confirmer) { setPwErr('Les mots de passe ne correspondent pas'); return; }
    if (pwForm.nouveau.length < 8) { setPwErr('8 caractères minimum'); return; }
    try {
      await api.put('/change-password', { ancienMotdepasse: pwForm.ancien, nouveauMotdepasse: pwForm.nouveau });
      setPwMsg('Mot de passe modifié !');
      setPwErr('');
      setPwForm({ ancien: '', nouveau: '', confirmer: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwErr(err.response?.data?.erreur || 'Erreur');
    }
  }

  return (
    <div style={{ ...CARD, marginTop: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Changer le mot de passe</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Mot de passe actuel</label>
          <input type="password" value={pwForm.ancien} onChange={e => setPwForm(p => ({ ...p, ancien: e.target.value }))} style={INP} placeholder="••••••••" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Nouveau mot de passe</label>
            <input type="password" value={pwForm.nouveau} onChange={e => setPwForm(p => ({ ...p, nouveau: e.target.value }))} style={INP} placeholder="••••••••" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Confirmer</label>
            <input type="password" value={pwForm.confirmer} onChange={e => setPwForm(p => ({ ...p, confirmer: e.target.value }))} style={INP} placeholder="••••••••" />
          </div>
        </div>
        {pwMsg && <div style={{ padding: '8px 12px', background: '#D1FAE5', color: '#065F46', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{pwMsg}</div>}
        {pwErr && <div style={{ padding: '8px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{pwErr}</div>}
        <button onClick={changerMotDePasse} style={{ ...BTN, alignSelf: 'flex-start' }}>Changer le mot de passe</button>
      </div>
    </div>
  );
}

function SupprimerCompteEmploye({ logout, navigate }) {
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  async function supprimerCompte() {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est IRRÉVERSIBLE.')) return;
    if (!window.confirm('Dernière confirmation : toutes vos données seront anonymisées. Continuer ?')) return;
    try {
      await api.delete('/supprimer-compte', { data: { motdepasse: deletePassword } });
      alert('Votre compte a été supprimé.');
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.erreur || 'Erreur');
    }
  }

  return (
    <div style={{ marginTop: 32, padding: 20, border: '2px solid #DC2626', borderRadius: 14, background: '#FEF2F2' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', marginBottom: 8 }}>Zone dangereuse</div>
      <div style={{ fontSize: 12, color: '#636363', marginBottom: 12 }}>La suppression de votre compte est définitive. Vos données seront anonymisées conformément au RGPD.</div>
      <input type="password" placeholder="Confirmez votre mot de passe" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
      {deleteError && <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>{deleteError}</div>}
      <button onClick={supprimerCompte} disabled={!deletePassword}
        style={{ padding: '10px 20px', background: deletePassword ? '#DC2626' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: deletePassword ? 'pointer' : 'default' }}>
        Supprimer définitivement mon compte
      </button>
    </div>
  );
}
