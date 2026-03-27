import React, { useState, useMemo } from 'react';

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
  if (r >= 4 && f >= 4 && m >= 4) return 'champion';
  if (r >= 4 && f === 1)          return 'nouveau';
  if (f >= 4 && m >= 3)           return 'fidele';
  if (r >= 3 && f <= 2 && m >= 2) return 'potentiel';
  if (r <= 2 && f >= 3 && m >= 3) return 'risque';
  if (r <= 2 && f >= 4 && m >= 4) return 'reconquerir';
  if (r <= 2 && f <= 2)           return 'inactif';
  return 'ordinaire';
}

const SEGMENTS = {
  champion:    { label: 'Champion',       color: '#1A7F43', bg: '#D1F2E0', desc: 'Achètent souvent, récemment et dépensent beaucoup. À chouchouter.' },
  fidele:      { label: 'Fidèle',         color: '#1565C0', bg: '#E3F2FD', desc: 'Commandent régulièrement. Bon potentiel de CA récurrent.' },
  potentiel:   { label: 'Client potentiel', color: '#00796B', bg: '#E0F2F1', desc: 'Clients récents avec peu de commandes — à fidéliser.' },
  nouveau:     { label: 'Nouveau',        color: '#6A1B9A', bg: '#F3E5F5', desc: 'Premier passage récent. À accompagner pour une 2e commande.' },
  risque:      { label: 'À risque',       color: '#E65100', bg: '#FFF3E0', desc: 'Bons clients qui ne sont plus venus depuis un moment.' },
  reconquerir: { label: 'À reconquérir',  color: '#C62828', bg: '#FFEBEE', desc: 'Anciens bons clients devenus inactifs — priorité de relance.' },
  inactif:     { label: 'Inactif',        color: '#6E6E73', bg: '#F2F2F7', desc: 'Peu commandé et pas vu depuis longtemps.' },
  ordinaire:   { label: 'Ordinaire',      color: '#5856D6', bg: '#EDE7F6', desc: 'Profil mixte — à surveiller.' },
};

