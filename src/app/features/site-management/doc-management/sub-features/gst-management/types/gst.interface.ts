import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IGstEntryGetBaseResponseDto } from './gst.dto';

export interface IGstEntry
  extends Pick<
    IGstEntryGetBaseResponseDto,
    'id' | 'partyType' | 'taxableAmount' | 'gstAmount'
  > {
  invoiceDate: string;
  /** Invoice GST rate shown beside the amount, e.g. "(18%)". */
  gstRateSuffix: string;
  verificationStatusLabel: string;
  /** Held GST settlement: With payment / Release pending / Released / Receipt pending / Received. */
  settlementStatusLabel: string;
  verifyFileKeys: string[];
  docWorkspaceContext: IDocWorkspaceContextView;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IGstEntryGetBaseResponseDto;
}
