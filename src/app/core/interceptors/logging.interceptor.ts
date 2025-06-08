import { HttpInterceptorFn } from '@angular/common/http';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { LoggerService } from '../services/logger.service';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  duration: number;
  status?: number;
  body?: any;
  error?: any;
}

export const LoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const logger = inject(LoggerService);

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.urlWithParams,
    duration: 0
  };

  // Log request
  logger.logApiRequest(req.method, req.urlWithParams, req.body);

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          logEntry.duration = duration;
          logEntry.status = event.status;
          logEntry.body = event.body;

          // Log response
          logger.logApiResponse(req.method, req.urlWithParams, event.status, duration, event.body);

          // Log performance metrics
          logger.logSlowResponse(req.method, req.urlWithParams, duration);
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        logEntry.duration = duration;
        logEntry.status = error.status;
        logEntry.error = error;

        // Log error
        logger.logApiError(req.method, req.urlWithParams, error, duration);
      }
    })
  );
};
