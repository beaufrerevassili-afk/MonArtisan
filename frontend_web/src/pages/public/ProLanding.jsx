import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

function useReveal(){const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;el.style.opacity='0';el.style.transform='translateY(28px)';el.style.transition='opacity .9s cubic-bezier(0.25,0.46,0.45,0.94), transform .9s cubic-bezier(0.25,0.46,0.45,0.94)';const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.style.opacity='1';el.style.transform='translateY(0)';obs.disconnect();}},{threshold:0.1});obs.observe(el);return()=>obs.disconnect();},[]);return ref;}

export default function ProLanding() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = (id) => { setMenuOpen(false); setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}),350); };

  const MENU = [
    {label:'Fonctionnalités',id:'fonctionnalites'},
    {label:'Secteurs',id:'secteurs'},
    {label:'Témoignages',id:'temoignages'},
    {label:'Tarifs',id:'tarifs-pro'},
    {label:'FAQ',id:'faq'},
    {label:'S\'inscrire',action:()=>{setMenuOpen(false);navigate('/register?role=patron');}},
  ];

  const r1=useReveal(),r2=useReveal(),r3=useReveal(),r4=useReveal(),r5=useReveal(),r6=useReveal();

  return (
    <div style={{ minHeight:'100vh', background:L.white, fontFamily:L.font, color:L.text }}>

      {/* ══ NAVBAR PRO ══ */}
      <nav style={{ position:'sticky', top:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 clamp(20px,4vw,48px)', height:60, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:`1px solid ${L.border}` }}>
        <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:800, color:L.text, fontFamily:L.font, letterSpacing:'-0.04em' }}>
          Freample<span style={{ color:L.gold }}>.</span>
        </button>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={()=>navigate('/login')} style={{ padding:'8px 20px', background:'none', border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, color:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=L.noir;e.currentTarget.style.color=L.noir;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.color=L.textSec;}}>
            Se connecter
          </button>
          <button onClick={()=>navigate('/register?role=patron')} style={{ padding:'8px 20px', background:L.noir, border:'none', fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:L.font, transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#333'} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
            S'inscrire gratuitement
          </button>
        </div>
      </nav>

      {/* ══ HAMBURGER ══ */}
      <button onClick={()=>setMenuOpen(true)} aria-label="Menu"
        style={{ position:'fixed', top:72, left:'clamp(16px,3vw,32px)', zIndex:250, width:40, height:40, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)', border:`1px solid rgba(0,0,0,0.06)`, borderRadius:10, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'all .25s' }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}}>
        <span style={{ width:16, height:1.5, background:L.noir }}/><span style={{ width:16, height:1.5, background:L.noir }}/>
      </button>

      {/* ══ FULLSCREEN MENU ══ */}
      <div style={{ position:'fixed', inset:0, zIndex:2000, background:L.noir, opacity:menuOpen?1:0, pointerEvents:menuOpen?'auto':'none', transition:'opacity .4s', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
        <button onClick={()=>setMenuOpen(false)} style={{ position:'absolute', top:20, right:28, background:'none', border:'none', cursor:'pointer', color:'#fff', fontSize:28, fontWeight:200, transition:'color .2s' }}
          onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='#fff'}>✕</button>
        <div style={{ position:'absolute', top:24, left:28, fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em' }}>Freample Pro</div>
        <nav style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          {MENU.map((item,i)=>(
            <button key={item.label} onClick={()=>item.action?item.action():scrollTo(item.id)}
              style={{ background:'none', border:'none', cursor:'pointer', fontFamily:L.serif, fontSize:'clamp(24px,4.5vw,44px)', fontWeight:300, fontStyle:'italic', color:'#fff', padding:'10px 0', opacity:menuOpen?1:0, transform:menuOpen?'translateY(0)':'translateY(20px)', transition:`opacity .4s ${0.1+i*0.05}s, transform .4s ${0.1+i*0.05}s, color .2s` }}
              onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color='#fff'}>{item.label}</button>
          ))}
        </nav>
      </div>

      {/* ══ HERO ══ */}
      <header style={{ background:L.noir, padding:'clamp(80px,14vh,140px) 32px clamp(72px,12vh,110px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1800&q=85)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold, zIndex:2 }} />
        <div style={{ maxWidth:700, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.35em', marginBottom:24 }}>Espace professionnel</div>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(34px,6.5vw,64px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.05, letterSpacing:'-0.02em', margin:'0 0 18px' }}>
            Gérez votre activité<br/><span style={{ fontWeight:700, fontStyle:'normal' }}>comme un leader</span>
          </h1>
          <p style={{ fontSize:'clamp(15px,1.8vw,17px)', color:'rgba(255,255,255,0.4)', lineHeight:1.65, margin:'0 auto 40px', maxWidth:460, fontWeight:300 }}>
            Agenda, devis, factures, clients, équipe — tout votre business dans une seule plateforme.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>navigate('/register?role=patron')} style={{ padding:'16px 44px', background:L.white, color:L.noir, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s' }}
              onMouseEnter={e=>{e.currentTarget.style.background=L.gold;e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.color=L.noir;}}>
              Créer mon espace — Gratuit
            </button>
            <button onClick={()=>scrollTo('fonctionnalites')} style={{ padding:'16px 32px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.18)', fontSize:13, fontWeight:400, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'}>
              Voir les fonctionnalités
            </button>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
      </header>

      {/* ══ CHIFFRES ══ */}
      <section style={{ background:L.cream, padding:'clamp(40px,6vh,64px) 32px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'flex', justifyContent:'center', gap:'clamp(32px,6vw,80px)', flexWrap:'wrap', textAlign:'center' }}>
          {[{val:'100%',label:'Gratuit'},{val:'5 min',label:'Inscription'},{val:'0',label:'Commission'},{val:'24/7',label:'Accessible'}].map(s=>(
            <div key={s.val}>
              <div style={{ fontFamily:L.serif, fontSize:'clamp(28px,4vw,42px)', fontWeight:300, color:L.gold, letterSpacing:'-0.03em', lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:11, color:L.textSec, marginTop:8, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FONCTIONNALITÉS ══ */}
      <section ref={r1} id="fonctionnalites" style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px', scrollMarginTop:20 }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Tout-en-un</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:0, lineHeight:1.12 }}>
              Tout ce dont vous avez <span style={{ fontWeight:700, fontStyle:'normal' }}>besoin</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:1, background:L.border }}>
            {[
              { icon:'📅', title:'Agenda intelligent', desc:'Gérez vos rendez-vous, planifiez vos interventions et recevez des rappels automatiques.' },
              { icon:'📝', title:'Devis & Factures', desc:'Créez des devis professionnels en 2 clics. Transformez-les en factures et suivez les paiements.' },
              { icon:'👥', title:'Gestion clients (CRM)', desc:'Historique complet de chaque client, segmentation RFM, relances automatiques.' },
              { icon:'👷', title:'Gestion d\'équipe', desc:'Assignez des missions, suivez le temps de travail et gérez les plannings.' },
              { icon:'💰', title:'Finance & Trésorerie', desc:'Suivi des entrées/sorties, tableau de bord financier, export comptable.' },
              { icon:'📊', title:'Rapports & Analytics', desc:'Chiffre d\'affaires, rentabilité par projet, performance de l\'équipe en temps réel.' },
              { icon:'📦', title:'Gestion de stock', desc:'Suivi des matériaux, alertes de réapprovisionnement, valorisation en temps réel.' },
              { icon:'⭐', title:'Réputation en ligne', desc:'Collectez les avis clients, suivez votre e-réputation, répondez aux feedbacks.' },
              { icon:'⚖️', title:'Conformité & Juridique', desc:'Rappels d\'échéances légales, URSSAF, assurances, documents obligatoires.' },
            ].map(f=>(
              <div key={f.title} style={{ background:L.white, padding:'32px 28px', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background=L.white}>
                <div style={{ fontSize:28, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:13.5, color:L.textSec, lineHeight:1.6, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IMAGE BREAK ══ */}
      <div style={{ height:'clamp(180px,26vh,300px)', backgroundImage:'url(https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed' }} />

      {/* ══ SECTEURS ══ */}
      <section ref={r2} id="secteurs" style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px', scrollMarginTop:20 }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Multi-secteurs</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:0, lineHeight:1.12 }}>
              Adapté à votre <span style={{ fontWeight:700, fontStyle:'normal' }}>métier</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:16 }}>
            {[
              { icon:'🏗️', title:'BTP & Artisanat', desc:'Plombiers, électriciens, peintres, maçons — gestion de chantiers et devis.' },
              { icon:'✂️', title:'Coiffure & Beauté', desc:'Réservation en ligne, agenda salon, fidélisation clients.' },
              { icon:'🎬', title:'Montage & Création', desc:'Gestion des projets vidéo, suivi client, facturation créative.' },
              { icon:'🍽️', title:'Restauration', desc:'Gestion des réservations, stock, équipe et caisse. (Bientôt)' },
            ].map(s=>(
              <div key={s.title} style={{ background:L.cream, padding:'32px 24px', border:`1px solid ${L.border}`, transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.transform='none';}}>
                <div style={{ fontSize:32, marginBottom:14 }}>{s.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:L.text, marginBottom:6 }}>{s.title}</h3>
                <p style={{ fontSize:13.5, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <section ref={r3} id="temoignages" style={{ background:L.cream, padding:'clamp(64px,9vh,100px) 32px', scrollMarginTop:20 }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Témoignages</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 48px', lineHeight:1.12 }}>
            Ils nous font <span style={{ fontWeight:700, fontStyle:'normal' }}>confiance</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
            {[
              { nom:'Marc D.', metier:'Plombier · Paris', texte:'Depuis Freample, mes devis sont envoyés en 2 minutes. Mes clients reçoivent tout par email, c\'est pro.', note:5 },
              { nom:'Sophie L.', metier:'Gérante salon · Lyon', texte:'L\'agenda en ligne a doublé mes réservations. Les clientes adorent pouvoir réserver à minuit.', note:5 },
              { nom:'Karim B.', metier:'Électricien · Marseille', texte:'Le suivi de chantier est top. Je sais exactement où j\'en suis sur chaque projet, la trésorerie est claire.', note:5 },
            ].map(t=>(
              <div key={t.nom} style={{ background:L.white, padding:'28px 24px', border:`1px solid ${L.border}`, textAlign:'left' }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                  {[...Array(t.note)].map((_,i)=><span key={i} style={{ color:'#F59E0B', fontSize:14 }}>★</span>)}
                </div>
                <p style={{ fontSize:14, color:L.text, lineHeight:1.65, margin:'0 0 18px', fontStyle:'italic' }}>"{t.texte}"</p>
                <div style={{ fontSize:14, fontWeight:700, color:L.text }}>{t.nom}</div>
                <div style={{ fontSize:12, color:L.textLight }}>{t.metier}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TARIFS ══ */}
      <section ref={r4} id="tarifs-pro" style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px', borderTop:`1px solid ${L.border}`, scrollMarginTop:20 }}>
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Tarification</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 12px', lineHeight:1.12 }}>
            Simple et <span style={{ fontWeight:700, fontStyle:'normal' }}>transparent</span>
          </h2>
          <p style={{ fontSize:15, color:L.textSec, marginBottom:40 }}>Pas de commission, pas de frais cachés.</p>
          <div style={{ background:L.cream, border:`1px solid ${L.border}`, padding:'44px 36px', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:L.gold }} />
            <div style={{ fontFamily:L.serif, fontSize:56, fontWeight:300, color:L.text, letterSpacing:'-0.03em', marginBottom:4 }}>0€</div>
            <div style={{ fontSize:15, color:L.textSec, marginBottom:24 }}>Pendant le lancement — ensuite à partir de 29€/mois</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, textAlign:'left', marginBottom:32 }}>
              {['Agenda & réservations illimitées','Devis & factures illimités','Gestion clients (CRM)','Gestion d\'équipe','Suivi financier','Rapports & statistiques','Support prioritaire'].map(f=>(
                <div key={f} style={{ fontSize:14, color:L.text, display:'flex', gap:10 }}>
                  <span style={{ color:L.gold }}>+</span>{f}
                </div>
              ))}
            </div>
            <button onClick={()=>navigate('/register?role=patron')} style={{ width:'100%', padding:'16px', background:L.noir, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
              Commencer gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section ref={r5} id="faq" style={{ background:L.bg, padding:'clamp(64px,9vh,100px) 32px', borderTop:`1px solid ${L.border}`, scrollMarginTop:20 }}>
        <div style={{ maxWidth:650, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>FAQ</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,36px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:0, lineHeight:1.12 }}>
              Questions <span style={{ fontWeight:700, fontStyle:'normal' }}>fréquentes</span>
            </h2>
          </div>
          {[
            { q:'Est-ce vraiment gratuit ?', a:'Oui, pendant toute la phase de lancement. Ensuite, un abonnement à partir de 29€/mois avec toutes les fonctionnalités incluses.' },
            { q:'Combien de temps pour s\'inscrire ?', a:'5 minutes. Renseignez votre activité, créez votre profil et commencez immédiatement.' },
            { q:'Y a-t-il une commission sur mes prestations ?', a:'Non, aucune commission. Vous fixez vos prix, vous gardez 100% de vos revenus.' },
            { q:'Quels secteurs sont supportés ?', a:'BTP, coiffure, beauté, restauration, montage vidéo et bien d\'autres à venir.' },
            { q:'Mes données sont-elles sécurisées ?', a:'Oui, hébergement en France, chiffrement SSL, sauvegardes quotidiennes et conformité RGPD.' },
          ].map(faq=>(
            <details key={faq.q} style={{ marginBottom:1 }}>
              <summary style={{ padding:'18px 20px', background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', fontSize:15, fontWeight:600, color:L.text, listStyle:'none' }}>{faq.q}</summary>
              <div style={{ padding:'16px 20px', background:L.white, border:`1px solid ${L.border}`, borderTop:'none', fontSize:14, color:L.textSec, lineHeight:1.65 }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section ref={r6} style={{ background:L.noir, padding:'clamp(72px,12vh,110px) 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:520, margin:'0 auto' }}>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(28px,5vw,48px)', fontWeight:300, fontStyle:'italic', color:'#fff', letterSpacing:'-0.02em', lineHeight:1.08, margin:'0 0 14px' }}>
            Prêt à <span style={{ fontWeight:700, fontStyle:'normal' }}>développer</span><br/>votre activité ?
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.6, margin:'0 0 36px', fontWeight:300 }}>
            Rejoignez les professionnels qui font confiance à Freample.
          </p>
          <button onClick={()=>navigate('/register?role=patron')} style={{ padding:'16px 48px', background:L.gold, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'background .25s' }}
            onMouseEnter={e=>e.currentTarget.style.background=L.goldDark} onMouseLeave={e=>e.currentTarget.style.background=L.gold}>
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:'24px 32px', borderTop:`1px solid ${L.border}`, background:L.white, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:L.textLight, fontFamily:L.font, transition:'color .15s' }}
          onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textLight}>
          ← Retour à l'accueil
        </button>
        <span style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase' }}>© 2026 Freample</span>
      </footer>

      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}
