/**
 * Admin authorization middleware
 * Requires user to have admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Admin privileges required to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = requireAdmin;