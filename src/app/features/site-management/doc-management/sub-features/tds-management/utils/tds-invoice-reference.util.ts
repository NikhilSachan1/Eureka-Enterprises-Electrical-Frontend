import type { IDocReferenceHierarchyNode } from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import type { ITdsEntryGetBaseResponseDto } from '../types/tds.dto';

export interface ITdsInvoiceReference {
  invoiceNumber: string | null;
  invoiceDate: string | null;
  poNumber: string | null;
  jmcNumber: string | null;
}

/**
 * The invoice a TDS deduction belongs to. Current entries are projected at invoice approval and
 * carry `invoice`; legacy entries reach it through the book payment / bank transfer they came from.
 */
export function resolveTdsInvoiceReference(
  record: Pick<
    ITdsEntryGetBaseResponseDto,
    'invoice' | 'bookPayment' | 'bankTransfer'
  >
): ITdsInvoiceReference {
  const invoice =
    record.invoice ??
    record.bookPayment?.invoice ??
    record.bankTransfer?.invoice ??
    null;

  return {
    invoiceNumber: invoice?.invoiceNumber ?? null,
    invoiceDate: invoice?.invoiceDate ?? null,
    poNumber: invoice?.jmc?.po?.poNumber ?? null,
    jmcNumber: invoice?.jmc?.jmcNumber ?? null,
  };
}

export function buildTdsDocumentReference(
  reference: ITdsInvoiceReference
): IDocReferenceHierarchyNode | null {
  return DocReferenceHierarchy.forBookPaymentRow({
    poNumber: reference.poNumber,
    jmcNumber: reference.jmcNumber,
    invoiceNumber: reference.invoiceNumber,
  });
}
