import {
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
} from '@shared/config/input-field.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDataType, IInputFieldsConfig } from '@shared/types';

export const TDS_PARTY_TYPE_FILTER_FIELD_CONFIG: IInputFieldsConfig = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  fieldType: EDataType.SELECT,
  id: 'partyType',
  fieldName: 'partyType',
  label: 'Party type',
  placeholder: 'All party types',
  selectConfig: {
    ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
    dynamicDropdown: {
      moduleName: MODULE_NAMES.FINANCIAL,
      dropdownName: CONFIGURATION_KEYS.PROJECT.PARTY_TYPES,
    },
  },
} as IInputFieldsConfig;

export const TDS_IS_VERIFIED_FILTER_FIELD_CONFIG: IInputFieldsConfig = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  fieldType: EDataType.SELECT,
  id: 'verificationStatus',
  fieldName: 'verificationStatus',
  label: '26Q / 26AS verification',
  placeholder: 'All verification statuses',
  selectConfig: {
    ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
    optionsDropdown: [
      { label: 'Verified', value: 'true' },
      { label: 'Pending', value: 'false' },
    ],
  },
} as IInputFieldsConfig;

export const TDS_CHALLAN_FILTER_FIELD_CONFIG: IInputFieldsConfig = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  fieldType: EDataType.SELECT,
  id: 'challanStatus',
  fieldName: 'challanStatus',
  label: 'Challan',
  placeholder: 'All challans',
  selectConfig: {
    ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
    optionsDropdown: [
      { label: 'Challan pending (vendor)', value: 'PENDING' },
      { label: 'Deposited (vendor)', value: 'DEPOSITED' },
      { label: 'Client deposits (contractor)', value: 'NOT_APPLICABLE' },
    ],
  },
} as IInputFieldsConfig;
