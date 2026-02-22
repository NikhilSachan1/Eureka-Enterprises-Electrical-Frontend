import {
  dateField,
  fileField,
  isoDateTimeField,
  uuidField,
} from '@shared/schemas';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';
import z from 'zod';
import { EFuelExpenseTransactionType } from '../types/fuel-expense.enum';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const expenseEntryTypeSchema = z.enum(EEntryType);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);

export const FuelExpenseBaseSchema = z.object({
  id: uuidField,
  userId: uuidField,
  fillDate: isoDateTimeField,
  odometerKm: z.number(),
  fuelLiters: z.number(),
  fuelAmount: z.number(),
  pumpMeterReading: z.number().nullable(),
  paymentMode: z.string().min(1),
  transactionId: z.string().nullable(),
  description: z.string(),
  transactionType: z.enum(EFuelExpenseTransactionType),
  expenseEntryType: expenseEntryTypeSchema,
  entrySourceType: entrySourceTypeSchema,
  approvalStatus: approvalStatusSchema,
  approvalReason: z.string().trim().nullable(),
  approvalAt: isoDateTimeField.nullable(),
  approvalBy: uuidField.nullable(),
  fileKeys: z.array(z.string()),
});

export const FuelExpenseUpsertShapeSchema = z.object({
  vehicleName: uuidField,
  cardName: uuidField.nullable(),
  fuelFillDate: dateField,
  odometerReading: z.number(),
  fuelLiters: z.number(),
  fuelAmount: z.number(),
  paymentMode: z.string(),
  remark: z.string(),
  fuelExpenseAttachments: z.array(fileField),
  transactionId: z.string().nullable().default(null),
});
