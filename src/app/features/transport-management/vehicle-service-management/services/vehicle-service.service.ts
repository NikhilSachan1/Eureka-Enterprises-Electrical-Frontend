import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  VehicleServiceAddRequestSchema,
  VehicleServiceAddResponseSchema,
  VehicleServiceDeleteRequestSchema,
  VehicleServiceDeleteResponseSchema,
  VehicleServiceDetailGetResponseSchema,
  VehicleServiceEditRequestSchema,
  VehicleServiceEditResponseSchema,
  VehicleServiceGetRequestSchema,
  VehicleServiceGetResponseSchema,
} from '../schemas';
import {
  IvehicleServiceAddFormDto,
  IVehicleServiceAddResponseDto,
  IvehicleServiceDeleteFormDto,
  IVehicleServiceDeleteResponseDto,
  IVehicleServiceDetailGetFormDto,
  IVehicleServiceDetailGetResponseDto,
  IvehicleServiceEditFormDto,
  IVehicleServiceEditResponseDto,
  IVehicleServiceGetFormDto,
  IVehicleServiceGetResponseDto,
} from '../types/vehicle-service.dto';

@Injectable({
  providedIn: 'root',
})
export class VehicleServiceService {
  private readonly apiService = inject(ApiService);

  addVehicleService(
    formData: IvehicleServiceAddFormDto
  ): Observable<IVehicleServiceAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.VEHICLE_SERVICE.ADD,
        {
          response: VehicleServiceAddResponseSchema,
          request: VehicleServiceAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editVehicleService(
    formData: IvehicleServiceEditFormDto,
    vehicleServiceId: string
  ): Observable<IVehicleServiceEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.VEHICLE_SERVICE.EDIT(vehicleServiceId),
        {
          response: VehicleServiceEditResponseSchema,
          request: VehicleServiceEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteVehicleService(
    formData: IvehicleServiceDeleteFormDto
  ): Observable<IVehicleServiceDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.VEHICLE_SERVICE.DELETE,
        {
          response: VehicleServiceDeleteResponseSchema,
          request: VehicleServiceDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getVehicleServiceList(
    params?: IVehicleServiceGetFormDto
  ): Observable<IVehicleServiceGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE_SERVICE.LIST,
        {
          response: VehicleServiceGetResponseSchema,
          request: VehicleServiceGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getVehicleServiceDetailById(
    params: IVehicleServiceDetailGetFormDto
  ): Observable<IVehicleServiceDetailGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE_SERVICE.GET_VEHICLE_SERVICE_BY_ID(
          params.vehicleServiceId
        ),
        {
          response: VehicleServiceDetailGetResponseSchema,
        }
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
