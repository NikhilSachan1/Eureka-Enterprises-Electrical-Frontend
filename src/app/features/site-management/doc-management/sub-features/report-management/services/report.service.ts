import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddReportRequestSchema,
  AddReportResponseSchema,
  DeleteReportResponseSchema,
  EditReportRequestSchema,
  EditReportResponseSchema,
  ReportDetailGetResponseSchema,
  ReportGetRequestSchema,
  ReportGetResponseSchema,
} from '../schemas';
import {
  IAddReportFormDto,
  IAddReportResponseDto,
  IDeleteReportResponseDto,
  IEditReportFormDto,
  IEditReportResponseDto,
  IReportDetailGetResponseDto,
  IReportGetFormDto,
  IReportGetResponseDto,
} from '../types/report.dto';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addReport(formData: IAddReportFormDto): Observable<IAddReportResponseDto> {
    this.logger.logUserAction('Add Report Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.REPORT.ADD,
        {
          response: AddReportResponseSchema,
          request: AddReportRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddReportResponseDto) => {
          this.logger.logUserAction('Add Report Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Report Error', error);
          } else {
            this.logger.logUserAction('Add Report Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editReport(
    formData: IEditReportFormDto,
    reportId: string
  ): Observable<IEditReportResponseDto> {
    this.logger.logUserAction('Edit Report Request', { reportId });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.REPORT.EDIT(reportId),
        {
          response: EditReportResponseSchema,
          request: EditReportRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditReportResponseDto) => {
          this.logger.logUserAction('Edit Report Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Report Error', error);
          } else {
            this.logger.logUserAction('Edit Report Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteReport(reportId: string): Observable<IDeleteReportResponseDto> {
    this.logger.logUserAction('Delete Report Request', { reportId });

    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DOCUMENT.REPORT.DELETE(reportId), {
        response: DeleteReportResponseSchema,
      })
      .pipe(
        tap((response: IDeleteReportResponseDto) => {
          this.logger.logUserAction('Delete Report Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Report Error', error);
          } else {
            this.logger.logUserAction('Delete Report Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getReportList(params?: IReportGetFormDto): Observable<IReportGetResponseDto> {
    this.logger.logUserAction('Get Report List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.REPORT.LIST,
        {
          response: ReportGetResponseSchema,
          request: ReportGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IReportGetResponseDto) => {
          this.logger.logUserAction('Get Report List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Report List Error', error);
          } else {
            this.logger.logUserAction('Get Report List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getReportDetailById(
    reportId: string
  ): Observable<IReportDetailGetResponseDto> {
    this.logger.logUserAction('Get Report Detail By Id Request', { reportId });

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.REPORT.GET_REPORT_BY_ID(reportId),
        {
          response: ReportDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IReportDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Report Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Report Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Report Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
