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
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
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
  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openProjectsButton = dashOutlinedLinkButton({
    label: 'Open projects',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });

  protected readonly metrics = signal<IDashboardProjectMetrics | null>(null);

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }
}
