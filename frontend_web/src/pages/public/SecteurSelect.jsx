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
          <button onClick={()=>navigate('/login')}
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

      {/* Footer minimal */}
      <div style={{ padding:'20px 32px', textAlign:'center' }}>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>© 2026 Freample</span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // ÉCRAN 2 — ESPACE CLIENT
  // ═══════════════════════════════════════════════════
  return (
    <div style={{ minHeight:'100vh', background:L.white, fontFamily:L.font, color:L.text }}>
      <PublicNavbar />

      {/* ═══ HERO ═══ */}
      <header style={{
        background:L.noir, padding:'clamp(88px,16vh,150px) 32px clamp(80px,14vh,130px)',
        textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1800&q=85)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.92) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold, zIndex:2 }} />

        <div style={{ maxWidth:720, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.35em', marginBottom:28 }}>Espace client</div>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(36px,7vw,68px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.02, letterSpacing:'-0.02em', margin:'0 0 20px' }}>
            Vos projets méritent<br/><span style={{ fontWeight:700, fontStyle:'normal' }}>l'excellence</span>
          </h1>
          <p style={{ fontSize:'clamp(15px,1.8vw,18px)', color:'rgba(255,255,255,0.4)', lineHeight:1.65, margin:'0 auto 44px', maxWidth:480, fontWeight:300 }}>
            Artisans certifiés, montage vidéo professionnel — une plateforme premium pour tous vos besoins.
          </p>
          <button onClick={()=>navigate('/btp')} style={{ padding:'16px 48px', background:L.white, color:L.noir, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s' }}
            onMouseEnter={e=>{e.currentTarget.style.background=L.gold;e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.color=L.noir;}}>
            Trouver un artisan
          </button>
        </div>
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
      </header>

      {/* ═══ FREAMPLE ARTISANS — MIS EN AVANT (blanc, split) ═══ */}
      <section ref={r1} style={{ background:L.white, padding:'clamp(72px,10vh,110px) 0', scrollMarginTop:20 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 480px', minHeight:460, background:'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80) center/cover', position:'relative' }}>
            <div style={{ position:'absolute', inset:0, background:'rgba(10,10,10,0.15)' }} />
            <div style={{ position:'absolute', top:24, left:24, background:L.gold, color:'#fff', fontSize:10, fontWeight:700, padding:'6px 16px', letterSpacing:'0.12em', textTransform:'uppercase' }}>Service principal</div>
          </div>
          <div style={{ flex:'1 1 480px', padding:'clamp(48px,6vh,72px) clamp(36px,5vw,64px)', display:'flex', flexDirection:'column', justifyContent:'center', background:L.cream }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:16 }}>Artisans & Travaux</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(30px,4vw,48px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 14px', lineHeight:1.1 }}>
              Freample <span style={{ fontWeight:700, fontStyle:'normal' }}>Artisans</span>
            </h2>
            <p style={{ fontSize:15, color:L.textSec, lineHeight:1.65, margin:'0 0 8px' }}>
              Trouvez un <strong>plombier, électricien, peintre ou menuisier certifié</strong> près de chez vous. Comparez les professionnels, consultez les avis et demandez un <strong>devis gratuit</strong> en quelques clics.
            </p>
            <p style={{ fontSize:13.5, color:L.textLight, lineHeight:1.6, margin:'0 0 32px' }}>
              Artisans vérifiés · Devis sous 24h · Suivi en temps réel · Paiement sécurisé
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button onClick={()=>navigate('/btp')} style={{ padding:'14px 36px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.05em', textTransform:'uppercase', transition:'all .25s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                Trouver un artisan
              </button>
              <button onClick={()=>navigate('/btp')} style={{ padding:'14px 28px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'border-color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>
                Découvrir la démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Séparateur doré ── */}
      <div style={{ display:'flex', alignItems:'center', background:L.white }}><div style={{ flex:1, height:1, background:L.border }}/><div style={{ width:6, height:6, borderRadius:'50%', background:L.gold, margin:'0 20px' }}/><div style={{ flex:1, height:1, background:L.border }}/></div>

      {/* ═══ FREAMPLE COM — Service support (blanc) ═══ */}
      <section ref={r2} style={{ background:L.white, padding:'clamp(72px,10vh,110px) 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', flexWrap:'wrap', flexDirection:'row-reverse' }}>
          <div style={{ flex:'1 1 480px', minHeight:420, background:'url(https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80) center/cover', position:'relative' }}>
            <div style={{ position:'absolute', inset:0, background:'rgba(10,10,10,0.1)' }} />
          </div>
          <div style={{ flex:'1 1 480px', padding:'clamp(48px,6vh,72px) clamp(36px,5vw,64px)', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:16 }}>Création de contenu</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(28px,3.5vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 14px', lineHeight:1.1 }}>
              Freample <span style={{ fontWeight:700, fontStyle:'normal' }}>Com</span>
            </h2>
            <p style={{ fontSize:15, color:L.textSec, lineHeight:1.65, margin:'0 0 8px' }}>
              <strong>Montage vidéo professionnel</strong> pour TikTok, YouTube Shorts, Reels Instagram. Envoyez votre brief, recevez un contenu prêt à publier en <strong>72 heures</strong>.
            </p>
            <p style={{ fontSize:13.5, color:L.textLight, lineHeight:1.6, margin:'0 0 28px' }}>
              À partir de 63,45€ · Sous-titres animés · Musique tendance · Satisfait ou refait
            </p>
            <button onClick={()=>navigate('/com')} style={{ padding:'14px 36px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.05em', textTransform:'uppercase', transition:'all .25s', alignSelf:'flex-start' }}
              onMouseEnter={e=>{e.currentTarget.style.background=L.noir;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=L.noir;}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=L.text;e.currentTarget.style.borderColor=L.border;}}>
              Découvrir Freample Com
            </button>
          </div>
        </div>
      </section>

      {/* ── Image break parallaxe ── */}
      <div role="img" aria-label="Espace de travail créatif professionnel" style={{ height:'clamp(180px,28vh,320px)', backgroundImage:'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed' }} />

      {/* ═══ POURQUOI FREAMPLE (crème) ═══ */}
      <section ref={r3} style={{ background:L.cream, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Pourquoi Freample</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 48px', lineHeight:1.12 }}>
            L'exigence au service de <span style={{ fontWeight:700, fontStyle:'normal' }}>vos projets</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
            {[
              { icon:'⚡', title:'Rapidité', desc:'Devis artisan sous 24h. Montage vidéo livré en 72h.' },
              { icon:'🛡️', title:'Qualité garantie', desc:'Artisans certifiés, monteurs professionnels, avis vérifiés.' },
              { icon:'💎', title:'Sur mesure', desc:'Chaque projet est unique. On s\'adapte à votre vision.' },
              { icon:'🔒', title:'Paiement sécurisé', desc:'Transaction protégée. Satisfait ou refait.' },
            ].map(s => (
              <div key={s.title} style={{ textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:14 }}>{s.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6 }}>{s.title}</h3>
                <p style={{ fontSize:13.5, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ background:L.white, borderTop:`1px solid ${L.border}`, borderBottom:`1px solid ${L.border}`, overflow:'hidden', padding:'12px 0' }}>
        <div style={{ display:'flex', animation:'marquee 28s linear infinite', whiteSpace:'nowrap' }}>
          {[...Array(3)].map((_,k)=><span key={k} style={{display:'flex'}}>
            {['Qualité','Innovation','Créativité','Rigueur','Expertise','Engagement','Authenticité'].map(w=>(
              <span key={w+k} style={{fontFamily:L.serif,fontSize:16,fontStyle:'italic',color:L.textLight,padding:'0 32px',fontWeight:400}}>{w} <span style={{color:L.gold,margin:'0 8px',fontStyle:'normal'}}>—</span></span>
            ))}
          </span>)}
        </div>
      </div>

      {/* ═══ CTA FINAL (noir) ═══ */}
      <section ref={r4} style={{ background:L.noir, padding:'clamp(72px,12vh,120px) 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:560, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em', marginBottom:20 }}>Prêt à commencer ?</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(28px,5vw,50px)', fontWeight:300, fontStyle:'italic', color:'#fff', letterSpacing:'-0.02em', lineHeight:1.08, margin:'0 0 16px' }}>
            Confiez-nous votre <span style={{ fontWeight:700, fontStyle:'normal' }}>prochain projet</span>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.6, margin:'0 0 40px', fontWeight:300 }}>
            Artisans, montage vidéo, création de contenu — commencez avec un devis gratuit.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>navigate('/btp')} style={{ padding:'16px 44px', background:L.gold, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'background .25s' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.goldDark} onMouseLeave={e=>e.currentTarget.style.background=L.gold}>
              Trouver un artisan
            </button>
            <button onClick={()=>navigate('/com')} style={{ padding:'16px 36px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', fontSize:13, fontWeight:400, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .25s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}>
              Montage vidéo
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding:'28px 32px', borderTop:`1px solid ${L.border}`, textAlign:'center', background:L.white }}>
        <nav style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:14, flexWrap:'wrap' }}>
          {[{label:'Artisans',href:'/btp'},{label:'Montage vidéo',href:'/com'},{label:'Coiffure',href:'/coiffure'},{label:'Portfolio',href:'/com/portfolio'},{label:'CGU',href:'/cgu'}].map(l=>(
            <a key={l.label} href={l.href} style={{fontSize:12,color:L.textSec,textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.06em',transition:'color .15s'}}
              onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize:11, color:L.textLight, letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>© 2026 Freample · Tous droits réservés</p>
      </footer>

      {/* Retour au choix */}
      <button onClick={()=>setChoix(null)} style={{ position:'fixed', bottom:28, left:28, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)', border:`1px solid ${L.border}`, borderRadius:10, padding:'8px 16px', fontSize:12, fontWeight:500, color:L.textSec, cursor:'pointer', fontFamily:L.font, zIndex:100, transition:'all .2s', letterSpacing:'0.03em' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=L.noir;e.currentTarget.style.color=L.noir;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.color=L.textSec;}}>
        ← Changer de profil
      </button>

      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}
