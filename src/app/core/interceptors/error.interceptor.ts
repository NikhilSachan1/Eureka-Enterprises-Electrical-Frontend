import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '@core/services';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const logger = inject(LoggerService);
    
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            logger.logApiError(req.method, req.url, error.error);
            return throwError(() => error);
        })
    );
};
