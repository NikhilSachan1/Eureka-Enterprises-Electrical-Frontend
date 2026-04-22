import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import {
  ILeaveActionFormDto,
  ILeaveActionResponseDto,
  ILeaveApplyFormDto,
  ILeaveApplyResponseDto,
  ILeaveBalanceGetFormDto,
  ILeaveBalanceGetResponseDto,
  ILeaveForceFormDto,
  ILeaveForceResponseDto,
  ILeaveGetFormDto,
  ILeaveGetResponseDto,
} from '../types/leave.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  LeaveActionRequestSchema,
  LeaveActionResponseSchema,
  LeaveApplyRequestSchema,
  LeaveApplyResponseSchema,
  LeaveBalanceGetRequestSchema,
  LeaveBalanceGetResponseSchema,
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

  applyLeave(formData: ILeaveApplyFormDto): Observable<ILeaveApplyResponseDto> {
    this.logger.logUserAction('Apply Leave Request');

    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.APPLY,
        {
          response: LeaveApplyResponseSchema,
          request: LeaveApplyRequestSchema,
        },
        formData
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

  actionLeave(
    formData: ILeaveActionFormDto
  ): Observable<ILeaveActionResponseDto> {
    this.logger.logUserAction('Action Leave Request');

    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.APPROVAL_ACTION,
        {
          response: LeaveActionResponseSchema,
          request: LeaveActionRequestSchema,
        },
        formData
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

  forceLeave(formData: ILeaveForceFormDto): Observable<ILeaveForceResponseDto> {
    this.logger.logUserAction('Force Leave Request');

    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.FORCE,
        {
          response: LeaveForceResponseSchema,
          request: LeaveForceRequestSchema,
        },
        formData
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

  getLeaveList(params?: ILeaveGetFormDto): Observable<ILeaveGetResponseDto> {
    this.logger.logUserAction('Get Leave List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.LEAVE.LIST,
        {
          response: LeaveGetResponseSchema,
          request: LeaveGetRequestSchema,
        },
        params
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

  getLeaveBalance(
    params?: ILeaveBalanceGetFormDto
  ): Observable<ILeaveBalanceGetResponseDto> {
    this.logger.logUserAction('Get Leave Balance Request');

    return this.apiService
      .getValidated(
        API_ROUTES.LEAVE.BALANCE,
        {
          response: LeaveBalanceGetResponseSchema,
          request: LeaveBalanceGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: ILeaveBalanceGetResponseDto) => {
          this.logger.logUserAction('Get Leave Balance Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Leave Balance Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Leave Balance Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
