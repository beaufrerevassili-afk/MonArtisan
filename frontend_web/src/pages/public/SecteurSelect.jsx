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

// Lock modal state
const LOCK_CREDS = { email:'freamplecom@gmail.com', pwd:'freamplecomazerty19' };

export default function SecteurSelect() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [lockModal, setLockModal] = useState(null);
  const [lockEmail, setLockEmail] = useState('');
  const [lockPwd, setLockPwd] = useState('');
  const [lockError, setLockError] = useState('');
  const [unlockedSectors, setUnlockedSectors] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('unlocked_sectors') || '[]'); } catch { return []; }
  });

  const handleUnlock = () => {
    if (lockEmail === LOCK_CREDS.email && lockPwd === LOCK_CREDS.pwd) {
      const updated = [...new Set([...unlockedSectors, lockModal])];
      setUnlockedSectors(updated);
      sessionStorage.setItem('unlocked_sectors', JSON.stringify(updated));
      setLockError(''); setLockEmail(''); setLockPwd('');
      const t = lockModal; setLockModal(null); navigate(`/login?from=${t}`);
    } else setLockError('Identifiants incorrects');
  };

  useEffect(() => { setMounted(true); document.title = 'Freample — Montage vidéo professionnel, artisans & services premium'; }, []);

  const r1=useReveal(),r2=useReveal(),r3=useReveal(),r4=useReveal(),r5=useReveal();

  return (
    <div style={{ minHeight:'100vh', background:L.white, fontFamily:L.font, color:L.text }}>
      <PublicNavbar />

      {/* ═══════════════════════════════════════════════
          HERO — Plein écran, image cinématique
         ═══════════════════════════════════════════════ */}
      <header style={{
        background:L.noir, padding:'clamp(100px,18vh,180px) 32px clamp(80px,14vh,140px)',
        textAlign:'center', position:'relative', overflow:'hidden',
        opacity:mounted?1:0, transition:'opacity 1s ease',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1800&q=85)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.92) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold, zIndex:2 }} />

        <div style={{ maxWidth:760, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.35em', marginBottom:28 }} role="text" aria-label="Freample">Freample</div>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(36px,7vw,72px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.02, letterSpacing:'-0.02em', margin:'0 0 20px' }}>
            Vos projets méritent<br/><span style={{ fontWeight:700, fontStyle:'normal' }}>l'excellence</span>
          </h1>
          <p style={{ fontSize:'clamp(15px,1.8vw,18px)', color:'rgba(255,255,255,0.45)', lineHeight:1.65, margin:'0 auto 44px', maxWidth:480, fontWeight:300 }}>
            Montage vidéo professionnel, artisans certifiés, services de beauté — une seule plateforme premium pour tous vos besoins.
          </p>
          <button onClick={()=>navigate('/com')} style={{
            padding:'16px 48px', background:L.white, color:L.noir, border:'none',
            fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font,
            letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background=L.gold;e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.color=L.noir;}}>
            Découvrir nos services
          </button>
        </div>

        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
      </header>

      {/* ── Marquee ── */}
      <div style={{ background:L.noir, overflow:'hidden', padding:'13px 0', borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ display:'flex', animation:'marquee 28s linear infinite', whiteSpace:'nowrap' }}>
          {[...Array(3)].map((_,k)=><span key={k} style={{display:'flex'}}>
            {['Montage vidéo','TikTok','YouTube','Artisans','Coiffure','Design','Création de contenu','Réseaux sociaux','Branding'].map(w=>(
              <span key={w+k} style={{fontSize:12,color:'rgba(255,255,255,0.18)',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.15em',padding:'0 28px'}}>
                {w} <span style={{color:L.gold,margin:'0 8px'}}>·</span>
              </span>
            ))}
          </span>)}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SERVICE PRINCIPAL — Freample Com (blanc)
         ═══════════════════════════════════════════════ */}
      <section ref={r1} style={{ background:L.white, padding:'clamp(72px,10vh,110px) 32px', scrollMarginTop:20 }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:0 }}>
            {/* Image */}
            <div style={{ flex:'1 1 440px', minHeight:420, background:'url(https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80) center/cover', position:'relative' }}>
              <div style={{ position:'absolute', top:20, left:20, background:L.gold, color:'#fff', fontSize:10, fontWeight:700, padding:'5px 14px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Disponible maintenant</div>
            </div>
            {/* Content */}
            <div style={{ flex:'1 1 440px', padding:'clamp(40px,5vh,64px) clamp(32px,4vw,56px)', display:'flex', flexDirection:'column', justifyContent:'center', background:L.cream }}>
              <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:16 }}>Service phare</div>
              <h2 style={{ fontFamily:L.serif, fontSize:'clamp(28px,3.5vw,44px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 12px', lineHeight:1.12 }}>
                Freample <span style={{ fontWeight:700, fontStyle:'normal' }}>Com</span>
              </h2>
              <p style={{ fontSize:15, color:L.textSec, lineHeight:1.65, margin:'0 0 8px' }}>
                <strong>Montage vidéo professionnel</strong> pour TikTok, YouTube Shorts, Reels Instagram et clips promotionnels. Confiez-nous vos rushes, on livre un contenu prêt à publier en <strong>72 heures</strong>.
              </p>
              <p style={{ fontSize:14, color:L.textLight, lineHeight:1.6, margin:'0 0 28px' }}>
                Sous-titres animés · Musique tendance · Effets visuels · À partir de 63,45€
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <button onClick={()=>navigate('/com')} style={{ padding:'14px 36px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.05em', textTransform:'uppercase', transition:'all .25s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=L.gold;}} onMouseLeave={e=>{e.currentTarget.style.background=L.noir;}}>
                  Découvrir Freample Com
                </button>
                <button onClick={()=>navigate('/com#tarifs')} style={{ padding:'14px 28px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>
                  Voir les tarifs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Séparateur doré ── */}
      <div style={{ display:'flex', alignItems:'center', background:L.white }}>
        <div style={{ flex:1, height:1, background:L.border }} /><div style={{ width:6, height:6, borderRadius:'50%', background:L.gold, margin:'0 20px' }} /><div style={{ flex:1, height:1, background:L.border }} />
      </div>

      {/* ═══════════════════════════════════════════════
          SERVICES EN DÉVELOPPEMENT (blanc)
         ═══════════════════════════════════════════════ */}
      <section ref={r2} style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Bientôt disponibles</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:0, lineHeight:1.12 }}>
              D'autres services <span style={{ fontWeight:700, fontStyle:'normal' }}>arrivent</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:0, border:`1px solid ${L.border}` }}>
            {/* Freample Artisans */}
            <article onClick={()=>navigate('/btp')} style={{ padding:'40px 32px', display:'flex', flexDirection:'column', borderRight:`1px solid ${L.border}`, cursor:'pointer', transition:'background .2s', position:'relative' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ position:'absolute', top:16, right:16, fontSize:10, fontWeight:600, color:L.goldDark, background:L.goldLight, padding:'4px 12px', letterSpacing:'0.06em', textTransform:'uppercase' }}>En développement</div>
              <div style={{ fontSize:32, marginBottom:16 }}>🏗️</div>
              <h3 style={{ fontFamily:L.serif, fontSize:26, fontWeight:300, fontStyle:'italic', margin:'0 0 8px', letterSpacing:'-0.02em' }}>
                Freample <span style={{ fontWeight:700, fontStyle:'normal' }}>Artisans</span>
              </h3>
              <p style={{ fontSize:14, color:L.textSec, lineHeight:1.6, margin:'0 0 20px', flex:1 }}>
                Trouvez un <strong>plombier, électricien, peintre ou menuisier</strong> certifié près de chez vous. Comparez les professionnels, demandez un <strong>devis gratuit</strong> et suivez vos travaux en temps réel.
              </p>
              <span style={{ fontSize:13, fontWeight:600, color:L.gold, letterSpacing:'0.04em', textTransform:'uppercase' }}>Découvrir la démo →</span>
            </article>
            {/* Coiffure & Beauté */}
            <article onClick={()=>navigate('/coiffure')} style={{ padding:'40px 32px', display:'flex', flexDirection:'column', cursor:'pointer', transition:'background .2s', position:'relative' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ position:'absolute', top:16, right:16, fontSize:10, fontWeight:600, color:L.goldDark, background:L.goldLight, padding:'4px 12px', letterSpacing:'0.06em', textTransform:'uppercase' }}>En développement</div>
              <div style={{ fontSize:32, marginBottom:16 }}>✂️</div>
              <h3 style={{ fontFamily:L.serif, fontSize:26, fontWeight:300, fontStyle:'italic', margin:'0 0 8px', letterSpacing:'-0.02em' }}>
                Coiffure & <span style={{ fontWeight:700, fontStyle:'normal' }}>Beauté</span>
              </h3>
              <p style={{ fontSize:14, color:L.textSec, lineHeight:1.6, margin:'0 0 20px', flex:1 }}>
                <strong>Réservez votre coiffeur, barbier ou institut de beauté</strong> en quelques clics. Consultez les disponibilités, les avis clients et les tarifs des salons près de chez vous.
              </p>
              <span style={{ fontSize:13, fontWeight:600, color:L.gold, letterSpacing:'0.04em', textTransform:'uppercase' }}>Découvrir la démo →</span>
            </article>
          </div>
        </div>
      </section>

      {/* ── Image break parallaxe ── */}
      <div role="img" aria-label="Espace de travail créatif professionnel Freample" style={{ height:'clamp(180px,28vh,320px)', backgroundImage:'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed' }} />

      {/* ═══════════════════════════════════════════════
          POURQUOI FREAMPLE (crème)
         ═══════════════════════════════════════════════ */}
      <section ref={r3} style={{ background:L.cream, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Pourquoi Freample</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 48px', lineHeight:1.12 }}>
            L'exigence au service de <span style={{ fontWeight:700, fontStyle:'normal' }}>vos projets</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:32 }}>
            {[
              { icon:'⚡', title:'Rapidité', desc:'Livraison en 72h pour le montage vidéo. Devis artisan sous 24h. Réservation coiffeur instantanée.' },
              { icon:'🛡️', title:'Qualité garantie', desc:'Chaque prestation est vérifiée. Monteurs professionnels, artisans certifiés, salons notés par de vrais clients.' },
              { icon:'💎', title:'Sur mesure', desc:'Pas de template. Chaque projet est unique. Nous nous adaptons à votre vision et vos exigences.' },
              { icon:'🔒', title:'Paiement sécurisé', desc:'Transaction protégée, sans surprise. Satisfait ou refait sur toutes nos prestations vidéo.' },
            ].map(s => (
              <div key={s.title} style={{ textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:14 }}>{s.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6, letterSpacing:'-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize:13.5, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee 2 ── */}
      <div style={{ background:L.white, borderTop:`1px solid ${L.border}`, borderBottom:`1px solid ${L.border}`, overflow:'hidden', padding:'12px 0' }}>
        <div style={{ display:'flex', animation:'marquee2 32s linear infinite', whiteSpace:'nowrap' }}>
          {[...Array(3)].map((_,k)=><span key={k} style={{display:'flex'}}>
            {['Qualité','Innovation','Créativité','Rigueur','Passion','Expertise','Engagement','Authenticité'].map(w=>(
              <span key={w+k} style={{fontFamily:L.serif,fontSize:16,fontStyle:'italic',color:L.textLight,padding:'0 32px',fontWeight:400}}>{w} <span style={{color:L.gold,margin:'0 8px',fontStyle:'normal'}}>—</span></span>
            ))}
          </span>)}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          CTA FINAL (noir)
         ═══════════════════════════════════════════════ */}
      <section ref={r4} style={{ background:L.noir, padding:'clamp(72px,12vh,120px) 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:560, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em', marginBottom:20 }}>Prêt à commencer ?</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(28px,5vw,50px)', fontWeight:300, fontStyle:'italic', color:'#fff', letterSpacing:'-0.02em', lineHeight:1.08, margin:'0 0 16px' }}>
            Confiez-nous votre <span style={{ fontWeight:700, fontStyle:'normal' }}>prochain projet</span>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.6, margin:'0 0 40px', fontWeight:300 }}>
            Montage vidéo, création de contenu, artisans — commencez dès aujourd'hui avec un devis gratuit.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>navigate('/com')} style={{ padding:'16px 44px', background:L.gold, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'background .25s' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.goldDark} onMouseLeave={e=>e.currentTarget.style.background=L.gold}>
              Montage vidéo
            </button>
            <button onClick={()=>navigate('/btp')} style={{ padding:'16px 36px', background:'transparent', color:'#fff', border:`1px solid rgba(255,255,255,0.15)`, fontSize:13, fontWeight:400, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .25s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}>
              Trouver un artisan
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA PRO (blanc)
         ═══════════════════════════════════════════════ */}
      <HideForClient>
        <section ref={r5} style={{ background:L.white, padding:'clamp(48px,7vh,80px) 32px', borderTop:`1px solid ${L.border}` }}>
          <div style={{ maxWidth:800, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:28, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>Espace professionnel</div>
              <h3 style={{ fontFamily:L.serif, fontSize:'clamp(22px,3vw,32px)', fontWeight:300, fontStyle:'italic', color:L.text, margin:'0 0 6px', letterSpacing:'-0.02em' }}>
                Vous êtes <span style={{ fontWeight:700, fontStyle:'normal' }}>professionnel</span> ?
              </h3>
              <p style={{ fontSize:14, color:L.textSec, lineHeight:1.55, margin:0 }}>Gérez vos réservations, devis, factures et clients depuis une seule plateforme.</p>
            </div>
            <button onClick={()=>navigate('/register?role=patron')} style={{ padding:'14px 32px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s', flexShrink:0 }}
              onMouseEnter={e=>e.currentTarget.style.background='#333'} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
              Créer mon espace pro
            </button>
          </div>
        </section>
      </HideForClient>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:'28px 32px', borderTop:`1px solid ${L.border}`, textAlign:'center', background:L.white }}>
        <nav style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:14, flexWrap:'wrap' }}>
          {[
            { label:'Montage vidéo', href:'/com' },
            { label:'Artisans', href:'/btp' },
            { label:'Coiffure', href:'/coiffure' },
            { label:'Portfolio', href:'/com/portfolio' },
            { label:'CGU', href:'/cgu' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ fontSize:12, color:L.textSec, textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.06em', transition:'color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize:11, color:L.textLight, letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>© 2026 Freample · Tous droits réservés</p>
      </footer>

      {/* ══ MODAL DÉVERROUILLAGE ══ */}
      {lockModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={()=>{setLockModal(null);setLockError('');setLockEmail('');setLockPwd('');}}>
          <div style={{ background:L.white, padding:'36px 32px', maxWidth:400, width:'100%' }} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>Accès restreint</div>
              <div style={{ fontFamily:L.serif, fontSize:22, fontWeight:300, fontStyle:'italic', marginBottom:6 }}>Service en développement</div>
              <div style={{ fontSize:13, color:L.textSec }}>Connectez-vous pour accéder à la démo.</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:L.textSec, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Email</label>
              <input type="email" value={lockEmail} onChange={e=>setLockEmail(e.target.value)} placeholder="votre@email.com"
                style={{ width:'100%', padding:'12px 16px', border:`1px solid ${L.border}`, fontSize:15, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:L.textSec, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Mot de passe</label>
              <input type="password" value={lockPwd} onChange={e=>setLockPwd(e.target.value)} placeholder="••••••••" onKeyDown={e=>{if(e.key==='Enter')handleUnlock();}}
                style={{ width:'100%', padding:'12px 16px', border:`1px solid ${L.border}`, fontSize:15, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} />
            </div>
            {lockError && <div style={{ padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', fontSize:13, color:'#DC2626', marginBottom:14 }}>{lockError}</div>}
            <button onClick={handleUnlock} style={{ width:'100%', padding:'14px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:8 }}>Débloquer l'accès</button>
            <button onClick={()=>{setLockModal(null);setLockError('');}} style={{ width:'100%', padding:'10px', background:'none', color:L.textLight, border:'none', cursor:'pointer', fontFamily:L.font, fontSize:13 }}>Annuler</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}
        @keyframes marquee2{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}
      `}</style>
    </div>
  );
}
