/**
 * Application Constants & Enums
 * Holds static constants, database collection names, role definitions, and job names.
 */
const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  EXHIBITOR: 'EXHIBITOR',
  USER: 'USER',
});

const BOOKING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
});

module.exports = {
  ROLES,
  BOOKING_STATUS,
};
