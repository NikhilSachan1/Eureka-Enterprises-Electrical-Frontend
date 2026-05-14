import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  IVendorDetailGetFormDto,
  IVendorDetailGetResponseDto,
} from '../types/vendor.dto';
import { VendorService } from '../services/vendor.service';

@Injectable({
  providedIn: 'root',
})
export class GetVendorDetailResolver
  implements Resolve<IVendorDetailGetResponseDto | null>
{
  private readonly vendorService = inject(VendorService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IVendorDetailGetResponseDto | null> {
    const vendorId = route.paramMap.get('vendorId');

    this.logger.logUserAction(
      'Get Vendor Detail Resolver: Starting resolution',
      { vendorId }
    );

    if (!vendorId) {
      this.logger.logUserAction(
        'Get Vendor Detail Resolver: No vendorId found in route'
      );
      this.navigateToVendorList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Vendor Detail',
      message: "We're loading the vendor detail. This will just take a moment.",
    });

    const paramData = this.prepareParamData(vendorId);

    return this.vendorService.getVendorDetailById(paramData).pipe(
      switchMap((response: IVendorDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Vendor Detail Resolver: Data resolved successfully',
          response
        );
        return of({
          ...response,
        });
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Vendor Detail Resolver: Error resolving data',
          error
        );
        this.navigateToVendorList();
        return of(null);
      })
    );
  }

  private navigateToVendorList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.VENDOR,
      ROUTES.SITE.VENDOR.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(vendorId: string): IVendorDetailGetFormDto {
    return {
      vendorId,
    };
  }
}
