// ============================================================
//  seed.js — Initialise la base de données avec des données démo
//  Usage : node seed.js
// ============================================================
require('dotenv').config();
const bcrypt = require('bcrypt');
const { query, testConnection } = require('./db');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  console.log('📋 Création du schéma...');
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await query(sql);
  console.log('✅ Schéma créé');
}

async function seedUsers() {
  console.log('👤 Seed utilisateurs...');
  const comptes = [
    { nom: 'Alice Dupont',   email: 'client@demo.com',   motdepasse: 'client123',  role: 'client',      verified: true  },
    { nom: 'Bernard Martin', email: 'patron@demo.com',   motdepasse: 'patron123',  role: 'patron',      verified: true  },
    { nom: 'Carlos Garcia',  email: 'artisan@demo.com',  motdepasse: 'artisan123', role: 'artisan',     verified: true, telephone: '0612345678', metier: 'Plomberie', siret: '123 456 789 00012', ville: 'Paris 11e', experience: '15 ans' },
    { nom: 'Diana Prince',   email: 'admin@demo.com',    motdepasse: 'admin123',   role: 'super_admin', verified: true  },
    { nom: 'Admin Fondateur', email: process.env.FONDATEUR_EMAIL || 'fondateur@demo.com', motdepasse: process.env.FONDATEUR_PASSWORD || 'fondateur123', role: 'fondateur', verified: true },
    { nom: 'Éric Leroy',     email: 'artisan2@demo.com', motdepasse: 'artisan123', role: 'artisan',     verified: true, telephone: '0623456789', metier: 'Électricité', siret: '234 567 890 00023', ville: 'Paris 15e', experience: '10 ans' },
    { nom: 'Fatima Benali',  email: 'artisan3@demo.com', motdepasse: 'artisan123', role: 'artisan',     verified: true, telephone: '0634567890', metier: 'Peinture', siret: '345 678 901 00034', ville: 'Lyon 3e', experience: '8 ans' },
    { nom: 'Georges Petit',  email: 'client2@demo.com',  motdepasse: 'client123',  role: 'client',      verified: true  },
  ];

  for (const c of comptes) {
    const hash = await bcrypt.hash(c.motdepasse, 10);
    await query(
      `INSERT INTO users (nom, email, motdepasse, role, verified, telephone, metier, siret, ville, experience, statut_verification)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (email) DO NOTHING`,
      [c.nom, c.email, hash, c.role, c.verified, c.telephone || null, c.metier || null, c.siret || null, c.ville || null, c.experience || null, c.role === 'artisan' ? 'valide' : null]
    );
  }
  console.log(`✅ ${comptes.length} utilisateurs insérés`);
}

async function seedMissions() {
  console.log('🔨 Seed missions...');
  const { rows: users } = await query('SELECT id, email FROM users');
  const clientId  = users.find(u => u.email === 'client@demo.com')?.id  || 1;
  const artisanId = users.find(u => u.email === 'artisan@demo.com')?.id || 3;
  const artisan2Id = users.find(u => u.email === 'artisan2@demo.com')?.id || 5;
  const artisan3Id = users.find(u => u.email === 'artisan3@demo.com')?.id || 6;
  const client2Id = users.find(u => u.email === 'client2@demo.com')?.id || 7;

  const missions = [
    { titre: 'Rénovation salle de bain', description: 'Carrelage, plomberie et peinture', client_id: clientId, artisan_id: artisanId, statut: 'en_cours', priorite: 'haute', date_debut: '2024-03-01', date_fin: '2024-03-20', budget: 3500 },
    { titre: 'Installation électrique cuisine', description: 'Mise aux normes et ajout de prises', client_id: clientId, artisan_id: null, statut: 'en_attente', priorite: 'normale', date_debut: null, date_fin: null, budget: 1200 },
    { titre: 'Peinture façade', description: 'Ravalement complet de la façade sud', client_id: client2Id, artisan_id: artisan2Id, statut: 'terminee', priorite: 'normale', date_debut: '2024-02-01', date_fin: '2024-02-15', budget: 4800 },
    { titre: 'Pose de parquet', description: 'Parquet chêne massif 45m²', client_id: client2Id, artisan_id: null, statut: 'en_attente', priorite: 'basse', date_debut: null, date_fin: null, budget: 2200 },
    { titre: 'Réparation toiture', description: 'Remplacement de tuiles après tempête', client_id: clientId, artisan_id: artisan3Id, statut: 'assignee', priorite: 'urgente', date_debut: '2024-03-25', date_fin: null, budget: 1800 },
  ];

  for (const m of missions) {
    await query(
      `INSERT INTO missions (titre, description, client_id, artisan_id, statut, priorite, date_debut, date_fin, budget)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [m.titre, m.description, m.client_id, m.artisan_id, m.statut, m.priorite, m.date_debut, m.date_fin, m.budget]
    );
  }
  console.log(`✅ ${missions.length} missions insérées`);
}

async function seedEmployes() {
  console.log('👷 Seed employés...');
  const employes = [
    { prenom: 'Jean',  nom: 'Dupont', poste: 'Plombier Chef',  email: 'jean.dupont@artisans.fr',  telephone: '0612345678', date_entree: '2022-03-01', type_contrat: 'CDI', salaire_base: 2200 },
    { prenom: 'Marie', nom: 'Martin', poste: 'Électricienne',  email: 'marie.martin@artisans.fr', telephone: '0623456789', date_entree: '2021-09-15', type_contrat: 'CDI', salaire_base: 2400 },
    { prenom: 'Ahmed', nom: 'Benali', poste: 'Carreleur',      email: 'ahmed.benali@artisans.fr', telephone: '0634567890', date_entree: '2023-01-10', type_contrat: 'CDD', salaire_base: 2100 },
  ];
  for (const e of employes) {
    await query(
      `INSERT INTO employes (prenom, nom, poste, email, telephone, date_entree, type_contrat, salaire_base)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [e.prenom, e.nom, e.poste, e.email, e.telephone, e.date_entree, e.type_contrat, e.salaire_base]
    );
  }
  console.log(`✅ ${employes.length} employés insérés`);
}

