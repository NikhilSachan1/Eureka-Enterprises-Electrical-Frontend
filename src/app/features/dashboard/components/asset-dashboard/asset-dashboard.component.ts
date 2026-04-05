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
import type { IDashboardAssetMetrics } from '@features/dashboard/types/dashboard.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-asset-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './asset-dashboard.component.html',
  styleUrl: './asset-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDashboardComponent {
  private readonly router = inject(Router);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openAssetsButton = dashOutlinedLinkButton({
    label: 'Open assets',
    icon: 'pi pi-arrow-right',
  });

  protected readonly metrics = signal<IDashboardAssetMetrics | null>(null);

  constructor() {
    this.metrics.set(this.buildMock());
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private buildMock(): IDashboardAssetMetrics {
    const calibrationExpiringSoonItems = [
      { name: 'Digital multimeter Fluke 87V', assetId: 'AST-10442' },
      { name: 'Insulation tester Megger', assetId: 'AST-08917' },
      { name: 'Earth tester', assetId: 'AST-22003' },
    ] as const;
    const calibrationExpiredItems = [
      { name: 'Clamp meter Uni-T', assetId: 'AST-05102' },
    ] as const;
    const warrantyExpiringSoonItems = [
      { name: 'Portable DG set 5kVA', assetId: 'AST-30011' },
      { name: 'Hydraulic crimping tool', assetId: 'AST-17765' },
    ] as const;
    const warrantyExpiredItems = [] as const;

    return {
      total: 48,
      free: 9,
      calibrationExpiringSoon: calibrationExpiringSoonItems.length,
      calibrationExpired: calibrationExpiredItems.length,
      warrantyExpiringSoon: warrantyExpiringSoonItems.length,
      warrantyExpired: warrantyExpiredItems.length,
      calibrationExpiringSoonItems,
      calibrationExpiredItems,
      warrantyExpiringSoonItems,
      warrantyExpiredItems,
    };
  }
}
