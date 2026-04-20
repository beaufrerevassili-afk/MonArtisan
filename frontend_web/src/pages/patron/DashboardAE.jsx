import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DS from '../../design/ds';
import NotificationBell from '../../components/ui/NotificationBell';
import {
  IconHome, IconMissions, IconDocument, IconChart, IconBank, IconBox, IconMapPin,
  IconCalendar, IconMessage, IconUser, IconShield, IconAlert, IconCheck, IconSettings,
  IconSearch, IconFilter, IconTrendUp, IconArrowUp, IconArrowDown, IconBuilding, IconSend
} from '../../components/ui/Icons';
import OnboardingWizard, { isOnboardingDone, getOnboardingType } from '../../components/onboarding/OnboardingWizard';
import DevisFormulaire from '../../components/DevisFormulaire';
import EnvoyerDevisButton from '../../components/devis/EnvoyerDevisButton';

// ── Constantes ──
const PLAFONDS = { services: 77700, commerce: 188700 };
const TAUX_COTISATIONS = { services: 21.1, commerce: 12.3 };
const TAUX_ACRE = { services: 10.6, commerce: 6.2 };
const TAUX_VFL = { services: 1.0, commerce: 1.7 }; // Versement forfaitaire libératoire IR
const SEUIL_TVA = 36800;
const SEUIL_TVA_TOLERANCE = 39100;
const SEUIL_COMPTE_BANCAIRE = 10000;

const CORPS_METIER = [
  'Plomberie','Electricite','Peinture','Maconnerie','Carrelage','Menuiserie',
  'Couverture','Chauffage','Serrurerie','Platrerie','Isolation','Demolition',
  'Terrassement','Charpente','Facade','Climatisation','Domotique','Amenagement exterieur'
];

const TABS = [
  { id:'journee',      label:'Ma journee',      Icon: IconHome },
  { id:'projets',      label:'Projets clients',  Icon: IconMissions },
  { id:'soustraitance',label:'Sous-traitance',   Icon: IconBuilding },
  { id:'devis',        label:'Devis & Factures', Icon: IconDocument },
  { id:'finances',     label:'Mes finances',     Icon: IconChart },
  { id:'entreprise',   label:'Mon entreprise',   Icon: IconShield },
  { id:'parametres',   label:'Parametres',       Icon: IconSettings },
];

