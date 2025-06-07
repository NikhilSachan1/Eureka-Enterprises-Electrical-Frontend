import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  templateUrl: './metrics-card.component.html',
  styleUrls: ['./metrics-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsCardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  iconClass = input<string>('pi pi-chart-pie text-blue-500');
  iconBgClass = input<string>('bg-blue-50');
  metrics = input<{ label: string, value: string | number }[]>([]);
} 