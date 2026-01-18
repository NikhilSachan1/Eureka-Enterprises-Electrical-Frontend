import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { IAssetAddFormDto } from '@features/asset-management/types/asset.dto';
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

const ADD_ASSET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAssetAddFormDto> = {
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
  assetCalibrationFrom: {
    fieldType: EDataType.SELECT,
    id: 'assetCalibrationFrom',
    fieldName: 'assetCalibrationFrom',
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
  assetCalibrationFrequency: {
    fieldType: EDataType.SELECT,
    id: 'assetCalibrationFrequency',
    fieldName: 'assetCalibrationFrequency',
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
  assetCalibrationDate: {
    fieldType: EDataType.DATE,
    id: 'assetCalibrationDate',
    fieldName: 'assetCalibrationDate',
    label: 'Calibration Date',
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
  assetVendorName: {
    fieldType: EDataType.TEXT,
    id: 'assetVendorName',
    fieldName: 'assetVendorName',
    label: 'Vendor Name',
    textConfig: {
      textCase: ETextCase.TITLECASE,
    },
  },
  assetWarrantyDate: {
    fieldType: EDataType.DATE,
    id: 'assetWarrantyDate',
    fieldName: 'assetWarrantyDate',
    label: 'Warranty Date',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
  },
  assetFiles: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'assetFiles',
    fieldName: 'assetFiles',
    label: 'Asset Files',
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

export const ADD_ASSET_FORM_CONFIG: IFormConfig<IAssetAddFormDto> = {
  fields: ADD_ASSET_FORM_FIELDS_CONFIG,
  buttons: ADD_ASSET_FORM_BUTTONS_CONFIG,
};
