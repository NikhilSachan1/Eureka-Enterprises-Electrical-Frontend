import { onlyDateStringField, uuidField } from '@shared/schemas';
import * as z from 'zod';

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

/** One invoice with its tax split and what has been settled against it. */
const InvoiceFinancialsSchema = z.looseObject({
  // "No invoice" entries carry no number.
  invoiceNumber: z
    .string()
    .nullable()
    .transform(value => {
      const number = value?.trim();
      // "No invoice" entries carry an empty or missing number.
      return number !== undefined && number !== '' ? number : 'No invoice no.';
    }),
  invoiceDate: onlyDateStringField,
  poNumber: z.string(),
  taxableAmount: z.number(),
  gstAmount: z.number(),
  tdsAmount: z.number(),
  /** Taxable + GST. */
  invoiceAmount: z.number(),
  settledAmount: z.number(),
  outstandingAmount: z.number(),
  isGstHold: z.boolean(),
});

const SalesInvoiceSummaryItemSchema = InvoiceFinancialsSchema.extend({
  clientName: z.string(),
});

const VendorInvoiceSummaryItemSchema = InvoiceFinancialsSchema.extend({
  vendorName: z.string(),
  vendorType: z.string().nullable(),
});

const EmployeeCostSummarySchema = z.looseObject({
  employeeName: z.string(),
  employeeCode: z.string().nullable(),
  workingDays: z.number(),
  perDayCost: z.number(),
  allocatedAmount: z.number(),
});

const RegularExpenseEmployeeWiseSummarySchema = z.looseObject({
  employeeName: z.string(),
  employeeCode: z.string(),
  expenseType: z.string(),
  expenseAmount: z.number(),
});

const FuelExpenseEmployeeWiseSummarySchema = z.looseObject({
  employeeName: z.string(),
  employeeCode: z.string(),
  vehicleNumber: z.string(),
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
    invoiceSummary: z.array(SalesInvoiceSummaryItemSchema),
  }),
});

const PurchaseSummarySchema = z.looseObject({
  totalPurchasePOValue: z.number(),
  totalPurchasePOCount: z.number(),
  totalVendorInvoicedAmount: z.number(),
  /** GST on freelancer (non-registered) vendor invoices — no input credit, so it is a cost. */
  nonCreditableGstAmount: z.number(),
  totalVendorInvoiceCount: z.number(),
  pendingVendorBillingAmount: z.number(),
  purchaseBillingCompletionPercentage: z.number(),
  vendorInvoiceSummary: z.looseObject({
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
      employeeWiseSummary: z.array(EmployeeCostSummarySchema),
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
        employeeWiseSummary: z.array(FuelExpenseEmployeeWiseSummarySchema),
      }),
    }),
  }),
  paymentSummary: z.looseObject({
    salesPaymentSummary: z.looseObject({
      totalInvoicedAmount: z.number(),
      tdsDeductedAmount: z.number(),
      netReceivableAmount: z.number(),
      totalPaymentReceived: z.number(),
      advanceAdjustedAmount: z.number(),
      outstandingReceivableAmount: z.number(),
    }),
    purchasePaymentSummary: z.looseObject({
      totalVendorInvoiceAmount: z.number(),
      tdsDeductedAmount: z.number(),
      netPayableAmount: z.number(),
      totalPaymentPaid: z.number(),
      advanceAdjustedAmount: z.number(),
      /** Advance already paid to vendors, not yet adjusted against an invoice. */
      advanceUnadjustedAmount: z.number(),
      outstandingPayableAmount: z.number(),
    }),
  }),
  profitabilitySummary: z.looseObject({
    basis: z.string(),
    revenue: z.number(),
    projectCost: z.looseObject({
      vendorCost: z.number(),
      employeeCost: z.number(),
      operationalExpense: z.number(),
      totalProjectCost: z.number(),
    }),
    gstSummary: z.looseObject({
      outputGst: z.number(),
      inputGstCredit: z.number(),
      nonCreditableGst: z.number(),
      netGstPayable: z.number(),
    }),
    grossProfit: z.number(),
    grossMarginPercentage: z.number(),
    netProfit: z.number(),
    profitMarginPercentage: z.number(),
    expenseRatioPercentage: z.number(),
  }),
});
