import { Signal, Type } from '@angular/core';
import { EDrawerDetailType, EDrawerPosition } from '@shared/types/';

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

export interface IDrawerEmployeeDetails {
  name: string;
  employeeCode: string;
}

export interface IDrawerDetail {
  employeeDetails: IDrawerEmployeeDetails;
  status: {
    approvalStatus: string;
    entryType: string;
  };
  entryData: {
    label: string;
    value: string | null;
    type: EDrawerDetailType;
    format?: string;
  }[];
  approvalBy: {
    name: string | null;
    date: string | null;
    notes: string | null;
  };
  createdBy: {
    name: string | null;
    date: string;
    notes?: string;
  };
}
