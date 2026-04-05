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
import type { IDashboardVehicleFleetMetrics } from '@features/dashboard/types/dashboard.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-vehicle-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './vehicle-dashboard.component.html',
  styleUrl: './vehicle-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openVehiclesButton = dashOutlinedLinkButton({
    label: 'Open vehicles',
    icon: 'pi pi-arrow-right',
  });

  protected readonly metrics = signal<IDashboardVehicleFleetMetrics | null>(
    null
  );

  constructor() {
    this.metrics.set(this.buildMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildMock(): IDashboardVehicleFleetMetrics {
    const complianceExpiringSoonItems = [
      { vehicleName: 'Tata Ace Gold', vehicleNumber: 'MH12 AB 1234' },
      { vehicleName: 'Mahindra Bolero Pik-Up', vehicleNumber: 'MH14 CD 9012' },
    ] as const;
    const complianceExpiredItems = [] as const;
    const warrantyExpiringSoonItems = [
      { vehicleName: 'Maruti Eeco Cargo', vehicleNumber: 'GJ01 EF 5566' },
    ] as const;
    const warrantyExpiredItems = [] as const;

    return {
      total: 14,
      free: 3,
      complianceExpiringSoon: complianceExpiringSoonItems.length,
      complianceExpired: complianceExpiredItems.length,
      warrantyExpiringSoon: warrantyExpiringSoonItems.length,
      warrantyExpired: warrantyExpiredItems.length,
      complianceExpiringSoonItems,
      complianceExpiredItems,
      warrantyExpiringSoonItems,
      warrantyExpiredItems,
    };
  }
}
