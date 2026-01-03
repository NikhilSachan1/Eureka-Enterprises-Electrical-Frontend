import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  throwError,
  catchError,
  switchMap,
  filter,
  take,
} from 'rxjs';

import { AuthService } from '@features/auth-management/services/auth.service';
import { LoggerService, TimezoneService } from '@core/services';
import { SKIP_AUTH_ENDPOINTS, API_ROUTES } from '@core/constants';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const timezoneService = inject(TimezoneService);

  const reqWithCommonHeaders = setCommonHeaders(
    req,
    authService,
    timezoneService
  );

  // For public endpoints - skip auth token, but common headers are already added
  if (shouldSkipAuthToken(reqWithCommonHeaders)) {
    return next(reqWithCommonHeaders);
  }

  const authReq = addAuthToken(reqWithCommonHeaders, authService);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const token = authService.getAuthToken();

      if (error.status === 401 && token && !isRefreshTokenRequest(authReq)) {
        return handle401Error(authReq, next, authService, logger);
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  logger: LoggerService
): Observable<HttpEvent<unknown>> {
  // If refresh already in progress → queue request
  if (authService.isTokenRefreshing()) {
    logger.info('Token refresh in progress, queuing request');

    return authService.getRefreshTokenSubject().pipe(
      filter((token): token is string => !!token),
      take(1),
      switchMap(token => next(addTokenToRequest(req, token)))
    );
  }

  // Start refresh flow
  authService.setRefreshing(true);
  authService.getRefreshTokenSubject().next(null);

  logger.warn('Access token expired, refreshing token');

  return authService.refreshAccessToken().pipe(
    switchMap(response => {
      authService.setRefreshing(false);
      authService.getRefreshTokenSubject().next(response.accessToken);

      logger.info('Token refreshed, retrying request');
      return next(addTokenToRequest(req, response.accessToken));
    }),
    catchError(refreshError => {
      authService.setRefreshing(false);
      authService.getRefreshTokenSubject().next(null);
      logger.error('Refresh token failed - forcing logout', refreshError);
      authService.forceLogout();

      return throwError(() => refreshError);
    })
  );
}

/* =========================
   HELPERS
   ========================= */

function shouldSkipAuthToken(req: HttpRequest<unknown>): boolean {
  return SKIP_AUTH_ENDPOINTS.some(endpoint => req.url.includes(endpoint));
}

function isRefreshTokenRequest(req: HttpRequest<unknown>): boolean {
  return req.url.includes(API_ROUTES.AUTH.REFRESH_TOKEN);
}

function setCommonHeaders(
  req: HttpRequest<unknown>,
  authService: AuthService,
  timezoneService: TimezoneService
): HttpRequest<unknown> {
  const activeRole = authService.user()?.activeRole ?? '';

  const commonHeaders: Record<string, string> = {
    'X-Timezone': timezoneService.timezone,
    'X-Active-Role': activeRole,
    'X-Correlation-Id': generateUUID(),
    'X-Source-Type': 'web',
    'X-Client-Type': 'web',
  };

  return req.clone({
    setHeaders: {
      ...getExistingHeaders(req),
      ...commonHeaders,
    },
  });
}

function addAuthToken(
  req: HttpRequest<unknown>,
  authService: AuthService
): HttpRequest<unknown> {
  const token = authService.getAuthToken();

  if (!token) {
    return req;
  }

  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function addTokenToRequest(
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function getExistingHeaders(req: HttpRequest<unknown>): Record<string, string> {
  return req.headers.keys().reduce(
    (acc, key) => {
      acc[key] = req.headers.get(key) ?? '';
      return acc;
    },
    {} as Record<string, string>
  );
}

function generateUUID(): string {
  return crypto?.randomUUID();
}
