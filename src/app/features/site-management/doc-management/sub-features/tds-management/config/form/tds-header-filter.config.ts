import {
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
} from '@shared/config/input-field.config';
import { EDataType, IInputFieldsConfig } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { getTdsVerifyPortalName } from '@features/site-management/doc-management/shared/utils/tax-register-status.util';

/** Verification filter, named after the side's portal: 26Q (vendor) / Form 26AS (contractor). */
export function getTdsIsVerifiedFilterFieldConfig(
  side: EDocContext | null
): IInputFieldsConfig {
  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'verificationStatus',
    fieldName: 'verificationStatus',
    label: side
      ? `${getTdsVerifyPortalName(side)} verification`
      : '26Q / 26AS verification',
    placeholder: 'All verification statuses',
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      optionsDropdown: [
        { label: 'Verified', value: 'true' },
        { label: 'Pending', value: 'false' },
      ],
    },
  } as IInputFieldsConfig;
}

/** Challan filter. Only vendor TDS is deposited by us; contractor TDS is deposited by the client. */
export function getTdsChallanFilterFieldConfig(
  side: EDocContext | null
): IInputFieldsConfig {
  const optionsDropdown =
    side === EDocContext.PURCHASE
      ? [
          { label: 'Challan pending', value: 'PENDING' },
          { label: 'Deposited', value: 'DEPOSITED' },
        ]
      : [
          { label: 'Challan pending (vendor)', value: 'PENDING' },
          { label: 'Deposited (vendor)', value: 'DEPOSITED' },
          { label: 'Client deposits (contractor)', value: 'NOT_APPLICABLE' },
        ];

  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'challanStatus',
    fieldName: 'challanStatus',
    label: 'Challan',
    placeholder: 'All challans',
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      optionsDropdown,
    },
  } as IInputFieldsConfig;
}
