import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IAddGstPaymentReleaseUIFormDto } from '../../types/gst.dto';

const ADD_GST_PAYMENT_RELEASE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAddGstPaymentReleaseUIFormDto> =
  {
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
      validators: [Validators.required],
    },
    utrNumber: {
      fieldType: EDataType.TEXT,
      id: 'utrNumber',
      fieldName: 'utrNumber',
      label: 'UTR / Reference No.',
      validators: [Validators.required],
    },
    paymentDate: {
      fieldType: EDataType.DATE,
      id: 'paymentDate',
      fieldName: 'paymentDate',
      label: 'Payment Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    paymentAttachment: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'paymentAttachment',
      fieldName: 'paymentAttachment',
      label: 'Payment proof',
      fileConfig: {
        fileLimit: 1,
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

export const ADD_GST_PAYMENT_RELEASE_FORM_CONFIG: IFormConfig<IAddGstPaymentReleaseUIFormDto> =
  {
    fields: ADD_GST_PAYMENT_RELEASE_FORM_FIELDS_CONFIG,
  };
