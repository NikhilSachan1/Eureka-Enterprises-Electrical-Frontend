import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants/route.constants';
import { ILeaveBalanceGetResponseDto } from '../types/leave.dto';
import { LeaveService } from '../services/leave.service';

@Injectable({
  providedIn: 'root',
})
export class GetLeaveBalanceResolver
  implements Resolve<ILeaveBalanceGetResponseDto | null>
{
  private readonly leaveService = inject(LeaveService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(): Observable<ILeaveBalanceGetResponseDto | null> {
    this.logger.logUserAction(
      'Get Leave Balance Resolver: Starting resolution'
    );

    this.loadingService.show({
      title: 'Loading Leave Balance',
      message: "We're loading the leave balance. This will just take a moment.",
    });

    return this.leaveService.getLeaveBalance().pipe(
      tap((response: ILeaveBalanceGetResponseDto) => {
        this.logger.logUserAction(
          'Get Leave Balance Resolver: Data resolved successfully',
          response
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Leave Balance Resolver: Error resolving data',
          error
        );
        this.navigateToLeaveList();
        return of(null);
      })
    );
  }

  private navigateToLeaveList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.LIST];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }
}
