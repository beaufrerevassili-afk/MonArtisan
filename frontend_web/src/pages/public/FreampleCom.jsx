import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import { getTarifs } from '../../data/tarifsCom';
import api from '../../services/api';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1', borderLight:'#F0EDE8',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};
const inp={width:'100%',padding:'14px 16px',borderRadius:4,border:`1px solid ${L.border}`,fontSize:15,fontFamily:L.font,outline:'none',boxSizing:'border-box',background:L.white};
const lbl={fontSize:12,fontWeight:600,color:L.textSec,display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.08em'};

function useReveal(){const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;el.style.opacity='0';el.style.transform='translateY(28px)';el.style.transition='opacity .9s cubic-bezier(0.25,0.46,0.45,0.94), transform .9s cubic-bezier(0.25,0.46,0.45,0.94)';const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.style.opacity='1';el.style.transform='translateY(0)';obs.disconnect();}},{threshold:0.12});obs.observe(el);return()=>obs.disconnect();},[]);return ref;}

export default function FreampleCom(){
  const navigate=useNavigate();
  const [step,setStep]=useState(0);
  const [brief,setBrief]=useState({type:'',format:'',quantite:'1',style:'',reference:'',options:[],description:'',nom:'',email:'',deadline:''});
  const [sending,setSending]=useState(false);
  const [suiviToken,setSuiviToken]=useState(null);
  const [tarifs,setTarifs]=useState(getTarifs());
  const [packs,setPacks]=useState([
    {nom:'Starter',prix:149,desc:'4 TikToks par mois',populaire:false,features:[]},
    {nom:'Growth',prix:349,desc:'10 TikToks + 5 Reels',populaire:true,features:[]},
    {nom:'Pro',prix:699,desc:'20 TikToks + gestion RS',populaire:false,features:[]},
  ]);
  const [menuOpen,setMenuOpen]=useState(false);

  useEffect(()=>{api.get('/com/tarifs').then(r=>{if(r.data.tarifs)setTarifs(r.data.tarifs);if(r.data.packs)setPacks(r.data.packs);}).catch(()=>{});},[]);

  const f=(k)=>({value:brief[k],onChange:e=>setBrief(p=>({...p,[k]:e.target.value}))});
  const scrollTo=(id)=>{setMenuOpen(false);setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}),400);};
  const MENU=[
    {label:'Expertises',id:'expertises'},{label:'Portfolio',action:()=>{setMenuOpen(false);navigate('/com/portfolio');}},
    {label:'Formules',id:'tarifs'},{label:'Tarifs',id:'grille'},{label:'Contact',id:'contact'},
    {label:'Demander un devis',action:()=>{setMenuOpen(false);setTimeout(()=>setStep(1),400);}},
  ];
  const r1=useReveal(),r2=useReveal(),r3=useReveal(),r4=useReveal(),r5=useReveal(),r6=useReveal();

  // Gold separator component
  const Sep=({dark})=><div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'0',background:dark?L.noir:L.white}}>
    <div style={{flex:1,height:1,background:dark?'rgba(255,255,255,0.06)':L.border}}/>
    <div style={{width:6,height:6,borderRadius:'50%',background:L.gold,margin:'0 20px',flexShrink:0}}/>
    <div style={{flex:1,height:1,background:dark?'rgba(255,255,255,0.06)':L.border}}/>
  </div>;

  return(
    <div style={{minHeight:'100vh',background:L.white,fontFamily:L.font,color:L.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,700&display=swap" rel="stylesheet"/>
      <PublicNavbar/>

      {/* ══ HAMBURGER ══ */}
      <button onClick={()=>setMenuOpen(true)} aria-label="Menu"
        style={{position:'fixed',top:72,left:'clamp(16px,3vw,32px)',zIndex:250,width:40,height:40,background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:'1px solid rgba(0,0,0,0.06)',borderRadius:10,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,boxShadow:'0 2px 8px rgba(0,0,0,0.06)',transition:'all .25s'}}
        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,1)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.85)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}}>
        <span style={{width:16,height:1.5,background:L.noir,display:'block'}}/><span style={{width:16,height:1.5,background:L.noir,display:'block'}}/>
      </button>

      {/* ══ FULLSCREEN MENU ══ */}
      <div style={{position:'fixed',inset:0,zIndex:2000,background:L.noir,opacity:menuOpen?1:0,pointerEvents:menuOpen?'auto':'none',transition:'opacity .45s cubic-bezier(0.4,0,0.2,1)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        <button onClick={()=>setMenuOpen(false)} style={{position:'absolute',top:20,right:28,background:'none',border:'none',cursor:'pointer',color:'#fff',fontSize:28,fontWeight:200,transition:'color .2s'}} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='#fff'}>✕</button>
        <div style={{position:'absolute',top:24,left:28,fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.3em'}}>Freample Com</div>
        <nav style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          {MENU.map((item,i)=>(
            <button key={item.label} onClick={()=>item.action?item.action():scrollTo(item.id)}
              style={{background:'none',border:'none',cursor:'pointer',fontFamily:L.serif,fontSize:'clamp(28px,5vw,48px)',fontWeight:300,fontStyle:'italic',color:'#fff',padding:'12px 0',letterSpacing:'-0.02em',opacity:menuOpen?1:0,transform:menuOpen?'translateY(0)':'translateY(24px)',transition:`opacity .45s ${0.12+i*0.06}s, transform .45s ${0.12+i*0.06}s, color .2s`}}
              onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='#fff'}>{item.label}</button>
          ))}
        </nav>
        <div style={{position:'absolute',bottom:28,display:'flex',gap:32,opacity:menuOpen?1:0,transition:'opacity .5s .4s'}}>
          <a href="https://wa.me/33769387193" target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'rgba(255,255,255,0.35)',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.1em',transition:'color .2s'}} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>WhatsApp</a>
          <a href="mailto:freamplecom@gmail.com" style={{fontSize:12,color:'rgba(255,255,255,0.35)',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.1em',transition:'color .2s'}} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>Email</a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION 1 — HERO (noir)
         ═══════════════════════════════════════════════ */}
      <section style={{background:L.noir,padding:'clamp(88px,15vh,150px) 32px clamp(80px,13vh,130px)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'url(https://images.unsplash.com/photo-1585951237313-1979e4df7385?w=1800&q=85)',backgroundSize:'cover',backgroundPosition:'center 30%',opacity:0.3}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.9) 100%)'}}/>
        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:48,height:1,background:L.gold,zIndex:2}}/>
        <div style={{maxWidth:720,margin:'0 auto',position:'relative',zIndex:1}}>
          <div style={{fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.3em',marginBottom:28}}>Freample Com</div>
          <h1 style={{fontFamily:L.serif,fontSize:'clamp(40px,8vw,80px)',fontWeight:300,fontStyle:'italic',color:'#fff',lineHeight:1.02,letterSpacing:'-0.02em',margin:'0 0 20px'}}>
            L'excellence du<br/><span style={{fontWeight:700,fontStyle:'normal'}}>montage vidéo</span>
          </h1>
          <p style={{fontSize:'clamp(15px,1.8vw,18px)',color:'rgba(255,255,255,0.4)',lineHeight:1.65,margin:'0 auto 48px',maxWidth:440,fontWeight:300}}>
            Misez sur le digital pour des résultats réels.
          </p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>setStep(1)} style={{padding:'16px 48px',background:L.white,color:L.noir,border:'none',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:L.font,letterSpacing:'0.06em',textTransform:'uppercase',transition:'all .3s'}}
              onMouseEnter={e=>{e.currentTarget.style.background=L.gold;e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.color=L.noir;}}>Demander un devis</button>
            <a href="https://wa.me/33769387193?text=Bonjour, je suis intéressé par vos services Freample Com" target="_blank" rel="noopener noreferrer"
              style={{padding:'16px 32px',background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,0.18)',fontSize:13,fontWeight:400,textDecoration:'none',letterSpacing:'0.06em',textTransform:'uppercase',transition:'all .3s',display:'inline-flex',alignItems:'center',gap:10}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'}>Nous contacter</a>
          </div>
        </div>
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:48,height:1,background:L.gold}}/>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — EXPERTISES (blanc pur)
         ═══════════════════════════════════════════════ */}
      <section id="expertises" ref={r1} style={{background:L.white,padding:'clamp(72px,10vh,110px) 32px',scrollMarginTop:20}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.25em',marginBottom:16}}>Nos expertises</div>
          <h2 style={{fontFamily:L.serif,fontSize:'clamp(30px,4vw,48px)',fontWeight:300,fontStyle:'italic',letterSpacing:'-0.02em',margin:'0 0 48px',lineHeight:1.12}}>
            Tout ce dont vos <span style={{fontWeight:700,fontStyle:'normal'}}>réseaux</span> ont besoin
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:0,border:`1px solid ${L.border}`}}>
            {[
              {icon:'🎬',title:'Montage vidéo',sub:'TikTok, Reels, YouTube'},
              {icon:'🎨',title:'Direction artistique',sub:'Identité visuelle, branding'},
              {icon:'📱',title:'Gestion réseaux',sub:'Planning, publications'},
              {icon:'💬',title:'Sous-titres & SFX',sub:'Animés, musiques tendance'},
              {icon:'📈',title:'Stratégie digitale',sub:'Ads, performance'},
              {icon:'🎙️',title:'Production contenu',sub:'Scripts, voix-off'},
            ].map((s,i)=>(
              <div key={s.title} style={{padding:'36px 24px',textAlign:'center',borderRight:(i%3!==2)?`1px solid ${L.border}`:'none',borderBottom:i<3?`1px solid ${L.border}`:'none',transition:'background .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{fontSize:28,marginBottom:14}}>{s.icon}</div>
                <div style={{fontSize:14,fontWeight:700,color:L.text,marginBottom:4,letterSpacing:'-0.01em'}}>{s.title}</div>
                <div style={{fontSize:12.5,color:L.textSec}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image break pleine largeur ── */}
      <div style={{height:'clamp(200px,30vh,360px)',backgroundImage:'url(https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600&q=80)',backgroundSize:'cover',backgroundPosition:'center',backgroundAttachment:'fixed'}}/>

      {/* ═══════════════════════════════════════════════
          SECTION 3 — CHIFFRES (crème)
         ═══════════════════════════════════════════════ */}
      <section ref={r2} style={{background:L.cream,padding:'clamp(56px,8vh,88px) 32px'}}>
        <div style={{maxWidth:800,margin:'0 auto',display:'flex',justifyContent:'center',gap:'clamp(40px,8vw,100px)',flexWrap:'wrap',textAlign:'center'}}>
          {[{val:'72h',label:'Délai de livraison'},{val:'63.45€',label:'À partir de'},{val:'100%',label:'Satisfait ou refait'}].map(s=>(
            <div key={s.val}>
              <div style={{fontFamily:L.serif,fontSize:'clamp(36px,5.5vw,56px)',fontWeight:300,color:L.gold,letterSpacing:'-0.03em',lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:11,color:L.textSec,marginTop:10,textTransform:'uppercase',letterSpacing:'0.15em',fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Sep/>

      {/* ═══════════════════════════════════════════════
          SECTION 4 — PORTFOLIO CTA (noir)
         ═══════════════════════════════════════════════ */}
      <section ref={r3} id="portfolio" style={{background:L.noir,padding:'clamp(80px,13vh,120px) 32px',textAlign:'center',position:'relative',overflow:'hidden',scrollMarginTop:20}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,maxWidth:600,margin:'0 auto'}}>
          <div style={{fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.3em',marginBottom:20}}>Portfolio</div>
          <h2 style={{fontFamily:L.serif,fontSize:'clamp(30px,5vw,54px)',fontWeight:300,fontStyle:'italic',color:'#fff',letterSpacing:'-0.02em',lineHeight:1.08,margin:'0 0 16px'}}>
            Découvrez nos <span style={{fontWeight:700,fontStyle:'normal'}}>réalisations</span>
          </h2>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.35)',lineHeight:1.6,margin:'0 0 44px',fontWeight:300}}>Chaque projet raconte une histoire.</p>
          <button onClick={()=>navigate('/com/portfolio')} style={{padding:'16px 52px',background:'transparent',color:'#fff',border:`1px solid ${L.gold}`,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:L.font,letterSpacing:'0.08em',textTransform:'uppercase',transition:'all .3s'}}
            onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Explorer le portfolio</button>
        </div>
      </section>

      {/* ── Marquee (transition noir → blanc) ── */}
      <div style={{background:L.white,borderBottom:`1px solid ${L.border}`,overflow:'hidden',padding:'14px 0'}}>
        <div style={{display:'flex',animation:'marquee 28s linear infinite',whiteSpace:'nowrap'}}>
          {[...Array(3)].map((_,k)=><span key={k} style={{display:'flex'}}>
            {['Qualité','Créativité','Rigueur','Passion','Expertise','Engagement','Innovation','Authenticité'].map(w=>(
              <span key={w+k} style={{fontFamily:L.serif,fontSize:16,fontStyle:'italic',color:L.textLight,padding:'0 32px',fontWeight:400}}>{w} <span style={{color:L.gold,margin:'0 8px',fontStyle:'normal'}}>—</span></span>
            ))}
          </span>)}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION 5 — CONTACT split (blanc)
         ═══════════════════════════════════════════════ */}
      <section ref={r4} id="contact" style={{background:L.white,scrollMarginTop:20}}>
        <div style={{display:'flex',flexWrap:'wrap',maxWidth:1200,margin:'0 auto'}}>
          <div style={{flex:'1 1 420px',padding:'clamp(52px,8vh,88px) clamp(36px,5vw,64px)',display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div style={{fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:16}}>Conseil personnalisé</div>
            <h2 style={{fontFamily:L.serif,fontSize:'clamp(28px,4vw,44px)',fontWeight:300,fontStyle:'italic',color:L.text,letterSpacing:'-0.02em',lineHeight:1.12,margin:'0 0 14px'}}>
              Vous avez un projet ?<br/><span style={{fontWeight:700,fontStyle:'normal'}}>Parlons-en.</span>
            </h2>
            <p style={{fontSize:14,color:L.textSec,lineHeight:1.6,margin:'0 0 32px'}}>Réponse sous 24 heures, devis gratuit et sans engagement.</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <a href="https://wa.me/33769387193?text=Bonjour, j'aimerais discuter d'un projet" target="_blank" rel="noopener noreferrer"
                style={{padding:'14px 28px',background:L.noir,color:'#fff',border:'none',fontSize:13,fontWeight:600,textDecoration:'none',letterSpacing:'0.04em',textTransform:'uppercase',transition:'background .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#333'} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>WhatsApp</a>
              <a href="mailto:freamplecom@gmail.com?subject=Demande d'information Freample Com"
                style={{padding:'14px 28px',background:'transparent',color:L.text,border:`1px solid ${L.border}`,fontSize:13,fontWeight:500,textDecoration:'none',letterSpacing:'0.04em',textTransform:'uppercase',transition:'border-color .2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>Email</a>
            </div>
          </div>
          <div style={{flex:'1 1 420px',minHeight:400,background:'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80) center/cover'}}/>
        </div>
      </section>

      <Sep/>

      {/* ═══════════════════════════════════════════════
          SECTION 6 — FORMULES (crème)
         ═══════════════════════════════════════════════ */}
      <section ref={r5} id="tarifs" style={{background:L.cream,padding:'clamp(64px,10vh,100px) 32px',scrollMarginTop:20}}>
        <div style={{maxWidth:960,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.25em',marginBottom:14}}>Tarification</div>
            <h2 style={{fontFamily:L.serif,fontSize:'clamp(30px,4.5vw,48px)',fontWeight:300,fontStyle:'italic',letterSpacing:'-0.02em',margin:'0 0 8px',lineHeight:1.12}}>
              Nos <span style={{fontWeight:700,fontStyle:'normal'}}>formules</span>
            </h2>
            <p style={{fontSize:14,color:L.textSec}}>Des formules adaptées à chaque ambition.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:0}}>
            {packs.map((pack,i)=>{const isPop=pack.populaire;return(
              <div key={i} style={{background:isPop?L.noir:L.white,padding:'44px 32px',display:'flex',flexDirection:'column',border:isPop?'none':`1px solid ${L.border}`,borderRight:(!isPop&&i<packs.length-1)?'none':'',position:'relative'}}>
                {isPop&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:L.gold}}/>}
                <div style={{fontSize:11,fontWeight:600,color:isPop?L.gold:L.textLight,textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:20}}>{pack.nom}</div>
                <div style={{fontFamily:L.serif,fontSize:46,fontWeight:300,color:isPop?'#fff':L.text,marginBottom:4,letterSpacing:'-0.03em'}}>
                  {pack.prix}€<span style={{fontSize:14,fontWeight:400,color:isPop?'rgba(255,255,255,0.3)':L.textLight,fontFamily:L.font}}>/mois</span>
                </div>
                <div style={{fontSize:13,color:isPop?'rgba(255,255,255,0.35)':L.textSec,marginBottom:28}}>{pack.desc}</div>
                <div style={{flex:1}}/>
                <button onClick={()=>{setBrief(p=>({...p,type:'Montage vidéo',quantite:String(i===0?4:i===1?10:20)}));setStep(1);}}
                  style={{marginTop:24,width:'100%',padding:'15px',background:isPop?L.gold:'transparent',color:isPop?'#fff':L.text,border:isPop?'none':`1px solid ${L.border}`,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:L.font,letterSpacing:'0.04em',textTransform:'uppercase',transition:'all .2s'}}
                  onMouseEnter={e=>{if(!isPop){e.currentTarget.style.background=L.noir;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=L.noir;}else{e.currentTarget.style.background=L.goldDark;}}}
                  onMouseLeave={e=>{if(!isPop){e.currentTarget.style.background='transparent';e.currentTarget.style.color=L.text;e.currentTarget.style.borderColor=L.border;}else{e.currentTarget.style.background=L.gold;}}}>
                  Choisir {pack.nom}
                </button>
              </div>
            );})}
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:'clamp(16px,3vw,40px)',marginTop:36,flexWrap:'wrap'}}>
            {['Résiliable à tout moment','Livraison 72h','Satisfait ou refait','Paiement sécurisé'].map(r=>(
              <span key={r} style={{fontSize:12,color:L.textLight,fontWeight:500,letterSpacing:'0.02em'}}>{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image break pleine largeur 2 ── */}
      <div style={{height:'clamp(160px,24vh,280px)',backgroundImage:'url(https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80)',backgroundSize:'cover',backgroundPosition:'center 40%',backgroundAttachment:'fixed'}}/>

      {/* ═══════════════════════════════════════════════
          SECTION 7 — GRILLE TARIFS (blanc)
         ═══════════════════════════════════════════════ */}
      <section ref={r6} id="grille" style={{background:L.white,padding:'clamp(56px,8vh,88px) 32px',scrollMarginTop:20}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <div style={{fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.25em',marginBottom:12}}>Détail</div>
            <h3 style={{fontFamily:L.serif,fontSize:30,fontWeight:300,fontStyle:'italic',margin:0,letterSpacing:'-0.02em'}}>Tous nos <span style={{fontWeight:700,fontStyle:'normal'}}>tarifs</span></h3>
          </div>
          {tarifs.filter(t=>t.cat==='Montage vidéo').map(t=>(
            <div key={t.cat} style={{border:`1px solid ${L.border}`}}>
              <div style={{padding:'16px 24px',borderBottom:`1px solid ${L.border}`,fontSize:14,fontWeight:600,color:L.text,background:L.cream}}>{t.cat}</div>
              {t.items.map((item,j)=>(
                <div key={j} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px',borderBottom:j<t.items.length-1?`1px solid ${L.borderLight}`:'none',fontSize:14,gap:14,background:L.white}}>
                  <span style={{color:L.textSec,flex:1}}>{item.nom}</span>
                  <span style={{fontWeight:600,color:L.text,flexShrink:0}}>{item.prix}€</span>
                  <button onClick={()=>{setBrief(p=>({...p,type:t.cat,format:item.nom,quantite:'1'}));setStep(1);}}
                    style={{padding:'7px 18px',background:'transparent',border:`1px solid ${L.border}`,color:L.text,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:L.font,letterSpacing:'0.03em',textTransform:'uppercase',transition:'all .2s',flexShrink:0}}
                    onMouseEnter={e=>{e.currentTarget.style.background=L.noir;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=L.noir;}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=L.text;e.currentTarget.style.borderColor=L.border;}}>Commander</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══ WHATSAPP FLOTTANT ══ */}
      <a href="https://wa.me/33769387193?text=Bonjour, je suis intéressé par Freample Com" target="_blank" rel="noopener noreferrer"
        style={{position:'fixed',bottom:28,right:28,width:52,height:52,background:L.noir,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.15)',zIndex:100,textDecoration:'none',transition:'all .25s'}}
        onMouseEnter={e=>{e.currentTarget.style.background=L.gold;e.currentTarget.style.transform='translateY(-2px)';}} onMouseLeave={e=>{e.currentTarget.style.background=L.noir;e.currentTarget.style.transform='none';}}>
        <span style={{fontSize:24,lineHeight:1,color:'#fff'}}>💬</span>
      </a>

      {/* ══ FOOTER ══ */}
      <footer style={{padding:'32px',borderTop:`1px solid ${L.border}`,textAlign:'center',background:L.white}}>
        <span style={{fontSize:11,color:L.textLight,letterSpacing:'0.1em',textTransform:'uppercase'}}>© 2026 Freample Com · <a href="/cgu" style={{color:L.textSec,textDecoration:'none'}}>CGU</a></span>
      </footer>

      {/* ══ MODAL BRIEF ══ */}
      {step>0&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>{if(step<3)setStep(0);}}>
          <div style={{background:L.white,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',padding:'36px 32px'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:L.gold,textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:4}}>{step===3?'Confirmation':'Votre projet'}</div>
                <div style={{fontFamily:L.serif,fontSize:22,fontWeight:300,fontStyle:'italic',color:L.text}}>{step===3?'Demande envoyée':`Étape ${step} sur 2`}</div>
              </div>
              <button onClick={()=>setStep(0)} style={{background:'none',border:`1px solid ${L.border}`,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,color:L.textLight,transition:'border-color .15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>✕</button>
            </div>
            {step<3&&<div style={{display:'flex',gap:4,marginBottom:28}}>{[1,2].map(i=><div key={i} style={{flex:1,height:2,background:i<=step?L.noir:L.border}}/>)}</div>}

            {step===1&&(<div>
              <div style={{marginBottom:20}}><label style={lbl}>Style souhaité</label><select value={brief.style} onChange={e=>setBrief(p=>({...p,style:e.target.value}))} style={{...inp}}><option value="">Non précisé</option><option>Dynamique</option><option>Minimaliste</option><option>Fun / Décalé</option><option>Pro / Corporate</option><option>Cinématique</option></select></div>
              <div style={{marginBottom:20}}><label style={lbl}>Vidéo de référence <span style={{fontWeight:400,color:L.textLight,textTransform:'none',letterSpacing:0}}>(optionnel)</span></label><input {...f('reference')} placeholder="Lien TikTok ou YouTube" style={inp}/></div>
              <div style={{marginBottom:20}}><label style={lbl}>Instructions</label><textarea {...f('description')} placeholder="Décrivez votre vision, le ton souhaité…" rows={3} style={{...inp,resize:'vertical',lineHeight:1.55}}/></div>
              <button onClick={()=>setStep(2)} style={{width:'100%',padding:'16px',background:L.noir,color:'#fff',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:L.font,letterSpacing:'0.04em',textTransform:'uppercase'}}>Continuer</button>
            </div>)}

            {step===2&&(<div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div><label style={lbl}>Nom / pseudo</label><input {...f('nom')} placeholder="@votre.nom" style={inp}/></div>
                <div><label style={lbl}>Email</label><input type="email" {...f('email')} placeholder="vous@email.com" style={inp}/></div>
              </div>
              <div style={{marginBottom:16}}><label style={lbl}>Deadline <span style={{fontWeight:400,color:L.textLight,textTransform:'none',letterSpacing:0}}>(optionnel)</span></label><input type="date" {...f('deadline')} style={inp}/></div>
              <div style={{padding:'16px 20px',background:L.cream,border:`1px solid ${L.border}`,marginBottom:24}}>
                <div style={{fontSize:11,color:L.gold,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:8}}>Récapitulatif</div>
                <div style={{fontSize:13,color:L.textSec,lineHeight:1.7}}>{brief.format||'Service personnalisé'}{brief.style?` · Style: ${brief.style}`:''}{brief.quantite>1?` · ${brief.quantite} vidéos`:''}</div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setStep(1)} style={{padding:'16px 20px',background:'transparent',color:L.text,border:`1px solid ${L.border}`,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:L.font}}>←</button>
                <button disabled={sending} onClick={async()=>{
                  if(!brief.nom||!brief.email)return;setSending(true);
                  try{const r=await api.post('/com/briefs',{type:brief.type,format:brief.format,quantite:brief.quantite,style:brief.style,options:brief.options,reference:brief.reference,description:brief.description,nom:brief.nom,email:brief.email,telephone:brief.telephone||'',deadline:brief.deadline||null});if(r.data?.suiviToken)setSuiviToken(r.data.suiviToken);}catch(e){}
                  setSending(false);setStep(3);
                }} style={{flex:1,padding:'16px',background:(brief.nom&&brief.email&&!sending)?L.noir:'#D0D0D0',color:'#fff',border:'none',fontSize:13,fontWeight:600,cursor:(brief.nom&&brief.email&&!sending)?'pointer':'not-allowed',fontFamily:L.font,letterSpacing:'0.04em',textTransform:'uppercase'}}>
                  {sending?'Envoi en cours…':'Envoyer la demande'}
                </button>
              </div>
            </div>)}

            {step===3&&(<div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{width:56,height:56,margin:'0 auto 20px',border:`1px solid ${L.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>✓</div>
              <div style={{fontFamily:L.serif,fontSize:24,fontWeight:300,fontStyle:'italic',marginBottom:8}}>Merci pour votre confiance</div>
              <div style={{fontSize:14,color:L.textSec,marginBottom:24}}>Nous vous répondons sous 24h à <strong>{brief.email}</strong></div>
              {suiviToken&&(
                <div style={{padding:'20px',background:L.cream,border:`1px solid ${L.border}`,marginBottom:24}}>
                  <div style={{fontSize:11,color:L.gold,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:10}}>Suivi de commande</div>
                  <a href={`/suivi/${suiviToken}`} style={{display:'inline-block',padding:'12px 28px',background:L.noir,color:'#fff',fontSize:13,fontWeight:600,textDecoration:'none',letterSpacing:'0.04em',textTransform:'uppercase'}}>Suivre ma commande</a>
                  <div style={{fontSize:12,color:L.textLight,marginTop:10}}>Référence : {suiviToken}</div>
                </div>
              )}
              <button onClick={()=>setStep(0)} style={{padding:'14px 32px',background:'transparent',color:L.text,border:`1px solid ${L.border}`,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:L.font,letterSpacing:'0.04em',textTransform:'uppercase'}}>Fermer</button>
            </div>)}
          </div>
        </div>
      )}

      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}
