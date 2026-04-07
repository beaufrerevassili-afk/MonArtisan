import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

const GRAVITES = ['Bénin','Léger','Grave','Très grave','Mortel'];
const TYPES = ['Accident du travail','Presqu\'accident','Incident matériel','Incident environnemental','Malaise','Chute','Coupure','Brûlure','Électrisation','Autre'];
const STATUTS = { ouvert:'#DC2626', en_analyse:'#D97706', action_en_cours:'#2563EB', cloture:'#16A34A' };

const DEMO = [
  { id:1, date:'2026-04-03', type:'Chute', gravite:'Léger', chantier:'Rénovation Dupont', victime:'Jean Martin', description:'Glissade sur sol mouillé, contusion genou droit', temoin:'Marc Lambert', arretTravail:false, joursArret:0, statut:'cloture', actions:[{desc:'Nettoyage immédiat des zones humides',fait:true},{desc:'Ajout signalétique sol glissant',fait:true}], analyse:'Sol non balisé après nettoyage. Manque de signalétique.' },
  { id:2, date:'2026-04-05', type:'Presqu\'accident', gravite:'Bénin', chantier:'Bureau Médecin', victime:'', description:'Chute d\'un outil depuis échafaudage, personne en dessous mais zone dégagée', temoin:'Sophie Duval', arretTravail:false, joursArret:0, statut:'action_en_cours', actions:[{desc:'Filets de protection sous échafaudage',fait:false},{desc:'Rappel port de casque obligatoire',fait:true}], analyse:'Outil mal fixé sur la plateforme de travail.' },
  { id:3, date:'2026-03-20', type:'Coupure', gravite:'Grave', chantier:'Peinture Pastorelli', victime:'Lucas Garcia', description:'Coupure profonde main gauche avec disqueuse. Suture aux urgences.', temoin:'Jean Martin', arretTravail:true, joursArret:5, statut:'cloture', actions:[{desc:'Formation utilisation disqueuse obligatoire',fait:true},{desc:'Vérification gants anti-coupure',fait:true},{desc:'Mise à jour DUERP risque coupure',fait:true}], analyse:'Gant inadapté pour utilisation disqueuse. EPI non conforme au risque.' },
];

