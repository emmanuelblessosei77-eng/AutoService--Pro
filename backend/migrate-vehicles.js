const db = require('./src/db');

(async () => {
  try {
    console.log('🔄 Adding mileage and fuel_type columns to vehicles table...');
    
    // Check if mileage column exists
    const mileageCheck = await db.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='vehicles' AND column_name='mileage'
    `);
    
    if (mileageCheck.rows.length === 0) {
      console.log('  → Adding mileage column...');
      await db.query('ALTER TABLE vehicles ADD COLUMN mileage INTEGER DEFAULT 0');
      console.log('  ✅ mileage column added');
    } else {
      console.log('  ✓ mileage column already exists');
    }
    
    // Check if fuel_type column exists
    const fuelTypeCheck = await db.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='vehicles' AND column_name='fuel_type'
    `);
    
    if (fuelTypeCheck.rows.length === 0) {
      console.log('  → Adding fuel_type column...');
      await db.query("ALTER TABLE vehicles ADD COLUMN fuel_type VARCHAR(20) DEFAULT 'petrol'");
      console.log('  ✅ fuel_type column added');
    } else {
      console.log('  ✓ fuel_type column already exists');
    }
    
    // Check if license_plate column exists
    const licensePlateCheck = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='vehicles' AND column_name='license_plate'
    `);

    if (licensePlateCheck.rows.length === 0) {
      console.log('  → Adding license_plate column...');
      await db.query('ALTER TABLE vehicles ADD COLUMN license_plate TEXT');
      console.log('  ✅ license_plate column added');
    } else {
      console.log('  ✓ license_plate column already exists');
    }

    console.log('✅ Vehicle table migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
