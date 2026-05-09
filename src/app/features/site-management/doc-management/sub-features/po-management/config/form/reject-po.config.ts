import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRejectPoFormDto } from '../../types/po.dto';
import { Validators } from '@angular/forms';

const REJECT_ACTION_PO_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRejectPoFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      validators: [Validators.required],
    },
  };

export const REJECT_ACTION_PO_FORM_CONFIG: IFormConfig<IRejectPoFormDto> = {
  fields: REJECT_ACTION_PO_FORM_FIELDS_CONFIG,
};
