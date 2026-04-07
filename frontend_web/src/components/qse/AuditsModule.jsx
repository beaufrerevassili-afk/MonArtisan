import React, { useState } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'9px 11px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:12, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:10, fontWeight:600, color:'#555', display:'block', marginBottom:3 };

const MODELES_AUDIT = [
  { id:'chantier', titre:'Audit sécurité chantier', items:['Port des EPI','Balisage/signalisation','État échafaudages','Propreté/rangement','Accès secours dégagé','Extincteurs en place','Affichages obligatoires','Habilitations à jour','Filets de protection','Garde-corps complets','Stockage produits dangereux','Plan de prévention affiché'] },
  { id:'vehicule', titre:'Audit véhicule/matériel', items:['Contrôle technique à jour','Assurance valide','Gilet + triangle','Trousse premiers secours','État pneus','Niveaux (huile, liquide frein)','Feux fonctionnels','Kit anti-pollution'] },
  { id:'hygiene', titre:'Audit hygiène', items:['Point d\'eau disponible','Sanitaires accessibles','Réfectoire/zone repas','Vestiaires','Gestion déchets','Tri sélectif respecté','Produits stockés correctement','Aération suffisante'] },
  { id:'qualite', titre:'Audit qualité travaux', items:['Plans respectés','Matériaux conformes au devis','Finitions soignées','Propreté du chantier','Réserves client traitées','Auto-contrôle réalisé','Photos avant/après','PV de réception préparé'] },
  { id:'environnement', titre:'Audit environnement', items:['Bordereaux déchets (BSDD)','Tri des déchets sur site','Limitation bruit','Protection sols/eaux','Produits dangereux étiquetés','Registre déchets à jour'] },
];

const DEMO = [
  { id:1, modele:'chantier', chantier:'Rénovation Dupont', date:'2026-04-02', auditeur:'Vassili B.', resultats:{0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false,10:true,11:true}, observations:'Échafaudage côté rue : garde-corps manquant. Affichages plan évacuation absents.', score:75, actions:[{desc:'Mise en conformité garde-corps',resp:'Chef chantier',ech:'04/04/2026',fait:true},{desc:'Afficher plans évacuation',resp:'QSE',ech:'04/04/2026',fait:true}] },
  { id:2, modele:'vehicule', chantier:'Flotte — Renault Master', date:'2026-03-28', auditeur:'Vassili B.', resultats:{0:true,1:true,2:true,3:false,4:true,5:true,6:true,7:false}, observations:'Trousse premiers secours périmée. Kit anti-pollution absent.', score:75, actions:[{desc:'Remplacer trousse',resp:'Marc Lambert',ech:'04/01/2026',fait:true},{desc:'Acheter kit anti-pollution',resp:'Direction',ech:'04/15/2026',fait:false}] },
  { id:3, modele:'qualite', chantier:'Bureau Médecin', date:'2026-04-05', auditeur:'Sophie Duval', resultats:{0:true,1:true,2:true,3:true,4:true,5:true,6:false,7:false}, observations:'Photos de suivi non prises. PV réception en cours de rédaction.', score:75, actions:[] },
];

