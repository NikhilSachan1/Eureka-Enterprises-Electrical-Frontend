import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IBankTransferGetBaseResponseDto } from './bank-transfer.dto';

export interface IBankTransfer
  extends Pick<
    IBankTransferGetBaseResponseDto,
    'id' | 'transferDate' | 'utrNumber' | 'transferAmount' | 'remarks'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  transferProofAttachmentKeys: string[];
  originalRawData: IBankTransferGetBaseResponseDto;
}
