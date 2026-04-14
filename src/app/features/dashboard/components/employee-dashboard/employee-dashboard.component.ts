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
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import type { IDashboardEmployeeMetrics } from '@features/dashboard/types/dashboard.interface';

@Component({
  selector: 'app-employee-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly directoryButton = dashOutlinedLinkButton({
    label: 'Directory',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });

  protected readonly metrics = signal<IDashboardEmployeeMetrics>(
    this.buildEmployeeMock()
  );

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildEmployeeMock(): IDashboardEmployeeMetrics {
    return {
      total: 12,
      active: 11,
      inactive: 1,
      newJoinersLast30Days: 2,
      byGender: { male: 6, female: 4, other: 2 },
    };
  }
}
