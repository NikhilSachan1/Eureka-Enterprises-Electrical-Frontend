import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Card } from 'primeng/card';
import { APP_CONFIG } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { LeaveBalanceCardsComponent } from '@features/leave-management/shared/components/leave-balance-cards/leave-balance-cards.component';
import { LeaveService } from '@features/leave-management/services/leave.service';
import type { ILeaveBalanceGetBaseResponseDto } from '@features/leave-management/types/leave.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { dashOutlinedLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import {
  aggregateLeaveBalanceRecords,
  mapLeaveBalanceRecordsToEmployeeRows,
  type ILeaveBalanceCardAggregate,
} from '@features/dashboard/utility/leave-balance-dashboard.util';
import type { IDashboardEmployeeLeaveBalanceRow } from '@features/dashboard/types/dashboard.interface';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-leave-balance-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe, LeaveBalanceCardsComponent],
  templateUrl: './leave-balance-dashboard.component.html',
  styleUrl: './leave-balance-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveBalanceDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly leaveService = inject(LeaveService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  /** Employee / driver — own balance cards; admin & ops — employee-wise list. */
  protected readonly showOwnBalanceCards = computed(() =>
    this.authService.isActiveRoleEmployeeLike()
  );

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly ownBalance = signal<ILeaveBalanceCardAggregate | null>(
    null
  );
  protected readonly employeeRows = signal<
    readonly IDashboardEmployeeLeaveBalanceRow[]
  >([]);

  protected readonly openLeaveButton = dashOutlinedLinkButton({
    label: 'Open leave',
    icon: ICONS.COMMON.EXTERNAL_LINK,
  });

  protected readonly headerHint = computed(() =>
    this.showOwnBalanceCards()
      ? 'Your earned leave — allocated, consumed, and available'
      : 'Employee-wise leave balance (current financial year)'
  );

  ngOnInit(): void {
    this.leaveService
      .getLeaveBalance()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ records }) => {
          this.applyRecords(records ?? []);
          this.loadError.set(false);
        },
        error: () => {
          this.ownBalance.set(null);
          this.employeeRows.set([]);
          this.loadError.set(true);
        },
      });
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  protected rowTrackKey(
    row: IDashboardEmployeeLeaveBalanceRow,
    index: number
  ): string {
    return `${row.employeeCode ?? row.employeeName}-${row.leaveCategory ?? ''}-${index}`;
  }

  private applyRecords(records: ILeaveBalanceGetBaseResponseDto[]): void {
    this.employeeRows.set(mapLeaveBalanceRecordsToEmployeeRows(records));
    this.ownBalance.set(
      records.length > 0 ? aggregateLeaveBalanceRecords(records) : null
    );
  }
}
