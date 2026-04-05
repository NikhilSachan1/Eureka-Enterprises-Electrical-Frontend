import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import type { IDashboardKpmSnapshot } from '@features/dashboard/types/dashboard.interface';

@Component({
  selector: 'app-kpm-dashboard',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './kpm-dashboard.component.html',
  styleUrl: './kpm-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpmDashboardComponent {
  protected readonly APP_CONFIG = APP_CONFIG;

  protected readonly kpm = signal<IDashboardKpmSnapshot>(this.buildKpmMock());

  private buildKpmMock(): IDashboardKpmSnapshot {
    return {
      attendance: {
        approval: { pending: 10 },
      },
      leave: {
        approval: { pending: 5 },
      },
      expense: {
        employeePayableTotal: 10_000,
      },
      fuel: {
        employeePayableTotal: 10_000,
      },
      asset: {
        calibrationExpiringSoon: 10,
        warrantyExpiringSoon: 10,
      },
      vehicleFleet: {
        complianceExpiringSoon: 10,
        warrantyExpiringSoon: 10,
      },
      vehicleService: {
        dueSoon: 10,
        overdue: 10,
      },
      vehicleReading: {
        readingAnomalyCount: 3,
        noReadingStaleCount: 3,
      },
    };
  }
}
