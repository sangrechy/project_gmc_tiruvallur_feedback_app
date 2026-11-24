/**
 * Shared date/time normalization and formatting utilities
 * Handles Firestore Timestamps, { seconds } objects, ISO strings, and numeric epochs.
 */

export function toDateObject(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    const d = new Date(value.seconds * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    // Reject time-only strings like "10:30 AM" which yield Invalid Date
    if (typeof value === 'string' && /^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(value.trim())) {
      return null;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function toEpochMs(value, fallbackMs = 0) {
  const d = toDateObject(value);
  return d ? d.getTime() : fallbackMs;
}

export function formatDateTime(value, fallback = '') {
  const d = toDateObject(value);
  if (!d) {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }
  return d.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatShortDateTime(value, fallback = '') {
  const d = toDateObject(value);
  if (!d) {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }
  return d.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTimeOnly(value, fallback = '') {
  const d = toDateObject(value);
  if (!d) {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}
