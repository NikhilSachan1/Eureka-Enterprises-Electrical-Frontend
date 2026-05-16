import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IBookPaymentGetBaseResponseDto } from './book-payment.dto';

export interface IBookPayment
  extends Pick<
    IBookPaymentGetBaseResponseDto,
    | 'id'
    | 'bookingDate'
    | 'invoice'
    | 'taxableAmount'
    | 'gstAmount'
    | 'gstPercentage'
    | 'tdsDeductionAmount'
    | 'tdsPercentage'
    | 'paymentTotalAmount'
    | 'hasTransfer'
    | 'paymentHoldReason'
  > {
  transferStatusLabel: string;
  paymentHoldReasonDisplay: string;
  docWorkspaceContext: IDocWorkspaceContextView;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IBookPaymentGetBaseResponseDto;
}
