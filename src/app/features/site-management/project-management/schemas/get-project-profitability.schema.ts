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
  totalPOValue: z.number().default(0),
  totalInvoiced: z.number().default(0),
  pendingToInvoice: z.number().default(0),
  collectedAmount: z.number().default(0),
  pendingCollection: z.number().default(0),
  collectionRate: z.number().default(0),
});

const ExpenseBreakdownItemSchema = z.looseObject({
  category: z.string().optional(),
  amount: z.number(),
  percentage: z.number().optional(),
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
  contractorExpenses: z.number().default(0),
  employeeExpenses: z.number().default(0),
  fuelExpenses: z.number().default(0),
  payrollCosts: z.number().default(0),
  breakdown: z.array(ExpenseBreakdownItemSchema).default([]),
  byCategory: z.array(ExpenseCategorySchema).default([]),
  byContractor: z.array(ExpenseContractorSchema).default([]),
});

const ProfitabilitySchema = z.looseObject({
  grossProfit: z.number(),
  profitMarginPercent: z.number(),
  revenuePerDay: z.number().default(0),
  expensePerDay: z.number().default(0),
  profitPerDay: z.number().default(0),
});

const DocumentTypeSummarySchema = z.looseObject({
  type: z.string().optional(),
  count: z.number().optional(),
});

const DocumentStatusSummarySchema = z.looseObject({
  status: z.string().optional(),
  count: z.number().optional(),
});

const DocumentSummarySchema = z.looseObject({
  totalDocuments: z.number().default(0),
  byType: z.array(DocumentTypeSummarySchema).default([]),
  byStatus: z.array(DocumentStatusSummarySchema).default([]),
});

const MonthlyTrendItemSchema = z.looseObject({
  month: z.string(),
  monthLabel: z.string(),
  revenue: z.number().default(0),
  contractorExpenses: z.number().default(0),
  employeeExpenses: z.number().default(0),
  fuelExpenses: z.number().default(0),
  payrollCosts: z.number().default(0),
  totalExpenses: z.number().default(0),
  profit: z.number().default(0),
});

export const ProjectProfitabilityGetResponseSchema = z
  .looseObject({
    site: SiteSummarySchema,
    revenue: RevenueSchema,
    expenses: ExpensesSchema,
    profitability: ProfitabilitySchema,
    documentSummary: DocumentSummarySchema.optional(),
    monthlyTrend: z.array(MonthlyTrendItemSchema).default([]),
  })
  .passthrough();
