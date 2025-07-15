import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { fadeInOut } from '@shared/animations';
import { MenuService, ThemeService } from '@core/services';
import { SidebarHeaderComponent, SidebarUserProfileComponent, SidebarMenuComponent, ContentAreaComponent } from '@shared/components';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgClass,
    SidebarHeaderComponent,
    SidebarUserProfileComponent,
    SidebarMenuComponent,
    ContentAreaComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class SidebarComponent {
  readonly menuService = inject(MenuService);
  readonly themeService = inject(ThemeService);

  // Reactive state with signals
  readonly sidebarVisible = signal(true);
  readonly isMobile = signal(window.innerWidth <= 768);
  
  // Signal to control when transition should be enabled
  protected transitionEnabled = signal<boolean>(false);

  constructor() {
    // Initialize sidebar visibility based on screen size
    this.sidebarVisible.set(!this.isMobile());
    
    // Enable transitions after initial render to prevent page refresh animation
    setTimeout(() => {
      this.transitionEnabled.set(true);
    }, 100); // Small delay to ensure initial positioning is complete
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasNotMobile = !this.isMobile();
    this.isMobile.set(window.innerWidth <= 768);
    
    // Update sidebar visibility when transitioning between mobile/desktop
    if (wasNotMobile && this.isMobile()) {
      this.sidebarVisible.set(false);
    } else if (!wasNotMobile && !this.isMobile()) {
      this.sidebarVisible.set(true);
    }
  }

  toggleSidebar(): void {
    const wasVisible = this.sidebarVisible();
    this.sidebarVisible.update(value => !value);
    
    // Prevent body scrolling when sidebar is open on mobile
    if (this.isMobile()) {
      document.body.style.overflow = this.sidebarVisible() ? 'hidden' : '';
    }
    
    // Close all submenus when closing the sidebar
    if (wasVisible) {
      this.menuService.closeAllMenuItems();
    }
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
