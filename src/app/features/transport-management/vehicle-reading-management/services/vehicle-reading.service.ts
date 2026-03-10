import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
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
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addVehicleReading(
    formData: IvehicleReadingAddFormDto
  ): Observable<IVehicleReadingAddResponseDto> {
    this.logger.logUserAction('Add Vehicle Reading Request');

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
      .pipe(
        tap((response: IVehicleReadingAddResponseDto) => {
          this.logger.logUserAction('Add Vehicle Reading Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Vehicle Reading Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Vehicle Reading Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editVehicleReading(
    formData: IvehicleReadingEditFormDto,
    vehicleReadingId: string
  ): Observable<IVehicleReadingEditResponseDto> {
    this.logger.logUserAction('Edit Vehicle Reading Request');

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
      .pipe(
        tap((response: IVehicleReadingEditResponseDto) => {
          this.logger.logUserAction('Edit Vehicle Reading Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Vehicle Reading Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Vehicle Reading Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVehicleReadingList(
    params?: IvehicleReadingGetFormDto
  ): Observable<IVehicleReadingGetResponseDto> {
    this.logger.logUserAction('Get Vehicle Reading List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE_READING.LIST,
        {
          response: VehicleReadingGetResponseSchema,
          request: VehicleReadingGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IVehicleReadingGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Reading List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vehicle Reading List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Vehicle Reading List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVehicleReadingDetailById(
    params: IvehicleReadingDetailGetFormDto
  ): Observable<IVehicleReadingDetailGetResponseDto> {
    this.logger.logUserAction('Get Vehicle Reading Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE_READING.GET_VEHICLE_READING_BY_ID(
          params.vehicleReadingId
        ),
        {
          response: VehicleReadingDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IVehicleReadingDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Reading Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vehicle Reading Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Vehicle Reading Detail By Id Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
