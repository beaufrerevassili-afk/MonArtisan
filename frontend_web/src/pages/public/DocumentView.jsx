import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PRINT_STYLE = `
  @media print {
    .no-print { display: none !important; }
    body { margin: 0; }
  }
  @media screen {
    body { background: #F2F2F7; }
  }
`;

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}
function formatCur(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

/* ─── Bulletin de paie demo data ─── */
const BULLETINS_DEMO = [
  { id: 'BP-2025-03-001', employe: { prenom: 'Thomas', nom: 'Martin', poste: 'Chef de chantier', typeContrat: 'CDI', dateEntree: '2021-03-15' }, periode: 'Mars 2025', brut: 3200, net: 2476.80, coutEmployeur: 4512.00, totalSal: 723.20, totalPat: 1312.00 },
  { id: 'BP-2025-03-002', employe: { prenom: 'Julien', nom: 'Petit', poste: 'Maçon qualifié', typeContrat: 'CDI', dateEntree: '2020-06-01' }, periode: 'Mars 2025', brut: 2400, net: 1857.60, coutEmployeur: 3384.00, totalSal: 542.40, totalPat: 984.00 },
  { id: 'BP-2025-03-003', employe: { prenom: 'Lucas', nom: 'Bernard', poste: 'Plombier', typeContrat: 'CDD', dateEntree: '2025-01-10' }, periode: 'Mars 2025', brut: 2100, net: 1624.80, coutEmployeur: 2961.00, totalSal: 475.20, totalPat: 861.00 },
];

const CONTRATS_DEMO = [
  { id: 'CDI-2021-001', employe: { prenom: 'Thomas', nom: 'Martin', poste: 'Chef de chantier', adresse: '8 allée des Acacias, 69003 Lyon' }, type: 'CDI', dateDebut: '2021-03-15', salaire: 3200, dureeHebdo: 39, periode: 'Période d\'essai : 4 mois' },
  { id: 'CDI-2020-001', employe: { prenom: 'Julien', nom: 'Petit', poste: 'Maçon qualifié', adresse: '3 rue Gambetta, 69007 Lyon' }, type: 'CDI', dateDebut: '2020-06-01', salaire: 2400, dureeHebdo: 39, periode: 'Période d\'essai : 2 mois' },
  { id: 'CDD-2025-001', employe: { prenom: 'Lucas', nom: 'Bernard', poste: 'Plombier', adresse: '15 cours Charlemagne, 69002 Lyon' }, type: 'CDD', dateDebut: '2025-01-10', dateFin: '2025-07-09', salaire: 2100, dureeHebdo: 35, periode: 'Durée : 6 mois' },
];

/* ─── Devis viewer (reuse SignatureDevis logic, view-only) ─── */
function DevisView({ id }) {
  const [devis, setDevis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/patron/devis-pro/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setDevis)
      .catch(() => setError('Devis introuvable.'));
  }, [id]);

  if (error) return <ErrorBlock msg={error} />;
  if (!devis) return <LoadingBlock />;

  const totalHT = (devis.lignes || []).reduce((s, l) => s + (Number(l.quantite) * Number(l.prixUnitaire)), 0);
  const totalTVA = (devis.lignes || []).reduce((s, l) => s + (Number(l.quantite) * Number(l.prixUnitaire) * Number(l.tva) / 100), 0);

  return (
    <DocWrapper title={`Devis ${devis.numero}`} badge={devis.statut} badgeColors={{ brouillon: '#8E8E93', 'envoyé': '#856404', 'signé': '#1A7F43', 'refusé': '#C0392B' }}>
      {/* Company + Doc header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#007AFF' }}>Bernard Martin BTP</div>
          <div style={{ fontSize: 13, color: '#6E6E73', lineHeight: 1.8, marginTop: 4 }}>
            12 rue des Artisans, 69002 Lyon<br />
            Tél : 04 78 00 00 00 · contact@bernardmartin-btp.fr<br />
            SIRET : 123 456 789 00012 · TVA : FR12 123 456 789
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -1 }}>DEVIS</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#007AFF', marginTop: 4 }}>{devis.numero}</div>
          <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 8 }}>Émis le : {formatDate(devis.creeLe)}</div>
          <div style={{ fontSize: 13, color: '#6E6E73' }}>
            Valable jusqu'au : {formatDate(new Date(new Date(devis.creeLe).getTime() + (devis.validiteDays || 30) * 86400000).toISOString())}
          </div>
        </div>
      </div>

      {/* Client */}
      <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '16px 20px', marginBottom: 28, maxWidth: 340 }}>
        <div style={sectionLabel}>Adressé à</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{devis.client?.nom}</div>
        {devis.client?.adresse && <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 4 }}>{devis.client.adresse}</div>}
        {devis.client?.email && <div style={{ fontSize: 13, color: '#6E6E73' }}>{devis.client.email}</div>}
        {devis.client?.telephone && <div style={{ fontSize: 13, color: '#6E6E73' }}>{devis.client.telephone}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={sectionLabel}>Objet</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{devis.objet}</div>
      </div>

      {/* Lines */}
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#1C1C1E', color: '#fff' }}>
            {['Description', 'Qté', 'Unité', 'P.U. HT', 'TVA', 'Total HT'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Description' ? 'left' : 'right', fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(devis.lignes || []).map((l, i) => {
            const ht = Number(l.quantite) * Number(l.prixUnitaire);
            return (
              <tr key={i} style={{ borderBottom: '1px solid #F2F2F7', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '11px 14px' }}>{l.description}</td>
                <td style={{ padding: '11px 14px', textAlign: 'right' }}>{l.quantite}</td>
                <td style={{ padding: '11px 14px', textAlign: 'right', color: '#6E6E73' }}>{l.unite}</td>
                <td style={{ padding: '11px 14px', textAlign: 'right' }}>{Number(l.prixUnitaire).toFixed(2)} €</td>
                <td style={{ padding: '11px 14px', textAlign: 'right', color: '#6E6E73' }}>{l.tva}%</td>
                <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600 }}>{ht.toFixed(2)} €</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px 0 28px' }}>
        <div style={{ minWidth: 270, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E5EA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', fontSize: 14 }}><span>Total HT</span><span>{formatCur(totalHT)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', fontSize: 14, color: '#6E6E73' }}><span>TVA</span><span>{formatCur(totalTVA)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', background: '#007AFF', color: '#fff', fontSize: 17, fontWeight: 700 }}><span>Total TTC</span><span>{formatCur(totalHT + totalTVA)}</span></div>
        </div>
      </div>

      {/* Conditions */}
      {devis.conditions && (
        <div style={{ borderTop: '2px solid #F2F2F7', paddingTop: 20 }}>
          <div style={sectionLabel}>Conditions générales</div>
          <pre style={{ fontSize: 12, color: '#6E6E73', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, margin: 0 }}>{devis.conditions}</pre>
        </div>
      )}

      {devis.statut === 'signé' && (
        <div style={{ marginTop: 24, background: '#D1F2E0', border: '1px solid #34C759', borderRadius: 10, padding: '14px 20px' }}>
          <div style={{ fontWeight: 700, color: '#1A7F43' }}>✓ Signé électroniquement</div>
          <div style={{ fontSize: 13, color: '#2D6A4F', marginTop: 4 }}>Par {devis.signatureNom} le {formatDate(devis.signeLe)}</div>
        </div>
      )}
    </DocWrapper>
  );
}

/* ─── Bulletin de paie viewer ─── */
function BulletinView({ id }) {
  const bulletin = BULLETINS_DEMO.find(b => b.id === id);
  if (!bulletin) return <ErrorBlock msg="Bulletin introuvable." />;

  const { employe, periode, brut, net, coutEmployeur, totalSal, totalPat } = bulletin;

  const LIGNES_SAL = [
    { cat: 'Sécurité sociale', label: 'Maladie / Maternité',        base: brut,           taux: 0.75,  mt: brut * 0.0075 },
    { cat: 'Sécurité sociale', label: 'Vieillesse (déplafonnée)',    base: brut,           taux: 0.40,  mt: brut * 0.004 },
    { cat: 'Sécurité sociale', label: 'Vieillesse (plafonnée)',      base: Math.min(brut, 3864), taux: 6.90, mt: Math.min(brut,3864)*0.069 },
    { cat: 'Chômage',          label: 'Assurance chômage',           base: brut,           taux: 2.40,  mt: brut * 0.024 },
    { cat: 'Retraite compl.',  label: 'AGIRC-ARRCO T1',             base: Math.min(brut, 3864), taux: 3.15, mt: Math.min(brut,3864)*0.0315 },
    { cat: 'CSG / CRDS',       label: 'CSG déductible',             base: brut * 0.9825,  taux: 6.80,  mt: brut * 0.9825 * 0.068 },
    { cat: 'CSG / CRDS',       label: 'CSG non déductible + CRDS',  base: brut * 0.9825,  taux: 2.90,  mt: brut * 0.9825 * 0.029 },
  ];

  return (
    <DocWrapper title={`Bulletin de paie — ${periode}`} badge="Officiel" badgeColors={{ Officiel: '#1A7F43' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '2px solid #1C1C1E' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#007AFF' }}>Bernard Martin BTP</div>
          <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.8, marginTop: 4 }}>
            12 rue des Artisans, 69002 Lyon<br />
            SIRET : 123 456 789 00012 · NAF : 4329A<br />
            Convention collective BTP (IDCC 1597/1596)
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1C1C1E' }}>BULLETIN DE PAIE</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#007AFF', marginTop: 4 }}>Période : {periode}</div>
          <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>Réf. : {bulletin.id}</div>
        </div>
      </div>

      {/* Employee info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px' }}>
          <div style={sectionLabel}>Employé</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{employe.prenom} {employe.nom}</div>
          <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 4 }}>{employe.poste} · {employe.typeContrat}</div>
          <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>Entrée : {formatDate(employe.dateEntree)}</div>
        </div>
        <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px' }}>
          <div style={sectionLabel}>Synthèse</div>
          <div style={{ fontSize: 13, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}><span>Salaire brut</span><span style={{ fontWeight: 600 }}>{formatCur(brut)}</span></div>
          <div style={{ fontSize: 13, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}><span>Total cotisations sal.</span><span style={{ fontWeight: 600, color: '#C0392B' }}>− {formatCur(totalSal)}</span></div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#34C759', display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E5E5EA' }}><span>Net à payer</span><span>{formatCur(net)}</span></div>
        </div>
      </div>

      {/* Cotisations table */}
      <div style={sectionLabel}>Détail des cotisations salariales</div>
      <table style={{ ...tableStyle, marginBottom: 20 }}>
        <thead>
          <tr style={{ background: '#1C1C1E', color: '#fff' }}>
            {['Cotisation', 'Base', 'Taux', 'Montant'].map(h => (
              <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Cotisation' ? 'left' : 'right', fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(LIGNES_SAL.reduce((g, c) => { (g[c.cat] = g[c.cat]||[]).push(c); return g; }, {})).map(([cat, items]) => (
            <React.Fragment key={cat}>
              <tr><td colSpan={4} style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700, color: '#6E6E73', background: '#FAFAFA', textTransform: 'uppercase', letterSpacing: 0.5 }}>{cat}</td></tr>
              {items.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F8F8F8' }}>
                  <td style={{ padding: '8px 14px' }}>{c.label}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: '#6E6E73' }}>{formatCur(c.base)}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: '#6E6E73' }}>{c.taux.toFixed(2)} %</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600 }}>{formatCur(c.mt)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
          <tr style={{ borderTop: '2px solid #1C1C1E', background: '#F8F9FA' }}>
            <td colSpan={3} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 14 }}>Total cotisations salariales</td>
            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#C0392B' }}>{formatCur(totalSal)}</td>
          </tr>
        </tbody>
      </table>

      {/* Net banner */}
      <div style={{ background: '#007AFF', color: '#fff', borderRadius: 12, padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Net à payer avant impôt sur le revenu</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Net imposable : {formatCur(brut * 0.98)}</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{formatCur(net)}</div>
      </div>

      {/* Employer cost */}
      <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6E6E73', borderTop: '2px solid #F2F2F7' }}>
        <span>Charges patronales : {formatCur(totalPat)}</span>
        <span>Coût total employeur : <strong style={{ color: '#1C1C1E' }}>{formatCur(coutEmployeur)}</strong></span>
      </div>
    </DocWrapper>
  );
}

