import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Environment } from '@core/models/environment.interface';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  // Cache environment object to avoid repeated property access
  private readonly _environment = environment;

  // Pre-compute commonly used values
  private readonly _isProduction = this._environment.PRODUCTION;
  private readonly _isDevelopment = !this._environment.PRODUCTION;

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
   * Get the current environment name
   */
  get currentEnvironment(): string {
    return this._environment.ENVIRONMENT;
  }

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
