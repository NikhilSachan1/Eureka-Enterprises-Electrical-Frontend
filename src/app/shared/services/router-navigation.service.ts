import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services/logger.service';

@Injectable({
  providedIn: 'root'
})

export class RouterNavigationService {

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);

  async navigateToRoute(segments: string[], options?: {
    relativeTo?: ActivatedRoute;
    queryParamsHandling?: 'merge' | 'preserve' | '';
    replaceUrl?: boolean;
  }): Promise<boolean> {
    try {
      const success = await this.router.navigate(segments, {
        relativeTo: options?.relativeTo || null,
        queryParamsHandling: options?.queryParamsHandling || '',
        replaceUrl: options?.replaceUrl || false
      });

      if (success) {
        this.logger.logUserAction(`Navigation successful to: ${segments.join('/')}`);
      } else {
        this.logger.logUserAction('Navigation failed');
      }

      return success;
    } catch (error) {
      this.logger.logUserAction(`Navigation error: ${error}`);
      return false;
    }
  }

  async navigateByUrl(url: string, options?: {
    replaceUrl?: boolean;
  }): Promise<boolean> {
    try {
      const success = await this.router.navigateByUrl(url, {
        replaceUrl: options?.replaceUrl || false
      });

      if (success) {
        this.logger.logUserAction(`Navigation successful to: ${url}`);
      } else {
        this.logger.logUserAction('Navigation failed');
      }

      return success;
    } catch (error) {
      this.logger.logUserAction(`Navigation error: ${error}`);
      return false;
    }
  }

  async navigateWithQueryParams(
    route: string[], 
    queryParams: Record<string, any>,
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
        queryParamsHandling: options?.queryParamsHandling || 'merge',
        fragment: options?.fragment,
        replaceUrl: options?.replaceUrl || false,
        relativeTo: options?.relativeTo || null
      });

      if (success) {
        this.logger.logUserAction(`Navigation with query params successful to: ${route.join('/')}`);
      } else {
        this.logger.logUserAction('Navigation with query params failed');
      }

      return success;
    } catch (error) {
      this.logger.logUserAction(`Navigation with query params error: ${error}`);
      return false;
    }
  }

  async navigateWithState(route: string[], state: any): Promise<boolean> {
    try {
      this.logger.logUserAction(`Attempting navigation to: ${route.join('/')} with state:`, state);
      
      const success = await this.router.navigate(route, {
        state: state
      });

      if (success) {
        this.logger.logUserAction(`Navigation with state successful to: ${route.join('/')}`);
      } else {
        this.logger.logUserAction(`Navigation with state failed to: ${route.join('/')}`);
      }

      return success;
    } catch (error) {
      this.logger.logUserAction(`Navigation with state error: ${error}`);
      return false;
    }
  }

  getRouterStateData<T = any>(key: string): T | null {
    try {
      const navigation = this.router.getCurrentNavigation();
      let state = navigation?.extras?.state;
      
      if (!state) {
        state = window.history.state;
      }
      
      if (state && typeof state === 'object' && key in state) {
        this.logger.logUserAction(`Router state data retrieved for key: ${key}`);
        return state[key] as T;
      }
      
      this.logger.logUserAction(`Router state data not found for key: ${key}`);
      return null;
    } catch (error) {
      this.logger.logUserAction(`Error retrieving router state data for key ${key}: ${error}`);
      return null;
    }
  }

  getRouteQueryParam(paramName: string): string | null {
    try {
      const param = this.activatedRoute.snapshot.queryParamMap.get(paramName);
      if (param) {
        this.logger.logUserAction(`Route query parameter retrieved: ${paramName} = ${param}`);
      }
      return param;
    } catch (error) {
      this.logger.logUserAction(`Error retrieving route query parameter ${paramName}: ${error}`);
      return null;
    }
  }

  getRouterStateDataFromRoute(key: string) {
    try {
      const data = this.activatedRoute.snapshot.data[key];
      if (data) {
        this.logger.logUserAction(`Router state data retrieved from route for key: ${key}`);
        return data;
      }
    } catch (error) {
      this.logger.logUserAction(`Error retrieving router state data from route for key ${key}: ${error}`);
      return null;
    }
  }

  buildRouteSegments(basePaths: string[], targetPath: string): string[] {
    return ['/', ...basePaths, targetPath];
  }
} 