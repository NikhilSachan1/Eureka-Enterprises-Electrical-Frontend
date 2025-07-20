import {
  Component,
  input,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ThemeService } from '@core/services';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [NgClass],
  templateUrl: './content-area.component.html',
  styleUrls: ['./content-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentAreaComponent {
  // Input signals
  sidebarVisible = input<boolean>(true);
  isMobile = input<boolean>(false);

  readonly themeService = inject(ThemeService);

  // Signal to control when transition should be enabled
  protected transitionEnabled = signal<boolean>(false);

  constructor() {
    // Enable transitions after initial render to prevent page refresh animation
    setTimeout(() => {
      this.transitionEnabled.set(true);
    }, 100); // Small delay to ensure initial positioning is complete
  }
}
