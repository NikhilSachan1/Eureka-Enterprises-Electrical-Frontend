import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  IButtonConfig,
  IPageHeaderConfig,
} from '@shared/types';
import { IInvoiceLedgerSideConfig } from '../types/invoice-ledger.interface';

/** Header bar above the invoice table. */
export const INVOICE_LEDGER_TABLE_BAR = {
  icon: ICONS.COMMON.BOOK,
  subtitle:
    'Every invoice matching your filters. Export PDF downloads this same list.',
};

/** Shown while the backend builds the ledger PDF for the applied filters. */
export const INVOICE_LEDGER_PDF_LOADING = {
  title: 'Preparing ledger PDF',
  message:
    "We're building the ledger for the filters you applied. This will just take a moment.",
};

export function createInvoiceLedgerPageHeaderConfig(
  sideConfig: IInvoiceLedgerSideConfig
): IPageHeaderConfig {
  return {
    title: sideConfig.title,
    subtitle: sideConfig.subtitle,
    showHeaderButton: false,
  };
}

/**
 * "Export PDF", shown under the filters because it exports exactly what they match.
 * Disabled while nothing matches.
 */
export function createInvoiceLedgerExportButtonConfig(
  hasRecords: boolean
): Partial<IButtonConfig> {
  return {
    id: EButtonActionType.DOWNLOAD,
    actionName: EButtonActionType.DOWNLOAD,
    label: 'Export PDF',
    icon: ICONS.MEDIA.PDF,
    severity: EButtonSeverity.PRIMARY,
    variant: EButtonVariant.OUTLINED,
    disabled: !hasRecords,
    disabledTooltip: hasRecords
      ? undefined
      : 'No invoices match the applied filters.',
  };
}
