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
import type { IDashboardFuelMetrics } from '@features/dashboard/types/dashboard.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';

@Component({
  selector: 'app-fuel-expense-dashboard',
  imports: [ButtonComponent, DecimalPipe, IndianCurrencyPipe],
  templateUrl: './fuel-expense-dashboard.component.html',
  styleUrl: './fuel-expense-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelExpenseDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openLedgerButton = dashTextLinkButton({
    label: 'Open ledger',
    icon: 'pi pi-arrow-right',
  });

  protected readonly metrics = signal<IDashboardFuelMetrics | null>(null);

  constructor() {
    this.metrics.set(this.buildFuelMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildFuelMock(): IDashboardFuelMetrics {
    const employeeWiseNet = [
      {
        employeeName: 'Rahul Verma',
        employeeCode: 'EMP-1042',
        netAmount: 4_200,
      },
      {
        employeeName: 'Deepak Patil',
        employeeCode: 'EMP-1203',
        netAmount: -1_850,
      },
      { employeeName: 'Meera Joshi', netAmount: 0 },
    ] as const;

    return {
      balances: {
        openingBalance: 0,
        closingBalance: 10_122,
        totalCredit: 13_432,
        totalDebit: 202_838,
        eurekaOpeningBalance: 13_432,
        eurekaClosingBalance: 202_838,
      },
      approval: {
        pending: 1,
        approved: 2,
        rejected: 1,
        total: 4,
      },
      employeeWiseNet,
      employeePayableTotal: 4_200,
    };
  }
}
