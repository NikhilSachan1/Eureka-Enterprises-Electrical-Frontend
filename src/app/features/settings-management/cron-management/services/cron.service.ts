import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  ICronGetResponseDto,
  ICronRunFormDto,
  ICronRunResponseDto,
} from '../types/cron.dto';
import { API_ROUTES } from '@core/constants';
import { CronGetResponseSchema } from '../schemas/get-cron.schema';
import {
  CronRunRequestSchema,
  CronRunResponseSchema,
} from '../schemas/run-cron.schema';

@Injectable({
  providedIn: 'root',
})
export class CronService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  runCronJob(formData: ICronRunFormDto): Observable<ICronRunResponseDto> {
    this.logger.logUserAction('Run Cron Job Request');

    return this.apiService
      .postValidated(
        API_ROUTES.CRON.RUN_JOB,
        {
          response: CronRunResponseSchema,
          request: CronRunRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ICronRunResponseDto) => {
          this.logger.logUserAction('Run Cron Job Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Run Cron Job Error', error);
          } else {
            this.logger.logUserAction('Run Cron Job Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getCronJobList(): Observable<ICronGetResponseDto> {
    this.logger.logUserAction('Get Cron Job List Request');

    return this.apiService
      .getValidated(API_ROUTES.CRON.GET_JOBS, {
        response: CronGetResponseSchema,
      })
      .pipe(
        tap((response: ICronGetResponseDto) => {
          this.logger.logUserAction('Get Cron Job List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Cron Job List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Cron Job List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
