import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddGstPaymentReleaseRequestSchema,
  AddGstPaymentReleaseResponseSchema,
  GstEntryDetailGetResponseSchema,
  GstEntryGetRequestSchema,
  GstEntryGetResponseSchema,
  RevertGstEntryResponseSchema,
  VerifyGstEntryResponseSchema,
} from '../schemas';
import {
  IAddGstPaymentReleaseFormDto,
  IAddGstPaymentReleaseResponseDto,
  IGstEntryDetailGetResponseDto,
  IGstEntryGetFormDto,
  IGstEntryGetResponseDto,
  IRevertGstEntryResponseDto,
  IVerifyGstEntryResponseDto,
} from '../types/gst.dto';

@Injectable({
  providedIn: 'root',
})
export class GstService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getGstEntryList(
    params?: IGstEntryGetFormDto
  ): Observable<IGstEntryGetResponseDto> {
    this.logger.logUserAction('Get GST Entry List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.GST.REGISTER,
        {
          response: GstEntryGetResponseSchema,
          request: GstEntryGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IGstEntryGetResponseDto) => {
          this.logger.logUserAction('Get GST Entry List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get GST Entry List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get GST Entry List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getGstEntryDetailById(
    gstEntryId: string
  ): Observable<IGstEntryDetailGetResponseDto> {
    this.logger.logUserAction('Get GST Entry Detail Request', { gstEntryId });

    return this.apiService
      .getValidated(API_ROUTES.SITE.DOCUMENT.GST.GET_BY_ID(gstEntryId), {
        response: GstEntryDetailGetResponseSchema,
      })
      .pipe(
        tap((response: IGstEntryDetailGetResponseDto) => {
          this.logger.logUserAction('Get GST Entry Detail Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get GST Entry Detail Error',
              error
            );
          } else {
            this.logger.logUserAction('Get GST Entry Detail Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  verifyGstEntry(gstEntryId: string): Observable<IVerifyGstEntryResponseDto> {
    this.logger.logUserAction('Verify GST Entry Request', { gstEntryId });

    return this.apiService
      .postValidated(API_ROUTES.SITE.DOCUMENT.GST.VERIFY(gstEntryId), {
        response: VerifyGstEntryResponseSchema,
      })
      .pipe(
        tap((response: IVerifyGstEntryResponseDto) => {
          this.logger.logUserAction('Verify GST Entry Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Verify GST Entry Error', error);
          } else {
            this.logger.logUserAction('Verify GST Entry Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addGstPaymentRelease(
    formData: IAddGstPaymentReleaseFormDto
  ): Observable<IAddGstPaymentReleaseResponseDto> {
    this.logger.logUserAction('Add GST Payment Release Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.GST.PAYMENT_RELEASE,
        {
          response: AddGstPaymentReleaseResponseSchema,
          request: AddGstPaymentReleaseRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddGstPaymentReleaseResponseDto) => {
          this.logger.logUserAction(
            'Add GST Payment Release Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add GST Payment Release Error',
              error
            );
          } else {
            this.logger.logUserAction('Add GST Payment Release Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  revertGstEntry(gstEntryId: string): Observable<IRevertGstEntryResponseDto> {
    this.logger.logUserAction('Revert GST Entry Request', { gstEntryId });

    return this.apiService
      .postValidated(API_ROUTES.SITE.DOCUMENT.GST.REVERT(gstEntryId), {
        response: RevertGstEntryResponseSchema,
      })
      .pipe(
        tap((response: IRevertGstEntryResponseDto) => {
          this.logger.logUserAction('Revert GST Entry Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Revert GST Entry Error', error);
          } else {
            this.logger.logUserAction('Revert GST Entry Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
