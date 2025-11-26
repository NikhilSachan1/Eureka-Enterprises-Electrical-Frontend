import { Injectable } from '@angular/core';
import {
  DEFAULT_CHECKBOX_INPUT_FIELD_CONFIG,
  DEFAULT_DATE_INPUT_FIELD_CONFIG,
  DEFAULT_FILE_INPUT_FIELD_CONFIG,
  DEFAULT_INDIVIDUAL_NUMBER_INPUT_FIELD_CONFIG,
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_MULTI_SELECT_INPUT_FIELD_CONFIG,
  DEFAULT_NUMBER_INPUT_FIELD_CONFIG,
  DEFAULT_PASSWORD_INPUT_FIELD_CONFIG,
  DEFAULT_RADIO_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
  DEFAULT_TEXT_AREA_INPUT_FIELD_CONFIG,
} from '@shared/config';
import {
  IFormInputFieldsConfig,
  IInputFieldsConfig,
  EFieldType,
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

  getInputFieldConfig(
    fieldType: EFieldType = EFieldType.Text,
    options?: Partial<IInputFieldsConfig>
  ): IInputFieldsConfig {
    const defaultConfig = this.getDefaultConfigByFieldType(fieldType);
    const mergedConfig = deepMerge(defaultConfig, options ?? {});
    return mergedConfig as IInputFieldsConfig;
  }

  initializeFieldConfigs(
    formInputFieldsConfig: IFormInputFieldsConfig
  ): Record<string, IInputFieldsConfig> {
    const configs: Record<string, IInputFieldsConfig> = {};
    Object.keys(formInputFieldsConfig).forEach(key => {
      const fieldConfig = formInputFieldsConfig[key];
      configs[fieldConfig.fieldName ?? key] = this.getInputFieldConfig(
        fieldConfig.fieldType as EFieldType,
        fieldConfig
      );
    });
    return configs;
  }

  private getDefaultConfigByFieldType(
    fieldType: EFieldType
  ): Partial<IInputFieldsConfig> {
    switch (fieldType) {
      case EFieldType.Number:
        return this.defaultNumberInputFieldConfig;
      case EFieldType.Select:
        return this.defaultSelectInputFieldConfig;
      case EFieldType.MultiSelect:
        return this.defaultMultiSelectInputFieldConfig;
      case EFieldType.Date:
        return this.defaultDateInputFieldConfig;
      case EFieldType.Password:
        return this.defaultPasswordInputFieldConfig;
      case EFieldType.Checkbox:
        return this.defaultCheckboxInputFieldConfig;
      case EFieldType.Radio:
        return this.defaultRadioInputFieldConfig;
      case EFieldType.File:
        return this.defaultFileInputFieldConfig;
      case EFieldType.TextArea:
        return this.defaultTextAreaInputFieldConfig;
      case EFieldType.Individual_Number:
        return this.defaultIndividualNumberInputFieldConfig;
      default:
        return this.defaultInputFieldConfig;
    }
  }
}
