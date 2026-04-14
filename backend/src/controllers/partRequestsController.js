const db = require('../db');

const getAll = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT pr.*, u.first_name, u.last_name, b.booking_datetime, s.name as service_name
       FROM part_requests pr
       LEFT JOIN bookings b ON pr.booking_id = b.id
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN services s ON b.service_id = s.id
       ORDER BY pr.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch part requests' });
  }
};

const getMine = async (req, res) => {
  try {
    // mechanic_id comes from auth token (req.user) or query param
    const mechanicId = req.user?.id || req.query.mechanic_id;
    if (!mechanicId) return res.status(400).json({ error: 'Mechanic ID required' });

    const { rows } = await db.query(
      `SELECT pr.*, u.first_name, u.last_name, s.name as service_name
       FROM part_requests pr
       LEFT JOIN bookings b ON pr.booking_id = b.id
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN services s ON b.service_id = s.id
       WHERE pr.mechanic_id = $1
       ORDER BY pr.created_at DESC`,
      [mechanicId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch part requests' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM part_requests WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Part request not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch part request' });
  }
};

const create = async (req, res) => {
  try {
    const { booking_id, part_name, quantity, reason, priority } = req.body;
    // Use mechanic_id from body if provided, otherwise from auth token
    const mechanic_id = req.body.mechanic_id || req.user?.id || null;
    if (!booking_id || !part_name) {
      return res.status(400).json({ error: 'booking_id and part_name are required' });
    }
    const { rows } = await db.query(
      `INSERT INTO part_requests (booking_id, mechanic_id, part_name, quantity, reason, priority, status, requested_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'requested', $7)
       RETURNING *`,
      [booking_id, mechanic_id, part_name, quantity || 1, reason || null, priority || 'medium', mechanic_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Part request create error:', err);
    res.status(500).json({ error: 'Failed to create part request', detail: err.message });
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
    const { rows } = await db.query(
      `UPDATE part_requests SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: 'Part request not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update part request' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM part_requests WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete part request' });
  }
};

module.exports = { getAll, getMine, getById, create, update, remove };
