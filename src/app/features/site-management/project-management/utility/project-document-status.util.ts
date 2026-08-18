import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import {
  IProjectOverviewGetResponseDto,
  IPoBreakdownGetResponseDto,
} from '../types/project.dto';
import { IProject } from '../types/project.interface';
import {
  EMPTY_PROJECT_DOCUMENT_STATUS,
  IProjectDocumentBreakdownCell,
  IProjectDocumentStatusTarget,
} from '../types/project-document-status.interface';
import { buildPoBreakdownSnapshot } from './po-breakdown.mapper';
import {
  getProjectDocContextAvailability,
  sanitizePoBreakdownSnapshot,
} from './project-doc-context.util';

export const PO_BREAKDOWN_PAGE_SIZE = 1000;

export function emptyDocumentBreakdownCell(
  loading = false
): IProjectDocumentBreakdownCell {
  return {
    loading,
    error: false,
    sales: EMPTY_PROJECT_DOCUMENT_STATUS,
    purchase: EMPTY_PROJECT_DOCUMENT_STATUS,
    snapshot: null,
  };
}

export function hasDocumentStatusStakeholders(
  project: Pick<IProjectDocumentStatusTarget, 'stakeholders'>
): boolean {
  const { hasContractor, hasVendor } = getProjectDocContextAvailability(project);
  return hasContractor || hasVendor;
}

export function mapBreakdownResponse(
  response: IPoBreakdownGetResponseDto,
  project?: IProjectDocumentStatusTarget | null
): IProjectDocumentBreakdownCell {
  const rawSnapshot = buildPoBreakdownSnapshot(response);
  const snapshot = project
    ? sanitizePoBreakdownSnapshot(
        rawSnapshot,
        getProjectDocContextAvailability(project)
      )
    : rawSnapshot;

  return {
    loading: false,
    error: false,
    sales: snapshot.sales.summary,
    purchase: snapshot.purchase.summary,
    snapshot,
  };
}

export function buildDocumentStatusTargetFromOverview(
  projectId: string,
  overview: IProjectOverviewGetResponseDto,
  projectStatusOptions: readonly { value: string; label: string }[]
): IProjectDocumentStatusTarget {
  const site = overview.site;

  return {
    id: projectId,
    projectName: site.name,
    projectStatus: String(
      getMappedValueFromArrayOfObjects(
        [...projectStatusOptions],
        site.status
      )
    ),
    projectLocation: `${site.city}, ${site.state}`,
    stakeholders: {
      company: site.company ? { name: site.company.name } : null,
      siteContractors: (overview.contractors ?? []).filter(
        (contractor): contractor is NonNullable<typeof contractor> =>
          contractor !== null
      ),
      vendors: (overview.vendors ?? []).filter(
        (vendor): vendor is NonNullable<typeof vendor> => vendor !== null
      ),
    },
  };
}

export function toDocumentStatusTarget(
  project: IProject | IProjectDocumentStatusTarget
): IProjectDocumentStatusTarget {
  return {
    id: project.id,
    projectName: project.projectName,
    projectStatus: project.projectStatus,
    projectLocation: project.projectLocation,
    stakeholders: {
      company: project.stakeholders.company
        ? { name: project.stakeholders.company.name }
        : null,
      siteContractors: project.stakeholders.siteContractors,
      vendors: project.stakeholders.vendors,
    },
  };
}
