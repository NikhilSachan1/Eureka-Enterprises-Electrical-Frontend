import { INotificationOptions } from '@shared/types';
import { APP_CONFIG } from '@core/config';

export const DEFAULT_NOTIFICATION_OPTIONS_CONFIG: INotificationOptions = {
  life: APP_CONFIG.NOTIFICATION_CONFIG.life,
  sticky: APP_CONFIG.NOTIFICATION_CONFIG.sticky,
  closable: APP_CONFIG.NOTIFICATION_CONFIG.closable,
};

// Common notification messages
export const DEFAULT_NOTIFICATION_MESSAGES = {
  VALIDATION_FAILED: 'Please fill all fields correctly.',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  /** Mixed bulk outcome: total processed, success count, failure count */
  bulkMixedHeadline: (
    total: number,
    succeeded: number,
    failed: number
  ): string =>
    `Bulk operation completed: ${total} item(s) processed — ${succeeded} succeeded, ${failed} failed.`,
} as const;

// Notification titles
export const DEFAULT_NOTIFICATION_TITLES = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
  validation: 'Validation Error',
} as const;
