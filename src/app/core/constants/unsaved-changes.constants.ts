/** A submit older than this no longer claims the next successful API write. */
export const UNSAVED_CHANGES_PENDING_SAVE_TTL_MS = 2 * 60 * 1000;

/** HTTP methods that only read, so they never count as a form being saved. */
export const UNSAVED_CHANGES_READ_METHODS: ReadonlySet<string> = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
]);
