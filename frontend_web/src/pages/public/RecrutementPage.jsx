import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DS from '../../design/luxe';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useFadeUp, useScaleIn } from '../../utils/scrollAnimations';
import { API_URL } from '../../services/api';
const CONTRATS = ['Tous', 'CDI', 'CDD', 'Alternance', 'Stage', 'Freelance', 'Intérim'];

const SECTEURS = [
  { id: 'tous',       label: 'Tous',       emoji: '🔍' },
  { id: 'btp',        label: 'BTP & Artisanat', emoji: '🏗️' },
];

const SECTEUR_COLOR = {
  btp:        { bg:'#EEF2FF', border:'#C7D2FE', text:'#3730A3' },
};

const DEMO_OFFRES = [
  { id:3, poste:'Plombier chauffagiste N2/N3', entreprise:'PlombiPro', localisation:'Marseille', type_contrat:'CDI', salaire:'2 400–3 000€/mois', description:'Installation et dépannage chauffage, plomberie sanitaire. Permis B indispensable. Véhicule de société fourni.', competences:'Soudure cuivre, PAC, Chauffe-eau, Sanitaire', urgent:false, teletravail:false, created_at: new Date(Date.now()-2*86400000).toISOString(), secteur:'btp' },
  { id:4, poste:'Électricien(ne) N3P1', entreprise:'Énergie et Co', localisation:'Marseille', type_contrat:'CDI', salaire:'2 300–2 900€/mois', description:"Travaux d'installation électrique en neuf et rénovation. Habilitations BR/B2V requises.", competences:'Électricité HTA, Domotique, Habilitation électrique', urgent:false, teletravail:false, created_at: new Date(Date.now()-3*86400000).toISOString(), secteur:'btp' },
  { id:8, poste:'Peintre en bâtiment', entreprise:'Déco & Finitions', localisation:'Marseille 8e', type_contrat:'CDI', salaire:'2 200–2 600€/mois', description:'Peinture intérieure et extérieure, ravalement de façade. Travail soigné et minutieux exigé.', competences:'Peinture, Enduit, Ravalement, Décoration', urgent:false, teletravail:false, created_at: new Date(Date.now()-86400000).toISOString(), secteur:'btp' },
  { id:9, poste:'Menuisier poseur', entreprise:'Bois & Création', localisation:'Bordeaux', type_contrat:'CDD', salaire:'2 100–2 500€/mois', description:'Pose de menuiseries intérieures et extérieures (portes, fenêtres, escaliers). Lecture de plans requise.', competences:'Menuiserie, Pose, Lecture de plans', urgent:true, teletravail:false, created_at: new Date(Date.now()-4*86400000).toISOString(), secteur:'btp' },
  { id:10, poste:'Maçon qualifié', entreprise:'BâtiSolide', localisation:'Toulouse', type_contrat:'CDI', salaire:'2 300–2 800€/mois', description:'Construction et rénovation. Montage de murs, dalles, fondations. Autonome sur chantier.', competences:'Maçonnerie, Coffrage, Ferraillage', urgent:false, teletravail:false, created_at: new Date(Date.now()-5*86400000).toISOString(), secteur:'btp' },
  { id:11, poste:'Carreleur(se)', entreprise:'Carrelage Express', localisation:'Marseille', type_contrat:'Alternance', salaire:'1 200–1 600€/mois', description:'Poste en alternance pour apprendre la pose de carrelage sol et mur. Encadrement par un maître artisan.', competences:'Carrelage, Découpe, Étanchéité', urgent:false, teletravail:false, created_at: new Date(Date.now()-6*86400000).toISOString(), secteur:'btp' },
];

// ─── Modal candidature ─────────────────────────────────────────────────────────

