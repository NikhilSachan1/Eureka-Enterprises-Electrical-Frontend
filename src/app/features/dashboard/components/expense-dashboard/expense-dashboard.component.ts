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
  selector: 'app-expense-dashboard',
  imports: [DashboardLedgerSummarySectionComponent],
  templateUrl: './expense-dashboard.component.html',
  styleUrl: './expense-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly loading = signal(true);

  private readonly ledgerBalance =
    signal<ILedgerBalanceDashboardGetResponseDto | null>(null);

  protected readonly ledgerBalanceRows =
    computed<IDashboardExpenseMetricsLedger | null>(() =>
      this.buildExpenseMetricsLedger(this.ledgerBalance())
    );

  ngOnInit(): void {
    this.loadExpenseLedger();
  }

  private loadExpenseLedger(): void {
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

  private buildExpenseMetricsLedger(
    response: ILedgerBalanceDashboardGetResponseDto | null
  ): IDashboardExpenseMetricsLedger | null {
    if (!response) {
      return null;
    }

    return {
      balances: {
        openingBalance: response.expense.balances.opening,
        closingBalance: response.expense.balances.closing,
        eurekaOpeningBalance: response.expense.balances.eurekaOpening,
        eurekaClosingBalance: response.expense.balances.eurekaClosing,
        payableTotalAmount: response.expense.payable.totalAmount,
        overpaidTotalAmount: response.expense.overpaid.totalAmount,
      },
      employees: response.expense.employees.map(employee => ({
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        netAmount:
          employee.status === 'overpaid'
            ? -Math.abs(employee.net)
            : Math.abs(employee.net),
      })),
    };
  }
}
