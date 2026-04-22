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
  return SKIP_AUTH_ENDPOINTS.some(endpoint => {
    if (typeof endpoint === 'string') {
      return req.url.includes(endpoint);
    }
    if (typeof endpoint === 'function') {
      const basePath = 'auth/reset-password/';
      return req.url.includes(basePath);
    }
    return false;
  });
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
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  if (c && typeof c.getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    c.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const h = Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
