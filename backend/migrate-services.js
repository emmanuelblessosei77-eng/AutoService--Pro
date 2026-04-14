/**
 * Migration: Replace services table with the 6 canonical services
 * Run once: node backend/migrate-services.js
 */
const db = require('./src/db');

const SERVICES = [
  { name: 'Oil Change',               description: 'Engine oil and filter replacement',        price: 120.00, category: 'maintenance', duration_minutes: 45  },
  { name: 'Diagnostics',              description: 'Diagnostics check',                         price: 80.00,  category: 'maintenance', duration_minutes: 60  },
  { name: 'Brake Service',            description: 'Brake inspection and replacement',           price: 200.00, category: 'brake',       duration_minutes: 90  },
  { name: 'Battery Testing & Service',description: 'Battery health check, testing, and replacement service', price: 150.00, category: 'electrical', duration_minutes: 60  },
  { name: 'Air Filter Replacement',   description: 'Replace engine air filter',                 price: 60.00,  category: 'maintenance', duration_minutes: 30  },
  { name: 'Cabin Filter Replacement', description: 'Replace cabin air filter for clean interior air', price: 55.00,  category: 'maintenance', duration_minutes: 30  },
];

async function migrate() {
  console.log('🔄 Running services migration...');
  try {
    // Deactivate all existing services
    await db.query(`UPDATE services SET is_active = false`);
    console.log('  ✅ Deactivated all existing services');

    for (const svc of SERVICES) {
      // Check if service already exists (case-insensitive)
      const existing = await db.query(
        `SELECT id FROM services WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [svc.name]
      );

      if (existing.rows.length > 0) {
        // Update existing
        await db.query(
          `UPDATE services SET name=$1, description=$2, price=$3, category=$4, duration_minutes=$5, is_active=true WHERE id=$6`,
          [svc.name, svc.description, svc.price, svc.category, svc.duration_minutes, existing.rows[0].id]
        );
        console.log(`  ✅ Updated: ${svc.name}`);
      } else {
        // Insert new
        await db.query(
          `INSERT INTO services (name, description, price, category, duration_minutes, is_active) VALUES ($1,$2,$3,$4,$5,true)`,
          [svc.name, svc.description, svc.price, svc.category, svc.duration_minutes]
        );
        console.log(`  ✅ Inserted: ${svc.name}`);
      }
    }

    console.log('✅ Services migration complete');
  } catch (err) {
    console.error('  ❌ Migration failed:', err.message);
  }
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
