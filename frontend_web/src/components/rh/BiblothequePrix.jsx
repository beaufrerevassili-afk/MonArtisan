import React, { useState, useMemo, useEffect } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'9px 11px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:12, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:10, fontWeight:600, color:'#555', display:'block', marginBottom:3 };
const TH = { padding:'8px 10px', fontSize:10, fontWeight:700, color:'#555', textTransform:'uppercase', borderBottom:'2px solid #E8E6E1', textAlign:'left' };
const TD = { padding:'8px 10px', fontSize:12, borderBottom:'1px solid #E8E6E1' };

const STORAGE_KEY = 'freample_biblio_prix';

const CATEGORIES = ['Maçonnerie','Plomberie','Électricité','Peinture','Carrelage','Menuiserie','Isolation','Couverture','Plâtrerie','Chauffage','Démolition','Terrassement','Main d\'œuvre','Fournitures','Transport','Autre'];
const UNITES = ['m²','ml','m³','u','h','j','kg','forfait','lot','ens.'];

const DEMO_ARTICLES = [
  { id:1, ref:'MAC-001', designation:'Parpaing 20×20×50 creux', categorie:'Maçonnerie', unite:'u', prixHT:1.45, tva:20, fournisseur:'Point P', notes:'' },
  { id:2, ref:'MAC-002', designation:'Béton prêt à l\'emploi C25/30', categorie:'Maçonnerie', unite:'m³', prixHT:95, tva:20, fournisseur:'Lafarge', notes:'Livré par toupie' },
  { id:3, ref:'MAC-003', designation:'Ciment CEM II 32.5 sac 35kg', categorie:'Maçonnerie', unite:'u', prixHT:6.80, tva:20, fournisseur:'Point P', notes:'' },
  { id:4, ref:'PLB-001', designation:'Tube cuivre Ø14 barre 5m', categorie:'Plomberie', unite:'ml', prixHT:4.20, tva:20, fournisseur:'Cedeo', notes:'' },
  { id:5, ref:'PLB-002', designation:'Mitigeur lavabo chrome', categorie:'Plomberie', unite:'u', prixHT:45, tva:20, fournisseur:'Grohe', notes:'Ref: Grohe Eurosmart' },
  { id:6, ref:'PLB-003', designation:'Chauffe-eau thermodynamique 200L', categorie:'Plomberie', unite:'u', prixHT:1250, tva:20, fournisseur:'Atlantic', notes:'Ref: Calypso 200L' },
  { id:7, ref:'ELE-001', designation:'Câble R2V 3G2.5 couronne 100m', categorie:'Électricité', unite:'ml', prixHT:1.35, tva:20, fournisseur:'Rexel', notes:'' },
  { id:8, ref:'ELE-002', designation:'Tableau électrique 2 rangées', categorie:'Électricité', unite:'u', prixHT:85, tva:20, fournisseur:'Schneider', notes:'Ref: Resi9 13 modules' },
  { id:9, ref:'ELE-003', designation:'Prise de courant 2P+T', categorie:'Électricité', unite:'u', prixHT:5.50, tva:20, fournisseur:'Legrand', notes:'Ref: Mosaic' },
  { id:10, ref:'PEI-001', designation:'Peinture acrylique blanc mat 10L', categorie:'Peinture', unite:'u', prixHT:32, tva:20, fournisseur:'Tollens', notes:'Rendement 12m²/L' },
  { id:11, ref:'PEI-002', designation:'Enduit de rebouchage 5kg', categorie:'Peinture', unite:'u', prixHT:8.50, tva:20, fournisseur:'Toupret', notes:'' },
  { id:12, ref:'CAR-001', designation:'Carrelage grès cérame 60×60', categorie:'Carrelage', unite:'m²', prixHT:28, tva:20, fournisseur:'Porcelanosa', notes:'Épaisseur 10mm' },
  { id:13, ref:'CAR-002', designation:'Colle carrelage C2 25kg', categorie:'Carrelage', unite:'u', prixHT:12, tva:20, fournisseur:'Weber', notes:'Rendement 5m²/sac' },
  { id:14, ref:'ISO-001', designation:'Laine de verre IBR 200mm rouleau', categorie:'Isolation', unite:'m²', prixHT:8.50, tva:5.5, fournisseur:'Isover', notes:'R=5 · TVA réduite rénovation' },
  { id:15, ref:'MO-001', designation:'Main d\'œuvre maçon qualifié', categorie:'Main d\'œuvre', unite:'h', prixHT:42, tva:20, fournisseur:'Interne', notes:'Coût horaire chargé' },
  { id:16, ref:'MO-002', designation:'Main d\'œuvre électricien', categorie:'Main d\'œuvre', unite:'h', prixHT:45, tva:20, fournisseur:'Interne', notes:'Coût horaire chargé' },
  { id:17, ref:'MO-003', designation:'Main d\'œuvre peintre', categorie:'Main d\'œuvre', unite:'h', prixHT:38, tva:20, fournisseur:'Interne', notes:'Coût horaire chargé' },
  { id:18, ref:'MO-004', designation:'Main d\'œuvre plombier', categorie:'Main d\'œuvre', unite:'h', prixHT:45, tva:20, fournisseur:'Interne', notes:'Coût horaire chargé' },
  { id:19, ref:'TRA-001', designation:'Location benne 8m³ évacuation', categorie:'Transport', unite:'u', prixHT:280, tva:20, fournisseur:'Nicollin', notes:'Inclut enlèvement' },
  { id:20, ref:'DEM-001', designation:'Démolition cloison plâtre', categorie:'Démolition', unite:'m²', prixHT:18, tva:20, fournisseur:'Interne', notes:'Fourniture + main d\'œuvre' },
];

