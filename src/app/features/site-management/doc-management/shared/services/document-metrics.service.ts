import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import {
  DocumentMetricsGetRequestSchema,
  DocumentMetricsGetResponseSchema,
  IDocumentMetricsGetFormDto,
  IDocumentMetricsGetResponseDto,
} from '../schemas/get-document-metrics.schema';

@Injectable({
  providedIn: 'root',
})
export class DocumentMetricsService {
  private readonly apiService = inject(ApiService);
  private readonly logger = inject(LoggerService);

  /** Counts and amounts for the workspace document tabs, for the given filters. */
  getMetrics(
    params: IDocumentMetricsGetFormDto
  ): Observable<IDocumentMetricsGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.DOCUMENT_STATUS.METRICS,
        {
          response: DocumentMetricsGetResponseSchema,
          request: DocumentMetricsGetRequestSchema,
        },
        params
      )
      .pipe(
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get document metrics error',
              error
            );
          } else {
            this.logger.logUserAction('Get document metrics error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
