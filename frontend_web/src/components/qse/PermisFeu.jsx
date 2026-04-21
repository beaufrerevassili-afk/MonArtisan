import React, { useState } from 'react';
import { genererPermisFeu } from '../../utils/qsePDF';

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

const today = new Date().toISOString().split('T')[0];
const hNow = new Date().toTimeString().slice(0,5);

function Section({ titre, color = '#FF6B00', children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 16 }}>
      <div style={{ padding: '10px 18px', background: color, color: '#fff', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {titre}
      </div>
      <div style={{ padding: '18px 20px' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children, cols = '1fr 1fr' }) {
  return <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, marginBottom: 12 }}>{children}</div>;
}

function Field({ label, children }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 16, height: 16 }} />
      {label}
    </label>
  );
}

const RISQUES_INIT = {
  projection: false, brulure: false, incendie: false, explosif: false,
  fumee: false, chuteMateriau: false, electrique: false, autre: false,
};

const MESURES_INIT = {
  extincteur: false, robinetsArrete: false, detectionNeutralisee: false,
  evacPrevue: false, rondeApres: false, bachesProtection: false,
  ventilation: false, consignationElec: false,
};

export default function PermisFeu({ onRetour }) {
  /* ── Section 1 : Identification ── */
  const [identification, setId] = useState({
    entreprise: 'Bernard Martin BTP',
    siret: '123 456 789 00012',
    adresseEntreprise: '12 rue des Artisans, 13005 Marseille',
    chantier: '',
    adresseChantier: '',
    donneur: '',
    titulaire: '',
    dateDebut: today,
    heureDebut: hNow,
    dateFin: today,
    heureFin: '17:00',
    numeroPermis: `PF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  });

  /* ── Section 2 : Nature des travaux ── */
  const [travaux, setTravaux] = useState({
    description: '',
    localisation: '',
    typeSoudure: false,
    chalumeau: false,
    meuleuse: false,
    decoupeThermique: false,
    pistoletAChaud: false,
    autresTravaux: false,
    autresTravauxDetail: '',
    dureeEstimee: '',
  });

  /* ── Section 3 : Analyse des risques ── */
  const [risques, setRisques] = useState(RISQUES_INIT);
  const [risqueAutreDetail, setRisqueAutreDetail] = useState('');
  const [environnement, setEnvironnement] = useState({
    matiereInflammable: false,
    gaz: false,
    poussieresExplosives: false,
    liquidesInflammables: false,
    voisinagestSensibles: '',
  });

  /* ── Section 4 : Mesures préventives ── */
  const [mesures, setMesures] = useState(MESURES_INIT);
  const [mesuresCompl, setMesuresCompl] = useState('');
  const [epi, setEpi] = useState({
    masqueSoudure: false, gants: false, tablier: false,
    lunettes: false, chaussures: false, combinaison: false,
  });

  /* ── Section 5 : Surveillance ── */
  const [surveillance, setSurveillance] = useState({
    nomGuetteur: '',
    dureeRonde: '1',
    heureDerniereRonde: '',
    observations: '',
  });

  /* ── Section 6 : Signatures ── */
  const [signatures, setSignatures] = useState({
    donneur: { nom: '', date: today, heure: hNow, fonction: 'Responsable chantier' },
    titulaire: { nom: '', date: today, heure: hNow, fonction: 'Chef d\'équipe' },
    securite: { nom: '', date: today, heure: hNow, fonction: 'Responsable QSE' },
  });

  /* ── Statut ── */
  const [statut, setStatut] = useState('ouvert'); // ouvert | ferme | annule

  function handleExportPDF() {
    genererPermisFeu({
      identification,
      travaux,
      risques,
      risqueAutreDetail,
      environnement,
      mesures,
      mesuresCompl,
      epi,
      surveillance,
      signatures,
      statut,
    });
  }

  const couleurStatut = { ouvert: '#FF6B00', ferme: '#34C759', annule: '#FF3B30' };
  const labelStatut = { ouvert: 'Ouvert', ferme: 'Fermé / Clôturé', annule: 'Annulé' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B5BD6', fontSize: 14, fontWeight: 600, padding: '0 0 4px' }}>
            ← Retour aux documents
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Permis de Feu</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>
            Référentiel APSAD R6 · Art. R4512-6 CT · Obligatoire avant tout travail par points chauds
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={statut} onChange={e => setStatut(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `2px solid ${couleurStatut[statut]}`, fontSize: 13, fontWeight: 700, color: couleurStatut[statut], outline: 'none', cursor: 'pointer' }}>
            <option value="ouvert">Ouvert</option>
            <option value="ferme">Fermé / Clôturé</option>
            <option value="annule">Annulé</option>
          </select>
          <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            ⬇ Exporter PDF officiel
          </button>
        </div>
      </div>

      {/* Alerte légale */}
      <div style={{ background: '#FFF3E0', border: '1px solid #FF6B00', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#7A3500' }}>
        ⚠️ <strong>Ce permis de feu doit être signé avant tout démarrage des travaux.</strong> Il est valable au maximum 24h et doit être renouvelé à chaque poste de travail.
        Une ronde de surveillance est obligatoire pendant et après les travaux (APSAD R6 §5.3).
      </div>

      {/* Section 1 — Identification */}
      <Section titre="1. Identification du permis" color="#1C1C1E">
        <Row cols="1fr 1fr 1fr">
          <Field label="N° du permis">
            <input value={identification.numeroPermis} onChange={e => setId(p => ({ ...p, numeroPermis: e.target.value }))} style={inp} />
          </Field>
          <Field label="Entreprise intervenante">
            <input value={identification.entreprise} onChange={e => setId(p => ({ ...p, entreprise: e.target.value }))} style={inp} />
          </Field>
          <Field label="N° SIRET">
            <input value={identification.siret} onChange={e => setId(p => ({ ...p, siret: e.target.value }))} style={inp} />
          </Field>
        </Row>
        <Row cols="1fr 1fr">
          <Field label="Chantier / Site">
            <input value={identification.chantier} onChange={e => setId(p => ({ ...p, chantier: e.target.value }))} placeholder="Nom du chantier ou bâtiment" style={inp} />
          </Field>
          <Field label="Adresse du chantier">
            <input value={identification.adresseChantier} onChange={e => setId(p => ({ ...p, adresseChantier: e.target.value }))} placeholder="Adresse complète" style={inp} />
          </Field>
          <Field label="Donneur d'ordre (nom + fonction)">
            <input value={identification.donneur} onChange={e => setId(p => ({ ...p, donneur: e.target.value }))} placeholder="Responsable qui autorise" style={inp} />
          </Field>
          <Field label="Titulaire du permis (exécutant)">
            <input value={identification.titulaire} onChange={e => setId(p => ({ ...p, titulaire: e.target.value }))} placeholder="Personne qui réalise les travaux" style={inp} />
          </Field>
        </Row>
        <Row cols="1fr 1fr 1fr 1fr">
          <Field label="Date de début">
            <input type="date" value={identification.dateDebut} onChange={e => setId(p => ({ ...p, dateDebut: e.target.value }))} style={inp} />
          </Field>
          <Field label="Heure de début">
            <input type="time" value={identification.heureDebut} onChange={e => setId(p => ({ ...p, heureDebut: e.target.value }))} style={inp} />
          </Field>
          <Field label="Date de fin prévue">
            <input type="date" value={identification.dateFin} onChange={e => setId(p => ({ ...p, dateFin: e.target.value }))} style={inp} />
          </Field>
          <Field label="Heure de fin prévue">
            <input type="time" value={identification.heureFin} onChange={e => setId(p => ({ ...p, heureFin: e.target.value }))} style={inp} />
          </Field>
        </Row>
      </Section>

      {/* Section 2 — Nature des travaux */}
      <Section titre="2. Nature des travaux par points chauds" color="#5B5BD6">
        <Row cols="1fr 1fr">
          <Field label="Description des travaux *">
            <textarea value={travaux.description} onChange={e => setTravaux(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Décrire précisément les travaux à effectuer" style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
          </Field>
          <Field label="Localisation précise">
            <textarea value={travaux.localisation} onChange={e => setTravaux(p => ({ ...p, localisation: e.target.value }))} rows={3} placeholder="Local, niveau, zone, repère…" style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
          </Field>
        </Row>
        <div style={{ marginBottom: 12 }}>
          <label style={{ ...lbl, marginBottom: 8 }}>Type de travaux (cochez tout ce qui s'applique)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { key: 'typeSoudure', label: '🔥 Soudure à l\'arc / TIG / MIG' },
              { key: 'chalumeau', label: '🔥 Chalumeau / brasage' },
              { key: 'meuleuse', label: '⚙️ Meuleuse / disqueuse' },
              { key: 'decoupeThermique', label: '✂️ Découpe thermique / plasma' },
              { key: 'pistoletAChaud', label: '🔫 Pistolet à air chaud' },
              { key: 'autresTravaux', label: '📋 Autres (préciser ci-dessous)' },
            ].map(({ key, label }) => (
              <CheckItem key={key} label={label} checked={travaux[key]} onChange={e => setTravaux(p => ({ ...p, [key]: e.target.checked }))} />
            ))}
          </div>
          {travaux.autresTravaux && (
            <div style={{ marginTop: 8 }}>
              <Field label="Détail autres travaux">
                <input value={travaux.autresTravauxDetail} onChange={e => setTravaux(p => ({ ...p, autresTravauxDetail: e.target.value }))} placeholder="Précisez…" style={inp} />
              </Field>
            </div>
          )}
        </div>
        <Row cols="1fr 3fr">
          <Field label="Durée estimée">
            <input value={travaux.dureeEstimee} onChange={e => setTravaux(p => ({ ...p, dureeEstimee: e.target.value }))} placeholder="Ex: 4h, 1 journée" style={inp} />
          </Field>
        </Row>
      </Section>

      {/* Section 3 — Analyse des risques */}
      <Section titre="3. Analyse des risques" color="#C0392B">
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...lbl, marginBottom: 8 }}>Risques identifiés sur la zone</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { key: 'projection', label: '🔴 Projections de particules' },
              { key: 'brulure', label: '🔴 Brûlures' },
              { key: 'incendie', label: '🔴 Départ d\'incendie' },
              { key: 'explosif', label: '🔴 Explosion / ATEX' },
              { key: 'fumee', label: '🟡 Fumées / gaz toxiques' },
              { key: 'chuteMateriau', label: '🟡 Chute de matériaux chauds' },
              { key: 'electrique', label: '🟡 Risque électrique' },
              { key: 'autre', label: '📋 Autre (préciser)' },
            ].map(({ key, label }) => (
              <CheckItem key={key} label={label} checked={risques[key]} onChange={e => setRisques(p => ({ ...p, [key]: e.target.checked }))} />
            ))}
          </div>
          {risques.autre && (
            <div style={{ marginTop: 8, maxWidth: 400 }}>
              <Field label="Autre risque (préciser)">
                <input value={risqueAutreDetail} onChange={e => setRisqueAutreDetail(e.target.value)} placeholder="Décrivez le risque…" style={inp} />
              </Field>
            </div>
          )}
        </div>
        <div>
          <label style={{ ...lbl, marginBottom: 8 }}>Environnement immédiat — présence de</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { key: 'matiereInflammable', label: 'Matières inflammables' },
              { key: 'gaz', label: 'Gaz / bouteilles' },
              { key: 'poussieresExplosives', label: 'Poussières explosives' },
              { key: 'liquidesInflammables', label: 'Liquides inflammables' },
            ].map(({ key, label }) => (
              <CheckItem key={key} label={label} checked={environnement[key]} onChange={e => setEnvironnement(p => ({ ...p, [key]: e.target.checked }))} />
            ))}
          </div>
          <Field label="Voisinages sensibles (locaux adjacents, tuyauteries, câbles…)">
            <input value={environnement.voisinagestSensibles} onChange={e => setEnvironnement(p => ({ ...p, voisinagestSensibles: e.target.value }))} placeholder="Décrivez les zones sensibles proches" style={inp} />
          </Field>
        </div>
      </Section>

      {/* Section 4 — Mesures préventives */}
      <Section titre="4. Mesures préventives obligatoires" color="#1A7F43">
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...lbl, marginBottom: 8 }}>Dispositions prises avant démarrage (cochez ce qui a été vérifié)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { key: 'extincteur', label: '✅ Extincteur à portée de main (eau + CO₂)' },
              { key: 'robinetsArrete', label: '✅ Robinets d\'arrosage mis en place' },
              { key: 'detectionNeutralisee', label: '✅ Détection incendie neutralisée (ou gardée active)' },
              { key: 'evacPrevue', label: '✅ Procédure d\'évacuation vérifiée' },
              { key: 'rondeApres', label: '✅ Ronde de surveillance post-travaux prévue' },
              { key: 'bachesProtection', label: '✅ Bâches ignifugées en place' },
              { key: 'ventilation', label: '✅ Ventilation suffisante assurée' },
              { key: 'consignationElec', label: '✅ Consignation électrique effectuée si nécessaire' },
            ].map(({ key, label }) => (
              <CheckItem key={key} label={label} checked={mesures[key]} onChange={e => setMesures(p => ({ ...p, [key]: e.target.checked }))} />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...lbl, marginBottom: 8 }}>EPI portés par l'intervenant</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { key: 'masqueSoudure', label: 'Masque de soudure' },
              { key: 'gants', label: 'Gants résistants chaleur' },
              { key: 'tablier', label: 'Tablier ignifugé' },
              { key: 'lunettes', label: 'Lunettes de protection' },
              { key: 'chaussures', label: 'Chaussures de sécurité' },
              { key: 'combinaison', label: 'Combinaison ignifugée' },
            ].map(({ key, label }) => (
              <CheckItem key={key} label={label} checked={epi[key]} onChange={e => setEpi(p => ({ ...p, [key]: e.target.checked }))} />
            ))}
          </div>
        </div>
        <Field label="Mesures complémentaires spécifiques">
          <textarea value={mesuresCompl} onChange={e => setMesuresCompl(e.target.value)} rows={2} placeholder="Précisez toute mesure particulière non listée ci-dessus…" style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
        </Field>
      </Section>

      {/* Section 5 — Surveillance post-travaux */}
      <Section titre="5. Surveillance post-travaux (APSAD R6 §5.3)" color="#856404">
        <div style={{ background: '#FFF9E6', border: '1px solid #FFD700', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#5A3E00' }}>
          ⏱️ <strong>Obligation réglementaire :</strong> Une surveillance de la zone doit être maintenue pendant <strong>au minimum 1 heure</strong> après la fin des travaux.
          Des rondes doivent être effectuées à intervalles réguliers et consignées.
        </div>
        <Row cols="1fr 1fr 1fr">
          <Field label="Nom du guetteur / surveillant">
            <input value={surveillance.nomGuetteur} onChange={e => setSurveillance(p => ({ ...p, nomGuetteur: e.target.value }))} placeholder="Prénom NOM" style={inp} />
          </Field>
          <Field label="Durée de surveillance (heures)">
            <input type="number" min="1" value={surveillance.dureeRonde} onChange={e => setSurveillance(p => ({ ...p, dureeRonde: e.target.value }))} style={inp} />
          </Field>
          <Field label="Heure de la dernière ronde">
            <input type="time" value={surveillance.heureDerniereRonde} onChange={e => setSurveillance(p => ({ ...p, heureDerniereRonde: e.target.value }))} style={inp} />
          </Field>
        </Row>
        <Field label="Observations / Anomalies constatées">
          <textarea value={surveillance.observations} onChange={e => setSurveillance(p => ({ ...p, observations: e.target.value }))} rows={3} placeholder="RAS, ou description de toute anomalie observée lors de la surveillance…" style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
        </Field>
      </Section>

      {/* Section 6 — Signatures */}
      <Section titre="6. Signatures et approbations" color="#1C1C1E">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { key: 'donneur', title: 'Donneur d\'ordre', subtitle: 'Responsable qui autorise les travaux' },
            { key: 'titulaire', title: 'Titulaire du permis', subtitle: 'Exécutant des travaux points chauds' },
            { key: 'securite', title: 'Responsable sécurité', subtitle: 'Visa QSE / HSE' },
          ].map(({ key, title, subtitle }) => (
            <div key={key} style={{ border: '1px solid #E5E5EA', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#636363', marginBottom: 12 }}>{subtitle}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Field label="Nom Prénom">
                  <input value={signatures[key].nom} onChange={e => setSignatures(p => ({ ...p, [key]: { ...p[key], nom: e.target.value } }))} placeholder="Nom Prénom" style={{ ...inp, fontSize: 13 }} />
                </Field>
                <Field label="Fonction">
                  <input value={signatures[key].fonction} onChange={e => setSignatures(p => ({ ...p, [key]: { ...p[key], fonction: e.target.value } }))} style={{ ...inp, fontSize: 13 }} />
                </Field>
                <Row cols="1fr 1fr">
                  <Field label="Date">
                    <input type="date" value={signatures[key].date} onChange={e => setSignatures(p => ({ ...p, [key]: { ...p[key], date: e.target.value } }))} style={{ ...inp, fontSize: 12 }} />
                  </Field>
                  <Field label="Heure">
                    <input type="time" value={signatures[key].heure} onChange={e => setSignatures(p => ({ ...p, [key]: { ...p[key], heure: e.target.value } }))} style={{ ...inp, fontSize: 12 }} />
                  </Field>
                </Row>
                <div style={{ height: 40, borderBottom: '1px solid #E5E5EA', marginTop: 4 }}></div>
                <div style={{ fontSize: 11, color: '#C7C7CC', textAlign: 'center' }}>Signature</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pied de page légal */}
      <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px', border: '1px solid #E5E5EA' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#3C3C43', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Références réglementaires</div>
        {[
          'Référentiel APSAD R6 — Permis de feu pour travaux par points chauds',
          'Art. R4512-6 à R4512-12 Code du Travail — Plans de prévention et co-activité',
          'Art. R4227-34 Code du Travail — Précautions particulières contre l\'incendie lors des travaux',
          'Norme NF S 61-970 — Systèmes de détection incendie',
          'Art. L234-1 Code de la Construction — Incendie et panique dans les établissements',
        ].map((ref, i) => (
          <div key={i} style={{ fontSize: 11, color: '#6E6E73', marginBottom: 3 }}>• {ref}</div>
        ))}
        <div style={{ fontSize: 10, color: '#636363', marginTop: 10 }}>
          Bernard Martin BTP — SIRET : {identification.siret} · Document généré le {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
}
