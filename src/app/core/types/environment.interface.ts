import { EEnvironment } from './environment.types';

export interface Environment {
  // Environment flags
  PRODUCTION: boolean;
  ENVIRONMENT: EEnvironment;

  // API Configuration (environment-specific)
  API_BASE_URL: string;

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: boolean;

  // Test Data Flags (environment-specific)
  ENABLE_TEST_DATA: boolean;
}
