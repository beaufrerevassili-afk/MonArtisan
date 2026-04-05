import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', border:'#E8E6E1',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

export default function FreampleImmo() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <PublicNavbar />

      {/* Hero */}
      <section style={{ background:L.noir, padding:'clamp(80px,14vh,140px) 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
        <div style={{ maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em', marginBottom:24 }}>Freample Immo</div>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(34px,6vw,60px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.05, letterSpacing:'-0.02em', margin:'0 0 18px' }}>
            L'immobilier<br/><span style={{ fontWeight:700, fontStyle:'normal' }}>réinventé</span>
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', lineHeight:1.6, margin:'0 auto 36px', maxWidth:460, fontWeight:300 }}>
            Achat, vente, location, estimation — une plateforme premium pour tous vos projets immobiliers.
          </p>
          <div style={{ display:'inline-flex', padding:'10px 28px', background:'rgba(201,169,110,0.15)', border:`1px solid ${L.gold}40`, fontSize:12, fontWeight:600, color:L.gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            En cours de développement
          </div>
        </div>
      </section>

      {/* Services prévus */}
      <section style={{ padding:'clamp(56px,8vh,88px) 32px', maxWidth:900, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>Services prévus</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, fontStyle:'italic', margin:0 }}>
            Ce que proposera <span style={{ fontWeight:700, fontStyle:'normal' }}>Freample Immo</span>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:1, background:L.border }}>
          {[
            { icon:'🏠', title:'Achat & Vente', desc:'Recherche de biens, mise en relation acheteur-vendeur, accompagnement complet.' },
            { icon:'🔑', title:'Location', desc:'Appartements, maisons, locaux — gestion des annonces et des candidatures.' },
            { icon:'📊', title:'Estimation', desc:'Estimation en ligne basée sur les données du marché et les comparables.' },
            { icon:'📋', title:'Gestion locative', desc:'Quittances, états des lieux, suivi des loyers et relances automatiques.' },
            { icon:'🏗️', title:'Projets neufs', desc:'Programmes immobiliers neufs, VEFA, défiscalisation.' },
            { icon:'💼', title:'Investissement', desc:'Calcul de rentabilité, simulation de prêt, analyse de marché.' },
          ].map(s => (
            <div key={s.title} style={{ background:L.white, padding:'32px 24px', transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background=L.white}>
              <div style={{ fontSize:28, marginBottom:14 }}>{s.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6 }}>{s.title}</h3>
              <p style={{ fontSize:13, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding:'24px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:L.textLight, fontFamily:L.font, marginBottom:8, transition:'color .15s' }}
          onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>
          ← Retour à l'accueil
        </button>
        <div style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase' }}>© 2026 Freample</div>
      </footer>
    </div>
  );
}
