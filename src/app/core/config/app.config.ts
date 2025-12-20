import { REGEX } from '@shared/constants';
import { EDialogPosition, ETextCase } from '@shared/types';

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

  // User Permission Configuration
  USER_PERMISSION_CONFIG: {
    wantPeriodicRefresh: false,
    refreshInterval: 1000 * 60 * 0.1, // 1 minute
  },

  // Date Formats
  DATE_FORMATS: {
    DEFAULT: 'MMM d, yyyy',
    DEFAULT_CALENDAR: 'M d, yy',
    WITH_TIME: 'dd/MM/yyyy HH:mm',
    CALENDAR: 'dd/mm/yy',
    API: 'yyyy-MM-dd',
    WITH_SHORT_MONTH: 'MMM d, yyyy',
  },

  // Time Formats
  TIME_FORMATS: {
    DEFAULT: 'hh:mm a',
    WITH_SECONDS: 'HH:mm:ss',
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
  },

  // Dialog Configuration
  CONFIRMATION_DIALOG_CONFIG: {
    DEFAULT_WIDTH: '400px',
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
  },

  //Form Inputs Configuration
  FORM_VALIDATION_RULES: {
    TRANSACTION_ID: {
      MIN_LENGTH: 6,
      MAX_LENGTH: 32,
      PATTERN: REGEX.ALPHANUMERIC,
      TEXT_CASE: ETextCase.UPPERCASE,
    },
  },
};
