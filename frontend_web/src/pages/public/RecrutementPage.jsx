import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CONTRATS = ['Tous', 'CDI', 'CDD', 'Alternance', 'Stage', 'Freelance', 'Intérim'];

const SECTEURS = [
  { id: 'tous',       label: 'Tous',       emoji: '🔍' },
  { id: 'coiffure',   label: 'Coiffure',   emoji: '✂️' },
  { id: 'btp',        label: 'BTP',        emoji: '🏗️' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'vacances',   label: 'Hôtellerie', emoji: '🏨' },
];

const SECTEUR_COLOR = {
  coiffure:   { bg:'#FDF2F8', border:'#F9A8D4', text:'#9D174D' },
  btp:        { bg:'#EEF2FF', border:'#C7D2FE', text:'#3730A3' },
  restaurant: { bg:'#FFF7ED', border:'#FED7AA', text:'#92400E' },
  vacances:   { bg:'#EFF6FF', border:'#BFDBFE', text:'#1E40AF' },
};

const DEMO_OFFRES = [
  { id:1, poste:'Coiffeur(se) confirmé(e)', entreprise:'Salon Léa', localisation:'Paris 11e', type_contrat:'CDI', salaire:'2 200–2 800€/mois', description:"Nous recherchons un(e) coiffeur(se) polyvalent(e) avec au moins 3 ans d'expérience. Maîtrise des techniques couleur exigée. Ambiance bienveillante, clientèle fidèle.", competences:'Colorimétrie, Balayage, Brushing, Coupes femmes', urgent:false, teletravail:false, created_at: new Date(Date.now()-86400000).toISOString(), secteur:'coiffure' },
  { id:2, poste:'Barbier / Coiffeur homme', entreprise:'Barbershop Alex', localisation:'Paris 3e', type_contrat:'CDI', salaire:'2 000–2 500€/mois', description:'Rejoignez notre équipe de barbiers passionnés. Dégradé américain, rasage traditionnel, ambiance détendue.', competences:'Dégradé, Barbe, Rasoir droit', urgent:true, teletravail:false, created_at: new Date(Date.now()-3600000).toISOString(), secteur:'coiffure' },
  { id:3, poste:'Plombier chauffagiste N2/N3', entreprise:'PlombiPro', localisation:'Lyon', type_contrat:'CDI', salaire:'2 400–3 000€/mois', description:'Installation et dépannage chauffage, plomberie sanitaire. Permis B indispensable. Véhicule de société fourni.', competences:'Soudure cuivre, PAC, Chauffe-eau, Sanitaire', urgent:false, teletravail:false, created_at: new Date(Date.now()-2*86400000).toISOString(), secteur:'btp' },
  { id:4, poste:'Électricien(ne) N3P1', entreprise:'Énergie et Co', localisation:'Marseille', type_contrat:'CDI', salaire:'2 300–2 900€/mois', description:"Travaux d'installation électrique en neuf et rénovation. Habilitations BR/B2V requises.", competences:'Électricité HTA, Domotique, Habilitation électrique', urgent:false, teletravail:false, created_at: new Date(Date.now()-3*86400000).toISOString(), secteur:'btp' },
  { id:5, poste:'Chef de rang', entreprise:'Chez Marco', localisation:'Lyon 2e', type_contrat:'CDI', salaire:'2 100–2 500€/mois', description:'Restaurant gastronomique cherche chef de rang expérimenté. Service du soir, 5 soirs/semaine.', competences:'Service en salle, Cave, Anglais professionnel', urgent:false, teletravail:false, created_at: new Date(Date.now()-4*86400000).toISOString(), secteur:'restaurant' },
  { id:6, poste:'Réceptionniste hôtel', entreprise:'Hôtel Le Rivage', localisation:'Nice', type_contrat:'CDI', salaire:'2 000–2 400€/mois', description:'Accueil clientèle internationale, gestion des réservations, conciergerie. Anglais courant obligatoire.', competences:'Logiciel hôtelier, Anglais, Accueil', urgent:false, teletravail:false, created_at: new Date(Date.now()-5*86400000).toISOString(), secteur:'vacances' },
  { id:7, poste:'Gouvernant(e) d\'étage', entreprise:'Hôtel Le Rivage', localisation:'Nice', type_contrat:'CDD', salaire:'1 900–2 200€/mois', description:'Supervision de l\'entretien des chambres et des parties communes. Encadrement d\'une équipe de 6 personnes.', competences:'Management, Qualité, Hôtellerie', urgent:true, teletravail:false, created_at: new Date(Date.now()-6*86400000).toISOString(), secteur:'vacances' },
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
    try { await axios.post(`${API}/recrutement/annonces/${offre.id}/candidatures`, { ...form, cvFichier: cvFile ? cvFile.name : null }); } catch (_) {}
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
  const [secteur, setSecteur] = useState(urlSecteur && ['coiffure','btp','restaurant','vacances'].includes(urlSecteur) ? urlSecteur : 'tous');
  const [offres, setOffres] = useState(DEMO_OFFRES);
  const [selected, setSelected] = useState(null);
  const [postulating, setPostulating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    axios.get(`${API}/recrutement/annonces?limit=50`).then(r=>{ if(r.data?.annonces?.length) setOffres(r.data.annonces); }).catch(()=>{});
  }, []);

  const filtered = offres.filter(o => {
    const mq = !quoi || o.poste?.toLowerCase().includes(quoi.toLowerCase()) || o.description?.toLowerCase().includes(quoi.toLowerCase());
    const mo = !ou || o.localisation?.toLowerCase().includes(ou.toLowerCase());
    const mc = contrat==='Tous' || o.type_contrat===contrat;
    const ms = secteur==='tous' || o.secteur===secteur;
    return mq && mo && mc && ms;
  });

  const subNav = (
    <div style={{ display:'flex', padding:'0 clamp(16px,4vw,48px)', overflowX:'auto', scrollbarWidth:'none', gap:2 }}>
      {SECTEURS.map(s => (
        <button key={s.id} onClick={() => setSecteur(s.id)}
          style={{ padding:'11px 14px', background:'none', border:'none', borderBottom:`2px solid ${secteur===s.id?DS.accent:'transparent'}`, fontSize:12.5, fontWeight:secteur===s.id?700:400, color:secteur===s.id?DS.ink:DS.muted, cursor:'pointer', whiteSpace:'nowrap', marginBottom:-1, transition:'color .15s', fontFamily:DS.font, display:'flex', alignItems:'center', gap:6 }}>
          <span>{s.emoji}</span>{s.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ height:'100vh', background:DS.bg, fontFamily:DS.font, color:DS.ink, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <RecrutementBanner />
      <PublicNavbar subNav={subNav} />

      {/* Hero */}
      <div style={{ background:DS.bg, borderBottom:`1px solid ${DS.border}`, padding:'clamp(28px,5vh,48px) clamp(20px,5vw,56px) clamp(20px,3vh,32px)', flexShrink:0, opacity:mounted?1:0, transform:mounted?'none':'translateY(12px)', transition:'opacity .5s,transform .5s' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          {/* Titre + stats */}
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:DS.goldLight, border:`1px solid #EDE8D4`, borderRadius:DS.r.full, fontSize:11, color:DS.goldDark, fontWeight:600, marginBottom:10 }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:DS.gold }} />
                {offres.length} offres · 6 secteurs · Toute la France
              </div>
              <h1 style={{ fontSize:'clamp(1.625rem,4vw,2.5rem)', fontWeight:900, letterSpacing:'-0.05em', color:DS.ink, margin:0, lineHeight:1.1 }}>
                Trouvez votre<br/>prochain emploi
              </h1>
            </div>
            <button onClick={() => navigate('/register?role=patron')}
              style={{ padding:'10px 20px', background:DS.accent, border:'none', borderRadius:DS.r.full, fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', whiteSpace:'nowrap', transition:'background .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=DS.accentHover}
              onMouseLeave={e=>e.currentTarget.style.background=DS.accent}>
              Publier une offre →
            </button>
          </div>

          {/* Barre de recherche */}
          <div style={{ display:'flex', background:DS.bg, border:`1.5px solid ${DS.border}`, borderRadius:DS.r.full, overflow:'hidden', boxShadow:DS.shadow.md }}
            onFocusCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.lg}
            onBlurCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.md}>
            <div style={{ flex:1.3, display:'flex', flexDirection:'column', padding:'12px 20px' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', color:DS.subtle, textTransform:'uppercase', marginBottom:4 }}>Quoi ?</label>
              <input value={quoi} onChange={e=>setQuoi(e.target.value)} placeholder="Métier, compétence…"
                style={{ background:'none', border:'none', outline:'none', fontSize:'0.9rem', color:DS.ink, fontFamily:DS.font, fontWeight:500 }} />
            </div>
            <div style={{ width:1, background:DS.border, margin:'10px 0' }} />
            <div style={{ display:'flex', flexDirection:'column', padding:'12px 20px', minWidth:140 }}>
              <label style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', color:DS.subtle, textTransform:'uppercase', marginBottom:4 }}>Où ?</label>
              <input value={ou} onChange={e=>setOu(e.target.value)} placeholder="Ville…"
                style={{ background:'none', border:'none', outline:'none', fontSize:'0.9rem', color:DS.ink, fontFamily:DS.font, fontWeight:500, width:'100%' }} />
            </div>
            <button
              style={{ flexShrink:0, background:DS.ink, border:'none', cursor:'pointer', padding:'0 24px', fontWeight:700, color:'#fff', fontSize:'0.875rem', transition:'opacity .15s', borderRadius:`0 ${DS.r.full}px ${DS.r.full}px 0` }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Filtres contrat */}
      <div style={{ padding:'10px clamp(20px,5vw,56px)', borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', gap:6, overflowX:'auto', scrollbarWidth:'none', flexShrink:0 }}>
        <span style={{ fontSize:'0.7rem', color:DS.subtle, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600, flexShrink:0, marginRight:4 }}>Contrat</span>
        {CONTRATS.map(c => (
          <button key={c} onClick={() => setContrat(c)}
            style={{ flexShrink:0, padding:'5px 13px', borderRadius:DS.r.full, border:`1px solid ${contrat===c?DS.ink:DS.border}`, background:contrat===c?DS.ink:DS.bg, color:contrat===c?'#fff':DS.muted, fontSize:'0.78rem', fontWeight:contrat===c?600:400, cursor:'pointer', transition:'all .15s' }}>
            {c}
          </button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:'0.8rem', color:DS.subtle, flexShrink:0 }}>
          {filtered.length} offre{filtered.length!==1?'s':''}
        </span>
      </div>

      {/* Liste + Détail */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
        <div style={{ width:selected?'42%':'100%', minWidth:300, borderRight:`1px solid ${DS.border}`, overflowY:'auto', transition:'width .3s ease' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'60px 40px', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:12 }}>📋</div>
              <div style={{ fontWeight:600, color:DS.ink, marginBottom:6 }}>Aucune offre trouvée</div>
              <div style={{ fontSize:'0.875rem', color:DS.muted, marginBottom:16 }}>Essayez d'autres critères</div>
              <button onClick={() => { setQuoi(''); setOu(''); setContrat('Tous'); setSecteur('tous'); }}
                style={{ background:'none', border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:'8px 18px', color:DS.muted, cursor:'pointer', fontSize:'0.8125rem' }}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : filtered.map(o => (
            <OffreCard key={o.id} offre={o} selected={selected?.id===o.id} onClick={() => setSelected(selected?.id===o.id?null:o)} />
          ))}
        </div>

        {selected && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'12px 22px', borderBottom:`1px solid ${DS.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <button onClick={() => setSelected(null)}
                style={{ background:'none', border:'none', cursor:'pointer', color:DS.muted, display:'flex', alignItems:'center', gap:6, fontSize:'0.825rem', fontFamily:DS.font }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Retour
              </button>
              <button onClick={() => setPostulating(true)}
                style={{ background:DS.accent, border:'none', cursor:'pointer', padding:'8px 20px', borderRadius:DS.r.full, fontSize:'0.8375rem', fontWeight:600, color:'#fff', transition:'background .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background=DS.accentHover}
                onMouseLeave={e=>e.currentTarget.style.background=DS.accent}>
                Postuler →
              </button>
            </div>
            <OffreDetail offre={selected} onPostuler={() => setPostulating(true)} />
          </div>
        )}
      </div>

      {postulating && selected && <ModalCandidature offre={selected} onClose={() => setPostulating(false)} />}
      <style>{`input::placeholder{color:${DS.subtle};} textarea::placeholder{color:${DS.subtle};} ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-thumb{background:${DS.border};border-radius:2px;}`}</style>
    </div>
  );
}
