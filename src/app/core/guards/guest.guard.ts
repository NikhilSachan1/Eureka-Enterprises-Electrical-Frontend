import { inject, Injectable } from '@angular/core';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { ROUTE_BASE_PATHS } from '@shared/constants';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean {
    try {
      if (this.authService.isUserAuthenticated()) {
        void this.router.navigate([`/${ROUTE_BASE_PATHS.DASHBOARD}`]);
        return false;
      }
      return true;
    } catch {
      // Navigation error - silently fail
      return true;
    }
  }
}
