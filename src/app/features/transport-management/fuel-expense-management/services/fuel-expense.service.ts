import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IFuelExpenseActionFormDto,
  IFuelExpenseActionResponseDto,
  IFuelExpenseAddFormDto,
  IFuelExpenseAddResponseDto,
  IFuelExpenseDeleteFormDto,
  IFuelExpenseDeleteResponseDto,
  IFuelExpenseDetailGetRequestDto,
  IFuelExpenseDetailGetResponseDto,
  IFuelExpenseEditFormDto,
  IFuelExpenseEditResponseDto,
  IFuelExpenseForceFormDto,
  IFuelExpenseForceResponseDto,
  IFuelExpenseGetFormDto,
  IFuelExpenseGetResponseDto,
  IFuelExpenseReimburseFormDto,
  IFuelExpenseReimburseResponseDto,
  ILinkedUserVehicleDetailGetFormDto,
  ILinkedUserVehicleDetailGetResponseDto,
} from '../types/fuel-expense.dto';
import {
  FuelExpenseAddRequestSchema,
  FuelExpenseAddResponseSchema,
  FuelExpenseDetailGetResponseSchema,
  FuelExpenseEditRequestSchema,
  FuelExpenseEditResponseSchema,
  FuelExpenseForceRequestSchema,
  FuelExpenseForceResponseSchema,
  FuelExpenseGetRequestSchema,
  FuelExpenseGetResponseSchema,
  FuelExpenseReimburseRequestSchema,
  FuelExpenseReimburseResponseSchema,
  FuelExpenseActionRequestSchema,
  FuelExpenseActionResponseSchema,
  FuelExpenseDeleteRequestSchema,
  FuelExpenseDeleteResponseSchema,
  LinkedUserVehicleDetailGetResponseSchema,
  LinkedUserVehicleDetailGetRequestSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class FuelExpenseService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addFuelExpense(
    formData: IFuelExpenseAddFormDto
  ): Observable<IFuelExpenseAddResponseDto> {
    this.logger.logUserAction('Add Fuel Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.FUEL_EXPENSE.ADD,
        {
          response: FuelExpenseAddResponseSchema,
          request: FuelExpenseAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IFuelExpenseAddResponseDto) => {
          this.logger.logUserAction('Add Fuel Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Fuel Expense Error', error);
          } else {
            this.logger.logUserAction('Add Fuel Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  reimburseFuelExpense(
    formData: IFuelExpenseReimburseFormDto
  ): Observable<IFuelExpenseReimburseResponseDto> {
    this.logger.logUserAction('Reimburse Fuel Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.FUEL_EXPENSE.REIMBURSE,
        {
          response: FuelExpenseReimburseResponseSchema,
          request: FuelExpenseReimburseRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IFuelExpenseReimburseResponseDto) => {
          this.logger.logUserAction(
            'Reimburse Fuel Expense Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Reimburse Fuel Expense Error',
              error
            );
          } else {
            this.logger.logUserAction('Reimburse Fuel Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editFuelExpense(
    formData: IFuelExpenseEditFormDto,
    fuelExpenseId: string
  ): Observable<IFuelExpenseEditResponseDto> {
    this.logger.logUserAction('Edit Fuel Expense Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.FUEL_EXPENSE.EDIT(fuelExpenseId),
        {
          response: FuelExpenseEditResponseSchema,
          request: FuelExpenseEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IFuelExpenseEditResponseDto) => {
          this.logger.logUserAction('Edit Fuel Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Fuel Expense Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Fuel Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  forceFuelExpense(
    formData: IFuelExpenseForceFormDto
  ): Observable<IFuelExpenseForceResponseDto> {
    this.logger.logUserAction('Force Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.FUEL_EXPENSE.FORCE,
        {
          response: FuelExpenseForceResponseSchema,
          request: FuelExpenseForceRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IFuelExpenseForceResponseDto) => {
          this.logger.logUserAction('Force Fuel Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Force Fuel Expense Error',
              error
            );
          } else {
            this.logger.logUserAction('Force Fuel Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  actionFuelExpense(
    formData: IFuelExpenseActionFormDto
  ): Observable<IFuelExpenseActionResponseDto> {
    this.logger.logUserAction('Action Fuel Expense Request');

    return this.apiService
      .postValidated(
        API_ROUTES.FUEL_EXPENSE.APPROVAL_ACTION,
        {
          response: FuelExpenseActionResponseSchema,
          request: FuelExpenseActionRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IFuelExpenseActionResponseDto) => {
          this.logger.logUserAction('Action Fuel Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Action Fuel Expense Error',
              error
            );
          } else {
            this.logger.logUserAction('Action Fuel Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteFuelExpense(
    formData: IFuelExpenseDeleteFormDto
  ): Observable<IFuelExpenseDeleteResponseDto> {
    this.logger.logUserAction('Delete Fuel Expense Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.FUEL_EXPENSE.DELETE,
        {
          response: FuelExpenseDeleteResponseSchema,
          request: FuelExpenseDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IFuelExpenseDeleteResponseDto) => {
          this.logger.logUserAction('Delete Fuel Expense Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Fuel Expense Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Fuel Expense Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getFuelExpenseList(
    params?: IFuelExpenseGetFormDto
  ): Observable<IFuelExpenseGetResponseDto> {
    this.logger.logUserAction('Get Fuel Expense List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.FUEL_EXPENSE.LIST,
        {
          response: FuelExpenseGetResponseSchema,
          request: FuelExpenseGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IFuelExpenseGetResponseDto) => {
          this.logger.logUserAction('Get Fuel Expense List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Fuel Expense List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Fuel Expense List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getFuelExpenseDetailById(
    params: IFuelExpenseDetailGetRequestDto
  ): Observable<IFuelExpenseDetailGetResponseDto> {
    this.logger.logUserAction('Get Fuel Expense Detail By Id Request');

    return this.apiService
      .getValidated(API_ROUTES.FUEL_EXPENSE.GET_FUEL_EXPENSE_BY_ID(params.id), {
        response: FuelExpenseDetailGetResponseSchema,
      })
      .pipe(
        tap((response: IFuelExpenseDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Fuel Expense Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Fuel Expense Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Fuel Expense Detail By Id Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getLinkedUserVehicleDetail(
    params?: ILinkedUserVehicleDetailGetFormDto
  ): Observable<ILinkedUserVehicleDetailGetResponseDto> {
    this.logger.logUserAction('Get Linked User Vehicle Detail Request');

    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE.GET_LINKED_USER_VEHICLE_DETAIL,
        {
          response: LinkedUserVehicleDetailGetResponseSchema,
          request: LinkedUserVehicleDetailGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: ILinkedUserVehicleDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Linked User Vehicle Detail Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Linked User Vehicle Detail Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Linked User Vehicle Detail Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
