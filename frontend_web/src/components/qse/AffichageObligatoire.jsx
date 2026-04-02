import React, { useState } from 'react';
import { genererAffichageObligatoire } from '../../utils/qsePDF';

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

/* ── Données complètes des affichages obligatoires ── */
const AFFICHAGES_ENTREPRISE = [
  /* Identification */
  { id: 'identite', cat: 'Identification de l\'entreprise', titre: 'Identification de l\'employeur', ref: 'Art. R4711-1 CT', desc: 'Nom, adresse, SIRET, activité principale, effectif', emplacement: 'Entrée du local / panneau d\'affichage', obligatoire: true },
  { id: 'horaires', cat: 'Temps de travail', titre: 'Horaires de travail collectifs', ref: 'Art. D3171-1 CT', desc: 'Heures de début et fin de chaque journée, répartition hebdomadaire, repos compensateurs', emplacement: 'Panneau d\'affichage accessible à tous', obligatoire: true },
  { id: 'inspection', cat: 'Identification de l\'entreprise', titre: 'Coordonnées de l\'inspection du travail', ref: 'Art. R4711-1 CT', desc: 'Adresse et numéro de téléphone de l\'inspection du travail compétente', emplacement: 'Panneau d\'affichage', obligatoire: true },
  { id: 'medecin_travail', cat: 'Identification de l\'entreprise', titre: 'Service de santé au travail', ref: 'Art. L4624-1 CT', desc: 'Coordonnées du médecin du travail et du service de santé', emplacement: 'Panneau d\'affichage', obligatoire: true },
  { id: 'secours', cat: 'Sécurité', titre: 'Consignes et numéros d\'urgence', ref: 'Art. R4227-34 CT', desc: 'SAMU (15), Pompiers (18), Police (17), médecin, hôpital, numéro interne urgences', emplacement: 'Visible à tous les postes de travail', obligatoire: true },
  { id: 'consignes_incendie', cat: 'Sécurité', titre: 'Consignes de sécurité incendie', ref: 'Art. R4227-34 et R4227-37 CT', desc: 'Plan d\'évacuation, localisation extincteurs, point de rassemblement, procédure d\'évacuation', emplacement: 'Chaque niveau / chaque local', obligatoire: true },
  { id: 'conventioncollective', cat: 'Identification de l\'entreprise', titre: 'Convention collective applicable', ref: 'Art. L2262-5 CT', desc: 'Intitulé de la convention collective, lieu de consultation', emplacement: 'Panneau d\'affichage', obligatoire: true },
  { id: 'egalite', cat: 'Droits des salariés', titre: 'Égalité de rémunération F/H', ref: 'Art. L3221-9 CT', desc: 'Texte du principe d\'égalité de rémunération entre femmes et hommes', emplacement: 'Panneau d\'affichage', obligatoire: true },
  { id: 'harcelement', cat: 'Droits des salariés', titre: 'Harcèlement moral et sexuel — Définition et sanctions', ref: 'Art. L1152-4 et L1153-5 CT', desc: 'Texte des articles 222-33-2 et 222-33 CP, coordonnées Défenseur des droits, Parquet', emplacement: 'Panneau d\'affichage dans les lieux de travail et de recrutement', obligatoire: true },
  { id: 'discrimination', cat: 'Droits des salariés', titre: 'Interdiction des discriminations', ref: 'Art. L1142-6 CT', desc: 'Articles L1131-1 à L1133-1 CT — Critères de discrimination prohibés', emplacement: 'Panneau d\'affichage', obligatoire: true },
  { id: 'tabac', cat: 'Santé', titre: 'Interdiction de fumer et vapoter', ref: 'Art. R3512-2 CSP', desc: 'Signalétique d\'interdiction de fumer et vapoter dans les lieux de travail couverts', emplacement: 'Toutes les entrées et emplacements visibles', obligatoire: true },
  { id: 'ordre_reel', cat: 'Temps de travail', titre: 'Ordre des départs en congés', ref: 'Art. D3141-6 CT', desc: 'Si congés payés : dates de fermeture de l\'établissement ou calendrier individuel', emplacement: 'Panneau d\'affichage', obligatoire: true },
  { id: 'representants', cat: 'Droits des salariés', titre: 'Résultats élections CSE / DP', ref: 'Art. R2314-22 CT', desc: 'PV d\'élection et coordonnées des représentants du personnel si > 11 salariés', emplacement: 'Panneau d\'affichage accessible', obligatoire: false },
];

