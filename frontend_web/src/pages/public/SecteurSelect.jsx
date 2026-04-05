import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useAuth } from '../../context/AuthContext';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

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
  { id:'restaurant', label:'Restauration', icon:'🍽️', href:'/restaurant' },
  { id:'eat', label:'Freample Eat', icon:'🛵', href:'/eat' },
  { id:'course', label:'Freample Course', icon:'🚗', href:'/course' },
  { id:'vacances', label:'Vacances & Séjours', icon:'🏖️', href:'/vacances' },
  { id:'recrutement', label:'Recrutement', icon:'💼', href:'/recrutement' },
  { id:'pro', label:'Espace pro', icon:'🏢', href:'/pro' },
  { id:'portfolio', label:'Portfolio Com', icon:'🎥', href:'/com/portfolio' },
];

function useReveal(){const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='opacity .8s cubic-bezier(0.25,0.46,0.45,0.94), transform .8s cubic-bezier(0.25,0.46,0.45,0.94)';const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.style.opacity='1';el.style.transform='translateY(0)';obs.disconnect();}},{threshold:0.1});obs.observe(el);return()=>obs.disconnect();},[]);return ref;}

export default function SecteurSelect() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const isDev = user?.email === DEV_EMAIL;
  const menuItems = isDev ? SECTORS_DEV : SECTORS_PUBLIC;
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMounted(true); document.title = 'Freample — Artisans certifiés & montage vidéo professionnel en France'; }, []);

  const r1=useReveal(), r2=useReveal(), r3=useReveal();

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* ══ HAMBURGER ══ */}
      <button onClick={()=>setMenuOpen(true)} aria-label="Menu"
        style={{ position:'fixed', top:72, left:'clamp(16px,3vw,32px)', zIndex:250, width:40, height:40, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:`1px solid rgba(0,0,0,0.06)`, borderRadius:10, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'all .25s' }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}}>
        <span style={{ width:16, height:1.5, background:L.noir }}/><span style={{ width:16, height:1.5, background:L.noir }}/>
      </button>

      {/* ══ FULLSCREEN MENU ══ */}
      <div style={{ position:'fixed', inset:0, zIndex:2000, background:L.noir, opacity:menuOpen?1:0, pointerEvents:menuOpen?'auto':'none', transition:'opacity .4s cubic-bezier(0.4,0,0.2,1)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
        <button onClick={()=>setMenuOpen(false)} style={{ position:'absolute', top:20, right:28, background:'none', border:'none', cursor:'pointer', color:'#fff', fontSize:28, fontWeight:200, transition:'color .2s' }}
          onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='#fff'}>✕</button>
        <div style={{ position:'absolute', top:24, left:28, fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em' }}>Freample</div>
        {isDev && <div style={{ position:'absolute', top:24, right:80, fontSize:10, fontWeight:700, color:'#22C55E', background:'rgba(34,197,94,0.1)', padding:'3px 10px', borderRadius:4 }}>Mode dev</div>}
        <nav style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          {menuItems.map((item,i)=>(
            <button key={item.id} onClick={()=>{setMenuOpen(false);navigate(item.href);}}
              style={{ background:'none', border:'none', cursor:'pointer', fontFamily:L.serif, fontSize:'clamp(22px,4vw,38px)', fontWeight:300, fontStyle:'italic', color:'#fff', padding:'10px 0', letterSpacing:'-0.02em', opacity:menuOpen?1:0, transform:menuOpen?'translateY(0)':'translateY(20px)', transition:`opacity .4s ${0.1+i*0.05}s, transform .4s ${0.1+i*0.05}s, color .2s`, display:'flex', alignItems:'center', gap:14 }}
              onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='#fff'}>
              <span style={{ fontSize:'clamp(18px,2.5vw,24px)', fontStyle:'normal', opacity:0.5 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ position:'absolute', bottom:28, display:'flex', gap:24, opacity:menuOpen?1:0, transition:'opacity .5s .4s' }}>
          <a href="https://wa.me/33769387193" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.1em', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.3)'}>WhatsApp</a>
          <a href="mailto:freamplecom@gmail.com" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.1em', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.3)'}>Contact</a>
          <a href="/cgu" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.1em', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.3)'}>CGU</a>
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
        <h1 style={{ fontFamily:L.serif, fontSize:'clamp(30px,5.5vw,50px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 12px', lineHeight:1.08, color:L.text }}>
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
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
          </div>
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
