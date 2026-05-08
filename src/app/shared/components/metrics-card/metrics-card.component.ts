import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EDataType, IMetric, IMetricGroup } from '@shared/types';

const METRIC_GROUP_ACCENT_PALETTE = [
  { light: '#059669', dark: '#047857' },
  { light: '#2563eb', dark: '#1d4ed8' },
  { light: '#d97706', dark: '#b45309' },
  { light: '#7c3aed', dark: '#5b21b6' },
  { light: '#db2777', dark: '#be185d' },
  { light: '#0891b2', dark: '#0e7490' },
  { light: '#ea580c', dark: '#c2410c' },
  { light: '#4f46e5', dark: '#4338ca' },
  { light: '#006d5b', dark: '#004d41' },
] as const;
import { StatusUtil } from '@shared/utility';
import { AppPermissionService } from '@core/services';
import { KnobComponent } from '@shared/components/knob/knob.component';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule, KnobComponent, TooltipModule],
  templateUrl: './metrics-card.component.html',
  styleUrls: ['./metrics-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsCardComponent {
  private readonly permissionService = inject(AppPermissionService);

  // Input: Flat metrics array (original)
  metricCardConfig = input<IMetric[]>();

  // Input: Grouped metrics array (new)
  metricGroups = input<IMetricGroup[]>();

  protected readonly ALL_DATA_TYPES = EDataType;

  // Check if using grouped layout
  protected isGrouped = computed(() => {
    const groups = this.metricGroups();
    return groups && groups.length > 0;
  });

  // Check if there's any data to display
  protected hasData = computed(() => {
    return this.visibleGroups().length > 0 || this.visibleMetrics().length > 0;
  });

  // Filter flat metrics based on permissions
  protected visibleMetrics = computed(() => {
    const metrics = this.metricCardConfig();
    if (!metrics) {
      return [];
    }
    return this.permissionService.filterByPermission(metrics);
  });

  // Filter grouped metrics based on permissions
  protected visibleGroups = computed(() => {
    const groups = this.metricGroups();
    if (!groups) {
      return [];
    }

    return groups
      .filter(g => this.permissionService.filterByPermission([g]).length > 0)
      .map(group => ({
        ...group,
        metrics: this.permissionService.filterByPermission(group.metrics),
      }))
      .filter(g => g.metrics.length > 0);
  });

  // Get color scheme for a metric label
  getColorScheme(label: string): {
    primary: string;
    light: string;
    textClass: string;
  } {
    const colorClass = StatusUtil.getColorClass(label);
    const hexColors = StatusUtil.getHexColors(label);
    return { ...hexColors, textClass: colorClass.text };
  }

  // Get icon for a metric
  getIcon(metric: IMetric): string | null {
    return metric.icon ?? StatusUtil.getIcon(metric.label);
  }

  /** Tooltip copy when `metric.description` is set (optional per screen). */
  getMetricTooltip(metric: IMetric): string {
    return metric.description?.trim() ?? '';
  }

  /**
   * Stable accent pair per group (dashboard KPM–style gradient header), from group id.
   */
  getGroupAccent(group: IMetricGroup): { light: string; dark: string } {
    let h = 0;
    for (let i = 0; i < group.id.length; i++) {
      h = (h + group.id.charCodeAt(i) * (i + 1)) % 2147483647;
    }
    const idx = Math.abs(h) % METRIC_GROUP_ACCENT_PALETTE.length;
    return METRIC_GROUP_ACCENT_PALETTE[idx];
  }
}
