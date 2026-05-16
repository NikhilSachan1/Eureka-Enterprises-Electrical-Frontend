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
    | 'vendor'
    | 'site'
    | 'po'
    | 'company'
  > {
  siteCityStateSubtitle: string;
  fileKeys: string[];
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IJmcGetBaseResponseDto;
}
