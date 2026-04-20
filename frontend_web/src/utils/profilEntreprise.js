// ── Profil entreprise unifié (patron + AE) ──
// Structure centralisée utilisée pour pré-remplir les devis, factures, etc.

export const CHAMPS_PROFIL_ENTREPRISE = {
  // Identité
  nom: '',               // Raison sociale
  forme: 'SAS',          // SAS, SARL, EURL, EI, SA, SCI, Auto-entrepreneur
  siret: '',
  tvaIntra: '',          // N° TVA intracommunautaire
  regimeTVA: 'standard', // 'franchise' (AE sous seuil) | 'standard' | 'reel_normal'
  // Contact
  email: '',
  telephone: '',
  // Adresse
  adresse: '',           // Rue
  codePostal: '',
  ville: '',
  // Assurances BTP (obligatoire)
  decennale: '',
  decennaleAssureur: '',
  decennaleCouverture: 'France metropolitaine',
  decennaleExpire: '',
  rcpro: '',
  rcproAssureur: '',
  rcproExpire: '',
  // Paiements
  rib: '',               // IBAN complet
  bicSwift: '',
  banque: '',            // Nom de la banque
  // Métiers (multi-select)
  metiers: [],           // ['Plomberie', 'Chauffage', 'Electricite']
  metier: '',            // Ancien champ (rétrocompat) — converti en metiers[]
  // Optionnel
  logoUrl: '',
  signatureGerant: '',   // Nom du signataire principal
  slogan: '',
};

// Champs obligatoires pour pouvoir creer un devis
export const CHAMPS_REQUIS_DEVIS = ['nom', 'forme', 'siret', 'adresse', 'codePostal', 'ville', 'email'];

export function getProfilEntreprise(user) {
  // Détermine la clé selon le type de compte
  const key = user?.entrepriseType === 'ae' ? 'freample_ae_profil' : 'freample_profil_patron';
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '{}');
    // Compat : récupérer d'anciens champs (tel vs telephone)
    // Rétrocompat : convertir ancien champ metier (string) en metiers (array)
    let metiers = raw.metiers || [];
    if (metiers.length === 0 && raw.metier && typeof raw.metier === 'string' && raw.metier.trim()) {
      metiers = [raw.metier.trim()];
    }
    return {
      ...CHAMPS_PROFIL_ENTREPRISE,
      ...raw,
      metiers,
      telephone: raw.telephone || raw.tel || '',
      forme: raw.forme || (user?.entrepriseType === 'ae' ? 'Auto-entrepreneur' : 'SAS'),
      regimeTVA: raw.regimeTVA || (user?.entrepriseType === 'ae' ? 'franchise' : 'standard'),
      nom: raw.nom || user?.nom || '',
      email: raw.email || user?.email || '',
    };
  } catch {
    return { ...CHAMPS_PROFIL_ENTREPRISE, nom: user?.nom || '', email: user?.email || '' };
  }
}

export function setProfilEntreprise(user, profil) {
  const key = user?.entrepriseType === 'ae' ? 'freample_ae_profil' : 'freample_profil_patron';
  const current = getProfilEntreprise(user);
  const merged = { ...current, ...profil };
  localStorage.setItem(key, JSON.stringify(merged));
  return merged;
}

export function isProfilComplet(profil) {
  return CHAMPS_REQUIS_DEVIS.every(k => profil?.[k] && String(profil[k]).trim() !== '');
}

export function champsManquants(profil) {
  return CHAMPS_REQUIS_DEVIS.filter(k => !profil?.[k] || String(profil[k]).trim() === '');
}

// ── Corps de métier BTP ──
export const CORPS_METIER_BTP = [
  'Plomberie', 'Electricite', 'Peinture', 'Maconnerie', 'Carrelage', 'Menuiserie',
  'Couverture', 'Chauffage', 'Serrurerie', 'Platrerie', 'Isolation', 'Demolition',
  'Terrassement', 'Charpente', 'Facade', 'Climatisation', 'Domotique', 'Amenagement exterieur',
];

// ── Mapping habilitations obligatoires par métier ──
export const HABILITATIONS_REQUISES = {
  'Electricite': { type: 'Habilitation electrique', codes: ['B1V', 'B2V', 'BR', 'BC'] },
  'Couverture': { type: 'Formation travail en hauteur', codes: [] },
  'Chauffage': { type: 'Attestation aptitude gaz', codes: ['PGN', 'PGP'] },
  'Climatisation': { type: 'Attestation fluides frigorigenes', codes: [] },
};

// ── Fiches salariés ──
export const FICHE_SALARIE_VIDE = {
  id: null, nom: '', prenom: '', poste: '', telephone: '', email: '', dateEntree: '',
  competences: [],    // Corps de métier que le salarié sait faire
  habilitations: [],  // [{ type, numero, organisme, dateObtention, dateExpiration }]
  certifications: [], // [{ type, organisme, dateExpiration }]
  carteBTP: { numero: '', dateExpiration: '' },
  visiteMedicale: { derniere: '', prochaine: '' },
  isPatron: false,    // true pour la fiche du patron lui-même
  actif: true,
};

