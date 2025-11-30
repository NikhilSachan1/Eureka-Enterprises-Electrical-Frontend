import { Environment } from '@core/types/environment.interface';

export const environment: Environment = {
  // Environment flags
  PRODUCTION: false,
  ENVIRONMENT: 'development',

  // API Configuration (environment-specific)
  API_BASE_URL: 'http://localhost:3333/api/v1',

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: true,
};
