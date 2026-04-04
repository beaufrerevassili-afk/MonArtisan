import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import DS from '../../design/ds';
import { useAuth } from '../../context/AuthContext';
import { IconPlus, IconSearch, IconMissions, IconCheck, IconStar, IconMapPin, IconShield, IconX, IconPhoto, IconAlert, IconClock, IconChevronDown } from '../../components/ui/Icons';

const DISPONIBILITES = [
  { value: '',              label: 'Disponibilité'         },
  { value: 'aujourd_hui',  label: "Dispo aujourd'hui"     },
  { value: 'cette_semaine', label: 'Cette semaine'         },
  { value: 'ce_mois',      label: 'Ce mois'                },
];
const NOTES = [
  { value: '',    label: 'Note min'       },
  { value: '3',   label: '3+ étoiles'    },
  { value: '4',   label: '4+ étoiles'    },
  { value: '4.5', label: '4.5+ étoiles'  },
];

const CATEGORIES = ['Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture', 'Maçonnerie', 'Chauffage', 'Serrurerie', 'Jardinage', 'Autres'];
const PIECES = ['Salon', 'Cuisine', 'Chambre', 'Salle de bain', 'WC', 'Couloir', 'Cave / Garage', 'Extérieur', 'Autre'];

const PRIX_ESTIME = {
  Plomberie:   { min: 150, max: 800  },
  Électricité: { min: 100, max: 600  },
  Menuiserie:  { min: 200, max: 1500 },
  Carrelage:   { min: 300, max: 2000 },
  Peinture:    { min: 200, max: 1200 },
  Maçonnerie:  { min: 500, max: 5000 },
  Chauffage:   { min: 300, max: 2000 },
  Serrurerie:  { min: 80,  max: 400  },
  Jardinage:   { min: 80,  max: 500  },
  Autres:      { min: 100, max: 1000 },
};

const STATUT_MAP = {
  en_attente: { cls: 'badge badge-yellow', label: 'En attente' },
  assignee:   { cls: 'badge badge-blue',   label: 'Assignée'   },
  en_cours:   { cls: 'badge badge-green',  label: 'En cours'   },
  terminee:   { cls: 'badge badge-gray',   label: 'Terminée'   },
  annulee:    { cls: 'badge badge-red',    label: 'Annulée'    },
};

const DEVIS_RECUS_DEMO = [
  {
    id: 'DV-2024-018', mission: 'Rénovation salle de bain 12 m²', artisan: 'Bernard Martin BTP', note: 4.8, nbAvis: 142,
    ht: 3200, tva: 640, ttc: 3840, delai: '5 jours', date: '2024-03-25',
    lignes: [
      { desc: 'Dépose et évacuation ancienne salle de bain', qte: 1, pu: 480 },
      { desc: 'Fourniture et pose faïence 2 m²', qte: 12, pu: 65 },
      { desc: 'Plomberie + robinetterie neuve', qte: 1, pu: 720 },
      { desc: 'Main d\'œuvre', qte: 16, pu: 65 },
    ],
    color: '#5B5BD6', statut: 'en_attente',
  },
  {
    id: 'DV-2024-019', mission: 'Rénovation salle de bain 12 m²', artisan: 'Dupont Rénovation', note: 4.5, nbAvis: 89,
    ht: 2750, tva: 550, ttc: 3300, delai: '8 jours', date: '2024-03-25',
    lignes: [
      { desc: 'Dépose ancienne installation', qte: 1, pu: 350 },
      { desc: 'Carrelage sol + mur', qte: 12, pu: 58 },
      { desc: 'Plomberie et installation', qte: 1, pu: 650 },
      { desc: 'Main d\'œuvre', qte: 14, pu: 60 },
    ],
    color: '#34C759', statut: 'en_attente',
  },
  {
    id: 'DV-2024-020', mission: 'Rénovation salle de bain 12 m²', artisan: 'Pro Réno Île-de-France', note: 4.2, nbAvis: 56,
    ht: 4100, tva: 820, ttc: 4920, delai: '3 jours', date: '2024-03-24',
    lignes: [
      { desc: 'Dépose complète + évacuation', qte: 1, pu: 600 },
      { desc: 'Carrelage premium 60×60', qte: 12, pu: 95 },
      { desc: 'Plomberie haut de gamme', qte: 1, pu: 950 },
      { desc: 'Main d\'œuvre spécialisée', qte: 18, pu: 75 },
    ],
    color: '#FF9500', statut: 'en_attente',
  },
];

const TABS = [
  { id: 'accueil',     label: '🏠', title: 'Accueil'      },
  { id: 'btp',        label: '🔨', title: 'BTP & Travaux' },
  { id: 'coiffure',   label: '✂️', title: 'Coiffure'      },
  { id: 'restaurant', label: '🍽️', title: 'Restaurant'    },
  { id: 'vacances',   label: '🏖️', title: 'Vacances'      },
];

