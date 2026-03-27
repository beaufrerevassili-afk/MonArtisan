import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IconDocument, IconDownload, IconSearch, IconFilter, IconUser, IconShield, IconTeam } from '../../components/ui/Icons';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const BASE_URL = window.location.origin;

/* ── Static demo documents (non-devis) ── */
const BULLETINS_STATIC = [
  { id: 'BP-2025-03-001', nom: 'Bulletin de paie — Thomas Martin', categorie: 'Bulletin de paie', date: '2025-03-31', employe: 'Thomas Martin', periode: 'Mars 2025', type: 'bulletin' },
  { id: 'BP-2025-03-002', nom: 'Bulletin de paie — Julien Petit',  categorie: 'Bulletin de paie', date: '2025-03-31', employe: 'Julien Petit',  periode: 'Mars 2025', type: 'bulletin' },
  { id: 'BP-2025-03-003', nom: 'Bulletin de paie — Lucas Bernard', categorie: 'Bulletin de paie', date: '2025-03-31', employe: 'Lucas Bernard', periode: 'Mars 2025', type: 'bulletin' },
  { id: 'BP-2025-02-001', nom: 'Bulletin de paie — Thomas Martin', categorie: 'Bulletin de paie', date: '2025-02-28', employe: 'Thomas Martin', periode: 'Févr. 2025', type: 'bulletin' },
  { id: 'BP-2025-02-002', nom: 'Bulletin de paie — Julien Petit',  categorie: 'Bulletin de paie', date: '2025-02-28', employe: 'Julien Petit',  periode: 'Févr. 2025', type: 'bulletin' },
];

const CONTRATS_STATIC = [
  { id: 'CDI-2021-001', nom: 'Contrat CDI — Thomas Martin',  categorie: 'Contrat de travail', date: '2021-03-15', employe: 'Thomas Martin', type: 'contrat' },
  { id: 'CDI-2020-001', nom: 'Contrat CDI — Julien Petit',   categorie: 'Contrat de travail', date: '2020-06-01', employe: 'Julien Petit',  type: 'contrat' },
  { id: 'CDD-2025-001', nom: 'Contrat CDD — Lucas Bernard',  categorie: 'Contrat de travail', date: '2025-01-10', employe: 'Lucas Bernard', type: 'contrat' },
];

const QSE_STATIC = [
  { id: 'duerp',             nom: 'DUERP — Document Unique d\'Évaluation des Risques', categorie: 'Document QSE', date: '2025-03-01', type: 'qse' },
  { id: 'registre-at',       nom: 'Registre des Accidents du Travail',                 categorie: 'Document QSE', date: '2025-02-15', type: 'qse' },
  { id: 'registre-incendie', nom: 'Registre de Sécurité Incendie',                    categorie: 'Document QSE', date: '2025-01-10', type: 'qse' },
  { id: 'affichage-obligatoire', nom: 'Tableau d\'Affichage Obligatoire',             categorie: 'Document QSE', date: '2025-01-01', type: 'qse' },
];

const CATEGORIES = ['Tous', 'Devis', 'Bulletin de paie', 'Contrat de travail', 'Document QSE'];

const CAT_COLORS = {
  'Devis':            { bg: '#E3F2FD', color: '#1565C0' },
  'Bulletin de paie': { bg: '#D1F2E0', color: '#1A7F43' },
  'Contrat de travail': { bg: '#FFF3CD', color: '#856404' },
  'Document QSE':     { bg: '#FFE5E5', color: '#C0392B' },
};

