import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  IPoBreakdownBookPayment,
  IPoBreakdownInvoice,
  IPoBreakdownJmc,
  IPoBreakdownRecord,
} from '../types/po-breakdown.interface';
import {
  EMPTY_PROJECT_DOCUMENT_STATUS,
  EMPTY_PROJECT_PO_BREAKDOWN_CONTEXT,
  IProjectDocumentStatus,
  IProjectPoBreakdownSnapshot,
} from '../types/project-document-status.interface';
import {
  countPoNextMissing,
  countPoPendingApprovals,
  getPoUninvoicedAmount,
  getSalesPaymentNextMissing,
  needsAdditionalBookPayment,
} from './project-document-status-chain.util';
import { buildPoBreakdownCounts } from './po-breakdown.mapper';

export type TWorkspaceDocStatusScope =
  | 'po'
  | 'jmc'
  | 'report'
  | 'invoice'
  | 'bookPayment';

export function normalizeWorkspaceRecordId(recordId: string): string {
  return recordId.trim().toLowerCase();
}

export function getBreakdownRecords(
  snapshot: IProjectPoBreakdownSnapshot | null,
  isSales: boolean
): readonly IPoBreakdownRecord[] {
  if (!snapshot) {
    return [];
  }

  return isSales ? snapshot.sales.records : snapshot.purchase.records;
}

export function findPoRecord(
  snapshot: IProjectPoBreakdownSnapshot | null,
  poId: string,
  isSales: boolean
): IPoBreakdownRecord | null {
  const normalizedPoId = normalizeWorkspaceRecordId(poId);
  return (
    getBreakdownRecords(snapshot, isSales).find(
      record => normalizeWorkspaceRecordId(record.id) === normalizedPoId
    ) ?? null
  );
}

export function findJmcBranch(
  snapshot: IProjectPoBreakdownSnapshot | null,
  jmcId: string,
  isSales: boolean
): { po: IPoBreakdownRecord; jmc: IPoBreakdownJmc } | null {
  const normalizedJmcId = normalizeWorkspaceRecordId(jmcId);
  for (const po of getBreakdownRecords(snapshot, isSales)) {
    const jmc = po.jmcs.find(
      item => normalizeWorkspaceRecordId(item.id) === normalizedJmcId
    );
    if (jmc) {
      return { po, jmc };
    }
  }

  return null;
}

export function findReportBranch(
  snapshot: IProjectPoBreakdownSnapshot | null,
  reportId: string,
  isSales: boolean
): { po: IPoBreakdownRecord; jmc: IPoBreakdownJmc } | null {
  const normalizedReportId = normalizeWorkspaceRecordId(reportId);
  for (const po of getBreakdownRecords(snapshot, isSales)) {
    for (const jmc of po.jmcs) {
      if (
        jmc.report &&
        normalizeWorkspaceRecordId(jmc.report.id) === normalizedReportId
      ) {
        return { po, jmc };
      }
    }
  }

  return null;
}

export function findInvoiceBranch(
  snapshot: IProjectPoBreakdownSnapshot | null,
  invoiceId: string,
  isSales: boolean
): {
  po: IPoBreakdownRecord;
  jmc: IPoBreakdownJmc;
  invoice: IPoBreakdownInvoice;
} | null {
  const normalizedInvoiceId = normalizeWorkspaceRecordId(invoiceId);
  for (const po of getBreakdownRecords(snapshot, isSales)) {
    for (const jmc of po.jmcs) {
      if (
        jmc.invoice &&
        normalizeWorkspaceRecordId(jmc.invoice.id) === normalizedInvoiceId
      ) {
        return { po, jmc, invoice: jmc.invoice };
      }
    }
  }

  return null;
}

export function findBookPaymentBranch(
  snapshot: IProjectPoBreakdownSnapshot | null,
  bookPaymentId: string,
  isSales: boolean
): {
  po: IPoBreakdownRecord;
  jmc: IPoBreakdownJmc;
  invoice: IPoBreakdownInvoice;
  bookPayment: IPoBreakdownBookPayment;
} | null {
  const normalizedBookPaymentId = normalizeWorkspaceRecordId(bookPaymentId);
  for (const po of getBreakdownRecords(snapshot, isSales)) {
    for (const jmc of po.jmcs) {
      const invoice = jmc.invoice;
      if (!invoice) {
        continue;
      }

      const bookPayment = invoice.bookPayments.find(
        item => normalizeWorkspaceRecordId(item.id) === normalizedBookPaymentId
      );
      if (bookPayment) {
        return { po, jmc, invoice, bookPayment };
      }
    }
  }

  return null;
}

function withScopedJmcs(
  po: IPoBreakdownRecord,
  jmcs: IPoBreakdownJmc[]
): IPoBreakdownRecord {
  return {
    ...po,
    jmcs,
    counts: buildPoBreakdownCounts(jmcs),
  };
}

