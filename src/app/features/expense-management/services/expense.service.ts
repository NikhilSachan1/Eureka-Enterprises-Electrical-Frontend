import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IExpenseActionRequestDto,
  IExpenseActionResponseDto,
  IExpenseAddRequestDto,
  IExpenseAddResponseDto,
  IExpenseDeleteRequestDto,
  IExpenseDeleteResponseDto,
  IExpenseGetRequestDto,
  IExpenseGetResponseDto,
} from '../types/expense.dto';
import {
  ExpenseAddRequestSchema,
  ExpenseAddResponseSchema,
  ExpenseGetRequestSchema,
  ExpenseGetResponseSchema,
} from '../schemas';
import {
  ExpenseActionRequestSchema,
  ExpenseActionResponseSchema,
} from '../schemas/approval-action-expense.schema';
import {
  ExpenseDeleteRequestSchema,
  ExpenseDeleteResponseSchema,
} from '../schemas/delete-expense.schema';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addExpense(
    requestDto: IExpenseAddRequestDto
  ): Observable<IExpenseAddResponseDto> {
    this.logger.logUserAction('Add Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.ADD,
        requestDto,
        ExpenseAddRequestSchema,
        ExpenseAddResponseSchema,
        { multipart: true }
      )
      .pipe(
        tap((response: IExpenseAddResponseDto) => {
          this.logger.logUserAction('Add Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Expense Error', error);
          } else {
            this.logger.logUserAction('Add Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

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

  deleteExpense(
    formData: IExpenseDeleteRequestDto
  ): Observable<IExpenseDeleteResponseDto> {
    this.logger.logUserAction('Delete Expense Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.EXPENSE.DELETE,
        ExpenseDeleteResponseSchema,
        formData,
        ExpenseDeleteRequestSchema
      )
      .pipe(
        tap((response: IExpenseDeleteResponseDto) => {
          this.logger.logUserAction('Delete Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Expense Error', error);
          } else {
            this.logger.logUserAction('Delete Expense Error', error);
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
