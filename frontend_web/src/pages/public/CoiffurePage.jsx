import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import HideForClient from '../../components/public/HideForClient';

// ── Planity-inspired colors ─────────────────────────────────────────────────
const P = {
  primary: '#625df5',
  primaryHover: '#1f1ab9',
  dark: '#202020',
  darkHover: '#000000',
  text: '#202020',
  textSec: '#6b7280',
  textLight: '#9ca3af',
  bg: '#ffffff',
  bgSoft: '#f7f7f7',
  border: '#eef0f2',
  borderHover: '#d1d5db',
  green: '#16a34a',
  greenBg: '#f0fdf4',
  gold: '#f59e0b',
  font: "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif",
  shadow: '0 4px 8px -2px rgba(26,27,31,0.08)',
  shadowHover: '0 1px 12px 1px rgba(0,0,0,0.15)',
  r: 12,
};

// ── Data ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:'tout',     label:'Tout',              icon:'✨' },
  { id:'coiffeur', label:'Coiffeur',          icon:'✂️' },
  { id:'barbier',  label:'Barbier',           icon:'🪒' },
  { id:'manucure', label:'Manucure',          icon:'💅' },
  { id:'beaute',   label:'Institut de beauté', icon:'🌸' },
  { id:'bienetre', label:'Bien-être & Spa',   icon:'🧘' },
];

