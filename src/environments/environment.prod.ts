import { Environment } from '../app/core/models/environment.interface';

export const environment: Environment = {
    // Environment flags
    PRODUCTION: true,
    ENVIRONMENT: 'production',
    
    // API Configuration (environment-specific)
    API_BASE_URL: 'https://your-live-api.com/api',
    
    // Feature Flags (environment-specific)
    ENABLE_LOGGING: false, // Disable logging in production
};