import type { IButtonConfig } from '../button/button.interface';
import type { IInputFieldsConfig } from '../form/input-fields-config.interface';

export type ILineItemsColumnFieldsConfig<T extends Record<string, unknown>> = {
  [K in keyof T]: Partial<IInputFieldsConfig>;
};

export interface ILineItemsTableColumn {
  fieldName: string;
  headerLabel: string;
  fieldConfig: Partial<IInputFieldsConfig>;
  defaultValue: unknown;
}

export interface ILineItemsTableConfig<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  title?: string;
  fields: ILineItemsColumnFieldsConfig<T>;
  minRows?: number;
  addButton?: Partial<IButtonConfig>;
  removeButton?: Partial<IButtonConfig>;
}

export interface IResolvedLineItemsTableConfig {
  title: string;
  minRows: number;
  addButton: Partial<IButtonConfig>;
  removeButton: Partial<IButtonConfig>;
  columns: ILineItemsTableColumn[];
}
