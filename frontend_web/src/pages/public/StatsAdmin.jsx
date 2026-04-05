import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LUXE from '../../design/luxe';

// StatsAdmin uses slightly different accent shades for its charts
const L = {
  ...LUXE,
  green:'#22C55E', blue:'#3B82F6', purple:'#8B5CF6', orange:'#F59E0B',
};

export default function StatsAdmin() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const user = auth.user || null;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.email !== 'freamplecom@gmail.com') { navigate('/'); return; }
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadStats = () => {
    api.get('/analytics/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  if (!user || user.email !== 'freamplecom@gmail.com') return null;

  const maxDay = stats?.byDay?.length ? Math.max(...stats.byDay.map(x => parseInt(x.views) || 1)) : 1;

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{ position:'sticky', top:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 clamp(24px,4vw,48px)', height:60, background:'rgba(248,246,242,0.95)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${L.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:800, color:L.text, fontFamily:L.font, letterSpacing:'-0.04em' }}>
            Freample<span style={{ color:L.gold }}>.</span>
          </button>
          <span style={{ width:1, height:20, background:L.border }} />
          <span style={{ fontSize:12, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.15em' }}>Analytics</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={loadStats} style={{ padding:'7px 16px', background:'none', border:`1px solid ${L.border}`, fontSize:12, fontWeight:500, color:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=L.noir;e.currentTarget.style.color=L.noir;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.color=L.textSec;}}>
            ↻ Actualiser
          </button>
          <button onClick={()=>navigate('/patron/dashboard')} style={{ padding:'7px 16px', background:L.noir, border:'none', fontSize:12, fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:L.font, transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#333'} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
            Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'clamp(28px,4vh,48px) clamp(20px,4vw,40px)' }}>

        {/* ══ HEADER ══ */}
        <div style={{ marginBottom:36 }}>
          <h1 style={{ fontFamily:L.serif, fontSize:'clamp(28px,4vw,40px)', fontWeight:300, fontStyle:'italic', letterSpacing:'-0.02em', margin:'0 0 6px', lineHeight:1.1 }}>
            Statistiques <span style={{ fontWeight:700, fontStyle:'normal' }}>Freample</span>
          </h1>
          <p style={{ fontSize:14, color:L.textSec, margin:0 }}>Visites en temps réel · Mise à jour automatique toutes les 30s</p>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:80, color:L.textLight }}>
            <div style={{ width:32, height:32, border:`2px solid ${L.border}`, borderTopColor:L.gold, borderRadius:'50%', margin:'0 auto 16px', animation:'spin .7s linear infinite' }} />
            Chargement...
          </div>
        ) : !stats ? (
          <div style={{ textAlign:'center', padding:80, color:L.textLight }}>Impossible de charger les statistiques</div>
        ) : (
          <>
            {/* ══ KPIs ══ */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:32 }}>
              {[
                { label:"Aujourd'hui", value:stats.today, color:L.green, icon:'📅' },
                { label:'Cette semaine', value:stats.week, color:L.blue, icon:'📊' },
                { label:'Ce mois', value:stats.month, color:L.purple, icon:'📈' },
                { label:'Total', value:stats.total, color:L.orange, icon:'🌐' },
              ].map(kpi => (
                <div key={kpi.label} style={{ background:L.white, border:`1px solid ${L.border}`, padding:'24px', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:kpi.color }} />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{kpi.label}</div>
                      <div style={{ fontSize:32, fontWeight:200, color:L.text, letterSpacing:'-0.03em', fontFamily:L.serif }}>{kpi.value.toLocaleString('fr-FR')}</div>
                      <div style={{ fontSize:12, color:L.textSec, marginTop:4 }}>visites</div>
                    </div>
                    <div style={{ fontSize:28, opacity:0.3 }}>{kpi.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ══ GRAPHIQUE 30 JOURS ══ */}
            <div style={{ background:L.white, border:`1px solid ${L.border}`, padding:'28px', marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:L.text }}>Visites des 30 derniers jours</div>
                  <div style={{ fontSize:12, color:L.textLight, marginTop:2 }}>{stats.byDay?.length || 0} jours de données</div>
                </div>
                <div style={{ fontSize:11, color:L.textLight, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Moy. {stats.byDay?.length ? Math.round(stats.month / stats.byDay.length) : 0}/jour
                </div>
              </div>
              {stats.byDay?.length > 0 ? (
                <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:180, padding:'0 0 28px' }}>
                  {stats.byDay.map(d => {
                    const views = parseInt(d.views) || 0;
                    const h = Math.max(4, Math.round((views / maxDay) * 150));
                    const date = new Date(d.day);
                    const label = `${date.getDate()}/${date.getMonth() + 1}`;
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                      <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative' }} title={`${label}: ${views} visites`}>
                        <div style={{ fontSize:9, fontWeight:700, color:isToday ? L.green : L.gold, opacity:views > 0 ? 1 : 0 }}>{views}</div>
                        <div style={{ width:'100%', background:isToday ? L.green : L.gold, borderRadius:'3px 3px 0 0', height:h, minWidth:4, transition:'height .4s', opacity:isToday ? 1 : 0.6 }} />
                        <div style={{ fontSize:7, color:L.textLight, position:'absolute', bottom:-20, transform:'rotate(-45deg)', whiteSpace:'nowrap' }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:40, color:L.textLight, fontSize:14 }}>Aucune donnée encore — les visites apparaîtront ici</div>
              )}
            </div>

            {/* ══ TOP PAGES ══ */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:16 }}>
              {/* Pages les plus visitées */}
              <div style={{ background:L.white, border:`1px solid ${L.border}` }}>
                <div style={{ padding:'18px 24px', borderBottom:`1px solid ${L.border}`, fontSize:14, fontWeight:700, color:L.text }}>
                  Pages les plus visitées
                </div>
                {(stats.byPage || []).length === 0 ? (
                  <div style={{ padding:32, textAlign:'center', color:L.textLight, fontSize:13 }}>Aucune donnée</div>
                ) : (stats.byPage || []).map((p, i) => {
                  const pct = stats.total > 0 ? Math.round((parseInt(p.views) / stats.total) * 100) : 0;
                  const pageName = p.page === '/' ? 'Accueil' : p.page.replace(/^\//, '').replace(/\//g, ' › ');
                  return (
                    <div key={p.page} style={{ padding:'14px 24px', borderBottom:i < stats.byPage.length - 1 ? `1px solid ${L.border}` : 'none', display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:28, height:28, background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:L.goldDark, flexShrink:0 }}>{i + 1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:600, color:L.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pageName}</div>
                        <div style={{ marginTop:4, height:4, background:L.cream, borderRadius:2 }}>
                          <div style={{ height:4, background:L.gold, borderRadius:2, width:`${Math.min(pct * 2, 100)}%`, transition:'width .4s' }} />
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:15, fontWeight:700, color:L.text }}>{parseInt(p.views).toLocaleString('fr-FR')}</div>
                        <div style={{ fontSize:11, color:L.textLight }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Résumé rapide */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ background:L.white, border:`1px solid ${L.border}`, padding:'24px' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:L.text, marginBottom:16 }}>Aperçu rapide</div>
                  {[
                    { label:'Pages trackées', value:stats.byPage?.length || 0 },
                    { label:'Jours avec données', value:stats.byDay?.length || 0 },
                    { label:'Moyenne / jour', value:stats.byDay?.length ? Math.round(stats.month / stats.byDay.length) : 0 },
                    { label:'Pic journalier', value:stats.byDay?.length ? Math.max(...stats.byDay.map(d => parseInt(d.views) || 0)) : 0 },
                  ].map(r => (
                    <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${L.border}`, fontSize:14 }}>
                      <span style={{ color:L.textSec }}>{r.label}</span>
                      <span style={{ fontWeight:600, color:L.text }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:L.noir, padding:'28px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:10 }}>Temps réel</div>
                  <div style={{ fontFamily:L.serif, fontSize:48, fontWeight:200, color:'#fff', letterSpacing:'-0.03em' }}>{stats.today}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4 }}>visites aujourd'hui</div>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:L.green, marginTop:12, boxShadow:`0 0 8px ${L.green}` }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding:'20px 32px', textAlign:'center', borderTop:`1px solid ${L.border}`, marginTop:32 }}>
        <span style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase' }}>© 2026 Freample · Analytics</span>
      </footer>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