// ── Styles ──
const CARD = { background:'#fff', border:`1px solid ${DS.border}`, borderRadius:14, padding:'16px 20px' };
const BTN = { padding:'10px 20px', background:'#2C2520', color:'#F5EFE0', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const BTN_GOLD = { ...BTN, background:DS.gold, color:'#fff' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const TH = { padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`1px solid ${DS.border}` };
const TD = { padding:'8px 12px', fontSize:13, borderBottom:`1px solid ${DS.borderLight}` };
const BADGE = (bg,color) => ({ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:bg, color });
const SECTION_TITLE = { fontSize:15, fontWeight:800, color:DS.text, letterSpacing:'-0.02em', margin:0 };

const fmt = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',minimumFractionDigits:0}).format(n);
const todayStr = new Date().toISOString().slice(0,10);

// ── localStorage helpers ──
function readLS(key, fb=[]) { try { return JSON.parse(localStorage.getItem(key)||JSON.stringify(fb)); } catch { return fb; } }
function writeLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function useIsMobile(bp=640) {
  const [m,setM]=useState(()=>window.innerWidth<=bp);
  useEffect(()=>{const h=()=>setM(window.innerWidth<=bp);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[bp]);
  return m;
}

// ══════════════════════════════════════════════════
// ── COMPOSANT PRINCIPAL ──
// ══════════════════════════════════════════════════
export default function DashboardAE() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone() && getOnboardingType(user) === 'ae');
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState(urlTab || 'journee');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { if (urlTab && urlTab !== tab) setTab(urlTab); }, [urlTab]);

  // ── Profil AE ──
  const [profil, setProfil] = useState(() => readLS('freample_ae_profil', {
    nom: user?.nom || '', prenom: '', siret: '', metiers: ['Plomberie'],
    activite: 'services', ville: 'Nice', rayon: 30,
    decennale: '', decennaleExpire: '', rcpro: '', rcproExpire: '',
    acre: false, acreDebut: '', versementLib: false,
    declarationFreq: 'trimestriel', email: user?.email || '', tel: '',
  }));
  useEffect(() => { writeLS('freample_ae_profil', profil); }, [profil]);

  // ── Données écosystème ──
  const chantiers = readLS('freample_chantiers_custom');
  const projets = readLS('freample_projets');
  const devis = readLS('freample_devis');
  const factures = readLS('freample_ae_data', {}).factures || readLS('freample_factures_ae');
  const offres = readLS('freample_offres');
  const soustraitances = readLS('freample_soustraitance');

  // ── CA ──
  const activite = profil.activite || 'services';
  const plafond = PLAFONDS[activite];
  const caTotal = factures.filter(f => f.statut === 'payee').reduce((s,f) => s + (Number(f.montant)||0), 0);
  const caPct = plafond > 0 ? Math.round(caTotal / plafond * 100) : 0;

  // ── Chantiers du jour (AE = toujours dans l'équipe de ses propres chantiers) ──
  const mesChantiers = chantiers.filter(c => {
    const isOwner = c.creePar === 'ae' || c.aeId === user?.id;
    const isInEquipe = (c.equipe||[]).some(n => n.toLowerCase().includes((profil.nom||'').toLowerCase()));
    const isSoustraitant = (c.soustraitants||[]).some(s => s.aeId === user?.id || s.nom?.toLowerCase().includes((profil.nom||'').toLowerCase()));
    const isActive = c.dateDebut && c.dateDebut <= todayStr && (!c.dateFin || c.dateFin >= todayStr);
    const notDone = c.statut !== 'terminee' && c.statut !== 'annulee';
    return (isOwner || isInEquipe || isSoustraitant) && isActive && notDone;
  });

  // ── Alertes ──
  const alertes = useMemo(() => {
    const a = [];
    // Plafond CA
    if (caPct >= 95) a.push({ type:'rouge', msg:`CA a ${caPct}% du plafond (${fmt(plafond)}) — risque de depassement !` });
    else if (caPct >= 80) a.push({ type:'orange', msg:`CA a ${caPct}% du plafond — surveillez vos encaissements` });
    // Seuil TVA
    if (caTotal > SEUIL_TVA_TOLERANCE) a.push({ type:'rouge', msg:`CA depasse ${fmt(SEUIL_TVA_TOLERANCE)} — vous devez facturer la TVA` });
    else if (caTotal > SEUIL_TVA) a.push({ type:'orange', msg:`CA depasse ${fmt(SEUIL_TVA)} — seuil de franchise TVA atteint` });
    // Decennale
    if (profil.decennaleExpire) {
      const j = Math.round((new Date(profil.decennaleExpire) - new Date()) / 86400000);
      if (j < 0) a.push({ type:'rouge', msg:'Assurance decennale expiree — vous ne pouvez plus envoyer d\'offres' });
      else if (j < 15) a.push({ type:'rouge', msg:`Decennale expire dans ${j} jours` });
      else if (j < 30) a.push({ type:'orange', msg:`Decennale expire dans ${j} jours — pensez a renouveler` });
    } else a.push({ type:'orange', msg:'Decennale non renseignee' });
    // RC Pro
    if (profil.rcproExpire) {
      const j = Math.round((new Date(profil.rcproExpire) - new Date()) / 86400000);
      if (j < 0) a.push({ type:'rouge', msg:'RC Pro expiree' });
      else if (j < 30) a.push({ type:'orange', msg:`RC Pro expire dans ${j} jours` });
    }
    // CFE
    const mois = new Date().getMonth();
    if (mois >= 10) a.push({ type:'orange', msg:'CFE a payer avant le 15 decembre' });
    // ACRE premiere annee
    if (profil.acre && profil.acreDebut) {
      const fin = new Date(profil.acreDebut); fin.setFullYear(fin.getFullYear()+1);
      const j = Math.round((fin - new Date()) / 86400000);
      if (j > 0 && j < 60) a.push({ type:'bleu', msg:`ACRE : reduction de cotisations termine dans ${j} jours` });
    }
    return a;
  }, [caTotal, caPct, plafond, profil]);

  const prenom = user?.nom?.split(' ')[0] || 'vous';

  if (showOnboarding) return <OnboardingWizard type="ae" onComplete={() => setShowOnboarding(false)} />;

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:DS.font }}>
      {/* ── Header ── */}
      <div style={{ background:'#2C2520', padding:isMobile?'0 12px':'0 clamp(20px,4vw,40px)', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', gap:4, padding:6 }}>
            <span style={{ width:18, height:2, background:'#F5EFE0', borderRadius:1 }} />
            <span style={{ width:18, height:2, background:'#F5EFE0', borderRadius:1 }} />
          </button>
          <button onClick={() => navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:isMobile?14:16, fontWeight:900, color:'#F5EFE0', fontFamily:DS.font, letterSpacing:'-0.04em' }}>
            Freample<span style={{ color:DS.gold }}>.</span>
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {!isMobile && <span style={{ color:'#F5EFE0', fontSize:13 }}>{profil.prenom || prenom}</span>}
          <NotificationBell dark />
          <span style={{ fontSize:11, color:DS.gold, fontWeight:700 }}>Auto-entrepreneur</span>
        </div>
      </div>

      {/* ── Sidebar mobile ── */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:999 }} />}
      <div style={{ position:'fixed', top:0, left:0, bottom:0, width:280, background:'#fff', zIndex:1000, transform:menuOpen?'translateX(0)':'translateX(-100%)', transition:'transform .3s', boxShadow:menuOpen?'4px 0 20px rgba(0,0,0,0.1)':'none', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${DS.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:15, fontWeight:800 }}>Espace AE</span>
          <button onClick={() => setMenuOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:DS.muted }}>x</button>
        </div>
        <nav style={{ flex:1, padding:'8px 0', overflowY:'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 20px', background:tab===t.id?DS.goldLight:'transparent', color:tab===t.id?DS.gold:DS.text, border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===t.id?700:500, fontFamily:DS.font, textAlign:'left' }}>
              <t.Icon size={15} /> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${DS.border}` }}>
          <button onClick={async () => { await logout(); navigate('/login'); }} style={{ width:'100%', padding:'10px 16px', background:'transparent', color:'#DC2626', border:'1px solid #DC2626', borderRadius:8, cursor:'pointer', fontFamily:DS.font, fontSize:13, fontWeight:600 }}>Se deconnecter</button>
        </div>
      </div>

      {/* ── Alertes ── */}
      {alertes.length > 0 && (
        <div style={{ padding:isMobile?'8px 12px':'8px clamp(20px,4vw,40px)', display:'flex', flexDirection:'column', gap:4 }}>
          {alertes.slice(0,3).map((a,i) => (
            <div key={i} style={{ padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:600,
              background: a.type==='rouge'?DS.redBg : a.type==='orange'?DS.orangeBg : DS.blueBg,
              color: a.type==='rouge'?DS.red : a.type==='orange'?DS.orange : DS.blue,
              border:`1px solid ${a.type==='rouge'?DS.red+'30' : a.type==='orange'?DS.orange+'30' : DS.blue+'30'}` }}>
              {a.type==='rouge' ? '!!' : a.type==='orange' ? '!' : 'i'} {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* ── Contenu ── */}
      <div style={{ padding:isMobile?'16px 12px':'20px clamp(20px,4vw,40px)' }}>
        {/* Tabs desktop */}
        {!isMobile && (
          <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:`1px solid ${DS.border}`, paddingBottom:0, overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ ...BTN_O, display:'flex', alignItems:'center', gap:5, borderRadius:'10px 10px 0 0',
                  borderBottom:tab===t.id?`2px solid ${DS.gold}`:'2px solid transparent',
                  background:tab===t.id?DS.goldLight:'transparent', color:tab===t.id?DS.gold:DS.muted,
                  fontWeight:tab===t.id?700:500, border:'none', fontSize:12, padding:'10px 14px', whiteSpace:'nowrap' }}>
                <t.Icon size={13}/> {t.label}
              </button>
            ))}
          </div>
        )}

        {tab === 'journee' && <TabJournee chantiers={mesChantiers} profil={profil} caTotal={caTotal} plafond={plafond} caPct={caPct} prenom={prenom} />}
        {tab === 'projets' && <TabProjets projets={projets} profil={profil} user={user} />}
        {tab === 'soustraitance' && <TabSousTraitance soustraitances={soustraitances} profil={profil} user={user} />}
        {tab === 'devis' && <TabDevisFactures profil={profil} />}
        {tab === 'finances' && <TabFinances profil={profil} caTotal={caTotal} plafond={plafond} caPct={caPct} />}
        {tab === 'entreprise' && <TabEntreprise profil={profil} setProfil={setProfil} />}
        {tab === 'parametres' && <TabParametres profil={profil} setProfil={setProfil} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 1 : MA JOURNEE ──
// ══════════════════════════════════════════════════
function TabJournee({ chantiers, profil, caTotal, plafond, caPct, prenom }) {
  const [activeSection, setActiveSection] = useState(null);
  const [actionChantier, setActionChantier] = useState(null);

  // Planning semaine
  const semaine = useMemo(() => {
    const jours = [];
    const d = new Date();
    const lundi = new Date(d); lundi.setDate(d.getDate() - (d.getDay()||7) + 1);
    for (let i = 0; i < 7; i++) {
      const j = new Date(lundi); j.setDate(lundi.getDate() + i);
      const dateStr = j.toISOString().slice(0,10);
      const chantiersJour = (readLS('freample_chantiers_custom')).filter(c => {
        const isActive = c.dateDebut && c.dateDebut <= dateStr && (!c.dateFin || c.dateFin >= dateStr);
        const notDone = c.statut !== 'terminee' && c.statut !== 'annulee';
        return isActive && notDone;
      });
      jours.push({ date:j, dateStr, label:j.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'}), isToday:dateStr===todayStr, chantiers:chantiersJour });
    }
    return jours;
  }, []);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Bonjour + KPIs rapides */}
      <div>
        <h2 style={{ fontSize:20, fontWeight:900, color:DS.text, margin:0 }}>Bonjour {prenom}</h2>
        <p style={{ fontSize:13, color:DS.subtle, margin:'4px 0 0' }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} — {chantiers.length} mission{chantiers.length>1?'s':''} aujourd'hui</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:10 }}>
        <div style={CARD}>
          <span style={{ fontSize:11, color:DS.subtle }}>CA cumule</span>
          <div style={{ fontSize:20, fontWeight:800, color:DS.gold }}>{fmt(caTotal)}</div>
          <div style={{ height:4, background:DS.borderLight, borderRadius:2, marginTop:6 }}>
            <div style={{ width:`${Math.min(caPct,100)}%`, height:'100%', background:caPct>90?DS.red:caPct>70?DS.orange:DS.gold, borderRadius:2 }} />
          </div>
          <span style={{ fontSize:10, color:DS.subtle }}>{caPct}% du plafond</span>
        </div>
        <div style={CARD}>
          <span style={{ fontSize:11, color:DS.subtle }}>Missions en cours</span>
          <div style={{ fontSize:20, fontWeight:800 }}>{chantiers.length}</div>
        </div>
        <div style={CARD}>
          <span style={{ fontSize:11, color:DS.subtle }}>A facturer</span>
          <div style={{ fontSize:20, fontWeight:800, color:DS.orange }}>{readLS('freample_devis').filter(d=>d.statut==='accepte'&&d.source!=='facture').length}</div>
        </div>
      </div>

      {/* Missions du jour */}
      <div>
        <p style={SECTION_TITLE}>Mes missions du jour</p>
        {chantiers.length === 0 && (
          <div style={{ ...CARD, textAlign:'center', padding:30, marginTop:8 }}>
            <p style={{ fontSize:14, fontWeight:600, color:DS.muted }}>Pas de mission aujourd'hui</p>
            <p style={{ fontSize:12, color:DS.subtle }}>Consultez les projets ou votre planning</p>
          </div>
        )}
        {chantiers.map(c => (
          <div key={c.id} style={{ ...CARD, marginTop:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:DS.text, margin:0 }}>{c.titre || c.metier || 'Mission'}</p>
                <p style={{ fontSize:12, color:DS.subtle, margin:'2px 0 0' }}>{c.adresse || c.ville || ''} {c.client ? `— ${c.client}` : ''}</p>
                {c.isSoustraitance && <span style={BADGE(DS.blueBg, DS.blue)}>Sous-traitance</span>}
              </div>
              <span style={BADGE(
                c.statut==='en_cours'?DS.greenBg:DS.orangeBg,
                c.statut==='en_cours'?DS.green:DS.orange
              )}>{c.statut==='en_cours'?'En cours':'A venir'}</span>
            </div>

            {/* Actions terrain */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px, 1fr))', gap:6 }}>
              {[
                { id:'achat', label:'Achat fournisseur' },
                { id:'carburant', label:'Plein carburant' },
                { id:'signalement', label:'Signaler probleme' },
                { id:'rapport', label:'Rapport du jour' },
                { id:'frais', label:'Note de frais' },
                { id:'stock', label:'Prendre du stock' },
              ].map(btn => (
                <button key={btn.id} onClick={() => setActionChantier(actionChantier===c.id+btn.id ? null : c.id+btn.id)}
                  style={{ ...BTN_O, fontSize:11, padding:'8px 6px', textAlign:'center',
                    background:actionChantier===c.id+btn.id?'#0A0A0A':'transparent',
                    color:actionChantier===c.id+btn.id?'#fff':btn.id==='signalement'?'#DC2626':'#0A0A0A',
                    borderColor:btn.id==='signalement'?'#DC2626':'#E8E6E1' }}>
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Formulaires actions (simplifié — même pattern que salarié) */}
            {actionChantier===c.id+'rapport' && <ActionRapport chantierId={c.id} profil={profil} onDone={() => setActionChantier(null)} />}
            {actionChantier===c.id+'signalement' && <ActionSignalement chantierId={c.id} profil={profil} onDone={() => setActionChantier(null)} />}
            {actionChantier===c.id+'carburant' && <ActionCarburant chantier={c} profil={profil} onDone={() => setActionChantier(null)} />}
            {actionChantier===c.id+'frais' && <ActionFrais chantierId={c.id} titre={c.titre} profil={profil} onDone={() => setActionChantier(null)} />}
            {actionChantier===c.id+'achat' && <ActionAchat chantierId={c.id} profil={profil} onDone={() => setActionChantier(null)} />}
            {actionChantier===c.id+'stock' && <ActionStock chantierId={c.id} onDone={() => setActionChantier(null)} />}
          </div>
        ))}
      </div>

      {/* Planning semaine */}
      <div>
        <p style={SECTION_TITLE}>Ma semaine</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6, marginTop:8 }}>
          {semaine.map(j => (
            <div key={j.dateStr} style={{ ...CARD, padding:'10px 8px', textAlign:'center',
              border:j.isToday?`2px solid ${DS.gold}`:`1px solid ${DS.border}`,
              background:j.isToday?DS.goldLight:'#fff', minHeight:80 }}>
              <div style={{ fontSize:11, fontWeight:700, color:j.isToday?DS.gold:DS.muted, textTransform:'uppercase' }}>{j.label}</div>
              {j.chantiers.length === 0 && <div style={{ fontSize:10, color:DS.borderLight, marginTop:8 }}>—</div>}
              {j.chantiers.slice(0,2).map(c => (
                <div key={c.id} style={{ fontSize:10, fontWeight:600, color:DS.text, marginTop:4, padding:'3px 4px', background:DS.bgSoft, borderRadius:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {c.titre || c.metier || 'Mission'}
                </div>
              ))}
              {j.chantiers.length > 2 && <div style={{ fontSize:9, color:DS.subtle, marginTop:2 }}>+{j.chantiers.length-2}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Actions terrain (composants réutilisables) ──
function ActionRapport({ chantierId, profil, onDone }) {
  const [note, setNote] = useState('');
  return (
    <div style={{ marginTop:8, padding:14, background:DS.bgSoft, borderRadius:10, border:`1px solid ${DS.border}` }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Rapport du jour</div>
      <textarea value={note} onChange={e=>setNote(e.target.value)} style={{...INP, minHeight:60}} placeholder="Ce qui a ete fait aujourd'hui..." />
      <button onClick={() => {
        if (!note.trim()) return;
        const rapports = readLS(`freample_rapports_${chantierId}`);
        rapports.push({ id:Date.now(), date:todayStr, note, salarie:profil.nom||'AE' });
        writeLS(`freample_rapports_${chantierId}`, rapports);
        const journal = readLS(`freample_journal_${chantierId}`);
        const entry = journal.find(j=>j.date===todayStr);
        if (entry) entry.description = (entry.description?entry.description+'\n':'')+note;
        else journal.push({ date:todayStr, meteo:'', nbOuvriers:1, description:note, problemes:'' });
        writeLS(`freample_journal_${chantierId}`, journal);
        onDone();
      }} style={{...BTN, fontSize:12, marginTop:8}}>Enregistrer</button>
    </div>
  );
}

function ActionSignalement({ chantierId, profil, onDone }) {
  const [form, setForm] = useState({ type:'defaut', desc:'' });
  return (
    <div style={{ marginTop:8, padding:14, background:DS.redBg, borderRadius:10, border:'1px solid #DC262640' }}>
      <div style={{ fontSize:13, fontWeight:700, color:DS.red, marginBottom:8 }}>Signaler un probleme</div>
      <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{...INP, marginBottom:8}}>
        <option value="defaut">Defaut</option><option value="malfacon">Malfacon</option><option value="securite">Securite</option><option value="materiel_manquant">Materiel manquant</option><option value="autre">Autre</option>
      </select>
      <textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} style={{...INP, minHeight:60}} placeholder="Decrivez le probleme..." />
      <button onClick={() => {
        if (!form.desc.trim()) return;
        const s = readLS(`freample_signalements_${chantierId}`);
        s.push({ id:Date.now(), date:todayStr, type:form.type, description:form.desc, salarie:profil.nom||'AE', chantierId });
        writeLS(`freample_signalements_${chantierId}`, s);
        onDone();
      }} style={{...BTN, background:'#DC2626', fontSize:12, marginTop:8}}>Envoyer</button>
    </div>
  );
}

function ActionCarburant({ chantier, profil, onDone }) {
  const [form, setForm] = useState({ litres:'', montant:'', km:'' });
  return (
    <div style={{ marginTop:8, padding:14, background:DS.bgSoft, borderRadius:10, border:`1px solid ${DS.border}` }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Plein carburant</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
        <div><label style={{ fontSize:10, color:DS.muted }}>Litres</label><input type="number" step="0.1" value={form.litres} onChange={e=>setForm(f=>({...f,litres:e.target.value}))} style={INP} /></div>
        <div><label style={{ fontSize:10, color:DS.muted }}>Montant</label><input type="number" step="0.01" value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value}))} style={INP} /></div>
        <div><label style={{ fontSize:10, color:DS.muted }}>Km</label><input type="number" value={form.km} onChange={e=>setForm(f=>({...f,km:e.target.value}))} style={INP} /></div>
      </div>
      <button onClick={() => {
        const l=parseFloat(form.litres), m=parseFloat(form.montant); if(!l||!m) return;
        const vid = chantier.vehicule?.id || chantier.id;
        const entries = readLS(`freample_carburant_${vid}`);
        entries.push({ id:Date.now(), date:todayStr, litres:l, montant:m, km:parseInt(form.km)||0, employe:profil.nom||'AE', chantier:chantier.titre });
        writeLS(`freample_carburant_${vid}`, entries);
        // Aussi en depenses AE
        const deps = readLS('freample_ae_depenses');
        deps.push({ id:Date.now(), date:todayStr, categorie:'Carburant', description:`Plein ${l}L`, montant:m, chantierId:chantier.id });
        writeLS('freample_ae_depenses', deps);
        onDone();
      }} style={{...BTN, fontSize:12}}>Enregistrer</button>
    </div>
  );
}

function ActionFrais({ chantierId, titre, profil, onDone }) {
  const [form, setForm] = useState({ categorie:'Repas', description:'', montant:'' });
  return (
    <div style={{ marginTop:8, padding:14, background:DS.bgSoft, borderRadius:10, border:`1px solid ${DS.border}` }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Note de frais</div>
      <select value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} style={{...INP, marginBottom:6}}>
        <option>Repas</option><option>Transport</option><option>Peage</option><option>Materiel</option><option>Autre</option>
      </select>
      <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{...INP, marginBottom:6}} placeholder="Description" />
      <input type="number" step="0.01" value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value}))} style={{...INP, marginBottom:8}} placeholder="Montant" />
      <button onClick={() => {
        const m=Number(form.montant); if(!m||!form.description) return;
        const frais = readLS('freample_frais_chantier');
        frais.push({ id:Date.now(), chantierId, chantier:titre, salarie:profil.nom||'AE', date:todayStr, categorie:form.categorie, description:form.description, montant:m });
        writeLS('freample_frais_chantier', frais);
        const deps = readLS('freample_ae_depenses');
        deps.push({ id:Date.now(), date:todayStr, categorie:form.categorie, description:form.description, montant:m, chantierId });
        writeLS('freample_ae_depenses', deps);
        onDone();
      }} style={{...BTN, fontSize:12}}>Valider</button>
    </div>
  );
}

function ActionAchat({ chantierId, profil, onDone }) {
  const [form, setForm] = useState({ fournisseur:'', article:'', quantite:'', prix:'', tva:'20' });
  return (
    <div style={{ marginTop:8, padding:14, background:DS.bgSoft, borderRadius:10, border:`1px solid ${DS.border}` }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Achat fournisseur</div>
      <input value={form.fournisseur} onChange={e=>setForm(f=>({...f,fournisseur:e.target.value}))} style={{...INP, marginBottom:6}} placeholder="Fournisseur (ex: Point P)" />
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:6, marginBottom:8 }}>
        <input value={form.article} onChange={e=>setForm(f=>({...f,article:e.target.value}))} style={INP} placeholder="Article" />
        <input type="number" value={form.quantite} onChange={e=>setForm(f=>({...f,quantite:e.target.value}))} style={INP} placeholder="Qte" />
        <input type="number" step="0.01" value={form.prix} onChange={e=>setForm(f=>({...f,prix:e.target.value}))} style={INP} placeholder="Prix HT" />
      </div>
      <button onClick={() => {
        if(!form.fournisseur||!form.article||!Number(form.prix)) return;
        const ht = Number(form.quantite||1)*Number(form.prix);
        const achats = readLS(`freample_matieres_achat_${chantierId}`);
        achats.push({ id:Date.now(), fournisseur:form.fournisseur, article:form.article, quantite:Number(form.quantite||1), prixUnitaire:Number(form.prix), montantHT:ht, tva:Number(form.tva), date:todayStr, chantierId });
        writeLS(`freample_matieres_achat_${chantierId}`, achats);
        const deps = readLS('freample_ae_depenses');
        deps.push({ id:Date.now(), date:todayStr, categorie:'Materiaux', description:`${form.article} chez ${form.fournisseur}`, montant:ht, chantierId });
        writeLS('freample_ae_depenses', deps);
        onDone();
      }} style={{...BTN, fontSize:12}}>Valider</button>
    </div>
  );
}

function ActionStock({ chantierId, onDone }) {
  const [qties, setQties] = useState({});
  const articles = readLS('freample_stock_articles');
  if (articles.length === 0) return <div style={{ marginTop:8, padding:14, background:DS.bgSoft, borderRadius:10, fontSize:12, color:DS.muted }}>Aucun article en stock</div>;
  return (
    <div style={{ marginTop:8, padding:14, background:DS.bgSoft, borderRadius:10, border:`1px solid ${DS.border}` }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Prendre du stock</div>
      {articles.map((art,idx) => (
        <div key={art.id||idx} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:idx<articles.length-1?`1px solid ${DS.borderLight}`:'none' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600 }}>{art.designation}</div>
            <div style={{ fontSize:10, color:DS.muted }}>Dispo: {art.quantite} {art.unite}</div>
          </div>
          <input type="number" min="0" max={art.quantite} value={qties[art.id||idx]||''} onChange={e=>setQties(p=>({...p,[art.id||idx]:e.target.value}))} style={{...INP, width:70}} placeholder="Qte" />
        </div>
      ))}
      <button onClick={() => {
        const arts = readLS('freample_stock_articles');
        const mouvements = readLS('freample_stock_mouvements');
        let count = 0;
        arts.forEach((art,idx) => {
          const qty = Number(qties[art.id||idx]); if(!qty||qty<=0) return;
          const real = Math.min(qty, art.quantite); art.quantite -= real; count += real;
          mouvements.push({ id:Date.now()+idx, type:'sortie', article:art.designation, quantite:real, chantier:'AE', date:todayStr, chantierId });
        });
        if (count > 0) { writeLS('freample_stock_articles', arts); writeLS('freample_stock_mouvements', mouvements); }
        onDone();
      }} style={{...BTN, fontSize:12, marginTop:8}}>Valider la sortie</button>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 2 : PROJETS CLIENTS (filtrés par métier) ──
// ══════════════════════════════════════════════════
function TabProjets({ projets, profil, user }) {
  const [selected, setSelected] = useState(null);
  const [offreMsg, setOffreMsg] = useState('');
  const [offrePrix, setOffrePrix] = useState('');
  const [sent, setSent] = useState(false);

  const mesMetiers = (profil.metiers || []).map(m => m.toLowerCase());
  const filtered = projets.filter(p => {
    if (p.statut !== 'publie') return false;
    if (mesMetiers.length === 0) return true;
    const metierProjet = (p.metier||'').toLowerCase();
    return mesMetiers.some(m => metierProjet.includes(m) || m.includes(metierProjet));
  });

  // Decennale check
  const decennaleValide = profil.decennaleExpire && new Date(profil.decennaleExpire) > new Date();

  const envoyerOffre = () => {
    if (!offrePrix || !selected) return;
    const offres = readLS('freample_offres');
    offres.push({ id:Date.now(), projetId:selected.id, artisanNom:user?.nom||profil.nom, prix:Number(offrePrix), message:offreMsg, statut:'proposee', createdAt:new Date().toISOString(), type:'ae' });
    writeLS('freample_offres', offres);
    // Devis auto
    const devis = readLS('freample_devis');
    const num = `DEV-${new Date().getFullYear()}-${String(devis.length+1).padStart(3,'0')}`;
    devis.push({ id:Date.now(), numero:num, projetId:selected.id, client:selected.clientNom, objet:selected.metier, montantHT:Number(offrePrix), tva:0, mentionTVA:'TVA non applicable, art. 293B du CGI', montantTTC:Number(offrePrix), source:'marketplace', statut:'envoye', date:todayStr, aeNom:profil.nom });
    writeLS('freample_devis', devis);
    setSent(true);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={SECTION_TITLE}>Projets clients — {filtered.length} dans vos metiers</p>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {(profil.metiers||[]).map(m => <span key={m} style={BADGE(DS.goldLight, DS.gold)}>{m}</span>)}
        </div>
      </div>

      {!decennaleValide && (
        <div style={{ padding:'10px 14px', background:DS.orangeBg, border:`1px solid ${DS.orange}30`, borderRadius:8, fontSize:12, color:DS.orange, fontWeight:600 }}>
          Decennale non valide — vous ne pouvez pas envoyer d'offres. Mettez a jour dans "Mon entreprise".
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ ...CARD, textAlign:'center', padding:30 }}>
          <p style={{ fontWeight:600, color:DS.muted }}>Aucun projet disponible pour vos metiers</p>
          <p style={{ fontSize:12, color:DS.subtle }}>Ajoutez des corps de metier dans Parametres pour voir plus de projets</p>
        </div>
      )}

      {selected && !sent ? (
        <div style={CARD}>
          <button onClick={() => { setSelected(null); setSent(false); }} style={{...BTN_O, fontSize:12, marginBottom:12}}>Retour</button>
          <h3 style={{ fontSize:16, fontWeight:800, margin:'0 0 4px' }}>{selected.metier}</h3>
          <p style={{ fontSize:13, color:DS.subtle }}>{selected.description || 'Pas de description'}</p>
          <p style={{ fontSize:12, color:DS.muted }}>{selected.ville} — Budget: {fmt(selected.budget||0)} — {selected.clientNom}</p>

          <div style={{ marginTop:16 }}>
            <label style={{ fontSize:12, fontWeight:700 }}>Votre prix (HT)</label>
            <input type="number" value={offrePrix} onChange={e=>setOffrePrix(e.target.value)} style={{...INP, marginTop:4, marginBottom:8}} placeholder="Montant HT" />
            <label style={{ fontSize:12, fontWeight:700 }}>Message au client</label>
            <textarea value={offreMsg} onChange={e=>setOffreMsg(e.target.value)} style={{...INP, marginTop:4, minHeight:60}} placeholder="Presentez-vous et votre approche..." />
            <p style={{ fontSize:10, color:DS.subtle, margin:'6px 0' }}>Mention automatique : "TVA non applicable, art. 293B du CGI"</p>
            <button onClick={envoyerOffre} disabled={!decennaleValide} style={{...BTN_GOLD, marginTop:8, opacity:decennaleValide?1:0.5}}>Envoyer l'offre</button>
          </div>
        </div>
      ) : sent ? (
        <div style={{ ...CARD, textAlign:'center', padding:30 }}>
          <IconCheck size={32} style={{ color:DS.green, marginBottom:8 }} />
          <p style={{ fontSize:15, fontWeight:700 }}>Offre envoyee !</p>
          <p style={{ fontSize:12, color:DS.subtle }}>Le client sera notifie. Vous recevrez une reponse par notification.</p>
          <button onClick={() => { setSelected(null); setSent(false); setOffrePrix(''); setOffreMsg(''); }} style={{...BTN_O, marginTop:12, fontSize:12}}>Retour aux projets</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => decennaleValide && setSelected(p)}
              style={{ ...CARD, cursor:decennaleValide?'pointer':'not-allowed', opacity:decennaleValide?1:0.6, transition:'box-shadow .2s' }}
              onMouseEnter={e => decennaleValide && (e.currentTarget.style.boxShadow=DS.shadow?.md||'0 4px 16px rgba(0,0,0,0.06)')}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, margin:0 }}>{p.metier}</p>
                  <p style={{ fontSize:12, color:DS.subtle, margin:'2px 0 0' }}>{p.ville} — {p.clientNom}</p>
                </div>
                <span style={{ fontSize:15, fontWeight:800, color:DS.gold }}>{fmt(p.budget||0)}</span>
              </div>
              {p.description && <p style={{ fontSize:12, color:DS.muted, marginTop:6, lineHeight:1.4 }}>{p.description.slice(0,120)}{p.description.length>120?'...':''}</p>}
              <div style={{ fontSize:11, color:DS.subtle, marginTop:6 }}>{p.date?.slice(0,10)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 3 : SOUS-TRAITANCE ──
// ══════════════════════════════════════════════════
function TabSousTraitance({ soustraitances, profil, user }) {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [prix, setPrix] = useState('');
  const [sent, setSent] = useState(false);

  const mesMetiers = (profil.metiers||[]).map(m => m.toLowerCase());
  const demandes = (soustraitances||[]).filter(s => {
    if (s.statut !== 'ouverte') return false;
    const metier = (s.metier||'').toLowerCase();
    return mesMetiers.length === 0 || mesMetiers.some(m => metier.includes(m) || m.includes(metier));
  });

  const repondre = () => {
    if (!prix || !selected) return;
    const all = readLS('freample_soustraitance');
    const idx = all.findIndex(s => s.id === selected.id);
    if (idx >= 0) {
      if (!all[idx].reponses) all[idx].reponses = [];
      all[idx].reponses.push({ aeId:user?.id, aeNom:profil.nom||user?.nom, prix:Number(prix), message:msg, date:todayStr, statut:'proposee' });
      writeLS('freample_soustraitance', all);
    }
    setSent(true);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <p style={SECTION_TITLE}>Demandes de sous-traitance — {demandes.length} dans vos metiers</p>
      <p style={{ fontSize:12, color:DS.subtle, marginTop:-8 }}>Des chefs d'entreprise cherchent un AE pour intervenir sur leurs chantiers. Auto-liquidation TVA appliquee.</p>

      {demandes.length === 0 && (
        <div style={{ ...CARD, textAlign:'center', padding:30 }}>
          <p style={{ fontWeight:600, color:DS.muted }}>Aucune demande de sous-traitance disponible</p>
          <p style={{ fontSize:12, color:DS.subtle }}>Les patrons publieront des demandes quand ils auront besoin de votre metier</p>
        </div>
      )}

      {selected && !sent ? (
        <div style={CARD}>
          <button onClick={() => { setSelected(null); setSent(false); }} style={{...BTN_O, fontSize:12, marginBottom:12}}>Retour</button>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={BADGE(DS.blueBg, DS.blue)}>Sous-traitance</span>
            <span style={BADGE(DS.orangeBg, DS.orange)}>Auto-liquidation TVA</span>
          </div>
          <h3 style={{ fontSize:16, fontWeight:800, margin:'0 0 4px' }}>{selected.metier}</h3>
          <p style={{ fontSize:13, color:DS.subtle }}>{selected.description}</p>
          <p style={{ fontSize:12, color:DS.muted }}>Patron: {selected.patronNom} — Chantier: {selected.chantierTitre} — {selected.ville}</p>
          <p style={{ fontSize:12, color:DS.muted }}>Du {selected.dateDebut} au {selected.dateFin} — Budget: {fmt(selected.budget||0)}</p>

          <div style={{ marginTop:16 }}>
            <label style={{ fontSize:12, fontWeight:700 }}>Votre tarif (HT, hors TVA — auto-liquidation)</label>
            <input type="number" value={prix} onChange={e=>setPrix(e.target.value)} style={{...INP, marginTop:4, marginBottom:8}} />
            <label style={{ fontSize:12, fontWeight:700 }}>Message</label>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} style={{...INP, marginTop:4, minHeight:60}} placeholder="Votre experience, disponibilite..." />
            <button onClick={repondre} style={{...BTN_GOLD, marginTop:8}}>Proposer mes services</button>
          </div>
        </div>
      ) : sent ? (
        <div style={{ ...CARD, textAlign:'center', padding:30 }}>
          <IconCheck size={32} style={{ color:DS.green, marginBottom:8 }} />
          <p style={{ fontSize:15, fontWeight:700 }}>Proposition envoyee !</p>
          <p style={{ fontSize:12, color:DS.subtle }}>Le patron recevra votre proposition. Vous apparaitrez comme sous-traitant dans l'equipe du chantier.</p>
          <button onClick={() => { setSelected(null); setSent(false); setPrix(''); setMsg(''); }} style={{...BTN_O, marginTop:12, fontSize:12}}>Retour</button>
        </div>
      ) : (
        demandes.map(s => (
          <div key={s.id} onClick={() => setSelected(s)} style={{ ...CARD, cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ display:'flex', gap:6, marginBottom:4 }}>
                  <span style={BADGE(DS.blueBg, DS.blue)}>Sous-traitance</span>
                  <span style={{ fontSize:11, color:DS.subtle }}>{s.metier}</span>
                </div>
                <p style={{ fontSize:14, fontWeight:700, margin:0 }}>{s.chantierTitre || 'Chantier'}</p>
                <p style={{ fontSize:12, color:DS.subtle, margin:'2px 0 0' }}>Patron: {s.patronNom} — {s.ville}</p>
                <p style={{ fontSize:11, color:DS.muted }}>{s.dateDebut} → {s.dateFin}</p>
              </div>
              <span style={{ fontSize:15, fontWeight:800, color:DS.gold }}>{fmt(s.budget||0)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 4 : DEVIS & FACTURES ──
// ══════════════════════════════════════════════════
function TabDevisFactures({ profil }) {
  const [sousTab, setSousTab] = useState('devis');
  const [showForm, setShowForm] = useState(false);
  const [editingDevis, setEditingDevis] = useState(null); // devis en cours de modif
  const [devisAEnvoyer, setDevisAEnvoyer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const devis = readLS('freample_devis').filter(d => d.aeNom || d.source === 'ae');
  const facturesAE = readLS('freample_factures_ae');

  const handleDevisSoumis = (devisData) => {
    const all = readLS('freample_devis');
    const action = devisData._action || 'brouillon';
    const editingId = devisData._editingId;
    let finalDevis;

    if (editingId) {
      // Mode modification
      const idx = all.findIndex(d => d.id === editingId);
      if (idx >= 0) {
        const old = all[idx];
        // Si le devis était déjà envoyé/signé, on crée une V2 au lieu de modifier
        if (old.statut !== 'brouillon') {
          const parentVersion = old.version || 1;
          const newNum = `${old.numero.split('-V')[0]}-V${parentVersion + 1}`;
          finalDevis = {
            ...devisData,
            id: Date.now(), numero: newNum,
            version: parentVersion + 1, parentId: old.id,
            client: devisData.client?.nom || '', clientEmail: devisData.client?.email || '',
            clientTel: devisData.client?.telephone || '', clientAdresse: devisData.client?.adresse || '',
            adresseChantier: devisData.client?.adresseChantier || '',
            montantHT: devisData.totalHT, tva: devisData.totalTVA, montantTTC: devisData.totalTTC,
            source: old.source || 'manuel', statut: action === 'envoyer' ? 'envoye' : 'brouillon',
            date: todayStr, aeNom: profil.nom, isAE: true,
          };
          // Archiver ancien
          all[idx] = { ...old, statut: 'archive', remplaceParId: finalDevis.id };
          all.push(finalDevis);
        } else {
          // Simple mise à jour du brouillon
          finalDevis = {
            ...old,
            client: devisData.client?.nom || '', clientEmail: devisData.client?.email || '',
            clientTel: devisData.client?.telephone || '', clientAdresse: devisData.client?.adresse || '',
            adresseChantier: devisData.client?.adresseChantier || '',
            objet: devisData.objet, lignes: devisData.lignes, lots: devisData.lots,
            options: devisData.options, echeancier: devisData.echeancier,
            conditions: devisData.conditions, notes: devisData.notes,
            emetteur: devisData.emetteur,
            montantHT: devisData.totalHT, tva: devisData.totalTVA, montantTTC: devisData.totalTTC,
            tvaDetails: devisData.tvaDetails, parType: devisData.parType,
            validiteJours: devisData.validiteJours, dateDebut: devisData.dateDebut, dureeEstimee: devisData.dureeEstimee,
            remiseGlobale: devisData.remiseGlobale,
            statut: action === 'envoyer' ? 'envoye' : 'brouillon',
            modifieLe: new Date().toISOString(),
          };
          all[idx] = finalDevis;
        }
      }
    } else {
      // Nouveau devis
      const num = `DEV-${new Date().getFullYear()}-${String(all.length + 1).padStart(3, '0')}`;
      finalDevis = {
        id: Date.now(), numero: num, version: 1,
        client: devisData.client?.nom || '', clientEmail: devisData.client?.email || '',
        clientTel: devisData.client?.telephone || '', clientAdresse: devisData.client?.adresse || '',
        adresseChantier: devisData.client?.adresseChantier || '',
        objet: devisData.objet, lignes: devisData.lignes, lots: devisData.lots,
        options: devisData.options, echeancier: devisData.echeancier,
        conditions: devisData.conditions, notes: devisData.notes,
        emetteur: devisData.emetteur,
        montantHT: devisData.totalHT, tva: devisData.totalTVA, montantTTC: devisData.totalTTC,
        tvaDetails: devisData.tvaDetails, parType: devisData.parType,
        mentionTVA: devisData.mentionTVA || 'TVA non applicable, art. 293B du CGI',
        validiteJours: devisData.validiteJours, dateDebut: devisData.dateDebut, dureeEstimee: devisData.dureeEstimee,
        remiseGlobale: devisData.remiseGlobale,
        source: 'manuel', statut: action === 'envoyer' ? 'envoye' : 'brouillon',
        date: todayStr, aeNom: profil.nom, isAE: true,
      };
      all.push(finalDevis);
    }

    writeLS('freample_devis', all);
    setShowForm(false); setEditingDevis(null);
    setRefreshKey(k => k + 1);
    if (action === 'envoyer') setDevisAEnvoyer(finalDevis);
    else if (action === 'pdf') setTimeout(() => window.print(), 300);
  };

  const supprimerDevis = (id) => {
    if (!window.confirm('Supprimer ce brouillon ? Cette action est irréversible.')) return;
    const all = readLS('freample_devis');
    writeLS('freample_devis', all.filter(d => d.id !== id));
    setRefreshKey(k => k + 1);
  };

  const modifierDevis = (d) => {
    // Transformer le devis en format initialData pour DevisFormulaire
    setEditingDevis({
      ...d,
      client: { nom: d.client, email: d.clientEmail, telephone: d.clientTel, adresse: d.clientAdresse, adresseChantier: d.adresseChantier },
    });
    setShowForm(true);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => setSousTab('devis')} style={{...BTN, background:sousTab==='devis'?DS.gold:'transparent', color:sousTab==='devis'?'#fff':DS.muted, border:sousTab!=='devis'?`1px solid ${DS.border}`:'none'}}>Devis</button>
        <button onClick={() => setSousTab('factures')} style={{...BTN, background:sousTab==='factures'?DS.gold:'transparent', color:sousTab==='factures'?'#fff':DS.muted, border:sousTab!=='factures'?`1px solid ${DS.border}`:'none'}}>Factures</button>
        <div style={{ flex:1 }} />
        <button onClick={() => setShowForm(true)} style={BTN_GOLD}>Nouveau devis</button>
      </div>

      {showForm && (
        <DevisFormulaire
          isAE={true}
          user={{ entrepriseType: 'ae' }}
          initialData={editingDevis}
          onSoumettre={handleDevisSoumis}
          onAnnuler={() => { setShowForm(false); setEditingDevis(null); }}
          onOuvrirProfil={() => { setShowForm(false); setEditingDevis(null); /* TODO: naviguer vers onglet entreprise */ }}
        />
      )}

      {/* Confirmation + modal envoi apres creation */}
      {devisAEnvoyer && (
        <div style={{ ...CARD, borderLeft:`4px solid ${DS.green}`, background:'#F0FDF4' }}>
          <div style={{ fontSize:14, fontWeight:800, color:DS.green, marginBottom:4 }}>Devis {devisAEnvoyer.numero} créé</div>
          <div style={{ fontSize:12, color:DS.muted, marginBottom:10 }}>Envoyez-le maintenant à votre client par email.</div>
          <div style={{ display:'flex', gap:8 }}>
            <EnvoyerDevisButton devis={devisAEnvoyer} label="Envoyer maintenant" />
            <button onClick={() => setDevisAEnvoyer(null)} style={{ ...BTN_O, fontSize:12 }}>Plus tard</button>
          </div>
        </div>
      )}

      {sousTab === 'devis' && (
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['N','Client','Objet','Montant','Source','Statut','Date','Actions'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {devis.length===0 && <tr><td colSpan={8} style={{...TD, textAlign:'center', color:DS.muted}}>Aucun devis</td></tr>}
              {devis.filter(d => d.statut !== 'archive').map(d => (
                <tr key={d.id}>
                  <td style={TD}><span style={{ fontWeight:600, fontSize:12 }}>{d.numero}</span>{d.version > 1 && <span style={{ fontSize: 10, color: DS.gold, fontWeight: 700, marginLeft: 4 }}>V{d.version}</span>}</td>
                  <td style={TD}>{d.client}</td>
                  <td style={TD}>{d.objet}</td>
                  <td style={{...TD, fontWeight:700}}>{fmt(d.montantHT||d.montantTTC||0)}</td>
                  <td style={TD}><span style={BADGE(d.source==='marketplace'?DS.goldLight:d.source==='lien_direct'?DS.blueBg:DS.bgMuted, d.source==='marketplace'?DS.gold:d.source==='lien_direct'?DS.blue:DS.subtle)}>{d.source||'manuel'}</span></td>
                  <td style={TD}><span style={BADGE(d.statut==='signe'||d.statut==='accepte'?DS.greenBg:d.statut==='envoye'?DS.blueBg:DS.bgMuted, d.statut==='signe'||d.statut==='accepte'?DS.green:d.statut==='envoye'?DS.blue:DS.subtle)}>{d.statut}</span></td>
                  <td style={{...TD, fontSize:12, color:DS.subtle}}>{d.date}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {d.statut !== 'signe' && d.statut !== 'accepte' && d.statut !== 'refuse' && (
                        <button onClick={() => modifierDevis(d)} style={{ padding: '4px 8px', background: 'transparent', color: DS.text, border: `1px solid ${DS.border}`, borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                          {d.statut === 'brouillon' ? 'Modifier' : 'Créer V2'}
                        </button>
                      )}
                      {d.statut === 'brouillon' && (
                        <button onClick={() => supprimerDevis(d.id)} style={{ padding: '4px 8px', background: DS.redBg, color: DS.red, border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                          Supprimer
                        </button>
                      )}
                      {(d.statut === 'brouillon' || d.statut === 'envoye' || d.statut === 'modif_demandee') && (
                        <EnvoyerDevisButton devis={d} size="sm" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sousTab === 'factures' && (
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['N','Client','Montant','Statut','Date'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {facturesAE.length===0 && <tr><td colSpan={5} style={{...TD, textAlign:'center', color:DS.muted}}>Aucune facture</td></tr>}
              {facturesAE.map(f => (
                <tr key={f.id}>
                  <td style={TD}><span style={{ fontWeight:600, fontSize:12 }}>{f.numero}</span></td>
                  <td style={TD}>{f.client}</td>
                  <td style={{...TD, fontWeight:700}}>{fmt(f.montant||0)}</td>
                  <td style={TD}><span style={BADGE(f.statut==='payee'?DS.greenBg:DS.orangeBg, f.statut==='payee'?DS.green:DS.orange)}>{f.statut}</span></td>
                  <td style={{...TD, fontSize:12, color:DS.subtle}}>{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 5 : MES FINANCES ──
// ══════════════════════════════════════════════════
function TabFinances({ profil, caTotal, plafond, caPct }) {
  const [sousTab, setSousTab] = useState('vue');
  const activite = profil.activite || 'services';
  const tauxCotis = profil.acre ? TAUX_ACRE[activite] : TAUX_COTISATIONS[activite];
  const tauxVFL = profil.versementLib ? TAUX_VFL[activite] : 0;
  const cotisations = Math.round(caTotal * tauxCotis / 100);
  const vfl = Math.round(caTotal * tauxVFL / 100);
  const depenses = readLS('freample_ae_depenses');
  const totalDepenses = depenses.reduce((s,d) => s + (Number(d.montant)||0), 0);
  const margeNette = caTotal - cotisations - vfl - totalDepenses;

  // TVA
  const depasseTVA = caTotal > SEUIL_TVA;
  const depasseTVATolerance = caTotal > SEUIL_TVA_TOLERANCE;

  // URSSAF périodes
  const freq = profil.declarationFreq || 'trimestriel';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', gap:4 }}>
        {[{id:'vue',label:'Vue d\'ensemble'},{id:'urssaf',label:'URSSAF'},{id:'tva',label:'TVA'},{id:'depenses',label:'Depenses'}].map(t => (
          <button key={t.id} onClick={() => setSousTab(t.id)} style={{...BTN, background:sousTab===t.id?DS.gold:'transparent', color:sousTab===t.id?'#fff':DS.muted, border:sousTab!==t.id?`1px solid ${DS.border}`:'none', fontSize:12}}>{t.label}</button>
        ))}
      </div>

      {sousTab === 'vue' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Jauge CA */}
          <div style={CARD}>
            <p style={SECTION_TITLE}>Chiffre d'affaires vs plafond</p>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ height:12, background:DS.borderLight, borderRadius:6, overflow:'hidden' }}>
                  <div style={{ width:`${Math.min(caPct,100)}%`, height:'100%', background:caPct>90?DS.red:caPct>70?DS.orange:DS.gold, borderRadius:6, transition:'width .5s' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ fontSize:11, color:DS.subtle }}>{fmt(caTotal)}</span>
                  <span style={{ fontSize:11, color:DS.subtle }}>{fmt(plafond)} ({activite})</span>
                </div>
              </div>
              <span style={{ fontSize:24, fontWeight:900, color:caPct>90?DS.red:caPct>70?DS.orange:DS.gold }}>{caPct}%</span>
            </div>
            {profil.acre && <p style={{ fontSize:11, color:DS.blue, marginTop:8, fontWeight:600 }}>ACRE active — cotisations reduites de 50%</p>}
          </div>

          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:10 }}>
            <div style={CARD}><span style={{ fontSize:11, color:DS.subtle }}>Cotisations URSSAF</span><div style={{ fontSize:18, fontWeight:800, color:DS.red }}>{fmt(cotisations)}</div><span style={{ fontSize:10, color:DS.subtle }}>{tauxCotis}% du CA{profil.acre?' (ACRE)':''}</span></div>
            {profil.versementLib && <div style={CARD}><span style={{ fontSize:11, color:DS.subtle }}>Versement liberatoire IR</span><div style={{ fontSize:18, fontWeight:800, color:DS.orange }}>{fmt(vfl)}</div><span style={{ fontSize:10, color:DS.subtle }}>{tauxVFL}% du CA</span></div>}
            <div style={CARD}><span style={{ fontSize:11, color:DS.subtle }}>Depenses</span><div style={{ fontSize:18, fontWeight:800, color:DS.red }}>{fmt(totalDepenses)}</div></div>
            <div style={CARD}><span style={{ fontSize:11, color:DS.subtle }}>Marge nette estimee</span><div style={{ fontSize:18, fontWeight:800, color:margeNette>0?DS.green:DS.red }}>{fmt(margeNette)}</div></div>
          </div>
        </div>
      )}

      {sousTab === 'urssaf' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Declaration URSSAF — Regime micro-social</p>
            <p style={{ fontSize:12, color:DS.subtle, marginTop:4 }}>Frequence: {freq} — Taux: {tauxCotis}%{profil.acre?' (ACRE -50%)':''}{profil.versementLib?` + ${tauxVFL}% VFL`:''}</p>
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              {(freq === 'trimestriel' ? [
                { label:'T1 (jan-mars)', echeance:'30/04/2026', ca:Math.round(caTotal*0.25) },
                { label:'T2 (avr-juin)', echeance:'31/07/2026', ca:Math.round(caTotal*0.25) },
                { label:'T3 (jul-sep)', echeance:'31/10/2026', ca:Math.round(caTotal*0.25) },
                { label:'T4 (oct-dec)', echeance:'31/01/2027', ca:Math.round(caTotal*0.25) },
              ] : [
                { label:'Janvier', echeance:'28/02/2026', ca:Math.round(caTotal/12) },
                { label:'Fevrier', echeance:'31/03/2026', ca:Math.round(caTotal/12) },
                { label:'Mars', echeance:'30/04/2026', ca:Math.round(caTotal/12) },
              ]).map((p,i) => {
                const cotis = Math.round(p.ca * tauxCotis / 100);
                const ir = Math.round(p.ca * tauxVFL / 100);
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:DS.bgSoft, borderRadius:8 }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:600 }}>{p.label}</span>
                      <span style={{ fontSize:11, color:DS.subtle, marginLeft:8 }}>Echeance: {p.echeance}</span>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:12 }}>CA: {fmt(p.ca)} → Cotis: <strong style={{ color:DS.red }}>{fmt(cotis)}</strong></div>
                      {profil.versementLib && <div style={{ fontSize:11, color:DS.orange }}>+ VFL: {fmt(ir)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Declaration annuelle de revenus (2042-C-PRO)</p>
            <p style={{ fontSize:12, color:DS.subtle, marginTop:4 }}>A remplir entre avril et juin — CA a declarer: <strong>{fmt(caTotal)}</strong></p>
            <p style={{ fontSize:11, color:DS.muted, marginTop:4 }}>Case: {activite==='services'?'5KP (BIC services)':'5KO (BIC ventes)'} — Abattement forfaitaire: {activite==='services'?'50%':'71%'}</p>
          </div>
        </div>
      )}

      {sousTab === 'tva' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Franchise de TVA</p>
            <div style={{ marginTop:12 }}>
              <div style={{ height:12, background:DS.borderLight, borderRadius:6, overflow:'hidden', position:'relative' }}>
                <div style={{ width:`${Math.min(caTotal/SEUIL_TVA_TOLERANCE*100,100)}%`, height:'100%', background:depasseTVATolerance?DS.red:depasseTVA?DS.orange:DS.green, borderRadius:6 }} />
                {/* Marker seuil */}
                <div style={{ position:'absolute', left:`${SEUIL_TVA/SEUIL_TVA_TOLERANCE*100}%`, top:0, bottom:0, width:2, background:DS.orange }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:11 }}>{fmt(caTotal)}</span>
                <span style={{ fontSize:11, color:DS.orange }}>Seuil: {fmt(SEUIL_TVA)}</span>
                <span style={{ fontSize:11, color:DS.red }}>Tolerance: {fmt(SEUIL_TVA_TOLERANCE)}</span>
              </div>
            </div>

            {depasseTVATolerance ? (
              <div style={{ marginTop:12, padding:12, background:DS.redBg, borderRadius:8, fontSize:13, color:DS.red, fontWeight:600 }}>
                Vous devez facturer la TVA. La mention "TVA non applicable" ne doit plus figurer sur vos factures.
              </div>
            ) : depasseTVA ? (
              <div style={{ marginTop:12, padding:12, background:DS.orangeBg, borderRadius:8, fontSize:13, color:DS.orange, fontWeight:600 }}>
                Seuil de base depasse ({fmt(SEUIL_TVA)}). Si vous depassez {fmt(SEUIL_TVA_TOLERANCE)}, vous devrez facturer la TVA retroactivement.
              </div>
            ) : (
              <div style={{ marginTop:12, padding:12, background:DS.greenBg, borderRadius:8, fontSize:13, color:DS.green, fontWeight:600 }}>
                Franchise de TVA active. Mention "TVA non applicable, art. 293B du CGI" sur vos factures.
              </div>
            )}
          </div>
        </div>
      )}

      {sousTab === 'depenses' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Suivi des depenses</p>
            <p style={{ fontSize:12, color:DS.subtle, marginTop:4 }}>Non deductibles en micro, mais essentielles pour connaitre votre marge reelle</p>
            <div style={{ marginTop:12 }}>
              {depenses.length === 0 && <p style={{ fontSize:13, color:DS.muted, textAlign:'center', padding:20 }}>Aucune depense enregistree. Utilisez les actions terrain (achat, carburant, frais) pour suivre vos couts.</p>}
              {depenses.slice(-20).reverse().map((d,i) => (
                <div key={d.id||i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${DS.borderLight}` }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:600 }}>{d.description}</span>
                    <span style={{ fontSize:11, color:DS.subtle, marginLeft:8 }}>{d.categorie} — {d.date}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:DS.red }}>{fmt(d.montant)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 6 : MON ENTREPRISE ──
// ══════════════════════════════════════════════════
function TabEntreprise({ profil, setProfil }) {
  const [sousTab, setSousTab] = useState('compte');
  const u = (k,v) => setProfil(p => ({ ...p, [k]: v }));

  // Alertes assurances
  const decennaleJ = profil.decennaleExpire ? Math.round((new Date(profil.decennaleExpire)-new Date())/86400000) : null;
  const rcproJ = profil.rcproExpire ? Math.round((new Date(profil.rcproExpire)-new Date())/86400000) : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:700 }}>
      {/* Sous-onglets */}
      <div style={{ display:'flex', gap:4, borderBottom:`1px solid ${DS.border}` }}>
        <button onClick={() => setSousTab('compte')}
          style={{ padding:'10px 16px', background:'transparent', border:'none', borderBottom: sousTab==='compte' ? `2px solid ${DS.gold}` : '2px solid transparent', color: sousTab==='compte' ? DS.gold : DS.muted, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:DS.font }}>
          Mon compte
        </button>
        <button onClick={() => setSousTab('entreprise')}
          style={{ padding:'10px 16px', background:'transparent', border:'none', borderBottom: sousTab==='entreprise' ? `2px solid ${DS.gold}` : '2px solid transparent', color: sousTab==='entreprise' ? DS.gold : DS.muted, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:DS.font }}>
          Mon entreprise
        </button>
      </div>

      {sousTab === 'compte' && <AECompteSection profil={profil} setProfil={setProfil} />}
      {sousTab === 'entreprise' && <>
      <div style={CARD}>
        <p style={SECTION_TITLE}>Identite de l'entreprise</p>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginTop:12 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>Raison sociale / Nom commercial</label><input value={profil.nom} onChange={e=>u('nom',e.target.value)} style={{...INP, marginTop:4}} /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Forme</label>
            <input value={profil.forme || 'Auto-entrepreneur'} disabled style={{...INP, marginTop:4, background:DS.bgSoft, color:DS.subtle}} />
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:10 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>SIRET</label><input value={profil.siret} onChange={e=>u('siret',e.target.value)} style={{...INP, marginTop:4}} /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>N° TVA intracom.</label><input value={profil.tvaIntra||''} onChange={e=>u('tvaIntra',e.target.value)} style={{...INP, marginTop:4}} placeholder="FR..." /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Régime TVA</label>
            <select value={profil.regimeTVA || 'franchise'} onChange={e=>u('regimeTVA',e.target.value)} style={{...INP, marginTop:4}}>
              <option value="franchise">Franchise (293B)</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 120px 1fr', gap:12, marginTop:10 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>Adresse</label><input value={profil.adresse||''} onChange={e=>u('adresse',e.target.value)} style={{...INP, marginTop:4}} placeholder="12 rue..." /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Code postal</label><input value={profil.codePostal||''} onChange={e=>u('codePostal',e.target.value)} style={{...INP, marginTop:4}} /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Ville</label><input value={profil.ville} onChange={e=>u('ville',e.target.value)} style={{...INP, marginTop:4}} /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:10 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>Email</label><input value={profil.email} onChange={e=>u('email',e.target.value)} style={{...INP, marginTop:4}} /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Téléphone</label><input value={profil.telephone||profil.tel||''} onChange={e=>{u('telephone',e.target.value);u('tel',e.target.value);}} style={{...INP, marginTop:4}} /></div>
        </div>
        <div style={{ marginTop:10 }}>
          <label style={{ fontSize:11, color:DS.muted }}>Activité AE</label>
          <select value={profil.activite} onChange={e=>u('activite',e.target.value)} style={{...INP, marginTop:4}}>
            <option value="services">Services (plafond {fmt(77700)})</option>
            <option value="commerce">Achat-revente (plafond {fmt(188700)})</option>
          </select>
        </div>
      </div>

      {/* Coordonnées bancaires */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>Coordonnées bancaires</p>
        <p style={{ fontSize:11, color:DS.subtle, marginTop:2 }}>Où Freample vous verse les paiements après libération du séquestre.</p>
        <div style={{ marginTop:12 }}>
          <label style={{ fontSize:11, color:DS.muted }}>Banque</label>
          <input value={profil.banque||''} onChange={e=>u('banque',e.target.value)} style={{...INP, marginTop:4}} placeholder="Ex: BNP Paribas" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginTop:10 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>IBAN</label><input value={profil.rib||''} onChange={e=>u('rib',e.target.value)} style={{...INP, marginTop:4, fontFamily:'monospace'}} placeholder="FR76..." /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>BIC / SWIFT</label><input value={profil.bicSwift||''} onChange={e=>u('bicSwift',e.target.value)} style={{...INP, marginTop:4, fontFamily:'monospace'}} /></div>
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Assurances</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
          <div>
            <label style={{ fontSize:11, color:DS.muted }}>N decennale</label>
            <input value={profil.decennale} onChange={e=>u('decennale',e.target.value)} style={{...INP, marginTop:4}} placeholder="Numero de contrat" />
          </div>
          <div>
            <label style={{ fontSize:11, color:DS.muted }}>Expiration decennale</label>
            <input type="date" value={profil.decennaleExpire} onChange={e=>u('decennaleExpire',e.target.value)} style={{...INP, marginTop:4}} />
            {decennaleJ !== null && (
              <span style={{ fontSize:11, fontWeight:600, color:decennaleJ<0?DS.red:decennaleJ<30?DS.orange:DS.green, marginTop:4, display:'block' }}>
                {decennaleJ<0?'EXPIREE':decennaleJ<30?`Expire dans ${decennaleJ}j`:`Valide (${decennaleJ}j)`}
              </span>
            )}
          </div>
          <div>
            <label style={{ fontSize:11, color:DS.muted }}>N RC Pro</label>
            <input value={profil.rcpro} onChange={e=>u('rcpro',e.target.value)} style={{...INP, marginTop:4}} placeholder="Numero de contrat" />
          </div>
          <div>
            <label style={{ fontSize:11, color:DS.muted }}>Expiration RC Pro</label>
            <input type="date" value={profil.rcproExpire} onChange={e=>u('rcproExpire',e.target.value)} style={{...INP, marginTop:4}} />
            {rcproJ !== null && (
              <span style={{ fontSize:11, fontWeight:600, color:rcproJ<0?DS.red:rcproJ<30?DS.orange:DS.green, marginTop:4, display:'block' }}>
                {rcproJ<0?'EXPIREE':rcproJ<30?`Expire dans ${rcproJ}j`:`Valide (${rcproJ}j)`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Regime fiscal</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:12 }}>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <input type="checkbox" checked={profil.acre} onChange={e=>u('acre',e.target.checked)} />
            <div>
              <span style={{ fontSize:13, fontWeight:600 }}>ACRE (1ere annee)</span>
              <span style={{ fontSize:11, color:DS.subtle, display:'block' }}>Cotisations reduites de 50% la premiere annee</span>
            </div>
          </label>
          {profil.acre && (
            <div><label style={{ fontSize:11, color:DS.muted }}>Date debut activite</label><input type="date" value={profil.acreDebut} onChange={e=>u('acreDebut',e.target.value)} style={{...INP, marginTop:4}} /></div>
          )}
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <input type="checkbox" checked={profil.versementLib} onChange={e=>u('versementLib',e.target.checked)} />
            <div>
              <span style={{ fontSize:13, fontWeight:600 }}>Versement liberatoire de l'IR</span>
              <span style={{ fontSize:11, color:DS.subtle, display:'block' }}>Payer l'impot sur le revenu en meme temps que l'URSSAF ({TAUX_VFL[profil.activite||'services']}%)</span>
            </div>
          </label>
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Documents</p>
        <p style={{ fontSize:12, color:DS.subtle, marginTop:4 }}>Attestation URSSAF, extrait INSEE, decennale, RC Pro</p>
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {['Attestation URSSAF','Extrait INSEE / SIRENE','Assurance decennale','RC Pro','RIB'].map(doc => (
            <div key={doc} style={{ padding:'10px 14px', background:DS.bgSoft, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:600 }}>{doc}</span>
              <span style={{ fontSize:11, color:DS.subtle }}>A ajouter</span>
            </div>
          ))}
        </div>
      </div>
      </>}
    </div>
  );
}

