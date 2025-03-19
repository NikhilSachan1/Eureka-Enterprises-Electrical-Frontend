import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { fadeInOut } from '../../animations/index';
import { MenuService } from '../../../core/services/menu.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SidebarHeaderComponent } from './sidebar-header/sidebar-header.component';
import { SidebarUserProfileComponent } from './sidebar-user-profile/sidebar-user-profile.component';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    SidebarHeaderComponent,
    SidebarUserProfileComponent,
    SidebarMenuComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class SidebarComponent {
  readonly menuService = inject(MenuService);
  readonly permissionService = inject(PermissionService);

  // Reactive state with signals
  readonly sidebarVisible = signal(true);
  readonly isMobile = signal(window.innerWidth <= 768);

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
}
