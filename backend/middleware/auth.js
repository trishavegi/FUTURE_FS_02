const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  
  // Simple token validation (in production, use JWT)
  const isValid = token.startsWith('Basic ') || token.length > 10;
  
  if (isValid) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

module.exports = authMiddleware;