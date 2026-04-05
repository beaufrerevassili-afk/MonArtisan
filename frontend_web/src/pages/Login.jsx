import React, { useState } from 'react';
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Palette luxe ──
const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldDark:'#8B7240', border:'#E8E6E1',
  red:'#DC2626', redBg:'#FEF2F2',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

// ── Comptes démo ──
const CLIENT_DEMO = { role:'Client', email:'client@demo.com', motdepasse:'client123', icon:'👤', universal:true };
const SECTEUR_COMPTES = {
  btp: [
    { role:'Chef d\'entreprise BTP', email:'patron.btp@demo.com', motdepasse:'patron123', icon:'🏗️' },
    { role:'Employé BTP', email:'employe.btp@demo.com', motdepasse:'employe123', icon:'👷' },
  ],
  coiffure: [
    { role:'Gérant·e salon', email:'patron.coiffure@demo.com', motdepasse:'patron123', icon:'✂️' },
    { role:'Employé·e salon', email:'employe.coiffure@demo.com', motdepasse:'employe123', icon:'💇' },
  ],
  restaurant: [
    { role:'Gérant·e restaurant', email:'patron.restaurant@demo.com', motdepasse:'patron123', icon:'🍽️' },
    { role:'Employé·e restaurant', email:'employe.restaurant@demo.com', motdepasse:'employe123', icon:'👨‍🍳' },
  ],
  vacances: [
    { role:'Gérant·e hôtel', email:'patron.hotel@demo.com', motdepasse:'patron123', icon:'🏨' },
    { role:'Employé·e hôtel', email:'employe.hotel@demo.com', motdepasse:'employe123', icon:'🛎️' },
  ],
  course: [
    { role:'Gérant·e VTC', email:'patron.course@demo.com', motdepasse:'patron123', icon:'🚗' },
    { role:'Chauffeur', email:'employe.course@demo.com', motdepasse:'employe123', icon:'🧑‍✈️' },
  ],
  eat: [
    { role:'Gérant·e livraison', email:'patron.eat@demo.com', motdepasse:'patron123', icon:'🛵' },
    { role:'Livreur', email:'employe.eat@demo.com', motdepasse:'employe123', icon:'📦' },
  ],
  com: [
    { role:'Gérant·e Freample Com', email:'patron.com@demo.com', motdepasse:'patron123', icon:'🎬' },
    { role:'Monteur vidéo', email:'employe.com@demo.com', motdepasse:'employe123', icon:'🎥' },
  ],
};
const GENERIC_DEMO = [
  CLIENT_DEMO,
  { role:"Chef d'entreprise", email:'patron.btp@demo.com', motdepasse:'patron123', icon:'🏢' },
  { role:'Employé', email:'employe.btp@demo.com', motdepasse:'employe123', icon:'👷' },
];
const SECTOR_CONFIG = {
  btp:       { label:'BTP',         icon:'🏗️' },
  coiffure:  { label:'Coiffure',    icon:'✂️' },
  restaurant:{ label:'Restaurant',  icon:'🍽️' },
  vacances:  { label:'Vacances',    icon:'🏨' },
  course:    { label:'VTC',         icon:'🚗' },
  eat:       { label:'Livraison',   icon:'🛵' },
  com:       { label:'Freample Com',icon:'🎬' },
};
const REDIRECTIONS = { client:'/', patron:'/patron/dashboard', artisan:'/artisan/dashboard', super_admin:'/admin/dashboard', fondateur:'/fondateur/dashboard' };
const PUBLIC_SECTORS = ['vacances','restaurant','coiffure','btp','course','eat','com'];

