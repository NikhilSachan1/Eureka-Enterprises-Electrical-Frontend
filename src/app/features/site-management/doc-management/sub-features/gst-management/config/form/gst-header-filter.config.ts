import {
  DEFAULT_INPUT_FIELD_CONFIG,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
} from '@shared/config/input-field.config';
import { EDataType, IInputFieldsConfig } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { getGstVerifyPortalName } from '@features/site-management/doc-management/shared/utils/tax-register-status.util';

/** Verification filter, named after the side's return: GSTR-2B (vendor) / GSTR-1 (contractor). */
export function getGstIsVerifiedFilterFieldConfig(
  side: EDocContext | null
): IInputFieldsConfig {
  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'verificationStatus',
    fieldName: 'verificationStatus',
    label: side
      ? `${getGstVerifyPortalName(side)} verification`
      : 'GSTR-2B / GSTR-1 verification',
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

/**
 * Held GST filter. Vendor GST is released by us (booked, then paid); contractor GST is
 * received from the client, so it has no "in process" step.
 */
export function getGstSettlementFilterFieldConfig(
  side: EDocContext | null
): IInputFieldsConfig {
  const NOT_HELD = {
    label: 'Not held (with invoice payment)',
    value: 'NOT_HELD',
  };
  const optionsDropdown =
    side === EDocContext.PURCHASE
      ? [
          { label: 'Release pending', value: 'PENDING' },
          { label: 'Release in process', value: 'IN_PROCESS' },
          { label: 'Released', value: 'SETTLED' },
          NOT_HELD,
        ]
      : side === EDocContext.SALES
        ? [
            { label: 'Receipt pending', value: 'PENDING' },
            { label: 'Received', value: 'SETTLED' },
            NOT_HELD,
          ]
        : [
            { label: 'Release / receipt pending', value: 'PENDING' },
            { label: 'Release in process', value: 'IN_PROCESS' },
            { label: 'Released / received', value: 'SETTLED' },
            NOT_HELD,
          ];

  return {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.SELECT,
    id: 'settlementStatus',
    fieldName: 'settlementStatus',
    label: 'Held GST',
    placeholder: 'All GST',
    selectConfig: {
      ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
      optionsDropdown,
    },
  } as IInputFieldsConfig;
}
