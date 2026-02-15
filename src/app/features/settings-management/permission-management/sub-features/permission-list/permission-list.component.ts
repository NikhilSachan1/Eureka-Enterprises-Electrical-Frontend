import {
  Component,
  signal,
  computed,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ROUTE_BASE_PATHS, ROUTES, ICONS } from '@shared/constants';
import { filter } from 'rxjs/operators';
import { LoggerService } from '@core/services';
import { RouterNavigationService } from '@shared/services';
import { ETabMode, IPageHeaderConfig, ITabItem } from '@shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';

@Component({
  selector: 'app-permission-list',
  imports: [PageHeaderComponent, NavTabsComponent, CardModule],
  standalone: true,
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionListComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly tabModeType = ETabMode.ROUTER_OUTLET;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected tabs = computed(() => this.getTabs());
  protected currentRoute = signal<string>('');

  ngOnInit(): void {
    this.currentRoute.set(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.url);
      });
  }

  private getTabs(): ITabItem[] {
    return [
      {
        route: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
        label: 'Permissions',
        icon: ICONS.SECURITY.SHIELD,
        tooltip: 'Manage system permissions',
      },
      {
        route: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        label: 'Roles',
        icon: ICONS.EMPLOYEE.GROUP,
        tooltip: 'Manage user roles',
      },
      {
        route: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
        label: 'Users',
        icon: ICONS.EMPLOYEE.USER,
        tooltip: 'Manage system users',
      },
    ];
  }

  protected onHeaderButtonClick(): void {
    const currentUrl = this.currentRoute();
    const navigationRoute = this.buildNavigationRoute(currentUrl);

    if (navigationRoute) {
      const success =
        void this.routerNavigationService.navigateToRoute(navigationRoute);

      if (!success) {
        this.logger.logUserAction(
          'Navigation failed for add button',
          currentUrl
        );
      }
    } else {
      this.logger.logUserAction(
        'Add button clicked - no matching route found',
        currentUrl
      );
    }
  }

  private buildNavigationRoute(currentUrl: string): string[] | null {
    const basePaths = [
      ROUTE_BASE_PATHS.SETTINGS.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
    ];

    if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM)) {
      return [
        ...basePaths,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
        ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
      ];
    }

    if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE)) {
      return [
        ...basePaths,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
      ];
    }

    if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER)) {
      return [
        ...basePaths,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
        ROUTES.SETTINGS.PERMISSION.USER.ADD,
      ];
    }

    return null;
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Permission Management',
      subtitle: 'Manage system permissions, roles, and user access',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: this.getPageHeaderButtonLabel(),
        },
      ],
    };
  }

  protected getPageHeaderButtonLabel(): string {
    const currentUrl = this.currentRoute();

    if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE)) {
      return 'Add New Role';
    } else if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER)) {
      return 'Add New User Permission';
    }

    return 'Add New Permission';
  }
}
