import { formatDate } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  type IDocReferenceHierarchyNode,
  EDocReferenceHierarchyKind,
} from '@features/site-management/doc-management/shared/types/doc-reference.interface';

/**
 * Procurement / settlement document hierarchy (ordering defined once here).
 *
 * Per screen we expose only the relevant prefix of the full chain, e.g. report
 * rows show **PO → JMC**; book payment doc-ref shows **PO → JMC → Invoice**
 * (status column covers bank transfer).
 */

export const DOC_REFERENCE_KIND_LABELS: Record<
  EDocReferenceHierarchyKind,
  string
> = {
  [EDocReferenceHierarchyKind.Po]: 'PO',
  [EDocReferenceHierarchyKind.Jmc]: 'JMC',
  [EDocReferenceHierarchyKind.Report]: 'Report',
  [EDocReferenceHierarchyKind.Invoice]: 'Invoice',
  [EDocReferenceHierarchyKind.BookPayment]: 'Book payment',
  [EDocReferenceHierarchyKind.BankTransfer]: 'Bank transfer',
};

type HierarchyLinkPart = Readonly<{
  kind: EDocReferenceHierarchyKind;
  value: string | null | undefined;
  labelOverride?: string;
}>;

export class DocReferenceHierarchy {
  private static normalize(v: string | null | undefined): string {
    return typeof v === 'string' ? v.trim() : '';
  }

  private static link(
    parts: readonly HierarchyLinkPart[]
  ): IDocReferenceHierarchyNode | null {
    let head: IDocReferenceHierarchyNode | null = null;
    let tail: IDocReferenceHierarchyNode | null = null;

    for (const p of parts) {
      const value = DocReferenceHierarchy.normalize(p.value);
      if (value) {
        const node: IDocReferenceHierarchyNode = {
          kind: p.kind,
          value,
          ...(p.labelOverride !== undefined
            ? { labelOverride: p.labelOverride }
            : {}),
        };
        if (!head) {
          head = node;
          tail = node;
        } else if (tail) {
          tail.child = node;
          tail = node;
        }
      }
    }

    return head;
  }

  /** Invoice/JMC/report lists: ancestry only — PO → JMC. */
  static forInvoiceOrJmcParentRow(context: {
    poNumber?: string | null;
    jmcNumber?: string | null;
  }): IDocReferenceHierarchyNode | null {
    return DocReferenceHierarchy.link([
      { kind: EDocReferenceHierarchyKind.Po, value: context.poNumber },
      { kind: EDocReferenceHierarchyKind.Jmc, value: context.jmcNumber },
    ]);
  }

  /** JMC lists: attachment to PO only. */
  static forJmc(poNumber?: string | null): IDocReferenceHierarchyNode | null {
    return DocReferenceHierarchy.link([
      { kind: EDocReferenceHierarchyKind.Po, value: poNumber },
    ]);
  }

  /** Report list / drawer: doc reference column shows **PO → JMC** only. */
  static forReportRow(context: {
    poNumber?: string | null;
    jmcNumber?: string | null;
  }): IDocReferenceHierarchyNode | null {
    return DocReferenceHierarchy.forInvoiceOrJmcParentRow(context);
  }

  /** Same as {@link DocReferenceHierarchy.forReportRow}: PO → JMC in detail drawer. */
  static forReportDetail(context: {
    poNumber?: string | null;
    jmcNumber?: string | null;
  }): IDocReferenceHierarchyNode | null {
    return DocReferenceHierarchy.forReportRow(context);
  }

  /** Invoice detail drawer: PO → JMC → Invoice. */
  static forInvoiceDetail(context: {
    poNumber?: string | null;
    jmcNumber?: string | null;
    invoiceNumber?: string | null;
  }): IDocReferenceHierarchyNode | null {
    return DocReferenceHierarchy.link([
      { kind: EDocReferenceHierarchyKind.Po, value: context.poNumber },
      { kind: EDocReferenceHierarchyKind.Jmc, value: context.jmcNumber },
      {
        kind: EDocReferenceHierarchyKind.Invoice,
        value: context.invoiceNumber,
      },
    ]);
  }

