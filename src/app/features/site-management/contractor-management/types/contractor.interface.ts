import { IContractorGetBaseResponseDto } from './contractor.dto';

export interface IContractor
  extends Pick<
    IContractorGetBaseResponseDto,
    'id' | 'contactNumber' | 'gstNumber' | 'name' | 'email'
  > {
  status: string;
  stateCity: string;
  originalRawData: IContractorGetBaseResponseDto;
}
