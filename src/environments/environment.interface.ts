export interface Environment {
  // Environment flags
  PRODUCTION: boolean;
  ENVIRONMENT: 'development' | 'production';
  
  // API Configuration
  API_BASE_URL: string;
  API_TIMEOUT: number;
  API_RETRY_ATTEMPTS: number;
  
  // Application Configuration
  APP_NAME: string;
  APP_VERSION: string;
  APP_DESCRIPTION: string;
  
  // Feature Flags
  ENABLE_LOGGING: boolean;
  ENABLE_DEBUG_MODE: boolean;
  
  // Authentication Configuration
  AUTH_TOKEN_KEY: string;
  
  // Cache Configuration
  CACHE_DURATION: number;
} 