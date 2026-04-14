const db = require('../db');

const getAll = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, user_id, make, model, year, mileage, fuel_type, vin, created_at, updated_at FROM vehicles ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT id, user_id, make, model, year, mileage, fuel_type, vin, created_at, updated_at FROM vehicles WHERE id = $1',
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

const getByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await db.query(
      'SELECT id, user_id, make, model, year, mileage, fuel_type, vin, created_at, updated_at FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user vehicles' });
  }
};

const create = async (req, res) => {
  try {
    const { user_id, make, model, year, mileage, fuel_type, vin } = req.body;

    console.log('🚗 VEHICLE CREATION REQUEST:');
    console.log(`   User ID from request: ${user_id}`);
    console.log(`   Make/Model: ${make} ${model}`);
    console.log(`   Mileage: ${mileage}, Fuel Type: ${fuel_type}`);
    console.log(`   Authenticated User ID: ${req.user?.id}`);

    if (!user_id || !make || !model) {
      console.log(`❌ Missing required fields: user_id=${user_id}, make=${make}, model=${model}`);
      return res.status(400).json({ error: 'user_id, make, and model are required' });
    }

    // Verify user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (!userCheck.rows[0]) {
      console.log(`❌ User not found in database: ${user_id}`);
      return res.status(400).json({ error: 'User not found' });
    }

    console.log(`✓ User verified in database: ${user_id}`);

    const { rows } = await db.query(
      `INSERT INTO vehicles (user_id, make, model, year, mileage, fuel_type, vin)
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, user_id, make, model, year, mileage, fuel_type, vin, created_at, updated_at`,
      [user_id, make, model, year || new Date().getFullYear(), mileage || 0, fuel_type || 'petrol', vin || null]
    );

    console.log('✅ Vehicle created successfully:', rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Vehicle creation error:', err);
    res.status(500).json({ error: 'Failed to create vehicle', message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, mileage, fuel_type, vin } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (make !== undefined) {
      fields.push(`make = $${idx++}`);
      values.push(make);
    }
    if (model !== undefined) {
      fields.push(`model = $${idx++}`);
      values.push(model);
    }
    if (year !== undefined) {
      fields.push(`year = $${idx++}`);
      values.push(year);
    }
    if (mileage !== undefined) {
      fields.push(`mileage = $${idx++}`);
      values.push(mileage);
    }
    if (fuel_type !== undefined) {
      fields.push(`fuel_type = $${idx++}`);
      values.push(fuel_type);
    }
    if (vin !== undefined) {
      fields.push(`vin = $${idx++}`);
      values.push(vin);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const { rows } = await db.query(
      `UPDATE vehicles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);

    if (!rows[0]) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};

module.exports = {
  getAll,
  getById,
  getByUser,
  create,
  update,
  remove,
};
