import { Environment } from '@core/types/environment.interface';
import { EEnvironment } from '@core/types/environment.types';

export const environment: Environment = {
  // Environment flags
  PRODUCTION: false,
  ENVIRONMENT: EEnvironment.LOCAL,

  // API Configuration (environment-specific)
  API_BASE_URL: 'https://european-union.onrender.com/api/v1',

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: true,

  // Test Data Flags (environment-specific)
  ENABLE_TEST_DATA: true,

  /** e.g. `'2026-04-02'` (noon local) or `'2026-04-02T14:30:00'`; `null` = real clock. */
  MOCK_SYSTEM_DATE: null,
};
