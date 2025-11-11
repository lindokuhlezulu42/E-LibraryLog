const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseSetup {
  constructor() {
    this.connection = null;
    this.dbName = process.env.DB_NAME || 'school_management';
    this.dbHost = process.env.DB_HOST || 'localhost';
    this.dbUser = process.env.DB_USER || 'root';
    this.dbPassword = process.env.DB_PASSWORD || '';
    this.dbPort = process.env.DB_PORT || 3306;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: this.dbHost,
        user: this.dbUser,
        password: this.dbPassword,
        port: this.dbPort
      });

      console.log('Connected to MySQL server');
      return true;
    } catch (error) {
      console.error('Failed to connect to MySQL:', error.message);
      return false;
    }
  }

  async createDatabase() {
    try {
      console.log(`Creating database: ${this.dbName}`);
      await this.connection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log('Database created successfully');
    } catch (error) {
      throw new Error(`Failed to create database: ${error.message}`);
    }
  }

  async useDatabase() {
    try {
      await this.connection.execute(`USE \`${this.dbName}\``);
      console.log(`Using database: ${this.dbName}`);
    } catch (error) {
      throw new Error(`Failed to use database: ${error.message}`);
    }
  }

  async createTables() {
    try {
      console.log('Creating tables...');

      // Create users table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'student') NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_role (role),
          INDEX idx_active (is_active)
        ) ENGINE=InnoDB
      `);

      // Create admins table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          department VARCHAR(100),
          permissions JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_department (department)
        ) ENGINE=InnoDB
      `);

      // Create students table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS students (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          student_id VARCHAR(50) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          date_of_birth DATE,
          grade_level INT,
          class_section VARCHAR(10),
          phone VARCHAR(20),
          address TEXT,
          parent_contact VARCHAR(20),
          enrollment_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_student_id (student_id),
          INDEX idx_grade (grade_level),
          INDEX idx_section (class_section)
        ) ENGINE=InnoDB
      `);

      // Create leave_requests table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS leave_requests (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id INT NOT NULL,
          leave_type ENUM('sick', 'personal', 'emergency', 'vacation') NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          reason TEXT NOT NULL,
          status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
          approved_by INT,
          approval_date TIMESTAMP NULL,
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL,
          INDEX idx_student (student_id),
          INDEX idx_status (status),
          INDEX idx_dates (start_date, end_date),
          INDEX idx_approved_by (approved_by)
        ) ENGINE=InnoDB
      `);

      // Create schedules table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS schedules (
          id INT PRIMARY KEY AUTO_INCREMENT,
          schedule_type ENUM('class', 'shift') NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          assigned_to_id INT NOT NULL,
          assigned_to_type ENUM('admin', 'student') NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          location VARCHAR(100),
          recurrence_pattern JSON,
          status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE CASCADE,
          INDEX idx_assigned (assigned_to_id, assigned_to_type),
          INDEX idx_type (schedule_type),
          INDEX idx_status (status),
          INDEX idx_time (start_time, end_time),
          INDEX idx_created_by (created_by)
        ) ENGINE=InnoDB
      `);

      // Create shift_exchanges table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS shift_exchanges (
          id INT PRIMARY KEY AUTO_INCREMENT,
          original_schedule_id INT NOT NULL,
          requesting_admin_id INT NOT NULL,
          target_admin_id INT NOT NULL,
          proposed_start_time DATETIME NOT NULL,
          proposed_end_time DATETIME NOT NULL,
          reason TEXT,
          status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
          exchange_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (original_schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
          FOREIGN KEY (requesting_admin_id) REFERENCES admins(id) ON DELETE CASCADE,
          FOREIGN KEY (target_admin_id) REFERENCES admins(id) ON DELETE CASCADE,
          INDEX idx_original_schedule (original_schedule_id),
          INDEX idx_requesting_admin (requesting_admin_id),
          INDEX idx_target_admin (target_admin_id),
          INDEX idx_status (status)
        ) ENGINE=InnoDB
      `);

      // Create reports table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS reports (
          id INT PRIMARY KEY AUTO_INCREMENT,
          report_type ENUM('attendance', 'leave_summary', 'schedule_conflicts', 'student_performance') NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          generated_by INT NOT NULL,
          data JSON NOT NULL,
          filters JSON,
          date_range_start DATE,
          date_range_end DATE,
          file_path VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (generated_by) REFERENCES admins(id) ON DELETE CASCADE,
          INDEX idx_type (report_type),
          INDEX idx_generated_by (generated_by),
          INDEX idx_date_range (date_range_start, date_range_end)
        ) ENGINE=InnoDB
      `);

      // Create disruptions table
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS disruptions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          disruption_type ENUM('system_outage', 'class_cancellation', 'emergency', 'maintenance') NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
          affected_schedules JSON,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          status ENUM('active', 'resolved', 'investigating') DEFAULT 'active',
          reported_by INT NOT NULL,
          resolution_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (reported_by) REFERENCES admins(id) ON DELETE CASCADE,
          INDEX idx_type (disruption_type),
          INDEX idx_severity (severity),
          INDEX idx_status (status),
          INDEX idx_time (start_time, end_time),
          INDEX idx_reported_by (reported_by)
        ) ENGINE=InnoDB
      `);

      console.log('All tables created successfully');
    } catch (error) {
      throw new Error(`Failed to create tables: ${error.message}`);
    }
  }

  async insertSampleData() {
    try {
      console.log('Inserting sample data...');

      // Note: You would need to hash passwords before inserting
      const bcrypt = require('bcryptjs');

      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 12);
      const [adminUserResult] = await this.connection.execute(`
        INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)
      `, ['admin@school.com', adminPassword, 'admin']);

      const adminUserId = adminUserResult.insertId;

      // Create admin profile
      await this.connection.execute(`
        INSERT INTO admins (user_id, first_name, last_name, department, permissions)
        VALUES (?, ?, ?, ?, ?)
      `, [adminUserId, 'System', 'Administrator', 'IT', JSON.stringify({
        users: { read: true, write: true, delete: true },
        students: { read: true, write: true, delete: true },
        schedules: { read: true, write: true, delete: true },
        reports: { read: true, write: true, delete: true },
        disruptions: { read: true, write: true, delete: true }
      })]);

      // Create sample student
      const studentPassword = await bcrypt.hash('student123', 12);
      const [studentUserResult] = await this.connection.execute(`
        INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)
      `, ['student@school.com', studentPassword, 'student']);

      const studentUserId = studentUserResult.insertId;

      // Create student profile
      await this.connection.execute(`
        INSERT INTO students (user_id, student_id, first_name, last_name, grade_level, class_section, enrollment_date)
        VALUES (?, ?, ?, ?, ?, ?, CURDATE())
      `, [studentUserId, 'STU001', 'John', 'Doe', 10, 'A']);

      console.log('Sample data inserted successfully');
      console.log('Admin login: admin@school.com / admin123');
      console.log('Student login: student@school.com / student123');
    } catch (error) {
      console.error('Failed to insert sample data:', error.message);
      // Don't throw error here as table creation is more important
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }

  async setup() {
    try {
      console.log('Starting database setup...');

      // Connect to MySQL server
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to MySQL server');
      }

      // Create database
      await this.createDatabase();

      // Use the database
      await this.useDatabase();

      // Create tables
      await this.createTables();

      // Insert sample data
      await this.insertSampleData();

      console.log('\n✅ Database setup completed successfully!');
      console.log(`📊 Database name: ${this.dbName}`);
      console.log(`🌐 Host: ${this.dbHost}:${this.dbPort}`);
      console.log('\nYou can now start the application server.');

    } catch (error) {
      console.error('\n❌ Database setup failed:', error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new DatabaseSetup();
  setup.setup();
}

module.exports = DatabaseSetup;