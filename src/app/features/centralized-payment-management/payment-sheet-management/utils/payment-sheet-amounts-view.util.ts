import { formatCurrency } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import {
  IPaymentSheetAmountSegment,
  IPaymentSheetAmountStatus,
  IPaymentSheetAmountsView,
} from '@features/centralized-payment-management/shared/types/payment-sheet-amounts-cell.interface';
import { IPaymentSheetDetailItemRow } from '../types/payment-sheet-detail.interface';
import {
  getPaymentSheetAdvanceBreakdown,
  getPaymentSheetBalanceAfter,
  IPaymentSheetBalanceAfter,
  isPaymentSheetEmployeeSource,
} from './payment-sheet-advance.util';

const formatAmount = (value: number): string =>
  formatCurrency(
    value,
    APP_CONFIG.NUMBER_FORMATS.LOCALE,
    APP_CONFIG.CURRENCY_CONFIG.SYMBOL,
    APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    APP_CONFIG.NUMBER_FORMATS.WITH_DECIMALS
  );

const SETTLED_STATUS: IPaymentSheetAmountStatus = {
  tone: 'settled',
  label: 'Fully settled',
  amount: null,
};

function statusFromBalance(
  after: IPaymentSheetBalanceAfter
): IPaymentSheetAmountStatus {
  if (after.kind === 'due') {
    return { tone: 'due', label: 'Due after payment', amount: after.amount };
  }

  if (after.kind === 'advance') {
    return {
      tone: 'advance',
      label: 'Advance after payment',
      amount: after.amount,
    };
  }

  return SETTLED_STATUS;
}

/** Employee expense/fuel line: payable splits into due cleared and advance. */
function buildEmployeeLineView(
  row: IPaymentSheetDetailItemRow
): IPaymentSheetAmountsView {
  const split = getPaymentSheetAdvanceBreakdown(
    row.actualDue,
    row.payableAmount
  );

  if (split.payable <= 0) {
    return {
      label: 'Payable',
      amount: 0,
      caption:
        split.existingAdvance > 0
          ? `${formatAmount(split.existingAdvance)} advance held`
          : 'No due',
      segments: [],
      status: { tone: 'neutral', label: 'Amount not set', amount: null },
    };
  }

  let caption: string;
  let segments: IPaymentSheetAmountSegment[];

  if (split.existingAdvance > 0) {
    caption = `${formatAmount(split.existingAdvance)} held + ${formatAmount(split.newAdvance)} new advance`;
    segments = [
      {
        tone: 'advance-held',
        amount: split.existingAdvance,
        label: 'Advance held',
      },
      { tone: 'advance', amount: split.newAdvance, label: 'New advance' },
    ];
  } else {
    if (split.actualDue <= 0) {
      caption = 'No due · all as advance';
    } else if (split.newAdvance > 0) {
      caption = `${formatAmount(split.settledDue)} due + ${formatAmount(split.newAdvance)} advance`;
    } else if (split.remainingDue > 0) {
      caption = `of ${formatAmount(split.actualDue)} due`;
    } else {
      caption = `clears ${formatAmount(split.actualDue)} due`;
    }

    segments = [
      {
        tone: split.remainingDue > 0 ? 'payable' : 'settled',
        amount: split.settledDue,
        label: 'Clears due',
      },
      { tone: 'advance', amount: split.newAdvance, label: 'Advance' },
      { tone: 'due', amount: split.remainingDue, label: 'Due left' },
    ];
  }

  return {
    label: 'Payable',
    amount: split.payable,
    caption,
    segments,
    status: statusFromBalance(getPaymentSheetBalanceAfter(split)),
  };
}

/** Vendor advance document: payable counts against the advance amount already settled. */
function buildVendorAdvanceView(
  row: IPaymentSheetDetailItemRow
): IPaymentSheetAmountsView {
  const total = Math.max(0, row.actualDue);
  const settled = Math.max(0, row.settledAmount ?? 0);
  const isSettled = total > 0 && settled >= total;

  return {
    label: 'Payable',
    amount: row.payableAmount,
    caption: `of ${formatAmount(total)} advance`,
    segments: [
      { tone: 'settled', amount: Math.min(settled, total), label: 'Settled' },
      {
        tone: 'neutral',
        amount: Math.max(0, total - settled),
        label: 'Not settled',
      },
    ],
    status: isSettled
      ? SETTLED_STATUS
      : { tone: 'neutral', label: 'Settled so far', amount: settled },
  };
}

/** Vendor invoice, GST release or wallet line: payable against what is due. */
function buildDueLineView(
  row: IPaymentSheetDetailItemRow
): IPaymentSheetAmountsView {
  const remaining = Math.max(0, row.remainingAmount);

  return {
    label: 'Payable',
    amount: row.payableAmount,
    caption:
      remaining > 0
        ? `of ${formatAmount(row.actualDue)} due`
        : `clears ${formatAmount(row.actualDue)} due`,
    segments: [
      {
        tone: remaining > 0 ? 'payable' : 'settled',
        amount: row.payableAmount,
        label: 'This payment',
      },
      { tone: 'due', amount: remaining, label: 'Due left' },
    ],
    status:
      remaining > 0
        ? { tone: 'due', label: 'Due after payment', amount: remaining }
        : SETTLED_STATUS,
  };
}

export function buildPaymentSheetLineAmountsView(
  row: IPaymentSheetDetailItemRow
): IPaymentSheetAmountsView {
  if (isPaymentSheetEmployeeSource(row.sourceType)) {
    return buildEmployeeLineView(row);
  }

  if (row.documentKind === 'Advance') {
    return buildVendorAdvanceView(row);
  }

  return buildDueLineView(row);
}

/** Sheet list: total payable, how much of it is paid, and what is still pending. */
export function buildPaymentSheetTotalsAmountsView(
  payable: number,
  paid: number,
  pending: number
): IPaymentSheetAmountsView {
  return {
    label: 'Payable',
    amount: payable,
    caption: paid > 0 ? `${formatAmount(paid)} paid` : 'Nothing paid yet',
    segments: [
      { tone: 'paid', amount: paid, label: 'Paid' },
      { tone: 'due', amount: pending, label: 'Pending' },
    ],
    status:
      pending > 0
        ? { tone: 'due', label: 'Pending', amount: pending }
        : { tone: 'settled', label: 'Fully paid', amount: null },
  };
}
