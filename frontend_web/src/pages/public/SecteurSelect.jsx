import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useAuth } from '../../context/AuthContext';
import { useFadeUp, useScaleIn, StaggerChildren } from '../../utils/scrollAnimations';
import L from '../../design/luxe';

const DEV_EMAIL = 'freamplecom@gmail.com';

const SECTORS_PUBLIC = [
  { id:'btp', label:'Freample Artisans', icon:'🏗️', href:'/btp' },
  { id:'com', label:'Freample Com', icon:'🎬', href:'/com' },
  { id:'recrutement', label:'Recrutement', icon:'💼', href:'/recrutement' },
  { id:'pro', label:'Espace pro', icon:'🏢', href:'/pro' },
];
const SECTORS_DEV = [
  { id:'btp', label:'Freample Artisans', icon:'🏗️', href:'/btp' },
  { id:'com', label:'Freample Com', icon:'🎬', href:'/com' },
  { id:'coiffure', label:'Coiffure & Beauté', icon:'✂️', href:'/coiffure' },
  { id:'recrutement', label:'Recrutement', icon:'💼', href:'/recrutement' },
  { id:'pro', label:'Espace pro', icon:'🏢', href:'/pro' },
  { id:'portfolio', label:'Portfolio Com', icon:'🎥', href:'/com/portfolio' },
  { id:'immo', label:'Freample Immo', icon:'🏠', href:'/immo' },
  { id:'droit', label:'Freample Droit', icon:'⚖️', href:'/droit' },
  { id:'stats', label:'Statistiques', icon:'📈', href:'/admin/stats' },
];


