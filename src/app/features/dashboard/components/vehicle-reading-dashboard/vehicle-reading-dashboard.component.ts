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

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }
}
