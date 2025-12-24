import { Signal, Type } from '@angular/core';
import { EDrawerPosition, EDrawerSize } from '@shared/types/';

export interface IDrawerEvent {
  type: 'show' | 'hide' | 'visibleChange';
  visible?: boolean;
  componentData?: unknown;
}

export interface IDrawerConfig {
  header: string;
  subtitle: string;
  position: EDrawerPosition;
  component: Type<unknown>;
  componentData: unknown;
  showCloseIcon: boolean;
  modal: boolean;
  dismissible: boolean;
  closeOnEscape: boolean;
  fullScreen: boolean;
  closable: boolean;
  size?: EDrawerSize;
}

export interface IDrawerState {
  config: IDrawerConfig;
  visible: boolean;
}

export interface IEnhancedDrawer {
  config: Signal<IDrawerConfig>;
  visible: Signal<boolean>;
  show: (config: IDrawerConfig) => void;
  hide: () => void;
}

export interface IDrawerPageHeaderConfig {
  title: string;
  subtitle: string;
}
