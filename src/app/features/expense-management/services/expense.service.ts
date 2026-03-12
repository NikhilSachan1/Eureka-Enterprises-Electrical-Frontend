import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
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
  private readonly apiService = inject(ApiService);

  addExpense(formData: IExpenseAddFormDto): Observable<IExpenseAddResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  reimburseExpense(
    formData: IExpenseReimburseFormDto
  ): Observable<IExpenseReimburseResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  editExpense(
    formData: IExpenseEditFormDto,
    expenseId: string
  ): Observable<IExpenseEditResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  forceExpense(
    formData: IExpenseForceFormDto
  ): Observable<IExpenseForceResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  actionExpense(
    formData: IExpenseActionFormDto
  ): Observable<IExpenseActionResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.EXPENSE.APPROVAL_ACTION,
        {
          response: ExpenseActionResponseSchema,
          request: ExpenseActionRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteExpense(
    formData: IExpenseDeleteFormDto
  ): Observable<IExpenseDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.EXPENSE.DELETE,
        {
          response: ExpenseDeleteResponseSchema,
          request: ExpenseDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getExpenseList(
    params?: IExpenseGetFormDto
  ): Observable<IExpenseGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.EXPENSE.LIST,
        {
          response: ExpenseGetResponseSchema,
          request: ExpenseGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getExpenseDetailById(
    params: IExpenseDetailGetRequestDto
  ): Observable<IExpenseDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.EXPENSE.GET_EXPENSE_BY_ID(params.id), {
        response: ExpenseDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }
}
