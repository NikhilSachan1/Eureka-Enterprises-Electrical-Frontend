export interface ITabItem {
  route: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
  cssClass?: string;
  badge?: string | number;
  visible?: boolean;
} 