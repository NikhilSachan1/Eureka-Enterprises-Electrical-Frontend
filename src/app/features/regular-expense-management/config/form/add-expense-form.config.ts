import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType, EInputNumberMode, EFileMode, EUpAndDownButtonLayout } from '../../../../shared/types/form-input.types';

export const ADD_EXPENSE_INPUT_FIELDS_CONFIG: IFormConfig = {
  expenseType: {
    fieldType: EFieldType.Select,
    id: 'expenseType',
    fieldName: 'expenseType',
    label: 'Expense Type',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { value: 'Travel', key: 'travel' },
        { value: 'Food & Entertainment', key: 'food_entertainment' },
        { value: 'Office Supplies', key: 'office_supplies' },
        { value: 'Equipment', key: 'equipment' },
        { value: 'Software & Tools', key: 'software_tools' },
        { value: 'Training & Development', key: 'training_development' },
        { value: 'Marketing', key: 'marketing' },
        { value: 'Utilities', key: 'utilities' },
        { value: 'Other', key: 'other' }
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
      ],
    }
  },
  dateOfExpense: {
    fieldType: EFieldType.Date,
    id: 'dateOfExpense',
    fieldName: 'dateOfExpense',
    label: 'Date Of Expense',
    defaultValue: new Date(),
    validators: [Validators.required],
    dateConfig: {
      maxDate: new Date()
    }
  },
  amount: {
    fieldType: EFieldType.Number,
    id: 'amount',
    fieldName: 'amount',
    label: 'Amount',
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
  comment: {
    fieldType: EFieldType.TextArea,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
    validators: [Validators.maxLength(500)],
    textAreaConfig: {
      rows: 4,
      cols: 30,
      autoResize: true
    }
  },
  expenseProof: {
    fieldType: EFieldType.File,
    id: 'expenseProof',
    fieldName: 'expenseProof',
    label: 'Upload Expense Proof',
    validators: [],
    fileConfig: {
      customUpload: true,
      multiple: false,
      acceptFileTypes: 'image/*,.pdf',
      maxFileSize: 5000000, // 5MB
      mode: EFileMode.Advanced,
      automaticUpload: false,
      showUploadButton: true,
      showCancelButton: true,
      chooseLabel: 'Choose File',
      cancelLabel: 'Cancel'
    }
  }
}; 