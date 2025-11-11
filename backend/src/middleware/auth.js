const { verifyToken } = require('../config/jwt');
const database = require('../config/database');

/**
 * Authentication middleware to verify JWT tokens
 * Attaches user data to request object if authentication is successful
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Access token is required',
        timestamp: new Date().toISOString()
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user exists and is active
    const userQuery = `
      SELECT u.id, u.email, u.role, u.is_active, u.created_at,
             CASE
               WHEN u.role = 'admin' THEN CONCAT(a.first_name, ' ', a.last_name)
               WHEN u.role = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
               ELSE 'Unknown User'
             END as full_name
      FROM users u
      LEFT JOIN admins a ON u.id = a.user_id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.id = ? AND u.is_active = 1
    `;

    const users = await database.query(userQuery, [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'User not found or inactive',
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      isActive: user.is_active,
      createdAt: user.created_at
    };

    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.',
        timestamp: new Date().toISOString()
      });
    } else if (error.message === 'Invalid token' || error.message === 'Token verification failed') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Authentication service unavailable',
        timestamp: new Date().toISOString()
      });
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is present, but doesn't block if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);

    const userQuery = `
      SELECT u.id, u.email, u.role, u.is_active, u.created_at,
             CASE
               WHEN u.role = 'admin' THEN CONCAT(a.first_name, ' ', a.last_name)
               WHEN u.role = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
               ELSE 'Unknown User'
             END as full_name
      FROM users u
      LEFT JOIN admins a ON u.id = a.user_id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.id = ? AND u.is_active = 1
    `;

    const users = await database.query(userQuery, [decoded.userId]);

    if (users.length > 0) {
      const user = users[0];
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        isActive: user.is_active,
        createdAt: user.created_at
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // For optional auth, we don't block the request on auth failures
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};