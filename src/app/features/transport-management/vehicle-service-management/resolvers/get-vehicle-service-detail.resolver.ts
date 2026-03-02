import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IVehicleServiceDetailResolverResponse } from '../types/vehicle-service.interface';
import { VehicleServiceService } from '../services/vehicle-service.service';
import {
  IVehicleServiceDetailGetFormDto,
  IVehicleServiceDetailGetResponseDto,
} from '../types/vehicle-service.dto';

@Injectable({
  providedIn: 'root',
})
export class GetVehicleServiceDetailResolver
  implements Resolve<IVehicleServiceDetailResolverResponse | null>
{
  private readonly vehicleServiceService = inject(VehicleServiceService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IVehicleServiceDetailResolverResponse | null> {
    const vehicleServiceId = route.paramMap.get('vehicleServiceId');

    this.logger.logUserAction(
      'Get Vehicle Service Detail Resolver: Starting resolution',
      { vehicleServiceId }
    );

    if (!vehicleServiceId) {
      this.logger.logUserAction(
        'Get Vehicle Service Detail Resolver: No vehicleServiceId found in route'
      );
      this.navigateToVehicleServiceList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Vehicle Service Detail',
      message: 'Please wait while we load the vehicle service detail...',
    });

    const paramData = this.prepareParamData(vehicleServiceId);

    return this.vehicleServiceService
      .getVehicleServiceDetailById(paramData)
      .pipe(
        switchMap((response: IVehicleServiceDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Service Detail Resolver: Data resolved successfully',
            response
          );

          const fileKeys = response.documentKeys || [];

          return this.attachmentsService.loadFilesFromKeys(fileKeys).pipe(
            switchMap(files => {
              return of({
                ...response,
                preloadedFiles: files,
              });
            })
          );
        }),
        finalize(() => {
          this.loadingService.hide();
        }),
        catchError((error: unknown) => {
          this.logger.logUserAction(
            'Get Vehicle Service Detail Resolver: Error resolving data',
            error
          );
          this.navigateToVehicleServiceList();
          return of(null);
        })
      );
  }

  private navigateToVehicleServiceList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.VEHICLE_SERVICE,
      ROUTES.VEHICLE_SERVICE.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(
    vehicleServiceId: string
  ): IVehicleServiceDetailGetFormDto {
    return {
      vehicleServiceId,
    };
  }
}
