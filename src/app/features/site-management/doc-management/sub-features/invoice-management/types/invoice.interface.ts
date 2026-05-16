import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IInvoiceGetBaseResponseDto } from './invoice.dto';

export interface IInvoice
  extends Pick<
    IInvoiceGetBaseResponseDto,
    | 'id'
    | 'invoiceNumber'
    | 'invoiceDate'
    | 'taxableAmount'
    | 'gstAmount'
    | 'totalAmount'
    | 'bookedTotal'
    | 'paidTotal'
    | 'fileKey'
    | 'approvalStatus'
    | 'isLocked'
    | 'unlockRequestedAt'
    | 'unlockRequestedByUser'
    | 'unlockReason'
    | 'contractor'
    | 'jmc'
    | 'gstPercentage'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  fileKeys: string[];
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IInvoiceGetBaseResponseDto;
}
