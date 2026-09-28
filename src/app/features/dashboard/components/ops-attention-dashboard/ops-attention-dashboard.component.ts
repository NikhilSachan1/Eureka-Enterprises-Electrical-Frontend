import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Card } from 'primeng/card';
import { APP_CONFIG } from '@core/config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { dashTextLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import { DashboardService } from '@features/dashboard/services/dashboard.services';
import type { IAssetFleetAlertsDashboardGetResponseDto } from '@features/dashboard/types/dashboard.dto';
import type {
  IDashboardOpsAttentionChip,
  IDashboardOpsAttentionRow,
  IDashboardOpsAttentionTag,
  TDashboardOpsAttentionDomain,
  TDashboardOpsAttentionFilter,
  TDashboardOpsAttentionKind,
  TDashboardOpsAttentionLane,
} from '@features/dashboard/types/dashboard.interface';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

const TAG_ORDER: readonly TDashboardOpsAttentionKind[] = [
  'calibration',
  'warranty',
  'fleet',
  'service',
];

@Component({
  selector: 'app-ops-attention-dashboard',
  imports: [Card, ButtonComponent, DecimalPipe],
  templateUrl: './ops-attention-dashboard.component.html',
  styleUrl: './ops-attention-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpsAttentionDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openAssetsButton = dashTextLinkButton({
    label: 'Assets',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });
  protected readonly openVehiclesButton = dashTextLinkButton({
    label: 'Vehicles',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });
  protected readonly openServicesButton = dashTextLinkButton({
    label: 'Services',
    icon: ICONS.COMMON.ARROW_RIGHT,
  });

  private readonly alerts =
    signal<IAssetFleetAlertsDashboardGetResponseDto | null>(null);
  protected readonly filter = signal<TDashboardOpsAttentionFilter>('all');

  private readonly allRows = computed(() => this.buildRows(this.alerts()));

  protected readonly chips = computed<IDashboardOpsAttentionChip[]>(() =>
    this.buildChips(this.allRows())
  );

  protected readonly overdueRows = computed(() => this.rowsForLane('overdue'));
  protected readonly soonRows = computed(() => this.rowsForLane('soon'));

  ngOnInit(): void {
    this.dashboardService
      .getAssetFleetAlertsShared()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IAssetFleetAlertsDashboardGetResponseDto) => {
          this.alerts.set(response);
        },
      });
  }

  protected setFilter(id: TDashboardOpsAttentionFilter): void {
    this.filter.set(id);
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  protected domainIcon(domain: TDashboardOpsAttentionFilter): string {
    if (domain === 'service') {
      return ICONS.SETTINGS.WRENCH;
    }
    if (domain === 'vehicle') {
      return ICONS.COMMON.CAR;
    }
    return ICONS.ASSET.BOX;
  }

  private rowsForLane(
    lane: TDashboardOpsAttentionLane
  ): IDashboardOpsAttentionRow[] {
    const filter = this.filter();
    return this.allRows().filter(
      row => row.lane === lane && this.matchesFilter(row, filter)
    );
  }

  private matchesFilter(
    row: IDashboardOpsAttentionRow,
    filter: TDashboardOpsAttentionFilter
  ): boolean {
    if (filter === 'all') {
      return true;
    }
    if (filter === 'asset') {
      return row.domain === 'asset';
    }
    if (filter === 'vehicle') {
      return row.tags.some(tag => tag.kind === 'fleet');
    }
    return row.tags.some(tag => tag.kind === 'service');
  }

  private buildChips(
    rows: readonly IDashboardOpsAttentionRow[]
  ): IDashboardOpsAttentionChip[] {
    return [
      { id: 'all', label: 'All', count: rows.length },
      {
        id: 'asset',
        label: 'Assets',
        count: rows.filter(row => row.domain === 'asset').length,
      },
      {
        id: 'vehicle',
        label: 'Vehicles',
        count: rows.filter(row => row.tags.some(tag => tag.kind === 'fleet'))
          .length,
      },
      {
        id: 'service',
        label: 'Service',
        count: rows.filter(row => row.tags.some(tag => tag.kind === 'service'))
          .length,
      },
    ];
  }

  private buildRows(
    data: IAssetFleetAlertsDashboardGetResponseDto | null
  ): IDashboardOpsAttentionRow[] {
    if (!data) {
      return [];
    }

    const items = [...data.critical, ...data.warning, ...data.info];
    const grouped = new Map<
      string,
      {
        domain: TDashboardOpsAttentionDomain;
        title: string;
        meta: string;
        overdue: boolean;
        tags: IDashboardOpsAttentionTag[];
      }
    >();

    items.forEach(item => {
      const kind = this.mapKind(item.type);
      if (!kind) {
        return;
      }

      const mapped = this.mapEntity(kind, item.data);
      const existing = grouped.get(mapped.id);
      const tag: IDashboardOpsAttentionTag = {
        kind,
        label: this.kindLabel(kind, item.data.documentType),
      };
      const overdue = this.isAlertExpired(item.severity, item.data.severity);

      if (!existing) {
        grouped.set(mapped.id, {
          domain: mapped.domain,
          title: mapped.title,
          meta: mapped.meta,
          overdue,
          tags: [tag],
        });
        return;
      }

      existing.overdue = existing.overdue || overdue;
      existing.domain = this.mergeDomain(existing.domain, mapped.domain);
      if (mapped.meta && !existing.meta) {
        existing.meta = mapped.meta;
      }
      if (!existing.tags.some(entry => entry.label === tag.label)) {
        existing.tags.push(tag);
      }
    });

    return [...grouped.entries()].map(([id, row]) => ({
      id,
      domain: row.domain,
      lane: (row.overdue ? 'overdue' : 'soon') as TDashboardOpsAttentionLane,
      title: row.title,
      meta: row.meta,
      tags: [...row.tags].sort(
        (a, b) => TAG_ORDER.indexOf(a.kind) - TAG_ORDER.indexOf(b.kind)
      ),
    }));
  }

  private mergeDomain(
    current: TDashboardOpsAttentionDomain,
    next: TDashboardOpsAttentionDomain
  ): TDashboardOpsAttentionDomain {
    if (current === 'asset' || next === 'asset') {
      return 'asset';
    }
    if (current === 'vehicle' || next === 'vehicle') {
      return 'vehicle';
    }
    return 'service';
  }

  private mapKind(type: string): TDashboardOpsAttentionKind | null {
    if (type === 'assetCalibration') {
      return 'calibration';
    }
    if (type === 'assetWarranty') {
      return 'warranty';
    }
    if (type === 'vehicleDocExpiry') {
      return 'fleet';
    }
    if (type === 'vehicleServiceDue') {
      return 'service';
    }
    return null;
  }

  private kindLabel(
    kind: TDashboardOpsAttentionKind,
    documentType?: string
  ): string {
    if (kind === 'calibration') {
      return 'Calibration';
    }
    if (kind === 'warranty') {
      return 'Warranty';
    }
    if (kind === 'service') {
      return 'Service';
    }
    const doc = documentType?.trim();
    if (!doc) {
      return 'Document';
    }
    return doc === doc.toUpperCase() ? doc : this.toTitle(doc);
  }

  private toTitle(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private mapEntity(
    kind: TDashboardOpsAttentionKind,
    data: {
      documentType?: string;
      assetName?: string;
      assetCode?: string;
      vehicleNumber?: string;
    }
  ): {
    id: string;
    domain: TDashboardOpsAttentionDomain;
    title: string;
    meta: string;
  } {
    if (kind === 'calibration' || kind === 'warranty') {
      const code = data.assetCode?.trim() || '';
      const name = data.assetName?.trim() || 'Unknown asset';
      return {
        id: `asset:${code || name.toLowerCase()}`,
        domain: 'asset',
        title: name,
        meta: code,
      };
    }

    const vehicle = data.vehicleNumber?.trim() || 'Unknown vehicle';
    return {
      id: `vehicle:${vehicle.toLowerCase()}`,
      domain: kind === 'service' ? 'service' : 'vehicle',
      title: vehicle,
      meta: '',
    };
  }

  private isAlertExpired(severity: string, dataSeverity?: string): boolean {
    const itemSeverity = severity.trim().toLowerCase();
    const nestedSeverity = dataSeverity?.trim().toLowerCase() ?? '';
    return (
      itemSeverity === 'critical' ||
      nestedSeverity === 'expired' ||
      nestedSeverity === 'overdue'
    );
  }
}
