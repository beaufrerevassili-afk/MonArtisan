import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useFadeUp, useScaleIn, StaggerChildren } from '../../utils/scrollAnimations';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1', green:'#16A34A', greenBg:'#F0FDF4',
  blue:'#2563EB', red:'#DC2626',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

const TYPES = ['Tous','Appartement','Maison','Studio','Loft','Local commercial'];
const DEMO_ANNONCES = [
  { id:1, titre:'Appartement lumineux 3P', type:'Appartement', ville:'Nice', adresse:'24 rue de la Liberté', surface:65, pieces:3, loyer:850, charges:150, dpe:'C', photo:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80', proprio:'SCI Riviera', meuble:false, dispo:'Disponible' },
  { id:2, titre:'Studio rénové centre-ville', type:'Studio', ville:'Nice', adresse:'8 av. Jean Médecin', surface:28, pieces:1, loyer:550, charges:80, dpe:'D', photo:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80', proprio:'SCI Riviera', meuble:true, dispo:'Disponible' },
  { id:3, titre:'T2 Faubourg Saint-Martin', type:'Appartement', ville:'Paris 10e', adresse:'15 rue du Faubourg', surface:45, pieces:2, loyer:1200, charges:200, dpe:'E', photo:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80', proprio:'SCI Patrimoine 75', meuble:false, dispo:'Disponible 01/06' },
  { id:4, titre:'Local commercial Voltaire', type:'Local commercial', ville:'Paris 11e', adresse:'42 bd Voltaire', surface:55, pieces:2, loyer:2200, charges:350, dpe:null, photo:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', proprio:'SCI Patrimoine 75', meuble:false, dispo:'Disponible' },
  { id:5, titre:'Maison familiale avec jardin', type:'Maison', ville:'Bordeaux', adresse:'12 chemin des Vignes', surface:110, pieces:5, loyer:1400, charges:0, dpe:'B', photo:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80', proprio:'Particulier', meuble:false, dispo:'Disponible' },
  { id:6, titre:'Loft atypique Oberkampf', type:'Loft', ville:'Paris 11e', adresse:'21 rue Oberkampf', surface:75, pieces:3, loyer:1850, charges:180, dpe:'C', photo:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80', proprio:'SCI Patrimoine 75', meuble:true, dispo:'Disponible' },
];

export default function FreampleLogement() {
  const navigate = useNavigate();
  const [ville, setVille] = useState('');
  const [type, setType] = useState('Tous');
  const [budgetMax, setBudgetMax] = useState('');
  const [surfaceMin, setSurfaceMin] = useState('');
  const [selected, setSelected] = useState(null);
  const s1=useScaleIn(); const r1=useFadeUp(0.1);

  const filtered = DEMO_ANNONCES.filter(a => {
    if(type!=='Tous' && a.type!==type) return false;
    if(ville && !a.ville.toLowerCase().includes(ville.toLowerCase()) && !a.adresse.toLowerCase().includes(ville.toLowerCase())) return false;
    if(budgetMax && a.loyer > Number(budgetMax)) return false;
    if(surfaceMin && a.surface < Number(surfaceMin)) return false;
    return true;
  });

  const dpeColors = {A:'#16A34A',B:'#22C55E',C:'#84CC16',D:'#D97706',E:'#EA580C',F:'#DC2626',G:'#DC2626'};

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* Sous-nav Apple */}
      <div style={{ position:'sticky', top:58, zIndex:190, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:`1px solid ${L.border}`, display:'flex', justifyContent:'center', gap:0, padding:'0 24px' }}>
        {[
          { label:'Freample Immo', href:'/immo' },
          { label:'Freample Logement', href:'/immo/logement', active:true },
          { label:'ERP & Diagnostics', href:'/immo/erp' },
        ].map(item => (
          <button key={item.label} onClick={()=>navigate(item.href)}
            style={{ padding:'12px 24px', background:'none', border:'none', borderBottom:`2px solid ${item.active?L.noir:'transparent'}`, fontSize:13, fontWeight:item.active?700:400, color:item.active?L.text:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
            onMouseEnter={e=>{if(!item.active)e.currentTarget.style.color=L.text;}}
            onMouseLeave={e=>{if(!item.active)e.currentTarget.style.color=L.textSec;}}>
            {item.label}
          </button>
        ))}
      </div>

      {/* Hero + Recherche */}
      <section style={{ background:L.noir, padding:'clamp(48px,8vh,80px) 32px clamp(40px,6vh,64px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.15 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 100%)' }} />
        <div style={{ maxWidth:700, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div ref={s1}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.3em', marginBottom:16 }}>Freample Logement</div>
            <h1 style={{ fontFamily:L.serif, fontSize:'clamp(30px,5.5vw,52px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.05, letterSpacing:'-0.02em', margin:'0 0 12px' }}>
              Trouvez votre <span style={{ fontWeight:700, fontStyle:'normal' }}>logement</span>
            </h1>
          </div>
          <p ref={r1} style={{ fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:28 }}>Location, colocation, local commercial — des annonces vérifiées par des propriétaires Freample.</p>

          {/* Barre de recherche SeLoger style */}
          <div style={{ background:L.white, maxWidth:600, margin:'0 auto', overflow:'hidden' }}>
            <div style={{ display:'flex' }}>
              <div style={{ flex:1, padding:'14px 18px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ opacity:0.4 }}>📍</span>
                <input value={ville} onChange={e=>setVille(e.target.value)} placeholder="Ville, quartier, adresse..." style={{ border:'none', outline:'none', fontSize:14, color:L.text, fontFamily:L.font, fontWeight:500, flex:1, background:'none' }} />
              </div>
              <button style={{ padding:'0 24px', background:L.noir, border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                Rechercher
              </button>
            </div>
            {/* Filtres rapides */}
            <div style={{ display:'flex', gap:0, borderTop:`1px solid ${L.border}` }}>
              <select value={type} onChange={e=>setType(e.target.value)} style={{ flex:1, padding:'10px 14px', border:'none', borderRight:`1px solid ${L.border}`, outline:'none', fontSize:12, color:L.textSec, fontFamily:L.font, background:'none', cursor:'pointer' }}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
              <input type="number" value={budgetMax} onChange={e=>setBudgetMax(e.target.value)} placeholder="Budget max (€)" style={{ flex:1, padding:'10px 14px', border:'none', borderRight:`1px solid ${L.border}`, outline:'none', fontSize:12, color:L.text, fontFamily:L.font, background:'none' }} />
              <input type="number" value={surfaceMin} onChange={e=>setSurfaceMin(e.target.value)} placeholder="Surface min (m²)" style={{ flex:1, padding:'10px 14px', border:'none', outline:'none', fontSize:12, color:L.text, fontFamily:L.font, background:'none' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'clamp(24px,3vh,36px) clamp(20px,3vw,40px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontSize:14, fontWeight:700 }}>{filtered.length} logement{filtered.length>1?'s':''}</span>
          <span style={{ fontSize:12, color:L.textLight }}>Annonces vérifiées Freample</span>
        </div>

        <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
          {filtered.map(a => (
            <div key={a.id} onClick={()=>setSelected(a)} style={{ background:L.white, border:`1px solid ${L.border}`, overflow:'hidden', cursor:'pointer', transition:'all .25s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.06)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
              {/* Photo */}
              <div style={{ height:180, background:`url(${a.photo}) center/cover`, position:'relative' }}>
                {a.dpe && <div style={{ position:'absolute', top:10, right:10, background:dpeColors[a.dpe]||L.textLight, color:'#fff', fontSize:11, fontWeight:800, padding:'3px 8px' }}>DPE {a.dpe}</div>}
                {a.meuble && <div style={{ position:'absolute', top:10, left:10, background:L.noir, color:'#fff', fontSize:10, fontWeight:600, padding:'3px 8px' }}>Meublé</div>}
                <div style={{ position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,0.7)', color:'#fff', fontSize:11, padding:'3px 10px', fontWeight:500 }}>{a.dispo}</div>
              </div>
              {/* Infos */}
              <div style={{ padding:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:2 }}>{a.titre}</div>
                    <div style={{ fontSize:12, color:L.textSec }}>📍 {a.adresse}, {a.ville}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:L.gold }}>{a.loyer.toLocaleString()}€</div>
                    <div style={{ fontSize:10, color:L.textLight }}>/mois{a.charges>0?` + ${a.charges}€ ch.`:''}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:12, fontSize:12, color:L.textSec, marginTop:8 }}>
                  <span>{a.surface}m²</span>
                  <span>{a.pieces} pièce{a.pieces>1?'s':''}</span>
                  <span style={{ color:L.textLight }}>{a.type}</span>
                  <span style={{ marginLeft:'auto', fontSize:11, color:L.gold, fontWeight:600 }}>{a.proprio}</span>
                </div>
              </div>
            </div>
          ))}
        </StaggerChildren>

        {filtered.length===0 && <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:40, opacity:0.2, marginBottom:12 }}>🏠</div>
          <div style={{ fontSize:16, fontWeight:300, fontFamily:L.serif, fontStyle:'italic', color:L.text }}>Aucun logement trouvé</div>
          <div style={{ fontSize:13, color:L.textSec, marginTop:4 }}>Modifiez vos critères de recherche</div>
        </div>}
      </section>

      {/* CTA propriétaire */}
      <section style={{ background:L.cream, borderTop:`1px solid ${L.border}`, padding:'clamp(40px,6vh,64px) 32px', textAlign:'center' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>Propriétaire</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(22px,3.5vw,32px)', fontWeight:300, fontStyle:'italic', margin:'0 0 10px' }}>
            Publiez votre <span style={{ fontWeight:700, fontStyle:'normal' }}>annonce</span>
          </h2>
          <p style={{ fontSize:14, color:L.textSec, marginBottom:24 }}>Gérez votre bien sur Freample Immo, publiez automatiquement sur Freample Logement.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>navigate('/immo/demo')} style={{ padding:'12px 28px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
              Gérer mes biens
            </button>
            <button onClick={()=>navigate('/com')} style={{ padding:'12px 28px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=L.noir} onMouseLeave={e=>e.currentTarget.style.borderColor=L.border}>
              🎬 Shooting photo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:'24px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <span style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase' }}>© 2026 Freample Logement</span>
      </footer>

      {/* Modal détail annonce */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setSelected(null)}>
          <div style={{ background:L.white, width:'100%', maxWidth:600, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            {/* Photo grande */}
            <div style={{ height:260, background:`url(${selected.photo}) center/cover`, position:'relative' }}>
              <button onClick={()=>setSelected(null)} style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14 }}>✕</button>
              {selected.dpe && <div style={{ position:'absolute', bottom:12, right:12, background:dpeColors[selected.dpe], color:'#fff', fontSize:13, fontWeight:800, padding:'4px 12px' }}>DPE {selected.dpe}</div>}
              {selected.meuble && <div style={{ position:'absolute', bottom:12, left:12, background:L.noir, color:'#fff', fontSize:11, fontWeight:600, padding:'4px 10px' }}>Meublé</div>}
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px', letterSpacing:'-0.02em' }}>{selected.titre}</h2>
                  <div style={{ fontSize:13, color:L.textSec }}>📍 {selected.adresse}, {selected.ville}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:24, fontWeight:800, color:L.gold }}>{selected.loyer.toLocaleString()}€</div>
                  <div style={{ fontSize:11, color:L.textLight }}>/mois{selected.charges>0?` + ${selected.charges}€ charges`:''}</div>
                </div>
              </div>

              <div style={{ display:'flex', gap:0, border:`1px solid ${L.border}`, marginBottom:20 }}>
                {[{l:'Surface',v:`${selected.surface}m²`},{l:'Pièces',v:selected.pieces},{l:'Type',v:selected.type},{l:'Dispo',v:selected.dispo}].map((item,i,arr)=>(
                  <div key={item.l} style={{ flex:1, padding:'12px', textAlign:'center', borderRight:i<arr.length-1?`1px solid ${L.border}`:'none' }}>
                    <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{item.l}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:L.text }}>{item.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:L.cream, padding:'14px 18px', marginBottom:20 }}>
                <div style={{ fontSize:11, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Propriétaire</div>
                <div style={{ fontSize:14, fontWeight:700 }}>{selected.proprio}</div>
                <div style={{ fontSize:12, color:L.textSec }}>Propriétaire vérifié Freample Immo</div>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <a href={`https://wa.me/33769387193?text=Bonjour, je suis intéressé par le logement "${selected.titre}" à ${selected.ville}`} target="_blank" rel="noopener noreferrer"
                  style={{ flex:1, padding:'14px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, textDecoration:'none', textAlign:'center', letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                  Contacter
                </a>
                <button onClick={()=>navigate(`/btp?q=${encodeURIComponent(selected.adresse)}`)} style={{ padding:'14px 20px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font }}>
                  🔧 Artisan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