const inp = { width:'100%', boxSizing:'border-box', padding:'14px 16px', border:`1px solid ${L.border}`, background:L.white, fontSize:15, color:L.text, outline:'none', fontFamily:L.font, transition:'border-color .2s' };

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSector = searchParams.get('from');
  const sector = fromSector && PUBLIC_SECTORS.includes(fromSector) ? fromSector : null;

  const [form, setForm] = useState({ email:'', motdepasse:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [demoSector, setDemoSector] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);

  const getDestination = (role) => {
    if (role === 'client' && sector) return `/client/dashboard?tab=${sector}`;
    return REDIRECTIONS[role] || '/';
  };

  if (user && user.role !== 'client') return <Navigate to={getDestination(user.role)} replace />;

  const activeSector = sector || demoSector;
  const demoAccounts = activeSector ? [CLIENT_DEMO, ...(SECTEUR_COMPTES[activeSector]||[])] : GENERIC_DEMO;

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { const data = await login(form.email, form.motdepasse); navigate(getDestination(data.role)); }
    catch(err) { setError(err.response?.data?.erreur || 'Identifiants incorrects'); }
    finally { setLoading(false); }
  }

  async function remplirDemo(compte) {
    const isGeneric = !compte.universal && !activeSector && ["Chef d'entreprise",'Employé'].includes(compte.role);
    if (isGeneric) { setPendingRole(compte.role === "Chef d'entreprise" ? 'patron' : 'artisan'); return; }
    setError(''); setLoading(true);
    try { const data = await login(compte.email, compte.motdepasse); navigate(getDestination(data.role)); }
    catch(err) { setError(err.response?.data?.erreur || 'Identifiants incorrects'); }
    finally { setLoading(false); }
  }

  function handleSectorSelect(id) {
    if (demoSector === id && !pendingRole) { setDemoSector(null); return; }
    setDemoSector(id);
    if (pendingRole) {
      const comptes = SECTEUR_COMPTES[id] || [];
      const compte = pendingRole === 'patron' ? comptes[0] : comptes[1];
      if (compte) { setPendingRole(null); setTimeout(()=>remplirDemo(compte), 300); }
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Navbar ── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 clamp(24px,4vw,48px)', height:60, borderBottom:`1px solid ${L.border}` }}>
        <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:800, color:L.text, fontFamily:L.font, letterSpacing:'-0.04em' }}>
          Freample<span style={{ color:L.gold }}>.</span>
        </button>
        <Link to={sector ? `/register?secteur=${sector}` : '/register'} style={{ fontSize:13, color:L.gold, textDecoration:'none', fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>
          Créer un compte
        </Link>
      </nav>

      {/* ── Contenu ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(24px,4vh,48px) 20px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>
              {sector ? `Espace ${SECTOR_CONFIG[sector]?.label||sector}` : 'Connexion'}
            </div>
            <h1 style={{ fontFamily:L.serif, fontSize:'clamp(28px,4vw,40px)', fontWeight:300, fontStyle:'italic', color:L.text, letterSpacing:'-0.02em', margin:0, lineHeight:1.1 }}>
              Bon <span style={{ fontWeight:700, fontStyle:'normal' }}>retour</span>
            </h1>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', marginBottom:8, fontSize:12, fontWeight:600, color:L.textSec, textTransform:'uppercase', letterSpacing:'0.08em' }}>Adresse e-mail</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="votre@email.com" required autoComplete="email"
                style={{ ...inp, background:L.white, border:`1px solid ${L.border}`, color:L.text }}
                onFocus={e=>e.currentTarget.style.borderColor=L.gold} onBlur={e=>e.currentTarget.style.borderColor=L.border} />
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:12, fontWeight:600, color:L.textSec, textTransform:'uppercase', letterSpacing:'0.08em' }}>Mot de passe</label>
                <Link to="/forgot-password" style={{ fontSize:12, color:L.gold, textDecoration:'none', fontWeight:500 }}>Oublié ?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPwd?'text':'password'} value={form.motdepasse} onChange={e=>setForm({...form, motdepasse:e.target.value})} placeholder="••••••••" required autoComplete="current-password"
                  style={{ ...inp, background:L.white, border:`1px solid ${L.border}`, color:L.text, paddingRight:44 }}
                  onFocus={e=>e.currentTarget.style.borderColor=L.gold} onBlur={e=>e.currentTarget.style.borderColor=L.border} />
                <button type="button" onClick={()=>setShowPwd(!showPwd)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:L.textLight, fontSize:14 }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:L.redBg, border:'1px solid rgba(220,38,38,0.3)', padding:'10px 14px', fontSize:13, color:L.red }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'16px', background:L.noir, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .25s', opacity:loading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.background=L.gold;}}}
              onMouseLeave={e=>{if(!loading){e.currentTarget.style.background=L.noir;}}}>
              {loading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>Connexion…</> : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display:'flex', alignItems:'center', gap:14, margin:'28px 0 20px' }}>
            <div style={{ flex:1, height:1, background:L.border }} />
            <span style={{ fontSize:11, color:L.textLight, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em' }}>
              {activeSector ? SECTOR_CONFIG[activeSector]?.label : 'Démonstration'}
            </span>
            <div style={{ flex:1, height:1, background:L.border }} />
          </div>

          {/* Sélecteur secteur */}
          {!sector && (
            <div style={{ marginBottom:16, ...(pendingRole ? { background:L.cream, border:`1px solid ${L.gold}40`, padding:'14px 16px' } : {}) }}>
              {pendingRole && (
                <div style={{ fontSize:12, fontWeight:600, color:L.goldDark, marginBottom:10 }}>
                  Choisissez un secteur pour le compte {pendingRole === 'patron' ? "Chef d'entreprise" : 'Employé'}
                </div>
              )}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {Object.entries(SECTOR_CONFIG).map(([id, cfg]) => (
                  <button key={id} onClick={()=>handleSectorSelect(id)}
                    style={{ padding:'7px 14px', fontSize:12, fontWeight:600, border:`1px solid ${demoSector===id ? L.gold : L.border}`, background:demoSector===id ? L.cream : 'transparent', color:demoSector===id ? L.goldDark : L.textLight, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
                    onMouseEnter={e=>{if(demoSector!==id){e.currentTarget.style.borderColor=L.textSec;e.currentTarget.style.color=L.text;}}}
                    onMouseLeave={e=>{if(demoSector!==id){e.currentTarget.style.borderColor=L.border;e.currentTarget.style.color=L.textLight;}}}>
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>
              {pendingRole && <button onClick={()=>setPendingRole(null)} style={{ marginTop:10, fontSize:12, color:L.textLight, background:'none', border:'none', cursor:'pointer', fontFamily:L.font }}>Annuler</button>}
            </div>
          )}

          {/* Comptes démo */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {demoAccounts.map((c, i) => (
              <button key={i} onClick={()=>remplirDemo(c)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', fontFamily:L.font, width:'100%', textAlign:'left', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=L.cream;e.currentTarget.style.borderColor=L.gold;}}
                onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.borderColor=L.border;}}>
                <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, background:L.cream, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:L.text }}>{c.role}</div>
                  <div style={{ fontSize:11, color:L.textLight, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</div>
                </div>
                {c.universal && <div style={{ fontSize:10, fontWeight:700, color:L.goldDark, background:L.cream, border:`1px solid ${L.gold}40`, padding:'2px 8px', flexShrink:0, letterSpacing:'0.04em' }}>Universel</div>}
              </button>
            ))}
          </div>

          {/* Inscription */}
          <p style={{ textAlign:'center', marginTop:28, fontSize:14, color:L.textLight }}>
            Pas encore de compte ?{' '}
            <Link to={sector ? `/register?secteur=${sector}` : '/register'} style={{ color:L.gold, textDecoration:'none', fontWeight:600 }}>Créer un compte</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'16px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <span style={{ fontSize:11, color:L.textLight, letterSpacing:'0.1em', textTransform:'uppercase' }}>© 2026 Freample</span>
      </div>
    </div>
  );
}
