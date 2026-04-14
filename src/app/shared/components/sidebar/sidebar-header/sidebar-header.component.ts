import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';

@Component({
  selector: 'app-sidebar-header',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarHeaderComponent {
  // Inputs
  sidebarVisible = input<boolean>(true);
  isMobile = input<boolean>(false);

  // Outputs
  toggleSidebar = output<void>();

  // Icon for collapse
  readonly collapseIcon = ICONS.COMMON.CHEVRON_LEFT;

  // Using computed signals for reactive data - Angular v19 best practice
  readonly companyName = computed(() => APP_CONFIG.name);
  readonly companyDescription = computed(() => APP_CONFIG.description);

  /**
   * Handle logo/company name click to toggle sidebar (desktop only)
   */
  onHeaderClick(): void {
    // Only toggle on desktop, not mobile
    if (!this.isMobile()) {
      this.toggleSidebar.emit();
    }
  }
}
