import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
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
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IContractorDetailGetResponseDto | null> {
    const contractorId = route.paramMap.get('contractorId');

    if (!contractorId) {
      this.navigateToContractorList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Contractor Detail',
      message: 'Please wait while we load the contractor detail...',
    });

    const paramData = this.prepareParamData(contractorId);

    return this.contractorService.getContractorDetailById(paramData).pipe(
      switchMap((response: IContractorDetailGetResponseDto) =>
        of({ ...response })
      ),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
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
