import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IAttendanceActionRequestDto,
  IAttendanceActionResponseDto,
  IAttendanceApplyRequestDto,
  IAttendanceApplyResponseDto,
  IAttendanceCurrentStatusGetResponseDto,
  IAttendanceForceRequestDto,
  IAttendanceForceResponseDto,
  IAttendanceGetRequestDto,
  IAttendanceGetResponseDto,
  IAttendanceHistoryGetRequestDto,
  IAttendanceHistoryGetResponseDto,
  IAttendanceRegularizedRequestDto,
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
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  applyAttendance(
    formData: IAttendanceApplyRequestDto
  ): Observable<IAttendanceApplyResponseDto> {
    this.logger.logUserAction('Apply Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.APPLY,
        formData,
        AttendanceApplyRequestSchema,
        AttendanceApplyResponseSchema
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
    formData: IAttendanceForceRequestDto
  ): Observable<IAttendanceForceResponseDto> {
    this.logger.logUserAction('Force Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.FORCE,
        formData,
        AttendanceForceRequestSchema,
        AttendanceForceResponseSchema
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
    formData: IAttendanceRegularizedRequestDto,
    attendanceId: string
  ): Observable<IAttendanceRegularizedResponseDto> {
    this.logger.logUserAction('Regularized Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.REGULARIZE(attendanceId),
        formData,
        AttendanceRegularizedRequestSchema,
        AttendanceRegularizedResponseSchema
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
    formData: IAttendanceActionRequestDto
  ): Observable<IAttendanceActionResponseDto> {
    this.logger.logUserAction('Action Attendance Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.APPROVAL_ACTION,
        formData,
        AttendanceActionRequestSchema,
        AttendanceActionResponseSchema
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
    params?: IAttendanceGetRequestDto
  ): Observable<IAttendanceGetResponseDto> {
    this.logger.logUserAction('Get Attendance List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.LIST,
        AttendanceGetResponseSchema,
        params,
        AttendanceGetRequestSchema
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
    params?: IAttendanceHistoryGetRequestDto
  ): Observable<IAttendanceHistoryGetResponseDto> {
    this.logger.logUserAction('Get Attendance History Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.HISTORY,
        AttendanceHistoryGetResponseSchema,
        params,
        AttendanceHistoryGetRequestSchema
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

  getAttendanceCurrentStatus(): Observable<IAttendanceCurrentStatusGetResponseDto> {
    this.logger.logUserAction('Get Attendance Current Status Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.CURRENT_STATUS,
        AttendanceCurrentStatusGetResponseSchema
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
