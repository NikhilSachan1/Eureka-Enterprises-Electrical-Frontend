import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EDataType, IMetric } from '@shared/types';
import { ColorUtil } from '@shared/utility';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-card.component.html',
  styleUrls: ['./metrics-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsCardComponent {
  metricCardConfig = input<IMetric[]>();
  protected readonly ALL_DATA_TYPES = EDataType;

  getColorScheme(label: string): {
    primary: string;
    light: string;
    dark: string;
    textClass: string;
  } {
    // Use ColorUtil directly for everything
    const colorClass = ColorUtil.getColorClass(label);
    const hexColors = ColorUtil.getHexColors(label);

    return {
      ...hexColors,
      textClass: colorClass.text,
    };
  }
}
