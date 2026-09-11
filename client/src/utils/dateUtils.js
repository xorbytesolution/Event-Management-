/**
 * Date and Time formatting utilities for Event Management App
 */

/**
 * Format a date string or Date object into a readable date and time string.
 * Example: "10 Sep 2026, 10:00 AM"
 */
export function formatDateTime(dateVal) {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date string or Date object into a date-only string.
 * Example: "10 Sep 2026"
 */
export function formatDate(dateVal) {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date string or Date object into a time-only string.
 * Example: "10:00 AM"
 */
export function formatTime(dateVal) {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date range into a concise string with time.
 * Example: "10 Sep 2026, 10:00 AM – 12 Sep 2026, 07:00 PM"
 */
export function formatScheduleRange(startDateVal, endDateVal) {
  if (!startDateVal) return "";
  const startStr = formatDateTime(startDateVal);
  if (!endDateVal) return startStr;

  const endStr = formatDateTime(endDateVal);
  return `${startStr} – ${endStr}`;
}
