import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { API_ROUTES } from '@core/constants/api.constants';
import { UNSAVED_CHANGES_READ_METHODS } from '@core/constants/unsaved-changes.constants';
import { EnvironmentService } from '@core/services/environment.service';
import { UnsavedChangesService } from '@core/services/unsaved-changes.service';
import { tap } from 'rxjs';

/**
 * Tells UnsavedChangesService when a form's save reached the API, so the page can
 * navigate away after saving without the "leave without saving?" prompt.
 * Registered first, so it sees the final outcome after auth refresh and retry.
 */
export const UnsavedChangesInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiBaseUrl } = inject(EnvironmentService);

  if (
    UNSAVED_CHANGES_READ_METHODS.has(req.method) ||
    !req.url.startsWith(apiBaseUrl) ||
    // A token refresh is not the save itself; the retried save follows it.
    req.url.includes(API_ROUTES.AUTH.REFRESH_TOKEN)
  ) {
    return next(req);
  }

  const unsavedChanges = inject(UnsavedChangesService);

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          unsavedChanges.notifyWriteSucceeded();
        }
      },
      error: (error: unknown) => {
        // A 401 is retried after a token refresh; wait for that outcome.
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return;
        }
        unsavedChanges.notifyWriteFailed();
      },
    })
  );
};
