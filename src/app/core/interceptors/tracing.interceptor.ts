import { HttpInterceptorFn } from '@angular/common/http';

/**
 * W3C Trace Context propagation.
 *
 * Generates or reuses a `traceparent` header of the form
 *   00-<trace-id:32hex>-<span-id:16hex>-01
 * and sends it on every outgoing HTTP request.
 *
 * The `traceId` is stored in `sessionStorage` so every request made
 * during the same user session belongs to the same distributed trace.
 * The `spanId` is regenerated per request because each call is its own
 * span in the trace.
 *
 * `X-Correlation-Id` is intentionally NOT set here: it is handled by the
 * shell's ApiClientService or the calling services, to keep the
 * human-readable UUID separate from the W3C trace IDs.
 */
export const tracingInterceptor: HttpInterceptorFn = (req, next) => {
  const traceId = getOrCreateTraceId();
  const spanId = generateHex(16);
  const traceparent = `00-${traceId}-${spanId}-01`;

  const cloned = req.clone({
    setHeaders: {
      traceparent,
    },
  });

  return next(cloned);
};

const TRACE_ID_KEY = 'telemed.trace-id';

function getOrCreateTraceId(): string {
  if (typeof sessionStorage === 'undefined') {
    return generateHex(32);
  }
  const existing = sessionStorage.getItem(TRACE_ID_KEY);
  if (existing && /^[0-9a-f]{32}$/.test(existing)) {
    return existing;
  }
  const traceId = generateHex(32);
  sessionStorage.setItem(TRACE_ID_KEY, traceId);
  return traceId;
}

function generateHex(bytes: number): string {
  // `bytes` is the number of hex characters (16 for spanId, 32 for traceId).
  const array = new Uint8Array(bytes / 2);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}
