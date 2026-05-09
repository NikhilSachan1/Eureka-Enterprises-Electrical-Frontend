import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IUnlockRequestPoFormDto } from '../../types/po.dto';
import { Validators } from '@angular/forms';

const UNLOCK_REQUEST_ACTION_PO_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUnlockRequestPoFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Reason',
      validators: [Validators.required],
    },
  };

export const UNLOCK_REQUEST_ACTION_PO_FORM_CONFIG: IFormConfig<IUnlockRequestPoFormDto> =
  {
    fields: UNLOCK_REQUEST_ACTION_PO_FORM_FIELDS_CONFIG,
  };
