import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { DatePipe, NgStyle } from '@angular/common';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionService } from '@core/services';
import { SEVERITY_STYLES } from '@shared/config';
import { ICONS } from '@shared/constants';
import { KpmDashboardComponent } from '@features/dashboard/components/kpm-dashboard/kpm-dashboard.component';
import { OpsAttentionDashboardComponent } from '@features/dashboard/components/ops-attention-dashboard/ops-attention-dashboard.component';
import { AttendanceDashboardComponent } from '@features/dashboard/components/attendance-dashboard/attendance-dashboard.component';
import { ApplyAttendanceDashboardComponent } from '@features/dashboard/components/apply-attendance-dashboard/apply-attendance-dashboard.component';
import { LeaveBalanceDashboardComponent } from '@features/dashboard/components/leave-balance-dashboard/leave-balance-dashboard.component';
import { ExpenseDashboardComponent } from '@features/dashboard/components/expense-dashboard/expense-dashboard.component';
import { FuelExpenseDashboardComponent } from '@features/dashboard/components/fuel-expense-dashboard/fuel-expense-dashboard.component';
import { PetroCardWalletDashboardComponent } from '@features/dashboard/components/petro-card-wallet-dashboard/petro-card-wallet-dashboard.component';
import { AuthService } from '@features/auth-management/services/auth.service';
import { AnniversaryDashboardComponent } from '../anniversary-dashboard/anniversary-dashboard.component';
import { BirthdaysDashboardComponent } from '../birthdays-dashboard/birthdays-dashboard.component';
import { HolidayDashboardComponent } from '../holiday-dashboard/holiday-dashboard.component';
import { HandoverPendingDashboardComponent } from '../handover-pending-dashboard/handover-pending-dashboard.component';
import { ReceivablesPayablesDashboardComponent } from '../receivables-payables-dashboard/receivables-payables-dashboard.component';

@Component({
  selector: 'app-main-dashboard',
  imports: [
    DatePipe,
    NgStyle,
    KpmDashboardComponent,
    PetroCardWalletDashboardComponent,
    OpsAttentionDashboardComponent,
    AttendanceDashboardComponent,
    ApplyAttendanceDashboardComponent,
    LeaveBalanceDashboardComponent,
    ExpenseDashboardComponent,
    FuelExpenseDashboardComponent,
    AnniversaryDashboardComponent,
    BirthdaysDashboardComponent,
    HolidayDashboardComponent,
    HandoverPendingDashboardComponent,
    ReceivablesPayablesDashboardComponent,
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDashboardComponent {
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly authService = inject(AuthService);
  private readonly ledgerSpendSection =
    viewChild<ElementRef<HTMLElement>>('ledgerSpend');
  private readonly receivablesSection =
    viewChild<ElementRef<HTMLElement>>('receivablesPayables');

  protected scrollToSection(sectionId: string): void {
    const target =
      sectionId === 'ledger-spend'
        ? this.ledgerSpendSection()
        : sectionId === 'receivables-payables'
          ? this.receivablesSection()
          : undefined;

    target?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  protected readonly ICONS = ICONS;
  protected readonly canViewLedgerSpend = this.appPermissionService.hasPermission(
    APP_PERMISSION.UI.DASHBOARD.LEDGER_SPEND
  );
  protected readonly canViewReceivablesPayables =
    this.appPermissionService.hasPermission(
      APP_PERMISSION.DASHBOARD.RECEIVABLES_PAYABLES
    );
  protected readonly showApplyAttendance = this.appPermissionService.hasPermission(
    APP_PERMISSION.ATTENDANCE.APPLY
  );
  protected readonly showPeopleTime = this.appPermissionService.hasPermission(
    APP_PERMISSION.UI.DASHBOARD.ATTENDANCE_LEAVE
  );
  protected readonly canViewAssets =
    this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.DASHBOARD.ASSETS_TRANSPORT
    ) &&
    this.appPermissionService.hasPermission(
      APP_PERMISSION.DASHBOARD.ASSET_COMPLIANCE
    );
  protected readonly canViewTransport =
    this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.DASHBOARD.ASSETS_TRANSPORT
    ) &&
    this.appPermissionService.hasPermission(
      APP_PERMISSION.DASHBOARD.VEHICLE_COMPLIANCE
    );
  protected readonly opsSectionTitle =
    this.canViewAssets && this.canViewTransport
      ? 'Assets & transport'
      : this.canViewAssets
        ? 'Assets'
        : 'Transport';

  protected readonly today = new Date();
  /** "Good morning, Nikhil", or just the greeting when the name is unknown. */
  protected readonly heroTitle = [
    MainDashboardComponent.greetingFor(this.today.getHours()),
    this.authService.getCurrentUser()?.firstName?.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  private static greetingFor(hour: number): string {
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 17) {
      return 'Good afternoon';
    }
    return 'Good evening';
  }

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
