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
  > {
  status: string;
  stateCity: string;
  originalRawData: IVendorGetBaseResponseDto;
}
