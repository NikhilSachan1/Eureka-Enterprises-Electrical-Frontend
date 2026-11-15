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
  /** Null when no one is recorded, so the table shows an empty cell instead of an avatar. */
  lastUpdatedBy: {
    fullName: string;
    employeeId: string;
  } | null;
  allocationStatus: string;
  originalRawData: ISiteAllocationGetBaseResponseDto;
}
