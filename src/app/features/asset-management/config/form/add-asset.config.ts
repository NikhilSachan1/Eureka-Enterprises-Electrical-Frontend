import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EAssetType } from '@features/asset-management/types/asset.enum';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  EDateSelectionMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ADD_ASSET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  assetId: {
    fieldType: EDataType.TEXT,
    id: 'assetId',
    fieldName: 'assetId',
    label: 'Asset ID',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
    },
    validators: [Validators.required, Validators.maxLength(10)],
  },
  assetName: {
    fieldType: EDataType.TEXT,
    id: 'assetName',
    fieldName: 'assetName',
    label: 'Asset Name',
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
    validators: [Validators.required],
  },
  assetModel: {
    fieldType: EDataType.TEXT,
    id: 'assetModel',
    fieldName: 'assetModel',
    label: 'Asset Model',
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
  },
  assetSerialNumber: {
    fieldType: EDataType.TEXT,
    id: 'assetSerialNumber',
    fieldName: 'assetSerialNumber',
    label: 'Asset Serial Number',
    textConfig: {
      textCase: ETextCase.UPPERCASE,
    },
  },
  assetCategory: {
    fieldType: EDataType.SELECT,
    id: 'assetCategory',
    fieldName: 'assetCategory',
    label: 'Asset Category',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.CATEGORY_LIST,
      },
    },
    validators: [Validators.required],
  },
  assetType: {
    fieldType: EDataType.SELECT,
    id: 'assetType',
    fieldName: 'assetType',
    label: 'Asset Type',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.TYPE_LIST,
      },
    },
    validators: [Validators.required],
  },
  calibrationFrom: {
    fieldType: EDataType.SELECT,
    id: 'calibrationFrom',
    fieldName: 'calibrationFrom',
    label: 'Calibration From',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.CALIBRATION_SOURCE_LIST,
      },
    },
    conditionalValidators: [
      {
        dependsOn: 'assetType',
        shouldApply: value => value === EAssetType.CALIBRATED,
        validators: [Validators.required],
      },
    ],
  },
  calibrationFrequency: {
    fieldType: EDataType.SELECT,
    id: 'calibrationFrequency',
    fieldName: 'calibrationFrequency',
    label: 'Calibration Frequency',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.CALIBRATION_FREQUENCY_LIST,
      },
    },
    conditionalValidators: [
      {
        dependsOn: 'assetType',
        shouldApply: value => value === EAssetType.CALIBRATED,
        validators: [Validators.required],
      },
    ],
  },
  calibrationPeriod: {
    fieldType: EDataType.DATE,
    id: 'calibrationPeriod',
    fieldName: 'calibrationPeriod',
    label: 'Calibration Period',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
    conditionalValidators: [
      {
        dependsOn: 'assetType',
        shouldApply: value => value === EAssetType.CALIBRATED,
        validators: [Validators.required],
      },
    ],
  },
  assetPurchaseDate: {
    fieldType: EDataType.DATE,
    id: 'assetPurchaseDate',
    fieldName: 'assetPurchaseDate',
    label: 'Asset Purchase Date',
    dateConfig: {
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  vendorName: {
    fieldType: EDataType.TEXT,
    id: 'vendorName',
    fieldName: 'vendorName',
    label: 'Vendor Name',
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
  },
  warrantyPeriod: {
    fieldType: EDataType.DATE,
    id: 'warrantyPeriod',
    fieldName: 'warrantyPeriod',
    label: 'Warranty Period',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
  },
  assetDocuments: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'assetDocuments',
    fieldName: 'assetDocuments',
    label: 'Asset Documents & Images',
    fileConfig: {
      fileLimit: 10,
      acceptFileTypes: [
        ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
        ...APP_CONFIG.MEDIA_CONFIG.PDF,
      ],
    },
    validators: [Validators.required],
  },
  remarks: {
    fieldType: EDataType.TEXT_AREA,
    id: 'remarks',
    fieldName: 'remarks',
    label: 'Remarks',
  },
};

const ADD_ASSET_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Asset',
    tooltip: 'Add a new asset',
  },
};

export const ADD_ASSET_FORM_CONFIG: IFormConfig = {
  fields: ADD_ASSET_FORM_FIELDS_CONFIG,
  buttons: ADD_ASSET_FORM_BUTTONS_CONFIG,
};
