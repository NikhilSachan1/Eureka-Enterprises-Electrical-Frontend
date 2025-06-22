import { INotificationOptions } from "../models/notification.model";

export const DEFAULT_NOTIFICATION_OPTIONS_CONFIG: INotificationOptions = {
    life: 3000,
    sticky: false,
    closable: true,
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