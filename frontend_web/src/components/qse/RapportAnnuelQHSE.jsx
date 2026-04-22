import React, { useState } from 'react';
import DS from '../../design/luxe';
import { isDemo as _isDemo } from '../../utils/storage';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'10px 22px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const H1 = { fontSize:28, fontWeight:800, margin:'40px 0 8px', color:'#0A0A0A', borderBottom:'3px solid #0A0A0A', paddingBottom:8 };
const H2 = { fontSize:20, fontWeight:700, margin:'28px 0 10px', color:'#1a1a1a' };
const H3 = { fontSize:15, fontWeight:700, margin:'16px 0 6px', color:'#333' };
const P = { fontSize:13, lineHeight:1.75, color:'#333', margin:'0 0 10px' };
const ENCADRE = (color) => ({ background:`${color}08`, border:`1px solid ${color}25`, borderLeft:`4px solid ${color}`, padding:'12px 16px', borderRadius:8, margin:'10px 0', fontSize:12, lineHeight:1.7 });
const TH = { padding:'8px 12px', fontSize:11, fontWeight:700, color:'#555', textTransform:'uppercase', borderBottom:'2px solid #E8E6E1', textAlign:'left' };
const TD = { padding:'8px 12px', fontSize:12, borderBottom:'1px solid #E8E6E1' };

const ANNEE = new Date().getFullYear();

