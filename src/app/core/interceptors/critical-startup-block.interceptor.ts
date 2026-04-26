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

export const CriticalStartupBlockInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const criticalStartupState = inject(CriticalStartupStateService);

  if (!criticalStartupState.criticalLoadFailed()) {
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
