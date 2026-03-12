import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import {
  ILeaveActionFormDto,
  ILeaveActionResponseDto,
  ILeaveApplyFormDto,
  ILeaveApplyResponseDto,
  ILeaveForceFormDto,
  ILeaveForceResponseDto,
  ILeaveGetFormDto,
  ILeaveGetResponseDto,
} from '../types/leave.dto';
import { catchError, Observable, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
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
  private readonly apiService = inject(ApiService);

  applyLeave(formData: ILeaveApplyFormDto): Observable<ILeaveApplyResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.APPLY,
        {
          response: LeaveApplyResponseSchema,
          request: LeaveApplyRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  actionLeave(
    formData: ILeaveActionFormDto
  ): Observable<ILeaveActionResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.APPROVAL_ACTION,
        {
          response: LeaveActionResponseSchema,
          request: LeaveActionRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  forceLeave(formData: ILeaveForceFormDto): Observable<ILeaveForceResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.FORCE,
        {
          response: LeaveForceResponseSchema,
          request: LeaveForceRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getLeaveList(params?: ILeaveGetFormDto): Observable<ILeaveGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.LEAVE.LIST,
        {
          response: LeaveGetResponseSchema,
          request: LeaveGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
