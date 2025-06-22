import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth-management/services/auth.service';
import { LoggerService } from '../services/logger.service';
import { ROUTE_BASE_PATHS } from '../../shared/constants';

export const guestGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  try {

    if (authService.isUserAuthenticated()) {
      logger.info('Guest Guard: User is authenticated, redirecting to dashboard', {
        currentUrl: state.url,
        user: authService.getCurrentUser()
      });
      
      router.navigate([`/${ROUTE_BASE_PATHS.DASHBOARD}`]);
      return false;
    }

    logger.info('Guest Guard: User not authenticated, allowing access to auth page', {
      requestedUrl: state.url
    });
    return true;
  } catch (error) {
    logger.error('Guest Guard: Error checking authentication status', error);
    return true;
  }
};
