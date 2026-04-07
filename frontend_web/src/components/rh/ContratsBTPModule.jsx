import React, { useState } from 'react';
import DS from '../../design/ds';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };

const MODELES_BTP = [
  { id:1, cat:'Marchés', titre:'Contrat de sous-traitance BTP', desc:'Conforme loi du 31/12/1975. Clauses obligatoires : objet, prix, délais, assurances, paiement direct.' },
  { id:2, cat:'Marchés', titre:'Marché privé de travaux', desc:'Contrat entre maître d\'ouvrage et entreprise. Norme NF P 03-001.' },
  { id:3, cat:'Marchés', titre:'CCAP (Cahier des Clauses Administratives Particulières)', desc:'Clauses administratives du marché : pénalités, réception, garanties.' },
  { id:4, cat:'Marchés', titre:'CCTP (Cahier des Clauses Techniques Particulières)', desc:'Description technique des travaux, matériaux, normes applicables.' },
  { id:5, cat:'Marchés', titre:'Avenant au marché de travaux', desc:'Modification du contrat initial : prix, délais, prestations supplémentaires.' },
  { id:6, cat:'Marchés', titre:'Acte d\'engagement', desc:'Document par lequel l\'entreprise s\'engage sur les conditions du marché.' },
  { id:7, cat:'Sous-traitance', titre:'Déclaration de sous-traitance (DC4)', desc:'Formulaire obligatoire pour les marchés publics. Agrément du sous-traitant.' },
  { id:8, cat:'Sous-traitance', titre:'Contrat de cotraitance / groupement', desc:'Accord entre entreprises pour répondre ensemble à un marché.' },
  { id:9, cat:'Sous-traitance', titre:'Attestation de vigilance', desc:'Document URSSAF prouvant que le sous-traitant est à jour de ses obligations sociales.' },
  { id:10, cat:'Travail', titre:'Contrat de travail CDI BTP', desc:'Spécificités BTP : déplacements, indemnités, intempéries, caisse congés CIBTP.' },
  { id:11, cat:'Travail', titre:'Contrat de travail CDD BTP', desc:'CDD de chantier. Motif, durée, qualification, convention collective BTP.' },
  { id:12, cat:'Travail', titre:'Contrat intérimaire (mission)', desc:'Contrat de mise à disposition. ETT, motif de recours, durée, rémunération.' },
  { id:13, cat:'Travail', titre:'Contrat d\'apprentissage BTP', desc:'Formation en alternance. Maître d\'apprentissage, durée, rémunération (% SMIC).' },
  { id:14, cat:'Travail', titre:'Convention de stage', desc:'Stagiaire sur chantier. Encadrement, gratification, assurance.' },
  { id:15, cat:'Chantier', titre:'Ordre de service', desc:'Notification de démarrage des travaux. Date, délais, conditions.' },
  { id:16, cat:'Chantier', titre:'PV de réception des travaux', desc:'Constatation de l\'achèvement. Réserves, levée de réserves, GPA.' },
  { id:17, cat:'Chantier', titre:'PV de réception avec réserves', desc:'Réception sous réserves. Délai de levée, pénalités, retenue de garantie.' },
  { id:18, cat:'Chantier', titre:'Mise en demeure (retard travaux)', desc:'Sommation à l\'entreprise de respecter les délais contractuels.' },
  { id:19, cat:'Chantier', titre:'Retenue de garantie', desc:'5% du marché retenu pendant 1 an (Art. 2 loi 16/07/1971).' },
  { id:20, cat:'Chantier', titre:'Garantie de parfait achèvement', desc:'1 an. L\'entreprise répare tous les désordres signalés.' },
  { id:21, cat:'Assurances', titre:'Attestation décennale', desc:'Certificat d\'assurance décennale à fournir au maître d\'ouvrage.' },
  { id:22, cat:'Assurances', titre:'Attestation RC Professionnelle', desc:'Preuve de couverture des dommages causés aux tiers.' },
  { id:23, cat:'Assurances', titre:'Déclaration de sinistre décennale', desc:'Notification à l\'assureur d\'un désordre relevant de la garantie décennale.' },
  { id:24, cat:'Litiges', titre:'Mise en demeure impayé', desc:'Sommation de payer avec délai. Préalable obligatoire avant action judiciaire.' },
  { id:25, cat:'Litiges', titre:'Demande de médiation', desc:'Saisine du médiateur de la consommation ou du Tribunal de commerce.' },
  { id:26, cat:'Litiges', titre:'Assignation en référé expertise', desc:'Demande d\'expertise judiciaire avant procès au fond.' },
];

const catColors = { Marchés:'#2563EB', 'Sous-traitance':'#7C3AED', Travail:DS.gold, Chantier:'#16A34A', Assurances:'#D97706', Litiges:'#DC2626' };

export default function ContratsBTPModule() {
  const [filterCat, setFilterCat] = useState('');
  const [generated, setGenerated] = useState([]);

  const categories = [...new Set(MODELES_BTP.map(m => m.cat))];
  const filtered = filterCat ? MODELES_BTP.filter(m => m.cat === filterCat) : MODELES_BTP;

  const generer = (modele) => {
    setGenerated(prev => [{ id: Date.now(), modele: modele.titre, cat: modele.cat, date: new Date().toISOString().slice(0, 10), statut: 'brouillon' }, ...prev]);
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Contrats & Documents BTP ({MODELES_BTP.length} modèles)</h2>

      {generated.length > 0 && <>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Documents générés ({generated.length})</div>
        {generated.map(g => (
          <div key={g.id} style={{ ...CARD, marginBottom: 4, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={{ fontSize: 13, fontWeight: 600 }}>{g.modele}</span><span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>{g.date}</span></div>
            <span style={{ fontSize: 10, color: '#D97706', fontWeight: 600 }}>Brouillon</span>
          </div>
        ))}
        <div style={{ height: 16 }} />
      </>}

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Bibliothèque de modèles</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterCat('')} style={!filterCat ? BTN : BTN_O}>Tous ({MODELES_BTP.length})</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(filterCat === cat ? '' : cat)} style={filterCat === cat ? { ...BTN, background: catColors[cat] } : BTN_O}>{cat} ({MODELES_BTP.filter(m => m.cat === cat).length})</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 8 }}>
        {filtered.map(m => (
          <div key={m.id} onClick={() => generer(m)} style={{ ...CARD, padding: '14px 16px', cursor: 'pointer', borderLeft: `3px solid ${catColors[m.cat]}`, transition: 'all .15s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{m.titre}</span>
              <span style={{ fontSize: 10, color: catColors[m.cat], fontWeight: 600, flexShrink: 0 }}>{m.cat}</span>
            </div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>{m.desc}</div>
            <div style={{ fontSize: 11, color: catColors[m.cat], fontWeight: 600, marginTop: 6 }}>Générer →</div>
          </div>
        ))}
      </div>

      <div style={{ ...CARD, marginTop: 16, borderLeft: '4px solid #2563EB', padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>Besoin d'aide juridique ?</div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Pour des situations complexes (litige client, retenue de garantie, sinistre), consultez un juriste spécialisé BTP via Freample Droit.</div>
        <button onClick={() => window.location.href = '/droit'} style={{ ...BTN, background: '#2563EB', fontSize: 11, padding: '6px 14px' }}>Consulter Freample Droit →</button>
      </div>
    </div>
  );
}
