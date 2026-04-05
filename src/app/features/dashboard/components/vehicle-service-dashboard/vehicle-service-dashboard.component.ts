import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { APP_CONFIG } from '@core/config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { dashOutlinedLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import type { IDashboardVehicleServiceMetrics } from '@features/dashboard/types/dashboard.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-vehicle-service-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './vehicle-service-dashboard.component.html',
  styleUrl: './vehicle-service-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleServiceDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openServicesButton = dashOutlinedLinkButton({
    label: 'Open services',
    icon: 'pi pi-arrow-right',
  });

  protected readonly metrics = signal<IDashboardVehicleServiceMetrics | null>(
    null
  );

  constructor() {
    this.metrics.set(this.buildMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildMock(): IDashboardVehicleServiceMetrics {
    const upcomingItems = [
      { vehicleName: 'Tata Ace Gold', vehicleNumber: 'MH12 AB 1234' },
      { vehicleName: 'Ashok Leyland Dost', vehicleNumber: 'MH12 AB 5678' },
      { vehicleName: 'Mahindra Jeeto', vehicleNumber: 'DL01 CD 1111' },
      { vehicleName: 'Mahindra Bolero Pik-Up', vehicleNumber: 'MH14 CD 9012' },
      { vehicleName: 'Maruti Eeco Cargo', vehicleNumber: 'GJ01 EF 5566' },
    ] as const;
    const dueSoonItems = [
      { vehicleName: 'Tata Intra V30', vehicleNumber: 'MH12 AB 9999' },
      { vehicleName: 'Force Traveller', vehicleNumber: 'KA03 GH 2244' },
    ] as const;
    const overdueItems = [
      { vehicleName: 'Tata 407', vehicleNumber: 'MH12 AB 4321' },
    ] as const;

    return {
      upcoming: upcomingItems.length,
      dueSoon: dueSoonItems.length,
      overdue: overdueItems.length,
      upcomingItems,
      dueSoonItems,
      overdueItems,
    };
  }
}
