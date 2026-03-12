import { EEnvironment } from './environment.types';

/** Log levels: debug < info < warn < error. Higher = less verbose. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Environment {
  // Environment flags
  PRODUCTION: boolean;
  ENVIRONMENT: EEnvironment;

  // API Configuration (environment-specific)
  API_BASE_URL: string;

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: boolean;

  /** Min level to log. In prod typically 'error', in dev 'debug'. */
  LOG_LEVEL: LogLevel;

  // Test Data Flags (environment-specific)
  ENABLE_TEST_DATA: boolean;
}
