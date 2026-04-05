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
  selector: 'app-leave-balance-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './leave-balance-dashboard.component.html',
  styleUrl: './leave-balance-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveBalanceDashboardComponent {
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
    this.metrics.set(this.buildLeaveBalanceMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildLeaveBalanceMock(): IDashboardLeaveMetrics {
    return {
      approval: {
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        total: 0,
      },
      employeeWiseLeaveBalance: [
        { employeeName: 'Rahul Verma', employeeCode: 'EMP-1042', balance: 14 },
        { employeeName: 'Anita Desai', employeeCode: 'EMP-0891', balance: 8.5 },
        {
          employeeName: 'Suresh Kulkarni',
          employeeCode: 'EMP-1120',
          balance: 21,
        },
        { employeeName: 'Priya Nair', balance: 3 },
        { employeeName: 'Vikram Singh', employeeCode: 'EMP-0555', balance: 0 },
        {
          employeeName: 'Deepak Patil',
          employeeCode: 'EMP-1203',
          balance: 11.5,
          unit: 'days',
        },
      ],
    };
  }
}
