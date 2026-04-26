import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CriticalStartupStateService } from '@core/services';
import { API_ROUTES } from '@core/constants';

export const CriticalStartupBlockInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const criticalStartupState = inject(CriticalStartupStateService);
  const isHealthCheckRequest = req.url.includes(API_ROUTES.HEALTH.CHECK);

  if (!criticalStartupState.criticalLoadFailed() || isHealthCheckRequest) {
    return next(req);
  }

  return throwError(
    () =>
      new HttpErrorResponse({
        url: req.url,
        status: 503,
        statusText: 'Critical startup failure',
        error: {
          message:
            'Critical startup failed. API requests are blocked until reload.',
        },
      })
  );
};
