const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../lib/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role = 'customer' } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    // Ensure non-null values for name fields to avoid NOT NULL DB constraint failures
    const safeFirst = (first_name || '').trim();
    const safeLast = (last_name || '').trim();

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(400).json({ success: false, error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (first_name,last_name,email,phone,password_hash,role,created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()
      ) RETURNING id, first_name, last_name, email, role`,
      [safeFirst, safeLast, email, phone, password_hash, role]
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    // Best-effort welcome email (non-blocking)
    try {
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
      sendEmail({
        to: user.email,
        subject: 'Welcome to AutoService — Your Account is Ready',
        text: `Hi ${name},\n\nWelcome to AutoService! Your account has been successfully created.
        \n\nYou can now log in and book car services, track your bookings, and shop for parts.\n\nThanks,\nAutoService Team`,
        html: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><style>
  body{margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;}
  .wrapper{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);}
  .header{background:#1d4ed8;padding:28px 36px;} .header h1{margin:0;color:#fff;font-size:20px;font-weight:700;} .header p{margin:4px 0 0;color:#bfdbfe;font-size:13px;}
  .body{padding:32px 36px;} .body p{margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;}
  .highlight-box{background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;padding:16px 20px;margin:20px 0;}
  .highlight-box p{margin:0;font-size:14px;color:#1e3a5f;}
  .cta-btn{display:inline-block;background:#1d4ed8;color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;margin-top:8px;}
  .footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 36px;text-align:center;}
  .footer p{margin:0;font-size:12px;color:#9ca3af;line-height:1.6;}
</style></head><body>
<div class="wrapper">
  <div class="header"><h1>🔧 AutoService</h1><p>Your trusted car service partner</p></div>
  <div class="body">
    <p>Hi <strong>${name}</strong>,</p>
    <p>Welcome aboard! Your AutoService account has been successfully created and is ready to use.</p>
    <div class="highlight-box">
      <p>✅ Book car services with certified mechanics<br/>📦 Shop for quality car parts<br/>📋 Track all your bookings in one place</p>
    </div>
    <p>Click below to log in and get started:</p>
    <a href="${process.env.APP_URL || 'http://localhost:5173'}/login" class="cta-btn">Log In to My Account</a>
    <p style="margin-top:24px;font-size:13px;color:#6b7280;">If you did not create this account, please ignore this email.</p>
  </div>
  <div class="footer"><p>© ${new Date().getFullYear()} AutoService Ghana. All rights reserved.</p></div>
</div>
</body></html>`
      }).then(info => console.log('✉️ Welcome email sent to', user.email)).catch(err => console.error('⚠️ Failed to send welcome email:', err));
    } catch (e) {
      console.error('⚠️ Error sending welcome email:', e);
    }

    return res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    console.error('Registration error:', err);
    // Postgres constraint handling
    if (err && err.code) {
      // Unique violation (email already exists)
      if (err.code === '23505') {
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }
      // Not-null violation
      if (err.code === '23502') {
        const col = err.column || 'required_field';
        return res.status(400).json({ success: false, error: `Missing required field: ${col}` });
      }
    }

    return res.status(500).json({ success: false, error: 'Registration failed', detail: err.message || String(err) });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    let ok = false;
    if (user.password_hash) {
      ok = await bcrypt.compare(password, user.password_hash);
    } else {
      // Demo accounts in the sample database may not have a stored hash yet.
      // Allow the demo password for those seeded users only.
      ok = password === 'demo';
      if (ok) console.warn('⚠️ Login using demo fallback for user', user.email);
    }
    if (!ok) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role };
    return res.json({ success: true, data: { token, user: safeUser } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

module.exports = { register, login };