async function seedHabilitations() {
  console.log('📋 Seed habilitations...');
  const { rows: employes } = await query('SELECT id FROM employes ORDER BY id LIMIT 3');
  if (employes.length < 3) return;
  const [e1, e2, e3] = employes;

  const habilitations = [
    { employe_id: e1.id, nom: 'Habilitation électrique B1', type: 'electrique', niveau: 'B1', organisme: 'APAVE',           date_obtention: '2023-06-15', date_expiration: '2026-06-15', statut: 'valide' },
    { employe_id: e2.id, nom: 'CACES R486 Cat. B',          type: 'caces',      niveau: 'Cat. B', organisme: 'Bureau Véritas', date_obtention: '2022-09-01', date_expiration: '2027-09-01', statut: 'valide' },
    { employe_id: e1.id, nom: 'SST Sauveteur Secouriste',   type: 'sst',        niveau: 'Recyclage', organisme: 'Croix-Rouge', date_obtention: '2024-01-20', date_expiration: '2026-01-20', statut: 'valide' },
    { employe_id: e3.id, nom: 'Formation travaux hauteur',  type: 'hauteur',    niveau: 'Confirmé', organisme: 'CNAM',        date_obtention: '2023-03-10', date_expiration: '2025-03-10', statut: 'expiree' },
  ];
  for (const h of habilitations) {
    await query(
      `INSERT INTO habilitations (employe_id, nom, type, niveau, organisme, date_obtention, date_expiration, statut)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [h.employe_id, h.nom, h.type, h.niveau, h.organisme, h.date_obtention, h.date_expiration, h.statut]
    );
  }
  console.log(`✅ ${habilitations.length} habilitations insérées`);
}

async function seedBulletinsPaie() {
  console.log('💰 Seed bulletins de paie...');
  const { rows: employes } = await query('SELECT id FROM employes ORDER BY id LIMIT 2');
  if (employes.length < 2) return;
  const [e1, e2] = employes;

  const bulletins = [
    { id: 'BP-2025-02-001', employe_id: e1.id, periode: 'Février 2025', mois: 2, annee: 2025, brut: 2200, frais_inclus: 0,   net_a_payer: 1702.90, cout_employeur: 3124, date_paiement: '2025-02-28' },
    { id: 'BP-2025-02-002', employe_id: e2.id, periode: 'Février 2025', mois: 2, annee: 2025, brut: 2400, frais_inclus: 145, net_a_payer: 2002.60, cout_employeur: 3408, date_paiement: '2025-02-28' },
    { id: 'BP-2025-03-001', employe_id: e1.id, periode: 'Mars 2025',    mois: 3, annee: 2025, brut: 2200, frais_inclus: 87.5, net_a_payer: 1790.40, cout_employeur: 3124, date_paiement: '2025-03-31' },
  ];
  for (const b of bulletins) {
    await query(
      `INSERT INTO bulletins_paie (id, employe_id, periode, mois, annee, brut, frais_inclus, net_a_payer, cout_employeur, statut, date_paiement)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'payé',$10)
       ON CONFLICT (id) DO NOTHING`,
      [b.id, b.employe_id, b.periode, b.mois, b.annee, b.brut, b.frais_inclus, b.net_a_payer, b.cout_employeur, b.date_paiement]
    );
  }
  console.log(`✅ ${bulletins.length} bulletins de paie insérés`);
}

async function seedUrssaf() {
  console.log('📊 Seed URSSAF...');
  const declarations = [
    { periode: 'T4-2023', ca: 24500, cotisations_calculees: 5635, statut: 'payée', date_limite: '2024-01-31', payee_le: '2024-01-28' },
    { periode: 'T1-2024', ca: 31200, cotisations_calculees: 7176, statut: 'payée', date_limite: '2024-04-30', payee_le: '2024-04-25' },
    { periode: 'T2-2024', ca: 28700, cotisations_calculees: 6601, statut: 'payée', date_limite: '2024-07-31', payee_le: '2024-07-29' },
    { periode: 'T3-2024', ca: 33100, cotisations_calculees: 7613, statut: 'payée', date_limite: '2024-10-31', payee_le: '2024-10-30' },
    { periode: 'T4-2024', ca: 29800, cotisations_calculees: 6854, statut: 'en_attente', date_limite: '2025-01-31', payee_le: null },
  ];
  for (const d of declarations) {
    await query(
      `INSERT INTO urssaf_declarations (periode, ca, cotisations_calculees, statut, date_limite, payee_le)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [d.periode, d.ca, d.cotisations_calculees, d.statut, d.date_limite, d.payee_le]
    );
  }
  console.log(`✅ ${declarations.length} déclarations URSSAF insérées`);
}

