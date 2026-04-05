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
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import type { IDashboardLeaveMetrics } from '@features/dashboard/types/dashboard.interface';

@Component({
  selector: 'app-leave-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './leave-dashboard.component.html',
  styleUrl: './leave-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openLeaveButton = dashOutlinedLinkButton({
    label: 'Open leave',
    icon: 'pi pi-external-link',
  });

  protected readonly metrics = signal<IDashboardLeaveMetrics | null>(null);

  constructor() {
    this.metrics.set(this.buildLeaveMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildLeaveMock(): IDashboardLeaveMetrics {
    return {
      approval: {
        pending: 4,
        approved: 18,
        rejected: 2,
        cancelled: 1,
        total: 25,
      },
      employeeWiseLeaveBalance: [],
    };
  }
}
