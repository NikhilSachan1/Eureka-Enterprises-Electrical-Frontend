import { Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IEmployeeGetNextEmployeeIdResponseDto } from '../types/employee.dto';
import { EmployeeService } from '../services/employee.service';

@Injectable({
  providedIn: 'root',
})
export class GetNextEmployeeCodeResolver
  implements Resolve<IEmployeeGetNextEmployeeIdResponseDto | null>
{
  private readonly employeeService = inject(EmployeeService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(): Observable<IEmployeeGetNextEmployeeIdResponseDto | null> {
    this.logger.logUserAction(
      'Get Next Employee Code Resolver: Starting resolution'
    );

    this.loadingService.show({
      title: 'Loading Next Employee Code',
      message: 'Please wait while we prepare the next employee code...',
    });

    return this.employeeService.getNextEmployeeId().pipe(
      tap((response: IEmployeeGetNextEmployeeIdResponseDto) => {
        this.logger.logUserAction(
          'Get Next Employee Code Resolver: Data resolved successfully',
          response
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Next Employee Code Resolver: Error resolving data',
          error
        );
        this.navigateToEmployeeList();
        return of(null);
      })
    );
  }

  private navigateToEmployeeList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.LIST];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }
}
