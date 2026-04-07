import React, { useState } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };

const ANNEE = new Date().getFullYear();

// Données de synthèse annuelle (en production, agrégées depuis les autres modules)
const RAPPORT_DATA = {
  annee: ANNEE,
  entreprise: 'Freample Artisans',
  siret: '12345678900012',
  effectif: 8,
  nbChantiers: 24,

  // Indicateurs Sécurité
  securite: {
    accidents: 3,
    presquAccidents: 5,
    joursArret: 12,
    tauxFrequence: 37.5,
    tauxGravite: 1.5,
    incidentsParType: [
      { type:'Chute', nb:1 },
      { type:'Coupure', nb:1 },
      { type:'Presqu\'accident — chute outil', nb:3 },
      { type:'Glissade', nb:1 },
      { type:'Électrisation', nb:0 },
      { type:'Autre', nb:2 },
    ],
    epiDistribues: 32,
    epiRenouveles: 8,
    visitesMedicales: 8,
    visitesAJour: 7,
  },

  // Indicateurs Qualité
  qualite: {
    nonConformites: 6,
    ncCloturees: 4,
    ncOuvertes: 2,
    actionsCorrectives: 14,
    actionsRealisees: 11,
    reclamationsClients: 2,
    satisfactionClient: 4.6,
    certifications: [
      { nom:'QUALIBAT 2111', statut:'valide', expiration:'2028-06-15' },
      { nom:'RGE', statut:'valide', expiration:'2029-01-10' },
      { nom:'QUALIBAT 5112 — Peinture', statut:'expiré', expiration:'2026-03-20' },
    ],
  },

  // Indicateurs Hygiène
  hygiene: {
    formationsRealisees: 12,
    formationsPrevues: 15,
    tauxFormation: 80,
    accueilsSecurite: 3,
    exercicesEvacuation: 1,
    controlesHygiene: 4,
    conformiteHygiene: 95,
  },

  // Indicateurs Environnement
  environnement: {
    tonnesEvacuees: 18.5,
    tonneDangereux: 0.58,
    bsddEmis: 8,
    bsddTraites: 6,
    tauxValorisationDechets: 72,
    consommationEau: '320 m³',
    consommationEnergie: '12 400 kWh',
    emissionsCO2: '4.2 tonnes',
  },

  // Budget QHSE
  budget: {
    total: 18500,
    details: [
      { poste:'EPI & équipements', montant:4200 },
      { poste:'Formations sécurité', montant:5800 },
      { poste:'Certifications & audits', montant:3200 },
      { poste:'Gestion des déchets', montant:2100 },
      { poste:'Visite médicale', montant:1600 },
      { poste:'Mise en conformité matériel', montant:1600 },
    ],
    evolution: '+12%',
    budgetParSalarie: 2312,
  },

  // Plan d'actions annuel
  planActions: [
    { action:'Mise à jour du DUERP', responsable:'Chef chantier', echeance:'Q1', statut:'fait', categorie:'Sécurité' },
    { action:'Formation CACES R489 — 2 salariés', responsable:'RH', echeance:'Q1', statut:'fait', categorie:'Sécurité' },
    { action:'Renouvellement QUALIBAT Peinture', responsable:'Direction', echeance:'Q2', statut:'en_retard', categorie:'Qualité' },
    { action:'Mise en place tri sélectif chantiers', responsable:'QSE', echeance:'Q2', statut:'fait', categorie:'Environnement' },
    { action:'Audit interne ISO 45001', responsable:'QSE', echeance:'Q3', statut:'fait', categorie:'Sécurité' },
    { action:'Formation habilitation électrique BR — 1 salarié', responsable:'RH', echeance:'Q3', statut:'fait', categorie:'Sécurité' },
    { action:'Exercice évacuation incendie', responsable:'QSE', echeance:'Q3', statut:'fait', categorie:'Hygiène' },
    { action:'Bilan carbone simplifié', responsable:'Direction', echeance:'Q4', statut:'en_cours', categorie:'Environnement' },
    { action:'Renouvellement EPI hiver', responsable:'Chef chantier', echeance:'Q4', statut:'fait', categorie:'Sécurité' },
    { action:'Formation SST — recyclage 4 salariés', responsable:'RH', echeance:'Q4', statut:'planifie', categorie:'Hygiène' },
    { action:'Audit fournisseur déchets dangereux', responsable:'QSE', echeance:'Q4', statut:'planifie', categorie:'Environnement' },
    { action:'Campagne sensibilisation port EPI', responsable:'QSE', echeance:'Continu', statut:'fait', categorie:'Sécurité' },
  ],

  // Objectifs année suivante
  objectifsN1: [
    'Zéro accident avec arrêt',
    'Taux de formation 100% des salariés',
    'Renouveler QUALIBAT Peinture (Q1)',
    'Réduire les déchets dangereux de 20%',
    'Obtenir le label Éco Artisan',
    'Taux de valorisation déchets > 80%',
    'Former 2 salariés SST supplémentaires',
  ],
};

