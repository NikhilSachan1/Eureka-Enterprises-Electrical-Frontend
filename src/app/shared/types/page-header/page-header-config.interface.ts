import { IButtonConfig } from '@shared/types/button/button.interface';

export interface IPageHeaderConfig {
  title: string;
  subtitle: string;
  showHeaderButton: boolean;
  headerButtonConfig?: Partial<IButtonConfig>;
  showGoBackButton?: boolean;
}