// ══ DONNÉES SIMULÉES RÉALISTES (demo only) ══
const D_DEMO = {
  structure: 'Freample Artisans BTP',
  siret: '123 456 789 000 12',
  effectif: 12,
  chantiers: 28,
  ca: '1 240 000',

  // Objectifs N-1
  objectifsN1: [
    { obj:'Réduire le TF sous 25', resultat:'TF = 37.5', atteint:false, analyse:'2 accidents sur chantiers extérieurs. Renforcer la prévention sur les nouveaux sites.' },
    { obj:'100% des habilitations à jour', resultat:'92% à jour', atteint:false, analyse:'1 salarié en retard de renouvellement CACES. Planifié Q1 N+1.' },
    { obj:'Taux de tri déchets > 70%', resultat:'72%', atteint:true, analyse:'Objectif atteint grâce à la mise en place du tri sur 3 chantiers pilotes.' },
    { obj:'0 réclamation client qualité', resultat:'2 réclamations', atteint:false, analyse:'Retard livraison menuiseries + défaut carrelage. Plans d\'action engagés.' },
    { obj:'Formation SST 100% des chefs', resultat:'3/3 formés', atteint:true, analyse:'Objectif atteint. Recyclage prévu à 24 mois.' },
  ],

  // Qualité
  qualite: {
    nc: [
      { ref:'NC-001', date:'15/02', nature:'Joints carrelage irréguliers', chantier:'Dupont', gravite:'Majeure', action:'Reprise + formation', statut:'Clôturée' },
      { ref:'NC-002', date:'08/04', nature:'Retard menuiseries 3 jours', chantier:'Médecin', gravite:'Mineure', action:'Pénalité fournisseur', statut:'Clôturée' },
      { ref:'NC-003', date:'22/06', nature:'Peinture écaillée local tech.', chantier:'Pastorelli', gravite:'Mineure', action:'Reprise sous garantie', statut:'Clôturée' },
      { ref:'NC-004', date:'10/09', nature:'Fissure enduit façade', chantier:'Villa Rousseau', gravite:'Majeure', action:'Expertise + reprise', statut:'En cours' },
      { ref:'NC-005', date:'03/11', nature:'Cloison non conforme plan', chantier:'Bureau Thiers', gravite:'Mineure', action:'Modification', statut:'Clôturée' },
      { ref:'NC-006', date:'18/12', nature:'Étanchéité terrasse', chantier:'Résidence Garibaldi', gravite:'Majeure', action:'Intervention urgente', statut:'En cours' },
    ],
    reclamations: 2,
    satisfaction: 4.6,
    audits: [
      { type:'Audit interne qualité', date:'Mars', resultat:'3 écarts mineurs', actions:'Mise à jour procédures' },
      { type:'Audit client (donneur d\'ordre)', date:'Juin', resultat:'Conforme', actions:'Aucune' },
      { type:'Audit QUALIBAT', date:'Octobre', resultat:'Maintien qualification', actions:'1 observation' },
    ],
  },

  // Sécurité
  securite: {
    accidents: [
      { date:'03/04', victime:'J. Martin', nature:'Contusion genou', cause:'Sol mouillé non balisé', arret:5, mesures:'Signalétique + procédure nettoyage' },
      { date:'20/06', victime:'L. Garcia', nature:'Coupure main', cause:'EPI inadapté (gant)', arret:5, mesures:'Changement gants + formation disqueuse' },
      { date:'15/10', victime:'M. Lambert', nature:'Entorse cheville', cause:'Marche manquante échafaudage', arret:8, mesures:'Contrôle systématique échafaudages' },
    ],
    presquAccidents: [
      { date:'12/03', description:'Chute outil depuis échafaudage — zone dégagée', mesures:'Filets + rangement outils' },
      { date:'05/05', description:'Court-circuit armoire électrique — disjoncteur OK', mesures:'Remplacement armoire vétuste' },
      { date:'28/07', description:'Glissade escalier — pas de blessure', mesures:'Bandes antidérapantes' },
      { date:'14/09', description:'Projection béton — lunettes portées', mesures:'Rappel port lunettes obligatoire' },
      { date:'22/11', description:'Chute de charge — zone périmètre respectée', mesures:'Balisage renforcé' },
    ],
    heuresTravaillees: 24000,
    tf: 37.5, // (3 accidents × 1 000 000) / 80 000 heures
    tg: 0.75, // (18 jours × 1 000) / 24 000 heures
    epiDistribues: 38,
    visitesMedicales: { total:12, aJour:11 },
  },

  // Environnement
  environnement: {
    dechets: [
      { type:'Gravats inertes', tonnage:42.5, filiere:'ISDI', valorise:true },
      { type:'Bois', tonnage:8.2, filiere:'Centre tri', valorise:true },
      { type:'Métaux', tonnage:3.1, filiere:'Recyclage', valorise:true },
      { type:'Plâtre', tonnage:2.8, filiere:'ISDND', valorise:false },
      { type:'Amiante', tonnage:0.35, filiere:'ISDD', valorise:false },
      { type:'Peintures/solvants', tonnage:0.23, filiere:'ISDD', valorise:false },
      { type:'DIB mélangés', tonnage:5.4, filiere:'Centre tri', valorise:true },
    ],
    eau: '420 m³',
    energie: '15 800 kWh',
    co2: '5.2 tonnes éq. CO2',
    tauxValorisation: 72,
    bsdd: { emis:8, traites:7 },
  },

  // Conformité
  conformite: [
    { domaine:'DUERP', statut:'Conforme', detail:'Mis à jour mars et octobre' },
    { domaine:'Registre sécurité', statut:'Conforme', detail:'Tenu à jour mensuellement' },
    { domaine:'Habilitations électriques', statut:'Partiel', detail:'1 salarié en retard (prévu Q1)' },
    { domaine:'CACES', statut:'Conforme', detail:'Tous les conducteurs à jour' },
    { domaine:'Amiante SS4', statut:'Conforme', detail:'2 salariés formés' },
    { domaine:'Registre déchets', statut:'Conforme', detail:'BSDD archivés 5 ans' },
    { domaine:'Affichages obligatoires', statut:'Conforme', detail:'Vérifiés trimestriellement' },
    { domaine:'EPI', statut:'Conforme', detail:'Attribution individuelle signée' },
  ],

  // Formations
  formations: [
    { intitule:'SST (Sauveteur Secouriste)', nb:3, duree:'14h', organisme:'INRS', statut:'Réalisée' },
    { intitule:'CACES R489 cat. 3', nb:2, duree:'21h', organisme:'AFTRAL', statut:'Réalisée' },
    { intitule:'Habilitation électrique BR', nb:1, duree:'14h', organisme:'APAVE', statut:'Réalisée' },
    { intitule:'Travail en hauteur', nb:4, duree:'7h', organisme:'Interne', statut:'Réalisée' },
    { intitule:'Accueil sécurité nouveaux', nb:3, duree:'4h', organisme:'Interne', statut:'Réalisée' },
    { intitule:'Gestes et postures', nb:8, duree:'7h', organisme:'Kiné entreprise', statut:'Réalisée' },
    { intitule:'Amiante SS4 recyclage', nb:2, duree:'7h', organisme:'AFPA', statut:'Reportée Q1' },
    { intitule:'Éco-gestes chantier', nb:12, duree:'2h', organisme:'Interne', statut:'Réalisée' },
  ],

  // Budget
  budget: {
    total: 22400,
    details: [
      { poste:'EPI & équipements sécurité', montant:4800 },
      { poste:'Formations obligatoires', montant:6200 },
      { poste:'Formations complémentaires', montant:1800 },
      { poste:'Certifications & audits', montant:3400 },
      { poste:'Gestion des déchets', montant:2600 },
      { poste:'Visites médicales', montant:1800 },
      { poste:'Matériel de prévention', montant:1800 },
    ],
    parSalarie: 1867,
    evolution: '+15% vs N-1',
  },

  // Plan d'actions
  actions: [
    { action:'Mise à jour DUERP semestrielle', resp:'QSE', ech:'Mars / Sept', statut:'Réalisé', cat:'S' },
    { action:'Formation CACES R489 — 2 salariés', resp:'RH', ech:'Q1', statut:'Réalisé', cat:'S' },
    { action:'Renouvellement QUALIBAT Peinture', resp:'Direction', ech:'Q2', statut:'En retard', cat:'Q' },
    { action:'Tri sélectif 3 chantiers pilotes', resp:'Chefs chantier', ech:'Q2', statut:'Réalisé', cat:'E' },
    { action:'Audit interne qualité', resp:'QSE', ech:'Mars', statut:'Réalisé', cat:'Q' },
    { action:'Habilitation électrique BR — 1 salarié', resp:'RH', ech:'Q3', statut:'Réalisé', cat:'S' },
    { action:'Exercice évacuation incendie', resp:'QSE', ech:'Q3', statut:'Réalisé', cat:'S' },
    { action:'Campagne sensibilisation EPI', resp:'QSE', ech:'Continu', statut:'Réalisé', cat:'S' },
    { action:'Bilan carbone simplifié', resp:'Direction', ech:'Q4', statut:'En cours', cat:'E' },
    { action:'Formation SST recyclage 4 salariés', resp:'RH', ech:'Q4', statut:'Planifié', cat:'S' },
    { action:'Audit fournisseur déchets dangereux', resp:'QSE', ech:'Q4', statut:'Planifié', cat:'E' },
    { action:'Mise en conformité échafaudages', resp:'Chef chantier', ech:'Q3', statut:'Réalisé', cat:'S' },
  ],

  // Objectifs N+1
  objectifsN1Next: [
    { objectif:'Zéro accident avec arrêt > 3 jours', indicateur:'Nb AT avec arrêt', cible:'0' },
    { objectif:'TF < 20', indicateur:'Taux de fréquence', cible:'< 20' },
    { objectif:'100% habilitations à jour', indicateur:'% habilitations valides', cible:'100%' },
    { objectif:'Taux valorisation déchets > 80%', indicateur:'% déchets valorisés', cible:'> 80%' },
    { objectif:'Obtenir le label Éco Artisan', indicateur:'Label obtenu', cible:'Oui' },
    { objectif:'Réduire consommation énergie -10%', indicateur:'kWh / chantier', cible:'-10%' },
    { objectif:'2 audits internes / an', indicateur:'Nb audits', cible:'2' },
    { objectif:'Note satisfaction client > 4.7/5', indicateur:'Note moyenne', cible:'> 4.7' },
  ],
};

