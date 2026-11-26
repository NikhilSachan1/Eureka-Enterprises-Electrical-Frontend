import { EInvoiceLedgerExportFormat } from '../types/invoice-ledger.enum';

/** "vendor-ledger-2026-11-26.html" — same name the server gives the file. */
export function ledgerExportFileName(
  partyLabel: string,
  format: EInvoiceLedgerExportFormat
): string {
  const extension = format === EInvoiceLedgerExportFormat.PDF ? 'pdf' : 'html';
  const today = new Date().toISOString().slice(0, 10);
  return `${partyLabel.toLowerCase()}-ledger-${today}.${extension}`;
}

/** Saves a file the API sent back to the user's downloads, under the given name. */
export function saveLedgerExport(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before the URL is released.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
