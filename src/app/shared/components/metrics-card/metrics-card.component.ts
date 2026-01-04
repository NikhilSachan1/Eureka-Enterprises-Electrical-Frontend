import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EDataType, IMetric } from '@shared/types';
import { StatusUtil } from '@shared/utility';
import { AppPermissionService } from '@core/services';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-card.component.html',
  styleUrls: ['./metrics-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsCardComponent {
  private readonly permissionService = inject(AppPermissionService);

  metricCardConfig = input<IMetric[]>();
  protected readonly ALL_DATA_TYPES = EDataType;

  protected visibleMetrics = computed(() => {
    const metrics = this.metricCardConfig();
    if (!metrics) {
      return [];
    }
    return this.permissionService.filterByPermission(metrics);
  });

  getColorScheme(label: string): {
    primary: string;
    light: string;
    dark: string;
    textClass: string;
  } {
    const colorClass = StatusUtil.getColorClass(label);
    const hexColors = StatusUtil.getHexColors(label);

    return {
      ...hexColors,
      textClass: colorClass.text,
    };
  }

  getIcon(metric: IMetric): string | null {
    // Priority 1: Manual icon from component
    if (metric.icon) {
      return metric.icon;
    }

    // Priority 2: Dynamic icon based on label
    return StatusUtil.getIcon(metric.label);
  }
}
