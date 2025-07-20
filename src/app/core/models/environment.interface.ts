export interface Environment {
  // Environment flags
  PRODUCTION: boolean;
  ENVIRONMENT: 'development' | 'production';

  // API Configuration (environment-specific)
  API_BASE_URL: string;

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: boolean;
}
