import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';

/**
 * The chart.js canvas of {@link ChartsComponent}. Its own component so charts load with
 * `@defer`: chart.js (~190 kB) is fetched when a chart scrolls into view, not with the page.
 */
@Component({
  selector: 'app-chart-canvas',
  imports: [ChartModule],
  templateUrl: './chart-canvas.component.html',
  styleUrl: './chart-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCanvasComponent {
  readonly type = input.required<string>();
  readonly data = input<Record<string, unknown>>({});
  readonly options = input<Record<string, unknown>>({});
}
