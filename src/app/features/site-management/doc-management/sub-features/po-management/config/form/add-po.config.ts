import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  MODULE_NAMES,
  CONFIGURATION_KEYS,
  TEXT_INPUT_ACCEPT_STRIP,
  ICONS,
} from '@shared/constants';
import { DEFAULT_BUTTON_CONFIG } from '@shared/config';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IAddPoUIFormDto } from '../../types/po.dto';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const ADD_PO_DEFAULT_GST_PERCENT = 18;
export const ADD_PO_DEFAULT_GST_TYPE = 'CGST_SGST';

const ADD_PO_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddPoUIFormDto> = {
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
  contractorName: {
    fieldType: EDataType.SELECT,
    id: 'contractorName',
    fieldName: 'contractorName',
    label: 'Contractor Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.CONTRACTOR,
        dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
      },
      dependentDropdown: {
        dependsOnField: 'projectName',
        dependsOnFieldLabel: 'a project',
      },
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          return context.docContext === EDocContext.SALES;
        },
        validators: [Validators.required],
      },
    ],
  },
  vendorName: {
    fieldType: EDataType.SELECT,
    id: 'vendorName',
    fieldName: 'vendorName',
    label: 'Vendor Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VENDOR,
        dropdownName: CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
      },
      dependentDropdown: {
        dependsOnField: 'projectName',
        dependsOnFieldLabel: 'a project',
      },
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          return context.docContext === EDocContext.PURCHASE;
        },
        validators: [Validators.required],
      },
    ],
  },
  poNumber: {
    fieldType: EDataType.TEXT,
    id: 'poNumber',
    fieldName: 'poNumber',
    label: 'PO Number',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
      regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
    },
    disabledWhen: (context): boolean => !!context?.['isSystemGenerated'],
    conditionalValidators: [
      {
        shouldApply: (context): boolean => !context['isSystemGenerated'],
        validators: [Validators.required],
      },
    ],
  },
  poDate: {
    fieldType: EDataType.DATE,
    id: 'poDate',
    fieldName: 'poDate',
    label: 'PO Date',
    dateConfig: {
      maxDate: new Date(),
      touchUI: false,
    },
    validators: [Validators.required],
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
          fieldType: EDataType.AUTOCOMPLETE,
          label: 'Item name',
          showStandardLabel: true,
          placeholder: 'Search item name',
          columnWidth: 'minmax(14rem, 2.6fr)',
          autocompleteConfig: {
            optionsDropdown: [],
            optionValue: 'label',
          },
          validators: [Validators.required, Validators.maxLength(255)],
        },
        make: {
          fieldType: EDataType.TEXT,
          label: 'Make / Source',
          showStandardLabel: true,
          placeholder: 'Make / Source',
          columnWidth: 'minmax(12rem, 2fr)',
          validators: [Validators.maxLength(255)],
        },
        hsnCode: {
          fieldType: EDataType.TEXT,
          label: 'HSN',
          showStandardLabel: true,
          placeholder: 'HSN',
          columnWidth: '5.5rem',
          validators: [Validators.maxLength(20)],
        },
        quantity: {
          fieldType: EDataType.NUMBER,
          label: 'Qty',
          placeholder: 'Qty',
          showStandardLabel: true,
          columnWidth: '5.5rem',
          numberConfig: {
            mode: EInputNumberMode.Decimal,
            allowNumberFormatting: false,
            maximumFractionDigits: 3,
          },
          validators: [Validators.required, Validators.min(0)],
        },
        unit: {
          fieldType: EDataType.SELECT,
          label: 'Unit',
          showStandardLabel: true,
          placeholder: 'Unit',
          columnWidth: '6.5rem',
          selectConfig: {
            showClearButton: false,
            dynamicDropdown: {
              moduleName: MODULE_NAMES.PURCHASE_ORDER,
              dropdownName: CONFIGURATION_KEYS.PURCHASE_ORDER.UNITS,
            },
          },
          validators: [Validators.required],
        },
        rate: {
          fieldType: EDataType.NUMBER,
          label: 'Rate',
          placeholder: 'Rate',
          showStandardLabel: true,
          columnWidth: '7rem',
          numberConfig: {
            mode: EInputNumberMode.Currency,
            currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
            maximumFractionDigits: 2,
          },
          validators: [Validators.required, Validators.min(0)],
        },
        amount: {
          fieldType: EDataType.NUMBER,
          label: 'Amount',
          placeholder: 'Amount',
          showStandardLabel: true,
          readonlyInput: true,
          columnWidth: '7.5rem',
          numberConfig: {
            mode: EInputNumberMode.Currency,
            currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
            minimumBoundaryValue: 0,
            maximumFractionDigits: 2,
          },
          validators: [Validators.required, Validators.min(0)],
        },
      },
    },
  },
  taxableAmount: {
    fieldType: EDataType.NUMBER,
    id: 'taxableAmount',
    fieldName: 'taxableAmount',
    label: 'PO Taxable Amount',
    readonlyWhen: (context): boolean => !!context?.['isSystemGenerated'],
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => !context['isSystemGenerated'],
        validators: [Validators.required, Validators.min(1)],
      },
    ],
  },
  gstType: {
    fieldType: EDataType.SELECT,
    id: 'gstType',
    fieldName: 'gstType',
    label: 'GST type',
    defaultValue: ADD_PO_DEFAULT_GST_TYPE,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.PURCHASE_ORDER,
        dropdownName: CONFIGURATION_KEYS.PURCHASE_ORDER.GST_TYPES,
      },
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean => !!context['isSystemGenerated'],
        validators: [Validators.required],
      },
    ],
  },
  gstPercent: {
    fieldType: EDataType.NUMBER,
    id: 'gstPercent',
    fieldName: 'gstPercent',
    label: 'GST %',
    defaultValue: ADD_PO_DEFAULT_GST_PERCENT,
    numberConfig: {
      mode: EInputNumberMode.Decimal,
      allowNumberFormatting: false,
      suffix: ' %',
    },
    validators: [Validators.required],
  },
  gstAmount: {
    fieldType: EDataType.NUMBER,
    id: 'gstAmount',
    fieldName: 'gstAmount',
    label: 'PO GST Amount',
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    readonlyInput: true,
    validators: [Validators.required, Validators.min(0)],
  },
  totalAmount: {
    fieldType: EDataType.NUMBER,
    id: 'totalAmount',
    fieldName: 'totalAmount',
    label: 'Total Amount',
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    readonlyInput: true,
    validators: [Validators.required, Validators.min(0)],
  },
  poAttachment: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'poAttachment',
    fieldName: 'poAttachment',
    label: 'PO Attachments',
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
  remarks: {
    fieldType: EDataType.TEXT_AREA,
    id: 'remarks',
    fieldName: 'remarks',
    label: 'Remarks',
  },
};

export const ADD_PO_FORM_CONFIG: IFormConfig<IAddPoUIFormDto> = {
  fields: ADD_PO_FORM_FIELDS_CONFIG,
};
