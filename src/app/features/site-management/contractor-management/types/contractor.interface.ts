import { IContractorGetBaseResponseDto } from './contractor.dto';

export interface IContractor
  extends Pick<
    IContractorGetBaseResponseDto,
    'id' | 'contactNumber' | 'pincode' | 'emailAddress' | 'gstNumber' | 'name'
  > {
  status: string;
  stateCity: string;
  originalRawData: IContractorGetBaseResponseDto;
}
