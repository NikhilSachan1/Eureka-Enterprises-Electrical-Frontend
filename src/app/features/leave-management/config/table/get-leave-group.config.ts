import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import {
  ILeaveGetBaseResponseDto,
  ILeaveGroupGetBaseResponseDto,
} from '../../types/leave.dto';
import {
  ALREADY_APPROVED_REASON,
  ALREADY_CANCELLED_REASON,
  ALREADY_REJECTED_REASON,
  CANCEL_NOT_ALLOWED_LEAVE_DATE_PAST_ROW_REASON,
  CANCEL_NOT_FOR_REJECTED_REASON,
  PAYROLL_LOCKED_ROW_REASON,
  REJECTED_LEAVE_CANNOT_BE_APPROVED_REASON,
  getLeaveApproveDisableReason,
  getLeaveCancelDisableReason,
  getLeaveRejectDisableReason,
  LEAVE_TABLE_HEADER_CONFIG,
  LEAVE_TABLE_ROW_ACTIONS_CONFIG,
  shouldDisableLeaveApprove,
  shouldDisableLeaveCancel,
  shouldDisableLeaveReject,
} from './get-leave.config';

type TLeaveDay = ILeaveGetBaseResponseDto;
type TLeaveGroup = ILeaveGroupGetBaseResponseDto;

/** Per-day rules for each action (a day is acted on only when its own rule allows it). */
const DAY_RULES: Partial<
  Record<
    EButtonActionType,
    {
      isDisabled: (day: TLeaveDay) => boolean;
      reason: (day: TLeaveDay) => string | undefined;
      none: string;
    }
  >
> = {
  [EButtonActionType.APPROVE]: {
    isDisabled: shouldDisableLeaveApprove,
    reason: getLeaveApproveDisableReason,
    none: 'No day of this leave can be approved.',
  },
  [EButtonActionType.REJECT]: {
    isDisabled: shouldDisableLeaveReject,
    reason: getLeaveRejectDisableReason,
    none: 'No day of this leave can be rejected.',
  },
  [EButtonActionType.CANCEL]: {
    isDisabled: shouldDisableLeaveCancel,
    reason: getLeaveCancelDisableReason,
    none: 'No day of this leave can be cancelled.',
  },
};

/** The days an action applies to (e.g. only the pending days for approve). */
export function filterActionableLeaveDays(
  actionType: EButtonActionType,
  days: TLeaveDay[]
): TLeaveDay[] {
  const rule = DAY_RULES[actionType];
  return rule ? days.filter(day => !rule.isDisabled(day)) : days;
}

/** The days of the applications an action applies to. */
export function getActionableLeaveDays(
  actionType: EButtonActionType,
  groups: TLeaveGroup[]
): TLeaveDay[] {
  return filterActionableLeaveDays(
    actionType,
    groups.flatMap(group => group.records)
  );
}

const isGroupActionDisabled =
  (actionType: EButtonActionType) =>
  (group: TLeaveGroup): boolean =>
    getActionableLeaveDays(actionType, [group]).length === 0;

/** The days' own reason when they all agree (e.g. "already approved"), otherwise a general one. */
const groupDisableReason =
  (actionType: EButtonActionType) =>
  (group: TLeaveGroup): string | undefined => {
    const rule = DAY_RULES[actionType];
    if (!rule || !isGroupActionDisabled(actionType)(group)) {
      return undefined;
    }
    const reasons = new Set(
      group.records.map(day => rule.reason(day)).filter(Boolean)
    );
    return reasons.size === 1 ? [...reasons][0] : rule.none;
  };

const headerByField = (field: string): Partial<IDataTableHeaderConfig> =>
  LEAVE_TABLE_HEADER_CONFIG.find(header => header.field === field) ?? {
    field,
  };

// ── Application list ─────────────────────────────────────────────────────────

export const LEAVE_GROUP_TABLE_CONFIG: Partial<IDataTableConfig> = {
  showCheckbox: true,
  emptyMessage: 'No leave record found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any leave yet. Please add a leave first.",
};

export const LEAVE_GROUP_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    headerByField('employeeName'),
    headerByField('leaveDate'),
    {
      field: 'dayCountLabel',
      header: 'Days',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    headerByField('reason'),
    {
      ...headerByField('approvalStatus'),
      customTemplateKey: 'leaveGroupStatus',
    },
  ];

const LEAVE_GROUP_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<TLeaveGroup>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Leave Details',
    permission: [APP_PERMISSION.LEAVE.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve the pending days',
    permission: [APP_PERMISSION.LEAVE.APPROVE],
    disableWhen: isGroupActionDisabled(EButtonActionType.APPROVE),
    disableReason: groupDisableReason(EButtonActionType.APPROVE),
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject the pending / approved days',
    permission: [APP_PERMISSION.LEAVE.REJECT],
    disableWhen: isGroupActionDisabled(EButtonActionType.REJECT),
    disableReason: groupDisableReason(EButtonActionType.REJECT),
  },
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Cancel the days not started yet',
    permission: [APP_PERMISSION.LEAVE.CANCEL],
    disableWhen: isGroupActionDisabled(EButtonActionType.CANCEL),
    disableReason: groupDisableReason(EButtonActionType.CANCEL),
  },
];

