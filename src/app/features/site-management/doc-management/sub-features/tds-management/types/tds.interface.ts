import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { ITdsEntryGetBaseResponseDto } from './tds.dto';

export interface ITdsEntry
  extends Pick<
    ITdsEntryGetBaseResponseDto,
    'id' | 'partyType' | 'taxableAmount' | 'tdsAmount'
  > {
  invoiceDate: string;
  /** Invoice TDS rate shown beside the amount, e.g. "(2%)". */
  tdsRateSuffix: string;
  /** 26Q (purchase) / Form 26AS (sale) verification. */
  verificationStatusLabel: string;
  /** Purchase: Challan pending / Deposited. Sale: Deposited by client. */
  depositStatusLabel: string;
  verifyFileKeys: string[];
  docWorkspaceContext: IDocWorkspaceContextView;
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: ITdsEntryGetBaseResponseDto;
}