const AFFICHAGES_CHANTIER = [
  { id: 'panneau_chantier', cat: 'Identification chantier', titre: 'Panneau de chantier', ref: 'PC obligatoire (Art. L421-3 CU)', desc: 'Maître d\'ouvrage, architecte, entreprises, nature travaux, surface, numéro de permis de construire', emplacement: 'Bord de chantier, visible depuis la voie publique', obligatoire: true },
  { id: 'plan_installation', cat: 'Organisation', titre: 'Plan d\'installation de chantier', ref: 'Art. R4512-6 CT', desc: 'Plan de masse avec zones de travail, accès, base vie, stockages, réseaux, voies de circulation', emplacement: 'Entrée chantier et base vie', obligatoire: true },
  { id: 'plan_evacuation', cat: 'Sécurité', titre: 'Plan d\'évacuation et consignes incendie', ref: 'Art. R4227-34 CT', desc: 'Plan du chantier avec issues de secours, extincteurs, point de rassemblement', emplacement: 'Base vie et chaque niveau', obligatoire: true },
  { id: 'interdiction_acces', cat: 'Sécurité', titre: 'Interdiction d\'accès aux non-autorisés', ref: 'Art. R4513-7 CT', desc: 'Signalétique d\'interdiction d\'accès au chantier pour les personnes non habilitées', emplacement: 'Toutes les entrées du chantier', obligatoire: true },
  { id: 'ppsps_affichage', cat: 'Prévention', titre: 'Référence PPSPS affiché', ref: 'Art. R4532-75 CT', desc: 'Présence du PPSPS à disposition sur le chantier (pas d\'affichage intégral, mais accès)', emplacement: 'Bureau de chantier / base vie', obligatoire: true },
  { id: 'plan_prevention', cat: 'Prévention', titre: 'Plan de prévention co-activité', ref: 'Art. R4512-6 CT', desc: 'En cas de co-activité avec entreprises extérieures : plan de prévention signé accessible', emplacement: 'Bureau de chantier', obligatoire: true },
  { id: 'premiers_secours', cat: 'Secours', titre: 'Consignes en cas d\'accident', ref: 'Art. R4224-16 CT', desc: 'Numéros d\'urgence, localisation trousse de secours, procédure d\'alerte, nom SST', emplacement: 'Base vie et postes de travail principaux', obligatoire: true },
  { id: 'epi_obligatoires', cat: 'EPI', titre: 'EPI obligatoires sur le chantier', ref: 'Art. R4323-91 CT', desc: 'Liste et pictogrammes des EPI obligatoires : casque, chaussures sécu, gilet, gants, lunettes', emplacement: 'Entrée chantier et zones de travail', obligatoire: true },
  { id: 'zone_bruit', cat: 'Santé', titre: 'Signalisation zones bruyantes', ref: 'Art. R4435-8 CT', desc: 'Pictogramme obligatoire si > 85 dB(A) : port de protection auditive obligatoire', emplacement: 'Entrée des zones concernées', obligatoire: false },
  { id: 'interdit_fumer_chantier', cat: 'Santé', titre: 'Interdiction de fumer', ref: 'Art. R3512-2 CSP', desc: 'Signalétique d\'interdiction de fumer dans l\'ensemble des zones couvertes', emplacement: 'Zones couvertes du chantier', obligatoire: true },
];

const AFFICHAGES_RISQUES = [
  { id: 'amiante', cat: 'Risques spécifiques', titre: 'Risque amiante', ref: 'Art. R4412-97 CT', desc: 'Zone amiante balisée, équipements de protection spécifiques, habilitation SS3/SS4 obligatoire', emplacement: 'Zone de travail concernée', obligatoire: false },
  { id: 'plomb', cat: 'Risques spécifiques', titre: 'Risque plomb (CREP)', ref: 'Art. R4412-152 CT', desc: 'Zone de travail balisée, EPI spécifiques, accès restreint', emplacement: 'Zone de travail concernée', obligatoire: false },
  { id: 'zone_atex', cat: 'Risques spécifiques', titre: 'Zone ATEX (atmosphères explosives)', ref: 'Art. R4227-44 CT et Dir. 1999/92/CE', desc: 'Signalisation spécifique EX, équipements adaptés, interdiction d\'ignition', emplacement: 'Toutes les entrées de la zone', obligatoire: false },
  { id: 'risque_electrique', cat: 'Risques spécifiques', titre: 'Risque électrique — Zone de tension', ref: 'Art. R4226-2 CT', desc: 'Pictogramme danger électrique, habilitation requise, consignation', emplacement: 'Armoires électriques, zones BT/HT', obligatoire: false },
  { id: 'risque_chimique', cat: 'Risques spécifiques', titre: 'Produits chimiques dangereux (pictogrammes CLP)', ref: 'Règlement CE n°1272/2008 (CLP)', desc: 'Pictogrammes SGH sur tous les contenants, affichage EPI et premiers secours', emplacement: 'Local de stockage et lieu d\'utilisation', obligatoire: false },
  { id: 'manutention', cat: 'Ergonomie', titre: 'Interdiction de manutention > 25 kg seul', ref: 'Art. R4541-9 CT', desc: 'Affichage des limites de charges, recommandation NIOSH, utilisation aides mécaniques', emplacement: 'Zones de manutention', obligatoire: false },
];

