import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { ADD_JMC_FORM_CONFIG } from './add-jmc.config';
import { IEditJmcUIFormDto } from '../../types/jmc.dto';

const EDIT_JMC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEditJmcUIFormDto> = {
  ...ADD_JMC_FORM_CONFIG.fields,
  projectName: {
    ...ADD_JMC_FORM_CONFIG.fields.projectName,
    disabledInput: true,
  },
  poNumber: {
    ...ADD_JMC_FORM_CONFIG.fields.poNumber,
    disabledInput: true,
  },
};

export const EDIT_JMC_FORM_CONFIG: IFormConfig<IEditJmcUIFormDto> = {
  fields: EDIT_JMC_FORM_FIELDS_CONFIG,
};
