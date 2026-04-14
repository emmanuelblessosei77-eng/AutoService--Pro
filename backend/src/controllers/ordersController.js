const db = require('../db');
const { enqueueEmail } = require('../lib/emailQueue');
const { EmailLogo } = require('../utils/emailLogo');

const OrderEmailLogo = EmailLogo.replace(/#00AEEF/g, '#4B5563');

function emailLayout(bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>*{box-sizing:border-box;}body{margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;}.wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}.header{background:linear-gradient(180deg,#f5f5f5 0%,#e5e7eb 100%);padding:32px 40px;border-bottom:1px solid #d1d5db;}.header-inner{display:flex;align-items:center;gap:12px;}.header h1{margin:0;color:#6b8e73;font-size:22px;font-weight:800;}.header-tagline{margin:6px 0 0;color:#6b7280;font-size:13px;}.body{padding:36px 40px;}.body p{margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151;}.info-box{background:#f8f9fa;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin:18px 0;}.info-label{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;font-weight:700;margin:0 0 6px;}.info-value{font-size:15px;font-weight:600;color:#111827;margin:0;}.amount-box{background:linear-gradient(135deg,#f1f5f1 0%,#e7efe7 100%);border:1px solid #9db39d;border-radius:12px;padding:22px 24px;margin:18px 0;text-align:center;}.amount{font-size:32px;font-weight:800;color:#15803d;line-height:1;margin:0 0 8px;}.badge{display:inline-flex;align-items:center;gap:6px;background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;border:1px solid #bbf7d0;}.divider{border:none;border-top:1px solid #e5e7eb;margin:28px 0;}.footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;}.footer p{margin:0;font-size:12px;color:#9ca3af;line-height:1.7;}</style></head><body><div class="wrapper"><div class="header"><div class="header-inner">${OrderEmailLogo}<div><h1>AutoService Pro</h1><p class="header-tagline">Ghana's Premier Car Service &amp; Repair</p></div></div></div><div class="body">${bodyHtml}</div><div class="footer"><p>© ${new Date().getFullYear()} AutoService Pro Ghana. All rights reserved.<br/>This is an automated message — please do not reply directly.</p></div></div></body></html>`;
}

async function createOrder(req, res) {
  const client = await db.pool.connect();
  try {
    const user_id = req.user.id;
    const { items } = req.body; // items: [{ car_part_id, quantity }]
    if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });

    await client.query('BEGIN');
    // calculate total and insert order
    let total = 0;
    for (const it of items) {
      const partRes = await client.query('SELECT price, stock_quantity FROM car_parts WHERE id = $1 FOR UPDATE', [it.car_part_id]);
      const part = partRes.rows[0];
      if (!part) throw new Error(`Part ${it.car_part_id} not found`);
      if (part.stock_quantity < it.quantity) throw new Error(`Insufficient stock for part ${it.car_part_id}`);
      total += Number(part.price) * Number(it.quantity);
    }

    const orderRes = await client.query('INSERT INTO orders (user_id, total_amount, status, created_at) VALUES ($1,$2,$3,NOW()) RETURNING *', [user_id, total, 'pending']);
    const order = orderRes.rows[0];

    for (const it of items) {
      const partRes = await client.query('SELECT price FROM car_parts WHERE id = $1 FOR UPDATE', [it.car_part_id]);
      const price = partRes.rows[0].price;
      await client.query('INSERT INTO order_items (order_id, car_part_id, quantity, unit_price) VALUES ($1,$2,$3,$4)', [order.id, it.car_part_id, it.quantity, price]);
      await client.query('UPDATE car_parts SET stock_quantity = stock_quantity - $1, updated_at = NOW() WHERE id = $2', [it.quantity, it.car_part_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, order_id: order.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create order' });
  } finally {
    client.release();
  }
}

async function getOrdersForUser(req, res) {
  try {
    const user_id = req.user.id;
    const { rows } = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC', [user_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function getOrderById(req, res) {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, user_id]);
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    const items = (await db.query('SELECT oi.*, cp.name FROM order_items oi JOIN car_parts cp ON oi.car_part_id = cp.id WHERE oi.order_id = $1', [id])).rows;
    res.json({ order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

async function getAllOrders(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT o.*, u.first_name, u.last_name, u.email,
              (SELECT json_agg(json_build_object('name', cp.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price))
               FROM order_items oi JOIN car_parts cp ON oi.car_part_id = cp.id
               WHERE oi.order_id = o.id) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    // Send email when order is marked as delivered/completed
    if (status === 'delivered' || status === 'completed') {
      sendOrderDeliveredEmail(order.id).catch((err) =>
        console.error('⚠️ Order delivered email failed:', err.message)
      );
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
}

async function sendOrderDeliveredEmail(orderId) {
  try {
    const { rows: orderRows } = await db.query(
      `SELECT o.*, u.email, u.first_name, u.last_name, o.total_amount
       FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1`,
      [orderId]
    );
    if (!orderRows[0]) return;
    const order = orderRows[0];
    const customerName = [order.first_name, order.last_name].filter(Boolean).join(' ') || order.email;

    const { rows: items } = await db.query(
      `SELECT oi.quantity, oi.unit_price, cp.name
       FROM order_items oi JOIN car_parts cp ON oi.car_part_id = cp.id WHERE oi.order_id = $1`,
      [orderId]
    );

    const itemsHtml = items.length > 0
      ? `<div class="info-box"><p class="info-label">Items Ordered</p>${items.map(it =>
          `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><span style="color:#374151;">${it.name} <span style="color:#9ca3af;">× ${it.quantity}</span></span><span style="font-weight:600;color:#111827;">GH₵${(parseFloat(it.unit_price) * it.quantity).toFixed(2)}</span></div>`
        ).join('')}<div style="display:flex;justify-content:space-between;padding:8px 0 0;font-size:15px;font-weight:700;"><span>Total</span><span style="color:#15803d;">GH₵${parseFloat(order.total_amount).toFixed(2)}</span></div></div>`
      : '';

    const html = emailLayout(`
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Great news! Your parts order has been confirmed and is ready for you.</p>
      <div class="info-box">
        <p class="info-label">Order Reference</p>
        <p class="info-value">#${orderId}</p>
      </div>
      ${itemsHtml}
      <div class="amount-box">
        <p class="info-label">Total Amount:</p>
        <p class="amount">GH₵${parseFloat(order.total_amount).toFixed(2)}</p>
        <span class="badge">✓ Order Confirmed</span>
      </div>
      <hr class="divider" />
      <p>Thank you for shopping with AutoService Pro!</p>
    `);

    await enqueueEmail({
      to: order.email,
      subject: `✅ Order Ready — Parts Order #${orderId} | AutoService Pro`,
      text: `Hi ${customerName},\n\nYour parts order #${orderId} has been confirmed.\nTotal: GH₵${parseFloat(order.total_amount).toFixed(2)}\n\nThank you for shopping with AutoService Pro!`,
      html,
    });
    console.log(`📧 Order delivered email queued for ${order.email} (order #${orderId})`);
  } catch (err) {
    console.error('⚠️ sendOrderDeliveredEmail failed:', err.message);
  }
}

module.exports = { createOrder, getOrdersForUser, getOrderById, getAllOrders, updateOrder };
