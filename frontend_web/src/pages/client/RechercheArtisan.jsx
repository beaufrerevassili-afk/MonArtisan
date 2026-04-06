import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/api';

const METIERS = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture',
  'Maçonnerie', 'Chauffage', 'Serrurerie', 'Couverture', 'Isolation',
  'Climatisation', 'Charpente', 'Vitrier', 'Jardinage',
];

// Données démo utilisées quand le backend n'est pas dispo
const ARTISANS_DEMO = [
  { id: 1, nom: 'Eric Leroy',      specialite: 'Électricité', ville: 'Paris 11e',  note: 4.9, nbAvis: 87, disponible: true,  verifie: true,  tarif: '55–90 €/h', description: 'Électricien certifié RGE, spécialisé dans les installations résidentielles et tertiaires. Devis gratuit sous 24h.' },
  { id: 2, nom: 'Carlos Garcia',   specialite: 'Plomberie',   ville: 'Paris 15e',  note: 4.7, nbAvis: 54, disponible: true,  verifie: true,  tarif: '60–95 €/h', description: 'Plombier chauffagiste avec 12 ans d\'expérience. Urgences acceptées. Interventions 7j/7.' },
  { id: 3, nom: 'Sophie Martin',   specialite: 'Peinture',    ville: 'Levallois',  note: 5.0, nbAvis: 31, disponible: false, verifie: true,  tarif: '40–60 €/h', description: 'Peintre décorateur intérieur/extérieur. Finitions soignées garanties. Spécialiste enduits décoratifs.' },
  { id: 4, nom: 'Jean-Paul Moreau',specialite: 'Menuiserie',  ville: 'Paris 18e',  note: 4.8, nbAvis: 62, disponible: true,  verifie: true,  tarif: '65–100 €/h', description: 'Menuisier ébéniste. Fabrication sur mesure, pose fenêtres, portes, parquets. Certifié RGE.' },
  { id: 5, nom: 'Antoine Bernard', specialite: 'Maçonnerie',  ville: 'Vincennes',  note: 4.6, nbAvis: 43, disponible: true,  verifie: true,  tarif: '50–80 €/h', description: 'Maçon gros œuvre et rénovation. Extension, fondations, ravalement. Devis sous 48h.' },
  { id: 6, nom: 'Isabelle Roy',    specialite: 'Carrelage',   ville: 'Montreuil',  note: 4.8, nbAvis: 29, disponible: true,  verifie: false, tarif: '45–70 €/h', description: 'Carreleur faïencier. Pose de tous types de revêtements. Travail soigné et propre.' },
  { id: 7, nom: 'Marc Dupont',     specialite: 'Chauffage',   ville: 'Paris 13e',  note: 4.5, nbAvis: 38, disponible: false, verifie: true,  tarif: '70–110 €/h', description: 'Chauffagiste RGE. Installation et maintenance chaudières, pompes à chaleur, plancher chauffant.' },
  { id: 8, nom: 'Lucie Petit',     specialite: 'Isolation',   ville: 'Boulogne',   note: 4.9, nbAvis: 19, disponible: true,  verifie: true,  tarif: '50–75 €/h', description: 'Spécialiste isolation thermique et phonique. Aide aux aides MaPrimeRénov\' et CEE.' },
];

