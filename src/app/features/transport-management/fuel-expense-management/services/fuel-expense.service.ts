import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
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
  private readonly apiService = inject(ApiService);

  addFuelExpense(
    formData: IFuelExpenseAddFormDto
  ): Observable<IFuelExpenseAddResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  reimburseFuelExpense(
    formData: IFuelExpenseReimburseFormDto
  ): Observable<IFuelExpenseReimburseResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  editFuelExpense(
    formData: IFuelExpenseEditFormDto,
    fuelExpenseId: string
  ): Observable<IFuelExpenseEditResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  forceFuelExpense(
    formData: IFuelExpenseForceFormDto
  ): Observable<IFuelExpenseForceResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  actionFuelExpense(
    formData: IFuelExpenseActionFormDto
  ): Observable<IFuelExpenseActionResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.FUEL_EXPENSE.APPROVAL_ACTION,
        {
          response: FuelExpenseActionResponseSchema,
          request: FuelExpenseActionRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteFuelExpense(
    formData: IFuelExpenseDeleteFormDto
  ): Observable<IFuelExpenseDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.FUEL_EXPENSE.DELETE,
        {
          response: FuelExpenseDeleteResponseSchema,
          request: FuelExpenseDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getFuelExpenseList(
    params?: IFuelExpenseGetFormDto
  ): Observable<IFuelExpenseGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.FUEL_EXPENSE.LIST,
        {
          response: FuelExpenseGetResponseSchema,
          request: FuelExpenseGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getFuelExpenseDetailById(
    params: IFuelExpenseDetailGetRequestDto
  ): Observable<IFuelExpenseDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.FUEL_EXPENSE.GET_FUEL_EXPENSE_BY_ID(params.id), {
        response: FuelExpenseDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getLinkedUserVehicleDetail(
    params?: ILinkedUserVehicleDetailGetFormDto
  ): Observable<ILinkedUserVehicleDetailGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE.GET_LINKED_USER_VEHICLE_DETAIL,
        {
          response: LinkedUserVehicleDetailGetResponseSchema,
          request: LinkedUserVehicleDetailGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
