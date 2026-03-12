import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  DsrAddRequestSchema,
  DsrAddResponseSchema,
  DsrDeleteResponseSchema,
  DsrDetailGetResponseSchema,
  DsrEditRequestSchema,
  DsrEditResponseSchema,
  DsrGetRequestSchema,
  DsrGetResponseSchema,
} from '../schemas';
import {
  IDsrAddFormDto,
  IDsrAddResponseDto,
  IDsrDeleteResponseDto,
  IDsrDetailGetFormDto,
  IDsrDetailGetResponseDto,
  IDsrEditFormDto,
  IDsrEditResponseDto,
  IDsrGetFormDto,
  IDsrGetResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class DsrService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addDsr(formData: IDsrAddFormDto): Observable<IDsrAddResponseDto> {
    this.logger.logUserAction('Add Dsr Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DSR.ADD,
        {
          response: DsrAddResponseSchema,
          request: DsrAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IDsrAddResponseDto) => {
          this.logger.logUserAction('Add Dsr Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Dsr Error', error);
          } else {
            this.logger.logUserAction('Add Dsr Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editDsr(
    formData: IDsrEditFormDto,
    dsrId: string
  ): Observable<IDsrEditResponseDto> {
    this.logger.logUserAction('Edit Dsr Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DSR.EDIT(dsrId),
        {
          response: DsrEditResponseSchema,
          request: DsrEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IDsrEditResponseDto) => {
          this.logger.logUserAction('Edit Dsr Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Dsr Error', error);
          } else {
            this.logger.logUserAction('Edit Dsr Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteDsr(dsrId: string): Observable<IDsrDeleteResponseDto> {
    this.logger.logUserAction('Delete Dsr Request');

    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DSR.DELETE(dsrId), {
        response: DsrDeleteResponseSchema,
      })
      .pipe(
        tap((response: IDsrDeleteResponseDto) => {
          this.logger.logUserAction('Delete Dsr Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Dsr Error', error);
          } else {
            this.logger.logUserAction('Delete Dsr Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getDSRList(params?: IDsrGetFormDto): Observable<IDsrGetResponseDto> {
    this.logger.logUserAction('Get DSR List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DSR.LIST,
        {
          response: DsrGetResponseSchema,
          request: DsrGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IDsrGetResponseDto) => {
          this.logger.logUserAction('Get DSR List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get DSR List Error', error);
          } else {
            this.logger.logUserAction('Get DSR List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getDsrDetailById(
    params: IDsrDetailGetFormDto
  ): Observable<IDsrDetailGetResponseDto> {
    this.logger.logUserAction('Get Dsr Detail By Id Request');

    return this.apiService
      .getValidated(API_ROUTES.SITE.DSR.GET_DSR_BY_ID(params.dsrId), {
        response: DsrDetailGetResponseSchema,
      })
      .pipe(
        tap((response: IDsrDetailGetResponseDto) => {
          this.logger.logUserAction('Get Dsr Detail By Id Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Dsr Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Dsr Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
