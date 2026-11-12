import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { EDocChainStage } from '../types/project-document-status-detail.enum';

const { WORKSPACE_DOC } = ROUTES.SITE.PROJECT;

export function resolveWorkspaceDocTab(stage: EDocChainStage): string {
  switch (stage) {
    case EDocChainStage.PO:
      return WORKSPACE_DOC.PO;
    case EDocChainStage.JMC:
      return WORKSPACE_DOC.JMC;
    case EDocChainStage.REPORT:
      return WORKSPACE_DOC.REPORT;
    case EDocChainStage.INVOICE:
      return WORKSPACE_DOC.INVOICE;
    case EDocChainStage.BOOK_PAYMENT:
      return WORKSPACE_DOC.BOOK_PAYMENT;
    case EDocChainStage.BANK_TRANSFER:
      return WORKSPACE_DOC.BANK_TRANSFER;
    case EDocChainStage.ADVANCE:
      return WORKSPACE_DOC.ADVANCE_PAYMENT;
    default:
      return WORKSPACE_DOC.PO;
  }
}

/** GST / TDS are settled in the project's GST / TDS summary, which covers both sides. */
const TAX_SUMMARY_ROUTE: Partial<Record<EDocChainStage, string>> = {
  [EDocChainStage.GST]: ROUTES.SITE.PROJECT.GST_SUMMARY,
  [EDocChainStage.TDS]: ROUTES.SITE.PROJECT.TDS_SUMMARY,
};

export function buildProjectWorkspaceDocRoute(
  stage: EDocChainStage,
  isSales: boolean
): string[] {
  const taxSummary = TAX_SUMMARY_ROUTE[stage];
  if (taxSummary) {
    return [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.PROJECT,
      ROUTES.SITE.PROJECT.WORKSPACE,
      taxSummary,
    ];
  }

  const docContext = isSales
    ? ROUTES.SITE.PROJECT.CONTRACTOR_DOC
    : ROUTES.SITE.PROJECT.VENDOR_DOC;

  return [
    ROUTE_BASE_PATHS.SITE.BASE,
    ROUTE_BASE_PATHS.SITE.PROJECT,
    ROUTES.SITE.PROJECT.WORKSPACE,
    docContext,
    resolveWorkspaceDocTab(stage),
  ];
}
