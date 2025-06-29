import { INotificationOptions } from "../models";
import { APP_CONFIG } from "../../core/config";

export const DEFAULT_NOTIFICATION_OPTIONS_CONFIG: INotificationOptions = {
    life: APP_CONFIG.NOTIFICATION_CONFIG.life,
    sticky: APP_CONFIG.NOTIFICATION_CONFIG.sticky,
    closable: APP_CONFIG.NOTIFICATION_CONFIG.closable,
};

// Common notification messages
export const DEFAULT_NOTIFICATION_MESSAGES = {
    VALIDATION_FAILED: 'Please fill all fields correctly.',
} as const;

// Notification titles
export const DEFAULT_NOTIFICATION_TITLES = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    validation: 'Validation Error',
} as const;