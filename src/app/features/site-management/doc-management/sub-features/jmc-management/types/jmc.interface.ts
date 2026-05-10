import { IJmcGetBaseResponseDto } from './jmc.dto';

export interface IJmc
  extends Pick<
    IJmcGetBaseResponseDto,
    | 'id'
    | 'jmcNumber'
    | 'jmcDate'
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
  originalRawData: IJmcGetBaseResponseDto;
}
