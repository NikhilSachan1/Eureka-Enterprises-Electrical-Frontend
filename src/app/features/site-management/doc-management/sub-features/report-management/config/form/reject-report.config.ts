import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectReportFormDto } from '../../types/report.dto';
import { Validators } from '@angular/forms';

const REJECT_ACTION_REPORT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectReportFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      validators: [Validators.required],
    },
  };

export const REJECT_ACTION_REPORT_FORM_CONFIG: IFormConfig<IRejectReportFormDto> =
  {
    fields: REJECT_ACTION_REPORT_FORM_FIELDS_CONFIG,
  };
