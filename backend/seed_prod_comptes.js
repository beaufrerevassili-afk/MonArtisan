// ============================================================
//  seed_prod_comptes.js — Seed comptes démo sur la prod Render
//  Usage : node seed_prod_comptes.js
// ============================================================
const { Pool } = require('pg');
const bcrypt   = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://monartisans_db_user:bL18FfpHvCyHGUhI99BjDYYHoK8ONnpV@dpg-d73ed5ua2pns73a4tn90-a.frankfurt-postgres.render.com/monartisans_db',
  ssl: { rejectUnauthorized: false },
});

const COMPTES = [
  // ── Génériques (déjà existants, on s'assure qu'ils sont là) ──
  { nom: 'Alice Dupont',      email: 'client@demo.com',              motdepasse: 'client123',  role: 'client',  secteur: null,       verified: true },
  { nom: 'Bernard Martin',    email: 'patron@demo.com',              motdepasse: 'patron123',  role: 'patron',  secteur: 'btp',      verified: true },
  { nom: 'Carlos Garcia',     email: 'artisan@demo.com',             motdepasse: 'artisan123', role: 'artisan', secteur: 'btp',      verified: true, metier: 'Plomberie', siret: '123 456 789 00012', ville: 'Paris 11e', experience: '15 ans', statut_verification: 'valide' },

  // ── BTP ──
  { nom: 'Marc Dubois',       email: 'patron.btp@demo.com',          motdepasse: 'patron123',  role: 'patron',  secteur: 'btp',      verified: true, ville: 'Paris 11e' },
  { nom: 'Lucas Bernard',     email: 'employe.btp@demo.com',         motdepasse: 'employe123', role: 'artisan', secteur: 'btp',      verified: true, metier: 'Maçonnerie', siret: '111 222 333 00022', ville: 'Paris 11e', experience: '6 ans', statut_verification: 'valide' },

  // ── Coiffure ──
  { nom: 'Sophie Laurent',    email: 'patron.coiffure@demo.com',     motdepasse: 'patron123',  role: 'patron',  secteur: 'coiffure', verified: true, ville: 'Paris 9e' },
  { nom: 'Camille Moreau',    email: 'employe.coiffure@demo.com',    motdepasse: 'employe123', role: 'artisan', secteur: 'coiffure', verified: true, metier: 'Coiffure', siret: '222 333 444 00011', ville: 'Paris 9e', experience: '4 ans', statut_verification: 'valide' },

  // ── Restaurant ──
  { nom: 'Antoine Rousseau',  email: 'patron.restaurant@demo.com',   motdepasse: 'patron123',  role: 'patron',  secteur: 'restaurant', verified: true, ville: 'Lyon 2e' },
  { nom: 'Yasmine Benali',    email: 'employe.restaurant@demo.com',  motdepasse: 'employe123', role: 'artisan', secteur: 'restaurant', verified: true, metier: 'Cuisine', siret: '333 444 555 00011', ville: 'Lyon 2e', experience: '5 ans', statut_verification: 'valide' },

  // ── Hôtel / Vacances ──
  { nom: 'Isabelle Garnier',  email: 'patron.hotel@demo.com',        motdepasse: 'patron123',  role: 'patron',  secteur: 'vacances', verified: true, ville: 'Nice' },
  { nom: 'Thomas Lefevre',    email: 'employe.hotel@demo.com',       motdepasse: 'employe123', role: 'artisan', secteur: 'vacances', verified: true, metier: 'Hôtellerie', siret: '444 555 666 00011', ville: 'Nice', experience: '3 ans', statut_verification: 'valide' },
];

async function run() {
  const client = await pool.connect();
  console.log('\n🌱 === SEED COMPTES DÉMO (PROD) ===\n');

  try {
    // Ajouter colonne secteur si absente
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS secteur VARCHAR(50)`);
    console.log('✅ Colonne secteur vérifiée');

    let ok = 0;
    for (const c of COMPTES) {
      const hash = await bcrypt.hash(c.motdepasse, 10);
      await client.query(
        `INSERT INTO users
           (nom, email, motdepasse, role, secteur, verified, telephone, metier, siret, ville, experience, statut_verification)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (email) DO UPDATE SET
           motdepasse           = EXCLUDED.motdepasse,
           role                 = EXCLUDED.role,
           secteur              = EXCLUDED.secteur,
           verified             = EXCLUDED.verified,
           statut_verification  = COALESCE(EXCLUDED.statut_verification, users.statut_verification)`,
        [
          c.nom, c.email, hash, c.role, c.secteur || null,
          c.verified ?? true,
          c.telephone || null,
          c.metier    || null,
          c.siret     || null,
          c.ville     || null,
          c.experience || null,
          c.statut_verification || null,
        ]
      );
      console.log(`  ✓ ${c.email}  (${c.role}${c.secteur ? ' / ' + c.secteur : ''})`);
      ok++;
    }

    console.log(`\n✅ ${ok} comptes insérés/mis à jour en production`);
    console.log('\n📋 Récap comptes démo :');
    console.log('   client@demo.com       / client123  → Client universel');
    console.log('   patron@demo.com       / patron123  → Patron BTP générique');
    console.log('   artisan@demo.com      / artisan123 → Artisan BTP');
    console.log('   patron.btp@demo.com   / patron123  → Patron BTP');
    console.log('   employe.btp@demo.com  / employe123 → Employé BTP');
    console.log('   patron.coiffure@demo.com   / patron123  → Patron Coiffure');
    console.log('   employe.coiffure@demo.com  / employe123 → Employé Coiffure');
    console.log('   patron.restaurant@demo.com / patron123  → Patron Restaurant');
    console.log('   employe.restaurant@demo.com/ employe123 → Employé Restaurant');
    console.log('   patron.hotel@demo.com      / patron123  → Patron Hôtel');
    console.log('   employe.hotel@demo.com     / employe123 → Employé Hôtel');

  } catch (err) {
    console.error('❌ Erreur :', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => { console.log('\n✅ TERMINÉ\n'); process.exit(0); })
  .catch(() => process.exit(1));
