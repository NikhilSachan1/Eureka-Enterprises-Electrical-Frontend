import { inject, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApplicationMenu, MenuItem, MenuSection } from '../../shared/models';
import { appMenu } from '../config/menu.config';

@Injectable({
  providedIn: 'root'
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
   * Get menu sections
   */
  getMenuSections(): MenuSection[] {
    return this.menuState().sections;
  }

  /**
   * Check if a menu item is active based on current route
   * @param item Menu item to check
   */
  isMenuItemActive(item: MenuItem): boolean {
    const currentRoute = this.activeRoute();
    
    if (item.routerLink) {
      // Normalize routes by ensuring they start with /
      const normalizedCurrentRoute = currentRoute.startsWith('/') ? currentRoute : '/' + currentRoute;
      const normalizedItemRoute = item.routerLink.startsWith('/') ? item.routerLink : '/' + item.routerLink;
      
      // Exact match or starts with the route (for child routes)
      return normalizedCurrentRoute === normalizedItemRoute || 
             normalizedCurrentRoute.startsWith(normalizedItemRoute + '/');
    }

    if (item.children?.length) {
      return this.hasActiveChild(item);
    }

    return false;
  }

  /**
   * Toggle a menu item's expanded state
   * Ensures only one submenu is open at a time (accordion-like behavior)
   * @param item Menu item to toggle
   */
  toggleMenuItem(item: MenuItem): void {
    if (!item.children?.length) return;

    const itemId = this.getMenuItemId(item);
    const currentlyExpanded = this.isMenuItemExpanded(item);

    // Create a new Set for expanded items
    let newExpanded = new Set<string>();

    // If this item is not currently expanded, add only this item to the expanded set
    // Otherwise, leave the set empty to close all items
    if (!currentlyExpanded) {
      newExpanded.add(itemId);
      this.activeParentItem.set(itemId);
    } else {
      this.activeParentItem.set(null);
    }

    // Update the expanded items
    this.expandedItems.set(newExpanded);
  }

  /**
   * Check if a menu item is expanded
   * @param item Menu item to check
   */
  isMenuItemExpanded(item: MenuItem): boolean {
    if (!item.children?.length) return false;

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
   * Check if a parent menu item has an active child
   */
  private hasActiveChild(item: MenuItem): boolean {
    if (!item.children?.length) return false;

    const currentRoute = this.activeRoute();
    
    return item.children.some(child => {
      if (child.routerLink) {
        // Normalize routes by ensuring they start with /
        const normalizedCurrentRoute = currentRoute.startsWith('/') ? currentRoute : '/' + currentRoute;
        const normalizedChildRoute = child.routerLink.startsWith('/') ? child.routerLink : '/' + child.routerLink;
        
        // Exact match or starts with the route (for child routes)
        return normalizedCurrentRoute === normalizedChildRoute || 
               normalizedCurrentRoute.startsWith(normalizedChildRoute + '/');
      }

      if (child.children?.length) {
        return this.hasActiveChild(child);
      }

      return false;
    });
  }

  /**
   * Expand menu items based on the active route
   */
  private expandMenuForActiveRoute(): void {
    const newExpanded = new Set<string>();
    let foundActiveParent = false;

    // Function to recursively find and expand parents of active route
    const findActiveParents = (items: MenuItem[]): boolean => {
      const currentRoute = this.activeRoute();
      
      for (const item of items) {
        if (item.routerLink) {
          // Normalize routes by ensuring they start with /
          const normalizedCurrentRoute = currentRoute.startsWith('/') ? currentRoute : '/' + currentRoute;
          const normalizedItemRoute = item.routerLink.startsWith('/') ? item.routerLink : '/' + item.routerLink;
          
          if (normalizedCurrentRoute === normalizedItemRoute || normalizedCurrentRoute.startsWith(normalizedItemRoute + '/')) {
            return true;
          }
        }

        if (item.children?.length) {
          const hasActive = findActiveParents(item.children);
          if (hasActive && !foundActiveParent) {
            const itemId = this.getMenuItemId(item);
            newExpanded.add(itemId);
            this.activeParentItem.set(itemId);
            foundActiveParent = true;
            return true;
          }
        }
      }

      return false;
    };

    // Process all sections
    for (const section of this.menuState().sections) {
      findActiveParents(section.items);
    }

    this.expandedItems.set(newExpanded);
  }


} 