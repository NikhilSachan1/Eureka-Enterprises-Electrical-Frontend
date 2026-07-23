import { Injectable } from '@angular/core';
import {
  DEFAULT_CHECKBOX_INPUT_FIELD_CONFIG,
  DEFAULT_DATE_INPUT_FIELD_CONFIG,
  DEFAULT_FILE_INPUT_FIELD_CONFIG,
  DEFAULT_INDIVIDUAL_NUMBER_INPUT_FIELD_CONFIG,
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_AUTOCOMPLETE_INPUT_FIELD_CONFIG,
  DEFAULT_MULTI_SELECT_INPUT_FIELD_CONFIG,
  DEFAULT_NUMBER_INPUT_FIELD_CONFIG,
  DEFAULT_PASSWORD_INPUT_FIELD_CONFIG,
  DEFAULT_RADIO_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
  DEFAULT_TEXT_AREA_INPUT_FIELD_CONFIG,
  DEFAULT_TEXT_INPUT_FIELD_CONFIG,
} from '@shared/config';
import {
  EDataType,
  IFormInputFieldsConfig,
  IInputFieldsConfig,
  ILineItemsColumnFieldsConfig,
  ILineItemsTableColumn,
  ILineItemsTableConfig,
  IResolvedLineItemsTableConfig,
} from '@shared/types';
import { deepMerge } from '@shared/utility';

@Injectable({
  providedIn: 'root',
})
export class InputFieldConfigService {
  private readonly defaultInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_INPUT_FIELD_CONFIG;
  private readonly defaultNumberInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_NUMBER_INPUT_FIELD_CONFIG;
  private readonly defaultSelectInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_SELECT_INPUT_FIELD_CONFIG;
  private readonly defaultAutocompleteInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_AUTOCOMPLETE_INPUT_FIELD_CONFIG;
  private readonly defaultMultiSelectInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_MULTI_SELECT_INPUT_FIELD_CONFIG;
  private readonly defaultDateInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_DATE_INPUT_FIELD_CONFIG;
  private readonly defaultPasswordInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_PASSWORD_INPUT_FIELD_CONFIG;
  private readonly defaultCheckboxInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_CHECKBOX_INPUT_FIELD_CONFIG;
  private readonly defaultRadioInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_RADIO_INPUT_FIELD_CONFIG;
  private readonly defaultFileInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_FILE_INPUT_FIELD_CONFIG;
  private readonly defaultTextAreaInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_TEXT_AREA_INPUT_FIELD_CONFIG;
  private readonly defaultIndividualNumberInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_INDIVIDUAL_NUMBER_INPUT_FIELD_CONFIG;
  private readonly defaultTextInputFieldConfig: Partial<IInputFieldsConfig> =
    DEFAULT_TEXT_INPUT_FIELD_CONFIG;

  getInputFieldConfig(
    fieldType: EDataType = EDataType.TEXT,
    options?: Partial<IInputFieldsConfig>
  ): IInputFieldsConfig {
    const defaultConfig = this.getDefaultConfigByFieldType(fieldType);
    const mergedConfig = deepMerge(defaultConfig, options ?? {});
    return mergedConfig as IInputFieldsConfig;
  }

  initializeFieldConfigs(
    formInputFieldsConfig: IFormInputFieldsConfig<Record<string, unknown>>
  ): Record<string, IInputFieldsConfig> {
    const configs: Record<string, IInputFieldsConfig> = {};
    Object.keys(formInputFieldsConfig).forEach(key => {
      const fieldConfig = formInputFieldsConfig[key];
      const fieldName = fieldConfig.fieldName ?? key;
      configs[fieldName] = this.getInputFieldConfig(
        fieldConfig.fieldType as EDataType,
        fieldConfig
      );
    });
    return configs;
  }

  resolveLineItemsTableConfig<T extends Record<string, unknown>>(
    config: ILineItemsTableConfig<T>
  ): IResolvedLineItemsTableConfig {
    return {
      title: config.title ?? '',
      minRows: config.minRows ?? 0,
      addButton: config.addButton ?? {},
      removeButton: config.removeButton ?? {},
      columns: this.initializeLineItemsColumnConfigs(config.fields),
    };
  }

  buildLineItemCellFieldConfig(
    column: ILineItemsTableColumn,
    rowIndex: number
  ): IInputFieldsConfig {
    return {
      ...column.fieldConfig,
      id: `lineItem-${column.fieldName}-${rowIndex}`,
      fieldName: column.fieldName,
    } as IInputFieldsConfig;
  }

  initializeLineItemsColumnConfigs<T extends Record<string, unknown>>(
    fields: ILineItemsColumnFieldsConfig<T>
  ): ILineItemsTableColumn[] {
    return Object.entries(fields).map(([key, fieldConfig]) => {
      const fieldName = fieldConfig.fieldName ?? key;
      const headerLabel = fieldConfig.label ?? key;
      const fieldType = fieldConfig.fieldType ?? EDataType.TEXT;
      const { label, ...cellFieldConfig } = fieldConfig;
      void label;
      const resolvedFieldConfig = this.getLineItemCellFieldConfig(fieldType, {
        ...cellFieldConfig,
        fieldName,
      });

      return {
        fieldName,
        headerLabel,
        fieldConfig: resolvedFieldConfig,
        defaultValue:
          fieldConfig.defaultValue ?? this.getLineItemDefaultValue(fieldType),
      };
    });
  }

  private getLineItemCellFieldConfig(
    fieldType: EDataType,
    options?: Partial<IInputFieldsConfig>
  ): Partial<IInputFieldsConfig> {
    return this.getInputFieldConfig(fieldType, options);
  }

  private getLineItemDefaultValue(fieldType: EDataType): unknown {
    switch (fieldType) {
      case EDataType.NUMBER:
      case EDataType.SELECT:
      case EDataType.AUTOCOMPLETE:
        return null;
      case EDataType.MULTI_SELECT:
        return [];
      default:
        return '';
    }
  }

  private getDefaultConfigByFieldType(
    fieldType: EDataType
  ): Partial<IInputFieldsConfig> {
    switch (fieldType) {
      case EDataType.NUMBER:
        return this.defaultNumberInputFieldConfig;
      case EDataType.SELECT:
        return this.defaultSelectInputFieldConfig;
      case EDataType.AUTOCOMPLETE:
        return this.defaultAutocompleteInputFieldConfig;
      case EDataType.MULTI_SELECT:
        return this.defaultMultiSelectInputFieldConfig;
      case EDataType.DATE:
        return this.defaultDateInputFieldConfig;
      case EDataType.PASSWORD:
        return this.defaultPasswordInputFieldConfig;
      case EDataType.CHECKBOX:
        return this.defaultCheckboxInputFieldConfig;
      case EDataType.RADIO:
        return this.defaultRadioInputFieldConfig;
      case EDataType.ATTACHMENTS:
        return this.defaultFileInputFieldConfig;
      case EDataType.TEXT_AREA:
        return this.defaultTextAreaInputFieldConfig;
      case EDataType.INDIVIDUAL_NUMBER:
        return this.defaultIndividualNumberInputFieldConfig;
      case EDataType.TEXT:
        return this.defaultTextInputFieldConfig;
      case EDataType.LINE_ITEMS:
        return this.defaultInputFieldConfig;
      default:
        return this.defaultInputFieldConfig;
    }
  }
}
