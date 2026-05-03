import { Injectable } from '@angular/core';
import {
  IBankTransferDocAddFormDto,
  IGstPaymentReleaseDocAddFormDto,
  IInvoiceDocAddFormDto,
  IJmcDocAddFormDto,
  IPaymentAdviceDocAddFormDto,
  IPaymentDocAddFormDto,
  IPoDocAddFormDto,
  IReportDocAddFormDto,
} from '../types/doc.dto';
import { EDocType } from '../types/doc.enum';
import { IOptionDropdown } from '@shared/types';

type DocContext = 'sales' | 'purchase';

export interface IDocIndexedDbRow {
  id: string;
  contractorName: string | null;
  vendorName: string | null;
  documentDate: string | null;
  taxableAmount: number | null;
  gstAmount: number | null;
  tdsDeductionAmount: number | null;
  totalAmount: number | null;
  attachments: File[] | null;
  remark: string | null;
  docReference: string | null;
  documentType: EDocType;
  documentNumber: string;
  docContext: DocContext;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'unlock_requested';
  /** ISO time — set on first save so lists can sort newest-first (IndexedDB key order is random). */
  createdAt?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class DocIndexedDbService {
  private readonly dbName = 'eureka-doc-management-db';
  private readonly storeName = 'documents';
  private readonly dbVersion = 1;

  async addPoDoc(formData: IPoDocAddFormDto): Promise<void> {
    const { docContext } = formData;
    const row: IDocIndexedDbRow = {
      id: this.generateId(),
      contractorName: docContext === 'sales' ? formData.contractorName : null,
      vendorName: docContext === 'purchase' ? formData.contractorName : null,
      documentDate: this.toDateString(formData.poDate),
      taxableAmount: formData.poTaxableAmount ?? null,
      gstAmount: formData.poGstAmount ?? null,
      tdsDeductionAmount: null,
      totalAmount: formData.poTotalAmount ?? null,
      attachments: formData.poAttachments ?? null,
      remark: formData.poRemark ?? null,
      docReference: null,
      documentType: EDocType.PO,
      documentNumber: formData.poNumber,
      docContext,
      approvalStatus: 'pending',
    };

    await this.putRow(row);
  }

  async addJmcDoc(formData: IJmcDocAddFormDto): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.jmcDate,
      null,
      null,
      null,
      null,
      formData.jmcAttachments ?? null,
      formData.jmcRemark ?? null,
      formData.poNumber,
      EDocType.JMC,
      formData.jmcNumber,
      docContext
    );
    await this.putRow(row);
  }

  async addReportDoc(formData: IReportDocAddFormDto): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.reportDate,
      null,
      null,
      null,
      null,
      formData.reportAttachments ?? null,
      formData.reportRemark ?? null,
      formData.jmcNumber,
      EDocType.REPORT,
      formData.reportNumber,
      docContext
    );
    await this.putRow(row);
  }

  async addInvoiceDoc(formData: IInvoiceDocAddFormDto): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.invoiceDate,
      formData.invoiceTaxableAmount ?? null,
      formData.invoiceGstAmount ?? null,
      null,
      formData.invoiceTotalAmount ?? null,
      formData.invoiceAttachments ?? null,
      formData.invoiceRemark ?? null,
      formData.jmcNumber,
      EDocType.INVOICE,
      formData.invoiceNumber,
      docContext
    );
    await this.putRow(row);
  }

  async addPaymentDoc(formData: IPaymentDocAddFormDto): Promise<string> {
    const { docContext } = formData;
    await this.validatePaymentAmountLimit(
      formData.invoiceNumber,
      formData.paymentTaxableAmount ?? 0,
      null
    );
    const draftRef = `PMT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const row = await this.buildBaseReferencedRow(
      formData.paymentDate,
      formData.paymentTaxableAmount ?? null,
      formData.paymentGstAmount ?? null,
      formData.paymentTdsDeductionAmount ?? null,
      formData.paymentTotalAmount ?? null,
      null,
      formData.paymentRemark ?? null,
      formData.invoiceNumber,
      EDocType.PAYMENT,
      draftRef,
      docContext
    );
    await this.putRow(row);
    return row.id;
  }

  /**
   * Purchase: after a bank transfer (UTR) is saved, one Payment Advice is auto-created
   * linked to that bank transfer (same dummy attachment pattern as manual purchase advice).
   */
  /**
   * Purchase: after GST payment release is saved, one Payment Advice is auto-created
   * linked to that release row (`transactionNumber` = release id — vendor comes from release row).
   */
  private async addAutoPurchasePaymentAdviceForGstRelease(
    gstReleaseRow: IDocIndexedDbRow
  ): Promise<void> {
    const rnd = Math.random().toString(36).substring(2, 10).toUpperCase();
    const dummyFile = new File(
      ['[Auto-generated payment advice for GST payment release]'],
      `PA-GSTREL-${rnd}.pdf`,
      { type: 'application/pdf' }
    );
    const dateStr = gstReleaseRow.documentDate;
    const paymentAdviceDate = dateStr
      ? new Date(`${dateStr}T12:00:00`)
      : new Date();
    const utrMatch = gstReleaseRow.remark?.match(/UTR:\s*(\S+)/i);
    const utrNote = utrMatch?.[1] ? ` UTR ${utrMatch[1]}.` : '';
    const formData: IPaymentAdviceDocAddFormDto = {
      docContext: 'purchase',
      transactionNumber: gstReleaseRow.id,
      paymentAdviceNumber: `PA-${rnd}`,
      paymentAdviceDate,
      paymentAdviceAttachments: [dummyFile],
      paymentAdviceRemark: `Auto-generated for GST payment release ${gstReleaseRow.documentNumber}.${utrNote}`,
    };
    await this.addPaymentAdviceDoc(formData);
  }

  private async addAutoPurchasePaymentAdviceForBankTransfer(
    bankTransferRow: IDocIndexedDbRow
  ): Promise<void> {
    const rnd = Math.random().toString(36).substring(2, 10).toUpperCase();
    const dummyFile = new File(
      ['[Auto-generated payment advice for purchase]'],
      `PA-${rnd}.pdf`,
      { type: 'application/pdf' }
    );
    const dateStr = bankTransferRow.documentDate;
    const paymentAdviceDate = dateStr
      ? new Date(`${dateStr}T12:00:00`)
      : new Date();
    const formData: IPaymentAdviceDocAddFormDto = {
      docContext: 'purchase',
      transactionNumber: bankTransferRow.id,
      paymentAdviceNumber: `PA-${rnd}`,
      paymentAdviceDate,
      paymentAdviceAttachments: [dummyFile],
      paymentAdviceRemark: `Auto-generated after bank transfer UTR ${bankTransferRow.documentNumber}.`,
    };
    await this.addPaymentAdviceDoc(formData);
  }

  async addPaymentAdviceDoc(
    formData: IPaymentAdviceDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.paymentAdviceDate,
      null,
      null,
      null,
      null,
      formData.paymentAdviceAttachments ?? null,
      formData.paymentAdviceRemark ?? null,
      formData.transactionNumber,
      EDocType.PAYMENT_ADVICE,
      formData.paymentAdviceNumber,
      docContext
    );
    await this.putRow(row);
  }

  async addBankTransferDoc(
    formData: IBankTransferDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.transferDate,
      null,
      null,
      null,
      formData.transferTotalAmount ?? null,
      formData.transferAttachments ?? null,
      formData.transferRemark ?? null,
      formData.paymentAdviceRef,
      EDocType.BANK_TRANSFER,
      formData.utrNumber,
      docContext
    );
    await this.putRow(row);

    if (docContext === 'purchase') {
      try {
        await this.addAutoPurchasePaymentAdviceForBankTransfer(row);
      } catch (e) {
        await this.deleteDoc(row.id);
        throw e;
      }
    }
  }

  async addGstPaymentReleaseDoc(
    formData: IGstPaymentReleaseDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const draftRef = `GSTREL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const remark = this.mergeGstReleaseRemark(
      docContext,
      formData.gstReleaseRemark ?? null,
      formData.gstReleaseUtr,
      formData.gstReleaseMonthKey ?? null
    );
    const row = await this.buildBaseReferencedRow(
      formData.gstReleaseDate,
      0,
      0,
      null,
      formData.gstReleaseAmount,
      formData.gstReleaseAttachments ?? null,
      remark,
      '',
      EDocType.GST_PAYMENT_RELEASE,
      draftRef,
      docContext
    );
    const partyKey = formData.gstReleasePartyKey?.trim();
    const finalRow: IDocIndexedDbRow = partyKey
      ? {
          ...row,
          contractorName: docContext === 'sales' ? partyKey : null,
          vendorName: docContext === 'purchase' ? partyKey : null,
        }
      : row;

    await this.putRow(finalRow);

    if (docContext === 'purchase') {
      try {
        await this.addAutoPurchasePaymentAdviceForGstRelease(finalRow);
      } catch (e) {
        await this.deleteDoc(finalRow.id);
        throw e;
      }
    }
  }

  /**
   * Purchase: optional UTR, optional GST screen month bucket (`YYYY-MM`) for UI matching.
   */
  private mergeGstReleaseRemark(
    docContext: DocContext,
    remark: string | null,
    utr: string | null | undefined,
    monthBucket: string | null | undefined
  ): string | null {
    if (docContext !== 'purchase') {
      return remark;
    }
    const parts: string[] = [];
    const base = remark?.trim();
    if (base) {
      parts.push(base);
    }
    const u = utr?.trim();
    if (u) {
      parts.push(`UTR: ${u}`);
    }
    const mb = monthBucket?.trim();
    if (mb) {
      parts.push(`GST bucket: ${mb}`);
    }
    return parts.length ? parts.join(' | ') : null;
  }

  async updateGstPaymentReleaseDoc(
    existing: IDocIndexedDbRow,
    formData: IGstPaymentReleaseDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const existingBucket =
      existing.remark?.match(/GST bucket:\s*(\d{4}-\d{2})/i)?.[1] ?? null;
    const monthKeyTrimmed = formData.gstReleaseMonthKey?.trim();
    const monthKeyOrBucket =
      monthKeyTrimmed !== null && monthKeyTrimmed !== ''
        ? monthKeyTrimmed
        : existingBucket;
    const remark = this.mergeGstReleaseRemark(
      docContext,
      formData.gstReleaseRemark ?? null,
      formData.gstReleaseUtr,
      monthKeyOrBucket
    );
    const row = await this.buildBaseReferencedRow(
      formData.gstReleaseDate,
      0,
      0,
      null,
      formData.gstReleaseAmount,
      formData.gstReleaseAttachments?.length
        ? formData.gstReleaseAttachments
        : (existing.attachments ?? null),
      remark,
      '',
      EDocType.GST_PAYMENT_RELEASE,
      existing.documentNumber,
      docContext
    );
    const partyKey = formData.gstReleasePartyKey?.trim();
    const contractorName =
      docContext === 'sales' ? (partyKey ?? existing.contractorName) : null;
    const vendorName =
      docContext === 'purchase' ? (partyKey ?? existing.vendorName) : null;
    await this.putRow({
      ...row,
      id: existing.id,
      approvalStatus: existing.approvalStatus,
      contractorName,
      vendorName,
    });
  }

  async updateBankTransferDoc(
    existing: IDocIndexedDbRow,
    formData: IBankTransferDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.transferDate,
      null,
      null,
      null,
      formData.transferTotalAmount ?? null,
      formData.transferAttachments ?? null,
      formData.transferRemark ?? null,
      formData.paymentAdviceRef,
      EDocType.BANK_TRANSFER,
      formData.utrNumber,
      docContext
    );
    await this.putRow({
      ...row,
      id: existing.id,
      approvalStatus: existing.approvalStatus,
    });
  }

  getDocById(id: string): Promise<IDocIndexedDbRow | null> {
    return this.getRowById(id);
  }

  async getDocChain(startId: string): Promise<IDocIndexedDbRow[]> {
    const chain: IDocIndexedDbRow[] = [];
    let currentId: string | null = startId;
    while (currentId) {
      const doc = await this.getRowById(currentId);
      if (!doc) {
        break;
      }
      chain.push(doc);
      currentId = doc.docReference;
    }
    return chain;
  }

  async updatePoDoc(
    existing: IDocIndexedDbRow,
    formData: IPoDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row: IDocIndexedDbRow = {
      id: existing.id,
      contractorName: docContext === 'sales' ? formData.contractorName : null,
      vendorName: docContext === 'purchase' ? formData.contractorName : null,
      documentDate: this.toDateString(formData.poDate),
      taxableAmount: formData.poTaxableAmount ?? null,
      gstAmount: formData.poGstAmount ?? null,
      tdsDeductionAmount: null,
      totalAmount: formData.poTotalAmount ?? null,
      attachments: formData.poAttachments ?? null,
      remark: formData.poRemark ?? null,
      docReference: null,
      documentType: EDocType.PO,
      documentNumber: formData.poNumber,
      docContext,
      approvalStatus: existing.approvalStatus,
    };
    await this.putRow(row);
  }

  async updateJmcDoc(
    existing: IDocIndexedDbRow,
    formData: IJmcDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.jmcDate,
      null,
      null,
      null,
      null,
      formData.jmcAttachments ?? null,
      formData.jmcRemark ?? null,
      formData.poNumber,
      EDocType.JMC,
      formData.jmcNumber,
      docContext
    );
    await this.putRow({
      ...row,
      id: existing.id,
      approvalStatus: existing.approvalStatus,
    });
  }

  async updateReportDoc(
    existing: IDocIndexedDbRow,
    formData: IReportDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.reportDate,
      null,
      null,
      null,
      null,
      formData.reportAttachments ?? null,
      formData.reportRemark ?? null,
      formData.jmcNumber,
      EDocType.REPORT,
      formData.reportNumber,
      docContext
    );
    await this.putRow({
      ...row,
      id: existing.id,
      approvalStatus: existing.approvalStatus,
    });
  }

  async updateInvoiceDoc(
    existing: IDocIndexedDbRow,
    formData: IInvoiceDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.invoiceDate,
      formData.invoiceTaxableAmount ?? null,
      formData.invoiceGstAmount ?? null,
      null,
      formData.invoiceTotalAmount ?? null,
      formData.invoiceAttachments ?? null,
      formData.invoiceRemark ?? null,
      formData.jmcNumber,
      EDocType.INVOICE,
      formData.invoiceNumber,
      docContext
    );
    await this.putRow({
      ...row,
      id: existing.id,
      approvalStatus: existing.approvalStatus,
    });
  }

  async updatePaymentDoc(
    existing: IDocIndexedDbRow,
    formData: IPaymentDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    await this.validatePaymentAmountLimit(
      formData.invoiceNumber,
      formData.paymentTaxableAmount ?? 0,
      existing.id
    );
    const row = await this.buildBaseReferencedRow(
      formData.paymentDate,
      formData.paymentTaxableAmount ?? null,
      formData.paymentGstAmount ?? null,
      formData.paymentTdsDeductionAmount ?? null,
      formData.paymentTotalAmount ?? null,
      null,
      formData.paymentRemark ?? null,
      formData.invoiceNumber,
      EDocType.PAYMENT,
      existing.documentNumber,
      docContext
    );
    await this.putRow({
      ...row,
      id: existing.id,
      approvalStatus: existing.approvalStatus,
    });
  }

  async updatePaymentAdviceDoc(
    existing: IDocIndexedDbRow,
    formData: IPaymentAdviceDocAddFormDto
  ): Promise<void> {
    const { docContext } = formData;
    const row = await this.buildBaseReferencedRow(
      formData.paymentAdviceDate,
      null,
      null,
      null,
      null,
      formData.paymentAdviceAttachments ?? null,
      formData.paymentAdviceRemark ?? null,
      formData.transactionNumber,
      EDocType.PAYMENT_ADVICE,
      formData.paymentAdviceNumber,
      docContext
    );
    await this.putRow({
      ...row,
      id: existing.id,
      approvalStatus: existing.approvalStatus,
    });
  }

  async updateApprovalStatus(
    id: string,
    approvalStatus: IDocIndexedDbRow['approvalStatus']
  ): Promise<void> {
    const existing = await this.getRowById(id);
    if (!existing) {
      throw new Error(`Doc with id ${id} not found`);
    }
    await this.putRow({ ...existing, approvalStatus });
  }

  async deleteDoc(id: string): Promise<void> {
    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = (): void => resolve();
      request.onerror = (): void => reject(request.error);
    });
  }

  async getDocNumberOptions(
    docType: EDocType,
    docContext: DocContext,
    childDocType: EDocType
  ): Promise<IOptionDropdown[]> {
    const allDocs = await this.getAllDocs();
    const parentDocs = allDocs.filter(
      doc => doc.documentType === docType && doc.docContext === docContext
    );
    const childDocs = allDocs.filter(
      doc => doc.documentType === childDocType && doc.docContext === docContext
    );

    return parentDocs.map(parent => {
      const disabledReason = this.shouldDisableOption(
        parent,
        childDocs,
        childDocType,
        allDocs
      );
      const label = `${parent.documentType} — ${parent.documentNumber}`;

      return {
        label,
        value: parent.id,
        disabled: disabledReason !== false,
        disabledReason: disabledReason !== false ? disabledReason : undefined,
      };
    });
  }

  /**
   * Sum of payment **taxable** ≤ invoice taxable (pre-GST), or invoice total if taxable missing.
   */
  private async validatePaymentAmountLimit(
    invoiceId: string,
    newPaymentTaxable: number,
    excludeId: string | null
  ): Promise<void> {
    const allDocs = await this.getAllDocs();
    const invoice = allDocs.find(d => d.id === invoiceId);
    if (!invoice) {
      return;
    }
    const invoiceTaxableCap = invoice.taxableAmount ?? 0;
    if (invoiceTaxableCap <= 0 && (invoice.totalAmount ?? 0) <= 0) {
      return;
    }
    const cap =
      invoiceTaxableCap > 0 ? invoiceTaxableCap : (invoice.totalAmount ?? 0);

    const sameInvoicePayments = allDocs.filter(
      d =>
        d.documentType === EDocType.PAYMENT &&
        d.docReference === invoiceId &&
        d.id !== excludeId
    );

    const alreadyTaxable = sameInvoicePayments.reduce(
      (sum, d) => sum + (d.taxableAmount ?? 0),
      0
    );

    const wouldTaxable = alreadyTaxable + newPaymentTaxable;

    if (wouldTaxable > cap) {
      const remaining = cap - alreadyTaxable;
      const capLabel =
        invoiceTaxableCap > 0 ? 'invoice taxable (pre-GST)' : 'invoice total';
      throw new Error(
        `Taxable / work ₹${newPaymentTaxable.toLocaleString('en-IN')} is too much — only ₹${remaining.toLocaleString('en-IN')} left against ${capLabel} ₹${cap.toLocaleString('en-IN')}. ` +
          `(Already booked taxable: ₹${alreadyTaxable.toLocaleString('en-IN')}.)`
      );
    }
  }

  private shouldDisableOption(
    parent: IDocIndexedDbRow,
    childDocs: IDocIndexedDbRow[],
    childDocType: EDocType,
    allDocs: IDocIndexedDbRow[]
  ): string | false {
    const childrenOfParent = childDocs.filter(
      c => c.docReference === parent.id
    );

    switch (childDocType) {
      case EDocType.REPORT:
        return childrenOfParent.length >= 1
          ? 'Is JMC ke liye pehle se ek Report ban chuki hai'
          : false;

      case EDocType.PAYMENT_ADVICE:
        if (parent.documentType === EDocType.PAYMENT) {
          return childrenOfParent.length >= 1
            ? 'Is payment draft par pehle se Payment Advice (legacy link) maujood hai'
            : false;
        }
        return childrenOfParent.length >= 1
          ? 'Is Bank Transfer ke liye pehle se ek Payment Advice ban chuki hai'
          : false;

      case EDocType.BANK_TRANSFER:
        return childrenOfParent.length >= 1
          ? 'Is Payment ke liye pehle se ek Bank Transfer ho chuka hai'
          : false;

      case EDocType.INVOICE: {
        // A JMC must have a Report before an Invoice can be created
        const hasReport = allDocs.some(
          d =>
            d.documentType === EDocType.REPORT && d.docReference === parent.id
        );
        if (!hasReport) {
          return 'Is JMC ke liye pehle ek Report add karein';
        }
        // A JMC can have only 1 Invoice
        if (childrenOfParent.length >= 1) {
          return 'Is JMC ke liye pehle se ek Invoice ban chuka hai';
        }
        return false;
      }

      case EDocType.PAYMENT: {
        const invoiceTaxable = parent.taxableAmount ?? 0;
        const cap =
          invoiceTaxable > 0 ? invoiceTaxable : (parent.totalAmount ?? 0);
        const workBooked = childrenOfParent.reduce(
          (sum, c) => sum + (c.taxableAmount ?? 0),
          0
        );
        if (cap > 0 && workBooked >= cap) {
          const capLabel =
            invoiceTaxable > 0 ? 'invoice taxable' : 'invoice total';
          return `Invoice par taxable ₹${workBooked.toLocaleString('en-IN')} book ho chuka hai — ${capLabel} ₹${cap.toLocaleString('en-IN')} ke barabar`;
        }
        return false;
      }

      case EDocType.JMC: {
        const poTotal = parent.totalAmount ?? 0;
        if (poTotal <= 0) {
          return false;
        }
        const jmcIds = allDocs
          .filter(
            d => d.documentType === EDocType.JMC && d.docReference === parent.id
          )
          .map(d => d.id);
        const totalInvoiced = allDocs
          .filter(
            d =>
              d.documentType === EDocType.INVOICE &&
              jmcIds.includes(d.docReference ?? '')
          )
          .reduce((sum, d) => sum + (d.totalAmount ?? 0), 0);
        return totalInvoiced >= poTotal
          ? `PO ki poori billing ho chuki hai (₹${totalInvoiced.toLocaleString('en-IN')} / ₹${poTotal.toLocaleString('en-IN')})`
          : false;
      }

      default:
        return false;
    }
  }

  async getAllDocs(): Promise<IDocIndexedDbRow[]> {
    const db = await this.openDb();
    return new Promise<IDocIndexedDbRow[]>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = (): void => {
        const list = [...((request.result as IDocIndexedDbRow[]) ?? [])];
        list.sort((a, b) => this.compareDocsNewestFirst(a, b));
        resolve(list);
      };
      request.onerror = (): void => reject(request.error);
    });
  }

  /** Newest insert first; legacy rows without `createdAt` fall back to document date then id. */
  private compareDocsNewestFirst(
    a: IDocIndexedDbRow,
    b: IDocIndexedDbRow
  ): number {
    const ts = (iso: string | null | undefined): number => {
      if (!iso) {
        return 0;
      }
      const n = Date.parse(iso);
      return Number.isNaN(n) ? 0 : n;
    };
    const ca = ts(a.createdAt);
    const cb = ts(b.createdAt);
    if (ca !== cb) {
      return cb - ca;
    }
    const da = ts(a.documentDate ?? undefined);
    const db = ts(b.documentDate ?? undefined);
    if (da !== db) {
      return db - da;
    }
    return (b.id ?? '').localeCompare(a.id ?? '');
  }

  private async buildBaseReferencedRow(
    documentDate: unknown,
    taxableAmount: number | null,
    gstAmount: number | null,
    tdsDeductionAmount: number | null,
    totalAmount: number | null,
    attachments: File[] | null,
    remark: string | null,
    docReference: string,
    documentType: EDocType,
    documentNumber: string,
    docContext: DocContext
  ): Promise<IDocIndexedDbRow> {
    const partyName = await this.resolvePartyName(docReference, docContext);

    return {
      id: this.generateId(),
      contractorName: docContext === 'sales' ? partyName : null,
      vendorName: docContext === 'purchase' ? partyName : null,
      documentDate: this.toDateString(documentDate),
      taxableAmount,
      gstAmount,
      tdsDeductionAmount,
      totalAmount,
      attachments,
      remark,
      docReference: docReference || null,
      documentType,
      documentNumber,
      docContext,
      approvalStatus: 'pending',
    };
  }

  private async resolvePartyName(
    docReference: string,
    docContext: DocContext
  ): Promise<string | null> {
    if (!docReference) {
      return null;
    }

    const alreadyVisited = new Set<string>();
    let nextReference: string | null = docReference;

    while (nextReference && !alreadyVisited.has(nextReference)) {
      alreadyVisited.add(nextReference);
      const referencedDoc = await this.getRowById(nextReference);
      if (!referencedDoc) {
        return null;
      }

      const candidateName =
        docContext === 'sales'
          ? referencedDoc.contractorName
          : referencedDoc.vendorName;
      if (candidateName) {
        return candidateName;
      }

      nextReference = referencedDoc.docReference;
    }

    return null;
  }

  async clearAll(): Promise<void> {
    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = (): void => resolve();
      request.onerror = (): void => reject(request.error);
    });
  }

  private async putRow(row: IDocIndexedDbRow): Promise<void> {
    const existing = await this.getRowById(row.id);
    const rowToSave: IDocIndexedDbRow = {
      ...row,
      createdAt:
        existing?.createdAt ?? row.createdAt ?? new Date().toISOString(),
    };

    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(rowToSave);

      request.onsuccess = (): void => resolve();
      request.onerror = (): void => reject(request.error);
    });
  }

  private async getRowById(id: string): Promise<IDocIndexedDbRow | null> {
    const db = await this.openDb();
    return new Promise<IDocIndexedDbRow | null>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = (): void =>
        resolve((request.result as IDocIndexedDbRow) || null);
      request.onerror = (): void => reject(request.error);
    });
  }

  private async getRowByDocumentNumber(
    documentNumber: string
  ): Promise<IDocIndexedDbRow | null> {
    const db = await this.openDb();
    return new Promise<IDocIndexedDbRow | null>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('documentNumber');
      const request = index.get(documentNumber);

      request.onsuccess = (): void =>
        resolve((request.result as IDocIndexedDbRow) || null);
      request.onerror = (): void => reject(request.error);
    });
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (): void => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('documentNumber', 'documentNumber', {
            unique: false,
          });
        }
      };

      request.onsuccess = (): void => resolve(request.result);
      request.onerror = (): void => reject(request.error);
    });
  }

  private generateId(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }

    return `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private toDateString(date: unknown): string | null {
    if (date === null || date === undefined || date === '') {
      return null;
    }

    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }

    return String(date);
  }
}
