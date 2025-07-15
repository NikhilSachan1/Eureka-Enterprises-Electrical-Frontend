import { Environment } from '@core/models/environment.interface';

export const environment: Environment = {
    // Environment flags
    PRODUCTION: true,
    ENVIRONMENT: 'production',
    
    // API Configuration (environment-specific)
    API_BASE_URL: 'https://prod.european-union.onrender.com/api/v2',
    
    // Feature Flags (environment-specific)
    ENABLE_LOGGING: true, // Disable logging in production
};