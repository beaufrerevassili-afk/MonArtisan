import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DS from '../../design/ds';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import NotificationBell from '../../components/ui/NotificationBell';
import { CORPS_METIER_BTP } from '../../utils/profilEntreprise';
import PVReception from '../../components/chantier/PVReception';

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' };

function lsGet(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }

function useIsMobile(bp = 640) {
  const [m, setM] = useState(() => window.innerWidth <= bp);
  useEffect(() => { const h = () => setM(window.innerWidth <= bp); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, [bp]);
  return m;
}

export default function DashboardClient() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [projets, setProjets] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newProjet, setNewProjet] = useState({ metier: '', description: '', ville: 'Marseille', budget: '', urgence: 'normal' });
  const [projetDetail, setProjetDetail] = useState(null);
  const [reviewNote, setReviewNote] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSent, setReviewSent] = useState(() => lsGet('freample_reviews', {}));
  const [clientMessage, setClientMessage] = useState('');
  const [showPaiements, setShowPaiements] = useState(false);
  const [showProfil, setShowProfil] = useState(false);
  const [pwForm, setPwForm] = useState({ ancien: '', nouveau: '', confirm: '' });

  const prenom = user?.nom?.split(' ')[0] || 'vous';

  const token = localStorage.getItem('token');
  const isDemo = token && token.endsWith('.dev');

  const chargerProjets = async () => {
    if (isDemo) {
      const local = lsGet('freample_projets', []);
      setProjets(local.length > 0 ? local : []);
    } else {
      try {
        const { data } = await api.get('/projets/mes-projets');
        if (data.projets) {
          // Mapper les champs backend → frontend
          setProjets(data.projets.map(p => ({
            id: p.id, metier: p.metier, titre: p.titre, description: p.description,
            ville: p.ville, budget: Number(p.budget_estime) || 0, urgence: p.urgence,
            statut: p.statut, date: p.created_at?.slice(0, 10), nbOffres: Number(p.nb_offres) || 0,
            clientNom: p.client_nom || user?.nom || '', artisan: p.artisan_nom || null,
          })));
        }
      } catch { setProjets([]); }
    }
  };

  const chargerOffres = async () => {
    if (isDemo) return;
    try {
      let toutes = [];
      for (const p of projets) {
        const { data } = await api.get(`/projets/${p.id}/offres`);
        if (data.offres) {
          toutes.push(...data.offres.map(o => ({
            id: o.id, projetId: p.id, artisanNom: o.artisan_nom || 'Artisan',
            prix: Number(o.prix_propose) || 0, message: o.message,
            statut: o.statut, createdAt: o.created_at,
          })));
        }
      }
      setAllOffresBackend(toutes);
    } catch {}
  };

  useEffect(() => { chargerProjets(); }, []);
  useEffect(() => { if (!isDemo && projets.length > 0) chargerOffres(); }, [projets.length]);

  // Données dérivées
  const [allOffresBackend, setAllOffresBackend] = useState([]);
  const allOffres = isDemo ? lsGet('freample_offres', []) : allOffresBackend;
  const allDevis = lsGet('freample_devis', []);
  const offresActives = allOffres.filter(o => o.statut !== 'retiree');
  const projetsPublies = projets.filter(p => p.statut === 'publie');
  const projetsEnCours = projets.filter(p => p.statut === 'en_cours' || p.statut === 'reception');
  const projetsReception = projets.filter(p => p.statut === 'reception');
  const projetsTermines = projets.filter(p => p.statut === 'termine');
  const totalOffresEnAttente = projetsPublies.reduce((s, p) => s + offresActives.filter(o => o.projetId === p.id && (!o.statut || o.statut === 'proposee')).length, 0);

  // Créer un projet
  const creerProjet = async () => {
    if (!newProjet.metier || !newProjet.description) return;
    if (isDemo) {
      const projet = { id: Date.now(), ...newProjet, budget: Number(newProjet.budget) || 0, statut: 'publie', date: new Date().toISOString().slice(0, 10), nbOffres: 0, clientNom: user?.nom || '' };
      const updated = [...projets, projet];
      setProjets(updated);
      localStorage.setItem('freample_projets', JSON.stringify(updated));
    } else {
      try {
        await api.post('/projets', {
          titre: newProjet.titre || newProjet.metier,
          description: newProjet.description,
          metier: newProjet.metier,
          ville: newProjet.ville || 'Marseille',
          budgetEstime: Number(newProjet.budget) || 0,
          urgence: newProjet.urgence || 'normal',
        });
        await chargerProjets();
      } catch (err) {
        addToast(err.response?.data?.erreur || 'Erreur lors de la création', 'error');
        return;
      }
    }
    setShowForm(false);
    setNewProjet({ metier: '', description: '', ville: 'Marseille', budget: '', urgence: 'normal' });
    addToast('Projet publié ! Les artisans vont le voir.', 'success');
  };

  // Accepter une offre
  const accepterOffre = (offre, projet) => {
    // 1. Mettre à jour le projet
    const updProjets = projets.map(x => x.id === projet.id ? { ...x, statut: 'en_cours', artisan: offre.artisanNom } : x);
    setProjets(updProjets);
    localStorage.setItem('freample_projets', JSON.stringify(updProjets));

    // 2. Marquer les offres (acceptée / refusées)
    const updOffres = allOffres.map(o => o.id === offre.id ? { ...o, statut: 'acceptee' } : o.projetId === projet.id ? { ...o, statut: 'refusee' } : o);
    localStorage.setItem('freample_offres', JSON.stringify(updOffres));

    // 3. CRÉER LE CHANTIER dans freample_chantiers_custom → visible par patron + salarié
    const chantierId = 'ch_' + Date.now();
    const chantierData = {
      id: chantierId,
      projetId: projet.id,
      titre: `${projet.metier} — ${projet.titre || projet.description?.slice(0, 40) || 'Travaux'}`,
      description: projet.description || '',
      client: user?.nom || projet.clientNom || 'Client',
      adresse: projet.ville || '',
      budgetPrevu: projet.budget || 0,
      caDevis: offre.prix || projet.budget || 0,
      statut: 'en_cours',
      avancement: 0,
      dateDebut: new Date().toISOString().slice(0, 10),
      dateFin: null,
      equipe: [],
      source: 'marketplace',
    };
    try {
      const chantiers = JSON.parse(localStorage.getItem('freample_chantiers_custom') || '[]');
      chantiers.push(chantierData);
      localStorage.setItem('freample_chantiers_custom', JSON.stringify(chantiers));
    } catch {}

    // 4. Passer le devis marketplace en statut "accepte" (si trouvé)
    try {
      const devisAll = JSON.parse(localStorage.getItem('freample_devis') || '[]');
      const updated = devisAll.map(d => d.projetId === projet.id && d.source === 'marketplace' && d.statut === 'envoye'
        ? { ...d, statut: 'accepte', chantierId } : d);
      localStorage.setItem('freample_devis', JSON.stringify(updated));
    } catch {}

    // 5. Notif patron
    const notifs = lsGet('freample_notifs_patron', []);
    notifs.push({
      id: Date.now(), date: new Date().toISOString(), type: 'offre_acceptee',
      titre: 'Un client vous a choisi !',
      message: `${user?.nom || 'Le client'} a choisi votre offre sur "${projet.titre || projet.metier}". Le chantier a été créé automatiquement.`,
      lien: '/patron/missions', lu: false,
    });
    localStorage.setItem('freample_notifs_patron', JSON.stringify(notifs));

    api.post(`/projets/offres/${offre.id}/accepter`).catch(() => {});
    addToast(`${offre.artisanNom} sélectionné ! Le chantier est créé.`, 'success');
    setProjetDetail(null);
  };

  // Supprimer projet
  const supprimerProjet = async (id) => {
    if (!window.confirm('Retirer ce projet ?')) return;
    if (!isDemo) {
      try { await api.delete(`/projets/${id}`); } catch {}
      await chargerProjets();
    } else {
      const updated = projets.filter(x => x.id !== id);
      setProjets(updated);
      localStorage.setItem('freample_projets', JSON.stringify(updated));
    }
    setProjetDetail(null);
  };

  // Déterminer la "phase" du client
  const phase = projets.length === 0 ? 'nouveau'
    : totalOffresEnAttente > 0 ? 'offres'
    : projetsReception.length > 0 ? 'reception'
    : projetsEnCours.length > 0 ? 'chantier'
    : projetsTermines.length > 0 && projetsPublies.length === 0 ? 'termine'
    : 'projets';

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font, color: '#1A1A1A' }}>
      {/* ══ HEADER ══ */}
      <div style={{ background: '#2C2520', padding: isMobile ? '0 12px' : '0 clamp(20px,4vw,40px)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 6 }}>
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? 14 : 16, fontWeight: 900, color: '#F5EFE0', fontFamily: DS.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: '#A68B4B' }}>.</span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isMobile && <span style={{ color: '#F5EFE0', fontSize: 13 }}>Bonjour, {prenom}</span>}
          <NotificationBell dark />
        </div>
      </div>

      {/* ══ SIDEBAR ══ */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1000, transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .3s', boxShadow: menuOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${DS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Mon espace</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#444' }}>×</button>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {[
            { label: 'Accueil', action: () => { setProjetDetail(null); setShowPaiements(false); setShowProfil(false); } },
            { label: 'Mes paiements', action: () => { setShowPaiements(true); setShowProfil(false); setProjetDetail(null); } },
            { label: 'Mon profil', action: () => { setShowProfil(true); setShowPaiements(false); setProjetDetail(null); } },
            { label: 'Trouver un artisan', action: () => navigate('/btp') },
          ].map(t => (
            <button key={t.label} onClick={() => { setMenuOpen(false); t.action(); }}
              style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: DS.font, fontSize: 14, fontWeight: 500, color: DS.ink, textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${DS.border}` }}>
          <button onClick={() => { setMenuOpen(false); setShowForm(true); }} style={{ width: '100%', ...BTN, marginBottom: 8 }}>+ Nouveau projet</button>
          <button onClick={async () => { if (logout) await logout(); navigate('/login'); }}
            style={{ width: '100%', padding: '10px', background: 'transparent', color: '#DC2626', border: '1px solid #DC2626', borderRadius: 8, cursor: 'pointer', fontFamily: DS.font, fontSize: 13, fontWeight: 600 }}>Se déconnecter</button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px clamp(16px,4vw,40px)' }}>

        {/* ══ VUE PAIEMENTS ══ */}
        {showPaiements && !projetDetail && (
          <div>
            <button onClick={() => setShowPaiements(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 16, fontFamily: DS.font }}>← Retour</button>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 12px', color: '#1A1A1A' }}>Mes paiements</h2>
            <div style={{ ...CARD, marginBottom: 16, borderLeft: '4px solid #2563EB', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Paiement sécurisé par séquestre</div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>Vos paiements sont bloqués sur un compte sécurisé. L'artisan ne reçoit les fonds qu'après votre validation. Commission Freample : 1%.</div>
              </div>
            </div>
            {projets.filter(p => p.artisan).length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 40, color: '#444', fontSize: 13 }}>Aucun paiement — choisissez d'abord un artisan sur un de vos projets.</div>
            ) : projets.filter(p => p.artisan).map(p => (
              <div key={p.id} style={{ ...CARD, marginBottom: 10, borderLeft: `4px solid ${p.statut === 'termine' ? '#16A34A' : '#D97706'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{p.titre || p.metier}</div>
                    <div style={{ fontSize: 12, color: '#444' }}>🔨 {p.artisan} · {(p.budget || 0).toLocaleString('fr-FR')}€</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: p.statut === 'termine' ? '#F0FDF4' : '#FFFBEB', color: p.statut === 'termine' ? '#16A34A' : '#D97706' }}>
                    {p.statut === 'termine' ? 'Payé' : 'En cours'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ VUE PROFIL ══ */}
        {showProfil && !projetDetail && (
          <div>
            <button onClick={() => setShowProfil(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 16, fontFamily: DS.font }}>← Retour</button>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: '#1A1A1A' }}>Mon profil</h2>
            <div style={{ ...CARD }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['Nom', user?.nom], ['Email', user?.email], ['Téléphone', user?.telephone || '—'], ['Membre depuis', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '2026']].map(([k, v]) => (
                  <div key={k} style={{ background: '#F8F7F4', padding: '10px 14px', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: '#444', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ DÉTAIL PROJET (modal inline) ══ */}
        {projetDetail && (() => {
          const p = projetDetail;
          const offres = offresActives.filter(o => o.projetId === p.id && (!o.statut || o.statut === 'proposee'));
          const offresAll = offresActives.filter(o => o.projetId === p.id);
          const devis = allDevis.filter(d => d.projetId === p.id && d.statut !== 'retire_marketplace');
          const chantier = lsGet('freample_chantiers_custom', []).find(c => c.projetId === p.id);
          const rapports = lsGet(`freample_rapports_${p.id}`, []).slice(-5).reverse();
          const chatMessages = lsGet(`freample_messages_${p.id}`, []);

          return <div>
            <button onClick={() => setProjetDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 16, fontFamily: DS.font }}>← Retour à l'accueil</button>

            {/* Header projet */}
            <div style={{ ...CARD, marginBottom: 16, borderLeft: `4px solid ${p.statut === 'termine' ? '#16A34A' : p.statut === 'en_cours' ? '#D97706' : '#2563EB'}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#A68B4B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{p.metier}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#1A1A1A' }}>{p.titre || p.description?.slice(0, 50)}</div>
              <div style={{ fontSize: 12, color: '#444' }}>{p.ville} · {(p.budget || 0).toLocaleString('fr-FR')}€ · {p.urgence === 'urgent' ? 'Urgent' : p.urgence === 'flexible' ? 'Flexible' : 'Normal'}</div>
              {p.artisan && <div style={{ fontSize: 13, fontWeight: 700, color: '#16A34A', marginTop: 8 }}>🔨 Artisan : {p.artisan}</div>}
            </div>

            {/* Offres à comparer */}
            {p.statut === 'publie' && offres.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{offres.length} artisan{offres.length > 1 ? 's' : ''} {offres.length > 1 ? 'ont' : 'a'} répondu</div>
                {offres.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(offres.length, 3)}, 1fr)`, gap: 10, marginBottom: 12 }}>
                    {offres.slice(0, 3).map(o => {
                      const isBest = offres.every(x => Number(o.prix) <= Number(x.prix));
                      return (
                        <div key={o.id} onClick={() => accepterOffre(o, p)}
                          style={{ ...CARD, textAlign: 'center', cursor: 'pointer', border: isBest ? '2px solid #16A34A' : `1px solid ${DS.border}`, transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, margin: '0 auto 8px' }}>
                            {(o.artisanNom || 'A').charAt(0)}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{o.artisanNom}</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: isBest ? '#16A34A' : '#2C2520', margin: '6px 0' }}>{Number(o.prix).toLocaleString('fr-FR')}€</div>
                          {isBest && <div style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>MEILLEUR PRIX</div>}
                          <div style={{ fontSize: 11, color: '#444' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : ''}</div>
                          <button style={{ marginTop: 8, padding: '8px 16px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                            Choisir
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {offres.length === 1 && (
                  <div style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>🔨 {offres[0].artisanNom}</div>
                      <div style={{ fontSize: 12, color: '#444' }}>{offres[0].createdAt ? `Envoyé le ${new Date(offres[0].createdAt).toLocaleDateString('fr-FR')}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{Number(offres[0].prix).toLocaleString('fr-FR')}€</div>
                      <button onClick={() => accepterOffre(offres[0], p)} style={{ marginTop: 4, padding: '6px 16px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Choisir cet artisan</button>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#444', textAlign: 'center' }}>Cliquez sur un artisan pour le sélectionner. Les autres seront informés.</div>
              </div>
            )}

            {/* En attente d'offres */}
            {p.statut === 'publie' && offres.length === 0 && (
              <div style={{ ...CARD, textAlign: 'center', marginBottom: 16, padding: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>En attente de réponses</div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>Les artisans de votre zone consultent votre projet. Vous recevrez leurs devis ici.</div>
                <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, marginTop: 8 }}>En moyenne, première offre sous 24h</div>
              </div>
            )}

            {/* Suivi chantier */}
            {(p.statut === 'en_cours' || p.statut === 'termine') && (() => {
              const profilPatron = lsGet('freample_profil_patron', {});
              const patronTel = profilPatron.telephone || profilPatron.tel || '';
              const patronNom = profilPatron.nom || p.artisan || 'Artisan';
              const avancement = chantier?.avancement || (p.statut === 'termine' ? 100 : 25);
              const dateDebut = chantier?.dateDebut || p.date;
              const dateFin = chantier?.dateFin;
              const equipe = chantier?.equipe || [];
              const today = new Date().toISOString().slice(0, 10);
              const todayPointages = lsGet('freample_pointages', []).filter(pt => pt.date === today && (pt.chantierId === p.id || pt.chantierId === chantier?.id));
              const ouvriersPresents = todayPointages.filter(pt => pt.type === 'arrivee');
              const photos = chantier ? lsGet(`freample_photos_${chantier.id}`, []) : [];
              const devisAccepte = allDevis.find(d => d.projetId === p.id && (d.statut === 'envoye' || d.statut === 'accepte' || d.statut === 'signe'));

              return (
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Carte artisan + contact */}
                <div style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: '#2C2520', borderColor: '#2C2520' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#A68B4B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                      {(patronNom || 'A').charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#F5EFE0' }}>{patronNom}</div>
                      <div style={{ fontSize: 11, color: 'rgba(245,239,224,0.6)' }}>Votre artisan · {p.metier}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {patronTel && (
                      <a href={`tel:${patronTel}`} style={{ padding: '8px 14px', background: '#16A34A', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        📞 Appeler
                      </a>
                    )}
                  </div>
                </div>

                {/* Avancement */}
                <div style={CARD}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Avancement des travaux</div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: avancement >= 100 ? '#16A34A' : '#A68B4B' }}>{avancement}%</span>
                  </div>
                  <div style={{ height: 10, background: '#E8E6E1', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ width: `${avancement}%`, height: '100%', background: avancement >= 100 ? '#16A34A' : '#A68B4B', borderRadius: 5, transition: 'width .5s' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                    {[
                      ['Début', dateDebut ? new Date(dateDebut).toLocaleDateString('fr-FR') : '—'],
                      ['Fin prévue', dateFin ? new Date(dateFin).toLocaleDateString('fr-FR') : 'À définir'],
                      ['Budget', `${(p.budget || 0).toLocaleString('fr-FR')}€`],
                      ['Statut', p.statut === 'termine' ? 'Terminé' : 'En cours'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: '#F8F7F4', padding: '8px 10px', borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: '#444', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paiement */}
                <div style={{ ...CARD, borderLeft: '4px solid #2563EB' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Paiement sécurisé</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    <div style={{ flex: 30, height: 8, borderRadius: 4, background: '#2563EB' }} />
                    <div style={{ flex: 70, height: 8, borderRadius: 4, background: p.statut === 'termine' ? '#16A34A' : '#E8E6E1' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                    <div style={{ padding: '6px 10px', background: '#EFF6FF', borderRadius: 6 }}>
                      <span style={{ color: '#444' }}>Acompte (30%) </span><strong style={{ color: '#2563EB' }}>{Math.round((p.budget || 0) * 0.3).toLocaleString('fr-FR')}€ ✓</strong>
                    </div>
                    <div style={{ padding: '6px 10px', background: p.statut === 'termine' ? '#F0FDF4' : '#F8F7F4', borderRadius: 6 }}>
                      <span style={{ color: '#444' }}>Solde (70%) </span><strong style={{ color: p.statut === 'termine' ? '#16A34A' : '#333' }}>{Math.round((p.budget || 0) * 0.7).toLocaleString('fr-FR')}€ {p.statut === 'termine' ? '✓' : '🔒'}</strong>
                    </div>
                    <div style={{ padding: '6px 10px', background: '#F8F7F4', borderRadius: 6 }}>
                      <span style={{ color: '#444' }}>Commission </span><strong>{Math.max(1, Math.round((p.budget || 0) * 0.01))}€</strong>
                    </div>
                  </div>
                  {p.statut === 'en_cours' && (
                    <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, marginTop: 8 }}>🔒 Le solde sera libéré quand vous validerez la fin des travaux</div>
                  )}
                  {p.statut === 'termine' && (
                    <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 8 }}>✓ Paiement libéré à {patronNom}</div>
                  )}
                </div>

                {/* Équipe sur place aujourd'hui */}
                {p.statut === 'en_cours' && (
                  <div style={CARD}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Aujourd'hui sur votre chantier</div>
                    {ouvriersPresents.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {ouvriersPresents.map((pt, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F0FDF4', borderRadius: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{pt.salarie || 'Ouvrier'}</span>
                            <span style={{ fontSize: 11, color: '#444' }}>arrivé à {pt.heure}</span>
                          </div>
                        ))}
                      </div>
                    ) : equipe.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 12, color: '#444', marginBottom: 6 }}>Équipe assignée :</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {equipe.map((nom, i) => (
                            <span key={i} style={{ padding: '4px 10px', background: '#F8F7F4', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{nom}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#444' }}>Pas d'intervention signalée aujourd'hui</div>
                    )}
                  </div>
                )}

                {/* Photos */}
                {photos.length > 0 && (
                  <div style={CARD}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Photos du chantier ({photos.length})</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
                      {photos.slice(-6).reverse().map((photo, i) => (
                        <div key={i} style={{ background: '#F8F7F4', borderRadius: 8, overflow: 'hidden', border: `1px solid ${DS.border}` }}>
                          <div style={{ width: '100%', height: 80, background: photo.url ? `url(${photo.url}) center/cover` : '#E8E6E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 11 }}>{!photo.url && '📷'}</div>
                          <div style={{ padding: '4px 6px', fontSize: 9, color: '#444' }}>{photo.date ? new Date(photo.date).toLocaleDateString('fr-FR') : ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rapports */}
                {rapports.length > 0 && (
                  <div style={CARD}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Derniers rapports</div>
                    {rapports.map((r, i) => (
                      <div key={i} style={{ padding: '8px 0', borderBottom: i < rapports.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                        <div style={{ fontSize: 10, color: '#444' }}>{new Date(r.date).toLocaleDateString('fr-FR')}{r.salarie ? ` — ${r.salarie}` : ''}</div>
                        <div style={{ fontSize: 12, color: '#333', marginTop: 2 }}>{r.note || r.texte || '—'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Devis accepté */}
                {devisAccepte && (
                  <div style={CARD}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Devis {devisAccepte.numero || ''}</div>
                        <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{(devisAccepte.lignes || []).length} ligne{(devisAccepte.lignes || []).length > 1 ? 's' : ''} · {(devisAccepte.montantTTC || 0).toLocaleString('fr-FR')}€ TTC</div>
                      </div>
                      <button onClick={() => window.open(`/devis/${devisAccepte.id}/signer`, '_blank')}
                        style={{ padding: '7px 14px', background: '#fff', color: '#A68B4B', border: '1px solid #A68B4B', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Voir le devis
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat */}
                <div style={CARD}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>Messagerie chantier</div>
                  <div style={{ background: '#F8F7F4', borderRadius: 10, padding: '10px 12px', maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
                    {chatMessages.length > 0 ? chatMessages.map((m, i) => (
                      <div key={m.id || i} style={{ display: 'flex', justifyContent: m.from === 'client' ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                        <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: m.from === 'client' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.from === 'client' ? '#2C2520' : '#fff', color: m.from === 'client' ? '#F5EFE0' : '#333', border: m.from === 'client' ? 'none' : `1px solid ${DS.border}`, fontSize: 12, lineHeight: 1.5 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2, color: m.from === 'client' ? '#A68B4B' : '#2563EB' }}>{m.auteur || (m.from === 'client' ? 'Vous' : 'Artisan')}</div>
                          <div>{m.texte}</div>
                        </div>
                      </div>
                    )) : <div style={{ fontSize: 12, color: '#444', fontStyle: 'italic', textAlign: 'center', padding: 16 }}>Envoyez un message à votre artisan</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={clientMessage} onChange={e => setClientMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (!clientMessage.trim()) return; const msg = { id: Date.now(), date: new Date().toISOString(), from: 'client', auteur: user?.nom || 'Client', texte: clientMessage.trim() }; const updated = [...chatMessages, msg]; localStorage.setItem(`freample_messages_${p.id}`, JSON.stringify(updated)); setClientMessage(''); setProjetDetail({ ...p }); } }}
                      placeholder="Écrire un message…" style={{ flex: 1, ...INP, fontSize: 12 }} />
                    <button onClick={() => { if (!clientMessage.trim()) return; const msg = { id: Date.now(), date: new Date().toISOString(), from: 'client', auteur: user?.nom || 'Client', texte: clientMessage.trim() }; const updated = [...chatMessages, msg]; localStorage.setItem(`freample_messages_${p.id}`, JSON.stringify(updated)); setClientMessage(''); setProjetDetail({ ...p }); }}
                      style={{ padding: '9px 16px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Envoyer</button>
                  </div>
                </div>
              </div>
              );
            })()}

            {/* PV de réception */}
            {(p.statut === 'reception' || p.statut === 'termine') && (() => {
              const pvs = lsGet('freample_pv_receptions', []);
              const pv = pvs.find(v => v.projetId === p.id || v.chantierId === chantier?.id);
              if (!pv && p.statut !== 'termine') return null;
              const profilPatron = lsGet('freample_profil_patron', {});
              const devisLie = allDevis.find(d => d.projetId === p.id);

              const handleSigner = (pvData) => {
                // 1. Sauver le PV signé
                const allPvs = lsGet('freample_pv_receptions', []);
                const updPvs = allPvs.map(v => v.id === pvData.id ? { ...pvData, statut: 'signe' } : v);
                localStorage.setItem('freample_pv_receptions', JSON.stringify(updPvs));

                // 2. Passer le projet en terminé
                const updProjets = projets.map(x => x.id === p.id ? { ...x, statut: 'termine' } : x);
                setProjets(updProjets);
                localStorage.setItem('freample_projets', JSON.stringify(updProjets));

                // 3. Passer le chantier en terminé
                try {
                  const ch = JSON.parse(localStorage.getItem('freample_chantiers_custom') || '[]');
                  const updCh = ch.map(c => (c.id === chantier?.id || c.projetId === p.id) ? { ...c, statut: 'terminee', avancement: 100 } : c);
                  localStorage.setItem('freample_chantiers_custom', JSON.stringify(updCh));
                } catch {}

                // 4. Libérer le séquestre (marquer les factures comme payées)
                try {
                  const factures = JSON.parse(localStorage.getItem('freample_factures') || '[]');
                  const updFact = factures.map(f => f.projetId === p.id ? { ...f, statut: pvData.sansReserve ? 'sequestre_libere' : 'sequestre_partiel' } : f);
                  localStorage.setItem('freample_factures', JSON.stringify(updFact));
                } catch {}

                // 5. Notif patron
                const notifs = lsGet('freample_notifs_patron', []);
                notifs.push({
                  id: Date.now(), date: new Date().toISOString(), type: 'pv_signe',
                  titre: pvData.sansReserve ? 'PV signé sans réserve — paiement libéré' : 'PV signé avec réserves — paiement partiel',
                  message: `${user?.nom || 'Le client'} a signé le PV de réception pour "${p.titre || p.metier}".${!pvData.sansReserve ? ` ${pvData.reserves.length} réserve(s) à corriger.` : ' Le séquestre est libéré.'}`,
                  lien: '/patron/missions', lu: false,
                });
                localStorage.setItem('freample_notifs_patron', JSON.stringify(notifs));

                addToast(pvData.sansReserve ? 'PV signé — paiement libéré à l\'artisan' : 'PV signé avec réserves — paiement partiel libéré', 'success');
                setProjetDetail({ ...p, statut: 'termine' });
              };

              const handleRefuser = (motif) => {
                // Notif patron
                const notifs = lsGet('freample_notifs_patron', []);
                notifs.push({
                  id: Date.now(), date: new Date().toISOString(), type: 'pv_refuse',
                  titre: 'PV de réception refusé',
                  message: `${user?.nom || 'Le client'} a refusé la réception pour "${p.titre || p.metier}". Motif : ${motif}`,
                  lien: '/patron/missions', lu: false,
                });
                localStorage.setItem('freample_notifs_patron', JSON.stringify(notifs));

                // Repasser le chantier en cours
                try {
                  const ch = JSON.parse(localStorage.getItem('freample_chantiers_custom') || '[]');
                  const updCh = ch.map(c => (c.id === chantier?.id || c.projetId === p.id) ? { ...c, statut: 'en_cours', avancement: 90 } : c);
                  localStorage.setItem('freample_chantiers_custom', JSON.stringify(updCh));
                } catch {}
                // Repasser le projet en cours
                const updProjets = projets.map(x => x.id === p.id ? { ...x, statut: 'en_cours' } : x);
                setProjets(updProjets);
                localStorage.setItem('freample_projets', JSON.stringify(updProjets));

                addToast('Réception refusée — l\'artisan sera informé', 'success');
                setProjetDetail({ ...p, statut: 'en_cours' });
              };

              if (pv) return (
                <div style={{ marginBottom: 16 }}>
                  <PVReception
                    chantier={chantier || { id: p.id, titre: p.titre || p.metier, client: user?.nom, adresse: p.ville, budgetPrevu: p.budget, dateDebut: p.date }}
                    devis={devisLie ? { numero: devisLie.numero, montantHT: devisLie.montantHT, montantTTC: devisLie.montantTTC, lignes: devisLie.lignes } : null}
                    profilEntreprise={profilPatron}
                    clientNom={user?.nom || ''}
                    onSigner={handleSigner}
                    onRefuser={handleRefuser}
                    readOnly={pv.statut === 'signe'}
                    role="client"
                    pvExistant={pv.statut === 'signe' ? pv : null}
                  />
                </div>
              );
              return null;
            })()}

            {/* Avis */}
            {p.statut === 'termine' && p.artisan && !reviewSent[p.id] && (
              <div style={{ ...CARD, borderLeft: '4px solid #A68B4B', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Notez {p.artisan}</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewNote(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: n <= reviewNote ? '#A68B4B' : '#D1D5DB' }}>★</button>
                  ))}
                </div>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2} placeholder="Votre expérience..." style={{ ...INP, resize: 'vertical', marginBottom: 8 }} />
                <button onClick={() => {
                  if (!reviewNote) return;
                  const updated = { ...reviewSent, [p.id]: { note: reviewNote, commentaire: reviewComment, date: new Date().toISOString() } };
                  setReviewSent(updated);
                  localStorage.setItem('freample_reviews', JSON.stringify(updated));
                  addToast('Merci pour votre avis !', 'success');
                }} disabled={!reviewNote} style={{ ...BTN, opacity: reviewNote ? 1 : 0.5, background: '#A68B4B' }}>Publier mon avis</button>
              </div>
            )}

            {/* Actions */}
            {p.statut === 'publie' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => supprimerProjet(p.id)} style={{ padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Retirer le projet</button>
              </div>
            )}
          </div>;
        })()}

        {/* ══ VUE PRINCIPALE ADAPTATIVE ══ */}
        {!projetDetail && !showPaiements && !showProfil && (<>

          {/* ── SCÉNARIO 1 : Nouveau client ── */}
          {phase === 'nouveau' && !showForm && (
            <div style={{ textAlign: 'center', paddingTop: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Bonjour {prenom}</div>
              <div style={{ fontSize: 14, color: '#444', marginBottom: 32 }}>Vous avez un projet de travaux ?</div>

              <button onClick={() => setShowForm(true)}
                style={{ padding: '18px 32px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: DS.font, width: '100%', maxWidth: 400, transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(44,37,32,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                Recevoir des devis gratuits →
              </button>

              <div style={{ marginTop: 40, textAlign: 'left', maxWidth: 500, margin: '40px auto 0' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Comment ça marche ?</div>
                {[
                  { step: '1', title: 'Décrivez votre besoin', desc: 'Métier, budget, ville — en 30 secondes' },
                  { step: '2', title: 'Les artisans répondent', desc: 'Recevez des devis d\'artisans certifiés de votre zone' },
                  { step: '3', title: 'Comparez et choisissez', desc: 'Prix, avis, disponibilité — vous décidez' },
                  { step: '4', title: 'Paiement sécurisé', desc: 'Votre argent est bloqué en séquestre jusqu\'à la fin des travaux' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
                {['Gratuit', 'Sans engagement', 'Artisans certifiés', 'Paiement séquestre'].map(t => (
                  <div key={t} style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>✓ {t}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── FORMULAIRE NOUVEAU PROJET ── */}
          {showForm && (
            <div>
              {projets.length > 0 && <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A68B4B', fontWeight: 600, marginBottom: 16, fontFamily: DS.font }}>← Retour</button>}
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#1A1A1A' }}>Décrivez votre projet</div>
              <div style={{ fontSize: 13, color: '#444', marginBottom: 20 }}>Les artisans de votre zone vous enverront leurs devis.</div>

              <div style={{ ...CARD }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Type de travaux *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['Plomberie', 'Électricité', 'Maçonnerie', 'Peinture', 'Carrelage', 'Menuiserie', 'Couverture', 'Chauffage', 'Isolation', 'Autre'].map(m => (
                        <button key={m} onClick={() => setNewProjet(f => ({ ...f, metier: m }))}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font, border: newProjet.metier === m ? '2px solid #2C2520' : `1px solid ${DS.border}`, background: newProjet.metier === m ? '#2C2520' : '#fff', color: newProjet.metier === m ? '#F5EFE0' : DS.ink }}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Titre du projet *</label>
                    <input value={newProjet.titre || ''} onChange={e => setNewProjet(f => ({ ...f, titre: e.target.value }))} placeholder="Ex: Rénovation salle de bain" style={INP} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Description *</label>
                    <textarea value={newProjet.description} onChange={e => setNewProjet(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Décrivez les travaux souhaités, la surface, les contraintes..." style={{ ...INP, resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Ville</label>
                      <input value={newProjet.ville} onChange={e => setNewProjet(f => ({ ...f, ville: e.target.value }))} style={INP} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Budget estimé (€)</label>
                      <input type="number" value={newProjet.budget} onChange={e => setNewProjet(f => ({ ...f, budget: e.target.value }))} placeholder="3000" style={INP} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Urgence</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[['urgent', '🚨 Urgent (48h)'], ['normal', '📅 Normal'], ['flexible', '🕐 Flexible']].map(([v, l]) => (
                        <button key={v} onClick={() => setNewProjet(f => ({ ...f, urgence: v }))}
                          style={{ flex: 1, padding: '10px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font, border: newProjet.urgence === v ? '2px solid #2C2520' : `1px solid ${DS.border}`, background: newProjet.urgence === v ? '#2C2520' : '#fff', color: newProjet.urgence === v ? '#F5EFE0' : DS.ink, textAlign: 'center' }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={creerProjet} disabled={!newProjet.metier || !newProjet.description}
                  style={{ ...BTN, width: '100%', marginTop: 20, padding: 14, fontSize: 15, opacity: (newProjet.metier && newProjet.description) ? 1 : 0.5 }}>
                  Publier mon projet — C'est gratuit
                </button>
              </div>
            </div>
          )}

          {/* ── SCÉNARIO 2+ : Client avec projets ── */}
          {phase !== 'nouveau' && !showForm && (<>
            {/* Header adaptatif */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>
                {phase === 'offres' ? `${prenom}, ${totalOffresEnAttente} artisan${totalOffresEnAttente > 1 ? 's' : ''} ${totalOffresEnAttente > 1 ? 'ont' : 'a'} répondu !`
                  : phase === 'reception' ? `${prenom}, signez le PV de réception`
                  : phase === 'chantier' ? `${prenom}, vos travaux avancent`
                  : phase === 'termine' ? `${prenom}, vos travaux sont terminés !`
                  : `Bonjour ${prenom}`}
              </div>
              <div style={{ fontSize: 13, color: '#444', marginTop: 4 }}>
                {projets.length} projet{projets.length > 1 ? 's' : ''} · {projetsPublies.length} en recherche · {projetsEnCours.length} en cours
              </div>
            </div>

            {/* Projets triés par priorité : offres en attente > en cours > publiés > terminés */}
            {[...projets].sort((a, b) => {
              const prio = { publie: 1, en_cours: 2, termine: 3, annule: 4 };
              const aOffres = offresActives.filter(o => o.projetId === a.id && (!o.statut || o.statut === 'proposee')).length;
              const bOffres = offresActives.filter(o => o.projetId === b.id && (!o.statut || o.statut === 'proposee')).length;
              if (aOffres > 0 && bOffres === 0) return -1;
              if (bOffres > 0 && aOffres === 0) return 1;
              return (prio[a.statut] || 5) - (prio[b.statut] || 5);
            }).map(p => {
              const pOffres = offresActives.filter(o => o.projetId === p.id && (!o.statut || o.statut === 'proposee'));
              const statusConfig = p.statut === 'reception' ? { label: '📋 PV à signer', color: '#8B5CF6', bg: '#F5F3FF' }
                : p.statut === 'en_cours' ? { label: '🏗️ En cours', color: '#D97706', bg: '#FFFBEB' }
                : p.statut === 'termine' ? { label: '✅ Terminé', color: '#16A34A', bg: '#F0FDF4' }
                : pOffres.length > 0 ? { label: `📩 ${pOffres.length} offre${pOffres.length > 1 ? 's' : ''}`, color: '#2563EB', bg: '#EFF6FF' }
                : { label: '⏳ En attente', color: '#D97706', bg: '#FFFBEB' };

              return (
                <div key={p.id} onClick={() => setProjetDetail(p)}
                  style={{ ...CARD, marginBottom: 10, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, transition: 'all .15s', borderLeft: `4px solid ${statusConfig.color}` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{p.titre || p.metier}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: statusConfig.color, background: statusConfig.bg, padding: '2px 8px', borderRadius: 4 }}>{statusConfig.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#444' }}>{p.metier} · {p.ville} · {(p.budget || 0).toLocaleString('fr-FR')}€</div>
                    {p.artisan && <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 2 }}>🔨 {p.artisan}</div>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              );
            })}

            {/* Bouton ajouter */}
            <button onClick={() => setShowForm(true)}
              style={{ width: '100%', padding: '14px', background: '#F8F7F4', border: `2px dashed ${DS.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#444', cursor: 'pointer', fontFamily: DS.font, marginTop: 8, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#A68B4B'; e.currentTarget.style.color = '#A68B4B'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.muted; }}>
              + Ajouter un autre projet
            </button>
          </>)}
        </>)}
      </div>
    </div>
  );
}
