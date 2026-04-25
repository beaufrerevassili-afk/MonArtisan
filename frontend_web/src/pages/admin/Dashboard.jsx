import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DS from '../../design/luxe';
import {
  IconHome, IconUser, IconTeam, IconChart, IconSettings, IconCheck, IconX, IconAlert,
  IconShield, IconFinance, IconSearch, IconFilter, IconTrendUp, IconArrowUp, IconArrowDown,
  IconCreditCard, IconDocument, IconCalendar, IconBuilding, IconMessage, IconEye, IconScale
} from '../../components/ui/Icons';

// ── Helpers ──
const fmt = n => new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR', minimumFractionDigits:0 }).format(n);
const fmtN = n => new Intl.NumberFormat('fr-FR').format(n);
const pct = (a,b) => b ? Math.round(a/b*100) : 0;
const today = new Date().toISOString().slice(0,10);
const monthStart = today.slice(0,7);

// ── Lecture localStorage (données écosystème) ──
function readLS(key, fallback=[]) { try { return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback)); } catch { return fallback; } }

function getAllData() {
  const projets = readLS('freample_projets');
  const chantiers = readLS('freample_chantiers_custom');
  const devis = readLS('freample_devis');
  const factures = readLS('freample_factures');
  const ecritures = readLS('freample_ecritures');
  const pointages = readLS('freample_pointages');
  const conges = readLS('freample_conges');
  const signalements = [];
  const rapports = [];
  // Collecter signalements et rapports de tous les chantiers
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('freample_signalements_')) signalements.push(...readLS(k));
    if (k?.startsWith('freample_rapports_')) rapports.push(...readLS(k));
  }
  return { projets, chantiers, devis, factures, ecritures, pointages, conges, signalements, rapports };
}

// ── Paramètres par défaut ──
const DEFAULT_PARAMS = {
  commissionPct: 1,
  chantiersManuelGratuit: 5,
  secteursActifs: ['btp'],
  zonesGeo: ['France entiere'],
  seuilAlerteLitige: 48, // heures
  emailContact: 'contact@freample.com',
  siretFreample: '90123456700012',
  tvaIntra: 'FR12901234567',
};

// ── DEMO users (même structure que AuthContext) ──
const DEMO_USERS = [
  { id:900, nom:'Vassili B.', email:'demo-patron@freample.fr', role:'patron', secteur:'btp', inscrit:'2025-09-15', actif:true, ca:42800, projets:12 },
  { id:901, nom:'Marie Dupont', email:'demo-client@freample.fr', role:'client', secteur:'btp', inscrit:'2025-11-02', actif:true, ca:0, projets:3 },
  { id:902, nom:'Lucas Garcia', email:'demo-employe@freample.fr', role:'employe', secteur:'btp', inscrit:'2026-01-10', actif:true },
  { id:903, nom:'Ahmed Ben Ali', email:'demo-artisan@freample.fr', role:'artisan', secteur:'btp', inscrit:'2025-10-20', actif:true, ca:28500, projets:8 },
  { id:904, nom:'Copropriété Les Oliviers', email:'demo-copro@freample.fr', role:'client', secteur:'btp', inscrit:'2026-02-01', actif:true },
  { id:905, nom:'Thomas Martin', email:'demo-ae@freample.fr', role:'patron', secteur:'btp', inscrit:'2026-03-01', actif:true, ca:8200, projets:4 },
  { id:910, nom:'Jean Moreau', email:'jean.moreau@test.fr', role:'patron', secteur:'btp', inscrit:'2026-01-15', actif:true, ca:31200, projets:7 },
  { id:911, nom:'Sophie Leroy', email:'sophie.leroy@test.fr', role:'client', secteur:'btp', inscrit:'2026-02-20', actif:true, ca:0, projets:2 },
  { id:912, nom:'Pierre Duval', email:'pierre.duval@test.fr', role:'artisan', secteur:'btp', inscrit:'2025-12-10', actif:false, ca:15600, projets:5 },
  { id:913, nom:'Claire Fontaine', email:'claire.fontaine@test.fr', role:'client', secteur:'btp', inscrit:'2026-03-05', actif:true, ca:0, projets:1 },
];

// ── Tabs ──
const TABS = [
  { id:'overview',    label:'Vue d\'ensemble', Icon: IconHome },
  { id:'users',       label:'Utilisateurs',    Icon: IconTeam },
  { id:'support',     label:'Support',          Icon: IconMessage },
  { id:'transactions',label:'Transactions',     Icon: IconCreditCard },
  { id:'moderation',  label:'Moderation',       Icon: IconShield },
  { id:'entreprise',  label:'Freample SAS',     Icon: IconBuilding },
  { id:'parametres',  label:'Parametres',       Icon: IconSettings },
];

// ── Styles communs ──
const CARD = { background:'#fff', border:`1px solid ${DS.border}`, borderRadius:DS.r.md, padding:'20px 24px' };
const KPI_GRID = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:14 };
const TH = { padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`1px solid ${DS.border}` };
const TD = { padding:'10px 14px', fontSize:13, borderBottom:`1px solid ${DS.borderLight}` };
const BADGE = (bg,color) => ({ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:bg, color });
const BTN = { padding:'7px 16px', borderRadius:DS.r.sm, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:DS.font };
const BTN_PRIMARY = { ...BTN, background:DS.gold, color:'#fff' };
const BTN_DANGER = { ...BTN, background:DS.redBg, color:DS.red };
const BTN_GHOST = { ...BTN, background:'transparent', border:`1px solid ${DS.border}`, color:DS.text };
const SECTION_TITLE = { fontSize:16, fontWeight:800, color:DS.text, letterSpacing:'-0.02em', margin:0 };

