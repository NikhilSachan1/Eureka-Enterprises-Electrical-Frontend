import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType, EInputNumberMode, EFileMode, EUpAndDownButtonLayout } from '../../../../shared/types/form-input.types';

export const REGULAR_ADD_EXPENSE_INPUT_FIELDS_CONFIG: IFormConfig = {
  expenseType: {
    fieldType: EFieldType.Select,
    id: 'expenseType',
    fieldName: 'expenseType',
    label: 'Expense Type',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { label: 'Travel', value: 'travel' },
        { label: 'Food & Entertainment', value: 'food_entertainment' },
        { label: 'Office Supplies', value: 'office_supplies' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Software & Tools', value: 'software_tools' },
        { label: 'Training & Development', value: 'training_development' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Utilities', value: 'utilities' },
        { label: 'Other', value: 'other' }
      ]
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
  },
  expenseProof: {
    fieldType: EFieldType.File,
    id: 'expenseProof',
    fieldName: 'expenseProof',
    label: 'Upload Expense Proof',
    validators: [],
    fileConfig: {
      acceptFileTypes: 'image/*,.pdf',
    }
  }
}; 