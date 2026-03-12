import { Injectable, inject, signal, computed } from '@angular/core';
import { EnvironmentService } from '@core/services/environment.service';
import { LogLevel } from '@core/types/environment.interface';
import {
  ELogTypes,
  IApiErrorResponse,
  ILogEntry,
  LogCategory,
} from '@core/types';

const MAX_LOG_ENTRIES = 1000;

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly environmentService = inject(EnvironmentService);

  /** In-memory log store for centralized viewing/export - only when logging enabled */
  private readonly _logStore = signal<ILogEntry[]>([]);
  readonly logs = this._logStore.asReadonly();
  readonly logCount = computed(() => this._logStore().length);

  /** Last navigated page - set by RouterLoggingService for HTTP log context */
  private _currentPage = signal<string | undefined>(undefined);
  setCurrentPage(page: string): void {
    this._currentPage.set(page);
  }

  /** Frames/paths to skip - framework, Angular, RxJS, interceptors */
  private static readonly SKIP_PATTERNS = [
    'LoggerService',
    'captureCallContext',
    'addStructuredLog',
    'HttpLoggingInterceptor',
    'RolePayloadSanitizerInterceptor',
    'AuthInterceptor',
    'ErrorInterceptor',
    'HttpInterceptorHandler',
    'HttpInterceptor',
    'HttpClient',
    'ApiService',
    'runInInjectionContext',
    'inject',
    'zone',
    'core.mjs',
    'SafeSubscriber',
    'Subscriber',
    'subscribe',
    'tap',
    'pipe',
    'catchError',
    'map',
    'switchMap',
    'mergeMap',
    'concatMap',
    'forkJoin',
    'rxjs',
    'invoke',
    'runTask',
    'drainMicroTask',
    'onInvoke',
    'schedule',
    '.angular',
    'chunk-',
    '/deps/',
    'node_modules',
  ];

  /** Only keep frames that are clearly app code (Component/Service/Resolver) */
  private isAppFrame(frame: string): boolean {
    const lower = frame.toLowerCase();
    if (
      LoggerService.SKIP_PATTERNS.some(p => lower.includes(p.toLowerCase()))
    ) {
      return false;
    }
    const namePart = frame.split(' (')[0] ?? '';
    const pathPart = frame.match(/\(([^)]+)\)/)?.[1] ?? '';
    const isAppClass =
      /(Component|Service|Resolver|Guard)\.\w+$/.test(namePart) ||
      /\w+(Component|Service|Resolver|Guard)\.\w+/.test(namePart);
    const isAppPath =
      /\.(component|service|resolver|guard)\.(ts|tsx)/.test(pathPart) ||
      /(features|shared)\//.test(pathPart) ||
      /(get-|edit-|add-|delete-|list-|apply-|approval-)[a-z-]+\./.test(
        pathPart
      );
    return isAppClass || isAppPath;
  }

  /** Capture call chain: only Component/Service/Resolver (no framework noise) */
  captureCallContext(): {
    source?: string;
    method?: string;
    callStack?: string[];
  } {
    try {
      const err = new Error();
      const lines = err.stack?.split('\n').slice(2, 35) ?? [];
      const parsed: string[] = [];

      for (const line of lines) {
        const frame = this.parseStackLine(line);
        if (frame && frame.length >= 4 && this.isAppFrame(frame)) {
          parsed.push(frame);
        }
      }

      const chain = parsed.slice(0, 8);
      const reversed = [...chain].reverse();
      const first = reversed[0];
      const [source, method] = first?.match(/(\w+)\.(\w+)/)?.slice(1) ?? [];
      return {
        source: source ?? first?.split(/[\s.(]/)[0],
        method: method ?? first?.split('.')[1]?.split(/\s/)[0],
        callStack: reversed,
      };
    } catch {
      return {};
    }
  }

  private parseStackLine(line: string): string | null {
    line = line.trim();
    const m1 = line.match(/at\s+(?:async\s+)?(\w+)\s*\.\s*(\w+)\s*\(([^)]+)\)/);
    if (m1) {
      return `${m1[1]}.${m1[2]} (${m1[3]})`;
    }
    const m2 = line.match(/at\s+(?:async\s+)?(\w+)\s*\(([^)]+)\)/);
    if (m2) {
      return `${m2[1]} (${m2[2]})`;
    }
    const m3 = line.match(/at\s+([^(]+)\s*\(([^)]+)\)/);
    if (m3) {
      return `${m3[1].trim()} (${m3[2]})`;
    }
    return null;
  }

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
   * Add structured log entry to in-memory store (for dev panel / export)
   */
  addStructuredLog(
    level: ELogTypes,
    category: LogCategory,
    message: string,
    options?: {
      data?: unknown;
      source?: string;
      method?: string;
      callStack?: string[];
      correlationId?: string;
      durationMs?: number;
      currentPage?: string;
    }
  ): void {
    if (!this.environmentService.shouldLogLevel(level as LogLevel)) {
      return;
    }

    const ctx = options?.callStack ? {} : this.captureCallContext();
    const entry: ILogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      source: options?.source ?? ctx.source,
      method: options?.method ?? ctx.method,
      callStack: options?.callStack ?? ctx.callStack,
      data: options?.data,
      url: window.location.href,
      correlationId: options?.correlationId,
      durationMs: options?.durationMs,
      currentPage: options?.currentPage ?? this._currentPage(),
    };

    this._logStore.update(store => {
      const next = [...store, entry];
      return next.length > MAX_LOG_ENTRIES
        ? next.slice(-MAX_LOG_ENTRIES)
        : next;
    });
  }

  getLogs(): ILogEntry[] {
    return [...this._logStore()];
  }

  clearLogs(): void {
    this._logStore.set([]);
  }

  exportLogsAsJson(): string {
    return JSON.stringify(this._logStore(), null, 2);
  }

  downloadLogs(): void {
    const blob = new Blob([this.exportLogsAsJson()], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `app-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
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

    // Add to structured store for centralized view
    const ctx = this.captureCallContext();
    this.addStructuredLog(consoleMethod, 'info', message, {
      data,
      source: ctx.source,
      method: ctx.method,
      callStack: ctx.callStack,
    });

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
   * Check if logging should be enabled based on env LOG_LEVEL
   */
  private shouldLog(level: ELogTypes): boolean {
    return this.environmentService.shouldLogLevel(level as LogLevel);
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
