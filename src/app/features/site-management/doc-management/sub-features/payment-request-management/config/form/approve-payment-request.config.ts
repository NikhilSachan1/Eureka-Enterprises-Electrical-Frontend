import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  EInputNumberMode,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IApprovePaymentRequestFormDto } from '../../types/payment-request.dto';

export function createApprovePaymentRequestFormConfig(
  requestedAmount: number
): IFormConfig<IApprovePaymentRequestFormDto> {
  const fields: IFormInputFieldsConfig<IApprovePaymentRequestFormDto> = {
    approvedAmount: {
      fieldType: EDataType.NUMBER,
      id: 'approvedAmount',
      fieldName: 'approvedAmount',
      label: 'Approved Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        minimumBoundaryValue: 0.01,
        maximumBoundaryValue: requestedAmount,
      },
      validators: [
        Validators.required,
        Validators.min(0.01),
        Validators.max(requestedAmount),
      ],
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

  return { fields };
}
