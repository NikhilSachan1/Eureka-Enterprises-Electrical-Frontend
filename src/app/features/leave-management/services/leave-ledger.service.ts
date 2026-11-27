import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiService, LoggerService } from '@core/services';
import { API_ROUTES } from '@core/constants';
import {
  LeaveLedgerGetRequestSchema,
  LeaveLedgerGetResponseSchema,
  LeaveRecalculationApplyRequestSchema,
  LeaveRecalculationGetRequestSchema,
  LeaveRecalculationResponseSchema,
} from '../schemas/leave-ledger.schema';
import {
  ILeaveLedgerGetFormDto,
  ILeaveLedgerGetResponseDto,
  ILeaveRecalculationApplyFormDto,
  ILeaveRecalculationGetFormDto,
  ILeaveRecalculationResponseDto,
} from '../types/leave-ledger.dto';

@Injectable({
  providedIn: 'root',
})
export class LeaveLedgerService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  /** With a userId: that employee's ledger (needs leave.ledger.view-all); without: my own. */
  getLedger(
    params: ILeaveLedgerGetFormDto
  ): Observable<ILeaveLedgerGetResponseDto> {
    const endpoint = params.userId
      ? API_ROUTES.LEAVE.LEDGER
      : API_ROUTES.LEAVE.MY_LEDGER;

    return this.apiService
      .getValidated(
        endpoint,
        {
          response: LeaveLedgerGetResponseSchema,
          request: LeaveLedgerGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => this.logError('Get Leave Ledger', error)));
  }

  getRecalculation(
    params: ILeaveRecalculationGetFormDto = {}
  ): Observable<ILeaveRecalculationResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.LEAVE.RECALCULATION,
        {
          response: LeaveRecalculationResponseSchema,
          request: LeaveRecalculationGetRequestSchema,
        },
        params
      )
      .pipe(
        catchError(error => this.logError('Get Leave Recalculation', error))
      );
  }

  applyRecalculation(
    payload: ILeaveRecalculationApplyFormDto
  ): Observable<ILeaveRecalculationResponseDto> {
    this.logger.logUserAction('Apply Leave Recalculation Request', payload);

    return this.apiService
      .postValidated(
        API_ROUTES.LEAVE.RECALCULATION_APPLY,
        {
          response: LeaveRecalculationResponseSchema,
          request: LeaveRecalculationApplyRequestSchema,
        },
        payload
      )
      .pipe(
        catchError(error => this.logError('Apply Leave Recalculation', error))
      );
  }

  private logError(action: string, error: unknown): Observable<never> {
    if ((error as { name?: string })?.name === 'ZodError') {
      this.logger.logDtoValidationErrors(`${action} Error`, error);
    } else {
      this.logger.logUserAction(`${action} Error`, error);
    }
    return throwError(() => error);
  }
}