async function seedDevisPro() {
  console.log('📄 Seed devis professionnels...');
  const devisPro = [
    {
      numero: 'DEV-2024-001',
      client: JSON.stringify({ nom: 'M. Pierre Lefebvre', email: 'pierre.lefebvre@email.com', adresse: '12 rue des Roses, 75011 Paris', telephone: '06 12 34 56 78' }),
      titre: 'Rénovation cuisine complète',
      lignes: JSON.stringify([
        { description: 'Dépose et évacuation existant', quantite: 1, prixHT: 850, tva: 0.10, totalHT: 850 },
        { description: 'Pose carrelage sol 15m²', quantite: 15, prixHT: 65, tva: 0.10, totalHT: 975 },
        { description: 'Plomberie sanitaire', quantite: 1, prixHT: 1200, tva: 0.10, totalHT: 1200 },
        { description: 'Électricité mise aux normes', quantite: 1, prixHT: 800, tva: 0.10, totalHT: 800 },
      ]),
      total_ht: 4425, tva: 442.50, total_ttc: 4867.50,
      validite: 30, validite_date: '2024-04-15',
      conditions: 'Acompte 30 % à la commande. Solde à réception des travaux.',
      statut: 'envoyé', envoye_le: '2024-03-16T10:00:00Z',
    },
    {
      numero: 'DEV-2024-002',
      client: JSON.stringify({ nom: 'SCI Immo Paris', email: 'contact@sci-immo.fr', adresse: '45 avenue Haussmann, 75009 Paris', telephone: '01 23 45 67 89' }),
      titre: 'Réfection toiture 120m²',
      lignes: JSON.stringify([
        { description: 'Dépose tuiles existantes', quantite: 120, prixHT: 15, tva: 0.10, totalHT: 1800 },
        { description: 'Pose tuiles neuves', quantite: 120, prixHT: 45, tva: 0.10, totalHT: 5400 },
        { description: 'Isolation sous-toiture', quantite: 120, prixHT: 25, tva: 0.10, totalHT: 3000 },
      ]),
      total_ht: 11000, tva: 1100, total_ttc: 12100,
      validite: 45, validite_date: '2024-04-30',
      conditions: 'Acompte 40 % à la commande. 30 % à mi-chantier.',
      statut: 'signé', envoye_le: '2024-03-10T14:00:00Z', signe_le: '2024-03-15T11:30:00Z', signature_nom: 'Jean-Marc Dupuis',
    },
    {
      numero: 'DEV-2024-003',
      client: JSON.stringify({ nom: 'Mme Sophie Renard', email: 'sophie.renard@gmail.com', adresse: '8 impasse des Lilas, 92100 Boulogne', telephone: '06 98 76 54 32' }),
      titre: 'Création salle de bain',
      lignes: JSON.stringify([
        { description: 'Démolition cloison', quantite: 1, prixHT: 450, tva: 0.10, totalHT: 450 },
        { description: 'Plomberie sanitaire complète', quantite: 1, prixHT: 2200, tva: 0.10, totalHT: 2200 },
        { description: 'Carrelage sol + murs 22m²', quantite: 22, prixHT: 85, tva: 0.10, totalHT: 1870 },
      ]),
      total_ht: 6020, tva: 602, total_ttc: 6622,
      validite: 30, validite_date: '2024-04-20',
      conditions: 'Acompte 30 % à la commande. Solde à réception.',
      statut: 'brouillon',
    },
  ];
  for (const d of devisPro) {
    await query(
      `INSERT INTO devis_pro (numero, client, titre, lignes, total_ht, tva, total_ttc, validite, validite_date, conditions, statut, envoye_le, signe_le, signature_nom)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (numero) DO NOTHING`,
      [d.numero, d.client, d.titre, d.lignes, d.total_ht, d.tva, d.total_ttc, d.validite, d.validite_date, d.conditions, d.statut, d.envoye_le || null, d.signe_le || null, d.signature_nom || null]
    );
  }
  console.log(`✅ ${devisPro.length} devis pro insérés`);
}

