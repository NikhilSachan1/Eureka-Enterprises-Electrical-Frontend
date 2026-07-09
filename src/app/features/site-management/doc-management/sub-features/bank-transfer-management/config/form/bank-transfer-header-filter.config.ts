import {
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
} from '@shared/config/input-field.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { EDataType, IInputFieldsConfig } from '@shared/types';

export const getBankTransferPaidFromAccountFilterFieldConfig = (
  docContext: EDocContext
): IInputFieldsConfig => {
  const isSales = docContext === EDocContext.SALES;

  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'paidFromAccount',
    fieldName: 'paidFromAccount',
    label: isSales ? 'Bank Received Account' : 'Bank Transfer Account',
    placeholder: isSales ? 'Bank Received Account' : 'Bank Transfer Account',
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMPANY_BANK_ACCOUNT,
        dropdownName:
          CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
      },
      showClearButton: true,
    },
  } as IInputFieldsConfig;
};

export const getBankTransferHasPaidFromAccountFilterFieldConfig = (
  docContext: EDocContext
): IInputFieldsConfig => {
  const isSales = docContext === EDocContext.SALES;

  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'hasPaidFromAccount',
    fieldName: 'hasPaidFromAccount',
    label: isSales ? 'Has Bank Received Account' : 'Has Bank Transfer Account',
    placeholder: isSales
      ? 'Has Bank Received Account'
      : 'Has Bank Transfer Account',
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      optionsDropdown: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      showClearButton: true,
    },
  } as IInputFieldsConfig;
};
