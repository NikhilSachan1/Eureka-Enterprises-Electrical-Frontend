import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { dashTextLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import type { IDashboardExpenseMetrics } from '@features/dashboard/types/dashboard.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';

@Component({
  selector: 'app-expense-dashboard',
  imports: [ButtonComponent, DecimalPipe, IndianCurrencyPipe],
  templateUrl: './expense-dashboard.component.html',
  styleUrl: './expense-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openLedgerButton = dashTextLinkButton({
    label: 'Open ledger',
    icon: 'pi pi-arrow-right',
  });

  protected readonly metrics = signal<IDashboardExpenseMetrics | null>(null);

  constructor() {
    this.metrics.set(this.buildExpenseMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildExpenseMock(): IDashboardExpenseMetrics {
    const employeeWiseNet = [
      {
        employeeName: 'Rahul Verma',
        employeeCode: 'EMP-1042',
        netAmount: 18_450,
      },
      {
        employeeName: 'Anita Desai',
        employeeCode: 'EMP-0891',
        netAmount: -6_200,
      },
      {
        employeeName: 'Suresh Kulkarni',
        employeeCode: 'EMP-1120',
        netAmount: 2_340.5,
      },
      { employeeName: 'Priya Nair', netAmount: -12_800 },
      { employeeName: 'Vikram Singh', employeeCode: 'EMP-0555', netAmount: 0 },
    ] as const;

    return {
      balances: {
        openingBalance: 59_303,
        closingBalance: 25_217.94,
        totalCredit: 26.94,
        totalDebit: 34_112,
        eurekaOpeningBalance: 26.94,
        eurekaClosingBalance: 25_217.94,
      },
      approval: {
        pending: 0,
        approved: 12,
        rejected: 0,
        total: 12,
      },
      employeeWiseNet,
      employeePayableTotal: 20_790.5,
    };
  }
}