/* ─── Contrat viewer ─── */
function ContratView({ id }) {
  const contrat = CONTRATS_DEMO.find(c => c.id === id);
  if (!contrat) return <ErrorBlock msg="Contrat introuvable." />;
  const { employe, type, dateDebut, dateFin, salaire, dureeHebdo, periode } = contrat;

  return (
    <DocWrapper title={`Contrat de travail ${type} — ${employe.prenom} ${employe.nom}`} badge={type} badgeColors={{ CDI: '#1A7F43', CDD: '#1565C0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '2px solid #1C1C1E' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#007AFF', marginBottom: 4 }}>Bernard Martin BTP</div>
        <div style={{ fontSize: 12, color: '#6E6E73' }}>12 rue des Artisans, 69002 Lyon · SIRET 123 456 789 00012</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E', marginTop: 16 }}>CONTRAT DE TRAVAIL À {type}</div>
        <div style={{ fontSize: 14, color: '#6E6E73', marginTop: 4 }}>{type === 'CDD' ? `Durée déterminée — ${periode}` : 'Durée indéterminée'}</div>
      </div>

      <ClauseSection title="ENTRE LES SOUSSIGNÉS">
        <p><strong>L'employeur :</strong> La société Bernard Martin BTP, SARL au capital de 50 000 €, immatriculée au RCS de Lyon sous le numéro 123 456 789, dont le siège social est situé 12 rue des Artisans, 69002 Lyon, représentée par M. Bernard Martin en qualité de Gérant.</p>
        <p style={{ marginTop: 10 }}><strong>Le salarié :</strong> M./Mme {employe.prenom} {employe.nom}, demeurant {employe.adresse}, ci-après dénommé(e) « le Salarié ».</p>
      </ClauseSection>

      <ClauseSection title="ARTICLE 1 — ENGAGEMENT">
        <p>L'employeur engage le Salarié à compter du <strong>{formatDate(dateDebut)}</strong>{type === 'CDD' ? ` jusqu'au ${formatDate(dateFin)}` : ''}, en qualité de <strong>{employe.poste}</strong>, statut <em>{dureeHebdo >= 39 ? 'Ouvrier qualifié — Coefficient 185 BTP' : 'Ouvrier — Coefficient 150 BTP'}</em>.</p>
        {type === 'CDI' && <p style={{ marginTop: 8 }}>{periode} à compter de la date d'entrée. En l'absence de confirmation écrite à l'issue, le contrat sera considéré comme définitivement conclu.</p>}
      </ClauseSection>

      <ClauseSection title="ARTICLE 2 — LIEU ET NATURE DE TRAVAIL">
        <p>Le lieu de travail est principalement fixé au siège social de l'entreprise, ainsi que sur les différents chantiers auxquels le Salarié pourra être affecté sur le territoire national, selon les besoins de l'activité.</p>
      </ClauseSection>

      <ClauseSection title="ARTICLE 3 — DURÉE DU TRAVAIL">
        <p>La durée hebdomadaire de travail est fixée à <strong>{dureeHebdo} heures</strong>, réparties du lundi au vendredi. Le Salarié pourra être amené à effectuer des heures supplémentaires selon les besoins du service, rémunérées conformément aux dispositions légales et conventionnelles.</p>
      </ClauseSection>

      <ClauseSection title="ARTICLE 4 — RÉMUNÉRATION">
        <p>En contrepartie de son activité, le Salarié percevra une rémunération brute mensuelle de <strong>{formatCur(salaire)}</strong>, versée le dernier jour ouvré de chaque mois.</p>
        <p style={{ marginTop: 8 }}>Cette rémunération est susceptible d'évoluer lors des révisions annuelles ou lors des négociations collectives de branche.</p>
      </ClauseSection>

      <ClauseSection title="ARTICLE 5 — CONGÉS PAYÉS">
        <p>Le Salarié bénéficiera des congés annuels payés prévus par la loi, soit 2,5 jours ouvrables par mois de travail effectif, ainsi que des congés prévus par la Convention Collective Nationale du Bâtiment et des Travaux Publics.</p>
      </ClauseSection>

      <ClauseSection title="ARTICLE 6 — CONVENTION COLLECTIVE">
        <p>Le présent contrat est soumis aux dispositions de la Convention Collective Nationale du Bâtiment et des Travaux Publics (IDCC 1597/1596) dont le Salarié peut obtenir copie auprès du service des Ressources Humaines.</p>
      </ClauseSection>

      <ClauseSection title="ARTICLE 7 — OBLIGATIONS DU SALARIÉ">
        <p>Le Salarié s'engage à :</p>
        <ul style={{ paddingLeft: 20, marginTop: 8, lineHeight: 1.8, color: '#3C3C43', fontSize: 14 }}>
          <li>Respecter les règles d'hygiène et de sécurité en vigueur dans l'entreprise</li>
          <li>Porter les équipements de protection individuelle (EPI) fournis</li>
          <li>Maintenir la confidentialité des informations de l'entreprise</li>
          <li>Signaler tout incident, accident ou situation dangereuse à son responsable</li>
        </ul>
      </ClauseSection>

      {/* Signatures */}
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <div style={sectionLabel}>L'employeur</div>
          <div style={{ fontSize: 13, color: '#3C3C43', marginBottom: 40 }}>Bernard Martin<br /><span style={{ color: '#6E6E73' }}>Gérant, Bernard Martin BTP</span></div>
          <div style={{ borderTop: '1px solid #1C1C1E', paddingTop: 6, fontSize: 12, color: '#6E6E73' }}>Signature et cachet</div>
        </div>
        <div>
          <div style={sectionLabel}>Le salarié</div>
          <div style={{ fontSize: 13, color: '#3C3C43', marginBottom: 40 }}>{employe.prenom} {employe.nom}<br /><span style={{ color: '#6E6E73' }}>Lu et approuvé</span></div>
          <div style={{ borderTop: '1px solid #1C1C1E', paddingTop: 6, fontSize: 12, color: '#6E6E73' }}>Signature précédée de la mention manuscrite</div>
        </div>
      </div>
      <div style={{ marginTop: 24, fontSize: 12, color: '#8E8E93', textAlign: 'center' }}>
        Fait à Lyon en deux exemplaires originaux, le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </DocWrapper>
  );
}

/* ─── QSE document viewer ─── */
function QSEDocView({ id }) {
  const DOCS = {
    'duerp': { titre: 'Document Unique d\'Évaluation des Risques Professionnels', ref: 'DUERP-2025' },
    'registre-at': { titre: 'Registre des Accidents du Travail', ref: 'RAT-2025' },
    'registre-incendie': { titre: 'Registre de Sécurité Incendie', ref: 'RSI-2025' },
    'affichage-obligatoire': { titre: 'Tableau d\'Affichage Obligatoire', ref: 'AFF-2025' },
  };
  const doc = DOCS[id] || { titre: `Document QSE — ${id}`, ref: id.toUpperCase() };

  return (
    <DocWrapper title={doc.titre} badge="QSE" badgeColors={{ QSE: '#1565C0' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#007AFF' }}>Bernard Martin BTP</div>
        <div style={{ fontSize: 12, color: '#6E6E73' }}>SIRET 123 456 789 00012 · 12 rue des Artisans, 69002 Lyon</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 16, color: '#1C1C1E' }}>{doc.titre}</div>
        <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 4 }}>Réf. : {doc.ref} · Mis à jour le {new Date().toLocaleDateString('fr-FR')}</div>
      </div>
      <div style={{ background: '#E3F2FD', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#1565C0' }}>
        Ce document est établi conformément aux obligations légales (Articles L4121-1 et suivants du Code du Travail).
      </div>
      <ClauseSection title="ENTREPRISE">
        <p>Raison sociale : <strong>Bernard Martin BTP</strong> · SIRET : 123 456 789 00012<br />
        Activité principale : Travaux de maçonnerie générale et gros œuvre (NAF 4329A)<br />
        Effectif : 8 salariés · Convention collective : BTP IDCC 1597/1596<br />
        Responsable QSE : M. Bernard Martin</p>
      </ClauseSection>
      <ClauseSection title="OBJET">
        <p>Ce document recense l'ensemble des risques professionnels identifiés au sein de l'entreprise Bernard Martin BTP, conformément à l'obligation légale issue de la loi du 31 décembre 1991 codifiée à l'article L4121-1 du Code du Travail. Il constitue la base du programme annuel de prévention.</p>
      </ClauseSection>
      <ClauseSection title="FRÉQUENCE DE MISE À JOUR">
        <p>Ce document doit être mis à jour :<br />
        • Au minimum une fois par an<br />
        • Lors de toute décision d'aménagement important modifiant les conditions de travail<br />
        • Lorsqu'une information sur les risques ou les éléments d'exposition aux facteurs de pénibilité est recueillie</p>
      </ClauseSection>
      <div style={{ marginTop: 32, borderTop: '2px solid #F2F2F7', paddingTop: 20, fontSize: 12, color: '#8E8E93', textAlign: 'center' }}>
        Document établi par Bernard Martin BTP · {new Date().toLocaleDateString('fr-FR')} · Consultez l'onglet DUERP pour le tableau complet des risques
      </div>
    </DocWrapper>
  );
}

/* ─── Shared layout wrapper ─── */
function DocWrapper({ title, children, badge, badgeColors = {} }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <style>{PRINT_STYLE}</style>
      {/* Top bar */}
      <div className="no-print" style={{ background: '#1C1C1E', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Bernard Martin BTP</div>
          <div style={{ width: 1, height: 16, background: '#3C3C43' }} />
          <div style={{ fontSize: 13, color: '#8E8E93', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          {badge && <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (badgeColors[badge] || '#007AFF') + '30', color: badgeColors[badge] || '#007AFF' }}>{badge}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: copied ? '#34C759' : '#3C3C43', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background 0.2s' }}>
            {copied ? '✓ Lien copié !' : '🔗 Copier le lien'}
          </button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#007AFF', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            ⬇ Télécharger PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div style={{ maxWidth: 860, margin: '32px auto', padding: '0 16px 60px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 52px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          {children}
        </div>
      </div>
    </>
  );
}

function ClauseSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#1C1C1E', textTransform: 'uppercase', letterSpacing: 1, borderLeft: '3px solid #007AFF', paddingLeft: 10, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#3C3C43', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function LoadingBlock() {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F2F2F7', fontSize: 16, color: '#6E6E73' }}>Chargement du document…</div>;
}

function ErrorBlock({ msg }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F2F2F7', gap: 12 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 36 }}>📄</div>
        <h2 style={{ color: '#1C1C1E', margin: '12px 0 8px' }}>Document introuvable</h2>
        <p style={{ color: '#6E6E73', fontSize: 14 }}>{msg}</p>
      </div>
    </div>
  );
}

const sectionLabel = { fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13, borderRadius: 8, overflow: 'hidden' };

/* ─── Router entry point ─── */
export default function DocumentView() {
  const { type, id } = useParams();

  if (type === 'devis') return <DevisView id={id} />;
  if (type === 'bulletin') return <BulletinView id={id} />;
  if (type === 'contrat') return <ContratView id={id} />;
  if (type === 'qse') return <QSEDocView id={id} />;

  return <ErrorBlock msg={`Type de document inconnu : "${type}"`} />;
}
