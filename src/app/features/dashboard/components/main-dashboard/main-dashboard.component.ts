import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgStyle } from '@angular/common';
import { AuthService } from '@features/auth-management/services/auth.service';
import { SEVERITY_STYLES } from '@shared/config';
import { EUserRole, ICONS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { KpmDashboardComponent } from '@features/dashboard/components/kpm-dashboard/kpm-dashboard.component';
import { OpsAttentionDashboardComponent } from '@features/dashboard/components/ops-attention-dashboard/ops-attention-dashboard.component';
import { AttendanceDashboardComponent } from '@features/dashboard/components/attendance-dashboard/attendance-dashboard.component';
import { LeaveBalanceDashboardComponent } from '@features/dashboard/components/leave-balance-dashboard/leave-balance-dashboard.component';
import { ExpenseDashboardComponent } from '@features/dashboard/components/expense-dashboard/expense-dashboard.component';
import { FuelExpenseDashboardComponent } from '@features/dashboard/components/fuel-expense-dashboard/fuel-expense-dashboard.component';
import { PetroCardWalletDashboardComponent } from '@features/dashboard/components/petro-card-wallet-dashboard/petro-card-wallet-dashboard.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { AnniversaryDashboardComponent } from '../anniversary-dashboard/anniversary-dashboard.component';
import { BirthdaysDashboardComponent } from '../birthdays-dashboard/birthdays-dashboard.component';
import { HolidayDashboardComponent } from '../holiday-dashboard/holiday-dashboard.component';

const DASHBOARD_COMING_SOON_ROLES = new Set<string>([
  EUserRole.EMPLOYEE,
  EUserRole.DRIVER,
  'ACCOUNTS',
]);

@Component({
  selector: 'app-main-dashboard',
  imports: [
    NgStyle,
    PageHeaderComponent,
    KpmDashboardComponent,
    PetroCardWalletDashboardComponent,
    OpsAttentionDashboardComponent,
    AttendanceDashboardComponent,
    LeaveBalanceDashboardComponent,
    ExpenseDashboardComponent,
    FuelExpenseDashboardComponent,
    AnniversaryDashboardComponent,
    BirthdaysDashboardComponent,
    HolidayDashboardComponent,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDashboardComponent {
  private readonly authService = inject(AuthService);

  protected readonly ICONS = ICONS;

  protected readonly showComingSoon = computed(() => {
    const role = this.authService.user()?.activeRole;
    return !!role && DASHBOARD_COMING_SOON_ROLES.has(role);
  });

  protected readonly dashboardPageHeader = computed<Partial<IPageHeaderConfig>>(
    () => ({
      title: 'Dashboard',
      subtitle: this.showComingSoon()
        ? 'A dashboard for your role is on the way.'
        : 'Attendance, leave, celebrations, assets, fleet, and ledgers — one place to see what needs attention.',
      showGoBackButton: false,
      showHeaderButton: false,
    })
  );

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
