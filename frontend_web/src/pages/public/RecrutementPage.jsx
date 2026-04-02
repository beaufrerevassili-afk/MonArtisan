import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CONTRATS = ['Tous', 'CDI', 'CDD', 'Alternance', 'Stage', 'Freelance', 'Intérim'];

const DEMO_OFFRES = [
  { id:1, poste:'Coiffeur(se) confirmé(e)', entreprise:'Salon Léa', localisation:'Paris 11e', type_contrat:'CDI', salaire:'2 200–2 800€/mois', description:'Nous recherchons un(e) coiffeur(se) polyvalent(e) avec au moins 3 ans d\'expérience. Maîtrise des techniques couleur exigée. Ambiance bienveillante, clientèle fidèle.', competences:'Colorimétrie, Balayage, Brushing, Coupes femmes', urgent:false, teletravail:false, created_at: new Date(Date.now()-86400000).toISOString(), secteur:'coiffure' },
  { id:2, poste:'Barbier / Coiffeur homme', entreprise:'Barbershop Alex', localisation:'Paris 3e', type_contrat:'CDI', salaire:'2 000–2 500€/mois', description:'Rejoignez notre équipe de barbiers passionnés. Dégradé américain, rasage traditionnel, ambiance détendue.', competences:'Dégradé, Barbe, Rasoir droit', urgent:true, teletravail:false, created_at: new Date(Date.now()-3600000).toISOString(), secteur:'coiffure' },
  { id:3, poste:'Plombier chauffagiste N2/N3', entreprise:'PlombiPro', localisation:'Lyon', type_contrat:'CDI', salaire:'2 400–3 000€/mois', description:'Installation et dépannage chauffage, plomberie sanitaire. Permis B indispensable. Véhicule de société fourni.', competences:'Soudure cuivre, PAC, Chauffe-eau, Sanitaire', urgent:false, teletravail:false, created_at: new Date(Date.now()-2*86400000).toISOString(), secteur:'btp' },
  { id:4, poste:'Électricien(ne) N3P1', entreprise:'Énergie et Co', localisation:'Marseille', type_contrat:'CDI', salaire:'2 300–2 900€/mois', description:'Travaux d\'installation électrique en neuf et rénovation. Habilitations BR/B2V requises.', competences:'Électricité HTA, Domotique, Habilitation électrique', urgent:false, teletravail:false, created_at: new Date(Date.now()-3*86400000).toISOString(), secteur:'btp' },
  { id:5, poste:'Chef de rang', entreprise:'Chez Marco', localisation:'Lyon 2e', type_contrat:'CDI', salaire:'2 100–2 500€/mois', description:'Restaurant gastronomique cherche chef de rang expérimenté. Service du soir, 5 soirs/semaine.', competences:'Service en salle, Cave, Anglais professionnel', urgent:false, teletravail:false, created_at: new Date(Date.now()-4*86400000).toISOString(), secteur:'restaurant' },
  { id:6, poste:'Boulanger qualifié', entreprise:'Maison Dupont', localisation:'Bordeaux', type_contrat:'CDI', salaire:'2 000–2 400€/mois', description:'Fabrication de pains au levain, viennoiseries. Travail en équipe, matins uniquement. CAP Boulangerie exigé.', competences:'Levain naturel, Pétrissage, Façonnage, Cuisson', urgent:false, teletravail:false, created_at: new Date(Date.now()-5*86400000).toISOString(), secteur:'boulangerie' },
  { id:7, poste:'Alternant Mécanicien Auto', entreprise:'Garage Martin', localisation:'Toulouse', type_contrat:'Alternance', salaire:'SMIC selon âge', description:'Formation en alternance mécanicien automobile. Accueil, diagnostic, entretien courant. BAC Pro ou BTS en cours.', competences:'Entretien, Diagnostic OBD, Pneumatiques', urgent:false, teletravail:false, created_at: new Date(Date.now()-6*86400000).toISOString(), secteur:'garage' },
];

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
    try { await axios.post(`${API}/recrutement/annonces/${offre.id}/candidatures`, { ...form, telephone: form.telephone, cvFichier: cvFile ? cvFile.name : null }); } catch (_) {}
    setLoading(false); setStep(3);
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(8px)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'#fff',borderRadius:20,width:'100%',maxWidth:520,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 32px 80px rgba(0,0,0,0.18)' }}>
        <div style={{ padding:'24px 28px 16px',borderBottom:'1px solid #F0F0F0' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:'1.0625rem',fontWeight:700,color:'#0A0A0A',letterSpacing:'-0.025em' }}>Postuler</div>
              <div style={{ fontSize:'0.825rem',color:'#888',marginTop:3 }}>{offre.poste} · {offre.entreprise}</div>
            </div>
            <button onClick={onClose} style={{ width:32,height:32,borderRadius:'50%',background:'#F5F5F5',border:'none',cursor:'pointer',color:'#666',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
          </div>
          {step < 3 && (
            <div style={{ display:'flex',gap:6,marginTop:16 }}>
              {['Informations','CV et lettre'].map((s,i) => (
                <div key={s} style={{ flex:1 }}>
                  <div style={{ height:2,borderRadius:1,background:i<step?'#0A0A0A':'#E8E8E8',marginBottom:4,transition:'background .3s' }} />
                  <div style={{ fontSize:'0.7rem',color:i+1===step?'#0A0A0A':'#AAAAAA',fontWeight:i+1===step?600:400 }}>{s}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'24px 28px 28px' }}>
          {step===1 && (
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ display:'flex',gap:12 }}>
                {[{k:'prenom',l:'Prénom *',p:'Marie'},{k:'nom',l:'Nom *',p:'Dupont'}].map(f => (
                  <div key={f.k} style={{ flex:1 }}>
                    <label style={{ display:'block',fontSize:'0.775rem',fontWeight:500,color:'#555',marginBottom:6 }}>{f.l}</label>
                    <input type="text" value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.p} style={{ width:'100%',background:'#FAFAFA',border:'1px solid #E8E8E8',borderRadius:10,padding:'11px 14px',fontSize:'0.9rem',color:'#0A0A0A',outline:'none',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .15s' }} onFocus={e=>e.target.style.borderColor='#0A0A0A'} onBlur={e=>e.target.style.borderColor='#E8E8E8'} />
                  </div>
                ))}
              </div>
              {[{k:'email',l:'Email *',p:'marie@email.com',t:'email'},{k:'telephone',l:'Téléphone',p:'06 12 34 56 78',t:'tel'}].map(f => (
                <div key={f.k}>
                  <label style={{ display:'block',fontSize:'0.775rem',fontWeight:500,color:'#555',marginBottom:6 }}>{f.l}</label>
                  <input type={f.t} value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.p} style={{ width:'100%',background:'#FAFAFA',border:'1px solid #E8E8E8',borderRadius:10,padding:'11px 14px',fontSize:'0.9rem',color:'#0A0A0A',outline:'none',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .15s' }} onFocus={e=>e.target.style.borderColor='#0A0A0A'} onBlur={e=>e.target.style.borderColor='#E8E8E8'} />
                </div>
              ))}
              {err && <div style={{ padding:'10px 14px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,fontSize:'0.8rem',color:'#DC2626' }}>{err}</div>}
              <button onClick={next} style={{ width:'100%',marginTop:4,padding:'13px',background:'#0A0A0A',border:'none',borderRadius:12,fontWeight:600,fontSize:'0.9375rem',color:'#fff',cursor:'pointer',letterSpacing:'-0.01em',transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Continuer →</button>
            </div>
          )}
          {step===2 && (
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div>
                <label style={{ display:'block',fontSize:'0.775rem',fontWeight:500,color:'#555',marginBottom:8 }}>Votre CV</label>
                <div onClick={()=>fileRef.current.click()} style={{ border:`2px dashed ${cvFile?'#0A0A0A':'#E0E0E0'}`,borderRadius:12,padding:'28px',textAlign:'center',cursor:'pointer',transition:'all .2s',background:cvFile?'#F9F9F7':'#FAFAFA' }} onMouseEnter={e=>{ if(!cvFile) e.currentTarget.style.borderColor='#BBBBBB'; }} onMouseLeave={e=>{ if(!cvFile) e.currentTarget.style.borderColor='#E0E0E0'; }}>
                  {cvFile ? (
                    <div><div style={{ fontSize:'1.5rem',marginBottom:6 }}>📄</div><div style={{ fontSize:'0.875rem',fontWeight:600,color:'#0A0A0A' }}>{cvFile.name}</div><div style={{ fontSize:'0.75rem',color:'#888',marginTop:3 }}>{(cvFile.size/1024).toFixed(0)} Ko · <span style={{ textDecoration:'underline',cursor:'pointer' }} onClick={e=>{e.stopPropagation();setCvFile(null);}}>Supprimer</span></div></div>
                  ) : (
                    <div><div style={{ fontSize:'1.75rem',marginBottom:8 }}>⬆️</div><div style={{ fontSize:'0.875rem',fontWeight:600,color:'#333',marginBottom:4 }}>Déposez votre CV ici</div><div style={{ fontSize:'0.775rem',color:'#AAAAAA' }}>PDF, Word — max 5 Mo</div></div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={e=>setCvFile(e.target.files[0]||null)} style={{ display:'none' }} />
              </div>
              <div>
                <label style={{ display:'block',fontSize:'0.775rem',fontWeight:500,color:'#555',marginBottom:6 }}>Lettre de motivation <span style={{ color:'#AAAAAA',fontWeight:400 }}>(optionnel)</span></label>
                <textarea value={form.lettre} onChange={e=>setForm(x=>({...x,lettre:e.target.value}))} placeholder={`Dites-nous pourquoi vous souhaitez rejoindre ${offre.entreprise}...`} rows={5} style={{ width:'100%',background:'#FAFAFA',border:'1px solid #E8E8E8',borderRadius:10,padding:'12px 14px',fontSize:'0.875rem',color:'#0A0A0A',outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit',lineHeight:1.6,transition:'border-color .15s' }} onFocus={e=>e.target.style.borderColor='#0A0A0A'} onBlur={e=>e.target.style.borderColor='#E8E8E8'} />
              </div>
              <div>
                <label style={{ display:'block',fontSize:'0.775rem',fontWeight:500,color:'#555',marginBottom:6 }}>Expériences et compétences <span style={{ color:'#AAAAAA',fontWeight:400 }}>(optionnel)</span></label>
                <textarea value={form.cvTexte} onChange={e=>setForm(x=>({...x,cvTexte:e.target.value}))} placeholder="Listez vos expériences, diplômes, compétences clés..." rows={4} style={{ width:'100%',background:'#FAFAFA',border:'1px solid #E8E8E8',borderRadius:10,padding:'12px 14px',fontSize:'0.875rem',color:'#0A0A0A',outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit',lineHeight:1.6,transition:'border-color .15s' }} onFocus={e=>e.target.style.borderColor='#0A0A0A'} onBlur={e=>e.target.style.borderColor='#E8E8E8'} />
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button onClick={()=>setStep(1)} style={{ flex:1,padding:'13px',background:'#F5F5F5',border:'none',borderRadius:12,fontWeight:500,fontSize:'0.9rem',color:'#555',cursor:'pointer' }}>Retour</button>
                <button onClick={envoyer} disabled={loading} style={{ flex:2,padding:'13px',background:loading?'#E8E8E8':'#0A0A0A',border:'none',borderRadius:12,fontWeight:600,fontSize:'0.9375rem',color:loading?'#888':'#fff',cursor:loading?'default':'pointer',letterSpacing:'-0.01em',transition:'opacity .15s' }} onMouseEnter={e=>{if(!loading)e.currentTarget.style.opacity='0.82';}} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>{loading?'Envoi...':'Envoyer ma candidature'}</button>
              </div>
            </div>
          )}
          {step===3 && (
            <div style={{ textAlign:'center',padding:'20px 0' }}>
              <div style={{ width:64,height:64,borderRadius:'50%',background:'#F0FDF4',border:'1px solid #BBF7D0',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:'1.75rem' }}>✓</div>
              <div style={{ fontSize:'1.125rem',fontWeight:700,color:'#0A0A0A',marginBottom:8,letterSpacing:'-0.025em' }}>Candidature envoyée</div>
              <div style={{ fontSize:'0.875rem',color:'#666',lineHeight:1.65,marginBottom:24 }}>Votre candidature pour <strong>{offre.poste}</strong> chez <strong>{offre.entreprise}</strong> a bien été transmise.<br/>Réponse attendue à <span style={{ color:'#0A0A0A',fontWeight:600 }}>{form.email}</span></div>
              <button onClick={onClose} style={{ padding:'12px 28px',background:'#0A0A0A',border:'none',borderRadius:12,fontSize:'0.875rem',fontWeight:600,color:'#fff',cursor:'pointer' }}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OffreCard({ offre, selected, onClick }) {
  const [hov, setHov] = useState(false);
  const daysAgo = Math.floor((Date.now() - new Date(offre.created_at||Date.now()).getTime()) / 86400000);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ padding:'20px 24px',borderBottom:'1px solid #F5F5F5',cursor:'pointer',background:selected?'#FAFAF8':(hov?'#FCFCFB':'#fff'),transition:'background .15s',borderLeft:`3px solid ${selected?'#0A0A0A':'transparent'}` }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'0.9375rem',fontWeight:700,color:'#0A0A0A',letterSpacing:'-0.02em',marginBottom:3 }}>{offre.poste}</div>
          <div style={{ fontSize:'0.825rem',color:'#555',marginBottom:10,fontWeight:500 }}>{offre.entreprise} · {offre.localisation}</div>
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            {offre.type_contrat && <span style={{ fontSize:'0.72rem',fontWeight:600,color:'#333',background:'#F5F5F5',borderRadius:6,padding:'3px 9px' }}>{offre.type_contrat}</span>}
            {offre.salaire && <span style={{ fontSize:'0.72rem',color:'#555',background:'#F5F5F5',borderRadius:6,padding:'3px 9px' }}>{offre.salaire}</span>}
            {offre.urgent && <span style={{ fontSize:'0.72rem',fontWeight:700,color:'#DC2626',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:6,padding:'3px 9px' }}>Urgent</span>}
          </div>
        </div>
        <div style={{ fontSize:'0.7rem',color:'#CCCCCC',flexShrink:0 }}>{daysAgo===0?"Auj.":daysAgo===1?'Hier':`${daysAgo}j`}</div>
      </div>
    </div>
  );
}

function OffreDetail({ offre, onPostuler }) {
  if (!offre) return (
    <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,color:'#CCCCCC',padding:40,textAlign:'center' }}>
      <div style={{ fontSize:'2.5rem' }}>🔍</div>
      <div style={{ fontSize:'0.9rem',fontWeight:500,color:'#AAAAAA' }}>Sélectionnez une offre</div>
    </div>
  );
  return (
    <div style={{ flex:1,overflowY:'auto',padding:'28px 32px' }}>
      <div style={{ marginBottom:24,paddingBottom:24,borderBottom:'1px solid #F5F5F5' }}>
        <h2 style={{ fontSize:'1.375rem',fontWeight:800,color:'#0A0A0A',letterSpacing:'-0.035em',margin:'0 0 6px' }}>{offre.poste}</h2>
        <div style={{ fontSize:'0.9rem',color:'#555',marginBottom:14,fontWeight:500 }}>{offre.entreprise} · {offre.localisation}</div>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20 }}>
          {[offre.type_contrat,offre.salaire].filter(Boolean).map(v=>(
            <span key={v} style={{ fontSize:'0.8rem',color:'#444',background:'#F5F5F3',border:'1px solid #EBEBEB',borderRadius:8,padding:'5px 12px',fontWeight:500 }}>{v}</span>
          ))}
        </div>
        <button onClick={onPostuler} style={{ width:'100%',padding:'14px',background:'#0A0A0A',border:'none',borderRadius:12,fontWeight:700,fontSize:'0.9375rem',color:'#fff',cursor:'pointer',letterSpacing:'-0.01em',transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Postuler à cette offre →</button>
      </div>
      {offre.description && <div style={{ marginBottom:24 }}><div style={{ fontSize:'0.7rem',fontWeight:700,color:'#AAAAAA',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>Description</div><div style={{ fontSize:'0.875rem',color:'#444',lineHeight:1.75 }}>{offre.description}</div></div>}
      {offre.competences && <div style={{ marginBottom:24 }}><div style={{ fontSize:'0.7rem',fontWeight:700,color:'#AAAAAA',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>Compétences</div><div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>{offre.competences.split(',').map(c=><span key={c} style={{ fontSize:'0.8rem',color:'#333',background:'#F5F5F3',border:'1px solid #EBEBEB',borderRadius:8,padding:'5px 12px' }}>{c.trim()}</span>)}</div></div>}
      <div style={{ background:'#FAFAF8',border:'1px solid #EBEBEB',borderRadius:12,padding:'16px 18px' }}>
        <div style={{ fontSize:'0.7rem',fontWeight:700,color:'#AAAAAA',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>Infos pratiques</div>
        {[{l:'Entreprise',v:offre.entreprise},{l:'Localisation',v:offre.localisation},{l:'Contrat',v:offre.type_contrat},{l:'Salaire',v:offre.salaire||'Non précisé'}].map(({l,v})=>v&&(
          <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
            <span style={{ fontSize:'0.8125rem',color:'#888' }}>{l}</span>
            <span style={{ fontSize:'0.8125rem',color:'#0A0A0A',fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecrutementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quoi, setQuoi] = useState(searchParams.get('q')||'');
  const [ou, setOu] = useState(searchParams.get('ou')||'');
  const [contrat, setContrat] = useState('Tous');
  const [offres, setOffres] = useState(DEMO_OFFRES);
  const [selected, setSelected] = useState(null);
  const [postulating, setPostulating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    axios.get(`${API}/recrutement/annonces?limit=50`).then(r=>{ if(r.data.annonces?.length) setOffres(r.data.annonces); }).catch(()=>{});
  }, []);

  const filtered = offres.filter(o=>{
    const mq=!quoi||o.poste?.toLowerCase().includes(quoi.toLowerCase())||o.description?.toLowerCase().includes(quoi.toLowerCase());
    const mo=!ou||o.localisation?.toLowerCase().includes(ou.toLowerCase());
    const mc=contrat==='Tous'||o.type_contrat===contrat;
    return mq&&mo&&mc;
  });

  return (
    <div style={{ height:'100vh',background:'#fff',fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif",color:'#0A0A0A',display:'flex',flexDirection:'column',overflow:'hidden' }}>
      {/* Nav */}
      <nav style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 clamp(20px,5vw,48px)',height:56,borderBottom:'1px solid #E8E7E4',background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',flexShrink:0,zIndex:100 }}>
        <button onClick={()=>navigate('/')} style={{ background:'none',border:'none',cursor:'pointer',fontSize:17,fontWeight:800,color:'#0A0A0A',letterSpacing:'-0.05em',display:'flex',alignItems:'center',gap:2,fontFamily:'inherit' }}>
          Artisans<span style={{ color:'#C9A96E' }}>.</span>
        </button>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          <button onClick={()=>navigate('/login')} style={{ background:'none',border:'1px solid #E8E7E4',cursor:'pointer',padding:'7px 16px',borderRadius:100,fontSize:'0.8rem',fontWeight:500,color:'#6B6B6B',transition:'all .15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#0A0A0A';e.currentTarget.style.color='#0A0A0A';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8E7E4';e.currentTarget.style.color='#6B6B6B';}}>Se connecter</button>
          <button onClick={()=>navigate('/register')} style={{ background:'#0A0A0A',border:'none',cursor:'pointer',padding:'7px 20px',borderRadius:100,fontSize:'0.8rem',fontWeight:600,color:'#fff',transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Créer un compte</button>
        </div>
      </nav>

      {/* Hero recherche */}
      <div style={{ background:'#fff',borderBottom:'1px solid #F0F0F0',padding:'clamp(36px,6vh,60px) clamp(20px,5vw,56px) clamp(28px,4vh,44px)',flexShrink:0,opacity:mounted?1:0,transform:mounted?'none':'translateY(12px)',transition:'opacity .5s,transform .5s' }}>
        <div style={{ maxWidth:680,margin:'0 auto' }}>
          <p style={{ fontSize:'0.7rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#AAAAAA',fontWeight:600,margin:'0 0 14px' }}>Offres d'emploi</p>
          <h1 style={{ fontSize:'clamp(1.875rem,5vw,3rem)',fontWeight:900,letterSpacing:'-0.05em',color:'#0A0A0A',margin:'0 0 28px',lineHeight:1.06 }}>Trouvez votre<br/>prochain emploi</h1>
          <div style={{ display:'flex',background:'#fff',border:'1px solid #E0E0E0',borderRadius:14,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
            <div style={{ flex:1,display:'flex',flexDirection:'column',padding:'14px 20px 12px' }}>
              <label style={{ fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',color:'#AAAAAA',textTransform:'uppercase',marginBottom:4 }}>Quoi ?</label>
              <input value={quoi} onChange={e=>setQuoi(e.target.value)} placeholder="Métier, compétence, entreprise..." style={{ background:'none',border:'none',outline:'none',fontSize:'0.9375rem',color:'#0A0A0A',fontFamily:'inherit',letterSpacing:'-0.01em',fontWeight:500 }} />
            </div>
            <div style={{ width:1,background:'#EBEBEB',margin:'12px 0' }} />
            <div style={{ display:'flex',flexDirection:'column',padding:'14px 20px 12px',minWidth:160 }}>
              <label style={{ fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',color:'#AAAAAA',textTransform:'uppercase',marginBottom:4 }}>Où ?</label>
              <input value={ou} onChange={e=>setOu(e.target.value)} placeholder="Ville, département..." style={{ background:'none',border:'none',outline:'none',fontSize:'0.9375rem',color:'#0A0A0A',fontFamily:'inherit',letterSpacing:'-0.01em',fontWeight:500,width:'100%' }} />
            </div>
            <button style={{ flexShrink:0,background:'#0A0A0A',border:'none',cursor:'pointer',padding:'0 24px',fontWeight:700,color:'#fff',fontSize:'0.875rem',letterSpacing:'-0.01em',transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Rechercher</button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ padding:'12px clamp(20px,5vw,56px)',borderBottom:'1px solid #F5F5F5',display:'flex',alignItems:'center',gap:8,overflowX:'auto',scrollbarWidth:'none',flexShrink:0 }}>
        <span style={{ fontSize:'0.72rem',color:'#AAAAAA',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600,flexShrink:0 }}>Contrat</span>
        {CONTRATS.map(c=>(
          <button key={c} onClick={()=>setContrat(c)} style={{ flexShrink:0,padding:'5px 14px',borderRadius:20,border:`1px solid ${contrat===c?'#0A0A0A':'#E8E8E8'}`,background:contrat===c?'#0A0A0A':'#fff',color:contrat===c?'#fff':'#555',fontSize:'0.8rem',fontWeight:contrat===c?600:400,cursor:'pointer',transition:'all .15s' }}>{c}</button>
        ))}
        <span style={{ marginLeft:'auto',fontSize:'0.8rem',color:'#AAAAAA',flexShrink:0 }}>{filtered.length} offre{filtered.length!==1?'s':''}</span>
      </div>

      {/* Layout */}
      <div style={{ flex:1,display:'flex',overflow:'hidden',minHeight:0 }}>
        <div style={{ width:selected?'42%':'100%',minWidth:300,borderRight:'1px solid #F5F5F5',overflowY:'auto',transition:'width .3s ease' }}>
          {filtered.length===0 ? (
            <div style={{ padding:'60px 40px',textAlign:'center',color:'#AAAAAA' }}>
              <div style={{ fontSize:'2rem',marginBottom:12 }}>📋</div>
              <div style={{ fontWeight:600,color:'#888',marginBottom:6 }}>Aucune offre trouvée</div>
              <button onClick={()=>{setQuoi('');setOu('');setContrat('Tous');}} style={{ background:'none',border:'1px solid #E8E8E8',borderRadius:8,padding:'8px 18px',color:'#666',cursor:'pointer',fontSize:'0.8125rem',marginTop:8 }}>Réinitialiser</button>
            </div>
          ) : filtered.map(o=><OffreCard key={o.id} offre={o} selected={selected?.id===o.id} onClick={()=>setSelected(selected?.id===o.id?null:o)} />)}
        </div>
        {selected && (
          <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
            <div style={{ padding:'14px 24px',borderBottom:'1px solid #F5F5F5',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
              <button onClick={()=>setSelected(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#888',display:'flex',alignItems:'center',gap:6,fontSize:'0.825rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Retour
              </button>
              <button onClick={()=>setPostulating(true)} style={{ background:'#0A0A0A',border:'none',cursor:'pointer',padding:'8px 20px',borderRadius:8,fontSize:'0.8375rem',fontWeight:600,color:'#fff',letterSpacing:'-0.01em',transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Postuler →</button>
            </div>
            <OffreDetail offre={selected} onPostuler={()=>setPostulating(true)} />
          </div>
        )}
      </div>
      {postulating&&selected&&<ModalCandidature offre={selected} onClose={()=>setPostulating(false)} />}
      <style>{`input::placeholder{color:#CCCCCC;} textarea::placeholder{color:#CCCCCC;} ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-thumb{background:#E8E8E8;border-radius:2px;}`}</style>
    </div>
  );
}
