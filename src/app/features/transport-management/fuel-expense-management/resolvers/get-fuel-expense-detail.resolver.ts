import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {
  IFuelExpenseDetailGetRequestDto,
  IFuelExpenseDetailGetResponseDto,
} from '../types/fuel-expense.dto';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { FuelExpenseService } from '../services/fuel-expense.service';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IFuelExpenseDetailResolverResponse } from '../types/fuel-expense.interface';

@Injectable({
  providedIn: 'root',
})
export class GetFuelExpenseDetailResolver
  implements Resolve<IFuelExpenseDetailResolverResponse | null>
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IFuelExpenseDetailResolverResponse | null> {
    const fuelExpenseId = route.paramMap.get('fuelExpenseId');

    if (!fuelExpenseId) {
      this.navigateToFuelExpenseList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Fuel Expense Detail',
      message: 'Please wait while we load the expense detail...',
    });

    const paramData = this.prepareParamData(fuelExpenseId);

    return this.fuelExpenseService.getFuelExpenseDetailById(paramData).pipe(
      switchMap((response: IFuelExpenseDetailGetResponseDto) => {
        const latestHistoryItem = response.history[response.history.length - 1];
        const fileKeys = latestHistoryItem?.fileKeys || [];

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
      catchError(() => {
        this.navigateToFuelExpenseList();
        return of(null);
      })
    );
  }

  private navigateToFuelExpenseList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.FUEL, ROUTES.FUEL.LEDGER];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(
    fuelExpenseId: string
  ): IFuelExpenseDetailGetRequestDto {
    return {
      id: fuelExpenseId,
    };
  }
}
