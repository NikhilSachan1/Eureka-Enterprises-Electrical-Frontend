/**
 * Maps an API bulk response to success/error arrays and the message key inside each item.
 * Uses dot paths on the root response (e.g. `result`, `data.items`).
 * Message keys are resolved per item (e.g. `message`, `error` or nested `meta.reason`).
 */
export interface IBulkOperationResponseNotificationConfig {
  /** Dot path from response root to the success array, e.g. `result` */
  successItemsPath: string;
  /** Dot path from response root to the error/failed array, e.g. `errors` */
  errorItemsPath: string;
  /** Key (dot path allowed) on each success element for the text to show, e.g. `message` */
  successMessageKey: string;
  /** Key (dot path allowed) on each error element for the text to show, e.g. `error` */
  errorMessageKey: string;
  /**
   * When message arrays are empty after extraction, or as section fallback in mixed toasts.
   * Functions receive the number of items in that bucket.
   */
  fallbacks?: {
    success?: string | ((successCount: number) => string);
    error?: string | ((errorCount: number) => string);
    /** When both success and error arrays are empty */
    empty?: string;
  };
}
