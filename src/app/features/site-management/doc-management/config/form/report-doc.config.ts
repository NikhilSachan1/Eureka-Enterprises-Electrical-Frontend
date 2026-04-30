import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { TEXT_INPUT_ACCEPT_STRIP } from '@shared/constants';
import {
  IFormInputFieldsConfig,
  EDataType,
  ETextCase,
  IFormConfig,
} from '@shared/types';
import { IReportDocAddUIFormDto } from '../../types/doc.dto';

export const REPORT_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IReportDocAddUIFormDto> =
  {
    jmcNumber: {
      fieldType: EDataType.SELECT,
      id: 'jmcNumber',
      fieldName: 'jmcNumber',
      label: 'JMC Number',
      validators: [Validators.required],
    },
    reportNumber: {
      fieldType: EDataType.TEXT,
      id: 'reportNumber',
      fieldName: 'reportNumber',
      label: 'Report Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC_WITH_SPECIAL_CHARS,
      },
      validators: [Validators.required],
    },
    reportDate: {
      fieldType: EDataType.DATE,
      id: 'reportDate',
      fieldName: 'reportDate',
      label: 'Report Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    reportAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'reportAttachments',
      fieldName: 'reportAttachments',
      label: 'Report Attachments',
      fileConfig: {
        fileLimit: 1,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
    reportRemark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'reportRemark',
      fieldName: 'reportRemark',
      label: 'Report Remark',
    },
  };

export const REPORT_DOC_FORM_CONFIG: IFormConfig<IReportDocAddUIFormDto> = {
  fields: REPORT_DOC_FORM_FIELDS_CONFIG,
};
