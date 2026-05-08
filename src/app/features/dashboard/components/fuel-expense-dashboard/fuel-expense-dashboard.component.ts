import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { IDashboardExpenseMetricsLedger } from '@features/dashboard/types/dashboard.interface';
import { DashboardLedgerSummarySectionComponent } from '@features/dashboard/components/dashboard-ledger-summary-section/dashboard-ledger-summary-section.component';
import { DashboardService } from '@features/dashboard/services/dashboard.services';
import type { ILedgerBalanceDashboardGetResponseDto } from '@features/dashboard/types/dashboard.dto';

@Component({
  selector: 'app-fuel-expense-dashboard',
  imports: [DashboardLedgerSummarySectionComponent],
  templateUrl: './fuel-expense-dashboard.component.html',
  styleUrl: './fuel-expense-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelExpenseDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly loading = signal(true);
  private readonly ledgerBalance =
    signal<ILedgerBalanceDashboardGetResponseDto | null>(null);
  protected readonly ledgerBalanceRows =
    computed<IDashboardExpenseMetricsLedger | null>(() =>
      this.buildFuelMetricsLedger(this.ledgerBalance())
    );

  ngOnInit(): void {
    this.loadFuelLedger();
  }

  private loadFuelLedger(): void {
    this.dashboardService
      .getLedgerBalanceShared()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response: ILedgerBalanceDashboardGetResponseDto) => {
          this.ledgerBalance.set(response);
        },
      });
  }

  private buildFuelMetricsLedger(
    response: ILedgerBalanceDashboardGetResponseDto | null
  ): IDashboardExpenseMetricsLedger | null {
    if (!response) {
      return null;
    }

    return {
      balances: {
        openingBalance: response.fuel.balances.opening,
        closingBalance: response.fuel.balances.closing,
        eurekaOpeningBalance: response.fuel.balances.eurekaOpening,
        eurekaClosingBalance: response.fuel.balances.eurekaClosing,
        payableTotalAmount: response.fuel.payable.totalAmount,
        overpaidTotalAmount: response.fuel.overpaid.totalAmount,
      },
      employees: response.fuel.employees.map(employee => ({
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        netAmount:
          employee.status === 'overpaid'
            ? -Math.abs(employee.net)
            : Math.abs(employee.net),
      })),
    };
  }
}
