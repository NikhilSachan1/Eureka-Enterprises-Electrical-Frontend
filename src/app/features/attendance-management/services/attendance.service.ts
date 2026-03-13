import { inject, Injectable } from '@angular/core';
import { z } from 'zod';
import { API_ROUTES } from '@core/constants';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import {
  IAttendanceActionFormDto,
  IAttendanceActionResponseDto,
  IAttendanceApplyRequestDto,
  IAttendanceApplyResponseDto,
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
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly apiService = inject(ApiService);

  applyAttendance(
    payload: IAttendanceApplyRequestDto
  ): Observable<IAttendanceApplyResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.APPLY,
        {
          response: AttendanceApplyResponseSchema,
          request: AttendanceApplyRequestSchema,
        },
        payload
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  forceAttendance(
    formData: IAttendanceForceFormDto
  ): Observable<IAttendanceForceResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.FORCE,
        {
          response: AttendanceForceResponseSchema,
          request: AttendanceForceRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  regularizedAttendance(
    formData: IAttendanceRegularizedFormDto,
    attendanceId: string
  ): Observable<IAttendanceRegularizedResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.REGULARIZE(attendanceId),
        {
          response: AttendanceRegularizedResponseSchema,
          request: AttendanceRegularizedRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  actionAttendance(
    formData: IAttendanceActionFormDto
  ): Observable<IAttendanceActionResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.ATTENDANCE.APPROVAL_ACTION,
        {
          response: AttendanceActionResponseSchema,
          request: AttendanceActionRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getAttendanceList(
    params?: IAttendanceGetFormDto
  ): Observable<IAttendanceGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.LIST,
        {
          response: AttendanceGetResponseSchema,
          request: AttendanceGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getAttendanceHistory(
    params?: IAttendanceHistoryGetFormDto
  ): Observable<IAttendanceHistoryGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.HISTORY,
        {
          response: AttendanceHistoryGetResponseSchema,
          request: AttendanceHistoryGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getAttendanceCurrentStatus(): Observable<IAttendanceCurrentStatusGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.ATTENDANCE.CURRENT_STATUS, {
        response: AttendanceCurrentStatusGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getAttendanceCurrentStatusByUser(
    userId: string
  ): Observable<IAttendanceCurrentStatusGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.ATTENDANCE.CURRENT_STATUS,
        {
          response: AttendanceCurrentStatusGetResponseSchema,
          request: z.object({ userId: z.string() }),
        },
        { userId }
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
