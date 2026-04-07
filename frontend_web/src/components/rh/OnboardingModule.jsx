import React, { useState, useEffect } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };

const CHECKLIST_ONBOARDING = [
  { id:'dpae', label:'DPAE envoyée', categorie:'Administratif', obligatoire:true },
  { id:'contrat', label:'Contrat de travail signé', categorie:'Administratif', obligatoire:true },
  { id:'mutuelle', label:'Affiliation mutuelle', categorie:'Administratif', obligatoire:true },
  { id:'rib', label:'RIB récupéré', categorie:'Administratif', obligatoire:true },
  { id:'secu', label:'N° sécurité sociale vérifié', categorie:'Administratif', obligatoire:true },
  { id:'visite_med', label:'Visite médicale planifiée', categorie:'Santé', obligatoire:true },
  { id:'epi', label:'EPI remis (casque, chaussures, gilet)', categorie:'Sécurité', obligatoire:true },
  { id:'habilitations', label:'Habilitations vérifiées', categorie:'Sécurité', obligatoire:true },
  { id:'carte_btp', label:'Carte BTP demandée', categorie:'Administratif', obligatoire:true },
  { id:'accueil', label:'Accueil sécurité réalisé', categorie:'Sécurité', obligatoire:true },
  { id:'outils', label:'Outillage remis', categorie:'Matériel', obligatoire:false },
  { id:'vehicule', label:'Véhicule attribué', categorie:'Matériel', obligatoire:false },
  { id:'badge', label:'Badge / accès fournis', categorie:'Matériel', obligatoire:false },
  { id:'equipe', label:'Présentation à l\'équipe', categorie:'Intégration', obligatoire:false },
  { id:'tuteur', label:'Tuteur désigné', categorie:'Intégration', obligatoire:false },
  { id:'formation', label:'Formation poste de travail', categorie:'Formation', obligatoire:true },
  { id:'logiciel', label:'Accès logiciel Freample créé', categorie:'Matériel', obligatoire:false },
  { id:'reglement', label:'Règlement intérieur remis', categorie:'Administratif', obligatoire:true },
];

const CHECKLIST_OFFBOARDING = [
  { id:'off_lettre', label:'Lettre de départ reçue', categorie:'Administratif', obligatoire:true },
  { id:'off_preavis', label:'Préavis calculé et communiqué', categorie:'Administratif', obligatoire:true },
  { id:'off_solde', label:'Solde de tout compte calculé', categorie:'Paie', obligatoire:true },
  { id:'off_bulletin', label:'Dernier bulletin de paie', categorie:'Paie', obligatoire:true },
  { id:'off_certificat', label:'Certificat de travail édité', categorie:'Administratif', obligatoire:true },
  { id:'off_attestation', label:'Attestation Pôle Emploi', categorie:'Administratif', obligatoire:true },
  { id:'off_recu', label:'Reçu solde de tout compte signé', categorie:'Paie', obligatoire:true },
  { id:'off_materiel', label:'Matériel récupéré (outils, EPI)', categorie:'Matériel', obligatoire:true },
  { id:'off_cles', label:'Clés / badges récupérés', categorie:'Matériel', obligatoire:true },
  { id:'off_vehicule', label:'Véhicule restitué', categorie:'Matériel', obligatoire:false },
  { id:'off_acces', label:'Accès logiciel supprimés', categorie:'IT', obligatoire:true },
  { id:'off_mutuelle', label:'Portabilité mutuelle notifiée', categorie:'Administratif', obligatoire:true },
  { id:'off_entretien', label:'Entretien de sortie réalisé', categorie:'Intégration', obligatoire:false },
];

const DEMO_PARCOURS = [
  { id:1, employe:'Lucas Garcia', type:'onboarding', dateDebut:'2026-04-01', checks:{'dpae':true,'contrat':true,'mutuelle':true,'rib':true,'secu':true,'visite_med':false,'epi':true,'habilitations':true,'carte_btp':false,'accueil':true,'formation':false,'reglement':true} },
  { id:2, employe:'Marc Lambert', type:'onboarding', dateDebut:'2026-03-15', checks:{'dpae':true,'contrat':true,'mutuelle':true,'rib':true,'secu':true,'visite_med':true,'epi':true,'habilitations':true,'carte_btp':true,'accueil':true,'outils':true,'equipe':true,'tuteur':true,'formation':true,'logiciel':true,'reglement':true} },
  { id:3, employe:'Sophie Duval', type:'offboarding', dateDebut:'2026-04-05', checks:{'off_lettre':true,'off_preavis':true,'off_solde':false,'off_bulletin':false,'off_certificat':false,'off_attestation':false,'off_recu':false,'off_materiel':false,'off_cles':false,'off_acces':false,'off_mutuelle':false} },
];

