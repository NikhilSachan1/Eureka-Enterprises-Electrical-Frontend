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
}
