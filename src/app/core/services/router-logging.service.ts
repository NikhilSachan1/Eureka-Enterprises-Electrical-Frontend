import { Injectable, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationError,
} from '@angular/router';
import { filter } from 'rxjs';
import { LoggerService } from './logger.service';
import { EnvironmentService } from './environment.service';
import { ELogTypes } from '@core/types';

@Injectable({
  providedIn: 'root',
})
export class RouterLoggingService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly env = inject(EnvironmentService);

  constructor() {
    if (!this.env.shouldLogLevel('info')) {
      return;
    }

    this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe((e: NavigationStart) => {
        this.logger.addStructuredLog(
          ELogTypes.INFO,
          'router',
          `→ Navigating to: ${e.url}`,
          {
            data: { url: e.url, navigationTrigger: e.navigationTrigger },
          }
        );
      });

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const pageComponent = this.getLeafPageComponent();
        const componentName =
          pageComponent ?? this.getComponentNameFromUrl(e.urlAfterRedirects);
        this.logger.setCurrentPage(componentName ?? '');
        this.logger.addStructuredLog(
          ELogTypes.INFO,
          'navigation',
          `✓ Loaded: ${componentName} | ${e.urlAfterRedirects}`,
          {
            source: componentName,
            data: {
              url: e.urlAfterRedirects,
              urlBeforeRedirects: e.url,
              component: componentName,
            },
          }
        );
      });

    this.router.events
      .pipe(filter(e => e instanceof NavigationError))
      .subscribe((e: NavigationError) => {
        this.logger.addStructuredLog(
          ELogTypes.ERROR,
          'router',
          `✗ Navigation failed: ${e.url}`,
          {
            data: { url: e.url, error: e.error },
          }
        );
      });
  }

  /** Traverse to leaf route - gets actual page component, not layout wrapper */
  private getLeafPageComponent(): string | undefined {
    let route: ActivatedRoute | undefined = this.router.routerState.root;
    let lastWithComponent: string | undefined;
    while (route) {
      const name = route.component?.name;
      if (name && !name.includes('Layout') && !name.includes('Shell')) {
        lastWithComponent = name;
      }
      route = route.firstChild ?? undefined;
    }
    return lastWithComponent;
  }

  /** Fallback: infer from URL (e.g. /attendance/list → GetAttendanceComponent) */
  private getComponentNameFromUrl(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0) {
      return 'App';
    }
    const last = segments[segments.length - 1];
    const module = segments[0];
    const toPascal = (s: string): string =>
      s
        .split('-')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
    const listViews = ['list', 'ledger', 'table'];
    const prefix = listViews.includes(last) ? 'Get' : '';
    return `${prefix}${toPascal(module)}Component`;
  }
}
