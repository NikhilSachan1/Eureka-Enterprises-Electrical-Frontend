import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppPermissionService } from '@core/services/app-permission.service';
import { ROUTE_BASE_PATHS } from '@shared/constants';

/** Hides vendor routes when GET /sites/vendors/assignable is not allowed (including 403). */
export const vendorSectionGuard: CanActivateFn = () => {
  const appPermissionService = inject(AppPermissionService);
  const router = inject(Router);

  if (appPermissionService.isVendorMenuAllowed()) {
    return true;
  }

  void router.navigate([ROUTE_BASE_PATHS.DASHBOARD]);
  return false;
};
