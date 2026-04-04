import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const U = {
  black: '#000000', white: '#FFFFFF', gray: '#F3F3F3', grayDark: '#E5E5E5',
  text: '#000000', textSec: '#5E5E5E', textLight: '#8B8B8B',
  accent: '#276EF1', green: '#05944F', greenBg: '#E6F4ED',
  font: "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif",
  r: 12, rPill: 999,
};

const SERVICES = [
  { icon:'🚗', title:'Course', desc:'D\'un point A à un point B', detail:'Économique et rapide', price:'~8–15€', color:'#F3F3F3' },
  { icon:'📅', title:'Réservation', desc:'Réservez à l\'avance', detail:'Planifiez vos déplacements', price:'Prix fixé', color:'#EEF4FF' },
  { icon:'📦', title:'Livraison Colis', desc:'Envoyez un colis', detail:'Livraison express en ville', price:'~5–20€', color:'#FFF8E6' },
];

const STEPS = [
  { n:'1', icon:'📍', title:'Entrez votre destination', desc:'Indiquez où vous voulez aller' },
  { n:'2', icon:'🚗', title:'Choisissez votre course', desc:'Comparez les options et les prix' },
  { n:'3', icon:'📱', title:'Un chauffeur arrive', desc:'Suivez votre chauffeur en temps réel' },
  { n:'4', icon:'💳', title:'Payez automatiquement', desc:'Paiement sécurisé via la plateforme' },
];

const ROUTES = [
  { from:'Paris Gare du Nord', to:'Aéroport CDG', price:'~35€', time:'45 min', icon:'✈️' },
  { from:'Paris Opéra', to:'La Défense', price:'~18€', time:'25 min', icon:'🏢' },
  { from:'Lyon Part-Dieu', to:'Aéroport St-Exupéry', price:'~28€', time:'30 min', icon:'✈️' },
  { from:'Marseille Vieux-Port', to:'Aéroport Provence', price:'~40€', time:'35 min', icon:'✈️' },
];

const STATS = [
  { value:'500+', label:'chauffeurs partenaires' },
  { value:'4.9/5', label:'note moyenne' },
  { value:'5 min', label:'temps d\'attente moyen' },
  { value:'24/7', label:'disponible' },
];

