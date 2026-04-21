import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  IconShield, IconAlert, IconDocument, IconCheck, IconSearch,
  IconPlus, IconX, IconDownload, IconUser, IconRefresh,
} from '../../components/ui/Icons';
import RegistreIncendie from '../../components/qse/RegistreIncendie';
import PermisFeu from '../../components/qse/PermisFeu';
import PPSPS from '../../components/qse/PPSPS';
import AffichageObligatoire from '../../components/qse/AffichageObligatoire';
import PlanDechet from '../../components/qse/PlanDechet';
import DiagnosticDemolition from '../../components/qse/DiagnosticDemolition';
import { genererDUERP, genererPlanPrevention } from '../../utils/qsePDF';
import { API_URL } from '../../services/api';
import EPIModule from '../../components/qse/EPIModule';
import IncidentsModule from '../../components/qse/IncidentsModule';
import NonConformitesModule from '../../components/qse/NonConformitesModule';
import BSDDModule from '../../components/qse/BSDDModule';
import CertificationsModule from '../../components/qse/CertificationsModule';
import RapportAnnuelQHSE from '../../components/qse/RapportAnnuelQHSE';
import FormulairesAMELI from '../../components/qse/FormulairesAMELI';
import AuditsModule from '../../components/qse/AuditsModule';

/* ── DUERP data ── */
const UNITES_TRAVAIL = ['Tous les postes','Maçonnerie / gros œuvre','Plomberie / sanitaire','Électricité','Peinture / finition','Bureau / encadrement'];

const RISQUES_INIT = [
  { id:1, ut:'Maçonnerie / gros œuvre', danger:'Chutes de hauteur', source:'Travaux en toiture, échafaudage', effectifs:4, P:3, G:4, mesures:'Port EPI (harnais), formations, garde-corps', responsable:'Chef de chantier', delai:'2025-06-30', statut:'en_cours' },
  { id:2, ut:'Maçonnerie / gros œuvre', danger:'Manutention manuelle', source:'Port de charges lourdes (>25 kg)', effectifs:4, P:4, G:2, mesures:'Formation gestes et postures, aides mécaniques', responsable:'RH', delai:'2025-07-15', statut:'planifie' },
  { id:3, ut:'Plomberie / sanitaire', danger:'Exposition produits chimiques', source:'Solvants, colles, décapants', effectifs:2, P:2, G:3, mesures:'Fiches FDS, EPI (gants, lunettes), ventilation', responsable:'Patron', delai:'2025-06-01', statut:'realise' },
  { id:4, ut:'Électricité', danger:'Risque électrique', source:'Travaux sous tension, CACES B1', effectifs:3, P:2, G:4, mesures:'Habilitations électriques, consignation', responsable:"Chef d'équipe", delai:'2025-05-01', statut:'realise' },
  { id:5, ut:'Peinture / finition', danger:'Inhalation de poussières / COV', source:'Ponçage, application peinture', effectifs:2, P:3, G:3, mesures:'Masques FFP2/FFP3, ventilation, pauses régulières', responsable:'Patron', delai:'2025-08-01', statut:'en_cours' },
  { id:6, ut:'Tous les postes', danger:'Stress et risques psychosociaux', source:'Délais serrés, conflits équipe', effectifs:8, P:2, G:2, mesures:'Réunions régulières, formation management', responsable:'RH', delai:'2025-09-01', statut:'planifie' },
  { id:7, ut:'Bureau / encadrement', danger:'Troubles musculo-squelettiques', source:'Poste informatique mal adapté', effectifs:2, P:3, G:2, mesures:'Ergonomie du poste, pauses actives', responsable:'RH', delai:'2025-07-01', statut:'planifie' },
];

const DOCS_QSE = [
  { id:'registre-at', categorie:'Obligations légales', nom:"Registre des Accidents du Travail", obligatoire:true, freq:'Mise à jour continue', derniereMAJ:'2025-02-15', docType:'qse' },
  { id:'registre-incendie', categorie:'Obligations légales', nom:'Registre de Sécurité Incendie', obligatoire:true, freq:'Trimestrielle', derniereMAJ:'2025-01-10', docType:'qse' },
  { id:'affichage-obligatoire', categorie:'Obligations légales', nom:'Tableau Affichage Obligatoire', obligatoire:true, freq:'Permanente', derniereMAJ:'2025-01-01', docType:'qse' },
  { id:'ppsps', categorie:'Prévention', nom:'PPSPS — Plan Particulier Sécurité et Protection Santé', obligatoire:true, freq:'Par chantier', derniereMAJ:'2025-02-20', docType:'qse' },
  { id:'fds', categorie:'Prévention', nom:'Fiches de Données de Sécurité (FDS)', obligatoire:true, freq:'À la réception produit', derniereMAJ:'2025-01-15', docType:'qse' },
  { id:'permis-feu', categorie:'Prévention', nom:'Permis de feu', obligatoire:false, freq:'Avant travaux points chauds', derniereMAJ:'—', docType:'qse' },
  { id:'dechet', categorie:'Environnement', nom:'Plan de gestion des déchets (BSDD)', obligatoire:true, freq:'Par chantier', derniereMAJ:'2025-02-10', docType:'qse' },
  { id:'diagnostic-demolition', categorie:'Environnement', nom:'Diagnostic déchets / amiante / plomb avant démolition', obligatoire:true, freq:'Avant travaux', derniereMAJ:'2025-01-30', docType:'qse' },
  { id:'charte-qualite', categorie:'Qualité', nom:'Charte qualité chantier', obligatoire:false, freq:'Par chantier', derniereMAJ:'2025-01-01', docType:'qse' },
];

/* ── Helpers ── */
function crit(P,G) { return Number(P)*Number(G); }
function critColor(c) {
  if(c>=13) return { bg:'#FFEBEE', color:'#C0392B', label:'CRITIQUE' };
  if(c>=9)  return { bg:'#FFF3E0', color:'#E65100', label:'ÉLEVÉ' };
  if(c>=5)  return { bg:'#FFFDE7', color:'#856404', label:'MOYEN' };
  return    { bg:'#E8F5E9', color:'#1B5E20', label:'FAIBLE' };
}
function statutBadge(s) {
  const m = { realise:{bg:'#D1F2E0',color:'#1A7F43',label:'Réalisé'}, en_cours:{bg:'#FFF3CD',color:'#856404',label:'En cours'}, planifie:{bg:'#E3F2FD',color:'#1565C0',label:'Planifié'} };
  const x = m[s]||m.planifie;
  return <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:x.bg, color:x.color }}>{x.label}</span>;
}
function fmt(iso) { if(!iso||iso==='—') return '—'; try{ return new Date(iso).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}); }catch{return iso;} }

const PRINT_STYLE = `@media print { body *{visibility:hidden!important;} #duerp-print,#duerp-print *{visibility:visible!important;} #duerp-print{position:fixed;top:0;left:0;width:100%;padding:20px;background:#fff;} .no-print{display:none!important;} }`;

/* ── OCR simulation for habilitation documents ── */
function simulerOCRHabilitation(fichier) {
  return new Promise(resolve => {
    setTimeout(() => {
      const types = ['électrique','caces','sst','hauteur','amiante','échafaudage'];
      const niveaux = ['B1','B2','BR','Cat. B','Cat. A','Recyclage','Initial','Opérateur'];
      const organismes = ['APAVE','Bureau Véritas','SOCOTEC','CNAM','Croix-Rouge','PREVENTIS'];
      const type = types[Math.floor(Math.random()*types.length)];
      const niveau = niveaux[Math.floor(Math.random()*niveaux.length)];
      const organisme = organismes[Math.floor(Math.random()*organismes.length)];
      const today = new Date();
      const expiry = new Date(today.getFullYear()+3, today.getMonth(), today.getDate()).toISOString().split('T')[0];
      const obtention = today.toISOString().split('T')[0];
      resolve({
        nom: `Habilitation ${type.charAt(0).toUpperCase()+type.slice(1)} ${niveau}`,
        type, niveau, organisme,
        dateObtention: obtention,
        dateExpiration: expiry,
        confidence: Math.floor(Math.random()*10+88),
      });
    }, 2000);
  });
}

/* ── Legal banner ── */
function QSELegalBanner() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ background: '#FFF3E0', border: '1px solid #FF9500', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>⚖️</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#7A4900', flex: 1 }}>
          Obligations QSE — sécurité au travail et chantiers BTP (Code du travail)
        </span>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF9500', fontSize: '0.8125rem', fontWeight: 600 }}>
          {open ? 'Masquer ▲' : 'Voir ▼'}
        </button>
      </div>
      {open && (
        <ul style={{ margin: '10px 0 0 22px', padding: 0, fontSize: '0.8125rem', color: '#1D1D1F', lineHeight: 1.9 }}>
          <li><strong>DUERP</strong> obligatoire dès 1 salarié — mise à jour annuelle et après tout incident (Art. R4121-1 CT)</li>
          <li><strong>PPSPS</strong> à remettre au coordinateur SPS avant tout démarrage sur chantier multi-entreprises (Art. R4532-66 CT)</li>
          <li><strong>Plan de prévention</strong> écrit si travaux dangereux dans un établissement tiers (Art. R4512-6 CT)</li>
          <li>EPI fournis gratuitement et entretenus par l'employeur (Art. L4122-2 CT)</li>
          <li>Déclaration accident du travail à la CPAM sous <strong>48h</strong> (Art. L441-2 Code SS)</li>
          <li><strong>Amiante :</strong> diagnostic obligatoire avant travaux sur tout bâtiment dont le permis est antérieur au 1er juillet 1997 — formation SS3/SS4 obligatoire</li>
          <li><strong>Plomb :</strong> CREP avant travaux sur logement construit avant 1949</li>
          <li>Déchets BTP : BSDD obligatoire pour déchets dangereux — tri 5 flux minimum sur chantier</li>
          <li>Nacelles et échafaudages : vérification par organisme agréé avant utilisation (Art. R4323-23 CT)</li>
        </ul>
      )}
    </div>
  );
}

const QHSE_SECTIONS = [
  { id:'qualite', label:'Qualité', color:'#2563EB', desc:'Non-conformités, certifications, audits, charte qualité', tabs:['Non-conformités','Certifications','Audits','Documents QSE','Rapport annuel'] },
  { id:'hygiene', label:'Hygiène', color:'#16A34A', desc:'FDS, registre incendie, permis de feu, affichage obligatoire', tabs:['Documents QSE','Tableau de bord'] },
  { id:'securite', label:'Sécurité', color:'#DC2626', desc:'DUERP, habilitations, EPI, incidents, plans de prévention', tabs:['DUERP','Habilitations','EPI','Incidents','Plans de prévention','Formulaires AMELI'] },
  { id:'environnement', label:'Environnement', color:'#D97706', desc:'BSDD, plan déchets, diagnostic démolition', tabs:['BSDD','Documents QSE'] },
  { id:'chantier', label:'Sécurité chantier', color:'#8B5CF6', desc:'Documents de sécurité par chantier : PPSPS, permis de feu, vérifications', tabs:[] },
];

function getSectionFromOnglet(onglet) {
  const sectionMap = { qualite:'qualite', securite:'securite', hygiene:'hygiene', environnement:'environnement', habilitations:'securite', epi:'securite', incidents:'securite', nc:'qualite', bsdd:'environnement', certifications:'qualite', audits:'qualite' };
  return sectionMap[onglet] || 'securite';
}
function getTabFromOnglet(onglet) {
  const tabMap = { habilitations:'Habilitations', epi:'EPI', incidents:'Incidents', nc:'Non-conformités', bsdd:'BSDD', certifications:'Certifications', audits:'Documents QSE' };
  return tabMap[onglet] || null;
}

