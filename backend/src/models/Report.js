const database = require('../config/database');
const { getCurrentDateTime } = require('../utils/dateUtils');

class Report {
  /**
   * Create a new report
   * @param {Object} reportData - Report data
   * @param {string} reportData.reportType - Report type
   * @param {string} reportData.title - Report title
   * @param {string} reportData.description - Report description (optional)
   * @param {number} reportData.generatedBy - Admin ID who generated the report
   * @param {Object} reportData.data - Report data structure
   * @param {Object} reportData.filters - Applied filters (optional)
   * @param {string} reportData.dateRangeStart - Date range start (optional)
   * @param {string} reportData.dateRangeEnd - Date range end (optional)
   * @returns {Promise<Object>} Created report
   */
  static async create(reportData) {
    try {
      const {
        reportType,
        title,
        description,
        generatedBy,
        data,
        filters,
        dateRangeStart,
        dateRangeEnd
      } = reportData;

      const insertQuery = `
        INSERT INTO reports (
          report_type, title, description, generated_by, data, filters,
          date_range_start, date_range_end, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [
        reportType,
        title,
        description || null,
        generatedBy,
        JSON.stringify(data),
        filters ? JSON.stringify(filters) : null,
        dateRangeStart || null,
        dateRangeEnd || null,
        currentDateTime
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  /**
   * Find report by ID
   * @param {number} id - Report ID
   * @returns {Promise<Object|null>} Report object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT r.*,
               CONCAT(a.first_name, ' ', a.last_name) as generated_by_name
        FROM reports r
        JOIN admins a ON r.generated_by = a.id
        WHERE r.id = ?
      `;

      const reports = await database.query(query, [id]);

      if (reports.length === 0) {
        return null;
      }

      const report = reports[0];

      // Parse JSON fields
      if (report.data) {
        report.data = JSON.parse(report.data);
      }

      if (report.filters) {
        report.filters = JSON.parse(report.filters);
      }

      return report;
    } catch (error) {
      throw new Error(`Failed to find report by ID: ${error.message}`);
    }
  }

