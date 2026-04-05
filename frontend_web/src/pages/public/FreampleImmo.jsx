import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

function useReveal(){const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='opacity .8s cubic-bezier(0.25,0.46,0.45,0.94), transform .8s cubic-bezier(0.25,0.46,0.45,0.94)';const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.style.opacity='1';el.style.transform='translateY(0)';obs.disconnect();}},{threshold:0.1});obs.observe(el);return()=>obs.disconnect();},[]);return ref;}

export default function FreampleImmo() {
  const navigate = useNavigate();
  const r1=useReveal(),r2=useReveal(),r3=useReveal(),r4=useReveal(),r5=useReveal();

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <PublicNavbar />

      {/* ══ HERO ══ */}
      <section style={{ background:L.noir, padding:'clamp(88px,15vh,150px) 32px clamp(72px,12vh,110px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800&q=85)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.2 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.92) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
        <div style={{ maxWidth:720, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', padding:'6px 18px', background:'rgba(201,169,110,0.12)', border:`1px solid ${L.gold}40`, fontSize:11, fontWeight:600, color:L.gold, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:24 }}>En cours de développement</div>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(36px,7vw,68px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.02, letterSpacing:'-0.02em', margin:'0 0 18px' }}>
            Freample <span style={{ fontWeight:700, fontStyle:'normal' }}>Immo</span>
          </h1>
          <p style={{ fontSize:'clamp(15px,1.8vw,18px)', color:'rgba(255,255,255,0.45)', lineHeight:1.65, margin:'0 auto 40px', maxWidth:500, fontWeight:300 }}>
            Gérez votre patrimoine immobilier, vos SCI et vos diagnostics réglementaires depuis une seule plateforme.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>document.getElementById('gestion')?.scrollIntoView({behavior:'smooth'})} style={{ padding:'16px 40px', background:L.white, color:L.noir, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s' }}
              onMouseEnter={e=>{e.currentTarget.style.background=L.gold;e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.color=L.noir;}}>
              Gestion de parc
            </button>
            <button onClick={()=>navigate('/immo/erp')} style={{ padding:'16px 36px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', fontSize:13, fontWeight:400, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}>
              ERP & Diagnostics
            </button>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
      </section>

      {/* ══ GESTION SCI & PARC IMMOBILIER ══ */}
      <section ref={r1} id="gestion" style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Gestion privée</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 8px', lineHeight:1.12 }}>
              Toutes vos SCI, <span style={{ fontWeight:700, fontStyle:'normal' }}>un seul compte</span>
            </h2>
            <p style={{ fontSize:15, color:L.textSec, maxWidth:520, margin:'0 auto' }}>Centralisez la gestion de votre patrimoine immobilier — multi-SCI, multi-biens, vision consolidée.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:1, background:L.border }}>
            {[
              { icon:'🏢', title:'Multi-SCI', desc:'Gérez toutes vos SCI depuis un seul tableau de bord. Basculez d\'une structure à l\'autre en un clic.' },
              { icon:'🏠', title:'Parc immobilier', desc:'Vue complète de tous vos biens : appartements, maisons, locaux, parkings. Fiches détaillées par bien.' },
              { icon:'👥', title:'Gestion locataires', desc:'Dossiers locataires, baux, cautions, état des lieux d\'entrée et de sortie numériques.' },
              { icon:'💰', title:'Loyers & Encaissements', desc:'Suivi des loyers, quittances automatiques, relances impayés, historique des paiements.' },
              { icon:'📊', title:'Comptabilité SCI', desc:'Plan comptable SCI, journal des écritures, bilan, compte de résultat. Export comptable.' },
              { icon:'📄', title:'Déclarations fiscales', desc:'Aide à la déclaration 2072 (SCI à l\'IR), 2065 (SCI à l\'IS), revenus fonciers 2044.' },
              { icon:'🔧', title:'Travaux & Charges', desc:'Suivi des travaux par bien, ventilation des charges, appels de fonds copropriété.' },
              { icon:'📋', title:'Documents & Baux', desc:'GED intégrée : baux, avenants, diagnostics, PV d\'AG, statuts SCI, courriers type.' },
              { icon:'📈', title:'Rentabilité', desc:'Taux de rendement brut/net par bien, cashflow, plus-value latente, valorisation du patrimoine.' },
            ].map(f => (
              <div key={f.title} style={{ background:L.white, padding:'32px 24px', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background=L.white}>
                <div style={{ fontSize:28, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.6, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IMAGE BREAK ══ */}
      <div style={{ height:'clamp(160px,24vh,280px)', backgroundImage:'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed' }} />

      {/* ══ FONCTIONNALITÉS AVANCÉES ══ */}
      <section ref={r2} style={{ background:L.cream, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Avancé</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,38px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:0, lineHeight:1.12 }}>
              Outils <span style={{ fontWeight:700, fontStyle:'normal' }}>professionnels</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:16 }}>
            {[
              { icon:'🏗️', title:'Simulation d\'investissement', desc:'Calcul de rentabilité, simulation de prêt, effort d\'épargne, effet de levier, défiscalisation.' },
              { icon:'📊', title:'Dashboard consolidé', desc:'Vue globale multi-SCI : patrimoine total, cashflow mensuel, taux d\'occupation, alertes.' },
              { icon:'⚖️', title:'AG & Décisions', desc:'Convocation d\'AG, PV de décision, vote des résolutions, registre des décisions.' },
              { icon:'🔔', title:'Alertes & Rappels', desc:'Fin de bail, révision de loyer, échéance d\'assurance, contrôle technique, diagnostics.' },
              { icon:'🤝', title:'Espace associés', desc:'Chaque associé accède à ses SCI, ses parts, ses revenus, ses documents. Transparence totale.' },
              { icon:'📱', title:'Application mobile', desc:'Gestion en mobilité : photos de bien, signature électronique, notifications push.' },
            ].map(s => (
              <div key={s.title} style={{ background:L.white, border:`1px solid ${L.border}`, padding:'28px 24px', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.transform='none';}}>
                <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ERP & DIAGNOSTICS CTA ══ */}
      <section ref={r3} style={{ background:L.noir, padding:'clamp(72px,12vh,110px) 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em', marginBottom:20 }}>Réglementaire</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(28px,5vw,48px)', fontWeight:300, fontStyle:'italic', color:'#fff', letterSpacing:'-0.02em', lineHeight:1.08, margin:'0 0 16px' }}>
            ERP, diagnostics & <span style={{ fontWeight:700, fontStyle:'normal' }}>conformité</span>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.4)', lineHeight:1.6, margin:'0 0 36px', fontWeight:300 }}>
            État des Risques et Pollutions, zonage réglementaire, PPR, arrêtés préfectoraux — tout en un.
          </p>
          <button onClick={()=>navigate('/immo/erp')} style={{ padding:'16px 48px', background:'transparent', color:'#fff', border:`1px solid ${L.gold}`, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.08em', textTransform:'uppercase', transition:'all .3s' }}
            onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            Découvrir l'espace ERP
          </button>
        </div>
      </section>

      {/* ══ POUR QUI ══ */}
      <section ref={r4} style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Pour qui</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,38px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 40px', lineHeight:1.12 }}>
            Conçu pour les <span style={{ fontWeight:700, fontStyle:'normal' }}>investisseurs</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
            {[
              { icon:'🏛️', title:'Gérants de SCI', desc:'Familiales ou professionnelles, IR ou IS — gérez vos structures en toute simplicité.' },
              { icon:'🏠', title:'Propriétaires bailleurs', desc:'Un bien ou cent — suivi des loyers, des charges et des travaux.' },
              { icon:'💼', title:'Investisseurs', desc:'Analyse de rentabilité, simulation, suivi de performance de votre patrimoine.' },
              { icon:'📋', title:'Gestionnaires de parc', desc:'Agences, administrateurs de biens — gestion multi-mandats professionnelle.' },
            ].map(s => (
              <div key={s.title}>
                <div style={{ fontSize:32, marginBottom:14 }}>{s.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer ref={r5} style={{ padding:'28px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <nav style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:14, flexWrap:'wrap' }}>
          {[{label:'Accueil',href:'/'},{label:'Gestion SCI',href:'/immo'},{label:'ERP & Diagnostics',href:'/immo/erp'},{label:'Freample Artisans',href:'/btp'},{label:'Freample Com',href:'/com'}].map(l=>(
            <a key={l.label} href={l.href} style={{ fontSize:12, color:L.textSec, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>© 2026 Freample Immo · En développement</p>
      </footer>
    </div>
  );
}
