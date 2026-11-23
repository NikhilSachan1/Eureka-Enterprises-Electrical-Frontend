/** What the user is told when a request fails and the server gave no usable reason. */
export const API_ERROR_MESSAGES = {
  NETWORK:
    "Can't reach the server. Check your internet connection and try again.",
  TIMEOUT: 'The server took too long to respond. Please try again.',
  SERVER: 'Something went wrong on the server. Please try again in a moment.',
  BAD_REQUEST:
    'The request could not be processed. Please check the details and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: "You don't have permission to do this.",
  NOT_FOUND: 'The record could not be found. It may have been deleted.',
  CONFLICT:
    'This clashes with data that changed meanwhile. Refresh and try again.',
  PAYLOAD_TOO_LARGE: 'The file is too large to upload.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
  /** The server answered, but not in the shape the app expects (details go to the log). */
  UNEXPECTED_RESPONSE:
    'The server sent a reply the app could not read. Please try again, or contact support if it keeps happening.',
  /** The app could not build the request from the form (details go to the log). */
  INVALID_REQUEST:
    'Some details are not in the expected format. Please check the form and try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
} as const;

/**
 * Framework texts the server sends when it has no specific reason. They tell the user nothing,
 * so the message for the status is shown instead.
 */
export const API_GENERIC_SERVER_MESSAGES: ReadonlySet<string> = new Set([
  'internal server error',
  'forbidden resource',
  'forbidden',
  'unauthorized',
  'not found',
  'bad request',
  'conflict',
  'unexpected error',
]);

/** Validation errors list at most this many reasons; the rest are counted. */
export const API_ERROR_MAX_REASONS = 3;

/**
 * An API error toast waits this long, so the caller's own message for the same failure
 * (e.g. "Failed to add expense") becomes its title instead of a second toast.
 */
export const API_ERROR_TOAST_MERGE_DELAY_MS = 0;
