import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IInvoiceGetBaseResponseDto } from './invoice.dto';

/** Server-computed money position of an invoice (paid, advance, GST, TDS, balance). */
export type IInvoicePaymentSummary = NonNullable<
  IInvoiceGetBaseResponseDto['paymentSummary']
>;

export interface IInvoice
  extends Pick<
    IInvoiceGetBaseResponseDto,
    | 'id'
    | 'invoiceNumber'
    | 'invoiceDate'
    | 'taxableAmount'
    | 'tdsAmount'
    | 'tdsPercentage'
    | 'gstAmount'
    | 'totalAmount'
    | 'bookedTotal'
    | 'paidTotal'
    | 'advanceSettledAmount'
    | 'fileKey'
    | 'approvalStatus'
    | 'isLocked'
    | 'unlockRequestedAt'
    | 'unlockRequestedByUser'
    | 'unlockReason'
    | 'contractor'
    | 'jmc'
    | 'gstPercentage'
    | 'isGstHold'
    | 'partyType'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  fileKeys: string[];
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IInvoiceGetBaseResponseDto;
}
