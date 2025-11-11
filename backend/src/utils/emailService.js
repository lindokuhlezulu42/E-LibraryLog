const nodemailer = require('nodemailer');
const { logger } = require('../middleware/errorHandler');

/**
 * Email service configuration and functions
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      // Only initialize if email credentials are provided
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false // For development environments
          }
        });

        // Verify connection configuration
        this.transporter.verify((error, success) => {
          if (error) {
            logger.warn('Email service configuration failed:', error.message);
            this.isConfigured = false;
          } else {
            logger.info('Email service is ready to send messages');
            this.isConfigured = true;
          }
        });
      } else {
        logger.warn('Email service credentials not provided. Email features will be disabled.');
        this.isConfigured = false;
      }
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string|Array} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(options) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured. Skipping email send.');
      return {
        success: false,
        message: 'Email service not configured'
      };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || this.generateHtmlFromText(options.text || '')
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} user - User object
   * @param {string} temporaryPassword - Temporary password (if applicable)
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(user, temporaryPassword = null) {
    const subject = 'Welcome to School Management System';
    let text = `Dear ${user.fullName},\n\nWelcome to the School Management System! Your account has been successfully created.`;

    if (temporaryPassword) {
      text += `\n\nYour temporary password is: ${temporaryPassword}\nPlease change your password after logging in for security reasons.`;
    }

    text += `\n\nYou can log in at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login\n\nBest regards,\nSchool Management Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to School Management System</h2>
        <p>Dear ${user.fullName},</p>
        <p>Welcome to the School Management System! Your account has been successfully created.</p>
        ${temporaryPassword ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your temporary password is:</strong> ${temporaryPassword}<br>
            <em>Please change your password after logging in for security reasons.</em>
          </div>
        ` : ''}
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Log In to Your Account
          </a>
        </p>
        <p>Best regards,<br>School Management Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const text = `Dear ${user.fullName},\n\nYou requested a password reset for your School Management System account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nSchool Management Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Password Reset Request</h2>
        <p>Dear ${user.fullName},</p>
        <p>You requested a password reset for your School Management System account.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <a href="${resetUrl}"
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Your Password
          </a>
        </div>
        <p><strong>Note:</strong> This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>School Management Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  }

  /**
   * Send leave request notification
   * @param {Object} leaveRequest - Leave request object
   * @param {Object} student - Student object
   * @param {string} notificationType - 'created', 'approved', 'rejected'
   * @param {Array} adminEmails - List of admin emails to notify
   * @returns {Promise<Object>} Send result
   */
  async sendLeaveNotification(leaveRequest, student, notificationType, adminEmails = []) {
    let subject, text, html;

    switch (notificationType) {
      case 'created':
        subject = `New Leave Request: ${student.fullName}`;
        text = `A new leave request has been submitted by ${student.fullName}.\n\nLeave Type: ${leaveRequest.leave_type}\nStart Date: ${leaveRequest.start_date}\nEnd Date: ${leaveRequest.end_date}\nReason: ${leaveRequest.reason}\n\nPlease review and approve or reject this request.`;
        break;

      case 'approved':
        subject = `Leave Request Approved: ${student.fullName}`;
        text = `Your leave request has been approved.\n\nLeave Type: ${leaveRequest.leave_type}\nStart Date: ${leaveRequest.start_date}\nEnd Date: ${leaveRequest.end_date}\n\nApproved by: ${leaveRequest.approved_by}\n${leaveRequest.admin_notes ? `\nNotes: ${leaveRequest.admin_notes}` : ''}`;
        break;

      case 'rejected':
        subject = `Leave Request Rejected: ${student.fullName}`;
        text = `Your leave request has been rejected.\n\nLeave Type: ${leaveRequest.leave_type}\nStart Date: ${leaveRequest.start_date}\nEnd Date: ${leaveRequest.end_date}\n${leaveRequest.admin_notes ? `\nReason: ${leaveRequest.admin_notes}` : ''}`;
        break;

      default:
        return { success: false, message: 'Invalid notification type' };
    }

    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${notificationType === 'approved' ? '#28a745' : notificationType === 'rejected' ? '#dc3545' : '#007bff'};">
          ${subject}
        </h2>
        <p><strong>Student:</strong> ${student.fullName}</p>
        <p><strong>Leave Type:</strong> ${leaveRequest.leave_type}</p>
        <p><strong>Start Date:</strong> ${leaveRequest.start_date}</p>
        <p><strong>End Date:</strong> ${leaveRequest.end_date}</p>
        <p><strong>Reason:</strong> ${leaveRequest.reason}</p>
        ${leaveRequest.admin_notes ? `<p><strong>Notes:</strong> ${leaveRequest.admin_notes}</p>` : ''}
        ${notificationType === 'created' ? '<p>Please review and approve or reject this request.</p>' : ''}
      </div>
    `;

    const recipients = notificationType === 'created' ? adminEmails : [student.email];

    return this.sendEmail({
      to: recipients,
      subject,
      text,
      html
    });
  }

  /**
   * Generate HTML from plain text
   * @param {string} text - Plain text
   * @returns {string} HTML content
   */
  generateHtmlFromText(text) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${text.replace(/\n/g, '<br>')}</p>
      </div>
    `;
  }

  /**
   * Check if email service is configured
   * @returns {boolean} True if configured
   */
  isReady() {
    return this.isConfigured;
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;