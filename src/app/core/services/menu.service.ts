import { computed, inject, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApplicationMenu, MenuItem, MenuSection } from '@shared/types';
import { appMenu } from '@core/config';
import { AppPermissionService } from './app-permission.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  // Use signals for reactive state management
  private readonly menuState = signal<ApplicationMenu>(appMenu);

  // Track the current active route
  private readonly activeRoute = signal<string>('');

  // Keep track of expanded menu items
  private readonly expandedItems = signal<Set<string>>(new Set());

  // Track the current active parent menu
  private readonly activeParentItem = signal<string | null>(null);

  private readonly router = inject(Router);
  private readonly appPermissionService = inject(AppPermissionService);

  // Filtered menu sections based on user permissions
  private readonly filteredMenuSections = computed(() => {
    // Get current permissions from the service
    const currentPermissions = this.appPermissionService.getPermissions();

    return this.menuState().sections.map(section => ({
      ...section,
      items: this.filterMenuItemsByPermission(
        section.items,
        currentPermissions
      ),
    }));
  });

  constructor() {
    // Set initial active route on service initialization
    this.activeRoute.set(this.router.url);
    this.expandMenuForActiveRoute();

    // Listen to route changes to update active route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.activeRoute.set(this.router.url);
        this.expandMenuForActiveRoute();
      });
  }

  /**
   * Get menu sections filtered by user permissions
   */
  getMenuSections(): MenuSection[] {
    return this.filteredMenuSections();
  }

  /**
   * Recursively filter menu items based on user permissions
   * If a parent has no permission, it's shown if any child has permission
   * If a parent has a permission, user must have that permission
   * @param items Menu items to filter
   * @param permissions Current user permissions array
   */
  private filterMenuItemsByPermission(
    items: MenuItem[],
    permissions: string[]
  ): MenuItem[] {
    return items
      .map(item => {
        // If item has children, recursively filter them first
        if (item.children?.length) {
          const filteredChildren = this.filterMenuItemsByPermission(
            item.children,
            permissions
          );

          // If no children remain after filtering, check parent permission
          if (filteredChildren.length === 0) {
            // No accessible children - hide the parent
            return null;
          }

          // If parent has permission requirement, check if user has any of them
          if (item.permission && item.permission.length > 0) {
            const hasAnyPermission = item.permission.some(p =>
              permissions.includes(p)
            );
            if (!hasAnyPermission) {
              // Parent permission denied - hide even if children exist
              return null;
            }
          }

          // Return item with filtered children
          return {
            ...item,
            children: filteredChildren,
          };
        }

        // Leaf item - check if user has any of the required permissions
        if (item.permission && item.permission.length > 0) {
          const hasAnyPermission = item.permission.some(p =>
            permissions.includes(p)
          );
          if (!hasAnyPermission) {
            return null;
          }
        }

        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  /**
   * Check if a menu item is active based on current route
   * Uses accumulated base path for proper matching at any level
   * @param item Menu item to check
   * @param accumulatedBasePath The accumulated base path from parent items
   */
  isMenuItemActive(item: MenuItem, accumulatedBasePath = ''): boolean {
    const currentRoute = this.activeRoute();
    const normalizedCurrentRoute = currentRoute.startsWith('/')
      ? currentRoute
      : `/${currentRoute}`;

    // Calculate the full accumulated path for this item
    const itemAccumulatedPath = this.accumulateBasePath(
      accumulatedBasePath,
      item.basePath
    );

    if (item.routerLink) {
      // Build full route with accumulated path
      let fullItemRoute = item.routerLink;

      if (itemAccumulatedPath) {
        const childPath = item.routerLink.startsWith('/')
          ? item.routerLink.slice(1)
          : item.routerLink;
        fullItemRoute = `${itemAccumulatedPath}/${childPath}`;
      }

      const normalizedItemRoute = fullItemRoute.startsWith('/')
        ? fullItemRoute
        : `/${fullItemRoute}`;

      // Exact match or starts with the route (for child routes)
      return (
        normalizedCurrentRoute === normalizedItemRoute ||
        normalizedCurrentRoute.startsWith(`${normalizedItemRoute}/`)
      );
    }

    // For parent items with children, check if any child is active
    if (item.children?.length) {
      return this.hasActiveChild(item, accumulatedBasePath);
    }

    return false;
  }

  /**
   * Toggle a menu item's expanded state
   * Top-level items use accordion behavior (only one open at a time)
   * Nested items can be opened independently within their parent
   * @param item Menu item to toggle
   * @param isNested Whether this is a nested (Level 2+) item
   */
  toggleMenuItem(item: MenuItem, isNested = false): void {
    if (!item.children?.length) {
      return;
    }

    const itemId = this.getMenuItemId(item);
    const currentlyExpanded = this.isMenuItemExpanded(item);
    const currentExpanded = this.expandedItems();

    if (isNested) {
      // For nested items: toggle without closing parent or siblings
      const newExpanded = new Set(currentExpanded);
      if (currentlyExpanded) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      this.expandedItems.set(newExpanded);
    } else {
      // For top-level items: accordion behavior (close others at same level)
      const newExpanded = new Set<string>();

      if (!currentlyExpanded) {
        newExpanded.add(itemId);
        this.activeParentItem.set(itemId);
      } else {
        this.activeParentItem.set(null);
      }

      this.expandedItems.set(newExpanded);
    }
  }

  /**
   * Check if a menu item is expanded
   * @param item Menu item to check
   */
  isMenuItemExpanded(item: MenuItem): boolean {
    if (!item.children?.length) {
      return false;
    }

    const itemId = this.getMenuItemId(item);
    return this.expandedItems().has(itemId);
  }

  /**
   * Close all menu items
   */
  closeAllMenuItems(): void {
    this.expandedItems.set(new Set());
    this.activeParentItem.set(null);
  }

  /**
   * Generate a unique ID for a menu item
   */
  private getMenuItemId(item: MenuItem): string {
    if (item.routerLink) {
      return `route_${item.routerLink}`;
    }

    if (item.children?.length) {
      return `parent_${item.label}`;
    }

    return `item_${item.label}_${Math.random()}`;
  }

  /**
   * Accumulate base paths from parent to child
   * Combines parent's accumulated path with current item's basePath
   */
  private accumulateBasePath(
    parentBasePath: string | undefined,
    itemBasePath: string | undefined
  ): string {
    if (!itemBasePath) {
      return parentBasePath ?? '';
    }

    if (!parentBasePath) {
      return itemBasePath;
    }

    const cleanParent = parentBasePath.endsWith('/')
      ? parentBasePath.slice(0, -1)
      : parentBasePath;
    const cleanItem = itemBasePath.startsWith('/')
      ? itemBasePath.slice(1)
      : itemBasePath;

    return `${cleanParent}/${cleanItem}`;
  }

  /**
   * Check if a parent menu item has an active child
   * Uses accumulated base path for proper matching
   */
  private hasActiveChild(
    item: MenuItem,
    accumulatedBasePath?: string
  ): boolean {
    if (!item.children?.length) {
      return false;
    }

    const currentRoute = this.activeRoute();
    const normalizedCurrentRoute = currentRoute.startsWith('/')
      ? currentRoute
      : `/${currentRoute}`;

    // Calculate accumulated path for this item
    const itemAccumulatedPath = this.accumulateBasePath(
      accumulatedBasePath,
      item.basePath
    );

    // Check if accumulated basePath matches current route
    if (itemAccumulatedPath) {
      const normalizedBasePath = itemAccumulatedPath.startsWith('/')
        ? itemAccumulatedPath
        : `/${itemAccumulatedPath}`;
      if (
        normalizedCurrentRoute === normalizedBasePath ||
        normalizedCurrentRoute.startsWith(`${normalizedBasePath}/`)
      ) {
        return true;
      }
    }

    return item.children.some(child => {
      if (child.routerLink) {
        // Build full route with accumulated path
        let fullChildRoute = child.routerLink;
        if (itemAccumulatedPath) {
          const childPath = child.routerLink.startsWith('/')
            ? child.routerLink.slice(1)
            : child.routerLink;
          fullChildRoute = `${itemAccumulatedPath}/${childPath}`;
        }

        const normalizedChildRoute = fullChildRoute.startsWith('/')
          ? fullChildRoute
          : `/${fullChildRoute}`;

        return (
          normalizedCurrentRoute === normalizedChildRoute ||
          normalizedCurrentRoute.startsWith(`${normalizedChildRoute}/`)
        );
      }

      if (child.children?.length) {
        return this.hasActiveChild(child, itemAccumulatedPath);
      }

      return false;
    });
  }

  /**
   * Expand menu items based on the active route
   * Expands all parent levels (Level 1, Level 2, etc.) for the active route
   */
  private expandMenuForActiveRoute(): void {
    const newExpanded = new Set<string>();
    const currentRoute = this.activeRoute();
    const normalizedCurrentRoute = currentRoute.startsWith('/')
      ? currentRoute
      : `/${currentRoute}`;

    /**
     * Recursively find active route and expand all parent items
     * Uses accumulated base path for proper matching
     * Returns true if an active route was found in this branch
     */
    const findAndExpandParents = (
      items: MenuItem[],
      accumulatedBasePath: string
    ): boolean => {
      for (const item of items) {
        // Accumulate the base path for this item
        const itemAccumulatedPath = this.accumulateBasePath(
          accumulatedBasePath,
          item.basePath
        );

        // Check if this item's route matches
        if (item.routerLink) {
          let fullRoute = item.routerLink;

          // Combine with accumulated base path
          if (itemAccumulatedPath) {
            const childPath = item.routerLink.startsWith('/')
              ? item.routerLink.slice(1)
              : item.routerLink;
            fullRoute = `${itemAccumulatedPath}/${childPath}`;
          }

          const normalizedRoute = fullRoute.startsWith('/')
            ? fullRoute
            : `/${fullRoute}`;

          if (
            normalizedCurrentRoute === normalizedRoute ||
            normalizedCurrentRoute.startsWith(`${normalizedRoute}/`)
          ) {
            return true;
          }
        }

        // Check children recursively with accumulated path
        if (item.children?.length) {
          const hasActiveChild = findAndExpandParents(
            item.children,
            itemAccumulatedPath
          );

          if (hasActiveChild) {
            // Expand this parent item
            const itemId = this.getMenuItemId(item);
            newExpanded.add(itemId);

            // Set active parent only for top-level items
            if (!accumulatedBasePath) {
              this.activeParentItem.set(itemId);
            }

            return true;
          }
        }

        // Check accumulated basePath match for parent items without direct routerLink
        if (itemAccumulatedPath && !item.routerLink && item.children?.length) {
          const normalizedBasePath = itemAccumulatedPath.startsWith('/')
            ? itemAccumulatedPath
            : `/${itemAccumulatedPath}`;

          if (
            normalizedCurrentRoute === normalizedBasePath ||
            normalizedCurrentRoute.startsWith(`${normalizedBasePath}/`)
          ) {
            const itemId = this.getMenuItemId(item);
            newExpanded.add(itemId);

            if (!accumulatedBasePath) {
              this.activeParentItem.set(itemId);
            }

            return true;
          }
        }
      }

      return false;
    };

    // Process all sections with empty initial path
    for (const section of this.menuState().sections) {
      findAndExpandParents(section.items, '');
    }

    this.expandedItems.set(newExpanded);
  }
}
