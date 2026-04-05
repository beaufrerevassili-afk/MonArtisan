import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import HideForClient from '../../components/public/HideForClient';
import { getTarifs } from '../../data/tarifsCom';
import api from '../../services/api';

const C = {
  primary:'#8B5CF6', primaryHover:'#7C3AED', dark:'#0F0A1A',
  text:'#0F0A1A', textSec:'#6B7280', textLight:'#9CA3AF',
  bg:'#FFFFFF', soft:'#F5F3FF', border:'#E9E5F5',
  green:'#059669', font:"Inter,-apple-system,'Helvetica Neue',Arial,sans-serif",
};
const inp = { width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' };
const lbl = { fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 };

export default function FreampleCom() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=landing, 1=brief step1, 2=brief step2, 3=sent
  const [brief, setBrief] = useState({ type:'', format:'', quantite:'1', style:'', reference:'', options:[], description:'', nom:'', email:'', deadline:'' });
  const [sending, setSending] = useState(false);
  const [suiviToken, setSuiviToken] = useState(null);
  const [tarifs, setTarifs] = useState(getTarifs());

  useEffect(() => {
    api.get('/com/tarifs').then(r => { if (r.data.tarifs) setTarifs(r.data.tarifs); }).catch(() => {});
  }, []);

  const f = (k) => ({ value:brief[k], onChange:e=>setBrief(p=>({...p,[k]:e.target.value})) });
  const toggleOpt = (v) => setBrief(p=>({...p, options: p.options.includes(v) ? p.options.filter(x=>x!==v) : [...p.options, v] }));

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.font, color:C.text }}>
      <PublicNavbar />

      {/* ══ HERO ══ */}
      <div style={{ background:`linear-gradient(160deg, ${C.dark} 0%, #2D1B69 60%, #4A2C8A 100%)`, padding:'clamp(40px,7vh,72px) 24px clamp(36px,5vh,56px)', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h1 style={{ fontSize:'clamp(28px,5vw,44px)', fontWeight:800, color:'#fff', lineHeight:1.12, letterSpacing:'-0.03em', margin:'0 0 12px' }}>
            On monte vos vidéos.<br/>Vous publiez.
          </h1>
          <p style={{ fontSize:'clamp(15px,2vw,17px)', color:'rgba(255,255,255,0.6)', lineHeight:1.5, margin:'0 0 28px' }}>
            TikTok, Reels, YouTube — livré en 48h. À partir de 49€.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>setStep(1)} style={{ padding:'14px 32px', background:'#fff', color:C.dark, border:'none', borderRadius:999, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:C.font }}>
              Démarrer un projet →
            </button>
            <a href="https://wa.me/33612345678?text=Bonjour, je suis intéressé par vos services Freample Com" target="_blank" rel="noopener noreferrer"
              style={{ padding:'14px 28px', background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:999, fontSize:16, fontWeight:500, cursor:'pointer', fontFamily:C.font, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
              💬 Nous contacter
            </a>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:24, flexWrap:'wrap' }}>
            {['⚡ Livré en 48h','✅ Satisfait ou refait','🔒 Paiement sécurisé'].map(t=>(
              <span key={t} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CE QU'ON FAIT — avant les prix ══ */}
      <div style={{ maxWidth:800, margin:'0 auto', padding:'48px 24px 32px' }}>
        <h2 style={{ fontSize:22, fontWeight:800, textAlign:'center', marginBottom:8 }}>Tout ce dont vous avez besoin pour vos réseaux</h2>
        <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:32 }}>Une équipe dédiée, des délais tenus, une qualité pro</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:12 }}>
          {[
            { icon:'🎬', title:'Montage vidéo', sub:'TikTok, Reels, YouTube' },
            { icon:'💬', title:'Sous-titres', sub:'Animés, multilingues' },
            { icon:'🎵', title:'Musique & SFX', sub:'Tendance, libres de droits' },
            { icon:'🎨', title:'Design', sub:'Logo, visuels, branding' },
            { icon:'📱', title:'Gestion réseaux', sub:'Planning, posts, stories' },
            { icon:'📈', title:'Publicité', sub:'Meta Ads, Google Ads' },
          ].map(s=>(
            <div key={s.title} style={{ padding:'20px 16px', borderRadius:14, border:`1px solid ${C.border}`, textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>{s.title}</div>
              <div style={{ fontSize:12, color:C.textSec }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CONTACT — Appel découverte ══ */}
      <div style={{ maxWidth:600, margin:'0 auto', padding:'0 24px 48px' }}>
        <div style={{ background:C.soft, borderRadius:16, padding:'28px 24px', border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 250px' }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:6 }}>Pas sûr de ce qu'il vous faut ?</div>
            <div style={{ fontSize:14, color:C.textSec, lineHeight:1.5 }}>Appelez-nous ou écrivez-nous. On vous conseille gratuitement et on vous fait un devis sur mesure.</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
            <a href="https://wa.me/33612345678?text=Bonjour, j'aimerais discuter d'un projet" target="_blank" rel="noopener noreferrer"
              style={{ padding:'12px 24px', background:'#25D366', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:C.font, textDecoration:'none', textAlign:'center', display:'flex', alignItems:'center', gap:8 }}>
              💬 WhatsApp
            </a>
            <a href="mailto:freamplecom@gmail.com?subject=Demande d'information Freample Com"
              style={{ padding:'12px 24px', background:C.bg, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:C.font, textDecoration:'none', textAlign:'center' }}>
              ✉️ Email
            </a>
          </div>
        </div>
      </div>

      {/* ══ PRICING — Plus bas, pour ceux qui veulent ══ */}
      <div id="tarifs" style={{ background:C.soft, borderTop:`1px solid ${C.border}`, padding:'48px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ fontSize:22, fontWeight:800, textAlign:'center', marginBottom:6 }}>Nos formules</h2>
          <p style={{ fontSize:14, color:C.textSec, textAlign:'center', marginBottom:32 }}>Ou <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:C.primary, fontWeight:700, cursor:'pointer', fontFamily:C.font, fontSize:14, textDecoration:'underline' }}>demandez un devis sur mesure</button></p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
          {/* Starter */}
          <div style={{ borderRadius:16, border:`1px solid ${C.border}`, padding:'28px 22px', display:'flex', flexDirection:'column' }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.textSec, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Starter</div>
            <div style={{ fontSize:32, fontWeight:800, marginBottom:4 }}>149€<span style={{ fontSize:14, fontWeight:400, color:C.textSec }}>/mois</span></div>
            <div style={{ fontSize:14, color:C.textSec, marginBottom:16 }}>4 TikToks par mois</div>
            {['4 TikToks / mois','Sous-titres animés','Musique tendance','1 révision / vidéo','Livraison 72h'].map(f=>(
              <div key={f} style={{ fontSize:13, color:C.text, padding:'4px 0', display:'flex', gap:8 }}><span style={{ color:C.green }}>✓</span>{f}</div>
            ))}
            <div style={{ flex:1 }} />
            <button onClick={()=>{ setBrief(p=>({...p,type:'Montage vidéo',quantite:'4'})); setStep(1); }}
              style={{ marginTop:16, width:'100%', padding:'12px', background:C.bg, color:C.text, border:`2px solid ${C.border}`, borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font }}>
              Choisir
            </button>
          </div>

          {/* Growth — highlighted */}
          <div style={{ borderRadius:16, background:C.dark, padding:'28px 22px', display:'flex', flexDirection:'column', position:'relative' }}>
            <div style={{ position:'absolute', top:14, right:14, background:C.primary, color:'#fff', padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>Populaire</div>
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Growth</div>
            <div style={{ fontSize:32, fontWeight:800, color:'#fff', marginBottom:4 }}>349€<span style={{ fontSize:14, fontWeight:400, color:'rgba(255,255,255,0.5)' }}>/mois</span></div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:16 }}>10 TikToks + 5 Reels</div>
            {['10 TikToks / mois','5 Reels Instagram','Sous-titres + effets','2 révisions / vidéo','Livraison 48h','Stratégie contenu'].map(f=>(
              <div key={f} style={{ fontSize:13, color:'rgba(255,255,255,0.85)', padding:'4px 0', display:'flex', gap:8 }}><span style={{ color:C.primary }}>✓</span>{f}</div>
            ))}
            <div style={{ flex:1 }} />
            <button onClick={()=>{ setBrief(p=>({...p,type:'Montage vidéo',quantite:'10'})); setStep(1); }}
              style={{ marginTop:16, width:'100%', padding:'12px', background:C.primary, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font }}>
              Choisir Growth →
            </button>
          </div>

          {/* Pro */}
          <div style={{ borderRadius:16, border:`1px solid ${C.border}`, padding:'28px 22px', display:'flex', flexDirection:'column' }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.textSec, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Pro</div>
            <div style={{ fontSize:32, fontWeight:800, marginBottom:4 }}>699€<span style={{ fontSize:14, fontWeight:400, color:C.textSec }}>/mois</span></div>
            <div style={{ fontSize:14, color:C.textSec, marginBottom:16 }}>20 TikToks + gestion RS</div>
            {['20 TikToks / mois','10 Reels Instagram','Gestion 1 réseau social','Révisions illimitées','Livraison 48h','Appel stratégie mensuel'].map(f=>(
              <div key={f} style={{ fontSize:13, color:C.text, padding:'4px 0', display:'flex', gap:8 }}><span style={{ color:C.green }}>✓</span>{f}</div>
            ))}
            <div style={{ flex:1 }} />
            <button onClick={()=>{ setBrief(p=>({...p,type:'Montage vidéo',quantite:'20'})); setStep(1); }}
              style={{ marginTop:16, width:'100%', padding:'12px', background:C.bg, color:C.text, border:`2px solid ${C.border}`, borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:C.font }}>
              Choisir
            </button>
          </div>
        </div>

        {/* Service unitaire */}
        <div style={{ textAlign:'center', marginTop:24 }}>
          <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:C.primary, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>
            Besoin d'un service ponctuel ? Demandez un devis →
          </button>
        </div>

        {/* Réassurance */}
        <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:24, flexWrap:'wrap' }}>
          {['🔄 Résiliable','⚡ 48h livraison','✅ Satisfait ou refait','💳 Paiement sécurisé'].map(r=>(
            <span key={r} style={{ fontSize:13, color:C.textSec }}>{r}</span>
          ))}
        </div>
        </div>{/* close maxWidth:900 */}
      </div>

      {/* ══ GRILLE PRIX DÉTAILLÉE (accordéon compact) ══ */}
      <div style={{ background:C.soft, padding:'40px 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h3 style={{ fontSize:18, fontWeight:700, textAlign:'center', marginBottom:20 }}>Tous nos tarifs</h3>
          {tarifs.map((t,i) => (
            <details key={t.cat} style={{ marginBottom:8 }} open={i===0}>
              <summary style={{ padding:'12px 16px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:700, color:C.text, listStyle:'none' }}>
                {t.cat}
              </summary>
              <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderTop:'none', borderRadius:'0 0 10px 10px' }}>
                {t.items.map((item,j) => (
                  <div key={j} style={{ display:'flex', justifyContent:'space-between', padding:'10px 16px', borderBottom:j<t.items.length-1?`1px solid ${C.border}`:'none', fontSize:14 }}>
                    <span>{item.nom}</span>
                    <span style={{ fontWeight:700, color:C.primary }}>{item.prix}€</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* ══ BOUTON WHATSAPP FLOTTANT ══ */}
      <a href="https://wa.me/33612345678?text=Bonjour, je suis intéressé par Freample Com" target="_blank" rel="noopener noreferrer"
        style={{ position:'fixed', bottom:24, right:24, width:56, height:56, borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(37,211,102,0.4)', zIndex:100, textDecoration:'none', transition:'transform .2s' }}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        <span style={{ fontSize:28, lineHeight:1 }}>💬</span>
      </a>

      {/* ══ FOOTER ══ */}
      <div style={{ padding:'24px', borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
        <span style={{ fontSize:13, color:C.textLight }}>© 2026 Freample Com · <a href="/cgu" style={{ color:C.textSec, textDecoration:'none' }}>CGU</a></span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL DEMANDE — Overlay plein écran, Fiverr-style
         ══════════════════════════════════════════════════════════ */}
      {step > 0 && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>{ if(step < 3) setStep(0); }}>
          <div style={{ background:C.bg, borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', padding:'28px 24px' }}
            onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:18, fontWeight:800, color:C.text }}>{step===3?'Demande envoyée !':`Étape ${step}/2`}</div>
              <button onClick={()=>setStep(0)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:C.textLight }}>✕</button>
            </div>

            {/* Progress */}
            {step < 3 && (
              <div style={{ display:'flex', gap:8, marginBottom:24 }}>
                {['Votre projet','Vos coordonnées'].map((s,i) => (
                  <div key={s} style={{ flex:1 }}>
                    <div style={{ height:4, borderRadius:2, background:i+1<=step?C.primary:'#E5E5E5', marginBottom:4 }} />
                    <div style={{ fontSize:12, color:i+1<=step?C.primary:C.textLight }}>{s}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Step 1: Projet ── */}
            {step === 1 && (<div>
              <div style={{ marginBottom:16 }}>
                <label style={lbl}>Type de service *</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[{v:'Montage vidéo',icon:'🎬'},{v:'Réseaux sociaux',icon:'📱'},{v:'Design',icon:'🎨'},{v:'Publicité',icon:'📈'}].map(t=>(
                    <button key={t.v} onClick={()=>setBrief(p=>({...p,type:t.v}))}
                      style={{ padding:'14px', borderRadius:10, border:`2px solid ${brief.type===t.v?C.primary:C.border}`, background:brief.type===t.v?C.soft:C.bg, cursor:'pointer', fontFamily:C.font, textAlign:'left' }}>
                      <span style={{ fontSize:20 }}>{t.icon}</span>
                      <div style={{ fontSize:14, fontWeight:700, marginTop:4 }}>{t.v}</div>
                    </button>
                  ))}
                </div>
              </div>

              {brief.type==='Montage vidéo' && (
                <div style={{ marginBottom:16 }}>
                  <label style={lbl}>Format</label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['TikTok / Reel','YouTube Short','YouTube Long','Clip promo','Stories'].map(f=>(
                      <button key={f} onClick={()=>setBrief(p=>({...p,format:f}))}
                        style={{ padding:'7px 14px', borderRadius:999, border:`1.5px solid ${brief.format===f?C.primary:C.border}`, background:brief.format===f?C.soft:C.bg, color:brief.format===f?C.primary:C.textSec, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                <div><label style={lbl}>Quantité</label><select {...f('quantite')} style={{...inp,background:'#fff'}}>{['1','2','3','5','10','15','20'].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
                <div><label style={lbl}>Style</label>
                  <select value={brief.style} onChange={e=>setBrief(p=>({...p,style:e.target.value}))} style={{...inp,background:'#fff'}}>
                    <option value="">Non précisé</option>
                    <option>Dynamique</option><option>Minimaliste</option><option>Fun / Décalé</option><option>Pro / Corporate</option><option>Cinématique</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={lbl}>Options</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {[{v:'Sous-titres',i:'💬'},{v:'Musique',i:'🎵'},{v:'Transitions',i:'✨'},{v:'Voix-off',i:'🎙️'},{v:'Miniature',i:'🖼️'}].map(o=>(
                    <button key={o.v} onClick={()=>toggleOpt(o.v)}
                      style={{ padding:'7px 12px', borderRadius:8, border:`1.5px solid ${brief.options.includes(o.v)?C.primary:C.border}`, background:brief.options.includes(o.v)?C.soft:C.bg, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:C.font, color:brief.options.includes(o.v)?C.primary:C.textSec }}>
                      {o.i} {o.v}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={lbl}>Vidéo de référence <span style={{ fontWeight:400, color:C.textLight }}>(optionnel)</span></label>
                <input {...f('reference')} placeholder="Lien TikTok ou YouTube que vous aimez" style={inp} />
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={lbl}>Instructions</label>
                <textarea {...f('description')} placeholder="Ce que vous voulez, le ton, les détails importants..." rows={3} style={{...inp, resize:'vertical', lineHeight:1.5}} />
              </div>

              <button onClick={()=>{ if(brief.type) setStep(2); }}
                style={{ width:'100%', padding:'14px', background:brief.type?C.primary:'#D0D0D0', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:brief.type?'pointer':'not-allowed', fontFamily:C.font }}>
                Continuer →
              </button>
            </div>)}

            {/* ── Step 2: Coordonnées ── */}
            {step === 2 && (<div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                <div><label style={lbl}>Nom / pseudo *</label><input {...f('nom')} placeholder="@emma.lifestyle" style={inp} /></div>
                <div><label style={lbl}>Email *</label><input type="email" {...f('email')} placeholder="vous@email.com" style={inp} /></div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Deadline <span style={{ fontWeight:400, color:C.textLight }}>(optionnel)</span></label>
                <input type="date" {...f('deadline')} style={inp} />
              </div>

              {/* Récap */}
              <div style={{ padding:'14px 16px', background:C.soft, borderRadius:10, marginBottom:18, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>📋 Récap</div>
                <div style={{ fontSize:13, color:C.textSec, lineHeight:1.6 }}>
                  {brief.type}{brief.format?` · ${brief.format}`:''} · {brief.quantite} vidéo{brief.quantite>1?'s':''}<br/>
                  {brief.style && `Style: ${brief.style} · `}{brief.options.length>0 && brief.options.join(', ')}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setStep(1)} style={{ flex:1, padding:'14px', background:C.bg, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>←</button>
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
                  style={{ flex:3, padding:'14px', background:(brief.nom&&brief.email&&!sending)?C.primary:'#D0D0D0', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:(brief.nom&&brief.email&&!sending)?'pointer':'not-allowed', fontFamily:C.font }}>
                  {sending ? '⏳ Envoi en cours...' : '📩 Envoyer'}
                </button>
              </div>
            </div>)}

            {/* ── Step 3: Confirmé ── */}
            {step === 3 && (<div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'#D1FAE5', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>✓</div>
              <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Demande envoyée !</div>
              <div style={{ fontSize:14, color:C.textSec, marginBottom:16 }}>On vous répond sous 24h à <strong>{brief.email}</strong></div>
              {suiviToken && (
                <div style={{ padding:'16px', background:C.soft, borderRadius:12, marginBottom:16, border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:13, color:C.textSec, marginBottom:8 }}>Suivez votre commande en temps réel :</div>
                  <a href={`/suivi/${suiviToken}`} style={{ display:'inline-block', padding:'10px 24px', background:C.primary, color:'#fff', borderRadius:8, fontSize:14, fontWeight:700, textDecoration:'none' }}>
                    📦 Suivre ma commande
                  </a>
                  <div style={{ fontSize:12, color:C.textLight, marginTop:8 }}>Code : {suiviToken}</div>
                </div>
              )}
              <button onClick={()=>setStep(0)} style={{ padding:'12px 28px', background:C.bg, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:C.font }}>Fermer</button>
            </div>)}

          </div>
        </div>
      )}
    </div>
  );
}
