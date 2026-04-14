/**
 * Migration: Add payment_status, total_cost, and parts_cost to bookings table
 * Run once: node backend/migrate-bookings-payment.js
 */
const db = require('./src/db');

async function migrate() {
  console.log('🔄 Running bookings payment migration...');
  const cols = [
    { name: 'payment_status', def: "VARCHAR(20) DEFAULT 'pending'" },
    { name: 'total_cost',     def: 'NUMERIC(10,2) DEFAULT 0' },
    { name: 'parts_cost',     def: 'NUMERIC(10,2) DEFAULT 0' },
  ];
  for (const col of cols) {
    try {
      await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ${col.name} ${col.def}`);
      console.log(`  ✅ Column "${col.name}" added (or already exists)`);
    } catch (err) {
      console.error(`  ❌ Failed to add column "${col.name}":`, err.message);
    }
  }
  console.log('✅ Migration complete');
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
