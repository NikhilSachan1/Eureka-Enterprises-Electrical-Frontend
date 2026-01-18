import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  effect,
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { PopoverModule, Popover } from 'primeng/popover';
import { MenuService } from '@core/services';
import { slideInOut } from '@shared/animations';
import { MenuItem } from '@shared/types';
import { ICONS } from '@shared/constants';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, PopoverModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  animations: [slideInOut],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMenuComponent {
  readonly menuService = inject(MenuService);
  readonly router = inject(Router);
  readonly icons = ICONS;

  // Input to know if sidebar is collapsed (for popover display)
  isCollapsed = input<boolean>(false);

  // Track popover hide timeout
  private popoverHideTimeout: ReturnType<typeof setTimeout> | null = null;

  // Store popover references by menu item ID
  private popoverRefs = new Map<string, Popover>();

  // Track which popovers have been registered to avoid re-registration
  private registeredPopovers = new Set<string>();

  constructor() {
    // Watch for collapsed state changes and reset popover registrations
    effect(() => {
      // When collapsed state changes, clear all registrations and references
      // This ensures popovers can re-register when sidebar state changes
      this.registeredPopovers.clear();
      this.popoverRefs.clear();
      this.closeAllPopovers();

      // Clear any pending hide timeout
      if (this.popoverHideTimeout) {
        clearTimeout(this.popoverHideTimeout);
        this.popoverHideTimeout = null;
      }
    });
  }

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

  /**
   * Handle submenu item click in popover
   */
  protected onSubmenuItemClick(
    child: MenuItem,
    parentBasePath: string | null
  ): void {
    const fullPath = this.getFullRouterLink(child, parentBasePath);
    if (fullPath) {
      void this.router.navigate([fullPath]);
      this.closeAllSubmenus();
    }
  }

  /**
   * Register popover reference for a menu item
   * Returns empty string to avoid rendering anything
   */
  protected registerPopover(
    itemId: string,
    popover: Popover | undefined
  ): string {
    if (popover) {
      // Always update the reference, even if already registered
      // This ensures we have the latest popover instance
      this.popoverRefs.set(itemId, popover);
      this.registeredPopovers.add(itemId);
    }
    return '';
  }

  /**
   * Get popover reference for a menu item
   */
  protected getPopover(itemId: string): Popover | undefined {
    return this.popoverRefs.get(itemId);
  }

  /**
   * Handle mouse enter on parent button
   */
  protected onParentMouseEnter(
    event: MouseEvent,
    target: HTMLElement,
    itemId: string
  ): void {
    if (this.popoverHideTimeout) {
      clearTimeout(this.popoverHideTimeout);
      this.popoverHideTimeout = null;
    }

    // Close all nested menus first when switching to a different parent
    this.closeAllSubmenus();

    // Close all other popovers first
    this.closeAllPopoversExcept(itemId);

    const popover = this.getPopover(itemId);
    if (popover && target) {
      // Use PrimeNG's native show method - let it handle positioning
      popover.show(event, target);
    }
  }

  /**
   * Close all popovers except the one with the given itemId
   */
  private closeAllPopoversExcept(currentItemId: string): void {
    this.popoverRefs.forEach((popover, itemId) => {
      if (itemId !== currentItemId) {
        popover.hide();
      }
    });
  }

  /**
   * Close all popovers
   */
  private closeAllPopovers(): void {
    // Close via PrimeNG API
    this.popoverRefs.forEach(popover => {
      popover.hide();
    });

    // Also hide all popovers in DOM to ensure they're closed
    setTimeout(() => {
      const popoverElements = document.querySelectorAll('.p-popover');
      popoverElements.forEach((el: Element) => {
        (el as HTMLElement).style.display = 'none';
      });
    }, 0);
  }

  /**
   * Handle mouse leave on parent button with delay
   */
  protected onParentMouseLeave(itemId: string): void {
    if (this.popoverHideTimeout) {
      clearTimeout(this.popoverHideTimeout);
    }
    this.popoverHideTimeout = setTimeout(() => {
      const popover = this.getPopover(itemId);
      if (popover) {
        popover.hide();
      }
      this.popoverHideTimeout = null;
    }, 100);
  }

  /**
   * Handle mouse enter on popover content
   */
  protected onPopoverMouseEnter(_itemId: string): void {
    if (this.popoverHideTimeout) {
      clearTimeout(this.popoverHideTimeout);
      this.popoverHideTimeout = null;
    }
  }
}
