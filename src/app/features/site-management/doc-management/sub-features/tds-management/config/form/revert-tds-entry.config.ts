import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IRevertTdsEntryFormDto } from '../../types/tds.dto';

const REVERT_TDS_ENTRY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRevertTdsEntryFormDto> =
  {
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
      validators: [Validators.required],
    },
  };

export const REVERT_TDS_ENTRY_FORM_CONFIG: IFormConfig<IRevertTdsEntryFormDto> =
  {
    fields: REVERT_TDS_ENTRY_FORM_FIELDS_CONFIG,
  };
