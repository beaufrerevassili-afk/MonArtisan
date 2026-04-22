/**
 * Source unique de données démo Freample
 * TOUS les fichiers doivent importer depuis ici — jamais de noms en dur ailleurs
 */

// ══ ENTREPRISE ══
export const DEMO_ENTREPRISE = {
  nom: 'Lambert BTP',
  patron: 'Marc Lambert',
  siret: '84923157600014',
  adresse: '45 boulevard de la Libération, 13001 Marseille',
  telephone: '04 91 55 12 34',
  email: 'contact@lambertbtp.fr',
  decennale: 'DEC-2024-098712',
  metiers: ['Maçonnerie', 'Plomberie', 'Électricité', 'Peinture', 'Carrelage'],
  forme: 'SAS',
  ville: 'Marseille',
};

// ══ SALARIÉS (5 salariés fixes) ══
export const DEMO_SALARIES = [
  { id: 'e1', prenom: 'Pierre', nom: 'Martin', poste: 'Maçon', metier: 'Maçonnerie', email: 'pierre.martin@lambertbtp.fr', telephone: '06 12 34 56 78', dateEntree: '2022-03-15', salaireBase: 2800, typeContrat: 'CDI', couleur: '#5B5BD6', habilitations: ['CACES R489', 'Travail en hauteur'] },
  { id: 'e2', prenom: 'Sophie', nom: 'Duval', poste: 'Plombière', metier: 'Plomberie', email: 'sophie.duval@lambertbtp.fr', telephone: '06 23 45 67 89', dateEntree: '2023-01-10', salaireBase: 2600, typeContrat: 'CDI', couleur: '#34C759', habilitations: ['Habilitation électrique B1'] },
  { id: 'e3', prenom: 'Lucas', nom: 'Garcia', poste: 'Carreleur', metier: 'Carrelage', email: 'lucas.garcia@lambertbtp.fr', telephone: '06 34 56 78 90', dateEntree: '2023-09-01', salaireBase: 2500, typeContrat: 'CDI', couleur: '#FF9500', habilitations: ['Travail en hauteur'] },
  { id: 'e4', prenom: 'Luc', nom: 'Moreau', poste: 'Peintre', metier: 'Peinture', email: 'luc.moreau@lambertbtp.fr', telephone: '06 45 67 89 01', dateEntree: '2024-02-01', salaireBase: 2400, typeContrat: 'CDI', couleur: '#AF52DE', habilitations: [] },
  { id: 'e5', prenom: 'Claire', nom: 'Bernard', poste: 'Électricienne', metier: 'Électricité', email: 'claire.bernard@lambertbtp.fr', telephone: '06 56 78 90 12', dateEntree: '2024-06-15', salaireBase: 2700, typeContrat: 'CDI', couleur: '#FF3B30', habilitations: ['Habilitation électrique B2', 'BR', 'HC'] },
];

// Noms complets pour les listes d'équipe
export const DEMO_NOMS_SALARIES = DEMO_SALARIES.map(s => `${s.prenom} ${s.nom}`);

// ══ CLIENTS (5 clients fixes) ══
export const DEMO_CLIENTS = [
  { id: 'c1', nom: 'Mme Dupont', prenom: 'Marie', email: 'marie.dupont@mail.fr', telephone: '06 67 89 01 23', adresse: '12 rue de la Liberté, 13001 Marseille', type: 'particulier' },
  { id: 'c2', nom: 'M. Leblanc', prenom: 'François', email: 'leblanc@mail.fr', telephone: '06 78 90 12 34', adresse: '8 bd Longchamp, 13001 Marseille', type: 'particulier' },
  { id: 'c3', nom: 'Copropriété Les Oliviers', prenom: '', email: 'contact@oliviers-copro.fr', telephone: '04 91 22 33 44', adresse: '5 rue Pasteur, 13006 Marseille', type: 'copropriete' },
  { id: 'c4', nom: 'Syndic Voltaire', prenom: '', email: 'voltaire@syndic.fr', telephone: '04 91 33 44 55', adresse: '15 bd Voltaire, 13005 Marseille', type: 'copropriete' },
  { id: 'c5', nom: 'M. Rousseau', prenom: 'Thomas', email: 'rousseau@mail.fr', telephone: '06 89 01 23 45', adresse: '24 rue Paradis, 13006 Marseille', type: 'particulier' },
];

