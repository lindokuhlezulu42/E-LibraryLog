const database = require('../config/database');
const { getCurrentDateTime } = require('../utils/dateUtils');

class Student {
  /**
   * Create a new student profile
   * @param {Object} studentData - Student data
   * @param {number} studentData.userId - User ID
   * @param {string} studentData.studentId - Student ID
   * @param {string} studentData.firstName - First name
   * @param {string} studentData.lastName - Last name
   * @param {Date} studentData.dateOfBirth - Date of birth (optional)
   * @param {number} studentData.gradeLevel - Grade level (optional)
   * @param {string} studentData.classSection - Class section (optional)
   * @param {string} studentData.phone - Phone number (optional)
   * @param {string} studentData.address - Address (optional)
   * @param {string} studentData.parentContact - Parent contact (optional)
   * @param {Date} studentData.enrollmentDate - Enrollment date (optional)
   * @returns {Promise<Object>} Created student profile
   */
  static async create(studentData) {
    try {
      const {
        userId,
        studentId,
        firstName,
        lastName,
        dateOfBirth,
        gradeLevel,
        classSection,
        phone,
        address,
        parentContact,
        enrollmentDate
      } = studentData;

      const insertQuery = `
        INSERT INTO students (
          user_id, student_id, first_name, last_name, date_of_birth, grade_level,
          class_section, phone, address, parent_contact, enrollment_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const currentDateTime = getCurrentDateTime();
      const result = await database.query(insertQuery, [
        userId,
        studentId,
        firstName,
        lastName,
        dateOfBirth || null,
        gradeLevel || null,
        classSection || null,
        phone || null,
        address || null,
        parentContact || null,
        enrollmentDate || currentDateTime.split(' ')[0], // Current date if not provided
        currentDateTime
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create student profile: ${error.message}`);
    }
  }

  /**
   * Find student by ID
   * @param {number} id - Student ID
   * @returns {Promise<Object|null>} Student object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT s.*, u.email, u.role, u.is_active, u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
      `;

      const students = await database.query(query, [id]);

      if (students.length === 0) {
        return null;
      }

      const student = students[0];

      // Construct full name
      student.full_name = `${student.first_name} ${student.last_name}`;

      return student;
    } catch (error) {
      throw new Error(`Failed to find student by ID: ${error.message}`);
    }
  }

  /**
   * Find student by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Student object or null
   */
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT s.*, u.email, u.role, u.is_active, u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
      `;

      const students = await database.query(query, [userId]);

      if (students.length === 0) {
        return null;
      }

      const student = students[0];

      // Construct full name
      student.full_name = `${student.first_name} ${student.last_name}`;

      return student;
    } catch (error) {
      throw new Error(`Failed to find student by user ID: ${error.message}`);
    }
  }

  /**
   * Find student by student ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object|null>} Student object or null
   */
  static async findByStudentId(studentId) {
    try {
      const query = `
        SELECT s.*, u.email, u.role, u.is_active, u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.student_id = ?
      `;

      const students = await database.query(query, [studentId]);

      if (students.length === 0) {
        return null;
      }

      const student = students[0];

      // Construct full name
      student.full_name = `${student.first_name} ${student.last_name}`;

      return student;
    } catch (error) {
      throw new Error(`Failed to find student by student ID: ${error.message}`);
    }
  }

  /**
   * Update student profile
   * @param {number} id - Student ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated student object or null
   */
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'student_id', 'first_name', 'last_name', 'date_of_birth', 'grade_level',
        'class_section', 'phone', 'address', 'parent_contact', 'enrollment_date'
      ];
      const updates = [];
      const parameters = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updates.push(`${key} = ?`);
          parameters.push(updateData[key]);
        }
      });

      if (updates.length === 0) {
        return await this.findById(id);
      }

      const updateQuery = `
        UPDATE students
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      parameters.push(id);
      await database.query(updateQuery, parameters);

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  /**
   * Get all students with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term
   * @param {number} options.gradeLevel - Filter by grade level
   * @param {string} options.classSection - Filter by class section
   * @param {boolean} options.isActive - Filter by active status
   * @returns {Promise<Object>} Students with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        gradeLevel,
        classSection,
        isActive
      } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const parameters = [];

      // Build WHERE clause
      if (search) {
        conditions.push('(s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ? OR u.email LIKE ?)');
        const searchParam = `%${search}%`;
        parameters.push(searchParam, searchParam, searchParam, searchParam);
      }

      if (gradeLevel) {
        conditions.push('s.grade_level = ?');
        parameters.push(gradeLevel);
      }

      if (classSection) {
        conditions.push('s.class_section = ?');
        parameters.push(classSection);
      }

      if (isActive !== undefined) {
        conditions.push('u.is_active = ?');
        parameters.push(isActive ? 1 : 0);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM students s
        JOIN users u ON s.user_id = u.id
        ${whereClause}
      `;

      const countResult = await database.query(countQuery, parameters);
      const total = countResult[0].total;

      // Get students
      const studentsQuery = `
        SELECT s.id, s.user_id, s.student_id, s.first_name, s.last_name, s.grade_level,
               s.class_section, s.phone, s.date_of_birth, s.enrollment_date, s.created_at,
               u.email, u.is_active,
               CONCAT(s.first_name, ' ', s.last_name) as full_name,
               TIMESTAMPDIFF(YEAR, s.date_of_birth, CURDATE()) as age
        FROM students s
        JOIN users u ON s.user_id = u.id
        ${whereClause}
        ORDER BY s.last_name, s.first_name
        LIMIT ? OFFSET ?
      `;

      const students = await database.query(studentsQuery, [...parameters, limit, offset]);

      return {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find students: ${error.message}`);
    }
  }

  /**
   * Delete student profile (and associated user)
   * @param {number} id - Student ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const student = await this.findById(id);

      if (!student) {
        return false;
      }

      // Use database transaction
      return await database.transaction(async (connection) => {
        // Delete student profile
        await connection.execute('DELETE FROM students WHERE id = ?', [id]);

        // Delete associated user
        await connection.execute('DELETE FROM users WHERE id = ?', [student.user_id]);

        return true;
      });
    } catch (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  /**
   * Create student with user account
   * @param {Object} studentData - Complete student data
   * @returns {Promise<Object>} Created student with user info
   */
  static async createWithUser(studentData) {
    try {
      return await database.transaction(async (connection) => {
        // Create user first
        const userInsertQuery = `
          INSERT INTO users (email, password_hash, role, is_active, created_at, updated_at)
          VALUES (?, ?, ?, 1, ?, ?)
        `;

        const { hashPassword } = require('../utils/passwordUtils');
        const hashedPassword = await hashPassword(studentData.password);
        const currentDateTime = getCurrentDateTime();

        const [userResult] = await connection.execute(userInsertQuery, [
          studentData.email,
          hashedPassword,
          'student',
          currentDateTime,
          currentDateTime
        ]);

        // Create student profile
        const studentInsertQuery = `
          INSERT INTO students (
            user_id, student_id, first_name, last_name, date_of_birth, grade_level,
            class_section, phone, address, parent_contact, enrollment_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [studentResult] = await connection.execute(studentInsertQuery, [
          userResult.insertId,
          studentData.studentId,
          studentData.firstName,
          studentData.lastName,
          studentData.dateOfBirth || null,
          studentData.gradeLevel || null,
          studentData.classSection || null,
          studentData.phone || null,
          studentData.address || null,
          studentData.parentContact || null,
          studentData.enrollmentDate || currentDateTime.split(' ')[0],
          currentDateTime
        ]);

        // Return created student with user info
        return await this.findById(studentResult.insertId);
      });
    } catch (error) {
      throw new Error(`Failed to create student with user: ${error.message}`);
    }
  }

  /**
   * Check if student ID already exists
   * @param {string} studentId - Student ID to check
   * @param {number} excludeId - Exclude student ID (for updates)
   * @returns {Promise<boolean>} True if student ID exists
   */
  static async studentIdExists(studentId, excludeId = null) {
    try {
      let query = 'SELECT id FROM students WHERE student_id = ?';
      const parameters = [studentId];

      if (excludeId) {
        query += ' AND id != ?';
        parameters.push(excludeId);
      }

      const result = await database.query(query, parameters);

      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to check student ID existence: ${error.message}`);
    }
  }

  /**
   * Get all grade levels
   * @returns {Promise<Array>} Array of unique grade levels
   */
  static async getGradeLevels() {
    try {
      const query = `
        SELECT DISTINCT grade_level
        FROM students
        WHERE grade_level IS NOT NULL
        ORDER BY grade_level
      `;

      const result = await database.query(query);

      return result.map(row => row.grade_level);
    } catch (error) {
      throw new Error(`Failed to get grade levels: ${error.message}`);
    }
  }

  /**
   * Get all class sections
   * @returns {Promise<Array>} Array of unique class sections
   */
  static async getClassSections() {
    try {
      const query = `
        SELECT DISTINCT class_section
        FROM students
        WHERE class_section IS NOT NULL AND class_section != ''
        ORDER BY class_section
      `;

      const result = await database.query(query);

      return result.map(row => row.class_section);
    } catch (error) {
      throw new Error(`Failed to get class sections: ${error.message}`);
    }
  }

  /**
   * Get student statistics
   * @returns {Promise<Object>} Student statistics
   */
  static async getStatistics() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM students s JOIN users u ON s.user_id = u.id WHERE u.is_active = 1',
        byGradeLevel: `
          SELECT grade_level, COUNT(*) as count
          FROM students s
          JOIN users u ON s.user_id = u.id
          WHERE u.is_active = 1 AND grade_level IS NOT NULL
          GROUP BY grade_level
          ORDER BY grade_level
        `,
        byClassSection: `
          SELECT class_section, COUNT(*) as count
          FROM students s
          JOIN users u ON s.user_id = u.id
          WHERE u.is_active = 1 AND class_section IS NOT NULL
          GROUP BY class_section
          ORDER BY count DESC
        `,
        recent: `
          SELECT COUNT(*) as count
          FROM students s
          JOIN users u ON s.user_id = u.id
          WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `
      };

      const [totalResult, gradeLevelResult, classSectionResult, recentResult] = await Promise.all([
        database.query(queries.total),
        database.query(queries.byGradeLevel),
        database.query(queries.byClassSection),
        database.query(queries.recent)
      ]);

      return {
        total: totalResult[0].count,
        byGradeLevel: gradeLevelResult,
        byClassSection: classSectionResult,
        recentlyCreated: recentResult[0].count
      };
    } catch (error) {
      throw new Error(`Failed to get student statistics: ${error.message}`);
    }
  }

  /**
   * Get students by grade level and class section
   * @param {number} gradeLevel - Grade level
   * @param {string} classSection - Class section
   * @returns {Promise<Array>} Array of students
   */
  static async getByGradeAndSection(gradeLevel, classSection) {
    try {
      const query = `
        SELECT s.id, s.student_id, s.first_name, s.last_name, s.phone, u.email,
               CONCAT(s.first_name, ' ', s.last_name) as full_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.grade_level = ? AND s.class_section = ? AND u.is_active = 1
        ORDER BY s.last_name, s.first_name
      `;

      const students = await database.query(query, [gradeLevel, classSection]);

      return students;
    } catch (error) {
      throw new Error(`Failed to get students by grade and section: ${error.message}`);
    }
  }
}

module.exports = Student;