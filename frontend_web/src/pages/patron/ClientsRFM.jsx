import React, { useState, useMemo } from 'react';
import Reputation from './Reputation';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';

/* ── RFM scoring helpers ── */
function scoreRecency(daysSince) {
  if (daysSince <= 30)  return 5;
  if (daysSince <= 60)  return 4;
  if (daysSince <= 120) return 3;
  if (daysSince <= 365) return 2;
  return 1;
}
function scoreFrequency(nb) {
  if (nb >= 8) return 5;
  if (nb >= 5) return 4;
  if (nb >= 3) return 3;
  if (nb >= 2) return 2;
  return 1;
}
function scoreMonetary(total) {
  if (total >= 20000) return 5;
  if (total >= 10000) return 4;
  if (total >= 5000)  return 3;
  if (total >= 1000)  return 2;
  return 1;
}

function getSegment(r, f, m) {
  // Ordre : Champion > Fidèle > Ordinaire > Nouveau > Peu investi > En perte
  if (r >= 4 && f >= 4 && m >= 4) return 'champion';
  if (f >= 4 && m >= 3)           return 'fidele';
  if (r >= 4 && f === 1)          return 'nouveau';
  if (r <= 2 && f >= 3)           return 'en_perte';      // Anciens bons clients devenus inactifs
  if (r <= 2 && f <= 2)           return 'en_perte';      // Ex-inactifs fusionnés
  if (r >= 3 && f <= 2)           return 'peu_investi';   // Ex-à risque fusionnés
  return 'ordinaire';
}

// Ordre d'affichage : Champion → Fidèle → Ordinaire → Nouveau → Peu investi → En perte
const SEGMENTS = {
  champion:    { label: 'Champion',    color: '#1A7F43', bg: '#D1F2E0', desc: 'Achètent souvent, récemment et dépensent beaucoup. À chouchouter.' },
  fidele:      { label: 'Fidèle',      color: '#1565C0', bg: '#E3F2FD', desc: 'Commandent régulièrement. Bon potentiel de CA récurrent.' },
  ordinaire:   { label: 'Ordinaire',   color: '#5856D6', bg: '#EDE7F6', desc: 'Profil mixte — à surveiller.' },
  nouveau:     { label: 'Nouveau',     color: '#6A1B9A', bg: '#F3E5F5', desc: 'Premier passage récent. À accompagner pour une 2e commande.' },
  peu_investi: { label: 'Peu investi', color: '#E65100', bg: '#FFF3E0', desc: 'Clients avec un faible engagement — potentiel à développer ou risque de perte.' },
  en_perte:    { label: 'En perte',    color: '#6E6E73', bg: '#F2F2F7', desc: 'Clients qui ne sont plus venus depuis longtemps ou quasi-inactifs — campagne de réactivation.' },
};

