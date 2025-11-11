/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination information
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendPaginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      total: pagination.total || 0,
      totalPages: Math.ceil(pagination.total / pagination.limit) || 0,
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(response);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
  sendSuccess(res, data, message, 201);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendNoContent = (res, message = 'Operation completed successfully') => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  res.status(204).json(response);
};

/**
 * Calculate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination object
 */
const calculatePagination = (page = 1, limit = 20, total = 0) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const totalPages = Math.ceil(total / parsedLimit);
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPages,
    offset,
    hasNextPage: parsedPage < totalPages,
    hasPrevPage: parsedPage > 1
  };
};

/**
 * Build MySQL LIMIT clause for pagination
 * @param {Object} pagination - Pagination object
 * @returns {string} LIMIT clause
 */
const buildLimitClause = (pagination) => {
  if (!pagination || !pagination.limit) {
    return '';
  }

  const limit = parseInt(pagination.limit);
  const offset = parseInt(pagination.offset) || 0;

  return `LIMIT ${limit} OFFSET ${offset}`;
};

/**
 * Build WHERE clause for search
 * @param {Object} searchParams - Search parameters
 * @param {Array} allowedFields - Array of allowed field names
 * @returns {Object} WHERE clause and parameters
 */
const buildSearchClause = (searchParams, allowedFields = []) => {
  const conditions = [];
  const parameters = [];

  if (searchParams.search && searchParams.search.trim()) {
    const searchConditions = allowedFields.map(field => {
      parameters.push(`%${searchParams.search.trim()}%`);
      return `${field} LIKE ?`;
    });

    if (searchConditions.length > 0) {
      conditions.push(`(${searchConditions.join(' OR ')})`);
    }
  }

  // Add other filters
  Object.keys(searchParams).forEach(key => {
    if (key !== 'search' && searchParams[key] !== undefined && searchParams[key] !== '') {
      if (allowedFields.includes(key)) {
        conditions.push(`${key} = ?`);
        parameters.push(searchParams[key]);
      }
    }
  });

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    parameters
  };
};

/**
 * Format database query results
 * @param {Array} results - Database query results
 * @param {Object} options - Formatting options
 * @returns {Array} Formatted results
 */
const formatResults = (results, options = {}) => {
  if (!Array.isArray(results) || results.length === 0) {
    return results;
  }

  return results.map(result => {
    const formatted = { ...result };

    // Convert snake_case to camelCase for response
    if (options.camelCase !== false) {
      Object.keys(formatted).forEach(key => {
        if (key.includes('_')) {
          const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
          formatted[camelKey] = formatted[key];
          delete formatted[key];
        }
      });
    }

    // Parse JSON fields
    if (options.parseJson) {
      options.parseJson.forEach(field => {
        if (formatted[field] && typeof formatted[field] === 'string') {
          try {
            formatted[field] = JSON.parse(formatted[field]);
          } catch (error) {
            // Keep original value if parsing fails
          }
        }
      });
    }

    // Format dates
    if (options.formatDates) {
      options.formatDates.forEach(field => {
        if (formatted[field]) {
          formatted[field] = new Date(formatted[field]).toISOString();
        }
      });
    }

    return formatted;
  });
};

/**
 * Sanitize object for response (remove sensitive fields)
 * @param {Object} obj - Object to sanitize
 * @param {Array} sensitiveFields - Array of field names to remove
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, sensitiveFields = ['password', 'password_hash', 'secret']) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };

  sensitiveFields.forEach(field => {
    if (sanitized.hasOwnProperty(field)) {
      delete sanitized[field];
    }
  });

  return sanitized;
};

module.exports = {
  sendSuccess,
  sendPaginatedResponse,
  sendCreated,
  sendNoContent,
  calculatePagination,
  buildLimitClause,
  buildSearchClause,
  formatResults,
  sanitizeObject
};