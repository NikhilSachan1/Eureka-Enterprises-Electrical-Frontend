import { IContractorGetBaseResponseDto } from './contractor.dto';

export interface IContractor
  extends Pick<IContractorGetBaseResponseDto, 'id' | 'contactNumber'> {
  contractorName: string;
  emailAddress: string | null;
  status: string;
  stateCity: string;
  pincode: string;
  originalRawData: IContractorGetBaseResponseDto;
}
