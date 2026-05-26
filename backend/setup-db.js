/**
 * Database setup script — Creates all WeFarm tables in Neon PostgreSQL
 * Run: node setup-db.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function setupDatabase() {
  console.log('🌱 WeFarm — Database Setup');
  console.log('─'.repeat(40));

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL');
    client.release();

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'src', 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('✅ Tables created successfully:');
    console.log('   • sellers');
    console.log('   • posts');
    console.log('   • reports');
    console.log('   • All indexes created');

    // Verify tables
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n📋 Tables in database:');
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
