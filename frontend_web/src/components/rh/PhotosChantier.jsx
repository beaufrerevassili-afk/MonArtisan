import React, { useState, useRef } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };

const DEMO_PHOTOS = [
  { id:1, chantier:'Rénovation Dupont', date:'2026-04-01', auteur:'Jean Martin', categorie:'Avant travaux', commentaire:'État initial cuisine avant démolition', url:null },
  { id:2, chantier:'Rénovation Dupont', date:'2026-04-03', auteur:'Jean Martin', categorie:'En cours', commentaire:'Démolition terminée, évacuation gravats', url:null },
  { id:3, chantier:'Rénovation Dupont', date:'2026-04-05', auteur:'Sophie Duval', categorie:'En cours', commentaire:'Plomberie + électricité en cours', url:null },
  { id:4, chantier:'Bureau Médecin', date:'2026-04-02', auteur:'Sophie Duval', categorie:'Avant travaux', commentaire:'Tableau électrique existant', url:null },
  { id:5, chantier:'Bureau Médecin', date:'2026-04-04', auteur:'Sophie Duval', categorie:'En cours', commentaire:'Nouveau tableau posé, câblage en cours', url:null },
  { id:6, chantier:'Peinture Pastorelli', date:'2026-04-01', auteur:'Lucas Garcia', categorie:'Avant travaux', commentaire:'Murs à peindre, état initial', url:null },
  { id:7, chantier:'Peinture Pastorelli', date:'2026-04-06', auteur:'Lucas Garcia', categorie:'Après travaux', commentaire:'Peinture terminée, 2 couches', url:null },
];

const CATEGORIES = ['Toutes', 'Avant travaux', 'En cours', 'Après travaux', 'Problème', 'Réception'];
const CHANTIERS_LIST = ['Tous', 'Rénovation Dupont', 'Bureau Médecin', 'Peinture Pastorelli'];

export default function PhotosChantier() {
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [filterCat, setFilterCat] = useState('Toutes');
  const [filterChantier, setFilterChantier] = useState('Tous');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const fileRef = useRef(null);

  const filtered = photos.filter(p => {
    if (filterCat !== 'Toutes' && p.categorie !== filterCat) return false;
    if (filterChantier !== 'Tous' && p.chantier !== filterChantier) return false;
    return true;
  });

  const ajouterPhoto = () => {
    const photo = {
      id: Date.now(),
      chantier: form.chantier || 'Rénovation Dupont',
      date: new Date().toISOString().slice(0, 10),
      auteur: form.auteur || 'Vassili B.',
      categorie: form.categorie || 'En cours',
      commentaire: form.commentaire || '',
      url: form.url || null,
    };
    setPhotos(prev => [photo, ...prev]);
    setModal(null); setForm({});
  };

  const chantiersGroupes = {};
  filtered.forEach(p => {
    if (!chantiersGroupes[p.chantier]) chantiersGroupes[p.chantier] = [];
    chantiersGroupes[p.chantier].push(p);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Photos chantier</h2>
          <p style={{ fontSize: 12, color: '#555', margin: '2px 0 0' }}>{photos.length} photos · {Object.keys(chantiersGroupes).length} chantiers</p>
        </div>
        <button onClick={() => { setForm({ categorie: 'En cours' }); setModal('add'); }} style={BTN}>+ Ajouter une photo</button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={filterCat === c ? BTN : BTN_O}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {CHANTIERS_LIST.map(c => (
          <button key={c} onClick={() => setFilterChantier(c)} style={{ ...BTN_O, fontSize: 11, padding: '4px 12px', background: filterChantier === c ? '#EFF6FF' : 'transparent', borderColor: filterChantier === c ? '#2563EB' : '#E8E6E1', color: filterChantier === c ? '#2563EB' : '#555' }}>{c}</button>
        ))}
      </div>

      {/* Galerie par chantier */}
      {Object.entries(chantiersGroupes).map(([chantier, phts]) => (
        <div key={chantier} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{chantier}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#555', background: '#F2F2F7', padding: '2px 8px', borderRadius: 6 }}>{phts.length} photos</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {phts.map(p => (
              <div key={p.id} style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
                {/* Placeholder photo */}
                <div style={{ height: 140, background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {p.url ? (
                    <img src={p.url} alt={p.commentaire} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#999' }}>
                      <div style={{ fontSize: 32, marginBottom: 4 }}>📷</div>
                      <div style={{ fontSize: 10 }}>Photo à uploader</div>
                    </div>
                  )}
                  <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, fontWeight: 700, color: '#fff', background: p.categorie === 'Avant travaux' ? '#D97706' : p.categorie === 'En cours' ? '#2563EB' : p.categorie === 'Après travaux' ? '#16A34A' : '#DC2626', padding: '2px 8px', borderRadius: 4 }}>{p.categorie}</span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{p.commentaire || '—'}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>{p.auteur} · {p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', color: '#555', padding: 40 }}>
          Aucune photo. Cliquez "+ Ajouter une photo" pour commencer le suivi visuel.
        </div>
      )}

      {/* Modal ajout */}
      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Ajouter une photo</h3>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 3 }}>Chantier</label>
              <select value={form.chantier || ''} onChange={e => setForm(f => ({ ...f, chantier: e.target.value }))} style={{ width: '100%', padding: '9px 11px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontFamily: DS.font }}>
                <option value="">— Sélectionner —</option>
                {CHANTIERS_LIST.filter(c => c !== 'Tous').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 3 }}>Catégorie</label>
              <select value={form.categorie || 'En cours'} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={{ width: '100%', padding: '9px 11px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontFamily: DS.font }}>
                {CATEGORIES.filter(c => c !== 'Toutes').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 3 }}>Commentaire</label>
              <input value={form.commentaire || ''} onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))} placeholder="Description de la photo" style={{ width: '100%', padding: '9px 11px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 3 }}>Photo</label>
              <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #E8E6E1', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 24, marginBottom: 4, opacity: 0.3 }}>📷</div>
                <div style={{ fontSize: 11, color: '#555' }}>Cliquez ou glissez une photo</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>JPG, PNG — max 10 Mo</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setForm(f => ({ ...f, url }));
                }
              }} />
              {form.url && <div style={{ marginTop: 8, fontSize: 10, color: '#16A34A' }}>Photo sélectionnée</div>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#555', display: 'block', marginBottom: 3 }}>Auteur</label>
              <input value={form.auteur || 'Vassili B.'} onChange={e => setForm(f => ({ ...f, auteur: e.target.value }))} style={{ width: '100%', padding: '9px 11px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 12, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <button onClick={ajouterPhoto} style={{ ...BTN, width: '100%', padding: 12 }}>Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}