const ACTIONS_SEGMENT = {};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatCur(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}
function initials(nom) {
  return (nom || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ── Demo data ── */
const TODAY = new Date('2026-03-26');
function daysAgo(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const CLIENTS_DEMO = [
  { id: 1,  nom: 'Mme Leblanc',       telephone: '06 12 34 56 78', email: 'leblanc@mail.fr',    derniereCommande: daysAgo(18),  nbCommandes: 9,  totalCA: 28400, historique: [{ date: daysAgo(18), desc: 'Rénovation salle de bain', montant: 4200 }, { date: daysAgo(90), desc: 'Carrelage cuisine', montant: 2800 }, { date: daysAgo(210), desc: 'Peinture salon', montant: 1800 }] },
  { id: 2,  nom: 'M. Rousseau',        telephone: '06 23 45 67 89', email: 'rousseau@mail.fr',   derniereCommande: daysAgo(8),   nbCommandes: 3,  totalCA: 6200,  historique: [{ date: daysAgo(8), desc: 'Dépannage fuite toiture', montant: 1400 }, { date: daysAgo(95), desc: 'Étanchéité terrasse', montant: 3200 }] },
  { id: 3,  nom: 'SCI Les Ormes',      telephone: '01 44 55 66 77', email: 'sci.ormes@mail.fr',  derniereCommande: daysAgo(45),  nbCommandes: 6,  totalCA: 42100, historique: [{ date: daysAgo(45), desc: 'Extension garage', montant: 18000 }, { date: daysAgo(180), desc: 'Ravalement façade', montant: 12000 }] },
  { id: 4,  nom: 'M. Petit',           telephone: '06 34 56 78 90', email: 'petit@mail.fr',      derniereCommande: daysAgo(280), nbCommandes: 2,  totalCA: 3800,  historique: [{ date: daysAgo(280), desc: 'Isolation toiture', montant: 2400 }, { date: daysAgo(420), desc: 'Remplacement fenêtres', montant: 1400 }] },
  { id: 5,  nom: 'Mme Garcia',         telephone: '06 45 67 89 01', email: 'garcia@mail.fr',     derniereCommande: daysAgo(12),  nbCommandes: 1,  totalCA: 1800,  historique: [{ date: daysAgo(12), desc: 'Création terrasse', montant: 1800 }] },
  { id: 6,  nom: 'Syndic Voltaire',    telephone: '01 23 45 67 89', email: 'voltaire@syndic.fr', derniereCommande: daysAgo(390), nbCommandes: 7,  totalCA: 31500, historique: [{ date: daysAgo(390), desc: 'Chauffe-eau collectif', montant: 4200 }, { date: daysAgo(480), desc: 'Ravalement copropriété', montant: 18000 }] },
  { id: 7,  nom: 'M. Martin (SCI)',    telephone: '06 56 78 90 12', email: 'martin.sci@mail.fr', derniereCommande: daysAgo(55),  nbCommandes: 5,  totalCA: 14200, historique: [{ date: daysAgo(55), desc: 'Isolation combles', montant: 5600 }, { date: daysAgo(130), desc: 'Plomberie générale', montant: 3200 }] },
  { id: 8,  nom: 'Mme Dupont',         telephone: '06 67 89 01 23', email: 'dupont@mail.fr',     derniereCommande: daysAgo(22),  nbCommandes: 4,  totalCA: 9400,  historique: [{ date: daysAgo(22), desc: 'Pose carrelage T3', montant: 3200 }, { date: daysAgo(120), desc: 'Peinture complète', montant: 2800 }] },
  { id: 9,  nom: 'M. Bernard',         telephone: '06 78 90 12 34', email: 'bernard@mail.fr',    derniereCommande: daysAgo(500), nbCommandes: 1,  totalCA: 650,   historique: [{ date: daysAgo(500), desc: 'Petite réparation fuite', montant: 650 }] },
  { id: 10, nom: 'SARL Horizon BTP',   telephone: '01 55 66 77 88', email: 'horizon@btp.fr',     derniereCommande: daysAgo(30),  nbCommandes: 8,  totalCA: 67000, historique: [{ date: daysAgo(30), desc: 'Chantier résidentiel R+2', montant: 32000 }, { date: daysAgo(120), desc: 'Aménagement bureaux', montant: 18000 }] },
  { id: 11, nom: 'Mme Leroy',          telephone: '06 89 01 23 45', email: 'leroy@mail.fr',      derniereCommande: daysAgo(75),  nbCommandes: 2,  totalCA: 4600,  historique: [{ date: daysAgo(75), desc: 'Rénovation cuisine', montant: 3200 }, { date: daysAgo(310), desc: 'Carrelage entrée', montant: 1400 }] },
  { id: 12, nom: 'M. Moreau',          telephone: '06 90 12 34 56', email: 'moreau@mail.fr',     derniereCommande: daysAgo(600), nbCommandes: 3,  totalCA: 7800,  historique: [{ date: daysAgo(600), desc: 'Ravalement façade', montant: 4800 }, { date: daysAgo(700), desc: 'Étanchéité toiture', montant: 3000 }] },
  { id: 13, nom: 'Résidence du Parc',  telephone: '01 44 33 22 11', email: 'res.parc@syndic.fr', derniereCommande: daysAgo(20),  nbCommandes: 10, totalCA: 89000, historique: [{ date: daysAgo(20), desc: 'Ravalement copropriété', montant: 42000 }, { date: daysAgo(180), desc: 'Rénovation parties communes', montant: 28000 }] },
  { id: 14, nom: 'M. Fontaine',        telephone: '06 01 23 45 67', email: 'fontaine@mail.fr',   derniereCommande: daysAgo(150), nbCommandes: 2,  totalCA: 2200,  historique: [{ date: daysAgo(150), desc: 'Remplacement chauffe-eau', montant: 1400 }] },
  { id: 15, nom: 'Mme Chevalier',      telephone: '06 12 23 34 45', email: 'chevalier@mail.fr',  derniereCommande: daysAgo(40),  nbCommandes: 3,  totalCA: 8200,  historique: [{ date: daysAgo(40), desc: 'Salle de bain complète', montant: 6400 }, { date: daysAgo(200), desc: 'Peinture chambre', montant: 1800 }] },
].map(c => {
  const daysSince = Math.round((TODAY - new Date(c.derniereCommande)) / 86400000);
  const r = scoreRecency(daysSince);
  const f = scoreFrequency(c.nbCommandes);
  const m = scoreMonetary(c.totalCA);
  return { ...c, daysSince, r, f, m, segment: getSegment(r, f, m) };
});

/* ── Score dot ── */
function ScoreDots({ score, color }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i <= score ? color : '#E5E5EA', transition: 'background 0.2s' }} />
      ))}
    </div>
  );
}

