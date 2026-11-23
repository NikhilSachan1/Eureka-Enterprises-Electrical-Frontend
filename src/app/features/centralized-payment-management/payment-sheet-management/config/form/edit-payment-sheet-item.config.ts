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
  originalPayableAmount: number,
  allowIncrease = false,
  amountHint?: string
): IFormConfig<IUpdatePaymentSheetItemFormDto> {
  const fields: IFormInputFieldsConfig<IUpdatePaymentSheetItemFormDto> = {
    amount: {
      fieldType: EDataType.NUMBER,
      id: 'amount',
      fieldName: 'amount',
      label: 'Payable Amount',
      ...(amountHint ? { hint: amountHint } : {}),
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        // Blocks the minus sign, so the amount cannot be typed negative.
        minimumBoundaryValue: 0,
        ...(allowIncrease
          ? {}
          : { maximumBoundaryValue: originalPayableAmount }),
      },
      validators: [
        Validators.required,
        Validators.min(1),
        ...(allowIncrease ? [] : [Validators.max(originalPayableAmount)]),
      ],
    },
    reason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'reason',
      fieldName: 'reason',
      label: 'Reason',
      placeholder: 'Required when changing the payable amount',
      conditionalValidators: [
        {
          dependsOn: 'amount',
          // Any change, up or down, needs a reason (frontend-only rule).
          shouldApply: (amount: unknown) =>
            Math.abs(Number(amount) - originalPayableAmount) > 0.001,
          validators: [Validators.required],
        },
      ],
    },
  };

  return { fields };
}
