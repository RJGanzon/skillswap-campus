/**
 * Error handling utilities for server actions
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ErrorCodes = {
  // Auth errors
  NOT_AUTHENTICATED: { code: "NOT_AUTHENTICATED", status: 401, message: "Not authenticated" },
  NOT_AUTHORIZED: { code: "NOT_AUTHORIZED", status: 403, message: "Not authorized" },
  INVALID_EMAIL: { code: "INVALID_EMAIL", status: 400, message: "Invalid email format" },
  INVALID_PASSWORD: { code: "INVALID_PASSWORD", status: 400, message: "Invalid password" },
  EMAIL_EXISTS: { code: "EMAIL_EXISTS", status: 409, message: "Email already registered" },
  INVALID_CREDENTIALS: { code: "INVALID_CREDENTIALS", status: 401, message: "Invalid credentials" },

  // Resource errors
  NOT_FOUND: { code: "NOT_FOUND", status: 404, message: "Resource not found" },
  ALREADY_EXISTS: { code: "ALREADY_EXISTS", status: 409, message: "Resource already exists" },

  // Validation errors
  INVALID_INPUT: { code: "INVALID_INPUT", status: 400, message: "Invalid input" },
  VALIDATION_FAILED: { code: "VALIDATION_FAILED", status: 422, message: "Validation failed" },

  // Session/State errors
  INVALID_STATE: { code: "INVALID_STATE", status: 400, message: "Invalid state transition" },
  DUPLICATE_REQUEST: { code: "DUPLICATE_REQUEST", status: 409, message: "Duplicate request" },

  // Rate limiting
  RATE_LIMITED: { code: "RATE_LIMITED", status: 429, message: "Too many requests" },

  // Server errors
  SERVER_ERROR: { code: "SERVER_ERROR", status: 500, message: "Internal server error" },
} as const;

/**
 * Wrap server action errors with proper error handling
 */
export function createErrorResponse(error: unknown): {
  error: string;
  code: string;
  status: number;
} {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error);
    return {
      error: error.message || "An error occurred",
      code: "SERVER_ERROR",
      status: 500,
    };
  }

  console.error("Unknown error:", error);
  return {
    error: "An unexpected error occurred",
    code: "SERVER_ERROR",
    status: 500,
  };
}

/**
 * Safe server action wrapper
 */
export async function safeServerAction<T>(
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    console.error(`Server action failed: ${errorResponse.code}`, errorResponse.error);
    return {
      success: false,
      error: errorResponse.error,
    };
  }
}
