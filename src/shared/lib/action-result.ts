import type { ErrorCode } from "./errors";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function err(error: string, code: ErrorCode): ActionResult<never> {
  return { success: false, error, code };
}
