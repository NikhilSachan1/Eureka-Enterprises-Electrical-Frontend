import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { PayrollService } from '../services/payroll.service';
import { LoggerService } from '@core/services';
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
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<ISalaryDetailResolverResponse | null> {
    const salaryStructureId = route.paramMap.get('salaryStructureId');

    this.logger.logUserAction(
      'Get Latest Salary Detail Resolver: Starting resolution',
      { salaryStructureId }
    );

    if (!salaryStructureId) {
      this.logger.logUserAction(
        'Get Latest Salary Detail Resolver: No salaryStructureId found in route'
      );
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
          this.logger.logUserAction(
            'Get Latest Salary Detail Resolver: Data resolved successfully',
            latestHistoryItem
          );
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
        catchError((error: unknown) => {
          this.logger.logUserAction(
            'Get Latest Salary Detail Resolver: Error resolving data',
            error
          );
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
