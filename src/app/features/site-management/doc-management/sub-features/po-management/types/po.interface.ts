import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';

import { IPoGetBaseResponseDto } from './po.dto';

export interface IPo
  extends Pick<
    IPoGetBaseResponseDto,
    | 'id'
    | 'poNumber'
    | 'poDate'
    | 'taxableAmount'
    | 'gstPercentage'
    | 'gstAmount'
    | 'totalAmount'
    | 'fileKey'
    | 'approvalStatus'
    | 'isLocked'
    | 'unlockRequestedAt'
    | 'unlockRequestedByUser'
    | 'unlockReason'
    | 'invoicedTotal'
    | 'bookedTotal'
    | 'paidTotal'
    | 'lastInvoiceAt'
    | 'lastPaymentAt'
    | 'contractor'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  fileKeys: string[];
  originalRawData: IPoGetBaseResponseDto;
}
