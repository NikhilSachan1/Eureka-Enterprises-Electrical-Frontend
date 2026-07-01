import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IApproveReportFormDto } from '../../types/report.dto';

const APPROVE_ACTION_REPORT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IApproveReportFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const APPROVE_ACTION_REPORT_FORM_CONFIG: IFormConfig<IApproveReportFormDto> =
  {
    fields: APPROVE_ACTION_REPORT_FORM_FIELDS_CONFIG,
  };
