import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType, EInputNumberMode, EUpAndDownButtonLayout } from '../../../../shared/types/form-input.types';

export const REGULAR_REIMBURSE_EXPENSE_INPUT_FIELDS_CONFIG: IFormConfig = {
  employeeName: {
    fieldType: EFieldType.MultiSelect,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    validators: [Validators.required],
    multiSelectConfig: {
      optionsDropdown: [
        { value: 'James Butt', key: 'james_butt' },
        { value: 'Mary Smith', key: 'mary_smith' },
        { value: 'John Doe', key: 'john_doe' },
        { value: 'Sara Lee', key: 'sara_lee' },
        { value: 'Michael Johnson', key: 'michael_johnson' },
        { value: 'Emily Davis', key: 'emily_davis' },
      ],
    }
  },
  paymentMode: {
    fieldType: EFieldType.Select,
    id: 'paymentMode',
    fieldName: 'paymentMode',
    label: 'Payment Mode',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { value: 'Cash', key: 'cash' },
        { value: 'Credit Card', key: 'credit_card' },
        { value: 'Debit Card', key: 'debit_card' },
        { value: 'Bank Transfer', key: 'bank_transfer' },
        { value: 'UPI', key: 'upi' },
        { value: 'Cheque', key: 'cheque' },
        { value: 'Digital Wallet', key: 'digital_wallet' }
      ]
    }
  },
  dateOfSettlement: {
    fieldType: EFieldType.Date,
    id: 'dateOfSettlement',
    fieldName: 'dateOfSettlement',
    label: 'Date of Settlement',
    defaultValue: new Date(),
    validators: [Validators.required],
    dateConfig: {
      maxDate: new Date()
    }
  },
  creditAmount: {
    fieldType: EFieldType.Number,
    id: 'creditAmount',
    fieldName: 'creditAmount',
    label: 'Credit Amount',
    validators: [Validators.required, Validators.min(0.01)],
    numberConfig: {
      minimumBoundaryValue: 0,
      step: 1,
      mode: EInputNumberMode.Currency,
      currency: 'INR',
      locale: 'en-IN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      upAndDownButtonLayout: EUpAndDownButtonLayout.Default
    }
  },
  description: {
    fieldType: EFieldType.TextArea,
    id: 'description',
    fieldName: 'description',
    label: 'Description',
    validators: [Validators.required, Validators.maxLength(500)],
  },
  transactionScreenshot: {
    fieldType: EFieldType.File,
    id: 'transactionScreenshot',
    fieldName: 'transactionScreenshot',
    label: 'Upload Transaction Screenshot',
    validators: [Validators.required],
    fileConfig: {
      acceptFileTypes: 'image/*,.pdf',
    }
  },
  transactionId: {
    fieldType: EFieldType.Text,
    id: 'transactionId',
    fieldName: 'transactionId',
    label: 'Transaction ID',
    validators: [Validators.required],
  }
}; 