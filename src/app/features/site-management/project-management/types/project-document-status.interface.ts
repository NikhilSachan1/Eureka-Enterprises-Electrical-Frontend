import { EDocStatusTone } from './project-document-status.enum';

export interface IProjectDocumentStatus {
  missingDocsCount: number;
  toBeInvoicedAmount: number;
  pendingApprovalsCount: number;
}

export interface IDocStatusMetric {
  label: string;
  displayValue: string;
  tone: EDocStatusTone;
}
