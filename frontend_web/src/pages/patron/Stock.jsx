import React, { useState, useEffect } from 'react';
import { IconBox, IconPlus, IconX, IconAlert, IconCheck } from '../../components/ui/Icons';
import api from '../../services/api';

const CATS = ['Matériaux', 'Outillage', 'EPI / Sécurité', 'Fournitures', 'Produits chimiques', 'Équipement'];
const UNITES = ['u', 'kg', 't', 'm', 'm²', 'm³', 'L', 'sac', 'palette', 'rouleau', 'boîte'];

const ARTICLES_INIT = [
  { id: 1, ref: 'MAT-001', designation: 'Parpaings 20×20×50', categorie: 'Matériaux', quantite: 240, seuilAlerte: 50, unite: 'u', valeurUnitaire: 1.20, fournisseur: 'Point.P' },
  { id: 2, ref: 'MAT-002', designation: 'Sable fin (sac 25 kg)', categorie: 'Matériaux', quantite: 18, seuilAlerte: 20, unite: 'sac', valeurUnitaire: 6.50, fournisseur: 'Lafarge' },
  { id: 3, ref: 'MAT-003', designation: 'Ciment CEM II 32,5 R', categorie: 'Matériaux', quantite: 32, seuilAlerte: 15, unite: 'sac', valeurUnitaire: 8.20, fournisseur: 'Holcim' },
  { id: 4, ref: 'OUT-001', designation: 'Perceuse à percussion Makita', categorie: 'Outillage', quantite: 3, seuilAlerte: 1, unite: 'u', valeurUnitaire: 189.00, fournisseur: 'Makita' },
  { id: 5, ref: 'OUT-002', designation: 'Meuleuse 125 mm', categorie: 'Outillage', quantite: 2, seuilAlerte: 1, unite: 'u', valeurUnitaire: 85.00, fournisseur: 'Bosch' },
  { id: 6, ref: 'EPI-001', designation: 'Casque chantier blanc (lot 10)', categorie: 'EPI / Sécurité', quantite: 2, seuilAlerte: 1, unite: 'boîte', valeurUnitaire: 42.00, fournisseur: 'MSA' },
  { id: 7, ref: 'EPI-002', designation: 'Gants de protection T9', categorie: 'EPI / Sécurité', quantite: 45, seuilAlerte: 20, unite: 'u', valeurUnitaire: 2.80, fournisseur: 'Deltaplus' },
  { id: 8, ref: 'EPI-003', designation: 'Masques FFP2 (boîte 20)', categorie: 'EPI / Sécurité', quantite: 8, seuilAlerte: 5, unite: 'boîte', valeurUnitaire: 15.90, fournisseur: 'Moldex' },
  { id: 9, ref: 'CHI-001', designation: 'Décapant peinture (5L)', categorie: 'Produits chimiques', quantite: 4, seuilAlerte: 3, unite: 'L', valeurUnitaire: 22.50, fournisseur: 'Starwax' },
];

const ARTICLE_VIDE = { ref: '', designation: '', categorie: 'Matériaux', quantite: '', seuilAlerte: '', unite: 'u', valeurUnitaire: '', fournisseur: '' };

