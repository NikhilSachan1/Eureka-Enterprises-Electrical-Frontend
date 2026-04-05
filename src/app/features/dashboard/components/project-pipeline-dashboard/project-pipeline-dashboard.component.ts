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
import type { IDashboardProjectMetrics } from '@features/dashboard/types/dashboard.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';

@Component({
  selector: 'app-project-pipeline-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe, IndianCurrencyPipe],
  templateUrl: './project-pipeline-dashboard.component.html',
  styleUrl: './project-pipeline-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPipelineDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openProjectsButton = dashOutlinedLinkButton({
    label: 'Open projects',
    icon: 'pi pi-arrow-right',
  });

  protected readonly metrics = signal<IDashboardProjectMetrics | null>(null);

  constructor() {
    this.metrics.set(this.buildProjectMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildProjectMock(): IDashboardProjectMetrics {
    const activeProjects = [
      {
        name: 'Mumbai Metro — traction substation package',
        code: 'PRJ-2401',
        shortLabel: 'MMX Sub',
        contractValue: 4_20_00_000,
        expenseToDate: 2_98_00_000,
        netPosition: 38_50_000,
        progressPercent: 72,
      },
      {
        name: 'Pune IT park — HT cabling & panels',
        code: 'PRJ-2388',
        shortLabel: 'Pune HT',
        contractValue: 1_85_00_000,
        expenseToDate: 1_62_00_000,
        netPosition: -8_20_000,
        progressPercent: 54,
      },
      {
        name: 'Goa resort — DG & UPS rollout',
        shortLabel: 'Goa DG',
        contractValue: 92_00_000,
        expenseToDate: 61_00_000,
        netPosition: 14_20_000,
        progressPercent: 48,
      },
      {
        name: 'Nashik warehouse — solar + LT network',
        code: 'PRJ-2412',
        shortLabel: 'NSK Solar',
        contractValue: 2_40_00_000,
        expenseToDate: 1_05_00_000,
        netPosition: 52_00_000,
        progressPercent: 33,
      },
      {
        name: 'Thane hospital — fire pump electrical',
        shortLabel: 'THN Fire',
        contractValue: 64_00_000,
        expenseToDate: 58_00_000,
        netPosition: -2_10_000,
        progressPercent: 88,
      },
    ] as const;

    const activeContractTotal = activeProjects.reduce(
      (s, p) => s + p.contractValue,
      0
    );
    const activeExpenseTotal = activeProjects.reduce(
      (s, p) => s + p.expenseToDate,
      0
    );
    const activeNetTotal = activeProjects.reduce(
      (s, p) => s + p.netPosition,
      0
    );

    return {
      total: 24,
      active: activeProjects.length,
      upcoming: 4,
      completed: 14,
      onHold: 1,
      activeContractTotal,
      activeExpenseTotal,
      activeNetTotal,
      activeProjects,
    };
  }
}
