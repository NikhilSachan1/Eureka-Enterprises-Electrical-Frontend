import { IPoGetBaseResponseDto } from './po.dto';

export interface IPo
  extends Pick<
    IPoGetBaseResponseDto,
    | 'id'
    | 'poNumber'
    | 'poDate'
    | 'taxableAmount'
    | 'gstAmount'
    | 'totalAmount'
    | 'fileKey'
    | 'approvalStatus'
    | 'isLocked'
    | 'unlockRequestedAt'
    | 'unlockRequestedBy'
    | 'unlockReason'
    | 'invoicedTotal'
    | 'bookedTotal'
    | 'paidTotal'
    | 'lastInvoiceAt'
    | 'lastPaymentAt'
    | 'contractor'
    | 'vendor'
  > {
  fileKeys: string[];
  originalRawData: IPoGetBaseResponseDto;
}
