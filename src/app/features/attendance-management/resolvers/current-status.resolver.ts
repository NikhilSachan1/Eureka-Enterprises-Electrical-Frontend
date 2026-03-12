import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, catchError, finalize, of } from 'rxjs';
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
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(): Observable<IAttendanceCurrentStatusGetResponseDto | null> {
    this.loadingService.show({
      title: 'Loading Current Status',
      message: 'Please wait while we load the current status...',
    });

    return this.attendanceService.getAttendanceCurrentStatus().pipe(
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
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
