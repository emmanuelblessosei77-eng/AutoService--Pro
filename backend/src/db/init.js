const fs = require('fs');
const path = require('path');
const db = require('./index');

async function runFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // run as a single query - PostgreSQL accepts multiple statements separated by semicolons
  await client.query(sql);
}

(async () => {
  const client = await db.pool.connect();
  try {
    console.log('Applying schema...');
    await runFile(client, path.join(__dirname, '..', '..', 'sql', 'schema.sql'));
    console.log('Applying sample data...');
    await runFile(client, path.join(__dirname, '..', '..', 'sql', 'sample_data.sql'));
    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  } finally {
    client.release();
  }
})();
