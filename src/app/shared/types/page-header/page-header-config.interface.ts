import { IButtonConfig } from '@shared/types/button/button.interface';

export interface IPageHeaderConfig {
  title: string;
  subtitle: string;
  showHeaderButton?: boolean;
  headerButtonConfig?: IPageHeaderButtonConfig[];
  showGoBackButton?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showHeaderFilter?: boolean;
  /** Defaults to true. Set false on pages where the bell is not wanted (e.g. Preferences). */
  showNotificationBell?: boolean;
}

export interface IPageHeaderButtonConfig extends Partial<IButtonConfig> {
  /**
   * Also offer this button in the page table's "no records yet" state (e.g. "Add Asset").
   * Only the first permitted button with this flag is used.
   */
  showInEmptyState?: boolean;
}

/** The page's main action, shown by a data table when it has no records at all. */
export interface IPageEmptyStateAction {
  button: IPageHeaderButtonConfig;
  run: () => void;
}

export interface ISectionHeaderConfig {
  title: string;
  subtitle: string;
  icon: string;
}
