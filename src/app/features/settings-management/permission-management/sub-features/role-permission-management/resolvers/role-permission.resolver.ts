import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
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
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IRolePermissionsGetResponseDto | null> {
    const roleId = route.paramMap.get('roleId');

    this.logger.logUserAction('Role Permission Resolver: Starting resolution');

    if (!roleId) {
      this.logger.logUserAction(
        'Role Permission Resolver: No roleId found in route'
      );
      this.navigateToRoleList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Role Permission',
      message:
        "We're loading the role permission. This will just take a moment.",
    });

    const paramData = this.prepareParamData(roleId);

    return this.rolePermissionService.getRolePermission(paramData).pipe(
      tap((response: IRolePermissionsGetResponseDto) => {
        this.logger.logUserAction(
          'Role Permission Resolver: Data resolved successfully',
          response
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Role Permission Resolver: Error resolving data',
          error
        );
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