export default function IncidentsModule() {
  const STORE_I='freample_incidents'; function loadI(){try{const d=localStorage.getItem(STORE_I);return d?JSON.parse(d):DEMO;}catch{return DEMO;}}
  const [incidents, setIncidents] = useState(loadI);
  useEffect(()=>{localStorage.setItem(STORE_I,JSON.stringify(incidents));},[incidents]);
  useEffect(()=>{api.get('/modules/incidents').then(({data})=>{if(data.incidents?.length) setIncidents(data.incidents);}).catch(()=>{});},[]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);

  const ouverts = incidents.filter(i => i.statut !== 'cloture');
  const totalJoursArret = incidents.reduce((s, i) => s + i.joursArret, 0);

  const ajouter = () => {
    const inc = { id: Date.now(), date: form.date || new Date().toISOString().slice(0, 10), type: form.type || 'Autre', gravite: form.gravite || 'Bénin', chantier: form.chantier || '', victime: form.victime || '', description: form.description || '', temoin: form.temoin || '', arretTravail: form.arret === 'true', joursArret: Number(form.joursArret) || 0, statut: 'ouvert', actions: [], analyse: '' };
    setIncidents(prev => [inc, ...prev]);
    setModal(null); setForm({});
  };

  const updateStatut = (id, statut) => setIncidents(prev => prev.map(i => i.id === id ? { ...i, statut } : i));
  const addAction = (id) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, actions: [...i.actions, { desc: form.actionDesc || '', fait: false }] } : i));
    setForm(f => ({ ...f, actionDesc: '' }));
  };
  const toggleAction = (incId, idx) => setIncidents(prev => prev.map(i => i.id === incId ? { ...i, actions: i.actions.map((a, j) => j === idx ? { ...a, fait: !a.fait } : a) } : i));

  // Génération fiche CPAM (Cerfa S6200)
  const genererFicheCPAM = (inc) => {
    const date = new Date().toLocaleDateString('fr-FR');
    let txt = '';
    txt += `╔══════════════════════════════════════════════════════════════╗\n`;
    txt += `║     DÉCLARATION D'ACCIDENT DU TRAVAIL OU DE TRAJET        ║\n`;
    txt += `║     Cerfa n° S6200 — Art. L441-2 du Code Sécu. Sociale   ║\n`;
    txt += `╚══════════════════════════════════════════════════════════════╝\n\n`;
    txt += `À ADRESSER À LA CPAM DANS LES 48 HEURES\n`;
    txt += `${'─'.repeat(60)}\n\n`;

    txt += `1. EMPLOYEUR\n${'─'.repeat(40)}\n`;
    txt += `Nom / Raison sociale : Freample Artisans BTP\n`;
    txt += `SIRET              : 123 456 789 000 12\n`;
    txt += `Adresse            : 24 rue de la Liberté, Nice\n`;
    txt += `Code risque AT/MP  : 452BB\n`;
    txt += `N° Adhérent        : _______________\n\n`;

    txt += `2. VICTIME\n${'─'.repeat(40)}\n`;
    txt += `Nom et prénom      : ${inc.victime || '[À COMPLÉTER]'}\n`;
    txt += `N° Sécurité Sociale: [À COMPLÉTER]\n`;
    txt += `Date de naissance  : [À COMPLÉTER]\n`;
    txt += `Nationalité        : Française\n`;
    txt += `Qualification      : [À COMPLÉTER]\n`;
    txt += `Ancienneté poste   : [À COMPLÉTER]\n`;
    txt += `Date d'embauche    : [À COMPLÉTER]\n\n`;

    txt += `3. ACCIDENT\n${'─'.repeat(40)}\n`;
    txt += `Date de l'accident : ${inc.date}\n`;
    txt += `Heure              : [À COMPLÉTER]\n`;
    txt += `Lieu précis        : ${inc.chantier}\n`;
    txt += `\n`;
    txt += `L'accident s'est-il produit :\n`;
    txt += `  [${inc.type === 'Accident du travail' ? 'X' : ' '}] Sur le lieu de travail habituel\n`;
    txt += `  [ ] Sur un lieu de travail occasionnel\n`;
    txt += `  [ ] Lors d'un trajet domicile-travail\n`;
    txt += `  [ ] Lors d'un déplacement professionnel\n\n`;

    txt += `4. CIRCONSTANCES DÉTAILLÉES DE L'ACCIDENT\n${'─'.repeat(40)}\n`;
    txt += `Activité de la victime au moment de l'accident :\n`;
    txt += `${inc.description || '[À COMPLÉTER]'}\n\n`;
    txt += `Nature de l'accident (chute, choc, coupure...) :\n`;
    txt += `${inc.type}\n\n`;
    txt += `Objet / substance ayant causé la blessure :\n`;
    txt += `[À COMPLÉTER]\n\n`;
    txt += `Conditions météorologiques :\n`;
    txt += `[À COMPLÉTER]\n\n`;

    txt += `5. SIÈGE ET NATURE DES LÉSIONS\n${'─'.repeat(40)}\n`;
    txt += `Nature des lésions : ${inc.type} — ${inc.gravite}\n`;
    txt += `Siège des lésions  : [À COMPLÉTER]\n\n`;

    txt += `6. TÉMOINS\n${'─'.repeat(40)}\n`;
    txt += `Témoin 1 : ${inc.temoin || 'Aucun témoin'}\n`;
    txt += `Adresse  : [À COMPLÉTER]\n`;
    txt += `Témoin 2 : [À COMPLÉTER]\n\n`;

    txt += `7. TIERS RESPONSABLE\n${'─'.repeat(40)}\n`;
    txt += `Un tiers est-il à l'origine de l'accident ?\n`;
    txt += `  [ ] Oui   [X] Non\n`;
    txt += `Si oui, nom et adresse du tiers : _______________\n\n`;

    txt += `8. ARRÊT DE TRAVAIL\n${'─'.repeat(40)}\n`;
    txt += `Arrêt de travail prescrit : ${inc.arretTravail ? 'OUI' : 'NON'}\n`;
    if (inc.arretTravail) {
      txt += `Date du premier jour d'arrêt : ${inc.date}\n`;
      txt += `Durée prévisible            : ${inc.joursArret} jours\n`;
    }
    txt += `\nLa victime a-t-elle cessé le travail le jour de l'accident ?\n`;
    txt += `  [${inc.arretTravail ? 'X' : ' '}] Oui   [${!inc.arretTravail ? 'X' : ' '}] Non\n\n`;

    txt += `9. PREMIERS SOINS\n${'─'.repeat(40)}\n`;
    txt += `Premiers soins donnés sur place : [ ] Oui  [ ] Non\n`;
    txt += `La victime a-t-elle été transportée :\n`;
    txt += `  [ ] À l'hôpital / clinique : _______________\n`;
    txt += `  [ ] À son domicile\n`;
    txt += `  [ ] Chez un médecin : _______________\n\n`;

    txt += `10. FEUILLE D'ACCIDENT\n${'─'.repeat(40)}\n`;
    txt += `Une feuille d'accident du travail (Cerfa S6201)\n`;
    txt += `a été remise à la victime le : ${inc.date}\n\n`;

    txt += `${'═'.repeat(60)}\n`;
    txt += `ENGAGEMENT DE L'EMPLOYEUR\n\n`;
    txt += `Je soussigné(e), en qualité d'employeur, déclare que les\n`;
    txt += `informations ci-dessus sont exactes et complètes.\n\n`;
    txt += `Fait à Nice, le ${date}\n\n`;
    txt += `Signature et cachet de l'employeur :\n\n\n`;
    txt += `_________________________________\n\n`;

    txt += `${'═'.repeat(60)}\n`;
    txt += `RAPPELS IMPORTANTS\n`;
    txt += `${'─'.repeat(40)}\n`;
    txt += `• Délai de déclaration : 48 heures (Art. L441-2 CSS)\n`;
    txt += `• Amende : jusqu'à 750€ par infraction (Art. R471-3 CSS)\n`;
    txt += `• Remettre la feuille d'accident S6201 à la victime le jour même\n`;
    txt += `• Inscrire l'accident au registre des accidents bénins\n`;
    txt += `  (si pas d'arrêt et pas de soins médicaux)\n`;
    txt += `• Conserver ce document 5 ans minimum\n`;
    txt += `• En cas d'accident mortel : prévenir l'inspection du travail\n`;
    txt += `  immédiatement (Art. L4131-1 Code du travail)\n`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Declaration_AT_CPAM_${(inc.victime || 'incident').replace(/\s/g, '_')}_${inc.date}.txt`;
    a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Incidents & Accidents</h2>
        <button onClick={() => { setForm({ type: 'Accident du travail', gravite: 'Bénin' }); setModal('add'); }} style={{ ...BTN, background: '#DC2626' }}>Déclarer un incident</button>
      </div>

      {/* Rappel légal */}
      <div style={{ ...CARD, borderLeft: '4px solid #DC2626', marginBottom: 16, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Obligation légale</div>
        <div style={{ fontSize: 11, color: '#555' }}>Tout accident du travail doit être déclaré à la CPAM dans les 48h (Art. L441-2 du CSS). L'employeur doit remettre une feuille d'accident à la victime et inscrire l'accident au registre.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Total incidents', v: incidents.length, c: '#DC2626' },
          { l: 'En cours', v: ouverts.length, c: '#D97706' },
          { l: 'Jours d\'arrêt', v: totalJoursArret, c: '#2563EB' },
          { l: 'Taux fréquence', v: incidents.length > 0 ? (incidents.filter(i => i.arretTravail).length * 1000000 / 8000).toFixed(1) : '0', c: DS.gold },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {!selected && incidents.map(inc => (
        <div key={inc.id} onClick={() => setSelected(inc.id)} style={{ ...CARD, marginBottom: 6, cursor: 'pointer', borderLeft: `4px solid ${STATUTS[inc.statut]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{inc.type}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: inc.gravite === 'Grave' || inc.gravite === 'Très grave' ? '#DC2626' : '#D97706', background: inc.gravite === 'Grave' || inc.gravite === 'Très grave' ? '#FEF2F2' : '#FFFBEB', padding: '2px 8px', borderRadius: 6 }}>{inc.gravite}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: STATUTS[inc.statut], background: `${STATUTS[inc.statut]}15`, padding: '2px 8px', borderRadius: 6 }}>{inc.statut.replace('_', ' ')}</span>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>{inc.chantier} · {inc.victime || 'Pas de victime'} · {inc.date} {inc.arretTravail ? `· ${inc.joursArret}j arrêt` : ''}</div>
          </div>
          <button onClick={e => { e.stopPropagation(); genererFicheCPAM(inc); }} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#DC2626', flexShrink: 0 }}>Fiche CPAM</button>
        </div>
      ))}

      {selected && (() => {
        const inc = incidents.find(i => i.id === selected);
        if (!inc) return null;
        return <>
          <button onClick={() => setSelected(null)} style={{ ...BTN_O, marginBottom: 12, fontSize: 11 }}>← Retour</button>
          <div style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>{inc.type}</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: STATUTS[inc.statut], background: `${STATUTS[inc.statut]}15`, padding: '2px 8px', borderRadius: 6 }}>{inc.statut.replace('_', ' ')}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 6 }}>Gravité: {inc.gravite}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => genererFicheCPAM(inc)} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#DC2626' }}>Fiche CPAM</button>
                {inc.statut === 'ouvert' && <button onClick={() => updateStatut(inc.id, 'en_analyse')} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#D97706' }}>Analyser</button>}
                {inc.statut === 'en_analyse' && <button onClick={() => updateStatut(inc.id, 'action_en_cours')} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#2563EB' }}>Actions</button>}
                {inc.statut === 'action_en_cours' && <button onClick={() => updateStatut(inc.id, 'cloture')} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: '#16A34A' }}>Clôturer</button>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, fontSize: 13 }}>
              <div><strong>Date :</strong> {inc.date}</div>
              <div><strong>Chantier :</strong> {inc.chantier}</div>
              <div><strong>Victime :</strong> {inc.victime || 'Aucune'}</div>
              <div><strong>Témoin :</strong> {inc.temoin || 'Aucun'}</div>
              <div><strong>Arrêt :</strong> {inc.arretTravail ? `Oui — ${inc.joursArret} jours` : 'Non'}</div>
            </div>
            <div style={{ background: '#F8F7F4', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Description</div>
              <div style={{ fontSize: 12, color: '#333' }}>{inc.description}</div>
            </div>
            {inc.analyse && <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Analyse des causes</div>
              <div style={{ fontSize: 12 }}>{inc.analyse}</div>
            </div>}
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Actions correctives ({inc.actions.length})</div>
            {inc.actions.map((a, idx) => (
              <div key={idx} onClick={() => toggleAction(inc.id, idx)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #E8E6E1', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${a.fait ? '#16A34A' : '#E8E6E1'}`, background: a.fait ? '#16A34A' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>{a.fait ? '✓' : ''}</div>
                <span style={{ fontSize: 12, textDecoration: a.fait ? 'line-through' : 'none', color: a.fait ? '#16A34A' : '#333' }}>{a.desc}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input value={form.actionDesc || ''} onChange={e => setForm(f => ({ ...f, actionDesc: e.target.value }))} placeholder="Nouvelle action corrective..." style={{ ...INP, flex: 1 }} />
              <button onClick={() => addAction(inc.id)} style={BTN}>Ajouter</button>
            </div>
          </div>
        </>;
      })()}

      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, padding: '28px 24px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#DC2626' }}>Déclarer un incident</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Type</label><select value={form.type || 'Accident du travail'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={INP}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label style={LBL}>Gravité</label><select value={form.gravite || 'Bénin'} onChange={e => setForm(f => ({ ...f, gravite: e.target.value }))} style={INP}>{GRAVITES.map(g => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Chantier</label><input value={form.chantier || ''} onChange={e => setForm(f => ({ ...f, chantier: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Date</label><input type="date" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={INP} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div><label style={LBL}>Victime</label><input value={form.victime || ''} onChange={e => setForm(f => ({ ...f, victime: e.target.value }))} style={INP} /></div>
              <div><label style={LBL}>Témoin</label><input value={form.temoin || ''} onChange={e => setForm(f => ({ ...f, temoin: e.target.value }))} style={INP} /></div>
            </div>
            <div style={{ marginBottom: 10 }}><label style={LBL}>Description</label><textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...INP, resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div><label style={LBL}>Arrêt de travail</label><select value={form.arret || 'false'} onChange={e => setForm(f => ({ ...f, arret: e.target.value }))} style={INP}><option value="false">Non</option><option value="true">Oui</option></select></div>
              <div><label style={LBL}>Jours d'arrêt</label><input type="number" value={form.joursArret || '0'} onChange={e => setForm(f => ({ ...f, joursArret: e.target.value }))} style={INP} /></div>
            </div>
            <button onClick={ajouter} style={{ ...BTN, width: '100%', padding: 12, background: '#DC2626' }}>Déclarer l'incident</button>
          </div>
        </div>
      )}
    </div>
  );
}
