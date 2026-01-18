import {
  Component,
  input,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouteLoadingService, ThemeService } from '@core/services';
import { NgClass } from '@angular/common';
import { RouteProgressBarComponent } from '../route-progress-bar/route-progress-bar.component';
import { pageTransition } from '@shared/animations';
import { ProgressSpinner } from 'primeng/progressspinner';

/**
 * Content Area Component
 * Main content wrapper with route progress bar and page transitions
 */
@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [NgClass, RouteProgressBarComponent, ProgressSpinner],
  templateUrl: './content-area.component.html',
  styleUrls: ['./content-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [pageTransition],
})
export class ContentAreaComponent {
  // Input signals
  sidebarVisible = input<boolean>(true);
  isMobile = input<boolean>(false);
  sidebarCollapsed = input<boolean>(false); // Desktop collapsed state

  readonly themeService = inject(ThemeService);
  readonly routeLoading = inject(RouteLoadingService);

  // Signal to control when transition should be enabled
  protected transitionEnabled = signal<boolean>(false);

  constructor() {
    // Enable transitions after initial render to prevent page refresh animation
    setTimeout(() => {
      this.transitionEnabled.set(true);
    }, 100); // Small delay to ensure initial positioning is complete
  }
}
