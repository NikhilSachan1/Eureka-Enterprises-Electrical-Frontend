import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Environment } from '@core/types/environment.interface';
import { EEnvironment } from '@core/types';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  // Cache environment object to avoid repeated property access
  private readonly _environment = environment;

  // Pre-compute commonly used values
  private readonly _isProduction = this._environment.PRODUCTION;
  private readonly _isDevelopment = !this._environment.PRODUCTION;
  private readonly _isLocal =
    this._environment.ENVIRONMENT === EEnvironment.LOCAL;
  /**
   * Get the current environment configuration
   */
  get environment(): Environment {
    return this._environment;
  }

  /**
   * Check if the application is running in production mode
   */
  get isProduction(): boolean {
    return this._isProduction;
  }

  /**
   * Check if the application is running in development mode
   */
  get isDevelopment(): boolean {
    return this._isDevelopment;
  }

  /**
   * Check if the application is running in local mode
   */
  get isLocal(): boolean {
    return this._isLocal;
  }

  /**
   * Get the current environment name
   */
  get currentEnvironment(): string {
    return this._environment.ENVIRONMENT;
  }

  /**
   * Environment of the API this build talks to, read from the API base URL host:
   * localhost / 127.0.0.1 → local, a host with "uat" or "dev" → uat, anything else → production.
   */
  get apiEnvironment(): EEnvironment {
    return this._apiEnvironment;
  }

  private readonly _apiEnvironment = resolveApiEnvironment(
    this._environment.API_BASE_URL
  );

  /**
   * Get the API base URL
   */
  get apiBaseUrl(): string {
    return this._environment.API_BASE_URL;
  }

  /**
   * Check if logging is enabled
   */
  get isLoggingEnabled(): boolean {
    return this._environment.ENABLE_LOGGING;
  }
}

function resolveApiEnvironment(apiBaseUrl: string): EEnvironment {
  let host: string;
  try {
    host = new URL(apiBaseUrl).hostname.toLowerCase();
  } catch {
    // Relative URL: the API is served from the same host as the app.
    host = typeof location === 'undefined' ? '' : location.hostname;
  }

  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local')
  ) {
    return EEnvironment.LOCAL;
  }
  if (/(^|[.-])(uat|dev|staging)([.-]|$)/.test(host)) {
    return EEnvironment.DEVELOPMENT;
  }
  return EEnvironment.PRODUCTION;
}
