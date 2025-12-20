import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import {
  ILeaveActionRequestDto,
  ILeaveActionResponseDto,
  ILeaveGetRequestDto,
  ILeaveGetResponseDto,
} from '../types/leave.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  LeaveActionRequestSchema,
  LeaveActionResponseSchema,
  LeaveGetRequestSchema,
  LeaveGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

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
    this.logger.logUserAction('Get Expense List Request');

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