export default function DashboardClient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'accueil');
  const [data, setData]           = useState(null);
  const [artisans, setArtisans]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [devisRecus, setDevisRecus] = useState(DEVIS_RECUS_DEMO);
  const [devisOuvert, setDevisOuvert] = useState(null); // id of expanded devis
  const [factureOuverte, setFactureOuverte] = useState(null); // id of expanded facture
  const [factures, setFactures]   = useState([
    {
      id: 'FAC-2024-042', mission: 'Rénovation salle de bain', artisan: 'M. Bernard Martin',
      montantHT: 7917, tva: 1583, ttc: 9500, date: '2024-03-22', statut: 'en_attente',
      lignes: [
        { desc: 'Dépose et évacuation ancienne installation', qte: 1, pu: 480, tva: 10 },
        { desc: 'Fourniture et pose faïence murale 2 m²', qte: 12, pu: 65, tva: 10 },
        { desc: 'Plomberie — remplacement robinetterie complète', qte: 1, pu: 980, tva: 10 },
        { desc: 'Pose receveur de douche 90×90 + paroi', qte: 1, pu: 1250, tva: 10 },
        { desc: 'Main d\'œuvre (16h)', qte: 16, pu: 75, tva: 20 },
        { desc: 'Protection et nettoyage chantier', qte: 1, pu: 220, tva: 20 },
      ],
    },
    {
      id: 'FAC-2024-039', mission: 'Pose carrelage T3', artisan: 'M. Jean Dupont',
      montantHT: 2667, tva: 533, ttc: 3200, date: '2024-03-18', statut: 'payee',
      lignes: [
        { desc: 'Ragréage de sol — préparation', qte: 45, pu: 18, tva: 10 },
        { desc: 'Pose carrelage 60×60 — fourniture et pose', qte: 45, pu: 38, tva: 10 },
        { desc: 'Main d\'œuvre', qte: 8, pu: 65, tva: 20 },
      ],
    },
  ]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({
    titre: '', description: '', budget: '',
    categorie: 'Plomberie', urgence: 'cette_semaine',
    piece: 'Salon', proprietaire: 'oui', typeDemande: 'creation',
  });

  // Landing-style search filters
  const [query,      setQuery]      = useState('');
  const [metier,     setMetier]     = useState('');
  const [ville,      setVille]      = useState('');
  const [villeInput, setVilleInput] = useState('');
  const [villeSuggestions, setVilleSuggestions] = useState([]);
  const [disponibilite, setDispo]   = useState('');
  const [noteMin,    setNoteMin]    = useState('');
  const [metierOpen, setMetierOpen] = useState(false);
  const [dispoOpen,  setDispoOpen]  = useState(false);
  const [noteOpen,   setNoteOpen]   = useState(false);
  const filterTimer = useRef(null);

  const prenom = user?.nom?.split(' ')[0];
  const estimation = PRIX_ESTIME[form.categorie];

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/client'),
      api.get('/client/artisans'),
    ]).then(([d, a]) => {
      setData(d.data);
      setArtisans(a.data.artisans);
    }).finally(() => setLoading(false));
  }, []);

  const rechercherArtisans = useCallback(async () => {
    const params = {};
    if (query)        params.q            = query;
    if (metier)       params.categorie    = metier;
    if (ville)        params.ville        = ville;
    if (disponibilite) params.disponibilite = disponibilite;
    if (noteMin)      params.noteMin      = noteMin;
    try {
      const { data: a } = await api.get('/client/artisans', { params });
      setArtisans(a.artisans);
    } catch {}
  }, [query, metier, ville, disponibilite, noteMin]);

  // Geo autocomplete
  useEffect(() => {
    if (villeInput.length < 2) { setVilleSuggestions([]); return; }
    const controller = new AbortController();
    fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(villeInput)}&fields=nom,codesPostaux&boost=population&limit=6`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setVilleSuggestions(data.map(c => `${c.nom}${c.codesPostaux?.[0] ? ` (${c.codesPostaux[0].slice(0, 2)})` : ''}`)))
      .catch(() => {});
    return () => controller.abort();
  }, [villeInput]);

  // Auto-search when filters change
  useEffect(() => {
    clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => rechercherArtisans(), 300);
    return () => clearTimeout(filterTimer.current);
  }, [metier, ville, disponibilite, noteMin]);

  async function creerMission(e) {
    e.preventDefault();
    await api.post('/missions', form);
    setShowForm(false);
    const { data: d } = await api.get('/dashboard/client');
    setData(d);
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Tab navigation ── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${DS.border}`, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 0, background: DS.bg, position: 'sticky', top: 0, zIndex: 10 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: `2.5px solid ${activeTab === t.id ? DS.accent : 'transparent'}`,
              color: activeTab === t.id ? DS.accent : DS.muted,
              fontWeight: activeTab === t.id ? 700 : 400,
              fontSize: 13.5, fontFamily: DS.font, whiteSpace: 'nowrap', marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color .15s',
            }}>
            <span>{t.label}</span>
            <span>{t.title}</span>
          </button>
        ))}
      </div>

      {/* ══ ACCUEIL TAB ══════════════════════════════════════════════════════════ */}
      {activeTab === 'accueil' && <AccueilTab user={user} navigate={navigate} setActiveTab={setActiveTab} />}

      {/* ══ COIFFURE TAB ═════════════════════════════════════════════════════════ */}
      {activeTab === 'coiffure' && <CoiffureTab navigate={navigate} />}

      {/* ══ RESTAURANT TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === 'restaurant' && <RestaurantTab navigate={navigate} />}

      {/* ══ VACANCES TAB ═════════════════════════════════════════════════════════ */}
      {activeTab === 'vacances' && <VacancesTab navigate={navigate} />}

      {/* ══ BTP TAB ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'btp' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 28 }}>

      {/* Hero search — même apparence que la page d'accueil */}
      <div style={{ background: 'linear-gradient(160deg, #0A0F1E 0%, #0A2550 60%, #004FA3 100%)', borderRadius: 20, padding: '32px 28px 28px', margin: '-28px -28px 0', position: 'relative' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Bonjour, {prenom}</p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 20 }}>Trouvez votre artisan</h1>

          {/* Search box */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '5px 5px 5px 18px', display: 'flex', alignItems: 'center', gap: 0, boxShadow: '0 16px 48px rgba(0,0,0,0.3)', marginBottom: 14 }}>
            <IconSearch size={17} color="#AEAEB2" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') rechercherArtisans(); }}
              placeholder="Je recherche un artisan, une spécialité..."
              style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontSize: '0.9375rem', color: '#1D1D1F', background: 'transparent', fontFamily: 'inherit' }}
            />
            <button onClick={rechercherArtisans}
              style={{ background: '#5B5BD6', color: '#fff', border: 'none', cursor: 'pointer', padding: '11px 22px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Rechercher
            </button>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            {/* Ville */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 20, background: ville ? '#EBF5FF' : 'rgba(255,255,255,0.12)', border: ville ? '1px solid rgba(0,122,255,0.3)' : '1px solid rgba(255,255,255,0.2)' }}>
                <IconMapPin size={12} color={ville ? '#5B5BD6' : 'rgba(255,255,255,0.8)'} />
                <input type="text" value={villeInput} onChange={e => { setVilleInput(e.target.value); if (!e.target.value) setVille(''); }} placeholder="Ville"
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8125rem', color: ville ? '#5B5BD6' : 'rgba(255,255,255,0.9)', fontWeight: 500, width: 90, fontFamily: 'inherit' }} />
              </div>
              {villeSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 180, overflow: 'hidden' }}>
                  {villeSuggestions.map(v => (
                    <button key={v} onClick={() => { setVille(v); setVilleInput(v); setVilleSuggestions([]); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 13px', fontSize: '0.8125rem', cursor: 'pointer', background: 'none', border: 'none', color: '#1D1D1F' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F7'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Métier */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setMetierOpen(!metierOpen); setDispoOpen(false); setNoteOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500, background: metier ? '#EBF5FF' : 'rgba(255,255,255,0.12)', color: metier ? '#5B5BD6' : 'rgba(255,255,255,0.9)', border: metier ? '1px solid rgba(0,122,255,0.3)' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {metier || 'Métier'} <IconChevronDown size={12} />
              </button>
              {metierOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 180 }}>
                  <button onClick={() => { setMetier(''); setMetierOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 13px', fontSize: '0.8125rem', cursor: 'pointer', background: 'none', border: 'none', color: '#6E6E73' }}>Tous les métiers</button>
                  {CATEGORIES.map(m => (
                    <button key={m} onClick={() => { setMetier(m); setMetierOpen(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 13px', fontSize: '0.8125rem', cursor: 'pointer', background: metier === m ? '#EBF5FF' : 'none', color: metier === m ? '#5B5BD6' : '#1D1D1F', border: 'none', fontWeight: metier === m ? 600 : 400 }}
                      onMouseEnter={e => { if (metier !== m) e.currentTarget.style.background = '#F5F5F7'; }}
                      onMouseLeave={e => { if (metier !== m) e.currentTarget.style.background = 'none'; }}>
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Disponibilité */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setDispoOpen(!dispoOpen); setMetierOpen(false); setNoteOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500, background: disponibilite ? '#EBF5FF' : 'rgba(255,255,255,0.12)', color: disponibilite ? '#5B5BD6' : 'rgba(255,255,255,0.9)', border: disponibilite ? '1px solid rgba(0,122,255,0.3)' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {DISPONIBILITES.find(d => d.value === disponibilite)?.label || 'Disponibilité'} <IconChevronDown size={12} />
              </button>
              {dispoOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 200 }}>
                  {DISPONIBILITES.map(d => (
                    <button key={d.value} onClick={() => { setDispo(d.value); setDispoOpen(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 13px', fontSize: '0.8125rem', cursor: 'pointer', background: disponibilite === d.value ? '#EBF5FF' : 'none', color: disponibilite === d.value ? '#5B5BD6' : '#1D1D1F', border: 'none', fontWeight: disponibilite === d.value ? 600 : 400 }}
                      onMouseEnter={e => { if (disponibilite !== d.value) e.currentTarget.style.background = '#F5F5F7'; }}
                      onMouseLeave={e => { if (disponibilite !== d.value) e.currentTarget.style.background = 'none'; }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Note */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setNoteOpen(!noteOpen); setMetierOpen(false); setDispoOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500, background: noteMin ? '#EBF5FF' : 'rgba(255,255,255,0.12)', color: noteMin ? '#5B5BD6' : 'rgba(255,255,255,0.9)', border: noteMin ? '1px solid rgba(0,122,255,0.3)' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {NOTES.find(n => n.value === noteMin)?.label || 'Note'} <IconChevronDown size={12} />
              </button>
              {noteOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: '#fff', borderRadius: 12, border: '1px solid #E5E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 160 }}>
                  {NOTES.map(n => (
                    <button key={n.value} onClick={() => { setNoteMin(n.value); setNoteOpen(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 13px', fontSize: '0.8125rem', cursor: 'pointer', background: noteMin === n.value ? '#EBF5FF' : 'none', color: noteMin === n.value ? '#5B5BD6' : '#1D1D1F', border: 'none', fontWeight: noteMin === n.value ? 600 : 400 }}
                      onMouseEnter={e => { if (noteMin !== n.value) e.currentTarget.style.background = '#F5F5F7'; }}
                      onMouseLeave={e => { if (noteMin !== n.value) e.currentTarget.style.background = 'none'; }}>
                      {n.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-primary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => setShowForm(true)}>
                <IconPlus size={13} /> Nouvelle demande
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Missions total',  val: data?.resume?.missions_total     || 0, Icon: IconMissions, color: 'blue'   },
          { label: 'En attente',      val: data?.resume?.missions_en_attente || 0, Icon: IconClock,    color: 'orange' },
          { label: 'En cours',        val: data?.resume?.missions_en_cours   || 0, Icon: IconMissions, color: 'green'  },
          { label: 'Terminées',       val: data?.resume?.missions_terminees  || 0, Icon: IconCheck,    color: 'blue'   },
        ].map(({ label, val, Icon, color }) => (
          <StatCard key={label} label={label} valeur={val} Icon={Icon} color={color} />
        ))}
      </div>

      {/* New mission form */}
      {showForm && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <h2>Décrivez votre besoin</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Nous trouverons les meilleurs artisans disponibles pour vous
              </p>
            </div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}>
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={creerMission} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Type de demande */}
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Type d'intervention
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'creation', icon: '🏗️', title: 'Création / Rénovation', desc: 'Travaux planifiés, aménagement, rénovation complète', color: '#5B5BD6', bg: '#EBF5FF' },
                  { key: 'depannage', icon: '🚨', title: 'Dépannage urgent', desc: 'Panne, fuite, urgence — intervention rapide nécessaire', color: '#FF3B30', bg: '#FFE5E5' },
                ].map(t => (
                  <div
                    key={t.key}
                    onClick={() => setForm(f => ({ ...f, typeDemande: t.key, urgence: t.key === 'depannage' ? 'urgent' : f.urgence }))}
                    style={{ border: `2px solid ${form.typeDemande === t.key ? t.color : 'var(--border-light)'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', background: form.typeDemande === t.key ? t.bg : 'var(--card)', transition: 'all 0.15s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>{t.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: form.typeDemande === t.key ? t.color : 'var(--text)' }}>{t.title}</span>
                      {form.typeDemande === t.key && (
                        <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
              {form.typeDemande === 'depannage' && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: '#FFE5E5', borderRadius: 10, fontSize: '0.8125rem', color: '#C0392B', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ flexShrink: 0 }}>⚡</span>
                  Intervention d'urgence : un artisan disponible sera contacté en priorité et pourra intervenir sous 24h.
                </div>
              )}
            </div>

            {/* Step 1: Guided questions */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 18 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Questions rapides
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                <div>
                  <label className="label">Catégorie de travaux</label>
                  <select className="select" value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Quelle pièce ?</label>
                  <select className="select" value={form.piece} onChange={e => setForm({ ...form, piece: e.target.value })}>
                    {PIECES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Urgence</label>
                  <select className="select" value={form.urgence} onChange={e => setForm({ ...form, urgence: e.target.value })}>
                    <option value="urgent">Urgent (aujourd'hui)</option>
                    <option value="cette_semaine">Cette semaine</option>
                    <option value="ce_mois">Ce mois-ci</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="label">Vous êtes</label>
                  <select className="select" value={form.proprietaire} onChange={e => setForm({ ...form, proprietaire: e.target.value })}>
                    <option value="oui">Propriétaire</option>
                    <option value="non">Locataire</option>
                  </select>
                </div>
              </div>

              {/* Price estimate */}
              {estimation && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconAlert size={14} color="var(--primary)" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
                    Estimation pour {form.categorie} : <strong>{estimation.min}€ – {estimation.max}€</strong> TTC selon la complexité
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Description */}
            <div>
              <label className="label">Titre de la mission</label>
              <input className="input" placeholder="Ex: Fuite robinet cuisine" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description détaillée</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Décrivez le problème, ce qui s'est passé, depuis quand..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Photo upload (UI only for demo) */}
            <div>
              <label className="label">Photos (optionnel)</label>
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 12, padding: '20px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                color: 'var(--text-tertiary)', cursor: 'pointer',
                transition: 'var(--transition)',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <IconPhoto size={24} color="var(--text-tertiary)" />
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Glissez vos photos ici</p>
                <p style={{ fontSize: '0.75rem' }}>ou cliquez pour sélectionner (JPG, PNG — max 10 Mo)</p>
              </div>
            </div>

            <div>
              <label className="label">Budget estimé (€)</label>
              <input type="number" className="input" placeholder={estimation ? String(estimation.min) : '200'} value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} required style={{ maxWidth: 200 }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Envoyer la demande</button>
            </div>
          </form>
        </div>
      )}

      {/* Artisans disponibles */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>Artisans disponibles</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{artisans.length} résultat{artisans.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {artisans.map(a => {
            const colors = ['#5B5BD6', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA'];
            const bg = colors[(a.id || 0) % colors.length];
            const initials = (a.nom || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const dispoMap = {
              aujourd_hui: { label: "Disponible aujourd'hui", bg2: '#ECFDF5', color2: '#1A7A3C' },
              cette_semaine: { label: 'Cette semaine', bg2: '#EBF5FF', color2: '#0066CC' },
              ce_mois: { label: 'Ce mois', bg2: '#F2F2F7', color2: '#636366' },
            };
            const dispo = dispoMap[a.disponibilite] || (a.disponible ? dispoMap.aujourd_hui : { label: 'Indisponible', bg2: '#FFE5E5', color2: '#C0392B' });
            return (
              <div key={a.id}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #F2F2F7', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}>
                <div style={{ height: 5, background: bg }} />
                <div style={{ padding: '16px 20px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: bg + '22', color: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nom}</span>
                        {a.verified && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B5BD6" strokeWidth="1.8" strokeLinecap="round"><path d="M9 12l2 2 4-4M12 2a10 10 0 100 20A10 10 0 0012 2z"/></svg>}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: '#6E6E73', fontWeight: 500 }}>{a.metier || a.specialite}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>
                      {[1,2,3,4,5].map(i => <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(a.note || 0) ? '#FF9500' : 'none'} stroke="#FF9500" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round"/></svg>)}
                      {a.note} <span style={{ fontWeight: 400, color: '#AEAEB2' }}>({a.nbAvis})</span>
                    </span>
                    {(a.ville || a.distance != null) && <><span style={{ width: 1, height: 12, background: '#E5E5EA' }} /><span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8125rem', color: '#6E6E73' }}><IconMapPin size={11} /> {a.ville || `${a.distance} km`}</span></>}
                    <span style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 700, color: '#1D1D1F' }}>{a.prixHeure}€<span style={{ fontWeight: 400, color: '#AEAEB2', fontSize: '0.75rem' }}>/h</span></span>
                  </div>
                  {a.certifications?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {a.certifications.map(c => <span key={c} style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#ECFDF5', color: '#1A7A3C' }}>{c}</span>)}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: dispo.bg2, color: dispo.color2 }}>{dispo.label}</span>
                    <button
                      onClick={() => setShowForm(true)}
                      style={{ background: '#5B5BD6', color: '#fff', border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#0066CC'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#5B5BD6'; }}>
                      Contacter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {artisans.length === 0 && (
            <div className="card" style={{ padding: 48, gridColumn: '1 / -1', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)' }}>Aucun artisan trouvé pour ces critères</p>
            </div>
          )}
        </div>
      </div>

      {/* Devis reçus — comparateur */}
      {devisRecus.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0 }}>Devis reçus</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {devisRecus.filter(d => d.statut === 'en_attente').length} devis en attente — comparez et choisissez le meilleur.
              </p>
            </div>
            {devisRecus.some(d => d.statut === 'accepte') && (
              <span style={{ fontSize: 11, fontWeight: 700, background: '#D1F2E0', color: '#1A7F43', borderRadius: 20, padding: '3px 12px' }}>Devis accepté ✓</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {devisRecus.map(d => {
              const isPrix = d.ttc === Math.min(...devisRecus.filter(x => x.statut === 'en_attente').map(x => x.ttc));
              const isRapide = d.delai === devisRecus.filter(x => x.statut === 'en_attente').sort((a, b) => parseInt(a.delai) - parseInt(b.delai))[0]?.delai;
              const isOpen = devisOuvert === d.id;
              return (
                <div key={d.id} style={{
                  background: '#fff', borderRadius: 16, overflow: 'hidden',
                  border: d.statut === 'accepte' ? '2px solid #34C759' : d.statut === 'refuse' ? '1px solid #E5E5EA' : `2px solid ${d.color}30`,
                  opacity: d.statut === 'refuse' ? 0.6 : 1,
                  boxShadow: d.statut === 'en_attente' ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
                }}>
                  {/* Card header: colored band + badge */}
                  <div style={{ height: 4, background: d.statut === 'accepte' ? '#34C759' : d.statut === 'refuse' ? '#C7C7CC' : d.color }} />

                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Artisan initials */}
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: d.color + '20', color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                        {d.artisan.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#1D1D1F' }}>{d.artisan}</span>
                          {d.statut === 'accepte' && <span style={{ fontSize: 11, fontWeight: 700, background: '#D1F2E0', color: '#1A7F43', padding: '1px 9px', borderRadius: 20 }}>✓ Accepté</span>}
                          {d.statut === 'refuse' && <span style={{ fontSize: 11, fontWeight: 700, background: '#F2F2F7', color: '#8E8E93', padding: '1px 9px', borderRadius: 20 }}>Refusé</span>}
                          {isPrix && d.statut === 'en_attente' && <span style={{ fontSize: 11, fontWeight: 700, background: '#D1F2E0', color: '#1A7F43', padding: '1px 9px', borderRadius: 20 }}>💰 Meilleur prix</span>}
                          {isRapide && !isPrix && d.statut === 'en_attente' && <span style={{ fontSize: 11, fontWeight: 700, background: '#EBF5FF', color: '#5B5BD6', padding: '1px 9px', borderRadius: 20 }}>⚡ Plus rapide</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6E6E73', marginBottom: 2 }}>
                          {[1,2,3,4,5].map(i => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(d.note) ? '#FF9500' : 'none'} stroke="#FF9500" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round"/></svg>)}
                          <span style={{ fontWeight: 600, color: '#1D1D1F', marginLeft: 2 }}>{d.note}</span>
                          <span>({d.nbAvis} avis)</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#6E6E73' }}>Reçu le {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</div>
                      </div>

                      {/* Price + delay */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em' }}>{d.ttc.toLocaleString('fr-FR')} €</div>
                        <div style={{ fontSize: 11, color: '#8E8E93' }}>TTC (HT {d.ht.toLocaleString('fr-FR')} €)</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: d.color, marginTop: 4 }}>⏱ Délai : {d.delai}</div>
                      </div>
                    </div>

                    {/* Expand / action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid #F2F2F7', flexWrap: 'wrap' }}>
                      <button onClick={() => setDevisOuvert(isOpen ? null : d.id)}
                        style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, background: isOpen ? '#F5F5F7' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {isOpen ? 'Masquer le détail ▲' : 'Voir le détail ▼'}
                      </button>
                      {d.statut === 'en_attente' && (
                        <>
                          <button onClick={() => setDevisRecus(prev => prev.map(x => x.id === d.id ? { ...x, statut: 'accepte' } : x.statut === 'en_attente' ? { ...x, statut: 'refuse' } : x))}
                            style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, background: d.color, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            ✓ Accepter ce devis
                          </button>
                          <button onClick={() => setDevisRecus(prev => prev.map(x => x.id === d.id ? { ...x, statut: 'refuse' } : x))}
                            style={{ padding: '8px 14px', border: '1px solid #E5E5EA', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#8E8E93' }}>
                            Refuser
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail: line items */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #F2F2F7', background: '#FAFAFA', padding: '16px 20px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Détail des prestations</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ color: '#8E8E93', fontSize: 11, fontWeight: 700 }}>
                            <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 700 }}>Description</th>
                            <th style={{ textAlign: 'center', paddingBottom: 8, fontWeight: 700, width: 50 }}>Qté</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 700, width: 90 }}>P.U. HT</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 700, width: 90 }}>Total HT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.lignes.map((l, i) => (
                            <tr key={i} style={{ borderTop: '1px solid #F2F2F7' }}>
                              <td style={{ padding: '8px 0', color: '#1D1D1F' }}>{l.desc}</td>
                              <td style={{ textAlign: 'center', color: '#6E6E73' }}>{l.qte}</td>
                              <td style={{ textAlign: 'right', color: '#6E6E73' }}>{l.pu.toLocaleString('fr-FR')} €</td>
                              <td style={{ textAlign: 'right', fontWeight: 600, color: '#1D1D1F' }}>{(l.qte * l.pu).toLocaleString('fr-FR')} €</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ borderTop: '2px solid #E5E5EA' }}>
                            <td colSpan={3} style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6E6E73' }}>Total HT</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, padding: '8px 0' }}>{d.ht.toLocaleString('fr-FR')} €</td>
                          </tr>
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'right', fontSize: 12, color: '#6E6E73' }}>TVA 20 %</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#6E6E73' }}>{d.tva.toLocaleString('fr-FR')} €</td>
                          </tr>
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#1D1D1F', paddingTop: 4 }}>Total TTC</td>
                            <td style={{ textAlign: 'right', fontSize: 16, fontWeight: 800, color: d.color, paddingTop: 4 }}>{d.ttc.toLocaleString('fr-FR')} €</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Factures à valider */}
      {factures.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2>Mes factures</h2>
            {factures.filter(f => f.statut === 'en_attente').length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, background: '#FF9500', color: '#fff', borderRadius: 20, padding: '2px 10px' }}>
                {factures.filter(f => f.statut === 'en_attente').length} à valider
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {factures.map(f => {
              const isOpen = factureOuverte === f.id;
              return (
                <div key={f.id} style={{ background: '#fff', borderRadius: 14, border: f.statut === 'en_attente' ? '2px solid #FF950040' : '1px solid #E5E5EA', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  {/* Header */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{f.id}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, background: f.statut === 'en_attente' ? '#FFF3CD' : f.statut === 'payee' ? '#D1F2E0' : '#FFE5E5', color: f.statut === 'en_attente' ? '#856404' : f.statut === 'payee' ? '#1A7F43' : '#C0392B' }}>
                            {f.statut === 'en_attente' ? 'À valider' : f.statut === 'payee' ? 'Payée' : 'Contestée'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{f.mission}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{f.artisan} · {new Date(f.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{f.ttc.toLocaleString('fr-FR')} €</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>HT {f.montantHT.toLocaleString('fr-FR')} + TVA {f.tva.toLocaleString('fr-FR')}</div>
                      </div>
                    </div>

                    {/* Expand button + actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #F2F2F7', flexWrap: 'wrap' }}>
                      <button onClick={() => setFactureOuverte(isOpen ? null : f.id)}
                        style={{ padding: '6px 14px', border: '1px solid #E5E5EA', borderRadius: 8, background: isOpen ? '#F5F5F7' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {isOpen ? 'Masquer le détail ▲' : '🧾 Voir la facture ▼'}
                      </button>
                      {f.statut === 'en_attente' && (
                        <>
                          <button onClick={() => setFactures(fs => fs.map(x => x.id === f.id ? { ...x, statut: 'payee' } : x))}
                            style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 8, background: '#34C759', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                            ✓ Accepter et payer
                          </button>
                          <button onClick={() => setFactures(fs => fs.map(x => x.id === f.id ? { ...x, statut: 'contestee' } : x))}
                            style={{ padding: '7px 14px', border: '1px solid #FF3B3040', borderRadius: 8, background: '#FFF5F5', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#C0392B' }}>
                            Contester
                          </button>
                        </>
                      )}
                      {f.statut === 'payee' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#1A7F43', fontWeight: 600 }}>✓ Paiement effectué</span>
                      )}
                      {f.statut === 'contestee' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#C0392B', fontWeight: 600 }}>⚠ Contestée — l'artisan sera notifié</span>
                      )}
                      <button onClick={() => window.print()} style={{ padding: '7px 12px', border: '1px solid #E5E5EA', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, color: 'var(--text-tertiary)' }}>PDF</button>
                    </div>
                  </div>

                  {/* Expanded invoice detail */}
                  {isOpen && f.lignes && (
                    <div style={{ borderTop: '1px solid #F2F2F7', background: '#FAFAFA', padding: '16px 20px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Détail des prestations</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ color: '#8E8E93', fontSize: 11, fontWeight: 700 }}>
                            <th style={{ textAlign: 'left', paddingBottom: 8 }}>Description</th>
                            <th style={{ textAlign: 'center', paddingBottom: 8, width: 50 }}>Qté</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, width: 80 }}>P.U. HT</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, width: 60 }}>TVA</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, width: 90 }}>Total HT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {f.lignes.map((l, i) => (
                            <tr key={i} style={{ borderTop: '1px solid #F2F2F7' }}>
                              <td style={{ padding: '8px 0', color: '#1D1D1F' }}>{l.desc}</td>
                              <td style={{ textAlign: 'center', color: '#6E6E73' }}>{l.qte}</td>
                              <td style={{ textAlign: 'right', color: '#6E6E73' }}>{l.pu.toLocaleString('fr-FR')} €</td>
                              <td style={{ textAlign: 'right', color: '#6E6E73' }}>{l.tva}%</td>
                              <td style={{ textAlign: 'right', fontWeight: 600, color: '#1D1D1F' }}>{(l.qte * l.pu).toLocaleString('fr-FR')} €</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ borderTop: '2px solid #E5E5EA' }}>
                            <td colSpan={4} style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6E6E73' }}>Total HT</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, padding: '8px 0' }}>{f.montantHT.toLocaleString('fr-FR')} €</td>
                          </tr>
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'right', fontSize: 12, color: '#6E6E73' }}>TVA</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#6E6E73' }}>{f.tva.toLocaleString('fr-FR')} €</td>
                          </tr>
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#1D1D1F', paddingTop: 4 }}>Total TTC</td>
                            <td style={{ textAlign: 'right', fontSize: 16, fontWeight: 800, color: '#5B5BD6', paddingTop: 4 }}>{f.ttc.toLocaleString('fr-FR')} €</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mes missions récentes */}
      {data?.mes_missions?.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Missions récentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.mes_missions.slice(0, 5).map(m => {
              const sm = STATUT_MAP[m.statut];
              return (
                <div key={m.id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titre}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{m.budget?.toLocaleString('fr-FR')} €</span>
                    <span className={sm?.cls || 'badge badge-gray'}>{sm?.label || m.statut}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
      )} {/* end BTP tab */}

    </div>
  );
}

function StatCard({ label, valeur, Icon, color = 'blue' }) {
  const colors = {
    blue:   { bg: 'var(--primary-light)', fg: 'var(--primary)' },
    green:  { bg: 'var(--success-light)', fg: '#1A7A3C'         },
    orange: { bg: 'var(--warning-light)', fg: '#7A5C00'         },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="stat-card">
      <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={15} />
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{valeur}</p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>{label}</p>
    </div>
  );
}

// ─── Chart components ────────────────────────────────────────────────────────

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.total), 1);
  const H = 100, barW = 28, gap = 10;
  const W = data.length * (barW + gap) - gap + 44;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 32}`} style={{ overflow: 'visible', display: 'block' }}>
      {[0, 0.5, 1].map(pct => (
        <React.Fragment key={pct}>
          <line x1={36} x2={W} y1={H - pct * H} y2={H - pct * H} stroke="#F2F2F7" strokeWidth={1} />
          <text x={32} y={H - pct * H + 4} textAnchor="end" fontSize={9} fill="#AEAEB2">
            {pct === 0 ? '0' : pct === 0.5 ? `${Math.round(max / 2000)}k` : `${Math.round(max / 1000)}k`}
          </text>
        </React.Fragment>
      ))}
      {data.map((d, i) => {
        const barH = Math.max((d.total / max) * H, 2);
        const x = 38 + i * (barW + gap);
        const y = H - barH;
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={0} width={barW} height={H} rx={4} fill="#F5F5F7" />
            <rect x={x} y={y} width={barW} height={barH} rx={4}
              fill={isLast ? DS.accent : DS.accentLight || '#C7C7FF'} />
            <text x={x + barW / 2} y={H + 18} textAnchor="middle"
              fontSize={10} fill={isLast ? DS.ink : '#8E8E93'} fontWeight={isLast ? 600 : 400}>
              {d.mois}
            </text>
            {isLast && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle"
                fontSize={9} fill={DS.accent} fontWeight={700}>
                {(d.total / 1000).toFixed(1)}k€
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 42;
  const circ = 2 * Math.PI * r;
  let prevLen = 0;

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={110} height={110} viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke="#F5F5F7" strokeWidth={16} />
        {segments.map((seg, i) => {
          const dashLen = (seg.value / total) * circ;
          const dashOffset = circ * 0.25 - prevLen;
          prevLen += dashLen;
          return (
            <circle key={i} cx={55} cy={55} r={r}
              fill="none" stroke={seg.color} strokeWidth={16}
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}
        <text x={55} y={51} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1D1D1F">
          {(total / 1000).toFixed(1)}k€
        </text>
        <text x={55} y={65} textAnchor="middle" fontSize={10} fill="#8E8E93">total</text>
      </svg>
      <div style={{ flex: 1, minWidth: 140 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6E6E73', flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1D1D1F' }}>
              {seg.value.toLocaleString('fr-FR')} €
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Accueil Tab ─────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { mois: 'Oct', total: 1130 },
  { mois: 'Nov', total: 2420 },
  { mois: 'Déc', total: 840  },
  { mois: 'Jan', total: 3200 },
  { mois: 'Fév', total: 1600 },
  { mois: 'Mar', total: 12700 },
];

const DONUT_SEGMENTS = [
  { label: '🔨 BTP & Travaux', value: 12000, color: '#5B5BD6' },
  { label: '✂️ Coiffure',      value: 400,   color: '#E535AB' },
  { label: '🍽️ Restaurant',    value: 200,   color: '#FF9500' },
  { label: '🏖️ Vacances',      value: 100,   color: '#34C759' },
];

const RECENT_ACTIVITY = [
  { date: '22 mar', label: 'Rénovation salle de bain', sector: 'BTP',        amount: 9500, icon: '🔨', color: '#5B5BD6', statut: 'payée'   },
  { date: '18 mar', label: 'Coupe + coloration',       sector: 'Coiffure',   amount: 85,   icon: '✂️', color: '#E535AB', statut: 'payée'   },
  { date: '15 mar', label: 'Trattoria Genovese',       sector: 'Restaurant', amount: 62,   icon: '🍽️', color: '#FF9500', statut: 'payée'   },
  { date: '12 mar', label: 'Pose carrelage T3',        sector: 'BTP',        amount: 3200, icon: '🔨', color: '#5B5BD6', statut: 'payée'   },
  { date: '05 mar', label: "Vacances Côte d'Azur",     sector: 'Vacances',   amount: 420,  icon: '🏖️', color: '#34C759', statut: 'à venir' },
];

function AccueilTab({ user, navigate, setActiveTab }) {
  const prenom = user?.nom?.split(' ')[0] || 'vous';
  const KPI = [
    { label: 'Dépenses totales', value: '12 700 €', icon: '💶', sub: '6 derniers mois',       color: '#5B5BD6', bg: '#EBF5FF', tab: null },
    { label: 'Ce mois-ci',       value: '1 600 €',  icon: '📅', sub: '↓ 8 % vs mois dernier', color: '#1A7A3C', bg: '#ECFDF5', tab: null },
    { label: 'Missions actives', value: '2',         icon: '⚡', sub: 'En cours de traitement', color: '#FF9500', bg: '#FFF8EC', tab: 'btp' },
    { label: 'Services utilisés',value: '3',         icon: '🎯', sub: 'BTP · Coiffure · Resto', color: '#AF52DE', bg: '#F5EEFF', tab: null },
  ];

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #F0EEFF 0%, #E8F0FF 100%)', borderRadius: 16, padding: '20px 24px', border: '1px solid #DDD8FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: DS.accent, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Tableau de bord</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: DS.ink, letterSpacing: '-0.03em', marginBottom: 4 }}>Bonjour, {prenom} 👋</h1>
          <p style={{ fontSize: 13.5, color: DS.muted }}>Retrouvez toutes vos activités et dépenses en un seul endroit.</p>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        {KPI.map((kpi, i) => (
          <div key={i}
            onClick={() => kpi.tab && setActiveTab(kpi.tab)}
            style={{ background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, padding: '18px 20px', cursor: kpi.tab ? 'pointer' : 'default' }}
            onMouseEnter={e => { if (kpi.tab) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>
              {kpi.icon}
            </div>
            <p style={{ fontSize: '1.375rem', fontWeight: 800, color: DS.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{kpi.value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: DS.ink2, marginTop: 4 }}>{kpi.label}</p>
            <p style={{ fontSize: 11, color: DS.muted, marginTop: 2 }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: DS.ink, marginBottom: 2 }}>Évolution des dépenses</p>
          <p style={{ fontSize: 11, color: DS.muted, marginBottom: 18 }}>6 derniers mois (€ TTC)</p>
          <BarChart data={MONTHLY_DATA} />
        </div>
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: DS.ink, marginBottom: 2 }}>Répartition par secteur</p>
          <p style={{ fontSize: 11, color: DS.muted, marginBottom: 18 }}>Sur 6 mois</p>
          <DonutChart segments={DONUT_SEGMENTS} />
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${DS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: DS.ink }}>Activité récente</p>
          <span style={{ fontSize: 11, color: DS.muted }}>5 dernières transactions</span>
        </div>
        {RECENT_ACTIVITY.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${DS.border}` : 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: item.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: DS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</p>
              <p style={{ fontSize: 11, color: DS.muted, marginTop: 1 }}>{item.sector} · {item.date}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: DS.ink }}>{item.amount.toLocaleString('fr-FR')} €</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: item.statut === 'payée' ? '#1A7A3C' : '#FF9500', marginTop: 1 }}>{item.statut}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links to sectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { id: 'btp', label: 'BTP & Travaux', icon: '🔨', desc: 'Artisans, devis, chantiers', grad: 'linear-gradient(135deg,#EBF5FF,#D6EDFF)' },
          { id: 'coiffure', label: 'Coiffure', icon: '✂️', desc: 'Salons, RDV', grad: 'linear-gradient(135deg,#FFF0F8,#FFE0F2)' },
          { id: 'restaurant', label: 'Restaurant', icon: '🍽️', desc: 'Commander, réserver', grad: 'linear-gradient(135deg,#FFF8EC,#FFE8C0)' },
          { id: 'vacances', label: 'Vacances', icon: '🏖️', desc: 'Logements, séjours', grad: 'linear-gradient(135deg,#ECFDF5,#D1F5E8)' },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)}
            style={{ background: s.grad, borderRadius: 14, border: 'none', padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'transform .15s', fontFamily: DS.font }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: DS.ink, marginBottom: 3 }}>{s.label}</p>
            <p style={{ fontSize: 11, color: DS.muted }}>{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Coiffure Tab ─────────────────────────────────────────────────────────────

const SALONS_DEMO = [
  { nom: 'Atelier Lumière', ville: 'Paris 11e', note: 4.9, avis: 312, prix: 'À partir de 35 €', dispo: 'Disponible aujourd\'hui', grad: 'linear-gradient(140deg,#FFB3D1,#FF6B9E)', initials: 'AL' },
  { nom: 'Studio Mane',     ville: 'Paris 3e',  note: 4.8, avis: 189, prix: 'À partir de 28 €', dispo: 'Demain',                   grad: 'linear-gradient(140deg,#B3D1FF,#6B9EFF)', initials: 'SM' },
  { nom: 'Coupe & Co',      ville: 'Paris 18e', note: 4.7, avis: 278, prix: 'À partir de 20 €', dispo: 'Cette semaine',             grad: 'linear-gradient(140deg,#D1FFB3,#6BFF9E)', initials: 'CC' },
];

const MES_RDV_COIFFURE = [
  { id:1, salon:'Studio Beauté', prestation:'Coupe + Brushing', date:'2026-04-06', heure:'14:30', duree:'1h', prix:55, statut:'a_venir', code:'FRP-4812' },
  { id:2, salon:'L\'Atelier Coiffure', prestation:'Coloration + Soin', date:'2026-04-12', heure:'10:00', duree:'1h30', prix:95, statut:'a_venir', code:'FRP-5923' },
  { id:3, salon:'Studio Beauté', prestation:'Balayage miel', date:'2026-03-20', heure:'11:00', duree:'2h', prix:130, statut:'termine', code:'FRP-2741' },
  { id:4, salon:'Hair & Co', prestation:'Coupe femme', date:'2026-03-05', heure:'16:00', duree:'45min', prix:42, statut:'termine', code:'FRP-1630' },
];

function CoiffureTab({ navigate }) {
  const [q, setQ] = useState('');
  const [ville, setVille] = useState('');
  const rdvAVenir = MES_RDV_COIFFURE.filter(r => r.statut === 'a_venir');
  const rdvPasses = MES_RDV_COIFFURE.filter(r => r.statut === 'termine');

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Mes RDV à venir */}
      {rdvAVenir.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Mes rendez-vous à venir</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rdvAVenir.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 14, border: '2px solid #E535AB30', padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF0F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✂️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{r.prestation}</p>
                  <p style={{ fontSize: 12, color: DS.muted, marginTop: 2 }}>{r.salon} · {new Date(r.date).toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' })} à {r.heure} · {r.duree}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#E535AB' }}>{r.prix}€</p>
                  <span style={{ fontSize: 10, color: '#888', fontFamily: 'monospace' }}>{r.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique récent */}
      {rdvPasses.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Historique récent</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rdvPasses.map(r => (
              <div key={r.id} style={{ background: '#FAFAFA', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DS.ink }}>{r.prestation} — {r.salon}</p>
                  <p style={{ fontSize: 11, color: DS.muted }}>{new Date(r.date).toLocaleDateString('fr-FR')} · {r.prix}€</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: 10 }}>✓ Terminé</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero recherche */}
      <div style={{ background: 'linear-gradient(135deg, #2D0A22 0%, #6B0F3A 60%, #B5006E 100%)', borderRadius: 16, padding: '28px 24px', color: '#fff' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Coiffure & Beauté</p>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18 }}>Réserver un nouveau RDV</h2>
        <div style={{ background: '#fff', borderRadius: 12, padding: '5px 5px 5px 16px', display: 'flex', gap: 0, alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Coupe, couleur, brushing…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: DS.ink, background: 'none', fontFamily: DS.font }} />
          <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris…"
            style={{ width: 90, border: 'none', borderLeft: `1px solid ${DS.border}`, outline: 'none', fontSize: 14, color: DS.ink, background: 'none', padding: '8px 12px', fontFamily: DS.font }} />
          <button onClick={() => navigate('/coiffure')}
            style={{ background: '#E535AB', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: DS.font }}>
            Chercher
          </button>
        </div>
      </div>

      {/* Salons à proximité */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>Salons à proximité</p>
          <button onClick={() => navigate('/coiffure')} style={{ background: 'none', border: 'none', fontSize: 13, color: DS.accent, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>Voir tout →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SALONS_DEMO.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 800, flexShrink: 0 }}>{s.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{s.nom}</p>
                <p style={{ fontSize: 11.5, color: DS.muted, marginTop: 2 }}>{s.ville} · ★ {s.note} ({s.avis}) · {s.prix}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#1A7A3C', marginBottom: 6 }}>{s.dispo}</p>
                <button onClick={() => navigate('/coiffure')}
                  style={{ padding: '7px 14px', background: DS.ink, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>Réserver</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Restaurant Tab ───────────────────────────────────────────────────────────

const RESTOS_DEMO = [
  { nom: 'Trattoria Genovese', type: 'Italien',    ville: 'Paris 11e', note: 4.9, avis: 312, prixMin: 14, dispo: true,  grad: 'linear-gradient(140deg,#E8C8A0,#C8A070)', initials: 'TG' },
  { nom: 'Sakura Sushi',       type: 'Sushi',      ville: 'Paris 3e',  note: 4.8, avis: 189, prixMin: 18, dispo: true,  grad: 'linear-gradient(140deg,#E8A0B0,#C87090)', initials: 'SS' },
  { nom: 'Big Smoke Burgers',  type: 'Burger',     ville: 'Paris 18e', note: 4.7, avis: 278, prixMin: 12, dispo: true,  grad: 'linear-gradient(140deg,#E8B870,#C89040)', initials: 'BS' },
];

const MES_RESAS_RESTO = [
  { id:1, restaurant:'Trattoria Genovese', date:'2026-04-05', heure:'20:00', personnes:2, montant:0, statut:'a_venir', code:'FRE-4812' },
  { id:2, restaurant:'Sakura Sushi', date:'2026-04-10', heure:'19:30', personnes:4, montant:0, statut:'a_venir', code:'FRE-5923' },
  { id:3, restaurant:'Big Smoke Burgers', date:'2026-03-28', heure:'12:30', personnes:2, montant:48, statut:'termine', code:'FRE-2741' },
  { id:4, restaurant:'Trattoria Genovese', date:'2026-03-15', heure:'20:00', personnes:3, montant:92, statut:'termine', code:'FRE-1630' },
];

function RestaurantTab({ navigate }) {
  const [q, setQ] = useState('');
  const [ville, setVille] = useState('');
  const resaAVenir = MES_RESAS_RESTO.filter(r => r.statut === 'a_venir');
  const resaPassees = MES_RESAS_RESTO.filter(r => r.statut === 'termine');

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Réservations à venir */}
      {resaAVenir.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Mes réservations à venir</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resaAVenir.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 14, border: '2px solid #F9731630', padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🍽️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{r.restaurant}</p>
                  <p style={{ fontSize: 12, color: DS.muted, marginTop: 2 }}>{new Date(r.date).toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' })} à {r.heure} · {r.personnes} pers.</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#F97316', background: '#FEF3C7', padding: '3px 8px', borderRadius: 10 }}>À venir</span>
                  <p style={{ fontSize: 10, color: '#888', fontFamily: 'monospace', marginTop: 4 }}>{r.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commandes passées */}
      {resaPassees.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Commandes récentes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {resaPassees.map(r => (
              <div key={r.id} style={{ background: '#FAFAFA', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DS.ink }}>{r.restaurant}</p>
                  <p style={{ fontSize: 11, color: DS.muted }}>{new Date(r.date).toLocaleDateString('fr-FR')} · {r.personnes} pers. · {r.montant}€</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: 10 }}>✓ Terminé</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero recherche */}
      <div style={{ background: 'linear-gradient(135deg, #1A0800 0%, #5C2800 60%, #FF6000 100%)', borderRadius: 16, padding: '28px 24px', color: '#fff' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Gastronomie</p>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18 }}>Commander ou réserver</h2>
        <div style={{ background: '#fff', borderRadius: 12, padding: '5px 5px 5px 16px', display: 'flex', gap: 0, alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pizza, sushi, burger…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: DS.ink, background: 'none', fontFamily: DS.font }} />
          <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris…"
            style={{ width: 90, border: 'none', borderLeft: `1px solid ${DS.border}`, outline: 'none', fontSize: 14, color: DS.ink, background: 'none', padding: '8px 12px', fontFamily: DS.font }} />
          <button onClick={() => navigate('/restaurant')}
            style={{ background: '#FF6000', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: DS.font }}>Chercher</button>
        </div>
      </div>

      {/* Restaurants */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>Restaurants à proximité</p>
          <button onClick={() => navigate('/restaurant')} style={{ background: 'none', border: 'none', fontSize: 13, color: DS.accent, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>Voir tout →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RESTOS_DEMO.map((r, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: r.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 800, flexShrink: 0 }}>{r.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{r.nom}</p>
                <p style={{ fontSize: 11.5, color: DS.muted, marginTop: 2 }}>{r.type} · {r.ville} · ★ {r.note} · À partir de {r.prixMin} €</p>
              </div>
              <button onClick={() => navigate('/restaurant')}
                style={{ padding: '7px 14px', background: '#FF6000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font, flexShrink: 0 }}>Commander</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Vacances Tab ─────────────────────────────────────────────────────────────

const LOGEMENTS_DEMO = [
  { nom: 'Villa Azur · Côte d\'Azur', type: 'Villa', ville: 'Nice', note: 4.97, avis: 183, prix: 280, nuits: 3, grad: 'linear-gradient(140deg,#A0C8E8,#70A0C8)', initials: 'VA' },
  { nom: 'Chalet Montagne · Savoie',  type: 'Chalet', ville: 'Annecy', note: 4.88, avis: 96, prix: 195, nuits: 7, grad: 'linear-gradient(140deg,#C8E8A0,#A0C870)', initials: 'CM' },
  { nom: 'Appartement Haussmann',     type: 'Appartement', ville: 'Paris 8e', note: 4.82, avis: 241, prix: 120, nuits: 2, grad: 'linear-gradient(140deg,#E8D0A0,#C8B070)', initials: 'AH' },
];

const MES_SEJOURS = [
  { id:1, logement:'Villa Azur · Côte d\'Azur', arrivee:'2026-04-15', depart:'2026-04-20', nuits:5, voyageurs:2, prix:1400, statut:'a_venir', code:'FRV-4812' },
  { id:2, logement:'Chalet Montagne · Savoie', arrivee:'2026-02-10', depart:'2026-02-17', nuits:7, voyageurs:4, prix:1365, statut:'termine', code:'FRV-2741' },
  { id:3, logement:'Appartement Haussmann · Paris', arrivee:'2026-01-05', depart:'2026-01-07', nuits:2, voyageurs:2, prix:240, statut:'termine', code:'FRV-1630' },
];

function VacancesTab({ navigate }) {
  const [dest, setDest] = useState('');
  const [voyageurs, setVoyageurs] = useState(2);
  const sejoursAVenir = MES_SEJOURS.filter(s => s.statut === 'a_venir');
  const sejoursPasses = MES_SEJOURS.filter(s => s.statut === 'termine');

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Séjours à venir */}
      {sejoursAVenir.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Mes séjours à venir</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sejoursAVenir.map(s => (
              <div key={s.id} style={{ background: '#fff', borderRadius: 14, border: '2px solid #0080FF30', padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E8F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏖️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{s.logement}</p>
                  <p style={{ fontSize: 12, color: DS.muted, marginTop: 2 }}>{new Date(s.arrivee).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })} → {new Date(s.depart).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })} · {s.nuits} nuits · {s.voyageurs} voyageurs</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0080FF' }}>{s.prix}€</p>
                  <span style={{ fontSize: 10, color: '#888', fontFamily: 'monospace' }}>{s.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Séjours passés */}
      {sejoursPasses.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Séjours passés</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sejoursPasses.map(s => (
              <div key={s.id} style={{ background: '#FAFAFA', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DS.ink }}>{s.logement}</p>
                  <p style={{ fontSize: 11, color: DS.muted }}>{new Date(s.arrivee).toLocaleDateString('fr-FR')} → {new Date(s.depart).toLocaleDateString('fr-FR')} · {s.nuits} nuits · {s.prix}€</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: 10 }}>✓ Terminé</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero recherche */}
      <div style={{ background: 'linear-gradient(135deg, #001A33 0%, #003D7A 60%, #0080FF 100%)', borderRadius: 16, padding: '28px 24px', color: '#fff' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hébergements</p>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18 }}>Réserver un logement</h2>
        <div style={{ background: '#fff', borderRadius: 12, padding: '5px 5px 5px 16px', display: 'flex', gap: 0, alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', flexWrap: 'wrap' }}>
          <input value={dest} onChange={e => setDest(e.target.value)} placeholder="Destination : Paris, Nice, Bordeaux…"
            style={{ flex: 1, minWidth: 140, border: 'none', outline: 'none', fontSize: 14, color: DS.ink, background: 'none', fontFamily: DS.font }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: `1px solid ${DS.border}`, padding: '8px 14px' }}>
            <button onClick={() => setVoyageurs(Math.max(1, voyageurs - 1))} style={{ width: 24, height: 24, borderRadius: '50%', border: `1px solid ${DS.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>−</button>
            <span style={{ fontSize: 13, color: DS.ink, minWidth: 60, textAlign: 'center' }}>{voyageurs} voyageur{voyageurs > 1 ? 's' : ''}</span>
            <button onClick={() => setVoyageurs(voyageurs + 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: `1px solid ${DS.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>+</button>
          </div>
          <button onClick={() => navigate('/vacances')}
            style={{ background: '#0080FF', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: DS.font }}>Rechercher</button>
        </div>
      </div>

      {/* Logements */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>Logements populaires</p>
          <button onClick={() => navigate('/vacances')} style={{ background: 'none', border: 'none', fontSize: 13, color: DS.accent, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>Voir tout →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LOGEMENTS_DEMO.map((l, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${DS.border}`, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: l.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 800, flexShrink: 0 }}>{l.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: DS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.nom}</p>
                <p style={{ fontSize: 11.5, color: DS.muted, marginTop: 2 }}>{l.type} · {l.ville} · ★ {l.note} ({l.avis})</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: DS.ink }}>{l.prix} €<span style={{ fontSize: 11, fontWeight: 400, color: DS.muted }}> /nuit</span></p>
                <button onClick={() => navigate('/vacances')}
                  style={{ marginTop: 6, padding: '6px 12px', background: '#0080FF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>Réserver</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
