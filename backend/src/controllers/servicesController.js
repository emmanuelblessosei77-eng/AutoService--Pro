const db = require('../db');

// Core service names (canonical set — case-insensitive deduplication)
const CORE_SERVICE_NAMES = [
  'Oil Change',
  'Diagnostics',
  'Brake Service',
  'Battery Testing & Service',
  'Air Filter Replacement',
  'Cabin Filter Replacement',
];

const getAll = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services WHERE is_active = true ORDER BY id');

    // Deduplicate by name (case-insensitive) and keep only the 6 core services
    const seen = new Set();
    const unique = rows.filter((svc) => {
      const key = (svc.name || '').trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter to only the 6 canonical core services (case-insensitive match)
    const coreNameSet = new Set(CORE_SERVICE_NAMES.map(n => n.toLowerCase()));
    const coreServices = unique.filter(svc =>
      coreNameSet.has((svc.name || '').trim().toLowerCase())
    );

    // If the DB has all 6, return them in canonical order; otherwise return what we have
    if (coreServices.length > 0) {
      const ordered = CORE_SERVICE_NAMES
        .map(name => coreServices.find(s => (s.name || '').trim().toLowerCase() === name.toLowerCase()))
        .filter(Boolean);
      return res.json(ordered);
    }

    // Fallback: return deduped list (up to 6)
    res.json(unique.slice(0, 6));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Service not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, price, duration_minutes, category, is_active } = req.body;
    const { rows } = await db.query(
      `INSERT INTO services (name, description, price, duration_minutes, category, is_active)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, description, price, duration_minutes, category, is_active]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create service' });
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
    const { rows } = await db.query(`UPDATE services SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`, values);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

module.exports = { getAll, getById, create, update, remove };
