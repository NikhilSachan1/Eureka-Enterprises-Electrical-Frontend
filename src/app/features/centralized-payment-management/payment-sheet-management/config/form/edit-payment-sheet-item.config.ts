import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IUpdatePaymentSheetItemFormDto } from '../../types/payment-sheet.dto';

export function createEditPaymentSheetItemFormConfig(
  originalPayableAmount: number
): IFormConfig<IUpdatePaymentSheetItemFormDto> {
  const fields: IFormInputFieldsConfig<IUpdatePaymentSheetItemFormDto> = {
    amount: {
      fieldType: EDataType.NUMBER,
      id: 'amount',
      fieldName: 'amount',
      label: 'Payable Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        maximumBoundaryValue: originalPayableAmount,
      },
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(originalPayableAmount),
      ],
    },
    reason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'reason',
      fieldName: 'reason',
      label: 'Reason',
      placeholder: 'Required when reducing the payable amount',
      conditionalValidators: [
        {
          dependsOn: 'amount',
          shouldApply: (amount: unknown) =>
            Number(amount) < originalPayableAmount,
          validators: [Validators.required],
        },
      ],
    },
  };

  return { fields };
}
