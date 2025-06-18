import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { EnvironmentService } from '../services/environment.service';

export const LoggingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  
  const environmentService = inject(EnvironmentService);
  
  // Only log if logging is enabled
  if (!environmentService.isLoggingEnabled) {
    return next(request);
  }

  const requestId = generateRequestId();
  const startTime = Date.now();

  // Log the request
  logRequest(request, requestId, environmentService);

  return next(request).pipe(
    tap((event) => {
      // Log successful response
      if (event.type === 4) { // HttpResponse
        const responseTime = Date.now() - startTime;
        logResponse(request, event, requestId, responseTime);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Log error response
      const responseTime = Date.now() - startTime;
      logError(request, error, requestId, responseTime);
      return throwError(() => error);
    })
  );
};

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log outgoing request
 */
function logRequest(request: HttpRequest<any>, requestId: string, environmentService: EnvironmentService): void {
  console.group(`🌐 API Request [${requestId}]`);
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Headers:', request.headers);
  if (request.params.keys().length > 0) {
    console.log('Params:', paramsToObject(request.params));
  }
  if (request.body) {
    console.log('Body:', request.body);
  }
  console.log('Environment:', environmentService.currentEnvironment);
  console.groupEnd();
}

/**
 * Log successful response
 */
function logResponse(request: HttpRequest<any>, response: any, requestId: string, responseTime: number): void {
  console.group(`✅ API Response [${requestId}]`);
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Status:', `${response.status} ${response.statusText}`);
  console.log('Response Time:', `${responseTime}ms`);
  console.log('Response:', response.body);
  console.log('Headers:', response.headers);
  console.groupEnd();
}

/**
 * Log error response
 */
function logError(request: HttpRequest<any>, error: HttpErrorResponse, requestId: string, responseTime: number): void {
  console.group(`❌ API Error [${requestId}]`);
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Status:', `${error.status} ${error.statusText}`);
  console.log('Response Time:', `${responseTime}ms`);
  console.log('Error:', error.error);
  console.log('Headers:', error.headers);
  console.groupEnd();
}

/**
 * Convert HttpParams to plain object
 */
function paramsToObject(params: any): any {
  const result: any = {};
  params.keys().forEach((key: string) => {
    result[key] = params.get(key);
  });
  return result;
}
