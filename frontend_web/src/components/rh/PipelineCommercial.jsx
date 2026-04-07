import React, { useState, useEffect } from 'react';
import DS from '../../design/ds';
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
  { id:2, client:'SCI Horizon', titre:'Installation électrique', montant:5800, etape:'facture', date:'2026-03-25', relance:'2026-04-10' },
  { id:3, client:'M. Martin', titre:'Isolation toiture', montant:7200, etape:'devis_envoye', date:'2026-04-03', relance:'2026-04-10' },
  { id:4, client:'Syndic Voltaire', titre:'Plomberie chauffe-eau', montant:2200, etape:'prospect', date:'2026-04-05', relance:null },
  { id:5, client:'M. Petit', titre:'Peinture appartement T3', montant:3800, etape:'paye', date:'2026-03-15', relance:null },
  { id:6, client:'Mme Leroy', titre:'Salle de bain complète', montant:12400, etape:'devis_envoye', date:'2026-04-02', relance:'2026-04-09' },
  { id:7, client:'M. Chen', titre:'Terrasse extérieure', montant:6500, etape:'prospect', date:'2026-04-06', relance:null },
  { id:8, client:'SCI Les Pins', titre:'Ravalement façade', montant:18000, etape:'devis_accepte', date:'2026-03-28', relance:null },
];

const STORAGE = 'freample_pipeline';
function load() { try { const d=localStorage.getItem(STORAGE); return d?JSON.parse(d):DEMO; } catch { return DEMO; } }

export default function PipelineCommercial() {
  const [affaires, setAffaires] = useState(load);
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(affaires)); }, [affaires]);
  // Tenter de charger depuis l'API
  useEffect(() => { api.get('/patron/pipeline').then(({data})=>{ if(data.affaires?.length) setAffaires(data.affaires); }).catch(()=>{}); }, []);

  const avancer = (id) => {
    setAffaires(prev => prev.map(a => {
      if (a.id !== id) return a;
      const idx = ETAPES.findIndex(e => e.id === a.etape);
      if (idx < ETAPES.length - 1) return { ...a, etape: ETAPES[idx + 1].id };
      return a;
    }));
  };

  const genererFacture = (id) => {
    setAffaires(prev => prev.map(a => a.id === id ? { ...a, etape: 'facture' } : a));
  };

  const totalParEtape = ETAPES.map(e => ({
    ...e,
    items: affaires.filter(a => a.etape === e.id),
    total: affaires.filter(a => a.etape === e.id).reduce((s, a) => s + a.montant, 0),
  }));

  const caTotal = affaires.reduce((s, a) => s + a.montant, 0);
  const caPaye = affaires.filter(a => a.etape === 'paye').reduce((s, a) => s + a.montant, 0);
  const caEnCours = caTotal - caPaye;
  const tauxConversion = affaires.length > 0 ? Math.round(affaires.filter(a => ['facture', 'paye'].includes(a.etape)).length / affaires.length * 100) : 0;

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
              <div key={a.id} style={{ ...CARD, padding: 10, marginBottom: 6, borderLeft: `3px solid ${col.color}`, cursor: 'pointer' }} onClick={() => avancer(a.id)}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{a.client}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{a.titre}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: col.color }}>{a.montant.toLocaleString()}€</span>
                  {a.etape === 'devis_accepte' && <span onClick={e => { e.stopPropagation(); genererFacture(a.id); }} style={{ fontSize: 9, padding: '2px 6px', background: '#16A34A', color: '#fff', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>→ Facturer</span>}
                </div>
                {a.relance && <div style={{ fontSize: 9, color: '#D97706', marginTop: 3 }}>Relance : {a.relance}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>Cliquez sur une affaire pour la faire avancer · "Facturer" convertit le devis en facture automatiquement</div>
    </div>
  );
}
