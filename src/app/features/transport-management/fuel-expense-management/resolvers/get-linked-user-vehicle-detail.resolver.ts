import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  ILinkedUserVehicleDetailGetFormDto,
  ILinkedUserVehicleDetailGetResponseDto,
} from '../types/fuel-expense.dto';
import { FuelExpenseService } from '../services/fuel-expense.service';

@Injectable({
  providedIn: 'root',
})
export class GetLinkedUserVehicleDetailResolver
  implements Resolve<ILinkedUserVehicleDetailGetResponseDto | null>
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<ILinkedUserVehicleDetailGetResponseDto | null> {
    const employeeName = route.paramMap.get('employeeName');

    this.loadingService.show({
      title: 'Loading Linked User Vehicle Detail',
      message: 'Please wait while we load the linked user vehicle detail...',
    });

    const paramData = this.prepareParamData(employeeName);

    return this.fuelExpenseService.getLinkedUserVehicleDetail(paramData).pipe(
      switchMap((response: ILinkedUserVehicleDetailGetResponseDto) =>
        of(response)
      ),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
        this.navigateToFuelExpenseList();
        return of(null);
      })
    );
  }

  private navigateToFuelExpenseList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.TRANSPORT,
      ROUTE_BASE_PATHS.FUEL,
      ROUTES.FUEL.LEDGER,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(
    employeeName: string | null
  ): ILinkedUserVehicleDetailGetFormDto {
    return {
      employeeName,
    };
  }
}
