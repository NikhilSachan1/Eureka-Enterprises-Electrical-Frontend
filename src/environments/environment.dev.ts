import { Environment } from '@core/types/environment.interface';
import { EEnvironment } from '@core/types/environment.types';

export const environment: Environment = {
  // Environment flags
  PRODUCTION: false,
  ENVIRONMENT: EEnvironment.DEVELOPMENT,

  // API Configuration (environment-specific)
  API_BASE_URL: 'https://api-uat.eurekaenterprises.org/api/v1',

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: true,
};
