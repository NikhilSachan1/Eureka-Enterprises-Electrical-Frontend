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
  'jmc-file-missing': WORKSPACE_DOC.JMC,
  'invoice-not-booked': WORKSPACE_DOC.INVOICE,
  'invoice-file-missing': WORKSPACE_DOC.INVOICE,
  'booked-not-transferred': WORKSPACE_DOC.BOOK_PAYMENT,
  'advance-not-settled': WORKSPACE_DOC.ADVANCE_PAYMENT,
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
    GAP_DOC_PATH[key] ?? WORKSPACE_DOC.PO,
  ];
}

export function isMissingDocumentNumber(
  value: string | null | undefined
): boolean {
  const text = value?.trim().toLowerCase() ?? '';
  return !text || text === '(no number)' || text === 'no number';
}
