import React, { useState, useEffect } from 'react';
import DS from '../../design/luxe';
import api from '../../services/api';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:16 };
const BTN = { padding:'8px 16px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };

const ETAPES = [
  { id:'prospect', label:'Prospect', color:'#8B5CF6', icon:'🎯' },
  { id:'devis_envoye', label:'Devis envoyé', color:'#D97706', icon:'📤' },
  { id:'devis_accepte', label:'Devis accepté', color:'#2563EB', icon:'✅' },
  { id:'facture', label:'Facturé', color:'#16A34A', icon:'💰' },
  { id:'paye', label:'Payé', color:'#059669', icon:'✓' },
];

const DEMO = [
  { id:1, client:'Mme Dupont', titre:'Rénovation cuisine', montant:8500, etape:'devis_accepte', date:'2026-04-01', relance:null },
  { id:2, client:'Copropriété Les Oliviers', titre:'Installation électrique', montant:5800, etape:'facture', date:'2026-03-25', relance:'2026-04-10' },
  { id:3, client:'M. Martin', titre:'Isolation toiture', montant:7200, etape:'devis_envoye', date:'2026-04-03', relance:'2026-04-10' },
  { id:4, client:'Syndic Voltaire', titre:'Plomberie chauffe-eau', montant:2200, etape:'prospect', date:'2026-04-05', relance:null },
  { id:5, client:'M. Petit', titre:'Peinture appartement T3', montant:3800, etape:'paye', date:'2026-03-15', relance:null },
  { id:6, client:'Mme Leroy', titre:'Salle de bain complète', montant:12400, etape:'devis_envoye', date:'2026-04-02', relance:'2026-04-09' },
  { id:7, client:'M. Chen', titre:'Terrasse extérieure', montant:6500, etape:'prospect', date:'2026-04-06', relance:null },
  { id:8, client:'Résidence du Parc', titre:'Ravalement façade', montant:18000, etape:'devis_accepte', date:'2026-03-28', relance:null },
];

const STORAGE = 'freample_pipeline';
function load() { try { const d=localStorage.getItem(STORAGE); return d?JSON.parse(d):DEMO; } catch { return DEMO; } }

export default function PipelineCommercial() {
  const [affaires, setAffaires] = useState(load);
  const [selected, setSelected] = useState(null);
  const [showArchives, setShowArchives] = useState(false);
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(affaires)); }, [affaires]);
  useEffect(() => { api.get('/patron/pipeline').then(({data})=>{ if(data.affaires?.length) setAffaires(data.affaires); }).catch(()=>{}); }, []);

  const avancer = (id) => {
    setAffaires(prev => prev.map(a => {
      if (a.id !== id) return a;
      const idx = ETAPES.findIndex(e => e.id === a.etape);
      if (idx < ETAPES.length - 1) return { ...a, etape: ETAPES[idx + 1].id };
      return a;
    }));
    setSelected(prev => {
      if (!prev || prev.id !== id) return prev;
      const idx = ETAPES.findIndex(e => e.id === prev.etape);
      return idx < ETAPES.length - 1 ? { ...prev, etape: ETAPES[idx + 1].id } : prev;
    });
  };

  const supprimer = (id) => {
    setAffaires(prev => prev.filter(a => a.id !== id));
    setSelected(null);
  };

  const archiver = (id) => {
    setAffaires(prev => prev.map(a => a.id === id ? { ...a, archive: true, dateArchive: new Date().toISOString().slice(0, 10) } : a));
    setSelected(null);
  };

  const desarchiver = (id) => {
    setAffaires(prev => prev.map(a => a.id === id ? { ...a, archive: false, dateArchive: null } : a));
  };

  const actives = affaires.filter(a => !a.archive);
  const archives = affaires.filter(a => a.archive);

  const totalParEtape = ETAPES.map(e => ({
    ...e,
    items: actives.filter(a => a.etape === e.id),
    total: actives.filter(a => a.etape === e.id).reduce((s, a) => s + a.montant, 0),
  }));

  const caTotal = actives.reduce((s, a) => s + a.montant, 0);
  const caPaye = actives.filter(a => a.etape === 'paye').reduce((s, a) => s + a.montant, 0);
  const caEnCours = caTotal - caPaye;
  const tauxConversion = affaires.length > 0 ? Math.round(affaires.filter(a => ['facture', 'paye'].includes(a.etape)).length / affaires.length * 100) : 0;

  const sel = selected ? affaires.find(a => a.id === selected.id) || selected : null;
  const selEtape = sel ? ETAPES.find(e => e.id === sel.etape) : null;
  const selIdx = sel ? ETAPES.findIndex(e => e.id === sel.etape) : -1;
  const canAvancer = selIdx >= 0 && selIdx < ETAPES.length - 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Pipeline commercial</h2>
        <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
          <span style={{ padding: '4px 12px', background: '#F0FDF4', border: '1px solid #16A34A25', borderRadius: 8 }}>CA signé : <strong>{caEnCours.toLocaleString()}€</strong></span>
          <span style={{ padding: '4px 12px', background: '#EFF6FF', border: '1px solid #2563EB25', borderRadius: 8 }}>Taux conv. : <strong>{tauxConversion}%</strong></span>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ETAPES.length}, 1fr)`, gap: 8, marginBottom: 20 }}>
        {totalParEtape.map(col => (
          <div key={col.id} style={{ background: '#F8F7F4', borderRadius: 12, padding: 10, minHeight: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{col.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: col.color }}>{col.label}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#555', background: '#fff', padding: '2px 6px', borderRadius: 6 }}>{col.items.length}</span>
            </div>
            <div style={{ fontSize: 10, color: col.color, fontWeight: 600, marginBottom: 8 }}>{col.total.toLocaleString()}€</div>
            {col.items.map(a => (
              <div key={a.id} onClick={() => setSelected(a)}
                style={{ ...CARD, padding: 10, marginBottom: 6, borderLeft: `3px solid ${col.color}`, cursor: 'pointer', outline: sel?.id === a.id ? `2px solid ${col.color}` : 'none', transition: 'box-shadow .15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{a.client}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{a.titre}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: col.color }}>{a.montant.toLocaleString()}€</span>
                </div>
                {a.relance && <div style={{ fontSize: 9, color: '#D97706', marginTop: 3 }}>Relance : {a.relance}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Panel récap affaire */}
      {sel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            {/* Header coloré */}
            <div style={{ background: selEtape?.color || '#333', borderRadius: '16px 16px 0 0', padding: '20px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{selEtape?.icon} {selEtape?.label}</div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{sel.client}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>{sel.titre}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            {/* Contenu */}
            <div style={{ padding: '20px 24px' }}>
              {/* Infos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['Montant', `${sel.montant.toLocaleString()} €`],
                  ['Date création', sel.date],
                  ['Étape', selEtape?.label],
                  ['Relance', sel.relance || 'Aucune'],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#F8F7F4', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Progression visuelle */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {ETAPES.map((e, i) => (
                  <div key={e.id} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: 4, borderRadius: 2, background: i <= selIdx ? selEtape.color : '#E5E5EA', transition: 'background .3s' }} />
                    <span style={{ fontSize: 8, fontWeight: 600, color: i <= selIdx ? selEtape.color : '#8E8E93', marginTop: 2, display: 'block' }}>{e.label}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {canAvancer && (
                  <button onClick={() => avancer(sel.id)}
                    style={{ padding: '12px 16px', background: ETAPES[selIdx + 1].color, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {ETAPES[selIdx + 1].icon} Avancer vers "{ETAPES[selIdx + 1].label}"
                  </button>
                )}
                {sel.etape === 'paye' && <>
                  <div style={{ padding: '12px 16px', background: '#F0FDF4', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#16A34A' }}>
                    ✓ Dossier terminé — payé
                  </div>
                  <button onClick={() => archiver(sel.id)}
                    style={{ padding: '10px 16px', background: '#EFF6FF', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    📦 Archiver ce dossier
                  </button>
                </>}
                <button onClick={() => setSelected(null)}
                  style={{ padding: '10px 16px', background: '#F2F2F7', color: '#636363', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Fermer
                </button>
                <button onClick={() => { if (window.confirm(`Supprimer le dossier "${sel.client} — ${sel.titre}" ?`)) supprimer(sel.id); }}
                  style={{ padding: '10px 16px', background: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Supprimer ce dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archives */}
      {archives.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setShowArchives(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#636363', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
            📦 Archives ({archives.length} dossier{archives.length > 1 ? 's' : ''} · {archives.reduce((s, a) => s + a.montant, 0).toLocaleString()} €)
            <span style={{ fontSize: 10 }}>{showArchives ? '▼' : '▶'}</span>
          </button>
          {showArchives && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {archives.map(a => {
                const etape = ETAPES.find(e => e.id === a.etape);
                return (
                  <div key={a.id} style={{ ...CARD, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{a.client}</span>
                      <span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>{a.titre}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: etape?.color, marginLeft: 8 }}>{a.montant.toLocaleString()} €</span>
                      {a.dateArchive && <span style={{ fontSize: 10, color: '#888', marginLeft: 8 }}>Archivé le {a.dateArchive}</span>}
                    </div>
                    <button onClick={() => desarchiver(a.id)}
                      style={{ padding: '4px 10px', background: '#F2F2F7', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#636363' }}>
                      Désarchiver
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>Cliquez sur une affaire pour voir le récapitulatif</div>
    </div>
  );
}
