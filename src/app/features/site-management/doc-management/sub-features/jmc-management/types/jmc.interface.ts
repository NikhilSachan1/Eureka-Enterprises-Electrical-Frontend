import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IJmcGetBaseResponseDto } from './jmc.dto';

export interface IJmc
  extends Pick<
    IJmcGetBaseResponseDto,
    | 'id'
    | 'jmcNumber'
    | 'jmcDate'
    | 'fileKey'
    | 'approvalStatus'
    | 'isLocked'
    | 'unlockRequestedAt'
    | 'unlockRequestedByUser'
    | 'unlockReason'
    | 'contractor'
    | 'po'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  fileKeys: string[];
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IJmcGetBaseResponseDto;
}
