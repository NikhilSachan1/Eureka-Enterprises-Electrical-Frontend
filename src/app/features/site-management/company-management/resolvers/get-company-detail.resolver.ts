import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  ICompanyDetailGetFormDto,
  ICompanyDetailGetResponseDto,
} from '../types/company.dto';
import { CompanyService } from '../services/company.service';

@Injectable({
  providedIn: 'root',
})
export class GetCompanyDetailResolver
  implements Resolve<ICompanyDetailGetResponseDto | null>
{
  private readonly companyService = inject(CompanyService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<ICompanyDetailGetResponseDto | null> {
    const companyId = route.paramMap.get('companyId');

    if (!companyId) {
      this.navigateToCompanyList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Company Detail',
      message: 'Please wait while we load the company detail...',
    });

    const paramData = this.prepareParamData(companyId);

    return this.companyService.getCompanyDetailById(paramData).pipe(
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
        this.navigateToCompanyList();
        return of(null);
      })
    );
  }

  private navigateToCompanyList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.COMPANY,
      ROUTES.SITE.COMPANY.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(companyId: string): ICompanyDetailGetFormDto {
    return {
      companyId,
    };
  }
}
