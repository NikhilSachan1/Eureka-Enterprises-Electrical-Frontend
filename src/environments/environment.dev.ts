import { Environment } from './environment.interface';

export const environment: Environment = {
    // Environment flags
    PRODUCTION: false,
    ENVIRONMENT: 'development',
    
    // API Configuration
    API_BASE_URL: 'https://european-union.onrender.com/api/v1/',
    API_TIMEOUT: 30000, // 30 seconds
    API_RETRY_ATTEMPTS: 3,
    
    // Application Configuration
    APP_NAME: 'Eureka Enterprises Electrical',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Electrical Management System',
    
    // Feature Flags
    ENABLE_LOGGING: true,
    ENABLE_DEBUG_MODE: true,
    
    // Authentication Configuration
    AUTH_TOKEN_KEY: 'auth_token',
    
    // Cache Configuration
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
};