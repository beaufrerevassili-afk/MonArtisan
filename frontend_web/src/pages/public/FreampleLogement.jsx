import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useScaleIn, useFadeUp, StaggerChildren } from '../../utils/scrollAnimations';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1', green:'#16A34A', greenBg:'#F0FDF4',
  blue:'#2563EB', blueBg:'#EFF6FF', red:'#DC2626',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

const STORAGE_KEY = 'freample_immo_data';
const TYPES = ['Tous','Appartement','Maison','Studio','Loft','Local commercial'];
const dpeColors = {A:'#16A34A',B:'#22C55E',C:'#84CC16',D:'#D97706',E:'#EA580C',F:'#DC2626',G:'#DC2626'};

export default function FreampleLogement() {
  const navigate = useNavigate();
  const [ville, setVille] = useState('');
  const [type, setType] = useState('Tous');
  const [budgetMax, setBudgetMax] = useState('');
  const [surfaceMin, setSurfaceMin] = useState('');
  const [selected, setSelected] = useState(null);
  const [candidature, setCandidature] = useState(null);
  const [candForm, setCandForm] = useState({nom:'',prenom:'',email:'',tel:'',message:'',revenus:''});
  const [candSent, setCandSent] = useState(false);
  const s1=useScaleIn(); const r1=useFadeUp(0.1);

  // Lire les biens publiés depuis Freample Immo (localStorage partagé)
  const [annonces, setAnnonces] = useState([]);
  useEffect(()=>{
    const loadAnnonces = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw) {
          const d = JSON.parse(raw);
          const published = (d.biens||[]).filter(b=>b.publie && !b.locataireId);
          const withSci = published.map(b=>{
            const sci = (d.scis||[]).find(s=>s.id===b.sciId);
            return { ...b, proprio:sci?.nom||'Propriétaire Freample' };
          });
          setAnnonces(withSci);
        }
      } catch(e) {}
    };
    loadAnnonces();
    window.addEventListener('storage', loadAnnonces);
    const interval = setInterval(loadAnnonces, 3000);
    return () => { window.removeEventListener('storage', loadAnnonces); clearInterval(interval); };
  },[]);

  const filtered = annonces.filter(a => {
    if(type!=='Tous' && a.type!==type) return false;
    if(ville && !a.adresse?.toLowerCase().includes(ville.toLowerCase())) return false;
    if(budgetMax && a.loyer > Number(budgetMax)) return false;
    if(surfaceMin && a.surface < Number(surfaceMin)) return false;
    return true;
  });

  const envoyerCandidature = () => {
    if(!candForm.nom||!candForm.email) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) {
        const d = JSON.parse(raw);
        const newCand = { id:d.nextId||Date.now(), bienId:candidature.id, ...candForm, revenus:Number(candForm.revenus)||0, statut:'nouvelle', date:new Date().toISOString().slice(0,10) };
        d.candidatures = [...(d.candidatures||[]), newCand];
        d.nextId = (d.nextId||20)+1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      }
    } catch(e) {}
    setCandSent(true);
  };

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
          <p ref={r1} style={{ fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:28 }}>Annonces vérifiées, propriétaires Freample Immo. Candidatez en ligne.</p>

          {/* Barre recherche */}
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
          <span style={{ fontSize:14, fontWeight:700 }}>{filtered.length} logement{filtered.length>1?'s':''} disponible{filtered.length>1?'s':''}</span>
          <span style={{ fontSize:12, color:L.textLight }}>Données en temps réel depuis Freample Immo</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:40, opacity:0.2, marginBottom:12 }}>🏠</div>
            <div style={{ fontSize:16, fontWeight:300, fontFamily:L.serif, fontStyle:'italic' }}>
              {annonces.length===0 ? 'Aucune annonce publiée' : 'Aucun logement ne correspond'}
            </div>
            <div style={{ fontSize:13, color:L.textSec, marginTop:6 }}>
              {annonces.length===0 ? 'Les propriétaires Freample Immo peuvent publier leurs biens vacants ici.' : 'Modifiez vos critères de recherche.'}
            </div>
            {annonces.length===0 && <button onClick={()=>navigate('/immo/demo')} style={{ marginTop:16, padding:'10px 24px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase' }}>Accéder à Freample Immo</button>}
          </div>
        ) : (
          <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
            {filtered.map(a => (
              <div key={a.id} onClick={()=>setSelected(a)} style={{ background:L.white, border:`1px solid ${L.border}`, overflow:'hidden', cursor:'pointer', transition:'all .25s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.06)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                <div style={{ height:180, background:a.photos?.[0]?`url(${a.photos[0]}) center/cover`:L.cream, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {!a.photos?.[0] && <span style={{ fontSize:40, opacity:0.15 }}>🏠</span>}
                  {a.dpe && <div style={{ position:'absolute', top:10, right:10, background:dpeColors[a.dpe]||L.textLight, color:'#fff', fontSize:11, fontWeight:800, padding:'3px 8px' }}>DPE {a.dpe}</div>}
                  {a.meuble && <div style={{ position:'absolute', top:10, left:10, background:L.noir, color:'#fff', fontSize:10, fontWeight:600, padding:'3px 8px' }}>Meublé</div>}
                </div>
                <div style={{ padding:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>{a.nom||a.type}</div>
                      <div style={{ fontSize:12, color:L.textSec }}>📍 {a.adresse}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:18, fontWeight:800, color:L.gold }}>{a.loyer?.toLocaleString()}€</div>
                      <div style={{ fontSize:10, color:L.textLight }}>/mois{a.charges>0?` + ${a.charges}€`:''}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:12, fontSize:12, color:L.textSec, marginTop:8 }}>
                    <span>{a.surface}m²</span>
                    <span>{a.pieces} pièce{a.pieces>1?'s':''}</span>
                    <span style={{ marginLeft:'auto', fontSize:11, color:L.gold, fontWeight:600 }}>{a.proprio}</span>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        )}
      </section>

      {/* CTA */}
      <section style={{ background:L.cream, borderTop:`1px solid ${L.border}`, padding:'clamp(40px,6vh,64px) 32px', textAlign:'center' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>Propriétaire</div>
          <h2 style={{ fontFamily:L.serif, fontSize:'clamp(22px,3.5vw,32px)', fontWeight:300, fontStyle:'italic', margin:'0 0 10px' }}>
            Publiez votre <span style={{ fontWeight:700, fontStyle:'normal' }}>annonce</span>
          </h2>
          <p style={{ fontSize:14, color:L.textSec, marginBottom:24 }}>Gérez votre bien sur Freample Immo → publiez en 1 clic sur Freample Logement → recevez des candidatures.</p>
          <button onClick={()=>navigate('/immo/demo')} style={{ padding:'12px 28px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
            onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
            Gérer mes biens
          </button>
        </div>
      </section>

      <footer style={{ padding:'24px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <span style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase' }}>© 2026 Freample Logement</span>
      </footer>

      {/* Modal détail + candidature */}
      {selected && !candidature && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setSelected(null)}>
          <div style={{ background:L.white, width:'100%', maxWidth:600, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ height:240, background:selected.photos?.[0]?`url(${selected.photos[0]}) center/cover`:L.cream, position:'relative' }}>
              <button onClick={()=>setSelected(null)} style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14 }}>✕</button>
              {selected.dpe && <div style={{ position:'absolute', bottom:12, right:12, background:dpeColors[selected.dpe], color:'#fff', fontSize:13, fontWeight:800, padding:'4px 12px' }}>DPE {selected.dpe}</div>}
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>{selected.nom||selected.type}</h2>
                  <div style={{ fontSize:13, color:L.textSec }}>📍 {selected.adresse}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:24, fontWeight:800, color:L.gold }}>{selected.loyer?.toLocaleString()}€</div>
                  <div style={{ fontSize:11, color:L.textLight }}>/mois{selected.charges>0?` + ${selected.charges}€ charges`:''}</div>
                </div>
              </div>

              {selected.description && <div style={{ fontSize:13, color:L.textSec, lineHeight:1.6, marginBottom:16, padding:'12px 14px', background:L.cream }}>{selected.description}</div>}

              <div style={{ display:'flex', gap:0, border:`1px solid ${L.border}`, marginBottom:16 }}>
                {[{l:'Surface',v:`${selected.surface}m²`},{l:'Pièces',v:selected.pieces},{l:'Type',v:selected.type},{l:'Meublé',v:selected.meuble?'Oui':'Non'}].map((item,i,arr)=>(
                  <div key={item.l} style={{ flex:1, padding:'12px', textAlign:'center', borderRight:i<arr.length-1?`1px solid ${L.border}`:'none' }}>
                    <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', marginBottom:4 }}>{item.l}</div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{item.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:L.cream, padding:'12px 16px', marginBottom:16 }}>
                <div style={{ fontSize:11, color:L.textLight, textTransform:'uppercase', marginBottom:4 }}>Propriétaire</div>
                <div style={{ fontSize:14, fontWeight:700 }}>{selected.proprio}</div>
                <div style={{ fontSize:12, color:L.textSec }}>Propriétaire vérifié Freample Immo</div>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>{setCandidature(selected);setCandSent(false);setCandForm({nom:'',prenom:'',email:'',tel:'',message:'',revenus:''});}}
                  style={{ flex:1, padding:'14px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                  Candidater
                </button>
                <a href={`https://wa.me/33769387193?text=Bonjour, je suis intéressé par "${selected.nom}" à ${selected.adresse}`} target="_blank" rel="noopener noreferrer"
                  style={{ padding:'14px 20px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:L.font, textDecoration:'none' }}>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal candidature */}
      {candidature && (
        <div style={{ position:'fixed', inset:0, zIndex:1001, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>{setCandidature(null);setSelected(null);}}>
          <div style={{ background:L.white, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', padding:'28px 24px' }} onClick={e=>e.stopPropagation()}>
            {!candSent ? <>
              <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>Candidature</div>
              <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 4px' }}>{candidature.nom||candidature.type}</h3>
              <div style={{ fontSize:12, color:L.textSec, marginBottom:16 }}>{candidature.adresse} · {candidature.loyer}€/mois</div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nom *</label><input value={candForm.nom} onChange={e=>setCandForm(f=>({...f,nom:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Prénom *</label><input value={candForm.prenom} onChange={e=>setCandForm(f=>({...f,prenom:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Email *</label><input type="email" value={candForm.email} onChange={e=>setCandForm(f=>({...f,email:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Téléphone</label><input value={candForm.tel} onChange={e=>setCandForm(f=>({...f,tel:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Revenus mensuels nets (€)</label>
                <input type="number" value={candForm.revenus} onChange={e=>setCandForm(f=>({...f,revenus:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Message au propriétaire</label>
                <textarea value={candForm.message} onChange={e=>setCandForm(f=>({...f,message:e.target.value}))} rows={3} placeholder="Présentez-vous et votre situation..." style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', resize:'vertical' }} />
              </div>
              <button onClick={envoyerCandidature} style={{ width:'100%', padding:'14px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                Envoyer ma candidature
              </button>
            </> : <>
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ width:56, height:56, margin:'0 auto 16px', border:`1px solid ${L.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>✓</div>
                <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Candidature envoyée</div>
                <div style={{ fontSize:13, color:L.textSec, marginBottom:20 }}>Le propriétaire recevra votre dossier et vous contactera directement.</div>
                <button onClick={()=>{setCandidature(null);setSelected(null);}} style={{ padding:'12px 28px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:13, cursor:'pointer', fontFamily:L.font }}>Fermer</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
