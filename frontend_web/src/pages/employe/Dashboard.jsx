import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../services/api';
import DS from '../../design/ds';

const TABS = ['Tableau de bord', 'Mes chantiers', 'Mon planning', 'Fiches de paie', 'Congés', 'Notes de frais', 'Mes documents', 'Mon profil'];

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

const DEMO_CHANTIERS = [
  { id:1, titre:'Rénovation cuisine — Mme Dupont', adresse:'12 rue de la Liberté, Nice', statut:'en_cours', dateDebut:'2026-04-01', dateFin:'2026-04-20', chef:'Vassili B.' },
  { id:2, titre:'Installation électrique — Bureau Médicin', adresse:'8 av Jean Médecin, Nice', statut:'planifie', dateDebut:'2026-04-22', dateFin:'2026-05-05', chef:'Vassili B.' },
  { id:3, titre:'Peinture T3 — SCI Riviera', adresse:'24 rue Pastorelli, Nice', statut:'complete', dateDebut:'2026-03-10', dateFin:'2026-03-25', chef:'Vassili B.' },
];

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

const DEMO_PLANNING = [
  { id:1, jour:'Lundi', heure:'08:00-17:00', tache:'Chantier Dupont — Démolition cuisine', lieu:'12 rue de la Liberté' },
  { id:2, jour:'Mardi', heure:'08:00-17:00', tache:'Chantier Dupont — Plomberie', lieu:'12 rue de la Liberté' },
  { id:3, jour:'Mercredi', heure:'08:00-12:00', tache:'Chantier Dupont — Électricité', lieu:'12 rue de la Liberté' },
  { id:4, jour:'Mercredi', heure:'14:00-17:00', tache:'Réunion équipe', lieu:'Bureau' },
  { id:5, jour:'Jeudi', heure:'08:00-17:00', tache:'Chantier Dupont — Pose carrelage', lieu:'12 rue de la Liberté' },
  { id:6, jour:'Vendredi', heure:'08:00-16:00', tache:'Chantier Dupont — Finitions', lieu:'12 rue de la Liberté' },
];

const DEMO_PROFIL = { prenom:'Jean', nom:'Martin', poste:'Ouvrier qualifié', email:'jean.martin@email.com', telephone:'0612345678', typeContrat:'CDI', salaireBase:2800, dateEntree:'2024-09-01', statut:'actif' };
const DEMO_PATRON = { nom:'Vassili B.', email:'contact@freample.com', siret:'12345678900012', adresse:'Nice', metier:'BTP' };

const statutColors = { en_cours:'#2563EB', planifie:'#D97706', complete:'#16A34A', en_attente:'#D97706', approuve:'#16A34A', rejete:'#DC2626', rembourse:'#16A34A', paye:'#16A34A', parti:'#DC2626' };
const statutLabels = { en_cours:'En cours', planifie:'Planifié', complete:'Terminé', en_attente:'En attente', approuve:'Approuvé', rejete:'Rejeté', rembourse:'Remboursé', paye:'Payé', parti:'Parti' };

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'10px 20px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };

export default function DashboardEmploye() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [chantiers, setChantiers] = useState(DEMO_CHANTIERS);
  const [bulletins, setBulletins] = useState(DEMO_BULLETINS);
  const [conges, setConges] = useState(DEMO_CONGES);
  const [frais, setFrais] = useState(DEMO_FRAIS);
  const [profil, setProfil] = useState(DEMO_PROFIL);
  const [patron, setPatron] = useState(DEMO_PATRON);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [mesDocs, setMesDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState('');

  const patronId = user?.patronId;
  const hasEntreprise = !!patronId;

  useEffect(() => {
    api.get('/rh/mon-profil').then(({ data }) => {
      if (data.employe) setProfil(data.employe);
      if (data.patron) setPatron(data.patron);
    }).catch(() => {});
    api.get('/missions').then(({ data }) => { if (data.missions?.length) setChantiers(data.missions); }).catch(() => {});
    api.get('/rh/bulletins-paie').then(({ data }) => { if (data.bulletins?.length) setBulletins(data.bulletins); }).catch(() => {});
    api.get('/rh/conges').then(({ data }) => { if (data.conges?.length) setConges(data.conges); }).catch(() => {});
    api.get('/rh/notes-frais').then(({ data }) => { if (data.notes?.length) setFrais(data.notes); }).catch(() => {});
    api.get('/rh/documents').then(({ data }) => { if (data.documents) setMesDocs(data.documents); }).catch(() => {});
  }, []);

  const congesRestants = 25 - conges.filter(c => c.statut === 'approuve' && c.type === 'vacances').reduce((s, c) => s + c.jours, 0);
  const fraisEnAttente = frais.filter(f => f.statut === 'en_attente').reduce((s, f) => s + f.montant, 0);

  const submitConge = () => {
    const c = { id: Date.now(), debut: form.debut, fin: form.fin, jours: Math.max(1, Math.ceil((new Date(form.fin) - new Date(form.debut)) / 86400000) + 1), type: form.typeConge || 'vacances', statut: 'en_attente', commentaire: form.commentaire || '' };
    setConges(prev => [c, ...prev]);
    api.post('/rh/conges', c).catch(() => {});
    setModal(null); setForm({});
  };

  const submitFrais = () => {
    const f = { id: Date.now(), date: form.dateFrais || new Date().toISOString().slice(0, 10), montant: Number(form.montant) || 0, categorie: form.categorie || 'Autre', description: form.descFrais || '', statut: 'en_attente' };
    setFrais(prev => [f, ...prev]);
    api.post('/rh/notes-frais', f).catch(() => {});
    setModal(null); setForm({});
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font }}>
      {/* Header sombre */}
      <div style={{ background: '#2C2520', padding: '0 clamp(20px,4vw,40px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 6 }}>
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 900, color: '#F5EFE0', fontFamily: DS.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: '#A68B4B' }}>.</span>
          </button>
        </div>
        <div style={{ color: '#F5EFE0', fontSize: 13 }}>{profil.prenom} {profil.nom} · {profil.poste}</div>
        {hasEntreprise && <div style={{ fontSize: 12, color: '#A68B4B', fontWeight: 600 }}>{patron?.nom}</div>}
      </div>

      {/* Sidebar burger */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1000, transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .3s', boxShadow: menuOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E8E6E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Espace salarié</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: DS.muted }}>×</button>
        </div>
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => { setTab(i); setMenuOpen(false); }}
              style={{ width: '100%', padding: '12px 20px', background: tab === i ? '#F8F7F4' : 'none', border: 'none', borderLeft: `3px solid ${tab === i ? '#2C2520' : 'transparent'}`, cursor: 'pointer', fontFamily: DS.font, fontSize: 14, fontWeight: tab === i ? 700 : 400, color: tab === i ? DS.ink : DS.muted, textAlign: 'left', transition: 'all .1s' }}
              onMouseEnter={e => { if (tab !== i) e.currentTarget.style.background = '#FAFAF8'; }}
              onMouseLeave={e => { if (tab !== i) e.currentTarget.style.background = 'none'; }}>
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px clamp(20px,4vw,40px)' }}>

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

      {/* ═══ TABLEAU DE BORD ═══ */}
      {tab === 0 && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { l: 'Chantiers assignés', v: chantiers.filter(c => c.statut !== 'complete').length, c: '#2563EB' },
            { l: 'Congés restants', v: `${congesRestants} j`, c: '#16A34A' },
            { l: 'Prochaine paie', v: bulletins[0]?.net ? `${bulletins[0].net}€` : '—', c: DS.gold },
            { l: 'Frais en attente', v: `${fraisEnAttente.toFixed(2)}€`, c: '#D97706' },
          ].map(k => (
            <div key={k.l} style={{ ...CARD, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
              <div style={{ fontSize: 11, color: DS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.l}</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: DS.ink }}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={CARD}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: DS.ink }}>Chantiers en cours</div>
            {chantiers.filter(c => c.statut === 'en_cours').map(c => (
              <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.titre}</div>
                <div style={{ fontSize: 11, color: DS.muted }}>{c.adresse}</div>
              </div>
            ))}
            {chantiers.filter(c => c.statut === 'en_cours').length === 0 && <div style={{ fontSize: 12, color: DS.muted }}>Aucun chantier en cours</div>}
          </div>
          <div style={CARD}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: DS.ink }}>Congés en attente</div>
            {conges.filter(c => c.statut === 'en_attente').map(c => (
              <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #E8E6E1' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.debut} → {c.fin} ({c.jours}j)</div>
                <div style={{ fontSize: 11, color: '#D97706' }}>{c.commentaire}</div>
              </div>
            ))}
            {conges.filter(c => c.statut === 'en_attente').length === 0 && <div style={{ fontSize: 12, color: DS.muted }}>Aucune demande en attente</div>}
          </div>
        </div>
      </>}

      {/* ═══ MES CHANTIERS ═══ */}
      {tab === 1 && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: DS.ink }}>Mes chantiers ({chantiers.length})</h2>
        {chantiers.map(c => (
          <div key={c.id} style={{ ...CARD, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{c.titre}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: statutColors[c.statut], background: `${statutColors[c.statut]}15`, padding: '2px 8px', borderRadius: 6 }}>{statutLabels[c.statut]}</span>
              </div>
              <div style={{ fontSize: 12, color: DS.muted }}>{c.adresse} · {c.dateDebut} → {c.dateFin} · Chef: {c.chef}</div>
            </div>
          </div>
        ))}
      </>}

      {/* ═══ MON PLANNING ═══ */}
      {tab === 2 && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: DS.ink }}>Planning de la semaine</h2>
        <div style={{ ...CARD, padding: 0 }}>
          {DEMO_PLANNING.map((p, i) => (
            <div key={p.id} style={{ padding: '12px 18px', borderBottom: i < DEMO_PLANNING.length - 1 ? '1px solid #E8E6E1' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: DS.accent, flexShrink: 0 }}>{p.jour}</div>
              <div style={{ width: 100, fontSize: 12, color: DS.muted, flexShrink: 0 }}>{p.heure}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.tache}</div>
                <div style={{ fontSize: 11, color: DS.muted }}>{p.lieu}</div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* ═══ FICHES DE PAIE ═══ */}
      {tab === 3 && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: DS.ink }}>Fiches de paie</h2>
        <div style={{ ...CARD, padding: 0 }}>
          {bulletins.map((b, i) => (
            <div key={b.id} style={{ padding: '14px 18px', borderBottom: i < bulletins.length - 1 ? '1px solid #E8E6E1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{b.periode}</div>
                <div style={{ fontSize: 12, color: DS.muted }}>Brut: {b.brut}€ · Net: {b.net}€ · Versé le {b.date}</div>
              </div>
              <button onClick={() => alert(`Téléchargement bulletin ${b.periode}`)} style={BTN_O}>Télécharger</button>
            </div>
          ))}
        </div>
      </>}

      {/* ═══ CONGÉS ═══ */}
      {tab === 4 && <>
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
              <span style={{ fontSize: 11, fontWeight: 600, color: statutColors[c.statut], background: `${statutColors[c.statut]}15`, padding: '3px 10px', borderRadius: 6 }}>{statutLabels[c.statut]}</span>
            </div>
          ))}
        </div>
      </>}

      {/* ═══ NOTES DE FRAIS ═══ */}
      {tab === 5 && <>
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
                <span style={{ fontSize: 11, fontWeight: 600, color: statutColors[f.statut], background: `${statutColors[f.statut]}15`, padding: '3px 10px', borderRadius: 6 }}>{statutLabels[f.statut]}</span>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* ═══ MES DOCUMENTS ═══ */}
      {tab === 6 && <>
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

      {/* ═══ MON PROFIL ═══ */}
      {tab === 7 && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: DS.ink }}>Mon profil</h2>
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
      </>}

      </div>{/* fin maxWidth container */}

      {/* ═══ MODALS ═══ */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
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
              <button onClick={submitFrais} style={{ ...BTN, width: '100%' }}>Soumettre</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