async function seedChantiers() {
  console.log('🏗️  Seed chantiers...');
  const chantiers = [
    { nom: 'Rénovation appartement Lefebvre', client: 'M. Pierre Lefebvre', adresse: '12 rue des Roses, 75011 Paris', chef: 'Jean-Paul Moreau', statut: 'en_cours', avancement: 65, budget_prevu: 45000, budget_reel: 32500, date_debut: '2024-02-01', date_fin: '2024-04-15', equipe: JSON.stringify(['Jean-Paul Moreau', 'Carlos Garcia', 'Ahmed Ben Ali']), description: "Rénovation complète appartement 85m²", alertes: JSON.stringify([]) },
    { nom: 'Toiture SCI Immo Paris', client: 'SCI Immo Paris', adresse: '45 avenue Haussmann, 75009 Paris', chef: 'Bernard Martin', statut: 'en_cours', avancement: 85, budget_prevu: 12100, budget_reel: 11800, date_debut: '2024-03-10', date_fin: '2024-03-30', equipe: JSON.stringify(['Bernard Martin', 'Thomas Leroy']), description: 'Réfection toiture 120m²', alertes: JSON.stringify(['Retard météo — 3 jours']) },
    { nom: 'Salle de bain Renard', client: 'Mme Sophie Renard', adresse: '8 impasse des Lilas, 92100 Boulogne', chef: 'Carlos Garcia', statut: 'planifie', avancement: 0, budget_prevu: 6622, budget_reel: 0, date_debut: '2024-04-08', date_fin: '2024-04-20', equipe: JSON.stringify(['Carlos Garcia']), description: 'Création salle de bain', alertes: JSON.stringify([]) },
    { nom: 'Bureaux Société X', client: 'Société X SARL', adresse: '5 bd Malesherbes, 75008 Paris', chef: 'Jean-Paul Moreau', statut: 'termine', avancement: 100, budget_prevu: 28000, budget_reel: 27350, date_debut: '2024-01-10', date_fin: '2024-02-28', date_fin_reelle: '2024-02-26', equipe: JSON.stringify(['Jean-Paul Moreau', 'Thomas Leroy']), description: 'Rénovation 180m² bureaux', alertes: JSON.stringify([]) },
  ];
  for (const c of chantiers) {
    await query(
      `INSERT INTO chantiers (nom, client, adresse, chef, statut, avancement, budget_prevu, budget_reel, date_debut, date_fin, date_fin_reelle, equipe, description, alertes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [c.nom, c.client, c.adresse, c.chef, c.statut, c.avancement, c.budget_prevu, c.budget_reel, c.date_debut, c.date_fin, c.date_fin_reelle || null, c.equipe, c.description, c.alertes]
    );
  }
  console.log(`✅ ${chantiers.length} chantiers insérés`);
}

async function seedMessages() {
  console.log('💬 Seed messages...');
  const { rows: missions } = await query('SELECT id FROM missions ORDER BY id LIMIT 2');
  if (missions.length < 2) return;
  const [m1, m2] = missions;

  const messages = [
    { mission_id: m1.id, auteur: 'artisan', nom_auteur: 'Carlos Garcia', texte: "Bonjour ! J'ai bien reçu votre demande. Je peux intervenir dès demain matin entre 9h et 12h.", date: '2024-03-26T09:05:00Z' },
    { mission_id: m1.id, auteur: 'client',  nom_auteur: 'Alice Dupont',  texte: "Merci Carlos ! Pouvez-vous confirmer l'heure exacte ?", date: '2024-03-26T10:00:00Z' },
    { mission_id: m1.id, auteur: 'artisan', nom_auteur: 'Carlos Garcia', texte: "Je serai disponible entre 9h et 11h. Je vous appellerai 30 min avant.", date: '2024-03-26T10:15:00Z' },
    { mission_id: m2.id, auteur: 'artisan', nom_auteur: 'Éric Leroy',   texte: "Bonjour, le devis inclut la mise aux normes complète NF C 15-100.", date: '2024-03-18T11:30:00Z' },
    { mission_id: m2.id, auteur: 'client',  nom_auteur: 'Alice Dupont', texte: "Parfait, j'accepte votre devis.", date: '2024-03-20T10:30:00Z' },
  ];
  for (const m of messages) {
    await query(
      `INSERT INTO messages (mission_id, auteur, nom_auteur, texte, date) VALUES ($1,$2,$3,$4,$5)`,
      [m.mission_id, m.auteur, m.nom_auteur, m.texte, m.date]
    );
  }
  console.log(`✅ ${messages.length} messages insérés`);
}

async function seedPaiementsClient() {
  console.log('💳 Seed paiements client...');
  const { rows: missions } = await query('SELECT id FROM missions ORDER BY id LIMIT 3');
  if (!missions.length) return;

  const paiements = [
    { mission_id: missions[2]?.id || null, titre: 'Peinture façade', artisan_nom: 'Éric Leroy', montant: 4800, methode: 'Visa •••• 4242', statut: 'payé', facture: 'FAC-2024-003', date: '2024-02-15T14:00:00Z' },
    { mission_id: missions[0]?.id || null, titre: 'Rénovation salle de bain', artisan_nom: 'Carlos Garcia', montant: 3500, methode: 'Visa •••• 4242', statut: 'en_attente', facture: null, date: null },
  ];
  for (const p of paiements) {
    await query(
      `INSERT INTO paiements_client (mission_id, titre, artisan_nom, montant, methode, statut, facture, date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [p.mission_id, p.titre, p.artisan_nom, p.montant, p.methode, p.statut, p.facture, p.date]
    );
  }
  console.log(`✅ ${paiements.length} paiements insérés`);
}

async function seedStock() {
  console.log('📦 Seed stock...');
  const articles = [
    { ref: 'MAT-001', designation: 'Parpaings 20×20×50',          categorie: 'Matériaux',          quantite: 240, seuil_alerte: 50,  unite: 'u',     valeur_unitaire: 1.20,  fournisseur: 'Point.P'   },
    { ref: 'MAT-002', designation: 'Sable fin (sac 25 kg)',        categorie: 'Matériaux',          quantite: 18,  seuil_alerte: 20,  unite: 'sac',   valeur_unitaire: 6.50,  fournisseur: 'Lafarge'   },
    { ref: 'MAT-003', designation: 'Ciment CEM II 32,5 R',        categorie: 'Matériaux',          quantite: 32,  seuil_alerte: 15,  unite: 'sac',   valeur_unitaire: 8.20,  fournisseur: 'Holcim'    },
    { ref: 'OUT-001', designation: 'Perceuse à percussion Makita', categorie: 'Outillage',          quantite: 3,   seuil_alerte: 1,   unite: 'u',     valeur_unitaire: 189.00, fournisseur: 'Makita'   },
    { ref: 'OUT-002', designation: 'Meuleuse 125 mm',              categorie: 'Outillage',          quantite: 2,   seuil_alerte: 1,   unite: 'u',     valeur_unitaire: 85.00,  fournisseur: 'Bosch'    },
    { ref: 'EPI-001', designation: 'Casque chantier blanc (lot 10)', categorie: 'EPI / Sécurité',  quantite: 2,   seuil_alerte: 1,   unite: 'boîte', valeur_unitaire: 42.00,  fournisseur: 'MSA'      },
    { ref: 'EPI-002', designation: 'Gants de protection T9',       categorie: 'EPI / Sécurité',    quantite: 45,  seuil_alerte: 20,  unite: 'u',     valeur_unitaire: 2.80,   fournisseur: 'Deltaplus' },
    { ref: 'EPI-003', designation: 'Masques FFP2 (boîte 20)',      categorie: 'EPI / Sécurité',    quantite: 8,   seuil_alerte: 5,   unite: 'boîte', valeur_unitaire: 15.90,  fournisseur: 'Moldex'   },
    { ref: 'CHI-001', designation: 'Décapant peinture (5L)',       categorie: 'Produits chimiques', quantite: 4,   seuil_alerte: 3,   unite: 'L',     valeur_unitaire: 22.50,  fournisseur: 'Starwax'  },
  ];
  for (const a of articles) {
    await query(
      `INSERT INTO stock_articles (ref, designation, categorie, quantite, seuil_alerte, unite, valeur_unitaire, fournisseur)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [a.ref, a.designation, a.categorie, a.quantite, a.seuil_alerte, a.unite, a.valeur_unitaire, a.fournisseur]
    );
  }
  console.log(`✅ ${articles.length} articles de stock insérés`);
}

async function seedAvis() {
  console.log('⭐ Seed avis...');
  const avis = [
    {
      client: 'Marie L.', artisan: 'Eric Leroy', specialite: 'Électricité',
      travail: 'Installation prise électrique salon',
      note: 4.9, recommande: true, verifie: true,
      commentaire: 'Travail impeccable, très professionnel et ponctuel. Je recommande vivement.',
      criteres: JSON.stringify({ qualite: 5, ponctualite: 5, proprete: 5, communication: 5, rapport: 4 }),
      reponse: null, cree_le: '2024-03-22T00:00:00Z',
    },
    {
      client: 'Thomas R.', artisan: 'Carlos Garcia', specialite: 'Plomberie',
      travail: 'Réparation robinet chambre',
      note: 4.4, recommande: true, verifie: true,
      commentaire: 'Rapide et efficace. Léger retard au démarrage mais le résultat est là.',
      criteres: JSON.stringify({ qualite: 5, ponctualite: 3, proprete: 4, communication: 5, rapport: 5 }),
      reponse: null, cree_le: '2024-02-14T00:00:00Z',
    },
    {
      client: 'Claire B.', artisan: 'Sophie Martin', specialite: 'Peinture',
      travail: 'Peinture couloir entrée',
      note: 5.0, recommande: true, verifie: true,
      commentaire: "Magnifique résultat, travail soigné et propre. La meilleure artisane que j'ai eue.",
      criteres: JSON.stringify({ qualite: 5, ponctualite: 5, proprete: 5, communication: 5, rapport: 5 }),
      reponse: "Merci pour votre confiance, c'est toujours un plaisir de travailler avec des clients attentifs !",
      cree_le: '2024-01-28T00:00:00Z',
    },
    {
      client: 'François D.', artisan: 'Jean-Paul Moreau', specialite: 'Menuiserie',
      travail: 'Remplacement fenêtres double-vitrage',
      note: 4.8, recommande: true, verifie: true,
      commentaire: '',
      criteres: JSON.stringify({ qualite: 5, ponctualite: 5, proprete: 4, communication: 5, rapport: 5 }),
      reponse: null, cree_le: '2023-11-10T00:00:00Z',
    },
  ];
  for (const a of avis) {
    await query(
      `INSERT INTO avis (client, artisan, specialite, travail, note, recommande, verifie, commentaire, criteres, reponse, cree_le)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [a.client, a.artisan, a.specialite, a.travail, a.note, a.recommande, a.verifie, a.commentaire, a.criteres, a.reponse, a.cree_le]
    );
  }
  console.log(`✅ ${avis.length} avis insérés`);
}

async function main() {
  console.log('\n🌱 === SEED APPLICATION ARTISANS ===\n');
  await testConnection();
  await runSchema();
  await seedUsers();
  await seedMissions();
  await seedEmployes();
  await seedHabilitations();
  await seedBulletinsPaie();
  await seedUrssaf();
  await seedDevisPro();
  await seedChantiers();
  await seedMessages();
  await seedPaiementsClient();
  await seedStock();
  await seedAvis();
  console.log('\n✅ === SEED TERMINÉ ===\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur seed :', err.message);
  process.exit(1);
});
