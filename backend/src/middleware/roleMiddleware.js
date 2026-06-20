/**
 * Role-based access control middleware.
 * Use after authMiddleware to restrict routes to specific roles.
 *
 * Usage:
 *   const authorize = require('../middleware/roleMiddleware');
 *   router.post('/doctors', authMiddleware, authorize('Admin'), controller.create);
 */

/**
 * Factory function that returns middleware to restrict access to allowed roles.
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

module.exports = authorize;
