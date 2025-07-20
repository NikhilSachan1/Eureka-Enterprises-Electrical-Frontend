import { IButtonConfig } from '@shared/models/button.model';

export interface IPageHeaderConfig {
  title: string;
  subtitle: string;
  showHeaderButton: boolean;
  headerButtonConfig?: Partial<IButtonConfig>;
}
