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
  IExpenseDetailGetRequestDto,
  IExpenseDetailGetResponseDto,
  IExpenseEditRequestDto,
  IExpenseEditResponseDto,
  IExpenseForceRequestDto,
  IExpenseForceResponseDto,
  IExpenseGetRequestDto,
  IExpenseGetResponseDto,
} from '../types/expense.dto';
import {
  ExpenseAddRequestSchema,
  ExpenseAddResponseSchema,
  ExpenseDetailGetResponseSchema,
  ExpenseEditRequestSchema,
  ExpenseEditResponseSchema,
  ExpenseForceRequestSchema,
  ExpenseForceResponseSchema,
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
    formData: IExpenseAddRequestDto
  ): Observable<IExpenseAddResponseDto> {
    this.logger.logUserAction('Add Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.ADD,
        formData,
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

  editExpense(
    formData: IExpenseEditRequestDto,
    expenseId: string
  ): Observable<IExpenseEditResponseDto> {
    this.logger.logUserAction('Edit Expense Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.EXPENSE.EDIT(expenseId),
        formData,
        ExpenseEditRequestSchema,
        ExpenseEditResponseSchema,
        { multipart: true }
      )
      .pipe(
        tap((response: IExpenseEditResponseDto) => {
          this.logger.logUserAction('Edit Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Expense Error', error);
          } else {
            this.logger.logUserAction('Edit Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  forceExpense(
    formData: IExpenseForceRequestDto
  ): Observable<IExpenseForceResponseDto> {
    this.logger.logUserAction('Force Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.FORCE,
        formData,
        ExpenseForceRequestSchema,
        ExpenseForceResponseSchema,
        { multipart: true }
      )
      .pipe(
        tap((response: IExpenseForceResponseDto) => {
          this.logger.logUserAction('Force Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Force Expense Error', error);
          } else {
            this.logger.logUserAction('Force Expense Error', error);
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

  getExpenseDetailById(
    params: IExpenseDetailGetRequestDto
  ): Observable<IExpenseDetailGetResponseDto> {
    this.logger.logUserAction('Get Expense Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.EXPENSE.GET_EXPENSE_BY_ID(params.id),
        ExpenseDetailGetResponseSchema
      )
      .pipe(
        tap((response: IExpenseDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Expense Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Expense Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Expense Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
