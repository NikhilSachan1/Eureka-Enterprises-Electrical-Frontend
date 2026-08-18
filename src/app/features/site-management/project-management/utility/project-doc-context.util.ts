import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  EMPTY_PROJECT_PO_BREAKDOWN_CONTEXT,
  IProjectDocumentStatusTarget,
  IProjectPoBreakdownSnapshot,
} from '../types/project-document-status.interface';

export interface IProjectDocContextAvailability {
  hasContractor: boolean;
  hasVendor: boolean;
}

export function getProjectDocContextAvailability(
  project: Pick<IProjectDocumentStatusTarget, 'stakeholders'>
): IProjectDocContextAvailability {
  return {
    hasContractor: (project.stakeholders.siteContractors?.length ?? 0) > 0,
    hasVendor: (project.stakeholders.vendors?.length ?? 0) > 0,
  };
}

export function isProjectDocContextAvailable(
  availability: IProjectDocContextAvailability,
  context: EDocContext
): boolean {
  return context === EDocContext.SALES
    ? availability.hasContractor
    : availability.hasVendor;
}

export function sanitizePoBreakdownSnapshot(
  snapshot: IProjectPoBreakdownSnapshot,
  availability: IProjectDocContextAvailability
): IProjectPoBreakdownSnapshot {
  return {
    sales: availability.hasContractor
      ? snapshot.sales
      : EMPTY_PROJECT_PO_BREAKDOWN_CONTEXT,
    purchase: availability.hasVendor
      ? snapshot.purchase
      : EMPTY_PROJECT_PO_BREAKDOWN_CONTEXT,
  };
}

export function getDefaultProjectDocContext(
  availability: IProjectDocContextAvailability
): EDocContext {
  if (availability.hasContractor) {
    return EDocContext.SALES;
  }

  if (availability.hasVendor) {
    return EDocContext.PURCHASE;
  }

  return EDocContext.SALES;
}

export function isContractorDocContext(context: EDocContext): boolean {
  return context === EDocContext.SALES;
}