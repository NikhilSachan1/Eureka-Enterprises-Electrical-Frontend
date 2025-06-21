import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const LoggingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);
  const startTime = Date.now();

  // Log the request
  logger.logApiRequest(request.method, request.url, {
    headers: request.headers,
    body: request.body,
    params: request.params
  });

  return next(request).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) { // HttpResponse
          const responseTime = Date.now() - startTime;
          logger.logApiResponse(request.method, request.url, event.status, {
            body: event.body,
            headers: event.headers
          }, responseTime);
        }
      },
      error: (error: HttpErrorResponse) => {
        const responseTime = Date.now() - startTime;
        logger.logApiError(request.method, request.url, error, responseTime);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const responseTime = Date.now() - startTime;
      logger.logApiError(request.method, request.url, error, responseTime);
      throw error;
    })
  );
};