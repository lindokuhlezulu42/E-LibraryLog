const database = require('../config/database');
const { getCurrentDateTime } = require('../utils/dateUtils');

class LeaveRequest {
  /**
   * Create a new leave request
   * @param {Object} leaveData - Leave request data
   * @param {number} leaveData.studentId - Student ID
   * @param {string} leaveData.leaveType - Leave type (sick, personal, emergency, vacation)
   * @param {Date} leaveData.startDate - Start date
   * @param {Date} leaveData.endDate - End date
   * @param {string} leaveData.reason - Reason for leave
   * @returns {Promise<Object>} Created leave request
   */
  static async create(leaveData) {
    try {
      const { studentId, leaveType, startDate, endDate, reason } = leaveData;

      const insertQuery = `
        INSERT INTO leave_requests (
          student_id, leave_type, start_date, end_date, reason, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [
        studentId,
        leaveType,
        startDate,
        endDate,
        reason,
        currentDateTime,
        currentDateTime
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create leave request: ${error.message}`);
    }
  }

  /**
   * Find leave request by ID
   * @param {number} id - Leave request ID
   * @returns {Promise<Object|null>} Leave request object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT lr.*,
               s.student_id, s.first_name, s.last_name,
               CONCAT(s.first_name, ' ', s.last_name) as student_name,
               DATEDIFF(lr.end_date, lr.start_date) + 1 as duration_days
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.id
        WHERE lr.id = ?
      `;

      const leaveRequests = await database.query(query, [id]);

      if (leaveRequests.length === 0) {
        return null;
      }

      return leaveRequests[0];
    } catch (error) {
      throw new Error(`Failed to find leave request by ID: ${error.message}`);
    }
  }

  /**
   * Get all leave requests with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.status - Filter by status
   * @param {string} options.leaveType - Filter by leave type
   * @param {number} options.studentId - Filter by student ID
   * @param {string} options.dateRangeStart - Filter by date range start
   * @param {string} options.dateRangeEnd - Filter by date range end
   * @returns {Promise<Object>} Leave requests with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        leaveType,
        studentId,
        dateRangeStart,
        dateRangeEnd
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (status) {
        conditions.push('lr.status = ?');
        parameters.push(status);
      }

      if (leaveType) {
        conditions.push('lr.leave_type = ?');
        parameters.push(leaveType);
      }

      if (studentId) {
        conditions.push('lr.student_id = ?');
        parameters.push(studentId);
      }

      if (dateRangeStart) {
        conditions.push('(lr.start_date >= ? OR lr.end_date >= ?)');
        parameters.push(dateRangeStart, dateRangeStart);
      }

      if (dateRangeEnd) {
        conditions.push('(lr.start_date <= ? OR lr.end_date <= ?)');
        parameters.push(dateRangeEnd, dateRangeEnd);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM leave_requests lr
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get leave requests
      const leaveRequestsQuery = `
        SELECT lr.*,
               s.student_id, s.first_name, s.last_name,
               CONCAT(s.first_name, ' ', s.last_name) as student_name,
               DATEDIFF(lr.end_date, lr.start_date) + 1 as duration_days,
               CASE
                 WHEN lr.approved_by IS NOT NULL THEN CONCAT(a.first_name, ' ', a.last_name)
                 ELSE NULL
               END as approved_by_name
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.id
        LEFT JOIN admins a ON lr.approved_by = a.id
        ${whereClause}
        ORDER BY lr.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const leaveRequests = await database.query(leaveRequestsQuery, [...parameters, limit, offset]);

      return {
        leaveRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find leave requests: ${error.message}`);
    }
  }

  /**
   * Get leave requests for a specific student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Leave requests with pagination info
   */
  static async findByStudent(studentId, options = {}) {
    return this.findAll({ ...options, studentId });
  }

  /**
   * Update leave request status (approve/reject/cancel)
   * @param {number} id - Leave request ID
   * @param {string} status - New status
   * @param {number} approvedBy - Admin ID who approved/rejected
   * @param {string} adminNotes - Admin notes (optional)
   * @returns {Promise<Object|null>} Updated leave request or null
   */
  static async updateStatus(id, status, approvedBy = null, adminNotes = null) {
    try {
      const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const currentDateTime = getCurrentDateTime();

      let updateQuery = `
        UPDATE leave_requests
        SET status = ?, updated_at = ?
      `;

      const parameters = [status, currentDateTime];

      if (approvedBy && (status === 'approved' || status === 'rejected')) {
        updateQuery += ', approved_by = ?, approval_date = ?';
        parameters.push(approvedBy, currentDateTime);
      }

      if (adminNotes) {
        updateQuery += ', admin_notes = ?';
        parameters.push(adminNotes);
      }

      updateQuery += ' WHERE id = ?';
      parameters.push(id);

      const result = await database.query(updateQuery, parameters);

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update leave request status: ${error.message}`);
    }
  }

  /**
   * Approve leave request
   * @param {number} id - Leave request ID
   * @param {number} adminId - Admin ID approving the request
   * @param {string} adminNotes - Admin notes (optional)
   * @returns {Promise<Object|null>} Updated leave request or null
   */
  static async approve(id, adminId, adminNotes = null) {
    return this.updateStatus(id, 'approved', adminId, adminNotes);
  }

  /**
   * Reject leave request
   * @param {number} id - Leave request ID
   * @param {number} adminId - Admin ID rejecting the request
   * @param {string} adminNotes - Admin notes (optional)
   * @returns {Promise<Object|null>} Updated leave request or null
   */
  static async reject(id, adminId, adminNotes = null) {
    return this.updateStatus(id, 'rejected', adminId, adminNotes);
  }

  /**
   * Cancel leave request (student only)
   * @param {number} id - Leave request ID
   * @returns {Promise<Object|null>} Updated leave request or null
   */
  static async cancel(id) {
    return this.updateStatus(id, 'cancelled');
  }

  /**
   * Delete leave request
   * @param {number} id - Leave request ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const deleteQuery = 'DELETE FROM leave_requests WHERE id = ?';
      const result = await database.query(deleteQuery, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete leave request: ${error.message}`);
    }
  }

  /**
   * Get pending leave requests for admin approval
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Pending leave requests with pagination info
   */
  static async getPending(options = {}) {
    return this.findAll({ ...options, status: 'pending' });
  }

  /**
   * Check for overlapping leave requests for a student
   * @param {number} studentId - Student ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} excludeId - Exclude leave request ID (for updates)
   * @returns {Promise<Array>} Array of overlapping leave requests
   */
  static async checkOverlaps(studentId, startDate, endDate, excludeId = null) {
    try {
      let query = `
        SELECT id, start_date, end_date, status
        FROM leave_requests
        WHERE student_id = ?
        AND status IN ('pending', 'approved')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
      `;

      const parameters = [
        studentId,
        startDate, startDate,
        endDate, endDate,
        startDate, endDate
      ];

      if (excludeId) {
        query += ' AND id != ?';
        parameters.push(excludeId);
      }

      const overlaps = await database.query(query, parameters);

      return overlaps;
    } catch (error) {
      throw new Error(`Failed to check leave request overlaps: ${error.message}`);
    }
  }

  /**
   * Get leave request statistics
   * @param {Object} options - Query options
   * @param {string} options.dateRangeStart - Start date for statistics
   * @param {string} options.dateRangeEnd - End date for statistics
   * @returns {Promise<Object>} Leave request statistics
   */
  static async getStatistics(options = {}) {
    try {
      const { dateRangeStart, dateRangeEnd } = options;

      let dateFilter = '';
      const parameters = [];

      if (dateRangeStart) {
        dateFilter += ' AND created_at >= ?';
        parameters.push(dateRangeStart);
      }

      if (dateRangeEnd) {
        dateFilter += ' AND created_at <= ?';
        parameters.push(dateRangeEnd);
      }

      const queries = {
        total: `SELECT COUNT(*) as count FROM leave_requests WHERE 1=1 ${dateFilter}`,
        byStatus: `
          SELECT status, COUNT(*) as count
          FROM leave_requests
          WHERE 1=1 ${dateFilter}
          GROUP BY status
        `,
        byType: `
          SELECT leave_type, COUNT(*) as count
          FROM leave_requests
          WHERE 1=1 ${dateFilter}
          GROUP BY leave_type
        `,
        pending: `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending' ${dateFilter}`,
        approved: `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'approved' ${dateFilter}`,
        rejected: `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'rejected' ${dateFilter}`,
        totalDays: `
          SELECT SUM(DATEDIFF(end_date, start_date) + 1) as total_days
          FROM leave_requests
          WHERE status = 'approved' ${dateFilter}
        `,
        recent: `
          SELECT COUNT(*) as count
          FROM leave_requests
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `
      };

      const [
        totalResult,
        statusResult,
        typeResult,
        pendingResult,
        approvedResult,
        rejectedResult,
        totalDaysResult,
        recentResult
      ] = await Promise.all([
        database.query(queries.total, parameters),
        database.query(queries.byStatus, parameters),
        database.query(queries.byType, parameters),
        database.query(queries.pending, parameters),
        database.query(queries.approved, parameters),
        database.query(queries.rejected, parameters),
        database.query(queries.totalDays, parameters),
        database.query(queries.recent)
      ]);

      return {
        total: totalResult[0].count,
        byStatus: statusResult,
        byType: typeResult,
        pending: pendingResult[0].count,
        approved: approvedResult[0].count,
        rejected: rejectedResult[0].count,
        totalApprovedDays: totalDaysResult[0].total_days || 0,
        recentlyCreated: recentResult[0].count
      };
    } catch (error) {
      throw new Error(`Failed to get leave request statistics: ${error.message}`);
    }
  }

  /**
   * Get leave requests that need attention (pending for long time)
   * @param {number} daysThreshold - Days threshold for pending requests
   * @returns {Promise<Array>} Array of leave requests needing attention
   */
  static async getNeedingAttention(daysThreshold = 3) {
    try {
      const query = `
        SELECT lr.*,
               s.student_id, s.first_name, s.last_name,
               CONCAT(s.first_name, ' ', s.last_name) as student_name,
               DATEDIFF(NOW(), lr.created_at) as days_pending
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.id
        WHERE lr.status = 'pending'
        AND DATEDIFF(NOW(), lr.created_at) >= ?
        ORDER BY lr.created_at ASC
      `;

      const results = await database.query(query, [daysThreshold]);

      return results;
    } catch (error) {
      throw new Error(`Failed to get leave requests needing attention: ${error.message}`);
    }
  }
}

module.exports = LeaveRequest;