import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IAdvancePaymentLinkedDocView } from '../utils/advance-payment-table-row.util';
import { IAdvancePaymentGetBaseResponseDto } from './advance-payment.dto';

export interface IAdvancePayment
  extends Pick<
    IAdvancePaymentGetBaseResponseDto,
    | 'id'
    | 'advanceNumber'
    | 'approvalStatus'
    | 'amount'
    | 'advanceDate'
    | 'settledAmount'
    | 'balanceAmount'
    | 'po'
    | 'vendor'
    | 'site'
    | 'company'
  > {
  docWorkspaceContext: IDocWorkspaceContextView;
  poDoc: IAdvancePaymentLinkedDocView;
  fileKeys: string[];
  originalRawData: IAdvancePaymentGetBaseResponseDto;
}
