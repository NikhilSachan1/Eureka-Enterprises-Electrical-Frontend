import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  PoBreakdownGetRequestSchema,
  PoBreakdownGetResponseSchema,
} from '../schemas/get-po-breakdown.schema';
import {
  IPoBreakdownGetFormDto,
  IPoBreakdownGetResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class DocumentStatusService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getPoBreakdown(
    params: IPoBreakdownGetFormDto
  ): Observable<IPoBreakdownGetResponseDto> {
    this.logger.logUserAction('Get PO breakdown request', params);

    return this.apiService
      .getValidated(
        API_ROUTES.DOCUMENT_STATUS.PO_BREAKDOWN,
        {
          response: PoBreakdownGetResponseSchema,
          request: PoBreakdownGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IPoBreakdownGetResponseDto) => {
          this.logger.logUserAction('Get PO breakdown response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get PO breakdown error', error);
          } else {
            this.logger.logUserAction('Get PO breakdown error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
