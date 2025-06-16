import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType, EInputNumberMode } from '../../../../shared/types/form-input.types';

export const ADD_RECHARGE_INPUT_FIELDS_CONFIG: IFormConfig = {
  rechargeAmount: {
    fieldType: EFieldType.Number,
    id: 'rechargeAmount',
    fieldName: 'rechargeAmount',
    label: 'Recharge Amount',
    validators: [Validators.required, Validators.min(1), Validators.max(50000)],
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: 'INR',
      locale: 'en-IN',
    }
  },
  rechargeDate: {
    fieldType: EFieldType.Date,
    id: 'rechargeDate',
    fieldName: 'rechargeDate',
    label: 'Recharge Date',
    validators: [Validators.required],
  },
  rechargeMethod: {
    fieldType: EFieldType.Select,
    id: 'rechargeMethod',
    fieldName: 'rechargeMethod',
    label: 'Payment Method',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { value: 'credit_card', key: 'Credit Card' },
        { value: 'bank_transfer', key: 'Bank Transfer' },
        { value: 'cash', key: 'Cash' },
        { value: 'check', key: 'Check' },
        { value: 'online_transfer', key: 'Online Transfer' },
      ],
    }
  },
  referenceNumber: {
    fieldType: EFieldType.Text,
    id: 'referenceNumber',
    fieldName: 'referenceNumber',
    label: 'Reference Number',
    validators: [Validators.maxLength(50)],
  },
  description: {
    fieldType: EFieldType.TextArea,
    id: 'description',
    fieldName: 'description',
    label: 'Description',
    validators: [Validators.maxLength(200)],
  },
  uploadReceipt: {
    fieldType: EFieldType.File,
    id: 'uploadReceipt',
    fieldName: 'uploadReceipt',
    validators: [],
    fileConfig: {
      acceptFileTypes: 'image/*,.pdf',
      chooseLabel: 'Choose Transaction Receipt',
    }
  }
}; 