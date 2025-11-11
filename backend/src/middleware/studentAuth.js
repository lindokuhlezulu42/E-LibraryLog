/**
 * Student authorization middleware
 * Requires user to have student role
 */
const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Student privileges required to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Middleware to allow students to access only their own data
 * Uses the :id parameter to match with the authenticated user's student ID
 */
const requireSelfAccess = async (req, res, next) => {
  const database = require('../config/database');

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  const requestedId = req.params.id;

  try {
    if (req.user.role === 'admin') {
      // Admins can access any resource
      return next();
    }

    if (req.user.role === 'student') {
      // Get the student record for the authenticated user
      const studentQuery = 'SELECT id FROM students WHERE user_id = ?';
      const students = await database.query(studentQuery, [req.user.id]);

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Student profile not found',
          message: 'Your student profile could not be found',
          timestamp: new Date().toISOString()
        });
      }

      const studentId = students[0].id.toString();

      if (requestedId !== studentId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You can only access your own data',
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  } catch (error) {
    console.error('Self-access middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authorization check failed',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  requireStudent,
  requireSelfAccess
};