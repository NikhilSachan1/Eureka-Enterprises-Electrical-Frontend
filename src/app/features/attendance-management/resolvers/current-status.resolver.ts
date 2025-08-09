import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants/route.constants';
import { IAttendanceCurrentStatusGetResponseDto } from '../types/attendance.dto';
import { AttendanceService } from '../services/attendance.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentStatusResolver
  implements Resolve<IAttendanceCurrentStatusGetResponseDto | null>
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(): Observable<IAttendanceCurrentStatusGetResponseDto | null> {
    this.logger.logUserAction('Current Status Resolver: Starting resolution');

    this.loadingService.show({
      title: 'Loading Current Status',
      message: 'Please wait while we load the current status...',
    });

    return this.attendanceService.getAttendanceCurrentStatus().pipe(
      tap((response: IAttendanceCurrentStatusGetResponseDto) => {
        this.logger.logUserAction(
          'Current Status Resolver: Data resolved successfully',
          response
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Current Status Resolver: Error resolving data',
          error
        );
        this.navigateToAttendanceList();
        return of(null);
      })
    );
  }

  private navigateToAttendanceList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.ATTENDANCE, ROUTES.ATTENDANCE.LIST];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }
}
