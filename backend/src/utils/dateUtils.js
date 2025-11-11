const moment = require('moment');

/**
 * Format a date to standard format
 * @param {Date|string} date - Date to format
 * @param {string} format - Moment.js format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

/**
 * Format a datetime to standard format
 * @param {Date|string} date - Date to format
 * @param {string} format - Moment.js format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted datetime string
 */
const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
const getCurrentDate = () => {
  return moment().format('YYYY-MM-DD');
};

/**
 * Get current datetime in MySQL format
 * @returns {string} Current datetime
 */
const getCurrentDateTime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date
 */
const addDays = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

/**
 * Add months to a date
 * @param {Date|string} date - Base date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} New date
 */
const addMonths = (date, months) => {
  return moment(date).add(months, 'months').toDate();
};

/**
 * Calculate the difference between two dates in days
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Difference in days
 */
const daysDifference = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isPast = (date) => {
  return moment(date).isBefore(moment());
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isFuture = (date) => {
  return moment(date).isAfter(moment());
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Check if a date is within a range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Start of range
 * @param {Date|string} endDate - End of range
 * @returns {boolean} True if date is within range
 */
const isWithinRange = (date, startDate, endDate) => {
  return moment(date).isBetween(moment(startDate), moment(endDate), 'day', '[]');
};

/**
 * Get the start of a day
 * @param {Date|string} date - Date
 * @returns {Date} Start of the day (00:00:00)
 */
const startOfDay = (date) => {
  return moment(date).startOf('day').toDate();
};

/**
 * Get the end of a day
 * @param {Date|string} date - Date
 * @returns {Date} End of the day (23:59:59)
 */
const endOfDay = (date) => {
  return moment(date).endOf('day').toDate();
};

/**
 * Get the start of a week (Monday)
 * @param {Date|string} date - Date
 * @returns {Date} Start of the week
 */
const startOfWeek = (date) => {
  return moment(date).startOf('week').toDate();
};

/**
 * Get the end of a week (Sunday)
 * @param {Date|string} date - Date
 * @returns {Date} End of the week
 */
const endOfWeek = (date) => {
  return moment(date).endOf('week').toDate();
};

/**
 * Get the start of a month
 * @param {Date|string} date - Date
 * @returns {Date} Start of the month
 */
const startOfMonth = (date) => {
  return moment(date).startOf('month').toDate();
};

/**
 * Get the end of a month
 * @param {Date|string} date - Date
 * @returns {Date} End of the month
 */
const endOfMonth = (date) => {
  return moment(date).endOf('month').toDate();
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
const calculateAge = (dateOfBirth) => {
  return moment().diff(moment(dateOfBirth), 'years');
};

/**
 * Validate if a string is a valid date
 * @param {string} dateString - Date string to validate
 * @param {string} format - Expected format (default: 'YYYY-MM-DD')
 * @returns {boolean} True if valid date
 */
const isValidDate = (dateString, format = 'YYYY-MM-DD') => {
  return moment(dateString, format, true).isValid();
};

/**
 * Get human readable time difference
 * @param {Date|string} date - Date to compare with now
 * @returns {string} Human readable time difference (e.g., "2 hours ago")
 */
const timeAgo = (date) => {
  return moment(date).fromNow();
};

/**
 * Convert date to ISO string with timezone
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO string
 */
const toISOString = (date) => {
  return moment(date).toISOString();
};

module.exports = {
  formatDate,
  formatDateTime,
  getCurrentDate,
  getCurrentDateTime,
  addDays,
  addMonths,
  daysDifference,
  isPast,
  isFuture,
  isToday,
  isWithinRange,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  calculateAge,
  isValidDate,
  timeAgo,
  toISOString
};