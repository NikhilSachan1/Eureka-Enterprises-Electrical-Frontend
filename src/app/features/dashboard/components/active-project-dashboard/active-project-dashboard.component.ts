import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import type { IDashboardProjectMetrics } from '@features/dashboard/types/dashboard.interface';

@Component({
  selector: 'app-active-project-dashboard',
  imports: [Card, CurrencyPipe],
  templateUrl: './active-project-dashboard.component.html',
  styleUrl: './active-project-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveProjectDashboardComponent {
  protected readonly ICONS = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly metrics = signal<IDashboardProjectMetrics | null>(null);
}
