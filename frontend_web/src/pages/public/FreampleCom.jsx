import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { getTarifs } from '../../data/tarifsCom';

const C = {
  primary: '#8B5CF6', primaryHover: '#7C3AED', dark: '#0F0A1A', darkSoft: '#1A1128',
  text: '#0F0A1A', textSec: '#6B7280', textLight: '#9CA3AF',
  bg: '#FFFFFF', soft: '#F5F3FF', border: '#E9E5F5',
  pink: '#EC4899', blue: '#3B82F6', green: '#10B981', gold: '#F59E0B',
  font: "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif",
};

// Tarifs lus depuis la source partagée (modifiables par le patron)
const TARIFS_RAW = getTarifs();

function getMinPrix(catName) {
  const cat = TARIFS_RAW.find(t => t.cat.toLowerCase().includes(catName.toLowerCase()));
  if (!cat || !cat.items.length) return '—';
  return Math.min(...cat.items.map(i => i.prix));
}

const SERVICES = [
  { icon:'🎬', title:'Montage Vidéo', desc:'TikTok, Reels, YouTube Shorts', price:`À partir de ${getMinPrix('Montage')}€`, color:'linear-gradient(135deg,#EC4899,#8B5CF6)', features:['Montage dynamique','Sous-titres auto','Musique tendance','Transitions pro'] },
  { icon:'📱', title:'Réseaux Sociaux', desc:'Gestion de comptes & stratégie', price:`À partir de ${getMinPrix('Réseaux')}€/mois`, color:'linear-gradient(135deg,#3B82F6,#8B5CF6)', features:['Planning éditorial','Création de contenu','Community management','Reporting mensuel'] },
  { icon:'🎨', title:'Design Graphique', desc:'Logos, visuels, identité', price:`À partir de ${getMinPrix('Design')}€`, color:'linear-gradient(135deg,#10B981,#3B82F6)', features:['Logo & charte graphique','Visuels réseaux sociaux','Flyers & cartes de visite','Bannières web'] },
  { icon:'📈', title:'Publicité en ligne', desc:'Meta Ads, Google Ads, TikTok Ads', price:`À partir de ${getMinPrix('Publicité')}€/mois`, color:'linear-gradient(135deg,#F59E0B,#EC4899)', features:['Création de campagnes','Ciblage audience','A/B testing','Reporting ROI'] },
];

const TEMOIGNAGES = [
  { nom:'@emma.lifestyle', type:'Influenceuse', avatar:'EL', text:'Freample Com a transformé mon contenu TikTok. Les montages sont top et livrés en 48h !', note:5 },
  { nom:'Salon Léa', type:'Commerce', avatar:'SL', text:'Notre Instagram est passé de 200 à 5000 abonnés en 3 mois grâce à leur gestion de compte.', note:5 },
  { nom:'@alex.fitness', type:'Influenceur', avatar:'AF', text:'Pack 10 TikToks par mois, qualité constante, je recommande à 100%.', note:5 },
];

