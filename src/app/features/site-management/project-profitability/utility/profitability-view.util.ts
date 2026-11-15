import {
  IProfitabilityBillingLine,
  IProfitabilityCashFlow,
  IProfitabilityCostShare,
  IProfitabilityStatementLine,
  IProfitabilityView,
  IProjectProfitabilityReport,
  TProfitabilityTone,
} from '../types/project-profitability.interface';

/** One colour per figure, the same in the statement, the charts and the breakdown tabs. */
export const PROFITABILITY_TONE_COLORS: Record<TProfitabilityTone, string> = {
  revenue: '#16a34a',
  vendor: '#6366f1',
  employee: '#0ea5e9',
  fuel: '#f59e0b',
  expense: '#ec4899',
  profit: '#16a34a',
  loss: '#dc2626',
};

/**
 * Turns the API report into what the page shows: a P&L statement where every line says how it was
 * worked out, the cost split of revenue, the GST position, and the money still to receive / pay.
 */
export function buildProfitabilityView(
  report: IProjectProfitabilityReport
): IProfitabilityView {
  const profit = report.profitabilitySummary;
  const cost = profit.projectCost;
  const ops = report.expenseSummary.operationalExpense;
  const sales = report.metaSummary.salesSummary;
  const purchase = report.metaSummary.purchaseSummary;
  const fuel = ops.fuelExpense.totalFuelExpense;
  const otherExpense = ops.regularExpense.totalRegularExpense;
  const isLoss = profit.netProfit < 0;

  const vendorHint = purchase.nonCreditableGstAmount
    ? 'Value of work on vendor invoices, GST excluded. Includes GST on freelancer invoices, which gives no input credit.'
    : 'Value of work on vendor invoices, GST excluded (GST comes back as input credit).';

  const statement: IProfitabilityStatementLine[] = [
    {
      key: 'revenue',
      kind: 'revenue',
      label: 'Revenue',
      icon: 'pi pi-file-export',
      tone: 'revenue',
      hint: `Value of work billed to the contractor on ${countLabel(sales.totalSalesInvoiceCount, 'approved sales invoice')}, GST excluded.`,
      amount: profit.revenue,
      detail: { type: 'sales-invoices', title: 'Sales invoices' },
    },
    {
      key: 'vendor',
      kind: 'cost',
      label: 'Vendor cost',
      icon: 'pi pi-file-import',
      tone: 'vendor',
      hint: `${vendorHint} ${countLabel(purchase.totalVendorInvoiceCount, 'approved invoice')}.`,
      amount: cost.vendorCost,
      share: share(cost.vendorCost, profit.revenue),
      detail: { type: 'vendor-invoices', title: 'Vendor invoices' },
    },
    {
      key: 'gross',
      kind: 'subtotal',
      label: 'Gross profit',
      icon: 'pi pi-chart-bar',
      tone: profit.grossProfit < 0 ? 'loss' : 'profit',
      hint: 'Revenue − vendor cost. What the work itself earns before site running costs.',
      amount: profit.grossProfit,
      margin: profit.grossMarginPercentage,
    },
    {
      key: 'employee',
      kind: 'cost',
      label: 'Employee cost',
      icon: 'pi pi-users',
      tone: 'employee',
      hint: 'Salary of staff allocated to this site, for the days they were on site, at company cost (gross pay − LOP + employer PF).',
      amount: cost.employeeCost,
      share: share(cost.employeeCost, profit.revenue),
      detail: { type: 'employee-cost', title: 'Employee cost' },
    },
    {
      key: 'fuel',
      kind: 'cost',
      label: 'Fuel',
      icon: 'pi pi-car',
      tone: 'fuel',
      hint: 'Approved fuel filled by site staff while allocated to this site.',
      amount: fuel,
      share: share(fuel, profit.revenue),
      detail: { type: 'fuel-employee', title: 'Fuel expense' },
    },
    {
      key: 'expense',
      kind: 'cost',
      label: 'Site expenses',
      icon: 'pi pi-receipt',
      tone: 'expense',
      hint: 'Approved expenses tagged to this site or claimed by its staff while allocated here.',
      amount: otherExpense,
      share: share(otherExpense, profit.revenue),
      detail: { type: 'regular-expense-detail', title: 'Site expenses' },
    },
    {
      key: 'net',
      kind: 'total',
      label: isLoss ? 'Net loss' : 'Net profit',
      icon: isLoss ? 'pi pi-arrow-down-right' : 'pi pi-arrow-up-right',
      tone: isLoss ? 'loss' : 'profit',
      hint: 'Gross profit − employee cost − fuel − site expenses.',
      amount: profit.netProfit,
      margin: profit.profitMarginPercentage,
    },
  ];

  return {
    isLoss,
    statement,
    costShares: buildCostShares(report, fuel, otherExpense),
    gst: profit.gstSummary,
    receivable: buildReceivable(report),
    payable: buildPayable(report),
    billing: buildBilling(report),
  };
}

