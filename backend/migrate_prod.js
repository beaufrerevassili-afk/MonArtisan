const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://monartisans_db_user:bL18FfpHvCyHGUhI99BjDYYHoK8ONnpV@dpg-d73ed5ua2pns73a4tn90-a.frankfurt-postgres.render.com/monartisans_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_articles (
        id          SERIAL PRIMARY KEY,
        patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ref         TEXT,
        designation TEXT NOT NULL,
        categorie   TEXT,
        quantite    NUMERIC DEFAULT 0,
        seuil_alerte NUMERIC DEFAULT 0,
        unite       TEXT DEFAULT 'unité',
        valeur_unitaire NUMERIC DEFAULT 0,
        fournisseur TEXT,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table stock_articles OK');

    await client.query(`
      CREATE TABLE IF NOT EXISTS agenda_events (
        id        SERIAL PRIMARY KEY,
        patron_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type      TEXT,
        title     TEXT NOT NULL,
        date      DATE NOT NULL,
        heure     TEXT,
        heure_fin TEXT,
        salarie   TEXT,
        lieu      TEXT,
        vehicule  TEXT,
        note      TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table agenda_events OK');

    await client.query(`
      CREATE TABLE IF NOT EXISTS avis (
        id          SERIAL PRIMARY KEY,
        patron_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
        client      TEXT,
        artisan     TEXT,
        specialite  TEXT,
        travail     TEXT,
        note        NUMERIC,
        recommande  BOOLEAN DEFAULT true,
        verifie     BOOLEAN DEFAULT false,
        commentaire TEXT,
        criteres    JSONB DEFAULT '{}',
        reponse     TEXT,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table avis OK');

    // Seed stock
    const { rows: existing } = await client.query('SELECT COUNT(*) FROM stock_articles');
    if (parseInt(existing[0].count) === 0) {
      await client.query(`
        INSERT INTO stock_articles (ref, designation, categorie, quantite, seuil_alerte, unite, valeur_unitaire, fournisseur) VALUES
        ('VIS-001', 'Vis inox 6x60', 'Visserie', 450, 100, 'unité', 0.08, 'ProFix'),
        ('CHE-002', 'Cheville Fischer 10mm', 'Fixation', 200, 50, 'unité', 0.45, 'Fischer'),
        ('CAB-003', 'Câble électrique 2.5mm²', 'Électricité', 80, 20, 'm', 1.20, 'Nexans'),
        ('PLQ-004', 'Plaque de plâtre BA13', 'Plâtrerie', 30, 10, 'plaque', 8.50, 'Knauf'),
        ('ISO-005', 'Laine de verre 100mm', 'Isolation', 15, 5, 'rouleau', 28.00, 'Isover'),
        ('PEI-006', 'Peinture blanche mate 10L', 'Peinture', 8, 2, 'pot', 42.00, 'Tollens'),
        ('TUY-007', 'Tube PVC Ø32', 'Plomberie', 25, 5, 'm', 3.80, 'Aliaxis'),
        ('SIL-008', 'Silicone sanitaire blanc', 'Étanchéité', 18, 5, 'cartouche', 6.50, 'Soudal'),
        ('DIS-009', 'Disque à tronçonner 230mm', 'Consommable', 12, 5, 'unité', 3.20, 'Bosch')
      `);
      console.log('✅ Stock seedé (9 articles)');
    } else {
      console.log('ℹ️  Stock déjà rempli, skip');
    }

    // Seed avis
    const { rows: existingAvis } = await client.query('SELECT COUNT(*) FROM avis');
    if (parseInt(existingAvis[0].count) === 0) {
      await client.query(`
        INSERT INTO avis (client, artisan, specialite, travail, note, recommande, verifie, commentaire, criteres) VALUES
        ('Marie Dupont', 'Jean-Pierre Martin', 'Plomberie', 'Remplacement chauffe-eau + robinetterie', 5, true, true,
         'Travail impeccable, ponctuel et propre. Je recommande vivement !',
         '{"qualite": 5, "ponctualite": 5, "proprete": 5, "rapport_qualite_prix": 4}'),
        ('Thomas Bernard', 'Jean-Pierre Martin', 'Plomberie', 'Fuite sous évier cuisine', 4, true, true,
         'Intervention rapide, problème résolu en 1h. Tarif correct.',
         '{"qualite": 4, "ponctualite": 5, "proprete": 4, "rapport_qualite_prix": 4}'),
        ('Sophie Laurent', 'Jean-Pierre Martin', 'Plomberie', 'Installation salle de bain complète', 5, true, false,
         'Excellent artisan, à l''écoute et de bon conseil. Chantier bien géré.',
         '{"qualite": 5, "ponctualite": 4, "proprete": 5, "rapport_qualite_prix": 5}'),
        ('Pierre Moreau', 'Jean-Pierre Martin', 'Plomberie', 'Débouchage canalisation', 3, true, true,
         'Efficace mais un peu cher pour le service rendu.',
         '{"qualite": 4, "ponctualite": 3, "proprete": 3, "rapport_qualite_prix": 2}')
      `);
      console.log('✅ Avis seedés (4 avis)');
    } else {
      console.log('ℹ️  Avis déjà remplis, skip');
    }

    console.log('\n✅ Migration production terminée !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
