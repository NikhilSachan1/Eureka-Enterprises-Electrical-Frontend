import { isoDateTimeField, uuidField } from '@shared/schemas';
import { UserSchema } from '@shared/schemas/user.schema';
import z from 'zod';
import { EPaymentSheetSourceType } from '../types/payment-sheet.enum';

export const PaymentSheetDetailGetRequestSchema = z
  .object({
    paymentSheetId: uuidField,
  })
  .strict()
  .transform(data => ({
    id: data.paymentSheetId,
  }));

const PaymentSheetBankSnapshotSchema = z
  .looseObject({
    accountHolderName: z.string().nullable(),
    bankName: z.string().nullable(),
    accountNumber: z.string().nullable(),
    ifscCode: z.string().nullable(),
  })
  .nullable();

const PaymentSheetVendorSnapshotSchema = z
  .looseObject({
    id: uuidField.optional(),
    name: z.string(),
    email: z.string().optional(),
    contactNumber: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  })
  .nullable();

const PaymentSheetBookPaymentAllocationInvoiceSchema = z.looseObject({
  invoiceId: uuidField,
  invoiceNumber: z.string(),
  invoiceDate: isoDateTimeField,
  actualDueAmount: z.coerce.number(),
  payableAmount: z.coerce.number(),
  remainingAmount: z.coerce.number(),
  companyName: z.string(),
  projectName: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
});

const PaymentSheetBookPaymentAllocationSchema = z.looseObject({
  id: uuidField,
  itemId: uuidField.optional(),
  bookPaymentId: uuidField,
  allocatedAmount: z.coerce.number(),
  bankTransferId: uuidField.nullable().optional(),
  invoice: PaymentSheetBookPaymentAllocationInvoiceSchema.optional(),
});

const PaymentSheetItemVerificationSchema = z.looseObject({
  stage: z.string(),
  verifiedBy: uuidField,
  verifiedByName: z.string(),
  verifiedAt: isoDateTimeField,
});

const PaymentSheetVerificationSummarySchema = z.looseObject({
  stage: z.string(),
  verified: z.coerce.number(),
  total: z.coerce.number(),
  allVerified: z.boolean(),
});

const PaymentSheetStageLogSchema = z.looseObject({
  id: uuidField,
  fromStage: z.string().nullable(),
  toStage: z.string().nullable(),
  action: z.string(),
  actedBy: uuidField.optional(),
  actedRole: z.string().nullable(),
  remarks: z.string().nullable(),
  createdAt: isoDateTimeField,
});

const PaymentSheetHistorySchema = z.looseObject({
  id: uuidField,
  itemId: uuidField,
  stage: z.string(),
  action: z.string(),
  previousAmount: z.coerce.number().nullable(),
  newAmount: z.coerce.number().nullable(),
  reason: z.string().nullable(),
  createdAt: isoDateTimeField,
});

export const PaymentSheetItemDetailSchema = z.looseObject({
  id: uuidField,
  beneficiaryType: z.string(),
  userId: uuidField.nullable(),
  vendorId: uuidField.nullable(),
  sourceType: z.enum(EPaymentSheetSourceType),
  pendingSnapshot: z.coerce.number(),
  requestedAmount: z.coerce.number().optional(),
  currentAmount: z.coerce.number(),
  bankSnapshot: PaymentSheetBankSnapshotSchema,
  itemStatus: z.string(),
  paidAt: isoDateTimeField.nullable(),
  paymentRef: z.string().nullable(),
  bookPaymentAllocations: z
    .array(PaymentSheetBookPaymentAllocationSchema)
    .nullable(),
  actualDueAmount: z.coerce.number(),
  payableAmount: z.coerce.number(),
  remainingAmount: z.coerce.number(),
  user: UserSchema.nullable(),
  vendor: PaymentSheetVendorSnapshotSchema,
  verifications: z.array(PaymentSheetItemVerificationSchema),
  verifiedStages: z.array(z.string()),
  isVerifiedForCurrentStage: z.boolean(),
});

export const PaymentSheetDetailGetResponseSchema = z.looseObject({
  id: uuidField,
  sheetNumber: z.string(),
  title: z.string().nullable(),
  remarks: z.string().nullable(),
  status: z.string(),
  currentStage: z.string().nullable(),
  totalRequestedAmount: z.coerce.number(),
  totalCurrentAmount: z.coerce.number(),
  totalPaidAmount: z.coerce.number(),
  createdAt: isoDateTimeField,
  items: z.array(PaymentSheetItemDetailSchema),
  verificationSummary: PaymentSheetVerificationSummarySchema.nullable(),
  stageLogs: z.array(PaymentSheetStageLogSchema).optional(),
  history: z.array(PaymentSheetHistorySchema).optional(),
});
