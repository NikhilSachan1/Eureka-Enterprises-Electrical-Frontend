/**
 * Interface for menu items
 */
export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  children?: MenuItem[];
  basePath?: string; // Base path for parent items to match child routes (e.g., '/asset' matches '/asset/event-history/:id')
  permission?: string[]; // Permissions required - item shows if user has ANY of these
}

/**
 * Interface representing an application menu section
 */
export interface MenuSection {
  label?: string;
  items: MenuItem[];
}

/**
 * Interface representing the entire application menu
 */
export interface ApplicationMenu {
  sections: MenuSection[];
}