const statutColors = { fait:'#16A34A', en_cours:'#D97706', en_retard:'#DC2626', planifie:'#2563EB' };
const statutLabels = { fait:'Réalisé', en_cours:'En cours', en_retard:'En retard', planifie:'Planifié' };
const catColors = { Sécurité:'#DC2626', Qualité:'#2563EB', Hygiène:'#16A34A', Environnement:'#D97706' };

export default function RapportAnnuelQHSE() {
  const [viewMode, setViewMode] = useState('ecran'); // ecran | impression
  const d = RAPPORT_DATA;

  const actionsRealisees = d.planActions.filter(a => a.statut === 'fait').length;
  const tauxRealisation = Math.round(actionsRealisees / d.planActions.length * 100);

  const exportRapport = () => {
    // Générer le texte du rapport
    let text = `RAPPORT ANNUEL QHSE ${d.annee}\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Entreprise : ${d.entreprise}\nSIRET : ${d.siret}\nEffectif : ${d.effectif} salariés\nChantiers : ${d.nbChantiers}\n\n`;

    text += `1. SÉCURITÉ\n${'-'.repeat(30)}\n`;
    text += `Accidents du travail : ${d.securite.accidents}\nPresqu'accidents : ${d.securite.presquAccidents}\nJours d'arrêt : ${d.securite.joursArret}\nTaux de fréquence : ${d.securite.tauxFrequence}\nTaux de gravité : ${d.securite.tauxGravite}\nEPI distribués : ${d.securite.epiDistribues}\nVisites médicales à jour : ${d.securite.visitesAJour}/${d.securite.visitesMedicales}\n\n`;

    text += `2. QUALITÉ\n${'-'.repeat(30)}\n`;
    text += `Non-conformités : ${d.qualite.nonConformites} (${d.qualite.ncCloturees} clôturées, ${d.qualite.ncOuvertes} ouvertes)\nActions correctives : ${d.qualite.actionsRealisees}/${d.qualite.actionsCorrectives} réalisées\nSatisfaction client : ${d.qualite.satisfactionClient}/5\nRéclamations : ${d.qualite.reclamationsClients}\n\n`;

    text += `3. HYGIÈNE\n${'-'.repeat(30)}\n`;
    text += `Formations réalisées : ${d.hygiene.formationsRealisees}/${d.hygiene.formationsPrevues}\nAccueils sécurité : ${d.hygiene.accueilsSecurite}\nConformité hygiène : ${d.hygiene.conformiteHygiene}%\n\n`;

    text += `4. ENVIRONNEMENT\n${'-'.repeat(30)}\n`;
    text += `Déchets évacués : ${d.environnement.tonnesEvacuees} tonnes\nDont dangereux : ${d.environnement.tonneDangereux} tonnes\nBSDD émis : ${d.environnement.bsddEmis}\nTaux valorisation : ${d.environnement.tauxValorisationDechets}%\nÉmissions CO2 : ${d.environnement.emissionsCO2}\n\n`;

    text += `5. BUDGET QHSE\n${'-'.repeat(30)}\n`;
    text += `Budget total : ${d.budget.total.toLocaleString()} €\nPar salarié : ${d.budget.budgetParSalarie} €\nÉvolution : ${d.budget.evolution}\n`;
    d.budget.details.forEach(b => { text += `  - ${b.poste} : ${b.montant.toLocaleString()} €\n`; });

    text += `\n6. PLAN D'ACTIONS (${tauxRealisation}% réalisé)\n${'-'.repeat(30)}\n`;
    d.planActions.forEach(a => { text += `  [${statutLabels[a.statut]}] ${a.action} — ${a.responsable} — ${a.echeance}\n`; });

    text += `\n7. OBJECTIFS ${d.annee + 1}\n${'-'.repeat(30)}\n`;
    d.objectifsN1.forEach(o => { text += `  • ${o}\n`; });

    text += `\n\nRapport généré le ${new Date().toLocaleDateString('fr-FR')}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `Rapport_QHSE_${d.annee}_${d.entreprise.replace(/\s/g, '_')}.txt`; a.click();
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, margin:0 }}>Rapport annuel QHSE — {d.annee}</h2>
          <p style={{ fontSize:13, color:'#555', margin:'4px 0 0' }}>{d.entreprise} · {d.effectif} salariés · {d.nbChantiers} chantiers</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>window.print()} style={BTN_O}>Imprimer</button>
          <button onClick={exportRapport} style={BTN}>Exporter le rapport</button>
        </div>
      </div>

      {/* KPIs synthèse */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[
          { l:'Accidents', v:d.securite.accidents, sub:`${d.securite.joursArret}j arrêt`, c:'#DC2626' },
          { l:'Non-conformités', v:`${d.qualite.ncCloturees}/${d.qualite.nonConformites}`, sub:'clôturées', c:'#2563EB' },
          { l:'Budget QHSE', v:`${(d.budget.total/1000).toFixed(1)}k€`, sub:`${d.budget.evolution} vs N-1`, c:'#D97706' },
          { l:'Plan d\'actions', v:`${tauxRealisation}%`, sub:`${actionsRealisees}/${d.planActions.length} réalisées`, c:'#16A34A' },
        ].map(k=>(
          <div key={k.l} style={{...CARD, position:'relative'}}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.c, borderRadius:'14px 14px 0 0' }}/>
            <div style={{ fontSize:11, color:'#555', textTransform:'uppercase', marginBottom:4 }}>{k.l}</div>
            <div style={{ fontSize:24, fontWeight:300 }}>{k.v}</div>
            <div style={{ fontSize:11, color:'#555' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 1. Sécurité */}
      <div style={{...CARD, marginBottom:12, borderLeft:'4px solid #DC2626'}}>
        <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px', color:'#DC2626' }}>1. Sécurité</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
          <div style={{ background:'#FEF2F2', padding:12, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:300, color:'#DC2626' }}>{d.securite.accidents}</div>
            <div style={{ fontSize:11, color:'#555' }}>Accidents du travail</div>
          </div>
          <div style={{ background:'#FFFBEB', padding:12, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:300, color:'#D97706' }}>{d.securite.presquAccidents}</div>
            <div style={{ fontSize:11, color:'#555' }}>Presqu'accidents</div>
          </div>
          <div style={{ background:'#EFF6FF', padding:12, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:300, color:'#2563EB' }}>{d.securite.joursArret}</div>
            <div style={{ fontSize:11, color:'#555' }}>Jours d'arrêt</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:'#555', marginBottom:8 }}>
          <strong>Taux de fréquence :</strong> {d.securite.tauxFrequence} · <strong>Taux de gravité :</strong> {d.securite.tauxGravite}
        </div>
        <div style={{ fontSize:12, color:'#555' }}>
          <strong>EPI distribués :</strong> {d.securite.epiDistribues} · <strong>Renouvelés :</strong> {d.securite.epiRenouveles} · <strong>Visites médicales :</strong> {d.securite.visitesAJour}/{d.securite.visitesMedicales} à jour
        </div>
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:6 }}>Répartition par type d'incident</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {d.securite.incidentsParType.filter(i=>i.nb>0).map(i=>(
              <span key={i.type} style={{ fontSize:11, padding:'3px 10px', background:'#FEF2F2', border:'1px solid #DC262620', borderRadius:6 }}>{i.type}: <strong>{i.nb}</strong></span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Qualité */}
      <div style={{...CARD, marginBottom:12, borderLeft:'4px solid #2563EB'}}>
        <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px', color:'#2563EB' }}>2. Qualité</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:12 }}>
          {[
            { l:'Non-conformités', v:d.qualite.nonConformites, c:'#2563EB' },
            { l:'Actions correctives', v:`${d.qualite.actionsRealisees}/${d.qualite.actionsCorrectives}`, c:'#16A34A' },
            { l:'Satisfaction client', v:`${d.qualite.satisfactionClient}/5`, c:DS.gold },
            { l:'Réclamations', v:d.qualite.reclamationsClients, c:'#D97706' },
          ].map(k=>(
            <div key={k.l} style={{ background:'#F8F7F4', padding:10, borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:300, color:k.c }}>{k.v}</div>
              <div style={{ fontSize:10, color:'#555' }}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, fontWeight:600, marginBottom:6 }}>Certifications</div>
        {d.qualite.certifications.map(c=>(
          <div key={c.nom} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid #E8E6E1', fontSize:12 }}>
            <span>{c.nom}</span>
            <span style={{ fontWeight:600, color:c.statut==='valide'?'#16A34A':'#DC2626' }}>{c.statut} — {c.expiration}</span>
          </div>
        ))}
      </div>

      {/* 3. Hygiène */}
      <div style={{...CARD, marginBottom:12, borderLeft:'4px solid #16A34A'}}>
        <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px', color:'#16A34A' }}>3. Hygiène</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <div style={{ background:'#F0FDF4', padding:10, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:300, color:'#16A34A' }}>{d.hygiene.formationsRealisees}/{d.hygiene.formationsPrevues}</div>
            <div style={{ fontSize:10, color:'#555' }}>Formations réalisées</div>
          </div>
          <div style={{ background:'#F0FDF4', padding:10, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:300, color:'#16A34A' }}>{d.hygiene.accueilsSecurite}</div>
            <div style={{ fontSize:10, color:'#555' }}>Accueils sécurité</div>
          </div>
          <div style={{ background:'#F0FDF4', padding:10, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:300, color:'#16A34A' }}>{d.hygiene.conformiteHygiene}%</div>
            <div style={{ fontSize:10, color:'#555' }}>Conformité hygiène</div>
          </div>
        </div>
      </div>

      {/* 4. Environnement */}
      <div style={{...CARD, marginBottom:12, borderLeft:'4px solid #D97706'}}>
        <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px', color:'#D97706' }}>4. Environnement</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
          <div style={{ background:'#FFFBEB', padding:10, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:300, color:'#D97706' }}>{d.environnement.tonnesEvacuees}t</div>
            <div style={{ fontSize:10, color:'#555' }}>Déchets évacués</div>
          </div>
          <div style={{ background:'#FFFBEB', padding:10, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:300, color:'#D97706' }}>{d.environnement.tauxValorisationDechets}%</div>
            <div style={{ fontSize:10, color:'#555' }}>Taux valorisation</div>
          </div>
          <div style={{ background:'#FFFBEB', padding:10, borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:300, color:'#D97706' }}>{d.environnement.emissionsCO2}</div>
            <div style={{ fontSize:10, color:'#555' }}>Émissions CO2</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:'#555' }}>
          <strong>BSDD :</strong> {d.environnement.bsddEmis} émis, {d.environnement.bsddTraites} traités · <strong>Eau :</strong> {d.environnement.consommationEau} · <strong>Énergie :</strong> {d.environnement.consommationEnergie}
        </div>
      </div>

      {/* 5. Budget QHSE */}
      <div style={{...CARD, marginBottom:12}}>
        <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>5. Budget QHSE — {d.budget.total.toLocaleString()} €</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:8 }}>Répartition par poste</div>
            {d.budget.details.map(b=>{
              const pct = Math.round(b.montant/d.budget.total*100);
              return <div key={b.poste} style={{ marginBottom:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:2 }}>
                  <span style={{ color:'#555' }}>{b.poste}</span>
                  <span style={{ fontWeight:600 }}>{b.montant.toLocaleString()} € ({pct}%)</span>
                </div>
                <div style={{ height:4, background:'#E8E6E1', borderRadius:2 }}>
                  <div style={{ height:4, background:DS.gold, borderRadius:2, width:`${pct}%` }}/>
                </div>
              </div>;
            })}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#F8F7F4', padding:14, borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:300, color:DS.gold }}>{d.budget.budgetParSalarie} €</div>
              <div style={{ fontSize:11, color:'#555' }}>Par salarié / an</div>
            </div>
            <div style={{ background:'#F8F7F4', padding:14, borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:300, color:d.budget.evolution.startsWith('+')?'#16A34A':'#DC2626' }}>{d.budget.evolution}</div>
              <div style={{ fontSize:11, color:'#555' }}>vs année précédente</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Plan d'actions */}
      <div style={{...CARD, marginBottom:12}}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h3 style={{ fontSize:16, fontWeight:700, margin:0 }}>6. Plan d'actions — {tauxRealisation}% réalisé</h3>
          <div style={{ width:120, height:6, background:'#E8E6E1', borderRadius:3 }}>
            <div style={{ height:6, background:'#16A34A', borderRadius:3, width:`${tauxRealisation}%` }}/>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 0.8fr 1fr', padding:'8px 12px', fontSize:10, fontWeight:700, color:'#555', borderBottom:'2px solid #E8E6E1' }}>
          <span>Action</span><span>Responsable</span><span>Échéance</span><span>Statut</span>
        </div>
        {d.planActions.map((a,i)=>(
          <div key={i} style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 0.8fr 1fr', padding:'8px 12px', fontSize:12, borderBottom:'1px solid #E8E6E1', alignItems:'center' }}>
            <div>
              <span style={{ fontWeight:500 }}>{a.action}</span>
              <span style={{ fontSize:10, color:catColors[a.categorie], fontWeight:600, marginLeft:6 }}>{a.categorie}</span>
            </div>
            <span style={{ color:'#555' }}>{a.responsable}</span>
            <span style={{ color:'#555' }}>{a.echeance}</span>
            <span style={{ fontSize:10, fontWeight:600, color:statutColors[a.statut], background:`${statutColors[a.statut]}15`, padding:'2px 8px', borderRadius:6, textAlign:'center' }}>{statutLabels[a.statut]}</span>
          </div>
        ))}
      </div>

      {/* 7. Objectifs N+1 */}
      <div style={{...CARD, borderLeft:'4px solid '+DS.gold}}>
        <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 12px' }}>7. Objectifs {d.annee + 1}</h3>
        {d.objectifsN1.map((o,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #E8E6E1' }}>
            <div style={{ width:20, height:20, borderRadius:4, border:'2px solid #E8E6E1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#555', flexShrink:0 }}>{i+1}</div>
            <span style={{ fontSize:13 }}>{o}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
