import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LoggerService } from '../services/logger.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const messageService = inject(MessageService);
    const logger = inject(LoggerService);

    // Don't retry POST, PUT, DELETE requests
    const shouldRetry = req.method === 'GET';
    const maxRetries = shouldRetry ? 3 : 0;

    return next(req).pipe(
        retry({ count: maxRetries, delay: 1000 }),
        catchError((error) => {
            logger.error(`API Error: ${req.method} ${req.url}`, error);

            let errorMessage: string = 'An unexpected error occurred';

            if (error.status === 401) {
                errorMessage = 'Your session has expired. Please login again.';
                // authService.logout();
            } else if (error.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
            } else if (error.status === 404) {
                errorMessage = 'The requested resource was not found.';
            } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.status === 0) {
                errorMessage = 'Network error. Please check your connection.';
            }

            messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
            });

            return throwError(() => new Error(errorMessage));
        })
    );
};
