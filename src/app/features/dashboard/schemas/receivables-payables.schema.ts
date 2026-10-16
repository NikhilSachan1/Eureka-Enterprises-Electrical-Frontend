import z from 'zod';
import { uuidField } from '@shared/schemas';

const money = z.number();
const count = z.number().nonnegative();

const AwaitingApprovalSchema = z.looseObject({
  invoiceCount: count.default(0),
  amount: money.default(0),
});

const ReceivablesPayablesPartySchema = z.looseObject({
  partyId: uuidField,
  partyName: z
    .string()
    .nullable()
    .optional()
    .transform(value => value?.trim() || 'Unnamed'),
  invoiceCount: count.default(0),
  invoiced: money.default(0),
  settled: money.default(0),
  outstanding: money.default(0),
  oldestDays: count.default(0),
});

const ReceivablesPayablesSideSchema = z.looseObject({
  invoiced: money.default(0),
  tds: money.default(0),
  advanceSettled: money.default(0),
  settled: money.default(0),
  outstanding: money.default(0),
  invoiceCount: count.default(0),
  openCount: count.default(0),
  oldestDays: count.default(0),
  awaitingApproval: AwaitingApprovalSchema.default({
    invoiceCount: 0,
    amount: 0,
  }),
  parties: z.array(ReceivablesPayablesPartySchema).default([]),
});

export const ReceivablesPayablesQuerySchema = z
  .object({
    siteId: uuidField.optional(),
    companyId: uuidField.optional(),
  })
  .strict();

export const ReceivablesPayablesGetResponseSchema = z.looseObject({
  receivable: ReceivablesPayablesSideSchema,
  payable: ReceivablesPayablesSideSchema,
  net: money.default(0),
});
