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

            if (error.status === 0) {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.status === 401) {
                errorMessage = 'Unauthorized. Please log in again.';
            } else if (error.status === 403) {
                errorMessage = 'Access denied. You don\'t have permission for this action.';
            } else if (error.status === 404) {
                errorMessage = 'Resource not found.';
            } else if (error.status === 422) {
                errorMessage = 'Validation error. Please check your input.';
            } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (error.message) {
                errorMessage = error.message;
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
