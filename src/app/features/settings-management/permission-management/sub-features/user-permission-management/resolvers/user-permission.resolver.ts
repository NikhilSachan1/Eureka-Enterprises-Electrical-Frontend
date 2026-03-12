import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, catchError, finalize, of } from 'rxjs';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants/route.constants';
import { UserPermissionService } from '../services/user-permission.service';
import {
  IUserPermissionsGetRequestDto,
  IUserPermissionsGetResponseDto,
} from '../types/user-permissions.dto';

@Injectable({
  providedIn: 'root',
})
export class UserPermissionResolver
  implements Resolve<IUserPermissionsGetResponseDto | null>
{
  private readonly userPermissionService = inject(UserPermissionService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IUserPermissionsGetResponseDto | null> {
    const userId = route.paramMap.get('userId');

    if (!userId) {
      this.navigateToUserList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading User Permission',
      message: 'Please wait while we load the user permission...',
    });

    const paramData = this.prepareParamData(userId);

    return this.userPermissionService.getUserPermission(paramData).pipe(
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
        this.navigateToUserList();
        return of(null);
      })
    );
  }

  private navigateToUserList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SETTINGS.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(userId: string): IUserPermissionsGetRequestDto {
    return {
      userId,
    };
  }
}
