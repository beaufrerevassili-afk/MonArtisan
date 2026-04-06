import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

export default function SiteWebModule({ data, setData, showToast }) {
  const [view, setView] = useState('desktop');
  const siteWeb = data.siteWeb || { domaine:'mon-agence.freample.com', actif:true, theme:'luxe', analytics:{visites:1240,leads:34,pagesVues:4800,topPages:['Accueil','Nos biens','Estimation','Contact']}, pages:[{nom:'Accueil',actif:true},{nom:'Nos biens',actif:true},{nom:'Estimation en ligne',actif:true},{nom:'Contact',actif:true},{nom:'Blog',actif:false},{nom:'Équipe',actif:true},{nom:'Nos services',actif:true}], seo:{titre:'Mon Agence Immobilière — Nice',description:'Agence immobilière à Nice. Estimation gratuite, vente, location, gestion locative.'} };
  if(!data.siteWeb) setData(d=>({...d, siteWeb:siteWeb}));

  const togglePage = (nom) => {
    setData(d=>({...d, siteWeb:{...siteWeb, pages:siteWeb.pages.map(p=>p.nom===nom?{...p,actif:!p.actif}:p)}}));
  };

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:800,margin:'0 0 16px'}}>Site web agence</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Configuration</div>
          <div style={{fontSize:13,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:L.textSec}}>Domaine</span><strong>{siteWeb.domaine}</strong></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:L.textSec}}>SSL</span><span style={{color:L.green,fontWeight:600}}>✓ Actif</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:L.textSec}}>Hébergement</span><span style={{color:L.green,fontWeight:600}}>✓ Inclus</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:L.textSec}}>Thème</span><strong>{siteWeb.theme}</strong></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:L.textSec}}>Responsive</span><span style={{color:L.green,fontWeight:600}}>✓ Oui</span></div>
          </div>
        </div>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Analytics (ce mois)</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[{l:'Visites',v:siteWeb.analytics.visites,c:L.blue},{l:'Leads',v:siteWeb.analytics.leads,c:L.green},{l:'Pages vues',v:siteWeb.analytics.pagesVues,c:L.gold},{l:'Taux conv.',v:`${Math.round(siteWeb.analytics.leads/siteWeb.analytics.visites*100)}%`,c:'#7C3AED'}].map(k=>(
              <div key={k.l} style={{background:L.cream,padding:'10px',textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:200,fontFamily:L.serif,color:k.c}}>{k.v}</div>
                <div style={{fontSize:10,color:L.textSec}}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Pages du site</div>
          {siteWeb.pages.map(p=>(
            <div key={p.nom} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:`1px solid ${L.border}`}}>
              <span style={{fontSize:13,opacity:p.actif?1:0.4}}>{p.nom}</span>
              <div onClick={()=>togglePage(p.nom)} style={{width:36,height:20,borderRadius:10,background:p.actif?L.green:L.border,cursor:'pointer',position:'relative',transition:'background .2s'}}>
                <div style={{width:16,height:16,borderRadius:8,background:'#fff',position:'absolute',top:2,left:p.actif?18:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.15)'}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={CARD}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>SEO</div>
          <div style={{fontSize:12,color:L.textSec,marginBottom:6}}>Titre:</div>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10,padding:'8px 12px',background:L.cream}}>{siteWeb.seo.titre}</div>
          <div style={{fontSize:12,color:L.textSec,marginBottom:6}}>Description:</div>
          <div style={{fontSize:12,padding:'8px 12px',background:L.cream,lineHeight:1.5}}>{siteWeb.seo.description}</div>
          <button onClick={()=>showToast('SEO mis à jour')} style={{...BTN_OUTLINE,fontSize:10,padding:'5px 12px',marginTop:10}}>Modifier SEO</button>
        </div>
      </div>

      <div style={CARD}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700}}>Aperçu du site</div>
          <div style={{display:'flex',gap:4}}>
            {['desktop','mobile'].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{...v===view?BTN:{...BTN_OUTLINE},fontSize:10,padding:'4px 10px'}}>{v==='desktop'?'💻':'📱'} {v}</button>
            ))}
          </div>
        </div>
        <div style={{border:`1px solid ${L.border}`,background:L.cream,padding:20,maxWidth:view==='mobile'?320:'100%',margin:'0 auto',minHeight:300,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>Mon Agence Immo</div>
          <div style={{fontSize:12,color:L.textSec,marginBottom:16}}>Estimation gratuite · Vente · Location · Gestion</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
            {siteWeb.pages.filter(p=>p.actif).map(p=>(
              <span key={p.nom} style={{padding:'6px 14px',background:L.white,border:`1px solid ${L.border}`,fontSize:11}}>{p.nom}</span>
            ))}
          </div>
          <div style={{marginTop:20,fontSize:11,color:L.textLight}}>🔒 {siteWeb.domaine}</div>
        </div>
      </div>
    </div>
  );
}
