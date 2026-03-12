import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, catchError, finalize, of } from 'rxjs';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants/route.constants';
import { RolePermissionService } from '../services/role-permission.service';
import {
  IRolePermissionsGetFormDto,
  IRolePermissionsGetResponseDto,
} from '../types/role-permission.dto';

@Injectable({
  providedIn: 'root',
})
export class RolePermissionResolver
  implements Resolve<IRolePermissionsGetResponseDto | null>
{
  private readonly rolePermissionService = inject(RolePermissionService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IRolePermissionsGetResponseDto | null> {
    const roleId = route.paramMap.get('roleId');

    if (!roleId) {
      this.navigateToRoleList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Role Permission',
      message: 'Please wait while we load the role permission...',
    });

    const paramData = this.prepareParamData(roleId);

    return this.rolePermissionService.getRolePermission(paramData).pipe(
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
        this.navigateToRoleList();
        return of(null);
      })
    );
  }

  private navigateToRoleList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SETTINGS.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(roleId: string): IRolePermissionsGetFormDto {
    return {
      roleId,
    };
  }
}
