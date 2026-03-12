import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AppPermissionService } from '@core/services/app-permission.service';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const appPermissionService = inject(AppPermissionService);
  const router = inject(Router);

  const requiredPermissions: string[] = route.data['permissions'] ?? [];

  if (requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has any of the required permissions
  const hasPermission =
    appPermissionService.hasAnyPermission(requiredPermissions);

  if (hasPermission) {
    return true;
  }

  // Redirect to dashboard or unauthorized page
  void router.navigate([ROUTE_BASE_PATHS.DASHBOARD]);
  return false;
};
