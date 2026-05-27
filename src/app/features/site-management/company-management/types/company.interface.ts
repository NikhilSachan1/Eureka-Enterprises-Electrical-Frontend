import { ICompanyGetBaseResponseDto } from './company.dto';

export interface ICompany extends Pick<ICompanyGetBaseResponseDto, 'id'> {
  companyName: string;
  status: string;
  stateCity: string;
  parentCompanyName: string | null;
  originalRawData: ICompanyGetBaseResponseDto;
}
