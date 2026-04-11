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

  /**
   * Local / dev only: fixed instant for `Date` / `Date.now()`.
   * - `YYYY-MM-DD` → that local calendar day at **12:00:00** (same as before).
   * - With time, e.g. `2026-04-02T14:30:00` or `2026-04-02T14:30:00.000Z` (parsed by the browser).
   * Omit or `null` for real clock.
   */
  MOCK_SYSTEM_DATE?: string | null;
}
