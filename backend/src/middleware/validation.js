const Joi = require('joi');

/**
 * Validation middleware factory
 * Creates a middleware function that validates the request against a schema
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Include all errors
      stripUnknown: true, // Remove unknown properties
      convert: true // Convert types automatically
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Request validation failed',
        details: errors,
        timestamp: new Date().toISOString()
      });
    }

    // Replace the request property with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  userRegistration: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    role: Joi.string()
      .valid('admin', 'student')
      .required()
      .messages({
        'any.only': 'Role must be either admin or student',
        'any.required': 'Role is required'
      }),
    profileData: Joi.object().when('role', {
      is: 'admin',
      then: Joi.object({
        firstName: Joi.string().min(2).max(100).required().messages({
          'string.min': 'First name must be at least 2 characters',
          'string.max': 'First name cannot exceed 100 characters',
          'any.required': 'First name is required'
        }),
        lastName: Joi.string().min(2).max(100).required().messages({
          'string.min': 'Last name must be at least 2 characters',
          'string.max': 'Last name cannot exceed 100 characters',
          'any.required': 'Last name is required'
        }),
        phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional().messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
        department: Joi.string().max(100).optional().messages({
          'string.max': 'Department cannot exceed 100 characters'
        }),
        permissions: Joi.object().optional()
      }),
      otherwise: Joi.object({
        studentId: Joi.string().min(3).max(50).required().messages({
          'string.min': 'Student ID must be at least 3 characters',
          'string.max': 'Student ID cannot exceed 50 characters',
          'any.required': 'Student ID is required'
        }),
        firstName: Joi.string().min(2).max(100).required().messages({
          'string.min': 'First name must be at least 2 characters',
          'string.max': 'First name cannot exceed 100 characters',
          'any.required': 'First name is required'
        }),
        lastName: Joi.string().min(2).max(100).required().messages({
          'string.min': 'Last name must be at least 2 characters',
          'string.max': 'Last name cannot exceed 100 characters',
          'any.required': 'Last name is required'
        }),
        dateOfBirth: Joi.date().max('now').optional().messages({
          'date.max': 'Date of birth cannot be in the future'
        }),
        gradeLevel: Joi.number().integer().min(1).max(12).optional().messages({
          'number.min': 'Grade level must be between 1 and 12',
          'number.max': 'Grade level must be between 1 and 12'
        }),
        classSection: Joi.string().max(10).optional().messages({
          'string.max': 'Class section cannot exceed 10 characters'
        }),
        phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional().messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
        address: Joi.string().max(500).optional().messages({
          'string.max': 'Address cannot exceed 500 characters'
        }),
        parentContact: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional().messages({
          'string.pattern.base': 'Please provide a valid parent contact number'
        }),
        enrollmentDate: Joi.date().max('now').optional().messages({
          'date.max': 'Enrollment date cannot be in the future'
        })
      })
    })
  }),

  // User login
  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Password change
  passwordChange: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      })
  }),

  // Profile update
  profileUpdate: Joi.object({
    firstName: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 100 characters'
    }),
    lastName: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 100 characters'
    }),
    phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).allow('').optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    address: Joi.string().max(500).allow('').optional().messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
    parentContact: Joi.string().pattern(/^[+]?[\d\s-()]+$/).allow('').optional().messages({
      'string.pattern.base': 'Please provide a valid parent contact number'
    })
  }),

  // Leave request
  leaveRequest: Joi.object({
    leaveType: Joi.string()
      .valid('sick', 'personal', 'emergency', 'vacation')
      .required()
      .messages({
        'any.only': 'Leave type must be one of: sick, personal, emergency, vacation',
        'any.required': 'Leave type is required'
      }),
    startDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Start date cannot be in the past',
        'any.required': 'Start date is required'
      }),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.min': 'End date must be after or equal to start date',
        'any.required': 'End date is required'
      }),
    reason: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Reason must be at least 10 characters',
        'string.max': 'Reason cannot exceed 1000 characters',
        'any.required': 'Reason is required'
      })
  }),

  // Schedule creation
  scheduleCreate: Joi.object({
    scheduleType: Joi.string()
      .valid('class', 'shift')
      .required()
      .messages({
        'any.only': 'Schedule type must be either class or shift',
        'any.required': 'Schedule type is required'
      }),
    title: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title must be at least 3 characters',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required'
      }),
    description: Joi.string().max(1000).optional().messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    assignedToId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Assigned to ID must be a number',
        'number.positive': 'Assigned to ID must be positive',
        'any.required': 'Assigned to ID is required'
      }),
    assignedToType: Joi.string()
      .valid('admin', 'student')
      .required()
      .messages({
        'any.only': 'Assigned to type must be either admin or student',
        'any.required': 'Assigned to type is required'
      }),
    startTime: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Start time cannot be in the past',
        'any.required': 'Start time is required'
      }),
    endTime: Joi.date()
      .min(Joi.ref('startTime'))
      .required()
      .messages({
        'date.min': 'End time must be after start time',
        'any.required': 'End time is required'
      }),
    location: Joi.string().max(100).optional().messages({
      'string.max': 'Location cannot exceed 100 characters'
    }),
    recurrencePattern: Joi.object().optional()
  }),

  // Pagination parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
    search: Joi.string().max(100).optional().messages({
      'string.max': 'Search term cannot exceed 100 characters'
    })
  }),

  // ID parameter validation
  idParam: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'ID must be a number',
        'number.integer': 'ID must be an integer',
        'number.positive': 'ID must be positive',
        'any.required': 'ID is required'
      })
  })
};

module.exports = {
  validate,
  schemas
};