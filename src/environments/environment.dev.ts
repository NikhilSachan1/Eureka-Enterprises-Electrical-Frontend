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

  // Firebase web push (public values — replace with console config)
  FIREBASE: {
    apiKey: 'AIzaSyBHsnK3de9lnvPb0R8QaoSP8d1-UgXRplQ',
    authDomain: 'eureka-peopleops.firebaseapp.com',
    projectId: 'eureka-peopleops',
    storageBucket: 'eureka-peopleops.firebasestorage.app',
    messagingSenderId: '183927025702',
    appId: '1:183927025702:web:a238a58b40a9182523b6e7',
  },
  FIREBASE_VAPID_KEY:
    'BKEdr6iN8LsfzoUKk34Cn7b7r6Wmzf7r6Mxh8ww64Hs904cPhSqAHGxOMeoj9KBiw7qybCyozcXV0BKzmzwbIAY',
};
