import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { fadeInOut } from '@shared/animations';
import { MenuService, ThemeService } from '@core/services';
import { NgClass } from '@angular/common';
import { SidebarHeaderComponent } from './sidebar-header/sidebar-header.component';
import { SidebarUserProfileComponent } from './sidebar-user-profile/sidebar-user-profile.component';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { ContentAreaComponent } from '../content-area/content-area.component';
import { RoleSwitcherComponent } from './role-switcher/role-switcher.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgClass,
    SidebarHeaderComponent,
    SidebarUserProfileComponent,
    SidebarMenuComponent,
    ContentAreaComponent,
    RoleSwitcherComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  host: {
    '[class.sidebar-collapsed]':
      '!sidebarVisible() && !isMobile() && !hoverExpanded()',
  },
})
export class SidebarComponent {
  readonly menuService = inject(MenuService);
  readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  // Reactive state with signals
  readonly sidebarVisible = signal(true);
  readonly isMobile = signal(window.innerWidth <= 768);
  readonly hoverExpanded = signal(false);
  protected transitionEnabled = signal<boolean>(false);
  private clickInsideSidebarGuard = false;
  private clickGuardTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initSidebarState();

    // Enable transitions after initial render to prevent page refresh animation
    setTimeout(() => {
      this.transitionEnabled.set(true);
    }, 100); // Small delay to ensure initial positioning is complete
  }

  /**
   * Initialize sidebar state from localStorage
   * Falls back to screen size based default if no saved state
   */
  private initSidebarState(): void {
    // On mobile, always start with sidebar hidden
    if (this.isMobile()) {
      this.sidebarVisible.set(false);
      return;
    }

    // On desktop, check localStorage for saved state
    const savedState = localStorage.getItem('sidebar_visible');
    if (savedState !== null) {
      this.sidebarVisible.set(savedState === 'true');
    } else {
      // Default: visible on desktop
      this.sidebarVisible.set(true);
    }
  }

  /**
   * Save sidebar state to localStorage
   */
  private saveSidebarState(): void {
    // Only save state on desktop
    if (!this.isMobile()) {
      localStorage.setItem('sidebar_visible', String(this.sidebarVisible()));
    }
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

    // Jab user sidebar reopen kare to blur backdrop hata do (hoverExpanded reset)
    if (!wasVisible && this.sidebarVisible()) {
      this.hoverExpanded.set(false);
    }

    // Save state to localStorage (desktop only)
    this.saveSidebarState();

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

  onSidebarMouseDown(): void {
    if (this.clickGuardTimeout !== null) {
      clearTimeout(this.clickGuardTimeout);
    }
    this.clickInsideSidebarGuard = true;
    this.clickGuardTimeout = setTimeout(() => {
      this.clickGuardTimeout = null;
      this.clickInsideSidebarGuard = false;
    }, 450);
  }

  onSidebarMouseEnter(): void {
    if (!this.sidebarVisible() && !this.isMobile()) {
      this.hoverExpanded.set(true);
    }
  }

  onSidebarMouseLeave(): void {
    if (this.clickInsideSidebarGuard) {
      return;
    }
    setTimeout(() => {
      if (!this.sidebarVisible() && !this.isMobile()) {
        this.hoverExpanded.set(false);
      }
    }, 200);
  }
}
