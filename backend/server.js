require('dotenv').config();
const app = require('./src/app');
const database = require('./src/config/database');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const dbConnected = await database.testConnection();

    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 School Management System API Server is running!

Environment: ${NODE_ENV}
Port: ${PORT}
Database: ${process.env.DB_NAME || 'school_management'}
Time: ${new Date().toISOString()}

Available endpoints:
- Health Check: http://localhost:${PORT}/health
- API Documentation: http://localhost:${PORT}/api
- Authentication: http://localhost:${PORT}/api/auth
- Users: http://localhost:${PORT}/api/users
- Admins: http://localhost:${PORT}/api/admins
- Students: http://localhost:${PORT}/api/students
- Leave Requests: http://localhost:${PORT}/api/leaves
- Schedules: http://localhost:${PORT}/api/schedules
- Reports: http://localhost:${PORT}/api/reports
- Disruptions: http://localhost:${PORT}/api/disruptions

Use Ctrl+C to stop the server
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      server.close(async () => {
        console.log('HTTP server closed');

        try {
          await database.close();
          console.log('Database connections closed');
          console.log('Server shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = startServer;