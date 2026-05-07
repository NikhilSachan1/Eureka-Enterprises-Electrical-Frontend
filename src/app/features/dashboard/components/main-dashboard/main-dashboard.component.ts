import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { SEVERITY_STYLES } from '@shared/config';
import { ICONS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { KpmDashboardComponent } from '@features/dashboard/components/kpm-dashboard/kpm-dashboard.component';
import { EmployeeDashboardComponent } from '@features/dashboard/components/employee-dashboard/employee-dashboard.component';
import { LeaveDashboardComponent } from '@features/dashboard/components/leave-dashboard/leave-dashboard.component';
import { AttendanceDashboardComponent } from '@features/dashboard/components/attendance-dashboard/attendance-dashboard.component';
import { LeaveBalanceDashboardComponent } from '@features/dashboard/components/leave-balance-dashboard/leave-balance-dashboard.component';
import { AssetDashboardComponent } from '@features/dashboard/components/asset-dashboard/asset-dashboard.component';
import { VehicleDashboardComponent } from '@features/dashboard/components/vehicle-dashboard/vehicle-dashboard.component';
import { VehicleServiceDashboardComponent } from '@features/dashboard/components/vehicle-service-dashboard/vehicle-service-dashboard.component';
import { VehicleReadingDashboardComponent } from '@features/dashboard/components/vehicle-reading-dashboard/vehicle-reading-dashboard.component';
import { ProjectPipelineDashboardComponent } from '@features/dashboard/components/project-pipeline-dashboard/project-pipeline-dashboard.component';
import { ActiveProjectDashboardComponent } from '@features/dashboard/components/active-project-dashboard/active-project-dashboard.component';
import { ProjectChartDashboardComponent } from '@features/dashboard/components/project-chart-dashboard/project-chart-dashboard.component';
import { LedgerDashboardComponent } from '@features/dashboard/components/ledger-dashboard/ledger-dashboard.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { AnniversaryDashboardComponent } from '../anniversary-dashboard/anniversary-dashboard.component';
import { BirthdaysDashboardComponent } from '../birthdays-dashboard/birthdays-dashboard.component';
import { HolidayDashboardComponent } from '../holiday-dashboard/holiday-dashboard.component';

@Component({
  selector: 'app-main-dashboard',
  imports: [
    NgStyle,
    PageHeaderComponent,
    KpmDashboardComponent,
    EmployeeDashboardComponent,
    LeaveDashboardComponent,
    AttendanceDashboardComponent,
    LeaveBalanceDashboardComponent,
    AssetDashboardComponent,
    VehicleDashboardComponent,
    VehicleServiceDashboardComponent,
    VehicleReadingDashboardComponent,
    ProjectPipelineDashboardComponent,
    ActiveProjectDashboardComponent,
    ProjectChartDashboardComponent,
    LedgerDashboardComponent,
    AnniversaryDashboardComponent,
    BirthdaysDashboardComponent,
    HolidayDashboardComponent,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDashboardComponent {
  protected readonly ICONS = ICONS;

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
}
