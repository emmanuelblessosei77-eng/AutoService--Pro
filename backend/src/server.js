const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { startEmailQueue } = require('./lib/emailQueue');
const db = require('./db');

async function runMigrations() {
  try {
    // Add license_plate to vehicles if missing
    const lpCheck = await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='vehicles' AND column_name='license_plate'`
    );
    if (lpCheck.rows.length === 0) {
      await db.query('ALTER TABLE vehicles ADD COLUMN license_plate TEXT');
      console.log('✅ Migration: added license_plate column to vehicles');
    }

    // Create part_requests table if missing
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

    // Create notifications table if missing
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('reminder', 'alert', 'info', 'success', 'error')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        action_url TEXT,
        related_entity_type VARCHAR(50),
        related_entity_id INTEGER,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.error('⚠️ Migration error (non-fatal):', err.message);
  }
}

const usersRouter = require('./routes/users');
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const carPartsRouter = require('./routes/carParts');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const vehiclesRouter = require('./routes/vehicles');
const partRequestsRouter = require('./routes/partRequests');
const emailsRouter = require('./routes/emails');

const app = express();
app.use(cors());

// Resilient JSON body parser: attempts to parse JSON but won't throw HTML errors on malformed bodies.
app.use((req, res, next) => {
  // Only parse for methods that typically have a body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (!raw) {
        req.body = {};
        return next();
      }
      try {
        // Try direct JSON parse first
        req.body = JSON.parse(raw);
      } catch (e) {
        // Heuristic: trim and try to locate the first JSON bracket
        try {
          let trimmed = raw.trim();
          const firstIdx = Math.max(trimmed.indexOf('{'), trimmed.indexOf('['));
          if (firstIdx > 0) trimmed = trimmed.slice(firstIdx);
          req.body = JSON.parse(trimmed);
        } catch (e2) {
          // Fallback: try to parse as URLSearchParams (form data)
          try {
            const params = new URLSearchParams(raw);
            const obj = {};
            for (const [k, v] of params.entries()) obj[k] = v;
            req.body = obj;
          } catch (err) {
            // store rawBody for downstream handlers and do not throw
            req.rawBody = raw;
            req.body = {};
          }
        }
      }
      next();
    });
  } else {
    req.body = {};
    next();
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/users', usersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/car-parts', carPartsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/part-requests', partRequestsRouter);
app.use('/api/emails', emailsRouter);

// JSON parse error handler (body-parser / express.json errors)
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('⚠️ JSON parse error:', err.message);
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }
  // handle generic SyntaxError from JSON parsing
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('⚠️ SyntaxError parsing JSON body:', err.message);
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }
  // pass through other errors
  next(err);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Run DB migrations before anything else
  await runMigrations();

  // Start the background email queue after server is ready
  startEmailQueue().catch((err) => {
    console.error('❌ Failed to start email queue:', err.message);
  });
});