function loadData() { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : DEMO_ARTICLES; } catch { return DEMO_ARTICLES; } }
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

export default function BiblothequePrix() {
  const [articles, setArticles] = useState(loadData);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  useEffect(() => { saveData(articles); }, [articles]);

  const filtered = useMemo(() => {
    let list = articles;
    if (filterCat) list = list.filter(a => a.categorie === filterCat);
    if (search) { const s = search.toLowerCase(); list = list.filter(a => (a.designation + ' ' + a.ref + ' ' + a.fournisseur + ' ' + a.notes).toLowerCase().includes(s)); }
    return list.sort((a, b) => a.categorie.localeCompare(b.categorie) || a.designation.localeCompare(b.designation));
  }, [articles, search, filterCat]);

  const catStats = useMemo(() => {
    const stats = {};
    articles.forEach(a => { if (!stats[a.categorie]) stats[a.categorie] = { count: 0, total: 0 }; stats[a.categorie].count++; stats[a.categorie].total += a.prixHT; });
    return stats;
  }, [articles]);

  const nextRef = () => {
    const cat = (form.categorie || 'AUT').slice(0, 3).toUpperCase();
    const existing = articles.filter(a => a.ref?.startsWith(cat));
    return `${cat}-${String(existing.length + 1).padStart(3, '0')}`;
  };

  const sauvegarder = () => {
    if (editId) {
      setArticles(prev => prev.map(a => a.id === editId ? { ...a, ref: form.ref || a.ref, designation: form.designation || a.designation, categorie: form.categorie || a.categorie, unite: form.unite || a.unite, prixHT: Number(form.prixHT) || a.prixHT, tva: Number(form.tva) || a.tva, fournisseur: form.fournisseur || a.fournisseur, notes: form.notes || '' } : a));
    } else {
      const article = { id: Date.now(), ref: form.ref || nextRef(), designation: form.designation || '', categorie: form.categorie || 'Autre', unite: form.unite || 'u', prixHT: Number(form.prixHT) || 0, tva: Number(form.tva) || 20, fournisseur: form.fournisseur || '', notes: form.notes || '' };
      setArticles(prev => [article, ...prev]);
    }
    setModal(null); setForm({}); setEditId(null);
  };

  const supprimer = (id) => { setArticles(prev => prev.filter(a => a.id !== id)); };

  const dupliquer = (a) => { setArticles(prev => [{ ...a, id: Date.now(), ref: a.ref + '-copie' }, ...prev]); };

  const exportCSV = () => {
    const rows = [['Réf', 'Désignation', 'Catégorie', 'Unité', 'Prix HT', 'TVA %', 'Prix TTC', 'Fournisseur', 'Notes']];
    articles.forEach(a => rows.push([a.ref, a.designation, a.categorie, a.unite, a.prixHT, a.tva, (a.prixHT * (1 + a.tva / 100)).toFixed(2), a.fournisseur, a.notes]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bibliotheque_prix.csv'; a.click();
  };

  const importCSV = () => { alert('Import CSV : en production, ouvrirait un sélecteur de fichier pour importer des prix depuis un fichier CSV ou Excel.'); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Bibliothèque de prix</h2>
          <p style={{ fontSize: 12, color: '#555', margin: '2px 0 0' }}>{articles.length} articles · Vos prix personnalisés pour vos devis</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={importCSV} style={BTN_O}>Importer CSV</button>
          <button onClick={exportCSV} style={BTN_O}>Exporter</button>
          <button onClick={() => { setForm({ categorie: 'Maçonnerie', unite: 'u', tva: '20' }); setEditId(null); setModal('add'); }} style={BTN}>+ Ajouter un article</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Articles', v: articles.length, c: '#2563EB' },
          { l: 'Catégories', v: Object.keys(catStats).length, c: DS.gold },
          { l: 'Fournisseurs', v: [...new Set(articles.map(a => a.fournisseur).filter(Boolean))].length, c: '#16A34A' },
          { l: 'Prix moyen HT', v: `${articles.length > 0 ? Math.round(articles.reduce((s, a) => s + a.prixHT, 0) / articles.length) : 0}€`, c: '#D97706' },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 24, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Recherche + Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par désignation, réf, fournisseur..." style={{ ...INP, flex: 1 }} />
        {search && <button onClick={() => setSearch('')} style={BTN_O}>Effacer</button>}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap', overflowX: 'auto' }}>
        <button onClick={() => setFilterCat('')} style={!filterCat ? { ...BTN, fontSize: 10, padding: '4px 10px' } : { ...BTN_O, fontSize: 10, padding: '4px 10px' }}>Tous ({articles.length})</button>
        {CATEGORIES.filter(c => catStats[c]).map(c => (
          <button key={c} onClick={() => setFilterCat(filterCat === c ? '' : c)} style={filterCat === c ? { ...BTN, fontSize: 10, padding: '4px 10px' } : { ...BTN_O, fontSize: 10, padding: '4px 10px' }}>{c} ({catStats[c]?.count || 0})</button>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ ...CARD, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F2F2F7' }}>
              <th style={TH}>Réf</th>
              <th style={{ ...TH, width: '30%' }}>Désignation</th>
              <th style={TH}>Catégorie</th>
              <th style={TH}>Unité</th>
              <th style={{ ...TH, textAlign: 'right' }}>Prix HT</th>
              <th style={{ ...TH, textAlign: 'right' }}>TVA</th>
              <th style={{ ...TH, textAlign: 'right' }}>Prix TTC</th>
              <th style={TH}>Fournisseur</th>
              <th style={{ ...TH, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...TD, fontWeight: 700, color: '#2563EB', fontSize: 11 }}>{a.ref}</td>
                <td style={{ ...TD, fontWeight: 500 }}>{a.designation}{a.notes && <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>{a.notes}</div>}</td>
                <td style={{ ...TD, fontSize: 11 }}>{a.categorie}</td>
                <td style={{ ...TD, fontSize: 11, textAlign: 'center' }}>{a.unite}</td>
                <td style={{ ...TD, textAlign: 'right', fontWeight: 600 }}>{a.prixHT.toFixed(2)}€</td>
                <td style={{ ...TD, textAlign: 'right', fontSize: 11, color: '#555' }}>{a.tva}%</td>
                <td style={{ ...TD, textAlign: 'right', fontWeight: 700, color: DS.gold }}>{(a.prixHT * (1 + a.tva / 100)).toFixed(2)}€</td>
                <td style={{ ...TD, fontSize: 11, color: '#555' }}>{a.fournisseur}</td>
                <td style={{ ...TD, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                    <button onClick={() => { setForm({ ...a, prixHT: String(a.prixHT), tva: String(a.tva) }); setEditId(a.id); setModal('add'); }} style={{ fontSize: 9, padding: '2px 6px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Modifier</button>
                    <button onClick={() => dupliquer(a)} style={{ fontSize: 9, padding: '2px 6px', background: '#E8E6E1', color: '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Dupliquer</button>
                    <button onClick={() => supprimer(a.id)} style={{ fontSize: 9, padding: '2px 6px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, cursor: 'pointer' }}>×</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>Aucun article trouvé</div>}
      </div>

      {/* Info */}
      <div style={{ ...CARD, marginTop: 16, borderLeft: '4px solid #2563EB', padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>Vos prix, vos devis</div>
        <div style={{ fontSize: 11, color: '#555' }}>Cette bibliothèque vous appartient. Ajoutez vos prix réels (matériaux, main d'œuvre, location) pour les réutiliser dans vos devis. Les prix sont sauvegardés localement. Exportez en CSV pour les partager.</div>
      </div>

      {/* Modal ajout/modification */}
      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => { setModal(null); setEditId(null); }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>{editId ? 'Modifier l\'article' : 'Nouvel article'}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Référence</label><input value={form.ref || ''} onChange={e => setForm(f => ({ ...f, ref: e.target.value }))} placeholder={nextRef()} style={INP} /></div>
              <div><label style={LBL}>Désignation *</label><input value={form.designation || ''} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} style={INP} placeholder="Parpaing 20×20×50 creux" /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Catégorie</label><select value={form.categorie || 'Maçonnerie'} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={INP}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label style={LBL}>Unité</label><select value={form.unite || 'u'} onChange={e => setForm(f => ({ ...f, unite: e.target.value }))} style={INP}>{UNITES.map(u => <option key={u}>{u}</option>)}</select></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Prix HT (€) *</label><input type="number" step="0.01" value={form.prixHT || ''} onChange={e => setForm(f => ({ ...f, prixHT: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>TVA (%)</label><select value={form.tva || '20'} onChange={e => setForm(f => ({ ...f, tva: e.target.value }))} style={INP}><option value="20">20%</option><option value="10">10% (rénovation)</option><option value="5.5">5,5% (énergie)</option><option value="0">0%</option></select></div>
              <div><label style={LBL}>Prix TTC</label><div style={{ padding: '9px 11px', background: '#F8F7F4', borderRadius: 8, fontSize: 12, fontWeight: 700, color: DS.gold }}>{(Number(form.prixHT || 0) * (1 + Number(form.tva || 20) / 100)).toFixed(2)} €</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div><label style={LBL}>Fournisseur</label><input value={form.fournisseur || ''} onChange={e => setForm(f => ({ ...f, fournisseur: e.target.value }))} style={INP} placeholder="Point P, Rexel..." /></div>
              <div><label style={LBL}>Notes</label><input value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={INP} placeholder="Ref fabricant, remarques..." /></div>
            </div>

            <button onClick={sauvegarder} style={{ ...BTN, width: '100%', padding: 12 }}>{editId ? 'Enregistrer' : 'Ajouter'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