function ModalCandidature({ offre, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', telephone:'', lettre:'', cvTexte:'' });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef();

  const next = () => {
    if (!form.nom || !form.prenom || !form.email) { setErr('Nom, prénom et email requis.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr('Email invalide.'); return; }
    setErr(''); setStep(2);
  };

  const envoyer = async () => {
    setLoading(true);
    try { await axios.post(`${API_URL}/recrutement/annonces/${offre.id}/candidatures`, { ...form, cvFichier: cvFile ? cvFile.name : null }); } catch (_) {}
    setLoading(false); setStep(3);
  };

  const inputStyle = { width:'100%', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:'11px 14px', fontSize:'0.9rem', color:DS.ink, outline:'none', boxSizing:'border-box', fontFamily:DS.font, transition:'border-color .15s' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(6px)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:DS.bg, borderRadius:DS.r.xl, width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:DS.shadow.xl }}>
        {/* Header */}
        <div style={{ padding:'22px 26px 16px', borderBottom:`1px solid ${DS.border}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:'1rem', fontWeight:700, color:DS.ink, letterSpacing:'-0.025em' }}>Postuler</div>
              <div style={{ fontSize:'0.825rem', color:DS.muted, marginTop:3 }}>{offre.poste} · {offre.entreprise}</div>
            </div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:DS.bgSoft, border:'none', cursor:'pointer', color:DS.muted, fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
          {step < 3 && (
            <div style={{ display:'flex', gap:6, marginTop:16 }}>
              {['Informations', 'CV et lettre'].map((s, i) => (
                <div key={s} style={{ flex:1 }}>
                  <div style={{ height:2, borderRadius:1, background:i<step?DS.ink:DS.border, marginBottom:4, transition:'background .3s' }} />
                  <div style={{ fontSize:'0.7rem', color:i+1===step?DS.ink:DS.subtle, fontWeight:i+1===step?600:400 }}>{s}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 26px 26px' }}>
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', gap:12 }}>
                {[{k:'prenom',l:'Prénom *',p:'Marie'},{k:'nom',l:'Nom *',p:'Dupont'}].map(f => (
                  <div key={f.k} style={{ flex:1 }}>
                    <label style={{ display:'block', fontSize:'0.775rem', fontWeight:500, color:DS.muted, marginBottom:6 }}>{f.l}</label>
                    <input type="text" value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.p} style={inputStyle}
                      onFocus={e=>e.target.style.borderColor=DS.accent} onBlur={e=>e.target.style.borderColor=DS.border} />
                  </div>
                ))}
              </div>
              {[{k:'email',l:'Email *',p:'marie@email.com',t:'email'},{k:'telephone',l:'Téléphone',p:'06 12 34 56 78',t:'tel'}].map(f => (
                <div key={f.k}>
                  <label style={{ display:'block', fontSize:'0.775rem', fontWeight:500, color:DS.muted, marginBottom:6 }}>{f.l}</label>
                  <input type={f.t} value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.p} style={inputStyle}
                    onFocus={e=>e.target.style.borderColor=DS.accent} onBlur={e=>e.target.style.borderColor=DS.border} />
                </div>
              ))}
              {err && <div style={{ padding:'10px 14px', background:DS.redBg, border:`1px solid #FECACA`, borderRadius:DS.r.sm, fontSize:'0.8rem', color:DS.red }}>{err}</div>}
              <button onClick={next} style={{ width:'100%', marginTop:4, padding:'13px', background:DS.ink, border:'none', borderRadius:DS.r.md, fontWeight:600, fontSize:'0.9375rem', color:'#fff', cursor:'pointer', transition:'opacity .15s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Continuer →</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.775rem', fontWeight:500, color:DS.muted, marginBottom:8 }}>Votre CV</label>
                <div onClick={()=>fileRef.current.click()}
                  style={{ border:`2px dashed ${cvFile?DS.green:DS.border}`, borderRadius:DS.r.md, padding:'28px', textAlign:'center', cursor:'pointer', transition:'all .2s', background:cvFile?DS.greenBg:DS.bgSoft }}
                  onMouseEnter={e=>{ if(!cvFile) e.currentTarget.style.borderColor=DS.accent; }}
                  onMouseLeave={e=>{ if(!cvFile) e.currentTarget.style.borderColor=DS.border; }}>
                  {cvFile ? (
                    <div>
                      <div style={{ fontSize:'1.5rem', marginBottom:6 }}>📄</div>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:DS.ink }}>{cvFile.name}</div>
                      <div style={{ fontSize:'0.75rem', color:DS.muted, marginTop:3 }}>{(cvFile.size/1024).toFixed(0)} Ko · <span style={{ textDecoration:'underline', cursor:'pointer' }} onClick={e=>{e.stopPropagation();setCvFile(null);}}>Supprimer</span></div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:'1.75rem', marginBottom:8 }}>⬆️</div>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:DS.ink2, marginBottom:4 }}>Déposez votre CV ici</div>
                      <div style={{ fontSize:'0.775rem', color:DS.subtle }}>PDF, Word — max 5 Mo</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={e=>setCvFile(e.target.files[0]||null)} style={{ display:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.775rem', fontWeight:500, color:DS.muted, marginBottom:6 }}>Lettre de motivation <span style={{ color:DS.subtle, fontWeight:400 }}>(optionnel)</span></label>
                <textarea value={form.lettre} onChange={e=>setForm(x=>({...x,lettre:e.target.value}))} placeholder={`Dites-nous pourquoi rejoindre ${offre.entreprise}...`} rows={4}
                  style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }}
                  onFocus={e=>e.target.style.borderColor=DS.accent} onBlur={e=>e.target.style.borderColor=DS.border} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setStep(1)} style={{ flex:1, padding:'13px', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.md, fontWeight:500, fontSize:'0.9rem', color:DS.muted, cursor:'pointer' }}>Retour</button>
                <button onClick={envoyer} disabled={loading} style={{ flex:2, padding:'13px', background:loading?DS.border:DS.ink, border:'none', borderRadius:DS.r.md, fontWeight:600, fontSize:'0.9375rem', color:loading?DS.muted:'#fff', cursor:loading?'default':'pointer', transition:'opacity .15s' }}
                  onMouseEnter={e=>{if(!loading)e.currentTarget.style.opacity='0.82';}} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  {loading ? 'Envoi…' : 'Envoyer ma candidature'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:DS.greenBg, border:`1px solid ${DS.green}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize:'1.125rem', fontWeight:700, color:DS.ink, marginBottom:8, letterSpacing:'-0.025em' }}>Candidature envoyée !</div>
              <div style={{ fontSize:'0.875rem', color:DS.muted, lineHeight:1.65, marginBottom:24 }}>
                Votre candidature pour <strong style={{ color:DS.ink }}>{offre.poste}</strong> chez <strong style={{ color:DS.ink }}>{offre.entreprise}</strong> a bien été transmise.<br/>
                Réponse attendue à <span style={{ color:DS.accent, fontWeight:600 }}>{form.email}</span>
              </div>
              <button onClick={onClose} style={{ padding:'12px 28px', background:DS.ink, border:'none', borderRadius:DS.r.md, fontSize:'0.875rem', fontWeight:600, color:'#fff', cursor:'pointer' }}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Carte offre ───────────────────────────────────────────────────────────────

function OffreCard({ offre, selected, onClick }) {
  const daysAgo = Math.floor((Date.now() - new Date(offre.created_at||Date.now()).getTime()) / 86400000);
  const sc = SECTEUR_COLOR[offre.secteur] || { bg:DS.bgSoft, border:DS.border, text:DS.muted };
  const initials = (offre.entreprise||'??').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <div onClick={onClick}
      style={{ padding:'18px 22px', borderBottom:`1px solid ${DS.border}`, cursor:'pointer', background:selected?DS.bgSoft:DS.bg, transition:'background .12s', borderLeft:`3px solid ${selected?DS.accent:'transparent'}` }}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=DS.bgSoft; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background=DS.bg; }}>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        {/* Avatar */}
        <div style={{ width:42, height:42, borderRadius:DS.r.md, background:sc.bg, border:`1px solid ${sc.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:sc.text, fontWeight:800, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:3 }}>
            <div style={{ fontSize:'0.9375rem', fontWeight:700, color:DS.ink, letterSpacing:'-0.02em', lineHeight:1.3 }}>{offre.poste}</div>
            <div style={{ fontSize:'0.7rem', color:DS.subtle, flexShrink:0 }}>
              {daysAgo===0?'Auj.':daysAgo===1?'Hier':`${daysAgo}j`}
            </div>
          </div>
          <div style={{ fontSize:'0.8125rem', color:DS.muted, marginBottom:10, fontWeight:500 }}>{offre.entreprise} · {offre.localisation}</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {offre.type_contrat && <span style={{ fontSize:'0.7rem', fontWeight:600, color:DS.ink2, background:DS.surface, borderRadius:DS.r.sm, padding:'3px 9px' }}>{offre.type_contrat}</span>}
            {offre.salaire && <span style={{ fontSize:'0.7rem', color:DS.muted, background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:'3px 9px' }}>{offre.salaire}</span>}
            {offre.urgent && <span style={{ fontSize:'0.7rem', fontWeight:700, color:DS.red, background:DS.redBg, border:`1px solid #FECACA`, borderRadius:DS.r.sm, padding:'3px 9px' }}>Urgent</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Détail offre ──────────────────────────────────────────────────────────────

function OffreDetail({ offre, onPostuler }) {
  if (!offre) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, padding:40, textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:DS.bgSoft, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem' }}>🔍</div>
      <div style={{ fontWeight:600, color:DS.ink, fontSize:'0.9375rem' }}>Sélectionnez une offre</div>
      <div style={{ fontSize:'0.875rem', color:DS.muted }}>Cliquez sur une offre pour voir les détails</div>
    </div>
  );

  const sc = SECTEUR_COLOR[offre.secteur] || { bg:DS.bgSoft, border:DS.border, text:DS.muted };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
      {/* Secteur badge */}
      <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:DS.r.full, fontSize:'0.75rem', fontWeight:600, color:sc.text, marginBottom:16 }}>
        {SECTEURS.find(s=>s.id===offre.secteur)?.emoji} {SECTEURS.find(s=>s.id===offre.secteur)?.label || offre.secteur}
      </div>

      <h2 style={{ fontSize:'1.375rem', fontWeight:800, color:DS.ink, letterSpacing:'-0.035em', margin:'0 0 6px' }}>{offre.poste}</h2>
      <div style={{ fontSize:'0.9rem', color:DS.muted, marginBottom:16, fontWeight:500 }}>{offre.entreprise} · 📍 {offre.localisation}</div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
        {[offre.type_contrat, offre.salaire].filter(Boolean).map(v => (
          <span key={v} style={{ fontSize:'0.8rem', color:DS.ink2, background:DS.surface, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:'5px 12px', fontWeight:500 }}>{v}</span>
        ))}
      </div>

      <button onClick={onPostuler}
        style={{ width:'100%', padding:'14px', background:DS.accent, border:'none', borderRadius:DS.r.full, fontWeight:700, fontSize:'0.9375rem', color:'#fff', cursor:'pointer', transition:'background .15s', marginBottom:26 }}
        onMouseEnter={e=>e.currentTarget.style.background=DS.accentHover}
        onMouseLeave={e=>e.currentTarget.style.background=DS.accent}>
        Postuler à cette offre →
      </button>

      <div style={{ height:1, background:DS.border, marginBottom:22 }} />

      {offre.description && (
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:DS.subtle, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Description</div>
          <div style={{ fontSize:'0.875rem', color:DS.ink2, lineHeight:1.75 }}>{offre.description}</div>
        </div>
      )}

      {offre.competences && (
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:DS.subtle, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Compétences</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {(offre.competences||'').split(',').filter(Boolean).map(c => (
              <span key={c} style={{ fontSize:'0.8rem', color:DS.ink2, background:DS.surface, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:'5px 12px' }}>{c.trim()}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, padding:'16px 20px' }}>
        <div style={{ fontSize:'0.7rem', fontWeight:700, color:DS.subtle, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Infos pratiques</div>
        {[{l:'Entreprise',v:offre.entreprise},{l:'Localisation',v:offre.localisation},{l:'Contrat',v:offre.type_contrat},{l:'Salaire',v:offre.salaire||'Non précisé'}].map(({l,v})=>v&&(
          <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:'0.8125rem', color:DS.muted }}>{l}</span>
            <span style={{ fontSize:'0.8125rem', color:DS.ink, fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function RecrutementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quoi, setQuoi] = useState(searchParams.get('q')||'');
  const [ou, setOu] = useState(searchParams.get('ou')||'');
  const [contrat, setContrat] = useState('Tous');
  const urlSecteur = searchParams.get('secteur');
  const [secteur, setSecteur] = useState(urlSecteur && ['btp'].includes(urlSecteur) ? urlSecteur : 'tous');
  const [offres, setOffres] = useState(DEMO_OFFRES);
  const [selected, setSelected] = useState(null);
  const [postulating, setPostulating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sTitle = useScaleIn();
  const rSearch = useFadeUp(0.1);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    axios.get(`${API_URL}/recrutement/annonces?limit=50`).then(r=>{ if(r.data?.annonces?.length) setOffres(r.data.annonces); }).catch(()=>{});
  }, []);

  const filtered = offres.filter(o => {
    const mq = !quoi || o.poste?.toLowerCase().includes(quoi.toLowerCase()) || o.description?.toLowerCase().includes(quoi.toLowerCase());
    const mo = !ou || o.localisation?.toLowerCase().includes(ou.toLowerCase());
    const mc = contrat==='Tous' || o.type_contrat===contrat;
    const ms = secteur==='tous' || o.secteur===secteur;
    return mq && mo && mc && ms;
  });

  const subNav = null;

  return (
    <div style={{ height:'100vh', background:'#FAFAF8', fontFamily:DS.font, color:'#1A1A1A', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <RecrutementBanner />
      <PublicNavbar subNav={subNav} />

      {/* Hero — luxe */}
      <div style={{ background:'#0A0A0A', padding:'clamp(36px,6vh,60px) clamp(20px,5vw,56px) clamp(28px,4vh,44px)', flexShrink:0, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.15 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.92) 100%)' }} />
        <div style={{ maxWidth:700, margin:'0 auto', position:'relative', zIndex:1, textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#A68B4B', textTransform:'uppercase', letterSpacing:'0.3em', marginBottom:16 }}>
            {filtered.length} offre{filtered.length>1?'s':''} disponible{filtered.length>1?'s':''}
          </div>
          <h1 ref={sTitle} style={{ fontFamily:"'Cormorant Garamond','Georgia',serif", fontSize:'clamp(28px,5vw,48px)', fontWeight:500, fontStyle:'italic', letterSpacing:'-0.02em', color:'#fff', margin:'0 0 24px', lineHeight:1.08 }}>
            Trouvez votre <span style={{ fontWeight:700, fontStyle:'normal' }}>prochain emploi</span>
          </h1>

          {/* Barre de recherche — HelloWork style */}
          <div ref={rSearch} style={{ display:'flex', background:'#fff', overflow:'hidden', maxWidth:600, margin:'0 auto' }}>
            <div style={{ flex:1, padding:'14px 20px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'#757575', fontSize:16 }}>🔍</span>
              <input value={quoi} onChange={e=>setQuoi(e.target.value)} placeholder="Plombier, électricien, peintre…"
                style={{ background:'none', border:'none', outline:'none', fontSize:14, color:'#1A1A1A', fontFamily:DS.font, fontWeight:500, flex:1 }} />
            </div>
            <div style={{ width:1, background:'#E8E6E1', margin:'10px 0' }} />
            <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:10, minWidth:140 }}>
              <span style={{ color:'#757575', fontSize:14 }}>📍</span>
              <input value={ou} onChange={e=>setOu(e.target.value)} placeholder="Ville…"
                style={{ background:'none', border:'none', outline:'none', fontSize:14, color:'#1A1A1A', fontFamily:DS.font, fontWeight:500, width:'100%' }} />
            </div>
            <button
              style={{ flexShrink:0, background:'#0A0A0A', border:'none', cursor:'pointer', padding:'0 28px', fontWeight:600, color:'#fff', fontSize:13, transition:'background .2s', letterSpacing:'0.04em', textTransform:'uppercase' }}
              onMouseEnter={e=>e.currentTarget.style.background='#A68B4B'} onMouseLeave={e=>e.currentTarget.style.background='#0A0A0A'}>
              Rechercher
            </button>
          </div>

          {/* Chips contrat — HelloWork style */}
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:18, flexWrap:'wrap' }}>
            {CONTRATS.map(c => (
              <button key={c} onClick={() => setContrat(c)}
                style={{ padding:'7px 18px', border:`1px solid ${contrat===c?'#A68B4B':'rgba(255,255,255,0.15)'}`, background:contrat===c?'rgba(201,169,110,0.15)':'transparent', color:contrat===c?'#A68B4B':'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:DS.font }}>
                {c}
              </button>
            ))}
          </div>

          <button onClick={() => navigate('/register?role=patron&secteur=btp')}
            style={{ marginTop:20, background:'none', border:'none', cursor:'pointer', fontSize:12, color:'rgba(255,255,255,0.35)', fontFamily:DS.font, letterSpacing:'0.04em', transition:'color .15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#A68B4B'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
            Vous recrutez ? Publier une offre gratuitement →
          </button>
        </div>
      </div>

      {/* Compteur résultats */}
      <div style={{ padding:'12px clamp(20px,5vw,56px)', borderBottom:'1px solid #E8E6E1', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#1A1A1A' }}>{filtered.length} résultat{filtered.length>1?'s':''}</span>
        <span style={{ fontSize:12, color:'#757575' }}>BTP & Artisanat</span>
        <span style={{ marginLeft:'auto', fontSize:'0.8rem', color:DS.subtle, flexShrink:0 }}>
          {filtered.length} offre{filtered.length!==1?'s':''}
        </span>
      </div>

      {/* Grille offres */}
      <div style={{ flex:1, overflowY:'auto', padding:'clamp(20px,3vh,32px) clamp(20px,4vw,48px)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'80px 40px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16, opacity:0.2 }}>📋</div>
            <div style={{ fontFamily:"'Cormorant Garamond','Georgia',serif", fontSize:22, fontWeight:500, fontStyle:'italic', color:'#1A1A1A', marginBottom:6 }}>Aucune offre trouvée</div>
            <div style={{ fontSize:14, color:'#757575', marginBottom:20 }}>Essayez d'autres critères de recherche</div>
            <button onClick={() => { setQuoi(''); setOu(''); setContrat('Tous'); setSecteur('tous'); }}
              style={{ background:'none', border:'1px solid #E8E6E1', padding:'10px 24px', color:'#4A4A4A', cursor:'pointer', fontSize:13, fontFamily:DS.font, letterSpacing:'0.03em' }}>
              Réinitialiser
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16, maxWidth:1100, margin:'0 auto' }}>
            {filtered.map(o => {
              const initials = (o.entreprise||'??').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
              const daysAgo = Math.floor((Date.now() - new Date(o.created_at||Date.now()).getTime()) / 86400000);
              return (
                <div key={o.id} onClick={()=>setSelected(o)}
                  style={{ background:'#fff', border:'1px solid #E8E6E1', padding:'24px', cursor:'pointer', transition:'all .25s', position:'relative' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#A68B4B';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.06)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8E6E1';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                  {o.urgent && <div style={{ position:'absolute', top:12, right:12, fontSize:10, fontWeight:700, color:'#DC2626', background:'#FEF2F2', border:'1px solid #FECACA', padding:'2px 8px' }}>Urgent</div>}
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
                    <div style={{ width:44, height:44, background:'#F5F2EC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#7A6232', flexShrink:0 }}>{initials}</div>
                    <div>
                      <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', letterSpacing:'-0.02em', marginBottom:3 }}>{o.poste}</div>
                      <div style={{ fontSize:13, color:'#4A4A4A' }}>{o.entreprise} · 📍 {o.localisation}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                    {o.type_contrat && <span style={{ fontSize:11, fontWeight:600, color:'#1A1A1A', background:'#F5F2EC', padding:'4px 10px' }}>{o.type_contrat}</span>}
                    {o.salaire && <span style={{ fontSize:11, color:'#4A4A4A', background:'#FAFAF8', border:'1px solid #E8E6E1', padding:'4px 10px' }}>{o.salaire}</span>}
                  </div>
                  <div style={{ fontSize:13, color:'#4A4A4A', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{o.description}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16, paddingTop:14, borderTop:'1px solid #F0EDE8' }}>
                    <span style={{ fontSize:12, color:'#757575' }}>{daysAgo===0?'Aujourd\'hui':daysAgo===1?'Hier':`Il y a ${daysAgo}j`}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:'#A68B4B', letterSpacing:'0.04em', textTransform:'uppercase' }}>Voir l'offre →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ MODAL OFFRE — plein écran luxe ══ */}
      {selected && !postulating && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={()=>setSelected(null)}>
          <div style={{ background:'#fff', width:'100%', maxWidth:600, maxHeight:'90vh', overflowY:'auto', position:'relative' }}
            onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding:'28px 32px 0', position:'relative' }}>
              <button onClick={()=>setSelected(null)}
                style={{ position:'absolute', top:16, right:16, background:'none', border:'1px solid #E8E6E1', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:'#757575', transition:'border-color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#1A1A1A'} onMouseLeave={e=>e.currentTarget.style.borderColor='#E8E6E1'}>✕</button>
              <div style={{ fontSize:11, fontWeight:600, color:'#A68B4B', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:12 }}>Offre d'emploi</div>
              <h2 style={{ fontFamily:"'Cormorant Garamond','Georgia',serif", fontSize:'clamp(24px,3.5vw,32px)', fontWeight:500, fontStyle:'italic', color:'#1A1A1A', letterSpacing:'-0.02em', margin:'0 0 6px', lineHeight:1.1 }}>
                {selected.poste}
              </h2>
              <div style={{ fontSize:14, color:'#4A4A4A', marginBottom:20 }}>{selected.entreprise} · 📍 {selected.localisation}</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
                {[selected.type_contrat, selected.salaire].filter(Boolean).map(v => (
                  <span key={v} style={{ fontSize:12, fontWeight:600, color:'#1A1A1A', background:'#F5F2EC', padding:'6px 14px' }}>{v}</span>
                ))}
                {selected.urgent && <span style={{ fontSize:12, fontWeight:700, color:'#DC2626', background:'#FEF2F2', padding:'6px 14px' }}>Urgent</span>}
              </div>
            </div>

            {/* Séparateur */}
            <div style={{ display:'flex', alignItems:'center', margin:'0 32px' }}><div style={{ flex:1, height:1, background:'#E8E6E1' }}/><div style={{ width:6, height:6, borderRadius:'50%', background:'#A68B4B', margin:'0 16px' }}/><div style={{ flex:1, height:1, background:'#E8E6E1' }}/></div>

            {/* Contenu */}
            <div style={{ padding:'24px 32px 32px' }}>
              {selected.description && (
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#757575', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Description du poste</div>
                  <div style={{ fontSize:14, color:'#1A1A1A', lineHeight:1.75 }}>{selected.description}</div>
                </div>
              )}
              {selected.competences && (
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#757575', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Compétences recherchées</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {selected.competences.split(',').filter(Boolean).map(c => (
                      <span key={c} style={{ fontSize:12, color:'#1A1A1A', background:'#F5F2EC', border:'1px solid #E8E6E1', padding:'5px 12px' }}>{c.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Infos pratiques */}
              <div style={{ background:'#FAFAF8', border:'1px solid #E8E6E1', padding:'20px 24px', marginBottom:28 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#757575', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Informations</div>
                {[{l:'Entreprise',v:selected.entreprise},{l:'Localisation',v:selected.localisation},{l:'Type de contrat',v:selected.type_contrat},{l:'Rémunération',v:selected.salaire||'Non précisé'}].map(({l,v})=>v&&(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0EDE8', fontSize:14 }}>
                    <span style={{ color:'#757575' }}>{l}</span>
                    <span style={{ color:'#1A1A1A', fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* CTA Postuler */}
              <button onClick={()=>setPostulating(true)}
                style={{ width:'100%', padding:'16px', background:'#0A0A0A', border:'none', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:DS.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#A68B4B'} onMouseLeave={e=>e.currentTarget.style.background='#0A0A0A'}>
                Postuler à cette offre
              </button>
            </div>
          </div>
        </div>
      )}

      {postulating && selected && <ModalCandidature offre={selected} onClose={() => setPostulating(false)} />}
      <style>{`input::placeholder{color:#757575;} textarea::placeholder{color:#757575;} ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-thumb{background:#E8E6E1;border-radius:2px;}`}</style>
    </div>
  );
}