  /**
   * Get all reports with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.reportType - Filter by report type
   * @param {number} options.generatedBy - Filter by generator
   * @param {string} options.dateRangeStart - Filter by creation date start
   * @param {string} options.dateRangeEnd - Filter by creation date end
   * @returns {Promise<Object>} Reports with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        reportType,
        generatedBy,
        dateRangeStart,
        dateRangeEnd
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (reportType) {
        conditions.push('r.report_type = ?');
        parameters.push(reportType);
      }

      if (generatedBy) {
        conditions.push('r.generated_by = ?');
        parameters.push(generatedBy);
      }

      if (dateRangeStart) {
        conditions.push('r.created_at >= ?');
        parameters.push(dateRangeStart);
      }

      if (dateRangeEnd) {
        conditions.push('r.created_at <= ?');
        parameters.push(dateRangeEnd);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM reports r
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get reports
      const reportsQuery = `
        SELECT r.id, r.report_type, r.title, r.description, r.date_range_start, r.date_range_end,
               r.created_at, r.file_path,
               CONCAT(a.first_name, ' ', a.last_name) as generated_by_name
        FROM reports r
        JOIN admins a ON r.generated_by = a.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const reports = await database.query(reportsQuery, [...parameters, limit, offset]);

      return {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find reports: ${error.message}`);
    }
  }

  /**
   * Delete report
   * @param {number} id - Report ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const deleteQuery = 'DELETE FROM reports WHERE id = ?';
      const result = await database.query(deleteQuery, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }

  /**
   * Generate attendance report
   * @param {Object} filters - Report filters
   * @param {number} filters.gradeLevel - Filter by grade level (optional)
   * @param {string} filters.dateRangeStart - Date range start
   * @param {string} filters.dateRangeEnd - Date range end
   * @returns {Promise<Object>} Generated report data
   */
  static async generateAttendanceReport(filters) {
    try {
      const { gradeLevel, dateRangeStart, dateRangeEnd } = filters;

      let whereClause = 'WHERE u.is_active = 1';
      const parameters = [];

      if (gradeLevel) {
        whereClause += ' AND s.grade_level = ?';
        parameters.push(gradeLevel);
      }

      // Get total students
      const totalStudentsQuery = `
        SELECT COUNT(*) as count
        FROM students s
        JOIN users u ON s.user_id = u.id
        ${whereClause}
      `;

      const totalStudentsResult = await database.query(totalStudentsQuery, parameters);
      const totalStudents = totalStudentsResult[0].count;

      // Get leave statistics
      let leaveWhereClause = 'WHERE lr.status IN ("approved", "rejected")';
      const leaveParameters = [];

      if (dateRangeStart) {
        leaveWhereClause += ' AND lr.start_date >= ?';
        leaveParameters.push(dateRangeStart);
      }

      if (dateRangeEnd) {
        leaveWhereClause += ' AND lr.end_date <= ?';
        leaveParameters.push(dateRangeEnd);
      }

      if (gradeLevel) {
        leaveWhereClause += ' AND s.grade_level = ?';
        leaveParameters.push(gradeLevel);
      }

      const leaveStatsQuery = `
        SELECT
          COUNT(*) as total_leaves,
          SUM(CASE WHEN lr.status = 'approved' THEN 1 ELSE 0 END) as approved_leaves,
          SUM(CASE WHEN lr.status = 'rejected' THEN 1 ELSE 0 END) as rejected_leaves,
          SUM(CASE WHEN lr.status = 'approved' THEN DATEDIFF(lr.end_date, lr.start_date) + 1 ELSE 0 END) as total_absent_days
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.id
        ${leaveWhereClause}
      `;

      const leaveStatsResult = await database.query(leaveStatsQuery, leaveParameters);

      // Get leaves by type
      const leavesByTypeQuery = `
        SELECT lr.leave_type, COUNT(*) as count
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.id
        ${leaveWhereClause} AND lr.status = 'approved'
        GROUP BY lr.leave_type
      `;

      const leavesByTypeResult = await database.query(leavesByTypeQuery, leaveParameters);

      // Get top absent students
      const topAbsentQuery = `
        SELECT
          s.student_id, s.first_name, s.last_name,
          COUNT(lr.id) as leave_count,
          SUM(CASE WHEN lr.status = 'approved' THEN DATEDIFF(lr.end_date, lr.start_date) + 1 ELSE 0 END) as total_days
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.id
        ${leaveWhereClause} AND lr.status = 'approved'
        GROUP BY s.id
        ORDER BY total_days DESC
        LIMIT 10
      `;

      const topAbsentResult = await database.query(topAbsentQuery, leaveParameters);

      const data = {
        summary: {
          totalStudents,
          totalLeaves: leaveStatsResult[0].total_leaves || 0,
          approvedLeaves: leaveStatsResult[0].approved_leaves || 0,
          rejectedLeaves: leaveStatsResult[0].rejected_leaves || 0,
          totalAbsentDays: leaveStatsResult[0].total_absent_days || 0,
          attendanceRate: totalStudents > 0 ?
            ((totalStudents * 100 - (leaveStatsResult[0].total_absent_days || 0)) / (totalStudents * 100)) * 100 : 100
        },
        leavesByType: leavesByTypeResult,
        topAbsentStudents: topAbsentResult,
        generatedAt: getCurrentDateTime()
      };

      return data;
    } catch (error) {
      throw new Error(`Failed to generate attendance report: ${error.message}`);
    }
  }

