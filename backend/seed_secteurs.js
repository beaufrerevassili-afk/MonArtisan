// ============================================================
//  seed_secteurs.js — Comptes démo par secteur d'activité
//  Usage : node seed_secteurs.js
// ============================================================
require('dotenv').config();
const bcrypt = require('bcrypt');
const { query, testConnection } = require('./db');

async function addSecteurColumn() {
  console.log('🔧 Ajout colonne secteur...');
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS secteur VARCHAR(50)`);
  console.log('✅ Colonne secteur OK');
}

async function seedComptesSecteurs() {
  console.log('👤 Seed comptes sectoriels...');

  const comptes = [
    // ── BTP & Travaux ──
    {
      nom: 'Marc Dubois',
      email: 'patron.btp@demo.com',
      motdepasse: 'patron123',
      role: 'patron',
      secteur: 'btp',
      telephone: '0612345670',
      siret: '111 222 333 00011',
      ville: 'Paris 11e',
      description: 'Entreprise BTP, rénovation et gros œuvre',
    },
    {
      nom: 'Lucas Bernard',
      email: 'employe.btp@demo.com',
      motdepasse: 'employe123',
      role: 'artisan',
      secteur: 'btp',
      telephone: '0623456780',
      metier: 'Maçonnerie',
      siret: '111 222 333 00022',
      ville: 'Paris 11e',
      experience: '6 ans',
      description: 'Maçon qualifié, chantiers rénovation',
      statut_verification: 'valide',
    },

    // ── Coiffure ──
    {
      nom: 'Sophie Laurent',
      email: 'patron.coiffure@demo.com',
      motdepasse: 'patron123',
      role: 'patron',
      secteur: 'coiffure',
      telephone: '0634567891',
      ville: 'Paris 9e',
      description: 'Directrice du Salon Lumière — coiffure mixte haut de gamme',
    },
    {
      nom: 'Camille Moreau',
      email: 'employe.coiffure@demo.com',
      motdepasse: 'employe123',
      role: 'artisan',
      secteur: 'coiffure',
      telephone: '0645678902',
      metier: 'Coiffure',
      siret: '222 333 444 00011',
      ville: 'Paris 9e',
      experience: '4 ans',
      description: 'Coiffeuse spécialisée couleur et balayage',
      statut_verification: 'valide',
    },

    // ── Restaurant ──
    {
      nom: 'Antoine Rousseau',
      email: 'patron.restaurant@demo.com',
      motdepasse: 'patron123',
      role: 'patron',
      secteur: 'restaurant',
      telephone: '0656789013',
      ville: 'Lyon 2e',
      description: 'Propriétaire du restaurant Le Bouchon Lyonnais',
    },
    {
      nom: 'Yasmine Benali',
      email: 'employe.restaurant@demo.com',
      motdepasse: 'employe123',
      role: 'artisan',
      secteur: 'restaurant',
      telephone: '0667890124',
      metier: 'Cuisine',
      siret: '333 444 555 00011',
      ville: 'Lyon 2e',
      experience: '5 ans',
      description: 'Chef de partie, spécialité cuisine française',
      statut_verification: 'valide',
    },

    // ── Vacances & Hôtel ──
    {
      nom: 'Isabelle Garnier',
      email: 'patron.hotel@demo.com',
      motdepasse: 'patron123',
      role: 'patron',
      secteur: 'vacances',
      telephone: '0678901235',
      ville: 'Nice',
      description: 'Directrice Hôtel Le Rivage — 3 étoiles, 42 chambres',
    },
    {
      nom: 'Thomas Lefevre',
      email: 'employe.hotel@demo.com',
      motdepasse: 'employe123',
      role: 'artisan',
      secteur: 'vacances',
      telephone: '0689012346',
      metier: 'Hôtellerie',
      siret: '444 555 666 00011',
      ville: 'Nice',
      experience: '3 ans',
      description: 'Réceptionniste et assistant de direction',
      statut_verification: 'valide',
    },

    // ── Freample Course (VTC) ──
    {
      nom: 'Karim Haddad',
      email: 'patron.course@demo.com',
      motdepasse: 'patron123',
      role: 'patron',
      secteur: 'course',
      telephone: '0690123457',
      ville: 'Paris',
      description: 'Gérant flotte VTC Freample Course — 15 chauffeurs',
    },
    {
      nom: 'Amine Diallo',
      email: 'employe.course@demo.com',
      motdepasse: 'employe123',
      role: 'artisan',
      secteur: 'course',
      telephone: '0601234568',
      metier: 'Chauffeur VTC',
      siret: '555 666 777 00011',
      ville: 'Paris',
      experience: '3 ans',
      description: 'Chauffeur VTC, Tesla Model 3, note 4.9/5',
      statut_verification: 'valide',
    },

    // ── Freample Eat (Livraison) ──
    {
      nom: 'Léa Martin',
      email: 'patron.eat@demo.com',
      motdepasse: 'patron123',
      role: 'patron',
      secteur: 'eat',
      telephone: '0612345679',
      ville: 'Paris',
      description: 'Responsable Freample Eat — gestion des livraisons et restaurants partenaires',
    },
    {
      nom: 'Youssef Kaci',
      email: 'employe.eat@demo.com',
      motdepasse: 'employe123',
      role: 'artisan',
      secteur: 'eat',
      telephone: '0623456781',
      metier: 'Livreur',
      siret: '666 777 888 00011',
      ville: 'Paris',
      experience: '2 ans',
      description: 'Livreur Freample Eat, vélo électrique, zone Paris Centre',
      statut_verification: 'valide',
    },

    // ── Freample Com (Communication & Marketing) ──
    {
      nom: 'Sarah Khelifi',
      email: 'patron.com@demo.com',
      motdepasse: 'patron123',
      role: 'patron',
      secteur: 'com',
      telephone: '0634567892',
      ville: 'Paris',
      description: 'Directrice Freample Com — agence de communication & montage vidéo',
    },
    {
      nom: 'Maxime Dupont',
      email: 'employe.com@demo.com',
      motdepasse: 'employe123',
      role: 'artisan',
      secteur: 'com',
      telephone: '0645678903',
      metier: 'Monteur vidéo',
      siret: '777 888 999 00011',
      ville: 'Paris',
      experience: '4 ans',
      description: 'Monteur vidéo senior, spécialité TikTok et YouTube',
      statut_verification: 'valide',
    },
  ];

  let ok = 0;
  for (const c of comptes) {
    const hash = await bcrypt.hash(c.motdepasse, 10);
    await query(
      `INSERT INTO users
        (nom, email, motdepasse, role, secteur, verified, telephone, metier, siret, ville, experience, description, statut_verification)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (email) DO UPDATE SET
         motdepasse = EXCLUDED.motdepasse,
         secteur    = EXCLUDED.secteur,
         verified   = EXCLUDED.verified`,
      [
        c.nom, c.email, hash, c.role, c.secteur,
        true,
        c.telephone || null,
        c.metier || null,
        c.siret || null,
        c.ville || null,
        c.experience || null,
        c.description || null,
        c.statut_verification || null,
      ]
    );
    console.log(`  ✓ ${c.email} (${c.role} / ${c.secteur})`);
    ok++;
  }
  console.log(`✅ ${ok} comptes sectoriels insérés/mis à jour`);
}

async function main() {
  console.log('\n🌱 === SEED SECTEURS ===\n');
  await testConnection();
  await addSecteurColumn();
  await seedComptesSecteurs();
  console.log('\n✅ === SEED SECTEURS TERMINÉ ===\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