const CRENEAUX = ['9:00','9:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

const SALONS = [
  { id:'1', nom:'Salon Léa',            type:'coiffeur', ville:'Paris 11e', adresse:'24 rue de la Roquette',    note:4.9, avis:142, img:'SL', color:'#E8C5D0', prochainCreneau:'10:00', prestations:['Coupe femme · 38€','Balayage · 95€','Brushing · 25€'] },
  { id:'2', nom:'Barbershop Alex',       type:'barbier',  ville:'Paris 3e',  adresse:'8 rue de Bretagne',       note:5.0, avis:67,  img:'BA', color:'#A8B8D8', prochainCreneau:'9:30',  prestations:['Coupe homme · 22€','Rasoir droit · 28€','Barbe · 15€'] },
  { id:'3', nom:'Studio Inès',           type:'coiffeur', ville:'Paris 18e', adresse:'52 rue Lepic',            note:4.7, avis:89,  img:'SI', color:'#C5B0D8', prochainCreneau:'11:00', prestations:['Coupe + Couleur · 85€','Kératine · 120€','Mèches · 75€'] },
  { id:'4', nom:'Atelier Beauté Marais', type:'beaute',   ville:'Paris 4e',  adresse:'12 rue des Archives',     note:4.8, avis:204, img:'AB', color:'#B8D0C0', prochainCreneau:'14:00', prestations:['Soin visage · 55€','Manucure · 28€','Épilation · 22€'] },
  { id:'5', nom:'Le Barbier du Marais',  type:'barbier',  ville:'Paris 4e',  adresse:'27 rue Vieille du Temple', note:4.6, avis:156, img:'BM', color:'#D0B898', prochainCreneau:null,    prestations:['Coupe ciseau · 25€','Rasage · 20€','Coupe + barbe · 38€'] },
  { id:'6', nom:'Spa Lumière',           type:'bienetre', ville:'Paris 8e',  adresse:'5 avenue Montaigne',      note:4.9, avis:78,  img:'SP', color:'#A8C5D8', prochainCreneau:'15:00', prestations:['Massage 60min · 90€','Spa privé · 120€','Soin corps · 70€'] },
  { id:'7', nom:'Hair Studio République',type:'coiffeur', ville:'Paris 10e', adresse:'15 place de la République',note:4.5, avis:312, img:'HS', color:'#D8C5A8', prochainCreneau:'9:00',  prestations:['Coupe femme · 35€','Coloration · 65€','Lissage · 150€'] },
  { id:'8', nom:'Nails Factory',         type:'manucure', ville:'Paris 6e',  adresse:'8 rue de Rennes',         note:4.8, avis:198, img:'NF', color:'#D8A8B8', prochainCreneau:'10:30', prestations:['Manucure gel · 35€','Pose complète · 48€','Nail art · 55€'] },
];

// ── Components ──────────────────────────────────────────────────────────────

function SalonCard({ salon, onClick }) {
  const [hover, setHover] = useState(false);
  const creneaux = salon.prochainCreneau
    ? CRENEAUX.filter(c => c >= salon.prochainCreneau).slice(0, 4)
    : [];

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: P.bg,
        border: `1px solid ${hover ? P.borderHover : P.border}`,
        borderRadius: P.r,
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: hover ? P.shadowHover : P.shadow,
      }}>
      {/* Top: avatar + info */}
      <div style={{ display:'flex', gap:14, marginBottom:14 }}>
        <div style={{
          width:56, height:56, borderRadius:P.r, flexShrink:0,
          background: salon.color,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, fontWeight:800, color:'rgba(255,255,255,0.95)',
        }}>{salon.img}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:16, fontWeight:600, color:P.text, lineHeight:1.3, marginBottom:2 }}>{salon.nom}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ color:P.gold, fontSize:13 }}>★</span>
            <span style={{ fontSize:14, fontWeight:600, color:P.text }}>{salon.note}</span>
            <span style={{ fontSize:13, color:P.textSec }}>({salon.avis} avis)</span>
          </div>
          <div style={{ fontSize:13, color:P.textSec }}>{salon.adresse}, {salon.ville}</div>
        </div>
      </div>

      {/* Prestations */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
        {salon.prestations.map(p => (
          <span key={p} style={{
            padding:'4px 10px', background:P.bgSoft, borderRadius:6,
            fontSize:12, color:P.textSec, fontWeight:500,
          }}>{p}</span>
        ))}
      </div>

      {/* Créneaux dispos */}
      {creneaux.length > 0 ? (
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:P.green, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:P.green, display:'inline-block' }} />
            Disponible aujourd'hui
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {creneaux.map(c => (
              <button key={c} onClick={e => { e.stopPropagation(); onClick(); }}
                style={{
                  padding:'8px 14px', borderRadius:8,
                  border:`1.5px solid ${P.border}`, background:P.bg,
                  fontSize:13, fontWeight:600, color:P.text,
                  cursor:'pointer', transition:'all 0.15s',
                  minHeight:38,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = P.primary; e.currentTarget.style.color = P.primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.text; }}
              >{c}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize:13, color:P.textLight, fontWeight:500 }}>
          Prochain créneau disponible demain →
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function CoiffurePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('tout');
  const [recherche, setRecherche] = useState('');
  const [ville, setVille] = useState('');

  const filtered = SALONS.filter(s => {
    const cm = category === 'tout' || s.type === category;
    const sm = !recherche || s.nom.toLowerCase().includes(recherche.toLowerCase()) || s.prestations.some(p => p.toLowerCase().includes(recherche.toLowerCase()));
    return cm && sm;
  });

  return (
    <div style={{ minHeight:'100vh', background:P.bg, fontFamily:P.font, color:P.text }}>
      <RecrutementBanner secteur="coiffure" />
      <PublicNavbar />

      {/* ── Hero sombre Planity-style ── */}
      <div style={{
        background:'linear-gradient(160deg, #0f0a2e 0%, #1a1145 40%, #2d1b69 70%, #4a2c8a 100%)',
        padding:'clamp(48px,8vh,80px) 24px 48px',
        textAlign:'center',
      }}>
        <h1 style={{
          fontSize:'clamp(28px,5vw,44px)', fontWeight:700, color:'#fff',
          letterSpacing:'-0.03em', lineHeight:1.15, marginBottom:12, maxWidth:700, margin:'0 auto 12px',
        }}>
          Réservez votre coiffeur<br />en quelques clics
        </h1>
        <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(255,255,255,0.7)', marginBottom:32, maxWidth:500, margin:'0 auto 32px', lineHeight:1.5 }}>
          Des milliers de salons, barbiers et instituts de beauté près de chez vous
        </p>

        {/* Search bar Planity-style */}
        <div style={{
          maxWidth:640, margin:'0 auto',
          background:P.bg, borderRadius:P.r,
          boxShadow:'0 4px 24px rgba(0,0,0,0.15)',
          display:'flex', alignItems:'stretch',
          overflow:'hidden', flexWrap:'wrap',
        }}>
          <div style={{ flex:'1 1 220px', padding:'14px 18px', borderRight:`1px solid ${P.border}`, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <label style={{ fontSize:11, fontWeight:600, color:P.textLight, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Prestation ou salon</label>
            <input value={recherche} onChange={e => setRecherche(e.target.value)}
              placeholder="Coupe, balayage, coloration…"
              style={{ border:'none', outline:'none', fontSize:16, color:P.text, background:'none', fontFamily:P.font, padding:0, width:'100%' }} />
          </div>
          <div style={{ flex:'1 1 160px', padding:'14px 18px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <label style={{ fontSize:11, fontWeight:600, color:P.textLight, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Localisation</label>
            <input value={ville} onChange={e => setVille(e.target.value)}
              placeholder="Paris, Lyon, Marseille…"
              style={{ border:'none', outline:'none', fontSize:16, color:P.text, background:'none', fontFamily:P.font, padding:0, width:'100%' }} />
          </div>
          <button style={{
            padding:'16px 28px', background:P.dark, border:'none',
            cursor:'pointer', color:'#fff', fontSize:15, fontWeight:600,
            transition:'background 0.15s', minHeight:52, flex:'0 0 auto',
          }}
            onMouseEnter={e => e.currentTarget.style.background = P.darkHover}
            onMouseLeave={e => e.currentTarget.style.background = P.dark}>
            Rechercher
          </button>
        </div>
      </div>

      {/* ── Categories Planity-style ── */}
      <div style={{
        borderBottom:`1px solid ${P.border}`, background:P.bg,
        padding:'0 clamp(16px,4vw,48px)',
        overflowX:'auto', scrollbarWidth:'none',
        WebkitOverflowScrolling:'touch',
      }}>
        <div style={{ display:'flex', gap:0, maxWidth:900, margin:'0 auto' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              style={{
                padding:'14px 18px', background:'none', border:'none',
                borderBottom:`2px solid ${category === c.id ? P.primary : 'transparent'}`,
                fontSize:14, fontWeight: category === c.id ? 600 : 400,
                color: category === c.id ? P.text : P.textSec,
                cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
                fontFamily:P.font, display:'flex', alignItems:'center', gap:6,
              }}>
              <span style={{ fontSize:16 }}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px clamp(16px,4vw,48px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:P.text, letterSpacing:'-0.02em', marginBottom:4 }}>
              {category === 'tout' ? 'Tous les établissements' : CATEGORIES.find(c => c.id === category)?.label || 'Résultats'}
            </h2>
            <p style={{ fontSize:14, color:P.textSec }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} {ville ? `à ${ville || 'proximité'}` : 'près de vous'}</p>
          </div>
        </div>

        {/* Salon grid */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))',
          gap:20,
        }}>
          {filtered.map(s => (
            <SalonCard key={s.id} salon={s} onClick={() => navigate(`/coiffure/salon/${s.id}`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:P.textSec }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div style={{ fontSize:18, fontWeight:600, color:P.text, marginBottom:8 }}>Aucun résultat</div>
            <div style={{ fontSize:14 }}>Essayez avec d'autres critères de recherche</div>
          </div>
        )}
      </div>

      {/* ── Comment ça marche ── */}
      <div style={{ background:P.bgSoft, padding:'64px clamp(16px,4vw,48px)', borderTop:`1px solid ${P.border}` }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:26, fontWeight:700, color:P.text, marginBottom:8 }}>Comment ça marche ?</h2>
          <p style={{ fontSize:15, color:P.textSec, marginBottom:40 }}>Réservez en 3 étapes simples</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:32 }}>
            {[
              { step:'1', icon:'🔍', title:'Cherchez', desc:'Trouvez un salon, barbier ou institut près de chez vous' },
              { step:'2', icon:'📅', title:'Réservez', desc:'Choisissez votre créneau et réservez en ligne gratuitement' },
              { step:'3', icon:'✂️', title:'Profitez', desc:'Rendez-vous au salon à l\'heure prévue et profitez !' },
            ].map(s => (
              <div key={s.step} style={{ padding:'24px 16px' }}>
                <div style={{
                  width:56, height:56, borderRadius:14, margin:'0 auto 16px',
                  background:P.bg, border:`1px solid ${P.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:24, boxShadow:P.shadow,
                }}>{s.icon}</div>
                <div style={{ fontSize:17, fontWeight:600, color:P.text, marginBottom:8 }}>{s.title}</div>
                <div style={{ fontSize:14, color:P.textSec, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Pro (caché pour clients) ── */}
      <HideForClient>
        <div style={{ background:P.dark, padding:'56px clamp(16px,4vw,48px)', textAlign:'center' }}>
          <div style={{ maxWidth:600, margin:'0 auto' }}>
            <h2 style={{ fontSize:24, fontWeight:700, color:'#fff', marginBottom:12 }}>Vous êtes professionnel ?</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.6)', marginBottom:28, lineHeight:1.5 }}>
              Rejoignez Freample et gérez vos réservations, paiements et clients depuis une seule plateforme.
            </p>
            <button onClick={() => navigate('/register?secteur=coiffure')}
              style={{ padding:'14px 32px', background:P.primary, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', transition:'background 0.15s', minHeight:48, fontFamily:P.font }}
              onMouseEnter={e => e.currentTarget.style.background = P.primaryHover}
              onMouseLeave={e => e.currentTarget.style.background = P.primary}>
              Créer mon espace pro →
            </button>
          </div>
        </div>
      </HideForClient>

      {/* ── Footer mini ── */}
      <div style={{ padding:'32px clamp(16px,4vw,48px)', borderTop:`1px solid ${P.border}`, textAlign:'center' }}>
        <div style={{ fontSize:13, color:P.textLight }}>
          © 2026 Freample · <a href="/cgu" style={{ color:P.textSec, textDecoration:'none' }}>CGU</a> · <a href="/recrutement" style={{ color:P.textSec, textDecoration:'none' }}>Recrutement</a>
        </div>
      </div>
    </div>
  );
}
