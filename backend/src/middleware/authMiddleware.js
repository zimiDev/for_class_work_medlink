const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/**
 * JWT Authentication Middleware
 * - Extracts token from Authorization: Bearer <token> header
 * - Verifies the token using jsonwebtoken
 * - Attaches decoded user (id, role) to req.user
 * - Returns 401 if token is missing, expired, or invalid
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
