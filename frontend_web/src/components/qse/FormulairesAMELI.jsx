import React, { useState } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const LBL = { fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };
const SEP = () => <div style={{height:1,background:'#E8E6E1',margin:'12px 0'}}/>;

// Données employeur (en prod viendrait du profil entreprise)
const EMPLOYEUR = { nom:'Freample Artisans BTP', siret:'123 456 789 000 12', adresse:'24 rue de la Liberté, 06000 Nice', codeRisque:'452BB', tel:'04 93 XX XX XX', email:'contact@freample.com' };

// Salariés démo (en prod viendrait de l'API /rh/employes)
const SALARIES = [
  { id:1, nom:'Martin', prenom:'Jean', numSecu:'1 85 06 75 123 456 78', dateNaissance:'15/06/1985', nationalite:'Française', poste:'Maçon qualifié', qualification:'N3P2', dateEmbauche:'01/09/2024', typeContrat:'CDI', salaireBase:2800, adresse:'12 rue Pastorelli, 06000 Nice' },
  { id:2, nom:'Duval', prenom:'Sophie', numSecu:'2 90 03 06 789 012 34', dateNaissance:'08/03/1990', nationalite:'Française', poste:'Électricienne', qualification:'N3P1', dateEmbauche:'01/10/2025', typeContrat:'CDI', salaireBase:2600, adresse:'8 av de la Libération, 06000 Nice' },
  { id:3, nom:'Lambert', prenom:'Marc', numSecu:'1 82 11 06 456 789 01', dateNaissance:'22/11/1982', nationalite:'Française', poste:'Plombier', qualification:'N3P2', dateEmbauche:'15/03/2026', typeContrat:'CDI', salaireBase:2700, adresse:'3 bd Gambetta, 06000 Nice' },
  { id:4, nom:'Garcia', prenom:'Lucas', numSecu:'1 88 07 75 234 567 89', dateNaissance:'21/07/1988', nationalite:'Française', poste:'Peintre', qualification:'N2P2', dateEmbauche:'01/04/2026', typeContrat:'CDD', salaireBase:2400, adresse:'7 rue Lepic, 75018 Paris' },
];

const FORMULAIRES = [
  { id:'at_declaration', cerfa:'S6200', titre:'Déclaration d\'accident du travail', desc:'À envoyer à la CPAM sous 48h. Pré-rempli avec les données du salarié et de l\'entreprise.', color:'#DC2626', obligatoire:true, delai:'48 heures' },
  { id:'at_feuille', cerfa:'S6201', titre:'Feuille d\'accident du travail / maladie professionnelle', desc:'À remettre au salarié victime le jour de l\'accident pour la prise en charge des soins.', color:'#DC2626', obligatoire:true, delai:'Jour même' },
  { id:'mp_declaration', cerfa:'S6100', titre:'Déclaration de maladie professionnelle', desc:'Déclaration ou demande de reconnaissance d\'une maladie professionnelle.', color:'#D97706', obligatoire:true, delai:'15 jours' },
  { id:'inaptitude', cerfa:'S6110', titre:'Demande d\'indemnité temporaire d\'inaptitude', desc:'Indemnité versée au salarié déclaré inapte suite à un AT/MP.', color:'#2563EB', obligatoire:false, delai:'—' },
  { id:'reprise_ipp', cerfa:'S6908', titre:'Reprise d\'activité après incapacité permanente', desc:'Gestion du retour à l\'emploi d\'un salarié en incapacité permanente partielle.', color:'#16A34A', obligatoire:false, delai:'—' },
  { id:'attestation_activite', cerfa:'S3207', titre:'Attestation annuelle d\'activité salariée', desc:'Attestation annuelle d\'emploi pour le régime général.', color:'#2563EB', obligatoire:true, delai:'Annuel' },
];

