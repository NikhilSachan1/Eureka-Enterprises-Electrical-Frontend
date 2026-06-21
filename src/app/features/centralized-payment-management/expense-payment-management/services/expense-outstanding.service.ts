import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  ExpenseOutstandingGetRequestSchema,
  ExpenseOutstandingGetResponseSchema,
} from '../schemas';
import {
  IExpenseOutstandingGetFormDto,
  IExpenseOutstandingGetResponseDto,
} from '../types/expense-outstanding.dto';

@Injectable({
  providedIn: 'root',
})
export class ExpenseOutstandingService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getExpenseOutstandingList(
    params?: IExpenseOutstandingGetFormDto
  ): Observable<IExpenseOutstandingGetResponseDto> {
    this.logger.logUserAction('Get Expense Outstanding List Request', params);

    return this.apiService
      .getValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.EXPENSE_PENDING_SETTLEMENT,
        {
          response: ExpenseOutstandingGetResponseSchema,
          request: ExpenseOutstandingGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get Expense Outstanding List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Expense Outstanding List Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Expense Outstanding List Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
