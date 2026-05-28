import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import { ISiteAllocationGetBaseResponseDto } from './project.dto';

export interface ISiteAllocationHistory {
  id: string;
  docWorkspaceContext: IDocWorkspaceContextView;
  user: {
    fullName: string;
    employeeId: string;
  };
  allocationPeriod: Date[];
  createdAt: Date;
  allocationStatus: string;
  originalRawData: ISiteAllocationGetBaseResponseDto;
}
