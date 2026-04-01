import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IAttendanceActionFormDto,
  IAttendanceActionResponseDto,
  IAttendanceApplyFormDto,
  IAttendanceApplyResponseDto,
  IAttendanceCurrentStatusGetFormDto,
  IAttendanceCurrentStatusGetResponseDto,
  IAttendanceForceFormDto,
  IAttendanceForceResponseDto,
  IAttendanceGetFormDto,
  IAttendanceGetResponseDto,
  IAttendanceHistoryGetFormDto,
  IAttendanceHistoryGetResponseDto,
  IAttendanceRegularizedFormDto,
  IAttendanceRegularizedResponseDto,
} from '../types/attendance.dto';
import {
  AttendanceActionRequestSchema,
  AttendanceActionResponseSchema,
  AttendanceApplyRequestSchema,
  AttendanceApplyResponseSchema,
  AttendanceCurrentStatusGetResponseSchema,
  AttendanceForceRequestSchema,
  AttendanceForceResponseSchema,
  AttendanceHistoryGetRequestSchema,
  AttendanceHistoryGetResponseSchema,
  AttendanceRegularizedRequestSchema,
  AttendanceRegularizedResponseSchema,
  AttendanceGetRequestSchema,
  AttendanceGetResponseSchema,
  AttendanceCurrentStatusGetFormSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  applyAttendance(
    formData: IAttendanceApplyFormDto
  ): Observable<IAttendanceApplyResponseDto> {
    this.logger.logUserAction('Apply Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.APPLY,
        {
          response: AttendanceApplyResponseSchema,
          request: AttendanceApplyRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAttendanceApplyResponseDto) => {
          this.logger.logUserAction('Apply Attendance Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Apply Attendance Error', error);
          } else {
            this.logger.logUserAction('Apply Attendance Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  forceAttendance(
    formData: IAttendanceForceFormDto
  ): Observable<IAttendanceForceResponseDto> {
    this.logger.logUserAction('Force Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.FORCE,
        {
          response: AttendanceForceResponseSchema,
          request: AttendanceForceRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAttendanceForceResponseDto) => {
          this.logger.logUserAction('Force Attendance Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Force Attendance Error', error);
          } else {
            this.logger.logUserAction('Force Attendance Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  regularizedAttendance(
    formData: IAttendanceRegularizedFormDto,
    attendanceId: string
  ): Observable<IAttendanceRegularizedResponseDto> {
    this.logger.logUserAction('Regularized Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.REGULARIZE(attendanceId),
        {
          response: AttendanceRegularizedResponseSchema,
          request: AttendanceRegularizedRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAttendanceRegularizedResponseDto) => {
          this.logger.logUserAction(
            'Regularized Attendance Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Regularized Attendance Error',
              error
            );
          } else {
            this.logger.logUserAction('Regularized Attendance Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  actionAttendance(
    formData: IAttendanceActionFormDto
  ): Observable<IAttendanceActionResponseDto> {
    this.logger.logUserAction('Action Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.APPROVAL_ACTION,
        {
          response: AttendanceActionResponseSchema,
          request: AttendanceActionRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAttendanceActionResponseDto) => {
          this.logger.logUserAction('Action Attendance Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Action Attendance Error',
              error
            );
          } else {
            this.logger.logUserAction('Action Attendance Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAttendanceList(
    params?: IAttendanceGetFormDto
  ): Observable<IAttendanceGetResponseDto> {
    this.logger.logUserAction('Get Attendance List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.LIST,
        {
          response: AttendanceGetResponseSchema,
          request: AttendanceGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IAttendanceGetResponseDto) => {
          this.logger.logUserAction('Get Attendance List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Attendance List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Attendance List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAttendanceHistory(
    params?: IAttendanceHistoryGetFormDto
  ): Observable<IAttendanceHistoryGetResponseDto> {
    this.logger.logUserAction('Get Attendance History Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.HISTORY,
        {
          response: AttendanceHistoryGetResponseSchema,
          request: AttendanceHistoryGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IAttendanceHistoryGetResponseDto) => {
          this.logger.logUserAction(
            'Get Attendance History Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Attendance History Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Attendance History Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAttendanceCurrentStatus(
    params?: IAttendanceCurrentStatusGetFormDto
  ): Observable<IAttendanceCurrentStatusGetResponseDto> {
    this.logger.logUserAction('Get Attendance Current Status Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.CURRENT_STATUS,
        {
          response: AttendanceCurrentStatusGetResponseSchema,
          request: AttendanceCurrentStatusGetFormSchema,
        },
        params
      )
      .pipe(
        tap((response: IAttendanceCurrentStatusGetResponseDto) => {
          this.logger.logUserAction(
            'Get Attendance Current Status Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Attendance Current Status Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Attendance Current Status Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