export default function SecteurSelect() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isDev = user?.email === DEV_EMAIL;
  const menuItems = isDev ? SECTORS_DEV : SECTORS_PUBLIC;
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMounted(true); document.title = 'Freample — Artisans certifiés & montage vidéo professionnel en France'; }, []);

  const s1=useScaleIn();
  const r1=useFadeUp(), r2=useFadeUp(0.1), r3=useFadeUp();

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <RecrutementBanner />
      <PublicNavbar onMenuOpen={()=>setMenuOpen(true)} />

      {/* ══ SIDEBAR MENU — Gucci style ══ */}
      {/* Overlay */}
      <div onClick={()=>setMenuOpen(false)} style={{ position:'fixed', inset:0, zIndex:1999, background:'rgba(0,0,0,0.35)', opacity:menuOpen?1:0, pointerEvents:menuOpen?'auto':'none', transition:'opacity .35s' }} />
      {/* Panel */}
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, zIndex:2000,
        width:'clamp(300px,85vw,400px)', background:L.white,
        transform:menuOpen?'translateX(0)':'translateX(-100%)',
        transition:'transform .4s cubic-bezier(0.25,0.46,0.45,0.94)',
        display:'flex', flexDirection:'column', boxShadow:menuOpen?'8px 0 32px rgba(0,0,0,0.1)':'none',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${L.border}` }}>
          <div style={{ fontSize:12, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em' }}>Freample</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {isDev && <span style={{ fontSize:10, fontWeight:700, color:'#22C55E', background:'rgba(34,197,94,0.08)', padding:'3px 10px', borderRadius:4 }}>Dev</span>}
            <button onClick={()=>setMenuOpen(false)} style={{ background:'none', border:`1px solid ${L.border}`, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:L.textLight, transition:'border-color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>✕</button>
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
          {menuItems.map((item,i)=>(
            <button key={item.id} onClick={()=>{setMenuOpen(false);navigate(item.href);}}
              style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontFamily:L.font, textAlign:'left', padding:'14px 28px', display:'flex', alignItems:'center', gap:14, transition:'background .15s, color .15s', color:L.text }}
              onMouseEnter={e=>{e.currentTarget.style.background=L.cream;e.currentTarget.style.color=L.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color=L.text;}}>
              <span style={{ fontSize:18, width:28, textAlign:'center', opacity:0.7 }}>{item.icon}</span>
              <span style={{ fontSize:15, fontWeight:600, letterSpacing:'-0.01em' }}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'16px 28px', borderTop:`1px solid ${L.border}`, display:'flex', gap:20 }}>
          <a href="https://wa.me/33769387193" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:L.textLight, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>WhatsApp</a>
          <a href="mailto:freamplecom@gmail.com" style={{ fontSize:11, color:L.textLight, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>Contact</a>
          <a href="/cgu" style={{ fontSize:11, color:L.textLight, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>CGU</a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          HERO — Direct, une phrase, un CTA
         ═══════════════════════════════════════════════ */}
      <section style={{
        padding:'clamp(52px,9vh,88px) clamp(20px,4vw,40px) clamp(40px,6vh,64px)',
        textAlign:'center', maxWidth:700, margin:'0 auto',
        opacity:mounted?1:0, transform:mounted?'none':'translateY(12px)',
        transition:'opacity .6s, transform .6s',
      }}>
        <h1 ref={s1} style={{ fontFamily:L.serif, fontSize:'clamp(30px,5.5vw,50px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 12px', lineHeight:1.08, color:L.text }}>
          Trouvez un artisan de <span style={{ fontWeight:700, fontStyle:'normal' }}>confiance</span>
        </h1>
        <p style={{ fontSize:16, color:L.textSec, lineHeight:1.6, margin:'0 0 32px', maxWidth:480, marginLeft:'auto', marginRight:'auto' }}>
          Plombier, électricien, peintre, menuisier — décrivez votre besoin et recevez des devis gratuits sous 24h.
        </p>
        <button onClick={()=>navigate('/btp')} style={{ padding:'16px 44px', background:L.noir, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .25s' }}
          onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
          Trouver un artisan
        </button>
      </section>

      {/* ═══════════════════════════════════════════════
          SERVICES — Artisans (principal) + Com (secondaire)
         ═══════════════════════════════════════════════ */}
      <section ref={r1} style={{ maxWidth:960, margin:'0 auto', padding:'0 clamp(20px,4vw,40px) clamp(48px,7vh,72px)' }}>

        {/* Freample Artisans — grande carte */}
        <div onClick={()=>navigate('/btp')} style={{ background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', marginBottom:16, display:'flex', flexWrap:'wrap', overflow:'hidden', transition:'all .25s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.06)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
          <div style={{ flex:'1 1 360px', minHeight:280, background:'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80) center/cover', position:'relative' }}>
            <div style={{ position:'absolute', top:16, left:16, background:L.gold, color:'#fff', fontSize:10, fontWeight:700, padding:'5px 14px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Service principal</div>
          </div>
          <div style={{ flex:'1 1 360px', padding:'clamp(28px,4vh,44px) clamp(24px,3vw,40px)', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>Artisans & Travaux</div>
            <h2 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:800, color:L.text, letterSpacing:'-0.03em', margin:'0 0 10px' }}>Freample Artisans</h2>
            <p style={{ fontSize:14, color:L.textSec, lineHeight:1.6, margin:'0 0 20px' }}>
              Trouvez un artisan certifié près de chez vous, comparez les professionnels et demandez un devis gratuit en quelques clics.
            </p>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:12, color:L.textLight, marginBottom:20 }}>
              <span>🛡️ Artisans vérifiés</span><span>⚡ Devis sous 24h</span><span>💳 Paiement sécurisé</span>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:L.gold }}>Trouver un artisan →</div>
          </div>
        </div>

        {/* Freample Com — carte compacte */}
        <div onClick={()=>navigate('/com')} style={{ background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', display:'flex', alignItems:'center', padding:'clamp(20px,3vh,28px) clamp(20px,3vw,28px)', gap:20, transition:'all .25s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.04)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
          <div style={{ width:52, height:52, background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>🎬</div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:L.text, margin:'0 0 4px' }}>Freample Com</h3>
            <p style={{ fontSize:13, color:L.textSec, margin:0, lineHeight:1.5 }}>Montage vidéo pro pour TikTok, YouTube, Reels — livré en 72h, à partir de 63,45€.</p>
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:L.gold, flexShrink:0 }}>Voir →</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          COMMENT ÇA MARCHE — 3 étapes
         ═══════════════════════════════════════════════ */}
      <section ref={r2} style={{ background:L.white, borderTop:`1px solid ${L.border}`, borderBottom:`1px solid ${L.border}`, padding:'clamp(48px,7vh,72px) clamp(20px,4vw,40px)' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:12 }}>Comment ça marche</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, fontStyle:'italic', margin:'0 0 40px', letterSpacing:'-0.02em' }}>
            Simple, rapide, <span style={{ fontWeight:700, fontStyle:'normal' }}>efficace</span>
          </h2>
          <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
            {[
              { step:'1', icon:'📝', title:'Décrivez votre besoin', desc:'Quel métier, quelle ville, quel type de travaux. En 2 minutes.' },
              { step:'2', icon:'📩', title:'Recevez des devis', desc:'Des artisans vérifiés vous répondent sous 24h avec un devis gratuit.' },
              { step:'3', icon:'✅', title:'Choisissez le meilleur', desc:'Comparez les prix, les avis et choisissez en toute confiance.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign:'center' }}>
                <div style={{ width:48, height:48, margin:'0 auto 16px', background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:L.gold, marginBottom:6, letterSpacing:'0.1em' }}>ÉTAPE {s.step}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, margin:'0 0 6px' }}>{s.title}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.55, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════════════ */}
      <footer ref={r3} style={{ padding:'28px 32px', textAlign:'center', background:L.bg }}>
        <nav style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:14, flexWrap:'wrap' }}>
          {[{label:'Artisans',href:'/btp'},{label:'Montage vidéo',href:'/com'},{label:'Recrutement',href:'/recrutement'},{label:'Espace pro',href:'/pro'},{label:'CGU',href:'/cgu'}].map(l=>(
            <a key={l.label} href={l.href} style={{ fontSize:12, color:L.textSec, textDecoration:'none', transition:'color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>© 2026 Freample · Tous droits réservés</p>
      </footer>
    </div>
  );
}
