import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ActionVehicleRequestSchema,
  ActionVehicleResponseSchema,
  VehicleAddRequestSchema,
  VehicleAddResponseSchema,
  VehicleDeleteRequestSchema,
  VehicleDeleteResponseSchema,
  VehicleDetailGetResponseSchema,
  VehicleEditRequestSchema,
  VehicleEditResponseSchema,
  VehicleEventHistoryGetRequestSchema,
  VehicleEventHistoryGetResponseSchema,
  VehicleGetRequestSchema,
  VehicleGetResponseSchema,
} from '../schemas';
import {
  IVehicleAddResponseDto,
  IVehicleEditResponseDto,
  IVehicleDeleteResponseDto,
  IVehicleActionResponseDto,
  IVehicleGetResponseDto,
  IVehicleDetailGetResponseDto,
  IVehicleEventHistoryGetResponseDto,
  IvehicleActionFormDto,
  IvehicleAddFormDto,
  IvehicleEditFormDto,
  IvehicleDeleteFormDto,
  IvehicleGetFormDto,
  IvehicleDetailGetFormDto,
  IVehicleEventHistoryGetFormDto,
} from '../types/vehicle.dto';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private readonly apiService = inject(ApiService);

  addVehicle(formData: IvehicleAddFormDto): Observable<IVehicleAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.VEHICLE.ADD,
        {
          response: VehicleAddResponseSchema,
          request: VehicleAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editVehicle(
    formData: IvehicleEditFormDto,
    vehicleId: string
  ): Observable<IVehicleEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.VEHICLE.EDIT(vehicleId),
        {
          response: VehicleEditResponseSchema,
          request: VehicleEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteVehicle(
    formData: IvehicleDeleteFormDto
  ): Observable<IVehicleDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.VEHICLE.DELETE,
        {
          response: VehicleDeleteResponseSchema,
          request: VehicleDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  actionVehicle(
    formData: IvehicleActionFormDto
  ): Observable<IVehicleActionResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.VEHICLE.ACTION,
        {
          response: ActionVehicleResponseSchema,
          request: ActionVehicleRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getVehicleList(
    params?: IvehicleGetFormDto
  ): Observable<IVehicleGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE.LIST,
        {
          response: VehicleGetResponseSchema,
          request: VehicleGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getVehicleDetailById(
    params: IvehicleDetailGetFormDto
  ): Observable<IVehicleDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.VEHICLE.GET_VEHICLE_BY_ID(params.vehicleId), {
        response: VehicleDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getVehicleEventHistory(
    params: IVehicleEventHistoryGetFormDto,
    vehicleId: string
  ): Observable<IVehicleEventHistoryGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE.GET_VEHICLE_EVENT_HISTORY(vehicleId),
        {
          response: VehicleEventHistoryGetResponseSchema,
          request: VehicleEventHistoryGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