  /** Book payment doc-ref column: **PO → JMC → Invoice** only. */
  static forBookPaymentRow(context: {
    poNumber?: string | null;
    jmcNumber?: string | null;
    invoiceNumber?: string | null;
  }): IDocReferenceHierarchyNode | null {
    return DocReferenceHierarchy.link([
      { kind: EDocReferenceHierarchyKind.Po, value: context.poNumber },
      { kind: EDocReferenceHierarchyKind.Jmc, value: context.jmcNumber },
      {
        kind: EDocReferenceHierarchyKind.Invoice,
        value: context.invoiceNumber,
      },
    ]);
  }

  /**
   * Bank transfer (list + detail doc-ref): **PO → JMC → Invoice** → optional **Book payment** only (no bank-transfer leaf).
   *
   * `bookPayment` is the **raw** datetime for that tier (e.g. bank transfer `record.createdAt`); pass `null` / omit for sales.
   * It is formatted inside; unparseable / empty values omit the book-payment link.
   */
  static forBankTransferDetailReference(context: {
    poNumber?: string | null;
    jmcNumber?: string | null;
    invoiceNumber?: string | null;
    bookPayment?: string | Date | null;
  }): IDocReferenceHierarchyNode | null {
    const bookPaymentDisplay =
      DocReferenceHierarchy.formatBankTransferBookPaymentTier(
        context.bookPayment
      );
    return DocReferenceHierarchy.link([
      { kind: EDocReferenceHierarchyKind.Po, value: context.poNumber },
      { kind: EDocReferenceHierarchyKind.Jmc, value: context.jmcNumber },
      {
        kind: EDocReferenceHierarchyKind.Invoice,
        value: context.invoiceNumber,
      },
      {
        kind: EDocReferenceHierarchyKind.BookPayment,
        value: bookPaymentDisplay,
      },
    ]);
  }

  private static formatBankTransferBookPaymentTier(
    value?: string | Date | null
  ): string | null {
    return DocReferenceHierarchy.formatHierarchyDateTier(value);
  }

  private static formatHierarchyDateTier(
    value?: string | Date | null
  ): string | null {
    if (value === undefined || value === null || String(value).length === 0) {
      return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return formatDate(parsed, APP_CONFIG.DATE_FORMATS.DEFAULT, 'en-IN');
  }

  /**
   * TDS register: vendor **PO → JMC → Invoice → Book payment (date)**;
   * contractor **Bank transfer (date) → PO → JMC → Invoice**.
   */
  static forTdsEntryReference(context: {
    partyType: EDocContext;
    poNumber?: string | null;
    jmcNumber?: string | null;
    invoiceNumber?: string | null;
    bookPaymentDate?: string | Date | null;
    bankTransferDate?: string | Date | null;
  }): IDocReferenceHierarchyNode | null {
    if (context.partyType === EDocContext.PURCHASE) {
      return DocReferenceHierarchy.forBankTransferDetailReference({
        poNumber: context.poNumber,
        jmcNumber: context.jmcNumber,
        invoiceNumber: context.invoiceNumber,
        bookPayment: context.bookPaymentDate,
      });
    }

    return DocReferenceHierarchy.link([
      {
        kind: EDocReferenceHierarchyKind.BankTransfer,
        value: DocReferenceHierarchy.formatHierarchyDateTier(
          context.bankTransferDate
        ),
      },
      { kind: EDocReferenceHierarchyKind.Po, value: context.poNumber },
      { kind: EDocReferenceHierarchyKind.Jmc, value: context.jmcNumber },
      {
        kind: EDocReferenceHierarchyKind.Invoice,
        value: context.invoiceNumber,
      },
    ]);
  }
}
