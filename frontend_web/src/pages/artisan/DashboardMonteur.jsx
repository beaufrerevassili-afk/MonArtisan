import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const V = '#8B5CF6';
const BG = '#F5F3FF';

const CARD = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E9E5F5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const HDR = { fontSize:13, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN = { background:V, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const GHOST = { background:'transparent', color:'#6B7280', border:'1px solid #E9E5F5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const OVL = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const TABS = [
  { id:'accueil', icon:'🏠', label:'Accueil' },
  { id:'projets', icon:'🎬', label:'Mes projets' },
  { id:'gains',   icon:'💰', label:'Mes gains' },
  { id:'messages', icon:'💬', label:'Messages' },
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
  { id: 1, titre: 'Reel Instagram Salon Excellence', type: 'Reels', client: 'Salon Excellence', statut: 'en_cours', fichiers: 1, revisions: 0, deadline: '2026-04-22', montant: 180, notes: 'Ambiance chaleureuse, musique dynamique, durée 30s' },
  { id: 2, titre: 'Clip TikTok restaurant Bella Vita', type: 'TikTok', client: 'La Bella Vita', statut: 'revision', fichiers: 2, revisions: 1, deadline: '2026-04-20', montant: 150, notes: 'Ajouter sous-titres et logo en fin' },
  { id: 3, titre: 'Vidéo YouTube corporate BTP', type: 'YouTube', client: 'Bernard BTP', statut: 'a_faire', fichiers: 0, revisions: 0, deadline: '2026-04-28', montant: 420, notes: 'Format 3 min, voix off fournie' },
  { id: 4, titre: 'Stories Instagram coiffeur', type: 'Stories', client: 'Coiffure Marseille', statut: 'livre', fichiers: 4, revisions: 0, deadline: '2026-04-08', montant: 120, notes: '' },
  { id: 5, titre: 'Montage témoignage client', type: 'YouTube', client: 'Freample', statut: 'livre', fichiers: 1, revisions: 1, deadline: '2026-03-25', montant: 200, notes: '' },
];

const AVIS = [
  { client: 'Freample', note: 5, commentaire: 'Travail excellent, livré dans les temps et retours pris en compte.', date: '2026-03-26' },
  { client: 'Coiffure Marseille', note: 5, commentaire: 'Super monteur, très créatif. On recommande !', date: '2026-04-08' },
  { client: 'Mode Studio', note: 4, commentaire: 'Bon travail, quelques retours mais bien gérés.', date: '2026-03-12' },
];

const GAINS_SEMAINE = [
  { jour:'Lun', montant:0 },{ jour:'Mar', montant:120 },{ jour:'Mer', montant:0 },
  { jour:'Jeu', montant:200 },{ jour:'Ven', montant:0 },{ jour:'Sam', montant:180 },
  { jour:'Dim', montant:0 },
];

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD, flex:1, minWidth:140 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#636363', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:accent||'#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#636363', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ statut }) {
  const s = STATUS[statut]; if(!s) return null;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

const TAB_MAP = { projets:'projets', gains:'gains', messages:'messages', avis:'avis', profil:'profil' };

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
          <div style={{ fontSize:14, color:'#636363', marginTop:2 }}>Bonjour, {user?.nom || 'Monteur'}</div>
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
                  <div style={{ fontSize:12, color:'#636363' }}>{p.type} · {p.fichiers} fichier{p.fichiers>1?'s':''} · {p.revisions} révision{p.revisions>1?'s':''}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <Badge statut={p.statut} />
                  <div style={{ fontSize:11, color: daysLeft<=2?'#DC2626':'#636363', fontWeight:600, marginTop:4 }}>
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
            <div style={{ fontSize:13, color:'#636363', marginBottom:4 }}>{p.client} · {p.type} · Deadline: {p.deadline}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:12, color:'#636363' }}>📁 {p.fichiers} fichiers · 🔄 {p.revisions} révisions</div>
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
                <div style={{ fontSize:11, color:'#636363', fontWeight:600 }}>{g.jour}</div>
              </div>
            ))}
          </div>
        </div>
      </div>)}

      {/* MESSAGES */}
      {tab==='messages'&&(<div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Messages par projet</div>
        {projets.filter(p=>['en_cours','revision','a_faire'].includes(p.statut)).map(p=>(
          <div key={p.id} style={{ ...CARD, marginBottom:12, padding:'16px 20px' }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>{p.titre}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12, maxHeight:200, overflowY:'auto' }}>
              {[
                {from:p.client, msg:'Salut ! Voici le brief détaillé pour le projet.', time:'10:00', isMe:false},
                {from:'Vous', msg:'Parfait, je regarde ça et je commence !', time:'10:15', isMe:true},
                {from:p.client, msg:'Tu penses livrer quand ?', time:'14:00', isMe:false},
                {from:'Vous', msg:`Je vise le ${p.deadline}, comme prévu 👍`, time:'14:05', isMe:true},
              ].map((m,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:m.isMe?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'70%', padding:'8px 12px', borderRadius:12, background:m.isMe?V:'#F3F3F3', color:m.isMe?'#fff':'#1C1C1E', fontSize:13, lineHeight:1.4 }}>
                    <div style={{ fontSize:11, fontWeight:600, marginBottom:2, opacity:0.7 }}>{m.from} · {m.time}</div>
                    {m.msg}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input placeholder="Écrire un message..." style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none' }} />
              <button onClick={()=>showToast('Message envoyé')} style={{ ...BTN, padding:'10px 16px' }}>Envoyer</button>
            </div>
          </div>
        ))}
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
              <div style={{ fontSize:12, color:'#636363', marginTop:4 }}>{a.date}</div>
            </div>
          ))}
        </div>
      </div>)}

      {/* PROFIL */}
      {tab==='profil'&&(<div>
        <div style={{ ...CARD, textAlign:'center', padding:32 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#EDE9FE', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:V }}>{(user?.nom||'M')[0]}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{user?.nom || 'Monteur'}</div>
          <div style={{ fontSize:14, color:'#636363', marginTop:4 }}>{user?.email}</div>
          <div style={{ fontSize:13, color:'#636363', marginTop:8 }}>🎬 Monteur vidéo · TikTok, YouTube, Reels</div>
          <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:24 }}>
            <div><div style={{ fontSize:22, fontWeight:800, color:V }}>{projets.length}</div><div style={{ fontSize:12, color:'#636363' }}>Projets</div></div>
            <div><div style={{ fontSize:22, fontWeight:800, color:'#F59E0B' }}>{noteAvg}</div><div style={{ fontSize:12, color:'#636363' }}>Note</div></div>
            <div><div style={{ fontSize:22, fontWeight:800 }}>{gainsTotal}€</div><div style={{ fontSize:12, color:'#636363' }}>Gains livrés</div></div>
          </div>
        </div>
      </div>)}

      {/* MODAL projet */}
      {modalProjet&&(
        <div style={OVL} onClick={()=>setModalProjet(null)}>
          <div style={BOX} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:2 }}>{modalProjet.titre}</div>
            <div style={{ color:'#636363', fontSize:14, marginBottom:16 }}>{modalProjet.type} · <Badge statut={modalProjet.statut} /></div>
            <div style={{ ...CARD, background:'#FAFAFA', marginBottom:16 }}>
              {[{l:'Client',v:modalProjet.client},{l:'Fichiers à livrer',v:`${modalProjet.fichiers} fichier(s)`},{l:'Révisions',v:modalProjet.revisions},{l:'Deadline',v:modalProjet.deadline},{l:'Rémunération',v:`${modalProjet.montant}€`}].map(r=>(
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#636363' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
                </div>
              ))}
            </div>
            {modalProjet.notes&&<div style={{ padding:'12px 14px', background:'#EDE9FE', borderRadius:10, marginBottom:16, fontSize:13, color:'#5B21B6' }}>📝 Brief : {modalProjet.notes}</div>}
            {/* Fichiers */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Fichiers livrés</div>
              {['en_cours','revision','livre'].includes(modalProjet.statut) ? (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {(modalProjet.statut==='livre'?[{nom:'montage_v2_final.mp4',taille:'52 Mo',date:'2026-04-05'},{nom:'montage_v1.mp4',taille:'48 Mo',date:'2026-04-03'}]:[]).map((f,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#F5F3FF', borderRadius:8, fontSize:13 }}>
                      <span>📄</span><span style={{ flex:1, fontWeight:600 }}>{f.nom}</span><span style={{ color:'#636363', fontSize:12 }}>{f.taille} · {f.date}</span>
                    </div>
                  ))}
                  <button onClick={()=>showToast('Fichier ajouté')} style={{ ...GHOST, padding:'10px', fontSize:13, marginTop:4 }}>📎 Ajouter un fichier</button>
                </div>
              ) : <div style={{ fontSize:13, color:'#636363' }}>Aucun fichier pour le moment</div>}
            </div>
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
