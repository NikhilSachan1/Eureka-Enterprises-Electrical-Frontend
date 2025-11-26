import { IDrawerConfig } from '@shared/types/drawer/drawer.interface';
import { EDrawerPosition } from '@shared/types';

export const DEFAULT_DRAWER_CONFIG: Partial<IDrawerConfig> = {
  position: EDrawerPosition.RIGHT,
  showCloseIcon: true,
  modal: true,
  dismissible: true,
  closeOnEscape: true,
  fullScreen: false,
  closable: true,
};
