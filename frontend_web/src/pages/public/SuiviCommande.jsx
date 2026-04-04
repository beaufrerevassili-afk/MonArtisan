import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import PublicNavbar from '../../components/public/PublicNavbar';

const V = '#8B5CF6';

const STATUS_STEPS = [
  { key:'brief_recu',    label:'Demande reçue',   icon:'📝' },
  { key:'devis_envoye',  label:'Devis envoyé',    icon:'📄' },
  { key:'en_cours',      label:'En production',   icon:'🎬' },
  { key:'livre',         label:'Livré',           icon:'📦' },
  { key:'paye',          label:'Terminé',         icon:'✅' },
];

export default function SuiviCommande() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = () => {
    api.get(`/com/suivi/${token}`).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(e => {
      setError('Commande introuvable. Vérifiez votre lien.');
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [token]);

  // Auto-refresh toutes les 30s
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const currentStepIdx = data ? STATUS_STEPS.findIndex(s => s.key === data.statut) : -1;

  return (
    <div style={{ minHeight:'100vh', background:'#F7F7F7', fontFamily:"Inter,-apple-system,'Helvetica Neue',Arial,sans-serif" }}>
      <PublicNavbar />

      <div style={{ maxWidth:600, margin:'0 auto', padding:'40px 24px' }}>

        {loading && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
            <div style={{ fontSize:16, color:'#8B8B8B' }}>Chargement de votre commande...</div>
          </div>
        )}

        {error && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{error}</div>
            <div style={{ fontSize:14, color:'#8B8B8B' }}>Code de suivi : {token}</div>
          </div>
        )}

        {data && (
          <>
            {/* Header */}
            <div style={{ background:'#fff', borderRadius:16, padding:'28px 24px', border:'1px solid #E9E5F5', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:12, fontWeight:600, color:V, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>🎬 Freample Com</div>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#1C1C1E', margin:'0 0 6px', letterSpacing:'-0.02em' }}>{data.titre}</h1>
              <div style={{ fontSize:14, color:'#8B8B8B' }}>Commandé par {data.client}{data.dateCommande ? ` · ${new Date(data.dateCommande).toLocaleDateString('fr-FR')}` : ''}</div>
            </div>

            {/* Statut actuel */}
            <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #E9E5F5', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Statut de votre commande</div>

              {/* Progress steps */}
              <div style={{ display:'flex', marginBottom:20 }}>
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <div key={step.key} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                      {/* Line */}
                      {i > 0 && (
                        <div style={{ position:'absolute', top:16, right:'50%', left:'-50%', height:3, background: i <= currentStepIdx ? V : '#E5E5E5', zIndex:0 }} />
                      )}
                      {/* Circle */}
                      <div style={{
                        width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                        background: isDone ? V : '#F3F3F3', color: isDone ? '#fff' : '#8B8B8B',
                        fontSize:14, fontWeight:700, zIndex:1, position:'relative',
                        border: isCurrent ? `3px solid ${V}40` : 'none',
                        boxShadow: isCurrent ? `0 0 0 6px ${V}15` : 'none',
                      }}>
                        {step.icon}
                      </div>
                      <div style={{ fontSize:11, fontWeight: isCurrent ? 700 : 500, color: isDone ? V : '#8B8B8B', marginTop:6, textAlign:'center' }}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status message */}
              <div style={{
                padding:'14px 18px', borderRadius:10, fontSize:15, fontWeight:600, textAlign:'center',
                background: data.statut === 'livre' ? '#D1FAE5' : data.statut === 'en_cours' ? '#F5F3FF' : data.statut === 'devis_envoye' ? '#DBEAFE' : '#FEF3C7',
                color: data.statut === 'livre' ? '#065F46' : data.statut === 'en_cours' ? '#5B21B6' : data.statut === 'devis_envoye' ? '#1D4ED8' : '#713F12',
              }}>
                {data.statutLabel}
              </div>
            </div>

            {/* Avancement */}
            {data.avancement > 0 && data.statut !== 'brief_recu' && data.statut !== 'devis_envoye' && (
              <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #E9E5F5', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Avancement</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:14, color:'#1C1C1E' }}>{data.fichiersFaits}/{data.quantite} fichier{data.quantite > 1 ? 's' : ''} terminé{data.fichiersFaits > 1 ? 's' : ''}</span>
                  <span style={{ fontSize:16, fontWeight:800, color: data.avancement >= 100 ? '#059669' : V }}>{data.avancement}%</span>
                </div>
                <div style={{ background:'#F0F0F0', borderRadius:6, height:10 }}>
                  <div style={{ background: data.avancement >= 100 ? '#059669' : V, borderRadius:6, height:10, width:`${data.avancement}%`, transition:'width .5s' }} />
                </div>
                {data.avancement >= 100 && data.statut === 'en_cours' && (
                  <div style={{ marginTop:12, fontSize:14, color:'#059669', fontWeight:600, textAlign:'center' }}>
                    🎉 Tous les fichiers sont prêts ! Livraison imminente.
                  </div>
                )}
              </div>
            )}

            {/* Détails */}
            <div style={{ background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #E9E5F5', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#8B8B8B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Détails</div>
              {[
                { l:'Service', v:data.titre },
                { l:'Quantité', v:`${data.quantite} fichier${data.quantite > 1 ? 's' : ''}` },
                data.montant > 0 ? { l:'Montant', v:`${data.montant}€ HT` } : null,
                data.devis ? { l:'Devis', v:data.devis } : null,
                data.deadline ? { l:'Deadline', v:new Date(data.deadline).toLocaleDateString('fr-FR') } : null,
              ].filter(Boolean).map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0F0F0', fontSize:14 }}>
                  <span style={{ color:'#8B8B8B' }}>{r.l}</span>
                  <span style={{ fontWeight:600, color:'#1C1C1E' }}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div style={{ background:'#fff', borderRadius:16, padding:'20px 24px', border:'1px solid #E9E5F5', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:14, color:'#8B8B8B', marginBottom:12 }}>Une question sur votre commande ?</div>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <a href="https://wa.me/33612345678?text=Bonjour, j'ai une question sur ma commande (code: ${token})" target="_blank" rel="noopener noreferrer"
                  style={{ padding:'10px 20px', background:'#25D366', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none' }}>
                  💬 WhatsApp
                </a>
                <a href="mailto:freamplecom@gmail.com?subject=Question commande ${token}"
                  style={{ padding:'10px 20px', background:'#F3F3F3', color:'#1C1C1E', border:'none', borderRadius:10, fontSize:14, fontWeight:600, textDecoration:'none' }}>
                  ✉️ Email
                </a>
              </div>
            </div>

            {/* Auto-refresh indicator */}
            <div style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#8B8B8B' }}>
              🔄 Cette page se met à jour automatiquement
            </div>
          </>
        )}
      </div>
    </div>
  );
}