function formatCur(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export default function Stock() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patron/stock')
      .then(({ data }) => setArticles(data.articles || []))
      .catch(() => setArticles(ARTICLES_INIT))
      .finally(() => setLoading(false));
  }, []);

  const [modal, setModal] = useState(null); // null | 'add' | article-object
  const [form, setForm] = useState(ARTICLE_VIDE);
  const [filtreCat, setFiltreCat] = useState('Tous');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('stock'); // stock | alertes | mouvement

  const alertes = articles.filter(a => a.quantite <= a.seuilAlerte);
  const alertesCritiques = articles.filter(a => a.seuilAlerte > 0 && a.quantite <= a.seuilAlerte * 0.5);
  const valeurTotale = articles.reduce((s, a) => s + a.quantite * a.valeurUnitaire, 0);

  const filtered = articles
    .filter(a => filtreCat === 'Tous' || a.categorie === filtreCat)
    .filter(a => !search || a.designation.toLowerCase().includes(search.toLowerCase()) || a.ref.toLowerCase().includes(search.toLowerCase()));

  function openAdd() { setForm(ARTICLE_VIDE); setModal('add'); }
  function openEdit(a) { setForm({ ...a }); setModal(a); }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, quantite: Number(form.quantite), seuilAlerte: Number(form.seuilAlerte), valeurUnitaire: Number(form.valeurUnitaire) };
    try {
      if (modal === 'add') {
        const { data } = await api.post('/patron/stock', payload);
        setArticles(prev => [...prev, data.article]);
      } else {
        const { data } = await api.put(`/patron/stock/${modal.id}`, payload);
        setArticles(prev => prev.map(a => a.id === modal.id ? data.article : a));
      }
      setModal(null);
    } catch (err) {
      console.error('Erreur stock:', err);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/patron/stock/${id}`);
      setArticles(prev => prev.filter(a => a.id !== id));
      setModal(null);
    } catch (err) {
      console.error('Erreur suppression stock:', err);
    }
  }

  const f = k => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: '#8E8E93', fontSize: 14 }}>
      Chargement du stock…
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Suivi de stock</h1>
        <p style={{ color: '#6E6E73', marginTop: 4, fontSize: 14 }}>Inventaire · Alertes · Entrées & sorties</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Articles en stock', val: articles.length, color: '#5B5BD6', Icon: IconBox },
          { label: 'Alertes stock bas', val: alertes.length, color: alertes.length > 0 ? '#FF3B30' : '#34C759', Icon: IconAlert },
          { label: 'Valeur totale stock', val: formatCur(valeurTotale), color: '#34C759', Icon: IconCheck },
          { label: 'Catégories', val: CATS.length, color: '#AF52DE', Icon: IconBox },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}18`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <k.Icon size={16} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 5 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Alertes banner */}
      {alertesCritiques.length > 0 && (
        <div style={{ background: '#FFE5E5', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '13px 18px', marginBottom: 16, cursor: 'pointer' }} onClick={() => setTab('alertes')}>
          <div style={{ fontWeight: 700, color: '#C0392B', fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert size={15} /> {alertesCritiques.length} article{alertesCritiques.length > 1 ? 's' : ''} en niveau CRITIQUE — cliquez pour voir les alertes
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {alertesCritiques.map(a => (
              <span key={a.id} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: '#fff', border: '1px solid rgba(255,59,48,0.3)', color: '#C0392B', fontWeight: 600 }}>
                {a.designation} — {a.quantite} {a.unite} restant{a.quantite > 1 ? 's' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {[
          { key: 'stock', label: 'Inventaire' },
          { key: 'alertes', label: `Alertes ${alertes.length > 0 ? `(${alertes.length})` : ''}` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 18px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s', background: tab === t.key ? '#fff' : 'transparent', color: tab === t.key ? (t.key === 'alertes' && alertes.length > 0 ? '#C0392B' : '#1C1C1E') : '#6E6E73', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Alertes tab ── */}
      {tab === 'alertes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {alertes.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#8E8E93', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1C1E', marginBottom: 6 }}>Tous les stocks sont OK</div>
              <div style={{ fontSize: 14 }}>Aucun article en dessous du seuil critique défini.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#FFE5E5', borderRadius: 14, padding: '16px 20px', border: '1px solid #FF3B3030' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#C0392B' }}>{alertesCritiques.length}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#C0392B' }}>Articles critiques</div>
                  <div style={{ fontSize: 12, color: '#C0392B', opacity: 0.7, marginTop: 2 }}>Quantité ≤ 50% du seuil</div>
                </div>
                <div style={{ background: '#FFF3CD', borderRadius: 14, padding: '16px 20px', border: '1px solid #FFD60A30' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#856404' }}>{alertes.length - alertesCritiques.length}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#856404' }}>Articles stock bas</div>
                  <div style={{ fontSize: 12, color: '#856404', opacity: 0.7, marginTop: 2 }}>Quantité ≤ seuil d'alerte</div>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #F2F2F7', fontWeight: 700, fontSize: 15 }}>Articles sous le seuil d'alerte</div>
                {alertes.map(a => {
                  const critique = a.seuilAlerte > 0 && a.quantite <= a.seuilAlerte * 0.5;
                  const pct = a.seuilAlerte > 0 ? Math.min(100, Math.round(a.quantite / a.seuilAlerte * 100)) : 100;
                  return (
                    <div key={a.id} onClick={() => openEdit(a)} style={{ padding: '16px 18px', borderBottom: '1px solid #F2F2F7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: critique ? '#FFE5E5' : '#FFF3CD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {critique ? '🚨' : '⚠️'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.designation}</div>
                        <div style={{ fontSize: 12, color: '#8E8E93' }}>{a.ref} · {a.categorie} · {a.fournisseur || 'Fournisseur inconnu'}</div>
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#F2F2F7', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: critique ? '#FF3B30' : '#FF9500', transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: critique ? '#C0392B' : '#856404', whiteSpace: 'nowrap' }}>
                            {a.quantite} / {a.seuilAlerte} {a.unite}
                          </span>
                        </div>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: critique ? '#FFE5E5' : '#FFF3CD', color: critique ? '#C0392B' : '#856404', flexShrink: 0 }}>
                        {critique ? 'CRITIQUE' : 'Stock bas'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: '#EBF5FF', border: '1px solid #5B5BD630', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#5B5BD6' }}>
                Cliquez sur un article pour modifier son seuil d'alerte ou mettre à jour la quantité en stock.
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Stock tab ── */}
      {tab === 'stock' && <>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Rechercher un article…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 320, padding: '9px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 13, outline: 'none' }}
        />
        <select value={filtreCat} onChange={e => setFiltreCat(e.target.value)} style={{ padding: '9px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 13, outline: 'none' }}>
          <option value="Tous">Toutes catégories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, marginLeft: 'auto' }}>
          <IconPlus size={14} /> Ajouter un article
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
              {['Réf.', 'Désignation', 'Catégorie', 'Qté', 'Unité', 'Seuil alerte', 'Valeur unit.', 'Valeur totale', 'Fournisseur', 'Statut', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Qté' || h === 'Valeur unit.' || h === 'Valeur totale' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>Aucun article trouvé</td></tr>
            ) : filtered.map((a, i) => {
              const isAlerte = a.quantite <= a.seuilAlerte;
              return (
                <tr key={a.id} onClick={() => openEdit(a)} style={{ borderBottom: '1px solid #F8F8F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFAFA'}>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#6E6E73' }}>{a.ref}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 700 }}>{a.designation}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#F2F2F7', color: '#6E6E73' }}>{a.categorie}</span>
                  </td>
                  <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 800, fontSize: 15, color: isAlerte ? '#C0392B' : '#1C1C1E' }}>{a.quantite}</td>
                  <td style={{ padding: '11px 14px', color: '#8E8E93' }}>{a.unite}</td>
                  <td style={{ padding: '11px 14px', textAlign: 'right', color: '#8E8E93' }}>{a.seuilAlerte}</td>
                  <td style={{ padding: '11px 14px', textAlign: 'right' }}>{formatCur(a.valeurUnitaire)}</td>
                  <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700 }}>{formatCur(a.quantite * a.valeurUnitaire)}</td>
                  <td style={{ padding: '11px 14px', color: '#6E6E73', fontSize: 12 }}>{a.fournisseur || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    {isAlerte ? (
                      <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#FFE5E5', color: '#C0392B' }}>Stock bas</span>
                    ) : (
                      <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#D1F2E0', color: '#1A7F43' }}>OK</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <button onClick={e => { e.stopPropagation(); openEdit(a); }} style={{ padding: '4px 10px', border: '1px solid #E5E5EA', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#5B5BD6' }}>Modifier</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #E5E5EA', background: '#F8F9FA', fontWeight: 700 }}>
              <td colSpan={7} style={{ padding: '10px 14px', fontSize: 13 }}>VALEUR TOTALE DU STOCK</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 15, color: '#34C759' }}>{formatCur(filtered.reduce((s, a) => s + a.quantite * a.valeurUnitaire, 0))}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      </>}

      {/* Modal add/edit */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{modal === 'add' ? 'Nouvel article' : `Modifier — ${form.designation}`}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#8E8E93' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div><label style={lbl}>Référence</label><input {...f('ref')} placeholder="MAT-001" style={inp}/></div>
                <div><label style={lbl}>Désignation *</label><input {...f('designation')} required placeholder="Nom de l'article" style={inp}/></div>
                <div>
                  <label style={lbl}>Catégorie</label>
                  <select {...f('categorie')} style={inp}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Unité</label>
                  <select {...f('unite')} style={inp}>
                    {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Quantité en stock *</label><input type="number" {...f('quantite')} required min={0} placeholder="0" style={inp}/></div>
                <div><label style={lbl}>Seuil d'alerte</label><input type="number" {...f('seuilAlerte')} min={0} placeholder="5" style={inp}/></div>
                <div><label style={lbl}>Valeur unitaire (€)</label><input type="number" step="0.01" {...f('valeurUnitaire')} min={0} placeholder="0.00" style={inp}/></div>
                <div><label style={lbl}>Fournisseur</label><input {...f('fournisseur')} placeholder="Nom du fournisseur" style={inp}/></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 22, paddingTop: 16, borderTop: '1px solid #F2F2F7' }}>
                {modal !== 'add' && (
                  <button type="button" onClick={() => handleDelete(modal.id)} style={{ padding: '10px 18px', border: 'none', borderRadius: 10, background: '#FFE5E5', color: '#C0392B', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Supprimer</button>
                )}
                <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                  <button type="button" onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                  <button type="submit" style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    {modal === 'add' ? 'Créer l\'article' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
