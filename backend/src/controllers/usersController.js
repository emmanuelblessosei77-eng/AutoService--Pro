const db = require('../db');
const bcrypt = require('bcrypt');

const getAll = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, first_name, last_name, email, phone, role, address, city, postcode, specialty, hire_date, access_level, membership_date, created_at, updated_at FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id, first_name, last_name, email, phone, role, address, city, postcode, specialty, hire_date, access_level, membership_date, created_at, updated_at FROM users WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const create = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role, address, city, postcode, specialty, hire_date, access_level, membership_date, password } = req.body;
    let password_hash = null;
    if (password) password_hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, role, address, city, postcode, specialty, hire_date, access_level, membership_date, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, first_name, last_name, email, role, created_at`,
      [first_name, last_name, email, phone, role, address, city, postcode, specialty, hire_date, access_level, membership_date, password_hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(req.body)) {
      if (key === 'password') {
        fields.push(`password_hash = $${idx}`);
        values.push(await bcrypt.hash(value, 10));
      } else {
        fields.push(`${key} = $${idx}`);
        values.push(value);
      }
      idx++;
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const { rows } = await db.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, first_name, last_name, email, role, created_at, updated_at`, values);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const getByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { rows } = await db.query('SELECT id, first_name, last_name, email, phone, role, address, city, postcode, specialty, hire_date, access_level, membership_date, created_at, updated_at FROM users WHERE role = $1 ORDER BY id', [role]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users by role' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, phone } = req.body;
    
    if (!address || !phone) {
      return res.status(400).json({ error: 'Address and phone are required' });
    }

    const { rows } = await db.query(
      'UPDATE users SET address = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, first_name, last_name, email, phone, role, address, created_at, updated_at',
      [address, phone, userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;
    const { rows } = await db.query(
      'SELECT id, first_name, last_name, email, phone, role, address, city, postcode, specialty, hire_date, access_level, membership_date, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Validate role
    const validRoles = ['admin', 'mechanic', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, mechanic, or customer' });
    }

    const { rows } = await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, first_name, last_name, email, phone, role, created_at, updated_at',
      [role, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getByRole,
  getProfile,
  updateProfile,
  updateRole,
};
