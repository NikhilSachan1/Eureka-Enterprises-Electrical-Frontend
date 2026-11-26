import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  IButtonConfig,
  IPageHeaderConfig,
} from '@shared/types';
import { EInvoiceLedgerExportFormat } from '../types/invoice-ledger.enum';
import { IInvoiceLedgerSideConfig } from '../types/invoice-ledger.interface';

/** Export bar under the filters. */
export const INVOICE_LEDGER_TABLE_BAR = {
  icon: ICONS.COMMON.BOOK,
  subtitle:
    'Every invoice matching your filters. Export it as a PDF, or as an interactive file that can be filtered again offline.',
};

/** Shown while the backend builds the export for the applied filters. */
export const INVOICE_LEDGER_EXPORT_LOADING: Record<
  EInvoiceLedgerExportFormat,
  { title: string; message: string }
> = {
  [EInvoiceLedgerExportFormat.PDF]: {
    title: 'Preparing ledger PDF',
    message:
      "We're building the ledger for the filters you applied. This will just take a moment.",
  },
  [EInvoiceLedgerExportFormat.INTERACTIVE]: {
    title: 'Preparing interactive file',
    message:
      "We're building a file you can open in any browser and filter by year, quarter, status and date.",
  },
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
 * Both exports, shown under the filters because they hold exactly what the filters match:
 * the PDF, and the interactive file. Disabled while nothing matches.
 */
export function createInvoiceLedgerExportButtonConfigs(
  hasRecords: boolean
): { format: EInvoiceLedgerExportFormat; button: Partial<IButtonConfig> }[] {
  const disabled = {
    disabled: !hasRecords,
    disabledTooltip: hasRecords
      ? undefined
      : 'No invoices match the applied filters.',
  };
  return [
    {
      format: EInvoiceLedgerExportFormat.INTERACTIVE,
      button: {
        id: EButtonActionType.DOWNLOAD,
        actionName: EButtonActionType.DOWNLOAD,
        label: 'Interactive file',
        icon: ICONS.COMMON.TABLE,
        severity: EButtonSeverity.PRIMARY,
        variant: EButtonVariant.OUTLINED,
        tooltip:
          'One file that opens in any browser, with its own year, quarter, status and date filters',
        ...disabled,
      },
    },
    {
      format: EInvoiceLedgerExportFormat.PDF,
      button: {
        id: EButtonActionType.DOWNLOAD,
        actionName: EButtonActionType.DOWNLOAD,
        label: 'Export PDF',
        icon: ICONS.MEDIA.PDF,
        severity: EButtonSeverity.PRIMARY,
        ...disabled,
      },
    },
  ];
}
