import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const V = '#8B5CF6';
const BG = '#F5F3FF';

const CARD = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E9E5F5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const HDR = { fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN = { background:V, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const GHOST = { background:'transparent', color:'#6B7280', border:'1px solid #E9E5F5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const OVL = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil', icon:'🏠', label:'Accueil' },
  { id:'projets', icon:'🎬', label:'Mes projets' },
  { id:'gains',   icon:'💰', label:'Mes gains' },
  { id:'avis',    icon:'⭐', label:'Mes avis' },
  { id:'profil',  icon:'👤', label:'Mon profil' },
];

const STATUS = {
  a_faire:  { label:'À faire',   bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  en_cours: { label:'En cours',  bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  revision: { label:'Révision',  bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  livre:    { label:'Livré',     bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
};

const PROJETS = [
  { id:1, titre:'Pack 10 TikToks — @emma.lifestyle', client:'Emma Lifestyle', type:'TikTok', fichiers:10, revisions:1, deadline:'2026-04-08', montant:220, statut:'en_cours', notes:'Style dynamique, sous-titres colorés, musiques tendance' },
  { id:2, titre:'Vidéo YouTube — Salon Léa', client:'Salon Léa', type:'YouTube', fichiers:1, revisions:2, deadline:'2026-04-06', montant:130, statut:'revision', notes:'Présentation salon, ambiance chaleureuse. Client veut revoir l\'intro.' },
  { id:3, titre:'5 Reels Instagram — @alex.fitness', client:'Alex Fitness', type:'Reels', fichiers:5, revisions:0, deadline:'2026-04-10', montant:130, statut:'a_faire', notes:'Montage sportif, transitions rapides, texte motivationnel' },
  { id:4, titre:'Clip promo — Big Smoke', client:'Big Smoke Burgers', type:'Clip', fichiers:1, revisions:1, deadline:'2026-04-05', montant:200, statut:'livre', notes:'30s promo pour Instagram et TikTok, style food-porn' },
  { id:5, titre:'Stories quotidiennes — La Trattoria', client:'La Trattoria', type:'Stories', fichiers:7, revisions:0, deadline:'2026-04-07', montant:80, statut:'en_cours', notes:'Stories plats du jour, ambiance italienne' },
];

const AVIS = [
  { client:'Emma Lifestyle', note:5, commentaire:'Montages incroyables, exactement le style que je voulais !', date:'2026-04-03' },
  { client:'Big Smoke Burgers', note:5, commentaire:'Le clip promo est parfait, on adore le rendu.', date:'2026-04-02' },
  { client:'Alex Fitness', note:4, commentaire:'Bon travail, j\'attends la suite avec impatience.', date:'2026-03-28' },
  { client:'La Trattoria', note:5, commentaire:'Les stories sont magnifiques, merci !', date:'2026-03-25' },
];

const GAINS_SEMAINE = [
  { jour:'Lun', montant:130 },{ jour:'Mar', montant:200 },{ jour:'Mer', montant:80 },
  { jour:'Jeu', montant:220 },{ jour:'Ven', montant:0 },{ jour:'Sam', montant:0 },
  { jour:'Dim', montant:0 },
];

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD, flex:1, minWidth:140 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:accent||'#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#8B8B8B', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ statut }) {
  const s = STATUS[statut]; if(!s) return null;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

const TAB_MAP = { projets:'projets', gains:'gains', avis:'avis', profil:'profil' };

export default function DashboardMonteur() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB_MAP[searchParams.get('tab')] || 'accueil');
  const [projets, setProjets] = useState(PROJETS);
  const [toast, setToast] = useState(null);
  const [modalProjet, setModalProjet] = useState(null);

  useEffect(() => {
    const o = searchParams.get('tab');
    if (o && TAB_MAP[o]) setTab(TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3500); };
  const projetsActifs = projets.filter(p=>['a_faire','en_cours','revision'].includes(p.statut)).length;
  const gainsTotal = projets.filter(p=>p.statut==='livre').reduce((s,p)=>s+p.montant,0);
  const noteAvg = AVIS.length ? (AVIS.reduce((s,a)=>s+a.note,0)/AVIS.length).toFixed(1) : '—';
  const maxG = Math.max(...GAINS_SEMAINE.map(g=>g.montant),1);

  const livrer = (id) => { setProjets(p=>p.map(pr=>pr.id===id?{...pr,statut:'livre'}:pr)); showToast('Projet livré au client !'); setModalProjet(null); };
  const commencer = (id) => { setProjets(p=>p.map(pr=>pr.id===id?{...pr,statut:'en_cours'}:pr)); showToast('Projet démarré !'); };

  return (
    <div style={{ padding:'24px 28px', background:BG, minHeight:'100vh', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800 }}>🎬 Freample Com — Monteur</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:2 }}>Bonjour, {user?.nom || 'Monteur'}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#D1FAE5', borderRadius:999, fontSize:13, fontWeight:600, color:'#065F46' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#16A34A' }} /> Disponible
        </div>
      </div>

      <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:14, padding:6, border:'1px solid #E9E5F5', marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:tab===t.id?700:500, background:tab===t.id?V:'transparent', color:tab===t.id?'#fff':'#666', fontFamily:'inherit', fontSize:'0.875rem', transition:'all .15s' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ACCUEIL */}
      {tab==='accueil'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Projets actifs" value={projetsActifs} accent={V} />
          <KpiCard label="Gains livrés" value={`${gainsTotal}€`} accent="#059669" />
          <KpiCard label="Note moyenne" value={`${noteAvg}/5`} accent="#F59E0B" />
          <KpiCard label="Fichiers livrés" value={projets.filter(p=>p.statut==='livre').reduce((s,p)=>s+p.fichiers,0)} accent="#3B82F6" />
        </div>
        {/* Projets urgents (deadline proche) */}
        <div style={CARD}>
          <div style={HDR}>Projets en cours</div>
          {projets.filter(p=>['a_faire','en_cours','revision'].includes(p.statut)).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).map(p=>{
            const daysLeft = Math.ceil((new Date(p.deadline)-new Date())/(1000*60*60*24));
            return (
              <div key={p.id} onClick={()=>setModalProjet(p)} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px', background:'#FAFAFA', borderRadius:10, marginBottom:8, cursor:'pointer', border: daysLeft<=2?'2px solid #FCA5A5':'1px solid #F0F0F0' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                  {p.type==='TikTok'?'📱':p.type==='YouTube'?'▶️':p.type==='Reels'?'📸':p.type==='Stories'?'📖':'🎬'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{p.titre}</div>
                  <div style={{ fontSize:12, color:'#8B8B8B' }}>{p.type} · {p.fichiers} fichier{p.fichiers>1?'s':''} · {p.revisions} révision{p.revisions>1?'s':''}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <Badge statut={p.statut} />
                  <div style={{ fontSize:11, color: daysLeft<=2?'#DC2626':'#8B8B8B', fontWeight:600, marginTop:4 }}>
                    {daysLeft<=0?'⚠ En retard':daysLeft===1?'⚠ Demain':`J-${daysLeft}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>)}

      {/* MES PROJETS */}
      {tab==='projets'&&(<div>
        {projets.map(p=>(
          <div key={p.id} onClick={()=>setModalProjet(p)} style={{ ...CARD, marginBottom:10, cursor:'pointer', padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{p.titre}</div>
              <Badge statut={p.statut} />
            </div>
            <div style={{ fontSize:13, color:'#8B8B8B', marginBottom:4 }}>{p.client} · {p.type} · Deadline: {p.deadline}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:12, color:'#8B8B8B' }}>📁 {p.fichiers} fichiers · 🔄 {p.revisions} révisions</div>
              <div style={{ fontWeight:800, color:V }}>{p.montant}€</div>
            </div>
          </div>
        ))}
      </div>)}

      {/* MES GAINS */}
      {tab==='gains'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Cette semaine" value={`${GAINS_SEMAINE.reduce((s,g)=>s+g.montant,0)}€`} accent={V} />
          <KpiCard label="Projets livrés" value={projets.filter(p=>p.statut==='livre').length} accent="#059669" />
          <KpiCard label="En attente" value={`${projets.filter(p=>['en_cours','revision'].includes(p.statut)).reduce((s,p)=>s+p.montant,0)}€`} sub="Paiement après livraison" accent="#D97706" />
        </div>
        <div style={CARD}>
          <div style={HDR}>Gains par jour</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
            {GAINS_SEMAINE.map(g=>(
              <div key={g.jour} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:12, fontWeight:700, color:V }}>{g.montant>0?`${g.montant}€`:'—'}</div>
                <div style={{ width:'100%', background:g.montant>0?V:'#E9E5F5', borderRadius:'6px 6px 0 0', height:`${Math.max(4,Math.round((g.montant/maxG)*120))}px` }} />
                <div style={{ fontSize:11, color:'#8B8B8B', fontWeight:600 }}>{g.jour}</div>
              </div>
            ))}
          </div>
        </div>
      </div>)}

      {/* MES AVIS */}
      {tab==='avis'&&(<div>
        <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
          <KpiCard label="Note moyenne" value={`${noteAvg}/5`} accent="#F59E0B" />
          <KpiCard label="Avis reçus" value={AVIS.length} accent={V} />
        </div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {AVIS.map((a,i)=>(
            <div key={i} style={{ padding:'16px 20px', borderBottom:i<AVIS.length-1?'1px solid #F0F0F0':'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{a.client}</span>
                <span style={{ color:'#F59E0B' }}>{'★'.repeat(a.note)}{'☆'.repeat(5-a.note)}</span>
              </div>
              <div style={{ fontSize:13, color:'#5E5E5E' }}>"{a.commentaire}"</div>
              <div style={{ fontSize:12, color:'#8B8B8B', marginTop:4 }}>{a.date}</div>
            </div>
          ))}
        </div>
      </div>)}

      {/* PROFIL */}
      {tab==='profil'&&(<div>
        <div style={{ ...CARD, textAlign:'center', padding:32 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#EDE9FE', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:V }}>{(user?.nom||'M')[0]}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{user?.nom || 'Monteur'}</div>
          <div style={{ fontSize:14, color:'#8B8B8B', marginTop:4 }}>{user?.email}</div>
          <div style={{ fontSize:13, color:'#8B8B8B', marginTop:8 }}>🎬 Monteur vidéo · TikTok, YouTube, Reels</div>
          <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:24 }}>
            <div><div style={{ fontSize:22, fontWeight:800, color:V }}>{projets.length}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Projets</div></div>
            <div><div style={{ fontSize:22, fontWeight:800, color:'#F59E0B' }}>{noteAvg}</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Note</div></div>
            <div><div style={{ fontSize:22, fontWeight:800 }}>{gainsTotal}€</div><div style={{ fontSize:12, color:'#8B8B8B' }}>Gains livrés</div></div>
          </div>
        </div>
      </div>)}

      {/* MODAL projet */}
      {modalProjet&&(
        <div style={OVL} onClick={()=>setModalProjet(null)}>
          <div style={BOX} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:2 }}>{modalProjet.titre}</div>
            <div style={{ color:'#8B8B8B', fontSize:14, marginBottom:16 }}>{modalProjet.type} · <Badge statut={modalProjet.statut} /></div>
            <div style={{ ...CARD, background:'#FAFAFA', marginBottom:16 }}>
              {[{l:'Client',v:modalProjet.client},{l:'Fichiers à livrer',v:`${modalProjet.fichiers} fichier(s)`},{l:'Révisions',v:modalProjet.revisions},{l:'Deadline',v:modalProjet.deadline},{l:'Rémunération',v:`${modalProjet.montant}€`}].map(r=>(
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#8B8B8B' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
                </div>
              ))}
            </div>
            {modalProjet.notes&&<div style={{ padding:'12px 14px', background:'#EDE9FE', borderRadius:10, marginBottom:16, fontSize:13, color:'#5B21B6' }}>📝 Brief : {modalProjet.notes}</div>}
            <div style={{ display:'flex', gap:10 }}>
              {modalProjet.statut==='a_faire'&&<button onClick={()=>{commencer(modalProjet.id);setModalProjet(null);}} style={{ ...BTN, flex:1, padding:'12px' }}>▶️ Commencer le projet</button>}
              {['en_cours','revision'].includes(modalProjet.statut)&&<button onClick={()=>livrer(modalProjet.id)} style={{ ...BTN, flex:1, padding:'12px', background:'#059669' }}>📦 Livrer au client</button>}
              <button onClick={()=>setModalProjet(null)} style={{ ...GHOST, flex:1, padding:'12px' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div style={{ position:'fixed', top:24, right:24, background:'#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000 }}>{toast}</div>}
    </div>
  );
}
