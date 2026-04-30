import { Injectable } from '@angular/core';
import {
  IBankTransferDocAddFormDto,
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

  async addPaymentDoc(formData: IPaymentDocAddFormDto): Promise<void> {
    const { docContext } = formData;
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

    return parentDocs.map(parent => ({
      label: `${parent.documentType} — ${parent.documentNumber}`,
      value: parent.id,
      disabled: this.shouldDisableOption(
        parent,
        childDocs,
        childDocType,
        allDocs
      ),
    }));
  }

  private shouldDisableOption(
    parent: IDocIndexedDbRow,
    childDocs: IDocIndexedDbRow[],
    childDocType: EDocType,
    allDocs: IDocIndexedDbRow[]
  ): boolean {
    const childrenOfParent = childDocs.filter(
      c => c.docReference === parent.id
    );

    switch (childDocType) {
      case EDocType.REPORT:
      case EDocType.INVOICE:
      case EDocType.PAYMENT_ADVICE:
      case EDocType.BANK_TRANSFER:
        return childrenOfParent.length >= 1;

      case EDocType.PAYMENT: {
        const totalPaid = childrenOfParent.reduce(
          (sum, c) => sum + (c.totalAmount ?? 0),
          0
        );
        return (
          (parent.totalAmount ?? 0) > 0 &&
          totalPaid >= (parent.totalAmount ?? 0)
        );
      }

      case EDocType.JMC: {
        // Disable PO if its billing capacity is exhausted:
        // sum of all invoices under all JMCs of this PO >= PO total amount
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
        return totalInvoiced >= poTotal;
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

      request.onsuccess = (): void =>
        resolve((request.result as IDocIndexedDbRow[]) ?? []);
      request.onerror = (): void => reject(request.error);
    });
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
    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(row);

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
