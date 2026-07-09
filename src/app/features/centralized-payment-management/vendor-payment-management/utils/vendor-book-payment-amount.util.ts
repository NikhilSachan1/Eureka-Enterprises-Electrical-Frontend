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
    }
  );

  if (invoice.paidTotal !== null) {
    segments.push({
      dataType: EDataType.CURRENCY,
      label: 'Paid',
      value: invoice.paidTotal,
    });
  }

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
    paidTotal: unbookedInvoice.paidTotal,
    pendingToBook: unbookedInvoice.pendingToBook,
  };
}
