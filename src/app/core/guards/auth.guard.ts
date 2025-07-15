import { Injectable, inject } from '@angular/core';
import { AuthService } from '@features/auth-management/services/auth.service';
import { Router, CanActivate } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { LoggerService } from '@core/services';
import { type CanActivateFn, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  try {

    if (authService.isUserAuthenticated()) {
      logger.info('Auth Guard: User is authenticated, allowing access', {
        requestedUrl: state.url,
        user: authService.getCurrentUser()
      });
      return true;
    }

    logger.warn('Auth Guard: User not authenticated, redirecting to login', {
      attemptedUrl: state.url
    });
    
    sessionStorage.setItem('auth_redirect_url', state.url);
    
    router.navigate([`/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`], {
      queryParams: { returnUrl: state.url }
    });
    
    return false;
  } catch (error) {
    logger.error('Auth Guard: Error checking authentication status', error);
    
    router.navigate([`/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`]);
    return false;
  }
};