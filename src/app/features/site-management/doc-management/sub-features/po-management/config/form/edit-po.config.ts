import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_PO_FORM_CONFIG } from './add-po.config';
import { IEditPoUIFormDto } from '../../types/po.dto';

const EDIT_PO_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditPoUIFormDto> = {
  ...ADD_PO_FORM_CONFIG.fields,
  projectName: {
    ...ADD_PO_FORM_CONFIG.fields.projectName,
    disabledInput: true,
  },
  contractorName: {
    ...ADD_PO_FORM_CONFIG.fields.contractorName,
    disabledInput: true,
  },
  vendorName: {
    ...ADD_PO_FORM_CONFIG.fields.vendorName,
    disabledInput: true,
  },
};

export const EDIT_PO_FORM_CONFIG: IFormConfig<IEditPoUIFormDto> = {
  fields: EDIT_PO_FORM_FIELDS_CONFIG,
};
