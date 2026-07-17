const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function authenticate(req, res, next) {
  // Try standard Authorization header first
  let auth = req.headers.authorization;

  // Fallbacks for development: check x-access-token header, query param, or body
  if (!auth) {
    const alt = req.headers['x-access-token'] || req.query?.token || req.body?.token;
    if (alt) {
      // Normalize to Bearer format so downstream logic can remain consistent
      auth = `Bearer ${alt}`;
      console.log('Auth token taken from fallback source (x-access-token/query/body)');
    }
  }

  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
