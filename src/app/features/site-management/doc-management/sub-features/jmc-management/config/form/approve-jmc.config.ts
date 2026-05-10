import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IApproveJmcFormDto } from '../../types/jmc.dto';

const APPROVE_ACTION_JMC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IApproveJmcFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

export const APPROVE_ACTION_JMC_FORM_CONFIG: IFormConfig<IApproveJmcFormDto> = {
  fields: APPROVE_ACTION_JMC_FORM_FIELDS_CONFIG,
};
