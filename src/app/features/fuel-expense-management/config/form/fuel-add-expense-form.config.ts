import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType, EInputNumberMode, EUpAndDownButtonLayout } from '../../../../shared/types/form-input.types';

export const FUEL_ADD_EXPENSE_INPUT_FIELDS_CONFIG: IFormConfig = {
  selectVehicle: {
    fieldType: EFieldType.Select,
    id: 'selectVehicle',
    fieldName: 'selectVehicle',
    label: 'Select Vehicle',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { value: 'KA01AB1234 - Maruti Swift', key: 'ka01ab1234' },
        { value: 'KA02CD5678 - Hyundai i20', key: 'ka02cd5678' },
        { value: 'KA03EF9012 - Tata Nexon', key: 'ka03ef9012' },
        { value: 'KA04GH3456 - Honda City', key: 'ka04gh3456' },
        { value: 'KA05IJ7890 - Toyota Innova', key: 'ka05ij7890' },
        { value: 'DL01MN2345 - Mahindra Scorpio', key: 'dl01mn2345' },
        { value: 'MH02PQ6789 - Ford EcoSport', key: 'mh02pq6789' }
      ]
    }
  },
  fuelType: {
    fieldType: EFieldType.Select,
    id: 'fuelType',
    fieldName: 'fuelType',
    label: 'Fuel Type',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { value: 'Petrol', key: 'petrol' },
        { value: 'Diesel', key: 'diesel' },
        { value: 'CNG', key: 'cng' },
        { value: 'Electric', key: 'electric' }
      ]
    }
  },
  fuelFilledDate: {
    fieldType: EFieldType.Date,
    id: 'fuelFilledDate',
    fieldName: 'fuelFilledDate',
    label: 'Fuel Filled Date',
    defaultValue: new Date(),
    validators: [Validators.required],
    dateConfig: {
      maxDate: new Date()
    }
  },
  odometerReading: {
    fieldType: EFieldType.Number,
    id: 'odometerReading',
    fieldName: 'odometerReading',
    label: 'Odometer Reading (in Kms.)',
    validators: [Validators.required, Validators.min(0)],
    numberConfig: {
      minimumBoundaryValue: 0,
      step: 1,
      mode: EInputNumberMode.Decimal,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      upAndDownButtonLayout: EUpAndDownButtonLayout.Default
    }
  },
  odometerReadingProof: {
    fieldType: EFieldType.File,
    id: 'odometerReadingProof',
    fieldName: 'odometerReadingProof',
    validators: [Validators.required],
    fileConfig: {
      chooseLabel: 'Upload Odometer Reading',
      acceptFileTypes: 'image/*,.pdf',
    }
  },
  fuelQuantityInLtr: {
    fieldType: EFieldType.Number,
    id: 'fuelQuantityInLtr',
    fieldName: 'fuelQuantityInLtr',
    label: 'Fuel Quantity (in Ltr.)',
    validators: [Validators.required, Validators.min(0.1)],
    numberConfig: {
      minimumBoundaryValue: 0,
      step: 0.1,
      mode: EInputNumberMode.Decimal,
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
      upAndDownButtonLayout: EUpAndDownButtonLayout.Default
    }
  },
  pumpMeterReadingProof: {
    fieldType: EFieldType.File,
    id: 'pumpMeterReadingProof',
    fieldName: 'pumpMeterReadingProof',
    validators: [Validators.required],
    fileConfig: {
      chooseLabel: 'Upload Pump Meter Reading',
      acceptFileTypes: 'image/*,.pdf',
    }
  },
  fuelFilledAmount: {
    fieldType: EFieldType.Number,
    id: 'fuelFilledAmount',
    fieldName: 'fuelFilledAmount',
    label: 'Fuel Filled Amount',
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
  fuelFilledReceiptProof: {
    fieldType: EFieldType.File,
    id: 'fuelFilledReceiptProof',
    fieldName: 'fuelFilledReceiptProof',
    validators: [Validators.required],
    fileConfig: {
      chooseLabel: 'Upload Fuel Filled Receipt',
      acceptFileTypes: 'image/*,.pdf',
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
  comment: {
    fieldType: EFieldType.TextArea,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
    validators: [Validators.maxLength(500)],
  }
}; 