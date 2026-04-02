import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { IconSearch, IconMapPin, IconStar, IconShield, IconCheck, IconChevronDown, IconX, IconUser } from '../../components/ui/Icons';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const METIERS = ['Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture', 'Maçonnerie', 'Chauffage', 'Serrurerie', 'Jardinage'];
const DISPONIBILITES = [
  { value: '',              label: 'Toutes disponibilités' },
  { value: 'aujourd_hui',  label: "Disponible aujourd'hui" },
  { value: 'cette_semaine',label: 'Cette semaine' },
  { value: 'ce_mois',      label: 'Ce mois' },
];
const NOTES = [
  { value: '',    label: 'Toutes notes' },
  { value: '3',   label: '3+ étoiles'   },
  { value: '4',   label: '4+ étoiles'   },
  { value: '4.5', label: '4,5+ étoiles' },
];

const COLORS = ['#5B5BD6','#7C3AED','#DB2777','#0891B2','#059669','#D97706'];

function StarRating({ note, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(note) ? '#F59E0B' : 'none'}
          stroke={i <= Math.round(note) ? '#F59E0B' : 'rgba(255,255,255,0.25)'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );
}

function StarRatingDark({ note, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(note) ? '#F59E0B' : 'none'}
          stroke={i <= Math.round(note) ? '#F59E0B' : '#D1D5DB'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );
}

