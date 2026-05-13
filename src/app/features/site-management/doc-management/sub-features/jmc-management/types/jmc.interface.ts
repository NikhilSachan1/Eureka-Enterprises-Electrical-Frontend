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
  originalRawData: IJmcGetBaseResponseDto;
}
