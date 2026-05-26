import { onlyDateStringField, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ProjectProfitabilityGetRequestSchema = z
  .object({
    projectName: uuidField,
  })
  .strict()
  .transform(({ projectName }) => {
    return {
      siteId: projectName,
    };
  });

const SalesInvoiceSummaryItemSchema = z.looseObject({
  invoiceNumber: z.string(),
  invoiceDate: onlyDateStringField,
  poNumber: z.string(),
  clientName: z.string(),
  invoiceAmount: z.number(),
});

const VendorInvoiceSummaryItemSchema = z.looseObject({
  invoiceNumber: z.string(),
  invoiceDate: onlyDateStringField,
  poNumber: z.string(),
  vendorName: z.string(),
  invoiceAmount: z.number(),
});

const EmployeeWiseSummarySchema = z.looseObject({
  employeeName: z.string(),
  amount: z.number(),
});

const RegularExpenseEmployeeWiseSummarySchema = z.looseObject({
  employeeName: z.string(),
  employeeCode: z.string(),
  expenseType: z.string(),
  expenseAmount: z.number(),
});

const CategoryWiseSummarySchema = z.looseObject({
  categoryName: z.string(),
  amount: z.number(),
});

const SalesSummarySchema = z.looseObject({
  totalSalesPOValue: z.number(),
  totalSalesPOCount: z.number(),
  totalSalesInvoicedAmount: z.number(),
  totalSalesInvoiceCount: z.number(),
  salesUnbilledAmount: z.number(),
  billingCompletionPercentage: z.number(),
  salesInvoiceSummary: z.looseObject({
    totalSalesInvoiceAmount: z.number(),
    invoiceSummary: z.array(SalesInvoiceSummaryItemSchema),
  }),
});

const PurchaseSummarySchema = z.looseObject({
  totalPurchasePOValue: z.number(),
  totalPurchasePOCount: z.number(),
  totalVendorInvoicedAmount: z.number(),
  totalVendorInvoiceCount: z.number(),
  pendingVendorBillingAmount: z.number(),
  purchaseBillingCompletionPercentage: z.number(),
  vendorInvoiceSummary: z.looseObject({
    totalVendorInvoiceAmount: z.number(),
    invoiceSummary: z.array(VendorInvoiceSummaryItemSchema),
  }),
});

export const ProjectProfitabilityGetResponseSchema = z.looseObject({
  metaSummary: z.looseObject({
    salesSummary: SalesSummarySchema,
    purchaseSummary: PurchaseSummarySchema,
  }),
  expenseSummary: z.looseObject({
    employeeCost: z.looseObject({
      totalEmployeeCost: z.number(),
      employeeWiseSummary: z.array(EmployeeWiseSummarySchema),
    }),
    operationalExpense: z.looseObject({
      totalOperationalExpense: z.number(),
      regularExpense: z.looseObject({
        totalRegularExpense: z.number(),
        employeeWiseSummary: z.array(RegularExpenseEmployeeWiseSummarySchema),
        categoryWiseSummary: z.array(CategoryWiseSummarySchema),
      }),
      fuelExpense: z.looseObject({
        totalFuelExpense: z.number(),
        employeeWiseSummary: z.array(EmployeeWiseSummarySchema),
      }),
    }),
  }),
  paymentSummary: z.looseObject({
    salesPaymentSummary: z.looseObject({
      totalInvoicedAmount: z.number(),
      totalPaymentReceived: z.number(),
      outstandingReceivableAmount: z.number(),
    }),
    purchasePaymentSummary: z.looseObject({
      totalVendorInvoiceAmount: z.number(),
      totalPaymentPaid: z.number(),
      outstandingPayableAmount: z.number(),
    }),
  }),
  profitabilitySummary: z.looseObject({
    revenue: z.number(),
    projectCost: z.looseObject({
      vendorCost: z.number(),
      employeeCost: z.number(),
      operationalExpense: z.number(),
      totalProjectCost: z.number(),
    }),
    grossProfit: z.number(),
    netProfit: z.number(),
    profitMarginPercentage: z.number(),
    expenseRatioPercentage: z.number(),
  }),
});
