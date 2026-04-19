import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {
  IFuelExpenseDetailGetRequestDto,
  IFuelExpenseDetailGetResponseDto,
} from '../types/fuel-expense.dto';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { FuelExpenseService } from '../services/fuel-expense.service';
import { LoggerService } from '@core/services';
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
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IFuelExpenseDetailResolverResponse | null> {
    const fuelExpenseId = route.paramMap.get('fuelExpenseId');

    this.logger.logUserAction(
      'Get Fuel Expense Detail Resolver: Starting resolution',
      { fuelExpenseId }
    );

    if (!fuelExpenseId) {
      this.logger.logUserAction(
        'Get Fuel Expense Detail Resolver: No fuelExpenseId found in route'
      );
      this.navigateToFuelExpenseList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Fuel Expense Detail',
      message:
        "We're loading the expense detail. This will just take a moment.",
    });

    const paramData = this.prepareParamData(fuelExpenseId);

    return this.fuelExpenseService.getFuelExpenseDetailById(paramData).pipe(
      switchMap((response: IFuelExpenseDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Fuel Expense Detail Resolver: Data resolved successfully',
          response
        );

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
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Fuel Expense Detail Resolver: Error resolving data',
          error
        );
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
