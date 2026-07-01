import { ICompanyBankAccountGetBaseResponseDto } from './company-bank-account.dto';

export interface ICompanyBankAccount
  extends Pick<
    ICompanyBankAccountGetBaseResponseDto,
    | 'id'
    | 'bankName'
    | 'accountNumber'
    | 'accountHolderName'
    | 'ifscCode'
    | 'branchName'
    | 'isActive'
  > {
  bankNameDisplay: string;
  status: string;
  addedAt: string;
  originalRawData: ICompanyBankAccountGetBaseResponseDto;
}
