import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import HideForClient from '../../components/public/HideForClient';
import { IconSearch, IconMapPin, IconX } from '../../components/ui/Icons';

// ── Data ────────────────────────────────────────────────────────────────────
const TYPES = [
  { id: 'coiffeur', label: 'Coiffeur',           icon: '✂️' },
  { id: 'barbier',  label: 'Barbier',            icon: '🪒' },
  { id: 'manucure', label: 'Manucure',           icon: '💅' },
  { id: 'beaute',   label: 'Institut de beauté', icon: '🌸' },
  { id: 'bienetre', label: 'Bien-être & Spa',    icon: '🧘' },
  { id: 'coloriste',label: 'Coloriste',          icon: '🎨' },
];

const CRENEAUX = ['9:00','9:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

const SALONS = [
  { id:'1', nom:'Salon Léa',            type:'coiffeur', ville:'Paris 11e', adresse:'24 rue de la Roquette',    note:4.9, avis:142, color:'#E8C5D0', prochainCreneau:'10:00', prestations:['Coupe femme · 38€','Balayage · 95€','Brushing · 25€'] },
  { id:'2', nom:'Barbershop Alex',       type:'barbier',  ville:'Paris 3e',  adresse:'8 rue de Bretagne',       note:5.0, avis:67,  color:'#A8B8D8', prochainCreneau:'9:30',  prestations:['Coupe homme · 22€','Rasoir droit · 28€','Barbe · 15€'] },
  { id:'3', nom:'Studio Inès',           type:'coiffeur', ville:'Paris 18e', adresse:'52 rue Lepic',            note:4.7, avis:89,  color:'#C5B0D8', prochainCreneau:'11:00', prestations:['Coupe + Couleur · 85€','Kératine · 120€','Mèches · 75€'] },
  { id:'4', nom:'Atelier Beauté Marais', type:'beaute',   ville:'Paris 4e',  adresse:'12 rue des Archives',     note:4.8, avis:204, color:'#B8D0C0', prochainCreneau:'14:00', prestations:['Soin visage · 55€','Manucure · 28€','Épilation · 22€'] },
  { id:'5', nom:'Le Barbier du Marais',  type:'barbier',  ville:'Paris 4e',  adresse:'27 rue Vieille du Temple', note:4.6, avis:156, color:'#D0B898', prochainCreneau:null,    prestations:['Coupe ciseau · 25€','Rasage · 20€','Coupe + barbe · 38€'] },
  { id:'6', nom:'Spa Lumière',           type:'bienetre', ville:'Paris 8e',  adresse:'5 avenue Montaigne',      note:4.9, avis:78,  color:'#A8C5D8', prochainCreneau:'15:00', prestations:['Massage 60min · 90€','Spa privé · 120€','Soin corps · 70€'] },
  { id:'7', nom:'Hair Studio République',type:'coiffeur', ville:'Paris 10e', adresse:'15 place de la République',note:4.5, avis:312, color:'#D8C5A8', prochainCreneau:'9:00',  prestations:['Coupe femme · 35€','Coloration · 65€','Lissage · 150€'] },
  { id:'8', nom:'Nails Factory',         type:'manucure', ville:'Paris 6e',  adresse:'8 rue de Rennes',         note:4.8, avis:198, color:'#D8A8B8', prochainCreneau:'10:30', prestations:['Manucure gel · 35€','Pose complète · 48€','Nail art · 55€'] },
];

// ── Salon Card ──────────────────────────────────────────────────────────────
function SalonCard({ salon, onClick }) {
  const initials = salon.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const creneaux = salon.prochainCreneau
    ? CRENEAUX.filter(c => c >= salon.prochainCreneau).slice(0, 4)
    : [];

  return (
    <div onClick={onClick}
      style={{ background: '#fff', border: `1.5px solid ${DS.border}`, borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all .2s', fontFamily: DS.font }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = DS.shadow.md; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: salon.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DS.ink, marginBottom: 3, letterSpacing: '-0.01em' }}>{salon.nom}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ color: '#F59E0B', fontSize: 13 }}>★</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: DS.ink }}>{salon.note}</span>
            <span style={{ fontSize: 12, color: DS.muted }}>({salon.avis} avis)</span>
          </div>
          <div style={{ fontSize: 12.5, color: DS.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconMapPin size={11} color={DS.muted} /> {salon.adresse}, {salon.ville}
          </div>
        </div>
      </div>

      {/* Prestations */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {salon.prestations.map(p => (
          <span key={p} style={{ padding: '4px 10px', background: DS.bgSoft, borderRadius: 8, fontSize: 12, color: DS.muted, fontWeight: 500 }}>{p}</span>
        ))}
      </div>

      {/* Créneaux */}
      {creneaux.length > 0 ? (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
            Disponible aujourd'hui
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {creneaux.map(c => (
              <button key={c} onClick={e => { e.stopPropagation(); onClick(); }}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${DS.border}`, background: '#fff', fontSize: 13, fontWeight: 600, color: DS.ink, cursor: 'pointer', transition: 'all .15s', fontFamily: DS.font }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.background = DS.bgSoft; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = '#fff'; }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: DS.muted, fontWeight: 500 }}>
          Prochain créneau disponible demain
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function CoiffurePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [recherche, setRecherche] = useState('');
  const [villeInput, setVilleInput] = useState('');
  const [ville, setVille] = useState('');
  const [villeSuggestions, setVilleSuggestions] = useState([]);

  useEffect(() => {
    if (villeInput.length < 2) { setVilleSuggestions([]); return; }
    const controller = new AbortController();
    fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(villeInput)}&fields=nom,codesPostaux&boost=population&limit=7`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setVilleSuggestions(data.map(c => `${c.nom}${c.codesPostaux?.[0] ? ` (${c.codesPostaux[0].slice(0, 2)})` : ''}`)))
      .catch(() => {});
    return () => controller.abort();
  }, [villeInput]);

  const filtered = SALONS.filter(s => {
    const cm = !category || s.type === category;
    const sm = !recherche || s.nom.toLowerCase().includes(recherche.toLowerCase()) || s.prestations.some(p => p.toLowerCase().includes(recherche.toLowerCase()));
    return cm && sm;
  });

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font, color: DS.ink }}>
      <RecrutementBanner secteur="coiffure" />
      <PublicNavbar />

      {/* ── Hero ── */}
      <section style={{ background: DS.bg, borderBottom: `1px solid ${DS.border}`, padding: 'clamp(36px,6vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Titre */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2.125rem)', fontWeight: 900, color: DS.ink, letterSpacing: '-0.04em', margin: '0 0 6px', lineHeight: 1.12 }}>
              Coiffure & Beauté
            </h1>
            <p style={{ fontSize: 14, color: DS.muted, margin: 0, lineHeight: 1.5 }}>Réservez votre prochain rendez-vous en quelques clics</p>
          </div>

          {/* Grille types cliquables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 10, marginBottom: 24 }}>
            {TYPES.map(({ id, label, icon }) => {
              const active = category === id;
              return (
                <button key={id} onClick={() => setCategory(active ? '' : id)}
                  style={{
                    padding: '16px 8px', background: active ? DS.ink : '#fff', border: `1.5px solid ${active ? DS.ink : DS.border}`,
                    borderRadius: 14, cursor: 'pointer', textAlign: 'center', fontFamily: DS.font,
                    transition: 'all .15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = DS.shadow.sm; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? '#fff' : DS.ink, letterSpacing: '-0.01em' }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Barre ville + recherche */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {/* Ville */}
            <div style={{ flex: '1 1 220px', position: 'relative', background: '#fff', border: `1.5px solid ${DS.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', transition: 'border-color .15s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = DS.ink}
              onBlurCapture={e => e.currentTarget.style.borderColor = DS.border}>
              <IconMapPin size={16} color={DS.muted} />
              <input type="text" value={villeInput}
                onChange={e => { setVilleInput(e.target.value); if (!e.target.value) setVille(''); }}
                placeholder="Ville ou code postal"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: DS.ink, background: 'none', fontFamily: DS.font, fontWeight: 500, padding: '13px 0' }} />
              {villeSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 300, background: '#fff', borderRadius: 12, border: `1px solid ${DS.border}`, boxShadow: DS.shadow.lg, overflow: 'hidden' }}>
                  {villeSuggestions.map(v => (
                    <button key={v} onClick={() => { setVille(v); setVilleInput(v); setVilleSuggestions([]); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 14, cursor: 'pointer', background: 'none', border: 'none', color: DS.ink, transition: 'background 0.1s', fontFamily: DS.font }}
                      onMouseEnter={e => e.currentTarget.style.background = DS.bgSoft}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <IconMapPin size={12} color={DS.subtle} /> {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Recherche */}
            <div style={{ flex: '2 1 300px', background: '#fff', border: `1.5px solid ${DS.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', transition: 'border-color .15s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = DS.ink}
              onBlurCapture={e => e.currentTarget.style.borderColor = DS.border}>
              <IconSearch size={16} color={DS.muted} />
              <input value={recherche} onChange={e => setRecherche(e.target.value)}
                placeholder="Coupe, balayage, coloration, salon…"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: DS.ink, background: 'none', fontFamily: DS.font, fontWeight: 500, padding: '13px 0' }} />
            </div>
            {/* Reset */}
            {(category || ville || recherche) && (
              <button onClick={() => { setCategory(''); setVille(''); setVilleInput(''); setRecherche(''); }}
                style={{ padding: '0 18px', background: 'none', border: `1.5px solid ${DS.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: DS.font, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: DS.muted, transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink; e.currentTarget.style.color = DS.ink; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.muted; }}>
                <IconX size={12} /> Effacer
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 0 18px' }}>
            {[
              { icon: '🛡️', label: 'Salons vérifiés' },
              { icon: '📅', label: 'Réservation instantanée' },
              { icon: '⭐', label: 'Avis certifiés' },
              { icon: '💳', label: 'Paiement sécurisé' },
            ].map(s => (
              <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: DS.muted, fontWeight: 600 }}>
                <span style={{ fontSize: 13 }}>{s.icon}</span> {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Réservation ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px,3vh,32px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ background: DS.ink, borderRadius: 16, padding: 'clamp(20px,3vh,28px) clamp(20px,3vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'clamp(1rem,2.5vw,1.25rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>Envie de changer de tête ?</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)' }}>Trouvez un salon, choisissez un créneau et réservez en 30 secondes.</div>
          </div>
          <button onClick={() => navigate('/register?role=client&secteur=coiffure')}
            style={{ padding: '12px 28px', background: '#fff', color: DS.ink, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: DS.font, transition: 'opacity .15s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Réserver un créneau →
          </button>
        </div>
      </div>

      {/* ── Résultats ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px clamp(16px,4vw,48px) 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: DS.ink, letterSpacing: '-0.03em', marginBottom: 4 }}>
              {filtered.length} établissement{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </h2>
            {(category || ville) && (
              <p style={{ fontSize: 13, color: DS.muted, fontWeight: 500 }}>
                {[TYPES.find(t => t.id === category)?.label, ville].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(s => (
            <SalonCard key={s.id} salon={s} onClick={() => navigate(`/coiffure/salon/${s.id}`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: `1px solid ${DS.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: DS.ink, marginBottom: 8 }}>Aucun résultat</div>
            <div style={{ fontSize: 14, color: DS.muted }}>Essayez avec d'autres critères de recherche</div>
            <button onClick={() => { setCategory(''); setRecherche(''); setVille(''); setVilleInput(''); }}
              style={{ marginTop: 20, padding: '10px 24px', background: DS.ink, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font }}>
              Voir tous les établissements
            </button>
          </div>
        )}
      </div>

      {/* ── CTA Pro ── */}
      <HideForClient>
        <div style={{ background: DS.bgSoft, border: `1px solid ${DS.border}`, margin: '0 clamp(16px,4vw,48px) 48px', borderRadius: 20, padding: 'clamp(32px,5vh,48px) clamp(24px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 'clamp(1.125rem,2.5vw,1.5rem)', fontWeight: 800, color: DS.ink, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Vous êtes professionnel ?</h3>
            <p style={{ fontSize: 14, color: DS.muted, lineHeight: 1.55, margin: 0 }}>Gérez vos réservations, paiements et clients depuis une seule plateforme.</p>
          </div>
          <button onClick={() => navigate('/register?secteur=coiffure')}
            style={{ padding: '12px 24px', background: DS.ink, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: DS.font, transition: 'opacity .15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Créer mon espace pro
          </button>
        </div>
      </HideForClient>
    </div>
  );
}
