import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly isDev = !environment.PRODUCTION;
  private readonly logLevel = this.isDev ? LogLevel.DEBUG : LogLevel.ERROR;

  error(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(`🔴 [ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(`🟡 [WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(`🔵 [INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(`🟢 [DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log API requests and responses
   */
  logApiRequest(method: string, url: string, body?: any): void {
    if (this.isDev) {
      console.group(`📤 API Request: ${method} ${url}`);
      if (body) {
        console.log('Body:', body);
      }
      console.groupEnd();
    }
  }

  logApiResponse(method: string, url: string, status: number, duration: number, body?: any): void {
    if (this.isDev) {
      const statusIcon = status >= 200 && status < 300 ? '✅' : '❌';
      console.group(`${statusIcon} API Response: ${method} ${url} (${status}) - ${duration}ms`);
      if (body) {
        console.log('Response:', body);
      }
      console.groupEnd();
    }
  }

  logApiError(method: string, url: string, error: any, duration: number): void {
    console.group(`❌ API Error: ${method} ${url} - ${duration}ms`);
    console.error('Error:', error);
    console.groupEnd();
  }

  /**
   * Log performance warnings
   */
  logSlowResponse(method: string, url: string, duration: number): void {
    if (duration > 1000) {
      this.warn(`Slow API Response: ${duration}ms for ${method} ${url}`);
    }
  }

  /**
   * Log user actions for debugging
   */
  logUserAction(action: string, data?: any): void {
    if (this.isDev) {
      this.debug(`User Action: ${action}`, data);
    }
  }

  /**
   * Log component lifecycle events
   */
  logComponentLifecycle(component: string, event: string, data?: any): void {
    if (this.isDev) {
      this.debug(`${component} - ${event}`, data);
    }
  }
} 