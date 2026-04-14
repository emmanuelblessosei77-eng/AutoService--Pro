const db = require('../db');

const getAll = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM car_parts ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch car parts' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM car_parts WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Part not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch car part' });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, category, price, stock_quantity, supplier, image_url, is_available } = req.body;
    if (!name || !category || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, category, price, stock_quantity' });
    }
    const { rows } = await db.query(
      `INSERT INTO car_parts (name, description, category, price, stock_quantity, supplier, image_url, is_available)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, description || '', category, parseFloat(price), parseInt(stock_quantity), supplier || null, image_url || null, is_available !== undefined ? is_available : true]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Error creating car part:', err);
    res.status(500).json({ error: 'Failed to create car part: ' + err.message });
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
    const { rows } = await db.query(`UPDATE car_parts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`, values);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update car part' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM car_parts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete car part' });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    const { rows } = await db.query('UPDATE car_parts SET stock_quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [stock_quantity, id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

module.exports = { getAll, getById, create, update, remove, updateStock };
