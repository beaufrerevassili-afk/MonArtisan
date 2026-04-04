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

const TAB_MAP = { projets:'projets', devis:'devis', factures:'factures', clients:'clients', tarifs:'tarifs', equipe:'equipe', rapports:'rapports' };

export default function DashboardCom() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB_MAP[searchParams.get('onglet')] || 'accueil');
  const [projets, setProjets] = useState(PROJETS_INIT);
  const [devis] = useState(DEVIS_INIT);
  const [factures] = useState(FACTURES_INIT);
  const [clients] = useState(CLIENTS_INIT);
  const [equipe] = useState(EQUIPE_INIT);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && TAB_MAP[o]) setTab(TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3500); };

  const [modalProjet, setModalProjet] = useState(null);
  const [modalDevis, setModalDevis] = useState(false);
  const [projetFilter, setProjetFilter] = useState('tous');
  const [clientSearch, setClientSearch] = useState('');
  const [devisForm, setDevisForm] = useState({ client:'', objet:'', montantHT:'', tva:20 });

  const projetsEnCours = projets.filter(p => ['en_cours','revision'].includes(p.statut)).length;
  const caTotal = projets.filter(p => ['livre','paye'].includes(p.statut)).reduce((s,p) => s+p.montant, 0);
  const revenuMois = projets.reduce((s,p) => s+p.montant, 0);
  const maxRev = Math.max(...REVENUS_7J.map(r => r.montant), 1);

  const filteredProjets = projetFilter === 'tous' ? projets : projets.filter(p => p.statut === projetFilter);
  const filteredClients = clients.filter(c => c.nom.toLowerCase().includes(clientSearch.toLowerCase()));

  const livrerProjet = (id) => { setProjets(prev => prev.map(p => p.id===id ? {...p, statut:'livre'} : p)); showToast('Projet livré au client !'); setModalProjet(null); };
  const submitDevis = () => {
    if (!devisForm.client || !devisForm.objet || !devisForm.montantHT) return;
    showToast('Devis créé et envoyé !');
    setModalDevis(false);
    setDevisForm({ client:'', objet:'', montantHT:'', tva:20 });
  };

  return (
    <div style={{ padding:'24px 28px', background:V_BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1C1C1E' }}>🎬 Freample Com</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:2 }}>Communication · Marketing · Montage</div>
        </div>
        <button onClick={() => setModalDevis(true)} style={{ ...BTN, display:'flex', alignItems:'center', gap:6 }}>+ Nouveau devis</button>
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

      {/* MODAL: Projet detail */}
      {modalProjet && (
        <div style={OVL} onClick={() => setModalProjet(null)}>
          <div style={BOX} onClick={e => e.stopPropagation()}>
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
            <div style={{ display:'flex', gap:10 }}>
              {['en_cours','revision'].includes(modalProjet.statut) && <button onClick={() => livrerProjet(modalProjet.id)} style={{ ...BTN, flex:1, padding:'12px', background:'#059669' }}>📦 Livrer au client</button>}
              <button onClick={() => setModalProjet(null)} style={{ ...GHOST, flex:1, padding:'12px' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nouveau devis */}
      {modalDevis && (
        <div style={OVL} onClick={() => setModalDevis(false)}>
          <div style={BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Créer un devis</div>
            {[{l:'Client *',k:'client',t:'text',p:'Nom du client ou entreprise'},{l:'Objet *',k:'objet',t:'text',p:'Pack 10 TikToks, Logo, Gestion Instagram...'},{l:'Montant HT (€) *',k:'montantHT',t:'number',p:'349'}].map(f => (
              <div key={f.k} style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>{f.l}</label>
                <input type={f.t} value={devisForm[f.k]} onChange={e => setDevisForm(p => ({...p,[f.k]:e.target.value}))} placeholder={f.p} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>TVA (%)</label>
              <select value={devisForm.tva} onChange={e => setDevisForm(p => ({...p, tva:Number(e.target.value)}))} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}>
                <option value={20}>20%</option><option value={10}>10%</option><option value={5.5}>5.5%</option><option value={0}>0%</option>
              </select>
            </div>
            {devisForm.montantHT && (
              <div style={{ padding:'12px 16px', background:V_SOFT, borderRadius:10, marginBottom:20, display:'flex', justifyContent:'space-between', fontWeight:700 }}>
                <span>Total TTC</span>
                <span style={{ color:V }}>{Math.round(Number(devisForm.montantHT)*(1+devisForm.tva/100))}€</span>
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitDevis} style={{ ...BTN, flex:1, padding:'12px' }}>📝 Créer et envoyer le devis</button>
              <button onClick={() => setModalDevis(false)} style={{ ...GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{ position:'fixed', top:24, right:24, background:'#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000, maxWidth:360 }}>{toast}</div>}
    </div>
  );
}
