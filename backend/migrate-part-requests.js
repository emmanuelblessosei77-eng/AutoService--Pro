/**
 * Migration: Create part_requests table
 * Run once: node backend/migrate-part-requests.js
 */
const db = require('./src/db');

async function migrate() {
  console.log('🔄 Running part_requests migration...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS part_requests (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        mechanic_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        part_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        reason TEXT,
        priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'fulfilled', 'rejected')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('  ✅ part_requests table created (or already exists)');
  } catch (err) {
    console.error('  ❌ Failed:', err.message);
  }
  console.log('✅ Migration complete');
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
