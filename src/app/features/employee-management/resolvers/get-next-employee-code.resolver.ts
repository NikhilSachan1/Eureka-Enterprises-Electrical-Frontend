import { Resolve } from '@angular/router';
import { catchError, finalize, Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IEmployeeGetNextEmployeeIdResponseDto } from '../types/employee.dto';
import { EmployeeService } from '../services/employee.service';
import { EMPLOYEE_MESSAGES } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class GetNextEmployeeCodeResolver
  implements Resolve<IEmployeeGetNextEmployeeIdResponseDto | null>
{
  private readonly employeeService = inject(EmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(): Observable<IEmployeeGetNextEmployeeIdResponseDto | null> {
    this.loadingService.show({
      title: EMPLOYEE_MESSAGES.LOADING.GET_NEXT_ID,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.GET_NEXT_ID,
    });

    return this.employeeService.getNextEmployeeId().pipe(
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
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
