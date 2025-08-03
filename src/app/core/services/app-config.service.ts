import { Injectable } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { IAppConfig } from '@core/types';

/**
 * Application Configuration Service
 * Provides centralized access to application configuration
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly _config = APP_CONFIG;

  /**
   * Get the complete application configuration
   */
  get config(): IAppConfig {
    return this._config;
  }

  /**
   * Get the API configuration
   */
  get apiConfig(): IAppConfig['API_CONFIG'] {
    return this._config.API_CONFIG;
  }

  /**
   * Get the API timeout configuration
   */
  get apiTimeout(): number {
    return this._config.API_CONFIG.timeout;
  }

  /**
   * Get the API retry attempts configuration
   */
  get apiRetryAttempts(): number {
    return this._config.API_CONFIG.retryAttempts;
  }

  /**
   * Get the API retry delay configuration
   */
  get apiRetryDelay(): number {
    return this._config.API_CONFIG.retryDelay;
  }

  /**
   * Get the cache configuration
   */
  get cacheConfig(): IAppConfig['CACHE_CONFIG'] {
    return this._config.CACHE_CONFIG;
  }

  /**
   * Get the cache default duration
   */
  get cacheDefaultDuration(): number {
    return this._config.CACHE_CONFIG.defaultDuration;
  }

  /**
   * Get the cache max entries
   */
  get cacheMaxEntries(): number {
    return this._config.CACHE_CONFIG.maxEntries;
  }

  /**
   * Get the cache cleanup interval
   */
  get cacheCleanupInterval(): number {
    return this._config.CACHE_CONFIG.cleanupInterval;
  }

  /**
   * Get the application name
   */
  get appName(): string {
    return this._config.name;
  }

  /**
   * Get the application version
   */
  get appVersion(): string {
    return this._config.version;
  }

  /**
   * Get the application description
   */
  get appDescription(): string {
    return this._config.description;
  }

  /**
   * Get the application notification configuration
   */
  get notificationConfig(): IAppConfig['NOTIFICATION_CONFIG'] {
    return this._config.NOTIFICATION_CONFIG;
  }

  /**
   * Get the application date formats
   */
  get dateFormats(): IAppConfig['DATE_FORMATS'] {
    return this._config.DATE_FORMATS;
  }

  /**
   * Get the application time formats
   */
  get timeFormats(): IAppConfig['TIME_FORMATS'] {
    return this._config.TIME_FORMATS;
  }

  /**
   * Get the application currency configuration
   */
  get currencyConfig(): IAppConfig['CURRENCY_CONFIG'] {
    return this._config.CURRENCY_CONFIG;
  }

  /**
   * Get the application table configuration
   */
  get tablePaginationConfig(): IAppConfig['TABLE_PAGINATION_CONFIG'] {
    return this._config.TABLE_PAGINATION_CONFIG;
  }

  /**
   * Get the application dialog configuration
   */
  get confirmationDialogConfig(): IAppConfig['CONFIRMATION_DIALOG_CONFIG'] {
    return this._config.CONFIRMATION_DIALOG_CONFIG;
  }
}
