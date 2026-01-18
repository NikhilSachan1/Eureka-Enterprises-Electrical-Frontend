import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IExpenseActionFormDto,
  IExpenseActionResponseDto,
  IExpenseAddFormDto,
  IExpenseAddResponseDto,
  IExpenseDeleteFormDto,
  IExpenseDeleteResponseDto,
  IExpenseDetailGetRequestDto,
  IExpenseDetailGetResponseDto,
  IExpenseEditFormDto,
  IExpenseEditResponseDto,
  IExpenseForceFormDto,
  IExpenseForceResponseDto,
  IExpenseGetFormDto,
  IExpenseGetResponseDto,
  IExpenseReimburseFormDto,
  IExpenseReimburseResponseDto,
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
  ExpenseReimburseRequestSchema,
  ExpenseReimburseResponseSchema,
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

  addExpense(formData: IExpenseAddFormDto): Observable<IExpenseAddResponseDto> {
    this.logger.logUserAction('Add Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.ADD,
        {
          response: ExpenseAddResponseSchema,
          request: ExpenseAddRequestSchema,
        },
        formData,
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

  reimburseExpense(
    formData: IExpenseReimburseFormDto
  ): Observable<IExpenseReimburseResponseDto> {
    this.logger.logUserAction('Reimburse Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.REIMBURSE,
        {
          response: ExpenseReimburseResponseSchema,
          request: ExpenseReimburseRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IExpenseReimburseResponseDto) => {
          this.logger.logUserAction('Reimburse Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Reimburse Expense Error',
              error
            );
          } else {
            this.logger.logUserAction('Reimburse Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editExpense(
    formData: IExpenseEditFormDto,
    expenseId: string
  ): Observable<IExpenseEditResponseDto> {
    this.logger.logUserAction('Edit Expense Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.EXPENSE.EDIT(expenseId),
        {
          response: ExpenseEditResponseSchema,
          request: ExpenseEditRequestSchema,
        },
        formData,
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
    formData: IExpenseForceFormDto
  ): Observable<IExpenseForceResponseDto> {
    this.logger.logUserAction('Force Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.FORCE,
        {
          response: ExpenseForceResponseSchema,
          request: ExpenseForceRequestSchema,
        },
        formData,
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
    formData: IExpenseActionFormDto
  ): Observable<IExpenseActionResponseDto> {
    this.logger.logUserAction('Action Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.APPROVAL_ACTION,
        {
          response: ExpenseActionResponseSchema,
          request: ExpenseActionRequestSchema,
        },
        formData
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
    formData: IExpenseDeleteFormDto
  ): Observable<IExpenseDeleteResponseDto> {
    this.logger.logUserAction('Delete Expense Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.EXPENSE.DELETE,
        {
          response: ExpenseDeleteResponseSchema,
          request: ExpenseDeleteRequestSchema,
        },
        formData
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
    params?: IExpenseGetFormDto
  ): Observable<IExpenseGetResponseDto> {
    this.logger.logUserAction('Get Expense List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.EXPENSE.LIST,
        {
          response: ExpenseGetResponseSchema,
          request: ExpenseGetRequestSchema,
        },
        params
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
      .getValidated(API_ROUTES.EXPENSE.GET_EXPENSE_BY_ID(params.id), {
        response: ExpenseDetailGetResponseSchema,
      })
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