function KpiCard({ label, value, sub, trend, color=DS.gold }) {
  return (
    <div style={{ ...CARD, display:'flex', flexDirection:'column', gap:4 }}>
      <span style={{ fontSize:12, color:DS.muted, fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:24, fontWeight:800, color:DS.text, letterSpacing:'-0.03em' }}>{value}</span>
      {sub && <span style={{ fontSize:11, color:DS.subtle }}>{sub}</span>}
      {trend !== undefined && (
        <span style={{ fontSize:11, fontWeight:700, color: trend >= 0 ? DS.green : DS.red, display:'flex', alignItems:'center', gap:3 }}>
          {trend >= 0 ? <IconArrowUp size={10}/> : <IconArrowDown size={10}/>} {Math.abs(trend)}% vs mois dernier
        </span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 1 : VUE D'ENSEMBLE ──
// ══════════════════════════════════════════════════
function VueEnsemble({ data, users, backendStats }) {
  // Utiliser les données RÉELLES du backend si disponibles
  const bs = backendStats;
  const usersTotal = bs?.users?.total || users.length;
  const usersActifs = bs ? bs.users.parRole.reduce((s, r) => s + r.actifs, 0) : users.filter(u => u.actif).length;
  const inscriptionsMois = bs?.users?.inscriptionsMois || 0;
  const inscriptionsSemaine = bs?.users?.inscriptionsSemaine || 0;
  const totalMissions = bs?.missions?.total || 0;
  const totalDevis = bs?.devis?.total || 0;
  const caDevis = bs?.devis?.ca || 0;
  const caCommissions = caDevis * 0.01;
  const chantiersEnCours = parseInt(bs?.chantiers?.en_cours || 0);
  const chantiersTermines = parseInt(bs?.chantiers?.termines || 0);
  const totalMessages = bs?.messages?.total || 0;

  // Répartition par rôle (données réelles)
  const parRole = { patron: 0, client: 0, artisan: 0, employe: 0, fondateur: 0 };
  if (bs?.users?.parRole) {
    bs.users.parRole.forEach(r => { if (parRole[r.role] !== undefined) parRole[r.role] = r.total; });
  } else {
    users.forEach(u => { if (parRole[u.role] !== undefined) parRole[u.role]++; });
  }

  // Inscriptions par jour (30 derniers jours)
  const inscriptionsParJour = bs?.users?.inscriptionsParJour || [];
  const moisLabels = [];
  const moisCounts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const m = d.toISOString().slice(0, 7);
    moisLabels.push(d.toLocaleDateString('fr-FR', { month: 'short' }));
    moisCounts.push(inscriptionsParJour.filter(j => j.jour?.startsWith(m)).reduce((s, j) => s + j.count, 0));
  }
  const maxCount = Math.max(...moisCounts, 1);

  // Derniers inscrits
  const derniers = bs?.users?.derniers || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs principaux */}
      <div style={KPI_GRID}>
        <KpiCard label="Utilisateurs" value={fmtN(usersTotal)} sub={`${inscriptionsMois} ce mois · ${inscriptionsSemaine} cette semaine`} trend={inscriptionsSemaine} color={DS.blue} />
        <KpiCard label="Missions" value={fmtN(totalMissions)} sub={`${chantiersEnCours} en cours · ${chantiersTermines} terminés`} />
        <KpiCard label="Devis" value={fmtN(totalDevis)} sub={`${fmt(caDevis)} de volume total`} color={DS.green} />
        <KpiCard label="Commission (1%)" value={fmt(caCommissions)} sub={`sur ${fmt(caDevis)} de transactions`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Graphique inscriptions */}
        <div style={CARD}>
          <p style={SECTION_TITLE}>Inscriptions mensuelles</p>
          <p style={{ fontSize: 11, color: DS.subtle, marginTop: 2 }}>Nouveaux comptes par mois</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 16 }}>
            {moisLabels.map((m, i) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: DS.text }}>{moisCounts[i]}</span>
                <div style={{ width: '100%', height: `${Math.max(8, moisCounts[i] / maxCount * 90)}px`, background: i === moisLabels.length - 1 ? DS.gold : DS.borderLight, borderRadius: 4, transition: 'height .3s' }} />
                <span style={{ fontSize: 10, color: DS.subtle }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition utilisateurs */}
        <div style={CARD}>
          <p style={SECTION_TITLE}>Répartition utilisateurs</p>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Patrons', count: parRole.patron, color: DS.gold },
              { label: 'Artisans', count: parRole.artisan, color: DS.green },
              { label: 'Clients', count: parRole.client, color: DS.blue },
              { label: 'Employés', count: parRole.employe, color: DS.orange },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: DS.muted, width: 70 }}>{r.label}</span>
                <div style={{ flex: 1, height: 8, background: DS.borderLight, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct(r.count, usersTotal)}%`, height: '100%', background: r.color, borderRadius: 4, transition: 'width .3s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.text, minWidth: 20, textAlign: 'right' }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Derniers inscrits */}
      <div style={CARD}>
        <p style={SECTION_TITLE}>Derniers inscrits</p>
        {derniers.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: DS.subtle, fontSize: 13 }}>Aucun utilisateur inscrit pour le moment. Les inscriptions apparaîtront ici en temps réel.</div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Nom', 'Email', 'Rôle', 'Ville', 'Inscrit le'].map(h => <th key={h} style={TH}>{h}</th>)}
              </tr></thead>
              <tbody>
                {derniers.map(u => (
                  <tr key={u.id}>
                    <td style={TD}><span style={{ fontWeight: 600 }}>{u.nom}</span></td>
                    <td style={{ ...TD, fontSize: 12, color: DS.subtle }}>{u.email}</td>
                    <td style={TD}>
                      <span style={BADGE(
                        u.role === 'patron' ? DS.goldLight : u.role === 'client' ? DS.blueBg : u.role === 'artisan' ? DS.greenBg : DS.orangeBg,
                        u.role === 'patron' ? DS.gold : u.role === 'client' ? DS.blue : u.role === 'artisan' ? DS.green : DS.orange
                      )}>{u.role}</span>
                    </td>
                    <td style={TD}>{u.ville || '—'}</td>
                    <td style={{ ...TD, color: DS.subtle, fontSize: 12 }}>{u.cree_le ? new Date(u.cree_le).toLocaleDateString('fr-FR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          ['Messages échangés', totalMessages, DS.blue],
          ['Chantiers en cours', chantiersEnCours, DS.orange],
          ['Chantiers terminés', chantiersTermines, DS.green],
        ].map(([label, val, color]) => (
          <div key={label} style={{ padding: '10px 16px', background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: DS.muted }}>{label}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 2 : UTILISATEURS ──
// ══════════════════════════════════════════════════
function Utilisateurs({ users, setUsers }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = useMemo(() => users.filter(u => {
    if (filterRole !== 'tous' && u.role !== filterRole) return false;
    if (search && !u.nom.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [users, filterRole, search]);

  const toggleSuspend = async (id) => {
    const token = localStorage.getItem('token');
    const isDemo = token && token.endsWith('.dev');
    const user = users.find(u => u.id === id);
    let motif = '';
    if (user?.actif) {
      motif = prompt('Motif de suspension (visible par l\'utilisateur) :') || '';
    }
    if (!isDemo) {
      try {
        const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
        const r = await fetch(`${API}/admin/toggle-suspend/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ motif }) });
        const data = await r.json();
        if (data.user) {
          setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: !data.user.suspendu } : u));
          return;
        }
      } catch {}
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: !u.actif } : u));
  };

  if (selectedUser) {
    const u = selectedUser;
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <button onClick={() => setSelectedUser(null)} style={BTN_GHOST}>Retour a la liste</button>
        <div style={CARD}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <div style={{ width:56, height:56, borderRadius:28, background:DS.gold, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800 }}>
              {u.nom?.charAt(0)}
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:DS.text }}>{u.nom}</h2>
              <p style={{ margin:0, fontSize:13, color:DS.subtle }}>{u.email}</p>
            </div>
            <span style={{ ...BADGE(u.actif ? DS.greenBg : DS.redBg, u.actif ? DS.green : DS.red), marginLeft:'auto' }}>
              {u.actif ? 'Actif' : 'Suspendu'}
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14 }}>
            <div style={{ padding:'12px 16px', background:DS.bgSoft, borderRadius:DS.r.sm }}>
              <span style={{ fontSize:11, color:DS.subtle, display:'block' }}>Role</span>
              <span style={{ fontSize:14, fontWeight:700, textTransform:'capitalize' }}>{u.role}</span>
            </div>
            <div style={{ padding:'12px 16px', background:DS.bgSoft, borderRadius:DS.r.sm }}>
              <span style={{ fontSize:11, color:DS.subtle, display:'block' }}>Secteur</span>
              <span style={{ fontSize:14, fontWeight:700, textTransform:'uppercase' }}>{u.secteur || 'BTP'}</span>
            </div>
            <div style={{ padding:'12px 16px', background:DS.bgSoft, borderRadius:DS.r.sm }}>
              <span style={{ fontSize:11, color:DS.subtle, display:'block' }}>Inscrit le</span>
              <span style={{ fontSize:14, fontWeight:700 }}>{u.inscrit || '-'}</span>
            </div>
            {u.ca !== undefined && (
              <div style={{ padding:'12px 16px', background:DS.bgSoft, borderRadius:DS.r.sm }}>
                <span style={{ fontSize:11, color:DS.subtle, display:'block' }}>CA genere</span>
                <span style={{ fontSize:14, fontWeight:700, color:DS.gold }}>{fmt(u.ca)}</span>
              </div>
            )}
            {u.projets !== undefined && (
              <div style={{ padding:'12px 16px', background:DS.bgSoft, borderRadius:DS.r.sm }}>
                <span style={{ fontSize:11, color:DS.subtle, display:'block' }}>Projets</span>
                <span style={{ fontSize:14, fontWeight:700 }}>{u.projets}</span>
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            {u.role !== 'fondateur' && (
              <button onClick={() => { toggleSuspend(u.id); setSelectedUser({...u, actif:!u.actif}); }} style={u.actif ? BTN_DANGER : BTN_PRIMARY}>
                {u.actif ? 'Suspendre le compte' : 'Reactiver le compte'}
              </button>
            )}
            {u.role === 'patron' && (
              <>
                <button onClick={async () => {
                  const mois = prompt('Combien de mois offrir ?', '1');
                  if (!mois) return;
                  const token = localStorage.getItem('token');
                  const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
                  const r = await fetch(`${API}/admin/users/${u.id}/subscription`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'offrir', moisGratuits: parseInt(mois) }) });
                  const d = await r.json();
                  alert(d.message || d.erreur);
                }} style={{ ...BTN_PRIMARY, background: '#A68B4B' }}>🎁 Offrir des mois</button>
                <button onClick={async () => {
                  const token = localStorage.getItem('token');
                  const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
                  const r = await fetch(`${API}/admin/users/${u.id}/subscription`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'reset-trial' }) });
                  const d = await r.json();
                  alert(d.message || d.erreur);
                }} style={BTN_PRIMARY}>🔄 Reset essai 90j</button>
              </>
            )}
            <button onClick={async () => {
              const msg = prompt(`Message à ${u.nom} :`);
              if (!msg) return;
              const token = localStorage.getItem('token');
              const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
              // Créer un ticket support au nom du fondateur
              await fetch(`${API}/support/ticket`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, nom: 'Freample', sujet: 'Message de Freample', message: msg }) });
              // Immédiatement répondre en tant que Freample pour que ce soit dans les réponses
              const tickets = await fetch(`${API}/support/mes-tickets?email=${encodeURIComponent(u.email)}`).then(r => r.json());
              const lastTicket = tickets.tickets?.[0];
              if (lastTicket) {
                await fetch(`${API}/support/tickets/${lastTicket.id}/reply`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reponse: msg }) });
              }
              alert('Message envoyé à ' + u.nom);
            }} style={BTN_GHOST}>Envoyer un message</button>
            <button onClick={async () => {
              if (!window.confirm(`Supprimer définitivement le compte de ${u.nom} (${u.email}) ? Cette action est IRRÉVERSIBLE.`)) return;
              if (!window.confirm('Êtes-vous vraiment sûr ? Toutes les données seront perdues.')) return;
              const token = localStorage.getItem('token');
              const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';
              const r = await fetch(`${API}/admin/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
              const data = await r.json();
              if (r.ok) {
                alert('Compte supprimé définitivement');
                setUsers(prev => prev.filter(x => x.id !== u.id));
                setSelectedUser(null);
              } else { alert(data.erreur || 'Erreur'); }
            }} style={{ ...BTN, background: '#DC2626', color: '#fff', fontSize: 11 }}>Supprimer définitivement</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Filtres */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <IconSearch size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:DS.subtle }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..."
            style={{ width:'100%', padding:'9px 12px 9px 34px', border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, fontSize:13, fontFamily:DS.font, outline:'none' }} />
        </div>
        {['tous','patron','artisan','client','employe'].map(r => (
          <button key={r} onClick={() => setFilterRole(r)}
            style={{ ...BTN, background: filterRole===r ? DS.gold : 'transparent', color: filterRole===r ? '#fff' : DS.muted, border: filterRole===r ? 'none' : `1px solid ${DS.border}` }}>
            {r === 'tous' ? 'Tous' : r.charAt(0).toUpperCase()+r.slice(1)}s
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            {['Utilisateur','Email','Role','Statut','Inscrit le','Actions'].map(h => <th key={h} style={TH}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ cursor:'pointer' }} onClick={() => setSelectedUser(u)}>
                <td style={TD}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:16, background:DS.goldLight, color:DS.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 }}>
                      {u.nom?.charAt(0)}
                    </div>
                    <span style={{ fontWeight:600 }}>{u.nom}</span>
                  </div>
                </td>
                <td style={{...TD, color:DS.subtle, fontSize:12}}>{u.email}</td>
                <td style={TD}>
                  <span style={BADGE(
                    u.role==='patron' ? DS.goldLight : u.role==='artisan' ? DS.greenBg : u.role==='client' ? DS.blueBg : DS.orangeBg,
                    u.role==='patron' ? DS.gold : u.role==='artisan' ? DS.green : u.role==='client' ? DS.blue : DS.orange
                  )}>{u.role}</span>
                </td>
                <td style={TD}>
                  <span style={BADGE(u.actif ? DS.greenBg : DS.redBg, u.actif ? DS.green : DS.red)}>
                    {u.actif ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td style={{...TD, color:DS.subtle, fontSize:12}}>{u.inscrit || '-'}</td>
                <td style={TD} onClick={e => e.stopPropagation()}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setSelectedUser(u)} style={{...BTN_GHOST, padding:'4px 10px', fontSize:11}}>
                      <IconEye size={12}/> Voir
                    </button>
                    <button onClick={() => toggleSuspend(u.id)} style={{...(u.actif ? BTN_DANGER : BTN_PRIMARY), padding:'4px 10px', fontSize:11}}>
                      {u.actif ? 'Suspendre' : 'Reactiver'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 3 : TRANSACTIONS ──
// ══════════════════════════════════════════════════
function Transactions({ data }) {
  const [filtre, setFiltre] = useState('tous');

  // Build transactions list from projets + devis + factures
  const transactions = useMemo(() => {
    const tx = [];
    // From factures
    data.factures.forEach(f => {
      tx.push({
        id: f.id || Math.random(),
        type: 'facture',
        label: f.objet || `Facture #${f.numero || f.id}`,
        montant: Number(f.montant) || 0,
        commission: Number(f.commission) || (Number(f.montant)||0)*0.01,
        statut: f.statut || 'en_attente',
        date: f.date || f.dateEmission,
        client: f.clientNom || '-',
        patron: f.patronNom || '-',
      });
    });
    // From projets (as volume reference)
    data.projets.forEach(p => {
      if (!tx.find(t => t.label?.includes(p.metier))) {
        tx.push({
          id: p.id,
          type: 'projet',
          label: p.metier || 'Projet',
          montant: Number(p.budget) || 0,
          commission: Number(p.commission) || (Number(p.budget)||0)*0.01,
          statut: p.statut,
          date: p.date,
          client: p.clientNom || '-',
          patron: '-',
        });
      }
    });
    return tx.sort((a,b) => (b.date||'').localeCompare(a.date||''));
  }, [data]);

  const filtered = filtre === 'tous' ? transactions : transactions.filter(t => t.statut === filtre);
  const totalVolume = transactions.reduce((s,t) => s + t.montant, 0);
  const totalCommissions = transactions.reduce((s,t) => s + t.commission, 0);
  const enSequestre = transactions.filter(t => t.statut === 'sequestre' || t.statut === 'en_cours').reduce((s,t) => s + t.montant, 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={KPI_GRID}>
        <KpiCard label="Volume total" value={fmt(totalVolume)} />
        <KpiCard label="Commissions Freample" value={fmt(totalCommissions)} color={DS.gold} />
        <KpiCard label="En sequestre" value={fmt(enSequestre)} sub="Fonds en attente de validation" />
        <KpiCard label="Transactions" value={fmtN(transactions.length)} />
      </div>

      <div style={{ display:'flex', gap:8 }}>
        {['tous','payee','sequestre','en_cours','en_attente'].map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            style={{ ...BTN, background: filtre===f ? DS.gold : 'transparent', color: filtre===f ? '#fff' : DS.muted, border: filtre===f ? 'none' : `1px solid ${DS.border}` }}>
            {f === 'tous' ? 'Toutes' : f === 'payee' ? 'Payees' : f === 'sequestre' ? 'Sequestre' : f === 'en_cours' ? 'En cours' : 'En attente'}
          </button>
        ))}
      </div>

      <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            {['Transaction','Client','Patron','Montant','Commission','Statut','Date'].map(h => <th key={h} style={TH}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td style={TD}><span style={{ fontWeight:600 }}>{t.label}</span></td>
                <td style={{...TD, fontSize:12}}>{t.client}</td>
                <td style={{...TD, fontSize:12}}>{t.patron}</td>
                <td style={{...TD, fontWeight:700}}>{fmt(t.montant)}</td>
                <td style={{...TD, fontWeight:700, color:DS.gold}}>{fmt(t.commission)}</td>
                <td style={TD}>
                  <span style={BADGE(
                    t.statut==='payee' ? DS.greenBg : t.statut==='sequestre' ? DS.blueBg : t.statut==='en_cours' ? DS.orangeBg : DS.bgMuted,
                    t.statut==='payee' ? DS.green : t.statut==='sequestre' ? DS.blue : t.statut==='en_cours' ? DS.orange : DS.subtle
                  )}>{t.statut==='payee' ? 'Payee' : t.statut==='sequestre' ? 'Sequestre' : t.statut==='en_cours' ? 'En cours' : 'En attente'}</span>
                </td>
                <td style={{...TD, color:DS.subtle, fontSize:12}}>{t.date?.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 4 : MODERATION ──
// ══════════════════════════════════════════════════
function Moderation({ data }) {
  const [signalements, setSignalements] = useState(() => {
    return data.signalements || [];
  });

  const traiter = (id, action) => {
    setSignalements(prev => prev.map(s => s.id === id ? { ...s, statut: action } : s));
  };

  const ouverts = signalements.filter(s => s.statut === 'ouvert');
  const resolus = signalements.filter(s => s.statut !== 'ouvert');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={KPI_GRID}>
        <KpiCard label="Signalements ouverts" value={fmtN(ouverts.length)} color={ouverts.length > 0 ? DS.red : DS.green} />
        <KpiCard label="Litiges" value={fmtN(signalements.filter(s => s.type==='litige').length)} />
        <KpiCard label="Resolus ce mois" value={fmtN(resolus.length)} />
      </div>

      {ouverts.length === 0 && (
        <div style={{ ...CARD, textAlign:'center', padding:40 }}>
          <IconCheck size={32} style={{ color:DS.green, marginBottom:8 }} />
          <p style={{ fontSize:15, fontWeight:700, color:DS.text }}>Aucun signalement en attente</p>
          <p style={{ fontSize:13, color:DS.subtle }}>Tout est sous controle.</p>
        </div>
      )}

      {ouverts.map(s => (
        <div key={s.id} style={{ ...CARD, borderLeft:`4px solid ${s.urgence==='haute' ? DS.red : s.urgence==='moyenne' ? DS.orange : DS.blue}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={BADGE(
                  s.type==='litige' ? DS.redBg : s.type==='signalement' ? DS.orangeBg : DS.blueBg,
                  s.type==='litige' ? DS.red : s.type==='signalement' ? DS.orange : DS.blue
                )}>{s.type}</span>
                <span style={BADGE(
                  s.urgence==='haute' ? DS.redBg : s.urgence==='moyenne' ? DS.orangeBg : DS.bgMuted,
                  s.urgence==='haute' ? DS.red : s.urgence==='moyenne' ? DS.orange : DS.subtle
                )}>Urgence {s.urgence}</span>
              </div>
              {s.chantier && <p style={{ fontSize:14, fontWeight:700, color:DS.text, margin:0 }}>{s.chantier}</p>}
              <p style={{ fontSize:12, color:DS.subtle, margin:'2px 0 0' }}>Par {s.auteur} - {s.date}</p>
            </div>
          </div>
          <p style={{ fontSize:13, color:DS.text, lineHeight:1.5, margin:'8px 0 16px', padding:12, background:DS.bgSoft, borderRadius:DS.r.sm }}>{s.message}</p>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => traiter(s.id, 'resolu')} style={BTN_PRIMARY}>Marquer resolu</button>
            <button onClick={() => traiter(s.id, 'rembourse')} style={BTN_GHOST}>Rembourser client</button>
            <button onClick={() => traiter(s.id, 'rejete')} style={{...BTN_GHOST, color:DS.red, borderColor:DS.red}}>Rejeter</button>
          </div>
        </div>
      ))}

      {resolus.length > 0 && (
        <div style={CARD}>
          <p style={SECTION_TITLE}>Historique ({resolus.length})</p>
          <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
            {resolus.map(s => (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${DS.borderLight}` }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:600 }}>{s.chantier || s.type}</span>
                  <span style={{ fontSize:12, color:DS.subtle, marginLeft:8 }}>par {s.auteur}</span>
                </div>
                <span style={BADGE(
                  s.statut==='resolu' ? DS.greenBg : s.statut==='rembourse' ? DS.blueBg : DS.bgMuted,
                  s.statut==='resolu' ? DS.green : s.statut==='rembourse' ? DS.blue : DS.subtle
                )}>{s.statut}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── TAB 5 : FREAMPLE SAS (gestion entreprise) ──
// ══════════════════════════════════════════════════
function EntrepriseFreample({ data, backendStats }) {
  const [sousTab, setSousTab] = useState('tresorerie');
  const [config, setConfig] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';

  // Charger la config depuis le backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token.endsWith('.dev')) return;
    fetch(`${API}/admin/config`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.config) { setConfig(d.config); setEditForm(d.config); } }).catch(() => {});
  }, []);

  const sauverConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/admin/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editForm) });
      setConfig(editForm);
      setEditMode(false);
    } catch {} finally { setSaving(false); }
  };

  const SOUS_TABS = [
    { id:'tresorerie', label:'Trésorerie' },
    { id:'frais',      label:'Mes frais' },
  ];

  const fraisHebergement = Number(config.frais_hebergement || 0);
  const fraisComptable = Number(config.frais_comptable || 0);
  const fraisAssurance = Number(config.frais_assurance || 0);
  const fraisDomiciliation = Number(config.frais_domiciliation || 0);
  const fraisStripe = Number(config.frais_stripe || 0);
  const fraisDivers = Number(config.frais_divers || 0);
  const tresorerieInitiale = Number(config.tresorerie_initiale || 0);
  const totalFrais = fraisHebergement + fraisComptable + fraisAssurance + fraisDomiciliation + fraisStripe + fraisDivers;

  const totalCommissions = backendStats?.devis?.ca ? backendStats.devis.ca * 0.01 : 0;
  const resultatNet = totalCommissions - totalFrais;
  const tresorerie = tresorerieInitiale + resultatNet;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ ...CARD, padding:'4px', display:'flex', gap:0 }}>
        {SOUS_TABS.map(t => (
          <button key={t.id} onClick={() => setSousTab(t.id)}
            style={{ ...BTN, flex:1, background: sousTab===t.id ? DS.gold : 'transparent', color: sousTab===t.id ? '#fff' : DS.muted, borderRadius:DS.r.sm }}>
            {t.label}
          </button>
        ))}
      </div>

      {sousTab === 'tresorerie' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={KPI_GRID}>
            <KpiCard label="CA Commissions" value={fmt(totalCommissions)} sub="1% des transactions" />
            <KpiCard label="Total frais mensuels" value={fmt(totalFrais)} sub={`${totalFrais === 0 ? 'Configurez vos frais →' : 'Par mois'}`} color={DS.orange} />
            <KpiCard label="Résultat net" value={fmt(resultatNet)} color={resultatNet >= 0 ? DS.green : DS.red} />
            <KpiCard label="Trésorerie" value={fmt(tresorerie)} sub="Solde estimé" />
          </div>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Flux de trésorerie</p>
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label: 'Commissions encaissées', montant: totalCommissions, type: 'entree' },
                ...(fraisHebergement > 0 ? [{ label: 'Hébergement & infra', montant: -fraisHebergement, type: 'sortie' }] : []),
                ...(fraisComptable > 0 ? [{ label: 'Comptable', montant: -fraisComptable, type: 'sortie' }] : []),
                ...(fraisAssurance > 0 ? [{ label: 'Assurance RC Pro', montant: -fraisAssurance, type: 'sortie' }] : []),
                ...(fraisDomiciliation > 0 ? [{ label: 'Domiciliation', montant: -fraisDomiciliation, type: 'sortie' }] : []),
                ...(fraisStripe > 0 ? [{ label: 'Frais Stripe/paiement', montant: -fraisStripe, type: 'sortie' }] : []),
                ...(fraisDivers > 0 ? [{ label: 'Frais divers', montant: -fraisDivers, type: 'sortie' }] : []),
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: i % 2 === 0 ? DS.bgSoft : 'transparent', borderRadius: DS.r.sm }}>
                  <span style={{ fontSize: 13, color: DS.text }}>{l.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: l.type === 'entree' ? DS.green : DS.red }}>{l.type === 'entree' ? '+' : ''}{fmt(l.montant)}</span>
                </div>
              ))}
              {totalFrais === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: DS.subtle, fontSize: 13 }}>
                  Aucun frais configuré — allez dans l'onglet "Mes frais" pour saisir vos charges mensuelles.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {sousTab === 'frais' && (
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={SECTION_TITLE}>Frais mensuels Freample SAS</p>
            {!editMode ? (
              <button onClick={() => { setEditForm({ ...config }); setEditMode(true); }} style={BTN_PRIMARY}>Modifier</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={sauverConfig} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.5 : 1 }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                <button onClick={() => setEditMode(false)} style={BTN_GHOST}>Annuler</button>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { cle: 'frais_hebergement', label: 'Hébergement & infra (Vercel, Render...)', icon: '🖥️' },
              { cle: 'frais_comptable', label: 'Comptable', icon: '📊' },
              { cle: 'frais_assurance', label: 'Assurance RC Pro', icon: '🛡️' },
              { cle: 'frais_domiciliation', label: 'Domiciliation', icon: '📍' },
              { cle: 'frais_stripe', label: 'Frais Stripe / paiement', icon: '💳' },
              { cle: 'frais_divers', label: 'Frais divers', icon: '📋' },
              { cle: 'tresorerie_initiale', label: 'Trésorerie initiale (solde compte)', icon: '🏦' },
            ].map(f => (
              <div key={f.cle} style={{ padding: '12px 14px', background: DS.bgSoft, borderRadius: DS.r.sm }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: DS.muted, display: 'block', marginBottom: 6 }}>{f.icon} {f.label}</label>
                {editMode ? (
                  <input type="number" value={editForm[f.cle] || ''} onChange={e => setEditForm(p => ({ ...p, [f.cle]: e.target.value }))}
                    placeholder="0" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${DS.border}`, borderRadius: 6, fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 800, color: DS.text }}>{fmt(Number(config[f.cle] || 0))}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 16px', background: DS.goldLight, borderRadius: DS.r.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: DS.gold }}>Total frais mensuels</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: DS.gold }}>{fmt(totalFrais)}</span>
          </div>
        </div>
      )}

      {sousTab === 'urssaf' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Cotisations URSSAF - Freample SAS</p>
            <p style={{ fontSize:12, color:DS.subtle, marginTop:4 }}>Estimation basee sur le CA commissions</p>
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Cotisation maladie-maternite', taux:'13%', montant: Math.round(totalCommissions*0.13) },
                { label:'Cotisation vieillesse plafonnee', taux:'6.90%', montant: Math.round(totalCommissions*0.069) },
                { label:'Cotisation vieillesse deplafonnee', taux:'0.40%', montant: Math.round(totalCommissions*0.004) },
                { label:'Allocations familiales', taux:'3.45%', montant: Math.round(totalCommissions*0.0345) },
                { label:'CSG/CRDS', taux:'9.70%', montant: Math.round(totalCommissions*0.097) },
                { label:'Formation professionnelle', taux:'0.55%', montant: Math.round(totalCommissions*0.0055) },
                { label:'Accident du travail', taux:'1.10%', montant: Math.round(totalCommissions*0.011) },
              ].map((c,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background: i%2===0 ? DS.bgSoft : 'transparent', borderRadius:DS.r.xs }}>
                  <span style={{ fontSize:13 }}>{c.label}</span>
                  <div style={{ display:'flex', gap:20, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:DS.subtle, width:50, textAlign:'right' }}>{c.taux}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:DS.red, width:80, textAlign:'right' }}>{fmt(c.montant)}</span>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px', borderTop:`2px solid ${DS.border}`, marginTop:4 }}>
                <span style={{ fontSize:14, fontWeight:800 }}>Total cotisations</span>
                <span style={{ fontSize:16, fontWeight:800, color:DS.red }}>{fmt(urssaf)}</span>
              </div>
            </div>
          </div>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Echeances URSSAF</p>
            <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'T1 2026 (jan-mars)', date:'15/04/2026', montant:Math.round(urssaf*0.25), statut:'a_payer' },
                { label:'T2 2026 (avr-juin)', date:'15/07/2026', montant:Math.round(urssaf*0.25), statut:'a_venir' },
                { label:'T3 2026 (jul-sep)', date:'15/10/2026', montant:Math.round(urssaf*0.25), statut:'a_venir' },
                { label:'T4 2026 (oct-dec)', date:'15/01/2027', montant:Math.round(urssaf*0.25), statut:'a_venir' },
              ].map((e,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:DS.bgSoft, borderRadius:DS.r.sm }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:600 }}>{e.label}</span>
                    <span style={{ fontSize:11, color:DS.subtle, marginLeft:8 }}>Echeance : {e.date}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:13, fontWeight:700 }}>{fmt(e.montant)}</span>
                    <span style={BADGE(
                      e.statut==='a_payer' ? DS.orangeBg : DS.bgMuted,
                      e.statut==='a_payer' ? DS.orange : DS.subtle
                    )}>{e.statut==='a_payer' ? 'A payer' : 'A venir'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sousTab === 'tva' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={KPI_GRID}>
            <KpiCard label="TVA collectee" value={fmt(tvaCollectee)} sub="20% sur commissions" />
            <KpiCard label="TVA deductible" value={fmt(tvaDeductible)} sub="Sur charges & achats" />
            <KpiCard label="TVA nette a reverser" value={fmt(tvaNette)} color={DS.red} />
          </div>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Declarations TVA</p>
            <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { periode:'Mars 2026', collectee:Math.round(tvaCollectee*0.3), deductible:Math.round(tvaDeductible*0.3), statut:'declaree' },
                { periode:'Fevrier 2026', collectee:Math.round(tvaCollectee*0.28), deductible:Math.round(tvaDeductible*0.28), statut:'declaree' },
                { periode:'Janvier 2026', collectee:Math.round(tvaCollectee*0.22), deductible:Math.round(tvaDeductible*0.22), statut:'declaree' },
                { periode:'Avril 2026', collectee:Math.round(tvaCollectee*0.2), deductible:Math.round(tvaDeductible*0.2), statut:'en_cours' },
              ].sort((a,b) => b.periode.localeCompare(a.periode)).map((d,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:DS.bgSoft, borderRadius:DS.r.sm }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{d.periode}</span>
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:DS.green }}>+{fmt(d.collectee)}</span>
                    <span style={{ fontSize:12, color:DS.red }}>-{fmt(d.deductible)}</span>
                    <span style={{ fontSize:13, fontWeight:700 }}>{fmt(d.collectee-d.deductible)}</span>
                    <span style={BADGE(d.statut==='declaree' ? DS.greenBg : DS.orangeBg, d.statut==='declaree' ? DS.green : DS.orange)}>
                      {d.statut==='declaree' ? 'Declaree' : 'En cours'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sousTab === 'compta' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Compte de resultat simplifie - Freample SAS</p>
            <p style={{ fontSize:11, color:DS.subtle, marginTop:2 }}>Exercice en cours (2026)</p>
            <div style={{ marginTop:16 }}>
              {[
                { label:'Produits d\'exploitation', children:[
                  { label:'Commissions sur transactions', montant:totalCommissions },
                  { label:'Abonnements Pro (futur)', montant:0 },
                ]},
                { label:'Charges d\'exploitation', children:[
                  { label:'Cotisations sociales', montant:-chargesSociales },
                  { label:'Frais de paiement (GoCardless)', montant:-Math.round(totalCommissions*0.015+12) },
                  { label:'Hebergement & infrastructure', montant:-45 },
                  { label:'Assurance RC Pro', montant:-85 },
                  { label:'Honoraires comptable', montant:-250 },
                  { label:'Domiciliation / bureau', montant:-50 },
                  { label:'Frais bancaires', montant:-15 },
                ]},
              ].map((section,si) => (
                <div key={si} style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:800, color:DS.text, padding:'8px 0', borderBottom:`2px solid ${DS.border}` }}>{section.label}</p>
                  {section.children.map((l,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px', background: i%2===0 ? DS.bgSoft : 'transparent' }}>
                      <span style={{ fontSize:13 }}>{l.label}</span>
                      <span style={{ fontSize:13, fontWeight:600, color: l.montant >= 0 ? DS.green : DS.red }}>{fmt(l.montant)}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderTop:`1px solid ${DS.border}`, marginTop:4 }}>
                    <span style={{ fontSize:13, fontWeight:700 }}>Total {section.label.toLowerCase()}</span>
                    <span style={{ fontSize:14, fontWeight:800, color: si===0 ? DS.green : DS.red }}>
                      {fmt(section.children.reduce((s,c) => s+c.montant, 0))}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 12px', background:DS.goldLight, borderRadius:DS.r.sm, marginTop:8 }}>
                <span style={{ fontSize:15, fontWeight:800, color:DS.text }}>Resultat net</span>
                <span style={{ fontSize:18, fontWeight:900, color: resultatNet >= 0 ? DS.green : DS.red }}>{fmt(resultatNet)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// ── TAB : SUPPORT ──
// ══════════════════════════════════════════════════
function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reponse, setReponse] = useState('');
  const [sending, setSending] = useState(false);
  const API = import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token.endsWith('.dev')) return;
    fetch(`${API}/support/tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.tickets) setTickets(d.tickets); }).catch(() => {});
  }, []);

  const selectedTicketRef = React.useRef(selectedTicket);
  React.useEffect(() => { selectedTicketRef.current = selectedTicket; }, [selectedTicket]);

  const refreshTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token || token.endsWith('.dev')) return;
    try {
      const r = await fetch(`${API}/support/tickets`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.tickets) {
        setTickets(d.tickets);
        // Rafraîchir le ticket sélectionné si ouvert
        const current = selectedTicketRef.current;
        if (current) {
          const updated = d.tickets.find(t => t.id === current.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch {}
  };

  // Polling toutes les 5s
  useEffect(() => {
    const interval = setInterval(refreshTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const repondre = async (ticketId) => {
    if (!reponse.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const r = await fetch(`${API}/support/tickets/${ticketId}/reply`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reponse }) });
      const data = await r.json();
      if (data.ticket) {
        setSelectedTicket(data.ticket);
        setReponse('');
        refreshTickets();
      }
    } catch {} finally { setSending(false); }
  };

  const fermerTicket = async (ticketId) => {
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/support/tickets/${ticketId}/close`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    if (data.ticket) {
      setSelectedTicket(data.ticket);
      refreshTickets();
    }
  };

  const reactiverCompte = async (ticketId, userEmail) => {
    const token = localStorage.getItem('token');
    // 1. Réactiver le compte
    const usersResp = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
    const usersData = await usersResp.json();
    const targetUser = (usersData.users || []).find(u => u.email === userEmail);
    if (targetUser) {
      await fetch(`${API}/admin/toggle-suspend/${targetUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ motif: '' }) });
    }
    // 2. Envoyer un message automatique + fermer le ticket
    await fetch(`${API}/support/tickets/${ticketId}/reply`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reponse: 'Votre ticket a été traité, votre compte a été réactivé. Veuillez rafraîchir la page.' }) });
    await fetch(`${API}/support/tickets/${ticketId}/close`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    // 3. Refresh
    refreshTickets();
    setSelectedTicket(null);
  };

  const ouverts = tickets.filter(t => t.statut === 'ouvert');
  const fermes = tickets.filter(t => t.statut === 'ferme');

  if (selectedTicket) {
    const t = selectedTicket;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button onClick={() => setSelectedTicket(null)} style={BTN_GHOST}>← Retour aux tickets</button>
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: DS.text }}>{t.sujet || 'Demande de support'}</div>
              <div style={{ fontSize: 12, color: DS.subtle, marginTop: 2 }}>{t.email} · {t.nom || '—'} · {new Date(t.cree_le).toLocaleDateString('fr-FR')}</div>
            </div>
            <span style={BADGE(t.statut === 'ouvert' ? DS.orangeBg : DS.greenBg, t.statut === 'ouvert' ? DS.orange : DS.green)}>{t.statut}</span>
          </div>

          {t.motif_suspension && (
            <div style={{ padding: '10px 14px', background: DS.redBg, borderRadius: 8, marginBottom: 12, fontSize: 12, color: DS.red }}>
              <strong>Motif de suspension :</strong> {t.motif_suspension}
            </div>
          )}

          {/* Message initial */}
          <div style={{ padding: '14px 16px', background: DS.bgSoft, borderRadius: 10, marginBottom: 16, borderLeft: `4px solid ${DS.orange}` }}>
            <div style={{ fontSize: 11, color: DS.subtle, marginBottom: 4 }}>{t.nom || t.email} — {new Date(t.cree_le).toLocaleString('fr-FR')}</div>
            <div style={{ fontSize: 13, color: DS.text, lineHeight: 1.6 }}>{t.message}</div>
          </div>

          {/* Réponses */}
          {(t.reponses || []).map((r, i) => (
            <div key={i} style={{ padding: '12px 16px', background: DS.goldLight, borderRadius: 10, marginBottom: 8, borderLeft: `4px solid ${DS.gold}` }}>
              <div style={{ fontSize: 11, color: DS.gold, fontWeight: 700, marginBottom: 4 }}>{r.auteur} — {new Date(r.date).toLocaleString('fr-FR')}</div>
              <div style={{ fontSize: 13, color: DS.text, lineHeight: 1.6 }}>{r.message}</div>
            </div>
          ))}

          {/* Formulaire réponse */}
          {t.statut === 'ouvert' && (
            <div style={{ marginTop: 16 }}>
              <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={3}
                placeholder="Votre réponse au client..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: DS.font }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => repondre(t.id)} disabled={sending || !reponse.trim()} style={{ ...BTN_PRIMARY, opacity: (sending || !reponse.trim()) ? 0.5 : 1 }}>
                  {sending ? 'Envoi...' : 'Répondre'}
                </button>
                <button onClick={() => reactiverCompte(t.id, t.email)} style={{ ...BTN, background: '#16A34A', color: '#fff' }}>Réactiver le compte</button>
                <button onClick={() => fermerTicket(t.id)} style={BTN_GHOST}>Fermer le ticket</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={KPI_GRID}>
        <KpiCard label="Tickets ouverts" value={fmtN(ouverts.length)} color={ouverts.length > 0 ? DS.orange : DS.green} />
        <KpiCard label="Tickets fermés" value={fmtN(fermes.length)} color={DS.green} />
        <KpiCard label="Total" value={fmtN(tickets.length)} />
      </div>

      {tickets.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>Aucun ticket de support</p>
          <p style={{ fontSize: 13, color: DS.subtle }}>Les demandes des utilisateurs apparaîtront ici.</p>
        </div>
      )}

      {ouverts.map(t => (
        <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ ...CARD, cursor: 'pointer', borderLeft: `4px solid ${DS.orange}`, transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{t.sujet || 'Demande de support'}</div>
              <div style={{ fontSize: 12, color: DS.subtle, marginTop: 2 }}>{t.email} · {new Date(t.cree_le).toLocaleDateString('fr-FR')}</div>
              <div style={{ fontSize: 12, color: DS.text, marginTop: 6, lineHeight: 1.5 }}>{(t.message || '').slice(0, 100)}{t.message?.length > 100 ? '...' : ''}</div>
            </div>
            <span style={BADGE(DS.orangeBg, DS.orange)}>Ouvert</span>
          </div>
        </div>
      ))}

      {fermes.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: DS.subtle, marginBottom: 8 }}>Fermés ({fermes.length})</p>
          {fermes.map(t => (
            <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ ...CARD, cursor: 'pointer', marginBottom: 8, opacity: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, color: DS.text }}>{t.sujet} — {t.email}</div>
                <span style={BADGE(DS.greenBg, DS.green)}>Fermé</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TAB 6 : PARAMETRES ──
// ══════════════════════════════════════════════════
function Parametres() {
  const [params, setParams] = useState(() => readLS('freample_params_plateforme', DEFAULT_PARAMS));
  const [saved, setSaved] = useState(false);

  const update = (key, val) => setParams(p => ({ ...p, [key]: val }));
  const save = () => {
    localStorage.setItem('freample_params_plateforme', JSON.stringify(params));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:700 }}>
      <div style={CARD}>
        <p style={SECTION_TITLE}>Parametres de la plateforme</p>
        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:20 }}>
          <Field label="Taux de commission (%)" sub="Preleve sur chaque transaction marketplace">
            <input type="number" value={params.commissionPct} onChange={e => update('commissionPct', Number(e.target.value))}
              style={INPUT} min={0} max={20} step={0.1} />
          </Field>
          <Field label="Chantiers manuels gratuits" sub="Nombre de chantiers manuels avant obligation marketplace">
            <input type="number" value={params.chantiersManuelGratuit} onChange={e => update('chantiersManuelGratuit', Number(e.target.value))}
              style={INPUT} min={0} max={50} />
          </Field>
          <Field label="Seuil alerte litige (heures)" sub="Delai avant escalade automatique d'un signalement">
            <input type="number" value={params.seuilAlerteLitige} onChange={e => update('seuilAlerteLitige', Number(e.target.value))}
              style={INPUT} min={1} max={168} />
          </Field>
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Informations legales Freample SAS</p>
        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:20 }}>
          <Field label="Email de contact">
            <input value={params.emailContact} onChange={e => update('emailContact', e.target.value)} style={INPUT} />
          </Field>
          <Field label="SIRET">
            <input value={params.siretFreample} onChange={e => update('siretFreample', e.target.value)} style={INPUT} />
          </Field>
          <Field label="N TVA intracommunautaire">
            <input value={params.tvaIntra} onChange={e => update('tvaIntra', e.target.value)} style={INPUT} />
          </Field>
        </div>
      </div>

      <div style={CARD}>
        <p style={SECTION_TITLE}>Secteurs actifs</p>
        <div style={{ marginTop:16, display:'flex', gap:10, flexWrap:'wrap' }}>
          {['btp','com'].map(s => {
            const actif = params.secteursActifs?.includes(s);
            return (
              <button key={s} onClick={() => {
                if (s === 'btp') return; // BTP toujours actif
                update('secteursActifs', actif ? params.secteursActifs.filter(x => x!==s) : [...(params.secteursActifs||[]), s]);
              }} style={{
                ...BTN, background: actif ? DS.gold : 'transparent', color: actif ? '#fff' : DS.subtle,
                border: actif ? 'none' : `1px solid ${DS.border}`,
                opacity: s === 'btp' ? 1 : undefined,
              }}>
                {s.toUpperCase()} {s === 'btp' && '(principal)'}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize:11, color:DS.subtle, marginTop:8 }}>Les secteurs desactives ne sont plus visibles sur la page d'accueil.</p>
      </div>

      <button onClick={save} style={{ ...BTN_PRIMARY, alignSelf:'flex-start', padding:'12px 32px', fontSize:14 }}>
        {saved ? 'Enregistre !' : 'Enregistrer les modifications'}
      </button>
    </div>
  );
}

