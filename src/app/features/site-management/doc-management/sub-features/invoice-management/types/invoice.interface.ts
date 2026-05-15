import { IInvoiceGetBaseResponseDto } from './invoice.dto';

export interface IInvoice
  extends Pick<
    IInvoiceGetBaseResponseDto,
    | 'id'
    | 'invoiceNumber'
    | 'invoiceDate'
    | 'taxableAmount'
    | 'gstAmount'
    | 'totalAmount'
    | 'bookedTotal'
    | 'paidTotal'
    | 'fileKey'
    | 'approvalStatus'
    | 'isLocked'
    | 'unlockRequestedAt'
    | 'unlockRequestedByUser'
    | 'unlockReason'
    | 'contractor'
    | 'vendor'
    | 'site'
    | 'jmc'
    | 'gstPercentage'
    | 'company'
  > {
  siteCityStateSubtitle: string;
  fileKeys: string[];
  originalRawData: IInvoiceGetBaseResponseDto;
}
