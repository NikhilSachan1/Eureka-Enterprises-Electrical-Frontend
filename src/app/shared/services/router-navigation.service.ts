import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouterNavigationService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  async navigateToRoute(
    segments: string[],
    options?: {
      relativeTo?: ActivatedRoute;
      queryParamsHandling?: 'merge' | 'preserve' | '';
      replaceUrl?: boolean;
    }
  ): Promise<boolean> {
    try {
      const success = await this.router.navigate(segments, {
        relativeTo: options?.relativeTo ?? null,
        queryParamsHandling: options?.queryParamsHandling ?? '',
        replaceUrl: options?.replaceUrl ?? false,
      });

      return success;
    } catch {
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

      return success;
    } catch {
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

      return success;
    } catch {
      return false;
    }
  }

  async navigateWithState(
    route: string[],
    state: Record<string, unknown>
  ): Promise<boolean> {
    try {
      return await this.router.navigate(route, { state });
    } catch {
      return false;
    }
  }

  getRouterStateData<T = unknown>(key: string): T | null {
    try {
      const navigation = this.router.getCurrentNavigation();
      let state = navigation?.extras?.state;

      state ??= window.history.state;

      if (state && typeof state === 'object' && key in state) {
        return state[key] as T;
      }

      return null;
    } catch {
      return null;
    }
  }

  getRouteQueryParam(paramName: string): string | null {
    try {
      return this.activatedRoute.snapshot.queryParamMap.get(paramName);
    } catch {
      return null;
    }
  }

  getRouterStateDataFromRoute(key: string): unknown | null {
    try {
      return this.activatedRoute.snapshot.data[key] ?? null;
    } catch {
      return null;
    }
  }

  buildRouteSegments(basePaths: string[], targetPath: string): string[] {
    return ['/', ...basePaths, targetPath];
  }
}
