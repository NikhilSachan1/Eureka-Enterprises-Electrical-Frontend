import { IPoGetBaseResponseDto } from './po.dto';

export interface IPo
  extends Pick<
    IPoGetBaseResponseDto,
    | 'id'
    | 'poNumber'
    | 'poDate'
    | 'taxableAmount'
    | 'gstPercentage'
    | 'gstAmount'
    | 'totalAmount'
    | 'fileKey'
    | 'approvalStatus'
    | 'isLocked'
    | 'unlockRequestedAt'
    | 'unlockRequestedByUser'
    | 'unlockReason'
    | 'invoicedTotal'
    | 'bookedTotal'
    | 'paidTotal'
    | 'lastInvoiceAt'
    | 'lastPaymentAt'
    | 'contractor'
    | 'vendor'
    | 'site'
  > {
  company: {
    name: string;
  };
  siteCityStateSubtitle: string;
  fileKeys: string[];
  originalRawData: IPoGetBaseResponseDto;
}
