import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly environmentService = inject(EnvironmentService);

  /**
   * Log debug information
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      this.log('🔍 DEBUG', message, data, 'debug');
    }
  }

  /**
   * Log general information
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      this.log('ℹ️ INFO', message, data, 'info');
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      this.log('⚠️ WARN', message, data, 'warn');
    }
  }

  /**
   * Log errors
   */
  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      this.log('❌ ERROR', message, error, 'error');
    }
  }

  /**
   * Log user actions
   */
  logUserAction(action: string, data?: any): void {
    if (this.shouldLog('info')) {
      this.log('👤 USER ACTION', action, data, 'info');
    }
  }

  /**
   * Log API requests
   */
  logApiRequest(method: string, url: string, data?: any): void {
    if (this.shouldLog('info')) {
      this.log('🌐 API REQUEST', `${method} ${url}`, data, 'info');
    }
  }

  /**
   * Log API responses
   */
  logApiResponse(method: string, url: string, status: number, data?: any, responseTime?: number): void {
    if (this.shouldLog('info')) {
      const message = `${method} ${url} - ${status}`;
      const logData = { ...data, responseTime: responseTime ? `${responseTime}ms` : undefined };
      this.log('✅ API RESPONSE', message, logData, 'info');
    }
  }

  /**
   * Log API errors
   */
  logApiError(method: string, url: string, error: any, responseTime?: number): void {
    if (this.shouldLog('error')) {
      const message = `${method} ${url} - Error`;
      const logData = { error, responseTime: responseTime ? `${responseTime}ms` : undefined };
      this.log('❌ API ERROR', message, logData, 'error');
    }
  }

  /**
   * Centralized logging method
   */
  private log(level: string, message: string, data?: any, consoleMethod: 'debug' | 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logId = this.generateLogId();
    const sanitizedData = data;

    const logEntry = {
      id: logId,
      timestamp,
      level,
      message,
      data: sanitizedData,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Use console method based on log level
    switch (consoleMethod) {
      case 'debug':
        console.group(`${level} [${logId}]`);
        console.debug(`📅 Time: ${timestamp}`);
        console.debug(`🎯 Message: ${message}`);
        if (sanitizedData) console.debug(`📊 Data:`, sanitizedData);
        console.debug(`📍 URL: ${window.location.href}`);
        console.groupEnd();
        break;
      case 'info':
        console.group(`${level} [${logId}]`);
        console.info(`📅 Time: ${timestamp}`);
        console.info(`🎯 Message: ${message}`);
        if (sanitizedData) console.info(`📊 Data:`, sanitizedData);
        console.info(`📍 URL: ${window.location.href}`);
        console.groupEnd();
        break;
      case 'warn':
        console.group(`${level} [${logId}]`);
        console.warn(`📅 Time: ${timestamp}`);
        console.warn(`🎯 Message: ${message}`);
        if (sanitizedData) console.warn(`📊 Data:`, sanitizedData);
        console.warn(`📍 URL: ${window.location.href}`);
        console.groupEnd();
        break;
      case 'error':
        console.group(`${level} [${logId}]`);
        console.error(`📅 Time: ${timestamp}`);
        console.error(`🎯 Message: ${message}`);
        if (sanitizedData) console.error(`📊 Data:`, sanitizedData);
        console.error(`📍 URL: ${window.location.href}`);
        console.groupEnd();
        break;
    }
  }

  /**
   * Check if logging should be enabled based on environment and level
   */
  private shouldLog(level: string): boolean {
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
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 