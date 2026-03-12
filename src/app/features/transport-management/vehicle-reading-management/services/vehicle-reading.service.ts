import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import {
  IvehicleReadingAddFormDto,
  IVehicleReadingAddResponseDto,
  IvehicleReadingDetailGetFormDto,
  IVehicleReadingDetailGetResponseDto,
  IvehicleReadingEditFormDto,
  IVehicleReadingEditResponseDto,
  IvehicleReadingGetFormDto,
  IVehicleReadingGetResponseDto,
} from '../types/vehicle-reading.dto';
import {
  VehicleReadingAddRequestSchema,
  VehicleReadingAddResponseSchema,
  VehicleReadingDetailGetResponseSchema,
  VehicleReadingEditRequestSchema,
  VehicleReadingEditResponseSchema,
  VehicleReadingGetRequestSchema,
  VehicleReadingGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class VehicleReadingService {
  private readonly apiService = inject(ApiService);

  addVehicleReading(
    formData: IvehicleReadingAddFormDto
  ): Observable<IVehicleReadingAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.VEHICLE_READING.ADD,
        {
          response: VehicleReadingAddResponseSchema,
          request: VehicleReadingAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editVehicleReading(
    formData: IvehicleReadingEditFormDto,
    vehicleReadingId: string
  ): Observable<IVehicleReadingEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.VEHICLE_READING.EDIT(vehicleReadingId),
        {
          response: VehicleReadingEditResponseSchema,
          request: VehicleReadingEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getVehicleReadingList(
    params?: IvehicleReadingGetFormDto
  ): Observable<IVehicleReadingGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE_READING.LIST,
        {
          response: VehicleReadingGetResponseSchema,
          request: VehicleReadingGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getVehicleReadingDetailById(
    params: IvehicleReadingDetailGetFormDto
  ): Observable<IVehicleReadingDetailGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE_READING.GET_VEHICLE_READING_BY_ID(
          params.vehicleReadingId
        ),
        {
          response: VehicleReadingDetailGetResponseSchema,
        }
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