function CheckCard({ item, checked, onToggle, onEmplacementChange, emplacement }) {
  return (
    <div style={{ background: checked ? '#F0FFF4' : '#fff', border: `1px solid ${checked ? '#34C759' : '#E5E5EA'}`, borderRadius: 12, padding: '14px 16px', transition: 'all .15s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <input type="checkbox" checked={checked} onChange={onToggle} style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{item.titre}</span>
            {item.obligatoire ? (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#FFE5E5', color: '#C0392B', padding: '1px 6px', borderRadius: 8 }}>OBLIGATOIRE</span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#F2F2F7', color: '#6E6E73', padding: '1px 6px', borderRadius: 8 }}>RECOMMANDÉ</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#5B5BD6', fontWeight: 600, marginBottom: 3 }}>{item.ref}</div>
          <div style={{ fontSize: 12, color: '#6E6E73', marginBottom: 6, lineHeight: 1.4 }}>{item.desc}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ color: '#8E8E93', fontWeight: 600 }}>📍 Emplacement suggéré :</span>
            <span style={{ color: '#6E6E73' }}>{item.emplacement}</span>
          </div>
          {checked && (
            <div style={{ marginTop: 8 }}>
              <label style={{ ...lbl, fontSize: 11 }}>Emplacement réel sur votre site</label>
              <input value={emplacement} onChange={e => onEmplacementChange(e.target.value)} placeholder="Précisez l'emplacement exact…" style={{ ...inp, fontSize: 12, padding: '6px 10px' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AffichageObligatoire({ onRetour }) {
  const [entrepriseInfo, setEntrepriseInfo] = useState({
    nom: 'Bernard Martin BTP',
    siret: '123 456 789 00012',
    adresse: '12 rue des Artisans, 75011 Paris',
    telephone: '',
    email: '',
    inspectionTravail: '',
    medecinTravail: '',
    convColl: 'Convention Collective Nationale du Bâtiment',
  });

  const [checkedEntreprise, setCheckedEntreprise] = useState(
    Object.fromEntries(AFFICHAGES_ENTREPRISE.map(a => [a.id, a.obligatoire]))
  );
  const [emplacementsEntreprise, setEmplacementsEntreprise] = useState(
    Object.fromEntries(AFFICHAGES_ENTREPRISE.map(a => [a.id, '']))
  );

  const [checkedChantier, setCheckedChantier] = useState(
    Object.fromEntries(AFFICHAGES_CHANTIER.map(a => [a.id, a.obligatoire]))
  );
  const [emplacementsChantier, setEmplacementsChantier] = useState(
    Object.fromEntries(AFFICHAGES_CHANTIER.map(a => [a.id, '']))
  );

  const [checkedRisques, setCheckedRisques] = useState(
    Object.fromEntries(AFFICHAGES_RISQUES.map(a => [a.id, false]))
  );
  const [emplacementsRisques, setEmplacementsRisques] = useState(
    Object.fromEntries(AFFICHAGES_RISQUES.map(a => [a.id, '']))
  );

  const [dateVerification, setDateVerification] = useState(new Date().toISOString().split('T')[0]);
  const [responsableVerif, setResponsableVerif] = useState('');
  const [observations, setObservations] = useState('');

  const nbEntrepriseObl = AFFICHAGES_ENTREPRISE.filter(a => a.obligatoire).length;
  const nbCheckedEntrepriseObl = AFFICHAGES_ENTREPRISE.filter(a => a.obligatoire && checkedEntreprise[a.id]).length;
  const nbChantierObl = AFFICHAGES_CHANTIER.filter(a => a.obligatoire).length;
  const nbCheckedChantierObl = AFFICHAGES_CHANTIER.filter(a => a.obligatoire && checkedChantier[a.id]).length;

  const totalObl = nbEntrepriseObl + nbChantierObl;
  const totalCheckedObl = nbCheckedEntrepriseObl + nbCheckedChantierObl;
  const conformite = Math.round((totalCheckedObl / totalObl) * 100);

  function handleExportPDF() {
    genererAffichageObligatoire({
      entrepriseInfo,
      affichagesEntreprise: AFFICHAGES_ENTREPRISE.map(a => ({
        ...a,
        estEnPlace: checkedEntreprise[a.id],
        emplacementReel: emplacementsEntreprise[a.id],
      })),
      affichagesChantier: AFFICHAGES_CHANTIER.map(a => ({
        ...a,
        estEnPlace: checkedChantier[a.id],
        emplacementReel: emplacementsChantier[a.id],
      })),
      affichagesRisques: AFFICHAGES_RISQUES.map(a => ({
        ...a,
        estEnPlace: checkedRisques[a.id],
        emplacementReel: emplacementsRisques[a.id],
      })),
      conformite,
      dateVerification,
      responsableVerif,
      observations,
    });
  }

  const sectionStyle = { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 20 };
  const headerStyle = (color) => ({ padding: '12px 20px', background: color, color: '#fff', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' });

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B5BD6', fontSize: 14, fontWeight: 600, padding: '0 0 4px' }}>
            ← Retour aux documents
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Tableau d'Affichage Obligatoire</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>
            Art. L1221-13 CT · Checklist complète des affichages obligatoires en entreprise et sur chantier BTP
          </p>
        </div>
        <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
          ⬇ Exporter PDF officiel
        </button>
      </div>

      {/* Score de conformité */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Score de conformité affichage obligatoire
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 36, fontWeight: 800, color: conformite >= 80 ? '#34C759' : conformite >= 50 ? '#FF9500' : '#FF3B30' }}>{conformite}%</div>
                <div style={{ fontSize: 12, color: '#6E6E73' }}>Conformité globale</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#5B5BD6' }}>{totalCheckedObl} / {totalObl}</div>
                <div style={{ fontSize: 12, color: '#6E6E73' }}>Affichages obligatoires en place</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#FF9500' }}>{totalObl - totalCheckedObl}</div>
                <div style={{ fontSize: 12, color: '#6E6E73' }}>Non conformités à corriger</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ height: 12, background: '#F2F2F7', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${conformite}%`, background: conformite >= 80 ? '#34C759' : conformite >= 50 ? '#FF9500' : '#FF3B30', borderRadius: 6, transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
              <span>0%</span>
              <span style={{ color: '#FF9500' }}>Minimum acceptable : 80%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Informations vérification */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F2F2F7' }}>
          <div>
            <label style={lbl}>Date de vérification</label>
            <input type="date" value={dateVerification} onChange={e => setDateVerification(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Responsable de la vérification</label>
            <input value={responsableVerif} onChange={e => setResponsableVerif(e.target.value)} placeholder="Nom Prénom, Fonction" style={inp} />
          </div>
          <div>
            <label style={lbl}>Observations générales</label>
            <input value={observations} onChange={e => setObservations(e.target.value)} placeholder="RAS, ou remarques…" style={inp} />
          </div>
        </div>
      </div>

      {/* Informations entreprise */}
      <div style={sectionStyle}>
        <div style={headerStyle('#1C1C1E')}>Informations de l'entreprise (pour les affichages)</div>
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { key: 'nom', label: 'Raison sociale' },
              { key: 'siret', label: 'N° SIRET' },
              { key: 'adresse', label: 'Adresse du siège' },
              { key: 'telephone', label: 'Téléphone' },
              { key: 'inspectionTravail', label: 'Inspection du travail (adresse/tél)' },
              { key: 'medecinTravail', label: 'Médecin du travail (tél)' },
              { key: 'convColl', label: 'Convention collective applicable' },
            ].map(f => (
              <div key={f.key}>
                <label style={lbl}>{f.label}</label>
                <input value={entrepriseInfo[f.key]} onChange={e => setEntrepriseInfo(p => ({ ...p, [f.key]: e.target.value }))} style={inp} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1 — Affichages entreprise */}
      <div style={sectionStyle}>
        <div style={headerStyle('#5B5BD6')}>
          1. Affichages obligatoires en entreprise ({nbCheckedEntrepriseObl}/{nbEntrepriseObl} obligatoires en place)
        </div>
        <div style={{ padding: '16px 20px' }}>
          {['Identification de l\'entreprise', 'Temps de travail', 'Droits des salariés', 'Sécurité', 'Santé'].map(cat => {
            const items = AFFICHAGES_ENTREPRISE.filter(a => a.cat === cat);
            if (!items.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#5B5BD6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E3F2FD' }}>
                  {cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(a => (
                    <CheckCard
                      key={a.id}
                      item={a}
                      checked={checkedEntreprise[a.id]}
                      onToggle={() => setCheckedEntreprise(p => ({ ...p, [a.id]: !p[a.id] }))}
                      emplacement={emplacementsEntreprise[a.id]}
                      onEmplacementChange={val => setEmplacementsEntreprise(p => ({ ...p, [a.id]: val }))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2 — Affichages chantier BTP */}
      <div style={sectionStyle}>
        <div style={headerStyle('#E65100')}>
          2. Affichages obligatoires chantier BTP ({nbCheckedChantierObl}/{nbChantierObl} obligatoires en place)
        </div>
        <div style={{ padding: '16px 20px' }}>
          {['Identification chantier', 'Organisation', 'Sécurité', 'Prévention', 'Secours', 'EPI', 'Santé'].map(cat => {
            const items = AFFICHAGES_CHANTIER.filter(a => a.cat === cat);
            if (!items.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E65100', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #FFF3E0' }}>
                  {cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(a => (
                    <CheckCard
                      key={a.id}
                      item={a}
                      checked={checkedChantier[a.id]}
                      onToggle={() => setCheckedChantier(p => ({ ...p, [a.id]: !p[a.id] }))}
                      emplacement={emplacementsChantier[a.id]}
                      onEmplacementChange={val => setEmplacementsChantier(p => ({ ...p, [a.id]: val }))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3 — Risques spécifiques */}
      <div style={sectionStyle}>
        <div style={headerStyle('#C0392B')}>
          3. Signalisation risques spécifiques (selon activités)
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ background: '#FFF5F5', border: '1px solid rgba(192,57,43,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#7A1A0A' }}>
            Cochez uniquement les risques présents dans votre activité ou sur vos chantiers.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AFFICHAGES_RISQUES.map(a => (
              <CheckCard
                key={a.id}
                item={a}
                checked={checkedRisques[a.id]}
                onToggle={() => setCheckedRisques(p => ({ ...p, [a.id]: !p[a.id] }))}
                emplacement={emplacementsRisques[a.id]}
                onEmplacementChange={val => setEmplacementsRisques(p => ({ ...p, [a.id]: val }))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Non-conformités */}
      {totalObl - totalCheckedObl > 0 && (
        <div style={{ background: '#FFF5F5', border: '1px solid rgba(255,59,48,.3)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C0392B', marginBottom: 10 }}>
            ⚠️ {totalObl - totalCheckedObl} affichage(s) obligatoire(s) manquant(s) — Action corrective requise
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {AFFICHAGES_ENTREPRISE.filter(a => a.obligatoire && !checkedEntreprise[a.id]).map(a => (
              <div key={a.id} style={{ fontSize: 13, color: '#C0392B', display: 'flex', gap: 8 }}>
                <span>•</span>
                <div>
                  <strong>{a.titre}</strong>
                  <span style={{ color: '#8E8E93' }}> — {a.ref}</span>
                </div>
              </div>
            ))}
            {AFFICHAGES_CHANTIER.filter(a => a.obligatoire && !checkedChantier[a.id]).map(a => (
              <div key={a.id} style={{ fontSize: 13, color: '#C0392B', display: 'flex', gap: 8 }}>
                <span>•</span>
                <div>
                  <strong>{a.titre}</strong>
                  <span style={{ color: '#8E8E93' }}> — {a.ref}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Références légales */}
      <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px', border: '1px solid #E5E5EA' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#3C3C43', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Références réglementaires principales</div>
        {[
          'Art. L1221-13 Code du Travail — Affichage du règlement intérieur',
          'Art. D3171-1 CT — Affichage des horaires collectifs',
          'Art. R4711-1 CT — Affichage de la liste des services de secours',
          'Art. L4153-8 CT — Affichage des risques chimiques',
          'Art. L1152-4 et L1153-5 CT — Affichage harcèlement moral et sexuel',
          'Art. L2262-5 CT — Affichage de la convention collective',
          'Art. R3512-2 CSP — Interdiction de fumer dans les lieux de travail',
        ].map((ref, i) => (
          <div key={i} style={{ fontSize: 11, color: '#6E6E73', marginBottom: 3 }}>• {ref}</div>
        ))}
        <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 10 }}>
          {entrepriseInfo.nom} — SIRET : {entrepriseInfo.siret} · Document généré le {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
}
