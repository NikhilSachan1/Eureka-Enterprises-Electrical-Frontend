import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '@core/services/environment.service';
import { IApiErrorResponse } from '@core/models';
import { ELogTypes } from '../types';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly environmentService = inject(EnvironmentService);

  /**
   * Log debug information
   */
  debug(message: string, data?: unknown): void {
    this.log('🔍 DEBUG', message, data, ELogTypes.DEBUG);
  }

  /**
   * Log general information
   */
  info(message: string, data?: unknown): void {
    this.log('ℹ️ INFO', message, data, ELogTypes.INFO);
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: unknown): void {
    this.log('⚠️ WARN', message, data, ELogTypes.WARN);
  }

  /**
   * Log errors
   */
  error(message: string, error?: unknown): void {
    this.log('❌ ERROR', message, error, ELogTypes.ERROR);
  }

  /**
   * Log user actions
   */
  logUserAction(action: string, data?: unknown): void {
    this.log('👤 USER ACTION', action, data, ELogTypes.INFO);
  }

  /**
   * Log API requests
   */
  logApiRequest(method: string, url: string, data?: unknown): void {
    this.log(
      '🌐 API REQUEST',
      `Method: ${method} URL: ${url}`,
      data,
      ELogTypes.INFO
    );
  }

  /**
   * Log API responses
   */
  logApiResponse(method: string, url: string, data?: unknown): void {
    this.log(
      '🌐 API RESPONSE',
      `Method: ${method} URL: ${url}`,
      data,
      ELogTypes.INFO
    );
  }

  /**
   * Log API errors with specific formatting
   */
  logApiError(method: string, url: string, error: IApiErrorResponse): void {
    const message = `Method: ${method} URL: ${url} - ${error.error.code || 'Unknown'} Error`;
    this.log('❌ API ERROR', message, error, ELogTypes.ERROR);
  }

  /**
   * Log DTO validation errors
   */
  logDtoValidationErrors(message: string, errors: unknown): void {
    this.log('❌ DTO VALIDATION ERRORS', message, errors, ELogTypes.ERROR);
  }

  /**
   * Centralized logging method with shouldLog check
   */
  private log(
    level: string,
    message: string,
    data?: unknown,
    consoleMethod: ELogTypes = ELogTypes.INFO
  ): void {
    // Check if logging should be enabled - SINGLE CHECK HERE
    if (!this.shouldLog(consoleMethod)) {
      return; // Exit early if logging is disabled
    }

    const timestamp = new Date().toLocaleString();
    const logId = this.generateLogId();

    // Use console method based on log level
    switch (consoleMethod) {
      case 'debug':
        console.group(`${level} [${logId}]`);
        console.debug(`📅 Time: ${timestamp}`);
        console.debug(`🎯 ${message}`);
        if (data) {
          console.debug(`📊 Data:`, data);
        }
        console.debug(`📍 Component URL: ${window.location.href}`);
        console.groupEnd();
        break;
      case 'info':
        console.group(`${level} [${logId}]`);
        console.info(`📅 Time: ${timestamp}`);
        console.info(`🎯 ${message}`);
        if (data) {
          console.info(`📊 Data:`, data);
        }
        console.info(`📍 Component URL: ${window.location.href}`);
        console.groupEnd();
        break;
      case 'warn':
        console.group(`${level} [${logId}]`);
        console.warn(`📅 Time: ${timestamp}`);
        console.warn(`🎯 ${message}`);
        if (data) {
          console.warn(`📊 Data:`, data);
        }
        console.warn(`📍 Component URL: ${window.location.href}`);
        console.groupEnd();
        break;
      case 'error':
        console.group(`${level} [${logId}]`);
        console.error(`📅 Time: ${timestamp}`);
        console.error(`🎯 ${message}`);
        if (data) {
          console.error(`📊 Data:`, data);
        }
        console.error(`📍 Component URL: ${window.location.href}`);
        console.groupEnd();
        break;
      default:
        console.group(`${level} [${logId}]`);
        console.info(`📅 Time: ${timestamp}`);
        console.info(`🎯 ${message}`);
        if (data) {
          console.info(`📊 Data:`, data);
        }
        console.info(`📍 Component URL: ${window.location.href}`);
        console.groupEnd();
        break;
    }
  }

  /**
   * Check if logging should be enabled based on environment and level
   */
  private shouldLog(level: ELogTypes): boolean {
    if (!this.environmentService.isLoggingEnabled) {
      return false;
    }

    // In production, only log warnings and errors
    if (this.environmentService.isProduction) {
      return level === 'warn' || level === 'error';
    }

    // In development, log everything
    return true;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