const INPUT = {
  width:'100%', padding:'10px 14px', border:`1px solid ${DS.border}`, borderRadius:DS.r.sm,
  fontSize:14, fontFamily:DS.font, outline:'none', background:'#fff',
};

function Field({ label, sub, children }) {
  return (
    <div>
      <label style={{ fontSize:13, fontWeight:700, color:DS.text, display:'block', marginBottom:4 }}>{label}</label>
      {sub && <p style={{ fontSize:11, color:DS.subtle, margin:'0 0 8px' }}>{sub}</p>}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── DASHBOARD PRINCIPAL ──
// ══════════════════════════════════════════════════
export default function DashboardAdmin() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState(urlTab || 'overview');
  const [users, setUsers] = useState(DEMO_USERS);
  const [backendStats, setBackendStats] = useState(null);
  const token = localStorage.getItem('token');
  const isDemo = token && token.endsWith('.dev');
  const data = useMemo(() => isDemo ? getAllData() : { projets:[], chantiers:[], devis:[], factures:[], ecritures:[], pointages:[], conges:[], signalements:[], rapports:[] }, [isDemo]);

  // Charger les vrais utilisateurs et stats depuis le backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token.endsWith('.dev')) return; // Pas de backend pour les comptes démo
    const headers = { Authorization: `Bearer ${token}` };
    // Stats globales
    fetch(`${import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com'}/admin/dashboard-stats`, { headers })
      .then(r => r.json()).then(d => { if (d.users) setBackendStats(d); }).catch(() => {});
    // Liste utilisateurs
    fetch(`${import.meta.env.VITE_API_URL || 'https://monartisan-4lqa.onrender.com'}/admin/users`, { headers })
      .then(r => r.json()).then(d => {
        if (d.users?.length) {
          setUsers(d.users.map(u => ({
            id: u.id, nom: u.nom, email: u.email, role: u.role,
            secteur: u.secteur || 'btp', inscrit: u.cree_le?.slice(0, 10),
            actif: !u.suspendu, telephone: u.telephone, ville: u.ville, metier: u.metier,
          })));
        }
      }).catch(() => {});
  }, []);

  // Sync tab state avec URL query — marche aussi quand urlTab est null (= retour à overview)
  useEffect(() => {
    const target = urlTab || 'overview';
    if (target !== tab) setTab(target);
  }, [urlTab]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, fontFamily:DS.font }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize:22, fontWeight:900, color:DS.text, margin:0, letterSpacing:'-0.03em' }}>
          Freample — Espace Fondateur
        </h1>
        <p style={{ fontSize:13, color:DS.subtle, margin:'4px 0 0' }}>
          Bonjour {user?.nom || 'Fondateur'} — {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:`1px solid ${DS.border}`, paddingBottom:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              ...BTN, display:'flex', alignItems:'center', gap:6,
              borderRadius:`${DS.r.sm}px ${DS.r.sm}px 0 0`,
              borderBottom: tab===t.id ? `2px solid ${DS.gold}` : '2px solid transparent',
              background: tab===t.id ? DS.goldLight : 'transparent',
              color: tab===t.id ? DS.gold : DS.muted,
              fontWeight: tab===t.id ? 700 : 500,
            }}>
            <t.Icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && <VueEnsemble data={data} users={users} backendStats={backendStats} />}
      {tab === 'users' && <Utilisateurs users={users} setUsers={setUsers} />}
      {tab === 'support' && <SupportTab />}
      {tab === 'transactions' && <Transactions data={data} />}
      {tab === 'moderation' && <Moderation data={data} />}
      {tab === 'entreprise' && <EntrepriseFreample data={data} backendStats={backendStats} />}
      {tab === 'parametres' && <Parametres />}
    </div>
  );
}
