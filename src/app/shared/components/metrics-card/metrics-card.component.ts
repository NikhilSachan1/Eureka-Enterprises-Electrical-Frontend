import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMetric } from '@shared/models';
import { ColorUtil } from '@shared/utils/color.util';

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

  getColor(label: string): string {
    return ColorUtil.getColor(label);
  }
}