function genererFormulaire(formulaireId, salarie, champs) {
  const s = salarie;
  const e = EMPLOYEUR;
  const date = new Date().toLocaleDateString('fr-FR');
  const sep = '─'.repeat(55);
  const dsep = '═'.repeat(55);
  let txt = '';

  if (formulaireId === 'at_declaration') {
    txt += `${dsep}\n  DÉCLARATION D'ACCIDENT DU TRAVAIL\n  Cerfa S6200 — Art. L441-2 CSS\n  À envoyer à la CPAM sous 48 heures\n${dsep}\n\n`;
    txt += `1. EMPLOYEUR\n${sep}\n`;
    txt += `Raison sociale    : ${e.nom}\nSIRET             : ${e.siret}\nAdresse           : ${e.adresse}\nCode risque AT/MP : ${e.codeRisque}\nTéléphone         : ${e.tel}\n\n`;
    txt += `2. VICTIME\n${sep}\n`;
    txt += `Nom               : ${s.nom}\nPrénom            : ${s.prenom}\nN° Sécurité Soc.  : ${s.numSecu}\nDate de naissance  : ${s.dateNaissance}\nNationalité       : ${s.nationalite}\nAdresse           : ${s.adresse}\nQualification     : ${s.qualification}\nPoste occupé      : ${s.poste}\nDate d'embauche   : ${s.dateEmbauche}\nType de contrat   : ${s.typeContrat}\nAncienneté        : depuis le ${s.dateEmbauche}\n\n`;
    txt += `3. ACCIDENT\n${sep}\n`;
    txt += `Date              : ${champs.dateAccident || '[À COMPLÉTER]'}\nHeure             : ${champs.heureAccident || '[À COMPLÉTER]'}\nLieu              : ${champs.lieuAccident || '[À COMPLÉTER]'}\n\nActivité au moment de l'accident :\n${champs.activite || '[À COMPLÉTER]'}\n\n`;
    txt += `4. CIRCONSTANCES\n${sep}\n${champs.circonstances || '[À COMPLÉTER]'}\n\n`;
    txt += `5. LÉSIONS\n${sep}\nNature : ${champs.natureLesion || '[À COMPLÉTER]'}\nSiège  : ${champs.siegeLesion || '[À COMPLÉTER]'}\n\n`;
    txt += `6. TÉMOINS\n${sep}\n${champs.temoins || 'Aucun témoin'}\n\n`;
    txt += `7. ARRÊT DE TRAVAIL\n${sep}\nArrêt prescrit    : ${champs.arret || 'NON'}\n${champs.arret === 'OUI' ? `Du : ${champs.dateArret || '___'}\nDurée prévisible : ${champs.dureeArret || '___'} jours\n` : ''}\n`;
    txt += `8. PREMIERS SOINS\n${sep}\nSoins sur place   : ${champs.soinsSurPlace || '[ ] Oui  [ ] Non'}\nTransport urgences: ${champs.transport || '[ ] Oui  [ ] Non'}\nMédecin           : ${champs.medecin || '[À COMPLÉTER]'}\n\n`;
    txt += `${dsep}\nFait à ${e.adresse.split(',').pop()?.trim()}, le ${date}\n\nSignature employeur :\n\n\n_________________________________\n\n`;
    txt += `RAPPELS : Délai 48h · Amende 750€ · Remettre S6201 au salarié · Conserver 5 ans\n`;

  } else if (formulaireId === 'at_feuille') {
    txt += `${dsep}\n  FEUILLE D'ACCIDENT DU TRAVAIL\n  OU DE MALADIE PROFESSIONNELLE\n  Cerfa S6201 — À remettre au salarié\n${dsep}\n\n`;
    txt += `EMPLOYEUR\n${sep}\n${e.nom} · SIRET ${e.siret}\n${e.adresse}\n\n`;
    txt += `VICTIME\n${sep}\n${s.prenom} ${s.nom}\nN° SS : ${s.numSecu}\nNé(e) le ${s.dateNaissance}\nAdresse : ${s.adresse}\n\n`;
    txt += `ACCIDENT / MALADIE\n${sep}\nDate : ${champs.dateAccident || '[À COMPLÉTER]'}\nNature : ${champs.natureLesion || '[À COMPLÉTER]'}\n\n`;
    txt += `Cette feuille est à présenter à tout professionnel de\nsanté pour la prise en charge à 100% des soins liés à\nl'accident du travail ou la maladie professionnelle.\n\nValable jusqu'à la date de guérison ou consolidation.\n\n`;
    txt += `Fait le ${date}\nSignature employeur : _________________\n`;

  } else if (formulaireId === 'mp_declaration') {
    txt += `${dsep}\n  DÉCLARATION DE MALADIE PROFESSIONNELLE\n  Cerfa S6100 — Art. L461-5 CSS\n${dsep}\n\n`;
    txt += `EMPLOYEUR\n${sep}\n${e.nom} · SIRET ${e.siret} · ${e.adresse}\n\n`;
    txt += `SALARIÉ\n${sep}\n${s.prenom} ${s.nom} · N° SS ${s.numSecu}\nNé(e) le ${s.dateNaissance} · ${s.poste}\nDate d'embauche : ${s.dateEmbauche}\n\n`;
    txt += `MALADIE DÉCLARÉE\n${sep}\n`;
    txt += `Tableau MP n°     : ${champs.tableauMP || '[À COMPLÉTER]'}\n`;
    txt += `Désignation       : ${champs.designation || '[À COMPLÉTER]'}\n`;
    txt += `Date 1ère constat.: ${champs.dateConstatation || '[À COMPLÉTER]'}\n`;
    txt += `Date cessation    : ${champs.dateCessation || '[À COMPLÉTER]'}\n\n`;
    txt += `EXPOSITION AUX RISQUES\n${sep}\n`;
    txt += `Nature des travaux : ${champs.travaux || '[À COMPLÉTER]'}\n`;
    txt += `Durée d'exposition : ${champs.dureeExposition || '[À COMPLÉTER]'}\n`;
    txt += `Produits/agents    : ${champs.agents || '[À COMPLÉTER]'}\n\n`;
    txt += `Fait le ${date}\nSignature : _________________\n`;

  } else if (formulaireId === 'inaptitude') {
    txt += `${dsep}\n  DEMANDE D'INDEMNITÉ TEMPORAIRE D'INAPTITUDE\n  Cerfa S6110 — Art. L433-1 CSS\n${dsep}\n\n`;
    txt += `EMPLOYEUR : ${e.nom} · SIRET ${e.siret}\n\n`;
    txt += `SALARIÉ\n${sep}\n${s.prenom} ${s.nom} · N° SS ${s.numSecu}\n${s.poste} · Embauché le ${s.dateEmbauche}\nSalaire brut mensuel : ${s.salaireBase} €\n\n`;
    txt += `INAPTITUDE\n${sep}\n`;
    txt += `Date avis inaptitude : ${champs.dateInaptitude || '[À COMPLÉTER]'}\n`;
    txt += `Médecin du travail   : ${champs.medecinTravail || '[À COMPLÉTER]'}\n`;
    txt += `AT/MP d'origine      : ${champs.atOrigine || '[À COMPLÉTER]'}\n\n`;
    txt += `INDEMNITÉ DEMANDÉE\n${sep}\nMontant journalier de référence : ${(s.salaireBase / 30).toFixed(2)} €\n\n`;
    txt += `Fait le ${date}\nSignature : _________________\n`;

  } else if (formulaireId === 'reprise_ipp') {
    txt += `${dsep}\n  REPRISE D'ACTIVITÉ PROFESSIONNELLE\n  D'UNE VICTIME D'IPP\n  Cerfa S6908\n${dsep}\n\n`;
    txt += `EMPLOYEUR : ${e.nom} · SIRET ${e.siret}\n\n`;
    txt += `SALARIÉ\n${sep}\n${s.prenom} ${s.nom} · N° SS ${s.numSecu}\n${s.poste}\n\n`;
    txt += `REPRISE\n${sep}\n`;
    txt += `Date de reprise      : ${champs.dateReprise || '[À COMPLÉTER]'}\n`;
    txt += `Poste repris         : ${champs.posteReprise || s.poste}\n`;
    txt += `Aménagement poste    : ${champs.amenagement || '[ ] Oui  [ ] Non'}\n`;
    txt += `Taux IPP             : ${champs.tauxIPP || '[À COMPLÉTER]'} %\n\n`;
    txt += `Fait le ${date}\nSignature : _________________\n`;

  } else if (formulaireId === 'attestation_activite') {
    txt += `${dsep}\n  ATTESTATION ANNUELLE D'ACTIVITÉ SALARIÉE\n  Cerfa S3207 — Régime général\n${dsep}\n\n`;
    txt += `EMPLOYEUR\n${sep}\n${e.nom}\nSIRET : ${e.siret}\nAdresse : ${e.adresse}\n\n`;
    txt += `SALARIÉ\n${sep}\n${s.prenom} ${s.nom}\nN° SS : ${s.numSecu}\nNé(e) le : ${s.dateNaissance}\nAdresse : ${s.adresse}\n\n`;
    txt += `ACTIVITÉ\n${sep}\n`;
    txt += `Période         : du 01/01/${new Date().getFullYear()} au 31/12/${new Date().getFullYear()}\n`;
    txt += `Qualification   : ${s.qualification}\n`;
    txt += `Type contrat    : ${s.typeContrat}\n`;
    txt += `Salaire annuel  : ${(s.salaireBase * 12).toLocaleString()} € brut\n`;
    txt += `Date d'embauche : ${s.dateEmbauche}\n\n`;
    txt += `Je certifie que les renseignements ci-dessus sont exacts.\n\n`;
    txt += `Fait le ${date}\nSignature employeur : _________________\n`;
  }

  return txt;
}

