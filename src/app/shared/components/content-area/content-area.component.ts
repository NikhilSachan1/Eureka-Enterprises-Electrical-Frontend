import { Component, input, inject, signal, effect } from '@angular/core';
import { ThemeService } from '@core/services';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [NgClass],
  templateUrl: './content-area.component.html',
  styleUrls: ['./content-area.component.scss']
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
    
    // Monitor sidebar visibility changes to ensure transitions work for user interactions
    effect(() => {
      const visible = this.sidebarVisible();
      // If sidebar visibility changes after initial load, ensure transitions are enabled
      if (this.transitionEnabled()) {
        // Transition is already enabled, nothing to do
      }
    });
  }
} 