const STORAGE_OB = 'freample_onboarding';
function loadOB() { try { const d=localStorage.getItem(STORAGE_OB); return d?JSON.parse(d):DEMO_PARCOURS; } catch { return DEMO_PARCOURS; } }

export default function OnboardingModule({ employes = [] }) {
  const [parcours, setParcours] = useState(loadOB);
  useEffect(() => { localStorage.setItem(STORAGE_OB, JSON.stringify(parcours)); }, [parcours]);
  const [view, setView] = useState('onboarding');
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const checklist = view === 'onboarding' ? CHECKLIST_ONBOARDING : CHECKLIST_OFFBOARDING;
  const filtered = parcours.filter(p => p.type === view);

  const toggleCheck = (parcoursId, checkId) => {
    setParcours(prev => prev.map(p => p.id === parcoursId ? { ...p, checks: { ...p.checks, [checkId]: !p.checks[checkId] } } : p));
  };

  const getProgress = (p) => {
    const list = p.type === 'onboarding' ? CHECKLIST_ONBOARDING : CHECKLIST_OFFBOARDING;
    const obligatoires = list.filter(c => c.obligatoire);
    const done = obligatoires.filter(c => p.checks[c.id]).length;
    return Math.round(done / obligatoires.length * 100);
  };

  const creerParcours = () => {
    const p = { id: Date.now(), employe: form.employe || '', type: view, dateDebut: new Date().toISOString().slice(0, 10), checks: {} };
    setParcours(prev => [p, ...prev]);
    setModal(null); setForm({});
  };

  const categories = [...new Set(checklist.map(c => c.categorie))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => { setView('onboarding'); setSelected(null); }} style={view === 'onboarding' ? BTN : BTN_O}>Onboarding ({parcours.filter(p => p.type === 'onboarding').length})</button>
          <button onClick={() => { setView('offboarding'); setSelected(null); }} style={view === 'offboarding' ? { ...BTN, background: '#DC2626' } : BTN_O}>Offboarding ({parcours.filter(p => p.type === 'offboarding').length})</button>
        </div>
        <button onClick={() => { setForm({}); setModal('add'); }} style={BTN}>+ Nouveau parcours</button>
      </div>

      {!selected && <>
        {filtered.map(p => {
          const progress = getProgress(p);
          const isComplete = progress === 100;
          return <div key={p.id} onClick={() => setSelected(p.id)} style={{ ...CARD, marginBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.employe}</div>
              <div style={{ fontSize: 12, color: '#555' }}>Début : {p.dateDebut}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 120, height: 6, background: '#E8E6E1', borderRadius: 3 }}>
                <div style={{ width: `${progress}%`, height: 6, background: isComplete ? '#16A34A' : '#D97706', borderRadius: 3, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: isComplete ? '#16A34A' : '#D97706' }}>{progress}%</span>
              {isComplete && <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: 6 }}>Terminé</span>}
            </div>
          </div>;
        })}
        {filtered.length === 0 && <div style={{ ...CARD, textAlign: 'center', color: '#555' }}>Aucun parcours {view}. Cliquez sur "+ Nouveau parcours" pour commencer.</div>}
      </>}

      {selected && (() => {
        const p = parcours.find(x => x.id === selected);
        if (!p) return null;
        return <>
          <button onClick={() => setSelected(null)} style={{ ...BTN_O, marginBottom: 12, fontSize: 11 }}>← Retour</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{view === 'onboarding' ? 'Intégration' : 'Départ'} — {p.employe}</h2>
              <div style={{ fontSize: 12, color: '#555' }}>Début : {p.dateDebut} · Progression : {getProgress(p)}%</div>
            </div>
          </div>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#333' }}>{cat}</div>
              {checklist.filter(c => c.categorie === cat).map(c => (
                <div key={c.id} onClick={() => toggleCheck(p.id, c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #E8E6E1', cursor: 'pointer', background: p.checks[c.id] ? '#F0FDF4' : 'transparent' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${p.checks[c.id] ? '#16A34A' : '#E8E6E1'}`, background: p.checks[c.id] ? '#16A34A' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{p.checks[c.id] ? '✓' : ''}</div>
                  <span style={{ fontSize: 13, color: p.checks[c.id] ? '#16A34A' : '#333', textDecoration: p.checks[c.id] ? 'line-through' : 'none' }}>{c.label}</span>
                  {c.obligatoire && !p.checks[c.id] && <span style={{ fontSize: 9, color: '#DC2626', fontWeight: 700, marginLeft: 'auto' }}>OBLIGATOIRE</span>}
                </div>
              ))}
            </div>
          ))}
        </>;
      })()}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Nouveau parcours {view}</h3>
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Employé</label><input value={form.employe || ''} onChange={e => setForm(f => ({ ...f, employe: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' }} placeholder="Jean Martin" /></div>
            <button onClick={creerParcours} style={{ ...BTN, width: '100%', padding: 12 }}>Créer</button>
          </div>
        </div>
      )}
    </div>
  );
}
