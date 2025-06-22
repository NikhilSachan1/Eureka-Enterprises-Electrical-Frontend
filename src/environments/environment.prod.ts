import { Environment } from '../app/core/models/environment.interface';

export const environment: Environment = {
    // Environment flags
    PRODUCTION: true,
    ENVIRONMENT: 'production',
    
    // API Configuration (environment-specific)
    API_BASE_URL: 'https://european-union.onrender.com/api/v1',
    
    // Feature Flags (environment-specific)
    ENABLE_LOGGING: true, // Disable logging in production
};