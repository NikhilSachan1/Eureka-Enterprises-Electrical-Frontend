import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouteLoadingService } from '@core/services/route-loading.service';

@Component({
  selector: 'app-route-progress-bar',
  standalone: true,
  templateUrl: './route-progress-bar.component.html',
  styleUrl: 'route-progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteProgressBarComponent {
  readonly routeLoading = inject(RouteLoadingService);
}