export default function FreampleCourse() {
  const navigate = useNavigate();
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <div style={{ minHeight:'100vh', background:U.white, fontFamily:U.font, color:U.text }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* ── Hero ── */}
      <div style={{ background:U.black, padding:'clamp(48px,8vh,80px) 24px 56px', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', gap:48, flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 400px', minWidth:0 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'rgba(255,255,255,0.1)', borderRadius:U.rPill, marginBottom:24 }}>
              <span style={{ fontSize:14 }}>🚗</span>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>Freample Course</span>
            </div>
            <h1 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:700, color:U.white, lineHeight:1.15, letterSpacing:'-0.03em', margin:'0 0 16px' }}>
              Allez où vous voulez,<br/>quand vous voulez
            </h1>
            <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.5, margin:'0 0 32px', maxWidth:440 }}>
              Réservez un chauffeur en quelques secondes. Course, réservation ou livraison de colis.
            </p>

            {/* Inputs */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:440 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, background:U.white, borderRadius:8, padding:'0 16px', height:56 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
                <input value={depart} onChange={e => setDepart(e.target.value)} placeholder="Adresse de départ"
                  style={{ flex:1, border:'none', outline:'none', fontSize:16, color:U.text, background:'none', fontFamily:U.font }} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12, background:U.white, borderRadius:8, padding:'0 16px', height:56 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>🔍</span>
                <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Où allez-vous ?"
                  style={{ flex:1, border:'none', outline:'none', fontSize:16, color:U.text, background:'none', fontFamily:U.font }} />
              </div>
              <button style={{ height:52, background:U.white, color:U.black, border:'none', borderRadius:8, fontSize:16, fontWeight:600, cursor:'pointer', transition:'background 0.15s', fontFamily:U.font }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5E5E5'}
                onMouseLeave={e => e.currentTarget.style.background = U.white}>
                Voir les prix →
              </button>
            </div>
          </div>

          {/* Illustration */}
          <div style={{ flex:'1 1 300px', display:'flex', justifyContent:'center' }}>
            <div style={{ width:280, height:280, borderRadius:24, background:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:100, boxShadow:'0 32px 80px rgba(0,0,0,0.4)' }}>
              🚗
            </div>
          </div>
        </div>
      </div>

      {/* ── Services ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 24px' }}>
        <h2 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.02em', marginBottom:8 }}>Nos services</h2>
        <p style={{ fontSize:15, color:U.textSec, marginBottom:32 }}>Choisissez le service qui vous convient</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {SERVICES.map(s => (
            <div key={s.title} style={{ background:s.color, border:`1px solid ${U.grayDark}`, borderRadius:U.r, padding:24, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize:36, marginBottom:16 }}>{s.icon}</div>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:14, color:U.textSec, marginBottom:8 }}>{s.desc}</div>
              <div style={{ fontSize:13, color:U.textLight, marginBottom:12 }}>{s.detail}</div>
              <div style={{ fontSize:16, fontWeight:700, color:U.text }}>{s.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trajets populaires ── */}
      <div style={{ background:U.gray, padding:'48px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <h2 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginBottom:8 }}>Trajets populaires</h2>
          <p style={{ fontSize:14, color:U.textSec, marginBottom:28 }}>Estimation de prix pour les trajets les plus demandés</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
            {ROUTES.map((r, i) => (
              <div key={i} style={{ background:U.white, borderRadius:U.r, padding:20, border:'1px solid #E5E5E5', display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:10, background:U.gray, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{r.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:U.text, marginBottom:2 }}>{r.from}</div>
                  <div style={{ fontSize:13, color:U.textSec, marginBottom:8 }}>→ {r.to}</div>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <span style={{ fontSize:16, fontWeight:700, color:U.text }}>{r.price}</span>
                    <span style={{ fontSize:12, color:U.textLight }}>· {r.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Comment ça marche ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 24px' }}>
        <h2 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginBottom:32, textAlign:'center' }}>Comment ça marche ?</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:U.rPill, background:U.gray, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{s.icon}</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{s.title}</div>
              <div style={{ fontSize:14, color:U.textSec, lineHeight:1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ background:U.black, padding:'40px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign:'center', minWidth:140 }}>
              <div style={{ fontSize:28, fontWeight:700, color:U.white, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Chauffeur ── */}
      <div style={{ padding:'56px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:28, fontWeight:700, marginBottom:12 }}>Devenez chauffeur Freample</h2>
          <p style={{ fontSize:15, color:U.textSec, marginBottom:28, lineHeight:1.5 }}>
            Gagnez de l'argent en conduisant. Choisissez vos horaires, soyez votre propre patron.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/register?role=patron&secteur=course')}
              style={{ padding:'14px 32px', background:U.black, color:U.white, border:'none', borderRadius:U.rPill, fontSize:16, fontWeight:600, cursor:'pointer', transition:'background 0.15s', fontFamily:U.font }}
              onMouseEnter={e => e.currentTarget.style.background = '#282828'}
              onMouseLeave={e => e.currentTarget.style.background = U.black}>
              S'inscrire comme chauffeur →
            </button>
            <button onClick={() => navigate('/recrutement?secteur=course')}
              style={{ padding:'14px 32px', background:'none', color:U.text, border:`1.5px solid ${U.grayDark}`, borderRadius:U.rPill, fontSize:16, fontWeight:500, cursor:'pointer', fontFamily:U.font, transition:'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = U.black}
              onMouseLeave={e => e.currentTarget.style.borderColor = U.grayDark}>
              En savoir plus
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:'28px 24px', borderTop:`1px solid ${U.grayDark}`, textAlign:'center' }}>
        <span style={{ fontSize:13, color:U.textLight }}>© 2026 Freample Course · <a href="/cgu" style={{ color:U.textSec, textDecoration:'none' }}>CGU</a> · <a href="/recrutement" style={{ color:U.textSec, textDecoration:'none' }}>Recrutement</a></span>
      </div>
    </div>
  );
}
