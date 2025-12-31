import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { MenuService } from '@core/services';
import { slideInOut } from '@shared/animations';
import { MenuItem } from '@shared/types';
import { ICONS } from '@shared/constants';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  animations: [slideInOut],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMenuComponent {
  readonly menuService = inject(MenuService);
  readonly icons = ICONS;

  /**
   * Toggle a top-level submenu item's expanded state
   * Only one submenu can be open at a time (accordion behavior)
   */
  toggleSubmenu(item: MenuItem): void {
    if (!item.children?.length) {
      return;
    }

    this.menuService.toggleMenuItem(item, false);
  }

  /**
   * Toggle a nested (Level 2+) submenu item's expanded state
   * Nested items can be opened independently within their parent
   */
  toggleNestedSubmenu(item: MenuItem): void {
    if (!item.children?.length) {
      return;
    }

    this.menuService.toggleMenuItem(item, true);
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
   * Get full router link for any menu item at any level
   * Combines the item's routerLink with the inherited parentBasePath
   * @param item The menu item
   * @param parentBasePath The accumulated base path from parent items
   */
  getFullRouterLink(item: MenuItem, parentBasePath: string | null): string {
    if (!item.routerLink) {
      return '';
    }

    // Use item's own basePath if available, otherwise use parent's basePath
    const effectiveBasePath = item.basePath ?? parentBasePath ?? '';

    if (effectiveBasePath) {
      const basePath = effectiveBasePath.endsWith('/')
        ? effectiveBasePath.slice(0, -1)
        : effectiveBasePath;
      const itemPath = item.routerLink.startsWith('/')
        ? item.routerLink.slice(1)
        : item.routerLink;
      return `${basePath}/${itemPath}`;
    }

    return item.routerLink;
  }
}
