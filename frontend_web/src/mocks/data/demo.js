// ─── Consistent demo data shared across all MSW handlers ─────────────────────

// ── Client ────────────────────────────────────────────────────────────────────
export const CLIENT_DASHBOARD = {
  nom:              'Marie Dupont',
  missionsEnCours:  2,
  devisEnAttente:   3,
  messagesNonLus:   1,
  prochaineVisite:  '2026-04-02',
  chantiers: [
    { id: 101, titre: 'Réparation fuite sous évier',    statut: 'en_cours',    artisan: 'Carlos Silva',  date: '2026-03-20' },
    { id: 102, titre: 'Installation prise électrique',  statut: 'planifié',    artisan: 'Éric Leroy',    date: '2026-04-05' },
    { id: 103, titre: 'Peinture salon',                 statut: 'terminé',     artisan: 'Sophie Bernard', date: '2026-02-14' },
  ],
};

export const CLIENT_ARTISANS = [
  { id: 10, nom: 'Carlos Silva',   specialite: 'Plomberie',     note: 4.8, travaux: 47, distance: 2.1,  disponible: true,  photo: null },
  { id: 11, nom: 'Éric Leroy',     specialite: 'Électricité',   note: 4.6, travaux: 62, distance: 3.5,  disponible: true,  photo: null },
  { id: 12, nom: 'Sophie Bernard', specialite: 'Peinture',      note: 4.9, travaux: 31, distance: 1.8,  disponible: false, photo: null },
  { id: 13, nom: 'Marc Durand',    specialite: 'Menuiserie',    note: 4.5, travaux: 28, distance: 4.2,  disponible: true,  photo: null },
  { id: 14, nom: 'Julie Petit',    specialite: 'Carrelage',     note: 4.7, travaux: 19, distance: 5.0,  disponible: true,  photo: null },
  { id: 15, nom: 'Ahmed Benali',   specialite: 'Maçonnerie',    note: 4.4, travaux: 55, distance: 6.3,  disponible: false, photo: null },
];

export const CLIENT_DEVIS = [
  { id: 201, titre: 'Réfection salle de bain',   artisan: 'Carlos Silva',   montant: 3200, statut: 'en_attente', date: '2026-03-22' },
  { id: 202, titre: 'Tableau électrique neuf',   artisan: 'Éric Leroy',     montant: 850,  statut: 'en_attente', date: '2026-03-24' },
  { id: 203, titre: 'Parquet chêne massif',      artisan: 'Marc Durand',    montant: 4600, statut: 'accepté',    date: '2026-03-01' },
  { id: 204, titre: 'Peinture 3 pièces',         artisan: 'Sophie Bernard', montant: 1800, statut: 'refusé',     date: '2026-02-20' },
];

export const CLIENT_PAIEMENTS = [
  { id: 301, titre: 'Réparation fuite', artisan: 'Carlos Silva',   montant: 320,  date: '2026-03-15', statut: 'payé'      },
  { id: 302, titre: 'Peinture salon',   artisan: 'Sophie Bernard', montant: 1200, date: '2026-02-28', statut: 'payé'      },
  { id: 303, titre: 'Parquet chêne',    artisan: 'Marc Durand',    montant: 4600, date: '2026-04-10', statut: 'en_attente' },
];

export const CLIENT_PARRAINAGE = {
  code:             'MARIE2026',
  filleuls:         3,
  gainsTotal:       75,
  gainsPendants:    25,
  url:              'https://artisanspro.fr/register?ref=MARIE2026',
  historique: [
    { nom: 'Paul Lefebvre',  date: '2026-02-10', gain: 25, statut: 'validé'    },
    { nom: 'Lucie Martin',   date: '2026-01-22', gain: 25, statut: 'validé'    },
    { nom: 'Théo Rousseau',  date: '2026-03-05', gain: 25, statut: 'en_attente' },
  ],
};

