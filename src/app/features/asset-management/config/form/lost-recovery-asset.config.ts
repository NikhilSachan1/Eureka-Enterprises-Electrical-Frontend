import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  IMarkLostAssetFormDto,
  IMarkRecoveredAssetFormDto,
} from '@features/asset-management/types/asset.dto';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ASSET_EVIDENCE_FILE_CONFIG = {
  fileLimit: 2,
  acceptFileTypes: [
    ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
    ...APP_CONFIG.MEDIA_CONFIG.PDF,
  ],
};

const MARK_LOST_ASSET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IMarkLostAssetFormDto> =
  {
    lostReason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'lostReason',
      fieldName: 'lostReason',
      label: 'Reason / circumstances',
      validators: [Validators.required, Validators.maxLength(1000)],
    },
    // Shown and required only when the asset is assigned: the amount is charged to that employee's expense ledger.
    recoveryAmount: {
      fieldType: EDataType.NUMBER,
      id: 'recoveryAmount',
      fieldName: 'recoveryAmount',
      label: 'Recovery Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.min(0)],
    },
    assetImages: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'assetImages',
      fieldName: 'assetImages',
      label: 'Attachment',
      fileConfig: ASSET_EVIDENCE_FILE_CONFIG,
      validators: [Validators.required],
    },
  };

export const MARK_LOST_ASSET_FORM_CONFIG: IFormConfig<IMarkLostAssetFormDto> = {
  fields: MARK_LOST_ASSET_FORM_FIELDS_CONFIG,
};

const MARK_RECOVERED_ASSET_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IMarkRecoveredAssetFormDto> =
  {
    recoveryNotes: {
      fieldType: EDataType.TEXT_AREA,
      id: 'recoveryNotes',
      fieldName: 'recoveryNotes',
      label: 'Recovery notes (where / how it was found)',
      validators: [Validators.required, Validators.maxLength(1000)],
    },
    refundRecoveryAmount: {
      fieldType: EDataType.CHECKBOX,
      id: 'refundRecoveryAmount',
      fieldName: 'refundRecoveryAmount',
      defaultValue: false,
      checkboxConfig: {
        options: [
          {
            label: 'Refund the amount recovered from the employee',
            value: 'refundRecoveryAmount',
          },
        ],
        binary: true,
      },
    },
    assetImages: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'assetImages',
      fieldName: 'assetImages',
      label: 'Attachment',
      fileConfig: ASSET_EVIDENCE_FILE_CONFIG,
    },
  };

export const MARK_RECOVERED_ASSET_FORM_CONFIG: IFormConfig<IMarkRecoveredAssetFormDto> =
  {
    fields: MARK_RECOVERED_ASSET_FORM_FIELDS_CONFIG,
  };
