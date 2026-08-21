import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import { IPaymentRequestGetBaseResponseDto } from './payment-request.dto';

export interface IPaymentRequest
  extends Pick<
    IPaymentRequestGetBaseResponseDto,
    | 'id'
    | 'status'
    | 'requestedAmount'
    | 'approvedAmount'
    | 'reason'
    | 'invoice'
    | 'vendor'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  invoiceNumber: string;
  originalRawData: IPaymentRequestGetBaseResponseDto;
}
