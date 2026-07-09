import { Validators } from '@angular/forms';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { getPaymentSourceTabLabel } from '@features/centralized-payment-management/shared/utils/payment-source-tab.util';
import { IDownloadPaymentSheetPdfFormDto } from '../../types/payment-sheet.dto';
import { EPaymentSheetSourceType } from '../../types/payment-sheet.enum';

export const PAYMENT_SHEET_PDF_DOWNLOAD_ALL = 'ALL' as const;

const PAYMENT_SHEET_PDF_SOURCE_OPTIONS = [
  EPaymentSheetSourceType.EXPENSE,
  EPaymentSheetSourceType.FUEL_EXPENSE,
  EPaymentSheetSourceType.VENDOR_PAYMENT,
].map(sourceType => ({
  label: getPaymentSourceTabLabel(
    sourceType as unknown as EPaymentOutstandingSourceType
  ),
  value: sourceType,
}));

const DOWNLOAD_PAYMENT_SHEET_PDF_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDownloadPaymentSheetPdfFormDto> =
  {
    sourceType: {
      fieldType: EDataType.SELECT,
      id: 'sourceType',
      fieldName: 'sourceType',
      label: 'Payment source',
      placeholder: 'Select source to download',
      validators: [Validators.required],
      selectConfig: {
        optionsDropdown: [
          { label: 'All', value: PAYMENT_SHEET_PDF_DOWNLOAD_ALL },
          ...PAYMENT_SHEET_PDF_SOURCE_OPTIONS,
        ],
      },
    },
  };

export const DOWNLOAD_PAYMENT_SHEET_PDF_FORM_CONFIG: IFormConfig<IDownloadPaymentSheetPdfFormDto> =
  {
    fields: DOWNLOAD_PAYMENT_SHEET_PDF_FORM_FIELDS_CONFIG,
  };
