import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpEventType,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, throwError, catchError } from 'rxjs';
import { LoggerService } from '@core/services';
import { EnvironmentService } from '@core/services/environment.service';
import { ELogTypes } from '@core/types';

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret'];

function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  if (data instanceof FormData) {
    return formDataToObject(data);
  }
  if (typeof data === 'object' && !Array.isArray(data)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [
        k,
        SENSITIVE_KEYS.some(s => k.toLowerCase().includes(s))
          ? '***'
          : sanitize(v),
      ])
    );
  }
  return data;
}

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  const entries = (
    formData as unknown as { entries(): IterableIterator<[string, unknown]> }
  ).entries();
  for (const [key, value] of entries) {
    const displayValue =
      value instanceof File
        ? `[File: ${value.name}, ${value.size} bytes, ${value.type}]`
        : value instanceof Blob && !(value instanceof File)
          ? `[Blob: ${value.size} bytes, ${value.type}]`
          : SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))
            ? '***'
            : value;

    if (key in obj) {
      const existing = obj[key];
      obj[key] = Array.isArray(existing)
        ? [...existing, displayValue]
        : [existing, displayValue];
    } else {
      obj[key] = displayValue;
    }
  }
  return obj;
}

export const HttpLoggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);
  const env = inject(EnvironmentService);

  if (!env.shouldLogLevel('info')) {
    return next(req);
  }

  const correlationId =
    req.headers.get('X-Correlation-Id') ??
    `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const startTime = performance.now();
  const ctx = logger.captureCallContext();

  // Log REQUEST (payload = body for POST/PUT/PATCH, params for GET)
  const paramKeys = req.params.keys();
  const requestPayload =
    req.body !== null && req.body !== undefined
      ? sanitize(req.body)
      : paramKeys.length > 0
        ? Object.fromEntries(paramKeys.map(k => [k, req.params.get(k)]))
        : undefined;

  logger.addStructuredLog(ELogTypes.INFO, 'http', `${req.method} ${req.url}`, {
    source: ctx.source,
    method: ctx.method,
    callStack: ctx.callStack,
    correlationId,
    data: {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(
        req.headers
          .keys()
          .map(k => [
            k,
            k.toLowerCase() === 'authorization' ? '***' : req.headers.get(k),
          ])
      ),
      payload: requestPayload,
    },
  });

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.Response) {
          const resp = event as {
            body: unknown;
            status: number;
            statusText: string;
          };
          const durationMs = Math.round(performance.now() - startTime);
          const responseBody =
            resp.body !== null && resp.body !== undefined
              ? sanitize(resp.body)
              : undefined;
          logger.addStructuredLog(
            ELogTypes.INFO,
            'http',
            `✓ ${req.method} ${req.url} → ${resp.status} (${durationMs}ms)`,
            {
              source: ctx.source,
              method: ctx.method,
              correlationId,
              durationMs,
              data: {
                status: resp.status,
                statusText: resp.statusText,
                durationMs,
                response: responseBody,
              },
            }
          );
        }
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const durationMs = Math.round(performance.now() - startTime);
      logger.addStructuredLog(
        ELogTypes.ERROR,
        'http',
        `✗ ${req.method} ${req.url} → ${error.status} (${durationMs}ms)`,
        {
          source: ctx.source,
          method: ctx.method,
          callStack: error?.error?.stack?.split?.('\n') ?? ctx.callStack,
          correlationId,
          durationMs,
          data: {
            status: error.status,
            statusText: error.statusText,
            response:
              error.error !== null && error.error !== undefined
                ? sanitize(error.error)
                : undefined,
            durationMs,
          },
        }
      );
      return throwError(() => error);
    })
  );
};
