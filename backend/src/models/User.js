const database = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { getCurrentDateTime } = require('../utils/dateUtils');

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password
   * @param {string} userData.role - User role (admin, student)
   * @returns {Promise<Object>} Created user
   */
  static async create(userData) {
    try {
      const { email, password, role } = userData;

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Insert user
      const insertQuery = `
        INSERT INTO users (email, password_hash, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 1, ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [email, hashedPassword, role, currentDateTime, currentDateTime]);

      // Return created user
      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT u.id, u.email, u.role, u.is_active, u.created_at, u.updated_at,
               CASE
                 WHEN u.role = 'admin' THEN JSON_OBJECT(
                   'id', a.id,
                   'firstName', a.first_name,
                   'lastName', a.last_name,
                   'phone', a.phone,
                   'department', a.department,
                   'permissions', a.permissions
                 )
                 WHEN u.role = 'student' THEN JSON_OBJECT(
                   'id', s.id,
                   'studentId', s.student_id,
                   'firstName', s.first_name,
                   'lastName', s.last_name,
                   'dateOfBirth', s.date_of_birth,
                   'gradeLevel', s.grade_level,
                   'classSection', s.class_section,
                   'phone', s.phone,
                   'address', s.address,
                   'parentContact', s.parent_contact,
                   'enrollmentDate', s.enrollment_date
                 )
                 ELSE NULL
               END as profile
        FROM users u
        LEFT JOIN admins a ON u.id = a.user_id
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.id = ?
      `;

      const users = await database.query(query, [id]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      // Parse JSON profile
      if (user.profile) {
        user.profile = JSON.parse(user.profile);
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    try {
      const query = `
        SELECT u.id, u.email, u.password_hash, u.role, u.is_active, u.created_at, u.updated_at,
               CASE
                 WHEN u.role = 'admin' THEN JSON_OBJECT(
                   'id', a.id,
                   'firstName', a.first_name,
                   'lastName', a.last_name,
                   'phone', a.phone,
                   'department', a.department,
                   'permissions', a.permissions
                 )
                 WHEN u.role = 'student' THEN JSON_OBJECT(
                   'id', s.id,
                   'studentId', s.student_id,
                   'firstName', s.first_name,
                   'lastName', s.last_name,
                   'dateOfBirth', s.date_of_birth,
                   'gradeLevel', s.grade_level,
                   'classSection', s.class_section,
                   'phone', s.phone,
                   'address', s.address,
                   'parentContact', s.parent_contact,
                   'enrollmentDate', s.enrollment_date
                 )
                 ELSE NULL
               END as profile
        FROM users u
        LEFT JOIN admins a ON u.id = a.user_id
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.email = ?
      `;

      const users = await database.query(query, [email]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      // Parse JSON profile
      if (user.profile) {
        user.profile = JSON.parse(user.profile);
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object|null>} User object or null
   */
  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);

      if (!user) {
        return null;
      }

      if (!user.is_active) {
        return null;
      }

      const isPasswordValid = await comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        return null;
      }

      // Remove password hash from returned object
      delete user.password_hash;

      return user;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Update user password
   * @param {number} id - User ID
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} True if updated successfully
   */
  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await hashPassword(newPassword);
      const currentDateTime = getCurrentDateTime();

      const updateQuery = `
        UPDATE users
        SET password_hash = ?, updated_at = ?
        WHERE id = ?
      `;

      const result = await database.query(updateQuery, [hashedPassword, currentDateTime, id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  /**
   * Update user status (active/inactive)
   * @param {number} id - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<boolean>} True if updated successfully
   */
  static async updateStatus(id, isActive) {
    try {
      const currentDateTime = getCurrentDateTime();

      const updateQuery = `
        UPDATE users
        SET is_active = ?, updated_at = ?
        WHERE id = ?
      `;

      const result = await database.query(updateQuery, [isActive ? 1 : 0, currentDateTime, id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term
   * @param {string} options.role - Filter by role
   * @param {boolean} options.isActive - Filter by active status
   * @returns {Promise<Object>} Users with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        role,
        isActive
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (search) {
        conditions.push('u.email LIKE ?');
        parameters.push(`%${search}%`);
      }

      if (role) {
        conditions.push('u.role = ?');
        parameters.push(role);
      }

      if (isActive !== undefined) {
        conditions.push('u.is_active = ?');
        parameters.push(isActive ? 1 : 0);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get users
      const usersQuery = `
        SELECT u.id, u.email, u.role, u.is_active, u.created_at, u.updated_at,
               CASE
                 WHEN u.role = 'admin' THEN CONCAT(a.first_name, ' ', a.last_name)
                 WHEN u.role = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
                 ELSE 'Unknown'
               END as full_name
        FROM users u
        LEFT JOIN admins a ON u.id = a.user_id
        LEFT JOIN students s ON u.id = s.user_id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const users = await database.query(usersQuery, [...parameters, limit, offset]);

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      // Check if user has dependent records
      const dependentQuery = `
        SELECT
          (SELECT COUNT(*) FROM admins WHERE user_id = ?) as admin_count,
          (SELECT COUNT(*) FROM students WHERE user_id = ?) as student_count
      `;

      const dependentResult = await database.query(dependentQuery, [id, id]);
      const dependent = dependentResult[0];

      if (dependent.admin_count > 0 || dependent.student_count > 0) {
        throw new Error('Cannot delete user: user has dependent records');
      }

      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      const result = await database.query(deleteQuery, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Check if email already exists
   * @param {string} email - Email to check
   * @param {number} excludeId - Exclude user ID (for updates)
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email, excludeId = null) {
    try {
      let query = 'SELECT id FROM users WHERE email = ?';
      const parameters = [email];

      if (excludeId) {
        query += ' AND id != ?';
        parameters.push(excludeId);
      }

      const result = await database.query(query, parameters);

      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }
}

module.exports = User;