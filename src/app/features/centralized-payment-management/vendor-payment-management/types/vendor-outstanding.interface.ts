import { IVendorOutstandingGetBaseResponseDto } from './vendor-outstanding.dto';

export interface IVendorOutstanding
  extends Omit<
    IVendorOutstandingGetBaseResponseDto,
    'vendorId' | 'vendorName'
  > {
  id: string;
  vendorName: string;
  transactionType?: 'credit' | 'debit';
  originalRawData: IVendorOutstandingGetBaseResponseDto;
}
