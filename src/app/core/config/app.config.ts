import { EDialogPosition } from '@shared/types';

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
    life: 6000,
    sticky: false,
    closable: true,
  },

  // User Permission Configuration
  USER_PERMISSION_CONFIG: {
    wantPeriodicRefresh: false,
    refreshInterval: 1000 * 60 * 0.1, // 1 minute
  },

  // Date Formats
  DATE_FORMATS: {
    DEFAULT: 'MMM d, yyyy',
    DEFAULT_WITH_TIME: 'MMM d, yyyy hh:mm a',
    DEFAULT_CALENDAR: 'M d, yy',
    DEFAULT_CALENDAR_MONTH_YEAR: 'M yy',
    DEFAULT_CALENDAR_MONTH: 'MM',
    DEFAULT_CALENDAR_YEAR: 'yy',
    CALENDAR: 'dd/mm/yy',
    API: 'yyyy-MM-dd',
    API_DATETIME: 'yyyy-MM-ddTHH:mm:ss',
    WITH_SHORT_MONTH: 'MMM d, yyyy',
    MONTH_YEAR: 'MMM yyyy',
  },

  // Time Formats
  TIME_FORMATS: {
    DEFAULT: 'hh:mm a',
    API: 'HH:mm',
    WITH_SECONDS: 'HH:mm:ss',
  },

  // Currency Configuration
  CURRENCY_CONFIG: {
    DEFAULT: 'INR',
    SYMBOL: '₹',
  },

  // Number Formats (Angular DecimalPipe: {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits})
  NUMBER_FORMATS: {
    DEFAULT: '1.0-0', // No decimals: 1,234
    WITH_DECIMALS: '1.2-2', // Exactly 2 decimals: 1,234.56
    FLEXIBLE_DECIMALS: '1.0-2', // 0 to 2 decimals: 1,234 or 1,234.5 or 1,234.56
    PERCENTAGE: '1.0-2', // For percentages: 85.5
    QUANTITY: '1.0-3', // For quantities: 1,234.567
    LOCALE: 'en-IN',
  },

  // Table Configuration
  TABLE_PAGINATION_CONFIG: {
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100, 200, 500, 100],
    CURRENT_PAGE_REPORT_TEMPLATE:
      'Showing {first} to {last} of {totalRecords} entries',
  },

  // Dialog Configuration
  CONFIRMATION_DIALOG_CONFIG: {
    DEFAULT_WIDTH: '1500',
    DEFAULT_POSITION: EDialogPosition.CENTER,
    CLOSE_ON_ESCAPE: true,
    DISMISSABLE_MASK: false,
  },

  MEDIA_CONFIG: {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'heic', 'heif', 'svg', 'webp', 'bmp'],
    PDF: ['pdf'],
    DOCUMENT: ['doc', 'docx', 'txt', 'rtf'],
    SPREADSHEET: ['xls', 'xlsx', 'csv'],
    PRESENTATION: ['ppt', 'pptx'],
  },

  // Dropdown Configuration
  DROPDOWN_CONFIG: {
    DEFAULT_FILTER_LENGTH: 7,
    VIRTUAL_SCROLL_ITEM_SIZE: 38,
    VIRTUAL_SCROLL_THRESHOLD: 100,
  },

  // Vehicle Configuration
  VEHICLE_CONFIG: {
    MILEAGE_UNIT: 'km/ltr',
  },

  // Announcement Configuration
  ANNOUNCEMENT_CONFIG: {
    UNACKNOWLEDGED_CHECK_INTERVAL_MS: 35 * 60 * 1000, // 35 minutes
  },
};
