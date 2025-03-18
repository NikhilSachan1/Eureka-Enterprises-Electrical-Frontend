import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { ThemeService } from '../../../core/services/theme.service';
import { MenuService } from '../../../core/services/menu.service';
import { PermissionService } from '../../../core/services/permission.service';
import { slideInOut, fadeInOut } from '../../animations/index';
import { SidebarUser, MenuItem } from '../../models/index';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    SidebarModule,
    DividerModule,
    RippleModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    slideInOut,
    fadeInOut,
  ]
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly menuService = inject(MenuService);
  readonly permissionService = inject(PermissionService);

  // Reactive state with signals
  readonly sidebarVisible = signal(true);
  readonly showUserOptions = signal(false);
  readonly isMobile = signal(window.innerWidth <= 768);

  // Demo user data - in a real app, this would come from a user service
  readonly user: SidebarUser = {
    name: 'John Doe',
    designation: 'Software Engineer',
    avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
  };

  constructor() {
    // Initialize sidebar visibility based on screen size
    this.sidebarVisible.set(!this.isMobile());
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

  @HostListener('window:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-options') && !target.matches('img')) {
      this.showUserOptions.set(false);
    }
  }

  toggleUserOptions(): void {
    this.showUserOptions.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Navigation methods
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.showUserOptions.set(false);
  }

  logout(): void {
    // In a real app, call auth service logout method
    this.router.navigate(['/login']);
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
      this.closeAllSubmenus();
    }
  }

  /**
   * Toggle a submenu item's expanded state
   * Only one submenu can be open at a time
   */
  toggleSubmenu(item: MenuItem): void {
    if (item.type !== 'parent') {
      return;
    }
    
    this.menuService.toggleMenuItem(item);
  }
  
  /**
   * Close all submenus
   * Used when clicking on route menu items to ensure all submenus are closed
   */
  closeAllSubmenus(): void {
    this.menuService.closeAllMenuItems();
  }
  
  /**
   * Check if a menu item is expanded
   */
  isMenuItemExpanded(item: MenuItem): boolean {
    return this.menuService.isMenuItemExpanded(item);
  }
  
  /**
   * Check if a menu item is active based on the current route
   */
  isMenuItemActive(item: MenuItem): boolean {
    return this.menuService.isMenuItemActive(item);
  }

  /**
   * Check if a specific route is active
   * Used for simple route matching
   */
  isRouteActive(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route;
  }

  ngOnInit(): void {
    // Initialize the menu with the user's permissions
    this.menuService.initializeMenuWithPermissions(
      permission => this.permissionService.hasPermission(permission)
    );
  }
}
