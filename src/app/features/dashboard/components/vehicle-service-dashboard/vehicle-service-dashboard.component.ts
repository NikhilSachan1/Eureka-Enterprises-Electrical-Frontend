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
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

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
  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openServicesButton = dashOutlinedLinkButton({
    label: 'Open services',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });

  protected readonly metrics = signal<IDashboardVehicleServiceMetrics | null>(
    null
  );

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }
}
