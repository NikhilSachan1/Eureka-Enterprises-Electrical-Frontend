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
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IVehicleReadingDetailResolverResponse | null> {
    const vehicleReadingId = route.paramMap.get('vehicleReadingId');

    if (!vehicleReadingId) {
      this.navigateToVehicleReadingList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Vehicle Reading Detail',
      message: 'Please wait while we load the vehicle reading detail...',
    });

    const paramData = this.prepareParamData(vehicleReadingId);

    return this.vehicleReadingService
      .getVehicleReadingDetailById(paramData)
      .pipe(
        switchMap((response: IVehicleReadingDetailGetResponseDto) => {
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
        catchError(() => {
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
