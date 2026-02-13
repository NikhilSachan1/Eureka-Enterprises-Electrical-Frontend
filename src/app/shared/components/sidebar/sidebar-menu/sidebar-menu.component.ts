import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
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

  /** When true, sidebar shows icons only (collapsed or hover-overlay not active). */
  isCollapsed = input<boolean>(false);

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
   * @param item The menu item to check
   * @param accumulatedBasePath The accumulated base path from parent items
   */
  isMenuItemActive(
    item: MenuItem,
    accumulatedBasePath: string | null = null
  ): boolean {
    return this.menuService.isMenuItemActive(item, accumulatedBasePath ?? '');
  }

  /**
   * Accumulate base paths from parent to child
   * Combines parent's accumulated path with current item's basePath
   * @param parentBasePath The accumulated base path from parent items
   * @param itemBasePath The current item's basePath
   * @returns Combined base path
   */
  getAccumulatedBasePath(
    parentBasePath: string | null,
    itemBasePath: string | undefined
  ): string {
    // If item has no basePath, just pass through parent's path
    if (!itemBasePath) {
      return parentBasePath ?? '';
    }

    // If no parent path, just use item's basePath
    if (!parentBasePath) {
      return itemBasePath;
    }

    // Combine parent path with item's basePath
    const cleanParent = parentBasePath.endsWith('/')
      ? parentBasePath.slice(0, -1)
      : parentBasePath;
    const cleanItem = itemBasePath.startsWith('/')
      ? itemBasePath.slice(1)
      : itemBasePath;

    return `${cleanParent}/${cleanItem}`;
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

    // Use parent's accumulated basePath
    const effectiveBasePath = parentBasePath ?? '';

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
