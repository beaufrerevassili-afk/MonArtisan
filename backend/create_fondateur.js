// Crée le compte fondateur — utilise les variables d'environnement
// Usage : DATABASE_URL=... FONDATEUR_EMAIL=... FONDATEUR_PASSWORD=... node create_fondateur.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

if (!process.env.DATABASE_URL) { console.error('❌ DATABASE_URL non défini'); process.exit(1); }
if (!process.env.FONDATEUR_EMAIL) { console.error('❌ FONDATEUR_EMAIL non défini'); process.exit(1); }
if (!process.env.FONDATEUR_PASSWORD) { console.error('❌ FONDATEUR_PASSWORD non défini'); process.exit(1); }

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

bcrypt.hash(process.env.FONDATEUR_PASSWORD, 12).then(hash => {
  return pool.query(
    `INSERT INTO users (nom, email, motdepasse, role, verified)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO UPDATE SET motdepasse=$3, role=$4`,
    [process.env.FONDATEUR_NOM || 'Admin', process.env.FONDATEUR_EMAIL, hash, 'fondateur', true]
  );
}).then(() => {
  console.log('✅ Compte fondateur créé !');
  pool.end();
}).catch(err => {
  console.error('❌ Erreur:', err.message);
  pool.end();
});
