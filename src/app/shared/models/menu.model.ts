import { PermissionType } from './permission.model';

/**
 * Base menu item interface with common properties
 */
export interface BaseMenuItem {
  label: string;
  icon?: string;
  visible?: boolean;
  disabled?: boolean;
  permissions?: PermissionType[];
  data?: Record<string, any>;
}

/**
 * Menu item that serves as a link to a route
 */
export interface RouteMenuItem extends BaseMenuItem {
  type: 'route';
  routerLink: string;
  queryParams?: Record<string, any>;
  fragment?: string;
  preserveFragment?: boolean;
  skipLocationChange?: boolean;
  replaceUrl?: boolean;
}

/**
 * Menu item that contains submenu items
 */
export interface ParentMenuItem extends BaseMenuItem {
  type: 'parent';
  children: MenuItem[];
  expanded?: boolean;
}

/**
 * Menu item that serves as a separator/divider
 */
export interface SeparatorMenuItem {
  type: 'separator';
  label?: string;
}

/**
 * Menu item that serves as a group/category
 */
export interface GroupMenuItem extends BaseMenuItem {
  type: 'group';
  children: MenuItem[];
}

/**
 * Union type for all menu item types
 */
export type MenuItem = RouteMenuItem | ParentMenuItem | SeparatorMenuItem | GroupMenuItem;

/**
 * Interface representing an application menu section
 */
export interface MenuSection {
  label: string;
  items: MenuItem[];
}

/**
 * Interface representing the entire application menu
 */
export interface ApplicationMenu {
  sections: MenuSection[];
} 