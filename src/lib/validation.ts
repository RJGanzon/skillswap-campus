/**
 * Validation utilities for common data types
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email (trim and lowercase)
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate image URL (basic check)
 */
export function isValidImageUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const lowerUrl = url.toLowerCase();

  return imageExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * Session status valid state transitions
 */
export const VALID_SESSION_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["ONGOING", "CANCELLED"],
  DECLINED: [], // final state
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // final state
  CANCELLED: [], // final state
};

/**
 * Check if session status transition is valid
 */
export function isValidStatusTransition(from: string, to: string): boolean {
  return VALID_SESSION_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: string | number, limit?: string | number) {
  const p = typeof page === "string" ? parseInt(page, 10) : page;
  const l = typeof limit === "string" ? parseInt(limit, 10) : limit;

  const validPage = Number.isInteger(p) && p > 0 ? p : 1;
  const validLimit = Number.isInteger(l) && l > 0 && l <= 100 ? l : 20;

  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit,
  };
}
