import { EEnvironment } from '@core/types';
import { Environment } from '@core/types/environment.interface';

export const environment: Environment = {
  // Environment flags
  PRODUCTION: true,
  ENVIRONMENT: EEnvironment.PRODUCTION,

  // API Configuration (environment-specific)
  API_BASE_URL: 'https://european-union.onrender.com/api/v1',

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: true, // Disable logging in production

  // Test Data Flags (environment-specific)
  ENABLE_TEST_DATA: false,

  MOCK_SYSTEM_DATE: null,
};
