export interface IAppConfig {
  name: string;
  version: string;
  description: string;
  API_CONFIG: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  CACHE_CONFIG: {
    defaultDuration: number;
    maxEntries: number;
    cleanupInterval: number;
  };
  NOTIFICATION_CONFIG: {
    life: number;
    sticky: boolean;
    closable: boolean;
  };
  USER_PERMISSION_CONFIG: {
    wantPeriodicRefresh: boolean;
    refreshInterval: number;
  };
  DATE_FORMATS: {
    DEFAULT: string;
    WITH_TIME: string;
    CALENDAR: string;
    API: string;
    WITH_SHORT_MONTH: string;
  };
  TIME_FORMATS: {
    DEFAULT: string;
    WITH_SECONDS: string;
  };
  CURRENCY_CONFIG: {
    DEFAULT: string;
    SYMBOL: string;
  };
  TABLE_PAGINATION_CONFIG: {
    DEFAULT_PAGE_SIZE: number;
    DEFAULT_PAGE_SIZE_OPTIONS: number[];
  };
  CONFIRMATION_DIALOG_CONFIG: {
    DEFAULT_WIDTH: string;
    DEFAULT_POSITION: string;
    CLOSE_ON_ESCAPE: boolean;
    DISMISSABLE_MASK: boolean;
  };
}