function buildCostShares(
  report: IProjectProfitabilityReport,
  fuel: number,
  otherExpense: number
): IProfitabilityCostShare[] {
  const profit = report.profitabilitySummary;
  const cost = profit.projectCost;
  // A loss means costs exceed revenue — the split then spans the costs, and there is no profit slice.
  const base = Math.max(profit.revenue, cost.totalProjectCost);
  const slices: Omit<IProfitabilityCostShare, 'percent'>[] = [
    {
      key: 'vendor',
      label: 'Vendor cost',
      color: PROFITABILITY_TONE_COLORS.vendor,
      amount: cost.vendorCost,
    },
    {
      key: 'employee',
      label: 'Employee cost',
      color: PROFITABILITY_TONE_COLORS.employee,
      amount: cost.employeeCost,
    },
    {
      key: 'fuel',
      label: 'Fuel',
      color: PROFITABILITY_TONE_COLORS.fuel,
      amount: fuel,
    },
    {
      key: 'expense',
      label: 'Site expenses',
      color: PROFITABILITY_TONE_COLORS.expense,
      amount: otherExpense,
    },
    {
      key: 'profit',
      label: 'Net profit',
      color: PROFITABILITY_TONE_COLORS.profit,
      amount: Math.max(profit.netProfit, 0),
    },
  ];

  return slices
    .filter(slice => slice.amount > 0)
    .map(slice => ({
      ...slice,
      percent: base > 0 ? (slice.amount / base) * 100 : 0,
    }));
}

function buildReceivable(
  report: IProjectProfitabilityReport
): IProfitabilityCashFlow {
  const pay = report.paymentSummary.salesPaymentSummary;
  const settled = pay.totalPaymentReceived + pay.advanceAdjustedAmount;
  return {
    side: 'in',
    title: 'To receive from contractor',
    subtitle: 'Money coming in against sales invoices',
    settled,
    settledLabel: 'received',
    steps: [
      {
        label: 'Invoiced to contractor',
        hint: 'Sales invoice totals, GST included.',
        amount: pay.totalInvoicedAmount,
      },
      {
        label: 'TDS deducted by contractor',
        hint: 'The contractor deposits this with the government. It shows in Form 26AS, not in the bank.',
        amount: pay.tdsDeductedAmount,
        sign: 'minus',
      },
      {
        label: 'Expected in bank',
        amount: pay.netReceivableAmount,
        sign: 'equals',
      },
      {
        label: 'Received so far',
        hint: 'Bank receipts against these invoices, including held GST received later.',
        amount: pay.totalPaymentReceived,
        sign: 'minus',
      },
      ...(pay.advanceAdjustedAmount
        ? [
            {
              label: 'Advance adjusted',
              amount: pay.advanceAdjustedAmount,
              sign: 'minus' as const,
            },
          ]
        : []),
    ],
    outstandingLabel: 'Still to receive',
    outstanding: pay.outstandingReceivableAmount,
    progress: share(settled, pay.netReceivableAmount),
    note: null,
  };
}

function buildPayable(
  report: IProjectProfitabilityReport
): IProfitabilityCashFlow {
  const pay = report.paymentSummary.purchasePaymentSummary;
  const settled = pay.totalPaymentPaid + pay.advanceAdjustedAmount;
  return {
    side: 'out',
    title: 'To pay vendors',
    subtitle: 'Money going out against vendor invoices',
    settled,
    settledLabel: 'paid',
    steps: [
      {
        label: 'Vendor invoiced',
        hint: 'Vendor invoice totals, GST included.',
        amount: pay.totalVendorInvoiceAmount,
      },
      {
        label: 'TDS deducted by us',
        hint: 'We deposit this with the government by challan. It is not paid to the vendor.',
        amount: pay.tdsDeductedAmount,
        sign: 'minus',
      },
      {
        label: 'Due to vendors',
        amount: pay.netPayableAmount,
        sign: 'equals',
      },
      {
        label: 'Paid so far',
        hint: 'Bank transfers against these invoices, including held GST released later.',
        amount: pay.totalPaymentPaid,
        sign: 'minus',
      },
      ...(pay.advanceAdjustedAmount
        ? [
            {
              label: 'Advance adjusted',
              amount: pay.advanceAdjustedAmount,
              sign: 'minus' as const,
            },
          ]
        : []),
    ],
    outstandingLabel: 'Still to pay',
    outstanding: pay.outstandingPayableAmount,
    progress: share(settled, pay.netPayableAmount),
    note: pay.advanceUnadjustedAmount
      ? {
          amount: pay.advanceUnadjustedAmount,
          text: 'already paid to vendors as advance, waiting for their invoices. It is counted in cost once the invoice is approved.',
        }
      : null,
  };
}

function buildBilling(
  report: IProjectProfitabilityReport
): IProfitabilityBillingLine[] {
  const sales = report.metaSummary.salesSummary;
  const purchase = report.metaSummary.purchaseSummary;
  return [
    {
      key: 'sales',
      label: 'Contractor billing',
      poLabel: countLabel(sales.totalSalesPOCount, 'sales PO'),
      poValue: sales.totalSalesPOValue,
      invoiced: sales.totalSalesInvoicedAmount,
      remainingLabel: 'Not billed yet',
      remaining: sales.salesUnbilledAmount,
      percent: Math.min(sales.billingCompletionPercentage, 100),
    },
    {
      key: 'purchase',
      label: 'Vendor billing',
      poLabel: countLabel(purchase.totalPurchasePOCount, 'purchase PO'),
      poValue: purchase.totalPurchasePOValue,
      invoiced: purchase.totalVendorInvoicedAmount,
      remainingLabel: 'Not invoiced by vendors yet',
      remaining: purchase.pendingVendorBillingAmount,
      percent: Math.min(purchase.purchaseBillingCompletionPercentage, 100),
    },
  ];
}

function share(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

function countLabel(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