const COULEURS = ['#5B5BD6', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FF2D55', '#30B0C7'];

function Stars({ note, size = 12 }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(note) ? '#FF9500' : 'none'}
          stroke={s <= Math.round(note) ? '#FF9500' : 'var(--border)'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function ArtisanCard({ artisan, onDevis }) {
  const initials = artisan.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const couleur  = COULEURS[artisan.id % COULEURS.length];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card"
      style={{
        padding: 20,
        cursor: 'default',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : undefined,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: couleur, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1rem',
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>{artisan.nom}</span>
                {artisan.verifie && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(0,122,255,0.08)', color: 'var(--primary)', border: '1px solid rgba(0,122,255,0.2)', borderRadius: 20, padding: '1px 7px', fontSize: '0.625rem', fontWeight: 600 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Vérifié
                  </span>
                )}
                {artisan.disponible ? (
                  <span style={{ background: 'rgba(52,199,89,0.1)', color: '#1A7A3C', border: '1px solid rgba(52,199,89,0.2)', borderRadius: 20, padding: '1px 7px', fontSize: '0.625rem', fontWeight: 600 }}>Disponible</span>
                ) : (
                  <span style={{ background: 'var(--bg)', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 20, padding: '1px 7px', fontSize: '0.625rem', fontWeight: 600 }}>Occupé</span>
                )}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{artisan.specialite} · {artisan.ville}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                <Stars note={artisan.note} size={11} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)' }}>{artisan.note.toFixed(1)}</span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 1 }}>{artisan.nbAvis} avis</p>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.5 }}>
            {artisan.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              💰 {artisan.tarif}
            </span>
            <button
              className="btn-primary"
              style={{ fontSize: '0.8125rem', padding: '7px 16px' }}
              aria-label={`Demander un devis à ${artisan.nom}`}
              onClick={() => onDevis(artisan)}
            >
              Demander un devis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalDevis({ artisan, onClose, onSubmit }) {
  const [form, setForm] = useState({ description: '', adresse: '', urgence: false, disponibilite: '' });
  const [sent, setSent] = useState(false);

  function handleSend() {
    onSubmit({ artisanId: artisan.id, artisanNom: artisan.nom, ...form, sentAt: new Date().toISOString() });
    setSent(true);
  }

  if (sent) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,199,89,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Demande envoyée !</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          {artisan.nom} recevra votre demande de devis et vous contactera sous 24h.
        </p>
        <button className="btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }} onClick={onClose}>Fermer</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Demande de devis</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          {artisan.nom} · {artisan.specialite}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Description des travaux <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              className="input"
              rows={4}
              placeholder="Décrivez précisément les travaux à réaliser, la superficie, l'état actuel..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div>
            <label className="label">Adresse des travaux <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="input" placeholder="Numéro, rue, ville" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
          </div>
          <div>
            <label className="label">Disponibilités préférées</label>
            <select className="select" value={form.disponibilite} onChange={e => setForm(f => ({ ...f, disponibilite: e.target.value }))}>
              <option value="">Pas de préférence</option>
              <option value="matin">Matins</option>
              <option value="apres-midi">Après-midis</option>
              <option value="weekend">Week-end</option>
              <option value="semaine">En semaine uniquement</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={form.urgence} onChange={e => setForm(f => ({ ...f, urgence: e.target.checked }))} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Intervention urgente (sous 24–48h)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
          <button
            className="btn-primary"
            style={{ flex: 2 }}
            disabled={!form.description.trim() || !form.adresse.trim()}
            onClick={handleSend}
          >
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RechercheArtisan() {
  const { token } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [apiOk,   setApiOk]     = useState(false);
  const [filtre, setFiltre] = useState({ metier: '', ville: '', noteMin: 0, dispo: false, verifie: false });
  const [modal, setModal]  = useState(null);
  const [demandesSent, setDemandesSent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('client_demandes_devis')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtre.metier) params.set('metier', filtre.metier);
    if (filtre.ville)  params.set('ville',  filtre.ville);
    if (filtre.noteMin > 0) params.set('note_min', filtre.noteMin);
    if (filtre.dispo)  params.set('disponible', 'true');

    fetch(`${API_URL}/artisans?${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.artisans?.length) {
          setArtisans(data.artisans);
          setApiOk(true);
        } else {
          setArtisans(ARTISANS_DEMO);
          setApiOk(false);
        }
      })
      .catch(() => { setArtisans(ARTISANS_DEMO); setApiOk(false); })
      .finally(() => setLoading(false));
  }, [filtre.metier, filtre.dispo, filtre.noteMin]);

  function handleSubmitDevis(demande) {
    const updated = [...demandesSent, demande];
    setDemandesSent(updated);
    localStorage.setItem('client_demandes_devis', JSON.stringify(updated));
    // Tenter d'envoyer à l'API
    if (token) {
      fetch(`${API_URL}/client/demandes-devis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(demande),
      }).catch(() => {});
    }
  }

  // Filtre local note + vérifié
  const artisansFiltres = artisans.filter(a => {
    if (filtre.noteMin > 0 && a.note < filtre.noteMin) return false;
    if (filtre.verifie && !a.verifie) return false;
    if (filtre.dispo && !a.disponible) return false;
    if (filtre.ville && !a.ville?.toLowerCase().includes(filtre.ville.toLowerCase())) return false;
    return true;
  });

  const dejaDemandeIds = new Set(demandesSent.map(d => d.artisanId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1>Trouver un artisan</h1>
        <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
          {artisansFiltres.length} artisan{artisansFiltres.length > 1 ? 's' : ''} disponible{artisansFiltres.length > 1 ? 's' : ''}
          {!apiOk && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 8 }}>(données démo)</span>}
        </p>
      </div>

      {/* Filtres */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <label className="label">Métier</label>
            <select className="select" value={filtre.metier} onChange={e => setFiltre(f => ({ ...f, metier: e.target.value }))}>
              <option value="">Tous les métiers</option>
              {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ville / Zone</label>
            <input
              className="input"
              placeholder="Paris, Lyon, Marseille..."
              value={filtre.ville}
              onChange={e => setFiltre(f => ({ ...f, ville: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Note minimale</label>
            <select className="select" value={filtre.noteMin} onChange={e => setFiltre(f => ({ ...f, noteMin: Number(e.target.value) }))}>
              <option value={0}>Toutes les notes</option>
              <option value={3}>3+ étoiles</option>
              <option value={4}>4+ étoiles</option>
              <option value={4.5}>4,5+ étoiles</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text)', userSelect: 'none' }}>
              <input type="checkbox" checked={filtre.dispo} onChange={e => setFiltre(f => ({ ...f, dispo: e.target.checked }))} />
              Disponibles uniquement
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text)', userSelect: 'none' }}>
              <input type="checkbox" checked={filtre.verifie} onChange={e => setFiltre(f => ({ ...f, verifie: e.target.checked }))} />
              Vérifiés uniquement
            </label>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>
          Chargement...
        </div>
      ) : artisansFiltres.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</p>
          <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Aucun artisan trouvé</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Essayez d'élargir vos critères de recherche.</p>
          <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => setFiltre({ metier: '', ville: '', noteMin: 0, dispo: false, verifie: false })}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {artisansFiltres.map(a => (
            <div key={a.id} style={{ position: 'relative' }}>
              <ArtisanCard
                artisan={a}
                onDevis={(artisan) => setModal(artisan)}
              />
              {dejaDemandeIds.has(a.id) && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(52,199,89,0.1)', color: '#1A7A3C',
                  border: '1px solid rgba(52,199,89,0.25)',
                  borderRadius: 20, padding: '3px 10px', fontSize: '0.6875rem', fontWeight: 600,
                }}>
                  ✓ Devis demandé
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ModalDevis
          artisan={modal}
          onClose={() => setModal(null)}
          onSubmit={(demande) => { handleSubmitDevis(demande); }}
        />
      )}
    </div>
  );
}
