import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  ECalendarView,
  EDataType,
  EFieldSize,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ICronRunUIFormDto } from '../../types/cron.dto';

const TRIGGER_CRON_FORM_FIELDS: IFormInputFieldsConfig<ICronRunUIFormDto> = {
  runDate: {
    fieldType: EDataType.DATE,
    id: 'runDate',
    fieldName: 'runDate',
    label: 'Date',
    dateConfig: {
      dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_CALENDAR,
      touchUI: false,
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean =>
          context.requiredParameters.includes('date') &&
          !context.requiredParameters.includes('month') &&
          !context.requiredParameters.includes('year'),
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
  },
  runMonth: {
    fieldType: EDataType.DATE,
    id: 'runMonth',
    fieldName: 'runMonth',
    label: 'Month',
    dateConfig: {
      dateFormat: APP_CONFIG.DATE_FORMATS.MONTH_YEAR,
      calendarView: ECalendarView.Month,
      touchUI: false,
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean =>
          context.requiredParameters.includes('month') &&
          !context.requiredParameters.includes('year'),
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
  },
  runYear: {
    fieldType: EDataType.DATE,
    id: 'runYear',
    fieldName: 'runYear',
    label: 'Year',
    dateConfig: {
      dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_CALENDAR_YEAR,
      calendarView: ECalendarView.Year,
      touchUI: false,
    },
    conditionalValidators: [
      {
        shouldApply: (context): boolean =>
          context.requiredParameters.includes('year') &&
          !context.requiredParameters.includes('month') &&
          !context.requiredParameters.includes('date'),
        validators: [Validators.required],
        resetOnFalse: true,
      },
    ],
  },
  isDryRun: {
    fieldType: EDataType.CHECKBOX,
    id: 'isDryRun',
    fieldName: 'isDryRun',
    fieldSize: EFieldSize.Large,
    defaultValue: false,
    checkboxConfig: {
      binary: true,
      options: [{ label: 'Dry run (no side effects)', value: 'dryRun' }],
    },
  },
  isSkipDependencyCheck: {
    fieldType: EDataType.CHECKBOX,
    id: 'isSkipDependencyCheck',
    fieldName: 'isSkipDependencyCheck',
    fieldSize: EFieldSize.Large,
    defaultValue: false,
    checkboxConfig: {
      binary: true,
      options: [
        { label: 'Skip dependency check', value: 'skipDependencyCheck' },
      ],
    },
  },
  isForceRun: {
    fieldType: EDataType.CHECKBOX,
    id: 'isForceRun',
    fieldName: 'isForceRun',
    fieldSize: EFieldSize.Large,
    defaultValue: false,
    checkboxConfig: {
      binary: true,
      options: [{ label: 'Force run', value: 'forceRun' }],
    },
  },
};

export const TRIGGER_CRON_FORM_CONFIG: IFormConfig<ICronRunUIFormDto> = {
  fields: TRIGGER_CRON_FORM_FIELDS,
};
