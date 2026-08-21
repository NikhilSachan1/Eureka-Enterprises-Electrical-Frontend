import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IPaymentRequestLinkedDocView } from '../utils/payment-request-table-row.util';
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
  invoiceDoc: IPaymentRequestLinkedDocView;
  poDoc: IPaymentRequestLinkedDocView;
  originalRawData: IPaymentRequestGetBaseResponseDto;
}