// Messages per missionId stored in localStorage for persistence
export function getMessages(missionId) {
  const key = `messages_${missionId}`;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  // Default seeded messages
  const defaults = {
    101: [
      { id: 1, auteur: 'artisan', nomAuteur: 'Carlos Silva', texte: 'Bonjour, je serai chez vous demain à 9h pour inspecter la fuite.', date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 2, auteur: 'client',  nomAuteur: 'Marie Dupont', texte: 'Parfait, je serai disponible. Merci !',                            date: new Date(Date.now() - 86400000 * 2 + 600000).toISOString() },
      { id: 3, auteur: 'artisan', nomAuteur: 'Carlos Silva', texte: 'J\'ai identifié le problème : joint usé sous le siphon. Devis envoyé.', date: new Date(Date.now() - 86400000).toISOString() },
    ],
    102: [
      { id: 1, auteur: 'artisan', nomAuteur: 'Éric Leroy', texte: 'Bonjour, votre demande d\'installation de prise a bien été reçue.', date: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 2, auteur: 'client',  nomAuteur: 'Marie Dupont', texte: 'Bonjour Éric, quand pouvez-vous intervenir ?',                      date: new Date(Date.now() - 86400000 * 3 + 1800000).toISOString() },
    ],
  };
  const msgs = defaults[missionId] || [];
  localStorage.setItem(key, JSON.stringify(msgs));
  return msgs;
}

export function saveMessages(missionId, messages) {
  localStorage.setItem(`messages_${missionId}`, JSON.stringify(messages));
}

// ── Patron ────────────────────────────────────────────────────────────────────
export const PATRON_DASHBOARD = {
  ca_mensuel:       47200,
  ca_variation:     12.4,
  chantiers_actifs: 8,
  devis_envoyes:    14,
  taux_conversion:  68,
  masse_salariale:  18400,
};

export const PATRON_CHANTIERS = [
  { id: 501, titre: 'Rénovation cuisine Dupont',     statut: 'en_cours',   client: 'Marie Dupont',     montant: 8500,  avancement: 65, dateDebut: '2026-03-01', dateFin: '2026-04-15' },
  { id: 502, titre: 'Salle de bain Martin',          statut: 'en_cours',   client: 'Pierre Martin',    montant: 12000, avancement: 30, dateDebut: '2026-03-15', dateFin: '2026-05-10' },
  { id: 503, titre: 'Extension maison Leroy',        statut: 'planifié',   client: 'Sophie Leroy',     montant: 45000, avancement: 0,  dateDebut: '2026-04-20', dateFin: '2026-09-30' },
  { id: 504, titre: 'Ravalement façade Bernard',     statut: 'en_cours',   client: 'Paul Bernard',     montant: 7200,  avancement: 80, dateDebut: '2026-02-20', dateFin: '2026-03-30' },
  { id: 505, titre: 'Toiture maison Rousseau',       statut: 'terminé',    client: 'Alice Rousseau',   montant: 15000, avancement: 100, dateDebut: '2026-01-10', dateFin: '2026-02-28' },
];

export const PATRON_PIPELINE = [
  { id: 601, client: 'Jean-Claude Robert',  travaux: 'Réfection toiture',        montant: 22000, etape: 'devis_envoye' },
  { id: 602, client: 'Nathalie Girard',     travaux: 'Isolation combles',        montant: 8500,  etape: 'negociation'  },
  { id: 603, client: 'Fabrice Morel',       travaux: 'Salle de bain complète',   montant: 18000, etape: 'nouveau'      },
  { id: 604, client: 'Isabelle Fontaine',   travaux: 'Carrelage terrasse',       montant: 4200,  etape: 'devis_envoye' },
];

export const PATRON_ALERTES = [
  { id: 1, type: 'urssaf',    message: 'Déclaration URSSAF due le 5 avril', urgence: 'haute',  date: '2026-04-05' },
  { id: 2, type: 'facture',   message: 'Facture #2024-089 impayée (J+32)', urgence: 'haute',  date: '2026-02-23' },
  { id: 3, type: 'conge',     message: '2 demandes de congés en attente',  urgence: 'normal', date: '2026-03-26' },
  { id: 4, type: 'stock',     message: 'Stock enduit de façade < seuil',   urgence: 'normal', date: '2026-03-25' },
];

