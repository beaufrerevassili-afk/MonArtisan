import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const V = '#8B5CF6';
const VBG = '#F5F3FF';
const VS = '#EDE9FE';

const CARD = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E9E5F5', boxShadow:'0 1px 4px rgba(0,0,0,.04)' };
const HDR = { fontSize:13, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN = { background:V, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const GHOST = { background:'transparent', color:'#6B7280', border:'1px solid #E9E5F5', borderRadius:10, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const OVL = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:560, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

const STATUS = {
  demande:      { label:'Demande envoyée', bg:'#FEF3C7', border:'#FDE047', color:'#713F12' },
  devis_recu:   { label:'Devis reçu',     bg:'#DBEAFE', border:'#93C5FD', color:'#1D4ED8' },
  paye:         { label:'Payé — En attente', bg:'#F5F3FF', border:'#C4B5FD', color:'#5B21B6' },
  en_cours:     { label:'En cours',        bg:'#FFF7ED', border:'#FED7AA', color:'#C2410C' },
  revision:     { label:'En révision',     bg:'#FEFCE8', border:'#FDE047', color:'#713F12' },
  livre:        { label:'Livré — À valider', bg:'#D1FAE5', border:'#86EFAC', color:'#065F46' },
  valide:       { label:'Validé ✓',        bg:'#F0FDF4', border:'#5EEAD4', color:'#0F766E' },
  retouche:     { label:'Retouches demandées', bg:'#FEE2E2', border:'#FCA5A5', color:'#DC2626' },
};

// Projets chargés depuis l'API — vide au départ
const MES_PROJETS = [];

function Badge({ statut }) {
  const s = STATUS[statut]; if(!s) return null;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
}

export default function ComClient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projets, setProjets] = useState(MES_PROJETS);
  const [modalProjet, setModalProjet] = useState(null);
  const [modalDevis, setModalDevis] = useState(null);
  const [modalRetouche, setModalRetouche] = useState(null);
  const [retoucheMsg, setRetoucheMsg] = useState('');
  const [retoucheFichiers, setRetoucheFichiers] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3500); };

  // Charger les vrais projets du client depuis l'API
  useEffect(() => {
    if (!user?.email) return;
    api.get('/com/projets').then(r => {
      if (r.data?.projets?.length) {
        // Filtrer par email du client connecté
        const miens = r.data.projets.filter(p => p.client_email === user.email);
        if (miens.length) {
          setProjets(miens.map(p => {
            const qte = Number(p.quantite) || 1;
            const fait = Number(p.fichiers_faits) || 0;
            const avancement = (p.statut === 'livre' || p.statut === 'paye') ? 100
              : (p.statut === 'en_cours' || p.statut === 'revision') ? (qte > 0 ? Math.round((fait/qte)*100) : 0)
              : 0;
            return {
              id: p.id, titre: `${p.type}${p.format ? ' · '+p.format : ''}`,
              responsable: 'Équipe Freample', type: p.type,
              statut: p.statut === 'brief_recu' ? 'demande' : p.statut === 'devis_envoye' ? 'devis_recu' : p.statut,
              montant: Number(p.montant_ht) || 0,
              dateCommande: p.created_at?.split('T')[0],
              dateLivraison: p.deadline,
              avancement, quantite: qte, fichiersFaits: fait,
              devis: p.devis_ref, fichiers:[], messages:[],
            };
          }));
        }
      }
    }).catch(() => {});
  }, [user]);

  // Auto-refresh toutes les 30s pour voir les mises à jour du monteur
  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(() => {
      api.get('/com/projets').then(r => {
        if (r.data?.projets) {
          const miens = r.data.projets.filter(p => p.client_email === user.email);
          if (miens.length) {
            setProjets(prev => miens.map(p => {
              const qte = Number(p.quantite) || 1;
              const fait = Number(p.fichiers_faits) || 0;
              const avancement = (p.statut === 'livre' || p.statut === 'paye') ? 100 : (qte > 0 ? Math.round((fait/qte)*100) : 0);
              const existing = prev.find(x => x.id === p.id);
              return {
                id:p.id, titre:`${p.type}${p.format?' · '+p.format:''}`,
                responsable:'Équipe Freample', type:p.type,
                statut: p.statut==='brief_recu'?'demande':p.statut==='devis_envoye'?'devis_recu':p.statut,
                montant:Number(p.montant_ht)||0, dateCommande:p.created_at?.split('T')[0],
                dateLivraison:p.deadline, avancement, quantite:qte, fichiersFaits:fait,
                devis:p.devis_ref, fichiers:existing?.fichiers||[], messages:existing?.messages||[],
              };
            }));
          }
        }
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const actifs = projets.filter(p=>!['valide'].includes(p.statut));
  const termines = projets.filter(p=>p.statut==='valide');
  const totalDepense = projets.filter(p=>['valide','livre','en_cours','paye'].includes(p.statut)).reduce((s,p)=>s+p.montant,0);

  const validerProjet = (id) => {
    setProjets(prev=>prev.map(p=>p.id===id?{...p,statut:'valide',fichiers:p.fichiers.map(f=>({...f,valide:true}))}:p));
    showToast('Projet validé ! Paiement libéré !');
    setModalProjet(null);
  };

  const validerFichier = (projetId, fichierId) => {
    setProjets(prev=>prev.map(p=>p.id===projetId?{...p,fichiers:p.fichiers.map(f=>f.id===fichierId?{...f,valide:true}:f)}:p));
  };

  const demanderRetouche = () => {
    if(!retoucheMsg) return;
    setProjets(prev=>prev.map(p=>p.id===modalRetouche.id?{
      ...p, statut:'retouche',
      messages:[...p.messages, { from:'Vous', msg:`🔄 Retouche demandée : ${retoucheMsg}${retoucheFichiers.length>0?' (fichiers: '+retoucheFichiers.join(', ')+')':''}`, time:new Date().toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}), isMe:true }]
    }:p));
    showToast('Demande de retouche envoyée');
    setModalRetouche(null); setRetoucheMsg(''); setRetoucheFichiers([]);
  };

  const accepterDevis = (projetId) => {
    setProjets(prev=>prev.map(p=>p.id===projetId?{...p,statut:'paye'}:p));
    showToast('Devis accepté ! Paiement sécurisé sur Freample. Mission créée.');
    setModalDevis(null);
  };

  const envoyerMessage = (projetId) => {
    if(!chatMsg.trim()) return;
    setProjets(prev=>prev.map(p=>p.id===projetId?{
      ...p, messages:[...p.messages, { from:'Vous', msg:chatMsg, time:new Date().toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}), isMe:true }]
    }:p));
    setChatMsg('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <button onClick={()=>navigate('/client/dashboard')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#636363', fontFamily:'inherit', marginBottom:8, display:'flex', alignItems:'center', gap:4 }}>← Tableau de bord</button>
          <h1 style={{ margin:0, fontSize:'1.5rem' }}>🎬 Mes projets Freample Com</h1>
        </div>
        <button onClick={()=>navigate('/com#demande')} style={BTN}>+ Nouvelle demande</button>
      </div>

      {/* KPIs */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <div style={{ ...CARD, flex:1, minWidth:140 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#636363', textTransform:'uppercase', marginBottom:6 }}>Projets actifs</div>
          <div style={{ fontSize:26, fontWeight:800, color:V }}>{actifs.length}</div>
        </div>
        <div style={{ ...CARD, flex:1, minWidth:140 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#636363', textTransform:'uppercase', marginBottom:6 }}>Terminés</div>
          <div style={{ fontSize:26, fontWeight:800, color:'#059669' }}>{termines.length}</div>
        </div>
        <div style={{ ...CARD, flex:1, minWidth:140 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#636363', textTransform:'uppercase', marginBottom:6 }}>Total dépensé</div>
          <div style={{ fontSize:26, fontWeight:800, color:'#1C1C1E' }}>{totalDepense}€</div>
        </div>
      </div>

      {/* Projets actifs */}
      {actifs.length > 0 && (<div style={{ marginBottom:32 }}>
        <div style={HDR}>Projets en cours</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {actifs.map(p => (
            <div key={p.id} onClick={()=>setModalProjet(p)} style={{ ...CARD, cursor:'pointer', padding:'18px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{p.titre}</div>
                  <div style={{ fontSize:13, color:'#636363' }}>{p.type} · {p.responsable||'Prise en charge en cours'} · {p.montant}€</div>
                </div>
                <Badge statut={p.statut} />
              </div>
              {/* Barre d'avancement */}
              {p.avancement > 0 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#636363', marginBottom:4 }}>
                    <span>{p.fichiersFaits||0}/{p.quantite||1} fichier{(p.quantite||1)>1?'s':''} terminé{(p.fichiersFaits||0)>1?'s':''}</span>
                    <span style={{ fontWeight:700, color: p.avancement >= 100 ? '#059669' : V }}>{p.avancement}%</span>
                  </div>
                  <div style={{ background:'#F3F3F3', borderRadius:4, height:8 }}>
                    <div style={{ background: p.avancement >= 100 ? '#059669' : V, borderRadius:4, height:8, width:`${p.avancement}%`, transition:'width .3s' }} />
                  </div>
                </div>
              )}
              {p.statut === 'demande' && (
                <div style={{ marginTop:8, padding:'8px 12px', background:'#FEF3C7', borderRadius:8, fontSize:13, color:'#713F12', fontWeight:600 }}>
                  ⏳ Votre demande est en cours d'analyse — réponse sous 24h
                </div>
              )}
              {p.statut === 'devis_recu' && (
                <div style={{ marginTop:8, padding:'8px 12px', background:'#DBEAFE', borderRadius:8, fontSize:13, color:'#1D4ED8', fontWeight:600 }}>
                  📝 Devis reçu — {p.montant}€ · Acceptez ou contactez-nous pour discuter
                </div>
              )}
              {p.statut === 'en_cours' && p.avancement < 100 && (
                <div style={{ marginTop:8, padding:'8px 12px', background:VBG, borderRadius:8, fontSize:13, color:'#5B21B6', fontWeight:600 }}>
                  🎬 Notre équipe travaille sur votre projet
                </div>
              )}
              {p.statut === 'livre' && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'#D1FAE5', borderRadius:8, fontSize:13, color:'#065F46', fontWeight:600 }}>
                  📦 {p.fichiers.length} fichier{p.fichiers.length>1?'s':''} livré{p.fichiers.length>1?'s':''} — Cliquez pour valider ou demander des retouches
                </div>
              )}
            </div>
          ))}
        </div>
      </div>)}

      {/* Projets terminés */}
      {termines.length > 0 && (<div>
        <div style={HDR}>Projets terminés</div>
        <div style={{ ...CARD, padding:0, overflow:'hidden' }}>
          {termines.map((p,i)=>(
            <div key={p.id} onClick={()=>setModalProjet(p)} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:i<termines.length-1?'1px solid #F0F0F0':'none', cursor:'pointer' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{p.titre}</div>
                <div style={{ fontSize:12, color:'#636363' }}>{p.type} · {p.responsable} · Livré le {p.dateLivraison}</div>
              </div>
              <div style={{ fontWeight:800, color:'#059669' }}>{p.montant}€</div>
              <Badge statut={p.statut} />
            </div>
          ))}
        </div>
      </div>)}

      {/* ══════════ MODAL PROJET DETAIL ══════════ */}
      {modalProjet && (
        <div style={OVL} onClick={()=>{setModalProjet(null);setChatMsg('');}}>
          <div style={{...BOX,maxWidth:640}} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:18 }}>{modalProjet.titre}</div>
                <div style={{ color:'#636363', fontSize:14, marginTop:2 }}>{modalProjet.type} · {modalProjet.responsable||'Prise en charge en cours'}</div>
              </div>
              <Badge statut={modalProjet.statut} />
            </div>

            {/* Info */}
            <div style={{ ...CARD, background:'#FAFAFA', marginBottom:16 }}>
              {[{l:'Montant',v:`${modalProjet.montant}€`},{l:'Commandé le',v:modalProjet.dateCommande},{l:'Livraison',v:modalProjet.dateLivraison||'En attente'},{l:'Avancement',v:`${modalProjet.avancement}%`},{l:'Devis',v:modalProjet.devis||'—'}].map(r=>(
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#636363' }}>{r.l}</span><span style={{ fontWeight:600 }}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Fichiers livrés */}
            {modalProjet.fichiers.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>📦 Fichiers livrés</div>
                {modalProjet.fichiers.map(f=>(
                  <div key={f.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:f.valide?'#F0FDF4':VBG, borderRadius:8, marginBottom:6, border:`1px solid ${f.valide?'#86EFAC':'#E9E5F5'}` }}>
                    <span style={{ fontSize:16 }}>{f.nom.endsWith('.mp4')?'🎬':f.nom.endsWith('.pdf')?'📄':'🎨'}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{f.nom}</div>
                      <div style={{ fontSize:11, color:'#636363' }}>{f.taille} · {f.date}</div>
                    </div>
                    {f.valide===true && <span style={{ fontSize:12, fontWeight:700, color:'#059669' }}>✓ Validé</span>}
                    {f.valide===null && modalProjet.statut==='livre' && (
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>validerFichier(modalProjet.id,f.id)} style={{ padding:'5px 10px', background:'#D1FAE5', border:'1px solid #86EFAC', borderRadius:8, color:'#065F46', fontSize:12, fontWeight:600, cursor:'pointer' }}>✓ OK</button>
                        <button onClick={()=>{setModalRetouche(modalProjet);setRetoucheFichiers([f.nom]);}} style={{ padding:'5px 10px', background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:8, color:'#DC2626', fontSize:12, fontWeight:600, cursor:'pointer' }}>Retouche</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions selon statut */}
            {modalProjet.statut==='livre' && (
              <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                <button onClick={()=>validerProjet(modalProjet.id)} style={{ ...BTN, flex:1, padding:'12px', background:'#059669' }}>✓ Tout valider — Libérer le paiement</button>
                <button onClick={()=>{setModalRetouche(modalProjet);setRetoucheFichiers([]);}} style={{ ...GHOST, flex:1, padding:'12px', color:'#DC2626', borderColor:'#FCA5A5' }}>🔄 Demander des retouches</button>
              </div>
            )}

            {modalProjet.statut==='devis_recu' && (
              <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                <button onClick={()=>accepterDevis(modalProjet.id)} style={{ ...BTN, flex:1, padding:'12px' }}>✓ Accepter le devis et payer</button>
                <button style={{ ...GHOST, flex:1, padding:'12px' }}>💬 Discuter le prix</button>
              </div>
            )}

            {/* Messagerie */}
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#636363', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>💬 Messages</div>
              <div style={{ maxHeight:200, overflowY:'auto', marginBottom:10 }}>
                {(projets.find(p=>p.id===modalProjet.id)?.messages||[]).length === 0 && (
                  <div style={{ color:'#636363', fontSize:13, padding:16, textAlign:'center' }}>Aucun message. Échangez avec Freample Com !</div>
                )}
                {(projets.find(p=>p.id===modalProjet.id)?.messages||[]).map((m,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:m.isMe?'flex-end':'flex-start', marginBottom:6 }}>
                    <div style={{ maxWidth:'75%', padding:'8px 12px', borderRadius:12, background:m.isMe?V:'#F3F3F3', color:m.isMe?'#fff':'#1C1C1E', fontSize:13, lineHeight:1.4 }}>
                      <div style={{ fontSize:11, fontWeight:600, marginBottom:2, opacity:0.7 }}>{m.from} · {m.time}</div>
                      {m.msg}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){envoyerMessage(modalProjet.id);}}} placeholder="Écrire un message..." style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none' }} />
                <button onClick={()=>envoyerMessage(modalProjet.id)} style={{ ...BTN, padding:'10px 16px' }}>Envoyer</button>
              </div>
            </div>

            <button onClick={()=>{setModalProjet(null);setChatMsg('');}} style={{ ...GHOST, width:'100%', padding:'11px', marginTop:16 }}>Fermer</button>
          </div>
        </div>
      )}

      {/* ══════════ MODAL RETOUCHE ══════════ */}
      {modalRetouche && (
        <div style={OVL} onClick={()=>setModalRetouche(null)}>
          <div style={BOX} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Demander des retouches</div>
            <div style={{ color:'#636363', fontSize:14, marginBottom:20 }}>{modalRetouche.titre}</div>
            {/* Sélection fichiers */}
            {modalRetouche.fichiers.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#555', marginBottom:8 }}>Sur quel(s) fichier(s) ?</div>
                {modalRetouche.fichiers.filter(f=>!f.valide).map(f=>(
                  <label key={f.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:retoucheFichiers.includes(f.nom)?'#FEE2E2':'#FAFAFA', borderRadius:8, marginBottom:4, cursor:'pointer', border:`1px solid ${retoucheFichiers.includes(f.nom)?'#FCA5A5':'#F0F0F0'}` }}>
                    <input type="checkbox" checked={retoucheFichiers.includes(f.nom)} onChange={()=>setRetoucheFichiers(prev=>prev.includes(f.nom)?prev.filter(x=>x!==f.nom):[...prev,f.nom])} style={{ accentColor:'#DC2626' }} />
                    <span style={{ fontSize:13 }}>{f.nom}</span>
                  </label>
                ))}
              </div>
            )}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#555', display:'block', marginBottom:6 }}>Qu'est-ce que vous souhaitez modifier ? *</label>
              <textarea value={retoucheMsg} onChange={e=>setRetoucheMsg(e.target.value)} placeholder="Ex: Sur la vidéo 2, l'intro est trop longue. Je voudrais des sous-titres plus gros sur la vidéo 4..." rows={4} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #E9E5F5', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={demanderRetouche} style={{ ...BTN, flex:1, padding:'12px', background:'#DC2626' }}>🔄 Envoyer la demande de retouche</button>
              <button onClick={()=>setModalRetouche(null)} style={{ ...GHOST, padding:'12px' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast&&<div style={{ position:'fixed', top:24, right:24, background:'#1C1C1E', color:'#fff', padding:'12px 20px', borderRadius:12, fontWeight:600, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,.25)', zIndex:2000, maxWidth:360 }}>{toast}</div>}
    </div>
  );
}
