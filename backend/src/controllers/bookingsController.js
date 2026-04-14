const db = require('../db');
const { notifyServiceCompleted } = require('../utils/notificationHelper');

const getAll = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT b.*, u.first_name, u.last_name, s.name as service_name, s.price as service_price
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN services s ON b.service_id = s.id
       ORDER BY b.id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

const getByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await db.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY id', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings by user' });
  }
};

const getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { rows } = await db.query('SELECT * FROM bookings WHERE status = $1 ORDER BY id', [status]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings by status' });
  }
};

const create = async (req, res) => {
  try {
    const { user_id, service_id, vehicle_id, mechanic_assigned, booking_datetime, status, notes, total_cost, payment_status } = req.body;

    // Build insert dynamically to handle optional total_cost / payment_status columns
    const cols = ['user_id', 'service_id', 'vehicle_id', 'mechanic_assigned', 'booking_datetime', 'status', 'notes'];
    const vals = [user_id, service_id, vehicle_id, mechanic_assigned, booking_datetime, status || 'pending', notes];

    // Include total_cost if provided (required for payment validation)
    if (total_cost !== undefined && total_cost !== null) {
      cols.push('total_cost');
      vals.push(total_cost);
    }

    // Include payment_status if provided and column exists
    if (payment_status !== undefined && payment_status !== null) {
      try {
        // Check if payment_status column exists before using it
        const colCheck = await db.query(
          `SELECT column_name FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_status'`
        );
        if (colCheck.rows.length > 0) {
          cols.push('payment_status');
          vals.push(payment_status);
        }
      } catch (_) { /* ignore column check errors */ }
    }

    const placeholders = vals.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await db.query(
      `INSERT INTO bookings (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`,
      vals
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(req.body)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const { rows } = await db.query(`UPDATE bookings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`, values);
    const updated = rows[0];

    // Send completion email when mechanic marks booking as completed
    if (req.body.status === 'completed' && updated) {
      notifyServiceCompleted(updated.id).catch((err) =>
        console.error('⚠️ Service completion notification failed:', err.message)
      );
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM bookings WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};

const getByMechanic = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    // Check if license_plate column exists (may not exist in older databases)
    const colCheck = await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='vehicles' AND column_name='license_plate'`
    );
    const hasLicensePlate = colCheck.rows.length > 0;

    const { rows } = await db.query(
      `SELECT b.*,
              u.first_name, u.last_name, u.email,
              s.name as service_name, s.price as service_price,
              v.make, v.model, v.year,
              ${hasLicensePlate ? 'v.license_plate' : "NULL::text AS license_plate"}
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.mechanic_assigned = $1
       ORDER BY b.booking_datetime DESC`,
      [mechanicId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch mechanic bookings' });
  }
};

module.exports = { getAll, getById, getByUser, getByStatus, getByMechanic, create, update, remove };