const BULK_ACTION_VERB: Partial<Record<EButtonActionType, string>> = {
  [EButtonActionType.APPROVE]: 'approved',
  [EButtonActionType.REJECT]: 'rejected',
  [EButtonActionType.CANCEL]: 'cancelled',
};

/** Bulk button off only when none of the selected days can take the action. */
function bulkDayRule(
  actionType: EButtonActionType
): Partial<ITableActionConfig<TLeaveGroup>> {
  const rule = DAY_RULES[actionType];
  if (!rule) {
    return {};
  }
  return {
    bulkDisableMode: 'all',
    // The bulk bar passes selected days (not applications) to these checks.
    disableWhen: row => rule.isDisabled(row as unknown as TLeaveDay),
    bulkDisableReason: rows => bulkDisableReason(actionType, rows),
  };
}

/** Each per-day reason as a short phrase, so several days read as one sentence. */
const DAY_REASON_PHRASE: Record<string, string> = {
  [ALREADY_APPROVED_REASON]: 'already approved',
  [ALREADY_REJECTED_REASON]: 'already rejected',
  [ALREADY_CANCELLED_REASON]: 'already cancelled',
  [REJECTED_LEAVE_CANNOT_BE_APPROVED_REASON]:
    'rejected (apply again to reapply)',
  [CANCEL_NOT_FOR_REJECTED_REASON]: 'rejected',
  [CANCEL_NOT_ALLOWED_LEAVE_DATE_PAST_ROW_REASON]:
    'already started or over (contact HR)',
  [PAYROLL_LOCKED_ROW_REASON]: 'locked because payroll is generated',
};

const joinOr = (items: string[]): string =>
  items.length <= 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;

/**
 * Why a bulk button is off, from the selected days: one day gives its own reason; several give
 * e.g. "The selected days can't be approved: they are already approved or rejected."
 */
function bulkDisableReason(
  actionType: EButtonActionType,
  rows: TLeaveGroup[]
): string | undefined {
  const rule = DAY_RULES[actionType];
  const days = rows as unknown as TLeaveDay[];
  if (!rule || !days.length) {
    return undefined;
  }
  const reasons = [
    ...new Set(days.map(day => rule.reason(day)).filter(Boolean)),
  ] as string[];
  if (days.length === 1 || reasons.length === 0) {
    return reasons[0] ?? rule.none;
  }
  const phrases = [
    ...new Set(reasons.map(reason => DAY_REASON_PHRASE[reason] ?? reason)),
  ];
  return `The selected days can't be ${BULK_ACTION_VERB[actionType] ?? 'changed'}: they are ${joinOr(phrases)}.`;
}

/**
 * One bulk bar for the whole page. It works on the selected days (a ticked application = all its
 * days, or days ticked inside it) and acts on the days each action allows — e.g. approve takes
 * only the pending ones — so it is not disabled by a selected day it skips.
 */
const LEAVE_GROUP_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<TLeaveGroup>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve the pending days selected',
    permission: [APP_PERMISSION.LEAVE.APPROVE],
    ...bulkDayRule(EButtonActionType.APPROVE),
  },
  {
    ...COMMON_BULK_ACTIONS.REJECT,
    tooltip: 'Reject the days selected',
    permission: [APP_PERMISSION.LEAVE.REJECT],
    ...bulkDayRule(EButtonActionType.REJECT),
  },
  {
    ...COMMON_BULK_ACTIONS.CANCEL,
    tooltip: 'Cancel the days selected',
    permission: [APP_PERMISSION.LEAVE.CANCEL],
    ...bulkDayRule(EButtonActionType.CANCEL),
  },
];

/** Shown when none of the selected days can take the action. */
export const LEAVE_NO_ACTIONABLE_DAY_MESSAGE: Partial<
  Record<EButtonActionType, string>
> = {
  [EButtonActionType.APPROVE]: 'None of the selected days can be approved.',
  [EButtonActionType.REJECT]: 'None of the selected days can be rejected.',
  [EButtonActionType.CANCEL]: 'None of the selected days can be cancelled.',
};

/** Approve / reject / cancel one day of an expanded leave (the day's own rules and reasons). */
export const LEAVE_DAY_ROW_ACTIONS_CONFIG =
  LEAVE_TABLE_ROW_ACTIONS_CONFIG.filter(
    action => action.id !== EButtonActionType.VIEW
  );

export const LEAVE_GROUP_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<TLeaveGroup> =
  {
    tableConfig: LEAVE_GROUP_TABLE_CONFIG,
    headers: LEAVE_GROUP_TABLE_HEADER_CONFIG,
    rowActions: LEAVE_GROUP_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: LEAVE_GROUP_TABLE_BULK_ACTIONS_CONFIG,
  };
