import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import L from '../design/luxe';

// ── Comptes démo (alignés avec AuthContext) ──
const DEMO_COMPTES = [
  { role:'Client particulier', desc:'Publiez un projet, recevez des offres', email:'demo-client@freample.fr', motdepasse:'demo', color:'#5B5BD6' },
  { role:'Client entreprise', desc:'Gestion projets pro (SAS, SARL…)', email:'demo-entreprise@freample.fr', motdepasse:'demo', color:'#2563EB' },
  { role:'Chef d\'entreprise BTP', desc:'ERP complet : devis, RH, finance, QSE', email:'demo-patron@freample.fr', motdepasse:'demo', color:'#0A0A0A' },
  { role:'Auto-entrepreneur', desc:'Tableau de bord simplifié, CA, URSSAF', email:'demo-ae@freample.fr', motdepasse:'demo', color:'#A68B4B' },
  { role:'Gestion SCI', desc:'Comptabilité SCI, biens, déclarations fiscales', email:'demo-sci@freample.fr', motdepasse:'demo', color:'#16A34A' },
  { role:'Salarié BTP', desc:'Planning, fiches de paie, congés, notes de frais', email:'demo-employe@freample.fr', motdepasse:'demo', color:'#D97706' },
];
const SECTOR_CONFIG = {
  btp: { label:'BTP' },
};
const REDIRECTIONS = { client:'/', patron:'/patron/dashboard', employe:'/employe/dashboard', artisan:'/artisan/dashboard', super_admin:'/admin/dashboard', fondateur:'/fondateur/dashboard' };
const PUBLIC_SECTORS = ['btp'];

const inp = { width:'100%', boxSizing:'border-box', padding:'14px 16px', border:`1px solid ${L.border}`, background:L.white, fontSize:15, color:L.text, outline:'none', fontFamily:L.font, transition:'border-color .2s' };

export default function Login() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSector = searchParams.get('from');
  const sector = fromSector && PUBLIC_SECTORS.includes(fromSector) ? fromSector : null;

  const [form, setForm] = useState({ email:'', motdepasse:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const getDestination = (role, userData) => {
    // Redirection par type d'entreprise

    if (userData?.entrepriseType === 'ae') return '/ae/dashboard';
    if (role === 'client' && sector) return `/client/dashboard?tab=${sector}`;
    return REDIRECTIONS[role] || '/';
  };

  // Si déjà connecté — proposer de continuer ou changer de compte
  if (user) return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400, textAlign:'center' }}>
        <div style={{ fontSize:18, fontWeight:800, marginBottom:8 }}>Déjà connecté</div>
        <div style={{ fontSize:14, color:L.textSec, marginBottom:24 }}>Vous êtes connecté en tant que <strong>{user.nom}</strong> ({user.role})</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={() => navigate(getDestination(user.role, user))}
            style={{ padding:'14px 24px', background:L.noir, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:L.font, transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#333'} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
            Continuer vers mon espace →
          </button>
          <button onClick={async () => { await logout(); navigate('/login'); }}
            style={{ padding:'14px 24px', background:'transparent', color:L.textSec, border:`1px solid ${L.border}`, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:L.font }}>
            Se déconnecter et changer de compte
          </button>
        </div>
      </div>
    </div>
  );

  const demoAccounts = DEMO_COMPTES;

  const [suspendedEmail, setSuspendedEmail] = useState('');
  const [suspendedMotif, setSuspendedMotif] = useState('');

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true); setSuspendedEmail('');
    try { const data = await login(form.email, form.motdepasse); navigate(data.suspendu ? '/compte-suspendu' : getDestination(data.role, data)); }
    catch(err) { setError(err.response?.data?.erreur || 'Identifiants incorrects'); }
    finally { setLoading(false); }
  }

  async function remplirDemo(compte) {
    setError(''); setLoading(true);
    try { const data = await login(compte.email, compte.motdepasse); navigate(data.suspendu ? '/compte-suspendu' : getDestination(data.role, data)); }
    catch(err) { setError(err.response?.data?.erreur || 'Identifiants incorrects'); }
    finally { setLoading(false); }
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
                  {showPwd ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:L.redBg, border:'1px solid rgba(220,38,38,0.3)', padding:'10px 14px', fontSize:13, color:L.red, borderRadius:8 }}>
                {error}
                {suspendedEmail && (
                  <div style={{ marginTop:8 }}>
                    <a href={`/support?email=${encodeURIComponent(suspendedEmail)}&motif=${encodeURIComponent(suspendedMotif)}`}
                      style={{ color:'#2563EB', fontWeight:700, textDecoration:'underline' }}>
                      Contacter le support →
                    </a>
                  </div>
                )}
              </div>
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
              Accès rapide
            </span>
            <div style={{ flex:1, height:1, background:L.border }} />
          </div>


          {/* Comptes démo */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {demoAccounts.map((c, i) => (
              <button key={i} onClick={()=>remplirDemo(c)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:L.white, border:`1px solid ${L.border}`, cursor:'pointer', fontFamily:L.font, width:'100%', textAlign:'left', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=L.cream;e.currentTarget.style.borderColor=L.gold;}}
                onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.borderColor=L.border;}}>
                <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', background:c.color, borderRadius:8, flexShrink:0, letterSpacing:'-0.02em' }}>{c.role[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:L.text }}>{c.role}</div>
                  <div style={{ fontSize:11, color:L.textLight, marginTop:2 }}>{c.desc}</div>
                </div>
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