// ── Finance ───────────────────────────────────────────────────────────────────
export const FINANCE_DASHBOARD = {
  caAnnuel:         421500,
  taux_precedent:   8.2,
  marge:            31.4,
  margePrecedente:  29.1,
  totalPrecedent:   389200,
  mensuel: [
    { mois: 'Jan', ca: 28400, charges: 17800, color: '#5B5BD6' },
    { mois: 'Fév', ca: 31200, charges: 19200, color: '#5B5BD6' },
    { mois: 'Mar', ca: 35600, charges: 21000, color: '#5B5BD6' },
    { mois: 'Avr', ca: 29800, charges: 18400, color: '#5B5BD6' },
    { mois: 'Mai', ca: 38200, charges: 22000, color: '#5B5BD6' },
    { mois: 'Jun', ca: 42000, charges: 24500, color: '#5B5BD6' },
    { mois: 'Jul', ca: 36500, charges: 21200, color: '#5B5BD6' },
    { mois: 'Aoû', ca: 29100, charges: 17600, color: '#5B5BD6' },
    { mois: 'Sep', ca: 41800, charges: 23800, color: '#5B5BD6' },
    { mois: 'Oct', ca: 44200, charges: 25100, color: '#5B5BD6' },
    { mois: 'Nov', ca: 39700, charges: 22400, color: '#5B5BD6' },
    { mois: 'Déc', ca: 25000, charges: 15000, color: '#818CF8' },
  ],
  topClients: [
    { nom: 'Alice Rousseau',    ca: 45000, tauxPaiement: 100 },
    { nom: 'Jean-Claude Robert',ca: 38500, tauxPaiement: 92  },
    { nom: 'Sophie Leroy',      ca: 35200, tauxPaiement: 88  },
    { nom: 'Paul Bernard',      ca: 28700, tauxPaiement: 100 },
    { nom: 'Nathalie Girard',   ca: 22100, tauxPaiement: 75  },
  ],
};

export const FINANCE_DEVIS = [
  { id: 701, client: 'Jean-Claude Robert',  objet: 'Réfection toiture',      montant: 22000, statut: 'envoyé',   date: '2026-03-20' },
  { id: 702, client: 'Nathalie Girard',     objet: 'Isolation combles',      montant: 8500,  statut: 'accepté',  date: '2026-03-18' },
  { id: 703, client: 'Fabrice Morel',       objet: 'Salle de bain complète', montant: 18000, statut: 'brouillon', date: '2026-03-25' },
  { id: 704, client: 'Isabelle Fontaine',   objet: 'Carrelage terrasse',     montant: 4200,  statut: 'refusé',   date: '2026-03-10' },
  { id: 705, client: 'Marc Dupuis',         objet: 'Ravalement façade',      montant: 9800,  statut: 'envoyé',   date: '2026-03-22' },
];

export const FINANCE_FACTURES = [
  { id: 801, client: 'Alice Rousseau',    objet: 'Toiture maison',         montant: 15000, statut: 'payée',      date: '2026-02-28', echeance: '2026-03-28' },
  { id: 802, client: 'Paul Bernard',      objet: 'Ravalement façade',      montant: 7200,  statut: 'payée',      date: '2026-03-05', echeance: '2026-04-04' },
  { id: 803, client: 'Jean-Claude Robert',objet: 'Réfection toiture',      montant: 22000, statut: 'en_attente', date: '2026-02-23', echeance: '2026-03-25' },
  { id: 804, client: 'Sophie Leroy',      objet: 'Extension acompte 1',    montant: 9000,  statut: 'envoyée',    date: '2026-03-15', echeance: '2026-04-15' },
  { id: 805, client: 'Nathalie Girard',   objet: 'Isolation combles',      montant: 8500,  statut: 'en_attente', date: '2026-03-18', echeance: '2026-04-18' },
];

