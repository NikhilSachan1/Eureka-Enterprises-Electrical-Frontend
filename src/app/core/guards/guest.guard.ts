import { Injectable } from '@angular/core';
import { AuthService } from '@features/auth-management/services/auth.service';
import { Router, CanActivate } from '@angular/router';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoggerService } from '@core/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    try {

      if (this.authService.isUserAuthenticated()) {
        this.logger.info('Guest Guard: User is authenticated, redirecting to dashboard', {
          currentUrl: state.url,
          user: this.authService.getCurrentUser()
        });
        
        this.router.navigate([`/${ROUTE_BASE_PATHS.DASHBOARD}`]);
        return false;
      }

      this.logger.info('Guest Guard: User not authenticated, allowing access to auth page', {
        requestedUrl: state.url
      });
      return true;
    } catch (error) {
      this.logger.error('Guest Guard: Error checking authentication status', error);
      return true;
    }
  }
}
