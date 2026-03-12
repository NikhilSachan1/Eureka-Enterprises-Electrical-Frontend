import { z } from 'zod';
import { uuidField } from '@shared/schemas';

const SiteSummarySchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  companyName: z.string().optional(),
  status: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  durationDays: z.number().int(),
});

const RevenueSchema = z.looseObject({
  totalPOValue: z.number(),
  totalInvoiced: z.number(),
  pendingToInvoice: z.number(),
  collectedAmount: z.number().default(0),
  pendingCollection: z.number().default(0),
  collectionRate: z.number().default(0),
});

const ExpenseCategorySchema = z.looseObject({
  category: z.string().optional(),
  label: z.string().optional(),
  amount: z.number(),
  name: z.string().optional(),
});

const ExpenseContractorSchema = z.looseObject({
  contractorId: z.string().optional(),
  contractorName: z.string().optional(),
  amount: z.number(),
});

const ExpensesSchema = z.looseObject({
  total: z.number(),
  byCategory: z.array(ExpenseCategorySchema),
  byContractor: z.array(ExpenseContractorSchema).default([]),
});

const ProfitabilitySchema = z.looseObject({
  grossProfit: z.number(),
  profitMarginPercent: z.number(),
  revenuePerDay: z.number().default(0),
  expensePerDay: z.number().default(0),
  profitPerDay: z.number().default(0),
});

export const ProjectProfitabilityGetResponseSchema = z
  .looseObject({
    site: SiteSummarySchema,
    revenue: RevenueSchema,
    expenses: ExpensesSchema,
    profitability: ProfitabilitySchema,
  })
  .loose();
