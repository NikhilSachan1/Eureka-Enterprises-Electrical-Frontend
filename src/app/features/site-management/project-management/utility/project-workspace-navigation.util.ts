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
  }
}

export function buildProjectWorkspaceDocRoute(
  stage: EDocChainStage,
  isSales: boolean
): string[] {
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
