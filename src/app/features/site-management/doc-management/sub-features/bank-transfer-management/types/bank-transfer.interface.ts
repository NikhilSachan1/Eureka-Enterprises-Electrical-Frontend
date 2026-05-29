import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IBankTransferGetBaseResponseDto } from './bank-transfer.dto';

export interface IBankTransfer
  extends Pick<
    IBankTransferGetBaseResponseDto,
    'id' | 'transferDate' | 'utrNumber' | 'transferAmount' | 'remarks'
  > {
  /** Present on sales rows when API returns TDS breakdown. */
  tdsDeducted?: string | null;
  tdsPercentage?: string | null;
  docWorkspaceContext: IDocWorkspaceContextView;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  transferProofAttachmentKeys: string[];
  paymentAdviceReferenceNumber: string | null;
  paymentAdvicePdfKeys: string[];
  originalRawData: IBankTransferGetBaseResponseDto;
}
