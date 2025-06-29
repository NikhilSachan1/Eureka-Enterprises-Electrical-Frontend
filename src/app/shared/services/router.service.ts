import { Injectable, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';

export interface INavigationOptions {
    queryParams?: Record<string, any>;
    state?: Record<string, any>;
}

export interface INavigationResult {
    success: boolean;
    error?: any;
    url?: string;
}

@Injectable({
    providedIn: 'root'
})
export class RouterService {
    private readonly router = inject(Router);
    private readonly logger = inject(LoggerService);

    async navigate(
        route: string | string[],
        options?: INavigationOptions
    ): Promise<void> {
        try {
            const navigationExtras: NavigationExtras = {
                queryParams: options?.queryParams,
                state: options?.state,
            };

            const routeArray = Array.isArray(route) ? route : [route];
            const success = await this.router.navigate(routeArray, navigationExtras);

            if (success) {
                this.logger.info('Navigation successful:', { route: routeArray, options, url: this.router.url });
            } else {
                this.logger.warn('Navigation failed:', { route: routeArray, options });
            }

        } catch (error) {
            this.logger.error('Navigation error:', error);
        }
    }

    getRouterDataFromState<T>(dataKeyName: string): T | null {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state || history.state;
        const data = state[dataKeyName];
        if (data) {
            this.logger.info('Data loaded from router state:', data);
            return data as T;
        } else {
            this.logger.warn('No data found in router state:', dataKeyName);
        }
        return null;
    }
} 