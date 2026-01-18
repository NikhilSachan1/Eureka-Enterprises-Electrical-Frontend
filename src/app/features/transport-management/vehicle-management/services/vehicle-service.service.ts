import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  VehicleServiceAddRequestSchema,
  VehicleServiceAddResponseSchema,
  VehicleServiceDeleteRequestSchema,
  VehicleServiceDeleteResponseSchema,
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
  IvehicleServiceEditFormDto,
  IVehicleServiceEditResponseDto,
  IvehicleServiceGetFormDto,
  IVehicleServiceGetResponseDto,
} from '../types/vehicle-service.dto';

@Injectable({
  providedIn: 'root',
})
export class VehicleServiceService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addVehicleService(
    formData: IvehicleServiceAddFormDto
  ): Observable<IVehicleServiceAddResponseDto> {
    this.logger.logUserAction('Add Vehicle Service Request');

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
      .pipe(
        tap((response: IVehicleServiceAddResponseDto) => {
          this.logger.logUserAction('Add Vehicle Service Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Vehicle Service Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Vehicle Service Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editVehicleService(
    formData: IvehicleServiceEditFormDto,
    vehicleServiceId: string
  ): Observable<IVehicleServiceEditResponseDto> {
    this.logger.logUserAction('Edit Vehicle Service Request');

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
      .pipe(
        tap((response: IVehicleServiceEditResponseDto) => {
          this.logger.logUserAction('Edit Vehicle Service Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Vehicle Service Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Vehicle Service Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteVehicleService(
    formData: IvehicleServiceDeleteFormDto
  ): Observable<IVehicleServiceDeleteResponseDto> {
    this.logger.logUserAction('Delete Vehicle Service Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.VEHICLE_SERVICE.DELETE,
        {
          response: VehicleServiceDeleteResponseSchema,
          request: VehicleServiceDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IVehicleServiceDeleteResponseDto) => {
          this.logger.logUserAction(
            'Delete Vehicle Service Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Vehicle Service Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Vehicle Service Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVehicleServiceList(
    params?: IvehicleServiceGetFormDto
  ): Observable<IVehicleServiceGetResponseDto> {
    this.logger.logUserAction('Get Vehicle Service List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE_SERVICE.LIST,
        {
          response: VehicleServiceGetResponseSchema,
          request: VehicleServiceGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IVehicleServiceGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Service List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vehicle Service List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Vehicle Service List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
