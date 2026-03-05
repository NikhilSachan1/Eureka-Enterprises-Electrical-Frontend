import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EDataType, IMetric, IMetricGroup } from '@shared/types';
import { StatusUtil } from '@shared/utility';
import { AppPermissionService } from '@core/services';
import { KnobComponent } from '@shared/components/knob/knob.component';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule, KnobComponent, ProgressBarComponent],
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
}
