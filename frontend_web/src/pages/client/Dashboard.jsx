import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DS from '../../design/ds';
import { useAuth } from '../../context/AuthContext';
import InvestirJugeModule from '../../components/immo/InvestirJugeModule';

const STORAGE_BIEN = 'freample_mon_bien';

const TABS = [
  { id: 'projets', label: 'Suivi de projets', icon: '📋' },
  { id: 'paiements', label: 'Paiements', icon: '💳' },
  { id: 'messagerie', label: 'Messagerie', icon: '💬' },
  { id: 'favoris', label: 'Artisans favoris', icon: '⭐' },
  { id: 'bien', label: 'Mon bien', icon: '🏠' },
  { id: 'investir', label: 'Investir', icon: '📊' },
  { id: 'profil', label: 'Mon profil', icon: '👤' },
];

const STATUT_PROJET = {
  publie: { label: 'Publié', color: '#2563EB', bg: '#EFF6FF' },
  en_cours: { label: 'En cours', color: '#D97706', bg: '#FFFBEB' },
  termine: { label: 'Terminé', color: '#16A34A', bg: '#F0FDF4' },
  annule: { label: 'Annulé', color: '#DC2626', bg: '#FEF2F2' },
};

const DEMO_PROJETS = [
  { id: 1, metier: 'Plomberie', titre: 'Rénovation salle de bain', description: 'Douche à l\'italienne, nouveau carrelage, meuble vasque.', ville: 'Nice', budget: 3500, commission: null, urgence: 'normal', statut: 'publie', date: '2026-04-06', nbOffres: 2 },
  { id: 2, metier: 'Peinture', titre: 'Peinture salon + chambre', description: 'Peinture complète 2 pièces, murs et plafonds.', ville: 'Nice', budget: 1200, commission: null, urgence: 'flexible', statut: 'en_cours', date: '2026-03-28', nbOffres: 3, artisan: 'Sophie Duval' },
  { id: 3, metier: 'Électricité', titre: 'Mise aux normes tableau', description: 'Remplacement tableau électrique vétuste.', ville: 'Antibes', budget: 800, commission: null, urgence: 'urgent', statut: 'termine', date: '2026-03-15', nbOffres: 1, artisan: 'Marc Lambert' },
];

const STATUT_PAIEMENT = {
  acompte_bloque: { label: 'Acompte bloqué (30%)', color: '#2563EB', bg: '#EFF6FF', icon: '🔒' },
  en_cours: { label: 'Travaux en cours', color: '#D97706', bg: '#FFFBEB', icon: '🏗️' },
  validation: { label: 'En attente de validation', color: '#8B5CF6', bg: '#F5F3FF', icon: '✋' },
  libere: { label: 'Paiement libéré', color: '#16A34A', bg: '#F0FDF4', icon: '✓' },
  litige: { label: 'Litige en cours', color: '#DC2626', bg: '#FEF2F2', icon: '⚠️' },
};

const DEMO_PAIEMENTS = [
  { id: 1, projetTitre: 'Peinture salon + chambre', artisan: 'Sophie Duval', montant: 1200, acompte: 360, solde: 840, commission: 12, fraisPaiement: 2, total: 1214, date: '2026-04-02', statut: 'validation', dateLimiteValidation: '2026-04-09' },
  { id: 2, projetTitre: 'Mise aux normes tableau', artisan: 'Marc Lambert', montant: 800, acompte: 240, solde: 560, commission: 8, fraisPaiement: 1.80, total: 809.80, date: '2026-03-20', statut: 'libere', dateValidation: '2026-03-25' },
  { id: 3, projetTitre: 'Rénovation salle de bain', artisan: 'Lucas Garcia', montant: 3500, acompte: 1050, solde: 2450, commission: 35, fraisPaiement: 2, total: 3537, date: '2026-04-06', statut: 'en_cours' },
];

const DEMO_FAVORIS = [
  { id: 1, nom: 'Lucas Garcia', metier: 'Plomberie', ville: 'Nice', note: 4.8, nbAvis: 47 },
  { id: 2, nom: 'Sophie Duval', metier: 'Peinture', ville: 'Antibes', note: 4.7, nbAvis: 31 },
  { id: 3, nom: 'Marc Lambert', metier: 'Électricité', ville: 'Nice', note: 4.9, nbAvis: 62 },
];

const DEMO_MESSAGES = [
  { id: 1, artisan: 'Sophie Duval', dernier: 'Très bien, on commence lundi !', date: '2026-04-05', unread: 0 },
  { id: 2, artisan: 'Lucas Garcia', dernier: 'Je peux passer demain matin pour le devis.', date: '2026-04-06', unread: 1 },
];

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };

