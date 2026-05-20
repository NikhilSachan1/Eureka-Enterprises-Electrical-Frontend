import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import {
  MyFilesListRequestSchema,
  MyFilesListResponseSchema,
} from '../schemas';
import {
  IMyFilesListFormDto,
  IMyFilesListResponseDto,
} from '../types/my-files.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyFilesService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getMyFilesList(
    params?: IMyFilesListFormDto
  ): Observable<IMyFilesListResponseDto> {
    this.logger.logUserAction('Get My Files List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.MY_FILES.LIST,
        {
          response: MyFilesListResponseSchema,
          request: MyFilesListRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IMyFilesListResponseDto) => {
          this.logger.logUserAction('Get My Files List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get My Files List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get My Files List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
