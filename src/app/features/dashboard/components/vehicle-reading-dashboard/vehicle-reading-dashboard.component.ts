import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { ButtonComponent } from '@shared/components/button/button.component';
import { dashOutlinedLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import type { IDashboardVehicleReadingMetrics } from '@features/dashboard/types/dashboard.interface';
import {
  addDaysToIsoDate,
  dashboardTodayYmd,
} from '@features/dashboard/utils/dashboard-celebration-dates';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-vehicle-reading-dashboard',
  imports: [Card, ButtonComponent, DatePipe],
  templateUrl: './vehicle-reading-dashboard.component.html',
  styleUrl: './vehicle-reading-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleReadingDashboardComponent {
  private readonly router = inject(Router);

  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openReadingsButton = dashOutlinedLinkButton({
    label: 'Open readings',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });

  protected readonly metrics = signal<IDashboardVehicleReadingMetrics | null>(
    null
  );

  constructor() {
    this.metrics.set(this.buildMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildMock(): IDashboardVehicleReadingMetrics {
    const today = dashboardTodayYmd();
    const vehiclesNoReadingTwoPlusDays = [
      {
        vehicleName: 'Tata Ace Gold',
        vehicleNumber: 'MH12 AB 1234',
        lastReceivedDate: addDaysToIsoDate(today, -3),
      },
      {
        vehicleName: 'Force Traveller',
        vehicleNumber: 'KA03 GH 2244',
        lastReceivedDate: addDaysToIsoDate(today, -4),
      },
      {
        vehicleName: 'Mahindra Bolero Pik-Up',
        vehicleNumber: 'MH14 CD 9012',
        lastReceivedDate: addDaysToIsoDate(today, -2),
      },
    ] as const;

    return {
      anomalyDetected: true,
      anomalyDetail: '3 vehicles flagged by reading checks (demo data).',
      anomalyVehicles: [
        {
          vehicleName: 'Ashok Leyland Dost',
          vehicleNumber: 'MH12 AB 5678',
          reason:
            'Reported odometer (48,200 km) is lower than last accepted reading (48,950 km) — possible rollback or data entry error.',
        },
        {
          vehicleName: 'Tata Intra V30',
          vehicleNumber: 'MH12 AB 9999',
          reason:
            'Delta vs previous reading implies ~420 km in 8 hours — exceeds fleet threshold; verify GPS / manual entry.',
        },
        {
          vehicleName: 'Maruti Eeco Cargo',
          vehicleNumber: 'GJ01 EF 5566',
          reason:
            'Duplicate submission: same odometer and timestamp as reading #VR-2026-0412 already accepted.',
        },
      ],
      vehiclesNoReadingTwoPlusDays,
    };
  }
}
