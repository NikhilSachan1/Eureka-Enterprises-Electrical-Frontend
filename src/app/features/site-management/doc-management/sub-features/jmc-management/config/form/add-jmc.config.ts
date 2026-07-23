import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  CONFIGURATION_KEYS,
  ICONS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import { DEFAULT_BUTTON_CONFIG } from '@shared/config';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  EDataType,
  ETextCase,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddJmcUIFormDto } from '../../types/jmc.dto';

const ADD_JMC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddJmcUIFormDto> = {
  projectName: {
    fieldType: EDataType.SELECT,
    id: 'projectName',
    fieldName: 'projectName',
    label: 'Project Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.PROJECT,
        dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
      },
    },
    validators: [Validators.required],
  },
  poNumber: {
    fieldType: EDataType.SELECT,
    id: 'poNumber',
    fieldName: 'poNumber',
    label: 'PO Number',
    selectConfig: {
      optionsDropdown: [],
      dependentDropdown: {
        dependsOnField: 'projectName',
        dependsOnFieldLabel: 'a project',
      },
    },
    validators: [Validators.required],
  },
  jmcNumber: {
    fieldType: EDataType.TEXT,
    id: 'jmcNumber',
    fieldName: 'jmcNumber',
    label: 'JMC Number',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => !context['isSystemGenerated'],
        validators: [Validators.required],
      },
    ],
  },
  jmcDate: {
    fieldType: EDataType.DATE,
    id: 'jmcDate',
    fieldName: 'jmcDate',
    label: 'JMC Date',
    dateConfig: {
      maxDate: new Date(),
      touchUI: false,
    },
    validators: [Validators.required],
  },
  jmcAttachment: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'jmcAttachment',
    fieldName: 'jmcAttachment',
    label: 'JMC Attachments',
    fileConfig: {
      fileLimit: 1,
      acceptFileTypes: [
        ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
        ...APP_CONFIG.MEDIA_CONFIG.PDF,
      ],
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => !context['isSystemGenerated'],
        validators: [Validators.required],
      },
    ],
  },
  items: {
    fieldType: EDataType.LINE_ITEMS,
    id: 'items',
    fieldName: 'items',
    label: 'Line items',
    lineItemsConfig: {
      title: 'Line items',
      minRows: 1,
      addButton: {
        ...DEFAULT_BUTTON_CONFIG,
        id: EButtonActionType.ADD,
        label: 'Add item',
        tooltip: 'Add a line item',
        icon: ICONS.COMMON.PLUS,
        variant: EButtonVariant.OUTLINED,
      },
      removeButton: {
        ...DEFAULT_BUTTON_CONFIG,
        id: EButtonActionType.DELETE,
        label: '',
        tooltip: 'Remove item',
        icon: ICONS.ACTIONS.TRASH,
        severity: EButtonSeverity.DANGER,
        variant: EButtonVariant.TEXT,
      },
      fields: {
        itemName: {
          fieldType: EDataType.TEXT,
          label: 'Item name',
          showStandardLabel: true,
          placeholder: 'Item name',
          validators: [Validators.required],
        },
        unit: {
          fieldType: EDataType.SELECT,
          label: 'Unit',
          showStandardLabel: true,
          placeholder: 'Unit',
          defaultValue: null,
          selectConfig: {
            optionsDropdown: [
              { label: 'Nos', value: 'Nos' },
              { label: 'Set', value: 'set' },
            ],
          },
          validators: [Validators.required],
        },
        quantity: {
          fieldType: EDataType.NUMBER,
          label: 'Quantity',
          placeholder: 'Quantity',
          showStandardLabel: true,
          validators: [Validators.required, Validators.min(1)],
        },
      },
    },
  },
  remarks: {
    fieldType: EDataType.TEXT_AREA,
    id: 'remarks',
    fieldName: 'remarks',
    label: 'Remarks',
  },
};

export const ADD_JMC_FORM_CONFIG: IFormConfig<IAddJmcUIFormDto> = {
  fields: ADD_JMC_FORM_FIELDS_CONFIG,
};
