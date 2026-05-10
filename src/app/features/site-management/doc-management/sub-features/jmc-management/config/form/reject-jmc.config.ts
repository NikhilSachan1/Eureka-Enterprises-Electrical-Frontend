import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectJmcFormDto } from '../../types/jmc.dto';
import { Validators } from '@angular/forms';

const REJECT_ACTION_JMC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectJmcFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      validators: [Validators.required],
    },
  };

export const REJECT_ACTION_JMC_FORM_CONFIG: IFormConfig<IRejectJmcFormDto> = {
  fields: REJECT_ACTION_JMC_FORM_FIELDS_CONFIG,
};
