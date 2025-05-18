import { HttpInterceptorFn } from '@angular/common/http';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

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

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.urlWithParams,
    duration: 0
  };

  // Log request
  console.group(`📤 [${requestId}] API Request`);
  console.log('Method:', req.method);
  console.log('URL:', req.urlWithParams);
  console.log('Headers:', req.headers);
  if (req.body) {
    console.log('Body:', req.body);
  }
  console.groupEnd();

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          logEntry.duration = duration;
          logEntry.status = event.status;
          logEntry.body = event.body;

          // Log response
          console.group(`✅ [${requestId}] API Response`);
          console.log('Status:', event.status);
          console.log('Duration:', `${duration}ms`);
          console.log('Body:', event.body);
          console.groupEnd();

          // Log performance metrics
          if (duration > 1000) {
            console.warn(`⚠️ [${requestId}] Slow API Response: ${duration}ms for ${req.method} ${req.urlWithParams}`);
          }
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        logEntry.duration = duration;
        logEntry.status = error.status;
        logEntry.error = error;

        // Log error
        console.group(`❌ [${requestId}] API Error`);
        console.error('Status:', error.status);
        console.error('Duration:', `${duration}ms`);
        console.error('Error:', error);
        console.groupEnd();

        // Log error metrics
        console.error(`🔴 [${requestId}] Failed API Call: ${req.method} ${req.urlWithParams} - ${error.status} (${duration}ms)`);
      }
    })
  );
};