export default function AuditsModule() {
  const [audits, setAudits] = useState(DEMO);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);
  const [newAudit, setNewAudit] = useState(null); // audit en cours de réalisation

  const creerAudit = () => {
    const modele = MODELES_AUDIT.find(m => m.id === form.modele);
    if (!modele) return;
    setNewAudit({ modele: form.modele, chantier: form.chantier || '', auditeur: form.auditeur || 'Vassili B.', items: modele.items, resultats: {}, observations: '' });
    setModal(null); setForm({});
  };

  const validerAudit = () => {
    if (!newAudit) return;
    const modele = MODELES_AUDIT.find(m => m.id === newAudit.modele);
    const nbOK = Object.values(newAudit.resultats).filter(v => v).length;
    const score = Math.round(nbOK / modele.items.length * 100);
    const audit = { id: Date.now(), ...newAudit, date: new Date().toISOString().slice(0, 10), score, actions: [] };
    setAudits(prev => [audit, ...prev]);
    setNewAudit(null);
  };

  const scoreMoyen = audits.length > 0 ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length) : 0;

  // Vue réalisation d'audit
  if (newAudit) {
    const modele = MODELES_AUDIT.find(m => m.id === newAudit.modele);
    const nbOK = Object.values(newAudit.resultats).filter(v => v).length;
    const nbKO = Object.values(newAudit.resultats).filter(v => v === false).length;
    const nbRestant = modele.items.length - nbOK - nbKO;
    return (
      <div>
        <button onClick={() => setNewAudit(null)} style={{ ...BTN_O, marginBottom: 12, fontSize: 11 }}>← Annuler</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{modele.titre}</h2>
            <p style={{ fontSize: 12, color: '#555', margin: '2px 0 0' }}>{newAudit.chantier} · {newAudit.auditeur}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '4px 10px', background: '#F0FDF4', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#16A34A' }}>{nbOK} OK</span>
            <span style={{ padding: '4px 10px', background: '#FEF2F2', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#DC2626' }}>{nbKO} NC</span>
            <span style={{ padding: '4px 10px', background: '#F2F2F7', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#555' }}>{nbRestant} restant</span>
          </div>
        </div>

        {/* Progression */}
        <div style={{ height: 6, background: '#E8E6E1', borderRadius: 3, marginBottom: 16 }}>
          <div style={{ height: 6, background: '#16A34A', borderRadius: 3, width: `${(nbOK + nbKO) / modele.items.length * 100}%`, transition: 'width .3s' }} />
        </div>

        {/* Checklist */}
        {modele.items.map((item, i) => {
          const val = newAudit.resultats[i];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #E8E6E1', background: val === true ? '#F0FDF408' : val === false ? '#FEF2F208' : 'transparent' }}>
              <span style={{ fontSize: 13, flex: 1 }}>{item}</span>
              <button onClick={() => setNewAudit(p => ({ ...p, resultats: { ...p.resultats, [i]: true } }))} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: val === true ? '#16A34A' : '#E8E6E1', color: val === true ? '#fff' : '#555' }}>Conforme</button>
              <button onClick={() => setNewAudit(p => ({ ...p, resultats: { ...p.resultats, [i]: false } }))} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: val === false ? '#DC2626' : '#E8E6E1', color: val === false ? '#fff' : '#555' }}>Non conforme</button>
            </div>
          );
        })}

        <div style={{ marginTop: 12 }}>
          <label style={LBL}>Observations</label>
          <textarea value={newAudit.observations} onChange={e => setNewAudit(p => ({ ...p, observations: e.target.value }))} rows={3} style={{ ...INP, resize: 'vertical' }} placeholder="Remarques générales..." />
        </div>

        <button onClick={validerAudit} style={{ ...BTN, width: '100%', padding: 12, marginTop: 12, background: '#16A34A' }}>Valider l'audit ({Math.round((nbOK + nbKO) / modele.items.length * 100)}% complété)</button>
      </div>
    );
  }

  // Vue liste
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Audits internes</h2>
        <button onClick={() => { setForm({ modele: 'chantier' }); setModal('add'); }} style={BTN}>+ Nouvel audit</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[{ l: 'Audits réalisés', v: audits.length, c: '#2563EB' }, { l: 'Score moyen', v: `${scoreMoyen}%`, c: scoreMoyen >= 80 ? '#16A34A' : scoreMoyen >= 60 ? '#D97706' : '#DC2626' }, { l: 'NC ouvertes', v: audits.reduce((s, a) => s + (a.actions || []).filter(x => !x.fait).length, 0), c: '#DC2626' }].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 24, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Modèles d'audit */}
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Modèles disponibles</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {MODELES_AUDIT.map(m => (
          <button key={m.id} onClick={() => { setForm({ modele: m.id }); setModal('add'); }} style={{ ...BTN_O, fontSize: 11 }}>{m.titre} ({m.items.length} points)</button>
        ))}
      </div>

      {/* Historique */}
      {audits.map(a => {
        const modele = MODELES_AUDIT.find(m => m.id === a.modele);
        return (
          <div key={a.id} style={{ ...CARD, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${a.score >= 80 ? '#16A34A' : a.score >= 60 ? '#D97706' : '#DC2626'}` }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{modele?.titre}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: a.score >= 80 ? '#16A34A' : a.score >= 60 ? '#D97706' : '#DC2626', background: a.score >= 80 ? '#F0FDF4' : a.score >= 60 ? '#FFFBEB' : '#FEF2F2', padding: '2px 8px', borderRadius: 6 }}>{a.score}%</span>
              </div>
              <div style={{ fontSize: 12, color: '#555' }}>{a.chantier} · {a.date} · {a.auditeur}</div>
              {a.observations && <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic', marginTop: 2 }}>{a.observations.slice(0, 80)}...</div>}
            </div>
            <div style={{ fontSize: 10, color: '#555' }}>{(a.actions || []).filter(x => !x.fait).length > 0 ? `${(a.actions || []).filter(x => !x.fait).length} actions ouvertes` : '✓ Clôturé'}</div>
          </div>
        );
      })}

      {/* Modal création */}
      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Nouvel audit</h3>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Type d'audit</label><select value={form.modele || 'chantier'} onChange={e => setForm(f => ({ ...f, modele: e.target.value }))} style={INP}>{MODELES_AUDIT.map(m => <option key={m.id} value={m.id}>{m.titre} ({m.items.length} points)</option>)}</select></div>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Chantier / Objet</label><input value={form.chantier || ''} onChange={e => setForm(f => ({ ...f, chantier: e.target.value }))} style={INP} placeholder="Rénovation Dupont" /></div>
            <div style={{ marginBottom: 14 }}><label style={LBL}>Auditeur</label><input value={form.auditeur || 'Vassili B.'} onChange={e => setForm(f => ({ ...f, auditeur: e.target.value }))} style={INP} /></div>
            <button onClick={creerAudit} style={{ ...BTN, width: '100%', padding: 12 }}>Démarrer l'audit</button>
          </div>
        </div>
      )}
    </div>
  );
}
