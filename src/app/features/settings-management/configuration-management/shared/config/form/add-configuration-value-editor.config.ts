import { Validators } from '@angular/forms';
import {
  DEFAULT_DATE_INPUT_FIELD_CONFIG,
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_NUMBER_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
} from '@shared/config/input-field.config';
import { CONFIGURATION_TYPE_DATA } from '@shared/config/static-data.config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonIconPosition,
  EButtonSeverity,
  EButtonVariant,
  EDataType,
  EFieldSize,
  IButtonConfig,
  IInputFieldsConfig,
  IOptionDropdown,
} from '@shared/types';

export function mapConfigurationTypeOptionsToValueEditorKinds(
  options: IOptionDropdown[]
): IOptionDropdown[] {
  return options.map(opt => {
    const v = String(opt.value).toLowerCase();
    if (v === 'json') {
      return { ...opt, value: 'object' };
    }
    return opt;
  });
}

export const ADD_CONFIGURATION_VALUE_KIND_FALLBACK_OPTIONS: IOptionDropdown[] =
  mapConfigurationTypeOptionsToValueEditorKinds(CONFIGURATION_TYPE_DATA);

export const ADD_CONFIGURATION_VALUE_KIND_PRIMITIVE_ONLY: readonly string[] = [
  'string',
  'number',
  'boolean',
  'date',
];

export const ADD_CONFIGURATION_VALUE_EDITOR_DEFAULT_MAX_DEPTH = 8;

export const ADD_CONFIGURATION_VALUE_EDITOR_LABELS = {
  kindSelect: 'Value type',
  stringValue: 'Text value',
  numberValue: 'Number value',
  dateValue: 'Date value',
  booleanCheckbox: 'Yes / true',
  objectKey: 'Property name',
} as const;

export const ADD_CONFIGURATION_VALUE_EDITOR_HINTS = {
  emptyObject:
    'No properties yet. Add a property name and choose a type for each value.',
  emptyArray: 'Empty list. Add items and pick a type for each.',
} as const;

export const ADD_CONFIGURATION_VALUE_EDITOR_COLLECTION_ACTIONS = {
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
} as const;

export const ADD_CONFIGURATION_VALUE_EDITOR_BUTTONS: {
  addObjectRow: Partial<IButtonConfig>;
  addArrayItem: Partial<IButtonConfig>;
  removeRow: Partial<IButtonConfig>;
} = {
  addObjectRow: {
    id: EButtonActionType.GENERATE,
    type: 'button',
    label: 'Add property',
    tooltip: 'Add a key / value pair',
    icon: ICONS.COMMON.PLUS,
    iconPosition: EButtonIconPosition.LEFT,
    severity: EButtonSeverity.SECONDARY,
    variant: EButtonVariant.OUTLINED,
    actionName: 'addObjectRow',
  },
  addArrayItem: {
    id: EButtonActionType.GENERATE,
    type: 'button',
    label: 'Add item',
    tooltip: 'Add an item to this list',
    icon: ICONS.COMMON.PLUS,
    iconPosition: EButtonIconPosition.LEFT,
    severity: EButtonSeverity.SECONDARY,
    variant: EButtonVariant.OUTLINED,
    actionName: 'addArrayItem',
  },
  removeRow: {
    id: EButtonActionType.DELETE,
    type: 'button',
    label: '',
    tooltip: 'Remove',
    icon: ICONS.ACTIONS.TRASH,
    iconPosition: EButtonIconPosition.LEFT,
    severity: EButtonSeverity.SECONDARY,
    variant: EButtonVariant.OUTLINED,
    actionName: 'removeRow',
  },
};

export function filterAddConfigurationValueKindOptions(
  depth: number,
  maxDepth: number,
  allOptions: IOptionDropdown[]
): IOptionDropdown[] {
  if (depth >= maxDepth - 1) {
    return allOptions.filter(o =>
      ADD_CONFIGURATION_VALUE_KIND_PRIMITIVE_ONLY.includes(String(o.value))
    );
  }
  return allOptions;
}

export function buildAddConfigurationKindSelectFieldConfig(ctx: {
  rowKey: string;
  depth: number;
  options: IOptionDropdown[];
}): IInputFieldsConfig {
  return {
    ...DEFAULT_SELECT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: `cfg-kind-${ctx.rowKey}-${ctx.depth}`,
    fieldName: 'kind',
    label: ADD_CONFIGURATION_VALUE_EDITOR_LABELS.kindSelect,
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      optionsDropdown: ctx.options,
    },
    validators: [Validators.required],
  } as IInputFieldsConfig;
}

export function buildAddConfigurationStringValueFieldConfig(ctx: {
  rowKey: string;
  depth: number;
}): IInputFieldsConfig {
  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.TEXT,
    id: `cfg-str-${ctx.rowKey}-${ctx.depth}`,
    fieldName: 'stringValue',
    label: ADD_CONFIGURATION_VALUE_EDITOR_LABELS.stringValue,
    validators: [Validators.required],
  } as IInputFieldsConfig;
}

export function buildAddConfigurationNumberValueFieldConfig(ctx: {
  rowKey: string;
  depth: number;
}): IInputFieldsConfig {
  return {
    ...DEFAULT_NUMBER_INPUT_FIELD_CONFIG,
    fieldType: EDataType.NUMBER,
    id: `cfg-num-${ctx.rowKey}-${ctx.depth}`,
    fieldName: 'numberValue',
    label: ADD_CONFIGURATION_VALUE_EDITOR_LABELS.numberValue,
    validators: [Validators.required],
  } as IInputFieldsConfig;
}

export function buildAddConfigurationDateValueFieldConfig(ctx: {
  rowKey: string;
  depth: number;
}): IInputFieldsConfig {
  return {
    ...DEFAULT_DATE_INPUT_FIELD_CONFIG,
    fieldType: EDataType.DATE,
    id: `cfg-date-${ctx.rowKey}-${ctx.depth}`,
    fieldName: 'dateValue',
    label: ADD_CONFIGURATION_VALUE_EDITOR_LABELS.dateValue,
    readonlyInput: false,
    validators: [Validators.required],
  } as IInputFieldsConfig;
}

export function buildAddConfigurationBooleanValueFieldConfig(ctx: {
  rowKey: string;
  depth: number;
}): IInputFieldsConfig {
  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.CHECKBOX,
    id: `cfg-bool-${ctx.rowKey}-${ctx.depth}`,
    fieldName: 'boolValue',
    fieldSize: EFieldSize.Large,
    checkboxConfig: {
      options: [
        {
          label: ADD_CONFIGURATION_VALUE_EDITOR_LABELS.booleanCheckbox,
          value: 'boolValue',
        },
      ],
      binary: true,
    },
    validators: [Validators.required],
  } as IInputFieldsConfig;
}

export function buildAddConfigurationObjectKeyFieldConfig(ctx: {
  rowKey: string;
  depth: number;
  index: number;
}): IInputFieldsConfig {
  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.TEXT,
    id: `cfg-obj-key-${ctx.rowKey}-${ctx.depth}-${ctx.index}`,
    fieldName: 'objectKey',
    label: ADD_CONFIGURATION_VALUE_EDITOR_LABELS.objectKey,
    validators: [Validators.required],
  } as IInputFieldsConfig;
}
