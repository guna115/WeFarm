const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fixSchema() {
  try {
    // Check sellers columns
    const sellerCols = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'sellers' ORDER BY ordinal_position
    `);
    console.log('Sellers columns:', sellerCols.rows.map(r => r.column_name));

    // Check posts columns
    const postCols = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'posts' ORDER BY ordinal_position
    `);
    console.log('Posts columns:', postCols.rows.map(r => r.column_name));

    // Add missing columns if needed
    const sellerColNames = sellerCols.rows.map(r => r.column_name);
    const postColNames = postCols.rows.map(r => r.column_name);

    const fixes = [];

    // Sellers table fixes
    if (!sellerColNames.includes('whatsapp_number')) fixes.push("ALTER TABLE sellers ADD COLUMN whatsapp_number VARCHAR(15)");
    if (!sellerColNames.includes('profile_complete')) fixes.push("ALTER TABLE sellers ADD COLUMN profile_complete BOOLEAN DEFAULT false");
    if (!sellerColNames.includes('is_banned')) fixes.push("ALTER TABLE sellers ADD COLUMN is_banned BOOLEAN DEFAULT false");
    if (!sellerColNames.includes('updated_at')) fixes.push("ALTER TABLE sellers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
    if (!sellerColNames.includes('district')) fixes.push("ALTER TABLE sellers ADD COLUMN district VARCHAR(100)");
    if (!sellerColNames.includes('state')) fixes.push("ALTER TABLE sellers ADD COLUMN state VARCHAR(100) DEFAULT 'Andhra Pradesh'");

    // Posts table fixes
    if (!postColNames.includes('category')) fixes.push("ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT 'other'");
    if (!postColNames.includes('image_public_ids')) fixes.push("ALTER TABLE posts ADD COLUMN image_public_ids TEXT[] DEFAULT '{}'");
    if (!postColNames.includes('whatsapp_number')) fixes.push("ALTER TABLE posts ADD COLUMN whatsapp_number VARCHAR(15)");
    if (!postColNames.includes('nursery_name')) fixes.push("ALTER TABLE posts ADD COLUMN nursery_name VARCHAR(100)");

    // Create devices table for push notifications
    const createDevicesTable = `
      CREATE TABLE IF NOT EXISTS devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id VARCHAR(255) UNIQUE NOT NULL,
        fcm_token VARCHAR(255),
        latitude DECIMAL,
        longitude DECIMAL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('Ensuring devices table exists...');
    await pool.query(createDevicesTable);

    // Create ratings table for seller reviews
    const createRatingsTable = `
      CREATE TABLE IF NOT EXISTS ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
        device_id VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(seller_id, device_id)
      )
    `;
    console.log('Ensuring ratings table exists...');
    await pool.query(createRatingsTable);

    if (fixes.length > 0) {
      console.log('\nApplying fixes:');
      for (const sql of fixes) {
        console.log(' -', sql);
        await pool.query(sql);
      }
      console.log('\n✅ Schema fixed!');
    } else {
      console.log('\n✅ Schema is already correct!');
    }

    // Now try a test insert and rollback to verify
    console.log('\nTesting INSERT...');
    await pool.query('BEGIN');
    const test = await pool.query(
      `INSERT INTO sellers (phone_number, nursery_name, owner_name, whatsapp_number, address, district, state, latitude, longitude, courier_available, profile_complete)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       ON CONFLICT (phone_number) DO UPDATE SET nursery_name = EXCLUDED.nursery_name
       RETURNING id, phone_number`,
      ['+91test123456', 'Test Nursery', 'Test Owner', '+91test123456', 'Test Address', 'Test', 'AP', 0, 0, false]
    );
    console.log('Test INSERT OK:', test.rows[0]);
    await pool.query('ROLLBACK');
    console.log('Test rolled back (no data saved)');

  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('Detail:', err.detail || '');
  } finally {
    await pool.end();
  }
}

fixSchema();
