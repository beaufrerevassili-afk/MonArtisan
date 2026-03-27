// ============================================================
//  db.js — Connexion PostgreSQL (pool de connexions)
// ============================================================
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
    : {
        host:     process.env.PGHOST     || 'localhost',
        port:     parseInt(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'artisans_db',
        user:     process.env.PGUSER     || 'postgres',
        password: process.env.PGPASSWORD || 'password',
      }
);

pool.on('error', (err) => {
  console.error('Erreur connexion PostgreSQL :', err.message);
});

// Utilitaire : exécuter une requête
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Test de connexion au démarrage
async function testConnection() {
  try {
    const res = await query('SELECT NOW() as now');
    console.log('✅ PostgreSQL connecté :', res.rows[0].now);
  } catch (err) {
    console.error('❌ Impossible de se connecter à PostgreSQL :', err.message);
    console.error('Vérifiez vos variables DATABASE_URL ou PG* dans .env');
    process.exit(1);
  }
}

module.exports = { query, testConnection, pool };
