import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IUnlockRequestJmcFormDto } from '../../types/jmc.dto';
import { Validators } from '@angular/forms';

const UNLOCK_REQUEST_ACTION_JMC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUnlockRequestJmcFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Reason',
      validators: [Validators.required, Validators.maxLength(50)],
    },
  };

export const UNLOCK_REQUEST_ACTION_JMC_FORM_CONFIG: IFormConfig<IUnlockRequestJmcFormDto> =
  {
    fields: UNLOCK_REQUEST_ACTION_JMC_FORM_FIELDS_CONFIG,
  };
