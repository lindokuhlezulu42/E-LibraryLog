# School Management System Backend

A comprehensive Node.js backend with Express and MySQL for school management systems, supporting user authentication, admin and student management, leave requests, schedules, shift exchanges, reports, and disruption logging.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Admin and student account management
- **Leave Requests**: Student leave request creation, approval, and tracking
- **Schedule Management**: Class and work shift scheduling with conflict detection
- **Shift Exchanges**: Admin shift exchange requests and approvals
- **Reports**: Attendance, leave summary, schedule conflicts, and student performance reports
- **Disruption Logging**: System disruption tracking and resolution management
- **Security**: Input validation, rate limiting, CORS, security headers
- **Logging**: Comprehensive request and error logging
- **Database**: MySQL with proper foreign key relationships and indexing

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting, bcrypt
- **Logging**: Winston
- **Development**: Nodemon, ESLint, Prettier

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # HTTP request handlers
│   ├── models/              # Database models and business logic
│   ├── routes/              # API route definitions
│   ├── middleware/          # Custom middleware functions
│   ├── config/              # Configuration files
│   ├── utils/               # Utility functions
│   └── app.js               # Main application configuration
├── scripts/                 # Database setup scripts
├── package.json
├── server.js                # Server startup file
├── .env.example             # Environment variables template
└── README.md
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your database and application configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=school_management
   DB_USER=root
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h

   # Email Service (Optional)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

3. **Database Setup**
   ```bash
   npm run db:setup
   ```

   This will:
   - Create the database and all tables
   - Set up proper indexes and foreign key constraints
   - Insert sample data for testing

   **Sample Login Credentials:**
   - Admin: `admin@school.com` / `admin123`
   - Student: `student@school.com` / `student123`

4. **Start the Server**

   Development mode:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`

## API Documentation

### Base URL
`http://localhost:3000/api`

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### User Management

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Admin Management

- `GET /api/admins` - Get all admins (admin only)
- `GET /api/admins/:id` - Get specific admin
- `POST /api/admins` - Create new admin (admin only)
- `PUT /api/admins/:id` - Update admin (admin only)
- `DELETE /api/admins/:id` - Delete admin (admin only)

### Student Management

- `GET /api/students` - Get students (admin: all, student: self)
- `GET /api/students/:id` - Get specific student
- `POST /api/students` - Create new student (admin only)
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (admin only)

### Leave Requests

- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Create leave request (student only)
- `PUT /api/leaves/:id/approve` - Approve leave request (admin only)
- `PUT /api/leaves/:id/reject` - Reject leave request (admin only)
- `PUT /api/leaves/:id/cancel` - Cancel leave request (student only)

### Schedules

- `GET /api/schedules` - Get schedules
- `POST /api/schedules` - Create schedule (admin only)
- `PUT /api/schedules/:id` - Update schedule (admin only)
- `DELETE /api/schedules/:id` - Delete schedule (admin only)

### Shift Exchanges

- `GET /api/schedules/exchanges` - Get shift exchange requests
- `POST /api/schedules/:id/exchange` - Request shift exchange
- `PUT /api/schedules/exchanges/:id/accept` - Accept exchange
- `PUT /api/schedules/exchanges/:id/reject` - Reject exchange

### Reports

- `GET /api/reports` - Get generated reports (admin only)
- `POST /api/reports/generate` - Generate new report (admin only)
- `GET /api/reports/:id` - Get specific report (admin only)
- `DELETE /api/reports/:id` - Delete report (admin only)

### Disruptions

- `GET /api/disruptions` - Get disruptions
- `POST /api/disruptions` - Log new disruption (admin only)
- `PUT /api/disruptions/:id/resolve` - Resolve disruption (admin only)

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-11T10:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "ERROR_TYPE",
  "message": "Detailed error description",
  "timestamp": "2025-01-11T10:30:00Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2025-01-11T10:30:00Z"
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run db:setup` - Setup database
- `npm run db:seed` - Seed database with sample data

### Code Style

- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions
- Comprehensive error handling

### Logging

- Structured logging with Winston
- Different log levels (error, warn, info, debug)
- Request and response logging
- Error tracking and reporting

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds (12)
- **Input Validation**: Comprehensive validation with Joi
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## Database Schema

The system uses MySQL with the following main tables:

- `users` - Base authentication table
- `admins` - Admin-specific profiles
- `students` - Student profiles and academic information
- `leave_requests` - Student leave requests
- `schedules` - Class timetables and work shifts
- `shift_exchanges` - Shift exchange requests
- `reports` - Generated reports and analytics
- `disruptions` - System disruptions and incidents

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.