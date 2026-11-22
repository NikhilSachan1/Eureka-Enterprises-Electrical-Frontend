/**
 * How long a highlight request waits for its row. Covers the page load; after that the request
 * is dropped, so a later visit to the table does not light the row unexpectedly.
 */
export const TABLE_ROW_HIGHLIGHT_REQUEST_TTL_MS = 15000;
