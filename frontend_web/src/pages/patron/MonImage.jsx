import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import DS from '../../design/luxe';
import { isDemo as _isDemo } from '../../utils/storage';
import { IconStar, IconPhoto, IconCheck } from '../../components/ui/Icons';

const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: 24, marginBottom: 20 };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };
const BTN_O = { ...BTN, background: 'transparent', color: '#1C1C1E', border: '1px solid #E8E6E1' };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' };
const LBL = { fontSize: 11, fontWeight: 700, color: '#636363', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };
const CERTIFS_OPTIONS = ['Qualibat', 'RGE', 'Qualifelec', 'OPQIBI', 'Decennale', 'RC Pro', 'Garantie biennale', 'ISO 9001'];

function resizeImage(file, maxW = 400, maxH = 300) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxW) { h *= maxW / w; w = maxW; }
        if (h > maxH) { w *= maxH / h; h = maxH; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function Stars({ note, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(note) ? '#F5A623' : '#E0DDD6', fontSize: size }}>&#9733;</span>
      ))}
    </span>
  );
}

export default function MonImage() {
  const isDemo = _isDemo();
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apercu, setApercu] = useState(false);

  // Profile fields
  const [photos, setPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [specialites, setSpecialites] = useState('');
  const [zone, setZone] = useState('');
  const [anneeCreation, setAnneeCreation] = useState('');
  const [effectif, setEffectif] = useState('');
  const [certifications, setCertifications] = useState([]);

  // Avis
  const [avis, setAvis] = useState([]);
  const [repondreId, setRepondreId] = useState(null);
  const [reponseText, setReponseText] = useState('');
  const [repondreLoading, setRepondreLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.get('/patron/mon-image');
      const d = res.data || res;
      setPhotos(d.photos || []);
      setDescription(d.description || '');
      setSpecialites(Array.isArray(d.specialites) ? d.specialites.join(', ') : (d.specialites || ''));
      setZone(d.zone || '');
      setAnneeCreation(d.annee_creation || '');
      setEffectif(d.effectif || '');
      setCertifications(d.certifications || []);
      setAvis(d.avis || []);
    } catch (e) {
      // Demo mode fallback
      if (isDemo) {
        setPhotos([]);
        setDescription('');
        setSpecialites('');
        setZone('');
        setAnneeCreation('');
        setEffectif('');
        setCertifications([]);
        setAvis([
          { id: 1, note: 5, client_nom: 'Marie D.', commentaire: 'Excellent travail, equipe tres professionnelle.', date: '2026-03-15', reponse: null },
          { id: 2, note: 4, client_nom: 'Pierre L.', commentaire: 'Bon travail dans l\'ensemble, delai un peu long.', date: '2026-02-20', reponse: 'Merci Pierre, nous travaillons a ameliorer nos delais.' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/patron/mon-image', {
        photos,
        description,
        specialites: specialites.split(',').map(s => s.trim()).filter(Boolean),
        zone,
        annee_creation: anneeCreation,
        effectif,
        certifications,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      if (isDemo) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 6 - photos.length;
    const toProcess = files.slice(0, remaining);
    const resized = await Promise.all(toProcess.map(f => resizeImage(f)));
    setPhotos(prev => [...prev, ...resized].slice(0, 6));
    if (fileRef.current) fileRef.current.value = '';
  }

  function removePhoto(idx) {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  }

  function toggleCertif(c) {
    setCertifications(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  }

  async function handleRepondre(avisId) {
    if (!reponseText.trim()) return;
    setRepondreLoading(true);
    try {
      await api.put(`/patron/avis-client/${avisId}/repondre`, { reponse: reponseText.trim() });
      setAvis(prev => prev.map(a => a.id === avisId ? { ...a, reponse: reponseText.trim() } : a));
      setRepondreId(null);
      setReponseText('');
    } catch (e) {
      if (isDemo) {
        setAvis(prev => prev.map(a => a.id === avisId ? { ...a, reponse: reponseText.trim() } : a));
        setRepondreId(null);
        setReponseText('');
      }
    } finally {
      setRepondreLoading(false);
    }
  }

  const noteMoyenne = avis.length > 0
    ? (avis.reduce((sum, a) => sum + (a.note || 0), 0) / avis.length).toFixed(1)
    : null;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #E8E6E1', borderTopColor: '#A68B4B', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Apercu mode ──
  if (apercu) return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Apercu client</h1>
        <button onClick={() => setApercu(false)} style={BTN_O}>Retour edition</button>
      </div>
      <div style={CARD}>
        {photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt={`Realisation ${i + 1}`} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        )}
        {description && <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, marginBottom: 12 }}>{description}</p>}
        {specialites && (
          <div style={{ marginBottom: 12 }}>
            <span style={{ ...LBL, marginBottom: 6 }}>Specialites</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {specialites.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} style={{ padding: '4px 10px', background: '#F5F2EC', borderRadius: 20, fontSize: 12, color: '#2C2520' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 13, color: '#555', marginBottom: 12 }}>
          {zone && <span>Zone : {zone}</span>}
          {anneeCreation && <span>Depuis {anneeCreation}</span>}
          {effectif && <span>Effectif : {effectif}</span>}
        </div>
        {certifications.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {certifications.map((c, i) => (
              <span key={i} style={{ padding: '4px 10px', background: '#E8F5E9', borderRadius: 20, fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>
                <IconCheck size={11} /> {c}
              </span>
            ))}
          </div>
        )}
        {noteMoyenne && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <Stars note={parseFloat(noteMoyenne)} size={18} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{noteMoyenne}/5</span>
            <span style={{ fontSize: 12, color: '#888' }}>({avis.length} avis)</span>
          </div>
        )}
      </div>
      {avis.length > 0 && (
        <div style={CARD}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Avis clients</h3>
          {avis.map(a => (
            <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #F0EDE8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Stars note={a.note} size={14} />
                <strong style={{ fontSize: 13 }}>{a.client_nom}</strong>
                <span style={{ fontSize: 11, color: '#999' }}>{a.date}</span>
              </div>
              <p style={{ fontSize: 13, color: '#444', margin: '4px 0 0' }}>{a.commentaire}</p>
              {a.reponse && (
                <div style={{ marginTop: 8, marginLeft: 16, padding: '8px 12px', background: '#F9F7F3', borderRadius: 8, borderLeft: '3px solid #A68B4B' }}>
                  <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Votre reponse :</span>
                  <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>{a.reponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Edition mode ──
  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Mon image</h1>
          <p style={{ marginTop: 4, color: '#6E6E73', fontSize: 13 }}>Personnalisez votre profil public visible par les clients.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setApercu(true)} style={BTN_O}>Apercu</button>
          <button onClick={handleSave} disabled={saving} style={{ ...BTN, background: saved ? '#16a34a' : '#2C2520', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegarde !' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* ── Section 1: Photos ── */}
      <div style={CARD}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Photos</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px' }}>Photos de vos realisations, equipe, materiel (max 6)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 8 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={p} alt={`Photo ${i + 1}`} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #E8E6E1' }} />
              <button
                onClick={() => removePhoto(i)}
                style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >&#10005;</button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{ height: 90, border: '2px dashed #D4D0C8', borderRadius: 8, background: '#FAFAF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888', fontSize: 12, gap: 4 }}
            >
              <IconPhoto size={20} color="#aaa" />
              <span>Ajouter</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* ── Section 2: Description & specialites ── */}
      <div style={CARD}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Description & specialites</h3>

        <label style={LBL}>Description de votre entreprise</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value.slice(0, 500))}
          maxLength={500}
          rows={4}
          placeholder="Presentez votre entreprise, votre savoir-faire, vos valeurs..."
          style={{ ...INP, resize: 'vertical', marginBottom: 4 }}
        />
        <div style={{ fontSize: 11, color: '#999', textAlign: 'right', marginBottom: 12 }}>{description.length}/500</div>

        <label style={LBL}>Specialites (separees par des virgules)</label>
        <input
          value={specialites}
          onChange={e => setSpecialites(e.target.value)}
          placeholder="Plomberie, Chauffage, Climatisation..."
          style={{ ...INP, marginBottom: 12 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={LBL}>Zone d'intervention</label>
            <input value={zone} onChange={e => setZone(e.target.value)} placeholder="Marseille, 30km" style={INP} />
          </div>
          <div>
            <label style={LBL}>Annee de creation</label>
            <input value={anneeCreation} onChange={e => setAnneeCreation(e.target.value)} placeholder="2015" style={INP} />
          </div>
          <div>
            <label style={LBL}>Effectif</label>
            <input value={effectif} onChange={e => setEffectif(e.target.value)} placeholder="8 personnes" style={INP} />
          </div>
        </div>
      </div>

      {/* ── Section 3: Certifications ── */}
      <div style={CARD}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Certifications & assurances</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {CERTIFS_OPTIONS.map(c => {
            const checked = certifications.includes(c);
            return (
              <label
                key={c}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  border: checked ? '1.5px solid #A68B4B' : '1px solid #E8E6E1',
                  background: checked ? '#FAF7F0' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCertif(c)}
                  style={{ accentColor: '#A68B4B' }}
                />
                <span style={{ fontWeight: checked ? 600 : 400, color: checked ? '#2C2520' : '#555' }}>{c}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Section 4: Avis clients (READ ONLY) ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Avis clients</h3>
          {noteMoyenne && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stars note={parseFloat(noteMoyenne)} size={16} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{noteMoyenne}/5</span>
              <span style={{ fontSize: 12, color: '#888' }}>({avis.length} avis)</span>
            </div>
          )}
        </div>

        {avis.length === 0 && (
          <p style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: '20px 0' }}>Aucun avis pour le moment.</p>
        )}

        {avis.map(a => (
          <div key={a.id} style={{ padding: '14px 0', borderBottom: '1px solid #F0EDE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Stars note={a.note} size={14} />
              <strong style={{ fontSize: 13 }}>{a.client_nom}</strong>
              <span style={{ fontSize: 11, color: '#999' }}>{a.date}</span>
            </div>
            <p style={{ fontSize: 13, color: '#444', margin: '4px 0 0', lineHeight: 1.5 }}>{a.commentaire}</p>

            {a.reponse && (
              <div style={{ marginTop: 8, marginLeft: 16, padding: '8px 12px', background: '#F9F7F3', borderRadius: 8, borderLeft: '3px solid #A68B4B' }}>
                <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Votre reponse :</span>
                <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>{a.reponse}</p>
              </div>
            )}

            {!a.reponse && repondreId !== a.id && (
              <button
                onClick={() => { setRepondreId(a.id); setReponseText(''); }}
                style={{ marginTop: 8, padding: '6px 14px', background: 'transparent', border: '1px solid #D4D0C8', borderRadius: 8, fontSize: 12, color: '#555', cursor: 'pointer', fontFamily: DS.font }}
              >
                Repondre
              </button>
            )}

            {repondreId === a.id && (
              <div style={{ marginTop: 8 }}>
                <textarea
                  value={reponseText}
                  onChange={e => setReponseText(e.target.value)}
                  rows={3}
                  placeholder="Votre reponse..."
                  style={{ ...INP, resize: 'vertical', marginBottom: 8 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleRepondre(a.id)}
                    disabled={repondreLoading || !reponseText.trim()}
                    style={{ ...BTN, fontSize: 12, padding: '6px 14px', opacity: repondreLoading ? 0.6 : 1 }}
                  >
                    {repondreLoading ? 'Envoi...' : 'Envoyer'}
                  </button>
                  <button
                    onClick={() => { setRepondreId(null); setReponseText(''); }}
                    style={{ ...BTN_O, fontSize: 12, padding: '6px 14px' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
