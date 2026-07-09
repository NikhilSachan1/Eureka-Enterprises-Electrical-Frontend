import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IUnlockRequestReportFormDto } from '../../types/report.dto';
import { Validators } from '@angular/forms';

const UNLOCK_REQUEST_ACTION_REPORT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUnlockRequestReportFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Reason',
      validators: [Validators.required, Validators.maxLength(50)],
    },
  };

export const UNLOCK_REQUEST_ACTION_REPORT_FORM_CONFIG: IFormConfig<IUnlockRequestReportFormDto> =
  {
    fields: UNLOCK_REQUEST_ACTION_REPORT_FORM_FIELDS_CONFIG,
  };
