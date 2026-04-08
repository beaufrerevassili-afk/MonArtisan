import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DS from '../../design/ds';

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' };

const URGENCE_LABELS = { urgent: { label: '🚨 Urgent (48h)', color: '#DC2626' }, normal: { label: '📅 Normal', color: '#D97706' }, flexible: { label: '🕐 Flexible', color: '#16A34A' } };

const DEMO_PROJETS = [
  { id: 1, metier: 'Plomberie', titre: 'Rénovation salle de bain', description: 'Douche à l\'italienne, nouveau carrelage, meuble vasque. Surface 6m².', ville: 'Nice', budget: 3500, urgence: 'normal', statut: 'publie', date: '2026-04-06', clientNom: 'Marie D.', nbOffres: 1 },
  { id: 2, metier: 'Électricité', titre: 'Mise aux normes tableau électrique', description: 'Tableau vétuste à remplacer. Appartement T3, années 70.', ville: 'Nice', budget: 800, urgence: 'urgent', statut: 'publie', date: '2026-04-07', clientNom: 'Thomas P.', nbOffres: 0 },
  { id: 3, metier: 'Peinture', titre: 'Peinture complète T2', description: 'Murs + plafonds, 2 chambres + salon + couloir. Environ 60m².', ville: 'Antibes', budget: 2200, urgence: 'flexible', statut: 'publie', date: '2026-04-05', clientNom: 'Sophie L.', nbOffres: 2 },
  { id: 4, metier: 'Maçonnerie', titre: 'Mur de clôture jardin', description: 'Construction mur parpaing 15m linéaire, hauteur 1m80, enduit.', ville: 'Cagnes-sur-Mer', budget: 4500, urgence: 'normal', statut: 'publie', date: '2026-04-04', clientNom: 'Henri M.', nbOffres: 0 },
  { id: 5, metier: 'Plomberie', titre: 'Fuite sous évier cuisine', description: 'Fuite importante sous évier, intervention rapide souhaitée.', ville: 'Nice', budget: 200, urgence: 'urgent', statut: 'publie', date: '2026-04-08', clientNom: 'Claire F.', nbOffres: 0 },
  { id: 6, metier: 'Carrelage', titre: 'Pose carrelage terrasse', description: 'Terrasse 25m², carrelage extérieur antidérapant.', ville: 'Cannes', budget: 3000, urgence: 'flexible', statut: 'publie', date: '2026-04-03', clientNom: 'Jean R.', nbOffres: 1 },
];

