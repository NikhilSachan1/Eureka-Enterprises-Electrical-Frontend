import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import { SharedTabsComponent } from '../../../../shared/components/shared-tabs/shared-tabs.component';
import { IMetricData, ITabItem } from '../../../../shared/models';
import { CardModule } from 'primeng/card';
import { ROUTE_BASE_PATHS, ROUTES, ICONS } from '../../../../shared/constants';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-permission-list',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SharedTabsComponent,
    CardModule
  ],
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.scss'
})
export class PermissionListComponent implements OnInit, OnDestroy {

  protected metricsCards = signal(this.getMetricCardsData());
  protected tabs = signal(this.getTabsData());
  protected currentRoute = signal<string>('');
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set initial route
    this.currentRoute.set(this.router.url);

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Employee Access',
        subtitle: 'Active workforce permissions',
        iconClass: `${ICONS.EMPLOYEE.GROUP} text-blue-500`,
        iconBgClass: 'bg-blue-100',
        metrics: [
          { label: 'Field Workers', value: 42 },
          { label: 'Supervisors', value: 8 },
          { label: 'Managers', value: 5 },
        ],
      },
      {
        title: 'Department Roles',
        subtitle: 'Team-based access control',
        iconClass: `${ICONS.SITE.BUILDING} text-green-500`,
        iconBgClass: 'bg-green-100',
        metrics: [
          { label: 'Operations', value: 35 },
          { label: 'Finance', value: 6 },
          { label: 'Admin', value: 14 },
        ],
      },
    ];
  }

  protected getAddButtonLabel(): string {
    const currentUrl = this.currentRoute();
    
    if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM)) {
      return 'Add New Permission';
    } else if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE)) {
      return 'Add New Role';
    }
    
    return 'Add New Permission';
  }

  protected shouldShowAddButton(): boolean {
    const currentUrl = this.currentRoute();
    return currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM) || 
           currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE);
  }

  protected onAddButtonClick(): void {
    const currentUrl = this.currentRoute();
    const baseRoute = `/${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}`;
    
    if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM)) {
      this.router.navigate([`${baseRoute}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}/${ROUTES.SETTINGS.PERMISSION.SYSTEM_PERMISSION.ADD}`]);
    } else if (currentUrl.includes(ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE)) {
      this.router.navigate([`${baseRoute}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}/${ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.ADD}`]);
    } else {
      console.log('Add button clicked - no action defined');
    }
  }

  private getTabsData(): ITabItem[] {
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
        tooltip: 'Manage user roles'
      },
      {
        route: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
        label: 'Users',
        icon: ICONS.EMPLOYEE.USER,
        tooltip: 'Manage system users'
      },
    ];
  }
}