// ══ CHANTIERS (5 chantiers liés aux clients + salariés) ══
export const DEMO_CHANTIERS = [
  {
    id: 'ch1', titre: 'Rénovation cuisine — Mme Dupont', description: 'Rénovation complète cuisine 12m² : plomberie, électricité, carrelage, peinture.',
    client: 'Mme Dupont', adresse: '12 rue de la Liberté, 13001 Marseille',
    statut: 'en_cours', avancement: 65, budgetPrevu: 8500, caDevis: 8500,
    dateDebut: '2026-04-01', dateFin: '2026-04-25',
    equipe: ['Pierre Martin', 'Sophie Duval', 'Lucas Garcia'],
    source: 'marketplace',
  },
  {
    id: 'ch2', titre: 'Mise aux normes électriques — Copropriété Les Oliviers', description: 'Tableau électrique + câblage complet appartement T4.',
    client: 'Copropriété Les Oliviers', adresse: '5 rue Pasteur, 13006 Marseille',
    statut: 'planifie', avancement: 0, budgetPrevu: 4800, caDevis: 5200,
    dateDebut: '2026-04-28', dateFin: '2026-05-10',
    equipe: ['Claire Bernard', 'Marc Lambert'],
    source: 'direct',
  },
  {
    id: 'ch3', titre: 'Peinture parties communes — Syndic Voltaire', description: 'Peinture cage d\'escalier 4 étages + hall d\'entrée.',
    client: 'Syndic Voltaire', adresse: '15 bd Voltaire, 13005 Marseille',
    statut: 'en_cours', avancement: 40, budgetPrevu: 6200, caDevis: 6200,
    dateDebut: '2026-04-07', dateFin: '2026-04-18',
    equipe: ['Luc Moreau', 'Pierre Martin'],
    source: 'direct',
  },
  {
    id: 'ch4', titre: 'Salle de bain complète — M. Rousseau', description: 'Douche à l\'italienne, meuble vasque, carrelage sol et murs.',
    client: 'M. Rousseau', adresse: '24 rue Paradis, 13006 Marseille',
    statut: 'terminee', avancement: 100, budgetPrevu: 5500, caDevis: 5500,
    dateDebut: '2026-03-10', dateFin: '2026-03-28',
    equipe: ['Sophie Duval', 'Lucas Garcia'],
    source: 'marketplace',
  },
  {
    id: 'ch5', titre: 'Extension garage — M. Leblanc', description: 'Construction extension garage 20m² : fondations, murs, toiture, enduit.',
    client: 'M. Leblanc', adresse: '8 bd Longchamp, 13001 Marseille',
    statut: 'en_attente', avancement: 0, budgetPrevu: 15000, caDevis: 0,
    dateDebut: null, dateFin: null,
    equipe: [],
    source: 'marketplace',
  },
];

// ══ PLANNING HEBDO (lié aux chantiers + salariés) ══
export const DEMO_PLANNING = [
  { id: 1, nom: 'Pierre Martin', poste: 'Maçon', couleur: '#5B5BD6',
    semaine: { Lun: { debut: 7, fin: 17, label: 'Chantier Dupont' }, Mar: { debut: 7, fin: 17, label: 'Chantier Dupont' }, Mer: { debut: 7, fin: 12, label: 'Syndic Voltaire' }, Jeu: { debut: 7, fin: 17, label: 'Chantier Dupont' }, Ven: { debut: 7, fin: 16, label: 'Chantier Dupont' }, Sam: null } },
  { id: 2, nom: 'Sophie Duval', poste: 'Plombière', couleur: '#34C759',
    semaine: { Lun: { debut: 8, fin: 17, label: 'Chantier Dupont' }, Mar: { debut: 8, fin: 17, label: 'Chantier Dupont' }, Mer: null, Jeu: { debut: 8, fin: 17, label: 'Chantier Dupont' }, Ven: { debut: 8, fin: 14, label: 'Chantier Dupont' }, Sam: null } },
  { id: 3, nom: 'Lucas Garcia', poste: 'Carreleur', couleur: '#FF9500',
    semaine: { Lun: { debut: 8, fin: 17, label: 'Chantier Dupont' }, Mar: { debut: 8, fin: 17, label: 'Chantier Dupont' }, Mer: { debut: 8, fin: 17, label: 'Chantier Dupont' }, Jeu: null, Ven: null, Sam: null } },
  { id: 4, nom: 'Luc Moreau', poste: 'Peintre', couleur: '#AF52DE',
    semaine: { Lun: { debut: 7, fin: 17, label: 'Syndic Voltaire' }, Mar: { debut: 7, fin: 17, label: 'Syndic Voltaire' }, Mer: { debut: 7, fin: 17, label: 'Syndic Voltaire' }, Jeu: { debut: 7, fin: 17, label: 'Syndic Voltaire' }, Ven: { debut: 7, fin: 12, label: 'Syndic Voltaire' }, Sam: null } },
];

// ══ VÉHICULES ══
export const DEMO_VEHICULES = [
  { id: 'v1', label: 'Renault Trafic — AB-123-CD' },
  { id: 'v2', label: 'Citroën Berlingo — EF-456-GH' },
  { id: 'v3', label: 'Peugeot Expert — IJ-789-KL' },
];
