import {
  getPoUninvoicedAmount,
  getSalesPaymentNextMissing,
  needsAdditionalBookPayment,
} from './project-document-status-chain.util';
import {
  IPoBreakdownBookPayment,
  IPoBreakdownInvoice,
  IPoBreakdownRecord,
  IPoPanelMetric,
  IPoPanelMetrics,
} from '../types/po-breakdown.interface';

function countPoApproved(status: string): number {
  return status.toUpperCase() === 'APPROVED' ? 1 : 0;
}

function approvalTone(done: number, total: number): 'ok' | 'warn' | 'danger' {
  if (total <= 0) {
    return 'warn';
  }
  if (done >= total) {
    return 'ok';
  }
  if (done <= 0) {
    return 'danger';
  }
  return 'warn';
}

export function buildPoPanelMetrics(
  record: IPoBreakdownRecord,
  isSales: boolean,
  formatCurrency: (value: number) => string
): IPoPanelMetrics {
  const c = record.counts;
  const invoicePaymentDue = Math.max(c.amounts.invoiceTotal - c.amounts.paid, 0);
  const uninvoicedAmount = getPoUninvoicedAmount(record);
  const amountDue = isSales ? uninvoicedAmount : invoicePaymentDue;

  const poApproved = countPoApproved(record.status);

  const approvals: IPoPanelMetric[] = [
    {
      label: 'PO',
      value: `${poApproved}/1`,
      tone: approvalTone(poApproved, 1),
    },
    {
      label: 'JMC',
      value: `${c.jmc.approved}/${c.jmc.total}`,
      tone: approvalTone(c.jmc.approved, c.jmc.total),
    },
    {
      label: 'Report',
      value: `${c.report.present}/${c.report.applicable}`,
      tone: approvalTone(c.report.present, c.report.applicable),
    },
    {
      label: 'Invoice',
      value: `${c.invoice.approved}/${c.invoice.total}`,
      tone: approvalTone(c.invoice.approved, c.invoice.total),
    },
    ...(isSales
      ? [buildSalesPaymentMetric(record)]
      : [buildPurchaseBookPaymentMetric(record), buildPurchasePaymentMetric(record)]),
  ];

  const amounts: IPoPanelMetric[] = [
    {
      label: 'PO Amount',
      value: formatCurrency(record.totalAmount),
      tone: record.totalAmount > 0 ? 'ok' : null,
    },
    { label: 'Invoiced', value: formatCurrency(c.amounts.invoiceTotal) },
    ...(isSales
      ? []
      : [{ label: 'Booked', value: formatCurrency(c.amounts.booked) }]),
    {
      label: isSales ? 'To invoice' : 'Invoice to pay',
      value: formatCurrency(amountDue),
      tone: amountDue > 0 ? 'warn' : 'ok',
    },
    {
      label: isSales ? 'Invoice received' : 'Invoice paid',
      value: formatCurrency(c.amounts.paid),
      tone: c.amounts.paid > 0 ? 'ok' : null,
    },
  ];

  return { approvals, amounts };
}

function buildSalesPaymentMetric(record: IPoBreakdownRecord): IPoPanelMetric {
  const invoices = record.jmcs
    .map(jmc => jmc.invoice)
    .filter(
      (invoice): invoice is IPoBreakdownInvoice =>
        invoice !== null && invoice.totalAmount > 0
    );

  if (!invoices.length) {
    return { label: 'Payment', value: '—' };
  }

  const received = invoices.reduce(
    (total, invoice) => total + invoice.bankTransfers.length,
    0
  );
  const missing = invoices.filter(
    invoice => getSalesPaymentNextMissing(invoice) !== null
  ).length;
  const expected = received + missing;

  return {
    label: 'Payment',
    value: `${received}/${expected}`,
    tone: missing > 0 ? 'warn' : received >= expected && expected > 0 ? 'ok' : null,
  };
}

function buildPurchaseBookPaymentMetric(
  record: IPoBreakdownRecord
): IPoPanelMetric {
  const invoices = getPurchaseInvoicesWithAmount(record);

  if (!invoices.length) {
    return { label: 'Book Payment', value: '—' };
  }

  const booked = invoices.filter(invoice => invoice.bookPayments.length > 0).length;
  const missing = invoices.filter(invoice => needsAdditionalBookPayment(invoice)).length;
  const expected = booked + missing;

  return {
    label: 'Book Payment',
    value: `${booked}/${expected}`,
    tone: missing > 0 ? 'warn' : booked >= expected && expected > 0 ? 'ok' : null,
  };
}

function buildPurchasePaymentMetric(record: IPoBreakdownRecord): IPoPanelMetric {
  const bookPayments = record.jmcs.flatMap(
    jmc => jmc.invoice?.bookPayments ?? []
  );

  if (!bookPayments.length) {
    return { label: 'Payment', value: '—' };
  }

  const settled = bookPayments.filter(isBookPaymentTransferred).length;
  const missing = bookPayments.filter(bookPayment => !isBookPaymentTransferred(bookPayment)).length;
  const expected = settled + missing;

  return {
    label: 'Payment',
    value: `${settled}/${expected}`,
    tone: missing > 0 ? 'warn' : settled >= expected ? 'ok' : null,
  };
}

function getPurchaseInvoicesWithAmount(
  record: IPoBreakdownRecord
): IPoBreakdownInvoice[] {
  return record.jmcs
    .map(jmc => jmc.invoice)
    .filter(
      (invoice): invoice is IPoBreakdownInvoice =>
        invoice !== null && invoice.totalAmount > 0
    );
}

function isBookPaymentTransferred(bookPayment: IPoBreakdownBookPayment): boolean {
  return bookPayment.bankTransfers.length > 0 || bookPayment.hasTransfer;
}
