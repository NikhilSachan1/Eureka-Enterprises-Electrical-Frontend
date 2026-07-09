import { IButtonConfig } from '@shared/types/button/button.interface';

export interface IPageHeaderConfig {
  title: string;
  subtitle: string;
  showHeaderButton?: boolean;
  headerButtonConfig?: Partial<IButtonConfig>[];
  showGoBackButton?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showHeaderFilter?: boolean;
}

export interface ISectionHeaderConfig {
  title: string;
  subtitle: string;
  icon: string;
}
