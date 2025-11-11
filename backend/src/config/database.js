const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.init();
  }

  init() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_management',
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 10,
        queueLimit: 0,
        acquireTimeout: 30000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4'
      });

      console.log('Database connection pool initialized');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async getConnection() {
    try {
      const connection = await this.pool.getConnection();
      return connection;
    } catch (error) {
      console.error('Failed to get database connection:', error.message);
      throw new Error('Database connection failed');
    }
  }

  async query(sql, params = []) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  async transaction(callback) {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection pool closed');
    }
  }

  async testConnection() {
    try {
      const rows = await this.query('SELECT 1 as test');
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
  }
}

const database = new Database();

module.exports = database;