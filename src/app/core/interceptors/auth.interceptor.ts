import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthService } from '../../features/auth-management/services/auth.service';
import { LoggerService } from '../services/logger.service';
import { SKIP_AUTH_ENDPOINTS } from '../constants/api.constants';

/**
 * Automatically adds JWT tokens to outgoing requests
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
  const authService = inject(AuthService);
  const logger = inject(LoggerService);

  // Skip authentication for certain requests
  if (shouldSkipAuth(req)) {
    return next(req);
  }

  // Add token to request if available
  const token = authService.getAuthToken();
  if (token) {
    req = addTokenToRequest(req, token);
  }

  // Handle the request and potential 401 errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        logger.warn('Received 401 error, logging out user');
        authService.logout();
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Check if authentication should be skipped for this request
 */
function shouldSkipAuth(req: HttpRequest<unknown>): boolean {
  return SKIP_AUTH_ENDPOINTS.some(endpoint => req.url.includes(endpoint));
}

/**
 * Add authentication token to request headers
 */
function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': req.headers.get('Content-Type') || 'application/json'
    }
  });
}