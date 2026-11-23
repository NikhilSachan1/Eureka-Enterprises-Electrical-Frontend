import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  API_ERROR_MAX_REASONS,
  API_ERROR_MESSAGES,
  API_GENERIC_SERVER_MESSAGES,
} from '../constants/api-error.constants';
import { format24hClockTimesInTextTo12h } from './date-time.util';

/**
 * The message to show for a failed request, from whatever the server sent:
 * - `{ error: { message } }` (the app's own errors; message may be a list from validation)
 * - `{ message }` (framework default, e.g. an unhandled 500)
 * - nothing usable (network down, timeout, file download) → a message for the status
 */
export function getApiErrorMessage(error: unknown): string {
  if (isTimeout(error)) {
    return API_ERROR_MESSAGES.TIMEOUT;
  }
  if (!(error instanceof HttpErrorResponse)) {
    return API_ERROR_MESSAGES.UNKNOWN;
  }
  if (error.status === 0) {
    return API_ERROR_MESSAGES.NETWORK;
  }

  const reason = readServerReason(error.error);
  if (reason && !API_GENERIC_SERVER_MESSAGES.has(reason.toLowerCase())) {
    return format24hClockTimesInTextTo12h(reason);
  }
  return messageForStatus(error.status);
}

function isTimeout(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'TimeoutError'
  );
}

/** The server's reason, as one line; null when it sent none (or a file body). */
function readServerReason(body: unknown): string | null {
  const parsed = typeof body === 'string' ? parseJson(body) : body;
  if (!parsed || typeof parsed !== 'object' || parsed instanceof Blob) {
    return null;
  }
  const record = parsed as {
    error?: { message?: unknown };
    message?: unknown;
  };
  const raw = record.error?.message ?? record.message;

  if (Array.isArray(raw)) {
    return joinReasons(
      raw.filter((item): item is string => typeof item === 'string')
    );
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim();
  }
  return null;
}

/** "Amount must be a number. Date is required. (+2 more)" */
function joinReasons(reasons: string[]): string | null {
  const clean = [...new Set(reasons.map(capitalize).filter(r => r !== ''))];
  if (clean.length === 0) {
    return null;
  }
  const shown = clean.slice(0, API_ERROR_MAX_REASONS);
  const more = clean.length - shown.length;
  const text = shown.map(r => (/[.!?]$/.test(r) ? r : `${r}.`)).join(' ');
  return more > 0 ? `${text} (+${more} more)` : text;
}

function capitalize(text: string): string {
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text.trim() === '' ? null : { message: text };
  }
}

function messageForStatus(status: number): string {
  switch (status) {
    case HttpStatusCode.BadRequest:
    case HttpStatusCode.UnprocessableEntity:
      return API_ERROR_MESSAGES.BAD_REQUEST;
    case HttpStatusCode.Unauthorized:
      return API_ERROR_MESSAGES.UNAUTHORIZED;
    case HttpStatusCode.Forbidden:
      return API_ERROR_MESSAGES.FORBIDDEN;
    case HttpStatusCode.NotFound:
      return API_ERROR_MESSAGES.NOT_FOUND;
    case HttpStatusCode.Conflict:
      return API_ERROR_MESSAGES.CONFLICT;
    case HttpStatusCode.PayloadTooLarge:
      return API_ERROR_MESSAGES.PAYLOAD_TOO_LARGE;
    case HttpStatusCode.TooManyRequests:
      return API_ERROR_MESSAGES.TOO_MANY_REQUESTS;
    case HttpStatusCode.GatewayTimeout:
      return API_ERROR_MESSAGES.TIMEOUT;
    default:
      return status >= 500
        ? API_ERROR_MESSAGES.SERVER
        : API_ERROR_MESSAGES.UNKNOWN;
  }
}
