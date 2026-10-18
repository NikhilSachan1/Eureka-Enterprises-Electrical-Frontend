import { IUserDelegationGetBaseResponseDto } from './user-delegation.dto';

export interface IUserDelegation
  extends Pick<
    IUserDelegationGetBaseResponseDto,
    'id' | 'managerName' | 'memberName'
  > {
  grantedByName: string;
  managerEmployeeId: string;
  memberEmployeeId: string;
  moduleLabel: string;
  createdAt: Date | null;
  originalRawData: IUserDelegationGetBaseResponseDto;
}