export default function FormulairesAMELI() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedSalarie, setSelectedSalarie] = useState('');
  const [champs, setChamps] = useState({});
  const [preview, setPreview] = useState('');

  const salarie = SALARIES.find(s => s.id === Number(selectedSalarie));

  const genererPreview = () => {
    if (!selectedForm || !salarie) return;
    const txt = genererFormulaire(selectedForm, salarie, champs);
    setPreview(txt);
  };

  const exporter = () => {
    if (!preview) return;
    const form = FORMULAIRES.find(f => f.id === selectedForm);
    const blob = new Blob([preview], { type:'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${form?.cerfa || 'formulaire'}_${salarie?.nom || ''}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  };

  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 6px' }}>Formulaires AMELI / CPAM</h2>
      <p style={{ fontSize:12, color:'#555', marginBottom:16 }}>Sélectionnez un formulaire et un salarié — les données se remplissent automatiquement.</p>

      {!selectedForm && <>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:10 }}>
          {FORMULAIRES.map(f => (
            <div key={f.id} onClick={() => { setSelectedForm(f.id); setChamps({}); setPreview(''); }} style={{ ...CARD, cursor:'pointer', borderLeft:`4px solid ${f.color}`, transition:'all .15s' }} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <span style={{ fontSize:14, fontWeight:700 }}>{f.titre}</span>
                <span style={{ fontSize:10, fontWeight:700, color:f.color, background:`${f.color}12`, padding:'2px 8px', borderRadius:6, flexShrink:0 }}>Cerfa {f.cerfa}</span>
              </div>
              <div style={{ fontSize:11, color:'#555', lineHeight:1.5, marginBottom:6 }}>{f.desc}</div>
              <div style={{ display:'flex', gap:8, fontSize:10 }}>
                {f.obligatoire && <span style={{ color:'#DC2626', fontWeight:600 }}>Obligatoire</span>}
                {f.delai !== '—' && <span style={{ color:'#555' }}>Délai : {f.delai}</span>}
              </div>
            </div>
          ))}
        </div>
      </>}

      {selectedForm && <>
        <button onClick={() => { setSelectedForm(null); setPreview(''); }} style={{ ...BTN_O, marginBottom:12, fontSize:11 }}>← Retour aux formulaires</button>

        {(() => {
          const form = FORMULAIRES.find(f => f.id === selectedForm);
          return <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:5, height:28, borderRadius:3, background:form.color }} />
            <div>
              <h3 style={{ fontSize:16, fontWeight:800, margin:0 }}>{form.titre}</h3>
              <span style={{ fontSize:11, color:'#555' }}>Cerfa {form.cerfa} {form.obligatoire ? '· Obligatoire' : ''} {form.delai !== '—' ? `· Délai : ${form.delai}` : ''}</span>
            </div>
          </div>;
        })()}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Formulaire gauche */}
          <div style={CARD}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>1. Sélectionner le salarié</div>
            <select value={selectedSalarie} onChange={e => { setSelectedSalarie(e.target.value); setPreview(''); }} style={{ ...INP, marginBottom:12 }}>
              <option value="">— Choisir un salarié —</option>
              {SALARIES.map(s => <option key={s.id} value={s.id}>{s.prenom} {s.nom} — {s.poste}</option>)}
            </select>

            {salarie && <>
              <div style={{ background:'#F0FDF4', border:'1px solid #16A34A25', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:11 }}>
                <strong style={{ color:'#16A34A' }}>Données auto-remplies :</strong><br/>
                {salarie.prenom} {salarie.nom} · N° SS {salarie.numSecu}<br/>
                Né(e) le {salarie.dateNaissance} · {salarie.poste} · {salarie.typeContrat}<br/>
                Embauché le {salarie.dateEmbauche} · {salarie.salaireBase}€ brut/mois
              </div>

              <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>2. Compléter les champs spécifiques</div>

              {(selectedForm === 'at_declaration' || selectedForm === 'at_feuille') && <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                  <div><label style={LBL}>Date accident</label><input type="date" value={champs.dateAccident||''} onChange={e=>setChamps(c=>({...c,dateAccident:e.target.value}))} style={INP}/></div>
                  <div><label style={LBL}>Heure</label><input type="time" value={champs.heureAccident||''} onChange={e=>setChamps(c=>({...c,heureAccident:e.target.value}))} style={INP}/></div>
                </div>
                <div style={{marginBottom:8}}><label style={LBL}>Lieu de l'accident</label><input value={champs.lieuAccident||''} onChange={e=>setChamps(c=>({...c,lieuAccident:e.target.value}))} style={INP} placeholder="Adresse du chantier"/></div>
                {selectedForm === 'at_declaration' && <>
                  <div style={{marginBottom:8}}><label style={LBL}>Activité au moment de l'accident</label><input value={champs.activite||''} onChange={e=>setChamps(c=>({...c,activite:e.target.value}))} style={INP} placeholder="Pose de carrelage..."/></div>
                  <div style={{marginBottom:8}}><label style={LBL}>Circonstances détaillées</label><textarea value={champs.circonstances||''} onChange={e=>setChamps(c=>({...c,circonstances:e.target.value}))} rows={3} style={{...INP,resize:'vertical'}}/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                    <div><label style={LBL}>Nature des lésions</label><input value={champs.natureLesion||''} onChange={e=>setChamps(c=>({...c,natureLesion:e.target.value}))} style={INP} placeholder="Coupure, contusion..."/></div>
                    <div><label style={LBL}>Siège des lésions</label><input value={champs.siegeLesion||''} onChange={e=>setChamps(c=>({...c,siegeLesion:e.target.value}))} style={INP} placeholder="Main gauche, genou..."/></div>
                  </div>
                  <div style={{marginBottom:8}}><label style={LBL}>Témoins</label><input value={champs.temoins||''} onChange={e=>setChamps(c=>({...c,temoins:e.target.value}))} style={INP}/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
                    <div><label style={LBL}>Arrêt de travail</label><select value={champs.arret||'NON'} onChange={e=>setChamps(c=>({...c,arret:e.target.value}))} style={INP}><option>NON</option><option>OUI</option></select></div>
                    <div><label style={LBL}>Date arrêt</label><input type="date" value={champs.dateArret||''} onChange={e=>setChamps(c=>({...c,dateArret:e.target.value}))} style={INP}/></div>
                    <div><label style={LBL}>Durée (jours)</label><input type="number" value={champs.dureeArret||''} onChange={e=>setChamps(c=>({...c,dureeArret:e.target.value}))} style={INP}/></div>
                  </div>
                  <div style={{marginBottom:8}}><label style={LBL}>Médecin</label><input value={champs.medecin||''} onChange={e=>setChamps(c=>({...c,medecin:e.target.value}))} style={INP}/></div>
                </>}
              </>}

              {selectedForm === 'mp_declaration' && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>N° tableau MP</label><input value={champs.tableauMP||''} onChange={e=>setChamps(c=>({...c,tableauMP:e.target.value}))} style={INP} placeholder="Ex: 57, 30..."/></div>
                  <div><label style={LBL}>Désignation maladie</label><input value={champs.designation||''} onChange={e=>setChamps(c=>({...c,designation:e.target.value}))} style={INP}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>Date 1ère constatation</label><input type="date" value={champs.dateConstatation||''} onChange={e=>setChamps(c=>({...c,dateConstatation:e.target.value}))} style={INP}/></div>
                  <div><label style={LBL}>Durée d'exposition</label><input value={champs.dureeExposition||''} onChange={e=>setChamps(c=>({...c,dureeExposition:e.target.value}))} style={INP} placeholder="5 ans..."/></div>
                </div>
                <div style={{marginBottom:8}}><label style={LBL}>Nature des travaux exposants</label><textarea value={champs.travaux||''} onChange={e=>setChamps(c=>({...c,travaux:e.target.value}))} rows={2} style={{...INP,resize:'vertical'}}/></div>
                <div style={{marginBottom:8}}><label style={LBL}>Produits / agents</label><input value={champs.agents||''} onChange={e=>setChamps(c=>({...c,agents:e.target.value}))} style={INP} placeholder="Amiante, silice, bruit..."/></div>
              </>}

              {selectedForm === 'inaptitude' && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>Date avis d'inaptitude</label><input type="date" value={champs.dateInaptitude||''} onChange={e=>setChamps(c=>({...c,dateInaptitude:e.target.value}))} style={INP}/></div>
                  <div><label style={LBL}>Médecin du travail</label><input value={champs.medecinTravail||''} onChange={e=>setChamps(c=>({...c,medecinTravail:e.target.value}))} style={INP}/></div>
                </div>
                <div style={{marginBottom:8}}><label style={LBL}>AT/MP d'origine (réf.)</label><input value={champs.atOrigine||''} onChange={e=>setChamps(c=>({...c,atOrigine:e.target.value}))} style={INP} placeholder="Réf. dossier AT..."/></div>
              </>}

              {selectedForm === 'reprise_ipp' && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={LBL}>Date de reprise</label><input type="date" value={champs.dateReprise||''} onChange={e=>setChamps(c=>({...c,dateReprise:e.target.value}))} style={INP}/></div>
                  <div><label style={LBL}>Taux IPP (%)</label><input type="number" value={champs.tauxIPP||''} onChange={e=>setChamps(c=>({...c,tauxIPP:e.target.value}))} style={INP}/></div>
                </div>
                <div style={{marginBottom:8}}><label style={LBL}>Poste repris</label><input value={champs.posteReprise||salarie.poste} onChange={e=>setChamps(c=>({...c,posteReprise:e.target.value}))} style={INP}/></div>
                <div style={{marginBottom:8}}><label style={LBL}>Aménagement de poste</label><select value={champs.amenagement||'NON'} onChange={e=>setChamps(c=>({...c,amenagement:e.target.value}))} style={INP}><option>NON</option><option>OUI</option></select></div>
              </>}

              {/* Attestation n'a pas de champs supplémentaires */}

              <button onClick={genererPreview} style={{ ...BTN, width:'100%', padding:12, marginTop:8 }}>Générer le document</button>
            </>}
          </div>

          {/* Aperçu droit */}
          <div>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Aperçu du document</div>
            {preview ? <>
              <div style={{ background:'#FAFAF8', border:'1px solid #E8E6E1', borderRadius:8, padding:16, minHeight:300, maxHeight:500, overflowY:'auto', fontFamily:'monospace', fontSize:11, lineHeight:1.6, whiteSpace:'pre-wrap', color:'#333' }}>
                {preview}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button onClick={exporter} style={{ ...BTN, flex:1 }}>Télécharger</button>
                <button onClick={() => window.print()} style={{ ...BTN_O, flex:1 }}>Imprimer</button>
              </div>
            </> : (
              <div style={{ background:'#F8F7F4', border:'1px solid #E8E6E1', borderRadius:8, padding:40, textAlign:'center', color:'#555', fontSize:13 }}>
                {!salarie ? 'Sélectionnez un salarié pour commencer' : 'Complétez les champs puis cliquez "Générer"'}
              </div>
            )}
          </div>
        </div>
      </>}
    </div>
  );
}
