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
 * Tracks route navigation loading (progress bar + overlay).
 * Skips "shell-only" navigations so tab / nested-outlet switches do not unmount the layout.
 */
@Injectable({
  providedIn: 'root',
})
export class RouteLoadingService {
  private readonly router = inject(Router);

  private readonly _isLoading = signal<boolean>(false);

  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Minimum loading time in milliseconds
   * Set to 0 for production, increase for testing (e.g., 1000 = 1 second)
   * TODO: Remove or set to 0 before production deployment
   */
  private readonly MIN_LOADING_TIME = 0; // 800ms for testing - set to 0 for production

  /** Need at least this many matching leading segments before treating extension as in-shell. */
  private readonly MIN_PREFIX_SEGMENTS_FOR_EXTENSION_SKIP = 2;

  /** Common prefix must be this long before "short tail" sibling-depth rule applies. */
  private readonly MIN_PREFIX_DEPTH_FOR_TAIL_SKIP = 3;

  /** Max differing trailing segments on each side for asymmetric tab paths (e.g. …/a vs …/b/c). */
  private readonly MAX_TAIL_SEGMENTS_FOR_SKIP = 2;

  constructor() {
    this.initRouteListener();
  }

  private initRouteListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        if (this.shouldSkipShellOnlyNavigation(this.router.url, event.url)) {
          return;
        }
        this._isLoading.set(true);
      });

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
        setTimeout(() => {
          this._isLoading.set(false);
        }, this.MIN_LOADING_TIME);
      });
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  /**
   * True when navigation only changes trailing / nested segments under the same layout
   * (router-outlet tabs, doc sub-slugs, list→child one level, etc.).
   * Avoids full loading overlay for those cases.
   */
  private shouldSkipShellOnlyNavigation(
    fromRaw: string,
    toRaw: string
  ): boolean {
    const from = this.pathWithoutQueryOrHash(fromRaw);
    const to = this.pathWithoutQueryOrHash(toRaw);
    if (from === to) {
      return true;
    }

    const sa = from.replace(/^\/+/, '').split('/').filter(Boolean);
    const sb = to.replace(/^\/+/, '').split('/').filter(Boolean);
    const minLen = Math.min(sa.length, sb.length);
    let k = 0;
    while (k < minLen && sa[k] === sb[k]) {
      k++;
    }

    // Strict prefix: one path continues the other (e.g. …/list → …/list/add)
    if (k === sa.length || k === sb.length) {
      return (
        Math.min(sa.length, sb.length) >=
        this.MIN_PREFIX_SEGMENTS_FOR_EXTENSION_SKIP
      );
    }

    // Same depth, only last segment differs (sibling tabs at same URL depth)
    if (sa.length === sb.length && k === sa.length - 1) {
      return true;
    }

    // Different depth, deep common prefix, short differing tails (e.g. …/profitability → …/vendor-doc/po)
    if (
      k >= this.MIN_PREFIX_DEPTH_FOR_TAIL_SKIP &&
      sa.length !== sb.length &&
      sa.length - k <= this.MAX_TAIL_SEGMENTS_FOR_SKIP &&
      sb.length - k <= this.MAX_TAIL_SEGMENTS_FOR_SKIP
    ) {
      return true;
    }

    return false;
  }

  private pathWithoutQueryOrHash(rawUrl: string): string {
    return rawUrl.split('?')[0].split('#')[0].replace(/\/+$/, '');
  }
}
