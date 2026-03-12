import { inject } from '@angular/core';
import { AuthService } from '@features/auth-management/services/auth.service';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    if (authService.isUserAuthenticated()) {
      return true;
    }

    sessionStorage.setItem('auth_redirect_url', state.url);

    void router.navigate([`/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`], {
      queryParams: { returnUrl: state.url },
    });

    return false;
  } catch {
    void router.navigate([`/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`]);
    return false;
  }
};
