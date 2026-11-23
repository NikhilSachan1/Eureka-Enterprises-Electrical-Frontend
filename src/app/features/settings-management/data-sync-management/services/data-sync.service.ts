import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  DataSyncRunResponseSchema,
  DataSyncStatusResponseSchema,
} from '../schemas/data-sync.schema';
import {
  IDataSyncRunResponseDto,
  IDataSyncStatusResponseDto,
} from '../types/data-sync.dto';

@Injectable({
  providedIn: 'root',
})
export class DataSyncService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getStatus(): Observable<IDataSyncStatusResponseDto> {
    this.logger.logUserAction('Get Data Sync Status Request');

    return this.apiService
      .getValidated(API_ROUTES.DATA_SYNC.STATUS, {
        response: DataSyncStatusResponseSchema,
      })
      .pipe(
        tap((response: IDataSyncStatusResponseDto) => {
          this.logger.logUserAction('Get Data Sync Status Response', response);
        }),
        catchError(error => {
          this.logger.logUserAction('Get Data Sync Status Error', error);
          return throwError(() => error);
        })
      );
  }

  syncProdToUat(): Observable<IDataSyncRunResponseDto> {
    this.logger.logUserAction('Prod To UAT Sync Request');

    return this.apiService
      .postValidated(API_ROUTES.DATA_SYNC.PROD_TO_UAT, {
        response: DataSyncRunResponseSchema,
      })
      .pipe(
        tap((response: IDataSyncRunResponseDto) => {
          this.logger.logUserAction('Prod To UAT Sync Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Prod To UAT Sync Error', error);
          } else {
            this.logger.logUserAction('Prod To UAT Sync Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
