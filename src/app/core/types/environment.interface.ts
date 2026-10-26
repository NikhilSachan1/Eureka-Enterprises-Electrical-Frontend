import { EEnvironment } from './environment.types';

/** Firebase web app config (public client values from Firebase console). */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface Environment {
  // Environment flags
  PRODUCTION: boolean;
  ENVIRONMENT: EEnvironment;

  // API Configuration (environment-specific)
  API_BASE_URL: string;

  // Feature Flags (environment-specific)
  ENABLE_LOGGING: boolean;

  /** Firebase Cloud Messaging (web push). Fill from Firebase console. */
  FIREBASE: FirebaseWebConfig;
  /** Web Push certificates VAPID key from Firebase Cloud Messaging. */
  FIREBASE_VAPID_KEY: string;
}
