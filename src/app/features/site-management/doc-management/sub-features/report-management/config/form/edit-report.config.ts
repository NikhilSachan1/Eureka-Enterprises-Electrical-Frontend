import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_REPORT_FORM_CONFIG } from './add-report.config';
import { IEditReportUIFormDto } from '../../types/report.dto';

const EDIT_REPORT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditReportUIFormDto> =
  {
    ...ADD_REPORT_FORM_CONFIG.fields,
    projectName: {
      ...ADD_REPORT_FORM_CONFIG.fields.projectName,
      disabledInput: true,
    },
    jmcNumber: {
      ...ADD_REPORT_FORM_CONFIG.fields.jmcNumber,
      disabledInput: true,
    },
  };

export const EDIT_REPORT_FORM_CONFIG: IFormConfig<IEditReportUIFormDto> = {
  fields: EDIT_REPORT_FORM_FIELDS_CONFIG,
};
