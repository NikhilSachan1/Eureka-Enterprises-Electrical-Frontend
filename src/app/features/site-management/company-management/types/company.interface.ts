import { ICompanyGetBaseResponseDto } from './company.dto';

export interface ICompany
  extends Pick<ICompanyGetBaseResponseDto, 'id' | 'contactNumber'> {
  companyName: string;
  emailAddress: string | null;
  status: string;
  stateCity: string;
  pincode: string;
  parentCompanyName: string | null;
  originalRawData: ICompanyGetBaseResponseDto;
}
