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
import type { IDashboardAttendanceMetrics } from '@features/dashboard/types/dashboard.interface';

@Component({
  selector: 'app-attendance-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openAttendanceButton = dashOutlinedLinkButton({
    label: 'Open attendance',
    icon: 'pi pi-external-link',
  });

  protected readonly metrics = signal<IDashboardAttendanceMetrics | null>(null);

  constructor() {
    this.metrics.set(this.buildAttendanceMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildAttendanceMock(): IDashboardAttendanceMetrics {
    return {
      attendance: {
        present: 28,
        absent: 5,
        leave: 2,
        checkedIn: 24,
        notCheckedInYet: 4,
        holiday: 0,
        total: 35,
      },
      approval: {
        pending: 3,
        approved: 40,
        rejected: 1,
        total: 44,
      },
    };
  }
}