export const FINANCE_TRESORERIE = {
  soldeActuel:          68420,
  encaissementsAttendus: 39500,
  decaissementsPrevis:   21200,
  encaissements: [
    { id: 1, libelle: 'Facture #804 Sophie Leroy',   montant: 9000,  echeance: '2026-04-15', joursRestants: 20, statut: 'à venir'    },
    { id: 2, libelle: 'Facture #803 J.C. Robert',    montant: 22000, echeance: '2026-03-25', joursRestants: -1, statut: 'en_retard'  },
    { id: 3, libelle: 'Facture #805 N. Girard',      montant: 8500,  echeance: '2026-04-18', joursRestants: 23, statut: 'à venir'    },
  ],
  decaissements: [
    { id: 1, libelle: 'Charges sociales URSSAF',     montant: 6840,  echeance: '2026-04-05', joursRestants: 10 },
    { id: 2, libelle: 'Loyer atelier',               montant: 1800,  echeance: '2026-04-01', joursRestants: 6  },
    { id: 3, libelle: 'Fournisseur matériaux',       montant: 4200,  echeance: '2026-04-10', joursRestants: 15 },
    { id: 4, libelle: 'Masse salariale',             montant: 8360,  echeance: '2026-03-31', joursRestants: 5  },
  ],
  previsionnel3Mois: [
    { mois: 'Avril', entrees: 39500, sorties: 21200, solde: 86720 },
    { mois: 'Mai',   entrees: 42000, sorties: 23000, solde: 105720 },
    { mois: 'Juin',  entrees: 38000, sorties: 20500, solde: 123220 },
  ],
};

// ── URSSAF ────────────────────────────────────────────────────────────────────
export const URSSAF_HISTORIQUE = [
  { mois: 'Jan', montant: 4820, statut: 'payé', dateReglement: '2026-02-05' },
  { mois: 'Fév', montant: 5140, statut: 'payé', dateReglement: '2026-03-05' },
  { mois: 'Mar', montant: 5680, statut: 'payé', dateReglement: '2026-04-04' },
  { mois: 'Avr', montant: 4920, statut: 'payé', dateReglement: '2026-05-05' },
  { mois: 'Mai', montant: 6100, statut: 'payé', dateReglement: '2026-06-05' },
  { mois: 'Jun', montant: 6740, statut: 'payé', dateReglement: '2026-07-04' },
  { mois: 'Jul', montant: 5830, statut: 'payé', dateReglement: '2026-08-05' },
  { mois: 'Aoû', montant: 4650, statut: 'payé', dateReglement: '2026-09-05' },
  { mois: 'Sep', montant: 6680, statut: 'payé', dateReglement: '2026-10-05' },
  { mois: 'Oct', montant: 7060, statut: 'payé', dateReglement: '2026-11-05' },
  { mois: 'Nov', montant: 6340, statut: 'payé', dateReglement: '2026-12-05' },
  { mois: 'Déc', montant: 3990, statut: 'en_attente', dateReglement: null    },
];

export const URSSAF_RECAPITULATIF = {
  totalAnnee:     68950,
  moyenneMensuelle: 5746,
  tauxMoyen:      14.6,
  regime:         'régime_réel',
};

export const URSSAF_ALERTES = [
  { id: 1, type: 'echeance', message: 'DSN mensuelle due le 5 avril 2026', urgence: 'haute', date: '2026-04-05' },
  { id: 2, type: 'info',     message: 'Taux AT/MP révisé au 1er janvier 2026 : 1.85%', urgence: 'info', date: '2026-01-01' },
];

// ── RH ────────────────────────────────────────────────────────────────────────
export const RH_EMPLOYES = [
  { id: 1, nom: 'Thomas Girard',   poste: 'Plombier senior',      statut: 'CDI',     salaireBrut: 2850, dateEntree: '2020-03-01', competences: ['plomberie', 'chauffage'], congesRestants: 12 },
  { id: 2, nom: 'Lucas Morel',     poste: 'Électricien',           statut: 'CDI',     salaireBrut: 2650, dateEntree: '2021-09-15', competences: ['electricite', 'courant faible'], congesRestants: 8  },
  { id: 3, nom: 'Sarah Petit',     poste: 'Assistante admin',      statut: 'CDI',     salaireBrut: 2100, dateEntree: '2022-01-10', competences: ['administration', 'comptabilite'], congesRestants: 15 },
  { id: 4, nom: 'Kevin Dubois',    poste: 'Apprenti plombier',     statut: 'apprenti', salaireBrut: 980,  dateEntree: '2024-09-02', competences: ['plomberie'], congesRestants: 5  },
];

export const RH_TABLEAU_DE_BORD = {
  effectifTotal:  4,
  masseBloc:      18400,
  congesEnCours:  1,
  formationsAVenir: 2,
};

