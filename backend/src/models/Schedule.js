const database = require('../config/database');
const { getCurrentDateTime } = require('../utils/dateUtils');

class Schedule {
  /**
   * Create a new schedule
   * @param {Object} scheduleData - Schedule data
   * @param {string} scheduleData.scheduleType - Schedule type (class, shift)
   * @param {string} scheduleData.title - Schedule title
   * @param {string} scheduleData.description - Description (optional)
   * @param {number} scheduleData.assignedToId - ID of person assigned to
   * @param {string} scheduleData.assignedToType - Type of assigned person (admin, student)
   * @param {Date} scheduleData.startTime - Start time
   * @param {Date} scheduleData.endTime - End time
   * @param {string} scheduleData.location - Location (optional)
   * @param {Object} scheduleData.recurrencePattern - Recurrence pattern (optional)
   * @param {number} scheduleData.createdBy - ID of admin who created it
   * @returns {Promise<Object>} Created schedule
   */
  static async create(scheduleData) {
    try {
      const {
        scheduleType,
        title,
        description,
        assignedToId,
        assignedToType,
        startTime,
        endTime,
        location,
        recurrencePattern,
        createdBy
      } = scheduleData;

      const insertQuery = `
        INSERT INTO schedules (
          schedule_type, title, description, assigned_to_id, assigned_to_type,
          start_time, end_time, location, recurrence_pattern, status, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [
        scheduleType,
        title,
        description || null,
        assignedToId,
        assignedToType,
        startTime,
        endTime,
        location || null,
        recurrencePattern ? JSON.stringify(recurrencePattern) : null,
        createdBy,
        currentDateTime,
        currentDateTime
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create schedule: ${error.message}`);
    }
  }

  /**
   * Find schedule by ID
   * @param {number} id - Schedule ID
   * @returns {Promise<Object|null>} Schedule object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT s.*,
               CASE
                 WHEN s.assigned_to_type = 'admin' THEN
                   CONCAT(a.first_name, ' ', a.last_name)
                 WHEN s.assigned_to_type = 'student' THEN
                   CONCAT(st.first_name, ' ', st.last_name)
                 ELSE 'Unknown'
               END as assigned_to_name,
               CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name
        FROM schedules s
        LEFT JOIN admins a ON s.assigned_to_id = a.id AND s.assigned_to_type = 'admin'
        LEFT JOIN students st ON s.assigned_to_id = st.id AND s.assigned_to_type = 'student'
        LEFT JOIN admins creator ON s.created_by = creator.id
        WHERE s.id = ?
      `;

      const schedules = await database.query(query, [id]);

      if (schedules.length === 0) {
        return null;
      }

      const schedule = schedules[0];

      // Parse recurrence pattern if exists
      if (schedule.recurrence_pattern) {
        schedule.recurrence_pattern = JSON.parse(schedule.recurrence_pattern);
      }

      return schedule;
    } catch (error) {
      throw new Error(`Failed to find schedule by ID: ${error.message}`);
    }
  }

  /**
   * Get all schedules with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.scheduleType - Filter by schedule type
   * @param {number} options.assignedToId - Filter by assigned person ID
   * @param {string} options.assignedToType - Filter by assigned person type
   * @param {string} options.status - Filter by status
   * @param {string} options.dateRangeStart - Filter by date range start
   * @param {string} options.dateRangeEnd - Filter by date range end
   * @returns {Promise<Object>} Schedules with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        scheduleType,
        assignedToId,
        assignedToType,
        status,
        dateRangeStart,
        dateRangeEnd
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (scheduleType) {
        conditions.push('s.schedule_type = ?');
        parameters.push(scheduleType);
      }

      if (assignedToId) {
        conditions.push('s.assigned_to_id = ?');
        parameters.push(assignedToId);
      }

      if (assignedToType) {
        conditions.push('s.assigned_to_type = ?');
        parameters.push(assignedToType);
      }

      if (status) {
        conditions.push('s.status = ?');
        parameters.push(status);
      }

      if (dateRangeStart) {
        conditions.push('(s.start_time >= ? OR s.end_time >= ?)');
        parameters.push(dateRangeStart, dateRangeStart);
      }

      if (dateRangeEnd) {
        conditions.push('(s.start_time <= ? OR s.end_time <= ?)');
        parameters.push(dateRangeEnd, dateRangeEnd);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM schedules s
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get schedules
      const schedulesQuery = `
        SELECT s.*,
               CASE
                 WHEN s.assigned_to_type = 'admin' THEN
                   CONCAT(a.first_name, ' ', a.last_name)
                 WHEN s.assigned_to_type = 'student' THEN
                   CONCAT(st.first_name, ' ', st.last_name)
                 ELSE 'Unknown'
               END as assigned_to_name,
               CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name
        FROM schedules s
        LEFT JOIN admins a ON s.assigned_to_id = a.id AND s.assigned_to_type = 'admin'
        LEFT JOIN students st ON s.assigned_to_id = st.id AND s.assigned_to_type = 'student'
        LEFT JOIN admins creator ON s.created_by = creator.id
        ${whereClause}
        ORDER BY s.start_time ASC
        LIMIT ? OFFSET ?
      `;

      const schedules = await database.query(schedulesQuery, [...parameters, limit, offset]);

      // Parse recurrence patterns
      schedules.forEach(schedule => {
        if (schedule.recurrence_pattern) {
          schedule.recurrence_pattern = JSON.parse(schedule.recurrence_pattern);
        }
      });

      return {
        schedules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find schedules: ${error.message}`);
    }
  }

  /**
   * Get schedules for a specific person
   * @param {number} personId - Person ID
   * @param {string} personType - Person type (admin, student)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Schedules with pagination info
   */
  static async findByPerson(personId, personType, options = {}) {
    return this.findAll({ ...options, assignedToId: personId, assignedToType: personType });
  }

  /**
   * Update schedule
   * @param {number} id - Schedule ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated schedule or null
   */
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'title', 'description', 'assigned_to_id', 'assigned_to_type',
        'start_time', 'end_time', 'location', 'recurrence_pattern', 'status'
      ];
      const updates = [];
      const parameters = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updates.push(`${key} = ?`);
          if (key === 'recurrence_pattern') {
            parameters.push(JSON.stringify(updateData[key]));
          } else {
            parameters.push(updateData[key]);
          }
        }
      });

      if (updates.length === 0) {
        return await this.findById(id);
      }

      updates.push('updated_at = ?');
      parameters.push(getCurrentDateTime());
      parameters.push(id);

      const updateQuery = `
        UPDATE schedules
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      const result = await database.query(updateQuery, parameters);

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update schedule: ${error.message}`);
    }
  }

  /**
   * Delete schedule
   * @param {number} id - Schedule ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const deleteQuery = 'DELETE FROM schedules WHERE id = ?';
      const result = await database.query(deleteQuery, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete schedule: ${error.message}`);
    }
  }

  /**
   * Get schedules for a specific date range
   * @param {string} dateStart - Start date (YYYY-MM-DD)
   * @param {string} dateEnd - End date (YYYY-MM-DD)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of schedules
   */
  static async findByDateRange(dateStart, dateEnd, filters = {}) {
    try {
      const conditions = [
        '(DATE(start_time) <= ? AND DATE(end_time) >= ?)'
      ];
      const parameters = [dateEnd, dateStart];

      if (filters.scheduleType) {
        conditions.push('schedule_type = ?');
        parameters.push(filters.scheduleType);
      }

      if (filters.assignedToId) {
        conditions.push('assigned_to_id = ?');
        parameters.push(filters.assignedToId);
      }

      if (filters.assignedToType) {
        conditions.push('assigned_to_type = ?');
        parameters.push(filters.assignedToType);
      }

      if (filters.status) {
        conditions.push('status = ?');
        parameters.push(filters.status);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const query = `
        SELECT s.*,
               CASE
                 WHEN s.assigned_to_type = 'admin' THEN
                   CONCAT(a.first_name, ' ', a.last_name)
                 WHEN s.assigned_to_type = 'student' THEN
                   CONCAT(st.first_name, ' ', st.last_name)
                 ELSE 'Unknown'
               END as assigned_to_name
        FROM schedules s
        LEFT JOIN admins a ON s.assigned_to_id = a.id AND s.assigned_to_type = 'admin'
        LEFT JOIN students st ON s.assigned_to_id = st.id AND s.assigned_to_type = 'student'
        ${whereClause}
        ORDER BY s.start_time ASC
      `;

      const schedules = await database.query(query, parameters);

      // Parse recurrence patterns
      schedules.forEach(schedule => {
        if (schedule.recurrence_pattern) {
          schedule.recurrence_pattern = JSON.parse(schedule.recurrence_pattern);
        }
      });

      return schedules;
    } catch (error) {
      throw new Error(`Failed to find schedules by date range: ${error.message}`);
    }
  }

  /**
   * Check for schedule conflicts
   * @param {number} personId - Person ID
   * @param {string} personType - Person type
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @param {number} excludeId - Exclude schedule ID (for updates)
   * @returns {Promise<Array>} Array of conflicting schedules
   */
  static async checkConflicts(personId, personType, startTime, endTime, excludeId = null) {
    try {
      let query = `
        SELECT id, title, start_time, end_time
        FROM schedules
        WHERE assigned_to_id = ? AND assigned_to_type = ?
        AND status = 'active'
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `;

      const parameters = [
        personId, personType,
        endTime, startTime,
        endTime, startTime,
        startTime, endTime
      ];

      if (excludeId) {
        query += ' AND id != ?';
        parameters.push(excludeId);
      }

      const conflicts = await database.query(query, parameters);

      return conflicts;
    } catch (error) {
      throw new Error(`Failed to check schedule conflicts: ${error.message}`);
    }
  }

  /**
   * Get today's schedules for a person
   * @param {number} personId - Person ID
   * @param {string} personType - Person type
   * @returns {Promise<Array>} Array of today's schedules
   */
  static async getTodaySchedules(personId, personType) {
    try {
      const today = getCurrentDateTime().split(' ')[0];

      const query = `
        SELECT s.*,
               CASE
                 WHEN s.assigned_to_type = 'admin' THEN
                   CONCAT(a.first_name, ' ', a.last_name)
                 WHEN s.assigned_to_type = 'student' THEN
                   CONCAT(st.first_name, ' ', st.last_name)
                 ELSE 'Unknown'
               END as assigned_to_name
        FROM schedules s
        LEFT JOIN admins a ON s.assigned_to_id = a.id AND s.assigned_to_type = 'admin'
        LEFT JOIN students st ON s.assigned_to_id = st.id AND s.assigned_to_type = 'student'
        WHERE s.assigned_to_id = ? AND s.assigned_to_type = ?
        AND DATE(s.start_time) = ? AND s.status = 'active'
        ORDER BY s.start_time ASC
      `;

      const schedules = await database.query(query, [personId, personType, today]);

      // Parse recurrence patterns
      schedules.forEach(schedule => {
        if (schedule.recurrence_pattern) {
          schedule.recurrence_pattern = JSON.parse(schedule.recurrence_pattern);
        }
      });

      return schedules;
    } catch (error) {
      throw new Error(`Failed to get today's schedules: ${error.message}`);
    }
  }

  /**
   * Get upcoming schedules for a person
   * @param {number} personId - Person ID
   * @param {string} personType - Person type
   * @param {number} days - Number of days ahead
   * @returns {Promise<Array>} Array of upcoming schedules
   */
  static async getUpcomingSchedules(personId, personType, days = 7) {
    try {
      const query = `
        SELECT s.*,
               CASE
                 WHEN s.assigned_to_type = 'admin' THEN
                   CONCAT(a.first_name, ' ', a.last_name)
                 WHEN s.assigned_to_type = 'student' THEN
                   CONCAT(st.first_name, ' ', st.last_name)
                 ELSE 'Unknown'
               END as assigned_to_name
        FROM schedules s
        LEFT JOIN admins a ON s.assigned_to_id = a.id AND s.assigned_to_type = 'admin'
        LEFT JOIN students st ON s.assigned_to_id = st.id AND s.assigned_to_type = 'student'
        WHERE s.assigned_to_id = ? AND s.assigned_to_type = ?
        AND s.start_time > NOW() AND s.start_time <= DATE_ADD(NOW(), INTERVAL ? DAY)
        AND s.status = 'active'
        ORDER BY s.start_time ASC
      `;

      const schedules = await database.query(query, [personId, personType, days]);

      // Parse recurrence patterns
      schedules.forEach(schedule => {
        if (schedule.recurrence_pattern) {
          schedule.recurrence_pattern = JSON.parse(schedule.recurrence_pattern);
        }
      });

      return schedules;
    } catch (error) {
      throw new Error(`Failed to get upcoming schedules: ${error.message}`);
    }
  }

  /**
   * Get schedule statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Schedule statistics
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
        total: `SELECT COUNT(*) as count FROM schedules WHERE 1=1 ${dateFilter}`,
        byType: `
          SELECT schedule_type, COUNT(*) as count
          FROM schedules
          WHERE 1=1 ${dateFilter}
          GROUP BY schedule_type
        `,
        byStatus: `
          SELECT status, COUNT(*) as count
          FROM schedules
          WHERE 1=1 ${dateFilter}
          GROUP BY status
        `,
        active: `SELECT COUNT(*) as count FROM schedules WHERE status = 'active' ${dateFilter}`,
        today: `
          SELECT COUNT(*) as count
          FROM schedules
          WHERE DATE(start_time) = CURDATE() AND status = 'active'
        `,
        thisWeek: `
          SELECT COUNT(*) as count
          FROM schedules
          WHERE WEEK(start_time) = WEEK(NOW()) AND YEAR(start_time) = YEAR(NOW()) AND status = 'active'
        `,
        upcoming: `
          SELECT COUNT(*) as count
          FROM schedules
          WHERE start_time > NOW() AND status = 'active'
        `
      };

      const [
        totalResult,
        typeResult,
        statusResult,
        activeResult,
        todayResult,
        thisWeekResult,
        upcomingResult
      ] = await Promise.all([
        database.query(queries.total, parameters),
        database.query(queries.byType, parameters),
        database.query(queries.byStatus, parameters),
        database.query(queries.active, parameters),
        database.query(queries.today),
        database.query(queries.thisWeek),
        database.query(queries.upcoming)
      ]);

      return {
        total: totalResult[0].count,
        byType: typeResult,
        byStatus: statusResult,
        active: activeResult[0].count,
        today: todayResult[0].count,
        thisWeek: thisWeekResult[0].count,
        upcoming: upcomingResult[0].count
      };
    } catch (error) {
      throw new Error(`Failed to get schedule statistics: ${error.message}`);
    }
  }
}

module.exports = Schedule;