export default function QSE() {
  const [searchParams] = useSearchParams();
  const onglet = searchParams.get('onglet');
  const [activeSection, setActiveSection] = useState(() => onglet ? getSectionFromOnglet(onglet) : 'hub');
  const [tab, setTab] = useState(() => {
    const t = getTabFromOnglet(onglet);
    if (t) return t;
    const s = QHSE_SECTIONS.find(x => x.id === getSectionFromOnglet(onglet));
    return s?.tabs[0] || 'DUERP';
  });

  // Réagir aux changements de query param (navigation sidebar)
  useEffect(() => {
    if (!onglet) return;
    const section = getSectionFromOnglet(onglet);
    const specificTab = getTabFromOnglet(onglet);
    const sectionObj = QHSE_SECTIONS.find(s => s.id === section);
    setActiveSection(section);
    setTab(specificTab || (sectionObj?.tabs[0] || 'DUERP'));
  }, [onglet]);
  const [tdb, setTdb] = useState(null);
  const [habilitations, setHabilitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [risques, setRisques] = useState(RISQUES_INIT);
  const [filterUT, setFilterUT] = useState('Tous les postes');
  const [employes, setEmployes] = useState([]);
  const [plans, setPlans] = useState([
    { id:1, chantier:'Rénovation Dupont — Lyon 6', date:'2025-03-01', entreprises:['Electricité Martin SARL','Plomberie Durand'], statut:'actif', risques:['Électrique','Chute hauteur','Co-activité'] },
    { id:2, chantier:'Extension Villa Rousseau — Caluire', date:'2025-02-15', entreprises:['Maçonnerie Bisson','Toiture Perrin'], statut:'actif', risques:['Chute hauteur','Manutention','Bruit'] },
    { id:3, chantier:'Réfection toiture Immeuble Bellecour', date:'2025-01-10', entreprises:['Toiture Express'], statut:'clôturé', risques:['Chute hauteur','Poussières amiante'] },
  ]);
  const [dueDate] = useState(new Date().toLocaleDateString('fr-FR'));
  const token = localStorage.getItem('token') || null;
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const style = document.createElement('style'); style.innerHTML = PRINT_STYLE; document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/qse/tableau-de-bord'),
      fetch(`${API_URL}/rh/habilitations`, { headers: authHeaders }).then(r=>r.json()),
      fetch(`${API_URL}/rh/employes`, { headers: authHeaders }).then(r=>r.json()),
    ]).then(([t, h, e]) => {
      setTdb(t.data);
      setHabilitations(h.habilitations || []);
      setEmployes(e.employes || []);
    }).catch(() => {
      // Fallback données demo quand backend non disponible
      setHabilitations([
        { id:1, employe:'Pierre Martin', type:'CACES R489', dateObtention:'2024-03-15', dateExpiration:'2029-03-15', organisme:'AFTRAL', statut:'valide' },
        { id:2, employe:'Sophie Duval', type:'Habilitation électrique B1', dateObtention:'2024-02-10', dateExpiration:'2027-02-10', organisme:'APAVE', statut:'valide' },
        { id:3, employe:'Claire Bernard', type:'Habilitation électrique B2', dateObtention:'2024-06-15', dateExpiration:'2027-06-15', organisme:'APAVE', statut:'valide' },
        { id:4, employe:'Lucas Garcia', type:'Travail en hauteur', dateObtention:'2024-09-01', dateExpiration:'2027-09-01', organisme:'APAVE', statut:'valide' },
        { id:5, employe:'Pierre Martin', type:'Travail en hauteur', dateObtention:'2024-06-01', dateExpiration:'2027-06-01', organisme:'APAVE', statut:'valide' },
      ]);
      setEmployes([
        { id:1, prenom:'Pierre', nom:'Martin', poste:'Maçon', email:'pierre.martin@lambertbtp.fr' },
        { id:2, prenom:'Sophie', nom:'Duval', poste:'Plombière', email:'sophie.duval@lambertbtp.fr' },
        { id:3, prenom:'Lucas', nom:'Garcia', poste:'Carreleur', email:'lucas.garcia@lambertbtp.fr' },
        { id:4, prenom:'Luc', nom:'Moreau', poste:'Peintre', email:'luc.moreau@lambertbtp.fr' },
        { id:5, prenom:'Claire', nom:'Bernard', poste:'Électricienne', email:'claire.bernard@lambertbtp.fr' },
      ]);
      setTdb({ score: 72, incidents_ouverts: 2, habilitations_expirees: 1, epi_a_remplacer: 3, derniere_maj: new Date().toISOString() });
    }).finally(()=>setLoading(false));
  }, []);

  async function reloadHabilitations() {
    const r = await fetch(`${API_URL}/rh/habilitations`, { headers: authHeaders });
    const d = await r.json();
    setHabilitations(d.habilitations || []);
  }

  const nbAlertes = (tdb?.alertes?.expirees||0) + (tdb?.alertes?.urgentes||0);
  const risquesFiltres = filterUT==='Tous les postes' ? risques : risques.filter(r=>r.ut===filterUT);

  /* ── Dashboard tab ── */
  function TabDashboard() {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {nbAlertes>0 && (
          <div style={{ background:'#FFE5E5', border:'1px solid rgba(255,59,48,.3)', borderRadius:12, padding:'14px 18px' }}>
            <p style={{ fontWeight:600, color:'#C0392B', fontSize:14, marginBottom:4 }}>Alertes habilitations</p>
            {tdb?.alertes?.expirees>0 && <p style={{ fontSize:14, color:'#C0392B' }}>{tdb.alertes.expirees} habilitation(s) expirée(s)</p>}
            {tdb?.alertes?.urgentes>0 && <p style={{ fontSize:14, color:'#C0392B', marginTop:2 }}>{tdb.alertes.urgentes} expire dans moins de 7 jours</p>}
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
          {[
            { label:'Total habilitations', value:habilitations.length, color:'#5B5BD6', Icon:IconShield },
            { label:'Valides', value:habilitations.filter(h=>!h.alerte).length, color:'#34C759', Icon:IconCheck },
            { label:'Expirées/Urgentes', value:habilitations.filter(h=>h.alerte==='expirée'||h.alerte==='urgente').length, color:'#FF3B30', Icon:IconAlert },
            { label:'Risques DUERP', value:risques.length, color:'#FF9500', Icon:IconShield },
            { label:'Risques critiques', value:risques.filter(r=>crit(r.P,r.G)>=13).length, color:'#FF3B30', Icon:IconAlert },
          ].map(k=>(
            <div key={k.label} style={{ background:'#fff', borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:`${k.color}18`, color:k.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}><k.Icon size={16}/></div>
              <div style={{ fontSize:24, fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:12, color:'#6E6E73', marginTop:5 }}>{k.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', borderRadius:14, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
          <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 14px' }}>Top risques prioritaires</h3>
          {[...risques].sort((a,b)=>crit(b.P,b.G)-crit(a.P,a.G)).slice(0,4).map(r=>{
            const c=crit(r.P,r.G); const cc=critColor(c);
            return (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #F2F2F7' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:cc.bg, color:cc.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 }}>{c}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>{r.danger}</div><div style={{ fontSize:12, color:'#6E6E73' }}>{r.ut}</div></div>
                <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:cc.bg, color:cc.color }}>{cc.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── DUERP tab with inline editing ── */
  function TabDUERP() {
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [newR, setNewR] = useState({ ut:UNITES_TRAVAIL[1], danger:'', source:'', effectifs:1, P:2, G:2, mesures:'', responsable:'', delai:'', statut:'planifie' });

    function startEdit(r) { setEditId(r.id); setEditData({...r}); }
    function cancelEdit() { setEditId(null); setEditData({}); }
    function saveEdit() {
      setRisques(prev => prev.map(r => r.id===editId ? {...editData} : r));
      setEditId(null); setEditData({});
    }
    function deleteRisque(id) { setRisques(prev => prev.filter(r=>r.id!==id)); }
    function saveNew() {
      if(!newR.danger.trim()) return;
      setRisques(prev=>[...prev,{...newR,id:Date.now()}]);
      setShowAdd(false);
      setNewR({ ut:UNITES_TRAVAIL[1], danger:'', source:'', effectifs:1, P:2, G:2, mesures:'', responsable:'', delai:'', statut:'planifie' });
    }

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {/* Actions bar */}
        <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, margin:0 }}>Document Unique d'Évaluation des Risques</h2>
            <p style={{ fontSize:13, color:'#6E6E73', marginTop:3 }}>Mis à jour le {dueDate} · {risques.length} risques · Cliquez sur une ligne pour la modifier</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <select value={filterUT} onChange={e=>setFilterUT(e.target.value)} style={{ padding:'8px 10px', border:'1px solid #E5E5EA', borderRadius:8, fontSize:13, outline:'none' }}>
              {UNITES_TRAVAIL.map(u=><option key={u} value={u}>{u}</option>)}
            </select>
            <button onClick={()=>genererDUERP(risquesFiltres, 'Bernard Martin BTP', '123 456 789 00012')} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #E5E5EA', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}><IconDownload size={13}/>PDF</button>
            <button onClick={()=>setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', border:'none', borderRadius:8, background:'#5B5BD6', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}><IconPlus size={13}/>Ajouter</button>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ background:'#F0F7FF', border:'1px solid #5B5BD6', borderRadius:14, padding:20 }}>
            <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 12px' }}>Nouveau risque</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={lbl}>Unité de travail</label><select value={newR.ut} onChange={e=>setNewR(n=>({...n,ut:e.target.value}))} style={inp}>{UNITES_TRAVAIL.slice(1).map(u=><option key={u}>{u}</option>)}</select></div>
              <div><label style={lbl}>Danger *</label><input value={newR.danger} onChange={e=>setNewR(n=>({...n,danger:e.target.value}))} placeholder="Ex. Chute de hauteur" style={inp}/></div>
              <div><label style={lbl}>Source / Situation</label><input value={newR.source} onChange={e=>setNewR(n=>({...n,source:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Effectifs exposés</label><input type="number" min="1" value={newR.effectifs} onChange={e=>setNewR(n=>({...n,effectifs:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Probabilité (1-4)</label><select value={newR.P} onChange={e=>setNewR(n=>({...n,P:Number(e.target.value)}))} style={inp}>{[1,2,3,4].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
              <div><label style={lbl}>Gravité (1-4)</label><select value={newR.G} onChange={e=>setNewR(n=>({...n,G:Number(e.target.value)}))} style={inp}>{[1,2,3,4].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
              <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Mesures de prévention</label><input value={newR.mesures} onChange={e=>setNewR(n=>({...n,mesures:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Responsable</label><input value={newR.responsable} onChange={e=>setNewR(n=>({...n,responsable:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Délai</label><input type="date" value={newR.delai} onChange={e=>setNewR(n=>({...n,delai:e.target.value}))} style={inp}/></div>
            </div>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <button onClick={saveNew} style={{ padding:'8px 18px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>Enregistrer</button>
              <button onClick={()=>setShowAdd(false)} style={{ padding:'8px 14px', background:'none', border:'1px solid #E5E5EA', borderRadius:8, cursor:'pointer' }}>Annuler</button>
            </div>
          </div>
        )}

        {/* DUERP Table */}
        <div id="duerp-print" style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,.08)', overflow:'hidden' }}>
          <div style={{ padding:'12px 18px', borderBottom:'1px solid #F2F2F7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontWeight:700, fontSize:14 }}>DUERP — Bernard Martin BTP · SIRET 123 456 789 00012</div>
            <div style={{ fontSize:12, color:'#6E6E73' }}>{risquesFiltres.length} risque(s) · {filterUT}</div>
          </div>
          <div style={{ padding:'8px 18px', background:'#FAFAFA', borderBottom:'1px solid #F2F2F7', display:'flex', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:'#6E6E73' }}>Criticité = P × G :</span>
            {[{r:'1-4',l:'Faible',bg:'#E8F5E9',c:'#1B5E20'},{r:'5-8',l:'Moyen',bg:'#FFFDE7',c:'#856404'},{r:'9-12',l:'Élevé',bg:'#FFF3E0',c:'#E65100'},{r:'13-16',l:'Critique',bg:'#FFEBEE',c:'#C0392B'}].map(x=>(
              <span key={x.r} style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:12, background:x.bg, color:x.c }}>{x.r} : {x.l}</span>
            ))}
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'#1C1C1E', color:'#fff' }}>
                  {['Unité de travail','Danger identifié','Source','Exp.','P','G','C','Niveau','Mesures de prévention','Responsable','Délai','Statut','Actions'].map(h=>(
                    <th key={h} style={{ padding:'9px 10px', textAlign:'left', whiteSpace:'nowrap', fontSize:11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {risquesFiltres.length===0 ? (
                  <tr><td colSpan={13} style={{ padding:40, textAlign:'center', color:'#636363' }}>Aucun risque pour cette unité</td></tr>
                ) : [...risquesFiltres].sort((a,b)=>crit(b.P,b.G)-crit(a.P,a.G)).map((r,i) => {
                  const c=crit(r.P,r.G); const cc=critColor(c);
                  const isEditing = editId===r.id;
                  const ed = isEditing ? editData : r;

                  return (
                    <tr key={r.id} style={{ borderBottom:'1px solid #F2F2F7', background: isEditing ? '#F0F7FF' : i%2===0?'#fff':'#FAFAFA', cursor: isEditing?'default':'pointer' }}
                      onClick={()=>!isEditing && startEdit(r)}>
                      {/* UT */}
                      <td style={{ padding:'8px 10px', maxWidth:100 }}>
                        {isEditing ? <select value={ed.ut} onChange={e=>setEditData(d=>({...d,ut:e.target.value}))} style={cellInp}>{UNITES_TRAVAIL.slice(1).map(u=><option key={u}>{u}</option>)}</select> : <span style={{ fontSize:11, color:'#6E6E73' }}>{r.ut}</span>}
                      </td>
                      {/* Danger */}
                      <td style={{ padding:'8px 10px', fontWeight:600 }}>
                        {isEditing ? <input value={ed.danger} onChange={e=>setEditData(d=>({...d,danger:e.target.value}))} style={cellInp}/> : r.danger}
                      </td>
                      {/* Source */}
                      <td style={{ padding:'8px 10px', color:'#6E6E73', maxWidth:120 }}>
                        {isEditing ? <input value={ed.source} onChange={e=>setEditData(d=>({...d,source:e.target.value}))} style={cellInp}/> : r.source}
                      </td>
                      {/* Effectifs */}
                      <td style={{ padding:'8px 10px', textAlign:'center' }}>
                        {isEditing ? <input type="number" min="1" value={ed.effectifs} onChange={e=>setEditData(d=>({...d,effectifs:e.target.value}))} style={{...cellInp,width:48,textAlign:'center'}}/> : r.effectifs}
                      </td>
                      {/* P */}
                      <td style={{ padding:'8px 10px', textAlign:'center', fontWeight:700 }}>
                        {isEditing ? <select value={ed.P} onChange={e=>setEditData(d=>({...d,P:Number(e.target.value)}))} style={{...cellInp,width:42}}>{[1,2,3,4].map(v=><option key={v}>{v}</option>)}</select> : r.P}
                      </td>
                      {/* G */}
                      <td style={{ padding:'8px 10px', textAlign:'center', fontWeight:700 }}>
                        {isEditing ? <select value={ed.G} onChange={e=>setEditData(d=>({...d,G:Number(e.target.value)}))} style={{...cellInp,width:42}}>{[1,2,3,4].map(v=><option key={v}>{v}</option>)}</select> : r.G}
                      </td>
                      {/* C */}
                      <td style={{ padding:'8px 10px', textAlign:'center' }}>
                        <span style={{ fontWeight:800, fontSize:15, color: critColor(crit(ed.P,ed.G)).color }}>{crit(ed.P,ed.G)}</span>
                      </td>
                      {/* Niveau */}
                      <td style={{ padding:'8px 10px' }}>
                        <span style={{ padding:'2px 7px', borderRadius:12, fontSize:11, fontWeight:700, background:critColor(crit(ed.P,ed.G)).bg, color:critColor(crit(ed.P,ed.G)).color, whiteSpace:'nowrap' }}>{critColor(crit(ed.P,ed.G)).label}</span>
                      </td>
                      {/* Mesures */}
                      <td style={{ padding:'8px 10px', maxWidth:180 }}>
                        {isEditing ? <input value={ed.mesures} onChange={e=>setEditData(d=>({...d,mesures:e.target.value}))} style={cellInp}/> : r.mesures}
                      </td>
                      {/* Responsable */}
                      <td style={{ padding:'8px 10px' }}>
                        {isEditing ? <input value={ed.responsable} onChange={e=>setEditData(d=>({...d,responsable:e.target.value}))} style={{...cellInp,width:90}}/> : r.responsable}
                      </td>
                      {/* Délai */}
                      <td style={{ padding:'8px 10px', whiteSpace:'nowrap' }}>
                        {isEditing ? <input type="date" value={ed.delai} onChange={e=>setEditData(d=>({...d,delai:e.target.value}))} style={cellInp}/> : fmt(r.delai)}
                      </td>
                      {/* Statut */}
                      <td style={{ padding:'8px 10px' }}>
                        {isEditing ? (
                          <select value={ed.statut} onChange={e=>setEditData(d=>({...d,statut:e.target.value}))} style={{...cellInp,width:90}}>
                            <option value="planifie">Planifié</option>
                            <option value="en_cours">En cours</option>
                            <option value="realise">Réalisé</option>
                          </select>
                        ) : statutBadge(r.statut)}
                      </td>
                      {/* Actions */}
                      <td style={{ padding:'8px 10px' }} className="no-print" onClick={e=>e.stopPropagation()}>
                        {isEditing ? (
                          <div style={{ display:'flex', gap:5 }}>
                            <button onClick={saveEdit} style={{ padding:'4px 10px', background:'#34C759', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600, fontSize:11 }}>✓</button>
                            <button onClick={cancelEdit} style={{ padding:'4px 8px', background:'#F2F2F7', border:'none', borderRadius:6, cursor:'pointer', fontSize:11 }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display:'flex', gap:5 }}>
                            <button onClick={()=>startEdit(r)} style={{ padding:'4px 10px', background:'#E3F2FD', color:'#1565C0', border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>Éditer</button>
                            <button onClick={()=>deleteRisque(r.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#FF3B30' }}><IconX size={13}/></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ── Habilitations tab ── */
  function TabHabilitations() {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employeId:'', nom:'', type:'électrique', niveau:'', organisme:'', dateObtention:new Date().toISOString().split('T')[0], dateExpiration:'', documentNom:'' });
    const [fichier, setFichier] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();

    async function handleFile(e) {
      const f = e.target.files[0];
      if(!f) return;
      setFichier(f);
      setScanning(true); setScanResult(null);
      const result = await simulerOCRHabilitation(f);
      setScanResult(result);
      setForm(prev=>({...prev, nom:result.nom, type:result.type, niveau:result.niveau, organisme:result.organisme, dateObtention:result.dateObtention, dateExpiration:result.dateExpiration, documentNom:f.name}));
      setScanning(false);
    }

    async function handleSubmit(e) {
      e.preventDefault();
      if(!form.employeId) { alert('Sélectionnez un employé'); return; }
      if(!form.nom || !form.dateExpiration) { alert('Nom et date d\'expiration obligatoires'); return; }
      setSaving(true);
      try {
        const r = await fetch(`${API_URL}/rh/habilitations`, {
          method:'POST', headers:authHeaders,
          body: JSON.stringify({...form, employeId:parseInt(form.employeId), documentNom:fichier?.name||form.documentNom }),
        });
        const d = await r.json();
        await reloadHabilitations();
        setShowForm(false);
        setFichier(null); setScanResult(null);
        setForm({ employeId:'', nom:'', type:'électrique', niveau:'', organisme:'', dateObtention:new Date().toISOString().split('T')[0], dateExpiration:'', documentNom:'' });
      } catch(err){ console.error(err); }
      setSaving(false);
    }

    async function deleteHab(id) {
      await fetch(`${API_URL}/rh/habilitations/${id}`, { method:'DELETE', headers:authHeaders });
      await reloadHabilitations();
    }

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {!showForm && (
          <button onClick={()=>setShowForm(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:13, alignSelf:'flex-start' }}>
            <IconPlus size={14}/> Ajouter une habilitation
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background:'#fff', borderRadius:14, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 16px' }}>Nouvelle habilitation</h3>

            {/* File upload with OCR */}
            <div onClick={()=>fileRef.current.click()} style={{
              border:`2px dashed ${fichier?'#34C759':'#E5E5EA'}`, borderRadius:12, padding:'18px', textAlign:'center', cursor:'pointer',
              marginBottom:16, background: fichier?'#D1F2E020':'#FAFAFA', transition:'all .2s'
            }}>
              <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={handleFile}/>
              {!fichier ? (
                <>
                  <div style={{ fontSize:30, marginBottom:6 }}>📎</div>
                  <div style={{ fontWeight:600, fontSize:14 }}>Joindre la photo ou le PDF de l'habilitation</div>
                  <div style={{ fontSize:12, color:'#636363', marginTop:4 }}>Le logiciel détectera automatiquement les informations du document</div>
                  <div style={{ fontSize:12, color:'#FF3B30', marginTop:4, fontWeight:600 }}>* Document obligatoire</div>
                </>
              ) : scanning ? (
                <><div style={{ fontSize:28, marginBottom:6 }}>🔍</div><div style={{ fontWeight:600, color:'#5B5BD6' }}>Analyse du document en cours…</div><div style={{ fontSize:12, color:'#6E6E73', marginTop:3 }}>Extraction automatique des informations</div></>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:56, height:56, background:'#D1F2E0', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>📄</div>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontWeight:700, color:'#34C759', fontSize:14 }}>✓ Document analysé avec succès</div>
                    {scanResult && <div style={{ fontSize:12, color:'#6E6E73', marginTop:2 }}>Confiance : {scanResult.confidence}% · Champs pré-remplis</div>}
                    <div style={{ fontSize:12, color:'#636363', marginTop:2 }}>{fichier.name}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={lbl}>Employé *</label>
                <select value={form.employeId} onChange={e=>setForm(p=>({...p,employeId:e.target.value}))} style={inp}>
                  <option value="">— Sélectionner —</option>
                  {employes.map(e=><option key={e.id} value={e.id}>{e.prenom} {e.nom} · {e.poste}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Nom de l'habilitation *</label>
                <input value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Ex. Habilitation électrique B1" style={inp} required/>
              </div>
              <div>
                <label style={lbl}>Type</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={inp}>
                  {['électrique','caces','sst','hauteur','amiante','échafaudage','autre'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Niveau / Catégorie</label>
                <input value={form.niveau} onChange={e=>setForm(p=>({...p,niveau:e.target.value}))} placeholder="Ex. B1, Cat. B, Recyclage…" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Organisme certificateur</label>
                <input value={form.organisme} onChange={e=>setForm(p=>({...p,organisme:e.target.value}))} placeholder="Ex. APAVE, Bureau Véritas…" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Date d'obtention</label>
                <input type="date" value={form.dateObtention} onChange={e=>setForm(p=>({...p,dateObtention:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Date d'expiration *</label>
                <input type="date" value={form.dateExpiration} onChange={e=>setForm(p=>({...p,dateExpiration:e.target.value}))} style={inp} required/>
              </div>
            </div>
            <div style={{ marginTop:14, display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'9px 18px', border:'1px solid #E5E5EA', borderRadius:10, background:'#fff', cursor:'pointer', fontWeight:600 }}>Annuler</button>
              <button type="submit" disabled={saving||scanning||!fichier} style={{ padding:'9px 22px', border:'none', borderRadius:10, background: (!fichier||saving||scanning)?'#C7C7CC':'#5B5BD6', color:'#fff', cursor:'pointer', fontWeight:600 }}>
                {saving?'Enregistrement…':'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {/* Habilitations table */}
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
          <div style={{ padding:'13px 18px', borderBottom:'1px solid #F2F2F7', fontWeight:700, fontSize:15 }}>Habilitations de l'équipe ({habilitations.length})</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F2F2F7' }}>
                {['Employé','Habilitation','Type/Niveau','Organisme','Obtenue','Expiration','Statut','Document',''].map(h=>(
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#636363', textTransform:'uppercase', letterSpacing:.5, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habilitations.length===0 ? (
                <tr><td colSpan={9} style={{ padding:40, textAlign:'center', color:'#636363' }}>Aucune habilitation enregistrée</td></tr>
              ) : habilitations.map((h,i) => {
                const emp = employes.find(e=>e.id===h.employeId);
                return (
                  <tr key={h.id} style={{ borderBottom:'1px solid #F2F2F7', background:i%2===0?'#fff':'#FAFAFA' }}>
                    <td style={{ padding:'11px 14px', fontWeight:600 }}>{emp?`${emp.prenom} ${emp.nom}`:`Employé #${h.employeId}`}</td>
                    <td style={{ padding:'11px 14px', fontWeight:600 }}>{h.nom}</td>
                    <td style={{ padding:'11px 14px', color:'#6E6E73', textTransform:'capitalize' }}>{h.type}{h.niveau&&` · ${h.niveau}`}</td>
                    <td style={{ padding:'11px 14px', color:'#6E6E73' }}>{h.organisme||'—'}</td>
                    <td style={{ padding:'11px 14px', color:'#6E6E73' }}>{fmt(h.dateObtention)}</td>
                    <td style={{ padding:'11px 14px', color: h.alerte==='expirée'?'#C0392B':h.alerte?'#856404':'#1A7F43', fontWeight:h.alerte?700:400 }}>{fmt(h.dateExpiration)}</td>
                    <td style={{ padding:'11px 14px' }}>
                      {h.alerte==='expirée' && <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:'#FFE5E5', color:'#C0392B' }}>Expirée</span>}
                      {h.alerte==='urgente' && <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:'#FFF3E0', color:'#E65100' }}>Urgente</span>}
                      {h.alerte==='bientôt' && <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:'#FFFDE7', color:'#856404' }}>Bientôt</span>}
                      {!h.alerte && <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, background:'#D1F2E0', color:'#1A7F43' }}>Valide</span>}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      {h.documentNom ? (
                        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#5B5BD6' }}><IconDocument size={13}/>{h.documentNom}</span>
                      ) : <span style={{ color:'#FF3B30', fontSize:12 }}>⚠ Manquant</span>}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <button onClick={()=>deleteHab(h.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#FF3B30' }}><IconX size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vérifier assignation */}
        <AssignationChecker employes={employes} habilitations={habilitations}/>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     DOCUMENTS QSE — FDS / Registre AT / Charte + génériques
  ══════════════════════════════════════════════ */
  function TabDocuments() {
    const [activeDoc, setActiveDoc] = useState(null); // 'fds' | 'registre-at' | 'charte-qualite' | null
    const [created, setCreated] = useState({}); // docId -> { contenu, dateMAJ }
    const [editing, setEditing] = useState(null); // docId en cours de création/édition
    const [formContenu, setFormContenu] = useState({});
    const [viewDoc, setViewDoc] = useState(null); // docId à prévisualiser

    /* ── FDS STATE ── */
    const [fds, setFds] = useState([
      { id:1, produit:'Peinture Acrylique Blanche V30', fournisseur:'Sikkens', ref:'V30-001', categorie:'Peinture/solvant', dateReception:'2025-01-15', dateExpiration:'2027-01-15', risques:'Irritant, inflammable', epi:'Gants nitrile, lunettes, masque FFP2', stockage:'Local ventilé, à l\'abri de la chaleur', fichierNom:'FDS_Sikkens_V30.pdf', statut:'valide' },
      { id:2, produit:'Colle carrelage C2 réacturé', fournisseur:'Weber', ref:'WEB-345', categorie:'Colle/adhésif', dateReception:'2025-02-10', dateExpiration:'2026-02-10', risques:'Irritant cutané, poussières', epi:'Gants, masque antipoussières', stockage:'Endroit sec, <25°C', fichierNom:'FDS_Weber_C2.pdf', statut:'valide' },
      { id:3, produit:'Décapant façade acide', fournisseur:'Blanchon', ref:'BL-720', categorie:'Produit chimique', dateReception:'2024-08-01', dateExpiration:'2025-08-01', risques:'Corrosif, dangereux pour l\'environnement', epi:'Gants résistants aux acides, lunettes étanches, tablier', stockage:'Local ventilé, séparé des bases', fichierNom:'FDS_Blanchon_Decapant.pdf', statut:'expire' },
    ]);
    const [showFdsForm, setShowFdsForm] = useState(false);
    const [fdsForm, setFdsForm] = useState({ produit:'', fournisseur:'', ref:'', categorie:'Peinture/solvant', dateReception:new Date().toISOString().split('T')[0], dateExpiration:'', risques:'', epi:'', stockage:'', fichierNom:'' });

    /* ── REGISTRE AT STATE ── */
    const today = new Date().toISOString().split('T')[0];
    const [accidents, setAccidents] = useState([
      { id:1, date:'2025-01-14', nom:'Martin P.', nature:'Coupure main gauche (ciseau)', gravite:'Leger', lieuxAT:'Chantier Dupont — Lyon 6', circonstances:'Manipulation ciseau bois sans gants', arrêt:false, joursArret:0, reprise:'2025-01-14', cerfaEnvoye:true },
      { id:2, date:'2025-02-22', nom:'Durand J.', nature:'Entorse cheville droite (chute échafaudage)', gravite:'Moyen', lieuxAT:'Chantier SCI Horizon — Créteil', circonstances:'Faux pas sur planche d\'échafaudage mouillée', arrêt:true, joursArret:7, reprise:'2025-03-01', cerfaEnvoye:true },
      { id:3, date:'2025-03-05', nom:'Bernard M.', nature:'Projection poussières ciment dans œil droit', gravite:'Leger', lieuxAT:'Atelier', circonstances:'Découpe parpaings sans lunettes de protection', arrêt:false, joursArret:0, reprise:'2025-03-05', cerfaEnvoye:false },
    ]);
    const [showAtForm, setShowAtForm] = useState(false);
    const AT_FORM_INIT = {
      /* Identité victime */
      nom:'', prenom:'', dateNaissance:'', numSS:'', adresseVictime:'', nationalite:'',
      /* Emploi */
      qualification:'', typeContrat:'CDI', anciennetePoste:'', serviceUT:'',
      /* Accident */
      date:today, heure:'', lieuType:'chantier', adresseLieu:'', commune:'',
      /* Lésion */
      natureLesion:'', siegeLesion:'bras/main', natureAccident:'chute de plain-pied',
      /* Circonstances */
      activiteMoment:'', objetCause:'', circonstances:'', epiPortes:'', temoin:'', temoinCoord:'',
      /* Tiers */
      tiersEnCause:false, identiteTiers:'',
      /* Conséquences */
      gravite:'Leger', arret:false, joursArret:0, soinsImmediats:'', medecin:'', hopital:'',
      reprise:today, hospitalisation:false,
      /* Déclaration CPAM */
      cerfaEnvoye:false, dateCerfaEnvoi:'', accuseReception:false,
    };
    const [atForm, setAtForm] = useState(AT_FORM_INIT);

    /* ── CHARTE QUALITÉ STATE ── */
    const CHARTE_DEFAULT = `CHARTE QUALITÉ CHANTIER
Bernard Martin BTP — SIRET 123 456 789 00012

1. ENGAGEMENT DE QUALITÉ
Bernard Martin BTP s'engage à réaliser l'ensemble de ses travaux dans le respect des normes DTU, des règles de l'art, et des exigences contractuelles définies avec le maître d'ouvrage.

2. PRÉPARATION DU CHANTIER
• Réunion de démarrage avec le client avant tout commencement
• Établissement d'un PPSPS pour les chantiers soumis à coordination SPS
• Vérification de la conformité des matériaux à la réception
• Mise en place des protections (bâches, calages, protection sols et murs existants)

3. EXÉCUTION DES TRAVAUX
• Respect des fiches techniques fabricants et DTU applicables
• Contrôle des épaisseurs, alignements et niveaux à chaque étape
• Photos de suivi d'avancement transmises hebdomadairement
• Réunion de chantier hebdomadaire avec compte-rendu écrit

4. GESTION DES NON-CONFORMITÉS
• Tout écart qualité identifié est signalé dans les 24h
• Fiche de non-conformité (FNC) émise et plan d'action corrective défini
• Retravaux effectués sous 48h pour les défauts mineurs, 5 jours pour les défauts majeurs

5. PROPRETÉ ET ENVIRONNEMENT
• Nettoyage du chantier à chaque fin de journée
• Tri sélectif des déchets (conformité BSDD)
• Protection des espaces verts et voies publiques
• Évacuation des gravats par prestataire agréé

6. RÉCEPTION DES TRAVAUX
• Visite de pré-réception avec le client (levée de réserves)
• Remise des DOE (Dossier des Ouvrages Exécutés)
• Remise des notices d'entretien des équipements installés
• Attestation de conformité aux travaux réalisés

7. GARANTIES
• Garantie de parfait achèvement : 1 an (art. 1792-6 C. civ.)
• Garantie biennale : 2 ans sur les équipements (art. 1792-3)
• Garantie décennale : 10 ans sur la structure (art. 1792)

8. SATISFACTION CLIENT
• Enquête de satisfaction systématique en fin de chantier
• Numéro de contact direct du chef de chantier communiqué dès le démarrage
• Réponse sous 24h à toute réclamation`;

    const [charteContenu, setCharteContenu] = useState(CHARTE_DEFAULT);
    const [charteSignataires, setCharteSignataires] = useState([
      { nom: 'Martin Bernard', role: 'Gérant', date: new Date().toLocaleDateString('fr-FR') },
      { nom: '', role: 'Responsable Qualité', date: '' },
    ]);
    const [charteMode, setCharteMode] = useState('view'); // 'view' | 'edit'

    // AT KPIs
    const currentYear = new Date().getFullYear();
    const accidentsAnnee = accidents.filter(a => a.date.startsWith(String(currentYear)));
    const nbEmployes = 8; // from demo
    const heuresTravail = nbEmployes * 1607; // heures annuelles
    const joursArretTotal = accidentsAnnee.reduce((s, a) => s + (Number(a.joursArret) || 0), 0);
    const TF = accidentsAnnee.length > 0 ? ((accidentsAnnee.length / heuresTravail) * 1000000).toFixed(1) : 0;
    const TG = joursArretTotal > 0 ? ((joursArretTotal / heuresTravail) * 1000).toFixed(2) : 0;
    const accidentsAvecArret = accidentsAnnee.filter(a => a.arrêt).length;

    if (activeDoc === 'fds') return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <button onClick={()=>setActiveDoc(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#5B5BD6', fontSize:14, fontWeight:600, padding:'0 0 4px' }}>← Retour aux documents</button>
            <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>Fiches de Données de Sécurité (FDS)</h2>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#6E6E73' }}>Règlement (CE) n°1907/2006 REACH — Art. L4411-1 CT — Obligatoire pour tout produit chimique</p>
          </div>
          <button onClick={()=>setShowFdsForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 }}>
            <IconPlus size={14}/> Ajouter un produit
          </button>
        </div>

        {/* Summary */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
          {[
            { label:'Total produits', val:fds.length, color:'#5B5BD6' },
            { label:'FDS valides', val:fds.filter(f=>f.statut==='valide').length, color:'#34C759' },
            { label:'FDS expirées', val:fds.filter(f=>f.statut==='expire').length, color:'#FF3B30' },
            { label:'Catégories', val:[...new Set(fds.map(f=>f.categorie))].length, color:'#FF9500' },
          ].map(k=>(
            <div key={k.label} style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
              <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.val}</div>
              <div style={{ fontSize:12, color:'#6E6E73', marginTop:3 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* FDS Form */}
        {showFdsForm && (
          <div style={{ background:'#F0F7FF', border:'2px solid #5B5BD640', borderRadius:16, padding:24 }}>
            <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:700 }}>Nouvelle FDS — Produit chimique</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {[
                { key:'produit', label:'Nom du produit *', ph:'Peinture acrylique…' },
                { key:'fournisseur', label:'Fournisseur *', ph:'Weber, Sikkens, Blanchon…' },
                { key:'ref', label:'Référence produit', ph:'REF-001' },
                { key:'categorie', label:'Catégorie', sel:['Peinture/solvant','Colle/adhésif','Produit chimique','Décapant','Enduit','EPI/lubrifiant','Autre'] },
                { key:'dateReception', label:'Date réception', type:'date' },
                { key:'dateExpiration', label:'Date expiration FDS', type:'date' },
              ].map(f=>(
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  {f.sel ? <select value={fdsForm[f.key]} onChange={e=>setFdsForm(p=>({...p,[f.key]:e.target.value}))} style={inp}>{f.sel.map(s=><option key={s} value={s}>{s}</option>)}</select>
                    : <input type={f.type||'text'} value={fdsForm[f.key]} onChange={e=>setFdsForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph||''} style={inp}/>}
                </div>
              ))}
              <div style={{ gridColumn:'1/-1', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div><label style={lbl}>Risques identifiés</label><input value={fdsForm.risques} onChange={e=>setFdsForm(p=>({...p,risques:e.target.value}))} placeholder="Irritant, inflammable…" style={inp}/></div>
                <div><label style={lbl}>EPI requis</label><input value={fdsForm.epi} onChange={e=>setFdsForm(p=>({...p,epi:e.target.value}))} placeholder="Gants, lunettes, masque…" style={inp}/></div>
                <div><label style={lbl}>Conditions de stockage</label><input value={fdsForm.stockage} onChange={e=>setFdsForm(p=>({...p,stockage:e.target.value}))} placeholder="Local ventilé, <25°C…" style={inp}/></div>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Nom du fichier PDF (FDS fournisseur)</label>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <input value={fdsForm.fichierNom} onChange={e=>setFdsForm(p=>({...p,fichierNom:e.target.value}))} placeholder="FDS_Produit.pdf" style={{...inp, flex:1}}/>
                  <button style={{ padding:'9px 14px', background:'#F2F2F7', border:'1px solid #E5E5EA', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>📎 Importer PDF</button>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 }}>
              <button onClick={()=>setShowFdsForm(false)} style={{ padding:'9px 18px', border:'1px solid #E5E5EA', borderRadius:10, background:'#fff', cursor:'pointer', fontWeight:600 }}>Annuler</button>
              <button onClick={()=>{ if(!fdsForm.produit||!fdsForm.fournisseur) return; const now = new Date(); const exp = fdsForm.dateExpiration ? new Date(fdsForm.dateExpiration) : null; setFds(p=>[{...fdsForm,id:Date.now(),statut:exp&&exp<now?'expire':'valide'},...p]); setShowFdsForm(false); setFdsForm({produit:'',fournisseur:'',ref:'',categorie:'Peinture/solvant',dateReception:today,dateExpiration:'',risques:'',epi:'',stockage:'',fichierNom:''}); }} style={{ padding:'9px 22px', border:'none', borderRadius:10, background:'#5B5BD6', color:'#fff', cursor:'pointer', fontWeight:700 }}>Enregistrer la FDS</button>
            </div>
          </div>
        )}

        {/* FDS Table */}
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F2F2F7' }}>
                {['Produit','Fournisseur','Catégorie','Risques','EPI','Réception','Expiration','Fichier','Statut'].map(h=>(
                  <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'#636363', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fds.map(f=>(
                <tr key={f.id} style={{ borderBottom:'1px solid #F2F2F7', background:f.statut==='expire'?'#FFF5F5':'#fff' }}>
                  <td style={{ padding:'10px 12px', fontWeight:700 }}>{f.produit}<div style={{ fontSize:11, color:'#636363' }}>Réf. {f.ref}</div></td>
                  <td style={{ padding:'10px 12px', color:'#6E6E73' }}>{f.fournisseur}</td>
                  <td style={{ padding:'10px 12px' }}><span style={{ background:'#F2F2F7', borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{f.categorie}</span></td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:'#6E6E73', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.risques}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:'#6E6E73', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.epi}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:'#6E6E73' }}>{fmt(f.dateReception)}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:f.statut==='expire'?'#C0392B':'#6E6E73', fontWeight:f.statut==='expire'?700:400 }}>{fmt(f.dateExpiration)||'—'}</td>
                  <td style={{ padding:'10px 12px' }}>
                    {f.fichierNom ? (
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#5B5BD6', cursor:'pointer', fontWeight:600 }}>
                        <IconDownload size={12}/> {f.fichierNom}
                      </div>
                    ) : <span style={{ fontSize:12, color:'#C7C7CC' }}>—</span>}
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600, background:f.statut==='expire'?'#FFE5E5':'#D1F2E0', color:f.statut==='expire'?'#C0392B':'#1A7F43' }}>
                      {f.statut==='expire'?'⚠ Expirée':'✓ Valide'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize:11, color:'#636363', padding:'4px 0' }}>Règlement (CE) n°1907/2006 REACH — Annexe II — Les FDS doivent être mises à jour et remises aux utilisateurs. Art. R4411-73 CT.</div>
      </div>
    );

    if (activeDoc === 'registre-at') return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div>
            <button onClick={()=>setActiveDoc(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#5B5BD6', fontSize:14, fontWeight:600, padding:'0 0 4px' }}>← Retour aux documents</button>
            <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>Registre des Accidents du Travail</h2>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#6E6E73' }}>Art. L441-4 et R441-3 CSS — Conservation 5 ans — À disposition de l'inspecteur du travail</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>window.print()} aria-label="Exporter le registre AT en PDF" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #E5E5EA', borderRadius:9, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}><IconDownload size={13}/> Exporter</button>
            <button onClick={()=>setShowAtForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', background:'#FF3B30', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 }}>
              <IconPlus size={14}/> Déclarer un accident
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12 }}>
          {[
            { label:`Accidents ${currentYear}`, val:accidentsAnnee.length, color:'#FF3B30', suffix:'' },
            { label:'Avec arrêt de travail', val:accidentsAvecArret, color:'#FF9500', suffix:'' },
            { label:'Jours d\'arrêt total', val:joursArretTotal, color:'#FF9500', suffix:' j' },
            { label:'TF (taux fréquence)', val:TF, color:'#5B5BD6', suffix:'', hint:'AT × 1 000 000 / heures travaillées' },
            { label:'TG (taux gravité)', val:TG, color:'#AF52DE', suffix:'', hint:'Jours perdu × 1 000 / heures travaillées' },
          ].map(k=>(
            <div key={k.label} style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.08)' }} title={k.hint||''}>
              <div style={{ fontSize:24, fontWeight:700, color:k.color }}>{k.val}{k.suffix}</div>
              <div style={{ fontSize:11, color:'#6E6E73', marginTop:3, lineHeight:1.4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* TF/TG context */}
        <div style={{ background:'#F8F9FA', borderRadius:12, padding:'12px 16px', fontSize:12, color:'#6E6E73' }}>
          <strong style={{ color:'#3C3C43' }}>Indicateurs sécurité {currentYear}</strong> — Effectif : {nbEmployes} salariés · Heures travaillées estimées : {heuresTravail.toLocaleString('fr-FR')} h
          {Number(TF) > 30 && <span style={{ marginLeft:12, color:'#C0392B', fontWeight:700 }}>⚠ TF élevé (référence BTP : ~25)</span>}
          {Number(TG) > 1 && <span style={{ marginLeft:12, color:'#C0392B', fontWeight:700 }}>⚠ TG élevé (référence BTP : ~1)</span>}
        </div>

        {/* Add form — CPAM Cerfa 14463*03 */}
        {showAtForm && (
          <div style={{ background:'#FFF5F5', border:'2px solid rgba(255,59,48,0.2)', borderRadius:16, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <div>
                <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#C0392B' }}>Déclaration d'Accident du Travail</h3>
                <p style={{ margin:'4px 0 0', fontSize:12, color:'#6E6E73' }}>Conforme Cerfa n°14463*03 — Délai légal : 48h ouvrées (Art. L441-2 CSS)</p>
              </div>
              <button onClick={()=>setShowAtForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6E6E73' }}><IconX size={18}/></button>
            </div>

            {/* Section 1 — Identité victime */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#C0392B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, paddingBottom:6, borderBottom:'2px solid #FF3B3020' }}>1. Identité de la victime</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <div><label style={lbl}>Nom *</label><input value={atForm.nom} onChange={e=>setAtForm(p=>({...p,nom:e.target.value}))} placeholder="NOM de famille" style={inp}/></div>
                <div><label style={lbl}>Prénom *</label><input value={atForm.prenom} onChange={e=>setAtForm(p=>({...p,prenom:e.target.value}))} placeholder="Prénom usuel" style={inp}/></div>
                <div><label style={lbl}>Date de naissance</label><input type="date" value={atForm.dateNaissance} onChange={e=>setAtForm(p=>({...p,dateNaissance:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>N° Sécurité Sociale</label><input value={atForm.numSS} onChange={e=>setAtForm(p=>({...p,numSS:e.target.value}))} placeholder="1 85 05 75 115 422 91" style={inp} maxLength={21}/></div>
                <div style={{ gridColumn:'2/-1' }}><label style={lbl}>Adresse domicile</label><input value={atForm.adresseVictime} onChange={e=>setAtForm(p=>({...p,adresseVictime:e.target.value}))} placeholder="N°, rue, CP, Ville" style={inp}/></div>
              </div>
            </div>

            {/* Section 2 — Situation professionnelle */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#C0392B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, paddingBottom:6, borderBottom:'2px solid #FF3B3020' }}>2. Situation professionnelle</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <div><label style={lbl}>Qualification / Poste *</label><input value={atForm.qualification} onChange={e=>setAtForm(p=>({...p,qualification:e.target.value}))} placeholder="Maçon, Électricien…" style={inp}/></div>
                <div>
                  <label style={lbl}>Type de contrat</label>
                  <select value={atForm.typeContrat} onChange={e=>setAtForm(p=>({...p,typeContrat:e.target.value}))} style={inp}>
                    {['CDI','CDD','Intérim','Apprentissage','Stage','Sous-traitant'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Ancienneté au poste</label><input value={atForm.anciennetePoste} onChange={e=>setAtForm(p=>({...p,anciennetePoste:e.target.value}))} placeholder="Ex: 2 ans, 3 mois" style={inp}/></div>
                <div><label style={lbl}>Service / Unité de travail</label><input value={atForm.serviceUT} onChange={e=>setAtForm(p=>({...p,serviceUT:e.target.value}))} placeholder="Maçonnerie, Électricité…" style={inp}/></div>
              </div>
            </div>

            {/* Section 3 — Accident */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#C0392B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, paddingBottom:6, borderBottom:'2px solid #FF3B3020' }}>3. L'accident</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <div><label style={lbl}>Date de l'accident *</label><input type="date" value={atForm.date} onChange={e=>setAtForm(p=>({...p,date:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>Heure *</label><input type="time" value={atForm.heure} onChange={e=>setAtForm(p=>({...p,heure:e.target.value}))} style={inp}/></div>
                <div>
                  <label style={lbl}>Type de lieu</label>
                  <select value={atForm.lieuType} onChange={e=>setAtForm(p=>({...p,lieuType:e.target.value}))} style={inp}>
                    {['chantier','atelier','bureau','voie publique','trajet domicile-travail','autre'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:'1/3' }}><label style={lbl}>Adresse précise du lieu *</label><input value={atForm.adresseLieu} onChange={e=>setAtForm(p=>({...p,adresseLieu:e.target.value}))} placeholder="Adresse complète du lieu de l'accident" style={inp}/></div>
                <div><label style={lbl}>Commune</label><input value={atForm.commune} onChange={e=>setAtForm(p=>({...p,commune:e.target.value}))} placeholder="Ville" style={inp}/></div>
              </div>
            </div>

            {/* Section 4 — Nature et siège des lésions */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#C0392B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, paddingBottom:6, borderBottom:'2px solid #FF3B3020' }}>4. Nature et siège des lésions</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <div>
                  <label style={lbl}>Gravité *</label>
                  <select value={atForm.gravite} onChange={e=>setAtForm(p=>({...p,gravite:e.target.value}))} style={inp}>
                    {['Leger','Moyen','Grave','Mortel'].map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Nature de la lésion *</label>
                  <select value={atForm.natureAccident} onChange={e=>setAtForm(p=>({...p,natureAccident:e.target.value}))} style={inp}>
                    {['chute de plain-pied','chute de hauteur','choc/heurt','coupure/lacération','brûlure','écrasement','projection','effort/torsion','électrisation','intoxication','autre'].map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Siège de la lésion *</label>
                  <select value={atForm.siegeLesion} onChange={e=>setAtForm(p=>({...p,siegeLesion:e.target.value}))} style={inp}>
                    {['tête/crâne','œil(s)','cou','épaule','bras/avant-bras','coude','main/doigts','thorax/dos','abdomen','jambe/genou','pied/cheville','multiple'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Description précise de la lésion *</label><input value={atForm.natureLesion} onChange={e=>setAtForm(p=>({...p,natureLesion:e.target.value}))} placeholder="Ex: Coupure profonde main gauche index, plaie nette 3cm" style={inp}/></div>
              </div>
            </div>

            {/* Section 5 — Circonstances */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#C0392B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, paddingBottom:6, borderBottom:'2px solid #FF3B3020' }}>5. Circonstances détaillées</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><label style={lbl}>Activité au moment de l'accident</label><input value={atForm.activiteMoment} onChange={e=>setAtForm(p=>({...p,activiteMoment:e.target.value}))} placeholder="Ex: Coupe de parpaings à la meuleuse" style={inp}/></div>
                <div><label style={lbl}>Objet / agent cause</label><input value={atForm.objetCause} onChange={e=>setAtForm(p=>({...p,objetCause:e.target.value}))} placeholder="Ex: Meuleuse, ciseau, échafaudage…" style={inp}/></div>
                <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Description complète des circonstances *</label><textarea value={atForm.circonstances} onChange={e=>setAtForm(p=>({...p,circonstances:e.target.value}))} placeholder="Décrire précisément ce qui s'est passé, les gestes effectués, les conditions…" rows={3} style={{...inp, resize:'vertical', minHeight:70}}/></div>
                <div><label style={lbl}>EPI portés au moment des faits</label><input value={atForm.epiPortes} onChange={e=>setAtForm(p=>({...p,epiPortes:e.target.value}))} placeholder="Ex: casque, gants, chaussures sécu…" style={inp}/></div>
                <div><label style={lbl}>Témoin(s)</label><input value={atForm.temoin} onChange={e=>setAtForm(p=>({...p,temoin:e.target.value}))} placeholder="Nom et prénom du/des témoin(s)" style={inp}/></div>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0' }}>
                  <input type="checkbox" id="tiers" checked={atForm.tiersEnCause} onChange={e=>setAtForm(p=>({...p,tiersEnCause:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label htmlFor="tiers" style={{...lbl, marginBottom:0, cursor:'pointer'}}>Tiers en cause</label>
                </div>
                {atForm.tiersEnCause && <div><label style={lbl}>Identité du tiers</label><input value={atForm.identiteTiers} onChange={e=>setAtForm(p=>({...p,identiteTiers:e.target.value}))} placeholder="Nom, coordonnées" style={inp}/></div>}
              </div>
            </div>

            {/* Section 6 — Conséquences */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#C0392B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, paddingBottom:6, borderBottom:'2px solid #FF3B3020' }}>6. Conséquences médicales</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <div><label style={lbl}>Soins immédiats prodigués</label><input value={atForm.soinsImmediats} onChange={e=>setAtForm(p=>({...p,soinsImmediats:e.target.value}))} placeholder="Premiers secours, infirmerie…" style={inp}/></div>
                <div><label style={lbl}>Médecin / Cabinet consulté</label><input value={atForm.medecin} onChange={e=>setAtForm(p=>({...p,medecin:e.target.value}))} placeholder="Dr. Dupont, Médecine du travail…" style={inp}/></div>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'22px 0 0' }}>
                  <input type="checkbox" id="hospi" checked={atForm.hospitalisation} onChange={e=>setAtForm(p=>({...p,hospitalisation:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label htmlFor="hospi" style={{...lbl, marginBottom:0, cursor:'pointer'}}>Hospitalisation</label>
                </div>
                {atForm.hospitalisation && <div><label style={lbl}>Hôpital / Clinique</label><input value={atForm.hopital} onChange={e=>setAtForm(p=>({...p,hopital:e.target.value}))} placeholder="Nom de l'établissement" style={inp}/></div>}
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'22px 0 0' }}>
                  <input type="checkbox" id="arret" checked={atForm.arret} onChange={e=>setAtForm(p=>({...p,arret:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label htmlFor="arret" style={{...lbl, marginBottom:0, cursor:'pointer'}}>Arrêt de travail prescrit</label>
                </div>
                {atForm.arret && <>
                  <div><label style={lbl}>Durée prévisionnelle (jours)</label><input type="number" min="1" value={atForm.joursArret} onChange={e=>setAtForm(p=>({...p,joursArret:Number(e.target.value)}))} style={inp}/></div>
                  <div><label style={lbl}>Date de reprise prévue</label><input type="date" value={atForm.reprise} onChange={e=>setAtForm(p=>({...p,reprise:e.target.value}))} style={inp}/></div>
                </>}
              </div>
            </div>

            {/* Section 7 — Déclaration CPAM */}
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#C0392B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, paddingBottom:6, borderBottom:'2px solid #FF3B3020' }}>7. Déclaration CPAM (Cerfa 14463*03)</div>
              <div style={{ background:'rgba(255,59,48,0.05)', borderRadius:10, padding:'10px 14px', marginBottom:10, fontSize:12, color:'#C0392B' }}>
                ⚖️ L'employeur doit déclarer tout AT à la CPAM dans les <strong>48h ouvrées</strong> suivant le sinistre (Art. L441-2 CSS). Amende de 3e classe en cas de retard.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <input type="checkbox" id="cerfa" checked={atForm.cerfaEnvoye} onChange={e=>setAtForm(p=>({...p,cerfaEnvoye:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label htmlFor="cerfa" style={{...lbl, marginBottom:0, cursor:'pointer'}}>Cerfa 14463*03 envoyé à la CPAM</label>
                </div>
                {atForm.cerfaEnvoye && <div><label style={lbl}>Date d'envoi CPAM</label><input type="date" value={atForm.dateCerfaEnvoi} onChange={e=>setAtForm(p=>({...p,dateCerfaEnvoi:e.target.value}))} style={inp}/></div>}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <input type="checkbox" id="ar" checked={atForm.accuseReception} onChange={e=>setAtForm(p=>({...p,accuseReception:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label htmlFor="ar" style={{...lbl, marginBottom:0, cursor:'pointer'}}>Accusé de réception CPAM reçu</label>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button onClick={()=>{setShowAtForm(false); setAtForm(AT_FORM_INIT);}} style={{ padding:'9px 18px', border:'1px solid #E5E5EA', borderRadius:10, background:'#fff', cursor:'pointer', fontWeight:600 }}>Annuler</button>
              <button onClick={()=>{
                if(!atForm.nom||!atForm.natureLesion||!atForm.circonstances) return;
                setAccidents(p=>[{
                  ...atForm, id:Date.now(),
                  // legacy compat fields
                  nature: `${atForm.natureAccident} — ${atForm.natureLesion}`,
                  lieuxAT: atForm.adresseLieu || atForm.lieuType,
                  arrêt: atForm.arret,
                },...p]);
                setShowAtForm(false);
                setAtForm(AT_FORM_INIT);
              }} style={{ padding:'9px 22px', border:'none', borderRadius:10, background:'#FF3B30', color:'#fff', cursor:'pointer', fontWeight:700 }}>
                Enregistrer dans le registre
              </button>
            </div>
          </div>
        )}

        {/* Accidents table */}
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
          <div style={{ padding:'13px 18px', borderBottom:'1px solid #F2F2F7', fontWeight:700, fontSize:15 }}>Registre — {accidents.length} accidents enregistrés</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F2F2F7' }}>
                {['Date','Heure','Salarié','Qualification','Lieu / Commune','Nature accident','Siège lésion','Gravité','Arrêt','Jours','Reprise','Cerfa CPAM'].map(h=>(
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'#636363', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accidents.map(a=>{
                const gc = { Leger:{bg:'#D1F2E0',c:'#1A7F43'}, Moyen:{bg:'#FFF3CD',c:'#856404'}, Grave:{bg:'#FFE5E5',c:'#C0392B'}, Mortel:{bg:'#3C0000',c:'#fff'} };
                const g = gc[a.gravite] || gc.Leger;
                return (
                  <tr key={a.id} style={{ borderBottom:'1px solid #F2F2F7' }}>
                    <td style={{ padding:'10px 12px', color:'#6E6E73', whiteSpace:'nowrap' }}>{fmt(a.date)}</td>
                    <td style={{ padding:'10px 12px', color:'#6E6E73', fontSize:12 }}>{a.heure||'—'}</td>
                    <td style={{ padding:'10px 12px', fontWeight:600, whiteSpace:'nowrap' }}>{a.nom}{a.prenom ? ` ${a.prenom}` : ''}</td>
                    <td style={{ padding:'10px 12px', color:'#6E6E73', fontSize:12 }}>{a.qualification||'—'}</td>
                    <td style={{ padding:'10px 12px', color:'#6E6E73', fontSize:12, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={a.adresseLieu||(a.lieuxAT||'')}>{a.adresseLieu || a.lieuxAT || '—'}{a.commune ? `, ${a.commune}` : ''}</td>
                    <td style={{ padding:'10px 12px', fontSize:12, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={a.nature||a.natureAccident}>{a.natureAccident||a.nature||'—'}</td>
                    <td style={{ padding:'10px 12px', fontSize:12, color:'#6E6E73' }}>{a.siegeLesion||'—'}</td>
                    <td style={{ padding:'10px 12px' }}><span style={{ padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:700, background:g.bg, color:g.c }}>{a.gravite}</span></td>
                    <td style={{ padding:'10px 12px', textAlign:'center' }}>{(a.arret||a.arrêt) ? '✓' : '—'}</td>
                    <td style={{ padding:'10px 12px', textAlign:'center', fontWeight:a.joursArret>0?700:400, color:a.joursArret>0?'#FF3B30':'#C7C7CC' }}>{a.joursArret>0?a.joursArret+'j':'—'}</td>
                    <td style={{ padding:'10px 12px', color:'#6E6E73', fontSize:12 }}>{(a.arret||a.arrêt) ? fmt(a.reprise) : '—'}</td>
                    <td style={{ padding:'10px 12px', textAlign:'center' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'center' }}>
                        <span style={{ padding:'2px 6px', borderRadius:8, fontSize:10, fontWeight:700, background:a.cerfaEnvoye?'#D1F2E0':'#FFF3CD', color:a.cerfaEnvoye?'#1A7F43':'#856404' }}>
                          {a.cerfaEnvoye ? '✓ Envoyé' : '⏳ À faire'}
                        </span>
                        {a.accuseReception && <span style={{ fontSize:9, color:'#1A7F43', fontWeight:600 }}>AR reçu</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    if (activeDoc === 'registre-incendie') return (
      <RegistreIncendie onRetour={() => setActiveDoc(null)} />
    );

    if (activeDoc === 'permis-feu') return (
      <PermisFeu onRetour={() => setActiveDoc(null)} />
    );

    if (activeDoc === 'ppsps') return (
      <PPSPS onRetour={() => setActiveDoc(null)} />
    );

    if (activeDoc === 'affichage-obligatoire') return (
      <AffichageObligatoire onRetour={() => setActiveDoc(null)} />
    );

    if (activeDoc === 'dechet') return (
      <PlanDechet onRetour={() => setActiveDoc(null)} />
    );

    if (activeDoc === 'diagnostic-demolition') return (
      <DiagnosticDemolition onRetour={() => setActiveDoc(null)} />
    );

    if (activeDoc === 'charte-qualite') return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div>
            <button onClick={()=>setActiveDoc(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#5B5BD6', fontSize:14, fontWeight:600, padding:'0 0 4px' }}>← Retour aux documents</button>
            <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>Charte Qualité Chantier</h2>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#6E6E73' }}>NF EN ISO 9001 · Garantie décennale art. 1792 CC · Référentiel Qualibat</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {charteMode === 'view' ? (
              <button onClick={()=>setCharteMode('edit')} style={{ padding:'8px 18px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 }}>Modifier</button>
            ) : (
              <button onClick={()=>setCharteMode('view')} style={{ padding:'8px 18px', background:'#34C759', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 }}>✓ Sauvegarder</button>
            )}
            <button onClick={()=>window.print()} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #E5E5EA', borderRadius:9, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}><IconDownload size={13}/> PDF</button>
          </div>
        </div>

        {/* Charte editor / viewer */}
        <div style={{ background:'#fff', borderRadius:16, padding:32, boxShadow:'0 2px 12px rgba(0,0,0,.08)' }}>
          {charteMode === 'edit' ? (
            <textarea value={charteContenu} onChange={e=>setCharteContenu(e.target.value)} rows={32}
              style={{ width:'100%', padding:16, border:'1px solid #E5E5EA', borderRadius:12, fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit', lineHeight:1.8, boxSizing:'border-box', color:'#1C1C1E' }}/>
          ) : (
            <pre style={{ fontFamily:'inherit', fontSize:13, lineHeight:2, whiteSpace:'pre-wrap', color:'#1C1C1E', margin:0 }}>{charteContenu}</pre>
          )}
        </div>

        {/* Signataires */}
        <div style={{ background:'#fff', borderRadius:14, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700 }}>Signataires</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
            {charteSignataires.map((s, i) => (
              <div key={i} style={{ border:'1px dashed #C7C7CC', borderRadius:12, padding:'18px 20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                  <div>
                    <label style={lbl}>Nom</label>
                    <input value={s.nom} onChange={e=>setCharteSignataires(prev=>prev.map((x,j)=>j===i?{...x,nom:e.target.value}:x))} placeholder="Nom Prénom" style={inp}/>
                  </div>
                  <div>
                    <label style={lbl}>Rôle</label>
                    <input value={s.role} onChange={e=>setCharteSignataires(prev=>prev.map((x,j)=>j===i?{...x,role:e.target.value}:x))} placeholder="Gérant, Responsable QSE…" style={inp}/>
                  </div>
                  <div>
                    <label style={lbl}>Date de signature</label>
                    <input type="date" value={s.date} onChange={e=>setCharteSignataires(prev=>prev.map((x,j)=>j===i?{...x,date:e.target.value}:x))} style={inp}/>
                  </div>
                </div>
                <div style={{ height:50, borderBottom:'1px solid #E5E5EA' }}></div>
                <div style={{ fontSize:11, color:'#636363', marginTop:8 }}>Signature de {s.role || '___'}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setCharteSignataires(prev=>[...prev,{nom:'',role:'',date:''}])} style={{ display:'flex', alignItems:'center', gap:6, marginTop:14, background:'none', border:'1px dashed #C7C7CC', borderRadius:10, padding:'8px 16px', cursor:'pointer', fontSize:13, color:'#6E6E73' }}>
            <IconPlus size={13}/> Ajouter un signataire
          </button>
        </div>
      </div>
    );

    // Champs par type de document
    const CHAMPS_DOC = {
      'registre-at': [
        { key:'entreprise', label:'Nom de l\'entreprise', ph:'Bernard Martin BTP' },
        { key:'siret', label:'N° SIRET', ph:'123 456 789 00012' },
        { key:'adresse', label:'Adresse du siège', ph:'12 rue des Artisans, 13005 Marseille' },
        { key:'responsable', label:'Responsable de la sécurité', ph:'Nom, Prénom' },
      ],
      'ppsps': [
        { key:'chantier', label:'Nom / adresse du chantier', ph:'Rénovation façade — 12 rue Hugo, Paris' },
        { key:'maitreouvrage', label:'Maître d\'ouvrage', ph:'SCI Horizon' },
        { key:'debut', label:'Date début travaux', ph:'2025-04-01', type:'date' },
        { key:'fin', label:'Date fin prévue', ph:'2025-06-30', type:'date' },
        { key:'effectif', label:'Effectif maximal simultané', ph:'8' },
        { key:'risques', label:'Risques principaux', ph:'Chute, électrique, co-activité…' },
        { key:'mesures', label:'Mesures de prévention', ph:'EPI, garde-corps, consignations…' },
      ],
      default: [
        { key:'entreprise', label:'Nom de l\'entreprise', ph:'Bernard Martin BTP' },
        { key:'siret', label:'N° SIRET', ph:'123 456 789 00012' },
        { key:'adresse', label:'Adresse', ph:'12 rue des Artisans, 13005 Marseille' },
        { key:'date', label:'Date du document', ph:'', type:'date' },
        { key:'redacteur', label:'Rédacteur', ph:'Nom, Prénom' },
        { key:'contenu', label:'Contenu / Observations', ph:'Saisissez le contenu du document…', multiline:true },
      ],
    };

    const MENTIONS = {
      'registre-at': ['Art. L441-4 CSS — Tenu à disposition de l\'inspecteur du travail', 'Art. R441-3 CSS — Enregistrement de tout accident du travail', 'Art. R4624-45 — Conservation 5 ans'],
      'ppsps': ['Art. L4532-8 et R4532-61 à R4532-98 Code du Travail', 'Décret n°94-1159 du 26 décembre 1994 — Coordination sécurité SPS', 'Art. R4532-61 — PPSPS obligatoire pour chantiers soumis à coordination'],
      'registre-incendie': ['Art. R123-51 CCH — Registre de sécurité obligatoire', 'Art. R123-43 — Contrôles périodiques des installations', 'Arrêté du 25 juin 1980 — ERP & chantiers'],
      default: ['Art. L4121-1 Code du Travail — Obligation de prévention', 'Art. L4711-1 — Responsabilité de l\'employeur en matière de sécurité', 'Accord du 28 janvier 2000 — Qualité et sécurité BTP'],
    };

    function getChamps(docId) { return CHAMPS_DOC[docId] || CHAMPS_DOC.default; }
    function getMentions(docId) { return MENTIONS[docId] || MENTIONS.default; }

    function openCreate(docId) {
      const champs = getChamps(docId);
      const init = {};
      champs.forEach(c => { init[c.key] = c.type === 'date' ? new Date().toISOString().split('T')[0] : ''; });
      setFormContenu(init);
      setEditing(docId);
    }

    function openEdit(docId) {
      setFormContenu({ ...created[docId]?.contenu });
      setEditing(docId);
    }

    function handleSave(e) {
      e.preventDefault();
      setCreated(prev => ({ ...prev, [editing]: { contenu: formContenu, dateMAJ: new Date().toISOString().split('T')[0] } }));
      setEditing(null);
    }

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ background:'#E3F2FD', borderRadius:12, padding:'12px 16px', border:'1px solid #1565C0', fontSize:13, color:'#1565C0', fontWeight:500 }}>
          Documents obligatoires BTP — Article L4121-1 du Code du Travail · Créez, éditez et visualisez chaque document directement depuis l'application.
        </div>

        {/* Creation / edition form */}
        {editing && (() => {
          const doc = DOCS_QSE.find(d => d.id === editing);
          const champs = getChamps(editing);
          return (
            <div style={{ background:'#F0F7FF', border:'2px solid #5B5BD640', borderRadius:16, padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>{created[editing] ? 'Modifier' : 'Créer'} — {doc?.nom}</h3>
                  <p style={{ margin:'4px 0 0', fontSize:12, color:'#6E6E73' }}>Remplissez les informations ci-dessous — le document sera généré automatiquement.</p>
                </div>
                <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#636363' }}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {champs.map(c => (
                    <div key={c.key} style={{ gridColumn: c.multiline ? '1/-1' : 'auto' }}>
                      <label style={lbl}>{c.label}</label>
                      {c.multiline ? (
                        <textarea value={formContenu[c.key]||''} onChange={e=>setFormContenu(p=>({...p,[c.key]:e.target.value}))} placeholder={c.ph} rows={4} style={{...inp,resize:'vertical',fontFamily:'inherit',lineHeight:1.5}} />
                      ) : (
                        <input type={c.type||'text'} value={formContenu[c.key]||''} onChange={e=>setFormContenu(p=>({...p,[c.key]:e.target.value}))} placeholder={c.ph} style={inp} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 }}>
                  <button type="button" onClick={()=>setEditing(null)} style={{ padding:'9px 18px', border:'1px solid #E5E5EA', borderRadius:10, background:'#fff', cursor:'pointer', fontWeight:600, fontSize:13 }}>Annuler</button>
                  <button type="submit" style={{ padding:'9px 22px', border:'none', borderRadius:10, background:'#5B5BD6', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13 }}>
                    {created[editing] ? 'Sauvegarder' : 'Générer le document'}
                  </button>
                </div>
              </form>
            </div>
          );
        })()}

        {/* View modal */}
        {viewDoc && (() => {
          const doc = DOCS_QSE.find(d => d.id === viewDoc);
          const data = created[viewDoc];
          const champs = getChamps(viewDoc);
          const mentions = getMentions(viewDoc);
          return (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={()=>setViewDoc(null)}>
              <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto', padding:36 }} onClick={e=>e.stopPropagation()} id="qse-doc-print">
                {/* Doc header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, paddingBottom:16, borderBottom:'3px solid #1C1C1E' }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 }}>Bernard Martin BTP · SIRET : {data?.contenu?.siret || '123 456 789 00012'}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#1C1C1E' }}>{doc?.nom}</div>
                    <div style={{ fontSize:13, color:'#6E6E73', marginTop:4 }}>{doc?.freq} · MAJ : {data?.dateMAJ || new Date().toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:700, background:'#D1F2E0', color:'#1A7F43' }}>
                      ✓ Enregistré
                    </span>
                    <button onClick={()=>window.print()} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 13px', background:'#1C1C1E', color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontSize:12, fontWeight:700 }} title="Exporter en PDF / Imprimer">
                      <IconDownload size={12}/> PDF
                    </button>
                    <button onClick={()=>{ const s=doc?.nom||'Document QSE'; window.open(`mailto:?subject=${encodeURIComponent(s)}&body=${encodeURIComponent('Veuillez trouver ci-joint le document : '+s)}`,'_blank'); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 13px', background:'#fff', color:'#1C1C1E', border:'1px solid #E5E5EA', borderRadius:9, cursor:'pointer', fontSize:12, fontWeight:600 }} title="Envoyer par e-mail">
                      ✉️ Email
                    </button>
                    <button onClick={()=>window.print()} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 13px', background:'#fff', color:'#1C1C1E', border:'1px solid #E5E5EA', borderRadius:9, cursor:'pointer', fontSize:12, fontWeight:600 }} title="Imprimer">
                      🖨️ Imprimer
                    </button>
                    <button onClick={()=>setViewDoc(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#636363', paddingLeft:4 }}>✕</button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                  {champs.map(c => {
                    const val = data?.contenu?.[c.key];
                    if (!val) return null;
                    return (
                      <div key={c.key} style={{ display:'flex', gap:12 }}>
                        <div style={{ width:180, fontSize:12, fontWeight:700, color:'#6E6E73', flexShrink:0 }}>{c.label}</div>
                        <div style={{ flex:1, fontSize:13, color:'#1C1C1E', whiteSpace:'pre-wrap', lineHeight:1.6 }}>{val}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Signature zone */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24, paddingTop:20, borderTop:'1px solid #E5E5EA' }}>
                  {['Responsable QSE', 'Dirigeant'].map(r => (
                    <div key={r} style={{ border:'1px dashed #C7C7CC', borderRadius:10, padding:'16px 18px', minHeight:80 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#636363', marginBottom:8 }}>Signature {r}</div>
                      <div style={{ fontSize:12, color:'#C7C7CC' }}>___________________________</div>
                      <div style={{ fontSize:11, color:'#C7C7CC', marginTop:8 }}>Date : ___/___/______</div>
                    </div>
                  ))}
                </div>

                {/* Mentions légales */}
                <div style={{ background:'#F8F9FA', borderRadius:10, padding:'14px 16px', borderTop:'3px solid #1C1C1E' }}>
                  <div style={{ fontSize:11, fontWeight:800, color:'#3C3C43', textTransform:'uppercase', letterSpacing:0.6, marginBottom:8 }}>Références légales</div>
                  {mentions.map((m, i) => <div key={i} style={{ fontSize:11, color:'#6E6E73', marginBottom:3 }}>• {m}</div>)}
                  <div style={{ fontSize:10, color:'#636363', marginTop:10 }}>
                    Bernard Martin BTP — SIRET : {data?.contenu?.siret || '123 456 789 00012'} · {data?.contenu?.adresse || '12 rue des Artisans, 13005 Marseille'} · Document généré le {new Date().toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Doc list per category */}
        {['Obligations légales','Prévention','Habilitations et formations','Qualité','Environnement'].map(cat=>{
          const items = DOCS_QSE.filter(d=>d.categorie===cat);
          if(!items.length) return null;
          return (
            <div key={cat} style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
              <div style={{ padding:'11px 18px', background:'#F8F9FA', borderBottom:'1px solid #F2F2F7', fontWeight:700, fontSize:14 }}>{cat}</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#FAFAFA', borderBottom:'1px solid #F2F2F7' }}>
                    {['Document','Obligatoire','Fréquence','Dernière MAJ','Actions'].map(h=>(
                      <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#636363', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(doc=>{
                    const estCree = !!created[doc.id];
                    // Special docs with dedicated views
                    const isSpecial = ['fds','registre-at','charte-qualite','registre-incendie','permis-feu','ppsps','affichage-obligatoire','dechet','diagnostic-demolition'].includes(doc.id);
                    return (
                      <tr key={doc.id} style={{ borderBottom:'1px solid #F2F2F7', background: estCree ? '#FAFFF8' : '#fff' }}>
                        <td style={{ padding:'11px 14px', fontWeight:600 }}>
                          {doc.nom}
                          {isSpecial && <span style={{ marginLeft:8, fontSize:10, fontWeight:700, color:'#5B5BD6', background:'#E3F2FD', padding:'1px 6px', borderRadius:8 }}>Gestionnaire dédié</span>}
                          {estCree && !isSpecial && <span style={{ marginLeft:8, fontSize:10, fontWeight:700, color:'#34C759', background:'#D1F2E0', padding:'1px 6px', borderRadius:8 }}>Créé</span>}
                        </td>
                        <td style={{ padding:'11px 14px' }}>
                          {doc.obligatoire ? <span style={{ padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600, background:'#FFE5E5', color:'#C0392B' }}>Obligatoire</span>
                            : <span style={{ padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600, background:'#F2F2F7', color:'#6E6E73' }}>Recommandé</span>}
                        </td>
                        <td style={{ padding:'11px 14px', fontSize:12, color:'#6E6E73' }}>{doc.freq}</td>
                        <td style={{ padding:'11px 14px', fontSize:12, color: created[doc.id] ? '#1A7F43' : doc.derniereMAJ==='—' ? '#FF9500' : '#6E6E73' }}>
                          {created[doc.id] ? created[doc.id].dateMAJ : doc.derniereMAJ}
                        </td>
                        <td style={{ padding:'11px 14px' }}>
                          {isSpecial ? (
                            <button onClick={()=>setActiveDoc(doc.id)} style={{ padding:'5px 14px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                              Ouvrir →
                            </button>
                          ) : (
                            <div style={{ display:'flex', gap:7 }}>
                              {!estCree ? (
                                <button onClick={()=>openCreate(doc.id)} style={{ padding:'5px 12px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                                  Créer
                                </button>
                              ) : (
                                <>
                                  <button onClick={()=>setViewDoc(doc.id)} style={{ padding:'5px 12px', background:'#34C759', color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                                    Ouvrir
                                  </button>
                                  <button onClick={()=>openEdit(doc.id)} style={{ padding:'5px 12px', background:'#fff', color:'#5B5BD6', border:'1px solid #5B5BD6', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                                    Éditer
                                  </button>
                                </>
                              )}
                              {estCree && (
                                <button onClick={()=>setViewDoc(doc.id)} style={{ padding:'5px 9px', background:'#F2F2F7', color:'#3C3C43', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }} title="Exporter / imprimer / e-mail">
                                  <IconDownload size={11}/> Exporter
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Plans de prévention ── */
  function TabPlansPrevention() {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ chantier:'', date:'', entreprises:'', risques:'', mesures:'' });

    function handleAdd(e) {
      e.preventDefault();
      const newPlan = {
        id: Date.now(),
        chantier: form.chantier,
        date: form.date,
        entreprises: form.entreprises.split(',').map(s=>s.trim()).filter(Boolean),
        risques: form.risques.split(',').map(s=>s.trim()).filter(Boolean),
        statut: 'actif',
      };
      setPlans(p=>[newPlan,...p]);
      setShowModal(false);
      setForm({ chantier:'', date:'', entreprises:'', risques:'', mesures:'' });
    }

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, margin:0 }}>Plans de prévention</h2>
            <p style={{ fontSize:13, color:'#6E6E73', marginTop:3 }}>Co-activité avec entreprises extérieures — Art. R4512-6 à R4512-12</p>
          </div>
          <button onClick={()=>setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', border:'none', borderRadius:10, background:'#5B5BD6', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <IconPlus size={14}/> Nouveau plan
          </button>
        </div>

        {/* Creation modal */}
        {showModal && (
          <form onSubmit={handleAdd} style={{ background:'#F0F7FF', border:'1px solid #5B5BD6', borderRadius:14, padding:22 }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 14px' }}>Nouveau plan de prévention</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Chantier *</label><input value={form.chantier} onChange={e=>setForm(p=>({...p,chantier:e.target.value}))} placeholder="Rénovation appartement Dupont" style={inp} required/></div>
              <div><label style={lbl}>Date d'inspection préalable *</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={inp} required/></div>
              <div><label style={lbl}>Entreprises extérieures (séparées par virgule)</label><input value={form.entreprises} onChange={e=>setForm(p=>({...p,entreprises:e.target.value}))} placeholder="Électricité Martin, Plomberie Durand" style={inp}/></div>
              <div><label style={lbl}>Risques co-activité identifiés</label><input value={form.risques} onChange={e=>setForm(p=>({...p,risques:e.target.value}))} placeholder="Électrique, Chute hauteur, Co-activité" style={inp}/></div>
              <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Mesures de prévention</label><textarea value={form.mesures} onChange={e=>setForm(p=>({...p,mesures:e.target.value}))} rows={3} placeholder="EPI obligatoires, zones d'exclusion, réunion de coordination…" style={{...inp,resize:'vertical',fontFamily:'inherit',lineHeight:1.5}}/></div>
            </div>
            <div style={{ marginTop:14, display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button type="button" onClick={()=>setShowModal(false)} style={{ padding:'9px 18px', border:'1px solid #E5E5EA', borderRadius:10, background:'#fff', cursor:'pointer', fontWeight:600 }}>Annuler</button>
              <button type="submit" style={{ padding:'9px 22px', border:'none', borderRadius:10, background:'#5B5BD6', color:'#fff', cursor:'pointer', fontWeight:600 }}>Créer le plan</button>
            </div>
          </form>
        )}

        {plans.map(plan=>(
          <div key={plan.id} style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{plan.chantier}</div>
                <div style={{ fontSize:13, color:'#6E6E73', marginTop:3 }}>Inspection : {fmt(plan.date)}</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, background: plan.statut==='actif'?'#D1F2E0':'#F2F2F7', color: plan.statut==='actif'?'#1A7F43':'#6E6E73' }}>
                {plan.statut==='actif'?'Actif':'Clôturé'}
              </span>
            </div>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginBottom:12 }}>
              {plan.entreprises?.length>0 && <div><div style={{ fontSize:11, fontWeight:700, color:'#636363', textTransform:'uppercase', marginBottom:5 }}>Entreprises</div><div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{plan.entreprises.map((e,i)=><span key={i} style={{ fontSize:12, padding:'3px 10px', background:'#F2F2F7', borderRadius:8 }}>{e}</span>)}</div></div>}
              {plan.risques?.length>0 && <div><div style={{ fontSize:11, fontWeight:700, color:'#636363', textTransform:'uppercase', marginBottom:5 }}>Risques</div><div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{plan.risques.map((r,i)=><span key={i} style={{ fontSize:12, padding:'3px 10px', background:'#FFF3E0', color:'#856404', borderRadius:8 }}>{r}</span>)}</div></div>}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ setForm({chantier:plan.chantier,date:plan.date,entreprises:plan.entreprises?.join(', ')||'',risques:plan.risques?.join(', ')||'',mesures:''}); setShowModal(true); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', border:'1px solid #E5E5EA', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}><IconRefresh size={12}/> Modifier</button>
              <button onClick={()=>genererPlanPrevention(plan, 'Bernard Martin BTP', '123 456 789 00012')} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', border:'1px solid #E5E5EA', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}><IconDownload size={12}/> PDF</button>
              <button onClick={()=>setPlans(p=>p.map(x=>x.id===plan.id?{...x,statut:'clôturé'}:x))} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', border:'1px solid #E5E5EA', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}><IconCheck size={12}/> Clôturer</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const tabContent = { 'Tableau de bord':<TabDashboard/>, 'DUERP':<TabDUERP/>, 'Habilitations':<TabHabilitations/>, 'EPI':<EPIModule/>, 'Incidents':<IncidentsModule/>, 'Non-conformités':<NonConformitesModule/>, 'BSDD':<BSDDModule/>, 'Certifications':<CertificationsModule/>, 'Formulaires AMELI':<FormulairesAMELI/>, 'Audits':<AuditsModule/>, 'Rapport annuel':<RapportAnnuelQHSE/>, 'Documents QSE':<TabDocuments/>, 'Plans de prévention':<TabPlansPrevention/> };

  // Chantiers pour la vue "Sécurité chantier"
  const [chantiers, setChantiers] = useState([]);
  const [selectedChantier, setSelectedChantier] = useState(null);
  const [chantierDoc, setChantierDoc] = useState(null); // doc actif pour un chantier
  useEffect(() => {
    api.get('/patron/chantiers').then(r => setChantiers(r.data?.chantiers || [])).catch(() => {
      const lsChantiers = (() => { try { const c = JSON.parse(localStorage.getItem('freample_chantiers_custom')); return c?.length ? c : null; } catch { return null; } })();
      setChantiers(lsChantiers || [
        { id:'ch1', nom:'Rénovation cuisine — Mme Dupont', adresse:'12 rue de la Liberté, 13001 Marseille', statut:'en_cours', equipe:['Pierre Martin','Sophie Duval','Lucas Garcia'] },
        { id:'ch3', nom:'Peinture parties communes — Syndic Voltaire', adresse:'15 bd Voltaire, 13005 Marseille', statut:'en_cours', equipe:['Luc Moreau','Pierre Martin'] },
        { id:'ch2', nom:'Mise aux normes électriques — SCI Horizon', adresse:'5 rue Pasteur, 13006 Marseille', statut:'planifie', equipe:['Claire Bernard'] },
      ]);
    });
  }, []);

  const CHANTIER_DOCS = [
    { id:'ppsps', label:'PPSPS', desc:'Plan Particulier de Sécurité et de Protection de la Santé', obligatoire:true, ref:'Art. R4532-66 CT' },
    { id:'plan-prevention', label:'Plan de prévention', desc:'Obligatoire si co-activité avec d\'autres entreprises', obligatoire:true, ref:'Art. R4512-6 CT' },
    { id:'permis-feu', label:'Permis de feu', desc:'Avant tout travail par points chauds (soudure, meulage)', obligatoire:false, ref:'Recommandation APSAD R6' },
    { id:'registre-verif', label:'Registre des vérifications', desc:'Échafaudages, nacelles, appareils de levage, installations électriques', obligatoire:true, ref:'Art. R4323-23 CT' },
    { id:'accueil-securite', label:'Accueil sécurité', desc:'Fiche d\'accueil signée par chaque ouvrier arrivant sur ce chantier', obligatoire:true, ref:'Art. R4141-2 CT' },
    { id:'affichage-chantier', label:'Affichage chantier', desc:'Panneau chantier, plan évacuation, EPI obligatoires, consignes urgence', obligatoire:true, ref:'Art. L421-3 CU' },
    { id:'protocole-livraison', label:'Protocole chargement/déchargement', desc:'Pour toute livraison de matériaux sur le chantier', obligatoire:true, ref:'Art. R4515-4 CT' },
    { id:'diagnostic-amiante', label:'Diagnostic amiante/plomb', desc:'Obligatoire avant travaux sur bâtiment construit avant 1997', obligatoire:true, ref:'Art. R4412-97 CT' },
  ];

  function getChantierDocStatus(chantierId, docId) {
    const key = `freample_qse_${docId}_${chantierId}`;
    return localStorage.getItem(key) ? 'fait' : 'a_faire';
  }
  function markChantierDoc(chantierId, docId) {
    const key = `freample_qse_${docId}_${chantierId}`;
    localStorage.setItem(key, JSON.stringify({ date: new Date().toISOString(), statut: 'fait' }));
    setChantierDoc(null); // force re-render
    setSelectedChantier(null);
    setTimeout(() => setSelectedChantier(chantierId), 10);
  }

  // ══════════════════════════════════════
  //  RENDU — Hub → Thème → Contenu
  // ══════════════════════════════════════

  // Mode HUB (aucune section sélectionnée ou section='hub')
  if (activeSection === 'hub') {
    return (
      <div style={{ padding:28, maxWidth:1200, margin:'0 auto' }}>
        <QSELegalBanner />
        <h1 style={{ fontSize:26, fontWeight:700, margin:'0 0 6px' }}>QHSE</h1>
        <p style={{ color:'#6E6E73', fontSize:14, margin:'0 0 28px' }}>Qualité, Hygiène, Sécurité, Environnement — choisissez un thème.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14 }}>
          {QHSE_SECTIONS.map(s => {
            const nbDocs = s.id === 'chantier' ? chantiers.filter(c=>c.statut==='en_cours'||c.statut==='planifie').length + ' chantiers' : s.tabs.length + ' modules';
            return (
              <button key={s.id} onClick={() => { setActiveSection(s.id); if(s.tabs.length) setTab(s.tabs[0]); }}
                style={{ background:'#fff', border:`1px solid #E8E6E1`, borderTop:`4px solid ${s.color}`, padding:'24px 20px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', transition:'box-shadow .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ fontSize:18, fontWeight:800, color:s.color, marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:12, color:'#6E6E73', lineHeight:1.5, marginBottom:12 }}>{s.desc}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'#999' }}>{nbDocs}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Mode SÉCURITÉ CHANTIER (par chantier)
  if (activeSection === 'chantier') {
    return (
      <div style={{ padding:28, maxWidth:1200, margin:'0 auto' }}>
        <button onClick={() => setActiveSection('hub')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:'#A68B4B', marginBottom:16, fontFamily:'inherit' }}>← Retour QHSE</button>
        <h1 style={{ fontSize:26, fontWeight:700, margin:'0 0 6px' }}>Sécurité chantier</h1>
        <p style={{ color:'#6E6E73', fontSize:14, margin:'0 0 24px' }}>Documents de sécurité obligatoires par chantier.</p>

        {!selectedChantier ? (
          <>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Sélectionnez un chantier</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {chantiers.filter(c => c.statut !== 'terminee' && c.statut !== 'annulee').map(c => {
                const docsTotal = CHANTIER_DOCS.length;
                const docsFaits = CHANTIER_DOCS.filter(d => getChantierDocStatus(c.id, d.id) === 'fait').length;
                const pct = Math.round(docsFaits / docsTotal * 100);
                const allDone = docsFaits === docsTotal;
                return (
                  <button key={c.id} onClick={() => setSelectedChantier(c.id)}
                    style={{ background:'#fff', border:`1px solid #E8E6E1`, borderLeft:`4px solid ${allDone ? '#16A34A' : pct > 0 ? '#D97706' : '#DC2626'}`, padding:'16px 20px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700 }}>{c.nom || c.titre}</div>
                      <div style={{ fontSize:12, color:'#6E6E73', marginTop:2 }}>{c.adresse}</div>
                      {(c.equipe || []).length > 0 && <div style={{ fontSize:11, color:'#999', marginTop:2 }}>{c.equipe.join(', ')}</div>}
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:20, fontWeight:200, color: allDone ? '#16A34A' : pct > 0 ? '#D97706' : '#DC2626' }}>{docsFaits}/{docsTotal}</div>
                      <div style={{ fontSize:10, color:'#999' }}>documents</div>
                      <div style={{ width:80, height:4, background:'#E8E6E1', borderRadius:2, marginTop:4 }}>
                        <div style={{ width:`${pct}%`, height:4, background: allDone ? '#16A34A' : '#D97706', borderRadius:2 }} />
                      </div>
                    </div>
                  </button>
                );
              })}
              {chantiers.filter(c => c.statut !== 'terminee' && c.statut !== 'annulee').length === 0 && (
                <div style={{ padding:32, textAlign:'center', color:'#999', fontSize:13 }}>Aucun chantier actif.</div>
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setSelectedChantier(null); setChantierDoc(null); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:'#A68B4B', marginBottom:16, fontFamily:'inherit' }}>← Retour liste chantiers</button>
            {(() => {
              const c = chantiers.find(x => x.id === selectedChantier);
              if (!c) return null;
              return (
                <div>
                  <div style={{ marginBottom:20 }}>
                    <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 4px' }}>{c.nom || c.titre}</h2>
                    <div style={{ fontSize:13, color:'#6E6E73' }}>{c.adresse}</div>
                  </div>

                  {!chantierDoc ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {CHANTIER_DOCS.map(doc => {
                        const status = getChantierDocStatus(c.id, doc.id);
                        const done = status === 'fait';
                        return (
                          <div key={doc.id} style={{ background:'#fff', border:`1px solid #E8E6E1`, borderLeft:`3px solid ${done ? '#16A34A' : doc.obligatoire ? '#DC2626' : '#D97706'}`, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                                <span style={{ fontSize:13, fontWeight:700 }}>{doc.label}</span>
                                {doc.obligatoire && <span style={{ fontSize:9, fontWeight:700, color:'#DC2626', background:'#FEF2F2', padding:'1px 6px' }}>Obligatoire</span>}
                                <span style={{ fontSize:10, fontWeight:600, color: done ? '#16A34A' : '#DC2626', background: done ? '#F0FDF4' : '#FEF2F2', padding:'2px 8px' }}>{done ? 'Fait' : 'A faire'}</span>
                              </div>
                              <div style={{ fontSize:11, color:'#6E6E73' }}>{doc.desc}</div>
                              <div style={{ fontSize:10, color:'#999', marginTop:2 }}>{doc.ref}</div>
                            </div>
                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                              {!done && (
                                <button onClick={() => markChantierDoc(c.id, doc.id)}
                                  style={{ padding:'6px 14px', background:'#16A34A', color:'#fff', border:'none', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                                  Marquer fait
                                </button>
                              )}
                              <button onClick={() => setChantierDoc(doc.id)}
                                style={{ padding:'6px 14px', background:'transparent', color:'#1A1A1A', border:'1px solid #E8E6E1', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                                {done ? 'Voir' : 'Créer'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setChantierDoc(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:'#A68B4B', marginBottom:16, fontFamily:'inherit' }}>← Retour documents</button>
                      {chantierDoc === 'ppsps' && <PPSPS />}
                      {chantierDoc === 'plan-prevention' && <TabPlansPrevention />}
                      {chantierDoc === 'permis-feu' && <PermisFeu />}
                      {chantierDoc === 'affichage-chantier' && <AffichageObligatoire />}
                      {chantierDoc === 'diagnostic-amiante' && <DiagnosticDemolition />}
                      {chantierDoc === 'registre-verif' && (
                        <div style={{ background:'#fff', border:'1px solid #E8E6E1', padding:20 }}>
                          <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>Registre des vérifications périodiques</h3>
                          <p style={{ fontSize:12, color:'#6E6E73', marginBottom:16 }}>Art. R4323-23 CT — Vérification obligatoire des équipements avant utilisation.</p>
                          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {['Échafaudages — montage conforme, amarrages, platelages', 'Nacelles élévatrices — contrôle technique à jour', 'Appareils de levage — élingues, crochets, limiteurs de charge', 'Installations électriques provisoires — différentiel, terres, IP44', 'Garde-corps et filets de sécurité — fixation, état', 'Extincteurs — vérification annuelle, accessibilité'].map((item, i) => (
                              <label key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background: i%2===0 ? '#FAFAF8' : 'transparent', cursor:'pointer', fontSize:13 }}>
                                <input type="checkbox" style={{ accentColor:'#16A34A', width:18, height:18 }} />
                                <span>{item}</span>
                              </label>
                            ))}
                          </div>
                          <div style={{ marginTop:16 }}>
                            <button onClick={() => markChantierDoc(c.id, 'registre-verif')}
                              style={{ padding:'10px 24px', background:'#16A34A', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Valider les vérifications</button>
                          </div>
                        </div>
                      )}
                      {chantierDoc === 'accueil-securite' && (
                        <div style={{ background:'#fff', border:'1px solid #E8E6E1', padding:20 }}>
                          <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>Accueil sécurité — {c.nom}</h3>
                          <p style={{ fontSize:12, color:'#6E6E73', marginBottom:16 }}>Art. R4141-2 CT — Chaque ouvrier arrivant sur ce chantier doit recevoir une formation sécurité et signer cette fiche.</p>
                          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {(c.equipe || ['Ouvrier 1']).map((nom, i) => (
                              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#FAFAF8', border:'1px solid #E8E6E1' }}>
                                <div>
                                  <div style={{ fontSize:14, fontWeight:600 }}>{nom}</div>
                                  <div style={{ fontSize:11, color:'#999' }}>Points abordés : risques du chantier, EPI obligatoires, consignes urgence, plan évacuation</div>
                                </div>
                                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                  <input type="checkbox" style={{ accentColor:'#16A34A', width:18, height:18 }} />
                                  Signé
                                </label>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop:16 }}>
                            <button onClick={() => markChantierDoc(c.id, 'accueil-securite')}
                              style={{ padding:'10px 24px', background:'#16A34A', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Valider l'accueil</button>
                          </div>
                        </div>
                      )}
                      {chantierDoc === 'protocole-livraison' && (
                        <div style={{ background:'#fff', border:'1px solid #E8E6E1', padding:20 }}>
                          <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>Protocole de sécurité chargement/déchargement</h3>
                          <p style={{ fontSize:12, color:'#6E6E73', marginBottom:16 }}>Art. R4515-4 CT — Obligatoire pour toute opération de chargement/déchargement sur le chantier.</p>
                          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {['Zone de déchargement balisée et signalée', 'Accès véhicules sécurisé (marche arrière, giration)', 'Moyens de manutention disponibles (grue, chariot, transpalette)', 'EPI spécifiques (casque, chaussures, gants, gilet HV)', 'Consignes communiquées au chauffeur (vitesse, itinéraire, stationnement)', 'Interdit de passer sous la charge', 'Responsable réception identifié'].map((item, i) => (
                              <label key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background: i%2===0 ? '#FAFAF8' : 'transparent', cursor:'pointer', fontSize:13 }}>
                                <input type="checkbox" style={{ accentColor:'#16A34A', width:18, height:18 }} />
                                <span>{item}</span>
                              </label>
                            ))}
                          </div>
                          <div style={{ marginTop:16 }}>
                            <button onClick={() => markChantierDoc(c.id, 'protocole-livraison')}
                              style={{ padding:'10px 24px', background:'#16A34A', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Valider le protocole</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>
    );
  }

  // Mode THÈME (Q, H, S, E)
  return (
    <div style={{ padding:28, maxWidth:1200, margin:'0 auto' }}>
      <button onClick={() => setActiveSection('hub')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:'#A68B4B', marginBottom:16, fontFamily:'inherit' }}>← Retour QHSE</button>
      <QSELegalBanner />
      {(() => {
        const section = QHSE_SECTIONS.find(s => s.id === activeSection) || QHSE_SECTIONS[2];
        return <>
          <div style={{ marginBottom:22 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:5, height:28, borderRadius:3, background:section.color }} />
              <h1 style={{ fontSize:26, fontWeight:700, margin:0 }}>{section.label}</h1>
            </div>
          </div>
          {section.tabs.length > 1 && (
            <div className="no-print" style={{ display:'flex', gap:4, background:'#F2F2F7', borderRadius:12, padding:4, marginBottom:22, overflowX:'auto' }}>
              {section.tabs.map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{
                  padding:'8px 16px', border:'none', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap', transition:'all .15s',
                  background:tab===t?section.color:'transparent', color:tab===t?'#fff':'#6E6E73',
                }}>{t}</button>
              ))}
            </div>
          )}
        </>;
      })()}
      {loading ? <div style={{ padding:60, textAlign:'center', color:'#636363' }}>Chargement…</div> : tabContent[tab]}
    </div>
  );
}

function AssignationChecker({ employes=[], habilitations=[] }) {
  const [employeId, setEmployeId] = useState('');
  const [competences, setCompetences] = useState('');
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);

  async function verifier() {
    if(!employeId) return;
    setLoading(true);
    try {
      const { data } = await api.post('/qse/verifier-assignation', { employeId:parseInt(employeId), competencesRequises:competences.split(',').map(c=>c.trim()).filter(Boolean) });
      setResultat(data);
    } catch(err){ alert(err.response?.data?.erreur||'Erreur'); }
    setLoading(false);
  }

  return (
    <div style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.08)' }}>
      <h3 style={{ marginBottom:4, fontSize:15, fontWeight:700 }}>Vérifier l'assignation d'un employé</h3>
      <p style={{ fontSize:13, color:'#6E6E73', marginBottom:14 }}>Contrôlez qu'un employé possède les habilitations requises avant assignation.</p>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <select value={employeId} onChange={e=>setEmployeId(e.target.value)} style={{ padding:'8px 12px', border:'1px solid #E5E5EA', borderRadius:8, fontSize:13, outline:'none', minWidth:200 }}>
          <option value="">— Sélectionner un employé —</option>
          {employes.map(e=><option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
        </select>
        <input placeholder="Compétences requises (ex: habilitation électrique, CACES)" value={competences} onChange={e=>setCompetences(e.target.value)} style={{ flex:1, minWidth:240, padding:'8px 12px', border:'1px solid #E5E5EA', borderRadius:8, fontSize:13, outline:'none' }}/>
        <button onClick={verifier} disabled={loading||!employeId} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#5B5BD6', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>
          {loading?'…':<IconSearch size={14}/>} Vérifier
        </button>
      </div>
      {resultat && (
        <div style={{ marginTop:14, background:resultat.peutEtreAssigne?'#D1F2E0':'#FFE5E5', border:`1px solid ${resultat.peutEtreAssigne?'#34C759':'#FF3B30'}`, borderRadius:10, padding:'12px 16px' }}>
          <p style={{ fontWeight:600, fontSize:14, color:resultat.peutEtreAssigne?'#1A7F43':'#C0392B' }}>{resultat.message}</p>
          {resultat.manquantes?.length>0 && <p style={{ fontSize:13, color:'#C0392B', marginTop:6 }}>Manquantes : {resultat.manquantes.join(', ')}</p>}
        </div>
      )}
    </div>
  );
}

const lbl = { display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:4 };
const inp = { width:'100%', padding:'9px 12px', border:'1px solid #E5E5EA', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' };
const cellInp = { padding:'4px 6px', border:'1px solid #5B5BD6', borderRadius:5, fontSize:12, outline:'none', width:'100%', boxSizing:'border-box' };
