/**
 * Interface representing a menu item in the sidebar
 * Supports nested menu items through the items property
 */
export interface SidebarMenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  items?: SidebarMenuItem[];
  expanded?: boolean;
}