export const DEMO_FICHES_SALARIES = [
  { id: 'patron', nom: 'Lambert', prenom: 'Marc', poste: 'Patron - Gérant', telephone: '04 91 55 12 34', email: 'demo-patron@freample.fr', dateEntree: '2018-01-15', competences: ['Maçonnerie', 'Plomberie', 'Électricité'], habilitations: [], certifications: [], carteBTP: { numero: 'BTP-PATRON-001', dateExpiration: '2028-01-15' }, visiteMedicale: { derniere: '2025-06-15', prochaine: '2026-06-15' }, isPatron: true, actif: true },
  { id: 's1', nom: 'Martin', prenom: 'Pierre', poste: 'Maçon', telephone: '06 12 34 56 78', email: '', dateEntree: '2022-03-15', competences: ['Maçonnerie', 'Plomberie'], habilitations: [{ type: 'CACES R489', numero: 'CAC-2024-001', organisme: 'AFTRAL', dateObtention: '2024-03-15', dateExpiration: '2029-03-15' }, { type: 'Travail en hauteur', numero: 'HAU-2024-012', organisme: 'APAVE', dateObtention: '2024-06-01', dateExpiration: '2027-06-01' }], certifications: [], carteBTP: { numero: 'BTP-100001', dateExpiration: '2027-03-01' }, visiteMedicale: { derniere: '2025-09-15', prochaine: '2026-09-15' }, isPatron: false, actif: true },
  { id: 's2', nom: 'Duval', prenom: 'Sophie', poste: 'Plombière', telephone: '06 23 45 67 89', email: '', dateEntree: '2023-01-10', competences: ['Plomberie', 'Chauffage'], habilitations: [{ type: 'Habilitation électrique B1', numero: 'ELEC-2024-042', organisme: 'APAVE', dateObtention: '2024-02-10', dateExpiration: '2027-02-10' }], certifications: [], carteBTP: { numero: 'BTP-100002', dateExpiration: '2027-09-01' }, visiteMedicale: { derniere: '2025-11-10', prochaine: '2026-11-10' }, isPatron: false, actif: true },
  { id: 's3', nom: 'Garcia', prenom: 'Lucas', poste: 'Carreleur', telephone: '06 34 56 78 90', email: 'demo-employe@freample.fr', dateEntree: '2023-09-01', competences: ['Carrelage', 'Maçonnerie'], habilitations: [{ type: 'Travail en hauteur', numero: 'HAU-2024-028', organisme: 'APAVE', dateObtention: '2024-09-01', dateExpiration: '2027-09-01' }], certifications: [], carteBTP: { numero: 'BTP-100003', dateExpiration: '2028-09-01' }, visiteMedicale: { derniere: '2026-01-10', prochaine: '2027-01-10' }, isPatron: false, actif: true },
  { id: 's4', nom: 'Moreau', prenom: 'Luc', poste: 'Peintre', telephone: '06 45 67 89 01', email: '', dateEntree: '2024-02-01', competences: ['Peinture', 'Carrelage'], habilitations: [], certifications: [], carteBTP: { numero: 'BTP-100004', dateExpiration: '2028-02-01' }, visiteMedicale: { derniere: '2025-08-20', prochaine: '2026-08-20' }, isPatron: false, actif: true },
  { id: 's5', nom: 'Bernard', prenom: 'Claire', poste: 'Électricienne', telephone: '06 56 78 90 12', email: '', dateEntree: '2024-06-15', competences: ['Électricité', 'Plomberie'], habilitations: [{ type: 'Habilitation électrique B2', numero: 'ELEC-2024-018', organisme: 'APAVE', dateObtention: '2024-06-15', dateExpiration: '2027-06-15' }, { type: 'BR', numero: 'BR-2024-019', organisme: 'APAVE', dateObtention: '2024-06-15', dateExpiration: '2027-06-15' }], certifications: [], carteBTP: { numero: 'BTP-100005', dateExpiration: '2028-06-15' }, visiteMedicale: { derniere: '2025-05-20', prochaine: '2026-05-20' }, isPatron: false, actif: true },
];

// ── Helpers fiches salariés ──
export function getFichesSalaries() {
  try { const s = localStorage.getItem('freample_fiches_salaries'); return s ? JSON.parse(s) : DEMO_FICHES_SALARIES; }
  catch { return DEMO_FICHES_SALARIES; }
}
export function setFichesSalaries(fiches) { localStorage.setItem('freample_fiches_salaries', JSON.stringify(fiches)); }

export function getCompetencesEquipe() {
  const fiches = getFichesSalaries().filter(f => f.actif);
  const map = {};
  CORPS_METIER_BTP.forEach(m => { map[m] = fiches.filter(f => f.competences.includes(m)).map(f => `${f.prenom} ${f.nom}`); });
  return map;
}

export function verifierHabilitation(fiche, metier) {
  const requis = HABILITATIONS_REQUISES[metier];
  if (!requis) return { requis: false };
  const hab = fiche.habilitations.find(h => h.type === requis.type || requis.codes.some(c => h.type?.includes(c) || h.numero?.includes(c)));
  if (!hab) return { requis: true, possede: false, message: `${requis.type} requise pour ${metier}` };
  const expired = hab.dateExpiration && new Date(hab.dateExpiration) < new Date();
  return { requis: true, possede: true, expire: expired, habilitation: hab, message: expired ? `${requis.type} expiree depuis le ${hab.dateExpiration}` : null };
}

export const LABELS_CHAMPS = {
  nom: 'Raison sociale', forme: 'Forme juridique', siret: 'SIRET', tvaIntra: 'N° TVA intracom.',
  regimeTVA: 'Régime TVA', email: 'Email', telephone: 'Téléphone',
  adresse: 'Adresse (rue)', codePostal: 'Code postal', ville: 'Ville',
  decennale: 'N° décennale', decennaleAssureur: 'Assureur décennale',
  decennaleExpire: 'Expiration décennale', rcpro: 'N° RC Pro', rcproAssureur: 'Assureur RC Pro',
  rcproExpire: 'Expiration RC Pro', rib: 'IBAN', bicSwift: 'BIC', banque: 'Banque',
  signatureGerant: 'Nom du gérant',
};
