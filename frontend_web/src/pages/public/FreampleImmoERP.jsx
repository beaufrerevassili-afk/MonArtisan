import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useFadeUp, useScaleIn, StaggerChildren } from '../../utils/scrollAnimations';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1', blue:'#2563EB', blueBg:'#EFF6FF',
  red:'#DC2626', redBg:'#FEF2F2', green:'#16A34A', greenBg:'#F0FDF4',
  orange:'#D97706', orangeBg:'#FFFBEB',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

export default function FreampleImmoERP() {
  const navigate = useNavigate();
  const [adresse, setAdresse] = useState('');
  const s1=useScaleIn(),s2=useScaleIn(0.15),s3=useScaleIn(0.15);
  const r1=useFadeUp(),r2=useFadeUp(0.1),r3=useFadeUp(0.1),r4=useFadeUp();

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* ══ SOUS-NAV APPLE STYLE ══ */}
      <div style={{ position:'sticky', top:58, zIndex:190, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:`1px solid ${L.border}`, display:'flex', justifyContent:'center', gap:0, padding:'0 24px' }}>
        {[
          { label:'Freample Immo', href:'/immo', active:false },
          { label:'ERP & Diagnostics', href:'/immo/erp', active:true },
        ].map(item => (
          <button key={item.label} onClick={()=>navigate(item.href)}
            style={{ padding:'12px 24px', background:'none', border:'none', borderBottom:`2px solid ${item.active?L.noir:'transparent'}`, fontSize:13, fontWeight:item.active?700:400, color:item.active?L.text:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
            onMouseEnter={e=>{if(!item.active)e.currentTarget.style.color=L.text;}}
            onMouseLeave={e=>{if(!item.active)e.currentTarget.style.color=L.textSec;}}>
            {item.label}
          </button>
        ))}
      </div>

      {/* ══ HERO ══ */}
      <section style={{ background:L.noir, padding:'clamp(80px,14vh,130px) 32px clamp(64px,10vh,100px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.15 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.92) 100%)' }} />
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
        <div style={{ maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:20 }}>
            <span style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', padding:'5px 14px', border:`1px solid ${L.gold}40`, background:'rgba(201,169,110,0.1)' }}>ERP</span>
            <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.2em', padding:'5px 14px', border:'1px solid rgba(255,255,255,0.1)' }}>Diagnostics</span>
            <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.2em', padding:'5px 14px', border:'1px solid rgba(255,255,255,0.1)' }}>Conformité</span>
          </div>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(32px,6vw,56px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.05, letterSpacing:'-0.02em', margin:'0 0 16px' }}>
            État des Risques &<br/><span style={{ fontWeight:700, fontStyle:'normal' }}>Pollutions</span>
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', lineHeight:1.6, margin:'0 auto 32px', maxWidth:480, fontWeight:300 }}>
            Générez vos ERP, consultez le zonage réglementaire, les PPR et les arrêtés préfectoraux pour n'importe quelle adresse en France.
          </p>

          {/* Barre de recherche adresse */}
          <div style={{ maxWidth:540, margin:'0 auto', display:'flex', background:L.white, overflow:'hidden' }}>
            <div style={{ flex:1, padding:'16px 20px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:16, opacity:0.4 }}>📍</span>
              <input value={adresse} onChange={e=>setAdresse(e.target.value)} placeholder="Entrez une adresse, une commune ou un code postal…"
                style={{ flex:1, border:'none', outline:'none', fontSize:14, color:L.text, fontFamily:L.font, fontWeight:500, background:'none' }} />
            </div>
            <button style={{ padding:'0 28px', background:L.noir, border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
              Analyser
            </button>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:12 }}>En cours de développement — fonctionnalité bientôt disponible</div>
        </div>
      </section>

      {/* ══ DOCUMENTS RÉGLEMENTAIRES ══ */}
      <section style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div ref={s1} style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Documents</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,40px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 8px', lineHeight:1.12 }}>
              Rapports <span style={{ fontWeight:700, fontStyle:'normal' }}>réglementaires</span>
            </h2>
            <p style={{ fontSize:15, color:L.textSec, maxWidth:500, margin:'0 auto' }}>Tous les documents obligatoires pour sécuriser vos transactions immobilières.</p>
          </div>

          <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
            {[
              { code:'ERP', title:'État des Risques et Pollutions', desc:'Document obligatoire pour toute vente ou location. Recense les risques naturels, miniers, technologiques, sismiques, radon et pollution des sols.', color:L.red, bg:L.redBg, required:true },
              { code:'ENSA', title:'État des Nuisances Sonores Aériennes', desc:'Exposition au bruit des aérodromes. Obligatoire si le bien est situé dans une zone de bruit d\'un plan d\'exposition.', color:L.orange, bg:L.orangeBg, required:true },
              { code:'ERPS', title:'État des Risques de Pollution des Sols', desc:'Secteurs d\'information sur les sols (SIS). Obligation d\'information sur la pollution historique des terrains.', color:L.orange, bg:L.orangeBg, required:true },
              { code:'SRA', title:'Synthèse Risques Argiles', desc:'Retrait-gonflement des argiles. Cartographie de l\'aléa et recommandations constructives pour les terrains argileux.', color:L.blue, bg:L.blueBg, required:false },
              { code:'NRU', title:'Note de Renseignements d\'Urbanisme', desc:'Règles d\'urbanisme applicables à la parcelle : PLU, zonage, servitudes, droit de préemption, alignement.', color:L.blue, bg:L.blueBg, required:false },
              { code:'DP', title:'Droit de Préemption', desc:'Vérification du droit de préemption urbain (DPU), ZAD, espaces naturels sensibles sur la parcelle.', color:L.green, bg:L.greenBg, required:false },
            ].map(doc => (
              <div key={doc.code} style={{ background:L.white, border:`1px solid ${L.border}`, padding:'28px 24px', transition:'all .2s', position:'relative' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.05)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ display:'inline-flex', padding:'4px 12px', background:doc.bg, border:`1px solid ${doc.color}30`, fontSize:13, fontWeight:800, color:doc.color, letterSpacing:'0.02em' }}>{doc.code}</div>
                  {doc.required && <span style={{ fontSize:10, fontWeight:700, color:L.red, textTransform:'uppercase', letterSpacing:'0.06em' }}>Obligatoire</span>}
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:8, lineHeight:1.3 }}>{doc.title}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.6, margin:0 }}>{doc.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══ ZONAGE & PPR ══ */}
      <section style={{ background:L.cream, padding:'clamp(64px,9vh,100px) 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div ref={s2} style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Zonage</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,38px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:0, lineHeight:1.12 }}>
              Données <span style={{ fontWeight:700, fontStyle:'normal' }}>réglementaires</span>
            </h2>
          </div>

          <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:1, background:L.border }}>
            {[
              { icon:'🗺️', title:'Plans de Prévention des Risques (PPR)', desc:'PPR Naturels (inondation, mouvement de terrain, séisme), PPR Technologiques (SEVESO), PPR Miniers. Zonage et prescriptions.' },
              { icon:'📜', title:'Arrêtés préfectoraux', desc:'Arrêtés de catastrophe naturelle, arrêtés d\'information acquéreur-locataire (IAL), arrêtés de reconnaissance.' },
              { icon:'🌊', title:'Zones inondables', desc:'Atlas des zones inondables, TRI (Territoires à Risques Importants), PPRI approuvés et prescrits.' },
              { icon:'⚠️', title:'Sites SEVESO & ICPE', desc:'Installations classées, périmètres de danger, servitudes d\'utilité publique autour des sites industriels.' },
              { icon:'☢️', title:'Radon & Pollution', desc:'Zones à potentiel radon, BASIAS (anciens sites industriels), BASOL (sites pollués), SIS.' },
              { icon:'🔊', title:'Nuisances & Bruit', desc:'Plans d\'exposition au bruit (PEB), cartes de bruit stratégiques, classement sonore des voies.' },
              { icon:'🏔️', title:'Risques naturels', desc:'Sismicité, avalanches, feux de forêt, cyclones, volcans, retrait-gonflement argiles.' },
              { icon:'📐', title:'Urbanisme', desc:'PLU/PLUi, zonage (U, AU, A, N), règlement, OAP, emplacements réservés, servitudes.' },
              { icon:'🌿', title:'Environnement', desc:'Natura 2000, ZNIEFF, zones humides, espaces boisés classés, corridors écologiques.' },
            ].map(s => (
              <div key={s.title} style={{ background:L.white, padding:'28px 24px', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background=L.white}>
                <div style={{ fontSize:24, marginBottom:12 }}>{s.icon}</div>
                <h3 style={{ fontSize:14, fontWeight:700, color:L.text, marginBottom:6 }}>{s.title}</h3>
                <p style={{ fontSize:12.5, color:L.textSec, lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section ref={r3} style={{ background:L.white, padding:'clamp(64px,9vh,100px) 32px', borderTop:`1px solid ${L.border}` }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div ref={s3} style={{ marginBottom:40 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Processus</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,38px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:0 }}>
              Simple et <span style={{ fontWeight:700, fontStyle:'normal' }}>instantané</span>
            </h2>
          </div>
          <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
            {[
              { step:'1', icon:'📍', title:'Entrez l\'adresse', desc:'Saisissez l\'adresse du bien ou la référence cadastrale.' },
              { step:'2', icon:'🔍', title:'Analyse automatique', desc:'Croisement avec les bases officielles : Géorisques, BRGM, IGN, préfectures.' },
              { step:'3', icon:'📄', title:'Rapport généré', desc:'ERP conforme, zonage PPR, arrêtés — téléchargeable en PDF.' },
              { step:'4', icon:'✅', title:'Conforme & à jour', desc:'Données mises à jour en continu. Validité réglementaire garantie.' },
            ].map(s => (
              <div key={s.step}>
                <div style={{ width:48, height:48, margin:'0 auto 14px', background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:L.gold, marginBottom:6, letterSpacing:'0.1em' }}>ÉTAPE {s.step}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, margin:'0 0 6px' }}>{s.title}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.55, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section ref={r4} style={{ background:L.noir, padding:'clamp(64px,10vh,100px) 32px', textAlign:'center' }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4.5vw,42px)', fontWeight:300, fontStyle:'italic', color:'#fff', letterSpacing:'-0.02em', lineHeight:1.08, margin:'0 0 14px' }}>
            Sécurisez vos <span style={{ fontWeight:700, fontStyle:'normal' }}>transactions</span>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.6, margin:'0 0 32px' }}>
            Freample Immo ERP sera disponible prochainement. Restez informé.
          </p>
          <button onClick={()=>navigate('/immo')} style={{ padding:'16px 44px', background:L.gold, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'background .2s' }}
            onMouseEnter={e=>e.currentTarget.style.background=L.goldDark} onMouseLeave={e=>e.currentTarget.style.background=L.gold}>
            Retour Freample Immo
          </button>
        </div>
      </section>

      <footer style={{ padding:'24px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <p style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>© 2026 Freample Immo · ERP & Diagnostics</p>
      </footer>
    </div>
  );
}