function ArtisanCard({ artisan, onContact }) {
  const initials = artisan.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const accentColor = COLORS[artisan.id % COLORS.length];
  const [hovered, setHovered] = useState(false);

  const dispoStyle = {
    aujourd_hui:    { bg: 'rgba(29,185,84,0.12)',  color: '#16A34A', label: "Dispo aujourd'hui" },
    cette_semaine:  { bg: 'rgba(91,91,214,0.10)',  color: '#5B5BD6', label: 'Cette semaine' },
    ce_mois:        { bg: 'rgba(107,114,128,0.10)', color: '#6B7280', label: 'Ce mois' },
  };
  const dispo = dispoStyle[artisan.disponibilite] || dispoStyle.ce_mois;

  return (
    <div
      className="artisan-card"
      role="button"
      tabIndex={0}
      aria-label={`Contacter ${artisan.nom}, ${artisan.metier}`}
      style={{ transform: hovered ? 'translateY(-6px)' : 'translateY(0)', boxShadow: hovered ? `0 24px 60px rgba(0,0,0,0.12), 0 0 0 2px ${accentColor}22` : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onContact(artisan)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onContact(artisan); } }}
    >
      {/* Gradient accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }} />

      <div style={{ padding: '20px 22px 22px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
            border: `1px solid ${accentColor}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.0625rem', fontWeight: 800, color: accentColor,
            letterSpacing: '-0.02em',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0E0E1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.015em' }}>
                {artisan.nom}
              </span>
              {artisan.verified && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B5BD6" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.5l-4.8 2.4.9-5.4L4.2 7.7l5.4-.8z" fill="#5B5BD611"/>
                  <polyline points="9 11.5 11 13.5 15 9.5"/>
                </svg>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: '#4A4A6A', fontWeight: 500 }}>{artisan.metier}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: '#9898B8' }}>
                <IconMapPin size={11} color="#9898B8" /> {artisan.ville}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
              {artisan.nbAvis > 0 ? (
                <>
                  <StarRatingDark note={artisan.note} size={11} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0E0E1A', letterSpacing: '-0.01em' }}>{artisan.note}</span>
                </>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9898B8' }}>Nouveau</span>
              )}
            </div>
            {artisan.nbAvis > 0 && (
              <span style={{ fontSize: '0.6875rem', color: '#9898B8' }}>({artisan.nbAvis} avis)</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.8125rem', color: '#4A4A6A', lineHeight: 1.55, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {artisan.description}
        </p>

        {/* Certifications */}
        {artisan.certifications?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
            {artisan.certifications.map(c => (
              <span key={c} style={{ fontSize: '0.625rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(29,185,84,0.1)', color: '#15803D', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Footer: dispo + prix + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: 'rgba(91,91,214,0.10)', color: '#5B5BD6' }}>
              Disponible
            </span>
            {artisan.prixHeure != null && (
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0E0E1A', letterSpacing: '-0.02em' }}>
                {artisan.prixHeure}€<span style={{ fontWeight: 400, color: '#9898B8', fontSize: '0.75rem' }}>/h</span>
              </span>
            )}
          </div>
          <button
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: '0.8125rem',
              fontWeight: 600,
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: `0 4px 12px ${accentColor}44`,
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${accentColor}55`; e.stopPropagation(); }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 12px ${accentColor}44`; }}
            onClick={e => { e.stopPropagation(); onContact(artisan); }}
          >
            Contacter →
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactModal({ artisan, onClose, onRegister, onLogin, isLoggedIn }) {
  const accentColor = COLORS[artisan.id % COLORS.length];

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,8,15,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in"
        style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 440, textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, background: '#F4F4F8', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9898B8', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EBEBF0'; e.currentTarget.style.color = '#0E0E1A'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F4F4F8'; e.currentTarget.style.color = '#9898B8'; }}
        >
          <IconX size={14} />
        </button>

        {/* Artisan avatar */}
        <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`, border: `2px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.375rem', fontWeight: 800, color: accentColor, letterSpacing: '-0.02em' }}>
          {artisan.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>

        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0E0E1A', marginBottom: 8, letterSpacing: '-0.03em' }}>
          Contacter {artisan.nom}
        </h2>
        <p style={{ color: '#4A4A6A', fontSize: '0.9375rem', lineHeight: 1.55, marginBottom: 24 }}>
          {isLoggedIn
            ? 'Accédez à votre espace pour envoyer votre demande.'
            : 'Créez votre compte gratuit pour recevoir votre devis sous 24h.'}
        </p>

        {/* Artisan mini card */}
        <div style={{ background: '#F4F4F8', borderRadius: 14, padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accentColor}22`, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
            {artisan.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0E0E1A', letterSpacing: '-0.015em' }}>{artisan.nom}</p>
            <p style={{ fontSize: '0.75rem', color: '#4A4A6A' }}>{artisan.metier} · {artisan.ville}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <StarRatingDark note={artisan.note} size={11} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0E0E1A' }}>{artisan.note}</span>
          </div>
        </div>

        {isLoggedIn ? (
          <button onClick={onLogin} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: '0.9375rem', borderRadius: 14 }}>
            Accéder à mon espace →
          </button>
        ) : (
          <>
            <button onClick={onRegister} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: '0.9375rem', borderRadius: 14, marginBottom: 12 }}>
              Créer mon compte — C'est gratuit
            </button>
            <button onClick={() => { onClose(); navigate('/login'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9898B8', fontSize: '0.875rem', textDecoration: 'underline', textDecorationColor: 'rgba(152,152,184,0.4)' }}>
              J'ai déjà un compte
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [query, setQuery]             = useState('');
  const [metier, setMetier]           = useState('');
  const [ville, setVille]             = useState('');
  const [villeInput, setVilleInput]   = useState('');
  const [villeSuggestions, setVilleSuggestions] = useState([]);
  const [disponibilite, setDispo]     = useState('');
  const [noteMin, setNoteMin]         = useState('');
  const [artisans, setArtisans]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [metierOpen, setMetierOpen]   = useState(false);
  const [annonces, setAnnonces]       = useState([]);
  const [annonceModal, setAnnonceModal] = useState(null);
  const [candidatureForm, setCandidatureForm] = useState({ nom:'', prenom:'', email:'', telephone:'', lettre:'', cvTexte:'' });
  const [candidatureStatus, setCandidatureStatus] = useState(''); // 'sending' | 'ok' | 'error' | ''
  const [dispoOpen, setDispoOpen]     = useState(false);
  const [noteOpen, setNoteOpen]       = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/recrutement/annonces`).then(r => setAnnonces(r.data.annonces || [])).catch(() => {});
  }, []);

  async function postuler(e) {
    e.preventDefault();
    if (!annonceModal) return;
    setCandidatureStatus('sending');
    try {
      await axios.post(`${API}/recrutement/annonces/${annonceModal.id}/candidatures`, candidatureForm);
      setCandidatureStatus('ok');
    } catch (err) {
      setCandidatureStatus(err.response?.data?.erreur || 'error');
    }
  }

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [artisans]);

  useEffect(() => {
    if (villeInput.length < 2) { setVilleSuggestions([]); return; }
    const controller = new AbortController();
    fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(villeInput)}&fields=nom,codesPostaux&boost=population&limit=7`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setVilleSuggestions(data.map(c => `${c.nom}${c.codesPostaux?.[0] ? ` (${c.codesPostaux[0].slice(0,2)})` : ''}`)))
      .catch(() => {});
    return () => controller.abort();
  }, [villeInput]);

  const search = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await axios.get(`${API}/public/artisans`, {
        params: { q: query || undefined, metier: metier || undefined, ville: ville || undefined, disponibilite: disponibilite || undefined, noteMin: noteMin || undefined },
      });
      setArtisans(data.artisans);
    } catch {
      setArtisans([]);
    } finally {
      setLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [query, metier, ville, disponibilite, noteMin]);

  useEffect(() => { search(); }, []);

  const filterTimer = useRef(null);
  useEffect(() => {
    clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(search, 300);
    return () => clearTimeout(filterTimer.current);
  }, [metier, ville, disponibilite, noteMin]);

  const metierLabel = metier || 'Métier';
  const dispoLabel  = DISPONIBILITES.find(d => d.value === disponibilite)?.label || 'Disponibilité';
  const noteLabel   = NOTES.find(n => n.value === noteMin)?.label || 'Note';

  // Pill dropdown
  function FilterPill({ label, value, open, setOpen, others, children }) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => { setOpen(!open); others.forEach(s => s(false)); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '8px 14px', borderRadius: 24,
            fontSize: '0.8125rem', fontWeight: 500,
            background: value ? 'rgba(91,91,214,0.15)' : 'rgba(255,255,255,0.10)',
            color: value ? '#A5A5FF' : 'rgba(255,255,255,0.8)',
            border: value ? '1px solid rgba(91,91,214,0.4)' : '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.15s', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => { if (!value) { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}}
          onMouseLeave={e => { if (!value) { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}}
        >
          {label} <IconChevronDown size={12} />
        </button>
        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 300, background: '#fff', borderRadius: 14, border: '1px solid rgba(91,91,214,0.1)', boxShadow: '0 16px 48px rgba(14,14,26,0.16)', minWidth: 190, overflow: 'hidden' }}>
            {children}
          </div>
        )}
      </div>
    );
  }

  function DropItem({ active, onClick, label }) {
    return (
      <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '0.875rem', cursor: 'pointer', background: active ? 'rgba(91,91,214,0.07)' : 'none', color: active ? '#5B5BD6' : '#0E0E1A', border: 'none', fontWeight: active ? 600 : 400, transition: 'background 0.1s' }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F4F4F8'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}>
        {label}
        {active && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
      </button>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F8', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,15,0.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 60px)', height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91,91,214,0.4)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.7)"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#fff', letterSpacing: '-0.025em' }}>Artisans<span style={{ background: 'linear-gradient(90deg, #A5A5FF, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}> Pro</span></span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: '8px 18px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', transition: 'all 0.15s', letterSpacing: '-0.01em', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
            Se connecter
          </button>
          <button onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, color: '#fff', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)', letterSpacing: '-0.01em', boxShadow: '0 4px 14px rgba(91,91,214,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,91,214,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,91,214,0.4)'; }}>
            Créer un compte
          </button>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <div className="hero-bg" style={{ padding: 'clamp(60px, 10vh, 100px) clamp(20px, 5vw, 60px) clamp(80px, 12vh, 120px)', textAlign: 'center' }}>

        {/* Trust badge */}
        <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: '6px 16px 6px 10px', marginBottom: 32, border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(29,185,84,0.2)', border: '1px solid rgba(29,185,84,0.3)', borderRadius: 20, padding: '2px 8px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1DB954', boxShadow: '0 0 6px #1DB954' }} />
            <span style={{ fontSize: '0.6875rem', color: '#4ADE80', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Vérifié</span>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Artisans certifiés partout en France</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1.0, marginBottom: 20, maxWidth: 780, margin: '0 auto 20px' }}>
          Trouvez votre artisan<br />
          <span style={{ background: 'linear-gradient(90deg, #A5A5FF 0%, #C084FC 40%, #F472B6 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradientShift 5s ease infinite' }}>idéal, maintenant</span>
        </h1>

        {/* Sub */}
        <p className="hero-sub" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: 'rgba(255,255,255,0.55)', marginBottom: 48, maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.65, fontWeight: 400 }}>
          Devis gratuit sous 24h · Paiement sécurisé · Avis vérifiés par de vrais clients
        </p>

        {/* ══ SEARCH BOX ══ */}
        <div className="hero-search search-glass" style={{ padding: '6px', maxWidth: 700, margin: '0 auto 20px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '0 16px' }}>
            <IconSearch size={18} color="rgba(255,255,255,0.5)" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') search(); }}
              placeholder="Quel artisan cherchez-vous ?"
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '12px 0', fontSize: '1rem',
                color: '#fff', background: 'transparent',
                fontFamily: 'inherit', fontWeight: 400,
              }}
            />
          </div>
          <button onClick={search}
            style={{ background: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', color: '#fff', border: 'none', cursor: 'pointer', padding: '13px 28px', borderRadius: 14, fontSize: '0.9375rem', fontWeight: 700, transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(91,91,214,0.4)', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(91,91,214,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,91,214,0.4)'; }}>
            Rechercher
          </button>
        </div>

        {/* ══ FILTER PILLS ══ */}
        <div className="filters-row" style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', position: 'relative', zIndex: 10 }} onClick={e => e.stopPropagation()}>

          {/* Ville */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 24, background: ville ? 'rgba(91,91,214,0.15)' : 'rgba(255,255,255,0.10)', border: ville ? '1px solid rgba(91,91,214,0.4)' : '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <IconMapPin size={13} color={ville ? '#A5A5FF' : 'rgba(255,255,255,0.6)'} />
              <input
                type="text"
                value={villeInput}
                onChange={e => { setVilleInput(e.target.value); if (!e.target.value) setVille(''); }}
                placeholder="Ville"
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8125rem', color: ville ? '#A5A5FF' : 'rgba(255,255,255,0.85)', fontWeight: 500, width: 90, fontFamily: 'inherit' }}
              />
            </div>
            {villeSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 300, background: '#fff', borderRadius: 14, border: '1px solid rgba(91,91,214,0.1)', boxShadow: '0 16px 48px rgba(14,14,26,0.16)', minWidth: 190, overflow: 'hidden' }}>
                {villeSuggestions.map(v => (
                  <button key={v} onClick={() => { setVille(v); setVilleInput(v); setVilleSuggestions([]); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: '#0E0E1A', transition: 'background 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F4F4F8'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                    <IconMapPin size={12} color="#9898B8" /> {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Métier */}
          <FilterPill label={metierLabel} value={metier} open={metierOpen} setOpen={setMetierOpen} others={[setDispoOpen, setNoteOpen]}>
            <DropItem active={!metier} label="Tous les métiers" onClick={() => { setMetier(''); setMetierOpen(false); }} />
            {METIERS.map(m => <DropItem key={m} active={metier === m} label={m} onClick={() => { setMetier(m); setMetierOpen(false); }} />)}
          </FilterPill>

          {/* Disponibilité */}
          <FilterPill label={dispoLabel} value={disponibilite} open={dispoOpen} setOpen={setDispoOpen} others={[setMetierOpen, setNoteOpen]}>
            {DISPONIBILITES.map(d => <DropItem key={d.value} active={disponibilite === d.value} label={d.label} onClick={() => { setDispo(d.value); setDispoOpen(false); }} />)}
          </FilterPill>

          {/* Note */}
          <FilterPill label={noteLabel} value={noteMin} open={noteOpen} setOpen={setNoteOpen} others={[setMetierOpen, setDispoOpen]}>
            {NOTES.map(n => <DropItem key={n.value} active={noteMin === n.value} label={n.label} onClick={() => { setNoteMin(n.value); setNoteOpen(false); }} />)}
          </FilterPill>

          {(metier || ville || disponibilite || noteMin) && (
            <button onClick={() => { setMetier(''); setVille(''); setVilleInput(''); setDispo(''); setNoteMin(''); setTimeout(search, 50); }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 24, fontSize: '0.8125rem', fontWeight: 500, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
              <IconX size={12} /> Effacer
            </button>
          )}
        </div>

        {/* ══ ENGAGEMENTS ══ */}
        <div className="hero-stats" style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 56px)', marginTop: 56, flexWrap: 'wrap' }}>
          {[
            { icon: '🛡️', label: 'Artisans vérifiés' },
            { icon: '⚡', label: 'Devis sous 24h'    },
            { icon: '💳', label: 'Paiement sécurisé' },
            { icon: '⭐', label: 'Avis authentiques' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{s.icon}</span>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════ RESULTS ══════════════════ */}
      <div ref={resultsRef} style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 60px) 80px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0E0E1A', letterSpacing: '-0.03em' }}>
              {loading ? 'Recherche en cours…' : artisans.length > 0 ? `${artisans.length} artisan${artisans.length > 1 ? 's' : ''} trouvé${artisans.length > 1 ? 's' : ''}` : 'Artisans'}
            </h2>
            {(metier || ville) && (
              <p style={{ fontSize: '0.875rem', color: '#9898B8', marginTop: 4, fontWeight: 500 }}>
                {[metier, ville].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#1DB954', fontWeight: 600, background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.2)', padding: '6px 14px', borderRadius: 24 }}>
            <IconShield size={13} color="#1DB954" /> Artisans vérifiés en priorité
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(91,91,214,0.15)', borderTopColor: '#5B5BD6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ color: '#9898B8', fontSize: '0.875rem', fontWeight: 500 }}>Recherche des meilleurs artisans…</p>
          </div>

        /* Empty */
        ) : artisans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, border: '1px solid rgba(91,91,214,0.08)', boxShadow: '0 4px 24px rgba(14,14,26,0.06)' }}>
            {(metier || ville || noteMin) ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                <p style={{ fontWeight: 700, color: '#0E0E1A', fontSize: '1.125rem', marginBottom: 8, letterSpacing: '-0.02em' }}>Aucun artisan trouvé</p>
                <p style={{ color: '#9898B8', fontSize: '0.9375rem' }}>Essayez d'élargir vos critères de recherche</p>
                <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => { setMetier(''); setVille(''); setVilleInput(''); setDispo(''); setNoteMin(''); setTimeout(search, 50); }}>
                  Voir tous les artisans
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
                <p style={{ fontWeight: 700, color: '#0E0E1A', fontSize: '1.25rem', marginBottom: 12, letterSpacing: '-0.02em' }}>La plateforme est en cours de lancement</p>
                <p style={{ color: '#9898B8', fontSize: '0.9375rem', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Les premiers artisans vérifiés arrivent bientôt.<br />Vous êtes artisan ? Rejoignez-nous dès maintenant.
                </p>
                <button onClick={() => window.location.href = '/register'} className="btn-primary" style={{ padding: '12px 28px' }}>
                  Rejoindre la plateforme →
                </button>
              </>
            )}
          </div>

        /* Grid */
        ) : (
          <div className="artisan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {artisans.map((a, i) => (
              <div key={a.id} className="reveal" style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
                <ArtisanCard artisan={a} onContact={setSelectedArtisan} />
              </div>
            ))}
          </div>
        )}

        {/* ══ Trust section ══ */}
        {!loading && artisans.length > 0 && (
          <div className="reveal" style={{ marginTop: 72, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: '🛡️', gradient: 'linear-gradient(135deg, #5B5BD6, #7C3AED)', title: 'Artisans vérifiés', desc: 'Identité, Kbis et qualifications contrôlés' },
              { icon: '⚡',  gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', title: 'Réponse rapide',   desc: 'Devis reçu en moins de 24h en moyenne' },
              { icon: '💳', gradient: 'linear-gradient(135deg, #0891B2, #059669)', title: 'Paiement sécurisé', desc: 'Transaction protégée, sans surprise' },
              { icon: '⭐', gradient: 'linear-gradient(135deg, #DB2777, #7C3AED)', title: 'Avis certifiés',   desc: 'Seuls les vrais clients peuvent noter' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 18, padding: '22px 20px', border: '1px solid rgba(91,91,214,0.07)', boxShadow: '0 4px 16px rgba(14,14,26,0.05)', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,14,26,0.10)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(14,14,26,0.05)'; }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0E0E1A', marginBottom: 4, letterSpacing: '-0.015em' }}>{f.title}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#9898B8', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ ILS RECRUTENT ══ */}
        {annonces.length > 0 && (
          <div className="reveal" style={{ marginTop: 72 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(91,91,214,0.08)', border: '1px solid rgba(91,91,214,0.15)', borderRadius: 24, padding: '5px 14px', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5B5BD6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Offres d'emploi BTP</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, color: '#0E0E1A', letterSpacing: '-0.04em', lineHeight: 1.15, margin: 0 }}>
                  Ils recrutent<span style={{ color: '#5B5BD6' }}> en ce moment</span>
                </h2>
                <p style={{ color: '#9898B8', fontSize: '1rem', marginTop: 8 }}>
                  {annonces.length} offre{annonces.length > 1 ? 's' : ''} d'emploi publiée{annonces.length > 1 ? 's' : ''} par des entreprises du bâtiment
                </p>
              </div>
            </div>

            {/* Grid offres */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {annonces.map(a => {
                const contratColor = { CDI:'#5B5BD6', CDD:'#0891B2', Intérim:'#D97706', Alternance:'#059669', Stage:'#DB2777', Freelance:'#7C3AED' }[a.typeContrat] || '#5B5BD6';
                return (
                  <div key={a.id}
                    onClick={() => { setAnnonceModal(a); setCandidatureForm({ nom:'', prenom:'', email:'', telephone:'', lettre:'', cvTexte:'' }); setCandidatureStatus(''); }}
                    style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1px solid rgba(91,91,214,0.08)', boxShadow: '0 4px 16px rgba(14,14,26,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(14,14,26,0.12)'; e.currentTarget.style.borderColor = 'rgba(91,91,214,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(14,14,26,0.05)'; e.currentTarget.style.borderColor = 'rgba(91,91,214,0.08)'; }}>
                    {/* Badge contrat */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: contratColor + '18', color: contratColor, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {a.typeContrat}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#9898B8', fontWeight: 500 }}>
                        {new Date(a.creeLe).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}
                      </span>
                    </div>
                    {/* Titre */}
                    <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#0E0E1A', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                      {a.titre}
                    </h3>
                    {/* Entreprise */}
                    <p style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 600, color: '#5B5BD6' }}>
                      🏢 {a.nomEntreprise}
                    </p>
                    {/* Infos */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.8125rem', color: '#9898B8', marginBottom: 14 }}>
                      <span>📍 {a.localisation}</span>
                      {a.salaireMin && <span>💶 {a.salaireMin.toLocaleString('fr-FR')}–{a.salaireMax?.toLocaleString('fr-FR') || '?'} €/mois</span>}
                      {a.experience && <span>🎯 {a.experience}</span>}
                    </div>
                    {/* Extrait description */}
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6B6B8A', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {a.description}
                    </p>
                    <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#5B5BD6' }}>Voir & postuler →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ CTA section ══ */}
        {!loading && (
          <div className="reveal" style={{ marginTop: 72, borderRadius: 28, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #0A0A14 0%, #12103A 50%, #1E0A3C 100%)', padding: 'clamp(40px, 6vw, 64px) clamp(24px, 5vw, 56px)', textAlign: 'center' }}>
            {/* Orbs */}
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,91,214,0.3) 0%, transparent 70%)', top: -80, right: '10%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', bottom: -40, left: '15%', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(165,165,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Pour les artisans</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, maxWidth: 560, margin: '0 auto 16px' }}>
                Développez votre activité avec Artisans Pro
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
                Gérez votre agenda, vos devis et vos factures depuis une seule plateforme. Simple, rapide, professionnel.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '13px 28px', fontSize: '0.9375rem', borderRadius: 14 }}>
                  Rejoindre la plateforme →
                </button>
                <button onClick={() => navigate('/login')} className="btn-glass" style={{ padding: '13px 24px', fontSize: '0.9375rem' }}>
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL CANDIDATURE ══ */}
      {annonceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setAnnonceModal(null); }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #F2F2F7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#E3F2FD', color: '#1565C0' }}>{annonceModal.typeContrat}</span>
                    {annonceModal.dateDebut && <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#F2F2F7', color: '#6E6E73' }}>Démarrage : {new Date(annonceModal.dateDebut).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</span>}
                  </div>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: '#0E0E1A', letterSpacing: '-0.03em' }}>{annonceModal.titre}</h2>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#5B5BD6' }}>🏢 {annonceModal.nomEntreprise}</p>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.8125rem', color: '#9898B8', flexWrap: 'wrap' }}>
                    <span>📍 {annonceModal.localisation}</span>
                    {annonceModal.salaireMin && <span>💶 {annonceModal.salaireMin.toLocaleString('fr-FR')} – {annonceModal.salaireMax?.toLocaleString('fr-FR') || '?'} €/mois</span>}
                    {annonceModal.experience && <span>🎯 {annonceModal.experience}</span>}
                  </div>
                </div>
                <button onClick={() => setAnnonceModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, color: '#8E8E93', flexShrink: 0 }}>×</button>
              </div>
            </div>

            <div style={{ padding: '20px 28px 28px' }}>
              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0E0E1A', marginBottom: 8 }}>Description du poste</p>
                <div style={{ fontSize: '0.9rem', color: '#3A3A3C', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#FAFAFA', borderRadius: 12, padding: '14px 16px' }}>
                  {annonceModal.description}
                </div>
              </div>
              {annonceModal.competences && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0E0E1A', marginBottom: 8 }}>Compétences recherchées</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {annonceModal.competences.split(',').map(c => c.trim()).filter(Boolean).map(c => (
                      <span key={c} style={{ fontSize: '0.8125rem', padding: '4px 12px', borderRadius: 20, background: 'rgba(91,91,214,0.08)', color: '#5B5BD6', fontWeight: 600 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire candidature */}
              <div style={{ borderTop: '1px solid #F2F2F7', paddingTop: 20, marginTop: 4 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0E0E1A' }}>Postuler à cette offre</h3>

                {candidatureStatus === 'ok' ? (
                  <div style={{ background: '#D1F2E0', border: '1px solid #5CC88A', borderRadius: 14, padding: '20px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1A7F43', marginBottom: 4 }}>Candidature envoyée !</p>
                    <p style={{ color: '#1A7F43', fontSize: '0.875rem' }}>Votre dossier a bien été transmis à l'entreprise. Bonne chance !</p>
                    <button onClick={() => setAnnonceModal(null)} style={{ marginTop: 16, padding: '8px 20px', background: '#1A7F43', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                      Fermer
                    </button>
                  </div>
                ) : (
                  <form onSubmit={postuler} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[['prenom','Prénom *','Votre prénom'],['nom','Nom *','Votre nom']].map(([k,l,ph]) => (
                        <div key={k}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>{l}</label>
                          <input required value={candidatureForm[k]} onChange={e => setCandidatureForm(p => ({...p,[k]:e.target.value}))}
                            placeholder={ph} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[['email','Email *','votre@email.fr'],['telephone','Téléphone','06 12 34 56 78']].map(([k,l,ph]) => (
                        <div key={k}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>{l}</label>
                          <input type={k === 'email' ? 'email' : 'tel'} required={k==='email'} value={candidatureForm[k]} onChange={e => setCandidatureForm(p => ({...p,[k]:e.target.value}))}
                            placeholder={ph} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>Lettre de motivation *</label>
                      <textarea required value={candidatureForm.lettre} onChange={e => setCandidatureForm(p => ({...p, lettre: e.target.value}))} rows={5}
                        placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal pour ce poste…"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6E6E73', marginBottom: 5 }}>Résumé de votre expérience / CV (optionnel)</label>
                      <textarea value={candidatureForm.cvTexte} onChange={e => setCandidatureForm(p => ({...p, cvTexte: e.target.value}))} rows={4}
                        placeholder="Listez vos expériences, diplômes, certifications (CACES, habilitations…)"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
                    </div>
                    {typeof candidatureStatus === 'string' && candidatureStatus !== '' && candidatureStatus !== 'sending' && candidatureStatus !== 'ok' && (
                      <div style={{ background: '#FFE5E5', border: '1px solid #F5A5A5', borderRadius: 10, padding: '10px 14px', fontSize: '0.875rem', color: '#C0392B', fontWeight: 600 }}>
                        {candidatureStatus === 'error' ? 'Une erreur est survenue, réessayez.' : candidatureStatus}
                      </div>
                    )}
                    <button type="submit" disabled={candidatureStatus === 'sending'}
                      style={{ padding: '12px 24px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 12, cursor: candidatureStatus === 'sending' ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.01em', transition: 'all 0.15s' }}>
                      {candidatureStatus === 'sending' ? 'Envoi en cours…' : '🚀 Envoyer ma candidature'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {selectedArtisan && (
        <ContactModal
          artisan={selectedArtisan}
          isLoggedIn={!!token}
          onClose={() => setSelectedArtisan(null)}
          onRegister={() => { setSelectedArtisan(null); navigate('/register'); }}
          onLogin={() => { setSelectedArtisan(null); navigate(token ? '/app' : '/login'); }}
        />
      )}

      {/* ══ FOOTER ══ */}
      <div style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border, #e5e7eb)', marginTop: 40, fontSize: '0.8125rem', color: 'var(--text-secondary, #6b7280)' }}>
        © 2026 MonArtisan —
        <a href="/cgu" style={{ color: 'var(--primary)', textDecoration: 'none', marginLeft: 4 }}>CGU & Mentions légales</a>
        {' · '}
        <a href="mailto:contact@monartisan.fr" style={{ color: 'var(--primary)', textDecoration: 'none' }}>contact@monartisan.fr</a>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .hero-badge  { animation: heroBadge  0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .hero-title  { animation: heroTitle  0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s both; }
        .hero-sub    { animation: heroSub    0.7s ease 0.4s both; }
        .hero-search { animation: heroSearch 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.55s both; }
        .hero-stats  { animation: fadeUp     0.7s ease 0.75s both; }
        @keyframes heroBadge  { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
        @keyframes heroTitle  { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes heroSub    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes heroSearch { from { opacity:0; transform:translateY(22px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeUp     { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.35) !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
