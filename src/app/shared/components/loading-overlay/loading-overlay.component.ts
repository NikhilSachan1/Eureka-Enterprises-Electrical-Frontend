import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOut } from '@shared/animations';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  animations: [fadeInOut]
})
export class LoadingOverlayComponent {
  // Input signals for configuration
  readonly show = input<boolean>(false);
  readonly title = input<string>('Loading...');
  readonly message = input<string>('Please wait a moment');
  
  // Computed signal for visibility
  readonly isVisible = computed(() => this.show());
} 