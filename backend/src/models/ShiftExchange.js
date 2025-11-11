const database = require('../config/database');
const { getCurrentDateTime } = require('../utils/dateUtils');

class ShiftExchange {
  /**
   * Create a new shift exchange request
   * @param {Object} exchangeData - Exchange request data
   * @param {number} exchangeData.originalScheduleId - Original schedule ID
   * @param {number} exchangeData.requestingAdminId - Requesting admin ID
   * @param {number} exchangeData.targetAdminId - Target admin ID
   * @param {Date} exchangeData.proposedStartTime - Proposed start time
   * @param {Date} exchangeData.proposedEndTime - Proposed end time
   * @param {string} exchangeData.reason - Reason for exchange
   * @returns {Promise<Object>} Created shift exchange request
   */
  static async create(exchangeData) {
    try {
      const {
        originalScheduleId,
        requestingAdminId,
        targetAdminId,
        proposedStartTime,
        proposedEndTime,
        reason
      } = exchangeData;

      const insertQuery = `
        INSERT INTO shift_exchanges (
          original_schedule_id, requesting_admin_id, target_admin_id,
          proposed_start_time, proposed_end_time, reason, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [
        originalScheduleId,
        requestingAdminId,
        targetAdminId,
        proposedStartTime,
        proposedEndTime,
        reason || null,
        currentDateTime,
        currentDateTime
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create shift exchange request: ${error.message}`);
    }
  }

  /**
   * Find shift exchange by ID
   * @param {number} id - Exchange ID
   * @returns {Promise<Object|null>} Exchange object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT se.*,
               s.title as original_title, s.start_time as original_start_time, s.end_time as original_end_time,
               req_admin.first_name as requesting_admin_first_name, req_admin.last_name as requesting_admin_last_name,
               CONCAT(req_admin.first_name, ' ', req_admin.last_name) as requesting_admin_name,
               target_admin.first_name as target_admin_first_name, target_admin.last_name as target_admin_last_name,
               CONCAT(target_admin.first_name, ' ', target_admin.last_name) as target_admin_name
        FROM shift_exchanges se
        JOIN schedules s ON se.original_schedule_id = s.id
        JOIN admins req_admin ON se.requesting_admin_id = req_admin.id
        JOIN admins target_admin ON se.target_admin_id = target_admin.id
        WHERE se.id = ?
      `;

      const exchanges = await database.query(query, [id]);

      if (exchanges.length === 0) {
        return null;
      }

      return exchanges[0];
    } catch (error) {
      throw new Error(`Failed to find shift exchange by ID: ${error.message}`);
    }
  }

  /**
   * Get all shift exchange requests with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.status - Filter by status
   * @param {number} options.requestingAdminId - Filter by requesting admin
   * @param {number} options.targetAdminId - Filter by target admin
   * @returns {Promise<Object>} Shift exchanges with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        requestingAdminId,
        targetAdminId
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (status) {
        conditions.push('se.status = ?');
        parameters.push(status);
      }

      if (requestingAdminId) {
        conditions.push('se.requesting_admin_id = ?');
        parameters.push(requestingAdminId);
      }

      if (targetAdminId) {
        conditions.push('se.target_admin_id = ?');
        parameters.push(targetAdminId);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM shift_exchanges se
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get shift exchanges
      const exchangesQuery = `
        SELECT se.*,
               s.title as original_title, s.start_time as original_start_time, s.end_time as original_end_time,
               req_admin.first_name as requesting_admin_first_name, req_admin.last_name as requesting_admin_last_name,
               CONCAT(req_admin.first_name, ' ', req_admin.last_name) as requesting_admin_name,
               target_admin.first_name as target_admin_first_name, target_admin.last_name as target_admin_last_name,
               CONCAT(target_admin.first_name, ' ', target_admin.last_name) as target_admin_name
        FROM shift_exchanges se
        JOIN schedules s ON se.original_schedule_id = s.id
        JOIN admins req_admin ON se.requesting_admin_id = req_admin.id
        JOIN admins target_admin ON se.target_admin_id = target_admin.id
        ${whereClause}
        ORDER BY se.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const exchanges = await database.query(exchangesQuery, [...parameters, limit, offset]);

      return {
        exchanges,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find shift exchanges: ${error.message}`);
    }
  }

  /**
   * Get shift exchanges for a specific admin (either requesting or target)
   * @param {number} adminId - Admin ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Shift exchanges with pagination info
   */
  static async findByAdmin(adminId, options = {}) {
    // Get exchanges where admin is either requesting or target
    return await database.transaction(async (connection) => {
      const {
        page = 1,
        limit = 20,
        status
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [
        '(se.requesting_admin_id = ? OR se.target_admin_id = ?)'
      ];
      const parameters = [adminId, adminId];

      if (status) {
        conditions.push('se.status = ?');
        parameters.push(status);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM shift_exchanges se
        ${whereClause}
      `;

      const [countResult] = await connection.execute(countQuery, parameters);
      const total = countResult[0].total;

      // Get shift exchanges
      const exchangesQuery = `
        SELECT se.*,
               s.title as original_title, s.start_time as original_start_time, s.end_time as original_end_time,
               req_admin.first_name as requesting_admin_first_name, req_admin.last_name as requesting_admin_last_name,
               CONCAT(req_admin.first_name, ' ', req_admin.last_name) as requesting_admin_name,
               target_admin.first_name as target_admin_first_name, target_admin.last_name as target_admin_last_name,
               CONCAT(target_admin.first_name, ' ', target_admin.last_name) as target_admin_name,
               CASE
                 WHEN se.requesting_admin_id = ? THEN 'requesting'
                 WHEN se.target_admin_id = ? THEN 'target'
               END as admin_role
        FROM shift_exchanges se
        JOIN schedules s ON se.original_schedule_id = s.id
        JOIN admins req_admin ON se.requesting_admin_id = req_admin.id
        JOIN admins target_admin ON se.target_admin_id = target_admin.id
        ${whereClause}
        ORDER BY se.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [exchanges] = await connection.execute(exchangesQuery, [...parameters, adminId, adminId, limit, offset]);

      return {
        exchanges,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    });
  }

  /**
   * Update shift exchange status
   * @param {number} id - Exchange ID
   * @param {string} status - New status (accepted, rejected, cancelled)
   * @param {string} exchangeNotes - Exchange notes (optional)
   * @returns {Promise<Object|null>} Updated exchange or null
   */
  static async updateStatus(id, status, exchangeNotes = null) {
    try {
      const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const currentDateTime = getCurrentDateTime();

      let updateQuery = `
        UPDATE shift_exchanges
        SET status = ?, updated_at = ?
      `;

      const parameters = [status, currentDateTime];

      if (exchangeNotes) {
        updateQuery += ', exchange_notes = ?';
        parameters.push(exchangeNotes);
      }

      updateQuery += ' WHERE id = ?';
      parameters.push(id);

      const result = await database.query(updateQuery, parameters);

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update shift exchange status: ${error.message}`);
    }
  }

  /**
   * Accept shift exchange
   * @param {number} id - Exchange ID
   * @param {string} exchangeNotes - Exchange notes (optional)
   * @returns {Promise<Object|null>} Updated exchange or null
   */
  static async accept(id, exchangeNotes = null) {
    return await database.transaction(async (connection) => {
      // Update exchange status
      const currentDateTime = getCurrentDateTime();

      const updateQuery = `
        UPDATE shift_exchanges
        SET status = 'accepted', exchange_notes = ?, updated_at = ?
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [exchangeNotes || null, currentDateTime, id]);

      // Get exchange details to update the original schedule
      const exchangeQuery = `
        SELECT original_schedule_id, target_admin_id, proposed_start_time, proposed_end_time
        FROM shift_exchanges
        WHERE id = ?
      `;

      const [exchangeDetails] = await connection.execute(exchangeQuery, [id]);

      if (exchangeDetails.length === 0) {
        return null;
      }

      const { original_schedule_id, target_admin_id, proposed_start_time, proposed_end_time } = exchangeDetails[0];

      // Update the original schedule with new details
      const scheduleUpdateQuery = `
        UPDATE schedules
        SET assigned_to_id = ?, assigned_to_type = 'admin', start_time = ?, end_time = ?, updated_at = ?
        WHERE id = ?
      `;

      await connection.execute(scheduleUpdateQuery, [
        target_admin_id,
        proposed_start_time,
        proposed_end_time,
        currentDateTime,
        original_schedule_id
      ]);

      return await this.findById(id);
    });
  }

  /**
   * Reject shift exchange
   * @param {number} id - Exchange ID
   * @param {string} exchangeNotes - Rejection reason
   * @returns {Promise<Object|null>} Updated exchange or null
   */
  static async reject(id, exchangeNotes) {
    return this.updateStatus(id, 'rejected', exchangeNotes);
  }

  /**
   * Cancel shift exchange
   * @param {number} id - Exchange ID
   * @param {string} exchangeNotes - Cancellation reason
   * @returns {Promise<Object|null>} Updated exchange or null
   */
  static async cancel(id, exchangeNotes) {
    return this.updateStatus(id, 'cancelled', exchangeNotes);
  }

  /**
   * Delete shift exchange request
   * @param {number} id - Exchange ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const deleteQuery = 'DELETE FROM shift_exchanges WHERE id = ?';
      const result = await database.query(deleteQuery, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete shift exchange: ${error.message}`);
    }
  }

  /**
   * Get pending shift exchanges for admin
   * @param {number} adminId - Admin ID
   * @returns {Promise<Array>} Array of pending exchanges
   */
  static async getPendingForAdmin(adminId) {
    try {
      const query = `
        SELECT se.*,
               s.title as original_title, s.start_time as original_start_time, s.end_time as original_end_time,
               req_admin.first_name as requesting_admin_first_name, req_admin.last_name as requesting_admin_last_name,
               CONCAT(req_admin.first_name, ' ', req_admin.last_name) as requesting_admin_name,
               target_admin.first_name as target_admin_first_name, target_admin.last_name as target_admin_last_name,
               CONCAT(target_admin.first_name, ' ', target_admin.last_name) as target_admin_name,
               CASE
                 WHEN se.requesting_admin_id = ? THEN 'requesting'
                 WHEN se.target_admin_id = ? THEN 'target'
               END as admin_role
        FROM shift_exchanges se
        JOIN schedules s ON se.original_schedule_id = s.id
        JOIN admins req_admin ON se.requesting_admin_id = req_admin.id
        JOIN admins target_admin ON se.target_admin_id = target_admin.id
        WHERE se.status = 'pending' AND (se.requesting_admin_id = ? OR se.target_admin_id = ?)
        ORDER BY se.created_at DESC
      `;

      const exchanges = await database.query(query, [adminId, adminId, adminId, adminId]);

      return exchanges;
    } catch (error) {
      throw new Error(`Failed to get pending shift exchanges: ${error.message}`);
    }
  }

  /**
   * Get shift exchange statistics
   * @returns {Promise<Object>} Shift exchange statistics
   */
  static async getStatistics() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM shift_exchanges',
        byStatus: `
          SELECT status, COUNT(*) as count
          FROM shift_exchanges
          GROUP BY status
        `,
        pending: 'SELECT COUNT(*) as count FROM shift_exchanges WHERE status = "pending"',
        accepted: 'SELECT COUNT(*) as count FROM shift_exchanges WHERE status = "accepted"',
        rejected: 'SELECT COUNT(*) as count FROM shift_exchanges WHERE status = "rejected"',
        thisWeek: `
          SELECT COUNT(*) as count
          FROM shift_exchanges
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `,
        thisMonth: `
          SELECT COUNT(*) as count
          FROM shift_exchanges
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `
      };

      const [
        totalResult,
        statusResult,
        pendingResult,
        acceptedResult,
        rejectedResult,
        thisWeekResult,
        thisMonthResult
      ] = await Promise.all([
        database.query(queries.total),
        database.query(queries.byStatus),
        database.query(queries.pending),
        database.query(queries.accepted),
        database.query(queries.rejected),
        database.query(queries.thisWeek),
        database.query(queries.thisMonth)
      ]);

      return {
        total: totalResult[0].count,
        byStatus: statusResult,
        pending: pendingResult[0].count,
        accepted: acceptedResult[0].count,
        rejected: rejectedResult[0].count,
        thisWeek: thisWeekResult[0].count,
        thisMonth: thisMonthResult[0].count
      };
    } catch (error) {
      throw new Error(`Failed to get shift exchange statistics: ${error.message}`);
    }
  }
}

module.exports = ShiftExchange;