const D_EMPTY = {
  structure: '', siret: '', effectif: 0, chantiers: 0, ca: '0',
  objectifsN1: [], qualite: { nc: [], reclamations: 0, satisfaction: 0, audits: [] },
  securite: { accidents: [], presquAccidents: [], heuresTravaillees: 0, tf: 0, tg: 0, epiDistribues: 0, visitesMedicales: { total: 0, aJour: 0 } },
  environnement: { dechets: [], eau: '0', energie: '0', co2: '0', tauxValorisation: 0, bsdd: { emis: 0, traites: 0 } },
  conformite: [], formations: [],
  budget: { total: 0, details: [], parSalarie: 0, evolution: '' },
  actions: [], objectifsN1Next: [],
};

export default function RapportAnnuelQHSE() {
  const isDemo = _isDemo();
  const D = isDemo ? D_DEMO : D_EMPTY;
  const actionsRealisees = D.actions.filter(a=>a.statut==='Réalisé').length;
  const tauxRealisation = D.actions.length > 0 ? Math.round(actionsRealisees/D.actions.length*100) : 0;
  const totalTonnage = D.environnement.dechets.reduce((s,d)=>s+d.tonnage,0);
  const tonnageValorise = D.environnement.dechets.filter(d=>d.valorise).reduce((s,d)=>s+d.tonnage,0);
  const objAtteints = D.objectifsN1.filter(o=>o.atteint).length;

  const exportFullReport = () => {
    let r = '';
    r += `${'═'.repeat(60)}\n`;
    r += `       RAPPORT ANNUEL QHSE — ${ANNEE}\n`;
    r += `       ${D.structure}\n`;
    r += `       SIRET : ${D.siret}\n`;
    r += `       Service QHSE\n`;
    r += `${'═'.repeat(60)}\n\n`;
    r += `SOMMAIRE\n${'─'.repeat(40)}\n1. Introduction\n2. Politique QHSE\n3. Bilan des objectifs N-1\n4. Performance Qualité\n5. Performance Sécurité\n6. Performance Environnement\n7. Conformité réglementaire\n8. Audits et contrôles\n9. Formation et sensibilisation\n10. Plan d'actions global\n11. Perspectives et objectifs N+1\n12. Conclusion\nAnnexes\n\n`;

    r += `${'═'.repeat(60)}\n1. INTRODUCTION\n${'─'.repeat(40)}\n\n`;
    r += `${D.structure} est une entreprise du bâtiment et des travaux publics employant ${D.effectif} salariés. Au cours de l'année ${ANNEE}, l'entreprise a réalisé ${D.chantiers} chantiers pour un chiffre d'affaires de ${D.ca} €.\n\nLe présent rapport dresse le bilan annuel de la démarche Qualité, Hygiène, Sécurité et Environnement, conformément aux exigences réglementaires et aux engagements de la direction.\n\n`;

    r += `${'═'.repeat(60)}\n2. POLITIQUE QHSE\n${'─'.repeat(40)}\n\n`;
    r += `La direction de ${D.structure} s'engage à :\n- Garantir la sécurité et la santé de chaque collaborateur sur tous les chantiers\n- Assurer la qualité des prestations et la satisfaction des clients\n- Réduire l'impact environnemental de nos activités\n- Respecter les exigences réglementaires et normatives\n- Améliorer continuellement nos performances QHSE\n\n`;

    r += `${'═'.repeat(60)}\n3. BILAN DES OBJECTIFS N-1\n${'─'.repeat(40)}\n\n`;
    r += `Résultat global : ${objAtteints}/${D.objectifsN1.length} objectifs atteints (${Math.round(objAtteints/D.objectifsN1.length*100)}%)\n\n`;
    D.objectifsN1.forEach(o => { r += `${o.atteint?'✓':'✗'} ${o.obj}\n  Résultat : ${o.resultat}\n  Analyse : ${o.analyse}\n\n`; });

    r += `${'═'.repeat(60)}\n4. PERFORMANCE QUALITÉ\n${'─'.repeat(40)}\n\n`;
    r += `Non-conformités : ${D.qualite.nc.length} (dont ${D.qualite.nc.filter(n=>n.statut==='Clôturée').length} clôturées)\nRéclamations clients : ${D.qualite.reclamations}\nSatisfaction client : ${D.qualite.satisfaction}/5\n\nDétail des non-conformités :\n`;
    D.qualite.nc.forEach(n => { r += `  ${n.ref} | ${n.date} | ${n.nature} | ${n.gravite} | ${n.statut}\n`; });
    r += `\n[ANALYSE] Le nombre de NC est en hausse par rapport à N-1. Les NC majeures concernent des défauts d'exécution liés à la sous-traitance. Actions : renforcement des contrôles intermédiaires.\n\n`;

    r += `${'═'.repeat(60)}\n5. PERFORMANCE SÉCURITÉ\n${'─'.repeat(40)}\n\n`;
    r += `Accidents du travail : ${D.securite.accidents.length}\nJours d'arrêt : ${D.securite.accidents.reduce((s,a)=>s+a.arret,0)}\nPresqu'accidents déclarés : ${D.securite.presquAccidents.length}\nHeures travaillées : ${D.securite.heuresTravaillees.toLocaleString()}\nTaux de fréquence (TF) : ${D.securite.tf}\nTaux de gravité (TG) : ${D.securite.tg}\nEPI distribués : ${D.securite.epiDistribues}\nVisites médicales à jour : ${D.securite.visitesMedicales.aJour}/${D.securite.visitesMedicales.total}\n\nDétail des accidents :\n`;
    D.securite.accidents.forEach(a => { r += `  ${a.date} | ${a.victime} | ${a.nature} | ${a.arret}j arrêt | Cause : ${a.cause}\n  → Mesures : ${a.mesures}\n\n`; });
    r += `[ANALYSE] Le TF de ${D.securite.tf} reste au-dessus de l'objectif (< 25). Les accidents sont liés à des défauts d'organisation du poste de travail. La politique de déclaration des presqu'accidents (${D.securite.presquAccidents.length}) montre une bonne culture sécurité.\n\n`;

    r += `${'═'.repeat(60)}\n6. PERFORMANCE ENVIRONNEMENT\n${'─'.repeat(40)}\n\n`;
    r += `Tonnage total déchets : ${totalTonnage.toFixed(1)} tonnes\nDont déchets dangereux : ${D.environnement.dechets.filter(d=>!d.valorise&&d.filiere==='ISDD').reduce((s,d)=>s+d.tonnage,0).toFixed(2)} tonnes\nTaux de valorisation : ${D.environnement.tauxValorisation}%\nBSDD émis : ${D.environnement.bsdd.emis} | traités : ${D.environnement.bsdd.traites}\nConsommation eau : ${D.environnement.eau}\nConsommation énergie : ${D.environnement.energie}\nEmissions CO2 : ${D.environnement.co2}\n\nDétail par type de déchet :\n`;
    D.environnement.dechets.forEach(d => { r += `  ${d.type} : ${d.tonnage}t → ${d.filiere} ${d.valorise?'(valorisé)':''}\n`; });
    r += `\n[ANALYSE] Objectif de 70% de valorisation atteint (72%). Les déchets dangereux sont correctement tracés via BSDD. Axe d'amélioration : réduire les DIB mélangés.\n\n`;

    r += `${'═'.repeat(60)}\n7. CONFORMITÉ RÉGLEMENTAIRE\n${'─'.repeat(40)}\n\n`;
    D.conformite.forEach(c => { r += `  ${c.statut==='Conforme'?'✓':'⚠'} ${c.domaine} — ${c.statut} — ${c.detail}\n`; });
    r += `\nTaux de conformité : ${D.conformite.filter(c=>c.statut==='Conforme').length}/${D.conformite.length} (${Math.round(D.conformite.filter(c=>c.statut==='Conforme').length/D.conformite.length*100)}%)\n\n`;

    r += `${'═'.repeat(60)}\n8. AUDITS ET CONTRÔLES\n${'─'.repeat(40)}\n\n`;
    D.qualite.audits.forEach(a => { r += `  ${a.date} | ${a.type} | Résultat : ${a.resultat} | Actions : ${a.actions}\n`; });
    r += `\n`;

    r += `${'═'.repeat(60)}\n9. FORMATION ET SENSIBILISATION\n${'─'.repeat(40)}\n\n`;
    r += `Formations réalisées : ${D.formations.filter(f=>f.statut==='Réalisée').length}/${D.formations.length}\nTaux de participation : ${Math.round(D.formations.filter(f=>f.statut==='Réalisée').length/D.formations.length*100)}%\n\n`;
    D.formations.forEach(f => { r += `  ${f.intitule} | ${f.nb} pers. | ${f.duree} | ${f.organisme} | ${f.statut}\n`; });
    r += `\n`;

    r += `${'═'.repeat(60)}\n10. PLAN D'ACTIONS GLOBAL\n${'─'.repeat(40)}\n\n`;
    r += `Taux de réalisation : ${tauxRealisation}% (${actionsRealisees}/${D.actions.length})\n\n`;
    D.actions.forEach(a => { r += `  [${a.statut}] ${a.action} | ${a.resp} | ${a.ech} | ${a.cat==='S'?'Sécurité':a.cat==='Q'?'Qualité':'Environnement'}\n`; });
    r += `\n`;

    r += `${'═'.repeat(60)}\n11. PERSPECTIVES ET OBJECTIFS N+1\n${'─'.repeat(40)}\n\n`;
    D.objectifsN1Next.forEach(o => { r += `  → ${o.objectif}\n    Indicateur : ${o.indicateur} | Cible : ${o.cible}\n\n`; });

    r += `${'═'.repeat(60)}\n12. CONCLUSION\n${'─'.repeat(40)}\n\n`;
    r += `L'année ${ANNEE} a été marquée par une activité soutenue (${D.chantiers} chantiers) avec des résultats QHSE contrastés :\n\n`;
    r += `Points positifs :\n- Objectif valorisation déchets atteint (72%)\n- 100% des chefs d'équipe formés SST\n- Bonne culture de déclaration des presqu'accidents\n- Maintien des qualifications QUALIBAT\n\n`;
    r += `Axes d'amélioration :\n- Taux de fréquence AT à réduire (objectif < 20)\n- Renforcer le contrôle qualité en sous-traitance\n- Accélérer le renouvellement des certifications\n\n`;
    r += `Le budget QHSE a été porté à ${D.budget.total.toLocaleString()} € (+15%), démontrant l'engagement de la direction dans la démarche d'amélioration continue.\n\n`;

    r += `${'═'.repeat(60)}\nANNEXES\n${'─'.repeat(40)}\n\n`;
    r += `A1. Budget QHSE détaillé\n`;
    r += `Budget total : ${D.budget.total.toLocaleString()} € | Par salarié : ${D.budget.parSalarie} €/an | Évolution : ${D.budget.evolution}\n\n`;
    D.budget.details.forEach(b => { r += `  ${b.poste} : ${b.montant.toLocaleString()} € (${Math.round(b.montant/D.budget.total*100)}%)\n`; });
    r += `\n\nRapport généré le ${new Date().toLocaleDateString('fr-FR')} — Service QHSE — ${D.structure}\n`;

    const blob = new Blob([r], { type:'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `Rapport_Annuel_QHSE_${ANNEE}_${D.structure.replace(/\s/g,'_')}.txt`; a.click();
  };

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      {/* Actions */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, margin:0 }}>Rapport Annuel QHSE — {ANNEE}</h2>
          <p style={{ fontSize:13, color:'#555', margin:'4px 0 0' }}>{D.structure} · {D.effectif} salariés · {D.chantiers} chantiers</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>window.print()} style={BTN_O}>Imprimer / PDF</button>
          <button onClick={exportFullReport} style={BTN}>Exporter rapport complet</button>
        </div>
      </div>

      {/* ══ 1. INTRODUCTION ══ */}
      <h2 style={H1}>1. Introduction</h2>
      <p style={P}>{D.structure} est une entreprise du bâtiment employant <strong>{D.effectif} salariés</strong>. Au cours de l'année {ANNEE}, l'entreprise a réalisé <strong>{D.chantiers} chantiers</strong> pour un chiffre d'affaires de <strong>{D.ca} €</strong>.</p>
      <p style={P}>Le présent rapport dresse le bilan annuel de la démarche Qualité, Hygiène, Sécurité et Environnement, conformément aux exigences réglementaires et aux engagements de la direction.</p>

      {/* ══ 2. POLITIQUE QHSE ══ */}
      <h2 style={H1}>2. Politique QHSE</h2>
      <div style={ENCADRE('#2563EB')}>
        <strong>Engagement de la direction</strong><br/>
        La direction s'engage à garantir la sécurité de chaque collaborateur, assurer la qualité des prestations, réduire l'impact environnemental et améliorer continuellement les performances QHSE.
      </div>

      {/* ══ 3. BILAN OBJECTIFS N-1 ══ */}
      <h2 style={H1}>3. Bilan des objectifs N-1</h2>
      <p style={P}><strong>{objAtteints}/{D.objectifsN1.length}</strong> objectifs atteints ({Math.round(objAtteints/D.objectifsN1.length*100)}%)</p>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16 }}>
        <thead><tr style={{ background:'#F2F2F7' }}>
          <th style={TH}>Objectif</th><th style={TH}>Résultat</th><th style={TH}>Atteint</th>
        </tr></thead>
        <tbody>{D.objectifsN1.map((o,i)=>(
          <tr key={i}><td style={TD}>{o.obj}</td><td style={TD}>{o.resultat}</td><td style={{...TD,color:o.atteint?'#16A34A':'#DC2626',fontWeight:700}}>{o.atteint?'✓ Oui':'✗ Non'}</td></tr>
        ))}</tbody>
      </table>
      {D.objectifsN1.filter(o=>!o.atteint).map((o,i)=>(
        <div key={i} style={ENCADRE('#D97706')}><strong>Analyse — {o.obj} :</strong> {o.analyse}</div>
      ))}

      {/* ══ 4. PERFORMANCE QUALITÉ ══ */}
      <h2 style={H1}>4. Performance Qualité</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
        {[{l:'Non-conformités',v:D.qualite.nc.length,c:'#2563EB'},{l:'Satisfaction',v:`${D.qualite.satisfaction}/5`,c:DS.gold},{l:'Réclamations',v:D.qualite.reclamations,c:'#D97706'}].map(k=>(
          <div key={k.l} style={{...CARD,textAlign:'center',position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:3,background:k.c,borderRadius:'14px 14px 0 0'}}/><div style={{fontSize:28,fontWeight:300,color:k.c}}>{k.v}</div><div style={{fontSize:11,color:'#555'}}>{k.l}</div></div>
        ))}
      </div>
      <h3 style={H3}>Détail des non-conformités</h3>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Réf</th><th style={TH}>Date</th><th style={TH}>Nature</th><th style={TH}>Gravité</th><th style={TH}>Statut</th></tr></thead>
        <tbody>{D.qualite.nc.map(n=>(<tr key={n.ref}><td style={{...TD,fontWeight:600}}>{n.ref}</td><td style={TD}>{n.date}</td><td style={TD}>{n.nature}</td><td style={{...TD,color:n.gravite==='Majeure'?'#DC2626':'#D97706',fontWeight:600}}>{n.gravite}</td><td style={{...TD,color:n.statut==='Clôturée'?'#16A34A':'#D97706'}}>{n.statut}</td></tr>))}</tbody>
      </table>

      {/* ══ 5. PERFORMANCE SÉCURITÉ ══ */}
      <h2 style={H1}>5. Performance Sécurité</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[{l:'Accidents AT',v:D.securite.accidents.length,c:'#DC2626'},{l:'Jours arrêt',v:D.securite.accidents.reduce((s,a)=>s+a.arret,0),c:'#DC2626'},{l:'TF',v:D.securite.tf,c:'#D97706'},{l:'TG',v:D.securite.tg,c:'#D97706'}].map(k=>(
          <div key={k.l} style={{...CARD,textAlign:'center',position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:3,background:k.c,borderRadius:'14px 14px 0 0'}}/><div style={{fontSize:28,fontWeight:300,color:k.c}}>{k.v}</div><div style={{fontSize:11,color:'#555'}}>{k.l}</div></div>
        ))}
      </div>
      <h3 style={H3}>Détail des accidents</h3>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Date</th><th style={TH}>Victime</th><th style={TH}>Nature</th><th style={TH}>Cause</th><th style={TH}>Arrêt</th></tr></thead>
        <tbody>{D.securite.accidents.map((a,i)=>(<tr key={i}><td style={TD}>{a.date}</td><td style={{...TD,fontWeight:600}}>{a.victime}</td><td style={TD}>{a.nature}</td><td style={TD}>{a.cause}</td><td style={{...TD,fontWeight:600,color:'#DC2626'}}>{a.arret}j</td></tr>))}</tbody>
      </table>
      <div style={ENCADRE('#DC2626')}><strong>Analyse :</strong> Le TF de {D.securite.tf} reste supérieur à l'objectif ({'<'} 25). Les 3 accidents sont liés à des défauts d'organisation du poste de travail. La politique de déclaration des presqu'accidents ({D.securite.presquAccidents.length} déclarés) démontre une bonne culture sécurité.</div>

      {/* ══ 6. PERFORMANCE ENVIRONNEMENT ══ */}
      <h2 style={H1}>6. Performance Environnement</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[{l:'Déchets',v:`${totalTonnage.toFixed(1)}t`,c:'#D97706'},{l:'Valorisation',v:`${D.environnement.tauxValorisation}%`,c:'#16A34A'},{l:'Énergie',v:D.environnement.energie,c:'#2563EB'},{l:'CO2',v:D.environnement.co2,c:'#D97706'}].map(k=>(
          <div key={k.l} style={{...CARD,textAlign:'center',position:'relative'}}><div style={{position:'absolute',top:0,left:0,right:0,height:3,background:k.c,borderRadius:'14px 14px 0 0'}}/><div style={{fontSize:18,fontWeight:300,color:k.c}}>{k.v}</div><div style={{fontSize:11,color:'#555'}}>{k.l}</div></div>
        ))}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Type déchet</th><th style={TH}>Tonnage</th><th style={TH}>Filière</th><th style={TH}>Valorisé</th></tr></thead>
        <tbody>{D.environnement.dechets.map((d,i)=>(<tr key={i}><td style={TD}>{d.type}</td><td style={{...TD,fontWeight:600}}>{d.tonnage}t</td><td style={TD}>{d.filiere}</td><td style={{...TD,color:d.valorise?'#16A34A':'#DC2626'}}>{d.valorise?'Oui':'Non'}</td></tr>))}</tbody>
      </table>

      {/* ══ 7. CONFORMITÉ ══ */}
      <h2 style={H1}>7. Conformité réglementaire</h2>
      <p style={P}>Taux de conformité : <strong>{D.conformite.filter(c=>c.statut==='Conforme').length}/{D.conformite.length}</strong> ({Math.round(D.conformite.filter(c=>c.statut==='Conforme').length/D.conformite.length*100)}%)</p>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Domaine</th><th style={TH}>Statut</th><th style={TH}>Détail</th></tr></thead>
        <tbody>{D.conformite.map((c,i)=>(<tr key={i}><td style={{...TD,fontWeight:600}}>{c.domaine}</td><td style={{...TD,color:c.statut==='Conforme'?'#16A34A':'#D97706',fontWeight:600}}>{c.statut}</td><td style={TD}>{c.detail}</td></tr>))}</tbody>
      </table>

      {/* ══ 8. AUDITS ══ */}
      <h2 style={H1}>8. Audits et contrôles</h2>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Type</th><th style={TH}>Date</th><th style={TH}>Résultat</th><th style={TH}>Actions</th></tr></thead>
        <tbody>{D.qualite.audits.map((a,i)=>(<tr key={i}><td style={{...TD,fontWeight:600}}>{a.type}</td><td style={TD}>{a.date}</td><td style={TD}>{a.resultat}</td><td style={TD}>{a.actions}</td></tr>))}</tbody>
      </table>

      {/* ══ 9. FORMATION ══ */}
      <h2 style={H1}>9. Formation et sensibilisation</h2>
      <p style={P}>Formations réalisées : <strong>{D.formations.filter(f=>f.statut==='Réalisée').length}/{D.formations.length}</strong> · Taux : {Math.round(D.formations.filter(f=>f.statut==='Réalisée').length/D.formations.length*100)}%</p>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Formation</th><th style={TH}>Pers.</th><th style={TH}>Durée</th><th style={TH}>Organisme</th><th style={TH}>Statut</th></tr></thead>
        <tbody>{D.formations.map((f,i)=>(<tr key={i}><td style={{...TD,fontWeight:600}}>{f.intitule}</td><td style={TD}>{f.nb}</td><td style={TD}>{f.duree}</td><td style={TD}>{f.organisme}</td><td style={{...TD,color:f.statut==='Réalisée'?'#16A34A':'#D97706'}}>{f.statut}</td></tr>))}</tbody>
      </table>

      {/* ══ 10. PLAN D'ACTIONS ══ */}
      <h2 style={H1}>10. Plan d'actions global</h2>
      <p style={P}>Taux de réalisation : <strong>{tauxRealisation}%</strong> ({actionsRealisees}/{D.actions.length})</p>
      <div style={{ height:8, background:'#E8E6E1', borderRadius:4, marginBottom:16 }}><div style={{ height:8, background:'#16A34A', borderRadius:4, width:`${tauxRealisation}%` }}/></div>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Action</th><th style={TH}>Resp.</th><th style={TH}>Éch.</th><th style={TH}>Cat.</th><th style={TH}>Statut</th></tr></thead>
        <tbody>{D.actions.map((a,i)=>{
          const sc = {Réalisé:'#16A34A','En cours':'#D97706','En retard':'#DC2626',Planifié:'#2563EB'};
          return <tr key={i}><td style={{...TD,fontWeight:500}}>{a.action}</td><td style={TD}>{a.resp}</td><td style={TD}>{a.ech}</td><td style={{...TD,fontSize:10,fontWeight:600,color:a.cat==='S'?'#DC2626':a.cat==='Q'?'#2563EB':'#D97706'}}>{a.cat==='S'?'Sécu':a.cat==='Q'?'Qual':'Env'}</td><td style={{...TD,color:sc[a.statut],fontWeight:600}}>{a.statut}</td></tr>;
        })}</tbody>
      </table>

      {/* ══ 11. OBJECTIFS N+1 ══ */}
      <h2 style={H1}>11. Perspectives et objectifs {ANNEE+1}</h2>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Objectif</th><th style={TH}>Indicateur</th><th style={TH}>Cible</th></tr></thead>
        <tbody>{D.objectifsN1Next.map((o,i)=>(<tr key={i}><td style={{...TD,fontWeight:600}}>{o.objectif}</td><td style={TD}>{o.indicateur}</td><td style={{...TD,fontWeight:700,color:DS.gold}}>{o.cible}</td></tr>))}</tbody>
      </table>

      {/* ══ 12. CONCLUSION ══ */}
      <h2 style={H1}>12. Conclusion</h2>
      <p style={P}>L'année {ANNEE} a été marquée par une activité soutenue ({D.chantiers} chantiers) avec des résultats QHSE contrastés.</p>
      <div style={ENCADRE('#16A34A')}>
        <strong>Points positifs :</strong><br/>
        • Objectif valorisation déchets atteint ({D.environnement.tauxValorisation}%)<br/>
        • 100% des chefs d'équipe formés SST<br/>
        • Bonne culture de déclaration des presqu'accidents ({D.securite.presquAccidents.length})<br/>
        • Maintien des qualifications QUALIBAT
      </div>
      <div style={ENCADRE('#DC2626')}>
        <strong>Axes d'amélioration :</strong><br/>
        • Taux de fréquence AT à réduire (objectif {'<'} 20)<br/>
        • Renforcer le contrôle qualité en sous-traitance<br/>
        • Accélérer le renouvellement des certifications
      </div>
      <p style={P}>Le budget QHSE a été porté à <strong>{D.budget.total.toLocaleString()} €</strong> ({D.budget.evolution}), soit <strong>{D.budget.parSalarie} € par salarié</strong>, démontrant l'engagement de la direction dans la démarche d'amélioration continue.</p>

      {/* ══ ANNEXES ══ */}
      <h2 style={H1}>Annexes</h2>
      <h3 style={H3}>A1. Budget QHSE détaillé</h3>
      <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
        <thead><tr style={{background:'#F2F2F7'}}><th style={TH}>Poste</th><th style={TH}>Montant</th><th style={TH}>%</th></tr></thead>
        <tbody>{D.budget.details.map((b,i)=>(<tr key={i}><td style={TD}>{b.poste}</td><td style={{...TD,fontWeight:600}}>{b.montant.toLocaleString()} €</td><td style={TD}>{Math.round(b.montant/D.budget.total*100)}%</td></tr>))}</tbody>
        <tfoot><tr style={{background:'#F2F2F7'}}><td style={{...TD,fontWeight:700}}>TOTAL</td><td style={{...TD,fontWeight:700}}>{D.budget.total.toLocaleString()} €</td><td style={{...TD,fontWeight:700}}>100%</td></tr></tfoot>
      </table>

      <div style={{ textAlign:'center', padding:'24px 0', color:'#555', fontSize:12, borderTop:'1px solid #E8E6E1', marginTop:24 }}>
        Rapport généré le {new Date().toLocaleDateString('fr-FR')} — Service QHSE — {D.structure}
      </div>
    </div>
  );
}
