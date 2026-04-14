import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgStyle } from '@angular/common';
import { SEVERITY_STYLES } from '@shared/config';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EButtonActionType, IPageHeaderConfig } from '@shared/types';
import { dashOutlinedLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import { KpmDashboardComponent } from '@features/dashboard/components/kpm-dashboard/kpm-dashboard.component';
import { EmployeeDashboardComponent } from '@features/dashboard/components/employee-dashboard/employee-dashboard.component';
import { LeaveDashboardComponent } from '@features/dashboard/components/leave-dashboard/leave-dashboard.component';
import { AttendanceDashboardComponent } from '@features/dashboard/components/attendance-dashboard/attendance-dashboard.component';
import { LeaveBalanceDashboardComponent } from '@features/dashboard/components/leave-balance-dashboard/leave-balance-dashboard.component';
import { BirthdaysDashboardComponent } from '@features/dashboard/components/birthdays-dashboard/birthdays-dashboard.component';
import { AnniversaryDashboardComponent } from '@features/dashboard/components/anniversary-dashboard/anniversary-dashboard.component';
import { HolidayDashboardComponent } from '@features/dashboard/components/holiday-dashboard/holiday-dashboard.component';
import { AssetDashboardComponent } from '@features/dashboard/components/asset-dashboard/asset-dashboard.component';
import { VehicleDashboardComponent } from '@features/dashboard/components/vehicle-dashboard/vehicle-dashboard.component';
import { VehicleServiceDashboardComponent } from '@features/dashboard/components/vehicle-service-dashboard/vehicle-service-dashboard.component';
import { VehicleReadingDashboardComponent } from '@features/dashboard/components/vehicle-reading-dashboard/vehicle-reading-dashboard.component';
import { ProjectPipelineDashboardComponent } from '@features/dashboard/components/project-pipeline-dashboard/project-pipeline-dashboard.component';
import { ActiveProjectDashboardComponent } from '@features/dashboard/components/active-project-dashboard/active-project-dashboard.component';
import { ProjectChartDashboardComponent } from '@features/dashboard/components/project-chart-dashboard/project-chart-dashboard.component';
import { LedgerDashboardComponent } from '@features/dashboard/components/ledger-dashboard/ledger-dashboard.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-main-dashboard',
  imports: [
    Card,
    ButtonComponent,
    NgStyle,
    PageHeaderComponent,
    KpmDashboardComponent,
    EmployeeDashboardComponent,
    LeaveDashboardComponent,
    AttendanceDashboardComponent,
    LeaveBalanceDashboardComponent,
    BirthdaysDashboardComponent,
    AnniversaryDashboardComponent,
    HolidayDashboardComponent,
    AssetDashboardComponent,
    VehicleDashboardComponent,
    VehicleServiceDashboardComponent,
    VehicleReadingDashboardComponent,
    ProjectPipelineDashboardComponent,
    ActiveProjectDashboardComponent,
    ProjectChartDashboardComponent,
    LedgerDashboardComponent,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDashboardComponent {
  private readonly router = inject(Router);

  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly celebrationsCalendarButton = dashOutlinedLinkButton({
    id: EButtonActionType.PAGE_HEADER_BUTTON_1,
    label: 'Calendar',
    icon: ICONS.COMMON.CALENDAR,
  });
  protected readonly celebrationsDirectoryButton = dashOutlinedLinkButton({
    id: EButtonActionType.PAGE_HEADER_BUTTON_2,
    label: 'Directory',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });

  protected readonly dashboardPageHeader: Partial<IPageHeaderConfig> = {
    title: 'Dashboard',
    subtitle:
      'Workforce, time, assets, fleet, projects, and ledgers — one place to see what needs attention.',
    showGoBackButton: false,
    showHeaderButton: false,
  };

  /** CSS vars for tiles + approval bar — same hex as `SEVERITY_STYLES` in status-map.config. */
  protected readonly workflowColorVars: Record<string, string> = {
    '--wf-success': SEVERITY_STYLES.success.hex.primary,
    '--wf-success-ink': SEVERITY_STYLES.success.hex.dark,
    '--wf-danger': SEVERITY_STYLES.danger.hex.primary,
    '--wf-danger-ink': SEVERITY_STYLES.danger.hex.dark,
    '--wf-warning': SEVERITY_STYLES.warning.hex.primary,
    '--wf-warning-ink': SEVERITY_STYLES.warning.hex.dark,
  };

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }
}
