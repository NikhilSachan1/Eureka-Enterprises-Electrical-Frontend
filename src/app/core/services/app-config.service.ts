import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app.config';
import { IAppConfig } from '../models/app-config.model';

/**
 * Application Configuration Service
 * Provides centralized access to application configuration
 */
@Injectable({
  providedIn: 'root'
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
} 