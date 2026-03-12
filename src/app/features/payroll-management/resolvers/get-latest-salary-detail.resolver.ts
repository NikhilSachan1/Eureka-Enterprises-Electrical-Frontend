import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { PayrollService } from '../services/payroll.service';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  ISalaryStructureHistoryGetFormDto,
  ISalaryStructureHistoryGetResponseDto,
} from '../types/payroll.dto';
import { ISalaryDetailResolverResponse } from '../types/payroll.interface';

@Injectable({
  providedIn: 'root',
})
export class GetLatestSalaryDetailResolver
  implements Resolve<ISalaryDetailResolverResponse | null>
{
  private readonly payrollService = inject(PayrollService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<ISalaryDetailResolverResponse | null> {
    const salaryStructureId = route.paramMap.get('salaryStructureId');

    if (!salaryStructureId) {
      this.navigateToSalaryStructureList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Latest Salary Detail',
      message: 'Please wait while we load the latest salary detail...',
    });

    const paramData = this.prepareParamData(salaryStructureId);

    return this.payrollService
      .getSalaryStructureHistory(paramData.salaryStructureId)
      .pipe(
        switchMap((response: ISalaryStructureHistoryGetResponseDto) => {
          const latestHistoryItem = response[response.length - 1];
          return of({
            basicSalary: latestHistoryItem.newValues.basic,
            hra: latestHistoryItem.newValues.hra,
            tds: latestHistoryItem.newValues.tds ?? '0',
            employerEsicContribution: latestHistoryItem.newValues.esic ?? '0',
            employeePfContribution:
              latestHistoryItem.newValues.employeePf ?? '0',
            foodAllowance: latestHistoryItem.newValues.foodAllowance ?? '0',
          });
        }),
        finalize(() => {
          this.loadingService.hide();
        }),
        catchError(() => {
          this.navigateToSalaryStructureList();
          return of(null);
        })
      );
  }

  private navigateToSalaryStructureList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.PAYROLL, ROUTES.PAYROLL.STRUCTURE];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(
    salaryStructureId: string
  ): ISalaryStructureHistoryGetFormDto {
    return {
      salaryStructureId,
    };
  }
}
