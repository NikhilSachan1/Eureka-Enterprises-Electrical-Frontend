import { IDsrDetailGetResponseDto, IDsrGetBaseResponseDto } from './dsr.dto';
import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';

export interface IDsr
  extends Pick<
    IDsrGetBaseResponseDto,
    | 'id'
    | 'reportDate'
    | 'workTypes'
    | 'reportingEngineerName'
    | 'reportingEngineerContact'
    | 'remarks'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  user: IDsrGetBaseResponseDto['user'] & {
    fullName: string;
  };
  createdByUser?: IDsrGetBaseResponseDto['createdByUser'];
  dsrDocuments: string[];
  originalRawData: IDsrGetBaseResponseDto;
}

export interface IDsrDetailResolverResponse extends IDsrDetailGetResponseDto {
  preloadedFiles?: File[];
}
