import { IVendorGetBaseResponseDto } from './vendor.dto';

export interface IVendor
  extends Pick<
    IVendorGetBaseResponseDto,
    | 'id'
    | 'contactNumber'
    | 'pincode'
    | 'gstNumber'
    | 'vendorType'
    | 'name'
    | 'email'
    | 'vendorCode'
  > {
  status: string;
  stateCity: string;
  originalRawData: IVendorGetBaseResponseDto;
}
