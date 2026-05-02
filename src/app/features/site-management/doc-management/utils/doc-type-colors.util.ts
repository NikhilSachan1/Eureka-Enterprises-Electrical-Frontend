import { EDocType } from '../types/doc.enum';

export const DOC_TYPE_COLOR_CLASSES: Record<string, string> = {
  [EDocType.PO]: 'bg-blue-100 text-blue-700',
  [EDocType.JMC]: 'bg-violet-100 text-violet-700',
  [EDocType.REPORT]: 'bg-amber-100 text-amber-700',
  [EDocType.INVOICE]: 'bg-red-100 text-red-700',
  [EDocType.PAYMENT]: 'bg-orange-100 text-orange-700',
  [EDocType.BANK_TRANSFER]: 'bg-teal-100 text-teal-700',
  [EDocType.PAYMENT_ADVICE]: 'bg-green-100 text-green-700',
  [EDocType.GST_PAYMENT_RELEASE]: 'bg-fuchsia-100 text-fuchsia-800',
};

export function getDocTypeClass(docType: string): string {
  return DOC_TYPE_COLOR_CLASSES[docType] ?? 'bg-slate-100 text-slate-600';
}
