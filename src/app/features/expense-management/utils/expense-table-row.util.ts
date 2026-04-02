import { IExpenseGetBaseResponseDto } from '@features/expense-management/types/expense.dto';
import { EApprovalStatus } from '@shared/types';

/**
 * Normalizes approval status from API/UI (e.g. `Pending` vs `pending`) for comparison.
 */
export function normalizeExpenseApprovalStatus(
  status: string | null | undefined
): string {
  return (status?.toLowerCase() ?? '').trim();
}

/**
 * `true` when the expense is in **pending** approval (e.g. edit allowed).
 */
export function isExpenseApprovalPending(approvalStatus: string): boolean {
  return (
    normalizeExpenseApprovalStatus(approvalStatus) === EApprovalStatus.PENDING
  );
}

/**
 * For table row / bulk **`disableWhen`**: `true` when the action must be disabled because status is **not** pending.
 * Use for Edit, Delete, Approve, Reject when they should only apply while pending.
 */
export function disableExpenseWhenNotPendingApproval(
  row: IExpenseGetBaseResponseDto
): boolean {
  return !isExpenseApprovalPending(row.approvalStatus);
}