const CAT_ICONS = {
  'Devis':            IconDocument,
  'Bulletin de paie': IconTeam,
  'Contrat de travail': IconUser,
  'Document QSE':     IconShield,
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function docUrl(type, id) {
  return `${BASE_URL}/documents/${type}/${id}`;
}

export default function BanqueDocuments() {
  const { token } = useAuth();
  const [devis, setDevis] = useState([]);
  const [loadingDevis, setLoadingDevis] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Tous');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetch(`${API}/patron/devis-pro`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setDevis((d.devis || []).map(dv => ({
        id: dv.id,
        nom: `Devis ${dv.numero} — ${dv.client?.nom || 'Client'}`,
        categorie: 'Devis',
        date: dv.creeLe,
        statut: dv.statut,
        montant: dv.totalTTC,
        type: 'devis',
      }))))
      .catch(() => {})
      .finally(() => setLoadingDevis(false));
  }, [token]);

  const allDocs = [
    ...devis,
    ...BULLETINS_STATIC,
    ...CONTRATS_STATIC,
    ...QSE_STATIC,
  ];

  const filtered = allDocs.filter(d => {
    const matchCat = catFilter === 'Tous' || d.categorie === catFilter;
    const matchSearch = !search || d.nom.toLowerCase().includes(search.toLowerCase()) || (d.employe && d.employe.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  function copyLink(doc) {
    navigator.clipboard.writeText(docUrl(doc.type, doc.id));
    setCopied(doc.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function openDoc(doc) {
    window.open(docUrl(doc.type, doc.id), '_blank');
  }

  const stats = {
    total: allDocs.length,
    devis: devis.length,
    bulletins: BULLETINS_STATIC.length,
    contrats: CONTRATS_STATIC.length,
    qse: QSE_STATIC.length,
  };

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Banque de documents</h1>
        <p style={{ color: '#6E6E73', marginTop: 4, fontSize: 14 }}>Cliquez sur un document pour l'ouvrir directement dans le navigateur</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total documents', value: stats.total, color: '#007AFF' },
          { label: 'Devis',           value: stats.devis, color: '#1565C0' },
          { label: 'Bulletins paie',  value: stats.bulletins, color: '#1A7F43' },
          { label: 'Contrats',        value: stats.contrats, color: '#856404' },
          { label: 'Documents QSE',   value: stats.qse, color: '#C0392B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <IconSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8E8E93' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un document ou un employé…"
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              padding: '8px 16px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: catFilter === cat ? '#007AFF' : '#F2F2F7',
              color: catFilter === cat ? '#fff' : '#3C3C43',
              transition: 'all 0.15s',
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 160px 120px 120px 180px', gap: 0, background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
          {['Document', 'Catégorie', 'Date', 'Statut', 'Actions'].map(h => (
            <div key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>

        {loadingDevis && catFilter !== 'Devis' ? null : null}

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#8E8E93' }}>
            <IconDocument size={36} />
            <p style={{ marginTop: 12 }}>Aucun document trouvé</p>
          </div>
        ) : filtered.map((doc, i) => {
          const catStyle = CAT_COLORS[doc.categorie] || { bg: '#F2F2F7', color: '#6E6E73' };
          const CatIcon = CAT_ICONS[doc.categorie] || IconDocument;
          const link = docUrl(doc.type, doc.id);

          return (
            <div
              key={doc.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 160px 120px 120px 180px', alignItems: 'center', borderBottom: '1px solid #F2F2F7', background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0F7FF'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFAFA'}
              onClick={() => openDoc(doc)}
            >
              {/* Name */}
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: catStyle.bg, color: catStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CatIcon size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1C1C1E' }}>{doc.nom}</div>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2, fontFamily: 'monospace' }}>{link}</div>
                </div>
              </div>

              {/* Category */}
              <div style={{ padding: '14px 16px' }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: catStyle.bg, color: catStyle.color, whiteSpace: 'nowrap' }}>
                  {doc.categorie}
                </span>
              </div>

              {/* Date */}
              <div style={{ padding: '14px 16px', fontSize: 13, color: '#6E6E73' }}>{formatDate(doc.date)}</div>

              {/* Status */}
              <div style={{ padding: '14px 16px' }}>
                {doc.statut ? (
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: doc.statut === 'signé' ? '#D1F2E0' : doc.statut === 'envoyé' ? '#FFF3CD' : '#F2F2F7',
                    color: doc.statut === 'signé' ? '#1A7F43' : doc.statut === 'envoyé' ? '#856404' : '#6E6E73',
                  }}>
                    {doc.statut.charAt(0).toUpperCase() + doc.statut.slice(1)}
                  </span>
                ) : <span style={{ fontSize: 13, color: '#8E8E93' }}>—</span>}
              </div>

              {/* Actions */}
              <div style={{ padding: '14px 16px', display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => openDoc(doc)}
                  title="Ouvrir le document"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  ↗ Ouvrir
                </button>
                <button
                  onClick={() => copyLink(doc)}
                  title="Copier le lien direct"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: copied === doc.id ? '#34C759' : '#F2F2F7', color: copied === doc.id ? '#fff' : '#3C3C43', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                >
                  {copied === doc.id ? '✓ Copié' : '🔗 Lien'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div style={{ marginTop: 20, background: '#F0F7FF', border: '1px solid #007AFF30', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#1565C0' }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <span>
          Cliquez sur n'importe quel document pour l'ouvrir directement dans le navigateur.
          Utilisez <strong>🔗 Lien</strong> pour copier l'URL et la partager ou l'envoyer par email.
          Chaque page document propose aussi un bouton <strong>Télécharger PDF</strong>.
        </span>
      </div>
    </div>
  );
}
