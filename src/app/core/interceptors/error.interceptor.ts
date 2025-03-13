import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error) => {
            console.error('API Error:', error.message);

            if (error.status === 401) {
                authService.logout();
            }

            return throwError(() => new Error(error.message));
        })
    );
};
