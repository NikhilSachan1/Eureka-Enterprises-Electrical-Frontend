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

/**
 * Which project-document list a gap key opens. It is the list of the record the gap's rows are
 * (the server's `id` / `documentNumber`), so the row can be found there:
 * an advance gap lists advances, a contractor-payment gap lists invoices, and so on.
 */
const GAP_DOC_PATH: Record<string, string> = {
  'po-without-jmc': WORKSPACE_DOC.PO,
  'po-under-invoiced': WORKSPACE_DOC.PO,
  'jmc-without-invoice': WORKSPACE_DOC.JMC,
  // Rows are JMCs (the report is what is missing).
  'jmc-without-report': WORKSPACE_DOC.JMC,
  'jmc-file-missing': WORKSPACE_DOC.JMC,
  'invoice-not-booked': WORKSPACE_DOC.INVOICE,
  'invoice-partially-booked': WORKSPACE_DOC.INVOICE,
  // Rows are the contractor invoices still to be received against.
  'contractor-payment-pending': WORKSPACE_DOC.INVOICE,
  'contractor-payment-partial': WORKSPACE_DOC.INVOICE,
  'booked-not-transferred': WORKSPACE_DOC.BOOK_PAYMENT,
  // Rows are advances (id and number are the advance's).
  'advance-not-paid': WORKSPACE_DOC.ADVANCE_PAYMENT,
  'advance-invoice-not-adjusted': WORKSPACE_DOC.ADVANCE_PAYMENT,
  'advance-not-settled': WORKSPACE_DOC.ADVANCE_PAYMENT,
};

/** Gaps settled in the GST / TDS summary tab of the contractor / vendor side. */
const GAP_TAX_SUMMARY_PATH: Record<string, string> = {
  'gst-not-verified': ROUTES.SITE.PROJECT.GST_SUMMARY,
  'gst-release-pending': ROUTES.SITE.PROJECT.GST_SUMMARY,
  // Rows are GST register entries, not book payments.
  'gst-release-not-transferred': ROUTES.SITE.PROJECT.GST_SUMMARY,
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

/** Where a gap — or one row of it — opens. */
export function documentGapListCommands(
  key: string,
  partyType?: string | null
): string[] {
  const party = documentGapParty(partyType) ?? 'vendor';
  return [
    '/',
    ROUTE_BASE_PATHS.SITE.BASE,
    ROUTE_BASE_PATHS.SITE.PROJECT,
    ROUTES.SITE.PROJECT.WORKSPACE,
    PARTY_PATH[party],
    GAP_TAX_SUMMARY_PATH[key] ?? GAP_DOC_PATH[key] ?? WORKSPACE_DOC.PO,
  ];
}

/** Some gaps name two documents ("ADV-12 → INV-40"); the list is searched by the first. */
const GAP_LINKED_NUMBER_SEPARATOR = ' → ';

export function documentGapSearchNumber(documentNumber: string): string {
  return documentNumber.split(GAP_LINKED_NUMBER_SEPARATOR)[0].trim();
}

export function isMissingDocumentNumber(
  value: string | null | undefined
): boolean {
  const text = value?.trim().toLowerCase() ?? '';
  return !text || text === '(no number)' || text === 'no number';
}