export function resolveScopedPoRecord(
  snapshot: IProjectPoBreakdownSnapshot,
  scope: TWorkspaceDocStatusScope,
  recordId: string,
  isSales: boolean
): IPoBreakdownRecord | null {
  switch (scope) {
    case 'po':
      return findPoRecord(snapshot, recordId, isSales);
    case 'jmc': {
      const branch = findJmcBranch(snapshot, recordId, isSales);
      return branch ? withScopedJmcs(branch.po, [branch.jmc]) : null;
    }
    case 'report': {
      const branch = findReportBranch(snapshot, recordId, isSales);
      return branch ? withScopedJmcs(branch.po, [branch.jmc]) : null;
    }
    case 'invoice': {
      const branch = findInvoiceBranch(snapshot, recordId, isSales);
      if (!branch) {
        return null;
      }

      return withScopedJmcs(branch.po, [
        {
          ...branch.jmc,
          invoice: branch.invoice,
        },
      ]);
    }
    case 'bookPayment': {
      const branch = findBookPaymentBranch(snapshot, recordId, isSales);
      if (!branch) {
        return null;
      }

      return withScopedJmcs(branch.po, [
        {
          ...branch.jmc,
          invoice: {
            ...branch.invoice,
            bookPayments: [branch.bookPayment],
          },
        },
      ]);
    }
    default:
      return null;
  }
}

export function resolveScopedParentPoId(
  snapshot: IProjectPoBreakdownSnapshot | null,
  scope: TWorkspaceDocStatusScope,
  recordId: string,
  docContext: EDocContext
): string | null {
  if (!snapshot || !recordId.trim()) {
    return null;
  }

  return (
    resolveScopedPoRecord(
      snapshot,
      scope,
      recordId,
      docContext === EDocContext.SALES
    )?.id ?? null
  );
}

export function buildScopedBreakdownSnapshot(
  snapshot: IProjectPoBreakdownSnapshot | null,
  scope: TWorkspaceDocStatusScope,
  recordId: string,
  docContext: EDocContext
): IProjectPoBreakdownSnapshot | null {
  if (!snapshot || !recordId.trim()) {
    return null;
  }

  const isSales = docContext === EDocContext.SALES;
  const scopedPo = resolveScopedPoRecord(snapshot, scope, recordId, isSales);

  if (!scopedPo) {
    return null;
  }

  const contextSnapshot = {
    records: [scopedPo],
    totalRecords: 1,
    summary: buildWorkspaceRowDocumentStatus(
      scope,
      snapshot,
      recordId,
      docContext
    ),
  };

  return isSales
    ? {
        sales: contextSnapshot,
        purchase: EMPTY_PROJECT_PO_BREAKDOWN_CONTEXT,
      }
    : {
        sales: EMPTY_PROJECT_PO_BREAKDOWN_CONTEXT,
        purchase: contextSnapshot,
      };
}

export function buildWorkspaceRowDocumentStatus(
  scope: TWorkspaceDocStatusScope,
  snapshot: IProjectPoBreakdownSnapshot | null,
  recordId: string,
  docContext: EDocContext
): IProjectDocumentStatus {
  if (!snapshot || !recordId.trim()) {
    return EMPTY_PROJECT_DOCUMENT_STATUS;
  }

  const isSales = docContext === EDocContext.SALES;

  switch (scope) {
    case 'po': {
      const po = findPoRecord(snapshot, recordId, isSales);
      return po ? buildPoRowStatus(po, isSales) : EMPTY_PROJECT_DOCUMENT_STATUS;
    }
    case 'jmc': {
      const branch = findJmcBranch(snapshot, recordId, isSales);
      return branch
        ? buildJmcRowStatus(branch.jmc, branch.po, isSales)
        : EMPTY_PROJECT_DOCUMENT_STATUS;
    }
    case 'report': {
      const branch = findReportBranch(snapshot, recordId, isSales);
      return branch
        ? buildReportRowStatus(branch.jmc, isSales)
        : EMPTY_PROJECT_DOCUMENT_STATUS;
    }
    case 'invoice': {
      const branch = findInvoiceBranch(snapshot, recordId, isSales);
      return branch
        ? buildInvoiceRowStatus(branch.invoice, isSales)
        : EMPTY_PROJECT_DOCUMENT_STATUS;
    }
    case 'bookPayment': {
      const branch = findBookPaymentBranch(snapshot, recordId, isSales);
      return branch
        ? buildBookPaymentRowStatus(branch.bookPayment)
        : EMPTY_PROJECT_DOCUMENT_STATUS;
    }
    default:
      return EMPTY_PROJECT_DOCUMENT_STATUS;
  }
}

