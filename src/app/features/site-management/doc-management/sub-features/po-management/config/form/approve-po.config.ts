import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IApprovePoFormDto } from '../../types/po.dto';

const APPROVE_ACTION_PO_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IApprovePoFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const APPROVE_ACTION_PO_FORM_CONFIG: IFormConfig<IApprovePoFormDto> = {
  fields: APPROVE_ACTION_PO_FORM_FIELDS_CONFIG,
};
