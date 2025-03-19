import { PermissionType } from './permission.model';

/**
 * Interface for menu items
 */
export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  children?: MenuItem[];
  permissions?: PermissionType[];
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