function buildPoRowStatus(
  record: IPoBreakdownRecord,
  isSales: boolean
): IProjectDocumentStatus {
  return {
    missingDocsCount: countPoNextMissing(record, isSales),
    pendingApprovalsCount: countPoPendingApprovals(record),
    toBeInvoicedAmount: isSales
      ? getPoUninvoicedAmount(record)
      : Math.max(record.counts.amounts.invoiceTotal - record.counts.amounts.paid, 0),
  };
}

function buildJmcRowStatus(
  jmc: IPoBreakdownJmc,
  po: IPoBreakdownRecord,
  isSales: boolean
): IProjectDocumentStatus {
  let missingDocsCount = 0;

  if (!jmc.report) {
    missingDocsCount += 1;
  }

  if (!jmc.invoice) {
    missingDocsCount += 1;
  } else if (jmc.hasInvoice) {
    missingDocsCount += countInvoicePaymentMissing(jmc.invoice, isSales);
  }

  return {
    missingDocsCount,
    pendingApprovalsCount: countJmcBranchPendingApprovals(jmc),
    toBeInvoicedAmount: getJmcToBeInvoicedAmount(jmc, po, isSales),
  };
}

function buildReportRowStatus(
  jmc: IPoBreakdownJmc,
  isSales: boolean
): IProjectDocumentStatus {
  let missingDocsCount = 0;

  if (!jmc.invoice) {
    missingDocsCount += 1;
  } else if (jmc.hasInvoice) {
    missingDocsCount += countInvoicePaymentMissing(jmc.invoice, isSales);
  }

  return {
    missingDocsCount,
    pendingApprovalsCount: countInvoicePendingApprovals(jmc.invoice),
    toBeInvoicedAmount: getInvoiceRemainingAmount(jmc.invoice, isSales),
  };
}

function buildInvoiceRowStatus(
  invoice: IPoBreakdownInvoice,
  isSales: boolean
): IProjectDocumentStatus {
  return {
    missingDocsCount: countInvoicePaymentMissing(invoice, isSales),
    pendingApprovalsCount: countInvoicePendingApprovals(invoice),
    toBeInvoicedAmount: getInvoiceRemainingAmount(invoice, isSales),
  };
}

function buildBookPaymentRowStatus(
  bookPayment: IPoBreakdownBookPayment
): IProjectDocumentStatus {
  const missingDocsCount =
    bookPayment.bankTransfers.length > 0 || bookPayment.hasTransfer ? 0 : 1;

  return {
    missingDocsCount,
    pendingApprovalsCount: 0,
    toBeInvoicedAmount: 0,
  };
}

function countInvoicePaymentMissing(
  invoice: IPoBreakdownInvoice,
  isSales: boolean
): number {
  if (isSales) {
    return getSalesPaymentNextMissing(invoice) !== null ? 1 : 0;
  }

  if (invoice.totalAmount <= 0 && invoice.remaining <= 0) {
    return 0;
  }

  if (!invoice.bookPayments.length) {
    return 1;
  }

  let count = invoice.bookPayments.reduce((total, bookPayment) => {
    if (bookPayment.bankTransfers.length || bookPayment.hasTransfer) {
      return total;
    }

    return total + 1;
  }, 0);

  if (needsAdditionalBookPayment(invoice)) {
    count += 1;
  }

  return count;
}

function countJmcBranchPendingApprovals(jmc: IPoBreakdownJmc): number {
  let count = countApprovalPending(jmc.status);

  if (jmc.invoice) {
    count += countInvoicePendingApprovals(jmc.invoice);
  }

  return count;
}

function countInvoicePendingApprovals(
  invoice: IPoBreakdownInvoice | null
): number {
  if (!invoice) {
    return 0;
  }

  return countApprovalPending(invoice.status);
}

function countApprovalPending(status: string): number {
  const normalized = status.toUpperCase();
  return normalized === 'PENDING' || normalized === 'REJECTED' ? 1 : 0;
}

function getJmcToBeInvoicedAmount(
  jmc: IPoBreakdownJmc,
  po: IPoBreakdownRecord,
  isSales: boolean
): number {
  if (!isSales) {
    return Math.max(jmc.invoice?.remaining ?? 0, 0);
  }

  if (jmc.invoice && jmc.hasInvoice && jmc.invoice.totalAmount > 0) {
    return 0;
  }

  if (!jmc.invoice) {
    const openBranches = po.jmcs.filter(branch => !branch.invoice);
    if (!openBranches.length) {
      return 0;
    }

    return Math.max(getPoUninvoicedAmount(po) / openBranches.length, 0);
  }

  return 0;
}

function getInvoiceRemainingAmount(
  invoice: IPoBreakdownInvoice | null,
  isSales: boolean
): number {
  if (isSales || !invoice) {
    return 0;
  }

  return Math.max(invoice.remaining, 0);
}
