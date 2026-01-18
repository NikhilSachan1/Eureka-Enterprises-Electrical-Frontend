import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
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
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addVehicle(formData: IvehicleAddFormDto): Observable<IVehicleAddResponseDto> {
    this.logger.logUserAction('Add Vehicle Request');

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
      .pipe(
        tap((response: IVehicleAddResponseDto) => {
          this.logger.logUserAction('Add Vehicle Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Vehicle Error', error);
          } else {
            this.logger.logUserAction('Add Vehicle Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editVehicle(
    formData: IvehicleEditFormDto,
    vehicleId: string
  ): Observable<IVehicleEditResponseDto> {
    this.logger.logUserAction('Edit Vehicle Request');

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
      .pipe(
        tap((response: IVehicleEditResponseDto) => {
          this.logger.logUserAction('Edit Vehicle Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Vehicle Error', error);
          } else {
            this.logger.logUserAction('Edit Vehicle Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteVehicle(
    formData: IvehicleDeleteFormDto
  ): Observable<IVehicleDeleteResponseDto> {
    this.logger.logUserAction('Delete Vehicle Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.VEHICLE.DELETE,
        {
          response: VehicleDeleteResponseSchema,
          request: VehicleDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IVehicleDeleteResponseDto) => {
          this.logger.logUserAction('Delete Vehicle Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Vehicle Error', error);
          } else {
            this.logger.logUserAction('Delete Vehicle Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  actionVehicle(
    formData: IvehicleActionFormDto
  ): Observable<IVehicleActionResponseDto> {
    this.logger.logUserAction('Action Vehicle Request');

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
      .pipe(
        tap((response: IVehicleActionResponseDto) => {
          this.logger.logUserAction('Action Vehicle Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Action Vehicle Error', error);
          } else {
            this.logger.logUserAction('Action Vehicle Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVehicleList(
    params?: IvehicleGetFormDto
  ): Observable<IVehicleGetResponseDto> {
    this.logger.logUserAction('Get Vehicle List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE.LIST,
        {
          response: VehicleGetResponseSchema,
          request: VehicleGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IVehicleGetResponseDto) => {
          this.logger.logUserAction('Get Vehicle List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Vehicle List Error', error);
          } else {
            this.logger.logUserAction('Get Vehicle List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVehicleDetailById(
    params: IvehicleDetailGetFormDto
  ): Observable<IVehicleDetailGetResponseDto> {
    this.logger.logUserAction('Get Vehicle Detail By Id Request');

    return this.apiService
      .getValidated(API_ROUTES.VEHICLE.GET_VEHICLE_BY_ID(params.vehicleId), {
        response: VehicleDetailGetResponseSchema,
      })
      .pipe(
        tap((response: IVehicleDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vehicle Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Vehicle Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVehicleEventHistory(
    params: IVehicleEventHistoryGetFormDto,
    vehicleId: string
  ): Observable<IVehicleEventHistoryGetResponseDto> {
    this.logger.logUserAction('Get Vehicle Event History Request');

    return this.apiService
      .getValidated(
        API_ROUTES.VEHICLE.GET_VEHICLE_EVENT_HISTORY(vehicleId),
        {
          response: VehicleEventHistoryGetResponseSchema,
          request: VehicleEventHistoryGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IVehicleEventHistoryGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Event History Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vehicle Event History Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Vehicle Event History Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
