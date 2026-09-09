import { Injectable, inject } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  Params,
} from '@angular/router';
import { LoggerService } from '@core/services';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouterNavigationService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);
  private readonly lastQueryParamsByPath = new Map<string, Params>();

  constructor() {
    this.rememberQueryParams(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.rememberQueryParams(event.urlAfterRedirects));
  }

  async navigateToRoute(
    segments: string[],
    options?: {
      relativeTo?: ActivatedRoute;
      queryParamsHandling?: 'merge' | 'preserve' | '';
      replaceUrl?: boolean;
    }
  ): Promise<boolean> {
    try {
      const restoredQueryParams = options?.relativeTo
        ? null
        : this.getRestoredListQueryParams(segments);
      const success = await this.router.navigate(segments, {
        relativeTo: options?.relativeTo ?? null,
        queryParams: restoredQueryParams ?? undefined,
        queryParamsHandling: options?.queryParamsHandling ?? '',
        replaceUrl: options?.replaceUrl ?? false,
      });

      if (success) {
        this.logger.logUserAction(
          `Navigation successful to: ${segments.join('/')}`
        );
      } else {
        this.logger.logUserAction('Navigation failed');
      }

      return success;
    } catch (error: unknown) {
      this.logger.logUserAction(`Navigation error: ${error}`);
      return false;
    }
  }

  async navigateByUrl(
    url: string,
    options?: {
      replaceUrl?: boolean;
    }
  ): Promise<boolean> {
    try {
      const success = await this.router.navigateByUrl(url, {
        replaceUrl: options?.replaceUrl ?? false,
      });

      if (success) {
        this.logger.logUserAction(`Navigation successful to: ${url}`);
      } else {
        this.logger.logUserAction('Navigation failed');
      }

      return success;
    } catch (error: unknown) {
      this.logger.logUserAction(`Navigation error: ${error}`);
      return false;
    }
  }

  async navigateWithQueryParams(
    route: string[],
    queryParams: Record<string, unknown>,
    options?: {
      queryParamsHandling?: 'merge' | 'preserve' | '';
      fragment?: string;
      replaceUrl?: boolean;
      relativeTo?: ActivatedRoute;
    }
  ): Promise<boolean> {
    try {
      const success = await this.router.navigate(route, {
        queryParams,
        queryParamsHandling: options?.queryParamsHandling ?? 'merge',
        fragment: options?.fragment,
        replaceUrl: options?.replaceUrl ?? false,
        relativeTo: options?.relativeTo ?? null,
      });

      if (success) {
        this.logger.logUserAction(
          `Navigation with query params successful to: ${route.join('/')}`
        );
      } else {
        this.logger.logUserAction('Navigation with query params failed');
      }

      return success;
    } catch (error: unknown) {
      this.logger.logUserAction(`Navigation with query params error: ${error}`);
      return false;
    }
  }

  async navigateWithState(
    route: string[],
    state: Record<string, unknown>
  ): Promise<boolean> {
    try {
      this.logger.logUserAction(
        `Attempting navigation to: ${route.join('/')} with state:`,
        state
      );

      const restoredQueryParams = this.getRestoredListQueryParams(route);
      const success = await this.router.navigate(route, {
        state,
        queryParams: restoredQueryParams ?? undefined,
      });

      if (success) {
        this.logger.logUserAction(
          `Navigation with state successful to: ${route.join('/')}`
        );
      } else {
        this.logger.logUserAction(
          `Navigation with state failed to: ${route.join('/')}`
        );
      }

      return success;
    } catch (error: unknown) {
      this.logger.logUserAction(`Navigation with state error: ${error}`);
      return false;
    }
  }

  /** State from the in-flight navigation only (not persisted history on refresh). */
  getCurrentNavigationStateData<T = unknown>(key: string): T | null {
    try {
      const state = this.router.getCurrentNavigation()?.extras?.state;

      if (state && typeof state === 'object' && key in state) {
        this.logger.logUserAction(
          `Navigation state data retrieved for key: ${key}`
        );
        return state[key] as T;
      }

      return null;
    } catch (error: unknown) {
      this.logger.logUserAction(
        `Error retrieving navigation state data for key ${key}: ${error}`
      );
      return null;
    }
  }

  getRouterStateData<T = unknown>(key: string): T | null {
    try {
      const navigation = this.router.getCurrentNavigation();
      let state = navigation?.extras?.state;

      state ??= window.history.state;

      if (state && typeof state === 'object' && key in state) {
        this.logger.logUserAction(
          `Router state data retrieved for key: ${key}`
        );
        return state[key] as T;
      }

      this.logger.logUserAction(`Router state data not found for key: ${key}`);
      return null;
    } catch (error: unknown) {
      this.logger.logUserAction(
        `Error retrieving router state data for key ${key}: ${error}`
      );
      return null;
    }
  }

  getRouteQueryParam(paramName: string): string | null {
    try {
      const param = this.activatedRoute.snapshot.queryParamMap.get(paramName);
      if (param) {
        this.logger.logUserAction(
          `Route query parameter retrieved: ${paramName} = ${param}`
        );
      }
      return param;
    } catch (error: unknown) {
      this.logger.logUserAction(
        `Error retrieving route query parameter ${paramName}: ${error}`
      );
      return null;
    }
  }

  getRouterStateDataFromRoute(key: string): unknown | null {
    try {
      const data = this.activatedRoute.snapshot.data[key];
      if (data) {
        this.logger.logUserAction(
          `Router state data retrieved from route for key: ${key}`
        );
        return data;
      }
      return null;
    } catch (error: unknown) {
      this.logger.logUserAction(
        `Error retrieving router state data from route for key ${key}: ${error}`
      );
      return null;
    }
  }

  buildRouteSegments(basePaths: string[], targetPath: string): string[] {
    return ['/', ...basePaths, targetPath];
  }

  private rememberQueryParams(url: string): void {
    const tree = this.router.parseUrl(url);
    this.lastQueryParamsByPath.set(
      this.pathFromUrl(url),
      { ...tree.queryParams }
    );
  }

  private getRestoredListQueryParams(segments: string[]): Params | null {
    const destinationPath = this.pathFromSegments(segments);
    const currentPath = this.pathFromUrl(this.router.url);
    const storedQueryParams = this.lastQueryParamsByPath.get(destinationPath);

    if (
      !storedQueryParams ||
      Object.keys(storedQueryParams).length === 0 ||
      destinationPath === currentPath ||
      !this.isSameFeatureArea(currentPath, destinationPath)
    ) {
      return null;
    }

    return storedQueryParams;
  }

  private isSameFeatureArea(currentPath: string, destinationPath: string): boolean {
    const destinationParent = this.parentPath(destinationPath);
    if (destinationParent === '/') {
      return false;
    }

    return (
      currentPath === destinationParent ||
      currentPath.startsWith(`${destinationParent}/`)
    );
  }

  private parentPath(path: string): string {
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) {
      return '/';
    }

    parts.pop();
    return `/${parts.join('/')}`;
  }

  private pathFromSegments(segments: string[]): string {
    return `/${segments.filter(segment => segment && segment !== '/').join('/')}`;
  }

  private pathFromUrl(url: string): string {
    return url.split('?')[0].split('#')[0] || '/';
  }
}