const ACTIONS_SEGMENT = {
  champion:    'Proposer programme fidélité / parrainage',
  fidele:      'Envoyer offre exclusive ou réduction sur prochain chantier',
  potentiel:   'Relancer avec proposition de visite conseil gratuite',
  nouveau:     'Appeler pour s\'assurer de sa satisfaction + proposer 2e devis',
  risque:      'Contacter en urgence — proposer un rendez-vous de reprise',
  reconquerir: 'Envoyer une offre de retour agressive (remise 10-15%)',
  inactif:     'Campagne de réactivation — email ou courrier postal',
  ordinaire:   'Suivi standard — relance annuelle',
};

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
  const [filtreSegment, setFiltreSegment] = useState('tous');
  const [search, setSearch] = useState('');
  const [tri, setTri] = useState('rfm'); // 'rfm' | 'recency' | 'frequency' | 'monetary' | 'nom'
  const [selectedId, setSelectedId] = useState(null);

  const clients = useMemo(() => {
    let list = CLIENTS_DEMO;
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

  const selected = CLIENTS_DEMO.find(c => c.id === selectedId);

  /* KPIs par segment */
  const kpis = Object.entries(SEGMENTS).map(([key, seg]) => ({
    key, ...seg,
    count: CLIENTS_DEMO.filter(c => c.segment === key).length,
    ca: CLIENTS_DEMO.filter(c => c.segment === key).reduce((s, c) => s + c.totalCA, 0),
  })).filter(k => k.count > 0);

  const totalCA = CLIENTS_DEMO.reduce((s, c) => s + c.totalCA, 0);

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
          <div style={{ fontSize: 26, fontWeight: 800, color: filtreSegment === 'tous' ? '#fff' : '#1C1C1E' }}>{CLIENTS_DEMO.length}</div>
          <div style={{ fontSize: 12, color: filtreSegment === 'tous' ? 'rgba(255,255,255,0.7)' : '#6E6E73', marginTop: 3 }}>Tous les clients</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: filtreSegment === 'tous' ? '#34C759' : '#1A7F43', marginTop: 4 }}>{formatCur(totalCA)}</div>
        </div>
        {kpis.map(k => (
          <div key={k.key} onClick={() => setFiltreSegment(k.key === filtreSegment ? 'tous' : k.key)}
            style={{ background: filtreSegment === k.key ? k.color : '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', border: `2px solid ${filtreSegment === k.key ? k.color : 'transparent'}`, transition: 'all 0.15s' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: filtreSegment === k.key ? '#fff' : k.color }}>{k.count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: filtreSegment === k.key ? 'rgba(255,255,255,0.85)' : '#1C1C1E', marginTop: 3 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: filtreSegment === k.key ? 'rgba(255,255,255,0.65)' : '#8E8E93', marginTop: 4 }}>{formatCur(k.ca)}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Légende des scores RFM</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { label: 'R — Récence', desc: '5 = < 30 j · 4 = < 60 j · 3 = < 4 mois · 2 = < 1 an · 1 = > 1 an', color: '#007AFF' },
            { label: 'F — Fréquence', desc: '5 = ≥ 8 cmds · 4 = 5-7 · 3 = 3-4 · 2 = 2 · 1 = 1 commande', color: '#FF9500' },
            { label: 'M — Montant', desc: '5 = ≥ 20 000 € · 4 = ≥ 10 000 € · 3 = ≥ 5 000 € · 2 = ≥ 1 000 € · 1 = < 1 000 €', color: '#34C759' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScoreDots score={5} color={d.color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.label}</span>
              </div>
              <div style={{ fontSize: 11, color: '#8E8E93', lineHeight: 1.5 }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client…"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#8E8E93', fontWeight: 600 }}>Trier :</span>
          {[['rfm', 'Score RFM'], ['recency', 'Récence'], ['frequency', 'Fréquence'], ['monetary', 'Montant'], ['nom', 'Nom']].map(([k, l]) => (
            <button key={k} onClick={() => setTri(k)} style={{ padding: '5px 12px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tri === k ? '#1C1C1E' : '#F2F2F7', color: tri === k ? '#fff' : '#6E6E73', transition: 'all 0.15s' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table + detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Client list */}
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 90px 100px 120px', padding: '10px 16px', borderBottom: '2px solid #F2F2F7', background: '#FAFAFA' }}>
            {['Client', 'R', 'F', 'M', 'Score', 'CA total', 'Segment'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>

          {clients.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>Aucun client pour ce filtre</div>
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
                    <div style={{ fontSize: 11, color: '#8E8E93' }}>{c.nbCommandes} cmd{c.nbCommandes > 1 ? 's' : ''} · dernier : {c.daysSince}j</div>
                  </div>
                </div>

                {/* R score */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#007AFF' }}>{c.r}</div>
                  <ScoreDots score={c.r} color="#007AFF" />
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

        {/* Detail panel */}
        {selected && (
          <ClientDetail client={selected} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}

/* ── Client detail panel ── */
function ClientDetail({ client: c, onClose }) {
  const seg = SEGMENTS[c.segment];
  const rfmTotal = c.r + c.f + c.m;
  const [actionDone, setActionDone] = useState(false);

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

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 600, overflowY: 'auto' }}>
        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {c.telephone && <div style={{ fontSize: 13, color: '#1C1C1E' }}>📞 {c.telephone}</div>}
          {c.email && <div style={{ fontSize: 13, color: '#007AFF' }}>✉ {c.email}</div>}
        </div>

        {/* RFM scores */}
        <div style={{ background: '#FAFAFA', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Score RFM</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Récence', score: c.r, color: '#007AFF', detail: `${c.daysSince} jours` },
              { label: 'Fréquence', score: c.f, color: '#FF9500', detail: `${c.nbCommandes} cmds` },
              { label: 'Montant', score: c.m, color: '#34C759', detail: formatCur(c.totalCA) },
            ].map(d => (
              <div key={d.label} style={{ textAlign: 'center', background: '#fff', borderRadius: 10, padding: '10px 8px', border: `2px solid ${d.color}20` }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: d.color, lineHeight: 1 }}>{d.score}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: d.color, marginTop: 2 }}>{d.label}</div>
                <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 3 }}>{d.detail}</div>
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

        {/* Recommandation */}
        <div style={{ background: `${seg.bg}`, borderRadius: 12, padding: '12px 14px', border: `1px solid ${seg.color}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: seg.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Recommandation</div>
          <div style={{ fontSize: 12, color: '#3C3C43', lineHeight: 1.6 }}>{seg.desc}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: seg.color, marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span>→</span> {ACTIONS_SEGMENT[c.segment]}
          </div>
        </div>

        {/* Historique */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Historique des commandes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(c.historique || []).map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FAFAFA', borderRadius: 10, fontSize: 13 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1C1C1E' }}>{h.desc}</div>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>{formatDate(h.date)}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#1C1C1E' }}>{formatCur(h.montant)}</div>
              </div>
            ))}
            {(!c.historique || c.historique.length === 0) && (
              <div style={{ textAlign: 'center', padding: 20, color: '#8E8E93', fontSize: 13 }}>Aucun historique disponible</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {actionDone ? (
            <div style={{ background: '#D1F2E0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1A7F43', fontWeight: 600, textAlign: 'center' }}>
              Action enregistrée — client ajouté à la file de relance
            </div>
          ) : (
            <>
              <button onClick={() => setActionDone(true)} style={{ padding: '11px 0', border: 'none', borderRadius: 10, background: seg.color, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                Lancer l'action recommandée
              </button>
              <button style={{ padding: '10px 0', border: `1.5px solid ${seg.color}`, borderRadius: 10, background: '#fff', color: seg.color, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Proposer un devis
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
