import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
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
  private readonly sidebarEl = viewChild<ElementRef<HTMLElement>>('sidebarEl');

  readonly sidebarVisible = signal(true);
  readonly isMobile = signal(window.innerWidth <= 768);
  readonly hoverExpanded = signal(false);
  protected transitionEnabled = signal<boolean>(false);

  private hoverTracking = false;
  private hoverCollapseTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly onHoverTrackMove = (event: MouseEvent): void => {
    if (!this.isPointerInSidebar(event.clientX, event.clientY)) {
      this.setHoverExpanded(false);
    }
  };

  constructor() {
    this.initSidebarState();

    afterNextRender(() => this.reconcileHoverState());

    this.destroyRef.onDestroy(() => {
      this.clearHoverCollapseTimeout();
      this.stopHoverTracking();
    });

    setTimeout(() => this.transitionEnabled.set(true), 100);
  }

  private initSidebarState(): void {
    if (this.isMobile()) {
      this.sidebarVisible.set(false);
      return;
    }

    const savedState = localStorage.getItem('sidebar_visible');
    this.sidebarVisible.set(savedState === null ? true : savedState === 'true');
  }

  private saveSidebarState(): void {
    if (!this.isMobile()) {
      localStorage.setItem('sidebar_visible', String(this.sidebarVisible()));
    }
  }

  private isCollapsedDesktop(): boolean {
    return !this.sidebarVisible() && !this.isMobile();
  }

  private setHoverExpanded(value: boolean): void {
    if (this.hoverExpanded() === value) {
      return;
    }

    this.hoverExpanded.set(value);

    if (!value) {
      this.stopHoverTracking();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasNotMobile = !this.isMobile();
    this.isMobile.set(window.innerWidth <= 768);

    if (wasNotMobile && this.isMobile()) {
      this.sidebarVisible.set(false);
    } else if (!wasNotMobile && !this.isMobile()) {
      this.sidebarVisible.set(true);
    }

    if (!this.isCollapsedDesktop()) {
      this.setHoverExpanded(false);
      this.clearHoverCollapseTimeout();
    }
  }

  toggleSidebar(): void {
    const wasVisible = this.sidebarVisible();
    this.sidebarVisible.update(value => !value);

    if (!wasVisible && this.sidebarVisible()) {
      this.setHoverExpanded(false);
    }

    this.saveSidebarState();

    if (this.isMobile()) {
      document.body.style.overflow = this.sidebarVisible() ? 'hidden' : '';
    }

    if (wasVisible) {
      this.menuService.closeAllMenuItems();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSidebarMouseEnter(): void {
    if (!this.isCollapsedDesktop()) {
      return;
    }

    this.clearHoverCollapseTimeout();
    this.setHoverExpanded(true);
    this.startHoverTracking();
  }

  onSidebarMouseLeave(): void {
    if (!this.isCollapsedDesktop()) {
      return;
    }

    this.scheduleHoverCollapse();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden) {
      this.setHoverExpanded(false);
      this.clearHoverCollapseTimeout();
    }
  }

  private isPointerInSidebar(clientX: number, clientY: number): boolean {
    const sidebar = this.sidebarEl()?.nativeElement;
    if (!sidebar) {
      return false;
    }

    const { left, right, top, bottom } = sidebar.getBoundingClientRect();
    return (
      clientX >= left && clientX <= right && clientY >= top && clientY <= bottom
    );
  }

  /** Fixes stuck blur when pointer left before initial render settled. */
  private reconcileHoverState(): void {
    const sidebar = this.sidebarEl()?.nativeElement;
    if (!this.isCollapsedDesktop() || !sidebar || sidebar.matches(':hover')) {
      return;
    }

    this.setHoverExpanded(false);
  }

  private startHoverTracking(): void {
    if (this.hoverTracking) {
      return;
    }

    this.hoverTracking = true;
    document.addEventListener('mousemove', this.onHoverTrackMove, {
      passive: true,
    });
  }

  private stopHoverTracking(): void {
    if (!this.hoverTracking) {
      return;
    }

    this.hoverTracking = false;
    document.removeEventListener('mousemove', this.onHoverTrackMove);
  }

  private clearHoverCollapseTimeout(): void {
    if (this.hoverCollapseTimeout !== null) {
      clearTimeout(this.hoverCollapseTimeout);
      this.hoverCollapseTimeout = null;
    }
  }

  private scheduleHoverCollapse(): void {
    this.clearHoverCollapseTimeout();
    this.hoverCollapseTimeout = setTimeout(() => {
      this.hoverCollapseTimeout = null;

      const sidebar = this.sidebarEl()?.nativeElement;
      if (sidebar && !sidebar.matches(':hover')) {
        this.setHoverExpanded(false);
      }
    }, 150);
  }
}
