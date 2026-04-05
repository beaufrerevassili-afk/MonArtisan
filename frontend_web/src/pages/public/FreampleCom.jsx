import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import { getTarifs } from '../../data/tarifsCom';
import api from '../../services/api';

// ── LVMH-inspired palette ──
const L = {
  bg: '#FAFAF8',
  white: '#FFFFFF',
  noir: '#0A0A0A',
  text: '#1A1A1A',
  textSec: '#6B6B6B',
  textLight: '#A0A0A0',
  gold: '#C9A96E',
  goldLight: '#F5EFE0',
  goldDark: '#8B7240',
  border: '#E8E6E1',
  borderLight: '#F0EDE8',
  accent: '#1A1A1A',
  font: "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif",
};

const inp = { width:'100%', padding:'14px 16px', borderRadius:4, border:`1px solid ${L.border}`, fontSize:15, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white, transition:'border-color .2s' };
const lbl = { fontSize:12, fontWeight:600, color:L.textSec, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' };

export default function FreampleCom() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState({ type:'', format:'', quantite:'1', style:'', reference:'', options:[], description:'', nom:'', email:'', deadline:'' });
  const [sending, setSending] = useState(false);
  const [suiviToken, setSuiviToken] = useState(null);
  const [tarifs, setTarifs] = useState(getTarifs());
  const [packs, setPacks] = useState([
    { nom:'Starter', prix:149, desc:'4 TikToks par mois', populaire:false, features:['4 TikToks / mois','Sous-titres animés','Musique tendance','1 révision / vidéo','Livraison 72h'] },
    { nom:'Growth',  prix:349, desc:'10 TikToks + 5 Reels', populaire:true, features:['10 TikToks / mois','5 Reels Instagram','Sous-titres + effets','2 révisions / vidéo','Livraison 72h','Stratégie contenu'] },
    { nom:'Pro',     prix:699, desc:'20 TikToks + gestion RS', populaire:false, features:['20 TikToks / mois','10 Reels Instagram','Gestion 1 réseau social','Révisions illimitées','Livraison 72h','Appel stratégie mensuel'] },
  ]);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    api.get('/com/tarifs').then(r => {
      if (r.data.tarifs) setTarifs(r.data.tarifs);
      if (r.data.packs) setPacks(r.data.packs);
    }).catch(() => {});
    api.get('/com/portfolio').then(r => setPortfolio(r.data.items || [])).catch(() => {});
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);

  const f = (k) => ({ value:brief[k], onChange:e=>setBrief(p=>({...p,[k]:e.target.value})) });
  const toggleOpt = (v) => setBrief(p=>({...p, options: p.options.includes(v) ? p.options.filter(x=>x!==v) : [...p.options, v] }));

  const scrollTo = (id) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 400);
  };

  const MENU_ITEMS = [
    { label:'Nos expertises', id:'expertises' },
    { label:'Portfolio', id:'portfolio' },
    { label:'Tarifs & Formules', id:'tarifs' },
    { label:'Tous nos prix', id:'grille' },
    { label:'Nous contacter', id:'contact' },
    { label:'Demander un devis', action:()=>{ setMenuOpen(false); setTimeout(()=>setStep(1), 400); } },
  ];

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <PublicNavbar />

      {/* ══ HAMBURGER — discret, toujours visible ══ */}
      <button onClick={()=>setMenuOpen(true)} aria-label="Menu"
        style={{
          position:'fixed', top:14, right:'clamp(16px,4vw,48px)', zIndex:1100,
          width:40, height:40, background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
          border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, cursor:'pointer',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
          transition:'all .25s',
        }}
        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}>
        <span style={{ width:16, height:1.5, background:'#fff', display:'block' }} />
        <span style={{ width:16, height:1.5, background:'#fff', display:'block' }} />
      </button>

      {/* ══ FULLSCREEN OVERLAY MENU ══ */}
      <div style={{
        position:'fixed', inset:0, zIndex:2000,
        background:L.noir,
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
        transition:'opacity .45s cubic-bezier(0.4,0,0.2,1)',
        display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
      }}>
        {/* Close button */}
        <button onClick={()=>setMenuOpen(false)}
          style={{
            position:'absolute', top:20, right:28, background:'none', border:'none',
            cursor:'pointer', color:'#fff', fontSize:28, fontWeight:200,
            width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center',
            transition:'color .2s',
          }}
          onMouseEnter={e=>e.currentTarget.style.color=L.gold}
          onMouseLeave={e=>e.currentTarget.style.color='#fff'}>
          ✕
        </button>

        {/* Brand */}
        <div style={{
          position:'absolute', top:24, left:28,
          fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em',
        }}>
          Freample Com
        </div>

        {/* Menu items */}
        <nav style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
          {MENU_ITEMS.map((item, i) => (
            <button key={item.label}
              onClick={()=> item.action ? item.action() : scrollTo(item.id)}
              style={{
                background:'none', border:'none', cursor:'pointer', fontFamily:L.font,
                fontSize:'clamp(24px,4.5vw,40px)', fontWeight:300, color:'#fff',
                padding:'14px 0', letterSpacing:'-0.02em',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity .4s ${0.15 + i*0.06}s, transform .4s ${0.15 + i*0.06}s, color .2s`,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.color=L.gold; }}
              onMouseLeave={e=>{ e.currentTarget.style.color='#fff'; }}>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom info */}
        <div style={{
          position:'absolute', bottom:28, display:'flex', gap:32,
          opacity: menuOpen ? 1 : 0, transition:'opacity .5s .4s',
        }}>
          <a href="https://wa.me/33769387193" target="_blank" rel="noopener noreferrer"
            style={{ fontSize:12, color:'rgba(255,255,255,0.35)', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.1em', transition:'color .2s' }}
            onMouseEnter={e=>e.currentTarget.style.color=L.gold}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
            WhatsApp
          </a>
          <a href="mailto:freamplecom@gmail.com"
            style={{ fontSize:12, color:'rgba(255,255,255,0.35)', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.1em', transition:'color .2s' }}
            onMouseEnter={e=>e.currentTarget.style.color=L.gold}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
            Email
          </a>
        </div>
      </div>

      {/* ══ HERO — Full noir + photo cinématique ══ */}
      <section style={{
        background:L.noir, padding:'clamp(72px,12vh,120px) 32px clamp(64px,10vh,100px)',
        textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        {/* Background video */}
        <video autoPlay muted loop playsInline
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.3 }}
          src="https://videos.pexels.com/video-files/7710243/7710243-uhd_2560_1440_25fps.mp4"
        />
        {/* Dark gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 100%)' }} />
        {/* Subtle gold line */}
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold, zIndex:2 }} />

        <div style={{ maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:24 }}>
            Freample Com
          </div>
          <h1 style={{
            fontSize:'clamp(32px,6vw,56px)', fontWeight:300, color:'#fff',
            lineHeight:1.1, letterSpacing:'-0.03em', margin:'0 0 20px',
          }}>
            L'excellence du<br/><span style={{ fontWeight:700 }}>montage vidéo</span>
          </h1>
          <p style={{
            fontSize:'clamp(15px,1.8vw,18px)', color:'rgba(255,255,255,0.5)',
            lineHeight:1.65, margin:'0 auto 40px', maxWidth:460, fontWeight:300,
          }}>
            TikTok, Reels, YouTube — un rendu professionnel,<br/>livré en 72 heures.
          </p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>setStep(1)} style={{
              padding:'16px 40px', background:L.white, color:L.noir, border:'none',
              fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:L.font,
              letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .25s',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background=L.gold; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=L.white; e.currentTarget.style.color=L.noir; }}>
              Demander un devis
            </button>
            <a href="https://wa.me/33769387193?text=Bonjour, je suis intéressé par vos services Freample Com" target="_blank" rel="noopener noreferrer"
              style={{
                padding:'16px 32px', background:'transparent', color:'#fff',
                border:`1px solid rgba(255,255,255,0.2)`, fontSize:14, fontWeight:400,
                cursor:'pointer', fontFamily:L.font, textDecoration:'none',
                letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .25s',
                display:'inline-flex', alignItems:'center', gap:10,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}>
              Nous contacter
            </a>
          </div>
        </div>

        {/* Bottom gold line */}
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
      </section>

      {/* ══ SAVOIR-FAIRE ══ */}
      <section id="expertises" style={{ padding:'clamp(56px,8vh,88px) 32px', maxWidth:960, margin:'0 auto', scrollMarginTop:20 }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>Nos expertises</div>
          <h2 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, letterSpacing:'-0.02em', margin:0, lineHeight:1.2 }}>
            Tout ce dont vos <span style={{ fontWeight:700 }}>réseaux</span> ont besoin
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:1, background:L.border }}>
          {[
            { icon:'🎬', title:'Montage vidéo', sub:'TikTok, Reels, YouTube — montage dynamique et professionnel' },
            { icon:'🎨', title:'Direction artistique', sub:'Identité visuelle, visuels, branding sur mesure' },
            { icon:'📱', title:'Gestion réseaux', sub:'Planning éditorial, publications, community management' },
            { icon:'💬', title:'Sous-titres & SFX', sub:'Sous-titres animés, musiques tendance, effets sonores' },
            { icon:'📈', title:'Stratégie digitale', sub:'Meta Ads, Google Ads, analyse de performance' },
            { icon:'🎙️', title:'Production contenu', sub:'Scripts, voix-off, tournage si nécessaire' },
          ].map(s=>(
            <div key={s.title} style={{ background:L.white, padding:'36px 28px' }}>
              <div style={{ fontSize:28, marginBottom:16 }}>{s.icon}</div>
              <div style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:8, letterSpacing:'-0.01em' }}>{s.title}</div>
              <div style={{ fontSize:13.5, color:L.textSec, lineHeight:1.6 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CHIFFRES CLÉS ══ */}
      <section style={{ background:L.noir, padding:'clamp(48px,7vh,72px) 32px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'flex', justifyContent:'center', gap:'clamp(32px,6vw,80px)', flexWrap:'wrap', textAlign:'center' }}>
          {[
            { val:'72h', label:'Délai de livraison' },
            { val:'49€', label:'À partir de' },
            { val:'100%', label:'Satisfait ou refait' },
          ].map(s=>(
            <div key={s.val}>
              <div style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:200, color:L.gold, letterSpacing:'-0.03em', lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:8, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PORTFOLIO ══ */}
      {portfolio.length > 0 && (
        <section id="portfolio" style={{ padding:'clamp(56px,8vh,88px) 32px', maxWidth:960, margin:'0 auto', scrollMarginTop:20 }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>Portfolio</div>
            <h2 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, letterSpacing:'-0.02em', margin:0, lineHeight:1.2 }}>
              Nos <span style={{ fontWeight:700 }}>réalisations</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
            {portfolio.map(item => (
              <a key={item.id} href={item.video_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
                <div style={{ overflow:'hidden', transition:'all .3s', cursor:'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ height:200, background:L.noir, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.titre} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    ) : (
                      <span style={{ fontSize:48, opacity:0.15 }}>🎬</span>
                    )}
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)' }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>▶</div>
                    </div>
                  </div>
                  <div style={{ padding:'16px 4px' }}>
                    <div style={{ fontSize:14, fontWeight:600, color:L.text, marginBottom:4 }}>{item.titre}</div>
                    {item.description && <div style={{ fontSize:13, color:L.textSec }}>{item.description}</div>}
                    <div style={{ fontSize:11, color:L.gold, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginTop:8 }}>{item.categorie}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ══ CONTACT — Élégant ══ */}
      <section id="contact" style={{ padding:'0 32px clamp(48px,7vh,72px)', maxWidth:700, margin:'0 auto', scrollMarginTop:20 }}>
        <div style={{ background:L.white, border:`1px solid ${L.border}`, padding:'40px 36px', display:'flex', alignItems:'center', gap:28, flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 280px' }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:8 }}>Conseil personnalisé</div>
            <div style={{ fontSize:20, fontWeight:300, color:L.text, letterSpacing:'-0.02em', lineHeight:1.35, marginBottom:6 }}>
              Vous avez un projet ?<br/><span style={{ fontWeight:700 }}>Parlons-en.</span>
            </div>
            <div style={{ fontSize:13.5, color:L.textSec, lineHeight:1.55 }}>Réponse sous 2 heures, devis gratuit et sans engagement.</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, flexShrink:0 }}>
            <a href="https://wa.me/33769387193?text=Bonjour, j'aimerais discuter d'un projet" target="_blank" rel="noopener noreferrer"
              style={{ padding:'13px 28px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, textDecoration:'none', textAlign:'center', letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#333'}
              onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
              WhatsApp
            </a>
            <a href="mailto:freamplecom@gmail.com?subject=Demande d'information Freample Com"
              style={{ padding:'13px 28px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font, textDecoration:'none', textAlign:'center', letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir}
              onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>
              Email
            </a>
          </div>
        </div>
      </section>

      {/* ══ FORMULES ══ */}
      <section id="tarifs" style={{ background:L.white, borderTop:`1px solid ${L.border}`, padding:'clamp(56px,8vh,88px) 32px', scrollMarginTop:20 }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>Tarification</div>
            <h2 style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, letterSpacing:'-0.02em', margin:'0 0 8px', lineHeight:1.2 }}>
              Nos <span style={{ fontWeight:700 }}>formules</span>
            </h2>
            <p style={{ fontSize:14, color:L.textSec }}>
              Ou <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:L.gold, fontWeight:600, cursor:'pointer', fontFamily:L.font, fontSize:14, textDecoration:'underline', textUnderlineOffset:3 }}>demandez un devis sur mesure</button>
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:0, border:`1px solid ${L.border}` }}>
            {packs.map((pack, i) => {
              const isPop = pack.populaire;
              return (
                <div key={i} style={{
                  background: isPop ? L.noir : L.white,
                  padding:'36px 28px', display:'flex', flexDirection:'column',
                  borderRight: i < packs.length-1 ? `1px solid ${isPop ? 'rgba(255,255,255,0.1)' : L.border}` : 'none',
                  position:'relative',
                }}>
                  {isPop && (
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:L.gold }} />
                  )}
                  <div style={{ fontSize:11, fontWeight:600, color: isPop ? L.gold : L.textLight, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:16 }}>
                    {pack.nom}
                  </div>
                  <div style={{ fontSize:36, fontWeight:200, color: isPop ? '#fff' : L.text, marginBottom:4, letterSpacing:'-0.03em' }}>
                    {pack.prix}€<span style={{ fontSize:14, fontWeight:400, color: isPop ? 'rgba(255,255,255,0.35)' : L.textLight }}>/mois</span>
                  </div>
                  <div style={{ fontSize:13, color: isPop ? 'rgba(255,255,255,0.4)' : L.textSec, marginBottom:24 }}>{pack.desc}</div>
                  <div style={{ width:32, height:1, background: isPop ? 'rgba(255,255,255,0.1)' : L.border, marginBottom:20 }} />
                  {pack.features.filter(f=>f.trim()).map(feat=>(
                    <div key={feat} style={{ fontSize:13, color: isPop ? 'rgba(255,255,255,0.7)' : L.text, padding:'5px 0', display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ color: isPop ? L.gold : L.gold, fontSize:11, marginTop:2 }}>+</span>{feat}
                    </div>
                  ))}
                  <div style={{ flex:1, minHeight:20 }} />
                  <button onClick={()=>{ setBrief(p=>({...p, type:'Montage vidéo', quantite: String(i === 0 ? 4 : i === 1 ? 10 : 20) })); setStep(1); }}
                    style={{
                      marginTop:24, width:'100%', padding:'14px',
                      background: isPop ? L.gold : 'transparent',
                      color: isPop ? '#fff' : L.text,
                      border: isPop ? 'none' : `1px solid ${L.border}`,
                      fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font,
                      letterSpacing:'0.04em', textTransform:'uppercase',
                      transition:'all .2s',
                    }}
                    onMouseEnter={e=>{ if(!isPop) { e.currentTarget.style.background=L.noir; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor=L.noir; } else { e.currentTarget.style.background=L.goldDark; } }}
                    onMouseLeave={e=>{ if(!isPop) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=L.text; e.currentTarget.style.borderColor=L.border; } else { e.currentTarget.style.background=L.gold; } }}>
                    Choisir {pack.nom}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Réassurance */}
          <div style={{ display:'flex', justifyContent:'center', gap:'clamp(16px,3vw,40px)', marginTop:32, flexWrap:'wrap' }}>
            {['Résiliable à tout moment','Livraison 72h','Satisfait ou refait','Paiement sécurisé'].map(r=>(
              <span key={r} style={{ fontSize:12, color:L.textLight, fontWeight:500, letterSpacing:'0.02em' }}>{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GRILLE PRIX DÉTAILLÉE ══ */}
      <section id="grille" style={{ background:L.bg, padding:'clamp(48px,6vh,72px) 32px', borderTop:`1px solid ${L.border}`, scrollMarginTop:20 }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>Détail</div>
            <h3 style={{ fontSize:22, fontWeight:300, margin:0, letterSpacing:'-0.02em' }}>Tous nos <span style={{ fontWeight:700 }}>tarifs</span></h3>
          </div>
          {tarifs.map((t,i) => (
            <details key={t.cat} style={{ marginBottom:1 }} open={i===0}>
              <summary style={{
                padding:'16px 20px', background:L.white, border:`1px solid ${L.border}`,
                cursor:'pointer', fontSize:14, fontWeight:600, color:L.text,
                listStyle:'none', letterSpacing:'-0.01em',
              }}>
                {t.cat}
              </summary>
              <div style={{ background:L.white, border:`1px solid ${L.border}`, borderTop:'none' }}>
                {t.items.map((item,j) => (
                  <div key={j} style={{ display:'flex', justifyContent:'space-between', padding:'12px 20px', borderBottom:j<t.items.length-1?`1px solid ${L.borderLight}`:'none', fontSize:14 }}>
                    <span style={{ color:L.textSec }}>{item.nom}</span>
                    <span style={{ fontWeight:600, color:L.text }}>{item.prix}€</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
          <div style={{ textAlign:'center', marginTop:24 }}>
            <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:L.gold, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase' }}>
              Demander un devis sur mesure →
            </button>
          </div>
        </div>
      </section>

      {/* ══ WHATSAPP FLOTTANT ══ */}
      <a href="https://wa.me/33769387193?text=Bonjour, je suis intéressé par Freample Com" target="_blank" rel="noopener noreferrer"
        style={{
          position:'fixed', bottom:28, right:28, width:52, height:52,
          background:L.noir, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(0,0,0,0.15)', zIndex:100, textDecoration:'none',
          transition:'all .25s',
        }}
        onMouseEnter={e=>{ e.currentTarget.style.background=L.gold; e.currentTarget.style.transform='translateY(-2px)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.background=L.noir; e.currentTarget.style.transform='none'; }}>
        <span style={{ fontSize:24, lineHeight:1, color:'#fff' }}>💬</span>
      </a>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:'32px', borderTop:`1px solid ${L.border}`, textAlign:'center' }}>
        <div style={{ fontSize:11, color:L.textLight, letterSpacing:'0.1em', textTransform:'uppercase' }}>
          © 2026 Freample Com · <a href="/cgu" style={{ color:L.textSec, textDecoration:'none' }}>CGU</a>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════
          MODAL BRIEF
         ══════════════════════════════════════════════════════════ */}
      {step > 0 && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>{ if(step < 3) setStep(0); }}>
          <div style={{ background:L.white, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', padding:'36px 32px' }}
            onClick={e=>e.stopPropagation()}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:4 }}>
                  {step===3?'Confirmation':'Votre projet'}
                </div>
                <div style={{ fontSize:20, fontWeight:300, color:L.text }}>{step===3?'Demande envoyée':`Étape ${step} sur 2`}</div>
              </div>
              <button onClick={()=>setStep(0)} style={{ background:'none', border:`1px solid ${L.border}`, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:L.textLight, transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir}
                onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>✕</button>
            </div>

            {step < 3 && (
              <div style={{ display:'flex', gap:4, marginBottom:28 }}>
                {[1,2].map(i => (
                  <div key={i} style={{ flex:1, height:2, background: i <= step ? L.noir : L.border }} />
                ))}
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (<div>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Type de service</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[{v:'Montage vidéo',icon:'🎬'},{v:'Réseaux sociaux',icon:'📱'},{v:'Design',icon:'🎨'},{v:'Publicité',icon:'📈'}].map(t=>(
                    <button key={t.v} onClick={()=>setBrief(p=>({...p,type:t.v}))}
                      style={{
                        padding:'18px 16px', border:`1px solid ${brief.type===t.v?L.noir:L.border}`,
                        background: brief.type===t.v?L.noir:'transparent',
                        cursor:'pointer', fontFamily:L.font, textAlign:'left', transition:'all .15s',
                      }}>
                      <span style={{ fontSize:20 }}>{t.icon}</span>
                      <div style={{ fontSize:13, fontWeight:600, marginTop:6, color: brief.type===t.v?'#fff':L.text }}>{t.v}</div>
                    </button>
                  ))}
                </div>
              </div>

              {brief.type==='Montage vidéo' && (
                <div style={{ marginBottom:20 }}>
                  <label style={lbl}>Format</label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['TikTok / Reel','YouTube Short','YouTube Long','Clip promo','Stories'].map(fmt=>(
                      <button key={fmt} onClick={()=>setBrief(p=>({...p,format:fmt}))}
                        style={{
                          padding:'8px 16px', border:`1px solid ${brief.format===fmt?L.noir:L.border}`,
                          background: brief.format===fmt?L.noir:'transparent',
                          color: brief.format===fmt?'#fff':L.textSec,
                          fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font, transition:'all .15s',
                        }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                <div><label style={lbl}>Quantité</label><select {...f('quantite')} style={{...inp}}>{['1','2','3','5','10','15','20'].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
                <div><label style={lbl}>Style</label>
                  <select value={brief.style} onChange={e=>setBrief(p=>({...p,style:e.target.value}))} style={{...inp}}>
                    <option value="">Non précisé</option>
                    <option>Dynamique</option><option>Minimaliste</option><option>Fun / Décalé</option><option>Pro / Corporate</option><option>Cinématique</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Options</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {[{v:'Sous-titres',i:'💬'},{v:'Musique',i:'🎵'},{v:'Transitions',i:'✨'},{v:'Voix-off',i:'🎙️'},{v:'Miniature',i:'🖼️'}].map(o=>(
                    <button key={o.v} onClick={()=>toggleOpt(o.v)}
                      style={{
                        padding:'8px 14px', border:`1px solid ${brief.options.includes(o.v)?L.noir:L.border}`,
                        background:brief.options.includes(o.v)?L.noir:'transparent',
                        fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font,
                        color:brief.options.includes(o.v)?'#fff':L.textSec, transition:'all .15s',
                      }}>
                      {o.i} {o.v}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Vidéo de référence <span style={{ fontWeight:400, color:L.textLight, textTransform:'none', letterSpacing:0 }}>(optionnel)</span></label>
                <input {...f('reference')} placeholder="Lien TikTok ou YouTube" style={inp} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Instructions</label>
                <textarea {...f('description')} placeholder="Décrivez votre vision, le ton souhaité…" rows={3} style={{...inp, resize:'vertical', lineHeight:1.55}} />
              </div>

              <button onClick={()=>{ if(brief.type) setStep(2); }}
                style={{
                  width:'100%', padding:'16px', background: brief.type?L.noir:'#D0D0D0',
                  color:'#fff', border:'none', fontSize:13, fontWeight:600,
                  cursor:brief.type?'pointer':'not-allowed', fontFamily:L.font,
                  letterSpacing:'0.04em', textTransform:'uppercase',
                }}>
                Continuer
              </button>
            </div>)}

            {/* Step 2 */}
            {step === 2 && (<div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                <div><label style={lbl}>Nom / pseudo</label><input {...f('nom')} placeholder="@votre.nom" style={inp} /></div>
                <div><label style={lbl}>Email</label><input type="email" {...f('email')} placeholder="vous@email.com" style={inp} /></div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={lbl}>Deadline <span style={{ fontWeight:400, color:L.textLight, textTransform:'none', letterSpacing:0 }}>(optionnel)</span></label>
                <input type="date" {...f('deadline')} style={inp} />
              </div>

              <div style={{ padding:'16px 20px', background:L.bg, border:`1px solid ${L.border}`, marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>Récapitulatif</div>
                <div style={{ fontSize:13, color:L.textSec, lineHeight:1.7 }}>
                  {brief.type}{brief.format?` · ${brief.format}`:''} · {brief.quantite} vidéo{brief.quantite>1?'s':''}<br/>
                  {brief.style && `Style: ${brief.style} · `}{brief.options.length>0 && brief.options.join(', ')}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setStep(1)} style={{ padding:'16px 20px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font }}>←</button>
                <button disabled={sending} onClick={async()=>{
                  if(!brief.nom||!brief.email) return;
                  setSending(true);
                  try {
                    const r = await api.post('/com/briefs', {
                      type:brief.type, format:brief.format, quantite:brief.quantite,
                      style:brief.style, options:brief.options, reference:brief.reference,
                      description:brief.description, nom:brief.nom, email:brief.email,
                      telephone:brief.telephone||'', deadline:brief.deadline||null,
                    });
                    if (r.data?.suiviToken) setSuiviToken(r.data.suiviToken);
                  } catch(e) { console.log('Demande envoyée (mode démo)'); }
                  setSending(false);
                  setStep(3);
                }}
                  style={{
                    flex:1, padding:'16px', background:(brief.nom&&brief.email&&!sending)?L.noir:'#D0D0D0',
                    color:'#fff', border:'none', fontSize:13, fontWeight:600,
                    cursor:(brief.nom&&brief.email&&!sending)?'pointer':'not-allowed',
                    fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase',
                  }}>
                  {sending ? 'Envoi en cours…' : 'Envoyer la demande'}
                </button>
              </div>
            </div>)}

            {/* Step 3 */}
            {step === 3 && (<div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:56, height:56, margin:'0 auto 20px', border:`1px solid ${L.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>✓</div>
              <div style={{ fontSize:20, fontWeight:300, marginBottom:8 }}>Merci pour votre confiance</div>
              <div style={{ fontSize:14, color:L.textSec, marginBottom:24 }}>Nous vous répondons sous 24h à <strong>{brief.email}</strong></div>
              {suiviToken && (
                <div style={{ padding:'20px', background:L.bg, border:`1px solid ${L.border}`, marginBottom:24 }}>
                  <div style={{ fontSize:11, color:L.gold, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>Suivi de commande</div>
                  <a href={`/suivi/${suiviToken}`} style={{
                    display:'inline-block', padding:'12px 28px', background:L.noir, color:'#fff',
                    fontSize:13, fontWeight:600, textDecoration:'none', letterSpacing:'0.04em', textTransform:'uppercase',
                  }}>
                    Suivre ma commande
                  </a>
                  <div style={{ fontSize:12, color:L.textLight, marginTop:10 }}>Référence : {suiviToken}</div>
                </div>
              )}
              <button onClick={()=>setStep(0)} style={{
                padding:'14px 32px', background:'transparent', color:L.text,
                border:`1px solid ${L.border}`, fontSize:13, fontWeight:500,
                cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase',
              }}>
                Fermer
              </button>
            </div>)}

          </div>
        </div>
      )}
    </div>
  );
}
