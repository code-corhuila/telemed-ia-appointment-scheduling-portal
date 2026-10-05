/**
 * Common error envelope returned by every service (norm 5.3.5).
 *
 * Declared locally in the portal because `shell/apiError` requires the
 * federation runtime to be loaded, which does not exist during local
 * development. The shape must match the shell's `shell/apiError`.
 */

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: ReadonlyArray<{ field: string; message: string }>;
  traceId?: string;
}

export const TIMEOUT_STATUS = 0;
export const TIMEOUT_CODE = 'TIMEOUT';
