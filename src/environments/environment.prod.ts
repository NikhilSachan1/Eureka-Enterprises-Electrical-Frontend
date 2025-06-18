import { Environment } from './environment.interface';

export const environment: Environment = {
    // Environment flags
    PRODUCTION: true,
    ENVIRONMENT: 'production',
    
    // API Configuration
    API_BASE_URL: 'https://your-live-api.com/api',
    API_TIMEOUT: 15000, // 15 seconds (faster timeout for production)
    API_RETRY_ATTEMPTS: 2,
    
    // Application Configuration
    APP_NAME: 'Eureka Enterprises Electrical',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Electrical Management System',
    
    // Feature Flags
    ENABLE_LOGGING: false, // Disable logging in production
    ENABLE_DEBUG_MODE: false, // Disable debug mode in production
    
    // Authentication Configuration
    AUTH_TOKEN_KEY: 'auth_token',
    
    // Cache Configuration
    CACHE_DURATION: 15 * 60 * 1000, // 15 minutes (longer cache for production)
    
};