/* ── Demo banner ── */
function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF3E0', border: '1px solid #FF9500', borderRadius: 10, padding: '10px 16px', marginBottom: 4 }}>
      <span style={{ fontSize: '1rem' }}>⚠️</span>
      <span style={{ fontSize: '0.8125rem', color: '#7A4900', fontWeight: 500, flex: 1 }}>
        Données de démonstration — connectez votre backend pour afficher vos vrais clients.
      </span>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF9500', fontWeight: 700, fontSize: '0.875rem' }}>✕</button>
    </div>
  );
}

/* ── Main component ── */
export default function ClientsRFM() {
  const isDemo = _isDemo();
  const [mainTab, setMainTab] = useState('clients');
  const [filtreSegment, setFiltreSegment] = useState('tous');
  const [search, setSearch] = useState('');
  const [tri, setTri] = useState('rfm');
  const [selectedId, setSelectedId] = useState(null);

  // Règles des hooks : useMemo DOIT être appelé avant les return conditionnels
  const clients = useMemo(() => {
    let list = isDemo ? CLIENTS_DEMO : [];
    if (filtreSegment !== 'tous') list = list.filter(c => c.segment === filtreSegment);
    if (search) list = list.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => {
      if (tri === 'rfm')       return (b.r + b.f + b.m) - (a.r + a.f + a.m);
      if (tri === 'recency')   return b.r - a.r;
      if (tri === 'frequency') return b.f - a.f;
      if (tri === 'monetary')  return b.m - a.m;
      if (tri === 'nom')       return a.nom.localeCompare(b.nom);
      return 0;
    });
  }, [filtreSegment, search, tri]);

  if (mainTab === 'avis') return (
    <div>
      <div style={{ display:'flex', gap:4, marginBottom:0, padding:'28px 28px 0' }}>
        <button onClick={()=>setMainTab('clients')} style={{ padding:'10px 20px', background:'transparent', border:'none', borderBottom:'2px solid transparent', fontSize:14, fontWeight:400, color:'#6E6E73', cursor:'pointer' }}>Clients & Segmentation</button>
        <button style={{ padding:'10px 20px', background:'transparent', border:'none', borderBottom:'2px solid #5B5BD6', fontSize:14, fontWeight:700, color:'#1C1C1E', cursor:'pointer' }}>Avis & Réputation</button>
      </div>
      <Reputation />
    </div>
  );

  const allClients = isDemo ? CLIENTS_DEMO : [];
  const selected = allClients.find(c => c.id === selectedId);

  /* KPIs par segment */
  const kpis = Object.entries(SEGMENTS).map(([key, seg]) => ({
    key, ...seg,
    count: allClients.filter(c => c.segment === key).length,
    ca: allClients.filter(c => c.segment === key).reduce((s, c) => s + c.totalCA, 0),
  })).filter(k => k.count > 0);

  const totalCA = allClients.reduce((s, c) => s + c.totalCA, 0);

  function exportCSV() {
    const rows = [['Nom', 'Email', 'Téléphone', 'R', 'F', 'M', 'Score', 'CA total', 'Nb commandes', 'Dernier achat', 'Segment']];
    clients.forEach(c => rows.push([
      c.nom, c.email || '', c.telephone || '',
      c.r, c.f, c.m, c.r + c.f + c.m,
      c.totalCA.toFixed(2), c.nbCommandes,
      c.derniereCommande,
      SEGMENTS[c.segment]?.label || c.segment,
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'clients-rfm.csv'; a.click();
  }

  return (
    <div style={{ padding: 28, maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Onglets principaux */}
      <div style={{ display:'flex', gap:4, marginBottom:-16 }}>
        <button style={{ padding:'10px 20px', background:'transparent', border:'none', borderBottom:'2px solid #5B5BD6', fontSize:14, fontWeight:700, color:'#1C1C1E', cursor:'pointer' }}>Clients & Segmentation</button>
        <button onClick={()=>setMainTab('avis')} style={{ padding:'10px 20px', background:'transparent', border:'none', borderBottom:'2px solid transparent', fontSize:14, fontWeight:400, color:'#6E6E73', cursor:'pointer' }}>Avis & Réputation</button>
      </div>

      {/* Demo banner */}
      <DemoBanner />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Gestion clients RFM</h1>
          <p style={{ color: '#6E6E73', marginTop: 4, fontSize: 14 }}>
            Récence · Fréquence · Montant — segmentez votre portefeuille et pilotez vos relances
          </p>
        </div>
        <button onClick={exportCSV} style={{ padding: '8px 16px', border: '1px solid #E5E5EA', borderRadius: 8, background: '#fff', color: '#1C1C1E', cursor: 'pointer', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          ↓ Export CSV
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        <div onClick={() => setFiltreSegment('tous')} style={{ background: filtreSegment === 'tous' ? '#1C1C1E' : '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.15s' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: filtreSegment === 'tous' ? '#fff' : '#1C1C1E' }}>{allClients.length}</div>
          <div style={{ fontSize: 12, color: filtreSegment === 'tous' ? 'rgba(255,255,255,0.7)' : '#6E6E73', marginTop: 3 }}>Tous les clients</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: filtreSegment === 'tous' ? '#34C759' : '#1A7F43', marginTop: 4 }}>{formatCur(totalCA)}</div>
        </div>
        {kpis.map(k => (
          <div key={k.key} onClick={() => setFiltreSegment(k.key === filtreSegment ? 'tous' : k.key)}
            style={{ background: filtreSegment === k.key ? k.color : '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', border: `2px solid ${filtreSegment === k.key ? k.color : 'transparent'}`, transition: 'all 0.15s' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: filtreSegment === k.key ? '#fff' : k.color }}>{k.count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: filtreSegment === k.key ? 'rgba(255,255,255,0.85)' : '#1C1C1E', marginTop: 3 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: filtreSegment === k.key ? 'rgba(255,255,255,0.65)' : '#636363', marginTop: 4 }}>{formatCur(k.ca)}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Légende des scores RFM</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { label: 'R — Récence', desc: '5 = < 30 j · 4 = < 60 j · 3 = < 4 mois · 2 = < 1 an · 1 = > 1 an', color: '#5B5BD6' },
            { label: 'F — Fréquence', desc: '5 = ≥ 8 cmds · 4 = 5-7 · 3 = 3-4 · 2 = 2 · 1 = 1 commande', color: '#FF9500' },
            { label: 'M — Montant', desc: '5 = ≥ 20 000 € · 4 = ≥ 10 000 € · 3 = ≥ 5 000 € · 2 = ≥ 1 000 € · 1 = < 1 000 €', color: '#34C759' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScoreDots score={5} color={d.color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.label}</span>
              </div>
              <div style={{ fontSize: 11, color: '#636363', lineHeight: 1.5 }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client…"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#636363', fontWeight: 600 }}>Trier :</span>
          {[['rfm', 'Score RFM'], ['recency', 'Récence'], ['frequency', 'Fréquence'], ['monetary', 'Montant'], ['nom', 'Nom']].map(([k, l]) => (
            <button key={k} onClick={() => setTri(k)} style={{ padding: '5px 12px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tri === k ? '#1C1C1E' : '#F2F2F7', color: tri === k ? '#fff' : '#6E6E73', transition: 'all 0.15s' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table + modal zoom */}
      <div>
        {/* Client list */}
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 90px 100px 120px', padding: '10px 16px', borderBottom: '2px solid #F2F2F7', background: '#FAFAFA' }}>
            {['Client', 'R', 'F', 'M', 'Score', 'CA total', 'Segment'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>

          {clients.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#636363' }}>Aucun client pour ce filtre</div>
          ) : clients.map((c, i) => {
            const seg = SEGMENTS[c.segment];
            const rfmTotal = c.r + c.f + c.m;
            const isSelected = selectedId === c.id;
            return (
              <div key={c.id} onClick={() => setSelectedId(isSelected ? null : c.id)}
                style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 90px 100px 120px', padding: '12px 16px', borderBottom: '1px solid #F2F2F7', background: isSelected ? '#F0F5FF' : i % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer', transition: 'background 0.15s', alignItems: 'center' }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F5F7FF'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFAFA'; }}>

                {/* Client name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${seg.color}20`, color: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                    {initials(c.nom)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{c.nom}</div>
                    <div style={{ fontSize: 11, color: '#636363' }}>{c.nbCommandes} cmd{c.nbCommandes > 1 ? 's' : ''} · dernier : {c.daysSince}j</div>
                  </div>
                </div>

                {/* R score */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#5B5BD6' }}>{c.r}</div>
                  <ScoreDots score={c.r} color="#5B5BD6" />
                </div>

                {/* F score */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#FF9500' }}>{c.f}</div>
                  <ScoreDots score={c.f} color="#FF9500" />
                </div>

                {/* M score */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#34C759' }}>{c.m}</div>
                  <ScoreDots score={c.m} color="#34C759" />
                </div>

                {/* Total score */}
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', background: rfmTotal >= 12 ? '#D1F2E0' : rfmTotal >= 9 ? '#E3F2FD' : rfmTotal >= 6 ? '#FFF3E0' : '#F2F2F7', fontWeight: 800, fontSize: 16, color: rfmTotal >= 12 ? '#1A7F43' : rfmTotal >= 9 ? '#1565C0' : rfmTotal >= 6 ? '#E65100' : '#6E6E73' }}>
                    {rfmTotal}
                  </div>
                </div>

                {/* CA */}
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{formatCur(c.totalCA)}</div>

                {/* Segment badge */}
                <div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: seg.bg, color: seg.color, whiteSpace: 'nowrap' }}>{seg.label}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Modal zoom fiche client */}
      {selected && (
        <div onClick={() => setSelectedId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s ease-out' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '92%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', animation: 'zoomIn .25s ease-out' }}>
            <ClientDetail client={selected} onClose={() => setSelectedId(null)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

/* ── Client detail panel ── */

function ClientDetail({ client: c, onClose }) {
  const seg = SEGMENTS[c.segment];
  const rfmTotal = c.r + c.f + c.m;
  const [actionDone, setActionDone] = useState(false);
  const [commentaires, setCommentaires] = useState(() => demoGet('freample_client_commentaires', {}));
  const [newComment, setNewComment] = useState('');
  const [showAllHisto, setShowAllHisto] = useState(false);

  // ── Données réelles depuis localStorage ──
  const allDevis = demoGet('freample_devis', []);
  const allChantiers = demoGet('freample_chantiers_custom', []);
  const allFactures = demoGet('freample_factures', []);
  const allPvs = demoGet('freample_pv_receptions', []);

  // Matcher par nom client (fuzzy)
  const nomLower = (c.nom || '').toLowerCase();
  const matchClient = (name) => {
    if (!name) return false;
    const n = name.toLowerCase();
    return n.includes(nomLower) || nomLower.includes(n) || n.split(' ').some(w => w.length > 2 && nomLower.includes(w));
  };

  const devisClient = allDevis.filter(d => matchClient(d.client));
  const chantiersClient = allChantiers.filter(ch => matchClient(ch.client));
  const facturesClient = allFactures.filter(f => matchClient(f.client));
  const pvsClient = allPvs.filter(pv => matchClient(pv.maitreOuvrage?.nom));

  // Historique unifié : démo + données réelles
  const historiqueReel = [
    ...devisClient.map(d => ({ date: d.date, desc: `Devis ${d.numero || ''} — ${d.objet || ''}`, montant: d.montantTTC || 0, type: 'devis', statut: d.statut })),
    ...chantiersClient.map(ch => ({ date: ch.dateDebut, desc: ch.titre || '', montant: ch.caDevis || ch.budgetPrevu || 0, type: 'chantier', statut: ch.statut })),
    ...facturesClient.map(f => ({ date: f.date, desc: `Facture ${f.numero || ''} — ${f.objet || ''}`, montant: f.montantTTC || 0, type: 'facture', statut: f.statut })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const historiqueAll = historiqueReel.length > 0 ? historiqueReel : (c.historique || []);
  const historiqueVisible = showAllHisto ? historiqueAll : historiqueAll.slice(0, 5);

  // Commentaires du patron pour ce client
  const mesCommentaires = commentaires[c.id] || [];

  const ajouterCommentaire = () => {
    if (!newComment.trim()) return;
    const comment = { id: Date.now(), texte: newComment.trim(), date: new Date().toISOString() };
    const updated = { ...commentaires, [c.id]: [...mesCommentaires, comment] };
    setCommentaires(updated);
    demoSet('freample_client_commentaires', updated);
    setNewComment('');
  };

  const supprimerCommentaire = (commentId) => {
    const updated = { ...commentaires, [c.id]: mesCommentaires.filter(cm => cm.id !== commentId) };
    setCommentaires(updated);
    demoSet('freample_client_commentaires', updated);
  };

  // KPIs client
  const caReel = historiqueReel.length > 0 ? devisClient.filter(d => d.statut === 'accepte' || d.statut === 'signe').reduce((s, d) => s + (d.montantTTC || 0), 0) : c.totalCA;
  const nbChantiers = chantiersClient.length || c.nbCommandes;
  const nbPvs = pvsClient.length;
  const panierMoyen = nbChantiers > 0 ? Math.round((caReel || c.totalCA) / nbChantiers) : 0;

  // Ancienneté (depuis la première commande)
  const allDates = [...(c.historique || []).map(h => h.date), ...devisClient.map(d => d.date), ...chantiersClient.map(ch => ch.dateDebut)].filter(Boolean).sort();
  const premiereDate = allDates[0];
  const ancienneteJours = premiereDate ? Math.round((new Date() - new Date(premiereDate)) / 86400000) : c.daysSince || 0;
  const ancienneteLabel = ancienneteJours > 365 ? `${Math.floor(ancienneteJours / 365)} an${Math.floor(ancienneteJours / 365) > 1 ? 's' : ''} ${Math.floor((ancienneteJours % 365) / 30)} mois`
    : ancienneteJours > 30 ? `${Math.floor(ancienneteJours / 30)} mois` : `${ancienneteJours} jours`;

  // Infos pré-remplies depuis les devis
  const firstDevis = devisClient[0] || {};
  const adresseClient = firstDevis.clientAdresse || firstDevis.adresseChantier || c.adresse || '';
  const emailClient = firstDevis.clientEmail || c.email || '';
  const telClient = firstDevis.clientTel || c.telephone || '';

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', overflow: 'hidden', position: 'sticky', top: 24 }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', background: `linear-gradient(135deg, ${seg.color}ee, ${seg.color}aa)`, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
              {initials(c.nom)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{c.nom}</div>
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.25)', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{seg.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 700, overflowY: 'auto' }}>
        {/* Infos client */}
        <div style={{ background: '#FAFAFA', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Téléphone', telClient || '—', telClient ? `tel:${telClient}` : null],
              ['Email', emailClient || '—', emailClient ? `mailto:${emailClient}` : null],
              ['Adresse', adresseClient || '—', null],
              ['Ancienneté', ancienneteLabel, null],
              ['Date de naissance', '—', null],
              ['Client depuis', premiereDate ? formatDate(premiereDate) : '—', null],
            ].map(([label, val, href]) => (
              <div key={label} style={{ padding: '6px 0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
                {href ? (
                  <a href={href} style={{ fontSize: 13, fontWeight: 600, color: '#5B5BD6', textDecoration: 'none', marginTop: 2, display: 'block' }}>{val}</a>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', marginTop: 2 }}>{val}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KPIs client */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            ['CA total', formatCur(caReel || c.totalCA), '#1A7F43'],
            ['Panier moyen', formatCur(panierMoyen), '#5B5BD6'],
            ['Chantiers', nbChantiers, '#FF9500'],
            ['PV signés', nbPvs, '#A68B4B'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: 'center', background: '#FAFAFA', borderRadius: 10, padding: '10px 6px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: 9, color: '#636363', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* RFM scores */}
        <div style={{ background: '#FAFAFA', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Score RFM</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Récence', score: c.r, color: '#5B5BD6', detail: `${c.daysSince} jours` },
              { label: 'Fréquence', score: c.f, color: '#FF9500', detail: `${c.nbCommandes} cmds` },
              { label: 'Montant', score: c.m, color: '#34C759', detail: formatCur(c.totalCA) },
            ].map(d => (
              <div key={d.label} style={{ textAlign: 'center', background: '#fff', borderRadius: 10, padding: '10px 8px', border: `2px solid ${d.color}20` }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: d.color, lineHeight: 1 }}>{d.score}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: d.color, marginTop: 2 }}>{d.label}</div>
                <div style={{ fontSize: 10, color: '#636363', marginTop: 3 }}>{d.detail}</div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 6 }}>
                  {[1,2,3,4,5].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= d.score ? d.color : '#E5E5EA' }} />)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E5EA', paddingTop: 10 }}>
            <span style={{ fontSize: 12, color: '#6E6E73', fontWeight: 600 }}>Score total</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: seg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: seg.color }}>{rfmTotal}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: seg.color }}>/ 15</span>
            </div>
          </div>
        </div>


        {/* Commentaires du patron */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Notes internes</div>
          {mesCommentaires.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {mesCommentaires.map(cm => (
                <div key={cm.id} style={{ padding: '8px 12px', background: '#FFFBEB', borderRadius: 8, borderLeft: '3px solid #A68B4B', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#1C1C1E', lineHeight: 1.5 }}>{cm.texte}</div>
                    <div style={{ fontSize: 10, color: '#636363', marginTop: 4 }}>{formatDate(cm.date)}</div>
                  </div>
                  <button onClick={() => supprimerCommentaire(cm.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 12, padding: 2, flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') ajouterCommentaire(); }}
              placeholder="Ajouter une note sur ce client..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, outline: 'none' }} />
            <button onClick={ajouterCommentaire} disabled={!newComment.trim()}
              style={{ padding: '8px 14px', background: newComment.trim() ? '#A68B4B' : '#E5E5EA', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: newComment.trim() ? 'pointer' : 'default' }}>
              +
            </button>
          </div>
        </div>

        {/* Historique unifié */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Historique {historiqueReel.length > 0 ? '(données réelles)' : '(démo)'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historiqueVisible.map((h, i) => {
              const typeIcon = h.type === 'devis' ? '📋' : h.type === 'chantier' ? '🏗️' : h.type === 'facture' ? '🧾' : '📦';
              const statutColor = h.statut === 'accepte' || h.statut === 'signe' || h.statut === 'terminee' || h.statut === 'payee' ? '#16A34A'
                : h.statut === 'envoye' || h.statut === 'en_cours' ? '#D97706'
                : h.statut === 'retire_marketplace' || h.statut === 'annulee' ? '#DC2626' : '#636363';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FAFAFA', borderRadius: 10, fontSize: 13 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#1C1C1E', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{typeIcon}</span> {h.desc || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: '#636363', marginTop: 2, display: 'flex', gap: 8 }}>
                      <span>{formatDate(h.date)}</span>
                      {h.statut && <span style={{ fontWeight: 600, color: statutColor }}>{h.statut}</span>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#1C1C1E', flexShrink: 0 }}>{formatCur(h.montant)}</div>
                </div>
              );
            })}
            {historiqueAll.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#636363', fontSize: 13 }}>Aucun historique disponible</div>
            )}
            {historiqueAll.length > 5 && !showAllHisto && (
              <button onClick={() => setShowAllHisto(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#5B5BD6', fontWeight: 600, padding: 4 }}>
                Voir tout ({historiqueAll.length} éléments) →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
