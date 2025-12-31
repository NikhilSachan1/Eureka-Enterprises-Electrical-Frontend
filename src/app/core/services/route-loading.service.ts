import { Injectable, inject, signal } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Service to track route navigation loading state
 * Used to show progress bar and page transitions
 */
@Injectable({
  providedIn: 'root',
})
export class RouteLoadingService {
  private readonly router = inject(Router);

  // Signal to track loading state
  private readonly _isLoading = signal<boolean>(false);

  // Public readonly signal for components to consume
  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Minimum loading time in milliseconds
   * Set to 0 for production, increase for testing (e.g., 1000 = 1 second)
   * TODO: Remove or set to 0 before production deployment
   */
  private readonly MIN_LOADING_TIME = 0; // 800ms for testing - set to 0 for production

  constructor() {
    this.initRouteListener();
  }

  /**
   * Initialize route event listeners
   * Sets loading state based on navigation lifecycle
   */
  private initRouteListener(): void {
    // Navigation started - show loading
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this._isLoading.set(true);
      });

    // Navigation ended (success, cancel, or error) - hide loading
    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe(() => {
        // Delay to ensure smooth transition and show loading animation
        setTimeout(() => {
          this._isLoading.set(false);
        }, this.MIN_LOADING_TIME);
      });
  }

  /**
   * Manually set loading state
   * Useful for async operations within components
   */
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }
}
