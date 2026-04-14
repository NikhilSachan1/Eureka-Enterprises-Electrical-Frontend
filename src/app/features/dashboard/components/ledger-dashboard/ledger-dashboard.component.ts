import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICONS } from '@shared/constants';
import { Card } from 'primeng/card';
import { ExpenseDashboardComponent } from '@features/dashboard/components/expense-dashboard/expense-dashboard.component';
import { FuelExpenseDashboardComponent } from '@features/dashboard/components/fuel-expense-dashboard/fuel-expense-dashboard.component';

@Component({
  selector: 'app-ledger-dashboard',
  imports: [Card, ExpenseDashboardComponent, FuelExpenseDashboardComponent],
  templateUrl: './ledger-dashboard.component.html',
  styleUrl: './ledger-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LedgerDashboardComponent {
  protected readonly ICONS = ICONS;
}
