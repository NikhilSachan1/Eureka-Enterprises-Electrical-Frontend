import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

import { IReportGetBaseResponseDto } from './report.dto';

export interface IReport
  extends Pick<
    IReportGetBaseResponseDto,
    | 'id'
    | 'reportNumber'
    | 'reportDate'
    | 'contractor'
    | 'vendor'
    | 'site'
    | 'company'
    | 'jmc'
  > {
  siteCityStateSubtitle: string;
  fileKeys: string[];
  documentReferenceHierarchy: IDocReferenceHierarchyNode | null;
  originalRawData: IReportGetBaseResponseDto;
}
