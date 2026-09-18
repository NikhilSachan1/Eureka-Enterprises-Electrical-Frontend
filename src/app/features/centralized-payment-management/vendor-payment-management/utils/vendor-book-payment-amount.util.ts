import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { buildInvoiceTaxGstAmountSegments } from '@features/site-management/doc-management/sub-features/invoice-management/utils/invoice-table-row.util';
import { EDataType } from '@shared/types';
import type { IVendorOutstandingGetBaseResponseDto } from '../types/vendor-outstanding.dto';
import type { IVendorOutstandingUnbookedInvoice } from '../types/vendor-outstanding.interface';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

type IVendorOutstandingBookPaymentInvoice =
  IVendorOutstandingBookPayment['invoice'];

function toAmountString(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

type IVendorOutstandingPaidSource = {
  paidTotal?: number | null;
  bookedTotal?: number | null;
};

type IVendorOutstandingPaidBookPayment = {
  paymentTotalAmount: number;
  hasTransfer: boolean;
};

export function resolveVendorInvoicePaidTotal(
  invoice: IVendorOutstandingPaidSource | null | undefined,
  bookPayments: readonly IVendorOutstandingPaidBookPayment[] = []
): number {
  const bookedTotal = Number(invoice?.bookedTotal ?? 0);
  const paidViaTransfer = bookPayments
    .filter(bookPayment => bookPayment.hasTransfer)
    .reduce(
      (total, bookPayment) => total + Number(bookPayment.paymentTotalAmount ?? 0),
      0
    );
  const unpaidBooked = bookPayments
    .filter(bookPayment => !bookPayment.hasTransfer)
    .reduce(
      (total, bookPayment) => total + Number(bookPayment.paymentTotalAmount ?? 0),
      0
    );
  const derivedPaid = Math.max(
    paidViaTransfer,
    Math.max(0, bookedTotal - unpaidBooked)
  );
  const apiPaid = Number(invoice?.paidTotal ?? 0);

  return Math.max(apiPaid, derivedPaid);
}

export function buildVendorOutstandingInvoiceAmountSegments(
  invoice: IVendorOutstandingBookPaymentInvoice
): IDocAmountSegment[] {
  const segments = buildInvoiceTaxGstAmountSegments({
    taxableAmount: toAmountString(invoice.taxableAmount),
    tdsAmount: toAmountString(invoice.tdsAmount),
    tdsPercentage: invoice.tdsPercentage ?? '',
    gstAmount: toAmountString(invoice.gstAmount),
    gstPercentage: invoice.gstPercentage ?? '',
    totalAmount: toAmountString(invoice.totalAmount),
    isGstHold: invoice.isGstHold,
  });

  segments.push(
    {
      dataType: EDataType.CURRENCY,
      label: 'Net payable',
      value: invoice.netPayableAmount,
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'Booked',
      value: invoice.bookedTotal,
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'To be booked',
      value: invoice.pendingToBook,
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'Paid',
      value: resolveVendorInvoicePaidTotal(invoice),
    }
  );

  return segments;
}

export function mapVendorOutstandingUnbookedInvoiceToSummary(
  unbookedInvoice: IVendorOutstandingUnbookedInvoice
): IVendorOutstandingBookPaymentInvoice {
  return {
    id: unbookedInvoice.id,
    invoiceNumber: unbookedInvoice.invoiceNumber,
    invoiceDate: unbookedInvoice.invoiceDate,
    totalAmount: unbookedInvoice.totalAmount,
    taxableAmount: unbookedInvoice.taxableAmount,
    gstAmount: unbookedInvoice.gstAmount,
    gstPercentage: unbookedInvoice.gstPercentage,
    tdsAmount: unbookedInvoice.tdsAmount,
    tdsPercentage: unbookedInvoice.tdsPercentage,
    isGstHold: unbookedInvoice.isGstHold,
    netPayableAmount: unbookedInvoice.netPayableAmount,
    bookedTotal: unbookedInvoice.bookedTotal ?? 0,
    paidTotal: resolveVendorInvoicePaidTotal(unbookedInvoice),
    pendingToBook: unbookedInvoice.pendingToBook,
  };
}
