const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://monartisans_db_user:bL18FfpHvCyHGUhI99BjDYYHoK8ONnpV@dpg-d73ed5ua2pns73a4tn90-a.frankfurt-postgres.render.com/monartisans_db',
  ssl: { rejectUnauthorized: false }
});

bcrypt.hash('Val23222', 10).then(hash => {
  return pool.query(
    `INSERT INTO users (nom, email, motdepasse, role, verified)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO UPDATE SET motdepasse=$3, role=$4`,
    ['Vassili Beaufrere', 'beaufrere.vassili@gmail.com', hash, 'fondateur', true]
  );
}).then(() => {
  console.log('✅ Compte fondateur créé !');
  pool.end();
}).catch(err => {
  console.error('❌ Erreur:', err.message);
  pool.end();
});
