import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import {
  AttachmentsGetRequestSchema,
  AttachmentsGetResponseSchema,
} from '@shared/schemas';
import { IAttachmentsGetResponseDto } from '@shared/types';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getFullMediaUrl(key: string): Observable<IAttachmentsGetResponseDto> {
    this.logger.logUserAction('Get Image URLs Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTACHMENTS.GET_FILE_URL,
        AttachmentsGetResponseSchema,
        { key },
        AttachmentsGetRequestSchema
      )
      .pipe(
        tap((response: IAttachmentsGetResponseDto) => {
          this.logger.logUserAction('Get Full Media URL Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Full Media URL Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Full Media URL Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
