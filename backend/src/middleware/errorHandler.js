const winston = require('winston');

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'school-management-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database error handler
 */
const handleDatabaseError = (error) => {
  logger.error('Database error:', error);

  // MySQL specific error codes
  if (error.code === 'ER_DUP_ENTRY') {
    const match = error.message.match(/for key '(.+?)'/);
    const field = match ? match[1] : 'field';
    return new AppError(`Duplicate entry for ${field}`, 409, 'DUPLICATE_ENTRY');
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError('Referenced record not found', 400, 'FOREIGN_KEY_VIOLATION');
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return new AppError('Cannot delete record: it is referenced by other records', 400, 'REFERENCED_RECORD');
  }

  if (error.code === 'ECONNREFUSED') {
    return new AppError('Database connection failed', 503, 'DATABASE_CONNECTION_FAILED');
  }

  if (error.code === 'ETIMEDOUT') {
    return new AppError('Database request timeout', 504, 'DATABASE_TIMEOUT');
  }

  // Generic database error
  return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};

/**
 * JWT error handler
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  if (error.name === 'NotBeforeError') {
    return new AppError('Token not active', 401, 'TOKEN_NOT_ACTIVE');
  }

  return new AppError('Authentication error', 401, 'AUTH_ERROR');
};

/**
 * Validation error handler
 */
const handleValidationError = (error) => {
  if (error.details && Array.isArray(error.details)) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  return new AppError('Invalid input data', 400, 'VALIDATION_ERROR');
};

/**
 * Send error response
 */
const sendErrorResponse = (res, error) => {
  const response = {
    success: false,
    error: error.errorCode || 'INTERNAL_SERVER_ERROR',
    message: error.message,
    timestamp: new Date().toISOString()
  };

  // Add validation details if available
  if (error.details) {
    response.details = error.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  let processedError = error;

  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Handle different types of errors
  if (error.name === 'ValidationError' || error.isJoi) {
    processedError = handleValidationError(error);
  } else if (error.name && error.name.includes('JsonWebToken')) {
    processedError = handleJWTError(error);
  } else if (error.code && error.code.startsWith('ER_')) {
    processedError = handleDatabaseError(error);
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    processedError = handleDatabaseError(error);
  } else if (!(error instanceof AppError)) {
    // Convert generic errors to AppError
    processedError = new AppError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }

  sendErrorResponse(res, processedError);
};

/**
 * Async error wrapper for route handlers
 * Eliminates the need for try-catch blocks in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 error handler
 */
const notFoundHandler = (req, res) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );

  sendErrorResponse(res, error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  AppError,
  logger
};