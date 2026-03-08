import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AppPermissionService } from '@core/services/app-permission.service';
import { LoggerService } from '@core/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const appPermissionService = inject(AppPermissionService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  const requiredPermissions: string[] = route.data['permissions'] ?? [];

  if (requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has any of the required permissions
  const hasPermission =
    appPermissionService.hasAnyPermission(requiredPermissions);

  if (hasPermission) {
    logger.info('Permission Guard: Access granted', {
      requestedUrl: state.url,
      requiredPermissions,
    });
    return true;
  }

  logger.warn('Permission Guard: Access denied - insufficient permissions', {
    attemptedUrl: state.url,
    requiredPermissions,
    userPermissions: appPermissionService.getPermissions(),
  });

  // Redirect to dashboard or unauthorized page
  void router.navigate([ROUTE_BASE_PATHS.DASHBOARD]);
  return false;
};