// Calcul distance Haversine entre 2 coords GPS
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ProjetsClients() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [offreForm, setOffreForm] = useState({ prix: '', message: '', date: '', delai: '' });
  const [offreSent, setOffreSent] = useState(false);
  const [filtreMet, setFiltreMet] = useState('');

  // Config entreprise — adresse dépôt + rayon
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('freample_entreprise_geo')) || { adresse: '', lat: null, lon: null, rayon: 20 }; }
    catch { return { adresse: '', lat: null, lon: null, rayon: 20 }; }
  });
  const [configEdit, setConfigEdit] = useState(false);
  const [configForm, setConfigForm] = useState({ adresse: config.adresse, rayon: config.rayon });
  const [geocoding, setGeocoding] = useState(false);

  async function sauverConfig() {
    setGeocoding(true);
    try {
      const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(configForm.adresse)}&limit=1`);
      const data = await r.json();
      if (data.features?.length) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        const newConfig = { adresse: data.features[0].properties.label, lat, lon, rayon: Number(configForm.rayon) || 20 };
        setConfig(newConfig);
        localStorage.setItem('freample_entreprise_geo', JSON.stringify(newConfig));
        setConfigEdit(false);
      }
    } catch {} finally { setGeocoding(false); }
  }

  // Charger les projets
  useEffect(() => {
    // API
    api.get('/projets/disponibles').then(({ data }) => {
      if (data.projets?.length) setProjets(data.projets);
      else {
        // Fallback localStorage + demo
        try {
          const local = JSON.parse(localStorage.getItem('freample_projets') || '[]').filter(p => p.statut === 'publie');
          setProjets(local.length > 0 ? local : DEMO_PROJETS);
        } catch { setProjets(DEMO_PROJETS); }
      }
    }).catch(() => {
      try {
        const local = JSON.parse(localStorage.getItem('freample_projets') || '[]').filter(p => p.statut === 'publie');
        setProjets(local.length > 0 ? local : DEMO_PROJETS);
      } catch { setProjets(DEMO_PROJETS); }
    }).finally(() => setLoading(false));
  }, []);

  // Filtrer par distance géographique
  const [projetsAvecDistance, setProjetsAvecDistance] = useState([]);
  useEffect(() => {
    if (!config.lat || !config.lon) { setProjetsAvecDistance(projets); return; }
    // Géocoder chaque ville de projet pour calculer la distance
    const geocodeAll = async () => {
      const results = await Promise.all(projets.map(async (p) => {
        if (!p.ville) return { ...p, distance: null };
        try {
          const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(p.ville)}&limit=1`);
          const data = await r.json();
          if (data.features?.length) {
            const [lon, lat] = data.features[0].geometry.coordinates;
            const dist = Math.round(haversineKm(config.lat, config.lon, lat, lon));
            return { ...p, distance: dist };
          }
        } catch {}
        return { ...p, distance: null };
      }));
      setProjetsAvecDistance(results);
    };
    geocodeAll();
  }, [projets, config.lat, config.lon]);

  const filtered = projetsAvecDistance.filter(p => {
    if (filtreMet && p.metier !== filtreMet) return false;
    if (config.lat && config.rayon && p.distance !== null && p.distance > config.rayon) return false;
    return true;
  }).sort((a, b) => (a.distance || 999) - (b.distance || 999));

  const metiers = [...new Set(projets.map(p => p.metier))];

  function envoyerOffre() {
    if (!offreForm.prix || !selected) return;
    // Sauver localement
    try {
      const offres = JSON.parse(localStorage.getItem('freample_offres') || '[]');
      offres.push({ id: Date.now(), projetId: selected.id, artisanNom: user?.nom, prix: Number(offreForm.prix), message: offreForm.message, date: offreForm.date, delai: offreForm.delai, statut: 'proposee', createdAt: new Date().toISOString() });
      localStorage.setItem('freample_offres', JSON.stringify(offres));
    } catch {}
    // Tenter API
    api.post(`/projets/${selected.id}/offre`, { prixPropose: Number(offreForm.prix), message: offreForm.message, dateProposee: offreForm.date || null, delaiJours: Number(offreForm.delai) || null }).catch(() => {});
    setOffreSent(true);
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>;

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Projets clients</h1>
          <p style={{ fontSize: 13, color: DS.muted, margin: 0 }}>
            {filtered.length} projet{filtered.length > 1 ? 's' : ''} dans votre zone
            {config.adresse && <span> · 📍 {config.adresse} ({config.rayon}km)</span>}
          </p>
        </div>
        <button onClick={() => { setConfigEdit(!configEdit); setConfigForm({ adresse: config.adresse, rayon: config.rayon }); }}
          style={{ ...BTN, background: configEdit ? DS.border : '#2C2520', color: configEdit ? DS.ink : '#F5EFE0' }}>
          📍 {config.adresse ? 'Modifier zone' : 'Configurer ma zone'}
        </button>
      </div>

      {/* Config zone d'intervention */}
      {configEdit && (
        <div style={{ ...CARD, marginBottom: 16, borderLeft: '4px solid #A68B4B' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📍 Zone d'intervention</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Adresse du dépôt / siège</label>
              <input value={configForm.adresse} onChange={e => setConfigForm(f => ({ ...f, adresse: e.target.value }))} placeholder="12 rue de la Liberté, 06000 Nice" style={INP} />
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Rayon (km)</label>
              <input type="number" value={configForm.rayon} onChange={e => setConfigForm(f => ({ ...f, rayon: e.target.value }))} style={INP} />
            </div>
            <button onClick={sauverConfig} disabled={geocoding} style={{ ...BTN, opacity: geocoding ? 0.5 : 1 }}>
              {geocoding ? 'Localisation...' : '✓ Sauvegarder'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: DS.muted, marginTop: 8 }}>Seuls les projets dans votre rayon d'intervention seront affichés. Géocodage automatique via api-adresse.data.gouv.fr.</div>
        </div>
      )}

      {/* Filtres métiers */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFiltreMet('')} style={{ padding: '6px 14px', background: !filtreMet ? '#2C2520' : 'transparent', color: !filtreMet ? '#F5EFE0' : DS.muted, border: `1px solid ${!filtreMet ? '#2C2520' : DS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>Tous</button>
        {metiers.map(m => (
          <button key={m} onClick={() => setFiltreMet(filtreMet === m ? '' : m)}
            style={{ padding: '6px 14px', background: filtreMet === m ? '#2C2520' : 'transparent', color: filtreMet === m ? '#F5EFE0' : DS.muted, border: `1px solid ${filtreMet === m ? '#2C2520' : DS.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>
            {m}
          </button>
        ))}
      </div>

      {/* Liste des projets */}
      {filtered.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aucun projet dans votre zone</div>
          <div style={{ fontSize: 13, color: DS.muted }}>{config.adresse ? `Aucun projet trouvé dans un rayon de ${config.rayon}km autour de ${config.adresse}.` : 'Configurez votre zone d\'intervention pour voir les projets disponibles.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const urg = URGENCE_LABELS[p.urgence] || URGENCE_LABELS.normal;
            return (
              <div key={p.id} onClick={() => { setSelected(p); setOffreSent(false); setOffreForm({ prix: String(p.budget || ''), message: '', date: '', delai: '' }); }}
                style={{ ...CARD, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center', transition: 'all .15s', borderLeft: `4px solid ${urg.color}` }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{p.metier} — {p.titre || p.description?.slice(0, 40)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: urg.color }}>{urg.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: DS.muted, marginBottom: 4 }}>{p.description?.slice(0, 80)}{p.description?.length > 80 ? '...' : ''}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: DS.muted }}>
                    <span>📍 {p.ville}{p.distance !== null && p.distance !== undefined ? ` (${p.distance}km)` : ''}</span>
                    <span>👤 {p.clientNom || p.client_nom || 'Client'}</span>
                    <span>{new Date(p.date || p.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2C2520' }}>{p.budget || p.budget_ajuste || '?'}€</div>
                  <div style={{ fontSize: 10, color: DS.muted }}>{p.nbOffres || p.nb_offres || 0} offre{(p.nbOffres || p.nb_offres || 0) > 1 ? 's' : ''}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal détail projet + faire une offre */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* Header */}
            <div style={{ background: '#2C2520', padding: '20px 24px', borderRadius: '16px 16px 0 0', color: '#F5EFE0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{selected.metier}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.titre || selected.description?.slice(0, 50)}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.6)', marginTop: 4 }}>📍 {selected.ville}{selected.distance != null ? ` · ${selected.distance}km` : ''} · 👤 {selected.clientNom || selected.client_nom || 'Client'}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 30, height: 30, color: '#F5EFE0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Description */}
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7, marginBottom: 16, padding: '12px 14px', background: '#F8F7F4', borderRadius: 10 }}>
                {selected.description}
              </div>

              {/* Infos */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  ['Budget client', `${selected.budget || selected.budget_ajuste || '?'}€`],
                  ['Urgence', URGENCE_LABELS[selected.urgence]?.label || 'Normal'],
                  ['Commission', `${selected.budget >= 500 ? 5 : 2}€`],
                  ['Vous recevez', `${(selected.budget || 0)}€`],
                ].map(([k, v]) => (
                  <div key={k} style={{ flex: '1 1 100px', background: '#F8F7F4', padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: DS.muted }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>

              {offreSent ? (
                /* Confirmation */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', border: '2px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>✓</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Offre envoyée !</div>
                  <div style={{ fontSize: 13, color: DS.muted }}>Le client va recevoir votre proposition et pourra l'accepter.</div>
                </div>
              ) : (
                /* Formulaire d'offre */
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Faire une offre</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Votre prix (€) *</label>
                      <input type="number" value={offreForm.prix} onChange={e => setOffreForm(f => ({ ...f, prix: e.target.value }))} placeholder={String(selected.budget || '')} style={INP} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Date proposée</label>
                      <input type="date" value={offreForm.date} onChange={e => setOffreForm(f => ({ ...f, date: e.target.value }))} style={INP} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Délai estimé (jours)</label>
                      <input type="number" value={offreForm.delai} onChange={e => setOffreForm(f => ({ ...f, delai: e.target.value }))} placeholder="5" style={INP} />
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: DS.muted, display: 'block', marginBottom: 4 }}>Message au client</label>
                    <textarea value={offreForm.message} onChange={e => setOffreForm(f => ({ ...f, message: e.target.value }))} rows={3}
                      placeholder="Bonjour, je suis disponible pour ce projet. Voici ma proposition..."
                      style={{ ...INP, resize: 'vertical' }} />
                  </div>
                  <button onClick={envoyerOffre} disabled={!offreForm.prix}
                    style={{ ...BTN, width: '100%', marginTop: 14, padding: 14, fontSize: 14, opacity: offreForm.prix ? 1 : 0.5, background: '#A68B4B' }}>
                    Envoyer mon offre →
                  </button>
                  <div style={{ fontSize: 11, color: DS.muted, textAlign: 'center', marginTop: 8 }}>L'artisan reçoit 100% — commission payée par le client</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
