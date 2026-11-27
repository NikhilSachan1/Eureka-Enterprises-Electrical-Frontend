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
  /**
   * Page search only — never drawn in the sidebar. Tabs inside this page (e.g. My Assets,
   * PO, JMC). Each tab's `routerLink` is relative to this item's page; a content tab that
   * is picked by `?tab=` sets `queryParams` instead (or as well). Tabs may nest.
   */
  searchTabs?: MenuItem[];
  /** Query params appended to the link (used by `searchTabs` entries). */
  queryParams?: Record<string, string>;
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
