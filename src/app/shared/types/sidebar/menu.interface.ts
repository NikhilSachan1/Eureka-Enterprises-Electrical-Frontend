/**
 * Interface for menu items
 */
export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  children?: MenuItem[];
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
