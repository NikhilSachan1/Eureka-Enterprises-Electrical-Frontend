import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  ILeaveActionRequestDto,
  ILeaveActionResponseDto,
  ILeaveApplyRequestDto,
  ILeaveApplyResponseDto,
  ILeaveForceRequestDto,
  ILeaveForceResponseDto,
  ILeaveGetRequestDto,
  ILeaveGetResponseDto,
} from '../types/leave.dto';
import {
  LeaveActionRequestSchema,
  LeaveActionResponseSchema,
  LeaveApplyRequestSchema,
  LeaveApplyResponseSchema,
  LeaveForceRequestSchema,
  LeaveForceResponseSchema,
  LeaveGetRequestSchema,
  LeaveGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  applyLeave(
    formData: ILeaveApplyRequestDto
  ): Observable<ILeaveApplyResponseDto> {
    this.logger.logUserAction('Apply Leave Request');

    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.APPLY,
        formData,
        LeaveApplyRequestSchema,
        LeaveApplyResponseSchema
      )
      .pipe(
        tap((response: ILeaveApplyResponseDto) => {
          this.logger.logUserAction('Apply Leave Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Apply Leave Error', error);
          } else {
            this.logger.logUserAction('Apply Leave Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  forceLeave(
    formData: ILeaveForceRequestDto
  ): Observable<ILeaveForceResponseDto> {
    this.logger.logUserAction('Force Leave Request');

    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.FORCE,
        formData,
        LeaveForceRequestSchema,
        LeaveForceResponseSchema
      )
      .pipe(
        tap((response: ILeaveForceResponseDto) => {
          this.logger.logUserAction('Force Leave Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Force Leave Error', error);
          } else {
            this.logger.logUserAction('Force Leave Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  actionLeave(
    formData: ILeaveActionRequestDto
  ): Observable<ILeaveActionResponseDto> {
    this.logger.logUserAction('Action Leave Request');

    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.APPROVAL_ACTION,
        formData,
        LeaveActionRequestSchema,
        LeaveActionResponseSchema
      )
      .pipe(
        tap((response: ILeaveActionResponseDto) => {
          this.logger.logUserAction('Action Leave Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Action Leave Error', error);
          } else {
            this.logger.logUserAction('Action Leave Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getLeaveList(params?: ILeaveGetRequestDto): Observable<ILeaveGetResponseDto> {
    this.logger.logUserAction('Get Leave List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.LEAVE.LIST,
        LeaveGetResponseSchema,
        params,
        LeaveGetRequestSchema
      )
      .pipe(
        tap((response: ILeaveGetResponseDto) => {
          this.logger.logUserAction('Get Leave List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Leave List Error', error);
          } else {
            this.logger.logUserAction('Get Leave List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
