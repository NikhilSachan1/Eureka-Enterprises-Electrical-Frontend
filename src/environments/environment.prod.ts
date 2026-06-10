import { EEnvironment } from '@core/types';
import { Environment } from '@core/types/environment.interface';

export const environment: Environment = {
  // Environment flags
  PRODUCTION: true,
  ENVIRONMENT: EEnvironment.PRODUCTION,

  // API Configuration (environment-specific)
  API_BASE_URL: 'https://api.eurekaenterprises.org/api/v1',

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: true, // Disable logging in production
};