export const RH_CONGES = [
  { id: 1, employe: 'Thomas Girard', debut: '2026-04-07', fin: '2026-04-18', jours: 10, type: 'CP', statut: 'approuvé'  },
  { id: 2, employe: 'Lucas Morel',   debut: '2026-05-25', fin: '2026-05-29', jours: 5,  type: 'CP', statut: 'en_attente' },
  { id: 3, employe: 'Sarah Petit',   debut: '2026-03-03', fin: '2026-03-07', jours: 5,  type: 'CP', statut: 'approuvé'  },
];

export const RH_NOTES_FRAIS = [
  { id: 1, employe: 'Thomas Girard', objet: 'Déplacement chantier Rousseau', montant: 48.50, date: '2026-03-18', statut: 'approuvée'  },
  { id: 2, employe: 'Lucas Morel',   objet: 'Matériel chantier urgent',       montant: 127.30, date: '2026-03-20', statut: 'en_attente' },
  { id: 3, employe: 'Kevin Dubois',  objet: 'Outillage apprentissage',         montant: 85.00, date: '2026-03-22', statut: 'en_attente' },
];

export const RH_MASSE_SALARIALE = [
  { mois: 'Jan', brut: 18200, net: 14020, charges: 7280 },
  { mois: 'Fév', brut: 18200, net: 14020, charges: 7280 },
  { mois: 'Mar', brut: 18400, net: 14170, charges: 7360 },
  { mois: 'Avr', brut: 18400, net: 14170, charges: 7360 },
  { mois: 'Mai', brut: 19200, net: 14785, charges: 7680 },
  { mois: 'Jun', brut: 19200, net: 14785, charges: 7680 },
  { mois: 'Jul', brut: 18800, net: 14475, charges: 7520 },
  { mois: 'Aoû', brut: 17600, net: 13550, charges: 7040 },
  { mois: 'Sep', brut: 18400, net: 14170, charges: 7360 },
  { mois: 'Oct', brut: 18400, net: 14170, charges: 7360 },
  { mois: 'Nov', brut: 18400, net: 14170, charges: 7360 },
  { mois: 'Déc', brut: 19800, net: 15245, charges: 7920 },
];

// ── Missions partagées ────────────────────────────────────────────────────────
export const MISSIONS = [
  { id: 101, titre: 'Réparation fuite sous évier',   statut: 'en_cours',  client: 'Marie Dupont',   artisan: 'Carlos Silva', montant: 320  },
  { id: 102, titre: 'Installation prise électrique', statut: 'planifié',  client: 'Marie Dupont',   artisan: 'Éric Leroy',   montant: 220  },
  { id: 103, titre: 'Peinture salon',                statut: 'terminé',   client: 'Marie Dupont',   artisan: 'Sophie Bernard', montant: 1200 },
  { id: 501, titre: 'Rénovation cuisine Dupont',     statut: 'en_cours',  client: 'Marie Dupont',   artisan: 'Carlos Silva', montant: 8500 },
  { id: 502, titre: 'Salle de bain Martin',          statut: 'en_cours',  client: 'Pierre Martin',  artisan: 'Carlos Silva', montant: 12000 },
];

// ── QSE ───────────────────────────────────────────────────────────────────────
export const QSE_DASHBOARD = {
  incidentsMonth: 0,
  auditsOk:       3,
  formationsOk:   8,
  nonConformites: 1,
  scoreGlobal:    94,
  risques: [
    { id: 1, titre: 'Travaux en hauteur', niveau: 'moyen', mesures: 'Harnais obligatoire' },
    { id: 2, titre: 'Produits chimiques', niveau: 'faible', mesures: 'EPI fournis'        },
  ],
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const ADMIN_DASHBOARD = {
  utilisateurs:   1284,
  artisans:       348,
  missions:       2147,
  caTotal:        892000,
  croissance:     18.4,
};

export const ADMIN_ARTISANS_EN_ATTENTE = [
  { id: 901, nom: 'Pierre Fontaine', specialite: 'Couverture',  siret: '89234567800012', dateInscription: '2026-03-20', documents: ['kbis', 'assurance'] },
  { id: 902, nom: 'Anna Kowalski',   specialite: 'Carrelage',   siret: '91234567800034', dateInscription: '2026-03-22', documents: ['kbis']              },
];
