export interface IDocReferenceSegment {
  label: string;
  value: string;
}

export enum EDocReferenceHierarchyKind {
  Po = 'po',
  Jmc = 'jmc',
  Report = 'report',
  Invoice = 'invoice',
  BookPayment = 'bookPayment',
  BankTransfer = 'bankTransfer',
}

export interface IDocReferenceHierarchyNode {
  kind: EDocReferenceHierarchyKind;
  value: string;
  labelOverride?: string;
  child?: IDocReferenceHierarchyNode | null;
}