export default function DashboardClient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('projets');
  const [projets, setProjets] = useState([]);
  const [paiements, setPaiements] = useState(DEMO_PAIEMENTS);
  const [favoris, setFavoris] = useState([]);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [monBien, setMonBien] = useState(() => { try { return JSON.parse(localStorage.getItem(STORAGE_BIEN)) || null; } catch { return null; } });
  const [bienForm, setBienForm] = useState({});
  const [bienEdit, setBienEdit] = useState(false);
  const [estimLoading, setEstimLoading] = useState(false);
  const [estimResult, setEstimResult] = useState(null);
  // Données pour InvestirJugeModule (partagées avec l'onglet investir)
  const [immoData, setImmoData] = useState(() => { try { return JSON.parse(localStorage.getItem('freample_immo_data')) || { scis: [], biens: monBien ? [monBien] : [], dossiers: [], nextId: 10 }; } catch { return { scis: [], biens: [], dossiers: [], nextId: 10 }; } });

  const prenom = user?.nom?.split(' ')[0] || 'vous';

  useEffect(() => {
    // Charger projets depuis localStorage + API
    try {
      const local = JSON.parse(localStorage.getItem('freample_projets') || '[]');
      setProjets(local.length > 0 ? local : DEMO_PROJETS);
    } catch { setProjets(DEMO_PROJETS); }
    api.get('/projets/mes-projets').then(({ data }) => { if (data.projets?.length) setProjets(data.projets); }).catch(() => {});

    // Charger favoris
    try {
      const fav = JSON.parse(localStorage.getItem('freample_favoris') || '[]');
      setFavoris(fav.length > 0 ? fav : DEMO_FAVORIS);
    } catch { setFavoris(DEMO_FAVORIS); }
  }, []);

  // Persister mon bien
  useEffect(() => { if (monBien) localStorage.setItem(STORAGE_BIEN, JSON.stringify(monBien)); }, [monBien]);
  useEffect(() => { localStorage.setItem('freample_immo_data', JSON.stringify(immoData)); }, [immoData]);

  // Prix moyens par département (données INSEE/Notaires 2024, €/m²)
  const PRIX_M2_DEPT = {
    '06':4800,'13':3200,'31':3100,'33':3500,'34':3000,'38':2600,'44':3400,'59':2200,'67':2800,'69':3800,
    '75':10500,'76':2100,'77':3200,'78':4200,'91':3000,'92':6500,'93':3800,'94':5000,'95':3200,
    '83':3600,'84':2400,'01':2800,'02':1600,'03':1200,'04':2200,'05':2000,'07':1800,'08':1100,
    '09':1400,'10':1300,'11':1700,'12':1400,'14':2200,'15':1200,'16':1300,'17':2200,'18':1200,
    '19':1300,'21':2000,'22':1800,'23':900,'24':1500,'25':2000,'26':2200,'27':1800,'28':1700,
    '29':2000,'2A':2800,'2B':2600,'30':2200,'32':1200,'35':2800,'36':1100,'37':2200,'39':1500,
    '40':2000,'41':1500,'42':1800,'43':1400,'45':1800,'46':1400,'47':1400,'48':1200,'49':2200,
    '50':1700,'51':1800,'52':1000,'53':1500,'54':1800,'55':1000,'56':2400,'57':1600,'58':1100,
    '60':2200,'61':1200,'62':1800,'63':2000,'64':2600,'65':1600,'66':2200,'68':2200,'70':1100,
    '71':1400,'72':1500,'73':3200,'74':4200,'79':1400,'80':1800,'81':1600,'82':1400,'85':2200,
    '86':1500,'87':1400,'88':1100,'89':1300,'90':1500,'971':2800,'972':2600,'973':2000,'974':2400,
  };

  const estimerPrix = async () => {
    const adresse = bienForm.adresse;
    const surface = Number(bienForm.surface);
    if (!adresse || !surface) { setEstimResult({ erreur: 'Adresse et surface requises' }); return; }
    setEstimLoading(true); setEstimResult(null);
    try {
      // 1. Géocoder l'adresse
      const geoR = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`);
      const geoJ = await geoR.json();
      if (!geoJ.features?.length) { setEstimResult({ erreur: 'Adresse non trouvée' }); setEstimLoading(false); return; }
      const [lon, lat] = geoJ.features[0].geometry.coordinates;
      const commune = geoJ.features[0].properties.city;
      const codeInsee = geoJ.features[0].properties.citycode;
      const dept = codeInsee.slice(0, 2) === '97' ? codeInsee.slice(0, 3) : codeInsee.slice(0, 2);
      const codePostal = geoJ.features[0].properties.postcode;

      // 2. Tenter les APIs DVF (avec timeout court)
      const ventes = [];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const dvfR = await fetch(`https://apidf-preprod.cerema.fr/dvf_opendata/mutations?code_insee=${codeInsee}&nature_mutation=Vente&page_size=100`, { signal: controller.signal });
        const dvfJ = await dvfR.json();
        (dvfJ.results || []).forEach(m => {
          if (m.valeur_fonciere > 0) {
            (m.locaux || []).forEach(l => { if (l.surface_reelle_bati > 0) ventes.push({ vf: m.valeur_fonciere, surf: l.surface_reelle_bati }); });
          }
        });
      } catch {} finally { clearTimeout(timeout); }

      let prixM2, source, nbRef;

      if (ventes.length >= 5) {
        // DVF disponible — calcul précis
        const prixM2List = ventes.map(v => v.vf / v.surf).filter(p => p > 500 && p < 25000).sort((a, b) => a - b);
        if (prixM2List.length >= 3) {
          prixM2 = Math.round(prixM2List[Math.floor(prixM2List.length / 2)]);
          source = 'DVF (ventes réelles)';
          nbRef = prixM2List.length;
        }
      }

      if (!prixM2) {
        // Fallback : prix moyen départemental (données notaires)
        prixM2 = PRIX_M2_DEPT[dept] || 2500;
        source = 'Données notaires départementales';
        nbRef = 0;
      }

      const prixEstime = Math.round(prixM2 * surface);
      const prixBas = Math.round(prixM2 * 0.85 * surface);
      const prixHaut = Math.round(prixM2 * 1.15 * surface);

      setBienForm(f => ({ ...f, valeur: String(prixEstime) }));
      setEstimResult({ prixEstime, prixM2, prixBas, prixHaut, commune, dept, codePostal, nbReferences: nbRef, source });
    } catch (err) { setEstimResult({ erreur: 'Erreur lors de l\'estimation. Vérifiez l\'adresse.' }); }
    setEstimLoading(false);
  };

  const sauverBien = () => {
    const b = { id: 1, nom: bienForm.nom || 'Ma maison', adresse: bienForm.adresse || '', surface: Number(bienForm.surface) || 0, pieces: Number(bienForm.pieces) || 0, valeur: Number(bienForm.valeur) || 0, dpe: bienForm.dpe || 'D', anneeAchat: bienForm.anneeAchat || '', prixAchat: Number(bienForm.prixAchat) || 0, creditMensuel: Number(bienForm.creditMensuel) || 0, taxeFonciere: Number(bienForm.taxeFonciere) || 0, assurance: Number(bienForm.assurance) || 0, travaux: [] };
    setMonBien(b);
    setImmoData(d => ({ ...d, biens: [b] }));
    setBienEdit(false);
  };

  const removeFavori = (id) => {
    const updated = favoris.filter(f => f.id !== id);
    setFavoris(updated);
    localStorage.setItem('freample_favoris', JSON.stringify(updated));
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [projetOpen, setProjetOpen] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font }}>
      {/* Header */}
      <div style={{ background: '#2C2520', padding: '0 clamp(20px,4vw,40px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Burger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 6 }}>
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 900, color: '#F5EFE0', fontFamily: DS.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: '#A68B4B' }}>.</span>
          </button>
        </div>
        <div style={{ color: '#F5EFE0', fontSize: 13, fontWeight: 500 }}>Bonjour, {prenom}</div>
        <button onClick={() => navigate('/')} style={{ padding: '8px 20px', background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font }}>
          + Nouveau projet
        </button>
      </div>

      {/* Sidebar mobile */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1000, transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .3s', boxShadow: menuOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${DS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Mon espace</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: DS.muted }}>×</button>
        </div>
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }}
              style={{ width: '100%', padding: '12px 20px', background: tab === t.id ? '#F8F7F4' : 'none', border: 'none', borderLeft: `3px solid ${tab === t.id ? '#2C2520' : 'transparent'}`, cursor: 'pointer', fontFamily: DS.font, fontSize: 14, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? DS.ink : DS.muted, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .1s' }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = '#FAFAF8'; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'none'; }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={() => { setMenuOpen(false); navigate('/'); }} style={{ width: '100%', padding: '10px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>📋 Proposer un projet</button>
          <button onClick={() => { setMenuOpen(false); navigate('/btp'); }} style={{ width: '100%', padding: '10px', background: 'transparent', color: DS.ink, border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>🔍 Trouver un artisan</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px clamp(20px,4vw,40px)' }}>

        {/* ═══ SUIVI DE PROJETS ═══ */}
        {tab === 'projets' && (() => {
          const PIPELINE = [
            { id: 'publie', label: 'Publié', icon: '📋', color: '#2563EB' },
            { id: 'en_cours', label: 'En cours', icon: '🏗️', color: '#D97706' },
            { id: 'termine', label: 'Terminé', icon: '✅', color: '#16A34A' },
          ];
          const saveEdit = (id) => {
            const updated = projets.map(p => p.id === id ? { ...p, ...editForm } : p);
            setProjets(updated);
            localStorage.setItem('freample_projets', JSON.stringify(updated));
            setEditMode(false);
          };
          const removeProjet = (id) => {
            if (!window.confirm('Retirer ce projet ?')) return;
            const updated = projets.filter(x => x.id !== id);
            setProjets(updated);
            localStorage.setItem('freample_projets', JSON.stringify(updated));
            setProjetOpen(null);
          };

          return <div>
            {/* KPI rapides */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {PIPELINE.map(s => {
                const count = projets.filter(p => p.statut === s.id).length;
                return <div key={s.id} style={{ ...CARD, textAlign: 'center', borderTop: `3px solid ${s.color}`, cursor: 'pointer' }}
                  onClick={() => {}}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{count}</div>
                  <div style={{ fontSize: 12, color: DS.muted, marginTop: 2 }}>{s.icon} {s.label}</div>
                </div>;
              })}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>Mes projets</h2>
            {projets.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aucun projet</div>
                <div style={{ fontSize: 13, color: DS.muted, marginBottom: 16 }}>Publiez votre premier projet pour recevoir des offres d'artisans.</div>
                <button onClick={() => navigate('/')} style={BTN}>Proposer un projet</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projets.map(p => {
                  const st = STATUT_PROJET[p.statut] || STATUT_PROJET.publie;
                  const isOpen = projetOpen === p.id;
                  return (
                    <div key={p.id}>
                      <div onClick={() => setProjetOpen(isOpen ? null : p.id)}
                        style={{ ...CARD, cursor: 'pointer', borderLeft: `4px solid ${st.color}`, transition: 'all .15s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span style={{ fontSize: 14, fontWeight: 700 }}>{p.metier} — {p.titre || p.description?.slice(0, 40)}</span>
                              <span style={{ fontSize: 9, fontWeight: 700, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 6 }}>{st.label}</span>
                            </div>
                            <div style={{ fontSize: 11, color: DS.muted }}>📍 {p.ville} · 💰 {p.budget || '?'}€ · {new Date(p.date || p.created_at).toLocaleDateString('fr-FR')}</div>
                          </div>
                          <div style={{ fontSize: 12, color: isOpen ? '#2C2520' : DS.muted }}>{isOpen ? '▼' : '▶'}</div>
                        </div>
                      </div>

                      {/* Détail ouvert */}
                      {isOpen && (
                        <div style={{ background: '#fff', border: `1px solid ${DS.border}`, borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '16px 20px' }}>
                          {/* Barre de progression */}
                          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                            {PIPELINE.map((s, i) => {
                              const pIdx = PIPELINE.findIndex(x => x.id === p.statut);
                              const done = i <= pIdx;
                              return <div key={s.id} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ height: 4, borderRadius: 2, background: done ? s.color : '#E5E7EB', marginBottom: 4, transition: 'background .3s' }} />
                                <span style={{ fontSize: 9, fontWeight: 600, color: done ? s.color : DS.muted }}>{s.icon} {s.label}</span>
                              </div>;
                            })}
                          </div>

                          {!editMode ? (() => {
                            // Charger les offres pour ce projet
                            const allOffres = (() => { try { return JSON.parse(localStorage.getItem('freample_offres') || '[]'); } catch { return []; } })();
                            const offres = allOffres.filter(o => o.projetId === p.id);
                            const devis = (() => { try { return JSON.parse(localStorage.getItem('freample_devis') || '[]'); } catch { return []; } })().filter(d => d.projetId === p.id);

                            const accepterOffre = (offre) => {
                              // Mettre à jour le projet
                              const updated = projets.map(x => x.id === p.id ? { ...x, statut: 'en_cours', artisan: offre.artisanNom, nbOffres: offres.length } : x);
                              setProjets(updated);
                              localStorage.setItem('freample_projets', JSON.stringify(updated));
                              // Marquer l'offre comme acceptée
                              const updOffres = allOffres.map(o => o.id === offre.id ? { ...o, statut: 'acceptee' } : o.projetId === p.id ? { ...o, statut: 'refusee' } : o);
                              localStorage.setItem('freample_offres', JSON.stringify(updOffres));
                            };

                            return <>
                            {/* Infos */}
                            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6, marginBottom: 12 }}>{p.description}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                              {[['Métier', p.metier], ['Ville', p.ville], ['Budget', `${p.budget || '?'}€`], ['Urgence', p.urgence === 'urgent' ? '🚨 Urgent' : p.urgence === 'flexible' ? '🕐 Flexible' : '📅 Normal']].map(([k, v]) => (
                                <div key={k} style={{ background: '#F8F7F4', padding: '6px 10px', borderRadius: 6, fontSize: 11 }}>
                                  <span style={{ color: DS.muted }}>{k} : </span><strong>{v}</strong>
                                </div>
                              ))}
                            </div>
                            {p.artisan && <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, marginBottom: 8 }}>🔨 Artisan assigné : {p.artisan}</div>}

                            {/* Offres reçues */}
                            {offres.length > 0 && (
                              <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#2563EB' }}>📩 {offres.length} offre{offres.length > 1 ? 's' : ''} reçue{offres.length > 1 ? 's' : ''}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {offres.map(o => (
                                    <div key={o.id} style={{ background: '#F8F7F4', borderRadius: 10, padding: '12px 14px', border: o.statut === 'acceptee' ? '2px solid #16A34A' : `1px solid ${DS.border}` }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div>
                                          <div style={{ fontSize: 13, fontWeight: 700 }}>🔨 {o.artisanNom}</div>
                                          <div style={{ fontSize: 11, color: DS.muted }}>{o.date ? `Disponible le ${new Date(o.date).toLocaleDateString('fr-FR')}` : ''}{o.delai ? ` · ${o.delai} jours` : ''}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                          <div style={{ fontSize: 17, fontWeight: 800, color: '#2C2520' }}>{Number(o.prix).toLocaleString('fr-FR')} €</div>
                                          {o.statut === 'acceptee' && <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '2px 6px', borderRadius: 4 }}>✓ Acceptée</span>}
                                          {o.statut === 'refusee' && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '2px 6px', borderRadius: 4 }}>Refusée</span>}
                                        </div>
                                      </div>
                                      {o.message && <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5, marginBottom: 8, fontStyle: 'italic' }}>"{o.message}"</div>}
                                      {(!o.statut || o.statut === 'proposee') && p.statut === 'publie' && (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                          <button onClick={() => accepterOffre(o)}
                                            style={{ padding: '7px 14px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓ Accepter cette offre</button>
                                          <button onClick={() => { const upd = allOffres.map(x => x.id === o.id ? { ...x, statut: 'refusee' } : x); localStorage.setItem('freample_offres', JSON.stringify(upd)); setProjets([...projets]); }}
                                            style={{ padding: '7px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Refuser</button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Devis reçus */}
                            {devis.length > 0 && (
                              <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#A68B4B' }}>📋 {devis.length} devis reçu{devis.length > 1 ? 's' : ''}</div>
                                {devis.map(d => (
                                  <div key={d.id} style={{ background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                      <div style={{ fontSize: 12, fontWeight: 600 }}>Devis de {d.client || 'Artisan'}</div>
                                      <div style={{ fontSize: 15, fontWeight: 800 }}>{d.ttc?.toLocaleString('fr-FR') || '?'} € TTC</div>
                                    </div>
                                    {d.lignes?.map((l, i) => (
                                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: DS.muted, padding: '2px 0' }}>
                                        <span>{l.desc || l.description}</span>
                                        <span>{(l.qte || l.quantite || 1)} × {(l.pu || l.prixUnitaireHT || 0)}€</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}

                            {offres.length === 0 && devis.length === 0 && p.statut === 'publie' && (
                              <div style={{ padding: '12px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid rgba(217,119,6,0.15)', fontSize: 12, color: '#92400E', marginBottom: 12 }}>
                                ⏳ En attente d'offres — les artisans de votre zone verront votre projet et vous enverront leurs propositions.
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              <button onClick={() => { setEditForm({ metier: p.metier, description: p.description, ville: p.ville, budget: p.budget, urgence: p.urgence }); setEditMode(true); }}
                                style={{ padding: '8px 16px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✏️ Modifier</button>
                              <button onClick={() => removeProjet(p.id)}
                                style={{ padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Retirer</button>
                            </div>
                          </>; })() : <>
                            {/* Formulaire de modification */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 10, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 3 }}>Description</label><textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: DS.font }} /></div>
                              <div><label style={{ fontSize: 10, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 3 }}>Ville</label><input value={editForm.ville || ''} onChange={e => setEditForm(f => ({ ...f, ville: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} /></div>
                              <div><label style={{ fontSize: 10, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 3 }}>Budget (€)</label><input type="number" value={editForm.budget || ''} onChange={e => setEditForm(f => ({ ...f, budget: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} /></div>
                              <div><label style={{ fontSize: 10, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 3 }}>Urgence</label><select value={editForm.urgence || 'normal'} onChange={e => setEditForm(f => ({ ...f, urgence: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}><option value="urgent">Urgent</option><option value="normal">Normal</option><option value="flexible">Flexible</option></select></div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                              <button onClick={() => saveEdit(p.id)} style={{ padding: '8px 16px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✓ Enregistrer</button>
                              <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', background: '#F2F2F7', color: DS.muted, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                            </div>
                          </>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>;
        })()}

        {/* ═══ PAIEMENTS — SÉQUESTRE ═══ */}
        {tab === 'paiements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Paiements sécurisés</h2>
            </div>

            {/* Explication séquestre */}
            <div style={{ ...CARD, marginBottom: 16, borderLeft: '4px solid #2563EB', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Paiement sécurisé par séquestre</div>
                <div style={{ fontSize: 12, color: DS.muted, lineHeight: 1.6 }}>
                  Vos paiements sont bloqués sur un compte sécurisé (GoCardless). L'artisan ne reçoit les fonds qu'après votre validation. En cas de litige, Freample intervient comme arbitre.
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: DS.muted }}>
                  <span>🔒 30% bloqué au démarrage</span>
                  <span>✓ 70% libéré après validation</span>
                  <span>⏱️ Auto-libéré après 7 jours</span>
                </div>
              </div>
            </div>

            {paiements.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48, color: DS.muted }}>Aucun paiement pour le moment.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paiements.map(p => {
                  const st = STATUT_PAIEMENT[p.statut] || STATUT_PAIEMENT.en_cours;
                  return (
                    <div key={p.id} style={{ ...CARD, borderLeft: `4px solid ${st.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{p.projetTitre}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 6 }}>{st.icon} {st.label}</span>
                          </div>
                          <div style={{ fontSize: 12, color: DS.muted }}>🔨 {p.artisan} · {new Date(p.date).toLocaleDateString('fr-FR')}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{p.total}€</div>
                          <div style={{ fontSize: 10, color: DS.muted }}>total TTC</div>
                        </div>
                      </div>

                      {/* Barre de progression paiement */}
                      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                        <div style={{ flex: 30, height: 6, borderRadius: 3, background: ['acompte_bloque', 'en_cours', 'validation', 'libere'].includes(p.statut) ? '#2563EB' : '#E5E7EB' }} />
                        <div style={{ flex: 70, height: 6, borderRadius: 3, background: p.statut === 'libere' ? '#16A34A' : p.statut === 'validation' ? '#8B5CF6' : '#E5E7EB' }} />
                      </div>

                      {/* Détail */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
                        <div style={{ background: '#F8F7F4', padding: '6px 10px', borderRadius: 6 }}>
                          <span style={{ color: DS.muted }}>Acompte (30%)</span> <strong>{p.acompte}€</strong>
                        </div>
                        <div style={{ background: '#F8F7F4', padding: '6px 10px', borderRadius: 6 }}>
                          <span style={{ color: DS.muted }}>Solde (70%)</span> <strong>{p.solde}€</strong>
                        </div>
                        <div style={{ background: '#F8F7F4', padding: '6px 10px', borderRadius: 6 }}>
                          <span style={{ color: DS.muted }}>Commission</span> <strong>{p.commission}€</strong>
                        </div>
                        <div style={{ background: '#F8F7F4', padding: '6px 10px', borderRadius: 6 }}>
                          <span style={{ color: DS.muted }}>Frais paiement</span> <strong>{p.fraisPaiement}€</strong>
                        </div>
                      </div>

                      {/* Actions selon statut */}
                      {p.statut === 'validation' && (
                        <div style={{ marginTop: 12, padding: '12px 14px', background: '#F5F3FF', borderRadius: 10, border: '1px solid rgba(139,92,246,0.15)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6', marginBottom: 6 }}>✋ Les travaux sont terminés ?</div>
                          <div style={{ fontSize: 12, color: DS.muted, marginBottom: 10 }}>
                            Confirmez la bonne exécution pour libérer le paiement à {p.artisan}.
                            {p.dateLimiteValidation && <span> Auto-libération le {new Date(p.dateLimiteValidation).toLocaleDateString('fr-FR')}.</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => {
                              setPaiements(prev => prev.map(x => x.id === p.id ? { ...x, statut: 'libere', dateValidation: new Date().toISOString() } : x));
                            }} style={{ padding: '8px 18px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              ✓ Valider — Libérer le paiement
                            </button>
                            <button onClick={() => {
                              setPaiements(prev => prev.map(x => x.id === p.id ? { ...x, statut: 'litige' } : x));
                            }} style={{ padding: '8px 18px', background: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Signaler un problème
                            </button>
                          </div>
                        </div>
                      )}

                      {p.statut === 'libere' && (
                        <div style={{ marginTop: 10, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
                          ✓ Paiement libéré à {p.artisan}{p.dateValidation ? ` le ${new Date(p.dateValidation).toLocaleDateString('fr-FR')}` : ''}
                        </div>
                      )}

                      {p.statut === 'litige' && (
                        <div style={{ marginTop: 10, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
                          ⚠️ Litige en cours — Freample analyse les preuves (photos, devis, messages) et vous recontactera sous 48h.
                        </div>
                      )}

                      {p.statut === 'en_cours' && (
                        <div style={{ marginTop: 10, fontSize: 12, color: '#D97706' }}>
                          🏗️ Travaux en cours — l'acompte de {p.acompte}€ est bloqué sur le compte séquestre.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ MESSAGERIE ═══ */}
        {tab === 'messagerie' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Messagerie</h2>
            {messages.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48, color: DS.muted }}>Aucune conversation.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map(m => (
                  <div key={m.id} onClick={() => navigate('/client/messagerie')}
                    style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2C2520'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {m.artisan.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{m.artisan}</div>
                      <div style={{ fontSize: 12, color: DS.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.dernier}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: DS.muted }}>{new Date(m.date).toLocaleDateString('fr-FR')}</div>
                      {m.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginTop: 4 }}>{m.unread}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ARTISANS FAVORIS ═══ */}
        {tab === 'favoris' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Artisans favoris ({favoris.length})</h2>
            {favoris.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aucun favori</div>
                <div style={{ fontSize: 13, color: DS.muted, marginBottom: 16 }}>Ajoutez des artisans en favoris depuis la page de recherche.</div>
                <button onClick={() => navigate('/btp')} style={BTN}>Trouver un artisan</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {favoris.map(f => (
                  <div key={f.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                      {f.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{f.nom}</div>
                      <div style={{ fontSize: 12, color: DS.muted }}>{f.metier} · {f.ville}</div>
                      <div style={{ fontSize: 12, color: '#D97706', marginTop: 2 }}>⭐ {f.note} ({f.nbAvis} avis)</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button onClick={() => navigate(`/btp?metier=${f.metier}`)} style={{ padding: '6px 12px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Contacter</button>
                      <button onClick={() => removeFavori(f.id)} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Retirer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ MON BIEN ═══ */}
        {tab === 'bien' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Mon bien</h2>

            {!monBien || bienEdit ? (
              <div style={{ ...CARD }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>{monBien ? '✏️ Modifier mon bien' : '🏠 Renseignez votre logement'}</div>
                <p style={{ fontSize: 12, color: DS.muted, marginBottom: 16 }}>Ces informations vous aident à suivre votre patrimoine et à trouver les bons artisans.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Nom du bien</label><input value={bienForm.nom || ''} onChange={e => setBienForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ma maison, Mon appartement..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Adresse</label><input value={bienForm.adresse || ''} onChange={e => setBienForm(f => ({ ...f, adresse: e.target.value }))} placeholder="12 rue de la Liberté, 06000 Nice" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Surface (m²)</label><input type="number" value={bienForm.surface || ''} onChange={e => setBienForm(f => ({ ...f, surface: e.target.value }))} placeholder="85" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Pièces</label><input type="number" value={bienForm.pieces || ''} onChange={e => setBienForm(f => ({ ...f, pieces: e.target.value }))} placeholder="4" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Valeur estimée (€)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="number" value={bienForm.valeur || ''} onChange={e => setBienForm(f => ({ ...f, valeur: e.target.value }))} placeholder="250000" style={{ flex: 1, padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                      <button onClick={estimerPrix} disabled={estimLoading}
                        style={{ padding: '10px 16px', background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: estimLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap', opacity: estimLoading ? 0.6 : 1 }}>
                        {estimLoading ? '⏳ Analyse...' : '🔍 Estimer auto'}
                      </button>
                    </div>
                    {/* Résultat estimation */}
                    {estimResult && !estimResult.erreur && (
                      <div style={{ marginTop: 10, padding: '12px 14px', background: '#F0FDF4', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#16A34A', marginBottom: 8 }}>📊 Estimation — {estimResult.commune} ({estimResult.codePostal || estimResult.dept})</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
                          <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 6, textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: DS.muted }}>Estimation basse</div>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{estimResult.prixBas?.toLocaleString('fr-FR')} €</div>
                          </div>
                          <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 6, textAlign: 'center', border: '2px solid #16A34A' }}>
                            <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>Estimation médiane</div>
                            <div style={{ fontSize: 17, fontWeight: 800, color: '#16A34A' }}>{estimResult.prixEstime?.toLocaleString('fr-FR')} €</div>
                          </div>
                          <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 6, textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: DS.muted }}>Estimation haute</div>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{estimResult.prixHaut?.toLocaleString('fr-FR')} €</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: DS.muted, flexWrap: 'wrap' }}>
                          <span>Prix/m² : <strong>{estimResult.prixM2?.toLocaleString('fr-FR')} €</strong></span>
                          {estimResult.nbReferences > 0 && <span>{estimResult.nbReferences} ventes analysées</span>}
                          <span>Source : {estimResult.source}</span>
                        </div>
                      </div>
                    )}
                    {estimResult?.erreur && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626', padding: '8px 12px', background: '#FEF2F2', borderRadius: 6 }}>{estimResult.erreur}</div>
                    )}
                  </div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>DPE</label><select value={bienForm.dpe || 'D'} onChange={e => setBienForm(f => ({ ...f, dpe: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>{'ABCDEFG'.split('').map(d => <option key={d}>{d}</option>)}</select></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Prix d'achat (€)</label><input type="number" value={bienForm.prixAchat || ''} onChange={e => setBienForm(f => ({ ...f, prixAchat: e.target.value }))} placeholder="200000" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Année d'achat</label><input value={bienForm.anneeAchat || ''} onChange={e => setBienForm(f => ({ ...f, anneeAchat: e.target.value }))} placeholder="2020" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Crédit mensuel (€)</label><input type="number" value={bienForm.creditMensuel || ''} onChange={e => setBienForm(f => ({ ...f, creditMensuel: e.target.value }))} placeholder="850" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Taxe foncière/an (€)</label><input type="number" value={bienForm.taxeFonciere || ''} onChange={e => setBienForm(f => ({ ...f, taxeFonciere: e.target.value }))} placeholder="1200" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Assurance habitation/an (€)</label><input type="number" value={bienForm.assurance || ''} onChange={e => setBienForm(f => ({ ...f, assurance: e.target.value }))} placeholder="600" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={sauverBien} style={{ ...BTN, flex: 1 }}>Enregistrer</button>
                  {monBien && <button onClick={() => setBienEdit(false)} style={{ ...BTN, flex: 1, background: 'transparent', color: DS.ink, border: `1px solid ${DS.border}` }}>Annuler</button>}
                </div>
              </div>
            ) : (
              <div>
                {/* Fiche bien */}
                <div style={{ ...CARD, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{monBien.nom}</div>
                      <div style={{ fontSize: 13, color: DS.muted }}>📍 {monBien.adresse || '—'}</div>
                    </div>
                    <button onClick={() => { setBienForm({ ...monBien }); setBienEdit(true); }} style={{ ...BTN, padding: '6px 14px', fontSize: 11 }}>✏️ Modifier</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                    {[
                      ['Surface', `${monBien.surface || '?'} m²`],
                      ['Pièces', monBien.pieces || '?'],
                      ['DPE', monBien.dpe || '?'],
                      ['Valeur', `${(monBien.valeur || 0).toLocaleString('fr-FR')} €`],
                      ['Prix d\'achat', `${(monBien.prixAchat || 0).toLocaleString('fr-FR')} €`],
                      ['Année', monBien.anneeAchat || '?'],
                      ['Crédit/mois', `${(monBien.creditMensuel || 0).toLocaleString('fr-FR')} €`],
                      ['Taxe foncière/an', `${(monBien.taxeFonciere || 0).toLocaleString('fr-FR')} €`],
                      ['Assurance/an', `${(monBien.assurance || 0).toLocaleString('fr-FR')} €`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: '#F8F7F4', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: DS.muted }}>{k}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plus-value estimée */}
                {monBien.prixAchat > 0 && monBien.valeur > 0 && (
                  <div style={{ ...CARD, borderLeft: `4px solid ${monBien.valeur > monBien.prixAchat ? '#16A34A' : '#DC2626'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Plus-value latente</div>
                        <div style={{ fontSize: 12, color: DS.muted }}>Valeur actuelle - prix d'achat</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: monBien.valeur > monBien.prixAchat ? '#16A34A' : '#DC2626' }}>
                          {monBien.valeur > monBien.prixAchat ? '+' : ''}{(monBien.valeur - monBien.prixAchat).toLocaleString('fr-FR')} €
                        </div>
                        <div style={{ fontSize: 11, color: DS.muted }}>{monBien.prixAchat > 0 ? `${((monBien.valeur - monBien.prixAchat) / monBien.prixAchat * 100).toFixed(1)}%` : ''}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coûts annuels */}
                <div style={{ ...CARD, marginTop: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Coûts annuels</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      ['Crédit immobilier', (monBien.creditMensuel || 0) * 12],
                      ['Taxe foncière', monBien.taxeFonciere || 0],
                      ['Assurance habitation', monBien.assurance || 0],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${DS.border}`, fontSize: 13 }}>
                        <span style={{ color: DS.muted }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v.toLocaleString('fr-FR')} €</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, fontWeight: 800 }}>
                      <span>Total annuel</span>
                      <span>{((monBien.creditMensuel || 0) * 12 + (monBien.taxeFonciere || 0) + (monBien.assurance || 0)).toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                </div>

                {/* Bouton trouver artisan */}
                <button onClick={() => navigate('/btp')} style={{ ...BTN, width: '100%', marginTop: 12, padding: 14, fontSize: 14 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#A68B4B'} onMouseLeave={e => e.currentTarget.style.background = '#2C2520'}>
                  🔨 Trouver un artisan pour des travaux
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ INVESTIR ═══ */}
        {tab === 'investir' && (
          <div>
            <InvestirJugeModule data={immoData} setData={setImmoData} showToast={() => {}} />
          </div>
        )}

        {/* ═══ MON PROFIL ═══ */}
        {tab === 'profil' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Mon profil</h2>
            <div style={{ ...CARD }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
                  {(user?.nom || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.nom || 'Utilisateur'}</div>
                  <div style={{ fontSize: 13, color: DS.muted }}>{user?.email || '—'}</div>
                  <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, marginTop: 2 }}>Compte client</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Projets publiés', value: projets.length },
                  { label: 'Artisans favoris', value: favoris.length },
                  { label: 'Messages', value: messages.length },
                ].map(k => (
                  <div key={k.label} style={{ background: '#F8F7F4', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: DS.muted }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
