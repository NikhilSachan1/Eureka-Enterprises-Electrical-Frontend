import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { AppConfigService } from '@core/services';

@Component({
  selector: 'app-sidebar-header',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarHeaderComponent {
  private readonly appConfigService = inject(AppConfigService);

  // Inputs
  sidebarVisible = input<boolean>(true);
  isMobile = input<boolean>(false);

  // Outputs
  toggleSidebar = output<void>();

  // Icon for collapse
  readonly collapseIcon = 'pi pi-chevron-left';

  // Using computed signals for reactive data - Angular v19 best practice
  readonly companyName = computed(() => this.appConfigService.appName);
  readonly companyDescription = computed(
    () => this.appConfigService.appDescription
  );

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
