import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { fadeInOut, fadeInOutScale } from '@shared/animations';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  animations: [fadeInOut, fadeInOutScale],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  // Input signals for configuration
  readonly show = input<boolean>(false);
  readonly title = input<string>('Loading...');
  readonly message = input<string>(
    "We're getting things ready. This will just take a moment."
  );

  // Computed signal for visibility
  readonly isVisible = computed(() => this.show());
}
