import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { getDateBeforeXDays } from '@shared/utility';
import { IVehicleReadingAddUIFormDto } from '../../types/vehicle-reading.dto';

const ADD_VEHICLE_READING_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IVehicleReadingAddUIFormDto> =
  {
    readingDate: {
      fieldType: EDataType.DATE,
      id: 'readingDate',
      fieldName: 'readingDate',
      label: 'Reading Date',
      dateConfig: {
        minDate: getDateBeforeXDays(1),
        maxDate: new Date(),
      },
      validators: [Validators.required],
    },
    startTime: {
      fieldType: EDataType.DATE,
      id: 'startTime',
      fieldName: 'startTime',
      label: 'Start Time',
      dateConfig: {
        timeOnly: true,
        dateFormat: APP_CONFIG.TIME_FORMATS.DEFAULT,
        showButtonBar: true,
      },
    },
    startLocation: {
      fieldType: EDataType.TEXT,
      id: 'startLocation',
      fieldName: 'startLocation',
      label: 'Start Location',
    },
    startOdometerReading: {
      fieldType: EDataType.NUMBER,
      id: 'startOdometerReading',
      fieldName: 'startOdometerReading',
      label: 'Start Odometer Reading',
      validators: [Validators.required],
    },
    endTime: {
      fieldType: EDataType.DATE,
      id: 'endTime',
      fieldName: 'endTime',
      label: 'End Time',
      dateConfig: {
        timeOnly: true,
        dateFormat: APP_CONFIG.TIME_FORMATS.DEFAULT,
        showButtonBar: true,
      },
    },
    endLocation: {
      fieldType: EDataType.TEXT,
      id: 'endLocation',
      fieldName: 'endLocation',
      label: 'End Location',
    },
    endOdometerReading: {
      fieldType: EDataType.NUMBER,
      id: 'endOdometerReading',
      fieldName: 'endOdometerReading',
      label: 'End Odometer Reading',
      conditionalValidators: [
        {
          dependsOn: 'endOdometerReadingAttachments',
          shouldApply: (files: unknown) =>
            Array.isArray(files) && files.length > 0,
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
    startOdometerReadingAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'startOdometerReadingAttachments',
      fieldName: 'startOdometerReadingAttachments',
      label: 'Start Odometer Reading Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.IMAGE,
      },
      validators: [Validators.required],
    },
    endOdometerReadingAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'endOdometerReadingAttachments',
      fieldName: 'endOdometerReadingAttachments',
      label: 'End Odometer Reading Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: APP_CONFIG.MEDIA_CONFIG.IMAGE,
      },
      conditionalValidators: [
        {
          dependsOn: 'endOdometerReading',
          shouldApply: (endReading: unknown) =>
            endReading !== null &&
            endReading !== undefined &&
            endReading !== '',
          validators: [Validators.required],
        },
      ],
    },
  };

const ADD_VEHICLE_READING_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Vehicle Reading',
    tooltip: 'Add a new vehicle reading',
  },
};

export const ADD_VEHICLE_READING_FORM_CONFIG: IFormConfig<IVehicleReadingAddUIFormDto> =
  {
    fields: ADD_VEHICLE_READING_FORM_FIELDS_CONFIG,
    buttons: ADD_VEHICLE_READING_FORM_BUTTONS_CONFIG,
  };
