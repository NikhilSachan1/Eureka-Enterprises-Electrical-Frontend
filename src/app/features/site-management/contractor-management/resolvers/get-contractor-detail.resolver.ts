import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  IContractorDetailGetFormDto,
  IContractorDetailGetResponseDto,
} from '../types/contractor.dto';
import { ContractorService } from '../services/contractor.service';

@Injectable({
  providedIn: 'root',
})
export class GetContractorDetailResolver
  implements Resolve<IContractorDetailGetResponseDto | null>
{
  private readonly contractorService = inject(ContractorService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IContractorDetailGetResponseDto | null> {
    const contractorId = route.paramMap.get('contractorId');

    this.logger.logUserAction(
      'Get Contractor Detail Resolver: Starting resolution',
      { contractorId }
    );

    if (!contractorId) {
      this.logger.logUserAction(
        'Get Contractor Detail Resolver: No contractorId found in route'
      );
      this.navigateToContractorList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Contractor Detail',
      message: 'Please wait while we load the contractor detail...',
    });

    const paramData = this.prepareParamData(contractorId);

    return this.contractorService.getContractorDetailById(paramData).pipe(
      switchMap((response: IContractorDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Contractor Detail Resolver: Data resolved successfully',
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
          'Get Contractor Detail Resolver: Error resolving data',
          error
        );
        this.navigateToContractorList();
        return of(null);
      })
    );
  }

  private navigateToContractorList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.CONTRACTOR,
      ROUTES.SITE.CONTRACTOR.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(contractorId: string): IContractorDetailGetFormDto {
    return {
      contractorId,
    };
  }
}
