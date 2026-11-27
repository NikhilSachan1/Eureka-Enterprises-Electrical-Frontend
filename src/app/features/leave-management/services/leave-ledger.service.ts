import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiService, LoggerService } from '@core/services';
import { API_ROUTES } from '@core/constants';
import {
  LeaveLedgerGetRequestSchema,
  LeaveLedgerGetResponseSchema,
} from '../schemas/leave-ledger.schema';
import {
  ILeaveLedgerGetFormDto,
  ILeaveLedgerGetResponseDto,
} from '../types/leave-ledger.dto';

@Injectable({
  providedIn: 'root',
})
export class LeaveLedgerService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  /** With an employee picked: that employee's ledger (leave.ledger.view-all); without: my own. */
  getLedger(
    params: ILeaveLedgerGetFormDto
  ): Observable<ILeaveLedgerGetResponseDto> {
    const employee = params.employeeName;
    const hasEmployee = Array.isArray(employee) ? !!employee[0] : !!employee;
    const endpoint = hasEmployee
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

  private logError(action: string, error: unknown): Observable<never> {
    if ((error as { name?: string })?.name === 'ZodError') {
      this.logger.logDtoValidationErrors(`${action} Error`, error);
    } else {
      this.logger.logUserAction(`${action} Error`, error);
    }
    return throwError(() => error);
  }
}
