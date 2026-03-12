import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Environment, LogLevel } from '@core/types/environment.interface';
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

  /**
   * Get configured log level (default: debug in dev, error in prod)
   */
  get logLevel(): LogLevel {
    return (
      this._environment.LOG_LEVEL ?? (this._isProduction ? 'error' : 'debug')
    );
  }

  /**
   * Check if a log level should be output based on env config.
   * Order: debug < info < warn < error. Level passes if >= configured min.
   */
  shouldLogLevel(level: LogLevel): boolean {
    if (!this._environment.ENABLE_LOGGING) {
      return false;
    }
    const order: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    const minLevel = this.logLevel;
    return order[level] >= order[minLevel];
  }

  /**
   * Check if test data is enabled
   */
  get isTestDataEnabled(): boolean {
    return this._environment.ENABLE_TEST_DATA;
  }
}
