import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IExpenseActionRequestDto,
  IExpenseActionResponseDto,
  IExpenseGetRequestDto,
  IExpenseGetResponseDto,
} from '../types/expense.dto';
import { ExpenseGetRequestSchema, ExpenseGetResponseSchema } from '../schemas';
import {
  ExpenseActionRequestSchema,
  ExpenseActionResponseSchema,
} from '../schemas/approval-action-expense.schema';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  actionExpense(
    formData: IExpenseActionRequestDto
  ): Observable<IExpenseActionResponseDto> {
    this.logger.logUserAction('Action Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.APPROVAL_ACTION,
        formData,
        ExpenseActionRequestSchema,
        ExpenseActionResponseSchema
      )
      .pipe(
        tap((response: IExpenseActionResponseDto) => {
          this.logger.logUserAction('Action Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Action Expense Error', error);
          } else {
            this.logger.logUserAction('Action Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getExpenseList(
    params?: IExpenseGetRequestDto
  ): Observable<IExpenseGetResponseDto> {
    this.logger.logUserAction('Get Expense List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.EXPENSE.LIST,
        ExpenseGetResponseSchema,
        params,
        ExpenseGetRequestSchema
      )
      .pipe(
        tap((response: IExpenseGetResponseDto) => {
          this.logger.logUserAction('Get Expense List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Expense List Error', error);
          } else {
            this.logger.logUserAction('Get Expense List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
