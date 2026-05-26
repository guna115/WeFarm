const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkAndSetup() {
  try {
    // Check existing tables
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    console.log('Existing tables:', tables.rows.map(r => r.table_name));

    if (tables.rows.length === 0) {
      console.log('\nNo tables found. Running schema...');
      const fs = require('fs');
      const schema = fs.readFileSync('./src/config/schema.sql', 'utf8');
      await pool.query(schema);
      console.log('✅ Schema created successfully!');
      
      // Verify
      const verify = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
      );
      console.log('Tables now:', verify.rows.map(r => r.table_name));
    } else {
      console.log('✅ Database already has tables.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkAndSetup();
