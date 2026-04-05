import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import HideForClient from '../../components/public/HideForClient';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

function useReveal(){const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;el.style.opacity='0';el.style.transform='translateY(28px)';el.style.transition='opacity .9s cubic-bezier(0.25,0.46,0.45,0.94), transform .9s cubic-bezier(0.25,0.46,0.45,0.94)';const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.style.opacity='1';el.style.transform='translateY(0)';obs.disconnect();}},{threshold:0.1});obs.observe(el);return()=>obs.disconnect();},[]);return ref;}

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [choix, setChoix] = useState(null); // null = choix, 'client' = page client

  useEffect(() => { setMounted(true); document.title = 'Freample — Montage vidéo professionnel, artisans & services premium en France'; }, []);

  const r1=useReveal(),r2=useReveal(),r3=useReveal(),r4=useReveal();

  // ═══════════════════════════════════════════════════
  // ÉCRAN 1 — CHOIX CLIENT / ARTISAN
  // ═══════════════════════════════════════════════════
  if (!choix) return (
    <div style={{ minHeight:'100vh', background:L.noir, fontFamily:L.font, color:'#fff', display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}
        button:hover .choice-img{transform:scale(1.08)!important}
        button:hover .choice-overlay{background:linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.65) 100%)!important}
        button:hover .choice-border{border-color:rgba(201,169,110,0.5)!important}
      `}</style>

      {/* Navbar minimal */}
      <div style={{ padding:'20px 32px', textAlign:'center' }}>
        <div style={{ fontSize:12, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.35em' }}>Freample</div>
      </div>

      {/* Choix */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px', opacity:mounted?1:0, transition:'opacity .8s' }}>
        <h1 style={{ fontFamily:L.serif, fontSize:'clamp(28px,5vw,48px)', fontWeight:300, fontStyle:'italic', color:'#fff', textAlign:'center', letterSpacing:'-0.02em', lineHeight:1.08, margin:'0 0 12px' }}>
          Qui êtes-<span style={{ fontWeight:700, fontStyle:'normal' }}>vous</span> ?
        </h1>
        <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', marginBottom:48, textAlign:'center' }}>Choisissez votre espace pour une expérience adaptée.</p>

        <div style={{ display:'flex', gap:0, flexWrap:'wrap', justifyContent:'center', maxWidth:920, width:'100%' }}>
          {/* CLIENT */}
          <button onClick={()=>setChoix('client')}
            style={{
              flex:'1 1 360px', maxWidth:460, minHeight:'clamp(280px,40vh,420px)', cursor:'pointer', fontFamily:L.font,
              textAlign:'center', position:'relative', overflow:'hidden', border:'none', padding:0,
              animation:'fadeUp .7s .2s both',
            }}>
            {/* Photo fond */}
            <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80)', backgroundSize:'cover', backgroundPosition:'center', transition:'transform .6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
              className="choice-img" />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.75) 100%)', transition:'background .35s' }}
              className="choice-overlay" />
            {/* Bordure dorée au hover */}
            <div style={{ position:'absolute', inset:0, border:'2px solid transparent', transition:'border-color .35s', pointerEvents:'none' }} className="choice-border" />
            {/* Contenu */}
            <div style={{ position:'relative', zIndex:1, padding:'clamp(40px,6vh,64px) 36px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', boxSizing:'border-box' }}>
              <div style={{ fontFamily:L.serif, fontSize:'clamp(28px,4vw,40px)', fontWeight:300, fontStyle:'italic', color:'#fff', marginBottom:8, letterSpacing:'-0.02em' }}>
                Je suis <span style={{ fontWeight:700, fontStyle:'normal' }}>client</span>
              </div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.6, margin:'0 0 20px', maxWidth:300 }}>
                Artisans, montage vidéo, services de beauté — trouvez ce dont vous avez besoin.
              </p>
              <div style={{ fontSize:12, color:L.gold, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Découvrir →</div>
            </div>
          </button>

          {/* ARTISAN / PRO */}
          <button onClick={()=>navigate('/pro')}
            style={{
              flex:'1 1 360px', maxWidth:460, minHeight:'clamp(280px,40vh,420px)', cursor:'pointer', fontFamily:L.font,
              textAlign:'center', position:'relative', overflow:'hidden', border:'none', padding:0,
              animation:'fadeUp .7s .35s both',
            }}>
            {/* Photo fond */}
            <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80)', backgroundSize:'cover', backgroundPosition:'center', transition:'transform .6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
              className="choice-img" />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.75) 100%)', transition:'background .35s' }}
              className="choice-overlay" />
            <div style={{ position:'absolute', inset:0, border:'2px solid transparent', transition:'border-color .35s', pointerEvents:'none' }} className="choice-border" />
            {/* Contenu */}
            <div style={{ position:'relative', zIndex:1, padding:'clamp(40px,6vh,64px) 36px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', boxSizing:'border-box' }}>
              <div style={{ fontFamily:L.serif, fontSize:'clamp(28px,4vw,40px)', fontWeight:300, fontStyle:'italic', color:'#fff', marginBottom:8, letterSpacing:'-0.02em' }}>
                Je suis <span style={{ fontWeight:700, fontStyle:'normal' }}>professionnel</span>
              </div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.6, margin:'0 0 20px', maxWidth:300 }}>
                Gérez votre activité, vos devis, vos clients et votre agenda.
              </p>
              <div style={{ fontSize:12, color:L.gold, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Se connecter →</div>
            </div>
          </button>
        </div>
      </div>

      {/* Marquee métiers */}
      <div style={{ overflow:'hidden', padding:'14px 0', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', animation:'marquee 35s linear infinite', whiteSpace:'nowrap' }}>
          {[...Array(3)].map((_,k)=><span key={k} style={{display:'flex'}}>
            {['Plombier','Électricien','Peintre','Menuisier','Maçon','Carreleur','Chauffagiste','Serrurier','Couvreur','Monteur vidéo','Designer','Community manager'].map(m=>(
              <span key={m+k} style={{ fontSize:12, color:'rgba(255,255,255,0.15)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.12em', padding:'0 24px' }}>
                {m} <span style={{ color:L.gold, margin:'0 6px' }}>·</span>
              </span>
            ))}
          </span>)}
        </div>
      </div>

      {/* Footer minimal */}
      <div style={{ padding:'16px 32px', textAlign:'center' }}>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>© 2026 Freample</span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // ÉCRAN 2 — ESPACE CLIENT (simple, opérationnel)
  // ═══════════════════════════════════════════════════
  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <PublicNavbar />

      {/* ═══ TITRE + 2 CARTES ═══ */}
      <section style={{ maxWidth:900, margin:'0 auto', padding:'clamp(48px,8vh,80px) clamp(20px,4vw,40px)' }}>

        <div style={{ textAlign:'center', marginBottom:'clamp(32px,5vh,52px)' }}>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4.5vw,40px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 8px', lineHeight:1.1 }}>
            De quoi avez-vous <span style={{ fontWeight:700, fontStyle:'normal' }}>besoin</span> ?
          </h1>
          <p style={{ fontSize:15, color:L.textSec, margin:0 }}>Choisissez un service pour commencer.</p>
        </div>

        {/* CARTE PRINCIPALE — Freample Artisans */}
        <div onClick={()=>navigate('/btp')} style={{ background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', marginBottom:16, display:'flex', flexWrap:'wrap', overflow:'hidden', transition:'all .25s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.06)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
          <div style={{ flex:'1 1 320px', minHeight:260, background:'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80) center/cover', position:'relative' }}>
            <div style={{ position:'absolute', top:16, left:16, background:L.gold, color:'#fff', fontSize:10, fontWeight:700, padding:'5px 14px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Recommandé</div>
          </div>
          <div style={{ flex:'1 1 320px', padding:'clamp(28px,4vh,44px) clamp(24px,3vw,40px)', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>Artisans & Travaux</div>
            <h2 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:800, color:L.text, letterSpacing:'-0.03em', margin:'0 0 10px' }}>Freample Artisans</h2>
            <p style={{ fontSize:14, color:L.textSec, lineHeight:1.6, margin:'0 0 20px' }}>
              Plombier, électricien, peintre, menuisier — trouvez un pro certifié près de chez vous et demandez un devis gratuit.
            </p>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:12, color:L.textLight, marginBottom:20 }}>
              <span>🛡️ Artisans vérifiés</span><span>⚡ Devis sous 24h</span><span>💳 Paiement sécurisé</span>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:L.gold, letterSpacing:'0.03em' }}>Trouver un artisan →</div>
          </div>
        </div>

        {/* CARTE SECONDAIRE — Freample Com */}
        <div onClick={()=>navigate('/com')} style={{ background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', display:'flex', alignItems:'center', padding:'clamp(20px,3vh,32px) clamp(20px,3vw,32px)', gap:20, transition:'all .25s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.04)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.boxShadow='none';}}>
          <div style={{ width:56, height:56, background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>🎬</div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontSize:17, fontWeight:700, color:L.text, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Freample Com</h3>
            <p style={{ fontSize:13.5, color:L.textSec, margin:0, lineHeight:1.5 }}>Montage vidéo pro pour TikTok, YouTube, Reels — livré en 72h, à partir de 63,45€.</p>
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:L.gold, flexShrink:0 }}>Voir →</span>
        </div>

      </section>

      {/* ── Retour + Footer ── */}
      <footer style={{ padding:'20px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <button onClick={()=>setChoix(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:L.textLight, fontFamily:L.font, transition:'color .15s', marginBottom:8 }}
          onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>
          ← Changer de profil
        </button>
        <div style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase' }}>© 2026 Freample</div>
      </footer>

    </div>
  );
}
