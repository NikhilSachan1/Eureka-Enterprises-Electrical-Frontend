import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import { ISiteAllocationGetBaseResponseDto } from './project.dto';

export interface ISiteAllocationHistory {
  id: string;
  docWorkspaceContext: IDocWorkspaceContextView;
  user: {
    fullName: string;
    employeeId: string;
  };
  role: string;
  allocationPeriod: Date[];
  lastUpdatedAt: Date;
  lastUpdatedBy: {
    fullName: string;
    employeeId: string;
  };
  allocationStatus: string;
  originalRawData: ISiteAllocationGetBaseResponseDto;
}
