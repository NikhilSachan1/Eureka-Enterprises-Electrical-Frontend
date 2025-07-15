import { EDialogPosition } from "@shared/types";

export const APP_CONFIG = {
  // Application Information
  name: 'Eureka Enterprises',
  version: '1.0.0',
  description: 'Electrical Management System',
  
  // API Configuration
  API_CONFIG: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 3000,
  },

  // Cache Configuration
  CACHE_CONFIG: {
    defaultDuration: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
    cleanupInterval: 1000 * 60 * 5, // 5 minutes
  },

  // Notification Configuration
  NOTIFICATION_CONFIG: {
    life: 3000,
    sticky: false,
    closable: true,
  },

  // Date Formats
  DATE_FORMATS: {
    DEFAULT: 'dd-MM-yyyy',
    WITH_TIME: 'dd-MM-yyyy HH:mm',
    SHORT: 'dd/MM/yy',
  },

  // Currency Configuration
  CURRENCY_CONFIG: {
    DEFAULT: 'INR',
    SYMBOL: '₹',
  },

  // Table Configuration
  TABLE_PAGINATION_CONFIG: {
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
    DISPLAY_ROWS: 5,
  },

  // Dialog Configuration
  CONFIRMATION_DIALOG_CONFIG: {
    DEFAULT_WIDTH: '400px',
    DEFAULT_POSITION: EDialogPosition.CENTER,
    CLOSE_ON_ESCAPE: true,
    DISMISSABLE_MASK: false,
  },
}; 