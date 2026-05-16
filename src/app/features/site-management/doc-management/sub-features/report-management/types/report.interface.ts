import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IReportGetBaseResponseDto } from './report.dto';

export interface IReport
  extends Pick<
    IReportGetBaseResponseDto,
    'id' | 'reportNumber' | 'reportDate' | 'contractor' | 'jmc'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  fileKeys: string[];
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IReportGetBaseResponseDto;
}
