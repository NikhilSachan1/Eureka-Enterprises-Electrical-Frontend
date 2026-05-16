import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IBookPaymentGetBaseResponseDto } from './book-payment.dto';

export interface IBookPayment
  extends Pick<
    IBookPaymentGetBaseResponseDto,
    | 'id'
    | 'bookingDate'
    | 'invoiceId'
    | 'invoice'
    | 'taxableAmount'
    | 'gstAmount'
    | 'gstPercentage'
    | 'tdsDeductionAmount'
    | 'tdsPercentage'
    | 'paymentTotalAmount'
    | 'hasTransfer'
    | 'vendor'
    | 'site'
    | 'paymentHoldReason'
  > {
  company: IBookPaymentGetBaseResponseDto['site']['company'];
  siteCityStateSubtitle: string;
  transferStatusLabel: string;
  paymentHoldReasonDisplay: string;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IBookPaymentGetBaseResponseDto;
}
