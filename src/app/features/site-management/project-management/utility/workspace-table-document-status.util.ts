import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IProjectDocumentStatusTarget } from '../types/project-document-status.interface';
import { ProjectWorkspaceDocumentStatusService } from '../services/project-workspace-document-status.service';

export function collectUniqueSiteIds(
  records: readonly { siteId?: string | null }[]
): string[] {
  const siteIds = new Set<string>();

  for (const record of records) {
    const siteId = record.siteId?.trim();
    if (siteId) {
      siteIds.add(siteId);
    }
  }

  return [...siteIds];
}

export function ensureWorkspaceTableBreakdown(
  service: ProjectWorkspaceDocumentStatusService | null | undefined,
  records: readonly { siteId?: string | null }[]
): void {
  service?.ensureBreakdownForSiteIds(collectUniqueSiteIds(records));
}

export function buildWorkspaceDetailProjectTarget(
  ctx: IDocWorkspaceContextView,
  docContext: EDocContext,
  fallback: IProjectDocumentStatusTarget | null
): IProjectDocumentStatusTarget {
  const isSales = docContext === EDocContext.SALES;
  const isPurchase = docContext === EDocContext.PURCHASE;

  return {
    id: fallback?.id ?? '',
    projectName: ctx.projectName,
    projectStatus: fallback?.projectStatus ?? '',
    projectLocation: ctx.siteLocationSubtitle,
    stakeholders: {
      company: ctx.companyName ? { name: ctx.companyName } : null,
      siteContractors: isSales
        ? (fallback?.stakeholders.siteContractors?.length
            ? fallback.stakeholders.siteContractors
            : [{}])
        : [],
      vendors: isPurchase
        ? (fallback?.stakeholders.vendors?.length
            ? fallback.stakeholders.vendors
            : [{}])
        : [],
    },
  };
}
