import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

const { WORKSPACE_DOC } = ROUTES.SITE.PROJECT;

/** Matches EDocContext. Contractor workspace is sales; vendor workspace is purchase. */
const CONTRACTOR_PARTY_TYPES = new Set(['SALE', 'SALES', 'CONTRACTOR']);
const VENDOR_PARTY_TYPES = new Set(['PURCHASE', 'VENDOR']);

export type DocumentGapParty = 'contractor' | 'vendor';

const PARTY_PATH: Record<DocumentGapParty, string> = {
  contractor: ROUTES.SITE.PROJECT.CONTRACTOR_DOC,
  vendor: ROUTES.SITE.PROJECT.VENDOR_DOC,
};

/** Which project-document list a gap key belongs to. */
const GAP_DOC_PATH: Record<string, string> = {
  'po-without-jmc': WORKSPACE_DOC.PO,
  'po-file-missing': WORKSPACE_DOC.PO,
  'po-under-invoiced': WORKSPACE_DOC.PO,
  'jmc-without-invoice': WORKSPACE_DOC.JMC,
  'jmc-without-report': WORKSPACE_DOC.REPORT,
  'jmc-file-missing': WORKSPACE_DOC.JMC,
  'invoice-not-booked': WORKSPACE_DOC.INVOICE,
  'invoice-partially-booked': WORKSPACE_DOC.INVOICE,
  'contractor-payment-pending': WORKSPACE_DOC.BANK_TRANSFER,
  'invoice-file-missing': WORKSPACE_DOC.INVOICE,
  'booked-not-transferred': WORKSPACE_DOC.BOOK_PAYMENT,
  'advance-not-paid': WORKSPACE_DOC.BOOK_PAYMENT,
  'advance-invoice-not-adjusted': WORKSPACE_DOC.ADVANCE_PAYMENT,
  'advance-not-settled': WORKSPACE_DOC.ADVANCE_PAYMENT,
  'advance-file-missing': WORKSPACE_DOC.ADVANCE_PAYMENT,
  'gst-release-not-transferred': WORKSPACE_DOC.BOOK_PAYMENT,
};

/**
 * Gaps settled in the project's GST / TDS summary rather than a contractor / vendor document
 * list. Those summaries sit directly under the workspace and cover both sides.
 */
const GAP_TAX_SUMMARY_PATH: Record<string, string> = {
  'gst-not-verified': ROUTES.SITE.PROJECT.GST_SUMMARY,
  'gst-release-pending': ROUTES.SITE.PROJECT.GST_SUMMARY,
  'gst-receipt-pending': ROUTES.SITE.PROJECT.GST_SUMMARY,
  'tds-challan-pending': ROUTES.SITE.PROJECT.TDS_SUMMARY,
  'tds-not-verified': ROUTES.SITE.PROJECT.TDS_SUMMARY,
};

export function documentGapParty(
  partyType: string | null | undefined
): DocumentGapParty | null {
  const value = partyType?.trim().toUpperCase() ?? '';
  if (CONTRACTOR_PARTY_TYPES.has(value)) {
    return 'contractor';
  }
  if (VENDOR_PARTY_TYPES.has(value)) {
    return 'vendor';
  }
  return null;
}

/** Workspace document lists a mixed gap row may point at (its `docKind`). */
const KNOWN_DOC_PATHS = new Set<string>(Object.values(WORKSPACE_DOC));

/**
 * Where a gap — or one row of it — opens. `docKind` lets a gap that mixes document types
 * (rejected documents) send each row to its own list.
 */
export function documentGapListCommands(
  key: string,
  partyType?: string | null,
  docKind?: string | null
): string[] {
  const party = documentGapParty(partyType) ?? 'vendor';
  const rowDocPath =
    docKind && KNOWN_DOC_PATHS.has(docKind) ? docKind : undefined;
  const taxSummary = GAP_TAX_SUMMARY_PATH[key];

  if (taxSummary) {
    return [
      '/',
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.PROJECT,
      ROUTES.SITE.PROJECT.WORKSPACE,
      taxSummary,
    ];
  }

  return [
    '/',
    ROUTE_BASE_PATHS.SITE.BASE,
    ROUTE_BASE_PATHS.SITE.PROJECT,
    ROUTES.SITE.PROJECT.WORKSPACE,
    PARTY_PATH[party],
    rowDocPath ?? GAP_DOC_PATH[key] ?? WORKSPACE_DOC.PO,
  ];
}

export function isMissingDocumentNumber(
  value: string | null | undefined
): boolean {
  const text = value?.trim().toLowerCase() ?? '';
  return !text || text === '(no number)' || text === 'no number';
}