// ── Sous-composant : Mon compte (AE) ──
function AECompteSection({ profil, setProfil }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [compteForm, setCompteForm] = useState({
    nomPerso: profil.nomPerso || user?.nom || '',
    telPerso: profil.telPerso || '',
    emailLogin: user?.email || '',
  });
  const [pwdForm, setPwdForm] = useState({ ancien: '', nouveau: '', confirmer: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [saved, setSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(() => { try { return JSON.parse(localStorage.getItem('freample_notif_prefs') || '{}'); } catch { return {}; } });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const saveCompte = () => {
    setProfil(p => ({ ...p, nomPerso: compteForm.nomPerso, telPerso: compteForm.telPerso }));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotif = (key) => {
    const active = notifPrefs[key] !== false;
    const next = { ...notifPrefs, [key]: !active };
    setNotifPrefs(next);
    localStorage.setItem('freample_notif_prefs', JSON.stringify(next));
  };

  const initials = user?.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AE';

  return (
    <>
      <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 58, height: 58, borderRadius: '50%', background: DS.gold, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.nom}</div>
          <div style={{ fontSize: 12, color: DS.subtle }}>{user?.email}</div>
          <span style={{ fontSize: 10, color: DS.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Auto-entrepreneur</span>
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Informations personnelles</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>Nom complet</label><input value={compteForm.nomPerso} onChange={e => setCompteForm(f => ({ ...f, nomPerso: e.target.value }))} style={{...INP, marginTop:4}} /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Téléphone personnel</label><input value={compteForm.telPerso} onChange={e => setCompteForm(f => ({ ...f, telPerso: e.target.value }))} style={{...INP, marginTop:4}} placeholder="06 12 34 56 78" /></div>
        </div>
        <div style={{ marginTop:10 }}>
          <label style={{ fontSize:11, color:DS.muted }}>Email de connexion</label>
          <input type="email" value={compteForm.emailLogin} onChange={e => setCompteForm(f => ({ ...f, emailLogin: e.target.value }))} style={{...INP, marginTop:4}} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <button onClick={saveCompte} style={BTN_GOLD}>Enregistrer</button>
          {saved && <span style={{ color: DS.green, fontSize: 12, fontWeight: 600 }}>✓ Enregistré</span>}
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Notifications</p>
        <p style={{ fontSize: 11, color: DS.subtle, marginTop: 4, marginBottom: 14 }}>Comment souhaitez-vous être averti ?</p>
        {[
          { key: 'email', label: 'Email', desc: 'Devis signés, paiements, messages' },
          { key: 'push', label: 'Push navigateur', desc: 'Nécessite autorisation' },
          { key: 'sms', label: 'SMS', desc: 'Urgences uniquement' },
        ].map(n => {
          const active = notifPrefs[n.key] !== false;
          return (
            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${DS.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: DS.subtle }}>{n.desc}</div>
              </div>
              <button onClick={() => toggleNotif(n.key)} style={{ width: 40, height: 22, borderRadius: 11, background: active ? DS.green : DS.border, border: 'none', cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff', top: 2, left: active ? 20 : 2, transition: 'left .2s' }} />
              </button>
            </div>
          );
        })}
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Sécurité</p>
        <div style={{ marginTop:12 }}>
          <label style={{ fontSize:11, color:DS.muted }}>Mot de passe actuel</label>
          <input type="password" value={pwdForm.ancien} onChange={e => setPwdForm(p => ({ ...p, ancien: e.target.value }))} style={{...INP, marginTop:4, maxWidth: 300}} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:10 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>Nouveau mot de passe</label><input type="password" value={pwdForm.nouveau} onChange={e => setPwdForm(p => ({ ...p, nouveau: e.target.value }))} style={{...INP, marginTop:4}} /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Confirmer</label><input type="password" value={pwdForm.confirmer} onChange={e => setPwdForm(p => ({ ...p, confirmer: e.target.value }))} style={{...INP, marginTop:4}} /></div>
        </div>
        {pwdMsg && <div style={{ marginTop:10, padding:10, borderRadius:8, fontSize:12, background: pwdMsg.type==='success'?'#D1FAE5':'#FEE2E2', color: pwdMsg.type==='success'?'#065F46':'#DC2626' }}>{pwdMsg.text}</div>}
        <button onClick={() => {
          if (!pwdForm.nouveau || pwdForm.nouveau.length < 6) { setPwdMsg({ type: 'error', text: 'Min 6 caractères' }); return; }
          if (pwdForm.nouveau !== pwdForm.confirmer) { setPwdMsg({ type: 'error', text: 'Ne correspondent pas' }); return; }
          setPwdMsg({ type: 'success', text: 'Mot de passe modifié' });
          setPwdForm({ ancien:'', nouveau:'', confirmer:'' });
        }} style={{...BTN_O, marginTop:14}}>Changer le mot de passe</button>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Déconnexion</p>
        <p style={{ fontSize: 11, color: DS.subtle, marginTop: 4, marginBottom: 12 }}>Déconnectez-vous de votre session.</p>
        <button onClick={async () => { if (logout) await logout(); navigate('/login'); }} style={BTN_O}>Se déconnecter</button>
      </div>

      <div style={{ ...CARD, border: `1px solid ${DS.red}40`, background: '#FEF2F2' }}>
        <p style={{ ...SECTION_TITLE, color: DS.red }}>Zone dangereuse</p>
        <p style={{ fontSize: 12, color: DS.muted, marginTop: 4, marginBottom: 12 }}>La suppression est définitive.</p>
        {!deleteConfirm ? (
          <button onClick={() => setDeleteConfirm(true)} style={{ ...BTN, background: DS.red }}>Supprimer mon compte</button>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: DS.red, fontWeight: 600, flexBasis: '100%' }}>Tapez <strong>SUPPRIMER</strong> :</span>
            <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} style={{...INP, maxWidth: 200}} placeholder="SUPPRIMER" />
            <button disabled={deleteInput !== 'SUPPRIMER'} style={{ ...BTN, background: DS.red, opacity: deleteInput !== 'SUPPRIMER' ? 0.4 : 1 }}>Confirmer</button>
            <button onClick={() => { setDeleteConfirm(false); setDeleteInput(''); }} style={BTN_O}>Annuler</button>
          </div>
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 7 : PARAMETRES ──
// ══════════════════════════════════════════════════
function TabParametres({ profil, setProfil }) {
  const [saved, setSaved] = useState(false);
  const u = (k,v) => setProfil(p => ({ ...p, [k]: v }));

  const save = () => {
    writeLS('freample_ae_profil', profil);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:700 }}>
      <div style={CARD}>
        <p style={SECTION_TITLE}>Corps de metier</p>
        <p style={{ fontSize:12, color:DS.subtle, marginTop:4 }}>Selectionnez vos metiers — les projets du marketplace seront filtres en consequence</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
          {CORPS_METIER.map(m => {
            const selected = (profil.metiers||[]).includes(m);
            return (
              <button key={m} onClick={() => {
                const metiers = selected ? (profil.metiers||[]).filter(x=>x!==m) : [...(profil.metiers||[]), m];
                u('metiers', metiers);
              }} style={{...BTN, background:selected?DS.gold:'transparent', color:selected?'#fff':DS.muted, border:selected?'none':`1px solid ${DS.border}`, fontSize:12, padding:'6px 14px'}}>
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Zone d'intervention</p>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginTop:12 }}>
          <div><label style={{ fontSize:11, color:DS.muted }}>Ville de base</label><input value={profil.ville} onChange={e=>u('ville',e.target.value)} style={{...INP, marginTop:4}} /></div>
          <div><label style={{ fontSize:11, color:DS.muted }}>Rayon (km)</label><input type="number" value={profil.rayon} onChange={e=>u('rayon',Number(e.target.value))} style={{...INP, marginTop:4}} min={5} max={200} /></div>
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Declaration URSSAF</p>
        <div style={{ display:'flex', gap:10, marginTop:12 }}>
          <button onClick={() => u('declarationFreq','mensuel')} style={{...BTN, background:profil.declarationFreq==='mensuel'?DS.gold:'transparent', color:profil.declarationFreq==='mensuel'?'#fff':DS.muted, border:profil.declarationFreq!=='mensuel'?`1px solid ${DS.border}`:'none'}}>Mensuel</button>
          <button onClick={() => u('declarationFreq','trimestriel')} style={{...BTN, background:profil.declarationFreq==='trimestriel'?DS.gold:'transparent', color:profil.declarationFreq==='trimestriel'?'#fff':DS.muted, border:profil.declarationFreq!=='trimestriel'?`1px solid ${DS.border}`:'none'}}>Trimestriel</button>
        </div>
      </div>

      <button onClick={save} style={{...BTN_GOLD, alignSelf:'flex-start', padding:'12px 32px'}}>
        {saved ? 'Enregistre !' : 'Enregistrer'}
      </button>
    </div>
  );
}
