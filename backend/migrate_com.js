// Migration: table com_projets
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://monartisans_db_user:bL18FfpHvCyHGUhI99BjDYYHoK8ONnpV@dpg-d73ed5ua2pns73a4tn90-a.frankfurt-postgres.render.com/monartisans_db',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  console.log('🔧 Migration com_projets...');
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS com_projets (
      id SERIAL PRIMARY KEY,
      type VARCHAR(100),
      format VARCHAR(100),
      quantite VARCHAR(10) DEFAULT '1',
      style VARCHAR(100),
      options JSONB DEFAULT '[]',
      reference TEXT,
      description TEXT,
      client_nom VARCHAR(200),
      client_email VARCHAR(200),
      client_telephone VARCHAR(50),
      deadline DATE,
      statut VARCHAR(50) DEFAULT 'brief_recu',
      responsable VARCHAR(200),
      montant_ht NUMERIC(10,2),
      tva NUMERIC(5,2) DEFAULT 20,
      devis_ref VARCHAR(50),
      lignes_devis JSONB DEFAULT '[]',
      fichiers JSONB DEFAULT '[]',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  
  console.log('✅ Table com_projets créée');
  client.release();
  await pool.end();
}

run().then(() => { console.log('✅ Migration terminée'); process.exit(0); })
    .catch(err => { console.error('❌', err.message); process.exit(1); });
