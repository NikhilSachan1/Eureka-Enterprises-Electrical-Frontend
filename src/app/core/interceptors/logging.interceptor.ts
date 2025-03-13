import { HttpInterceptorFn } from '@angular/common/http';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const LoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  console.log(`📤 [API REQUEST] ${req.method} ${req.urlWithParams}`, req.body);

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(
            `✅ [API RESPONSE] ${req.method} ${req.urlWithParams} - ${duration}ms`,
            event.body
          );
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(
          `❌ [API ERROR] ${req.method} ${req.urlWithParams} - ${duration}ms`,
          error
        );
      }
    })
  );
};
