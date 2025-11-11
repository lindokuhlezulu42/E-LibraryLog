const database = require('../config/database');
const { getCurrentDateTime } = require('../utils/dateUtils');
const User = require('./User');

class Admin {
  /**
   * Create a new admin profile
   * @param {Object} adminData - Admin data
   * @param {number} adminData.userId - User ID
   * @param {string} adminData.firstName - First name
   * @param {string} adminData.lastName - Last name
   * @param {string} adminData.phone - Phone number (optional)
   * @param {string} adminData.department - Department (optional)
   * @param {Object} adminData.permissions - Permissions object (optional)
   * @returns {Promise<Object>} Created admin profile
   */
  static async create(adminData) {
    try {
      const { userId, firstName, lastName, phone, department, permissions = {} } = adminData;

      const insertQuery = `
        INSERT INTO admins (user_id, first_name, last_name, phone, department, permissions, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [
        userId,
        firstName,
        lastName,
        phone || null,
        department || null,
        JSON.stringify(permissions),
        currentDateTime
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create admin profile: ${error.message}`);
    }
  }

  /**
   * Find admin by ID
   * @param {number} id - Admin ID
   * @returns {Promise<Object|null>} Admin object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT a.*, u.email, u.role, u.is_active, u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM admins a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `;

      const admins = await database.query(query, [id]);

      if (admins.length === 0) {
        return null;
      }

      const admin = admins[0];

      // Parse permissions JSON
      if (admin.permissions) {
        admin.permissions = JSON.parse(admin.permissions);
      }

      // Construct full name
      admin.full_name = `${admin.first_name} ${admin.last_name}`;

      return admin;
    } catch (error) {
      throw new Error(`Failed to find admin by ID: ${error.message}`);
    }
  }

  /**
   * Find admin by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Admin object or null
   */
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT a.*, u.email, u.role, u.is_active, u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM admins a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ?
      `;

      const admins = await database.query(query, [userId]);

      if (admins.length === 0) {
        return null;
      }

      const admin = admins[0];

      // Parse permissions JSON
      if (admin.permissions) {
        admin.permissions = JSON.parse(admin.permissions);
      }

      // Construct full name
      admin.full_name = `${admin.first_name} ${admin.last_name}`;

      return admin;
    } catch (error) {
      throw new Error(`Failed to find admin by user ID: ${error.message}`);
    }
  }

  /**
   * Update admin profile
   * @param {number} id - Admin ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated admin object or null
   */
  static async update(id, updateData) {
    try {
      const allowedFields = ['first_name', 'last_name', 'phone', 'department', 'permissions'];
      const updates = [];
      const parameters = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updates.push(`${key} = ?`);
          if (key === 'permissions') {
            parameters.push(JSON.stringify(updateData[key]));
          } else {
            parameters.push(updateData[key]);
          }
        }
      });

      if (updates.length === 0) {
        return await this.findById(id);
      }

      const updateQuery = `
        UPDATE admins
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      parameters.push(id);
      await database.query(updateQuery, parameters);

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update admin: ${error.message}`);
    }
  }

  /**
   * Get all admins with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term
   * @param {string} options.department - Filter by department
   * @param {boolean} options.isActive - Filter by active status
   * @returns {Promise<Object>} Admins with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        department,
        isActive
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (search) {
        conditions.push('(a.first_name LIKE ? OR a.last_name LIKE ? OR u.email LIKE ?)');
        const searchParam = `%${search}%`;
        parameters.push(searchParam, searchParam, searchParam);
      }

      if (department) {
        conditions.push('a.department = ?');
        parameters.push(department);
      }

      if (isActive !== undefined) {
        conditions.push('u.is_active = ?');
        parameters.push(isActive ? 1 : 0);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM admins a
        JOIN users u ON a.user_id = u.id
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get admins
      const adminsQuery = `
        SELECT a.id, a.user_id, a.first_name, a.last_name, a.phone, a.department,
               a.created_at, u.email, u.is_active,
               CONCAT(a.first_name, ' ', a.last_name) as full_name
        FROM admins a
        JOIN users u ON a.user_id = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const admins = await database.query(adminsQuery, [...parameters, limit, offset]);

      return {
        admins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find admins: ${error.message}`);
    }
  }

  /**
   * Delete admin profile (and associated user)
   * @param {number} id - Admin ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const admin = await this.findById(id);

      if (!admin) {
        return false;
      }

      // Use database transaction
      return await database.transaction(async (connection) => {
        // Delete admin profile
        await connection.execute('DELETE FROM admins WHERE id = ?', [id]);

        // Delete associated user
        await connection.execute('DELETE FROM users WHERE id = ?', [admin.user_id]);

        return true;
      });
    } catch (error) {
      throw new Error(`Failed to delete admin: ${error.message}`);
    }
  }

  /**
   * Create admin with user account
   * @param {Object} adminData - Complete admin data
   * @returns {Promise<Object>} Created admin with user info
   */
  static async createWithUser(adminData) {
    try {
      return await database.transaction(async (connection) => {
        // Create user first
        const userInsertQuery = `
          INSERT INTO users (email, password_hash, role, is_active, created_at, updated_at)
          VALUES (?, ?, ?, 1, ?, ?)
        `;

        const { hashPassword } = require('../utils/passwordUtils');
        const hashedPassword = await hashPassword(adminData.password);
        const currentDateTime = getCurrentDateTime();

        const [userResult] = await connection.execute(userInsertQuery, [
          adminData.email,
          hashedPassword,
          'admin',
          currentDateTime,
          currentDateTime
        ]);

        // Create admin profile
        const adminInsertQuery = `
          INSERT INTO admins (user_id, first_name, last_name, phone, department, permissions, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [adminResult] = await connection.execute(adminInsertQuery, [
          userResult.insertId,
          adminData.firstName,
          adminData.lastName,
          adminData.phone || null,
          adminData.department || null,
          JSON.stringify(adminData.permissions || {}),
          currentDateTime
        ]);

        // Return created admin with user info
        return await this.findById(adminResult.insertId);
      });
    } catch (error) {
      throw new Error(`Failed to create admin with user: ${error.message}`);
    }
  }

  /**
   * Update admin permissions
   * @param {number} id - Admin ID
   * @param {Object} permissions - New permissions object
   * @returns {Promise<Object|null>} Updated admin object or null
   */
  static async updatePermissions(id, permissions) {
    try {
      const updateQuery = `
        UPDATE admins
        SET permissions = ?
        WHERE id = ?
      `;

      await database.query(updateQuery, [JSON.stringify(permissions), id]);

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update admin permissions: ${error.message}`);
    }
  }

  /**
   * Get all departments
   * @returns {Promise<Array>} Array of unique departments
   */
  static async getDepartments() {
    try {
      const query = `
        SELECT DISTINCT department
        FROM admins
        WHERE department IS NOT NULL AND department != ''
        ORDER BY department
      `;

      const result = await database.query(query);

      return result.map(row => row.department);
    } catch (error) {
      throw new Error(`Failed to get departments: ${error.message}`);
    }
  }

  /**
   * Get admin statistics
   * @returns {Promise<Object>} Admin statistics
   */
  static async getStatistics() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM admins a JOIN users u ON a.user_id = u.id WHERE u.is_active = 1',
        byDepartment: `
          SELECT department, COUNT(*) as count
          FROM admins a
          JOIN users u ON a.user_id = u.id
          WHERE u.is_active = 1 AND department IS NOT NULL
          GROUP BY department
          ORDER BY count DESC
        `,
        recent: `
          SELECT COUNT(*) as count
          FROM admins a
          JOIN users u ON a.user_id = u.id
          WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `
      };

      const [totalResult, departmentResult, recentResult] = await Promise.all([
        database.query(queries.total),
        database.query(queries.byDepartment),
        database.query(queries.recent)
      ]);

      return {
        total: totalResult[0].count,
        byDepartment: departmentResult,
        recentlyCreated: recentResult[0].count
      };
    } catch (error) {
      throw new Error(`Failed to get admin statistics: ${error.message}`);
    }
  }
}

module.exports = Admin;