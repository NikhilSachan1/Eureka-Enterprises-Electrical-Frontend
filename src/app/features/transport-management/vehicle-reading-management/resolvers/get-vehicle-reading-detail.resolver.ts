import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {
  IvehicleReadingDetailGetFormDto,
  IVehicleReadingDetailGetResponseDto,
} from '../types/vehicle-reading.dto';
import {
  catchError,
  finalize,
  forkJoin,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IVehicleReadingDetailResolverResponse } from '../types/vehicle-reading.interface';
import { VehicleReadingService } from '../services/vehicle-reading.service';

@Injectable({
  providedIn: 'root',
})
export class GetVehicleReadingDetailResolver
  implements Resolve<IVehicleReadingDetailResolverResponse | null>
{
  private readonly vehicleReadingService = inject(VehicleReadingService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IVehicleReadingDetailResolverResponse | null> {
    const vehicleReadingId = route.paramMap.get('vehicleReadingId');

    this.logger.logUserAction(
      'Get Vehicle Reading Detail Resolver: Starting resolution',
      { vehicleReadingId }
    );

    if (!vehicleReadingId) {
      this.logger.logUserAction(
        'Get Vehicle Reading Detail Resolver: No vehicleReadingId found in route'
      );
      this.navigateToVehicleReadingList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Vehicle Reading Detail',
      message:
        "We're loading the vehicle reading detail. This will just take a moment.",
    });

    const paramData = this.prepareParamData(vehicleReadingId);

    return this.vehicleReadingService
      .getVehicleReadingDetailById(paramData)
      .pipe(
        switchMap((response: IVehicleReadingDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Reading Detail Resolver: Data resolved successfully',
            response
          );

          const startOdometerKeys = response.startOdometerReadingKeys ?? [];
          const endOdometerKeys = response.endOdometerReadingKeys ?? [];

          return forkJoin({
            startFiles:
              this.attachmentsService.loadFilesFromKeys(startOdometerKeys),
            endFiles:
              this.attachmentsService.loadFilesFromKeys(endOdometerKeys),
          }).pipe(
            switchMap(({ startFiles, endFiles }) => {
              return of({
                ...response,
                preloadedStartOdometerFiles: startFiles,
                preloadedEndOdometerFiles: endFiles,
              });
            })
          );
        }),
        finalize(() => {
          this.loadingService.hide();
        }),
        catchError((error: unknown) => {
          this.logger.logUserAction(
            'Get Vehicle Reading Detail Resolver: Error resolving data',
            error
          );
          this.navigateToVehicleReadingList();
          return of(null);
        })
      );
  }

  private navigateToVehicleReadingList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.TRANSPORT,
      ROUTE_BASE_PATHS.VEHICLE_READING,
      ROUTES.VEHICLE_READING.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(
    vehicleReadingId: string
  ): IvehicleReadingDetailGetFormDto {
    return {
      vehicleReadingId,
    };
  }
}
