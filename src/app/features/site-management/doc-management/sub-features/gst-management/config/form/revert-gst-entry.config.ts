import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRevertGstEntryFormDto } from '../../types/gst.dto';

const REVERT_GST_ENTRY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRevertGstEntryFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      validators: [Validators.required],
    },
  };

export const REVERT_GST_ENTRY_FORM_CONFIG: IFormConfig<IRevertGstEntryFormDto> =
  {
    fields: REVERT_GST_ENTRY_FORM_FIELDS_CONFIG,
  };
