import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TYPES_CONTRAT = ['CDI', 'CDD', 'Intérim', 'Alternance', 'Stage', 'Freelance'];
const SALAIRES = [
  { label: 'Tous salaires', value: '' },
  { label: '≥ 1 800 €/mois', value: '1800' },
  { label: '≥ 2 200 €/mois', value: '2200' },
  { label: '≥ 2 700 €/mois', value: '2700' },
  { label: '≥ 3 200 €/mois', value: '3200' },
  { label: '≥ 4 000 €/mois', value: '4000' },
];

const CONTRAT_COLORS = {
  CDI: '#5B5BD6', CDD: '#0891B2', 'Intérim': '#D97706',
  Alternance: '#059669', Stage: '#DB2777', Freelance: '#7C3AED',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return 'Hier';
  if (d < 7)  return `Il y a ${d} jours`;
  if (d < 30) return `Il y a ${Math.floor(d / 7)} sem.`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

/* ── Formulaire de candidature ── */
function CandidatureModal({ annonce, onClose }) {
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', lettre: '', cvTexte: '' });
  const [status, setStatus] = useState(''); // '' | 'sending' | 'ok' | string(erreur)

  async function postuler(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      await axios.post(`${API}/recrutement/annonces/${annonce.id}/candidatures`, form);
      setStatus('ok');
    } catch (err) {
      setStatus(err.response?.data?.erreur || 'Erreur — réessayez.');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #F2F2F7', position: 'sticky', top: 0, background: '#fff', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0E0E1A' }}>Postuler à cette offre</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>{annonce.titre} — {annonce.nomEntreprise}</p>
          </div>
          <button onClick={onClose} style={{ background: '#F2F2F7', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, fontSize: 18, color: '#3A3A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>

        <div style={{ padding: '22px 26px 26px' }}>
          {status === 'ok' ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h3 style={{ color: '#1A7F43', fontWeight: 800, marginBottom: 8 }}>Candidature envoyée !</h3>
              <p style={{ color: '#6E6E73', marginBottom: 24, lineHeight: 1.6 }}>Votre dossier a bien été transmis à {annonce.nomEntreprise}. Bonne chance !</p>
              <button onClick={onClose} style={{ padding: '10px 28px', background: '#1A7F43', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>Fermer</button>
            </div>
          ) : (
            <form onSubmit={postuler} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['prenom', 'Prénom *'], ['nom', 'Nom *']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>{l}</label>
                    <input required value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => { e.target.style.borderColor = '#5B5BD6'; }}
                      onBlur={e => { e.target.style.borderColor = '#E5E5EA'; }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['email', 'Email *', 'email'], ['telephone', 'Téléphone', 'tel']].map(([k, l, t]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>{l}</label>
                    <input type={t} required={k === 'email'} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => { e.target.style.borderColor = '#5B5BD6'; }}
                      onBlur={e => { e.target.style.borderColor = '#E5E5EA'; }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>Lettre de motivation *</label>
                <textarea required value={form.lettre} onChange={e => setForm(p => ({ ...p, lettre: e.target.value }))} rows={5}
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes le bon candidat…"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#5B5BD6'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E5EA'; }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>Expériences & CV <span style={{ fontWeight: 400, color: '#9898B8' }}>(optionnel)</span></label>
                <textarea value={form.cvTexte} onChange={e => setForm(p => ({ ...p, cvTexte: e.target.value }))} rows={4}
                  placeholder="Listez vos expériences, diplômes, certifications (CACES, habilitations électriques…)"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#5B5BD6'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E5EA'; }} />
              </div>
              {status && status !== 'sending' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#C0392B', fontWeight: 600 }}>{status}</div>
              )}
              <button type="submit" disabled={status === 'sending'}
                style={{ padding: '13px 24px', background: status === 'sending' ? '#9B9BDB' : '#5B5BD6', color: '#fff', border: 'none', borderRadius: 12, cursor: status === 'sending' ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>
                {status === 'sending' ? 'Envoi en cours…' : '🚀 Envoyer ma candidature'}
              </button>
              <p style={{ fontSize: 12, color: '#9898B8', textAlign: 'center', margin: 0 }}>Aucun compte requis — votre candidature est transmise directement à l'entreprise.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Carte offre (liste) ── */
function OffreCard({ annonce, selected, onClick }) {
  const cc = CONTRAT_COLORS[annonce.typeContrat] || '#5B5BD6';
  return (
    <div onClick={onClick}
      style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: `1.5px solid ${selected ? '#5B5BD6' : '#EBEBF0'}`, cursor: 'pointer', transition: 'all 0.15s', boxShadow: selected ? '0 0 0 3px rgba(91,91,214,0.12)' : '0 1px 4px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = '#C7C7F0'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: cc + '18', color: cc, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{annonce.typeContrat}</span>
            <span style={{ fontSize: 11, color: '#9898B8' }}>{timeAgo(annonce.creeLe)}</span>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0E0E1A', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{annonce.titre}</h3>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #F0F0FF, #F8F0FF)', border: '1px solid #E3E3F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏢</div>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#5B5BD6' }}>{annonce.nomEntreprise}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#6B6B8A' }}>
        <span>📍 {annonce.localisation}</span>
        {annonce.salaireMin && <span>💶 {annonce.salaireMin.toLocaleString('fr-FR')} – {annonce.salaireMax?.toLocaleString('fr-FR') || '?'} €/mois</span>}
        {annonce.experience && <span>🎯 {annonce.experience}</span>}
      </div>
    </div>
  );
}

/* ── Détail offre (panel droit) ── */
function OffreDetail({ annonce, onPostuler, onClose }) {
  const cc = CONTRAT_COLORS[annonce.typeContrat] || '#5B5BD6';
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', borderRadius: 16, border: '1.5px solid #EBEBF0', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px 26px 20px', borderBottom: '1px solid #F2F2F7', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: cc + '18', color: cc, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{annonce.typeContrat}</span>
              {annonce.dateDebut && <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 20, background: '#F2F2F7', color: '#6E6E73' }}>Démarrage {new Date(annonce.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>}
              <span style={{ fontSize: 11, color: '#9898B8', padding: '4px 0' }}>{timeAgo(annonce.creeLe)}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0E0E1A', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{annonce.titre}</h1>
            <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 700, color: '#5B5BD6' }}>🏢 {annonce.nomEntreprise}</p>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: '#F2F2F7', border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: 9, fontSize: 18, color: '#3A3A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#6B6B8A', marginBottom: 16 }}>
          <span>📍 {annonce.localisation}</span>
          {annonce.salaireMin && <span>💶 <strong style={{ color: '#1C1C1E' }}>{annonce.salaireMin.toLocaleString('fr-FR')} – {annonce.salaireMax?.toLocaleString('fr-FR') || '?'} €/mois</strong></span>}
          {annonce.experience && <span>🎯 {annonce.experience}</span>}
        </div>
        <button onClick={onPostuler}
          style={{ width: '100%', padding: '13px 24px', background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 15, boxShadow: '0 4px 16px rgba(91,91,214,0.4)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,91,214,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,91,214,0.4)'; }}>
          🚀 Postuler à cette offre
        </button>
      </div>

      {/* Corps */}
      <div style={{ padding: '22px 26px', flex: 1 }}>
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, background: '#5B5BD6', borderRadius: 2, display: 'inline-block' }} />
            Description du poste
          </h2>
          <div style={{ fontSize: 14, color: '#3A3A3C', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{annonce.description}</div>
        </section>

        {annonce.competences && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 16, background: '#5B5BD6', borderRadius: 2, display: 'inline-block' }} />
              Compétences recherchées
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {annonce.competences.split(',').map(c => c.trim()).filter(Boolean).map(c => (
                <span key={c} style={{ fontSize: 13, padding: '5px 13px', borderRadius: 20, background: 'rgba(91,91,214,0.08)', color: '#5B5BD6', fontWeight: 600, border: '1px solid rgba(91,91,214,0.12)' }}>{c}</span>
              ))}
            </div>
          </section>
        )}

        {/* CTA bas */}
        <div style={{ background: 'linear-gradient(135deg, #F0F0FF, #F8F0FF)', borderRadius: 14, padding: '20px 22px', textAlign: 'center', border: '1px solid rgba(91,91,214,0.12)', marginTop: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#0E0E1A', marginBottom: 6 }}>Ce poste vous intéresse ?</p>
          <p style={{ fontSize: 13, color: '#6B6B8A', marginBottom: 16 }}>Postulez en 2 minutes — aucun compte requis</p>
          <button onClick={onPostuler}
            style={{ padding: '11px 28px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            Postuler maintenant →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════════ */
export default function RecrutementPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [q, setQ]                   = useState(searchParams.get('q') || '');
  const [localisation, setLoc]      = useState(searchParams.get('localisation') || '');
  const [typesActifs, setTypes]     = useState(searchParams.get('type') ? [searchParams.get('type')] : []);
  const [salaireMin, setSalaireMin] = useState(searchParams.get('salaire') || '');
  const [page, setPage]             = useState(1);

  const [annonces, setAnnonces]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(1);
  const [loading, setLoading]       = useState(false);

  const [selected, setSelected]     = useState(null); // annonce détaillée
  const [candidatureModal, setCandidatureModal] = useState(null);

  const [locSuggestions, setLocSuggestions] = useState([]);
  const locTimer = useRef(null);

  const PER_PAGE = 15;

  const fetchAnnonces = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: PER_PAGE };
      if (q.trim())         params.q           = q.trim();
      if (localisation)     params.localisation = localisation;
      if (typesActifs.length === 1) params.typeContrat = typesActifs[0];
      if (salaireMin)       params.salaireMin   = salaireMin;
      const { data } = await axios.get(`${API}/recrutement/annonces`, { params });
      setAnnonces(data.annonces || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
      if (data.annonces?.length > 0 && !selected) setSelected(data.annonces[0]);
    } catch { setAnnonces([]); }
    finally  { setLoading(false); }
  }, [q, localisation, typesActifs, salaireMin]);

  useEffect(() => { fetchAnnonces(1); }, []);

  // Suggestions ville
  useEffect(() => {
    clearTimeout(locTimer.current);
    if (localisation.length < 2) { setLocSuggestions([]); return; }
    locTimer.current = setTimeout(() => {
      fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(localisation)}&fields=nom,codesPostaux&boost=population&limit=6`)
        .then(r => r.json())
        .then(d => setLocSuggestions(d.map(c => c.nom)))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(locTimer.current);
  }, [localisation]);

  function toggleType(t) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function handleSearch(e) {
    e?.preventDefault();
    setSelected(null);
    fetchAnnonces(1);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F7', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{ background: 'linear-gradient(135deg, #0A0A14 0%, #12103A 60%, #1E0A3C 100%)', padding: '0 clamp(16px, 4vw, 48px)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, height: 64 }}>
          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.7)"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.02em' }}>Artisans<span style={{ color: '#A5A5FF' }}> Pro</span></span>
          </button>

          {/* Barre de recherche principale */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8, maxWidth: 860 }}>
            {/* Mot-clé */}
            <div style={{ flex: 1.4, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0 14px', gap: 8, border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder="Poste, compétence, entreprise…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
              {q && <button type="button" onClick={() => setQ('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 0 }}>×</button>}
            </div>

            {/* Localisation */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0 14px', gap: 8, border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input value={localisation} onChange={e => { setLoc(e.target.value); setLocSuggestions([]); }}
                placeholder="Ville, région…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
              {localisation && <button type="button" onClick={() => { setLoc(''); setLocSuggestions([]); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 0 }}>×</button>}
              {locSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#fff', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 10 }}>
                  {locSuggestions.map(s => (
                    <button key={s} type="button" onClick={() => { setLoc(s); setLocSuggestions([]); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1C1C1E', textAlign: 'left' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F4F4F8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                      📍 {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" style={{ padding: '0 24px', background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(91,91,214,0.5)' }}>
              Rechercher
            </button>
          </form>

          <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
            Se connecter
          </button>
        </div>
      </header>

      {/* ── CORPS : sidebar + résultats + détail ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px clamp(12px, 3vw, 32px)', display: 'grid', gridTemplateColumns: '220px 1fr 1.6fr', gap: 20, alignItems: 'start' }}>

        {/* ── SIDEBAR FILTRES ── */}
        <aside style={{ background: '#fff', borderRadius: 16, padding: '20px 18px', border: '1.5px solid #EBEBF0', position: 'sticky', top: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: '#1C1C1E' }}>Filtres</p>
            {(typesActifs.length > 0 || salaireMin) && (
              <button onClick={() => { setTypes([]); setSalaireMin(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#5B5BD6', fontWeight: 700 }}>Réinitialiser</button>
            )}
          </div>

          {/* Type de contrat */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Type de contrat</p>
            {TYPES_CONTRAT.map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={typesActifs.includes(t)} onChange={() => toggleType(t)}
                  style={{ width: 15, height: 15, accentColor: '#5B5BD6', cursor: 'pointer' }} />
                <span style={{ fontSize: 13, color: typesActifs.includes(t) ? '#5B5BD6' : '#3A3A3C', fontWeight: typesActifs.includes(t) ? 700 : 400 }}>{t}</span>
              </label>
            ))}
          </div>

          {/* Salaire minimum */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Salaire minimum</p>
            {SALAIRES.map(s => (
              <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                <input type="radio" name="salaire" checked={salaireMin === s.value} onChange={() => setSalaireMin(s.value)}
                  style={{ accentColor: '#5B5BD6', cursor: 'pointer' }} />
                <span style={{ fontSize: 13, color: salaireMin === s.value ? '#5B5BD6' : '#3A3A3C', fontWeight: salaireMin === s.value ? 700 : 400 }}>{s.label}</span>
              </label>
            ))}
          </div>

          <button onClick={handleSearch}
            style={{ width: '100%', marginTop: 18, padding: '10px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            Appliquer
          </button>
        </aside>

        {/* ── LISTE OFFRES ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Compteur */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#6B6B8A', fontWeight: 500 }}>
              {loading ? 'Recherche…' : <><strong style={{ color: '#1C1C1E' }}>{total}</strong> offre{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}</>}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1.5px solid #EBEBF0', animation: 'pulse 1.5s ease-in-out infinite' }}>
                  <div style={{ height: 12, background: '#F0F0F0', borderRadius: 6, width: '60%', marginBottom: 10 }} />
                  <div style={{ height: 18, background: '#F0F0F0', borderRadius: 6, width: '80%', marginBottom: 10 }} />
                  <div style={{ height: 12, background: '#F0F0F0', borderRadius: 6, width: '40%' }} />
                </div>
              ))}
            </div>
          ) : annonces.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '56px 24px', textAlign: 'center', border: '1.5px solid #EBEBF0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: '#1C1C1E', marginBottom: 8 }}>Aucune offre trouvée</p>
              <p style={{ color: '#9898B8', fontSize: 14, marginBottom: 20 }}>Essayez d'élargir vos critères de recherche</p>
              <button onClick={() => { setQ(''); setLoc(''); setTypes([]); setSalaireMin(''); setTimeout(() => fetchAnnonces(1), 50); }}
                style={{ padding: '9px 22px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                Voir toutes les offres
              </button>
            </div>
          ) : (
            <>
              {annonces.map(a => (
                <OffreCard key={a.id} annonce={a} selected={selected?.id === a.id} onClick={() => setSelected(a)} />
              ))}

              {/* Pagination */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingTop: 8 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => fetchAnnonces(p)}
                      style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid', borderColor: page === p ? '#5B5BD6' : '#EBEBF0', background: page === p ? '#5B5BD6' : '#fff', color: page === p ? '#fff' : '#3A3A3C', fontWeight: page === p ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── PANEL DÉTAIL ── */}
        <div style={{ position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)' }}>
          {selected ? (
            <OffreDetail annonce={selected} onPostuler={() => setCandidatureModal(selected)} />
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #EBEBF0', padding: '64px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>👆</div>
              <p style={{ fontWeight: 700, color: '#1C1C1E', fontSize: 15 }}>Sélectionnez une offre</p>
              <p style={{ color: '#9898B8', fontSize: 13 }}>pour voir le détail et postuler</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL CANDIDATURE ── */}
      {candidatureModal && (
        <CandidatureModal annonce={candidatureModal} onClose={() => setCandidatureModal(null)} />
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        * { box-sizing: border-box; }
        @media (max-width: 900px) {
          .rp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
