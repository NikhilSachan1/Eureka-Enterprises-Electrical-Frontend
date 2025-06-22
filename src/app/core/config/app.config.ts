export const APP_CONFIG = {
  // Application Information
  name: 'Eureka Enterprises',
  version: '1.0.0',
  description: 'Electrical Management System',
  
  // API Configuration
  API_CONFIG: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 3000,
  },

  // Cache Configuration
  CACHE_CONFIG: {
    defaultDuration: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
    cleanupInterval: 1000 * 60 * 5, // 5 minutes
  },
}; 