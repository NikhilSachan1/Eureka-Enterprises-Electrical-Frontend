import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {
  IvehicleDetailGetFormDto,
  IVehicleDetailGetResponseDto,
} from '../types/vehicle.dto';
import { LoggerService } from '@core/services';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IVehicleDetailResolverResponse } from '../types/vehicle.interface';
import { VehicleService } from '../services/vehicle.service';

@Injectable({
  providedIn: 'root',
})
export class GetVehicleDetailResolver
  implements Resolve<IVehicleDetailResolverResponse | null>
{
  private readonly vehicleService = inject(VehicleService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IVehicleDetailResolverResponse | null> {
    const vehicleId = route.paramMap.get('vehicleId');

    this.logger.logUserAction(
      'Get Vehicle Detail Resolver: Starting resolution',
      { vehicleId }
    );

    if (!vehicleId) {
      this.logger.logUserAction(
        'Get Vehicle Detail Resolver: No vehicleId found in route'
      );
      this.navigateToVehicleList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Vehicle Detail',
      message: 'Please wait while we load the vehicle detail...',
    });

    const paramData = this.prepareParamData(vehicleId);

    return this.vehicleService.getVehicleDetailById(paramData).pipe(
      switchMap((response: IVehicleDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Vehicle Detail Resolver: Data resolved successfully',
          response
        );

        const latestHistoryItem =
          response.versionHistory[response.versionHistory.length - 1];
        const fileKeys = latestHistoryItem?.documentKeys || [];

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
          'Get Vehicle Detail Resolver: Error resolving data',
          error
        );
        this.navigateToVehicleList();
        return of(null);
      })
    );
  }

  private navigateToVehicleList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.TRANSPORT,
      ROUTE_BASE_PATHS.VEHICLE,
      ROUTES.VEHICLE.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(vehicleId: string): IvehicleDetailGetFormDto {
    return {
      vehicleId,
    };
  }
}
