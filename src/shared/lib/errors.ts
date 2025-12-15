/**
 * Application error codes
 */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  AUTH_ERROR: "AUTH_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * User-friendly error messages by code
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Invalid input data",
  DATABASE_ERROR: "Database operation failed",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Access denied",
  CONFLICT: "Resource already exists",
  AUTH_ERROR: "Authentication failed",
  UNKNOWN: "An unexpected error occurred",
};

/**
 * Get user-friendly message for error code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code];
}

/**
 * Safely extract error message from unknown error type
 * Use in catch blocks to get the actual error message for logging
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}

/**
 * Log error and return user-friendly message
 * Use in catch blocks to handle errors consistently
 */
export function handleError(error: unknown, code: ErrorCode = ErrorCode.UNKNOWN): string {
  const message = extractErrorMessage(error);

  // Log for debugging (server-side only)
  console.error(`[${code}]`, message);

  return getErrorMessage(code);
}
