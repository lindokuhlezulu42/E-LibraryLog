const database = require('../config/database');
const { getCurrentDateTime } = require('../utils/dateUtils');

class Disruption {
  /**
   * Create a new disruption log
   * @param {Object} disruptionData - Disruption data
   * @param {string} disruptionData.disruptionType - Disruption type
   * @param {string} disruptionData.title - Disruption title
   * @param {string} disruptionData.description - Disruption description
   * @param {string} disruptionData.severity - Severity level (low, medium, high, critical)
   * @param {Array} disruptionData.affectedSchedules - Array of affected schedule IDs (optional)
   * @param {Date} disruptionData.startTime - Start time
   * @param {Date} disruptionData.endTime - End time (optional)
   * @param {number} disruptionData.reportedBy - Admin ID who reported it
   * @returns {Promise<Object>} Created disruption
   */
  static async create(disruptionData) {
    try {
      const {
        disruptionType,
        title,
        description,
        severity,
        affectedSchedules,
        startTime,
        endTime,
        reportedBy
      } = disruptionData;

      const insertQuery = `
        INSERT INTO disruptions (
          disruption_type, title, description, severity, affected_schedules,
          start_time, end_time, status, reported_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [
        disruptionType,
        title,
        description,
        severity,
        affectedSchedules ? JSON.stringify(affectedSchedules) : null,
        startTime,
        endTime || null,
        reportedBy,
        currentDateTime,
        currentDateTime
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create disruption: ${error.message}`);
    }
  }

  /**
   * Find disruption by ID
   * @param {number} id - Disruption ID
   * @returns {Promise<Object|null>} Disruption object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT d.*,
               CONCAT(a.first_name, ' ', a.last_name) as reported_by_name
        FROM disruptions d
        JOIN admins a ON d.reported_by = a.id
        WHERE d.id = ?
      `;

      const disruptions = await database.query(query, [id]);

      if (disruptions.length === 0) {
        return null;
      }

      const disruption = disruptions[0];

      // Parse affected schedules if exists
      if (disruption.affected_schedules) {
        disruption.affected_schedules = JSON.parse(disruption.affected_schedules);
      }

      // Calculate duration if end_time exists
      if (disruption.end_time) {
        disruption.duration_minutes = Math.round(
          (new Date(disruption.end_time) - new Date(disruption.start_time)) / (1000 * 60)
        );
      }

      return disruption;
    } catch (error) {
      throw new Error(`Failed to find disruption by ID: ${error.message}`);
    }
  }

  /**
   * Get all disruptions with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.disruptionType - Filter by disruption type
   * @param {string} options.severity - Filter by severity
   * @param {string} options.status - Filter by status
   * @param {number} options.reportedBy - Filter by reporter
   * @param {string} options.dateRangeStart - Filter by date range start
   * @param {string} options.dateRangeEnd - Filter by date range end
   * @returns {Promise<Object>} Disruptions with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        disruptionType,
        severity,
        status,
        reportedBy,
        dateRangeStart,
        dateRangeEnd
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (disruptionType) {
        conditions.push('d.disruption_type = ?');
        parameters.push(disruptionType);
      }

      if (severity) {
        conditions.push('d.severity = ?');
        parameters.push(severity);
      }

      if (status) {
        conditions.push('d.status = ?');
        parameters.push(status);
      }

      if (reportedBy) {
        conditions.push('d.reported_by = ?');
        parameters.push(reportedBy);
      }

      if (dateRangeStart) {
        conditions.push('d.start_time >= ?');
        parameters.push(dateRangeStart);
      }

      if (dateRangeEnd) {
        conditions.push('d.start_time <= ?');
        parameters.push(dateRangeEnd);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM disruptions d
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get disruptions
      const disruptionsQuery = `
        SELECT d.*,
               CONCAT(a.first_name, ' ', a.last_name) as reported_by_name
        FROM disruptions d
        JOIN admins a ON d.reported_by = a.id
        ${whereClause}
        ORDER BY d.start_time DESC
        LIMIT ? OFFSET ?
      `;

      const disruptions = await database.query(disruptionsQuery, [...parameters, limit, offset]);

      // Parse affected schedules and calculate duration
      disruptions.forEach(disruption => {
        if (disruption.affected_schedules) {
          disruption.affected_schedules = JSON.parse(disruption.affected_schedules);
        }

        if (disruption.end_time) {
          disruption.duration_minutes = Math.round(
            (new Date(disruption.end_time) - new Date(disruption.start_time)) / (1000 * 60)
          );
        }
      });

      return {
        disruptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find disruptions: ${error.message}`);
    }
  }

  /**
   * Get active disruptions
   * @returns {Promise<Array>} Array of active disruptions
   */
  static async getActive() {
    try {
      const query = `
        SELECT d.*,
               CONCAT(a.first_name, ' ', a.last_name) as reported_by_name
        FROM disruptions d
        JOIN admins a ON d.reported_by = a.id
        WHERE d.status = 'active'
        ORDER BY d.severity DESC, d.start_time DESC
      `;

      const disruptions = await database.query(query);

      // Parse affected schedules and calculate duration
      disruptions.forEach(disruption => {
        if (disruption.affected_schedules) {
          disruption.affected_schedules = JSON.parse(disruption.affected_schedules);
        }

        if (disruption.end_time) {
          disruption.duration_minutes = Math.round(
            (new Date(disruption.end_time) - new Date(disruption.start_time)) / (1000 * 60)
          );
        }
      });

      return disruptions;
    } catch (error) {
      throw new Error(`Failed to get active disruptions: ${error.message}`);
    }
  }

  /**
   * Update disruption
   * @param {number} id - Disruption ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated disruption or null
   */
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'title', 'description', 'severity', 'affected_schedules', 'end_time', 'status'
      ];
      const updates = [];
      const parameters = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updates.push(`${key} = ?`);
          if (key === 'affected_schedules') {
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
        UPDATE disruptions
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      const result = await database.query(updateQuery, parameters);

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update disruption: ${error.message}`);
    }
  }

  /**
   * Resolve disruption
   * @param {number} id - Disruption ID
   * @param {string} resolutionNotes - Resolution notes
   * @returns {Promise<Object|null>} Updated disruption or null
   */
  static async resolve(id, resolutionNotes = null) {
    try {
      const currentDateTime = getCurrentDateTime();

      const updateQuery = `
        UPDATE disruptions
        SET status = 'resolved', end_time = ?, resolution_notes = ?, updated_at = ?
        WHERE id = ?
      `;

      const result = await database.query(updateQuery, [
        currentDateTime,
        resolutionNotes || null,
        currentDateTime,
        id
      ]);

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to resolve disruption: ${error.message}`);
    }
  }

  /**
   * Set disruption status to investigating
   * @param {number} id - Disruption ID
   * @returns {Promise<Object|null>} Updated disruption or null
   */
  static async setInvestigating(id) {
    return this.update(id, { status: 'investigating' });
  }

  /**
   * Delete disruption
   * @param {number} id - Disruption ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const deleteQuery = 'DELETE FROM disruptions WHERE id = ?';
      const result = await database.query(deleteQuery, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete disruption: ${error.message}`);
    }
  }

  /**
   * Get disruptions affecting a specific schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<Array>} Array of disruptions
   */
  static async findBySchedule(scheduleId) {
    try {
      const query = `
        SELECT d.*,
               CONCAT(a.first_name, ' ', a.last_name) as reported_by_name
        FROM disruptions d
        JOIN admins a ON d.reported_by = a.id
        WHERE d.affected_schedules IS NOT NULL
        AND JSON_CONTAINS(d.affected_schedules, ?)
        ORDER BY d.start_time DESC
      `;

      const disruptions = await database.query(query, JSON.stringify(scheduleId));

      // Parse affected schedules and calculate duration
      disruptions.forEach(disruption => {
        if (disruption.affected_schedules) {
          disruption.affected_schedules = JSON.parse(disruption.affected_schedules);
        }

        if (disruption.end_time) {
          disruption.duration_minutes = Math.round(
            (new Date(disruption.end_time) - new Date(disruption.start_time)) / (1000 * 60)
          );
        }
      });

      return disruptions;
    } catch (error) {
      throw new Error(`Failed to find disruptions by schedule: ${error.message}`);
    }
  }

  /**
   * Get disruptions by date range
   * @param {string} dateStart - Start date
   * @param {string} dateEnd - End date
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of disruptions
   */
  static async findByDateRange(dateStart, dateEnd, filters = {}) {
    try {
      const conditions = [
        'DATE(start_time) >= ? AND DATE(start_time) <= ?'
      ];
      const parameters = [dateStart, dateEnd];

      if (filters.disruptionType) {
        conditions.push('disruption_type = ?');
        parameters.push(filters.disruptionType);
      }

      if (filters.severity) {
        conditions.push('severity = ?');
        parameters.push(filters.severity);
      }

      if (filters.status) {
        conditions.push('status = ?');
        parameters.push(filters.status);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const query = `
        SELECT d.*,
               CONCAT(a.first_name, ' ', a.last_name) as reported_by_name
        FROM disruptions d
        JOIN admins a ON d.reported_by = a.id
        ${whereClause}
        ORDER BY d.start_time DESC
      `;

      const disruptions = await database.query(query, parameters);

      // Parse affected schedules and calculate duration
      disruptions.forEach(disruption => {
        if (disruption.affected_schedules) {
          disruption.affected_schedules = JSON.parse(disruption.affected_schedules);
        }

        if (disruption.end_time) {
          disruption.duration_minutes = Math.round(
            (new Date(disruption.end_time) - new Date(disruption.start_time)) / (1000 * 60)
          );
        }
      });

      return disruptions;
    } catch (error) {
      throw new Error(`Failed to find disruptions by date range: ${error.message}`);
    }
  }

  /**
   * Get disruption statistics
   * @param {Object} options - Query options
   * @param {string} options.dateRangeStart - Date range start
   * @param {string} options.dateRangeEnd - Date range end
   * @returns {Promise<Object>} Disruption statistics
   */
  static async getStatistics(options = {}) {
    try {
      const { dateRangeStart, dateRangeEnd } = options;

      let dateFilter = '';
      const parameters = [];

      if (dateRangeStart) {
        dateFilter += ' AND start_time >= ?';
        parameters.push(dateRangeStart);
      }

      if (dateRangeEnd) {
        dateFilter += ' AND start_time <= ?';
        parameters.push(dateRangeEnd);
      }

      const queries = {
        total: `SELECT COUNT(*) as count FROM disruptions WHERE 1=1 ${dateFilter}`,
        byType: `
          SELECT disruption_type, COUNT(*) as count
          FROM disruptions
          WHERE 1=1 ${dateFilter}
          GROUP BY disruption_type
        `,
        bySeverity: `
          SELECT severity, COUNT(*) as count
          FROM disruptions
          WHERE 1=1 ${dateFilter}
          GROUP BY severity
        `,
        byStatus: `
          SELECT status, COUNT(*) as count
          FROM disruptions
          WHERE 1=1 ${dateFilter}
          GROUP BY status
        `,
        active: `SELECT COUNT(*) as count FROM disruptions WHERE status = 'active' ${dateFilter}`,
        resolved: `SELECT COUNT(*) as count FROM disruptions WHERE status = 'resolved' ${dateFilter}`,
        avgDuration: `
          SELECT AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) as avg_duration
          FROM disruptions
          WHERE end_time IS NOT NULL ${dateFilter}
        `,
        today: `
          SELECT COUNT(*) as count
          FROM disruptions
          WHERE DATE(start_time) = CURDATE()
        `,
        thisWeek: `
          SELECT COUNT(*) as count
          FROM disruptions
          WHERE start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `,
        critical: `SELECT COUNT(*) as count FROM disruptions WHERE severity = 'critical' AND status = 'active'`
      };

      const [
        totalResult,
        typeResult,
        severityResult,
        statusResult,
        activeResult,
        resolvedResult,
        avgDurationResult,
        todayResult,
        thisWeekResult,
        criticalResult
      ] = await Promise.all([
        database.query(queries.total, parameters),
        database.query(queries.byType, parameters),
        database.query(queries.bySeverity, parameters),
        database.query(queries.byStatus, parameters),
        database.query(queries.active, parameters),
        database.query(queries.resolved, parameters),
        database.query(queries.avgDuration, parameters),
        database.query(queries.today),
        database.query(queries.thisWeek),
        database.query(queries.critical)
      ]);

      return {
        total: totalResult[0].count,
        byType: typeResult,
        bySeverity: severityResult,
        byStatus: statusResult,
        active: activeResult[0].count,
        resolved: resolvedResult[0].count,
        avgDurationMinutes: Math.round(avgDurationResult[0].avg_duration || 0),
        today: todayResult[0].count,
        thisWeek: thisWeekResult[0].count,
        criticalActive: criticalResult[0].count
      };
    } catch (error) {
      throw new Error(`Failed to get disruption statistics: ${error.message}`);
    }
  }

  /**
   * Get recent disruptions for dashboard
   * @param {number} limit - Number of recent disruptions to return
   * @returns {Promise<Array>} Array of recent disruptions
   */
  static async getRecent(limit = 10) {
    try {
      const query = `
        SELECT d.id, d.title, d.disruption_type, d.severity, d.status, d.start_time,
               CONCAT(a.first_name, ' ', a.last_name) as reported_by_name
        FROM disruptions d
        JOIN admins a ON d.reported_by = a.id
        ORDER BY d.start_time DESC
        LIMIT ?
      `;

      const disruptions = await database.query(query, [limit]);

      return disruptions;
    } catch (error) {
      throw new Error(`Failed to get recent disruptions: ${error.message}`);
    }
  }
}

module.exports = Disruption;