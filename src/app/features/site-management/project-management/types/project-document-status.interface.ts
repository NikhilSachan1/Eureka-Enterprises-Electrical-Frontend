import { EDocStatusTone } from './project-document-status.enum';
import { IPoBreakdownRecord } from './po-breakdown.interface';

/** Minimal project shape required by document-status UI. */
export interface IProjectDocumentStatusTarget {
  id: string;
  projectName: string;
  projectStatus: string;
  projectLocation: string | null;
  stakeholders: {
    company?: { name: string } | null;
    siteContractors?: readonly unknown[] | null;
    vendors?: readonly unknown[] | null;
  };
}

export interface IProjectDocumentStatus {
  missingDocsCount: number;
  toBeInvoicedAmount: number;
  pendingApprovalsCount: number;
}

export interface IProjectPoBreakdownContextSnapshot {
  records: IPoBreakdownRecord[];
  totalRecords: number;
  summary: IProjectDocumentStatus;
}

export interface IProjectPoBreakdownSnapshot {
  sales: IProjectPoBreakdownContextSnapshot;
  purchase: IProjectPoBreakdownContextSnapshot;
}

export interface IProjectDocumentBreakdownCell {
  loading: boolean;
  error: boolean;
  sales: IProjectDocumentStatus;
  purchase: IProjectDocumentStatus;
  snapshot: IProjectPoBreakdownSnapshot | null;
}

export const EMPTY_PROJECT_DOCUMENT_STATUS: IProjectDocumentStatus = {
  missingDocsCount: 0,
  toBeInvoicedAmount: 0,
  pendingApprovalsCount: 0,
};

export const EMPTY_PROJECT_PO_BREAKDOWN_CONTEXT: IProjectPoBreakdownContextSnapshot =
{
  records: [],
  totalRecords: 0,
  summary: EMPTY_PROJECT_DOCUMENT_STATUS,
};

export interface IDocStatusMetric {
  label: string;
  displayValue: string;
  tone: EDocStatusTone;
}