export default function FreampleCom() {
  const navigate = useNavigate();
  const [openTarif, setOpenTarif] = useState(0);
  const [demandeForm, setDemandeForm] = useState({ nom:'', email:'', type:'', budget:'', description:'' });
  const [demandeSent, setDemandeSent] = useState(false);

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.font, color:C.text }}>
      <RecrutementBanner secteur="com" />
      <PublicNavbar />

      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(160deg, ${C.dark} 0%, ${C.darkSoft} 40%, #2D1B69 70%, #4A2C8A 100%)`, padding:'clamp(56px,10vh,96px) 24px 64px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', left:'5%', width:300, height:300, borderRadius:'50%', background:'rgba(139,92,246,0.08)', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'10%', width:200, height:200, borderRadius:'50%', background:'rgba(236,72,153,0.08)', filter:'blur(40px)' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:700, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', background:'rgba(255,255,255,0.1)', borderRadius:999, marginBottom:28, backdropFilter:'blur(10px)' }}>
            <span style={{ fontSize:14 }}>🎬</span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>Freample Com</span>
          </div>
          <h1 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:800, color:'#fff', lineHeight:1.12, letterSpacing:'-0.03em', margin:'0 0 16px' }}>
            Votre communication,<br/>notre expertise
          </h1>
          <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.6, margin:'0 0 36px', maxWidth:520, marginLeft:'auto', marginRight:'auto' }}>
            Montage vidéo, réseaux sociaux, design, publicité — boostez votre visibilité avec nos équipes créatives.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => document.getElementById('demande')?.scrollIntoView({behavior:'smooth'})}
              style={{ padding:'14px 32px', background:'#fff', color:C.dark, border:'none', borderRadius:999, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              Demander un devis gratuit →
            </button>
            <button style={{ padding:'14px 32px', background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:999, fontSize:16, fontWeight:500, cursor:'pointer', fontFamily:C.font }}>
              Voir nos réalisations
            </button>
          </div>
        </div>
      </div>

      {/* ── Services ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 24px' }}>
        <h2 style={{ fontSize:28, fontWeight:800, textAlign:'center', marginBottom:8, letterSpacing:'-0.02em' }}>Nos services</h2>
        <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:40 }}>Des solutions complètes pour entreprises et créateurs de contenu</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
          {SERVICES.map(s => (
            <div key={s.title} style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${C.border}`, transition:'all 0.2s', cursor:'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(139,92,246,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ background:s.color, padding:'28px 24px', color:'#fff' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{s.icon}</div>
                <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:14, opacity:0.8 }}>{s.desc}</div>
              </div>
              <div style={{ padding:'20px 24px', background:C.bg }}>
                <div style={{ fontSize:16, fontWeight:800, color:C.primary, marginBottom:14 }}>{s.price}</div>
                {s.features.map(f => (
                  <div key={f} style={{ fontSize:13, color:C.textSec, padding:'4px 0', display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ color:C.primary, fontSize:14 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grille tarifaire ── */}
      <div style={{ background:C.soft, padding:'56px 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, textAlign:'center', marginBottom:8 }}>Grille tarifaire</h2>
          <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:32 }}>Tarifs transparents, sans surprise</p>
          {TARIFS_RAW.map((t, i) => (
            <div key={t.cat} style={{ marginBottom:12 }}>
              <button onClick={() => setOpenTarif(openTarif === i ? -1 : i)}
                style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:C.bg, border:`1px solid ${C.border}`, borderRadius: openTarif === i ? '12px 12px 0 0' : 12, cursor:'pointer', fontFamily:C.font }}>
                <span style={{ fontSize:16, fontWeight:700, color:C.text }}>{t.cat}</span>
                <span style={{ fontSize:18, color:C.textLight, transform: openTarif === i ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▼</span>
              </button>
              {openTarif === i && (
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderTop:'none', borderRadius:'0 0 12px 12px', overflow:'hidden' }}>
                  {t.items.map((item, j) => (
                    <div key={j} style={{ display:'flex', justifyContent:'space-between', padding:'12px 20px', borderBottom: j < t.items.length-1 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ fontSize:14, color:C.text }}>{item.nom}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:C.primary }}>{item.prix}€</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Comment ça marche ── */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'56px 24px', textAlign:'center' }}>
        <h2 style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>Comment ça marche ?</h2>
        <p style={{ fontSize:15, color:C.textSec, marginBottom:40 }}>De la demande à la livraison en 4 étapes</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
          {[
            { icon:'📝', title:'1. Demandez un devis', desc:'Décrivez votre projet, on vous répond en 24h avec un devis détaillé' },
            { icon:'✅', title:'2. Validez & payez', desc:'Acceptez le devis et payez en ligne. Les fonds sont sécurisés sur Freample' },
            { icon:'🎬', title:'3. On crée', desc:'Nos monteurs et designers travaillent sur votre projet avec des révisions incluses' },
            { icon:'📦', title:'4. Livraison', desc:'Recevez vos fichiers directement sur Freample. Facture automatique envoyée' },
          ].map(s => (
            <div key={s.title}>
              <div style={{ width:56, height:56, borderRadius:14, background:C.soft, border:`1px solid ${C.border}`, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{s.icon}</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{s.title}</div>
              <div style={{ fontSize:13, color:C.textSec, lineHeight:1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Témoignages ── */}
      <div style={{ background:C.dark, padding:'56px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ fontSize:24, fontWeight:800, color:'#fff', textAlign:'center', marginBottom:32 }}>Ils nous font confiance</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
            {TEMOIGNAGES.map(t => (
              <div key={t.nom} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', fontWeight:800 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{t.nom}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{t.type}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.6, marginBottom:10 }}>"{t.text}"</div>
                <div style={{ color:'#F59E0B', fontSize:13 }}>{'★'.repeat(t.note)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formulaire de demande ── */}
      <div id="demande" style={{ padding:'64px 24px', background:C.soft, borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, textAlign:'center', marginBottom:8 }}>Demandez un devis gratuit</h2>
          <p style={{ fontSize:15, color:C.textSec, textAlign:'center', marginBottom:32 }}>Décrivez votre projet, on vous répond en moins de 24h</p>
          <div style={{ background:C.bg, borderRadius:16, padding:'28px 24px', border:`1px solid ${C.border}`, boxShadow:'0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Votre nom / entreprise *</label>
                <input value={demandeForm.nom} onChange={e=>setDemandeForm(p=>({...p,nom:e.target.value}))} placeholder="Ex: @emma.lifestyle, Salon Léa..." style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Email *</label>
                <input type="email" value={demandeForm.email} onChange={e=>setDemandeForm(p=>({...p,email:e.target.value}))} placeholder="vous@email.com" style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Type de prestation *</label>
                <select value={demandeForm.type} onChange={e=>setDemandeForm(p=>({...p,type:e.target.value}))} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box', background:'#fff' }}>
                  <option value="">Choisir...</option>
                  <option>Montage vidéo (TikTok, Reels, YouTube)</option>
                  <option>Gestion réseaux sociaux</option>
                  <option>Design graphique (Logo, visuels)</option>
                  <option>Publicité en ligne (Meta Ads, Google)</option>
                  <option>Pack complet (plusieurs services)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Budget estimé</label>
                <select value={demandeForm.budget} onChange={e=>setDemandeForm(p=>({...p,budget:e.target.value}))} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box', background:'#fff' }}>
                  <option value="">Non défini</option>
                  <option>Moins de 100€</option>
                  <option>100€ — 300€</option>
                  <option>300€ — 500€</option>
                  <option>500€ — 1 000€</option>
                  <option>Plus de 1 000€</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Décrivez votre projet *</label>
              <textarea value={demandeForm.description} onChange={e=>setDemandeForm(p=>({...p,description:e.target.value}))} placeholder="Ex: Je souhaite un pack de 10 TikToks par mois pour promouvoir mon salon de coiffure. Style dynamique, sous-titres colorés, musique tendance..." rows={4} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:C.font, outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.text, display:'block', marginBottom:6 }}>Fichiers / exemples (optionnel)</label>
              <div onClick={()=>setDemandeSent(false)} style={{ border:`2px dashed ${C.border}`, borderRadius:10, padding:'20px', textAlign:'center', cursor:'pointer', background:'#FAFAFA' }}>
                <div style={{ fontSize:28, marginBottom:6 }}>📎</div>
                <div style={{ fontSize:14, color:C.textSec }}>Cliquez pour ajouter des fichiers (vidéos, images, brief...)</div>
                <div style={{ fontSize:12, color:C.textLight, marginTop:4 }}>PDF, MP4, JPG, PNG — max 50 Mo</div>
              </div>
            </div>
            {demandeSent ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'#D1FAE5', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>✓</div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:4 }}>Demande envoyée !</div>
                <div style={{ fontSize:14, color:C.textSec }}>Nous vous répondrons sous 24h à {demandeForm.email}</div>
              </div>
            ) : (
              <button onClick={()=>{
                if(!demandeForm.nom||!demandeForm.email||!demandeForm.type||!demandeForm.description) return;
                setDemandeSent(true);
              }} style={{ width:'100%', padding:'14px', background:C.primary, color:'#fff', border:'none', borderRadius:12, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:C.font, transition:'background .15s', minHeight:48 }}
                onMouseEnter={e=>e.currentTarget.style.background=C.primaryHover}
                onMouseLeave={e=>e.currentTarget.style.background=C.primary}>
                Envoyer ma demande →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:'28px 24px', borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
        <span style={{ fontSize:13, color:C.textLight }}>© 2026 Freample Com · <a href="/cgu" style={{ color:C.textSec, textDecoration:'none' }}>CGU</a> · <a href="/recrutement" style={{ color:C.textSec, textDecoration:'none' }}>Recrutement</a></span>
      </div>
    </div>
  );
}
