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
        { label: 'James Butt', value: 'james_butt' },
        { label: 'Mary Smith', value: 'mary_smith' },
        { label: 'John Doe', value: 'john_doe' },
        { label: 'Sara Lee', value: 'sara_lee' },
        { label: 'Michael Johnson', value: 'michael_johnson' },
        { label: 'Emily Davis', value: 'emily_davis' },
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
        { label: 'Cash', value: 'cash' },
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Debit Card', value: 'debit_card' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'UPI', value: 'upi' },
        { label: 'Cheque', value: 'cheque' },
        { label: 'Digital Wallet', value: 'digital_wallet' }
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