  /**
   * Generate leave summary report
   * @param {Object} filters - Report filters
   * @param {string} filters.dateRangeStart - Date range start
   * @param {string} filters.dateRangeEnd - Date range end
   * @returns {Promise<Object>} Generated report data
   */
  static async generateLeaveSummaryReport(filters) {
    try {
      const { dateRangeStart, dateRangeEnd } = filters;

      let whereClause = 'WHERE 1=1';
      const parameters = [];

      if (dateRangeStart) {
        whereClause += ' AND lr.start_date >= ?';
        parameters.push(dateRangeStart);
      }

      if (dateRangeEnd) {
        whereClause += ' AND lr.end_date <= ?';
        parameters.push(dateRangeEnd);
      }

      // Get leave statistics by status
      const statusStatsQuery = `
        SELECT status, COUNT(*) as count
        FROM leave_requests lr
        ${whereClause}
        GROUP BY status
      `;

      const statusStatsResult = await database.query(statusStatsQuery, parameters);

      // Get leave statistics by type
      const typeStatsQuery = `
        SELECT lr.leave_type,
               COUNT(*) as total_requests,
               SUM(CASE WHEN lr.status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
               SUM(CASE WHEN lr.status = 'approved' THEN DATEDIFF(lr.end_date, lr.start_date) + 1 ELSE 0 END) as total_days
        FROM leave_requests lr
        ${whereClause}
        GROUP BY lr.leave_type
      `;

      const typeStatsResult = await database.query(typeStatsQuery, parameters);

      // Get monthly trends
      const monthlyTrendsQuery = `
        SELECT
          DATE_FORMAT(lr.created_at, '%Y-%m') as month,
          COUNT(*) as total_requests,
          SUM(CASE WHEN lr.status = 'approved' THEN 1 ELSE 0 END) as approved_requests
        FROM leave_requests lr
        ${whereClause}
        GROUP BY DATE_FORMAT(lr.created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `;

      const monthlyTrendsResult = await database.query(monthlyTrendsQuery, parameters);

      // Get approval rate
      const approvalQuery = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          AVG(CASE WHEN approved_by IS NOT NULL
            THEN TIMESTAMPDIFF(HOUR, lr.created_at, lr.approval_date)
            ELSE NULL END) as avg_approval_hours
        FROM leave_requests lr
        ${whereClause}
      `;

      const approvalResult = await database.query(approvalQuery, parameters);

      const data = {
        summary: {
          totalRequests: approvalResult[0].total || 0,
          approvedRequests: approvalResult[0].approved || 0,
          rejectedRequests: (approvalResult[0].total || 0) - (approvalResult[0].approved || 0),
          approvalRate: approvalResult[0].total > 0 ?
            ((approvalResult[0].approved || 0) / approvalResult[0].total) * 100 : 0,
          avgApprovalHours: approvalResult[0].avg_approval_hours || 0
        },
        statusStats: statusStatsResult,
        typeStats: typeStatsResult,
        monthlyTrends: monthlyTrendsResult,
        generatedAt: getCurrentDateTime()
      };

      return data;
    } catch (error) {
      throw new Error(`Failed to generate leave summary report: ${error.message}`);
    }
  }

  /**
   * Generate schedule conflicts report
   * @param {Object} filters - Report filters
   * @param {string} filters.dateRangeStart - Date range start
   * @param {string} filters.dateRangeEnd - Date range end
   * @returns {Promise<Object>} Generated report data
   */
  static async generateScheduleConflictsReport(filters) {
    try {
      const { dateRangeStart, dateRangeEnd } = filters;

      let dateFilter = '';
      const parameters = [];

      if (dateRangeStart) {
        dateFilter += ' AND s.start_time >= ?';
        parameters.push(dateRangeStart);
      }

      if (dateRangeEnd) {
        dateFilter += ' AND s.end_time <= ?';
        parameters.push(dateRangeEnd);
      }

      // Find potential conflicts (schedules for the same person overlapping)
      const conflictsQuery = `
        SELECT s1.id as schedule1_id, s1.title as title1, s1.start_time as start1, s1.end_time as end1,
               s2.id as schedule2_id, s2.title as title2, s2.start_time as start2, s2.end_time as end2,
               CASE
                 WHEN s1.assigned_to_type = 'admin' THEN CONCAT(a1.first_name, ' ', a1.last_name)
                 WHEN s1.assigned_to_type = 'student' THEN CONCAT(st1.first_name, ' ', st1.last_name)
               END as person_name
        FROM schedules s1
        JOIN schedules s2 ON s1.assigned_to_id = s2.assigned_to_id
                        AND s1.assigned_to_type = s2.assigned_to_type
                        AND s1.id < s2.id
        LEFT JOIN admins a1 ON s1.assigned_to_id = a1.id AND s1.assigned_to_type = 'admin'
        LEFT JOIN students st1 ON s1.assigned_to_id = st1.id AND s1.assigned_to_type = 'student'
        WHERE s1.status = 'active' AND s2.status = 'active'
        AND (
          (s1.start_time < s2.end_time AND s1.end_time > s2.start_time)
        )
        ${dateFilter}
        ORDER BY s1.start_time
      `;

      const conflictsResult = await database.query(conflictsQuery, parameters);

      // Get schedule statistics
      const statsQuery = `
        SELECT
          COUNT(*) as total_schedules,
          SUM(CASE WHEN schedule_type = 'class' THEN 1 ELSE 0 END) as class_schedules,
          SUM(CASE WHEN schedule_type = 'shift' THEN 1 ELSE 0 END) as shift_schedules,
          COUNT(DISTINCT assigned_to_id) as unique_people
        FROM schedules
        WHERE status = 'active' ${dateFilter}
      `;

      const statsResult = await database.query(statsQuery, parameters);

      // Get schedules by person (find people with too many schedules)
      const schedulesByPersonQuery = `
        SELECT
          s.assigned_to_id, s.assigned_to_type,
          CASE
            WHEN s.assigned_to_type = 'admin' THEN CONCAT(a.first_name, ' ', a.last_name)
            WHEN s.assigned_to_type = 'student' THEN CONCAT(st.first_name, ' ', st.last_name)
          END as person_name,
          COUNT(*) as schedule_count
        FROM schedules s
        LEFT JOIN admins a ON s.assigned_to_id = a.id AND s.assigned_to_type = 'admin'
        LEFT JOIN students st ON s.assigned_to_id = st.id AND s.assigned_to_type = 'student'
        WHERE s.status = 'active' ${dateFilter}
        GROUP BY s.assigned_to_id, s.assigned_to_type
        HAVING schedule_count > 1
        ORDER BY schedule_count DESC
      `;

      const schedulesByPersonResult = await database.query(schedulesByPersonQuery, parameters);

      const data = {
        summary: {
          totalSchedules: statsResult[0].total_schedules || 0,
          classSchedules: statsResult[0].class_schedules || 0,
          shiftSchedules: statsResult[0].shift_schedules || 0,
          uniquePeople: statsResult[0].unique_people || 0,
          totalConflicts: conflictsResult.length
        },
        conflicts: conflictsResult,
        schedulesByPerson: schedulesByPersonResult,
        generatedAt: getCurrentDateTime()
      };

      return data;
    } catch (error) {
      throw new Error(`Failed to generate schedule conflicts report: ${error.message}`);
    }
  }

  /**
   * Generate student performance report
   * @param {Object} filters - Report filters
   * @param {number} filters.gradeLevel - Filter by grade level (optional)
   * @param {string} filters.classSection - Filter by class section (optional)
   * @returns {Promise<Object>} Generated report data
   */
  static async generateStudentPerformanceReport(filters) {
    try {
      const { gradeLevel, classSection } = filters;

      let whereClause = 'WHERE u.is_active = 1';
      const parameters = [];

      if (gradeLevel) {
        whereClause += ' AND s.grade_level = ?';
        parameters.push(gradeLevel);
      }

      if (classSection) {
        whereClause += ' AND s.class_section = ?';
        parameters.push(classSection);
      }

      // Get student statistics
      const statsQuery = `
        SELECT
          COUNT(*) as total_students,
          AVG(DATEDIFF(CURDATE(), s.date_of_birth) / 365) as avg_age,
          COUNT(CASE WHEN s.phone IS NOT NULL THEN 1 END) as students_with_phone,
          COUNT(CASE WHEN s.parent_contact IS NOT NULL THEN 1 END) as students_with_parent_contact
        FROM students s
        JOIN users u ON s.user_id = u.id
        ${whereClause}
      `;

      const statsResult = await database.query(statsQuery, parameters);

      // Get students by grade level
      const gradeDistributionQuery = `
        SELECT grade_level, COUNT(*) as count
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.is_active = 1
        GROUP BY grade_level
        ORDER BY grade_level
      `;

      const gradeDistributionResult = await database.query(gradeDistributionQuery);

      // Get class sections distribution
      const sectionDistributionQuery = `
        SELECT class_section, COUNT(*) as count
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.is_active = 1 AND class_section IS NOT NULL
        GROUP BY class_section
        ORDER BY count DESC
      `;

      const sectionDistributionResult = await database.query(sectionDistributionQuery);

      // Get recent enrollment trends
      const enrollmentTrendsQuery = `
        SELECT
          DATE_FORMAT(enrollment_date, '%Y-%m') as month,
          COUNT(*) as enrollments
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.is_active = 1 AND enrollment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(enrollment_date, '%Y-%m')
        ORDER BY month DESC
      `;

      const enrollmentTrendsResult = await database.query(enrollmentTrendsQuery);

      const data = {
        summary: statsResult[0],
        gradeDistribution: gradeDistributionResult,
        sectionDistribution: sectionDistributionResult,
        enrollmentTrends: enrollmentTrendsResult,
        generatedAt: getCurrentDateTime()
      };

      return data;
    } catch (error) {
      throw new Error(`Failed to generate student performance report: ${error.message}`);
    }
  }

  /**
   * Get report statistics
   * @returns {Promise<Object>} Report statistics
   */
  static async getStatistics() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM reports',
        byType: `
          SELECT report_type, COUNT(*) as count
          FROM reports
          GROUP BY report_type
        `,
        thisWeek: `
          SELECT COUNT(*) as count
          FROM reports
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `,
        thisMonth: `
          SELECT COUNT(*) as count
          FROM reports
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `,
        recent: `
          SELECT title, report_type, created_at
          FROM reports
          ORDER BY created_at DESC
          LIMIT 5
        `
      };

      const [
        totalResult,
        typeResult,
        thisWeekResult,
        thisMonthResult,
        recentResult
      ] = await Promise.all([
        database.query(queries.total),
        database.query(queries.byType),
        database.query(queries.thisWeek),
        database.query(queries.thisMonth),
        database.query(queries.recent)
      ]);

      return {
        total: totalResult[0].count,
        byType: typeResult,
        thisWeek: thisWeekResult[0].count,
        thisMonth: thisMonthResult[0].count,
        recent: recentResult
      };
    } catch (error) {
      throw new Error(`Failed to get report statistics: ${error.message}`);
    }
  }
}

module.exports = Report;