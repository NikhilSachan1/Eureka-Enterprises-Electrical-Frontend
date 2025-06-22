import { Environment } from '../app/core/models/environment.interface';

export const environment: Environment = {
    // Environment flags
    PRODUCTION: false,
    ENVIRONMENT: 'development',
    
    // API Configuration (environment-specific)
    API_BASE_URL: 'http://localhost:3000/api',
    
    // Feature Flags (environment-specific)
    ENABLE_LOGGING: true,
};