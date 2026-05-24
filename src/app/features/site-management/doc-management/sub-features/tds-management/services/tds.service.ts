import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddTdsPaymentReleaseRequestSchema,
  AddTdsPaymentReleaseResponseSchema,
  TdsEntryDetailGetResponseSchema,
  TdsEntryGetRequestSchema,
  TdsEntryGetResponseSchema,
  RevertTdsEntryRequestSchema,
  RevertTdsEntryResponseSchema,
  VerifyTdsEntryRequestSchema,
  VerifyTdsEntryResponseSchema,
} from '../schemas';
import {
  IAddTdsPaymentReleaseFormDto,
  IAddTdsPaymentReleaseResponseDto,
  ITdsEntryDetailGetResponseDto,
  ITdsEntryGetFormDto,
  ITdsEntryGetResponseDto,
  IRevertTdsEntryFormDto,
  IRevertTdsEntryResponseDto,
  IVerifyTdsEntryFormDto,
  IVerifyTdsEntryResponseDto,
} from '../types/tds.dto';

@Injectable({
  providedIn: 'root',
})
export class TdsService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getTdsEntryList(
    params?: ITdsEntryGetFormDto
  ): Observable<ITdsEntryGetResponseDto> {
    this.logger.logUserAction('Get TDS Entry List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.TDS.REGISTER,
        {
          response: TdsEntryGetResponseSchema,
          request: TdsEntryGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: ITdsEntryGetResponseDto) => {
          this.logger.logUserAction('Get TDS Entry List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get TDS Entry List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get TDS Entry List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getTdsEntryDetailById(
    tdsEntryId: string
  ): Observable<ITdsEntryDetailGetResponseDto> {
    this.logger.logUserAction('Get TDS Entry Detail Request', { tdsEntryId });

    return this.apiService
      .getValidated(API_ROUTES.SITE.DOCUMENT.TDS.GET_BY_ID(tdsEntryId), {
        response: TdsEntryDetailGetResponseSchema,
      })
      .pipe(
        tap((response: ITdsEntryDetailGetResponseDto) => {
          this.logger.logUserAction('Get TDS Entry Detail Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get TDS Entry Detail Error',
              error
            );
          } else {
            this.logger.logUserAction('Get TDS Entry Detail Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  verifyTdsEntry(
    tdsEntryId: string,
    formData: IVerifyTdsEntryFormDto
  ): Observable<IVerifyTdsEntryResponseDto> {
    this.logger.logUserAction('Verify TDS Entry Request', { tdsEntryId });

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.TDS.VERIFY(tdsEntryId),
        {
          response: VerifyTdsEntryResponseSchema,
          request: VerifyTdsEntryRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IVerifyTdsEntryResponseDto) => {
          this.logger.logUserAction('Verify TDS Entry Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Verify TDS Entry Error', error);
          } else {
            this.logger.logUserAction('Verify TDS Entry Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addTdsPaymentRelease(
    formData: IAddTdsPaymentReleaseFormDto
  ): Observable<IAddTdsPaymentReleaseResponseDto> {
    this.logger.logUserAction('Add TDS Payment Release Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.TDS.PAYMENT_RELEASE,
        {
          response: AddTdsPaymentReleaseResponseSchema,
          request: AddTdsPaymentReleaseRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddTdsPaymentReleaseResponseDto) => {
          this.logger.logUserAction(
            'Add TDS Payment Release Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add TDS Payment Release Error',
              error
            );
          } else {
            this.logger.logUserAction('Add TDS Payment Release Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  revertTdsEntry(
    tdsEntryId: string,
    formData: IRevertTdsEntryFormDto
  ): Observable<IRevertTdsEntryResponseDto> {
    this.logger.logUserAction('Revert TDS Entry Request', { tdsEntryId });

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.TDS.REVERT(tdsEntryId),
        {
          response: RevertTdsEntryResponseSchema,
          request: RevertTdsEntryRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRevertTdsEntryResponseDto) => {
          this.logger.logUserAction('Revert TDS Entry Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Revert TDS Entry Error', error);
          } else {
            this.logger.logUserAction('Revert TDS Entry Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
